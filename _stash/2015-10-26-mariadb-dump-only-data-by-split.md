---
layout   : single
title    : "MariaDB(MySQL) - データのみを指定件数ずつ分割ダンプ出力！"
published: true
date     : 2015-10-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- MariaDB
- MySQL
- bash
---

MariaDB(MySQL) の指定したデータベースを、テーブル別にデータのみを指定件数ずつ分割してダンプ出力する方法についてです。

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* MariaDB 10.0.21 サーバでの作業を想定。（MySQL や他のバージョンでも同様（のはず））
* Bash スクリプトを作成して実現させる。
* 出力されたダンプファイルはまとめて圧縮保存する。
* 必要であれば、「[MySQL(MariaDB) - スキーマのみ、データのみ、ストアド・トリガーのみのダンプ！]({{site.baseurl}}/2014/06/15/mysql-dump-only-schema-data-stored/ "MySQL(MariaDB) - スキーマのみ、データのみ、ストアド・トリガーのみのダンプ！")」も参考にしてください。
* 以下で紹介する Bash スクリプトでは、トランザクションの単位がテーブル・ループ単位となるため、**データの整合性に注意**。  
  （**ダンプ出力時やリストア時に DB への挿入・更新・削除がないことが前提**）

### 1. Bash スクリプトの作成

以下は、当方がデータのみを分割ダンプ出力する際に使用している Bash スクリプトである。（解説はスクリプト内のコメントにて。 `(*)` はさらなる説明を後述）

File: `db_dump_only_data_by_split.sh`

{% highlight bash linenos %}
#!/bin/bash

# 定数定義
DB=db_name                      # データベース・スキーマ名
USER=user_name                  # ダンプ出力するユーザ名
PW=user_password                #       〃      ユーザ名のパスワード
CMD=/usr/bin/mysqldump          # mysqldump コマンドのフルパス
WK_DIR=/path/to/backup_mysql    # 作業ディレクトリ
DMP_DIR=$WK_DIR/tabledatas_$DB  # ダンプファイル格納ディレクトリ
OPTS="-t -Q -F --skip-lock-tables --skip-triggers --skip-dump-date --single-transaction"
                                # mysqldump オプション(*)
DCNT=100000                     # 分割するレコード件数

