---
layout   : single
title    : "Debian 9 (Stretch) - DB サーバ MariaDB & 全文検索エンジン Mroonga 構築（by Mroonga 公式リポジトリ）！"
published: true
date     : 2017-09-12 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- MariaDB
- Mroonga
---

Debian GNU/Linux 9 (Stretch) に DB サーバ MariaDB と全文検索エンジン Mroonga を Mroonga の公式リポジトリを使用して導入する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* 接続元のマシンは LMDE2(Linux Mint Debian Edition 2)(64bit) を想定。
* MariaDB とは言っても中身は MySQL が元になっているので、各所で "mysql" のキーワードが出現する。
* インストールする Mroonga は、当記事執筆時点で最新の 7.04 とする。
* インストールする MariaDB は、 Mroonga 7.04 に対応したバージョン 10.1 系となる。（自動的に選択される。今回の場合 10.1.23 がインストールされた）
* データディレクトリは "/var/lib/mysql" ディレクトリ配下とする。
* root ユーザでの作業を想定。

### 1. ソースリストの追加

Groonga 公式リポジトリのソースリストが未登録なら、登録しておく。

File: `/etc/apt/sources.list.d/groonga.list`

{% highlight bash linenos %}
deb https://packages.groonga.org/debian/ stretch main
deb-src https://packages.groonga.org/debian/ stretch main
{% endhighlight %}

### 2. インストール

Groonga を「[Debian 9 (Stretch) - 全文検索エンジン Groonga インストール（by Groonga 公式リポジトリ）！]({{site.baseurl}}/2017/09/10/debian-9-groonga-installation-by-official-apt/ "Debian 9 (Stretch) - 全文検索エンジン Groonga インストール（by Groonga 公式リポジトリ）！")」の方法でインストール済みであれば、以下の最初から4行は不要。

``` text
# apt -y install apt-transport-https
# apt -y update
# apt -y --allow-unauthenticated install groonga-keyring
# apt -y update
# apt -y -V install mariadb-server-10.1-mroonga
```

* `apt-transport-https` は、 "/etc/apt/sources.list.d/groonga.list" 内の `https` を扱うために必要なパッケージ。

`apt update` 時に GPG 公開鍵に関するエラーが出力される場合は、以下のようにした後に再試行する。（`--keyserver` で指定するキーサーバは `keyring.debian.org` でなくとも、キーが存在するなら別のキーサーバでもよい（`keyring.debian.org`, `wwwkeys.pgp.net` 等でもよいだろうが、現時点ではキーが存在しない））

``` text
# apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 72A7496B45499429
```

GPG キー取得時に `dirmngr` が存在しない旨のエラーが出る場合は `apt install dirmngr` で dirmngr をインストールする。

### 3. トークナイザ MeCab のインストール

（既にインストール済みだったり、トクーナイザとして MeCab を使用しないのなら、この作業は不要）

``` text
# apt -y -V install groonga-tokenizer-mecab
```

### 4. MariaDB の初期設定

``` text
# mysql_secure_installation

NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
      SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!

In order to log into MariaDB to secure it, we'll need the current
password for the root user.  If you've just installed MariaDB, and
you haven't set the root password yet, the password will be blank,
so you should just press enter here.

Enter current password for root (enter for none):  # <= root ユーザの既存パスワード：空エンター
OK, successfully used password, moving on...

Setting the root password ensures that nobody can log into the MariaDB
root user without the proper authorisation.

Set root password? [Y/n]                           # <= root ユーザのパスワード設定： Y 応答
New password:
Re-enter new password:
Password updated successfully!
Reloading privilege tables..
 ... Success!


By default, a MariaDB installation has an anonymous user, allowing anyone
to log into MariaDB without having to have a user account created for
them.  This is intended only for testing, and to make the installation
go a bit smoother.  You should remove them before moving into a
production environment.

Remove anonymous users? [Y/n]                      # <= 匿名ユーザの削除： Y 応答
 ... Success!

Normally, root should only be allowed to connect from 'localhost'.  This
ensures that someone cannot guess at the root password from the network.

Disallow root login remotely? [Y/n] n              # <= root のリモートログイン： n 応答（Y でもよい）
 ... skipping.

By default, MariaDB comes with a database named 'test' that anyone can
access.  This is also intended only for testing, and should be removed
before moving into a production environment.

Remove test database and access to it? [Y/n]       # <= テストデータベースの削除： Y 応答
 - Dropping test database...
 ... Success!
 - Removing privileges on test database...
 ... Success!

Reloading the privilege tables will ensure that all changes made so far
will take effect immediately.

Reload privilege tables now? [Y/n]                 # <= 特権情報のリロード： Y 応答
 ... Success!

Cleaning up...

All done!  If you've completed all of the above steps, your MariaDB
installation should now be secure.

Thanks for using MariaDB!
```

