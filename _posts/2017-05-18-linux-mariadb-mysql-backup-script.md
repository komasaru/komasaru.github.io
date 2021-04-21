---
layout   : single
title: 'Linux - MariaDB バックアップ用 Bash スクリプト！'
published: true
date     : 2017-05-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
- Debian
- bash
---

当方が Debian GNU/Linux 8.6 サーバ上のデータベース MariaDB(MySQL) をバックアップするのに使用している Bash スクリプトの紹介です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8.6 での作業を想定。（CentOS でも問題ない（以前、CentOS で使用していたものなので））
* バックアップする DB は MariaDB を想定。（MySQL でも問題ない（以前、MySQL で使用していたものなので））
* 環境の相違によりうまく動かないことがあるかもしれない。適宜、置き換えること。
* 今回紹介するスクリプトの概要。  
  + バックアップは DB 別にスキーマとデータを別々にバックアップする。
  + テーブル作成用 SQL の `AUTO_INCREMENT=*` は除去する。  
    （スキーマとデータを別々にバックアップすると、 `AUTO_INCREMENT=*` が残っていて都合が悪いということがあるため）
  + データはバックアップと同時に GZip 圧縮する。
  + バックアップファイルの名称には日時を付与する。
  + バックアップファイルは世代管理する。（8世代）
  + ストアドプロシージャやトリガのバックアップは考慮していない。  
    （ストアドプロシージャやトリガのみをバックアップしたい場合、 `--skip-triggers` の代わりに `-t` オプションを使用する）

### 1. バックアップ用 Bash スクリプト

（実際には他の処理もあるが、以下のスクリプトでは DB バックアップに関する部分のみを抜粋）

File: `backup_db.sh`

{% highlight bash linenos %}
#! /bin/bash

CNF="--defaults-extra-file=/etc/.my_root.cnf"
DBS=(db_foo db_bar db_baz)
CMD="nice -n 19 /usr/local/mysql/bin/mysqldump"
BAK_DIR=/home/backup/db
BAK_GEN=8
OPTS="--max-allowed-packet=128M --quote-names --skip-lock-tables --skip-triggers --skip-dump-date --single-transaction --master-data --flush-logs"

for DB in ${DBS[@]}
do
    echo $DB
    dt=`date '+%y%m%d_%H%M%S'`

    # Scheme (removing AUTO_INCREMENT)
    $CMD $CNF -d $OPTS $DB | sed 's/ AUTO_INCREMENT=[0-9]*//' > ${BAK_DIR}/${DB}_scheme_$dt.sql

    # Data
    $CMD $CNF -t $OPTS $DB | gzip > $BAK_DIR/${DB}_data_$dt.gz

    # 旧ファイルの削除
    if [ $(ls $BAK_DIR/${DB}_scheme*.sql | wc -l) -gt $BAK_GEN ]; then
        old_bak_cnt=`expr $(ls $BAK_DIR/${DB}_scheme*.sql | wc -l) - $BAK_GEN`
        for file in `ls -t $BAK_DIR/${DB}_scheme*.sql | tail -n $old_bak_cnt`
        do
            rm -f $file
        done
    fi
    if [ $(ls $BAK_DIR/${DB}_data*.gz | wc -l) -gt $BAK_GEN ]; then
        old_bak_cnt=`expr $(ls $BAK_DIR/${DB}_data*.gz | wc -l) - $BAK_GEN`
        for file in `ls -t $BAK_DIR/${DB}_data*.gz | tail -n $old_bak_cnt`
        do
            rm -f $file
        done
    fi
done;
{% endhighlight %}

* `CNF` は、 `[client]` にユーザ名とパスワードを記述したファイルを指定する。（後述）  
  （`mysqldump` コマンドにユーザ名とパスワードをオプションして実行すると安全でないという警告が出力されるが、警告出力を抑止するためにユーザ名とパスワードを別ファイルから読み込むようにする）
* `DBS` には、データベース名をスペースで区切って記述する。
* `CMD` には、実際に実行する `mysqldump` コマンドを記述する。  
  （`nice -n 19` はコマンドの実行優先度を最も低くするためのコマンドなので、指定しなくてもよい）
* `BAK_DIR` には、バックアップ先のディレクトリを記述する。
* `BAK_GEN` には、管理する世代を記述する。
* `OPTS` には、バックアップオプションを記述する。（スキーマ、データ共通）  
  （詳しくは、 `mysqldump` コマンドのオプションマニュアル等を参照）
* スキーマバックアップアップ時には、 `OPTS` とは別にデータをバックアップしない `-d` オプションを追加し、 `AUTO_INCREMENT=*` 部分を除去している。
* データバックアップ時には、 `OPTS` とは別にスキーマをバックアップしない `-t` オプションを追加し、同時に GZip 圧縮するようにしている。
* バックアップ完了後に指定した世代の数を超えた古いファイルを `wc` コマンド等を駆使して削除している。

そして、以下は "/etc/.my_root.cnf" の作成例。

File: `/etc/.my_root.cnf`

{% highlight bash linenos %}
[client]
user     = root
password = <root_password>
{% endhighlight %}

---

今回紹介のスクリプトを、自分の環境に合わせて色々と調整してみるのもよいでしょう。

また、当然ながら、バックアップしたスクリプトやデータが正常にリストア（復元）できることも確認しておきましょう。

以上。

