---
layout   : single
title    : "MySQL(MariaDB) - スキーマのみ、データのみ、ストアド・トリガーのみのダンプ！"
published: true
date     : 2014-06-15 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
---

MySQL や MariaDB でダンプする際、場合によっては、スキーマ（テーブル作成情報等）のみ、データのみ、ストアド（プロシージャ、ファンクション）・トリガーのみをダンプしたいことがあります。（当方はよくあります）

以下、それぞれをダンプする方法についての備忘録です。

<!--more-->

### 0. 前提条件

- MySQL 5.6.16 サーバでの作業を想定。（MySQL 5.5 系や MariaDB でも同じ。旧バージョンは未確認）

### 1. スキーマ（ビューを含む）のみのダンプ

``` text
$ mysqldump -u root -p db_name --no-data --skip-triggers --skip-dump-date > only_schema.sql
```

### 2. データのみのダンプ

``` text
$ mysqldump -u root -p db_name --no-create-info --skip-triggers --skip-dump-date > only_data.sql
```

### 3. ストアドとトリガーのみ

``` text
$ mysqldump -u root -p db_name --no-create-info --no-data --routines --skip-dump-date > only_stored.sql
```

### 4. オプションの説明

- **`--no-data` オプションについて**  
  レコード挿入（`INSERT`） 文を出力しないオプション。 `-d` も同じ。  
  テーブル作成（`CREATE TABLE`）文のみ出力したい場合に使用する。
- **`--skip-dump-date` オプションについて**  
  デフォルトで有効になっている `--comments` によりダンプした日付等の追加情報も出力される。  
  この場合、ダンプしたデータの内容が同じでもダンプした日付が異なるためにファイルとしては別々のものと判定される。  
  そのようなことに不都合を感じる場合は、 `--skip-dump-date` オプションでダンプ日時情報を出力しないようにできる。  
  日付情報のみならず追加情報自体が不要なら、`--skip-comments` を使用すればよい。
- **`--no-create-info` オプションについて**  
  テーブル作成（`CREATE TABLE`）文を出力しないオプション。 `-t` も同じ。  
  大抵、ストアドのみ・データのみのダンプするの場合は別途スキーマのみダンプ出力しているはずである。スキーマダンプ時に出力した `CREATE TABLE` 文と重複しないようにするためにストアド・データダンプ時にこのオプションを使用するとよい。
- **`--routines` オプションについて**  
  ストアドプロシージャ・ファンクション、トリガーをダンプに含めるオプション。 `-R` も同じ。  
  このオプションを使用するには mysql.proc テーブルの SELECT 権限が必要。
- **`--default-character-set` オプションについて**  
  文字セットを指定するオプション。  
  このオプションを使用しない場合、デフォルトで UTF-8 で扱われる。  
  通常は使用する必要はないが、環境（データ）によっては文字化けが原因でリストアに失敗する。そのような場合は、ダンプ時とリストア時に `--default-character-set=binary` を使用すればよい。
- **`--skip-triggers`**  
  トリガーをダンプするオプション `--triggers` がデフォルトで有効になっている。  
  これを無効にしてトリガーをダンプしないにするオプション。

### 5. 参考サイト

- [MySQL :: MySQL 5.6 Reference Manual :: 4.5.4 mysqldump — A Database Backup Program](http://dev.mysql.com/doc/refman/5.6/en/mysqldump.html "MySQL :: MySQL 5.6 Reference Manual :: 4.5.4 mysqldump — A Database Backup Program")

---

普段はシェルに登録して行なっているので、直接コマンドを叩く際にすぐに思い出せない。  
すぐに参照できるように、と今回記録しておいた次第です。

以上。

