---
layout   : single
title    : "MySQL 5.6 - APT リポジトリからインストール(on Linux Mint 17.1)！"
published: true
date     : 2015-01-10 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
- LinuxMint
---

こんにちは。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* 古いバージョンの MySQL サーバ・クライアントはアンインストール済み。（パッケージインストール分、ソースビルドインストール分）
* Linux Mint は Ubuntu ベースの Linux ディストリビューションなので、 Ubuntu 用リポジトリを使用する。（どの Ubuntu バージョンがどの Linux Mint バージョンと対応するのか注意して）

### 1. APT リポジトリ追加用パッケージのダウンロード

Linux Mint 17.1 なので Ubuntu 14.04 用パッケージをダウンロード。  
（"[MySQL :: Download MySQL APT Repository](http://dev.mysql.com/downloads/repo/apt/ "MySQL :: Download MySQL APT Repository")" からリンクをたどってダウンロードしてもよい）

``` text
$ wget http://dev.mysql.com/get/mysql-apt-config_0.3.2-1ubuntu14.04_all.deb
```

### 2. APT リポジトリ追加用パッケージのインストール

``` text
$ sudo dpkg -i mysql-apt-config_0.3.2-1ubuntu14.04_all.deb
```

### 3. APT リストの更新

``` text
$ sudo apt-get update
```

### 4. MySQL サーバのインストール

MySQL サーバを以下のようにしてインストールする。

``` text
$ sudo apt-get install mysql-server
```

以下のように、 "Server" - "mysql-5.6" と選択後に "Apply" で保存する。

![MYSQL_APT_1]({{site.baseurl}}/images/2015/01/10/MYSQL_APT_1.png "MYSQL_APT_1")
![MYSQL_APT_2]({{site.baseurl}}/images/2015/01/10/MYSQL_APT_2.png "MYSQL_APT_2")
![MYSQL_APT_3]({{site.baseurl}}/images/2015/01/10/MYSQL_APT_3.png "MYSQL_APT_3")
![MYSQL_APT_4]({{site.baseurl}}/images/2015/01/10/MYSQL_APT_4.png "MYSQL_APT_4")
![MYSQL_APT_5]({{site.baseurl}}/images/2015/01/10/MYSQL_APT_5.png "MYSQL_APT_5")
![MYSQL_APT_6]({{site.baseurl}}/images/2015/01/10/MYSQL_APT_6.png "MYSQL_APT_6")

次に、 root ユーザのパスワードを入力＆確認入力を行う。

![MYSQL_APT_7]({{site.baseurl}}/images/2015/01/10/MYSQL_APT_7.png "MYSQL_APT_7")
![MYSQL_APT_8]({{site.baseurl}}/images/2015/01/10/MYSQL_APT_8.png "MYSQL_APT_8")

最後に、 test データベースをインストールする否か問われるので、選択する。（運用環境の場合はインストールしない方がよい）

![MYSQL_APT_9]({{site.baseurl}}/images/2015/01/10/MYSQL_APT_9.png "MYSQL_APT_9")

もしも "my.cnf" が既に存在する場合は、既存の "my.cnf" を残すか書き換えるか等の問い合わせをされるので、適宜対処する。

### 5. MySQL クライアントのインストール

MySQL クライアントも同様にインストールする。（必要に応じて）

``` text
$ sudo apt-get install mysql-client
```

### 6. インストールの確認

MySQL サーバ、クライアントがインストールできているかバージョンを表示させて確認してみる。

``` text
$ mysql --version
mysql  Ver 14.14 Distrib 5.6.22, for Linux (x86_64) using  EditLine wrapper

$ mysqld --version
mysqld  Ver 5.6.22 for Linux on x86_64 (MySQL Community Server (GPL))
```

### 7. MySQL サーバの起動・停止等

``` text
$ sudo service mysql status        # <= 状態確認
$ sudo service mysql stop          # <= サーバ停止
$ sudo service mysql start         # <= サーバ起動
$ sudo service mysql restart       # <= サーバ再起動
$ sudo service mysql reload        # <= サーバ再起動と同じ
$ sudo service mysql force-reload  # <= サーバ再起動と同じ
```

起動スクリプト "/etc/init.d/mysql" を見る限り、今は `reload` も `force-reload` も `restart` と同じ動きをするようになっていた。（以前は、`reload` が「設定の再読み込み」で、 `force-reload` が「設定の強制再読み込み」だったかと）

### 8. my.cnf のチューニング

必要なら、設定ファイル "my.cnf" を編集してチューニングする。（運用しながらチューニングしてもよい）  
当方は、以前から使用している設定ファイルを流用している。

また、"my.cnf" の配置場所は複数あるので、読み込み順に注意すること！（存在するものを順に「全て」読み込み、後で読み込んだ設定で上書きされる）  
自分がどのディレクトリにある "my.cnf" を使用したいか明確に意識してないと、予期せぬ不都合に見舞われることになる。  
ちなみに読み込み順は以下ようにして確認可。（環境により出力内容は異なる）

``` text
$ mysql --help | grep -A1 "Default options"
Default options are read from the following files in the given order:
/etc/my.cnf /etc/mysql/my.cnf ~/.my.cnf
```

### 9. MySQL サーバへのログイン

MySQL クライアントで MySQL サーバへ "root" でログインしてみる。（出力内容は、環境により異なる）

``` text
$ mysql -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 1
Server version: 5.6.22-log MySQL Community Server (GPL)

Copyright (c) 2000, 2014, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> STATUS
--------------
mysql  Ver 14.14 Distrib 5.6.22, for Linux (x86_64) using  EditLine wrapper

Connection id:          1
Current database:
Current user:           root@localhost
SSL:                    Not in use
Current pager:          less
Using outfile:          ''
Using delimiter:        ;
Server version:         5.6.22-log MySQL Community Server (GPL)
Protocol version:       10
Connection:             Localhost via UNIX socket
Server characterset:    utf8mb4
Db     characterset:    utf8mb4
Client characterset:    utf8mb4
Conn.  characterset:    utf8mb4
UNIX socket:            /var/run/mysqld/mysqld.sock
Uptime:                 1 min 2 sec

Threads: 1  Questions: 5  Slow queries: 0  Opens: 70  Flush tables: 1  Open tables: 63  Queries per second avg: 0.080
--------------

mysql>
```

### 10. 各種動作確認

各種コマンドが使用可能か確認する。

### 11. サービス自動起動の設定

インストール直後はマシン起動時に自動で起動するよう設定されている。

自動起動しないよう設定するには、「システム管理」-「サービスの管理」で "mysql" に付いているチェックを外せばよい。

もしくは、 `sysv-rc-conf` コマンドで以下のようにする。（インストールは `sudo apt-get install sysv-rc-conf` 等で）  
（2, 3, 4, 5 が `on` になっていると自動起動する設定、 `off` になっていると自動起動しない設定）

``` text
$ sysv-rc-conf --list | grep mysql
mysql        0:off      1:off   2:on    3:on    4:on    5:on    6:off

$ sudo sysv-rc-conf mysql off

$ sysv-rc-conf --list | grep mysql
mysql        0:off      1:off   2:off   3:off   4:off   5:off   6:off
```

### 12. 参考サイト

* [MySQL :: A Quick Guide to Using the MySQL APT Repository](http://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/ "MySQL :: A Quick Guide to Using the MySQL APT Repository")

---

当方、ソースをビルドしてインストールする方法を採用することが多いですが、有事に備えて APT リポジトリを使用したインストール方法も記録しておいた次第です。

以上。

