---
layout   : single
title    : "Linux Mint - MySQL 5.7 インストール（by ソースビルド）！"
published: true
date     : 2016-01-28 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- LinuxMint
- MySQL
---

MySQL 5.7 系の最新版をソースをビルドして Linux Mint 17.2 にインストールする方法についてです。

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* 当記事執筆時点で最新の MySQL 5.7.10 をソースをビルドしてインストールする。
* マシン搭載メモリは 4GB を想定。
* 一般ユーザでの作業を想定。
* 環境の相違等のために以下の方法ではうまく行かないこともあるだろう。  
  ログを確認して適宜対処すること。

### 1. 必要パッケージの準備

以下の必要なパッケージが未インストールならインストールしておく。

``` text
$ sudo apt-get install wget cmake g++ bison libncurses5-dev
```

### 2. MySQL ユーザ・グループの作成

``` text
$ sudo groupadd mysql
$ sudo useradd -r -g mysql -s /bin/false mysql
```

* `useradd` コマンドの `-r` は、システムアカウントを作成するオプション。
* `useradd` コマンドの `-s /bin/false` は、ログインシェルを無効にするオプション。

### 3. ソースの取得

アーカイブファイルを取得、展開後、ディレクトリを移動しておく。（ダウンロード先は一般ユーザホームディレクトリとする）

```

$ cd ~/
$ wget http://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-5.7.10.tar.gz
$ tar zxvf mysql-5.7.10.tar.gz
$ cd mysql-5.7.10
```

### 4. Makefile の生成

`cmake` コマンドで Makefile を生成する。（よくある `configure` コマンドと同様の位置付け）

