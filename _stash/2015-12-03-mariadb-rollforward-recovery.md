---
layout   : single
title    : "MariaDB(MySQL) - ロールフォワード（ポイント・イン・タイム）リカバリ！"
published: true
date     : 2015-12-03 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
---

MariaDB(MySQL) で障害発生時に、定期的に取得していたダンプファイルでリストアするだけでは、当然タイミングによっては古い状態になってしまいます。

以下は、定期的に取得していたダンプファイルとそれより後のログファイルで障害発生直前の状態までリカバリする方法についての記録です。

<!--more-->

### 0. 前提条件

* MySQL 5.6 系、 MariaDB 10.0 系での作業を想定。  
  （他のバージョンでもそれほど古くなければ同様）
* バイナリロギングが有効になっている。
  （設定ファイル "my.cnf" で `log-bin=...` の行がコメント化されていない、もしくはサーバ起動時に `--log-bin` オプションを使用している）

### 1. はじめに

* ロールフォワードリカバリとは、簡単には、
  - バックアップファイルとジャーナルファイルを用いて、障害発生以前の状態に復元すること。（某国家試験で出題される基本的なこと）  
    今回の MariaDB(MySQL) での作業では、ダンプファイルとバイナリログファイルがそれにあたる。
* ポイント・イン・タイムリカバリ(Point-In-Time Recovery, PITR)とは、簡単には、
  - 指定した時間の状態に戻すこと。
  - 障害が発生する直前の状態まで戻すこと。
  - Oracle の「完全・不完全リカバリ」にあたるもの。

### 2. 基本的な作業の流れ

1. ダンプ出力（`mysqldump` による定期バックアップ）
2. 通常運用
3. 障害発生
4. ダンプファイルのリストア
5. バイナリログの適用（ダンプリストア後〜障害発生直前）
6. 復元確認

### 3. 作業例

当然ながら、当作業中は整合性を保つためにデータベースサーバへのアクセスが発生しないようにしておくこと。（アプリの停止、Web サーバの停止等）

#### 3-1. ダンプ出力（`mysqldump` による定期バックアップ）

以下のようなコマンドを cron 実行するなどして、定期的にバックアップを取る。

``` text
mysqldump -u root -proot_password --single-transaction --master-data --flush-logs db_name > db_name.sql
```

* `--single-transaction` は、データの整合性を保つためにダンプをトランザクションで囲むオプション。
* `--master-data` は、`CHANGE MASTER TO` 句（ポイント・イン・タイムリカバリを開始するバイナリファイル・ポイントの情報）を出力するオプション。
* `--flush-logs` は、ダンプ出力後にバイナリログを新しく作成（フラッシュ）するオプション。 `-F` も同じ。
* `--flush-logs` オプションを使用した場合は、ポイント・イン・タイムリカバリを開始するポイントは新しいバイナリファイルの先頭ポイントなので、 `--master-data` オプションを使用する不要はないかもしれない。
* `--master-logs` オプションを使用した場合は、ポイント・イン・タイムリカバリを開始するポイントが明確に分かるので、敢えて `--flush-logs` オプションを使用する必要はないかもしれない。
* 場合によっては、 `--quote-names`（or `-Q`）, `--skip-lock-tables` 等のオプションも使用。
* 場合によっては、 `--all-databases`（or `-A`）オプションで全 DB をダンプ出力してもよいだろう。

#### 3-2. 通常運用

当然ながら、ダンプ出力後も通常どおり運用されている。(INSERT, UPDATE, DELETE etc.)

#### 3-3. 障害発生

通常運用時に何らかの障害が発生する。（今回は、人為的なミスで１テーブルを `DROP` してしまったことを想定）

#### 3-4. ダンプファイルのリストア

障害発生時には、まず定期的に取っていたダンプファイルを使用してリストアする。

``` text
# mysql -u root -p db_name < db_name.sql
```