### 5. 動作確認

インストール直後は、サーバは起動している。  
ログインしてみる。

``` text
# mysql -u root -p
Enter password:                       # <= MariaDB root パスワード
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 10
Server version: 10.1.23-MariaDB-9+deb9u1 Debian 9.0

Copyright (c) 2000, 2017, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> show databases;     # <= 存在するデータベースを確認してみる
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
3 rows in set (0.00 sec)

MariaDB [(none)]> show engines;       # <= 存在するストレージエンジンを確認してみる
+--------------------+---------+--------------------------------------------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                                                          | Transactions | XA   | Savepoints |
+--------------------+---------+--------------------------------------------------------------------------------------------------+--------------+------+------------+
| MRG_MyISAM         | YES     | Collection of identical MyISAM tables                                                            | NO           | NO   | NO         |
| CSV                | YES     | CSV storage engine                                                                               | NO           | NO   | NO         |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables                                        | NO           | NO   | NO         |
| MyISAM             | YES     | MyISAM storage engine                                                                            | NO           | NO   | NO         |
| SEQUENCE           | YES     | Generated tables filled with sequential values                                                   | YES          | NO   | YES        |
| Mroonga            | YES     | CJK-ready fulltext search, column store                                                          | NO           | NO   | NO         |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                                                               | NO           | NO   | NO         |
| InnoDB             | DEFAULT | Percona-XtraDB, Supports transactions, row-level locking, foreign keys and encryption for tables | YES          | YES  | YES        |
| Aria               | YES     | Crash-safe tables with MyISAM heritage                                                           | NO           | NO   | NO         |
+--------------------+---------+--------------------------------------------------------------------------------------------------+--------------+------+------------+
9 rows in set (0.00 sec)

MariaDB [(none)]> exit
Bye
```

`Mroonga` 行が存在すること、 `Support` が `YES` になっていることを確認する。

### 6. 起動・再起動・ステータス確認・停止のテスト

``` text
# systemctl start mariadb
# systemctl restart mariadb
# systemctl status mariadb
# systemctl stop mariadb
```

* `mariadb` は `mysqld` でもよい。

### 7. 設定編集

必要に応じて、各種設定ファイルを編集する。（以下は、一例）  
"/etc/mysql/my.cnf" が "/etc/mysql/conf.d" や "/etc/mysql/mariadb.conf.d" ディレクトリ配下の cnf ファイルを読み込むようになっている。（以前のように "/etc/my.cnf" ファイルにまとめて記述する方法にしてもよいだろう）

（`[mysqld]` の `innodb_data_file_path` や `innodb_log_file_size` を変更する際は、細心の注意を）

File: `/etc/mysql/mariadb.conf.d/50-client.cnf`

{% highlight bash linenos %}
#
# This group is read by the client library
# Use it for options that affect all clients, but not the server
#

[client]
# Default is Latin1, if you need UTF-8 set this (also in server section)
port   = 3306
socket = /var/run/mysqld/mysqld.sock
default-character-set = utf8mb4


# Example of client certificate usage
# ssl-cert=/etc/mysql/client-cert.pem
# ssl-key=/etc/mysql/client-key.pem
#
# Allow only TLS encrypted connections
# ssl-verify-server-cert=on

