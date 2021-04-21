---
layout   : single
title    : "LMDE 3 - Mroonga インストール（ソースビルド）！"
published: true
date     : 2018-10-29 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- LMDE3
- MariaDB
- Mroonga
---

LMDE 3 (Linux Mint Debian Edition 3) 上の MariaDB 10.3.9 に全文検索エンジン Groonga の機能を実現するストレージエンジン Mroonga をソースをビルドしてインストールする方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* 当記事執筆時点で最新の Mroonga 8.06 をインストールする。
* ここでは、全文検索がどういうものかという説明はしない。
* Apt パッケージのインストールには `apt-get` や `aptitude` コマンドでなく `apt` コマンドを使用する。

### 1. apt リポジトリの追加

今回はソースをビルドしてインストールするので、本来は apt リポジトリの追加は不要であるが、関連するパッケージのインストールに使用するため、追加しておく。

File: `/etc/apt/sources.list.d/groonga.list`

{% highlight bash linenos %}
deb https://packages.groonga.org/debian/ stretch main
deb-src https://packages.groonga.org/debian/ stretch main
{% endhighlight %}

そして、パッケージリストを更新する。

``` text
$ sudo apt update
```

GPG 公開鍵エラーが出る場合は、過去記事「[Linux Mint - apt-get update で GPG 公開鍵エラー！]({{site.baseurl}}/2015/10/14/linux-mint-apt-gpg-pubkey-error/ "Linux Mint - apt-get update で GPG 公開鍵エラー！")」を参照のこと。

### 2. 必要ライブラリのインストール

Groonga 開発ライブラリをインストール。

``` text
$ sudo apt install -y libgroonga-dev
```

トクーナイザとして MeCab を使用する場合は、次を実行。（当方は実行）

``` text
# sudo apt install -y -V groonga-tokenizer-mecab
```

トークンフィルタとして TokeFilterStem を使用する場合は、次を実行。（当方は実行）

``` text
# sudo apt install -y -V groonga-token-filter-stem
```

ノーマライザとして groonga-normalizer-mysql を使用する場合は、次を実行。（当方は実行）

``` text
$ sudo apt install -y -V groonga-normalizer-mysql
```

### 3. Mroonga アーカイブの取得＆展開

``` text
$ wget https://packages.groonga.org/source/mroonga/mroonga-8.06.tar.gz
$ tar xvzf mroonga-8.06.tar.gz
```

### 4. Makefile の生成

``` text
$ cd mroonga-8.06
$ ./configure \
 --with-mysql-source=/home/etc/softs/db/mariadb-10.3.9 \
 --with-mysql-build=/home/etc/softs/db/build-mariadb \
 --with-mysql-config=/usr/local/mysql/bin/mysql_config
```

[](
* groonga を apt インストールした場合は `PKG_CONFIG_PATH=/usr/local/lib/pkgconfig` は不要
* `.configure` で `--with-default-tokenizer=TokenMecab` は指定しないほうがよい。当方の場合
)

### 5. ビルド

```
$ make -j$(grep '^processor' /proc/cpuinfo | wc -l)
```

`make` の `-j$(grep '^processor' /proc/cpuinfo | wc -l)` の部分はプロセッサ数が明確なら `-j4` のように指定してもよい。  
速度を気にしないのなら単に `make` のみでもよい。

### 6. インストール

``` text
$ sudo make install
```

### 7. MariaDB への Mroonga プラグインの適用

MariaDB サーバが起動していることを確認してから以下を実行する。

``` text
$ mysql -u root -p < /usr/local/share/mroonga/install.sql
```

`... does not exist` のメッセージが出力されるかもしれないが問題ない。

### 8. Mroonga 導入の確認

MariaDB サーバに root でログインして確認してみる。

``` text
$ mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 12
Server version: 10.3.9-MariaDB Source distribution

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

root@localhost:(none) 01:33:09> show engines;
+--------------------+---------+----------------------------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                       | Transactions | XA   | Savepoints |
+--------------------+---------+----------------------------------------------------------------------------------+--------------+------+------------+
| MRG_MyISAM         | YES     | Collection of identical MyISAM tables                                       | NO           | NO   | NO         |
| CSV                | YES     | Stores tables as CSV files                                       | NO           | NO   | NO         |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables                        | NO           | NO   | NO         |
| MyISAM             | YES     | Non-transactional engine with good performance and small data footprint          | NO           | NO   | NO         |
| Aria               | YES     | Crash-safe tables with MyISAM heritage                                       | NO           | NO   | NO         |
| Mroonga            | YES     | CJK-ready fulltext search, column store                                       | NO           | NO   | NO         |
| InnoDB             | DEFAULT | Supports transactions, row-level locking,foreign keys and encryption for tables | YES          | YES  | YES        |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                       | NO           | NO   | NO         |
| SEQUENCE           | YES     | Generated tables filled with sequential values                                   | YES          | NO   | YES        |
+--------------------+---------+----------------------------------------------------------------------------------+--------------+------+------------+
9 rows in set (0.000 sec)

root@localhost:(none) 01:33:27>
```

`Mroonga` 行が存在することを確認する。

その他、 Mroonga の簡単な使用方法は以下の過去記事等を参照。

* [MariaDB 10.0.x - Mroonga プラグインの有効化！]({{site.baseurl}}/2015/08/21/mariadb-mroonga-installation "MariaDB 10.0.x - Mroonga プラグインの有効化！")

### 9. 参考サイト

* [2.7. その他 — Mroonga documentation](http://mroonga.org/ja/docs/install/others.html "2.7. その他 — Mroonga documentation")

---

以上、

