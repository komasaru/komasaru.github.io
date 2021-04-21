---
layout   : single
title    : "MySQL - 5.6 系で TIMESTAMP 型デフォルト値警告！"
published: true
date     : 2013-05-31 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
---

MySQL サーバ 5.6 系でサービス起動時等に以下のような警告メッセージがログに出力されます。

``` text 
[Warning] TIMESTAMP with implicit DEFAULT value is deprecated. 
Please use --explicit_defaults_for_timestamp server option (see documentation for more details).
```

`timestamp` 型の暗黙的なデフォルト値は非推奨とのことで、5.6.6 からの警告のようです。

- [MySQL :: MySQL 5.6 Reference Manual :: 5.1.4 Server System Variables](http://dev.mysql.com/doc/refman/5.6/en/server-system-variables.html#sysvar_explicit_defaults_for_timestamp "MySQL :: MySQL 5.6 Reference Manual :: 5.1.4 Server System Variables")

以下、現象確認と対策についての記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定しているが、OS・ディストリビューションは問わないはず。
- MySQL 5.6.11 での作業を想定。

#### 1. 設定確認

MySQL サーバに root でログインし、以下のようにして `explicit_defaults_for_timestamp` の値を確認する。

``` text 
mysql> show variables like 'explicit_defaults_for_timestamp';
+---------------------------------+-------+
| Variable_name                   | Value |
+---------------------------------+-------+
| explicit_defaults_for_timestamp | OFF   |
+---------------------------------+-------+
1 row in set (0.22 sec)
```

`OFF` になっている。  
`timestamp` 型に明示的にデフォルト値を設定しない（暗黙的なデフォルト値が設定される）ということ。  
つまり、`NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` が設定される。  
今は `OFF` に設定されているが、非推奨であるため、いずれ明示的にデフォルト値を設定しないといけくなる。

#### 2. 動作確認

テスト用DB（予め `test` を作成）で、`timestamp` 型のデフォルト値を指定せずにテーブルを作成してみる。

``` text 
mysql> CREATE TABLE hoge ( upd_time timestamp ) ENGINE=InnoDB;
Query OK, 0 rows affected (0.57 sec)

mysql> show create table hoge;
+-------+--------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                     |
+-------+--------------------------------------------------------------------------------------------------------------------------------------------------+
| hoge  | CREATE TABLE `hoge` (
  `upd_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 |
+-------+--------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.16 sec)
```

暗黙的に `NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` のデフォルト値が設定されている。

#### 3. 設定ファイル編集

設定ファイル（`my.cnf`）を以下のように編集する。

``` text 
[mysqld]
explicit_defaults_for_timestamp = true
```

#### 4. MySQL サーバ再起動

設定を有効化するため、MySQL サーバを再起動する。

``` text 
$ sudo /etc/init.d/mysqld restart
```

ログにも警告メッセージも出力されなくなった。

#### 5. 設定再確認

MySQL サーバに root でログインし、以下のようにして `explicit_defaults_for_timestamp` の値を確認する。

``` text 
mysql> show variables like 'explicit_defaults_for_timestamp';
+---------------------------------+-------+
| Variable_name                   | Value |
+---------------------------------+-------+
| explicit_defaults_for_timestamp | ON    |
+---------------------------------+-------+
1 row in set (0.22 sec)
```

`ON` になった。  
明示的に `timestamp` 型にデフォルト値を設定しないといけないということ。

#### 6. 動作再確認

まず、設定変更前と同じようにテーブルを作成してみる。

``` text 
mysql> CREATE TABLE fuga ( upd_time timestamp ) ENGINE=InnoDB;
Query OK, 0 rows affected (1.30 sec)

mysql> show create table fuga;
+-------+-----------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                        |
+-------+-----------------------------------------------------------------------------------------------------+
| fuga  | CREATE TABLE `fuga` (
  `upd_time` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 |
+-------+-----------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

`timestamp` 型のデフォルト値を明示的に指定していないので、`NULL DEFAULT NULL` となっている。

次に、明示的に `timestamp` 型のデフォルト値を指定してテーブルを作成してみる。

``` text 
mysql> CREATE TABLE hogefuga (
    -> upd_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    -> ) ENGINE=InnoDB;
Query OK, 0 rows affected (5.97 sec)

mysql> show create table hogefuga;
+----------+------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table    | Create Table                                                                                                                                         |
+----------+------------------------------------------------------------------------------------------------------------------------------------------------------+
| hogefuga | CREATE TABLE `hogefuga` (
  `upd_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 |
+----------+------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.23 sec)
```

指定した通りのデフォルト値が設定された。

#### 7. 参考サイト

- [MySQL :: MySQL 5.6 Reference Manual :: 5.1.4 Server System Variables](http://dev.mysql.com/doc/refman/5.6/en/server-system-variables.html#sysvar_explicit_defaults_for_timestamp "MySQL :: MySQL 5.6 Reference Manual :: 5.1.4 Server System Variables")

---

慌てて対応しなくてもよいかも知れませんが、気になるなら対応しておいた方がよいでしょう。

以上。

