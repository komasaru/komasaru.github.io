---
layout   : single
title    : "MariaDB(MySQL) - innodb_table_stats not found!"
published: true
date     : 2015-02-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
- MariaDB
---
こんにちは。

MariaDB 10.0 系や MySQL 5.6 系サーバ起動時に `innodb_table_stats` が見当たらない旨のエラーが出力されることがあります。

以下、現象・原因・対策についてです。

<!--more-->

### 0. 前提条件

* MariaDB 公式リポジトリを使用してインストールした MariaDB 10.0.15 サーバでの作業を想定。（MySQL 5.6 系でも同様）

### 1. 現象

MariaDB サーバ起動時にログファイルに以下のようなエラーが出力される。

File: `/var/log/mysql/error.log`

{% highlight bash linenos %}
2015-02-15 09:59:48 7f9fe25a3700 InnoDB: Error: Table "mysql"."innodb_table_stats" not found.
{% endhighlight %}

### 2. 原因

調べてみると、 MySQL 5.6 系のバグと思われるが、 MariaDB 10.0 にも該当しているように感じられる。  
（ちなみに、MariaDB 10.0 系は MariaDB 5.5 系をベースに MySQL 5.6 系で追加になった機能をバックポートし、さらに全く新しい MariaDB 独自の様々な機能を実装したもの）

* [MySQL Bugs: #67179: mysql system tables innodb_table_stats,slave_master_info not accessible on clean](http://bugs.mysql.com/bug.php?id=67179 "MySQL Bugs: #67179: mysql system tables innodb_table_stats,slave_master_info not accessible on clean")

### 3. 対策

上記のバグリポートページの "Files" タグ内下部にある "[five-tables.sql](http://bugs.mysql.com/file.php?id=19725&bug_id=67179 "five-tables.sql")" を確認してみる。

以下のような説明がある。

1. 以下のテーブルをドロップする。
   * innodb_index_stats
   * innodb_table_stats
   * slave_master_info
   * slave_relay_log_info
   * slave_worker_info
2. 上記の５テーブルの ".frm" ファイルと ".ibd" ファイルを全て削除する。
3. この sql ファイルを実行する。
4. mysql サーバを再起動する。

この説明に従って実行するだけでよいらしい。（MySQL(MariaDB) を触る人なら当作業についての詳細な説明は不要だと思う）  
（場合によっては（レプリケーションを使用しない環境では）、上記の "slave_xxxx" が最初から存在しないかも知れない）

### 4. 確認

MariaDB(MySQL) サーバ再起動後、ログにエラーが出力されないことを確認する。

---

当方、少し前まで MariaDB は 5.5 系を使用していたため、今回のような現象に遭遇したのは初めてでした。

以上。

