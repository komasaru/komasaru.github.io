---
layout   : single
title    : "LMDE2 - DB サーバ MariaDB をソースビルドでインストール！"
published: true
date     : 2017-01-10 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- LMDE2
- MariaDB
---

データベースサーバ MariaDB 10.1 系を LMDE2(Linux Mint Debian Edition 2) に構築する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2) での作業を想定。
* インストールする MariaDB は、当記事執筆時点で最新の 10.1.19 とする。
* データディレクトリは "/var/lib/mysql" ディレクトリ配下とする。

### 1. 必要パッケージインストール

ビルド時に `configure` ではなく `cmake` を使用するので、未インストールならインストールしておく。  
また、`bison`, `g++`, `libncurses5-dev` 等も未インストールならインストールしておく。（コンパイルオプションによって異なるかもしれないが、実際に `cmake` してみてエラー・警告メッセージを確認するのもよい）

``` text 
$ sudo apt install -y cmake bison g++ libncurses5-dev
```

### 2. アーカイブダウンロード＆展開

以下のように、アーカイブファイルをダウンロードし、展開する。

``` text
$ wget https://downloads.mariadb.org/f/mariadb-10.1.19/source/mariadb-10.1.19.tar.gz
$ tar zxvf mariadb-10.1.19.tar.gz
```

