---
layout   : single
title    : "MariaDB, MySQL - 複合プライマリキーを持つテーブル一覧！"
published: true
date     : 2017-01-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
---

MariaDB や MySQL 等の RDB で、プライマリキー（主キー）を複数のカラムに設定することはよくあります。

しかし、複合プライマリキーをサポートしていないアプリもあったりします。（自分の知る限りでは、 Rails  の ActiveRecord がそう）

以下、複合プライマリキーが設定されているテーブルの一覧を確認する方法についての備忘録です。

<!--more-->

### 0. 前提条件

* MariaDB 10.1.19 での作業を想定。(MySQL 5.7 系での動作も確認済み。その他も、問題ないはず（おそらく））

### 1. SQL 文

以下のような SQL 文を実行すればよい。それだけ。  
（以下の `scheme_name` を対象のスキーマ名に変更する）

``` sql
  SELECT TABLE_NAME, COUNT(*) AS cnt
    FROM information_schema.KEY_COLUMN_USAGE
   WHERE CONSTRAINT_SCHEMA = 'scheme_name'
     AND CONSTRAINT_NAME = 'PRIMARY'
GROUP BY TABLE_NAME
  HAVING cnt > 1;
```

当然、最終行の `cnt > 1` を変更することでプライマリキーに設定されているカラム数別に一覧を出力することもできる。

---

以上、

