---
layout   : single
title    : "CentOS - Mroonga インストール（by ソースビルド）！"
published: true
date     : 2016-01-08 00:20:00 +0900
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

MySQL 5.7 に全文検索エンジン Groonga の機能を実現するストレージエンジン Mroonga をソースをビルドしてインストールする方法についてです。

<!--more-->

### 0. 前提条件

* CentOS 6.7(32bit) での作業を想定。
* 当記事執筆時点で最新の Mroonga 5.10 をインストールする。
* Groonga 5.1.0 がインストール済みであることを想定。  
  （参照：[CentOS - Groonga インストール（by yum パッケージ）！]({{site.baseurl}}/2016/01/04/centos-groonga-installation-by-yum "CentOS - Groonga インストール（by yum パッケージ）！")）
* MySQL 5.7.9 をソースをビルドしてインストールしていること。（Mroonga のビルドに MySQL のソースが必要なため）  
  （参照：[CentOS - MySQL 5.7 インストール（ソースビルド）！]({{site.baseurl}}/2015/12/20/centos-mysql-57-installation-by-src "CentOS - MySQL 5.7 インストール（ソースビルド）！")）
* MySQL 5.7.9 は "/usr/local/mysql" ディレクトリにインストールされていることを想定。
* MySQL 5.7.9 のインストールに使用したソースは "/usr/local/src/mysql-5.7.9" ディレクトリに存在することを想定。

### 1. 必要ライブラリのインストール

``` text
# yum -y install groonga-devel groonga-normalizer-mysql
```

形態素解析エンジン MeCab をトークナイザとして使用するなら MeCab もインストールする。（groonga-tokenizer-mecab を yum インストールしていれば、依存性の関係でインストールされているはず）

その他、ビルドに必要な `make` 等も未インストールならインストールしておく。

### 2. ソースの取得

アーカイブを取得・展開し、ディレクトリを移動する。

``` text
# /usr/local/src
# wget http://packages.groonga.org/source/mroonga/mroonga-5.10.tar.gz
# tar zxvf mroonga-5.10.tar.gz
# cd mroonga-5.10
```

### 3. Makefile の生成

``` text
# ./configure \
--with-mysql-source=/usr/local/src/mysql-5.7.9 \
--with-mysql-build=/usr/local/src/mysql-5.7.9 \
--with-mysql-config=/usr/local/mysql/bin/mysql_config
```

### 4. ビルド

``` text
# make
```

### 5. インストール

``` text
# make install
```

### 6. MySQL への Mroonga プラグインの適用

MySQL サーバが起動していることを確認してから以下を実行する。

``` text
# mysql -u root < /usr/local/share/mroonga/install.sql
```

`... does not exist` のメッセージが出力されるかもしれないが問題ない。（おそらく）

### 7. Mroonga 導入の確認

MySQL サーバに root でログインして確認してみる。

``` text
mysql> SHOW ENGINES;
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                        | Transactions | XA   | Savepoints |
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
| InnoDB             | DEFAULT | Supports transactions, row-level locking, and foreign keys     | YES          | YES  | YES        |
| MRG_MYISAM         | YES     | Collection of identical MyISAM tables                          | NO           | NO   | NO         |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                             | NO           | NO   | NO         |
| BLACKHOLE          | YES     | /dev/null storage engine (anything you write to it disappears) | NO           | NO   | NO         |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables      | NO           | NO   | NO         |
| CSV                | YES     | CSV storage engine                                             | NO           | NO   | NO         |
| Mroonga            | YES     | CJK-ready fulltext search, column store                        | NO           | NO   | NO         |
| MyISAM             | YES     | MyISAM storage engine                                          | NO           | NO   | NO         |
| FEDERATED          | NO      | Federated MySQL storage engine                                 | NULL         | NULL | NULL       |
| ARCHIVE            | YES     | Archive storage engine                                         | NO           | NO   | NO         |
+--------------------+---------+----------------------------------------------------------------+--------------+------+------------+
10 rows in set (0.01 sec)
```

`Mroonga` 行が存在することを確認する。

その他、 Mroonga の簡単な使用方法は以下の過去記事等を参照。

* [MariaDB 10.0.x - Mroonga プラグインの有効化！]({{site.baseurl}}/2015/08/21/mariadb-mroonga-installation "MariaDB 10.0.x - Mroonga プラグインの有効化！")

### 8. 参考サイト

* [2.7. その他 — Mroonga v5.10 documentation](http://mroonga.org/ja/docs/install/others.html "2.7. その他 — Mroonga v5.10 documentation")

---

以上。