#### 3-5. バイナリログの適用（ダンプリストア後〜障害発生直前）

まず、ダンプファイルからポイント・イン・タイムリカバリを開始するバイナリログファイル・ポイントを確認する。

``` text
# cat /path/to/db_name.sql | CHANGE
CHANGE MASTER TO MASTER_LOG_FILE='mysql-bin.004962', MASTER_LOG_POS=365;
```

この例では、バイナリログファイル "mysql-bin.004962" の ポイント "365" より前まではダンプファイルでリストアできているということ。

次に、障害が発生したポイントを最新のバイナリログから検索する。

以下は、誤ってテーブル test_table を DROP してしまった場合にそのポイントを検索する例。  
該当行より３行くらい前にポイントが記載されているので、 `grep` コマンドに `-B 3` オプションを使用している。  
また、 "my.cnf" の `[client]` に `default-character-set` が存在すると `unknown variable` エラーが発生するため、`--no-defaults` オプションを使用している。

``` text
# mysqlbinlog --nodefaults --database=db_name /path/to/mysql-bin.004962 | grep -B 3 DROP
# at 10923096
#151029 11:15:17 server id 1  end_log_pos 10923228      Query   thread_id=1124470       exec_time=0     error_code=0
SET TIMESTAMP=1446084917/*!*/;
DROP TABLE test_table
```

この場合、ポイントは `10923096` であるということ。

いよいよ、バイナリログを適用する。  
以下は、バイナリログファイル "mysql-bin.004962" の先頭ポイントからポイント "10923096" の `--database` オプションで指定したデータベースのバイナリログを適用する例。
（`--disable-log-bin`（or `-D`） オプションはバイナリログの出力を無効にするオプション。バイナリログ適用時にまでバイナリログを出力する必要はないので）

``` text
# mysqlbinlog --database=db_name --disable-log-bin --stop-position=10923096 /path/to/mysql-bin.004962 | mysql -u root -p
```

ちなみに、ダンプ出力後のバイナリログファイルが複数ある場合は以下のように並べて記載する。  
この場合、`--stop-position` オプションは最後のバイナリログファイルに対してのみ有効。

``` text
# mysqlbinlog --database=db_name --disable-log-bin --stop-position=10923096 /path/to/mysql-bin.004960 /path/to/mysql-bin.004962 | mysql -u root -proot_password
```

仮にダンプ出力時に `--flush-logs` オプションを指定していなかった場合は開始ポイントが明確でないため、明示的に `--start-position` オプションで指定する必要がある。（バイナリログファイルが複数ある場合は `--start-position` は最初のバイナリログファイルに対してのみ有効）

#### 3-6. 復元確認

後は、正常に復元されたか確認するだけ。

### 4. その他＆注意事項

* 今回はポジションを意識したリカバリを行なったが、状況によっては日付を意識したリカバリも可能。（`--start-datatime`, `--stop-datetim` オプションを使用）
* `mysqlbinlog` コマンドでバイナリログファイルを複数指定する際は、一度に全て指定すること。（１ファイルずつ複数に分けて実行しない）
* バイナリログファイルが複数存在する場合は、１つにマージしてから `mysqlbinlog` を実行してもよい。
* `mysqlbinlog ... binlog | mysql -u root -p` のようにパイプを使用せず、 `mysqlbinlog ... binlog > statements.sql` 実行後に `mysql -u root -p < statements.sql` を実行してもよい。

### 5. 参考サイト

* [MySQL :: MySQL 5.6 リファレンスマニュアル :: 7.5 バイナリログを使用したポイントインタイム (増分) リカバリ](https://dev.mysql.com/doc/refman/5.6/ja/point-in-time-recovery.html "MySQL :: MySQL 5.6 リファレンスマニュアル :: 7.5 バイナリログを使用したポイントインタイム (増分) リカバリ")

---

有事の際にしか行わない作業なので、記録として残しておいた次第です。

以上。

