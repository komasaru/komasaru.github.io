---
layout   : single
title    : "CentOS 6.5 - DB サーバ MariaDB 構築（ソースインストール）！"
published: true
date     : 2014-01-06 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- MariaDB
- MySQL
---

前回は CentOS 6.5 サーバに Web サーバ Nginx の構築（ソースをビルドしてインストール）を行いました。  
今回は DB サーバ MariaDB の構築（ソースインストール）を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- ソースを取得し、ビルドしてインストールする。
- 当記事執筆時点で最新の安定版 5.5.34 をインストールする。
- MariaDB とは言っても MySQL からフォークした DB であるので、内部の随所で "MySQL" の単語が出現することを認識しておく。
- データディレクトリ作成先は "/var/lib/mysql" とした。
- 過去にこのサイトを参考にして作業した際に記録していたものを参照している。

### 1. 事前準備

最近の MariaDB, MySQL（5.5系以降）はビルド時に `configure` ではなく `cmake` を使用するので、未インストールならインストールしておく。  
また、`gcc*`, `make`, `ncurses-devel` 等も未インストールならインストールしておく。（コンパイルオプションによって異なるかもしれないが、実際に `cmake` してみてエラー・警告メッセージを確認するのもよい）

``` text
# yum -y install gcc* make cmake ncurses-devel
```

### 2. アーカイブダウンロード＆展開

[Downloads - MariaDB](https://downloads.mariadb.org/ "Downloads - MariaDB") から該当のリンクを辿って行き、 ソースファイルのアーカイブをダウンロードし、展開しておく。  
今回は、 "mariadb-5.5.34.tar.gz" をダウンドーロした。

``` text
# cd /usr/local/src/
# wget https://downloads.mariadb.org/f/mariadb-5.5.34/kvm-tarbake-jaunty-x86/mariadb-5.5.34.tar.gz/from/http:/ftp.yz.yamagata-u.ac.jp/pub/dbms/mariadb
# tar zxvf mariadb-5.5.34.tar.gz
```

### 3. ビルド＆インストール

以下のように cmake, make, make install する。（`configure` ではなく `cmake`）

``` text
# cd mariadb-5.5.34
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

`cmake` オプションについて、

``` text
CMAKE_INSTALL_PREFIX        : インストール先ディレクトリ (Default: /usr/local/mysql)
MYSQL_DATADIR               : デフォルトのデータディレクトリ
ENABLED_LOCAL_INFILE        : LOAD DATA INFILE を有効にするか(Default: OFF)
DEFAULT_CHARSET             : デフォルトの文字セット(Default: latin1)
DEFAULT_COLLATION           : デフォルトの照合順序(Default: latin1_swedish_ci)
WITH_EXTRA_CHARSETS         : 追加の文字セット(Default: all)
WITH_INNOBASE_STORAGE_ENGINE: InnoDB ストレージ エンジンを有効にする
```

**何かパッケージを不足していて再度ビルドを行う場合は、`CMakeCache.txt` を削除してから `cmake` を行う。**

### 4. ユーザ・グループ作成

MariaDB(MySQL) 用のユーザとグループを作成する。

``` text
# groupadd mysql
# useradd -r -g mysql mysql
```

### 5. データディレクトリ作成

データディレクトリが無ければ作成し、所有者・グループを設定しておく。

``` text
# mkdir /var/lib/mysql
# chown -R mysql. /var/lib/mysql/
```

### 6. ログディレクトリ作成

``` text
# mkdir /var/log/mysql
# chown -R mysql. /var/log/mysql/
```

### 7. ソケット・PIDディレクトリ作成

ソケット・プロセスID用ディレクトリの所有者・グループを設定する。

``` text
# mkdir /var/run/mysqld
# chown -R mysql. /var/run/mysqld/
```

#### 6. 設定ファイル編集

"/etc/my.cnf" を編集する。  
サンプルの設定ファイルが "/usr/local/mysql/support-files/" ディレクトリにいくつかあるので、それをコピーしてもよい。

以下は当方の例。以前 MySQL5.5 で使用していたものを流用。  
（ストレージエンジンに InnoDB を利用することを想定している）

File: `/etc/my.cnf`

{% highlight bash linenos %}
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
max_connections    = 256 #100
max_connect_errors = 100
wait_timeout       = 300

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

ソケットについて、上記では `socket = /tmp/mysql.sock` と指定している。これ以外を `my.cnf` で指定する場合は、コンパイル（`cmake`）時に、ソケットを指定して（`-DMYSQL_UNIX_ADDR=/var/run/mysqld/mysqld.sock` 等）コンパイルする必要がある（かも？）  
（起動はできても接続ができない、という状況に陥るかもしれない）

### 7. MySQL 初期化

MySQL データを初期化し、システムテーブルを作成する。

``` text
# cd /usr/local/mysql
# scripts/mysql_install_db --user=mysql --basedir=/usr/local/mysql --datadir=/var/lib/mysql
```

#### 8. 起動スクリプト準備

起動用スクリプトを準備する。（用意されているスクリプトをコピーする）  
場合によっては編集することになるが、`my.cnf` で `basedir`, `datadir` 等を指定しているので、ここでは特に編集はしない。

``` text
# cp support-files/mysql.server /etc/init.d/mysqld
```

#### 9. 起動・再起動・ステータス確認・停止のテスト

起動・再起動・ステータス確認・停止ができるか確認する。

``` text
# /etc/rc.d/init.d/mysqld start
# /etc/rc.d/init.d/mysqld restart
# /etc/rc.d/init.d/mysqld status
# /etc/rc.d/init.d/mysqld stop
```

もちろん、”service” コマンドでも起動・再起動・ステータス確認・停止ができるはずである。

#### 10. 自動起動設定

マシン起動時に自動で起動するように設定する。

``` text
# chkconfig --add mysqld
# chkconfig mysqld on
# chkconfig --list mysqld  # <= 2,3,4,5 が `on` であることを確認
mysqld          0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

#### 11. 環境変数 PATH の設定

mysql コマンドへのパスを設定するために `.bash_profile` の最終行に以下の記述を追加する。

File: `~/.bash_profile`

{% highlight bash linenos %}
export PATH=/usr/local/mysql/bin:$PATH
{% endhighlight %}

マシンを再起動すれば PATH が有効化するが、直ちに有効化したければ以下のようにする。

``` text
# source ~/.bash_profile
```

#### 12. MySQL セキュリティ設定

root のバスワード設定、テストDB削除等を行う。  
（root のパスワードのみ設定して、後はデフォルト（エンター押下））

``` text
# mysql_secure_installation
```

#### 13. 動作確認

MySQL サーバにログインしてみる。

``` text
# mysql -uroot -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 12
Server version: 5.5.34-MariaDB-log Source distribution

Copyright (c) 2000, 2013, Oracle, Monty Program Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]>
```

その他、実際にデータベースを作成してみたりしてみる。

### 参考サイト

- [Welcome to MariaDB! - MariaDB](https://mariadb.org/ "Welcome to MariaDB! - MariaDB")
- [MariaDB Knowledgebase](https://mariadb.com/kb/ja/ "MariaDB Knowledgebase")

---

次回は、Ruby 2.0 をソースビルドでインストールする方法について紹介する予定です。

以上。

