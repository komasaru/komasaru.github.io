---
layout   : single
title    : "Debian 7.8.0 - DB サーバ MariaDB 10.0 系インストール（Apt 使用）！"
published: true
date     : 2015-01-29 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- MariaDB
- MySQL
---

以前、MariaDB 5.5 系を Linux Mint に MariaDB 公式リポジトリからインストールしたり、Debian GNU/Linux にソースをビルドしてインストールしたりしました。

* [MariaDB - Linux Mint にインストール（apt 使用）！]({{site.baseurl}}/2013/02/25/mariadb-linuxmint-by-apt/ "MariaDB - Linux Mint にインストール（apt 使用）！")
* [Debian 7 Wheezy - DB サーバ MariaDB をインストール（ソースビルド）！]({{site.baseurl}}/2013/10/30/debian-7-install-mariadb-by-src/ "Debian 7 Wheezy - DB サーバ MariaDB をインストール（ソースビルド）！")

今回は、Debian GNU/Linux 7.8.0 に MariaDB 10.0 系の最新バージョンを MariaDB 公式リポジトリを使用してインストールしてみました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 7.8.0 での作業を想定。
* 接続元のマシンは Linux Mint 17.1(64bit) を想定。
* インストールする MariaDB のバージョンは 10.0.15（当記事執筆時点の 10.0 系最新安定版）を想定。
* MariaDB とは言っても中身は MySQL が元になっているので、各所で "mysql" のキーワードを使用する。
* ベースディレクトリ、データディレクトリ、ソケット・PID ディレクトリ等は全てデフォルトのままを想定。
* レプリケーション機能、GTID(Global Transaction ID) 機能は使用しないことを想定。
* MariaDB 10 系のうち、 10.0 系が安定版で 10.1 系が開発版であることに注意。

### 1. リポジトリ追加設定

