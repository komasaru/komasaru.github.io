---
layout   : single
title    : "MariaDB(MySQL) - パーティショニング！"
published: true
date     : 2014-09-07 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
---

MySQL 5.1 から導入されたテーブルのパーティショニング（１テーブルの分割管理）についての備忘録です。

パーティショニングすることにより主に以下のようなメリットがあると考えられます。

- 対象のパーティションのみ参照するようになるため、高速化が見込まれる。
- パーティションごと削除が可能であるため、管理が楽になる。

（以下、乱文ご容赦ください）

<!--more-->

### 0. 前提条件

- MariaDB(MySQL) 5.5 系、5.6 系での作業を想定。  
  （5.1 以降ならパーティショニング可能であるが、RANGE で date 型, datetime 型がそのまま使用できるのは 5.5 以降）

### 1. 準備

例として、以下のようなテーブルをあらかじめ作成しておく。  
次項以降は `ALTER TABLE` でこのテーブルに対して操作することを想定しているが、テーブル作成時に `ALTER TABLE` より後ろの部分を付加してもよい。

``` sql
CREATE TABLE table_name (
  id      int(11)      NOT NULL AUTO_INCREMENT,
  recv_at datetime     NOT NULL,
  kubun   tinyint(4)   NOT NULL,
  text    varchar(100) NOT NULL,
  PRIMARY KEY (id, recv_at, kubun)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
```

その他、以下のことを理解しておく。

- パーティション分割には、RANGE, LIST, HASH, KEY の種類がある。
- パーティション分割に使用するキーはプライマリキーに含まれていなければならない。
- RANGE でのパーティション分割に使用するキーは int, date, datetime 型でなければならない。
- LIST でのパーティション分割に使用するキーは int 型でなければならない。
- パーティションを追加や再配置する場合、既に登録済みのデータは変更されない。
- 作成可能なパーティション数は 8,192 個（5.6.7 未満は 1,024 個）である。

### 2. int 型の値の範囲で分割（RANGE を使用する例）

（`MAXVALUE` を使用しなかった場合、条件に一致しないレコードが出現した場合にエラーとなる）

``` sql
ALTER TABLE table_name PARTITION BY RANGE COLUMNS(id) (
    PARTITION p00000 VALUES LESS THAN (10000),
    PARTITION p10000 VALUES LESS THAN (20000),
    PARTITION p20000 VALUES LESS THAN (30000),
    PARTITION p99999 VALUES LESS THAN MAXVALUE
);
```

### 3. datetime 型の「年」別に分割（RANGE を使用する例）

datetime 型だが int 型にキャストして利用する例。  
（`MAXVALUE` を使用しなかった場合、条件に一致しないレコードが出現した場合にエラーとなる）

``` sql
ALTER TABLE table_name PARTITION BY RANGE (YEAR(recv_at)) (
    PARTITION p2012 VALUES LESS THAN (2013),
    PARTITION p2013 VALUES LESS THAN (2014),
    PARTITION p2014 VALUES LESS THAN (2015),
    PARTITION p9999 VALUES LESS THAN MAXVALUE
);
```

### 4. datetime 型の「月」別に分割（RANGE を使用する例）

datetime 型をそのまま利用する例。  
（`MAXVALUE` を使用しなかった場合、条件に一致しないレコードが出現した場合にエラーとなる）

``` sql
ALTER TABLE table_name PARTITION BY RANGE COLUMNS(recv_at) (
    PARTITION p1401 VALUES LESS THAN ('2014-02-01 00:00:00'),
    PARTITION p1402 VALUES LESS THAN ('2014-03-01 00:00:00'),
    PARTITION p1403 VALUES LESS THAN ('2014-04-01 00:00:00'),
    PARTITION p1404 VALUES LESS THAN ('2014-05-01 00:00:00'),
    PARTITION p1405 VALUES LESS THAN ('2014-06-01 00:00:00'),
    PARTITION p1406 VALUES LESS THAN ('2014-07-01 00:00:00'),
    PARTITION p1407 VALUES LESS THAN ('2014-08-01 00:00:00'),
    PARTITION p1408 VALUES LESS THAN ('2014-09-01 00:00:00'),
    PARTITION p1409 VALUES LESS THAN ('2014-10-01 00:00:00'),
    PARTITION p1410 VALUES LESS THAN ('2014-11-01 00:00:00'),
    PARTITION p1411 VALUES LESS THAN ('2014-12-01 00:00:00'),
    PARTITION p1412 VALUES LESS THAN ('2015-01-01 00:00:00'),
    PARTITION p9999 VALUES LESS THAN MAXVALUE
);
```

MariaDB(MySQL) 5.5 未満の場合は datetime 型は使用できないので、以下のようにする必要がある。

