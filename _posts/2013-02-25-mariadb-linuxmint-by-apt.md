---
layout   : single
title    : "MariaDB - Linux Mint にインストール（apt 使用）！"
published: true
date     : 2013-02-25 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
- LinuxMint
---

MySQL から派生したオープンソースな RDBMS（リレーショナルDB管理システム）の [MariaDB](https://mariadb.org/en/ "MariaDB") を Linux Mint にインストールしてみました。  
元々オープンソースだった MySQL も Sun や Oracle に次々と買収され、そう遠くない将来にはオープンではなくなりそう（クローズドになりそう）なので。

MySQL のオリジナルコードの作者らによる開発なので、今までの MySQL とほとんど変わらない操作ができるのも一つの魅力です。

インストール方法は色々ありますが、今回は apt(deb パッケージ) を使用する方法でインストールしてみました。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。（Ubuntu は全く同じ）  
  但し、Linux Mint (Ubuntu) のバージョンが異なると、コードネーム（以下の `quantal` の部分）が異なるので注意。  
  また、Debian も同様の設定になる。（`ubuntu` -> `debian`, `quantal` -> `wheezy` のようにして）
- インストールする MariaDB は開発版（10.0 系）ではなく安定版（5.5 系）とする。
- MySQL はインストールされていない（アンインストール済みである）。（MariaDB と衝突するので）  

### 1. リポジトリ追加設定

キー追加後、リポジトリ追加設定を行う。  
（[MariaDB - Setting up MariaDB Repositories - MariaDB](https://downloads.mariadb.org/mariadb/repositories/ "MariaDB - Setting up MariaDB Repositories - MariaDB") で環境にあったリポジトリの追加設定を確認できる。）

``` bash 
$ sudo apt-get install software-properties-common
$ sudo apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xcbcb082a1bb943db
$ sudo add-apt-repository 'deb http://ftp.yz.yamagata-u.ac.jp/pub/dbms/mariadb/repo/5.5/ubuntu quantal main'
```

上記の `add-apt-repository` の代わりに `/etc/apt/sources.list` の最終行に以下を追加してもよい。

File: `/etc/apt/sources.list`

{% highlight bash linenos %}
# MariaDB 5.5 repository list - created 2013-02-10 03:45 UTC
# http://mariadb.org/mariadb/repositories/
deb http://ftp.yz.yamagata-u.ac.jp/pub/dbms/mariadb/repo/5.5/ubuntu quantal main
deb-src http://ftp.yz.yamagata-u.ac.jp/pub/dbms/mariadb/repo/5.5/ubuntu quantal main
{% endhighlight %}

### 2. MariaDB インストール

リポジトリを追加したので、以下のように Apt パッケージリストをアップデートしてから MariaDB をインストールする。  
但し、MySQL のアンインストールが不確実だ（不要なパッケージが残っている）と MariaDB のインストールに失敗するかも知れない。  
（MariaDB インストール時に `apt-get autoremove` するよう忠告されたら、MariaDB インストール前に実施しておく）

``` bash 
$ sudo apt-get update
$ sudo apt-get install mariadb-server
```

途中で `root` パスワードを設定する。

### 3. インストール確認

インストール直後はサービスが開始されている。  
インストールできているかログインして確認してみる。  
中身が MariaDB でもコマンドは MySQL と同じ。

``` bash 
$ mysql -u root -p
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 34
Server version: 5.5.29-MariaDB-mariadb1~quantal-log mariadb.org binary distribution

Copyright (c) 2000, 2012, Oracle, Monty Program Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> 
```

MariaDB がインストールされていることが確認できる。

### 4. サービスの開始・停止

サービスの開始・停止等は以下のコマンドで行う。（MySQL と全く同じ）

``` bash 
$ sudo /etc/init.d/mysql start|stop|restart|reload|force-reload|status

もしくは

$ sudo service mysql start|stop|restart|reload|force-reload|status
```

### 5. サービス自動起動設定

インストール直後はサービスが自動で起動するようになってる。  
自動起動設定については、当方の過去記事を参照のこと。

- [Debian 系 Linux - サービス自動起動設定！ - mk-mode BLOG]({{site.baseurl}}/2013/01/12/debian-service-autostart/ "Debian 系 Linux - サービス自動起動設定！ - mk-mode BLOG")

### 6. アップグレード

サービススタート時に以下のようなメッセージが表示される場合は、テーブルのアップデートが必要。  
（元々 MySQL がインストール済みだった場合に発生する）

``` bash 
 * Checking for corrupt, not cleanly closed and upgrade needing tables.
```

以下のようにしてテーブルをアップデートする。

``` bash 
$ sudo mysql_upgrade -u root -p
```

但し、これでも先のメッセージは表示されるが、問題は無いようだ。

### 7. その他

MariaDB で追加された機能（追加されたストレージエンジン等）以外は、基本的には MySQL と同じだと思っていよい。  
後は、MySQL 同様に作業すればよい。  

### 8. 参考サイト

- [Welcome to MariaDB! - MariaDB](https://mariadb.org/en/ "Welcome to MariaDB! - MariaDB")
- [MariaDB - Setting up MariaDB Repositories - MariaDB](https://downloads.mariadb.org/mariadb/repositories/ "MariaDB - Setting up MariaDB Repositories - MariaDB")

---

phpMyAdmin や MySQL Workbench も MySQL と同様に使用可能です。

ある Linux ディストリビューションや大手サイトも MySQL から MariaDB へ移行するようですし、当方も今後は MariaDB をメインで使用して行こうかと感がえている次第です。

以上。

