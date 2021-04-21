---
layout   : single
title    : "MySQL - コマンドラインでパスワード指定した場合の警告出力を抑止！"
published: true
date     : 2016-02-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- MySQL
---

最近の MySQL (5.6, 5.7)では、コマンドラインからの実行時にパスワードを指定すると、以下のような警告メッセージが出力されます。  
cron で実行した場合は、この警告メッセージがメール送信されてしまったります。

``` text
mysql: [Warning] Using a password on the command line interface can be insecure.
```

コマンドラインでパスワードを使用するのは安全でない、という旨のメッセージですが、今回はこの警告メッセージの出力を抑止する方法について記録しておきます。

<!--more-->

### 0. 前提条件

* MySQL 5.6.28, 5.7.10 サーバ・クライアントで動作確認。
* 以下ではリモートで接続することを考慮している。（`-h host_name` オプションを使用）

### 1. 事前情報

パスワードを指定して実行したい場合、通常は以下のようにするだろう。

``` bash
$ mysql -h host_name -u user_name -ppassword db_shceme -e "SELECT * FROM table_name"
```

### 2. 方法・その１

環境変数を使用する方法。

``` bash
$ MYSQL_PWD=password mysql -h host_name -u user_name db_shceme -e "SELECT * FROM table_name"
```

ただし、この方法は安全性に問題があるので非推奨。（安全であることが確実な（スタンドアロン等の）環境なら、この方法が簡単でよいだろう）

### 3. 方法・その２

設定ファイルを使用する方法。

まず、以下のような設定ファイルを新規作成する。（安全性を考慮して、ファイル名先頭に `.` を付与）  
（接続ユーザが一人だけなら、わざわざ新規作成せずに既存の "/etc/my.cnf" に記述してもよいだろう）

File: `/etc/.my_hoge.conf`

{% highlight bash linenos %}
[client]
user     = user_name
password = password
hostname = host_name
{% endhighlight %}

次に、所有者以外がこの設定ファイルを読み書きできないよう権限設定を行う。

``` text
$ sudo chmod 600 /etc/.my_hoge.conf
```

そして、この設定ファイルを指定してコマンドラインから実行する。（ユーザ名・パスワード・ホスト名は指定しない）

``` bash
$ mysql --defaults-extra-file=/etc/.my_hoge.conf db_scheme -e "SELECT * FROM table_name"
```

警告メセージは出力されないはず。そして、方法・その１よりは安全だろう。  
また、上記ではユーザ名・パスワード・ホスト名を設定ファイルに記述したが、パスワードのみを記述してコマンドラインでユーザ名・ホスト名を指定してもよい。

---

これで、警告メッセージが出力されなくなりスッキリしました。（見た目にも、自身の気持ち的にも）

以上。

