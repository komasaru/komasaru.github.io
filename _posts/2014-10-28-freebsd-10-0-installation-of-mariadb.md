---
layout   : single
title    : "FreeBSD 10.0 - DB サーバ MariaDB インストール！"
published: true
date     : 2014-10-28 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- MariaDB
---

「FreeBSD 10.0 - DB サーバ MariaDB インストール」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* サーバマシンのメモリ容量は 1GB を想定。
* データディレクトリは "/home/mariadb" とする。
* MariaDB とは言っても内部では随所に MySQL の単語は出現することを意識しておく。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. pkgtools.conf編集

`make` 実行時に常時設定するパラメータを設定しておく。

File: `/usr/local/etc/pkgtools.conf`

{% highlight bash linenos %}
  MAKE_ARGS = {
    'databases/mariadb55-server' => 'WITH_CHARSET=utf8',  # <= 追加
  }
{% endhighlight %}

### 2. MariaDB 5インストール

``` text
# cd /usr/ports/databases/mariadb55-server
# make BATCH=yes WITH_CHARSET=utf8 install clean
# rehash
```

### 3. DBI インストール

``` text
# cd /usr/ports/databases/p5-DBI
# make BATCH=yes install clean
```

### 4. DBD インストール

``` text
# cd /usr/ports/databases/p5-DBD-mysql
# make BATCH=yes install clean
# cd
```

### 5. 自動起動設定

File: `/etc/rc.conf`

{% highlight bash linenos %}
mysql_enable="YES"           # <= 追加
mysql_dbdir="/home/mariadb"  # <= 追加
{% endhighlight %}

### 6. MariaDB 設定ファイル編集

用意されているサンプル設定ファイル（メモリ512MB用）を複製。

``` text
# cp /usr/local/share/mysql/my-large.cnf /usr/local/etc/my.cnf
# chmod 640 /usr/local/etc/my.cnf
```

そして、編集。（以下は最低限の編集。InnoDB を使用するなら、コメント解除するなり運用に合わせて適宜編集すること）

File: `/usr/local/etc/my.cnf`

{% highlight bash linenos %}
[mysqld]
datadir = /home/mariadb
skip-character-set-client-handshake  # <= 追加（クライアントの文字コードに依存しない）
character-set-server = utf8          # <= 追加（デフォルト文字コードを UTF-8 とする）
{% endhighlight %}

### 7. データディレクトリ作成

データディレクトリをデフォルト以外に変更する場合。

``` text
# mkdir /home/mariadb
# chown -R mysql:mysql /home/mariadb
```

### 8. MariaDB 起動

``` text
# /usr/local/etc/rc.d/mysql-server start
Starting mysql.
```

### 9. データベース設定

root パスワードの作成、不要 DB の削除、DB 新規作成、ユーザ新規作成等を行う。

``` text
# mysql -u root
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 1
Server version: 5.5.39-MariaDB FreeBSD Ports

Copyright (c) 2000, 2014, Oracle, Monty Program Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> SET PASSWORD FOR root@localhost=password('root_password');  # <= MariaDB の root パスワードを設定
Query OK, 0 rows affected (0.01 sec)

MariaDB [(none)]> SELECT user,host FROM mysql.user;      # <= 登録済ユーザ一覧を確認
+------+------------------+
| user | host             |
+------+------------------+
| root | 127.0.0.1        |
| root | ::1              |
|      | localhost        |
| root | localhost        |
|      | vbox.mk-mode.com |
| root | vbox.mk-mode.com |
+------+------------------+
6 rows in set (0.00 sec)

MariaDB [(none)]> DELETE FROM mysql.user WHERE user='';  # <= 空ユーザを削除
Query OK, 2 rows affected (0.00 sec)

MariaDB [(none)]> SHOW DATABASES;                        # <= データベース一覧を確認
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| test               |
+--------------------+
4 rows in set (0.00 sec)

MariaDB [(none)]> DROP DATABASE test;                    # <= データベース test を削除
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> CREATE DATABASE hoge;                  # <= データベース hoge を作成
Query OK, 1 row affected (0.02 sec)

MariaDB [(none)]> GRANT ALL PRIVILEGES ON hoge.* TO masaru@localhost IDENTIFIED BY 'user_password';  # <= ユーザ masaru を作成
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> EXIT
Bye
```

### 10. MariaDB 動作確認

MariaDB のバージョンを確認。

``` text
# mysql --version
mysql  Ver 15.1 Distrib 5.5.39-MariaDB, for FreeBSD10.0 (amd64) using readline 5.1
```

MariaDB に root でログイン。

``` text
# mysql -u root -p
Enter password:        # <= root パスワードを入力
```

その他、DB・テーブル・ユーザ の追加・削除・表示等行ってみる。

---

以上。

