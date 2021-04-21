---
layout   : single
title    : "Debian 8 (Jessie) - DB サーバ MariaDB 構築！"
published: true
date     : 2015-06-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- MariaDB
---

Debian GNU/Linux 8 (Jessie) に DB サーバ MariaDB を導入する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* 接続元のマシンは Linux Mint 17.1(64bit) を想定。
* デフォルトのリポジトリを使用してインストールする。（MariaDB 公式リポジトリではない）
* MariaDB とは言っても中身は MySQL が元になっているので、各所で "mysql" のキーワードが出現する。
* ベースディレクトリ、データディレクトリ、ソケット・PID ディレクトリ等は全てデフォルトのままを想定。
* レプリケーション機能、GTID(Global Transaction ID) 機能は使用しないことを想定。

### 1. MariaDB のインストール

以下のようにしてインストールする。（途中で root パスワードの設定がある）

``` text
# apt-get -y install mariadb-server
```

### 2. インストールの確認

MariaDB サーバインストール直後はサービスが起動している。  
以下のように、バージョンを表示してみたり、 root でログインしてみる。

``` text
# mysqld --version
mysqld  Ver 10.0.16-MariaDB-1 for debian-linux-gnu on x86_64 ((Debian))

# mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 40
Server version: 10.0.16-MariaDB-1 (Debian)

Copyright (c) 2000, 2014, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]>
```

### 3. 設定ファイルの編集

デフォルトでは "/etc/mysql/my.cnf" が最初に読まれる設定ファイルとなっていて、このファイルから "/etc/mysql/conf.d" ディレクトリ配下の cnf ファイルが読み込まれる。  
かつてのように "/etc/my.cnf" を使用し "/etc/mysql/my.cnf" を使用しないようにしたければ、 "/etc/mysql/my.cnf" を削除（or リネーム）すればよい。

以下は当方の例で、デフォルトの "/etc/mysql/my.cnf" を使用するケースで、 "/etc/mysql/conf.d/mariadb.cnf" を編集している。（"/etc/mysql/my.cnf" に記述のない項目や、記述があっても値を変更したい項目を "/etc/mysql/conf.d/mariadb.cnf" に記載している。また、ストレージエンジンに InnoDB を使用し、データファイルはテーブル別に作成することを想定している）  
実際は自分の環境に合わせてチューニングする。（リモートで接続できるようにしたければ "/etc/mysql/my.cnf" の `bind-address` 行をコメントアウトする）

File: `/etc/mysql/conf.d/mariadb.cnf`

{% highlight bash linenos %}
# MariaDB-specific config file.
# Read by /etc/mysql/my.cnf

[client]
# Default is Latin1, if you need UTF-8 set this (also in server section)
#default-character-set = utf8
default-character-set = utf8mb4

[mysqld]
#
# * Character sets
#-
# Default is Latin1, if you need UTF-8 set all this (also in client section)
#
character-set-server  = utf8mb4
collation-server      = utf8mb4_general_ci
sql_mode = NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
skip-character-set-client-handshake

# ==== Buffer
key_buffer_size      = 8M
read_buffer_size     = 1M
read_rnd_buffer_size = 1M
sort_buffer_size     = 2M
join_buffer_size     = 256K
query_cache_limit    = 8M
query_cache_size     = 64M

# ==== Binary Log
log_bin       = mysql-bin  # データインポート時はコメントアウト
binlog_format = MIXED

# ==== Connection
max_connections     = 50
max_connect_errors  = 50
wait_timeout        = 300  # 600
interactive_timeout = 600
connect_timeout     = 10

# ==== InnoDB
innodb_data_file_path           = ibdata1:1G
innodb_file_per_table
innodb_buffer_pool_size         = 512M
innodb_additional_mem_pool_size = 20M
innodb_write_io_threads         = 8
innodb_read_io_threads          = 8
innodb_log_buffer_size          = 8M  # 通常時:8程度, データインポート時:32度
innodb_log_files_in_group       = 2
innodb_log_file_size            = 128M
innodb_flush_log_at_trx_commit  = 1    # 通常時:1(デフォルト), データインポート時:2 or 0
#skip_innodb_doublewrite  # ダブルライトバッファへの書き込みをスキップ(通常時は指定しない。データインポート時のみ)

# ==== Log
log-error           = /var/log/mysql/error.log
#general_log_file    = /var/log/mysql/mysql.log  # デバッグ時に有効化
#general_log         = 1                         # デバッグ時に有効化
#slow_query_log_file = /var/log/mysql/slow.log   # デバッグ時に有効化
#slow_query_log      = 1                         # デバッグ時に有効化

# ==== Event Scheduler
event-scheduler = 1

[mysql]
no-auto-rehash

[mysqlhotcopy]
interactive-timeout
{% endhighlight %}

【注意】  
設定ファイルは複数持つことが可能であり、読み込み順とスコープは以下のようになっている。（MariaDB 10.0.13 以上の deb パッケージインストールの場合（[参照](https://mariadb.com/kb/en/mariadb/documentation/getting-started/configuring-mariadb-with-mycnf/ "")））  
同じ項目の場合、後から読み込んだ設定の方が有効になる。

``` text
/etc/my.cnf           => Global
/etc/mysql/my.cnf     => Global
$MYSQL_HOME/my.cnf    => Server
defaults-extra-file   => File specified with --defaults-extra-file=path, if any
~/.my.cnf             => User
```

### 4. MariaDB サーバの再起動

今回設定ファイルを編集、かつ ibdata1 の設定を変更したので、 MariaDB サーバ停止後に "ibdata1", "ib_logfile0", "ib_logfile1" ファイルを削除し、その後 MariaDB を起動する。  
（既にデータベースを作成している場合は、サーバ停止前にデータエクスポートし、サーバ起動後にデータをインポートする作業が必要になる）

``` text
# systemctl stop mysql
# rm -f /var/lib/mysq/ib*
# systemctl start mysql
```

起動時に以下のようなメッセージがログファイルに出力されるかもしれない。（もしくは `systemctl status mysql -l` で確認）

``` text
mysqld_safe Can't log to error log and syslog at the same time. \
Remove all --log-error configuration options for --syslog to take effect.
```

「設定ファイルで指定したエラーログファイルと syslog に同時にログを記録できない」旨のメッセージのようだ。  
しかし、実際はエラーログにも syslog にも出力される。  
メッセージに従って設定ファイル内のエラーログ設定部分をコメントアウトして再起動するとこのメッセージは出力されなくなるが、エラーログが syslog にしか出力されなくなり不便に感じるので、当方はこのメッセージは無視することとした。  
（ちなみに、Debian Wheezy 等ではこのような現象は発生しなかった。また、Web 上の古い記事で「バグ」という情報も見かけた）

### 5. 動作確認

MySQL サーバにログインして、データベースやテーブルの作成、権限の設定、その他各種操作をしてみる。

### 6. サービスの自動起動設定

インストール直後はマシン起動時に自動で MariaDB サーバが起動するようになっている。  
自動起動しないようにしたければ以下のようにする。

``` text
# systemctl disable mysql
```

### 7. ファイアウォール(ufw)の設定

リモートで MariaDB サーバにアクセスする場合（GUI ツールを使用する場合等）は、TCP ポート 3306 を開放する必要がある。

``` text
# ufw allow 3306/tcp
Rule added
Rule added (v6)

# ufw status
    :
3306/tcp                   ALLOW       Anywhere
    :
3306/tcp                   ALLOW       Anywhere (v6)
```

---

以上。

