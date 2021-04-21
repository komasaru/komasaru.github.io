---
layout   : single
title    : "MariaDB(MySQL) - ログローテート時のエラー！"
published: true
date     : 2015-04-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
- Linux
---
こんにちは。

Linux サーバでのログローテート時に MariaDB(MySQL) ログ部分でエラーが発生することがあります。

以下、当方が以前体験した事案についての現象・原因・対策の記録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 7.8(64bit) を想定。
* MariaDB 10.0.15 を想定。
* 環境等により設定ファイルの配置場所等が以下の記事内容と若干異なるかもしれないので注意すること。

### 1. 現象

ログローテート時に以下のようなエラーが発生する。

``` text
/etc/cron.daily/logrotate:
/usr/bin/mysqladmin: flush failed; error: 'Unknown error'
error: error running shared postrotate script for '/var/log/mysql.log /var/log/mysql/mysql.log /var/log/mysql/mysql-slow.log '
run-parts: /etc/cron.daily/logrotate exited with return code 1
```

### 2. 原因

`mysqladmin` にパスワードが未設定であることにより "/etc/logrotate.d/mysql-server" 内でエラーが発生するため。

また、このとき `mysqladmin ping` 等のコマンドも効かないはず。

``` text
# mysqladmin ping
mysqladmin: connect to server at 'localhost' failed
error: 'Access denied for user 'root'@'localhost' (using password: NO)'
```

「"/etc/mysql/debian.cnf" に記述してあるパスワードと debian-sys-maint ユーザの `old_password` とのパスワードが不一致であるため」のような記載をしている Web サイトをいくつか見かけたが、これは根本的に誤っているかと。

### 3. 対策

root にパスワードを設定した場合は `mysqladmin` に明示的に root パスワードを設定する必要がある。

そのために、"/root/.my.cnf" で `mysqladmin` のパスワード設定を行う。（既存の "my.cnf" ではダメ）

File: `/root/.my.cnf`

{% highlight text linenos %}
[mysqladmin]
password = XXXXXXXX  # <= root のパスワード
user = root
{% endhighlight %}

そして、権限設定。

``` text
# chmod 600 /root/.my.cnf
```

また、ローテート対象のログファイルの所有者が "/etc/logrotate.d/mysql-server" で指定されているものと異なる場合は、合わせておく。例えば以下のように。

``` text
# chown -R mysql:adm /var/log/mysql/
```

### 4. 動作確認

これで `mysqladmin` コマンドも正常に機能するはず。

``` text
# mysqladmin ping

mysqld is alive
```

また、ログローテートでエラーが発生しなくなることも確認する。

``` text
# logrotate -dv /etc/logrotate.d/mysql-server
reading config file /etc/logrotate.d/mysql-server

Handling 1 logs

rotating pattern: /var/log/mysql.log /var/log/mysql/mysql.log /var/log/mysql/mysql-slow.log  after 1 days (7 rotations)
empty log files are rotated, old logs are removed
considering log /var/log/mysql.log
  log does not need rotating
considering log /var/log/mysql/mysql.log
  log /var/log/mysql/mysql.log does not exist -- skipping
considering log /var/log/mysql/mysql-slow.log
  log /var/log/mysql/mysql-slow.log does not exist -- skipping
not running postrotate script, since no logs were rotated
```

（`-d` はデバッグモード `-v` は詳細表示のプション）

---

以上。