``` sql
ALTER TABLE table_name PARTITION BY RANGE (TO_DAYS(recv_at)) (
    PARTITION p1401 VALUES LESS THAN (TO_DAYS('2014-02-01 00:00:00')),
    PARTITION p1402 VALUES LESS THAN (TO_DAYS('2014-03-01 00:00:00')),
    PARTITION p1403 VALUES LESS THAN (TO_DAYS('2014-04-01 00:00:00')),
    PARTITION p1404 VALUES LESS THAN (TO_DAYS('2014-05-01 00:00:00')),
    PARTITION p1405 VALUES LESS THAN (TO_DAYS('2014-06-01 00:00:00')),
    PARTITION p1406 VALUES LESS THAN (TO_DAYS('2014-07-01 00:00:00')),
    PARTITION p1407 VALUES LESS THAN (TO_DAYS('2014-08-01 00:00:00')),
    PARTITION p1408 VALUES LESS THAN (TO_DAYS('2014-09-01 00:00:00')),
    PARTITION p1409 VALUES LESS THAN (TO_DAYS('2014-10-01 00:00:00')),
    PARTITION p1410 VALUES LESS THAN (TO_DAYS('2014-11-01 00:00:00')),
    PARTITION p1411 VALUES LESS THAN (TO_DAYS('2014-12-01 00:00:00')),
    PARTITION p1412 VALUES LESS THAN (TO_DAYS('2015-01-01 00:00:00')),
    PARTITION p9999 VALUES LESS THAN MAXVALUE
);
```

### 5. int 型の値別に分割（LIST を使用する例）

``` sql
ALTER TABLE table_name PARTITION BY LIST(kubun) (
    PARTITION p0 VALUES IN (0, 2, 4, 6),
    PARTITION p1 VALUES IN (1, 3, 5, 7),
    PARTITION p8 VALUES IN (8, 9)
);
```

### 6. 既存のパーティションの削除（RANGE, LIST 共通）

ただし、最後の１つのパーティションは削除できない。（パーティショニング機能自体を削除する（後述））  
**パーティションを削除するとそのパーティション内のレコードも削除されるので注意。（パーティショニングの醍醐味の１つであるが、使い方を間違えると命取りとなる）**

``` sql
ALTER TABLE table_name DROP PARTITION partition_name;
```

### 7. 新たなパーティションの追加（RANGE を使用する例）

ただし、`MAXVALUE` によるパーティション分割を行っていない場合。  
既に `MAXVALUE` による分割を行っている場合は追加できない。その場合はパーティションを再構成すればよい（パーティションを削除して作成し直すのではなく、再構成（次項参照））。  
（LIST の場合も同様）

``` sql
ALTER TABLE table_name ADD PARTITION (
    PARTITION p1501 VALUES LESS THAN ('2015-02-01 00:00:00')
);
```

※注意  
パーティション作成時にはテーブルロックがかかり、レコード数が多くなってからパーティションを追加する作業を行うと何かしらの影響を受けかねない。  
その故、将来パーティションを追加することがあらかじめ分かっていれば、テーブル作成時にパーティションを作成していおいたほうがよい。

### 8. 既存パーティションの再構成（RANGE を使用する例）

先頭のバーティションを更に分割する必要が出てきた場合。  
例えば、'2013-02-01 00:00:00' より古いデータを先頭のパーティション "p1301" としていたが、更に分割する必要が出てきた場合など。  
（LIST の場合も同様）

``` sql
ALTER TABLE table_name REORGANIZE PARTITION p1301 INTO (
    PARTITION p1211 VALUES LESS THAN ('2012-12-01 00:00:00'),
    PARTITION p1212 VALUES LESS THAN ('2013-01-01 00:00:00'),
    PARTITION p1301 VALUES LESS THAN ('2013-02-01 00:00:00')
);
```

※注意  
パーティション作成時にはテーブルロックがかかり、レコード数が多くなってからパーティションを追加する作業を行うと影響を受けかねない。  
その故、将来パーティションを追加することがあらかじめ分かっていれば、テーブル作成時にパーティションを作成していおいたほうがよい。

### 9. ハッシュで４つに分割する例（HASH を使用する例）

HASH は、前もって決められた数のパーティションの中でデータを均等に割り振るために使用される。（分割方法を MariaDB(MySQL) に任せる）

``` sql
ALTER TABLE table_name PARTITION BY HASH(id)
PARTITIONS 4;
```

`PARTITIONS` 節を省略した場合、パーティション数はデフォルトで 1 となる。

### 10. キーで２つに分割する例（KEY を使用する例）

HASH と同様だが、分割に使う値はプライマリキー(またはユニークキー）に対しサーバ側で決めたアルゴリズム（MySQLクラスタ:MD5 / 他のストレージエンジン / PASSWORD())。

``` sql
ALTER TABLE table_name PARTITION BY KEY()
PARTITIONS 2;
```

### 11. パーティショニングの確認（RANGE, LIST, HASH, KEY 共通）

``` sql
SELECT TABLE_SCHEMA, TABLE_NAME, PARTITION_NAME,
       PARTITION_ORDINAL_POSITION, TABLE_ROWS
  FROM INFORMATION_SCHEMA.PARTITIONS
 WHERE TABLE_NAME =  'table_name';
```

### 12. パーティショニング機能の削除（RANGE, LIST, HASH, KEY 共通）

パーティションの削除と異なり、登録済みのデータは削除されない。

``` sql
ALTER TABLE table_name REMOVE PARTITIONING;
```

### 参考サイト

- [MySQL :: MySQL 5.6 Reference Manual :: 19 Partitioning](http://dev.mysql.com/doc/refman/5.6/en/partitioning.html "MySQL :: MySQL 5.6 Reference Manual :: 19 Partitioning")

---

パーティショニングの再構成時に登録済みのレコードで消滅してしまうものがあるような気もした。  
（「再構成時に非同期で再配置を行っているから」という記事も見かけたが、自分で精査していないのでなんとも言えない）
テーブル作成時にあらかじめ余裕を持ってパーティショニングしておけば問題ないだろう。

以上。

