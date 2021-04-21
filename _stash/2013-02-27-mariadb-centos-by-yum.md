---
layout   : single
title    : "MariaDB - CentOS にインストール（yum 使用）！"
published: true
date     : 2013-02-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
- CentOS
---

MySQL から派生したオープンソースな RDBMS（リレーショナルDB管理システム）の [MariaDB](https://mariadb.org/en/ "MariaDB") を CentOS にインストールしてみました。  

インストール方法は色々ありますが、今回は yum を使用する方法でインストールしてみました。

<!--more-->

### 0. 前提条件

- CentOS 6.3 (32bit) での作業を想定。（Redhat 系は同じ）  
- インストールする MariaDB は開発版（10.0 系）ではなく安定版（5.5 系）とする。
- MySQL はインストールされていない（綺麗にアンインストール済みである）。（MariaDB と衝突するので）  
- 作業は `root` ユーザで行った。

### 1. リポジトリ追加設定

リポジトリ追加設定を行う。  
リポジトリ設定ファイル（ファイル名は `/etc/yum.repos.d/MariaDB.repo` とした）を以下の内容で作成する。  
（内容は自分の環境に合わせる - [こちら](http://yum.mariadb.org/) を参考に）
以下の `enabled=0` は、普段はリポジトリを無効にする設定。（インストール時にリポジトリを指定するために）

File: `/etc/yum.repos.d/MariaDB.repo`

{% highlight bash linenos %}
[mariadb]
name = MariaDB
baseurl = http://yum.mariadb.org/5.5.29/centos6-x86
gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB
gpgcheck=1
enabled=0
{% endhighlight %}

### 2. MariaDB インストール

MariaDB(Server, Client) を `yum` コマンドでインストールする。  
`--enablerepo=mariadb` は、リポジトリ設定ファイルで `enabled=0` としているため。

``` bash 
# yum --enablerepo=mariadb -y install MariaDB-server MariaDB-client
```

MySQL をインストールしたことがある場合は、不要なパッケージが残っていてインストールに失敗するかもしれない。  
その場合は、不要なパッケージを削除すること。

### 3. サービスの開始・停止

サービスの開始・停止等は以下のコマンドで行う。（MySQL と全く同じ）

``` bash 
$ sudo /etc/init.d/mysql start|stop|restart|reload|force-reload|status

もしくは

$ sudo service mysql start|stop|restart|reload|force-reload|status
```

### 4. 動作確認

サービス起動後、ログインして動作を確認してみる。  
中身が MariaDB でもコマンドは MySQL と同じ。  
また、インストール直後は `root` のパスワードも設定されていない。

``` bash 
# mysql -u root
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 1
Server version: 5.5.29-MariaDB MariaDB Server

Copyright (c) 2000, 2012, Oracle, Monty Program Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> 
```

MariaDB がインストールされていることが確認できる。

### 5. root パスワード設定

取り急ぎ、`root` ユーザのパスワードを設定しておく。

``` bash 
MariaDB [(none)]> SET PASSWORD FOR root@localhost=PASSWORD('new_password');
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> 
```

以下のコマンドを使用してもよい。

``` bash 
# mysql_secure_installation
```

### 6. 再度ログイン確認

再度 `root` ユーザのパスワードを入力してログインしてみる。

``` bash 
# mysql -u root -p
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 2
Server version: 5.5.29-MariaDB MariaDB Server

Copyright (c) 2000, 2012, Oracle, Monty Program Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> 
```

### 7. サービス自動起動設定

インストール直後はサービスが自動で起動するようになってる。  
自動起動させたくなければ以下のようにする。

``` bash 
# chkconfig mysql off
# chkconfig --list mysql
mysql           0:off   1:off   2:off   3:off   4:off   5:off   6:off
```

### 8. アップグレード

サービススタート時に以下のようなメッセージが表示される場合は、テーブルのアップデートが必要。  
（元々 MySQL を使用していて、そのデータベースをそのまま使用する場合に発生する）

``` bash 
 * Checking for corrupt, not cleanly closed and upgrade needing tables.
```

以下のようにしてテーブルをアップデートする。

``` bash 
$ sudo mysql_upgrade -u root -p
```

但し、これでも先のメッセージは表示されるが、問題は無いようだ。

### 9. その他

MariaDB で追加された機能（追加されたストレージエンジン等）以外は、基本的には MySQL と同じだと思っていよい。  
後は、MySQL 同様に作業すればよい。  

### 10. 参考サイト

- [Welcome to MariaDB! - MariaDB](https://mariadb.org/en/ "Welcome to MariaDB! - MariaDB")
- [Installing MariaDB with yum - AskMonty KnowledgeBase](https://kb.askmonty.org/en/installing-mariadb-with-yum/ "Installing MariaDB with yum - AskMonty KnowledgeBase")

---

これで、CentOS でも MariaDB が使用できるようになります。

ただ、今のところ当方の CentOS サーバは MySQL のまま。  
（上記の作業は仮想マシン上に構築している CentOS での作業でした）  
次に、サーバを再構築際に MariaDB にするつもりです。（サーバが安定に稼働しているので、次にサーバを再構築するのがいつになるかは全く不明だが）

以上。

