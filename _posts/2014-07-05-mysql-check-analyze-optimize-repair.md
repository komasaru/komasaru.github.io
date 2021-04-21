---
layout   : single
title    : "MySQL(MariaDB) - テーブルの検査・分析・最適化・修復！"
published: true
date     : 2014-07-05 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
---

MySQL もしくは MariaDB でのテーブルの検査・分析・最適化・修復についての備忘録です。

それほど日常的な作業でもなく忘れやすいので、その時のための個人的記録です。

<!--more-->

### 0. 前提条件

- MySQL 5.6.16 サーバでの作業を想定。（MySQL 5.5 系や MariaDB でも同じ。旧バージョンは未確認）
- ストレージエンジンが InnoDB であるデータベースでの作業を想定。  
  （以下の「チェック」や「分析」は可能だが、「最適化」や「修復」は不可（別の方法で行う））

### 1. テーブルの検査

1-1. 特定のテーブルのみを検査する場合は、以下のようにする。

``` text
$ mysqlcheck -u root -p db_name table_name
Enter password:
db_name.table_name                                 OK
```

`-c` もしくは `--check` オプションはデフォルトなので付加しなくてもよい（付加してもよい）。  
詳細な情報も出力したければ `-v` もしくは `--verbose` を付加するとよい。

``` text
$ mysqlcheck -u root -p -v db_name table_name
# Connecting to localhost...
db_name.table_name                                 OK
# Disconnecting from localhost...
```

1-2. 特定のデータベースのみを検査する場合は、以下のようにする。

``` text
$ mysqlcheck -u root -p db_name
```

1-3. 特定のデータベースの複数のテーブルを指定して検査する場合は、以下のようにする。

``` text
$ mysqlcheck -u root -p db_name --tables table_name_1 [table_name_2 table_name_3...]
```

1-4. 複数のデータベースを指定して検査する場合は、以下のようにする。

``` text
$ mysqlcheck -u root -p -B db_name_1 [db_name_2 db_name_3...]
```

`-B` オプションは `--databases` で代用可。

1-5. 全てのデータベースを検査する場合は、以下のようにする。

``` text
$ mysqlcheck -u root -p -A
```

`-A` オプションは `--all-databases` で代用可。

### 2. テーブルの分析

特定のテーブルのみを分析する場合は、以下のようにする。

``` text
$ mysqlcheck -u root -p -a db_name table_name
Enter password:
db_name.table_name                                 OK
```

`-a` オプションは `--analyze` で代用可。  
また、テーブルの検査同様、特定のデータベース、全てのデータベースに対して実行可。

### 3. テーブルの最適化

特定のテーブルのみを最適化する場合は、以下のようにする。  
但し、このオプションはストレージエンジンが InnoDB である DB はサポートされていないので、以下のようになる。  
（InnoDB の場合は、テーブルダンプ、テーブル削除、テーブル最作成、テーブルリストア、等で最適化できる。）

``` text
$ mysqlcheck -u root -p -o db_name table_name
Enter password:
db_name.table_name
note     : Table does not support optimize, doing recreate + analyze instead
status   : OK
```

`-o` オプションは `--optimize` で代用可。
また、テーブルの検査同様、特定のデータベース、全てのデータベースに対して実行可。

さらには、MySQL ログイン後に `OPTIMIZE TABLE table_name` で最適化することも可能。（InnoDB の肥大したデータ領域の容量を縮小するという意味の最適化の場合は、テーブル最作成等の方法を採る）

- [MySQL - InnoDB データファイル ibdata1 の最適化！](http://www.mk-mode.com/octopress/2013/08/03/mysql-innodb-optimization/ "MySQL - InnoDB データファイル ibdata1 の最適化！")

### 4. テーブルの修復

特定のテーブルのみを修復する場合は、以下のようにする。  
但し、このオプションはストレージエンジンが InnoDB である DB はサポートされていないので、以下のようになる。  
（修復についても、InnoDB の場合は、テーブルダンプ、テーブル削除、テーブル最作成、テーブルリストア、等で最適化できると思われる。（こちらは未確認））

``` text
$ mysqlcheck -u root -p -r db_name table_name
Enter password:
db_name.table_name
note     : The storage engine for the table doesn't support repair
```

`-r` オプションは `--repair` で代用可。
また、テーブルの検査同様、特定のデータベース、全てのデータベースに対して実行可。

### 5. テーブルの自動修復

特定のテーブルのみをチェックして破損が見つかった場合に自動的に修復する場合は、以下のようにする。  
但し、このオプションはストレージエンジンが InnoDB である DB はサポートされていないので、チェックで破損が見つかっても自動修復はされない。（以下は破損が見つからなかった例）

``` text
$ mysqlcheck -u root -p --auto-repair db_name table_name
Enter password:
db_name.table_name                                 OK
```

テーブルの検査同様、特定のデータベース、全てのデータベースに対して実行可。

### 6. InnoDB のインデックス最適化について

InnoDB の場合、前回インデックス統計情報の更新が行われてから以下の条件になった際に、自動でインデックス統計情報の更新 `ANALYZE TABLE` が実行されるので、普段は意識する必要はない。

- テーブル行数全体の 1/16 が更新される
- 20億行以上更新される

意図的に InnoDB のインデックス統計情報の更新を実行したければ、MySQL サーバログイン後以下のように SQL 実行する。（テーブル書き込みロックされることに留意）

``` text
mysql> ANALYZE TABLE table_name;
```

### 参考サイト

その他のオプション等については、以下を参照。（バージョンが古いが現在も変更はないはず）

- [MySQL :: MySQL 5.1 リファレンスマニュアル (オンラインヘルプ) :: 3.3 mysqlcheck — テーブル保守プログラム](http://dev.mysql.com/doc/refman/5.1-olh/ja/mysqlcheck.html "MySQL :: MySQL 5.1 リファレンスマニュアル (オンラインヘルプ) :: 3.3 mysqlcheck — テーブル保守プログラム")
- [MySQL :: MySQL 5.1 リファレンスマニュアル :: 12.5.2.5 OPTIMIZE TABLE 構文](http://dev.mysql.com/doc/refman/5.1/ja/optimize-table.html "MySQL :: MySQL 5.1 リファレンスマニュアル :: 12.5.2.5 OPTIMIZE TABLE 構文")
- [MySQL :: MySQL 5.1 リファレンスマニュアル :: 12.5.2.1 ANALYZE TABLE 構文](http://dev.mysql.com/doc/refman/5.1/ja/analyze-table.html "MySQL :: MySQL 5.1 リファレンスマニュアル :: 12.5.2.1 ANALYZE TABLE 構文")

---

MySQL(MariaDB) に不具合が発生した際に参考にするための記事でした。

以上。

