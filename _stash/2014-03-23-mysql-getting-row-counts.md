---
layout   : single
title    : "MySQL - InnoDB 全テーブルのレコード数取得！"
published: true
date     : 2014-03-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
- シェル
- bash
---

よくある "information schema" からレコード数を取得する方法は、ストレージエンジン MyISAM では正確にレコード数が取得できるが、ストレージエンジン InnoDB では概算値となり正確に取得できない。

以下、コンソールから概算のレコード数を取得する方法と、正確なレコード数を取得するシェルスクリプトの紹介です。

<!--more-->

### 0. 前提条件

- MySQL 5.6.16 サーバでの作業を想定。（MariaDB でも同様だと思われる）

### 1. 手順１（概算値）

コンソール上で以下のように実行する。  
もちろん、MySQL サーバにログインして `SELECT ...` の部分を実行してもよい。  
また、リモートの MySQL サーバに対して実行したければ、オプション `-h＜IPアドレス＞` を追加すればよい。

``` text
$ mysql -uユーザ名 -pパスワード -e "SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = 'DB名';"
+------------------------------------------+------------+
| table_name                               | table_rows |
+------------------------------------------+------------+
| dat_Chois                                |        261 |
| dat_DoshaDetail1s                        |      32375 |
| dat_DoshaDetail2s                        |       1974 |
| dat_Doshas                               |        961 |
| dat_Gaikyos                              |      91833 |
            :
    ===< 途中省略 >===
            :
| mst_WeatherForecastRelations             |        171 |
| mst_WeatherForecastTelops                |        122 |
| mst_WeatherForecastWeeklyRelations       |         91 |
| mst_WeatherWarnings                      |         31 |
| mst_WmoObservingStations                 |        158 |
+------------------------------------------+------------+
```

### 2. 手順２（正確に取得するシェルスクリプト）

Bash スクリプトを以下のように作成する。  
テーブル別に `COUNT` を取得する SQL を生成し、それらを `UNION ALL` して実行する方法。  
また、リモートの MySQL サーバに対して実行したければ、最後の SQL 文実行部分でオプション `-h＜IPアドレス＞` を追加すればよい。

File: `mysql_row_counts.sh`

{% highlight bash linenos %}
#!/bin/bash

# DB 情報
USER=root
PW=xxxxxxxx
DB=xxxx

# テーブル一覧取得
TBLS=(`mysql -u${USER} -p${PW} -D${DB} -sN -e "SHOW TABLES"`)

# SQL 文生成
SQL=""
for TBL in ${TBLS[@]}; do
    SQL="${SQL} SELECT '${TBL}' AS table_name, COUNT(*) AS table_rows FROM ${TBL} UNION ALL"
done
# (最後の余分な UNION ALL を除去)
SQL="$(echo $SQL | sed -e 's/ UNION ALL$//')"

# SQL 文実行
mysql -u${USER} -p${PW} -D${DB} -e "${SQL}"
{% endhighlight %}

そして、実行する。

``` text
$ ./mysql_row_counts.sh
+------------------------------------------+------------+
| table_name                               | table_rows |
+------------------------------------------+------------+
| dat_Chois                                |        328 |
| dat_DoshaDetail1s                        |      35099 |
| dat_DoshaDetail2s                        |       1990 |
| dat_Doshas                               |        995 |
| dat_Gaikyos                              |      95469 |
            :
    ===< 途中省略 >===
            :
| mst_WeatherForecastRelations             |        171 |
| mst_WeatherForecastTelops                |        122 |
| mst_WeatherForecastWeeklyRelations       |         91 |
| mst_WeatherWarnings                      |         31 |
| mst_WmoObservingStations                 |        158 |
+------------------------------------------+------------+
```

テーブルによっては、information_schema で取得する値と異なることが分かる。

### 3. 参考サイト

- [MySQL :: MySQL 5.6 Reference Manual :: 20.23 The INFORMATION_SCHEMA TABLES Table](http://dev.mysql.com/doc/refman/5.6/en/tables-table.html "MySQL :: MySQL 5.6 Reference Manual :: 20.23 The INFORMATION_SCHEMA TABLES Table")

---

以上。

