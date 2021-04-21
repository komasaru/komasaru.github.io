---
layout   : single
title    : "Debian 7 Wheezy - DB サーバ MariaDB をインストール（ソースビルド）！"
published: true
date     : 2013-10-30 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- MariaDB
---

Debian GNU/Linux 7 Wheezy サーバに DB サーバ MariaDB をソースをビルドしてインストールする方法についての記録です。

当然、MySQL と同様な方法でインストールできます。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- インストールする MariaDB のバージョンは 5.5.33a（当記事執筆時点最新安定版）を想定。
- MariaDB とは言っても中身は MySQL が元になっているので、各所で "mysql" のキーワードを使用する。
- データディレクトリは "/var/lib/mysql" ディレクトリ配下とする。

### 1. 必要パッケージインストール

ビルド時に `configure` ではなく `cmake` を使用するので、未インストールならインストールしておく。  
また、`bison`, `g++`, `libncurses5-dev` 等も未インストールならインストールしておく。（コンパイルオプションによって異なるかもしれないが、実際に `cmake` してみてエラー・警告メッセージを確認するのもよい）

``` text 
# aptitude -y install cmake bison g++ libncurses5-dev
```

### 2. アーカイブダウンロード＆展開

インストールに使用するアーカイブファイル "mariadb-5.5.33a.tar.gz" を別途「[MariaDB 5.5.33a Stable - MariaDB](https://downloads.mariadb.org/mariadb/5.5.33a/ "MariaDB 5.5.33a Stable - MariaDB")」からダウンロードし適当なディレクトリへ解凍する。

``` text 
# tar zxvf mariadb-5.5.33a.tar.gz
```

### 3. ビルド＆インストール

`cmake`, `make`, `make install` でビルド・インストールする。（時間がかかる）  
取り急ぎ、コンパイルオプションは以下のようにした。

``` text 
# cd mariadb-5.5.33a
# cmake . -DCMAKE_INSTALL_PREFIX=/usr/local/mysql \
-DMYSQL_DATADIR=/var/lib/mysql \
-DMYSQL_UNIX_ADDR=/var/run/mysqld/mysqld.sock \
-DENABLED_LOCAL_INFILE=1 \
-DDEFAULT_CHARSET=utf8 \
-DDEFAULT_COLLATION=utf8_general_ci \
-DWITH_EXTRA_CHARSETS=all \
-DWITH_INNOBASE_STORAGE_ENGINE=1
# make
# make install
```

- `CMAKE_INSTALL_PREFIX`        : インストール先ディレクトリ (Default: /usr/local/mysql)
- `MYSQL_DATADIR`               : デフォルトのデータディレクトリ
- `MYSQL_UNIX_ADDR`             : ソケットファイルのフルパス (Default: /tmp/mysql.sock)
- `ENABLED_LOCAL_INFILE`        : LOAD DATA INFILE を有効にするか(Default: OFF)
- `DEFAULT_CHARSET`             : デフォルトの文字セット(Default: latin1)
- `DEFAULT_COLLATION`           : デフォルトの照合順序(Default: 	latin1_swedish_ci)
- `WITH_EXTRA_CHARSETS`         : 追加の文字セット(Default: all)
- `WITH_INNOBASE_STORAGE_ENGINE`: InnoDB ストレージ エンジンを有効にする

**何かパッケージが不足していてパッケージインストール後に再度ビルドを行う場合は、`CMakeCache.txt` を削除してから `cmake` を行う。**

### 4. ユーザ・グループ作成

MySQL 用のユーザとグループを作成する。

``` text 
# groupadd mysql
# useradd -r -g mysql mysql
```

### 5. データディレクトリ作成

データディレクトリが無ければ作成し、所有者・グループを設定しておく。

``` text 
# mkdir /var/lib/mysql
# chown -R mysql. /var/lib/mysql
```

### 6. ログディレクトリ作成

ログ用ディレクトリを作成し、所有者・グループを設定しておく。

``` text 
# mkdir /var/log/mysql
# chown -R mysql. /var/log/mysql/
```

### 7. ソケット・PIDディレクトリ作成

ソケット・プロセスID用ディレクトリの所有者・グループを設定する。

``` text 
# mkdir /var/run/mysqld
# chown -R mysql. /var/run/mysqld
```

### 8. 設定ファイル編集

"/usr/local/mysql/support-files/" ディレクトリ内にあるデフォルトの設定ファイルの中から自分の環境に近いものを "/etc/mysql/my.cnf" にコピーするなどして、適当に編集する。  
以下は当方の例。（ストレージエンジンに InnoDB を利用することを想定している）  
実際は自分の環境に合わせてチューニングする。

``` text 
# cp /usr/local/mysql/support-files/my-huge.cnf /etc/mysql/my.cnf
```

File: `/etc/my.cnf`

{% highlight text linenos %} 
[client]
port   = 3306
socket = /var/run/mysqld/mysqld.sock
default-character-set = utf8

[mysqld_safe]
socket = /var/run/mysqld/mysqld.sock
nice   = 0

[mysqld]
# ==== Basic
sql_mode             = NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
user                 = mysql
pid-file             = /var/run/mysqld/mysqld.pid
socket               = /var/run/mysqld/mysqld.sock
port                 = 3306
basedir              = /usr/local/mysql
datadir              = /var/lib/mysql
tmpdir               = /tmp
lc-messages-dir      = /usr/local/mysql/share
character-set-server = utf8
skip-external-locking
skip-character-set-client-handshake

# ==== Buffer
key_buffer              = 256M
max_allowed_packet      = 1M
sort_buffer_size        = 1M
read_buffer_size        = 1M
myisam_sort_buffer_size = 64M
thread_stack            = 192K
thread_cache_size       = 8
query_cache_limit       = 1M
query_cache_size        = 16M
tmp_table_size          = 16M
max_heap_table_size     = 16M
thread_concurrency      = 2

# ==== Binary Log
log-bin          = mysql-bin  # データインポート時はコメントアウト
expire_logs_days = 10
max_binlog_size  = 100M

# ==== Connection
#bind-address       = 127.0.0.1
max_connections    = 100
max_connect_errors = 100

# ==== MyISAM
myisam-recover = BACKUP

# ==== InnoDB
innodb_data_file_path           = ibdata1:1G:autoextend
innodb_file_per_table
innodb_autoextend_increment     = 64
innodb_buffer_pool_size         = 512M  # 768M
innodb_additional_mem_pool_size = 20M
innodb_write_io_threads         = 8
innodb_read_io_threads          = 8
innodb_log_buffer_size          = 8M   # 通常時:8程度, データインポート時:32程度
innodb_log_file_size            = 128M  # 256M
innodb_flush_log_at_trx_commit  = 1  # 通常時:1(デフォルト), データインポート時:2 or 0
#skip_innodb_doublewrite  # ダブルライトバッファへの書き込みをスキップ(通常時は指定しない。データインポート時のみ)

# ==== Log
log-error           = /var/log/mysql/error.log
#general_log_file    = /var/log/mysql/mysql.log  # デバッグ時に有効化
#general_log         = 1                         # デバッグ時に有効化
#slow_query_log_file = /var/log/mysql/slow.log   # デバッグ時に有効化
#slow_query_log      = 1                         # デバッグ時に有効化

[mysqldump]
quick
quote-names
max_allowed_packet = 16M

[mysql]
no-auto-rehash

[isamchk]
key_buffer = 16M

[myisamchk]
key_buffer_size = 128M
sort_buffer_size = 128M
read_buffer = 2M
write_buffer = 2M

[mysqlhotcopy]
interactive-timeout
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
# cd /usr/local/mysql
# scripts/mysql_install_db --user=mysql --basedir=/usr/local/mysql --datadir=/var/lib/mysql --defaults-file=/etc/mysql/my.cnf
```

### 10. 起動スクリプト準備

起動用スクリプトを準備する。（用意されているスクリプトをコピーする）  
場合によっては編集することになるが、`my.cnf` で `basedir`, `datadir` 等を指定しているので、ここでは特に編集はしない。

``` text 
# cp support-files/mysql.server /etc/init.d/mysqld
```

### 11. 起動・再起動・ステータス確認・停止のテスト

起動・再起動・ステータス確認・停止ができるか確認する。

``` text 
# /etc/init.d/mysqld start
# /etc/init.d/mysqld restart
# /etc/init.d/mysqld status
# /etc/init.d/mysqld stop
```

もちろん、”service” コマンドでも起動・再起動・ステータス確認・停止ができるはずです。

### 12. 環境変数 PATH の設定

mysql コマンドへのパスを設定するために `.bash_profile` の最終行に以下の記述を追加する。

File: `/etc/profile`

{% highlight bash linenos %} 
export PATH=/usr/local/mysql/bin:$PATH
{% endhighlight %}

マシンを再起動すれば PATH が有効化するが、直ちに有効化したければ以下のようにする。

``` text 
# source /etc/profile
```

### 13. MySQL セキュリティ設定

root のバスワード設定、テストDB削除等を行う。  
（root のパスワードのみ設定して、後はデフォルト（エンター押下））

``` text 
# mysql_secure_installation
```

### 14. 動作確認

MySQL サーバにログインしてみる。

``` text 
# mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 11
Server version: 5.5.33a-MariaDB-log Source distribution

Copyright (c) 2000, 2013, Oracle, Monty Program Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]>
```

その他、実際にデータベースを作成してみたりしてみる。

### 15. 自動起動設定

マシン起動時に自動で MariaDB を起動させるには以下のようにする。（`sysv-rc-conf` 導入済みの場合）

``` text 
# sysv-rc-conf mysqld on
# sysv-rc-conf --list | grep mysqld
mysqld       0:off      1:off   2:on    3:on    4:on    5:on    6:off
```

もしくは、以下のようにする。

``` text 
# insserv -d mysqld
```

逆に、自動起動しないようにするには以下のようにする。（`sysv-rc-conf` 導入済みの場合）

``` text 
# sysv-rc-conf mysqld off
# sysv-rc-conf --list | grep mysqld
mysqld       0:off      1:off   2:off   3:off   4:off   5:off   6:off
```

あるいは、

``` text 
# insserv -r mysqld
```

### 16. ポート開放

外部から MariaDB サーバに直接アクセスする場合（GUI ツールを使用する場合等）、ポート（TCP:3306）を開放する必要があある。  
iptables の場合、 "/etc/iptables/rules.v4" に以下を追加する。

File: `/etc/iptables/rules.v4`

{% highlight bash linenos %} 
# TCP3306番ポート(MariaDB)へのアクセスを許可
-A INPUT -p tcp --dport 3306 -j ACCEPT
{% endhighlight %}

そして、iptables を再起動する。

``` text 
# /etc/init.d/iptables-persistent restart
```

### 17. 参考サイト

- [MariaDB Knowledgebase](https://mariadb.com/kb/en/ "MariaDB Knowledgebase")

---

以上。