（ダウンロードは、別途「[MariaDB 10.1.19 Stable - MariaDB](https://downloads.mariadb.org/mariadb/10.1.19/ "MariaDB 10.1.19 Stable - MariaDB")」から行ってもよい）

### 3. ビルド＆インストール

`cmake`, `make`, `make install` でビルド・インストールする。（時間がかかる）  
取り急ぎ、コンパイルオプションは以下のようにした。

``` text 
$ cd mariadb-10.1.19
$ cmake . -DCMAKE_INSTALL_PREFIX=/usr/local/mysql \
-DMYSQL_DATADIR=/var/lib/mysql \
-DMYSQL_UNIX_ADDR=/var/run/mysqld/mysqld.sock \
-DENABLED_LOCAL_INFILE=1 \
-DDEFAULT_CHARSET=utf8_mb4 \
-DDEFAULT_COLLATION=utf8_general_ci \
-DWITH_EXTRA_CHARSETS=all \
-DWITH_INNOBASE_STORAGE_ENGINE=1
$ make
$ sudo make install
```

* `CMAKE_INSTALL_PREFIX`        : インストール先ディレクトリ (Default: `/usr/local/mysql`)
* `MYSQL_DATADIR`               : デフォルトのデータディレクトリ
* `MYSQL_UNIX_ADDR`             : ソケットファイルのフルパス (Default: `/tmp/mysql.sock`)
* `ENABLED_LOCAL_INFILE`        : LOAD DATA INFILE を有効にするか(Default: `OFF`)
* `DEFAULT_CHARSET`             : デフォルトの文字セット(Default: `latin1`)
* `DEFAULT_COLLATION`           : デフォルトの照合順序(Default: `latin1_swedish_ci`)
* `WITH_EXTRA_CHARSETS`         : 追加の文字セット(Default: `all`)
* `WITH_INNOBASE_STORAGE_ENGINE`: InnoDB ストレージ エンジンを有効にする

**何かパッケージが不足していてパッケージインストール後に再度ビルドを行う場合は、`CMakeCache.txt` を削除してから `cmake` を行う。**

### 4. ユーザ・グループ作成

MySQL 用のユーザとグループを作成する。

``` text 
$ sudo groupadd mysql
$ sudo useradd -r -g mysql mysql
```

### 5. データディレクトリ作成

データディレクトリが無ければ作成し、所有者・グループを設定しておく。

``` text 
$ sudo mkdir /var/lib/mysql
$ sudo chown -R mysql. /var/lib/mysql
```

### 6. ログディレクトリ作成

ログ用ディレクトリを作成し、所有者・グループを設定しておく。

``` text 
$ sudo mkdir /var/log/mysql
$ sudo chown -R mysql. /var/log/mysql/
```

### 7. ソケット・PIDディレクトリ作成

ソケット・プロセスID用ディレクトリの所有者・グループを設定する。

``` text 
$ sudo mkdir /var/run/mysqld
$ sudo chown -R mysql. /var/run/mysqld
```

### 8. 設定ファイル編集

"/usr/local/mysql/support-files/" ディレクトリ内にあるデフォルトの設定ファイルの中から自分の環境に近いものを "/etc/mysql/my.cnf" にコピーするなどして、適当に編集する。  
以下は当方の例。（ストレージエンジンに InnoDB を利用することを想定している）  
実際は自分の環境に合わせてチューニングする。

``` text 
# cp /usr/local/mysql/support-files/my-huge.cnf /etc/my.cnf
```

File: `/etc/my.cnf`

{% highlight text linenos %}
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.7/en/server-configuration-defaults.html

[mysqld]
# ==== Basis
#server-id = 13  # レプリケーション時に有効化 (1 〜 2^32 - 1)
user                   = mysql
datadir                = /var/lib/mysql
socket                 = /var/run/mysqld/mysqld.sock
pid-file               = /var/run/mysqld/mysqld.pid
performance_schema     = OFF     # Default: ON
skip_external_locking
#sql_mode               = STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION
sql_mode               = ''
character_set_server   = utf8mb4
collation-server       = utf8mb4_general_ci
default_storage_engine = InnoDB  # Default: InnoDB
skip-character-set-client-handshake
lc_messages            = en_US   # Default: en_US
lc_messages_dir        = /usr/local/mysql/share

# ==== Network, Connection
port                 = 3306
bind-address         = 0.0.0.0   # 127.0.0.1
max_connections      = 100       # Default: 151
max_connect_errors   = 100       # Default: 100
max_user_connections = 0         # Default: 0
wait_timeout         = 300       # Default: 28800 (通常時:300, データインポート時:3600程度)
interactive_timeout  = 3600      # Default: 28800
connect_timeout      = 30        # Default: 10
net_read_timeout     = 3600      # Default: 30
net_write_timeout    = 3600      # Default: 60

# ==== Buffer
max_allowed_packet      = 128M   # Default: 1M
thread_cache_size       = 40     # Default: 0 (max_connections の 1/3 程度?)
table_open_cache        = 400    # Default: 400 (同時接続数 * テーブル数?)
table_definition_cache  = 400    # Default: -1:autosized = 400 + (table_open_cache / 2
tmp_table_size          = 16M    # Default: System 依存 (for Memory, <= max_heap_table_size)
max_heap_table_size     = 32M    # Default: 16M         (for Memory, >= tmp_table_size)
sort_buffer_size        = 8M     # Default: 2M (通常時:8M, ALTER TABLE 時:64M)
read_buffer_size        = 8M     # Default: 128K
read_rnd_buffer_size    = 8M     # Default: 256K
join_buffer_size        = 8M     # Default: 128K
query_cache_size        = 32M    # Default: 0 (通常時: 32M, データインポート時: 0)
query_cache_limit       = 8M     # Default: 1M
thread_stack            = 288K   # Default: 192K(32bit), 288K(64bit)
bulk_insert_buffer_size = 64M

# ==== MyISAM
key_buffer_size         = 8M     # Default: 8M (for MyISAM)
myisam_sort_buffer_size = 8M     # Default: 8M (for MyISAM)

# ==== Binary Log
log_bin          = mysql-bin     # データインポート時はコメントアウト
expire_logs_days = 10
max_binlog_size  = 100M
binlog_format    = MIXED
log_bin_trust_function_creators = 1  # Default: 0 (for TRIGGER)

# ==== InnoDB
innodb_data_file_path           = ibdata1:1G  #:autoextend
innodb_autoextend_increment     = 64          # Default: 64
innodb_file_per_table           = 1
innodb_file_format              = Barracuda   # Default: Antelope
innodb_file_format_max          = Barracuda   # Default: Antelope
innodb_large_prefix             = 1           # Default: 0
innodb_buffer_pool_size         = 1024M       # Default: 128M (innodb_log_files_in_group * innodb_log_file_size < innodb_buffer_pool_size)
innodb_buffer_pool_instances    = 16          # Default: autosized(32bit), 8(64bit) (innodb_buffer_pool_size >= 1G の場合にのみ有効)
innodb_sort_buffer_size         = 8M          # Default: 1M (通常時:8M, ALTER TABLE 時:64M)
innodb_thread_concurrency       = 4           # Default: 0 (Defalut 推奨? CPU数 * ディスク数 * 2 が最適?)
innodb_thread_sleep_delay       = 10000       # Default: 10000 (単位:マイクロ秒)
innodb_commit_concurrency       = 4           # Default: 0 (Default 推奨?)
innodb_write_io_threads         = 8           # Default: 4 (1 - 64)
innodb_read_io_threads          = 8           # Default: 4 (1 - 64)
innodb_log_buffer_size          = 32M         # Default: 8M (通常時:32M, データインポート時:256M程度)
innodb_log_group_home_dir       = /var/lib/mysql
innodb_log_files_in_group       = 2           # Default: 2   (変更注意!)
innodb_log_file_size            = 256M        # Default: 48M (変更注意!)
# <= innodb_log_files_in_group * innodb_log_file_size < innodb_buffer_pool_size
#    [変更方法](http://dev.mysql.com/doc/refman/5.6/ja/innodb-data-log-reconfiguration.html)
innodb_max_dirty_pages_pct      = 90          # Default: 75(%)
# <= 小さい値：低速＆安定、大きい値：高速＆不安定(?)
innodb_io_capacity              = 256         # Default: 200 (100 - 2^64-1)
innodb_io_capacity_max          = 512         # Default: 200 (100 - 2^64-1)
innodb_lru_scan_depth           = 2048     # Default: 1024 (100 - 2^32-1(32bit))
innodb_flush_method             = O_DIRECT    # Default: Not set
innodb_flush_log_at_trx_commit  = 1           # Default: 1 (データインポート時: 2 or 0)
innodb_doublewrite              = 1           # Default: 1 (データインポート時: 0)

# ==== Log
log_output          = FILE  # Default: FILE
log_warnings        = 1     # Default: 1
log-error           = /var/log/mysql/error.log
#general_log_file    = /var/log/mysql/mysql.log  # デバッグ時に有効化
#general_log         = 1                         # デバッグ時に有効化
#slow_query_log_file = /var/log/mysql/slow.log   # デバッグ時に有効化
#slow_query_log      = 1                         # デバッグ時に有効化
#long_query_time     = 30                        # デバッグ時に有効化

# ==== Event Scheduler
event_scheduler = 1  # Default: 0

[client]
port   = 3306
socket = /var/run/mysqld/mysqld.sock
default-character-set = utf8mb4

[mysqld_safe]
socket = /var/run/mysqld/mysqld.sock
nice   = 0

[mysqldump]
quick
quote-names
max_allowed_packet = 32M

[mysql]
default-character-set = utf8mb4
no-auto-rehash
show-warnings
prompt=\u@\h:\d\_\R:\m:\\s>\_
pager="less -n -i -F -X -E"

[isamchk]
key_buffer = 16M

[myisamchk]
key_buffer_size  = 128M
sort_buffer_size = 128M
read_buffer      = 2M
write_buffer     = 2M

[mysqlhotcopy]
interactive-timeout

[mysqladmin]
{% endhighlight %}

【注意】  
設定ファイルが複数存在する場合の読み込み順序は以下のようにして確認できる。存在する設定ファイルを順に全て読み込み、後に読み込んだ設定が有効になることに留意しておく。  
"/etc/my.cnf" の設定を使用したい場合は、他の設定ファイルは読み込まないように削除（もしくは拡張子を ".cnf" 以外で終わるようにリネーム）しておくこと。

``` text 
# /usr/local/mysql/bin/mysql --help | grep -A1 "Default options"
Default options are read from the following files in the given order:
/etc/my.cnf /etc/mysql/my.cnf ~/.my.cnf
```

### 9. MySQL 初期化

MySQL データを初期化し、システムテーブルを作成する。

``` text 
$ cd /usr/local/mysql
$ sudo scripts/mysql_install_db --user=mysql --basedir=/usr/local/mysql --datadir=/var/lib/mysql --defaults-file=/etc/my.cnf
```

### 10. 起動スクリプト準備

起動用スクリプトを準備する。（用意されているスクリプトをコピーする）  
場合によっては編集することになるが、`my.cnf` で `basedir`, `datadir` 等を指定しているので、ここでは特に編集はしない。

``` text 
$ cp support-files/mysql.server /etc/init.d/mysqld
$ chmod +x /etc/init.d/mysqld
```

### 11. 起動・再起動・ステータス確認・停止のテスト

起動・再起動・ステータス確認・停止ができるか確認する。

``` text 
$ /etc/init.d/mysqld start
$ /etc/init.d/mysqld restart
$ /etc/init.d/mysqld status
$ /etc/init.d/mysqld stop
```

もちろん、”service” コマンドでも起動・再起動・ステータス確認・停止ができるはずです。

また、 `systemctl` を使用したい場合は、 `sudo apt install systemd-sysv` を実行する。（要リブート）

### 12. 環境変数 PATH の設定

mysql コマンドへのパスを設定するために `/etc/profile` の最終行に以下の記述を追加する。

File: `/etc/profile`

{% highlight bash linenos %}
PATH=/usr/local/mysql/bin:$PATH
export PATH
{% endhighlight %}

マシンを再起動すれば PATH が有効化するが、直ちに有効化したければ以下のようにする。

``` text
$ source /etc/profile
```

### 13. MySQL セキュリティ設定

MariaDB サーバが起動していることを確認し、root のバスワード設定、テストDB削除等を行う。  
（root のパスワードのみ設定して、後はデフォルト（エンター押下）。但し、 root によるリモート接続を行いたければ `Disallow root login remotely?` で `n` 応答）

``` text 
$ cd /usr/local/mysql/bin
$ sudo ./mysql_secure_installation
```

### 14. 動作確認

MySQL サーバにログインしてみる。

``` text 
$ mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 12
Server version: 10.1.19-MariaDB Source distribution

Copyright (c) 2000, 2016, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

root@localhost:(none) 14:08:31> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
3 rows in set (0.01 sec)

root@localhost:(none) 23:08:38>
```

その他、実際にデータベースを作成してみたりしてみる。

### 15. 自動起動設定

マシン起動時に自動で MariaDB を起動させるには以下のようにする。（`sysv-rc-conf` 導入済みの場合）

``` text
$ sudo sysv-rc-conf mysqld on
$ sysv-rc-conf --list | grep mysqld
mysqld       0:off      1:off   2:on    3:on    4:on    5:on    6:off
```

もしくは、以下のようにする。

``` text
$ sudo insserv -d mysqld
```

逆に、自動起動しないようにするには以下のようにする。（`sysv-rc-conf` 導入済みの場合）

``` text
$ sudo sysv-rc-conf mysqld off
$ sysv-rc-conf --list | grep mysqld
mysqld       0:off      1:off   2:off   3:off   4:off   5:off   6:off
```

もしくは、以下のようにする。

``` text 
$ insserv -r mysqld
```

### 16. ポート開放

外部から MariaDB サーバに直接アクセスする場合（GUI ツールを使用する場合等）、ポート（TCP:3306）を開放する必要がある。  
iptables の場合、 "/etc/iptables/rules.v4" に以下を追加する。

File: `/etc/iptables/rules.v4`

{% highlight bash linenos %} 
# TCP3306番ポート(MariaDB)へのアクセスを許可
-A INPUT -p tcp --dport 3306 -j ACCEPT
{% endhighlight %}

そして、iptables を再起動する。

``` text 
$ sudo /etc/init.d/iptables-persistent restart
```

### 17. 参考サイト

* [MariaDB Knowledgebase](https://mariadb.com/kb/en/ "MariaDB Knowledgebase")

---

以上、