# This group is *never* read by mysql client library, though this
# /etc/mysql/mariadb.cnf.d/client.cnf file is not read by Oracle MySQL
# client anyway.
# If you use the same .cnf file for MySQL and MariaDB,
# use it for MariaDB-only client options
[client-mariadb]
{% endhighlight %}

File: `/etc/mysql/mariadb.conf.d/50-mysql-clients.cnf`

{% highlight bash linenos %}
#
# These groups are read by MariaDB command-line tools
# Use it for options that affect only one utility
#

[mysql]
# Default is Latin1, if you need UTF-8 set this (also in server section)
default-character-set = utf8mb4
no-auto-rehash
show-warnings
prompt=\u@\h:\d\_\R:\m:\\s>\_
pager="less -n -i -F -X -E"

[mysql_upgrade]

[mysqladmin]

[mysqlbinlog]

[mysqlcheck]

[mysqldump]

[mysqlimport]

[mysqlshow]

[mysqlslap]
{% endhighlight %}

File: `/etc/mysql/mariadb.conf.d/50-mysqld_safe.cnf`

{% highlight bash linenos %}
# NOTE: This file is read only by the traditional SysV init script, not systemd.
# MariaDB systemd does _not_ utilize mysqld_safe nor read this file.
#
# For similar behaviour, systemd users should create the following file:
# /etc/systemd/system/mariadb.service.d/migrated-from-my.cnf-settings.conf
#
# To achieve the same result as the default 50-mysqld_safe.cnf, please create
# /etc/systemd/system/mariadb.service.d/migrated-from-my.cnf-settings.conf
# with the following contents:
#
# [Service]
# User=mysql
# StandardOutput=syslog
# StandardError=syslog
# SyslogFacility=daemon
# SyslogLevel=err
# SyslogIdentifier=mysqld
#
# For more information, please read https://mariadb.com/kb/en/mariadb/systemd/
#

[mysqld_safe]
# This will be passed to all mysql clients
# It has been reported that passwords should be enclosed with ticks/quotes
# especially if they contain "#" chars...
# Remember to edit /etc/mysql/debian.cnf when changing the socket location.
socket          = /var/run/mysqld/mysqld.sock
nice            = 0
skip_log_error
syslog
{% endhighlight %}

File: `/etc/mysql/mariadb.conf.d/50-server.cnf`

{% highlight bash linenos %}
#
# These groups are read by MariaDB server.
# Use it for options that only the server (but not clients) should see
#
# See the examples of server my.cnf files in /usr/share/mysql/
#

# this is read by the standalone daemon and embedded servers
[server]

# this is only for the mysqld standalone daemon
[mysqld]

#
# * Basic Settings
#
user                   = mysql
pid-file               = /var/run/mysqld/mysqld.pid
socket                 = /var/run/mysqld/mysqld.sock
port                   = 3306
basedir                = /usr
datadir                = /var/lib/mysql
tmpdir                 = /tmp
lc_messages            = en_US   # Default: en_US
lc-messages-dir        = /usr/share/mysql
skip-external-locking
performance_schema     = OFF     # Default: ON
sql_mode               = ''
default_storage_engine = InnoDB  # Default: InnoDB
skip-character-set-client-handshake


# Instead of skip-networking the default is now to listen only on
# localhost which is more compatible and is not less secure.
bind-address            = 0.0.0.0  # 127.0.0.1