キー追加後、リポジトリ追加設定を行う。  
（「[MariaDB - Setting up MariaDB Repositories - MariaDB](https://downloads.mariadb.org/mariadb/repositories/ "MariaDB - Setting up MariaDB Repositories - MariaDB")」で環境にあったリポジトリの追加設定を確認できる）

``` text
# apt-get install python-software-properties
# apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xcbcb082a1bb943db
# add-apt-repository 'deb http://ftp.yz.yamagata-u.ac.jp/pub/dbms/mariadb/repo/10.0/debian wheezy main'
```

上記の `add-apt-repository` の代わりに、以下を "/etc/apt/sources.list" の最終行に追加するか、以下の内容で "/etc/apt/sources.list.d/MariaDB.list" なるファイルを作成してもよい。

File: `"/etc/apt/sources.list"`

{% highlight bash linenos %}
# MariaDB 10.0 repository list - created 2015-01-15 05:03 UTC
# http://mariadb.org/mariadb/repositories/
deb http://ftp.yz.yamagata-u.ac.jp/pub/dbms/mariadb/repo/10.0/debian wheezy main
deb-src http://ftp.yz.yamagata-u.ac.jp/pub/dbms/mariadb/repo/10.0/debian wheezy main
{% endhighlight %}

### 2. MariaDB インストール

Apt パッケージリストを更新後、 MariaDB サーバをインストールする。（途中で root のパスワード設定を行う必要がある）

``` text
# apt-get update
# apt-get install mariadb-server
```

### 3. インストール確認

MariaDB サーバインストール直後はサービスが起動している。  
以下のようにしてサーバに root でログインしてみる。

``` text
$ mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 40
Server version: 10.0.15-MariaDB-1~wheezy mariadb.org binary distribution

Copyright (c) 2000, 2014, Oracle, SkySQL Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> exit
```

### 4. サービスの開始・停止等

``` text
# /etc/init.d/mysql start|stop|restart|reload|force-reload|status

or

# service mysql start|stop|restart|reload|force-reload|status
```

### 5. 設定ファイル編集

デフォルトでは "/etc/mysql/my.cnf" が最初に読まれる設定ファイルとなっていて、このファイルから "/etc/mysql/conf.d" ディレクトリ配下の cnf ファイルが読み込まれる。  
かつてのように "/etc/my.cnf" を使用し "/etc/mysql/my.cnf" を使用しないようにしたければ、 "/etc/mysql/my.cnf" を削除（or リネーム）すればよい。

以下は当方の例で、デフォルトの "/etc/mysql/my.cnf" を使用するケースで、 "/etc/mysql/conf.d/mariadb.cnf" を編集している。（"/etc/mysql/my.cnf" に記述のない項目や、記述があっても値を変更したい項目を "/etc/mysql/conf.d/mariadb.cnf" に記載している。また、ストレージエンジンに InnoDB を利用することを想定している。また、リモートで接続できるようにしたければ "/etc/mysql/my.cnf" の `bind-address` 行をコメントアウトする）

（実際は自分の環境に合わせてチューニングすべきである）

File: `/etc/mysql/conf.d/mariadb.cnf`

{% highlight bash linenos %}
[client]
default-character-set = utf8mb4

[mysqld]
# ==== Basic
sql_mode             = NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
character-set-server = utf8
skip-character-set-client-handshake

# ==== Buffer
sort_buffer_size    = 1M
read_buffer_size    = 1M
tmp_table_size      = 16M
max_heap_table_size = 16M

# ==== Binary Log
log-bin = mysql-bin  # データインポート時はコメントアウト

# ==== Connection
max_connections    = 100
max_connect_errors = 100

# ==== InnoDB
innodb_data_file_path          = ibdata1:1G:autoextend
innodb_file_per_table
innodb_autoextend_increment    = 64
innodb_buffer_pool_size        = 384  #512M
innodb_write_io_threads        = 8
innodb_read_io_threads         = 8
innodb_log_buffer_size         = 8M   # 通常時:8程度, データインポート時:32程度
innodb_log_file_size           = 128M
innodb_flush_log_at_trx_commit = 1  # 通常時:1(デフォルト), データインポート時:2 or 0
#skip_innodb_doublewrite  # ダブルライトバッファへの書き込みをスキップ(通常時は指定しない。データインポート時のみ)

# ==== Log
#general_log_file    = /var/log/mysql/mysql.log  # デバッグ時に有効化
#general_log         = 1                         # デバッグ時に有効化
#slow_query_log_file = /var/log/mysql/slow.log   # デバッグ時に有効化
#slow_query_log      = 1                         # デバッグ時に有効化

[mysql]
no-auto-rehash

[mysqlhotcopy]
interactive-timeout
{% endhighlight %}

かつての `thread_concurrency`, `innodb_additional_mem_pool_size` は不要。

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

### 6. MariaDB サーバ再起動

設定ファイルを編集したので MariaDB を再起動する必要があるが、今回は ibdata1 の設定も変更しているので一旦 MariaDB サーバを停止して ibdata1, ib_logfile0, ib_logfile1 ファイルを削除し、その後 MariaDB を起動する。  
（既にデータベースを作成している場合は、サーバ停止前にデータエクスポートし、サーバ起動後にデータをインポートする作業も必要になる）

``` text
# /etc/init.d/mysql stop
Warning] option 'innodb-buffer-pool-size': signed value 384 adjusted to

# rm -f /var/lib/mysq/ib*

# /etc/init.d/mysql start
Starting MariaDB database server: mysqld . . . . . . . . ..
Checking for corrupt, not cleanly closed and upgrade needing tables..
```

MySQL から移行したのであればメッセージに従い `mysql_upgrade -u root -p` を実行すればよい。  
しかし、そうでなくてもこの "Checking for ..." のメッセージが出力されるが、バグらしいので無視してよい。

### 7. 動作確認

MySQL サーバにログインして、データベースやテーブルの作成、権限の設定、その他各種操作をしてみる。

### 8. サービスの自動起動設定

インストール直後はマシン起動時に自動で MariaDB サーバが起動するようになっている。  
自動起動しないようにしたければ以下のようにする。（`sysv-rc-conf` コマンド導入済みの場合）

``` text
# sysv-rc-conf --list | grep mysql
mysql        0:off      1:off   2:on    3:on    4:on    5:on    6:off

# sysv-rc-conf mysql off

# sysv-rc-conf --list | grep mysql
mysql        0:off      1:off   2:off   3:off   4:off   5:off   6:off
```

`sysv-rc-conf` コマンド未導入なら、 `insserv` コマンドで設定可能。  
（`insserv -s` コマンドではサービスの状況を確認できないので、 `ls` コマンドで init プロセスファイルの有無を確認）

``` text
# ls -l /etc/rc*.d/*mysql
lrwxrwxrwx 1 root root 15  1月 15 15:11 /etc/rc0.d/K03mysql -> ../init.d/mysql
lrwxrwxrwx 1 root root 15  1月 15 15:11 /etc/rc1.d/K03mysql -> ../init.d/mysql
lrwxrwxrwx 1 root root 15  1月 15 15:11 /etc/rc2.d/S03mysql -> ../init.d/mysql
lrwxrwxrwx 1 root root 15  1月 15 15:11 /etc/rc3.d/S03mysql -> ../init.d/mysql
lrwxrwxrwx 1 root root 15  1月 15 15:11 /etc/rc4.d/S03mysql -> ../init.d/mysql
lrwxrwxrwx 1 root root 15  1月 15 15:11 /etc/rc5.d/S03mysql -> ../init.d/mysql
lrwxrwxrwx 1 root root 15  1月 15 15:11 /etc/rc6.d/K03mysql -> ../init.d/mysql

# insserv -r mysql

# ls -l /etc/rc*.d/*mysql
ls: /etc/rc*.d/*mysql にアクセスできません: そのようなファイルやディレクトリはありません
```

### 9. ポート開放

リモートで MariaDB サーバにアクセスする場合（GUI ツールを使用する場合等）は、TCP ポート 3306（デフォルトの場合）を開放する必要がある。

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

### 10. 参考サイト

* [MariaDB Knowledgebase](https://mariadb.com/kb/en/ "MariaDB Knowledgebase")

---

以上。

