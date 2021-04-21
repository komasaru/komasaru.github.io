---
layout   : single
title    : "CentOS 7.0 - DB サーバ MariaDB 構築！"
published: true
date     : 2014-08-29 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- MariaDB
---

「CentOS 7.0 - DB サーバ MariaDB 構築」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- デフォルト DB サーバが MariaDB になって最初の CentOS なので、今回はソースインストールではなく yum インストールする。  
  （ソースビルドでのインストールは後日。現時点で TokuDB ストレージエンジン部分のビルド不具合もあるので）
- サーバマシンのメモリ容量は 1GB を想定。
- データディレクトリ作成先は "/home/mariadb", ストレージエンジンは InnoDB とした。
- MariaDB とは言っても MySQL からフォークした DB であるので、随所で "MySQL", "mysql" の単語が出現することを認識しておく。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. MariaDB インストール

以下のようにしてインストールする。（依存パッケージもインストールされる）

``` text
# yum -y install mariadb-server
```

### 2. MariaDB 設定ファイル編集

最初から詳細に設定するのは大変なので、あらかじめ用意されている設定ファイル（"/usr/share/mysql" ディレクトリ内に "my-huge.cnf", "my-innodb-heavy-4G.cnf", "my-large.cnf", "my-medium.cnf", "my-small.cnf"）の中から自分の環境に近いものを複製する。  
（オリジナルの設定ファイルの中身は空だが、念の為退避しておいてもよい）

また、"/etc/my.cnf" から "/etc/my.cnf.d/" ディレクトリ内の設定ファイルが読み込まれる形となっている。（実質、ファイル名は何でもよい）

``` text
# mv /usr/share/mysql/my-huge.cnf /etc/my.cnf.d/server.cnf
```

そして、内容を編集する。（利用の仕方により異なるが、当方は以下のように設定した）

データ保存先を変更したいので、 "/etc/my.cnf" 内を以下のように編集。

File: `/etc/my.cnf`

{% highlight bash linenos %}
datadir=/home/mariadb  # <= 変更
{% endhighlight %}

MariaDB クライアント側の設定は、 "/etc/my.cnf.d/client.cnf" で編集。

File: `/etc/my.cnf.d/client.cnf`

{% highlight bash linenos %}
[client
default-character-set = utf8mb4  # <= 追加 (utf8 でなく4バイト文字（絵文字）も扱いたい場合)
{% endhighlight %}

MaraDB サーバ側の設定は、 "/etc/my.cnf.d/server.cnf" で編集。

File: `/etc/my.cnf.d/server.cnf`

{% highlight bash linenos %}
[mysqld]
thread_concurrency = 2               # 変更（CPU コア数 * 2）
character-set-server = utf8          # 追加
skip-character-set-client-handshake  # 追加
default-storage-engine  = innodb     # 追加

# Connection 部分
bind-address       = 127.0.0.1       # 追加
max_connections    = 256             # 追加
max_connect_errors = 100             # 追加
wait_timeout       = 1800            # 追加

# Binary Log 部分
binlog_format    = mixed             # コメント解除
expire_logs_days = 10                # 追加
max_binlog_size  = 100M              # 追加
log_bin_trust_function_creators = 1  # 追加

# InnoDB 部分（コメント解除＆追加＆変更）
innodb_data_home_dir = /home/mariadb
innodb_data_file_path = ibdata1:2000M;ibdata2:10M:autoextend
innodb_file_per_table
innodb_log_group_home_dir = /home/mariadb
innodb_buffer_pool_size = 384M
innodb_additional_mem_pool_size = 20M
innodb_log_file_size = 100M
innodb_flush_log_at_trx_commit = 1
innodb_lock_wait_timeout = 50
innodb_log_buffer_size = 8M          # 通常時:8データインポート時:32程度
innodb_flush_log_at_trx_commit  = 1  # 通常時:1(デフォルト), データインポート時:2 or 0
#skip_innodb_doublewrite             # 通常時は指定しない。データインポート時のみ
{% endhighlight %}

### 3. データディレクトリ作成

データディレクトリが無ければ作成し、所有者・グループを設定しておく。

``` text
# mkdir /home/mariadb
# chown -R mysql. /home/mariadb/
```

### 4. MariaDB 起動

``` text
# systemctl start mariadb
```

### 5. MariaDB 自動起動設定

``` text
# systemctl enable mariadb
ln -s '/usr/lib/systemd/system/mariadb.service' '/etc/systemd/system/multi-user.target.wants/mariadb.service'
# systemctl list-unit-files -t service | grep mariadb
mariadb.service                             enabled  # <= enabled であることを確認
```

### 6. MariaDB 初期設定

``` text
# mysql_secure_installation
/bin/mysql_secure_installation: 行 379: find_mysql_client: コマンドが見つかりません

NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
      SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!

In order to log into MariaDB to secure it, we'll need the current
password for the root user.  If you've just installed MariaDB, and
you haven't set the root password yet, the password will be blank,
so you should just press enter here.

Enter current password for root (enter for none):
OK, successfully used password, moving on...

Setting the root password ensures that nobody can log into the MariaDB
root user without the proper authorisation.

Set root password? [Y/n]                      # <= 空エンター
New password:                                 # <= mariadb の root パスワード
Re-enter new password:                        # <= 確認入力
Password updated successfully!
Reloading privilege tables..
 ... Success!

By default, a MariaDB installation has an anonymous user, allowing anyone
to log into MariaDB without having to have a user account created for
them.  This is intended only for testing, and to make the installation
go a bit smoother.  You should remove them before moving into a
production environment.

Remove anonymous users? [Y/n]                 # <= 空エンター
 ... Success!

Normally, root should only be allowed to connect from 'localhost'.  This
ensures that someone cannot guess at the root password from the network.

Disallow root login remotely? [Y/n]           # <= 空エンター
 ... Success!

By default, MariaDB comes with a database named 'test' that anyone can
access.  This is also intended only for testing, and should be removed
before moving into a production environment.

Remove test database and access to it? [Y/n]  # <= 空エンター
 - Dropping test database...
 ... Success!
 - Removing privileges on test database...
 ... Success!

Reloading the privilege tables will ensure that all changes made so far
will take effect immediately.

Reload privilege tables now? [Y/n]            # <= 空エンター
 ... Success!

Cleaning up...

All done!  If you've completed all of the above steps, your MariaDB
installation should now be secure.

Thanks for using MariaDB!
```

### 7. ファイアウォール設定

ポート TCP:3306 を開放する。（ローカルネット内の別マシンからのアクセスが必要な場合）

``` text
# firewall-cmd --add-port=3306/tcp
success
# firewall-cmd --add-port=873/tcp --permanent
success
# firewall-cmd --list-ports
110/tcp 465/tcp 873/tcp 3306/tcp 4000-4005/tcp
```

### 8. 動作確認

MariaDB サーバにログインしてみる。

``` text
# mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 10
Server version: 5.5.37-MariaDB-log MariaDB Server

Copyright (c) 2000, 2014, Oracle, Monty Program Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]>
```

その他、実際にデータベースを作成してみたりしてみる。（以下、一例）

``` sql
> create database masaru;
> show databases;
> use hoge;
> show tables;
> grant all privileges on masaru.* to fuga@localhost identified by 'xxxxxxxx';
> grant all privileges on masaru.* to root@'%' identified by 'yyyyyyyy';
> drop database hoge;
```

### 参考サイト

- [Welcome to MariaDB! - MariaDB](https://mariadb.org/ "Welcome to MariaDB! - MariaDB")

---

以上。

