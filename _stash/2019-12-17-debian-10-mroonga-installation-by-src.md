---
layout   : single
title    : "Debian 10 (buster) - Mroonga インストール（ソースビルド）！"
published: true
date     : 2019-12-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- Debian
- MariaDB
- Mroonga
---

Debian GNU/Linux 10 (buster) 上に全文検索エンジン Mroonga をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* 当記事執筆時点で最新の Mroonga 9.07 をインストールする。
* Groonga 9.0.7 がインストール済みであることを想定。  
  （参照「[Debian 10 (buster) - 全文検索エンジン Groonga インストール（by Groonga 公式リポジトリ）！ ]({{site.baseurl}}/2019/12/11/debian-10-groonga-installation-by-official-apt "Debian 10 (buster) - 全文検索エンジン Groonga インストール（by Groonga 公式リポジトリ）！ ")」）
* MariaDB 10.4.8 をソースをビルドしてインストールしていること。（Mroonga のビルドに MySQL のソースが必要なため。MariaDB をパッケージでインストールしている場合にも、ソースが必要となる）  
  （参照「[Debian 10 (buster) - MariaDB 10.4 サーバ構築（ソースビルド）！]({{site.baseurl}}/2019/12/14/debian-10-mariadb-installation-by-src "Debian 10 (buster) - MariaDB 10.4 サーバ構築（ソースビルド）！")」）
* MariaDB 10.4.8 は "/usr/local/mysql" ディレクトリにインストールされていることを想定。
* MariaDB 10.4.8 のインストールに使用したソースは "/usr/local/src/mariadb-10.4.8" ディレクトリに存在することを想定。
* MariaDB 10.4.8 のビルド用ディレクトリは "/usr/local/src/build-mariadb" であることを想定。
* 環境の相違等のために以下の方法ではうまく行かないこともあるだろう。  
  ログを確認して適宜対処すること。

### 1. ソースリストの追加

Groonga インストール時に作成していなければ、作成する。

File: `/etc/apt/sources.list.d/groonga.list`

{% highlight bash %}
deb https://packages.groonga.org/debian/ stretch main
deb-src https://packages.groonga.org/debian/ stretch main
{% endhighlight %}

そして、パッケージリストを更新しておく。

``` text
# apt -y update
```

GPG 公開鍵エラーが出る場合は、過去記事「[Linux Mint - apt-get update で GPG 公開鍵エラー！](/2015/10/14/linux-mint-apt-gpg-pubkey-error/ "Linux Mint - apt-get update で GPG 公開鍵エラー！")」を参照のこと。

### 2. 必要ライブラリのインストール

Groonga 開発ライブラリをインストール。

``` text
# apt -y install libgroonga-dev
```

トクーナイザとして MeCab を使用する予定があるなら、次を実行。（当方は実行）

``` text
# apt -y -V install groonga-tokenizer-mecab
```

トークンフィルタとして TokeFilterStem を使用する予定があるなら、次を実行。（当方は実行）

``` text
# apt -y -V install groonga-token-filter-stem
```

ノーマライザとして groonga-normalizer-mysql を使用する予定があるなら、次を実行。（当方は実行）

``` text
# apt -y -V install groonga-normalizer-mysql
```

### 3. ソースの取得

アーカイブファイルを取得、展開後、ディレクトリを移動しておく。

``` text
# cd /usr/local/src
# wget http://packages.groonga.org/source/mroonga/mroonga-9.07.tar.gz
# tar zxvf mroonga-9.07.tar.gz
```

### 4. Makefile の生成

``` text
# cd mroonga-9.07
# ./configure \
 --with-mysql-source=/usr/local/src/mariadb-10.4.8 \
 --with-mysql-build=/usr/local/src/build-mariadb \
 --with-mysql-config=/usr/local/mysql/bin/mysql_config
```

### 5. ビルド＆インストール

``` text
# make -j$(grep '^processor' /proc/cpuinfo | wc -l)
# make install
```

`make` の `-j$(grep '^processor' /proc/cpuinfo | wc -l)` の部分はプロセッサ数が明確なら `-j4` のように指定してもよいし、速度を気にしないのなら単に `make` のみでもよい。

### 6. MariaDB への Mroonga プラグインの適用

MariaDB サーバが起動していることを確認してから以下を実行する。

``` text
# mysql -u root < /usr/local/share/mroonga/install.sql
```

`... does not exist` のメッセージが出力されるかもしれないが問題ない。（おそらく）

### 7. Mroonga 導入の確認

MariaDB サーバに root でログインして確認してみる。

``` text
$ mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 22
Server version: 10.4.8-MariaDB-log Source distribution

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

root@localhost:(none) 13:53:18> show engines;
+--------------------+---------+-------------------------------------------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                       | Transactions | XA   | Savepoints |
+--------------------+---------+-------------------------------------------------------------------------------------------------+--------------+------+------------+
| CSV                | YES     | Stores tables as CSV files                                                       | NO           | NO   | NO         |
| MRG_MyISAM         | YES     | Collection of identical MyISAM tables                                                       | NO           | NO   | NO         |
| MEMORY             | YES     | Hash based, stored in memory, useful fortemporary tables                                       | NO           | NO   | NO         |
| Aria               | YES     | Crash-safe tables with MyISAM heritage. Used for internal temporary tables and privilege tables | NO           | NO   | NO         |
| MyISAM             | YES     | Non-transactional engine with good performance and small data footprint                         | NO           | NO   | NO         |
| SEQUENCE           | YES     | Generated tables filled with sequential values                                                  | YES          | NO   | YES        |
| Mroonga            | YES     | CJK-ready fulltext search, column store                                                       | NO           | NO   | NO         |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                                       | NO           | NO   | NO         |
| InnoDB             | DEFAULT | Supports transactions, row-level locking, foreign keys and encryption for tables                | YES          | YES  | YES        |
+--------------------+---------+-------------------------------------------------------------------------------------------------+--------------+------+------------+
9 rows in set (0.002 sec)

root@localhost:(none) 13:53:32>
```

`Mroonga` 行が存在することを確認する。

その他、 Mroonga の簡単な使用方法は以下の過去記事等を参照。

* [MariaDB 10.0.x - Mroonga プラグインの有効化！](/2015/08/21/mariadb-mroonga-installation "MariaDB 10.0.x - Mroonga プラグインの有効化！")

### 8. 参考サイト

* [2.8. その他 — Mroonga v9.07 documentation](http://mroonga.org/ja/docs/install/others.html "2.8. その他 — Mroonga v9.07 documentation")

---

以上。

