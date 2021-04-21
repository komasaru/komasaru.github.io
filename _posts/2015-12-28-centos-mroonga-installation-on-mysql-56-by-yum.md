---
layout   : single
title    : "CentOS 6.7 - 全文検索ストレージエンジン Mroonga 導入（公式リポジトリ使用）！"
published: true
date     : 2015-12-28 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- MySQL
- Groonga
- Mroonga
---

Mroonga は、全文検索エンジン Groonga をベースとした MySQL のストレージエンジンです。

インストール済みの MySQL（5.6 系）に Mroonga ストレージエンジンを追加する方法についての記録です。

<!--more-->

### 0. 前提条件

* CentOS 6.7(i386) を Minimal で最小インストールしている。
* クライントマシンは Linux Mint 17.2(64bit) を想定。
* MySQL 5.6.27 での作業を想定。（5.5 系や 5.7 系では多少手順が異なるので注意）
* 当記事執筆時点で最新版の Mroonga 5.0.9 をインストールする。
* MySQL データディレクトリ作成先は "/var/lib/mysql" を想定。

### 1. Yum リポジトリの追加

``` text
# rpm -Uvh http://packages.groonga.org/centos/groonga-release-1.1.0-1.noarch.rpm
```

### 2. Yum リポジトリ設定ファイルの編集

今回のインストール先の OS は i386（32bit 版）である。  
しかし、サーバ用途には 64bit 用パッケージを使用するよう推奨されているので、リポジトリ設定ファイルを以下のように編集する。

File: `/etc/yum.repos.d/groonga.repo`

{% highlight bash linenos %}
[groonga]
name=Groonga for CentOS $releasever - $basearch
#baseurl=http://packages.groonga.org/centos/$releasever/$basearch/  # <= コメント化
baseurl=http://packages.groonga.org/centos/$releasever/x86_64/      # <= 64bit 用パッケージを指定
gpgcheck=1
enabled=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-groonga
{% endhighlight %}

### 3. Mroonga のインストール

``` text
# yum -y install mysql-community-mroonga
```

途中でパスワードを問われるので MySQL サーバの root パスワードで応答する。  

### 4. トークナイザー MeCab のインストール

トークナイザーとして MeCab を使用したい場合は、以下のようにしてインストールする。

``` text
# yum -y install groonga-tokenizer-mecab
```

### 5. 動作確認

MySQL サーバにログインしてみる。

``` text
# mysql -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 96
Server version: 5.6.27 MySQL Community Server (GPL)

Copyright (c) 2000, 2015, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> SHOW ENGINES;
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                        | Transactions | XA   | Savepoints |
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
| MyISAM             | YES     | MyISAM storage engine                                          | NO           | NO   | NO         |
| MRG_MYISAM         | YES     | Collection of identical MyISAM tables                          | NO           | NO   | NO         |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables      | NO           | NO   | NO         |
| BLACKHOLE          | YES     | /dev/null storage engine (anything you write to it disappears) | NO           | NO   | NO         |
| CSV                | YES     | CSV storage engine                                             | NO           | NO   | NO         |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                             | NO           | NO   | NO         |
| Mroonga            | YES     | CJK-ready fulltext search, column store                        | NO           | NO   | NO         |
| FEDERATED          | NO      | Federated MySQL storage engine                                 | NULL         | NULL | NULL       |
| InnoDB             | DEFAULT | Supports transactions, row-level locking, and foreign keys     | YES          | YES  | YES        |
| ARCHIVE            | YES     | Archive storage engine                                         | NO           | NO   | NO         |
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
10 rows in set (0.00 sec)

```

ストレージエンジン `Mroonga` が有効になっているか（`Mroonga` 行が存在するか）確認する。

その他の Mroonga に関する動作確認は過去記事参照。

* [MariaDB 10.0.x - Mroonga プラグインの有効化！]({{site.baseurl}}/2015/08/21/mariadb-mroonga-installation/ "MariaDB 10.0.x - Mroonga プラグインの有効化！")

### 参考サイト

* [2.5. CentOS — Mroonga v5.09 documentation](http://mroonga.org/ja/docs/install/centos.html#centos-6-with-the-oracle-mysql-5-6-package "2.5. CentOS — Mroonga v5.09 documentation")

---

以上。