# ダンプファイルクリア
rm -f $DMP_DIR/*

# DB 内に存在するテーブル毎にループ処理
for tbl in `mysql -u $USER -p$PW -N -s -e "show tables in $DB;"`; do
  # テーブル内に存在するレコード件数(*)
  rows=`mysql -u $USER -p$PW $DB -N -B -e "SELECT COUNT(*) FROM $tbl;"`
  echo "* $tbl [$rows records]"

  # レコード件数から分割数を算出してループ処理
  for ((i = 0; i <= $(($rows / $DCNT)); i++))
  do
    # 出力ダンプファイル名
    fname=$(printf ${tbl}_%02d $i)
    # オフセット算出
    offset=$((i * $DCNT))
    echo "  $fname [OFFSET: $offset]"
    # ダンプ出力(*)
    $CMD -u $USER -p$PW $DB $tbl $OPTS -w "true LIMIT $offset, $DCNT"> $DMP_DIR/$fname.sql
  done;
done;

# タイムスタンプ付ファイル名で圧縮保存
cd $WK_DIR
dt=`date '+%Y%m%d_%H%M%S'`
tar zcvf ${DB}_tabledata_$dt.tar.gz tabledatas_$DB
{% endhighlight %}

* [Gist - Bash script to dump only records of MariaDB(MySQL) tables by split.](https://gist.github.com/komasaru/d9cae95bf4d30da5545b "Gist - Bash script to dump only records of MariaDB(MySQL) tables by split.")

mysqldump オプション（上記の`OPTS`）について。（mysqldump のデフォルトで有効のオプション `--opt` とは別のもの）

* `-t`(or `--no-create-info`) ... テーブル作成（CREATE TABLE）文を出力しないオプション。
* `-Q`(or `--quote-names`) ... データベース名、テーブル名、カラム名を `` ` `` で囲むオプション（デフォルトで有効）。
* `-F`(or `--flush-logs`) ... ダンプ開始前にログファイルをフラッシュするオプション。
* `--skip-lock-tables` ... デフォルトで有効になる全テーブルをロックするオプション `--lock-tables` を無効にするオプション。
* `--skip-triggers` ... trigger のダンプ出力を無効にするオプション。
* `--skip-dump-date` ... ダンプ日時の出力を無効にするオプション。
* `--single-transaction` ... データの整合性を保つためにダンプ処理をトランザクションで囲むオプション。
* ちなみに、主キーでソートせずに LIMIT(OFFSET) 句を使用するとフルスキャンになってしまうからと、 `--order-by-primary` という主キーでソートするオプションを使用すると、 Syntax error が発生しまう。従って、今回は使用していない。  
  主キーでソートしたければ、 `-w` オプションの `LIMIT` 句の前に `ORDER BY primary_key_col` のように追加する。（但し、今回紹介のケースでは DB 内全テーブルの主キーが同じカラムである必要がある）

レコード件数取得について。

* 上記では `SELECT COUNT(*) ...` としているが、データベース内の全テーブルに同じカラム名で主キーが設定してあるのなら `SELECT COUNT(col_name) ...` とした方がよい。

`OPTS` 以外に追加している `-w`(or `--where`) オプションについて。（**今回のポイント**）

* 本来 `-w` は抽出条件を指定するオプションだが、 WHERE 条件は `true`（or `1` or `1=1`） でスルーして `LIMIT` 句を指定している。  
  （mysqldump に LIMIT(OFFSET) 句を指定するオプションが存在しないため）
* `-w "true LIMIT $offset, $DCNT"` は `-w "true LIMIT $DCNT OFFSET $offset"` としてもよい。
* 主キーやユニークインデックスが歯抜けでなく件数が正確に取得できるのであれば、 `-w` オプションで LIMIT 句や OFFSET 句を指定せずに普通に条件指定するようにしてもよいだろう。
* プライマリキーでソートしたいからと `--order-by-primary` オプションを使用すると、 `WHERE true LIMIT 100000, 0 ORDER BY id` となってしまいシンタックスエラーとなる。  
  プライマリキーでソートしたい場合は、 `--order-by-primary` オプションを使用せず、 `-w true ORDER BY id LIMIT $offset, $DCNT` などとするとよい。

### 2. Bash スクリプトの実行

作業用ディレクトリやダンプファイル格納用サブディレクトリが存在することを確認し、実行権限を付与後に実行する。

``` text
$ chmod +x db_dump_only_data_by_split.sh
$ ./db_dump_only_data_by_split.sh
```

作業ディレクトリ内のダンプファイル格納用サブディレクトリにダンプファイルが出力され、作業ディレクトリ内にタイムスタンプ付圧縮ファイルが作成されるのを確認する。

また、 LIMIT 句を使用しているのでダンプ出力完了まで時間がかかることを覚悟すること。

### 3. その他

* データ量が多すぎるとダンプ出力に時間がかかる、ということに留意する。  
  `-w` オプションで LIMIT 句を使用するからと、フルスキャンを避けるために `--order-by-primary` オプションを使用したり、もしくは `-w` オプションで `ORDER BY` 句を指定しても、ダンプ出力が徐々に遅くなる。  
  `mysqldump` の `-w`(or `--where`) での LIMIT(OFFSET) 句指定はフルスキャンになってしまうのだろうか？（`mysqldump` を EXPLAIN で確認できればいいのですが。。。）
* データ量が多すぎるとダンプ出力に時間がかかるため、結局当方は、データ量が多すぎる場合は、エクスポートは `SELECT INTO ... OUTFILE` で CSV 出力、インポートは `LOAD DATA INFILE` で CSV 取り込み、とすることにした。以下の過去記事を参照。
  - [MySQL - SELECT結果をCSV出力！]({{site.baseurl}}/2011/08/31/31002049/ "MySQL - SELECT結果をCSV出力！")
  - [MySQL - CSV データインポート！]({{site.baseurl}}/2013/06/08/mysql-import-from-csv/ "MySQL - CSV データインポート！")

### 4. 参考サイト

mysqldump の各種オプションや LIMIT 句の指定方法については以下のサイトを参照。

* [MySQL :: MySQL 5.6 Reference Manual :: 4.5.4 mysqldump — A Database Backup Program](https://dev.mysql.com/doc/refman/5.6/en/mysqldump.html "MySQL :: MySQL 5.6 Reference Manual :: 4.5.4 mysqldump — A Database Backup Program")

---

結局、当方は今回紹介した方法を積極的には使用していませんが、こういうやり方もあるということを覚えておくと何かの際に役立つかもしれません。

以上。

