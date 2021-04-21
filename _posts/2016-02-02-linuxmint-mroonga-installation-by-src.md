---
layout   : single
title    : "Linux Mint - Mroonga インストール（by ソースビルド）！"
published: true
date     : 2016-02-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- LinuxMint
- MySQL
- Mroonga
---

Linux Mint 上の MySQL 5.7 に全文検索エンジン Groonga の機能を実現するストレージエンジン Mroonga をソースをビルドしてインストールする方法についてです。

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* 当記事執筆時点で最新の Mroonga 5.10 をインストールする。
* Groonga 5.1.0 がインストール済みであることを想定。  
  （参照「[Linux Mint - Groonga インストール（by ソースビルド）！]({{site.baseurl}}/2015/08/09/linux-mint-groonga-installation-by-src/ "Linux Mint - Groonga インストール（by ソースビルド）！")」）  
  ※ソースビルでなく PPA リポジトリからインストールしてもよいだろう（参照「[2.4. Ubuntu — Groonga v5.1.0ドキュメント](http://groonga.org/ja/docs/install/ubuntu.html "2.4. Ubuntu — Groonga v5.1.0ドキュメント")」）
* MySQL 5.7.10 をソースをビルドしてインストールしていること。（Mroonga のビルドに MySQL のソースが必要なため）  
  （参照「[Linux Mint - MySQL 5.7 インストール（by ソースビルド）！]( "Linux Mint - MySQL 5.7 インストール（by ソースビルド）！")」）
* MySQL 5.7.10 は "/usr/local/mysql" ディレクトリにインストールされていることを想定。
* MySQL 5.7.10 のインストールに使用したソースは "~/mysql-5.7.10" ディレクトリに存在することを想定。
* 一般ユーザでの作業を想定。
* 環境の相違等のために以下の方法ではうまく行かないこともあるだろう。  
  ログを確認して適宜対処すること。

### 1. 必要ライブラリのインストール

必要なライブラリ groonga-normalizer-mysql をインストールする。

``` text
$ sudo apt-get -y install software-properties-common
$ sudo add-apt-repository -y universe
$ sudo add-apt-repository -y ppa:groonga/ppa
$ sudo apt-get update
$ sudo apt-get -y install groonga-normalizer-mysql
```

（groonga-normalizer-mysql を Apt インストールするなら Groonga 自体も Apt インストールしてもよかったかもしれないが、当方は既に Groonga をソースビルドでインストール済み）

### 2. ソースの取得

アーカイブファイルを取得、展開後、ディレクトリを移動しておく。（ダウンロード先は一般ユーザホームディレクトリとする）

``` text
$ cd ~/
$ wget http://packages.groonga.org/source/mroonga/mroonga-5.10.tar.gz
$ tar zxvf mroonga-5.10.tar.gz
$ cd mroonga-5.10
```

### 3. Makefile の生成

``` text
$ ./configure \
--with-mysql-source=/home/masaru/mysql-5.7.10 \
--with-mysql-build=/home/masaru/mysql-5.7.10 \
--with-mysql-config=/usr/local/mysql/bin/mysql_config
```

### 4. ビルド

``` text
$ make
```

### 5. インストール

``` text
$ sudo make install
```

### 6. MySQL への Mroonga プラグインの適用

MySQL サーバが起動していることを確認してから以下を実行する。

``` text
$ mysql -u root -p < /usr/local/share/mroonga/install.sql
```

`... does not exist` のメッセージが出力されるかもしれないが問題ない。（おそらく）

### 7. Mroonga 導入の確認

MySQL サーバに root でログインして確認してみる。

``` text
mysql> SHOW ENGINES;
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                        | Transactions | XA   | Savepoints |
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
| MyISAM             | YES     | MyISAM storage engine                                          | NO           | NO   | NO         |
| MRG_MYISAM         | YES     | Collection of identical MyISAM tables                          | NO           | NO   | NO         |
| InnoDB             | DEFAULT | Supports transactions, row-level locking, and foreign keys     | YES          | YES  | YES        |
| BLACKHOLE          | YES     | /dev/null storage engine (anything you write to it disappears) | NO           | NO   | NO         |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                             | NO           | NO   | NO         |
| CSV                | YES     | CSV storage engine                                             | NO           | NO   | NO         |
| Mroonga            | YES     | CJK-ready fulltext search, column store                        | NO           | NO   | NO         |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables      | NO           | NO   | NO         |
| FEDERATED          | NO      | Federated MySQL storage engine                                 | NULL         | NULL | NULL       |
| ARCHIVE            | YES     | Archive storage engine                                         | NO           | NO   | NO         |
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
10 rows in set (0.00 sec)
```

`Mroonga` 行が存在することを確認する。

その他、 Mroonga の簡単な使用方法は以下の過去記事等を参照。

* [MariaDB 10.0.x - Mroonga プラグインの有効化！]({{site.baseurl}}/2015/08/21/mariadb-mroonga-installation "MariaDB 10.0.x - Mroonga プラグインの有効化！")

### 8. 参考サイト

* [2.7. その他 — Mroonga v5.10 documentation](http://mroonga.org/ja/docs/install/others.html "2.7. その他 — Mroonga v5.10 documentation")

---

以上。