#
# * Fine Tuning
#
key_buffer_size         = 8M    # Default: 8M (for MyISAM)
myisam_sort_buffer_size = 8M    # Default: 8M (for MyISAM)
sort_buffer_size        = 8M    # Default: 2M (通常時:8M, ALTER TABLE 時:64M)
read_buffer_size        = 8M    # Default: 128K
read_rnd_buffer_size    = 8M    # Default: 256K
join_buffer_size        = 8M    # Default: 128K
max_allowed_packet      = 128M  # Default: 1M
thread_stack            = 288K  # Default: 192K(32bit), 288K(64bit)
thread_cache_size       = 40    # Default: 0 (max_connections の 1/3 程度?)
table_open_cache        = 400   # Default: 400 (同時接続数 * テーブル数?)
table_definition_cache  = 400   # Default: -1:autosized = 400 + (table_open_cache / 2
tmp_table_size          = 16M   # Default: System 依存 (for Memory, <= max_heap_table_size)
max_heap_table_size     = 32M   # Default: 16M         (for Memory, >= tmp_table_size)
bulk_insert_buffer_size = 64M
# This replaces the startup script and checks MyISAM tables if needed
# the first time they are touched
myisam_recover_options = BACKUP
max_connections        = 100   # Default: 151
max_connect_errors     = 100   # Default: 100
max_user_connections   = 0     # Default: 0
#table_cache            = 64
#thread_concurrency     = 10
wait_timeout           = 300   # Default: 28800 (通常時:300, データインポート時:3600程度)
interactive_timeout    = 3600  # Default: 28800
connect_timeout        = 30    # Default: 10
net_read_timeout       = 3600  # Default: 30
net_write_timeout      = 3600  # Default: 60

#
# * Query Cache Configuration
#
query_cache_limit      = 8M    # Default: 1M
query_cache_size       = 32M   # Default: 0 (通常時: 32M, データインポート時: 0)

#
# * Logging and Replication
#
log_output          = FILE  # Default: FILE
log_warnings        = 1     # Default: 1
# Both location gets rotated by the cronjob.
# Be aware that this log type is a performance killer.
# As of 5.1 you can enable the log at runtime!
#general_log_file    = /var/log/mysql/mysql.log  # デバッグ時に有効化
#general_log         = 1                         # デバッグ時に有効化
#
# Error log - should be very few entries.
#
log_error = /var/log/mysql/error.log
#
# Enable the slow query log to see queries with especially long duration
#slow_query_log_file = /var/log/mysql/mariadb-slow.log   # デバッグ時に有効化
#slow_query_log      = 1                                 # デバッグ時に有効化
#long_query_time     = 30                                # デバッグ時に有効化
#log_slow_rate_limit  = 1000
#log_slow_verbosity   = query_plan
#log-queries-not-using-indexes
#
# The following can be used as easy to replay backup logs or for replication.
# note: if you are setting up a replication slave, see README.Debian about
#       other settings you may need to change.
server-id        = 102  # レプリケーション時 (1 〜 2^32 - 1)
log_bin          = /var/log/mysql/mysql-bin.log
expire_logs_days = 10
max_binlog_size  = 100M
binlog_format    = MIXED
log_bin_trust_function_creators = 1  # Default: 0 (for TRIGGER)
#binlog_do_db     = include_database_name
#binlog_ignore_db = exclude_database_name

#
# * InnoDB
#
# InnoDB is enabled by default with a 10MB datafile in /var/lib/mysql/.
# Read the manual for more InnoDB related options. There are many!
innodb_data_file_path          = ibdata1:1G  #:autoextend
innodb_autoextend_increment    = 64          # Default: 64
innodb_file_per_table          = 1
innodb_file_format             = Barracuda   # Default: Antelope
innodb_file_format_max         = Barracuda   # Default: Antelope
innodb_large_prefix            = 1           # Default: 0
innodb_buffer_pool_size        = 768M        # Default: 128M (innodb_log_files_in_group * innodb_log_file_size < innodb_buffer_pool_size)
innodb_buffer_pool_instances   = 16          # Default: autosized(32bit), 8(64bit) (innodb_buffer_pool_size >= 1G の場合にのみ有効)
innodb_sort_buffer_size        = 32M         # Default: 1M (通常時:8M, ALTER TABLE 時:64M)
innodb_thread_concurrency      = 4           # Default: 0 (Defalut 推奨? CPU数 * ディスク数 * 2 が最適?)
innodb_thread_sleep_delay      = 10000       # Default: 10000 (単位:マイクロ秒)
innodb_commit_concurrency      = 4           # Default: 0 (Default 推奨?)
innodb_write_io_threads        = 8           # Default: 4 (1 - 64)
innodb_read_io_threads         = 8           # Default: 4 (1 - 64)
innodb_log_buffer_size         = 32M         # Default: 8M (通常時:32M, データインポート時:256M程度)
innodb_log_group_home_dir      = /var/lib/mysql
innodb_log_files_in_group      = 2           # Default: 2   (変更注意!)
innodb_log_file_size           = 256M        # Default: 48M (変更注意!)
# <= innodb_log_files_in_group  innodb_log_file_size < innodb_buffer_pool_size
#    [変更方法](http://dev.mysq.com/doc/refman/5.6/ja/innodb-data-log-reconfiguration.html)
innodb_max_dirty_pages_pct     = 90          # Default: 75(%)
# <= 小さい値：低速＆安定、大きい値：高速＆不安定(?)
innodb_io_capacity             = 256         # Default: 200 (100 - 2^64-1)
innodb_io_capacity_max         = 512         # Default: 200 (100 - 2^64-1)
innodb_lru_scan_depth          = 2048     # Default: 1024 (100 - 2^32-1(32bit))
innodb_flush_method            = O_DIRECT    # Default: Not set
innodb_flush_log_at_trx_commit = 1           # Default: 1 (データインポート時: 2 or 0)
innodb_doublewrite             = 1           # Default: 1 (データインポート時: 0)

