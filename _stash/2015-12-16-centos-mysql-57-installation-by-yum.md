---
layout   : single
title    : "CentOS 7.1 - DB サーバ MySQL 5.7 構築（公式リポジトリ使用）！"
published: true
date     : 2015-12-16 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- MySQL
---

MySQL 5.7 系の最新版を公式リポジトリを使用して CentOS 7.1 にインストールする方法についてです。

<!--more-->

### 0. 前提条件

* CentOS 7.1-1503(x86_64) での作業を想定。（CentOS 6 系、5系でも同様（起動方法、自動起動設定、ファイアウォール設定以外は））
* 当記事執筆時点で最新の MySQL 5.7.9 をインストールする。
* 環境の相違によっては以下のとおりにならないかもしれないので、適宜対応する。

### 1. Yum リポジトリの追加

``` text
# rpm -Uvh http://dev.mysql.com/get/mysql57-community-release-el7-7.noarch.rpm
```

### 2. リポジトリ有効・無効の設定

まず、どんな種類があるのかを確認してみる。

``` text
# yum repolist all | grep mysql
mysql-connectors-community/x86_64 MySQL Connectors Community     有効:      13+4
mysql-connectors-community-source MySQL Connectors Community - S 無効
mysql-tools-community/x86_64      MySQL Tools Community          有効:        27
mysql-tools-community-source      MySQL Tools Community - Source 無効
mysql55-community/x86_64          MySQL 5.5 Community Server     無効
mysql55-community-source          MySQL 5.5 Community Server - S 無効
mysql56-community/x86_64          MySQL 5.6 Community Server     無効
mysql56-community-source          MySQL 5.6 Community Server - S 無効
mysql57-community/x86_64          MySQL 5.7 Community Server     有効:        20
mysql57-community-source          MySQL 5.7 Community Server - S 無効
```

今回は MySQL 5.7 Community Server を使用したいので、`mysql57-community/x86_64` が `有効` であることを確認する。

`無効` の場合は、 "/etc/yum.repos.d/mysql-community.repo" 内 `[mysql57-community]` の `enabled` の値を `0` から `1` に変更する。  
さらに、今回使用したいバージョン以外の MySQL Community Server が `有効` になっていれば、無効（`enabled=0`）に変更しておく。

File: `/etc/yum.repos.d/mysql-community.repo`

{% highlight text linenos %}
[mysql57-community]
name=MySQL 5.7 Community Server
baseurl=http://repo.mysql.com/yum/mysql-5.7-community/el/7/$basearch/
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
{% endhighlight %}

そして、有効になったか確認してみる。

``` text
# yum repolist enabled | grep mysql
mysql-connectors-community/x86_64 MySQL Connectors Community                13+4
mysql-tools-community/x86_64      MySQL Tools Community                       27
mysql57-community/x86_64          MySQL 5.7 Community Server                  20
```

### 3. MySQL のインストール

``` text
# yum -y install mysql-community-server

# mysqld --version   # <= サーバのバージョン
mysqld  Ver 5.7.9 for Linux on x86_64 (MySQL Community Server (GPL))

# mysql --version    # <= クライアントのバージョン
mysql  Ver 14.14 Distrib 5.7.9, for Linux (x86_64) using  EditLine wrapper
```

### 4. MySQL サーバの起動

``` text
# systemctl start mysqld

# systemctl status mysqld
mysqld.service - MySQL Server
   Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled)
   Active: active (running) since 日 2015-11-08 23:03:02 JST; 8s ago
  Process: 1843 ExecStart=/usr/sbin/mysqld --daemonize $MYSQLD_OPTS (code=exited, status=0/SUCCESS)
  Process: 1772 ExecStartPre=/usr/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 1847 (mysqld)
   CGroup: /system.slice/mysqld.service
           └─1847 /usr/sbin/mysqld --daemonize

11月 08 23:02:53 vbox.mk-mode.com systemd[1]: Starting MySQL Server...
11月 08 23:03:02 vbox.mk-mode.com systemd[1]: Started MySQL Server.
Hint: Some lines were ellipsized, use -l to show in full.
```

### 5. MySQL 自動起動の設定

デフォルトでマシン起動時に MySQL サーバが自動で起動するようになっているが、なっていなければ以下のように設定する。

``` text
# systemctl enable mysqld

# systemctl list-unit-files -t service | grep mysqld
mysqld.service                            enabled  # <= enabled であることを確認
```

### 6. root 初期パスワードの確認

``` text
# grep 'temporary password' /var/log/mysqld.log
2015-11-08T14:02:55.559389Z 1 [Note] A temporary password is generated for root@localhost: &d-sa*dv/7Ct
```

### 7. MySQL の安全化

root パスワードの設定等を行う。（説明は後述）

``` text
# mysql_secure_installation

Securing the MySQL server deployment.

Enter password for user root:

The existing password for the user account root has expired. Please set a new password.

New password:

Re-enter new password:
The 'validate_password' plugin is installed on the server.
The subsequent steps will run with the existing configuration
of the plugin.
Using existing password for root.

Estimated strength of the password: 100
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
3. `Re-enter new password:` で root の新しいパスワードの確認入力をする。
4. `Estimated strength of the password: 100 ...` でより強固なパスワードに変更するか問われるが、 `n` で応答する。（当然 `y` でもよい）
5. `Remove anonymous users?` で匿名ユーザを削除するために `y` で応答する。
6. `Disallow root login remotely?` で root のリモート接続を拒否するか問われるが、リモート接続したいので `n` で応答する。（当然 `y` でもよい）
7. `Remove test database and access to it?` でテストデータベースを削除するか問われるので、 `y` で応答する。
8. `Reload privilege tables now?` で権限テーブルを即時リロードするか問われるので、 `y` で応答する。

### 8. ファイアウォール設定

ポート TCP:3306 を開放する。（ローカルネット内の別マシンからのアクセスが必要な場合）

``` text
# firewall-cmd --add-port=3306/tcp
success
# firewall-cmd --list-ports
110/tcp 465/tcp 3306/tcp 4000-4005/tcp
```

### 9. 動作確認

MariaDB サーバにログインしてみる。

``` text
# mysql -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 10
Server version: 5.7.9 MySQL Community Server (GPL)

Copyright (c) 2000, 2015, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

### 10. その他

* 設定ファイルは "/etc/my.cnf" なので、実際に運用する際には綿密に検討して設定する。
* パスワードの有効期限がデフォルトでは「360 日」に設定されている。  
  必要なら、システム変数 `default_password_lifetime` を編集する。

### 参考サイト

* [MySQL :: A Quick Guide to Using the MySQL Yum Repository](http://dev.mysql.com/doc/mysql-yum-repo-quick-guide/en/ "MySQL :: A Quick Guide to Using the MySQL Yum Repository")
* [MySQL :: MySQL 5.7 Reference Manual :: 5.1.4 Server System Variables](http://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html "MySQL :: MySQL 5.7 Reference Manual :: 5.1.4 Server System Variables")

---

以上。