オプションは、デフォルト値とが異なる値を設定したいものだけを指定する。  
（MySQL 5.7 からは C++ Boost ライブラリが必要なので `DOWNLOAD_BOOST` と `WITH_BOOST` は必須）  
※デフォルト値は[こちら](http://dev.mysql.com/doc/refman/5.7/en/source-configuration-options.html "MySQL :: MySQL 5.7 Reference Manual :: 2.9.4 MySQL Source-Configuration Options")を参照。

``` text
$ sudo cmake . \
 -DMYSQL_UNIX_ADDR=/var/lib/mysql/mysqld.sock \
 -DMYSQL_DATADIR=/var/lib/mysql \
 -DDEFAULT_CHARSET=utf8 \
 -DDEFAULT_COLLATION=utf8_general_ci \
 -DDOWNLOAD_BOOST=1 \
 -DWITH_BOOST=/usr/local/mysql
```

`cmake` が途中で失敗した等の理由で `cmake` を再実行する場合は、キャッシュをクリアしてから再実行する。

``` text
$ sudo rm CMakeCache.txt
```

### 5. ビルド

``` text
$ sudo make
```

（時間がかかる）

### 6. インストール

``` text
$ sudo make install
```

### 7. 環境変数 PATH の設定

（当方は、 "~/.profile" で設定）

File: `~/.profile`

{% highlight bash linenos %}
PATH=$PATH:/usr/local/mysql/bin
export PATH
{% endhighlight %}

そして、即時反映。

``` text
$ source ~/.profile
```

### 8. インストールの確認

MySQL サーバとクライアントのバージョンを確認してみる。

``` text
$ mysqld --version
mysqld  Ver 5.7.10 for Linux on x86_64 (Source distribution)

$ mysql --version
mysql  Ver 14.14 Distrib 5.7.10, for Linux (x86_64) using  EditLine wrapper
```

### 9. 設定ファイルの編集

環境に合わせて、 "/etc/my.cnf" を編集する。（サンプルは "/usr/local/mysql/support-files" ディレクトリ内にある）  
（以下は当方の取り急ぎの例。**実際に運用する際は綿密に検討して設定すること**）

File: `/etc/my.cnf`

{% highlight bash linenos %}
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.7/en/server-configuration-defaults.html

[mysqld]
# ==== Basis
server-id                 = 1  # レプリケーション時に使用 (1 〜 2^32 - 1)
user                      = mysql
datadir                   = /var/lib/mysql
socket                    = /var/lib/mysql/mysql.sock
pid-file                  = /var/run/mysqld/mysqld.pid
performance_schema        = OFF     # Default: ON
skip_external_locking
sql_mode                  = STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
character_set_server      = utf8mb4
collation-server          = utf8mb4_general_ci
skip-character-set-client-handshake
default_storage_engine    = InnoDB  # Default: InnoDB
default_password_lifetime = 3650    # Default: 360
lc_messages               = en_US   # Default: en_US
lc_messages_dir           = /usr/local/mysql/share

# ==== Network, Connection
port                 = 3306
bind-address         = 0.0.0.0   # 127.0.0.1
max_connections      = 100       # Default: 151
max_connect_errors   = 100       # Default: 100
max_user_connections = 0         # Default: 0
wait_timeout         = 3600      # Default: 28800 (通常時:300, データインポート時:3600程度)
interactive_timeout  = 3600      # Default: 28800
connect_timeout      = 30        # Default: 10

# ==== Buffer
max_allowed_packet      = 32M    # Default: 1M (通常時:32M程度, データインポート時:128M程度)
thread_cache_size       = 40     # Default: 0 (max_connections の 1/3 程度?)
table_open_cache        = 400    # Default: 400 (同時接続数 * テーブル数?)
table_definition_cache  = 400    # Default: -1:autosized = 400 + (table_open_cache / 2)
tmp_table_size          = 16M    # Default: System 依存 (for Memory, <= max_heap_table_size)
max_heap_table_size     = 32M    # Default: 16M         (for Memory, >= tmp_table_size)
sort_buffer_size        = 4M     # Default: 2M (通常時:4M, ALTER TABLE 時:64M)
read_buffer_size        = 4M     # Default: 128K
read_rnd_buffer_size    = 4M     # Default: 256K
join_buffer_size        = 4M     # Default: 128K
query_cache_size        = 32M    # Default: 0 (通常時: 32M, データインポート時: 0)
query_cache_limit       = 16M    # Default: 1M
thread_stack            = 192K   # Default: 192K(32bit), 288K(64bit)

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
#innodb_buffer_pool_instances    = 8           # Default: autosized(32bit), 8(64bit) (innodb_buffer_pool_size >= 1G の場合にのみ有効)
innodb_sort_buffer_size         = 2M          # Default: 1M (通常時:2M, ALTER TABLE 時:64M)
innodb_write_io_threads         = 4           # Default: 4 (1 - 64)
innodb_read_io_threads          = 4           # Default: 4 (1 - 64)
innodb_log_buffer_size          = 32M         # Default: 8M (通常時:32M, データインポート時:128M程度)
innodb_log_group_home_dir       = /var/lib/mysql
innodb_log_files_in_group       = 2           # Default: 2   (変更注意!)
innodb_log_file_size            = 256M        # Default: 48M (変更注意!)
# <= innodb_log_files_in_group * innodb_log_file_size < innodb_buffer_pool_size
#    [変更方法](http://dev.mysql.com/doc/refman/5.6/ja/innodb-data-log-reconfiguration.html)
innodb_max_dirty_pages_pct      = 90          # Default: 75(%)
# <= 小さい値：低速＆安定、大きい値：高速＆不安定(?)
innodb_io_capacity              = 100         # Default: 200 (100 - 2^64-1)
innodb_io_capacity_max          = 200         # Default: 200 (100 - 2^64-1)
innodb_lru_scan_depth           = 100         # Default: 1024 (100 - 2^32-1(32bit))
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
socket = /var/lib/mysql/mysql.sock
default-character-set = utf8mb4

[mysqld_safe]
socket = /var/lib/mysql/mysql.sock
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
user     = root
password = xxxxxxxx
{% endhighlight %}

### 10. 所有者・所有グループの設定

``` text
$ cd /usr/local/mysql
$ sudo chown -R mysql. .
```

### 11. ログディレクトリの作成

ログ用ディレクトリを作成し、所有者・グループを設定しておく。

``` text
$ sudo mkdir /var/log/mysql
$ sudo chown -R mysql. /var/log/mysql
```

### 12. PID ディレクトリの作成

``` text
$ sudo mkdir /var/run/mysqld
$ sudo chown -R mysql. /var/run/mysqld
```

### 13. 初期設定

``` text
$ sudo bin/mysqld --initialize --user=mysql
$ sudo bin/mysql_ssl_rsa_setup
$ sudo chown -R mysql. /var/lib/mysql
```

### 14. 起動スクリプトの作成

``` text
$ sudo cp support-files/mysql.server /etc/init.d/mysqld
$ sudo chown root:root /etc//init.d/mysqld
$ sudo chmod 755 /etc/init.d/mysqld
```

そして、編集する。

File: `/etc/init.d/mysqld`

{% highlight bash linenos %}
if [ ! -d /var/run/mysqld ]; then
  mkdir /var/run/mysqld && chown -R mysql. /var/run/mysqld
fi

basedir=/usr/local/mysql
datadir=/var/lib/mysql
{% endhighlight %}

* 上記の `if ... mkdir ... fi` の部分について
  "/var/run" ディレクトリは tmpfs であるため、マシンの電源を落とすと "/var/run/mysqld" ディレクトリが消滅してしまう。  
  その対策として、サービス起動時に "/var/run/mysqld" ディレクトリが存在しなければ作成し、所有者を設定している。  
  （過去、MySQL サーバ構築時にこのような対策をしたことはなかったけども。。。）

### 15. MySQL サーバの起動

``` text
$ sudo /etc/init.d/mysqld start
```

### 16. 自動起動の設定

マシン起動時に MySQL サーバを自動起動するようにしたければ、以下のようにする。

``` text
$ sudo update-rc.d mysqld defaults
 Adding system startup for /etc/init.d/mysqld ...
   /etc/rc0.d/K20mysqld -> ../init.d/mysqld
   /etc/rc1.d/K20mysqld -> ../init.d/mysqld
   /etc/rc6.d/K20mysqld -> ../init.d/mysqld
   /etc/rc2.d/S20mysqld -> ../init.d/mysqld
   /etc/rc3.d/S20mysqld -> ../init.d/mysqld
   /etc/rc4.d/S20mysqld -> ../init.d/mysqld
   /etc/rc5.d/S20mysqld -> ../init.d/mysqld

$ sudo sysv-rc-conf --list | grep mysqld  # <= 2,3,4,5 が on であることを確認
mysqld       0:off      1:off   2:on    3:on    4:on    5:on    6:off
```

### 17. root 初期パスワードの確認

（記録されているログファイルは環境により異なる）

``` text
$ sudo grep 'temporary password' /var/log/mysql/error.log
2015-12-10T07:42:55.685053Z 1 [Note] A temporary password is generated for root@localhost: O<ZeyQmcX5wQ
```

### 18. MySQL の安全化

root パスワードの設定等を行う。（説明は後述）

``` text
$ mysql_secure_installation
mysql_secure_installation: [ERROR] unknown variable 'default-character-set=utf8'

Securing the MySQL server deployment.

Enter password for user root:

The existing password for the user account root has expired. Please set a new password.

New password:

Re-enter new password:

VALIDATE PASSWORD PLUGIN can be used to test passwords
and improve security. It checks the strength of password
and allows the users to set only those passwords which are
secure enough. Would you like to setup VALIDATE PASSWORD plugin?

Press y|Y for Yes, any other key for No: n
Using existing password for root.
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
3. `VALIDATE PASSWORD PLUGIN ... Press y|Y for Yes, any other key for No:` でパスワード検証プラグインの設定を行うか問われるが、今回は行わないので `n` で応答する。
4. `Change the password for root ? ((Press y|Y for Yes, any other key for No) :` で root のパスワードを変更するか問われるが、先ほど設定したの `n` で応答する。
5. `Remove anonymous users?` で匿名ユーザを削除するために `y` で応答する。
6. `Disallow root login remotely?` で root のリモート接続を拒否するか問われるが、リモート接続したいので `n` で応答する。（当然 `y` でもよい）
7. `Remove test database and access to it?` でテストデータベースを削除するか問われるので、 `y` で応答する。
8. `Reload privilege tables now?` で権限テーブルを即時リロードするか問われるので、 `y` で応答する。

### 19. 動作確認

MySQL サーバにログインしてみる。

``` text
# mysql -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 6
Server version: 5.7.10 Source distribution

Copyright (c) 2000, 2015, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

root@localhost:(none) 16:52:28>
```

その他、各種操作を試してみる。

### 20. その他

* 設定ファイルは "/etc/my.cnf" なので、実際に運用する際には綿密に検討して設定する。
* パスワードの有効期限がデフォルトでは「360 日」に設定されている。  
  必要なら、システム変数 `default_password_lifetime` を編集する。

### 21. 参考サイト

* [MySQL :: MySQL 5.7 Reference Manual :: 2.9 Installing MySQL from Source](http://dev.mysql.com/doc/refman/5.7/en/source-installation.html "MySQL :: MySQL 5.7 Reference Manual :: 2.9 Installing MySQL from Source")

---

以上。

