---
layout   : single
title    : "MySQL - データベースサイズ確認！"
published: true
date     : 2013-06-25 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
---

MySQL でデータベースのサイズを確認したいことが時々あります。

MySQL では `SHOW TABLE STATUS;` でテーブルの各種状態を確認できますが、このコマンドではカラムを選択したり、`SUM` を取ったりすることができない。

以下、SQL でデータベースのサイズ確認する方法についての記録です。

<!--more-->

#### 0. 前提条件

- OS や MySQL のバージョンは特に問わないはず。（MariaDB も同じ）
- 以下の記事内の SQL 文ではキーワードを英大文字で記載しているが、趣味の問題であり、英小文字でもよい。

#### 1. 全データベースの容量確認

MySQL サーバに root でログインして、以下のように SQL を作成して実行する。  
IDE ツールで入力して実行してもよい。  
（以下は当方のローカル環境の例）

``` sql 
mysql> SELECT table_schema,
    ->        SUM(data_length+index_length) / 1024 / 1024 AS MB
    ->   FROM information_schema.tables
    ->  GROUP BY table_schema
    ->  ORDER BY MB DESC;
+--------------------+----------------+
| table_schema       | MB             |
+--------------------+----------------+
| XXXXXXXXX          | 22353.90625000 |
| XXXXXXXXX          |  2166.10937500 |
| XXXXXXXXX          |  1570.40625000 |
| XXXXXXXXX          |   235.03949261 |
| XXXXXXXXX          |     3.76562500 |
| mysql              |     0.87726593 |
| test               |     0.04687500 |
| information_schema |     0.00976563 |
| performance_schema |     0.00000000 |
+--------------------+----------------+
9 rows in set (0.01 sec)
```

特定の DB を指定するなら、以下のような `WHERE` 文を追加する。

``` sql 
 WHERE table_schema = 'hoge'
```

#### 2. あるデータベースの全テーブルの容量確認

MySQL サーバに root でログインして、以下のように SQL を作成して実行する。  
IDE ツールで入力して実行してもよい。

``` sql 
SELECT table_name, engine, table_rows, avg_row_length,
       data_length                 / 1024 / 1024 AS  data_size_MB,  #データ容量
       index_length                / 1024 / 1024 AS index_size_MB,  #インデックス容量
      (data_length + index_length) / 1024 / 1024 AS   all_size_MB   #総容量
  FROM information_schema.tables
 WHERE table_schema = 'test'
 ORDER BY all_size_MB desc;
+------------+--------+------------+----------------+--------------+---------------+-------------+
| table_name | engine | table_rows | avg_row_length | data_size_MB | index_size_MB | all_size_MB |
+------------+--------+------------+----------------+--------------+---------------+-------------+
| XXXXXXXXXX | MyISAM |    1926656 |            102 | 187.41503906 |   31.16894531 | 218.58398438 |
| XXXXXXXXXX | InnoDB |     710955 |             64 |  43.59375000 |    0.00000000 |  43.59375000 |
| XXXXXXXXXX | InnoDB |     143936 |             40 |   5.51562500 |    5.51562500 |  11.03125000 |
| XXXXXXXXXX | InnoDB |      25775 |            265 |   6.51562500 |    1.51562500 |   8.03125000 |
| XXXXXXXXXX | InnoDB |      34936 |            165 |   5.51562500 |    1.51562500 |   7.03125000 |
+------------+--------+------------+----------------+--------------+---------------+-------------+
5 rows in set (0.00 sec)
```

ちなみに、上記の `WHERE` 文は以下のように、有効になっている（`USE` している）データベースを指定する方法にしてもよい。

``` sql 
    ->  WHERE table_schema = database()
```

#### 3. ストアドプロシージャ登録

データベースのサイズを確認するたびに上記のような SQL を入力するのは面倒なので、ストアドプロシージャとして登録しておくとよい。  
（以下は、上記１の SQL をデータベース test に登録した例）

``` sql 
mysql> USE test;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> DELIMITER //
mysql> CREATE PROCEDURE CHECK_DB_SIZE_1()
    -> BEGIN
    ->
    -> SELECT table_schema,
    ->        SUM(data_length+index_length) / 1024 / 1024 AS MB
    ->   FROM information_schema.tables
    ->  GROUP BY table_schema
    ->  ORDER BY MB DESC;
    ->
    -> END
    -> //
Query OK, 0 rows affected (0.00 sec)

mysql> DELIMITER ;
```

登録したストアドプロシージャを実行するには、以下のようにする。

``` sql 
mysql> CALL CHECK_DB_SIZE_1;
```

登録したストアドプロシージャを削除するには、以下のようにする。

``` sql 
mysql> DROP PROCEDURE CHECK_DB_SIZE_1;
```

登録されているストアドプロシージャの一覧を確認するには、以下のようにする。

``` sql 
mysql> SHOW PROCEDURE STATUS;
```

ちなみにストアドプロシージャは、いずれかのスキーマを有効化（いずれかの DB を `USE`）しておかないと登録できない。  
（当方は普段メインで使用するデータベースに、これらのストアドプロシージャを登録している）

---

IDE ツールでデータベースのサイズを確認できるものもあるかも知れない（未確認）が、知っておいて損はしないでしょう。

以上。

