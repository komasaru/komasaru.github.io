---
layout   : single
title    : "MySQL - 5.6.11 ソースビルドでインストール(on Linux Mint)！"
published: true
date     : 2013-05-30 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
- MariaDB
- LinuxMint
---

以前、MySQL 5.5 系を CentOS(Redhat 系ディストリビューション) にソールビルドでインストールはしていました。

- [* Linux - MySQL 5.5.23 をソースからインストール！](http://www.mk-mode.com/octopress/2012/04/26/26002002/ "* Linux - MySQL 5.5.23 をソースからインストール！")

今回は、MySQL の最新安定版 5.6.11 （当記事執筆時点）を Linux Mint 14 でソースをビルドしてインストールしてみました。  
（同じく `cmake` を使用する MariaDB でも同様です）

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- マシン搭載メモリは 4GB.
- MySQL インストール先は "/usr/local/mysql"
- データディレクトリは "/var/mysql/data"

#### 1. 事前準備

最近の MySQL(5.5系以降) はビルド時に `configure` ではなく `cmake` を使用するので、未インストールならインストールしておく。  
また、`bison`, `g++`, `libncurses5-dev` 等も未インストールならインストールしておく。（コンパイルオプションによって異なるかもしれないが、実際に `cmake` してみてエラー・警告メッセージを確認するのもよい）

``` text 
$ sudo apt-get install cmake
$ sudo apt-get install bison
$ sudo apt-get install g++
$ sudo apt-get install libncurses5-dev
```

#### 2. アーカイブダウンロード＆展開

[MySQL :: Download MySQL Community Server](http://dev.mysql.com/downloads/mysql/ "MySQL :: Download MySQL Community Server") から "Generic Linux (Architecture Independent), Compressed TAR Archive"("mysql-5.6.11.tar.gz")をダウンロードし、展開しておく。

``` text 
$ cd /usr/local/src/
$ sudo wget -O mysql-5.6.11.tar.gz http://dev.mysql.com/get/Downloads/MySQL-5.6/mysql-5.6.11.tar.gz/from/http://cdn.mysql.com/
$ sudo tar zxvf mysql-5.6.11.tar.gz
```

#### 3. ビルド＆インストール

以下のように cmake, make, make install する。（`configure` ではなく `cmake`）  
取り急ぎ、コンパイルオプションは以下のようにした。

``` text 
$ cd mysql-5.6.11
$ sudo cmake . -DCMAKE_INSTALL_PREFIX=/usr/local/mysql \
-DMYSQL_DATADIR=/var/mysql/data \
-DMYSQL_UNIX_ADDR=/var/run/mysqld/mysqld.sock \
-DENABLED_LOCAL_INFILE=1 \
-DDEFAULT_CHARSET=utf8 \
-DDEFAULT_COLLATION=utf8_general_ci \
-DWITH_EXTRA_CHARSETS=all \
-DWITH_INNOBASE_STORAGE_ENGINE=1
$ sudo make
$ sudo make install
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

#### 4. ユーザ・グループ作成

MySQL 用のユーザとグループを作成する。

``` text 
$ sudo groupadd mysql
$ sudo useradd -r -g mysql mysql
```

#### 5. データディレクトリ作成

データディレクトリが無ければ作成し、所有者・グループを設定しておく。

``` text 
$ sudo mkdir /var/mysql
$ sudo mkdir /var/mysql/data
$ sudo chown -R mysql. /var/mysql/data/
```

#### 6. ログディレクトリ作成

ログ用ディレクトリを作成し、所有者・グループを設定しておく。

``` text 
$ sudo mkdir /var/log/mysql
$ sudo chown -R mysql. /var/log/mysql/
```

#### 7. ソケット・PIDディレクトリ作成

ソケット・プロセスID用ディレクトリの所有者・グループを設定する。

``` text 
$ sudo mkdir /var/run/mysqld
$ sudo chown -R mysql. /var/run/mysqld/
```

#### 8. 設定ファイル編集

デフォルトの設定ファイル `/usr/local/mysql/support-files/my-default.cnf` を `/etc/my.cnf` にコピーして、適当に編集する。  

``` text 
$ sudo cp /usr/local/mysql/support-files/my-default.cnf /etc/my.cnf
```

以下は当方の例。実際は、`my-default.cnf` を複製して使用せず、以前 MySQL5.5 で使用していたものを流用。  
（ストレージエンジンに InnoDB を利用することを想定している）

``` text 
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
pid-file             = /var/run/mysqld/mysql.pid
socket               = /var/run/mysqld/mysqld.sock
port                 = 3306
basedir              = /usr/local/mysql
datadir              = /var/mysql/data
tmpdir               = /tmp
lc-messages-dir      = /usr/local/mysql/share
character-set-server = utf8
skip-external-locking
skip-character-set-client-handshake

# ==== Buffer
key_buffer              = 32M
max_allowed_packet      = 16M
sort_buffer_size        = 1M
read_buffer_size        = 1M
myisam_sort_buffer_size = 16M
thread_stack            = 192K
thread_cache_size       = 32
query_cache_limit       = 1M
query_cache_size        = 128M
tmp_table_size          = 64MB
max_heap_table_size     = 64M

# ==== Binary Log
log-bin          = mysql-bin  # データインポート時はコメントアウト
expire_logs_days = 10
max_binlog_size  = 100M

# ==== Connection
bind-address       = 127.0.0.1
max_connections    = 100
max_connect_errors = 1000

# ==== MyISAM
myisam-recover = BACKUP

# ==== InnoDB
innodb_data_file_path           = ibdata1:1G:autoextend
innodb_file_per_table
innodb_autoextend_increment     = 64
innodb_buffer_pool_size         = 1G
innodb_write_io_threads         = 8
innodb_read_io_threads          = 8
innodb_log_buffer_size          = 8M   # 通常時:8程度, データインポート時:32程度
innodb_log_file_size            = 256M
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

[isamchk]
key_buffer = 16M
```

#### 9. MySQL 初期化

MySQL データを初期化し、システムテーブルを作成する。

``` text 
$ cd /usr/local/mysql
$ sudo scripts/mysql_install_db --user=mysql --basedir=/usr/local/mysql --datadir=/var/mysql/data --defaults-file=/etc/my.cnf
```

#### 10. 起動スクリプト準備

起動用スクリプトを準備する。（用意されているスクリプトをコピーする）  
場合によっては編集することになるが、`my.cnf` で `basedir`, `datadir` 等を指定しているので、ここでは特に編集はしない。

``` text 
$ sudo cp support-files/mysql.server /etc/init.d/mysqld
```

#### 11. 起動・再起動・ステータス確認・停止のテスト

起動・再起動・ステータス確認・停止ができるか確認する。

``` text 
$ sudo /etc/init.d/mysqld start
$ sudo /etc/init.d/mysqld restart
$ sudo /etc/init.d/mysqld status
$ sudo /etc/init.d/mysqld stop
```

もちろん、”service” コマンドでも起動・再起動・ステータス確認・停止ができるはずです。

#### 12. 自動起動設定

マシン起動時に自動で MySQL を起動させたい場合は、以下のようにする。  
当方は、今回はサーバ用途ではないので、自動起動の設定はしない。

``` text 
$ sudo update-rc.d mysql defaults
$ sudo sysv-rc-conf --list | grep mysqld
```

2,3,4,5 が `on` になっていることを確認する。

#### 13. 環境変数 PATH の設定

mysql コマンドへのパスを設定するために `.bash_profile` の最終行に以下の記述を追加する。

``` text 
# vi ~/.bash_profile
export PATH=/usr/local/mysql/bin:$PATH
```

マシンを再起動すれば PATH が有効化するが、直ちに有効化したければ以下のようにする。

``` text 
# source ~/.bash_profile
```

#### 14. MySQL セキュリティ設定

root のバスワード設定、テストDB削除等を行う。  
（root のパスワードのみ設定して、後はデフォルト（エンター押下））

``` text 
$ sudo /usr/local/mysql/bin/mysql_secure_installation
```

#### 15. 動作確認

MySQL サーバにログインしてみる。

``` text 
$ mysql -uroot -p
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 13
Server version: 5.6.11-log Source distribution

Copyright (c) 2000, 2013, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
3 rows in set (0.02 sec)

mysql> 
```

その他、実際にデータベースを作成してみたりしてみる。

#### 16. 注意

MySQL サーバを今回のようにソースからインストールし、同じマシンに別途パッケージから MySQL クライアント等（MySQL Workbench も）をインストールしたりした場合は、パッケージインストールした設定ファイル "my.cnf" を認識するようになるので注意！

#### 17. 参考サイト

- [MySQL :: MySQL 5.6 Reference Manual :: 2.9.4 MySQL Source-Configuration Options](http://dev.mysql.com/doc/refman/5.6/en/source-configuration-options.html "MySQL :: MySQL 5.6 Reference Manual :: 2.9.4 MySQL Source-Configuration Options")

---

あとは通常通り使用可能です。

パフォーマンス的に 5.5 系と比べてどうなのか？については、今後使用してみて体感できればと考えています。（ブログ記事にするか否かは不明）

以上。

