---
layout   : single
title    : "Debian 8 (Jessie) - Mroonga インストール（by ソースビルド）！"
published: true
date     : 2017-01-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- MariaDB
---

Debian 8 (Jessie) GNU/Linux 上の MariaDB 10.1.19 に全文検索エンジン Groonga の機能を実現するストレージエンジン Mroonga をソースをビルドしてインストールする方法についての記録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* 当記事執筆時点で最新の Mroonga 6.11 をインストールする。
* Groonga 6.1.1 が公式リポジトリからインストール済みであることを想定。  
  （Groonga ソースをビルドしてインストールした場合については、当方は未確認）
* Groonga ノーマライザとして groonga-normalizer-mysql がインストール済みであることを想定。
* MariaDB 10.1.19 をソースをビルドしてインストールしていること。（Mroonga のビルドに MariaDB(MySQL) のソースが必要なため。MariaDB(MySQL) をパッケージでインストールしている場合にも、ソースが必要となる）  
* MariaDB 10.1.19 は "/usr/local/mysql" ディレクトリにインストールされていることを想定。
* MariaDB 10.1.19 のインストールに使用したソースは "/usr/local/src/mariadb-10.1.19" ディレクトリに存在することを想定。
* 一般ユーザでなく root での作業を想定。（サーバ用途なので）
* パッケージのインストールには `apt-get` や `aptitude` ではなく `apt` を使用している。
* 環境の相違等のために以下の方法ではうまく行かないこともあるだろう。  
  ログを確認して適宜対処すること。

### 1. 必要なパッケージのインストール

curl, pkg-config, libgroonga-dev 等、必要なパッケージをインストールしておく。

``` text
# apt install -y curl pkg-config
```

libgroonga-dev 以外の必要なパッケージについては「[こちら](http://mroonga.org/ja/docs/install/others.html "2.7. その他 — Mroonga v6.11 documentation")」を参照。

### 2. ソースの取得

アーカイブファイルを取得、展開後、ディレクトリを移動しておく。（ダウンロード先は一般ユーザホームディレクトリとした）

``` text
# cd /usr/local/src
# wget http://packages.groonga.org/source/mroonga/mroonga-6.11.tar.gz
# tar zxvf mroonga-6.11.tar.gz
# cd mroonga-6.11
```

### 3. Makefile の生成

以下はトークナイザに MeCab を使用する例。

``` text
# ./configure \
--with-mysql-source=/usr/local/src/mariadb-10.1.19 \
--with-mysql-config=/usr/local/mysql/bin/mysql_config \
--with-default-tokenizer=TokenMecab
```

MariaDB のビルドをソースと別のディレクトリで行った場合は、`--with-mysql-build=/path/to/...` も必要。

### 4. ビルド

``` text
# make -j$(grep '^processor' /proc/cpuinfo | wc -l)
```

`make` の `-j$(grep '^processor' /proc/cpuinfo | wc -l)` の部分はプロセッサ数が明確なら `-j4` のように指定してもよい。  
速度を気にしないのなら単に `make` のみでもよい。

### 5. インストール

``` text
# make install
```

### 6. MariaDB への Mroonga プラグインの適用

MariaDB サーバが起動していることを確認してから以下を実行する。

``` text
$ mysql -u root -p < /usr/local/share/mroonga/install.sql
```

`... does not exist` のメッセージが出力されるかもしれないが問題ない。（おそらく）

### 7. Mroonga 導入の確認

MariaDB サーバに root でログインして確認してみる。

``` text
$ mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 15
Server version: 10.1.19-MariaDB Source distribution

Copyright (c) 2000, 2016, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

root@localhost:(none) 17:05:26> show engines;
+--------------------+---------+--------------------------------------------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                                                          | Transactions | XA   | Savepoints |
+--------------------+---------+--------------------------------------------------------------------------------------------------+--------------+------+------------+
| CSV                | YES     | CSV storage engine                                                                               | NO           | NO   | NO         |
| MRG_MyISAM         | YES     | Collection of identical MyISAM tables                                                            | NO           | NO   | NO         |
| MyISAM             | YES     | MyISAM storage engine                                                                            | NO           | NO   | NO         |
| Aria               | YES     | Crash-safe tables with MyISAM heritage                                                           | NO           | NO   | NO         |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables                                        | NO           | NO   | NO         |
| Mroonga            | YES     | CJK-ready fulltext search, column store                                                          | NO           | NO   | NO         |
| SEQUENCE           | YES     | Generated tables filled with sequential values                                                   | YES          | NO   | YES        |
| InnoDB             | DEFAULT | Percona-XtraDB, Supports transactions, row-level locking, foreign keys and encryption for tables | YES          | YES  | YES        |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                                                               | NO           | NO   | NO         |
+--------------------+---------+--------------------------------------------------------------------------------------------------+--------------+------+------------+
9 rows in set (0.00 sec)

root@localhost:(none) 17:05:30>
```

`Mroonga` 行が存在することを確認する。

その他、 Mroonga の簡単な使用方法は以下の過去記事等を参照。

* [MariaDB 10.0.x - Mroonga プラグインの有効化！]({{site.baseurl}}/2015/08/21/mariadb-mroonga-installation "MariaDB 10.0.x - Mroonga プラグインの有効化！")

### 8. 参考サイト

* [2.7. その他 — Mroonga v6.11 documentation](http://mroonga.org/ja/docs/install/others.html "2.7. その他 — Mroonga v6.11 documentation")

---

以上、

