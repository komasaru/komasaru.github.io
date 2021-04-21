---
layout   : single
title    : "MariaDB(MySQL) - 既存 InnoDB ファイルフォーマットを Antelope から Barracuda に変換！"
published: true
date     : 2015-07-15 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
- Linux
---

MariaDB(MySQL) の既存 InnoDB ファイルフォーマットを Antelope から Barracuda に変換する方法についての記録です。

<!--more-->

### 0. 前提条件

* 当方は MariaDB 10.0.20 で動作確認を行なったが、別のバージョンや MySQL でも同様。
* InnoDB ストレージエンジンを使用する設定にしている。（**必須**）
* InnoDB データファイルをテーブルごとに作成するシステム変数 `innodb_file_per_table` を `1`（有効） にしている。（**必須**）
* 不測の事態に備えてデータのバックアップ（ダンプ）をとって作業を行うこと。（**重要**）

### 1. InnoDB ファイルフォーマットについて

InnoDB ファイルフォーマットの設定は MariaDB(MySQL) システム変数 `innodb_file_format` で行うが、設定していなければ `Antelope` がデフォルトで設定される。

* **Antelope フォーマット**  
  可変長カラム(VARBINARY, VARCHAR, BLOB, TEXT)の先頭768バイトを B-tree ノードのインデックスレコードに格納し、残りをオーバーフローページに格納する。
  - REDUNDANT ... かつてからの冗長な行フォーマット。
  - COMPACT ... MySQL 5.0 で追加された行フォーマットで、UTF-8 文字列の最適化などにより REDUNDANT よりもデータサイズが小さくなる。
* **Barracuda フォーマット**  
  可変長カラム(VARBINARY, VARCHAR, BLOB, TEXT)の全てを外部のオーバーフローページに格納し、クラスタインデックスレコードにそのページへのポインタ(20B)のみを格納する。
  - COMPRESSED ... データ圧縮（データサイズ縮小、 I/O 減少）を行う行フォーマット。
  - DYNAMIC ... データ圧縮は行わない行フォーマット。

### 2. 現状の確認

まず、現状の InnoDB ファイルフォーマットを確認。

``` text
> SHOW GLOBAL VARIABLES LIKE 'innodb_file_format';
+--------------------+----------+
| Variable_name      | Value    |
+--------------------+----------+
| innodb_file_format | Antelope |
+--------------------+----------+
```

テーブルの行フォーマットも確認。（以下の `Row_format`, `Create_options` の設定値）

``` text
> SHOW TABLE STATUS LIKE 'table_name'\G
*************************** 1. row ***************************
           Name: table_name
         Engine: InnoDB
        Version: 10
     Row_format: Compact
           Rows: 37070
 Avg_row_length: 240
    Data_length: 8929280
Max_data_length: 0
   Index_length: 0
      Data_free: 4194304
 Auto_increment: 18703
    Create_time: 2015-05-12 12:10:32
    Update_time: NULL
     Check_time: NULL
      Collation: utf8mb4_general_ci
       Checksum: NULL
 Create_options:
        Comment:
```

### 3. 設定の変更

設定ファイルの `mysqld` 部を以下のように編集後、 MariaDB(MySQL) サーバを再起動する。（設定ファイルのパスや名称は環境により異なる）  
（`innodb_file_format` を設定していない場合は、デフォルトの `Antelope` が適用される）

File: `/etc/mysql/conf.d/mariadb.cnf`

{% highlight text linenos %}
[mysqld]
innodb_file_per_table = 1
innodb_file_format = Barracuda
{% endhighlight %}

もしくは、MariaDB(MySQL) サーバに root でログイン後以下のように実行してもよい。（ただし、サーバを再起動すると設定が元に戻るので、この場合も設定ファイルを編集しておく必要はある）

``` text
> SET GLOBAL innodb_file_format = Barracuda;
```

### 4. 行フォーマットの変更

既存のテーブルの行フォーマット `ROW_FORMAT` を変更する。（以下は、 `DYNAMIC` を指定する例）  
（データ圧縮を行いたければ、 `COMPRESSED` を指定する）

``` text
> ALTER TABLE table_name ROW_FORMAT = DYNAMIC;
```

`DYNAMIC` でなく `COMPRESSED` に設定する場合は、 `KEY_BLOCK_SIZE` で圧縮後の InnoDB ページサイズを指定することも可能。（指定可能な値は `1`, `2`, `4`, `8`, `16`（デフォルト））

また、当然ながらテーブル新規作成時も同様に指定できる。

### 5. 変更後の確認

``` text
> SHOW GLOBAL VARIABLES LIKE 'innodb_file_format';
+--------------------+-----------+
| Variable_name      | Value     |
+--------------------+-----------+
| innodb_file_format | Barracuda |
+--------------------+-----------+
```

``` text
> SHOW TABLE STATUS LIKE 'table_name'\G
*************************** 1. row ***************************
           Name: table_name
         Engine: InnoDB
        Version: 10
     Row_format: Dynamic
           Rows: 35152
 Avg_row_length: 254
    Data_length: 8929280
Max_data_length: 0
   Index_length: 0
      Data_free: 0
 Auto_increment: 18703
    Create_time: 2015-06-04 13:40:09
    Update_time: NULL
     Check_time: NULL
      Collation: utf8mb4_general_ci
       Checksum: NULL
 Create_options: row_format=DYNAMIC
        Comment:
```

### 6. その他

上記 4 方法では、大きなテーブルの場合にメモリをふんだんに使用するせいでマシンが重くなるかもしれない。  
その場合は、以下のような手順で行フォーマットを変更することも可能。

1. 対象テーブルのダンプ（データのみ）を取得。（`mysqldump` コマンド実行時に `-t` オプションを付加）
2. 対象テーブルを truncate.
3. 上記 4 の方法で行フォーマットを変更。
4. 取得していたダンプ（データのみ）をリストア。

### 7. 参考サイト

* [MySQL :: MySQL 5.6 Reference Manual :: 14.8 InnoDB Row Storage and Row Formats](https://dev.mysql.com/doc/refman/5.6/en/innodb-row-format.html "MySQL :: MySQL 5.6 Reference Manual :: 14.8 InnoDB Row Storage and Row Formats")

---

ファイルフォーマット、行フォーマットが変更されたことで、パフォーマンスも良くなることでしょう。（当方、検証は行なっていないが、体感的に若干パフォーマンスが良くなったような気がする）

以上。

