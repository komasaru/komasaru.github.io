---
layout   : single
title    : "MariaDB 10.0.x - Mroonga プラグインの有効化！"
published: true
date     : 2015-08-21 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Groonga
- Mroonga
- MariaDB
---

全文検索エンジン Groonga をベースとした MySQL のストレージエンジン Mroonga を MariaDB で使用する方法についての簡単な記録です。

MariaDB 10.0.x では Mroonga のプラグインがバンドルされているので、 Mroonga を別途インストールする必要はありません。  
プラグインを有効にすればすぐに使用できるようになります。（但し、バンドルされている Mroonga はバージョンが少し古いようなので、最新バージョンを使用したければ別途インストールする必要があります）

（Groonga, Mroonga については不勉強で疎いため、乱文ご容赦ください）

<!--more-->

### 0. 前提条件

* MariaDB 10.0.21 (on Linux Mint 17.2) での作業を想定。

### 1. プラグインの有効化

以下の SQL を実行して、プラグインを有効にする。

``` text
> INSTALL PLUGIN Mroonga SONAME 'ha_mroonga.so';
> CREATE FUNCTION last_insert_grn_id RETURNS INTEGER SONAME 'ha_mroonga.so';
> CREATE FUNCTION mroonga_snippet RETURNS STRING SONAME 'ha_mroonga.so';
> CREATE FUNCTION mroonga_command RETURNS STRING SONAME 'ha_mroonga.so';
> CREATE FUNCTION mroonga_escape RETURNS STRING SONAME 'ha_mroonga.so';
```

### 2. プラグイン有効化の確認

``` text
> SHOW ENGINES;
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                                    | Transactions | XA   | Savepoints |
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables                  | NO           | NO   | NO         |
| CSV                | YES     | CSV storage engine                                                         | NO           | NO   | NO         |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                                         | NO           | NO   | NO         |
| BLACKHOLE          | YES     | /dev/null storage engine (anything you write to it disappears)             | NO           | NO   | NO         |
| MyISAM             | YES     | MyISAM storage engine                                                      | NO           | NO   | NO         |
| MRG_MyISAM         | YES     | Collection of identical MyISAM tables                                      | NO           | NO   | NO         |
| Mroonga            | YES     | CJK-ready fulltext search, column store                                    | NO           | NO   | NO         |
| FEDERATED          | YES     | FederatedX pluggable storage engine                                        | YES          | NO   | YES        |
| InnoDB             | DEFAULT | Percona-XtraDB, Supports transactions, row-level locking, and foreign keys | YES          | YES  | YES        |
| Aria               | YES     | Crash-safe tables with MyISAM heritage                                     | NO           | NO   | NO         |
| ARCHIVE            | YES     | Archive storage engine                                                     | NO           | NO   | NO         |
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
11 rows in set (0.00 sec)
```

### 3. テーブルの作成方法

以下は、ストレージモードでテーブルを作成する場合で、 `col_name_2` に全文検索インデックスを張る例（トークナイザはデフォルトの "TokenBigram"）。

``` text
> CREATE TABLE table_name(
>   id INT PRIMARY KEY AUTO_INCREMENT,
>   col_name_1 VARCHAR(255),
>   col_name_2 VARCHAR(255),
>   FULLTEXT INDEX (col_name_2)
> ) ENGINE = Mroonga DEFAULT CHARSET utf8;
```

以下は、ラッパーモード（元のストレージエンジンは InnoDB）でテーブルを作成する場合で、 `col_name_2` に全文検索インデックスを張る例（トークナイザはデフォルトの "TokenBigram"）。

``` text
> CREATE TABLE table_name (
>   id INT PRIMARY KEY AUTO_INCREMENT,
>   col_name_1 VARCHAR(255),
>   col_name_2 VARCHAR(255),
>   FULLTEXT INDEX (col_name_2)
> ) ENGINE = Mroonga COMMENT = 'engine "InnoDB"' DEFAULT CHARSET utf8;
```

※但し、 MariaDB では `FULLTEXT INDEX` で設定しても `FULLTEXT KEY` で登録される。

ちなみに、テーブルデフォルトのトークナイザを MeCab に変更したい場合は以下のようにする。（設定ファイルで指定することも可能）

``` text
> ) ENGINE = Mroonga COMMENT='default_tokenizer "TokenMecab"' DEFAULT CHARSET utf8;
```

FULLTEXT INDEX のパーサのみ変更したい場合は以下のようにする。

``` text
>   FULLTEXT INDEX (col_name_2) COMMENT='parser "TokenMecab"'
```

### 4. 検索例

以下は、テーブル table_name の col_name_2 に「松江」を含み「出雲」を含まないレコードを検索する例。  

``` sql
> SELECT *, MATCH (col_name_2) AGAINST("+松江 -出雲" IN BOOLEAN MODE)
>   FROM table_name
>  WHERE MATCH (col_name_2) AGAINST("+松江 -出雲" IN BOOLEAN MODE);
```

* `SELECT` 句内の `MATCH ... AGAINST ...` は、検索スコア。
* `IN BOOLEAN MODE` は、マッチ率の概念を省いて、単純にかつ機械的に検索するモード。

ちなみに、当方で 30 万件ほどレコードのあるテーブルで同様に検索してみた結果、 `WHERE` 句を

``` sql
WHERE col_name_2 LIKE '%松江%' AND col_name_2 NOT LIKE '%出雲%'
```

にして検索するより約 100 倍高速に検索できました。さらに、レコード約 1,300 万件では 約 500 倍高速に検索できました。  
（テーブルレイアウト、レコード数等にもよるでしょうが）

### 5. 参考サイト

* [Mroonga - MySQLで高速全文検索](http://mroonga.org/ja/ "Mroonga - MySQLで高速全文検索")

中でも、Mroonga プラグインの有効については以下を参照。

* [Mroonga - Mroonga 5.02リリース！](http://mroonga.org/ja/blog/2015/04/29/release.html "Mroonga - Mroonga 5.02リリース！")

---

検索の高速化を図るには必須の機能でしょう。

当方も InnoDB で構築している既存の DB の高速化を図ってみたいところです。

以上。

