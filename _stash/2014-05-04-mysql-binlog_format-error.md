---
layout   : single
title    : "MySQL - BINLOG_FORMAT 関連のエラーログ！"
published: true
date     : 2014-05-04 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
- MariaDB
---

MySQL のエラーログを眺めていてあるエラーを発見しました。

以下、その現象についての調査・作業記録です。（乱文ご容赦ください）

<!--more-->

### 0. 前提条件

- MySQL 5.6.16 サーバを想定。（最近のバージョンなら同様。MariaDB も同様）
- バイナリログ機能を使用していることを想定。
- レプリケーション機能は使用していないことを想定。
- 該当のテーブルにトリガを設定していることを想定。  
  今回の当方の場合、該当のテーブルにレコートが INSERT された場合に、別テーブルを UPDATE するような「トリガ」を設定している。

### 1. 現象

MySQL のエラーログに以下のような出力がされていた。

File: `error.log`

{% highlight text linenos %}
Unsafe statement written to the binary log using statement format \
since BINLOG_FORMAT = STATEMENT. Statement is unsafe because it \
invokes a trigger or a stored function that inserts into an \
AUTO_INCREMENT column. Inserted values cannot be logged correctly. \
Statement: INSERT INTO ...
...
{% endhighlight %}

### 2. 原因

エラーログの内容のとおり、 `AUTO_INCREMENT` のカラムに挿入するようなトリガに対しては、 `BINLOG_FORMAT` が `STATEMENT` だとバイナリログとして書き込むには安全ではない、ということらしい。

より詳しく説明するなら、 MySQL 5.1.12 以降の場合、レプリケーションは「ミックスベース」がデフォルトであるにも関わらず、バイナリログの書式が "STATEMENT" になっている、ということ。（MySQL 5.1.11 以前は「ステートメントベース」がデフォルトであった）

### 3. 設定確認

現状の `binlog_format` の設定値を確認してみる。

``` sql
mysql> SHOW GLOBAL VARIABLES LIKE 'binlog_format';
+---------------+-----------+
| Variable_name | Value     |
+---------------+-----------+
| binlog_format | STATEMENT |
+---------------+-----------+
1 row in set (0.00 sec)
```

確かに `STATEMENT` となっている。

### 4. 設定変更

`binlog_format` に設定可能な値は以下のとおり。

- `STATEMENT` or `1` ... 実際に実行された SQL が記録する。（デフォルト値）
- `ROW` or `2` ... 実際に変更された行のデータが記録する。
- `MIXED` or `3` ... 危険な関数を使用した場合などには `ROW` で記録し、そうでなければ `STATEMENT` で記録する。

各種サイト等の情報を調べてみると、 `mixed` にすると良いらしいので以下のようにして変更する。（`binlog_format` はランタイムでも変更可能）

``` text
mysql> SET GLOBAL binlog_format = 'MIXED';
Query OK, 0 rows affected (0.00 sec)
```

MySQL サーバ再起動後にも設定が有効になるよう設定ファイルを以下のように編集する。  
（`SET GLOBAL ...` せず、設定ファイル編集後に MySQL サーバを再起動してもよい）

File: `/etc/my.cnf`

{% highlight bash linenos %}
binlog_format = MIXED
{% endhighlight %}

**この方法は、レプリケーション機能を使用していなく、またこの設定作業中にクエリが発行されないと分かっている場合のみ有効。**
**レプリケーション機能を使用していたり設定作業中にクエリが発行されるような場合は、データの不整合を防ぐために、クエリのロックやログ再オープンの作業も必要となる。**

### 5. 設定再確認

再度 `binlog_format` の設定値を確認してみる。

``` sql
mysql> SHOW GLOBAL VARIABLES LIKE 'binlog_format';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| binlog_format | MIXED |
+---------------+-------+
1 row in set (0.00 sec)
```

### 6. 動作確認

エラーが発生していた時と同様な操作を行なってもエラーログに出力されなくなることを確認する。

### 7. 参考サイト

- [MySQL :: MySQL 5.1 リファレンスマニュアル :: 5.1.2.1 レプリケーション フォーマットのセッティング](http://dev.mysql.com/doc/refman/5.1/ja/replication-formats-setting.html "MySQL :: MySQL 5.1 リファレンスマニュアル :: 5.1.2.1 レプリケーション フォーマットのセッティング")

---

レプリケーション機能やストアドプロシージャ・トリガを使用しないと気付かないかも知れない設定についてでした。

以上。

