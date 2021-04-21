---
layout   : single
title    : "CentOS - MySQL 5.7 インストール（ソースビルド）！"
published: true
date     : 2015-12-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- MySQL
---

MySQL 5.7 系の最新版をソースをビルドして CentOS 6.7 にインストールする方法についてです。

<!--more-->

### 0. 前提条件

* CentOS 6.7(32bit) での作業を想定。
* 搭載メモリは 1GB を想定。

### 1. 必要パッケージの準備

以下の必要なパッケージが未インストールならインストールしておく。

``` text
# yum install wget cmake gcc-c++ ncurses-devel zlib-devel
```

### 2. MySQL ユーザ・グループの作成

``` text
# groupadd mysql
# useradd -r -g mysql -s /bin/false mysql
```

### 3. ソースの取得

アーカイブファイルを取得、展開後、ディレクトリを移動しておく。

```

# cd /usr/local/src/
# wget http://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-5.7.9.tar.gz
# tar zxvf mysql-5.7.9.tar.gz
# cd mysql-5.7.9
```

### 4. Makefile の生成

`cmake` コマンドで Makefile を生成する。（よくある `configure` コマンドと同様の位置付け）

オプションは、デフォルト値とが異なる値を設定したいものだけを指定する。  
（MySQL 5.7 からは C++ Boost ライブラリが必要なので `DOWNLOAD_BOOST` と `WITH_BOOST` は必須）  
※デフォルト値は[こちら](http://dev.mysql.com/doc/refman/5.7/en/source-configuration-options.html "MySQL :: MySQL 5.7 Reference Manual :: 2.9.4 MySQL Source-Configuration Options")を参照。

``` text
# cmake . \
 -DMYSQL_UNIX_ADDR=/var/run/mysqld/mysqld.sock \
 -DMYSQL_DATADIR=/var/lib/mysql \
 -DDEFAULT_CHARSET=utf8 \
 -DDEFAULT_COLLATION=utf8_general_ci \
 -DDOWNLOAD_BOOST=1 \
 -DWITH_BOOST=/usr/local/mysql
```

`cmake` が途中で失敗した等の理由で `cmake` を再実行する場合は、キャッシュをクリアしてから再実行する。

``` text
# make clean
# rm CMakeCache.txt
```

### 5. ビルド

``` text
# make
```

（時間がかかる）

### 6. インストール

``` text
# make install
```

### 7. 環境変数 PATH の設定

File: `/etc/bashrc`

{% highlight bash linenos %}
PATH=$PATH:/usr/local/mysql/bin
{% endhighlight %}

そして、即時反映。

``` text
# source /etc/bashrc
```

### 8. インストールの確認

``` text
# mysqld --version
mysqld  Ver 5.7.9 for Linux on i686 (Source distribution)
```

### 9. 所有者・所有グループの設定

``` text
# cd /usr/local/mysql
# chown -R mysql. .
```

### 10. 初期設定

``` text
# bin/mysqld --initialize --user=mysql
# bin/mysql_ssl_rsa_setup
# chown -R root .
# chown -R mysql /var/lib/mysql
```

### 11. 設定ファイルの編集

環境に合わせて、 "/etc/my.cnf" を編集する。（サンプルは "/usr/local/mysql/support-files" ディレクトリ内にある）  
以下は当方の取り急ぎの例。（実際には、熟考して詳細に設定すること）

File: `/etc/my.cnf`

{% highlight bash linenos %}
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.7/en/server-configuration-defaults.html

[mysqld]
# ==== Basis
server-id = 2  # レプリケーション用 (1 〜 2^32 - 1)
user                   = mysql
datadir                = /var/lib/mysql
socket                 = /var/lib/mysql/mysql.sock
pid-file               = /var/run/mysqld/mysqld.pid
skip_external_locking
sql_mode               = NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
character_set_server   = utf8
collation-server       = utf8_general_ci
default_storage_engine = InnoDB           # Default: InnodDB
lc_messages            = en_US            # Default: en_US
lc_messages_dir        = /usr/share/mysql

# ==== Network, Connection
port                 = 3306
bind-address         = 0.0.0.0  # 127.0.0.1
max_connections      = 100      # Default: 151
max_connect_errors   = 100      # Default: 100
max_user_connections = 0        # Default: 0
wait_timeout         = 300      # Default: 28800
interactive_timeout  = 3600     # Default: 28800
connect_timeout      = 30       # Default: 10

# ==== Buffer
max_allowed_packet      = 32M   # Default: 1M
thread_cache_size       = 40    # Default: 0 (max_connections の 1/3 程度?)
table_open_cache        = 400   # Default: 400 (同時接続数 * テーブル数?)
tmp_table_size          = 16M   # Default: System 依存 (for Memory, <= max_heap_table_size)
max_heap_table_size     = 32M   # Default: 16M         (for Memory, >= tmp_table_size)
sort_buffer_size        = 4M    # Default: 2M
read_buffer_size        = 4M    # Default: 128K
read_rnd_buffer_size    = 4M    # Default: 256K
join_buffer_size        = 4M    # Default: 128K
query_cache_size        = 32M   # Default: 0
query_cache_limit       = 16M   # Default: 1M
thread_stack            = 192K  # Default: 192K(32bit), 288K(64bit)

# ==== MyISAM
key_buffer_size         = 8M    # Default: 8M (for MyISAM)
myisam_sort_buffer_size = 8M    # Default: 8M (for MyISAM)

# ==== Binary Log
log_bin          = mysql-bin
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
innodb_buffer_pool_size         = 768M        # Default: 128M (innodb_log_files_in_group * innodb_log_file_size < innodb_buffer_pool_size)
#innodb_buffer_pool_instances    = 8          # Default: autosized(32bit), 8(64bit) (innodb_buffer_pool_size >= 1G の場合にのみ有効)
innodb_sort_buffer_size         = 2M          # Default: 1M
innodb_write_io_threads         = 4           # Default: 4 (1 - 64)
innodb_read_io_threads          = 4           # Default: 4 (1 - 64)
innodb_log_buffer_size          = 32M         # Default: 8M
innodb_log_group_home_dir       = /var/lib/mysql
innodb_log_files_in_group       = 2           # Default: 2
innodb_log_file_size            = 256M        # Default: 48M (innodb_log_files_in_group * innodb_log_file_size < innodb_buffer_pool_size)
innodb_max_dirty_pages_pct      = 90          # Default: 75(%)
innodb_io_capacity              = 100         # Default: 200 (100 - 2^64-1)
innodb_io_capacity_max          = 200         # Default: 200 (100 - 2^64-1)
innodb_lru_scan_depth           = 100         # Default: 1024 (100 - 2^32-1(32bit))
innodb_flush_method             = O_DIRECT    # Default: Not set
innodb_flush_log_at_trx_commit  = 1           # Default: 1
innodb_doublewrite              = 1           # Default: 1

# ==== Log
log_output          = FILE  # Default: FILE
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
socket = /var/lib/mysql/mysql.sock

[mysqld_safe]
socket = /var/lib/mysql/mysql.sock
nice   = 0

[mysqldump]
quick
quote-names
max_allowed_packet = 32M

[mysql]
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
{% endhighlight %}

### 12. PID 用ディレクトリの作成

``` text
# mkdir /var/run/mysqld
# chown -R mysql. /var/run/mysqld
```

### 13. 起動スクリプトの作成

``` text
# cp support-files/mysql.server /etc/rc.d/init.d/mysqld
# chown root:root /etc/rc.d/init.d/mysqld
# chmod 755 /etc/rc.d/init.d/mysqld
```

そして、編集する。

File: `/etc/rc.d/init.d/mysqld`

{% highlight bash linenos %}
basedir=/usr/local/mysql
datadir=/var/lib/mysql
{% endhighlight %}

### 14. 自動起動の設定

``` text
# chkconfig --add mysqld
# chkconfig mysqld on
# chkconfig --list mysqld
mysqld          0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 15. MySQL サーバの起動

``` text
# /etc/rc.d/init.d/mysqld start
```

### 16. root 初期パスワードの確認

（記録されているログファイルは環境により異なる）

``` text
# grep 'temporary password' /var/log/mysql/error.log
2015-11-29T06:05:51.282215Z 1 [Note] A temporary password is generated for root@localhost: wH!Y#>(lQ7aQ
```

### 17. MySQL の安全化

root パスワードの設定等を行う。（説明は後述）

``` text
# mysql_secure_installation

Securing the MySQL server deployment.

Enter password for user root:
The 'validate_password' plugin is installed on the server.
The subsequent steps will run with the existing configuration
of the plugin.
Using existing password for root.

Estimated strength of the password: 100
Change the password for root ? ((Press y|Y for Yes, any other key for No) : y

New password:

Re-enter new password:

Estimated strength of the password: 100
Change the password for root ? ((Press y|Y for Yes, any other key for No) : n

 ... skipping.
By default, a MySQL installation has an anonymous user,
allowing anyone to log into MySQL without having to have
a user account created for them. This is intended only for
testing, and to make the installation go a bit smoother.
You should remove them before moving into a production
environment.

Remove anonymous users? (Press y|Y for Yes, any other key for No) : y
Success.

Normally, root should only be allowed to connect from
'localhost'. This ensures that someone cannot guess at
the root password from the network.

Disallow root login remotely? (Press y|Y for Yes, any other key for No) : n

 ... skipping.
By default, MySQL comes with a database named 'test' that
anyone can access. This is also intended only for testing,
and should be removed before moving into a production
environment.

Remove test database and access to it? (Press y|Y for Yes, any other key for No) : y
 - Dropping test database...
Success.

 - Removing privileges on test database...
Success.

Reloading the privilege tables will ensure that all changes
made so far will take effect immediately.

Reload privilege tables now? (Press y|Y for Yes, any other key for No) : y
Success.

All done!
```

1. `Enter password for user root:` で root の初期パスワードを入力する。
2. `New password:` で root の新しいパスワードを設定する。  
   （パスワードに使用する文字は数字・英小文字・英大文字・記号を混在させること。そうしなければポリシー違反でエラーになる）
3. `Re-enter new password:` で root の新しいパスワードの確認入力をする。
4. `Estimated strength of the password: 100 ...` でより強固なパスワードに変更するか問われるが、 `n` で応答する。（当然 `y` でもよい）
5. `Remove anonymous users?` で匿名ユーザを削除するために `y` で応答する。
6. `Disallow root login remotely?` で root のリモート接続を拒否するか問われるが、リモート接続したいので `n` で応答する。（当然 `y` でもよい）
7. `Remove test database and access to it?` でテストデータベースを削除するか問われるので、 `y` で応答する。
8. `Reload privilege tables now?` で権限テーブルを即時リロードするか問われるので、 `y` で応答する。

### 18. 動作確認

MySQL サーバにログインしてみる。

``` text
# mysql -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 10
Server version: 5.7.9-log Source distribution

Copyright (c) 2000, 2015, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

その他、各種操作を試してみる。

### 19. その他

* 設定ファイルは "/etc/my.cnf" なので、実際に運用する際には綿密に検討して設定する。
* パスワードの有効期限がデフォルトでは「360 日」に設定されている。  
  必要なら、システム変数 `default_password_lifetime` を編集する。

### 20. 参考サイト

* [MySQL :: MySQL 5.7 Reference Manual :: 2.9 Installing MySQL from Source](http://dev.mysql.com/doc/refman/5.7/en/source-installation.html "MySQL :: MySQL 5.7 Reference Manual :: 2.9 Installing MySQL from Source")

---

以上。