#
# * Security Features
#
# Read the manual, too, if you want chroot!
# chroot = /var/lib/mysql/
#
# For generating SSL certificates you can use for example the GUI tool "tinyca".
#
# ssl-ca=/etc/mysql/cacert.pem
# ssl-cert=/etc/mysql/server-cert.pem
# ssl-key=/etc/mysql/server-key.pem
#
# Accept only connections using the latest and most secure TLS protocol version.
# ..when MariaDB is compiled with OpenSSL:
# ssl-cipher=TLSv1.2
# ..when MariaDB is compiled with YaSSL (default in Debian):
# ssl=on

#
# * Character sets
#
# MySQL/MariaDB default is Latin1, but in Debian we rather default to the full
# utf8 4-byte character set. See also client.cnf
#
character-set-server  = utf8mb4
collation-server      = utf8mb4_general_ci

#
# * Event Scheduler
#
event_scheduler = 1  # Default: 0

#
# * Unix socket authentication plugin is built-in since 10.0.22-6
#
# Needed so the root database user can authenticate without a password but
# only when running as the unix root user.
#
# Also available for other users if required.
# See https://mariadb.com/kb/en/unix_socket-authentication-plugin/

# this is only for embedded server
[embedded]

# This group is only read by MariaDB servers, not by MySQL.
# If you use the same .cnf file for MySQL and MariaDB,
# you can put MariaDB-only options here
[mariadb]

# This group is only read by MariaDB-10.1 servers.
# If you use the same .cnf file for MariaDB of different versions,
# use this group for options that older servers don't understand
[mariadb-10.1]
{% endhighlight %}

* ibdata1, ib_lofile0, ib_logfile1 のサイズを変更した場合は、MariaDB サーバ停止後に ibdata1, ib_lofile0, ib_logfile1 を削除してから再起動すること。

### 8. サービスの自動起動設定

インストール直後はマシン起動時に自動で MariaDB サーバが起動するようになっている。  
自動起動しないようにしたければ以下のようにする。

``` text
# systemctl disable mariadb
```

* `mariadb` は `mysqld` でもよい（`mysql` はダメ）

### 9. ファイアウォール(ufw)の設定

リモートで MariaDB サーバにアクセスする場合（GUI ツールを使用する場合等）は、TCP ポート 3306 を開放する必要がある。

``` text
# ufw allow 3306/tcp
Rule added

# ufw status
    :
3306/tcp                   ALLOW       Anywhere
    :
```

### 10. 参考サイト

* [2.3. Debian GNU/Linux — Mroonga v7.04 documentation](http://mroonga.org/ja/docs/install/debian.html#stretch-mariadb "2.3. Debian GNU/Linux — Mroonga v7.04 documentation")

---

以上。

