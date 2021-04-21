---
layout   : single
title    : "MariaDB(MySQL) - 国土交通省・位置参照情報をデータベース化（その２）！"
published: true
date     : 2018-09-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
- シェル
- bash
- GIS
---
こんにちは。

国土交通省が公開している「位置参照情報」についてです。

「位置参照情報」には「街区レベル」と「大字・町丁目レベル」の２種類あります。要約すると、「街区レベル」は街区とその代表点座標を、「大字・町丁目レベル」は大字・町丁目とその代表点座標を対応付けた情報のことです。

以下は、「位置参照情報」を MariaDB(MySQL) でデータベース化する手順についての記録です。

（以前、「[MySQL(MariaDB) - 国土交通省・位置参照情報をデータベース化！]({{site.baseurl}}/2015/03/27/mysql-import-mlit-isj "MySQL(MariaDB) - 国土交通省・位置参照情報をデータベース化！")」でも紹介しましたが、今回は、緯度・経度を（double 型ではなく） **geometry 型** で登録し直したので、その記録です）

<!--more-->

### 0. 前提条件

* MariaDB 10.3.8 での作業を想定。（geometry 型の使用できるバージョンなら、 MySQL でも同様のはず）
* DB スキーマが作成済みである。（以下では `mlit_isj` としている）
* 今回は、全都道府県の全て（「街区レベル」＆「大字・町丁目レベル」）のデータ（データ整備年度が最新のもの）をダウンロードする。  
  （必要な都道府県や必要なデータ形式のみ選択してもよいが、その場合は展開されるディレクトリ名やファイル名が以下で紹介していものと若干異なるので注意）
* `unzip` コマンド `nkf` コマンドが導入済みであること。

### 1. データ形式

まず、街区レベル位置参照情報と大字・町丁目レベル位置参照情報のデータ形式について。

#### 1-1. 街区レベル位置参照情報

> 街区レベル位置参照情報のデータ形式は、CSV(Comma Separated Values)形式です。数字のコードはASCII、文字のコードはSHIFT-JISコードです。
> Ｘ・Ｙ座標および緯度経度座標の値は、世界測地系（日本測地系2000）です。現在旧日本測地系に基づくデータは提供しておりません。
> 平成24年度街区レベル位置参照情報データの項目は以下の通りです。（履歴フラグの部分はデータの作成・更新年度ごとに異なりますが、基本的にはどの年度のデータも同じフォーマットになっています。）

（引用元：国土交通省国土政策局GISHP【インターネットサービス】「[位置参照情報ダウンロードサービス - 位置参照情報のデータ形式](http://w3land.mlit.go.jp/isj/data.html "国土交通省国土政策局GISHP【インターネットサービス】 - 位置参照情報ダウンロードサービス - 位置参照情報のデータ形式")」）

<table class="common">
  <tr><th>項目</th><th>備考</th></tr>
  <tr><td>都道府県名</td><td>例：東京都</td></tr>
  <tr><td>市区町村名</td><td>例：千代田区</td></tr>
  <tr><td>大字・町丁目名</td><td>例：霞が関二丁目</td></tr>
  <tr><td>街区符号・地番</td><td>例：1</td></tr>
  <tr><td>座標系番号</td><td>平面直角座標系の座標系番号（1～19）<br />例：9</td></tr>
  <tr><td>Ｘ座標</td><td>平面直角座標系の座標系原点からの距離<br />メートル単位（小数第1位まで）（北方向プラス）<br />例：-35925.9</td></tr>
  <tr><td>Ｙ座標</td><td>平面直角座標系の座標系原点からの距離<br />メートル単位（小数第1位まで）（東方向プラス）<br />例：-7446.2</td></tr>
  <tr><td>緯度</td><td>十進経緯度（少数第6位まで）<br />例：35.676154</td></tr>
  <tr><td>経度</td><td>十進経緯度（少数第6位まで）<br />例：139.751074</td></tr>
  <tr><td>住居表示フラグ</td><td>1:住居表示実施、0:住居表示未実施<br />例：1</td></tr>
  <tr><td>代表フラグ</td><td>1:代表する、0:代表しない<br />例:0<br />１つの街区が道路などで分断され、１つの街区符号が複数の代表点に対応付けられる場合などに、そのうちの一つに便宜的に代表フラグを立てています。</td></tr>
  <tr><td>更新前履歴フラグ</td><td>1：新規作成、2：名称変更、3：削除、0：変更なし<br />例：0<br />2007年度および2008年度データに含まれるフラグを立てています。</td></tr>
  <tr><td>更新後履歴フラグ</td><td>1：新規作成、2：名称変更、3：削除、0：変更なし<br />例：0<br />2009年度以降のデータに含まれるフラグを立てています。</td></tr>
</table>

（引用元：国土交通省国土政策局GISHP【インターネットサービス】「[位置参照情報ダウンロードサービス - 位置参照情報のデータ形式](http://w3land.mlit.go.jp/isj/data.html "国土交通省国土政策局GISHP【インターネットサービス】 - 位置参照情報ダウンロードサービス - 位置参照情報のデータ形式")」）

#### 1-2. 大字・町丁目レベル位置参照情報

> 大字・町丁目レベル位置参照情報のデータ形式は、CSV(Comma Separated Values)形式です。数字のコードはASCII、文字のコードはSHIFT-JISコードです。
> 緯度経度座標の値は、世界測地系（日本測地系2000）です。旧日本測地系に基づくデータは提供しておりません。

（引用元：国土交通省国土政策局GISHP【インターネットサービス】「[位置参照情報ダウンロードサービス - 位置参照情報のデータ形式](http://w3land.mlit.go.jp/isj/data.html "国土交通省国土政策局GISHP【インターネットサービス】 - 位置参照情報ダウンロードサービス - 位置参照情報のデータ形式")」）

<table class="common">
  <tr><th>項目</th><th>備考</th></tr>
  <tr><td>都道府県コード</td><td>JIS都道府県コード</td></tr>
  <tr><td>都道府県名</td><td>当該範囲の都道府県名</td></tr>
  <tr><td>市区町村コード</td><td>JIS市区町村コード</td></tr>
  <tr><td>市区町村名</td><td>当該範囲の市区町村名<br />（郡部は郡名、政令指定都市の区名も含む）</td></tr>
  <tr><td>大字・町丁目コード</td><td>大字町丁目コード<br />（JIS市区町村コード＋独自7桁）</td></tr>
  <tr><td>大字・町丁目名</td><td>当該範囲の大字・町丁目名<br />（町丁目の数字は漢数字）</td></tr>
  <tr><td>緯度</td><td>十進経緯度<br />（少数第6位まで、半角）</td></tr>
  <tr><td>経度</td><td>十進経緯度<br />（少数第6位まで、半角）</td></tr>
  <tr><td>原典資料コード</td><td>大字・町丁目位置参照情報作成における原典資料を表すコード<br />1：自治体資料　2：街区レベル位置参照　3：1/25000地形図　0：その他資料</td></tr>
  <tr><td>大字・字・丁目区分コード</td><td>大字/字/丁目の区別を表すコード<br />1：大字　2：字　3：丁目　0：不明</td></tr>
</table>

（引用元：国土交通省国土政策局GISHP【インターネットサービス】「[位置参照情報ダウンロードサービス - 位置参照情報のデータ形式](http://w3land.mlit.go.jp/isj/data.html "国土交通省国土政策局GISHP【インターネットサービス】 - 位置参照情報ダウンロードサービス - 位置参照情報のデータ形式")」）

### 2. テーブルの作成

MySQL(MariaDB) サーバにテーブルを作成する。  
（CSV データのフィールド以外に自動採番の主キーカラムを追加している）

#### 2-1. 街区レベル位置参照情報

（実際今回の CSV データに含まれる最大文字数は、都道府県名：4、市区町村名：10、大字・町丁目名：15、街区符号・地番：9）

``` sql
CREATE TABLE blocks (
  id              INT(11)     NOT NULL AUTO_INCREMENT,
  pref_name       VARCHAR(4)  NOT NULL DEFAULT '',
  city_name       VARCHAR(20) NOT NULL DEFAULT '',
  town_name       VARCHAR(20) NOT NULL DEFAULT '',
  block_code      VARCHAR(20) NOT NULL DEFAULT '',
  coord_sys_no    TINYINT(3)  NOT NULL DEFAULT 0,
  coord_x         DOUBLE      NOT NULL DEFAULT 0.0,
  coord_y         DOUBLE      NOT NULL DEFAULT 0.0,
  loc             GEOMETRY    NOT NULL,
  flag_disp_addr  CHAR(1)     NOT NULL DEFAULT '0',
  flag_main       CHAR(1)     NOT NULL DEFAULT '0',
  flag_before_upd CHAR(1)     NOT NULL DEFAULT '0',
  flag_after_upd  CHAR(1)     NOT NULL DEFAULT '0',
  PRIMARY KEY (id),
  SPATIAL KEY `loc` (`loc`)
) ENGINE InnoDB DEFAULT CHARSET utf8;
```

#### 2-2. 大字・町丁目レベル位置参照情報

（実際今回の CSV データに含まれる最大文字数は、都道府県名：4、市区町村名：10、大字・町丁目名：18）

``` sql
CREATE TABLE towns (
  id            INT(11)     NOT NULL AUTO_INCREMENT,
  pref_code     CHAR(2)     NOT NULL DEFAULT '',
  pref_name     VARCHAR(4)  NOT NULL DEFAULT '',
  city_code     CHAR(5)     NOT NULL DEFAULT '',
  city_name     VARCHAR(20) NOT NULL DEFAULT '',
  town_code     CHAR(12)    NOT NULL DEFAULT '',
  town_name     VARCHAR(20) NOT NULL DEFAULT '',
  loc           GEOMETRY    NOT NULL,
  org_res_code  CHAR(1)     NOT NULL DEFAULT '',
  town_div_code CHAR(1)     NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  SPATIAL KEY `loc` (`loc`)
) ENGINE InnoDB DEFAULT CHARSET utf8;
```

### 3. データの準備

1. 国土交通省国土政策局GISHP【インターネットサービス】の「[位置参照情報ダウンロードサービス](http://w3land.mlit.go.jp/isj/index.html "国土交通省国土政策局GISHP【インターネットサービス】 - 位置参照情報ダウンロードサービス")」から、全都道府県の全て（「街区レベル」＆「大字・町丁目レベル」）のデータ（データ整備年度が最新のもの）をダウンロードする。
2. ダウンロードしたデータは zip 圧縮されているので展開する。
3. CSV データは文字エンコードが Shift-JIS であるので、テーブルに合わせて UTF-8 に変換、さらに改行コードを Unix(`\n`(LF)) に変換する。  
  （各ディレクトリ内で `nkf -w -Lu ??_????.csv > data.csv` を実行）  

ここで改行コードを Unix(`\n`(LF)) 変換しなかった場合は、次項の CSV データインポート時に指定する改行コードを `\r\n`(CRLF) にすること。

### 4. CSV データのインポート

以下のような SQL を実行して、CSV データを MySQL(MariaDB) にインポートする。（CSV ファイルのディレクトリは環境に合わせて適宜置き換える）

#### 4-1. 街区レベル位置参照情報

以下は "32000-12.0a" ディレクトリ内の UTF-8 変換後の CSV ファイルをインポートする例。  
（前項 3 で改行コードを Unix(`\n`(LF)) 変換しなかった場合は、以下の `\n` を `\r\n` にすること）

``` text
LOAD DATA LOCAL INFILE '/path/to/32000-12.0a/data.csv'
INTO TABLE blocks
CHARACTER SET utf8
FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '\\'
LINES TERMINATED BY '\n' STARTING BY ''
IGNORE 1 LINES
(@pref_name, @city_name, @town_name,
 @block_code, @coord_sys_no, @coord_x, @coord_y, @lat, @lon,
 @flag_disp_addr, @flag_main, @flag_before_upd, @flag_after_upd)
SET
pref_name = @pref_name,
city_name = @city_name,
town_name = @town_name,
block_code = @block_code,
coord_sys_no = @coord_sys_no,
coord_x = @coord_x,
coord_y = @coord_y,
loc = ST_GeomFromText(CONCAT('POINT(', @lon, ' ', @lat, ')')),
flag_disp_addr = @flag_disp_addr,
flag_main = @flag_main,
flag_before_upd = @flag_before_upd,
flag_after_upd = @flag_after_upd;
```

#### 4-2. 大字・町丁目レベル位置参照情報

以下は "32000-07.0b" ディレクトリ内の UTF-8 変換後の CSV ファイルをインポートする例。  
（前項 3 で改行コードを Unix(`\n`(LF)) 変換しなかった場合は、以下の `\n` を `\r\n` にすること）

``` text
LOAD DATA LOCAL INFILE '/path/to/32000-07.0b/data.csv'
INTO TABLE towns
CHARACTER SET utf8
FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '\\'
LINES TERMINATED BY '\n' STARTING BY ''
IGNORE 1 LINES
(@pref_code, @pref_name, @city_code, @city_name, @town_code,
 @town_name, @lat, @lon, @org_res_code, @town_div_code)
SET
pref_code = @pref_code, pref_name = @pref_name,
city_code = @city_code, city_name = @city_name,
town_code = @town_code, town_name = @town_name,
loc = ST_GeomFromText(CONCAT('POINT(', @lon, ' ', @lat, ')')),
org_res_code = @org_res_code,
town_div_code = @town_div_code;
```

### 5. 処理の自動化

当方は、ダウンロードした zip ファイル（全都道府県の「街区レベル」＆「大字・町丁目レベル」）を展開して DB にインポートする処理を以下のような Bash スクリプトで自動化している。  
以下の Bash スクリプトはダウンロードした zip ファイルと同じディレクトリに配置することを想定している。  
（`ESCAPED BY '\\'` の部分は Bash スクリプトのヒアドキュメント内では `ESCAPED BY '\\\'` とすること）

#### 5-1. 街区レベル位置参照情報

File: `import_blocks.sh`

{% highlight bash linenos %}
#!/bin/bash
# ================================
# 街区レベル位置参照情報インポート
# ================================
#
# 当 Bash スクリプト（& zip ファイル）のあるディレクトリ
DIR=$(cd $(dirname $0); pwd)
# CSV ファイル名（UTF-8 変換後）
CSV=data.csv
# DB 情報
DB_USER=root
DB_PW=XXXXXXXX
DB=mlit_isj
DB_TBL=blocks

# TABLE TRUNCATE
mysql -u $DB_USER -p$DB_PW $DB -e "TRUNCATE TABLE $DB_TBL"

# 都道府県別処理
for zip_file in `ls $DIR/*a.zip`; do
  # 作成されるサブディレクトリ名
  dir_sub=`basename $zip_file .zip`
  echo "* $dir_sub"

  # zip ファイル展開
  rm -rf $DIR/$dir_sub
  unzip $zip_file

  # UTF-8 変換, 改行コード Unix(\n) 変換
  nkf -w -Lu $dir_sub/??_????.* > $dir_sub/$CSV

  # CSV データインポート
  mysql --local-infile=1 -u $DB_USER -p$DB_PW $DB << EOS
    LOAD DATA LOCAL INFILE '$DIR/$dir_sub/$CSV'
    INTO TABLE $DB_TBL
    CHARACTER SET utf8
    FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '\\\'
    LINES TERMINATED BY '\n' STARTING BY ''
    IGNORE 1 LINES
    (@pref_name, @city_name, @town_name,
     @block_code, @coord_sys_no, @coord_x, @coord_y, @lat, @lon,
     @flag_disp_addr, @flag_main, @flag_before_upd, @flag_after_upd)
    SET
    pref_name = @pref_name,
    city_name = @city_name,
    town_name = @town_name,
    block_code = @block_code,
    coord_sys_no = @coord_sys_no,
    coord_x = @coord_x,
    coord_y = @coord_y,
    loc = ST_GeomFromText(CONCAT('POINT(', @lon, ' ', @lat, ')')),
    flag_disp_addr = @flag_disp_addr,
    flag_main = @flag_main,
    flag_before_upd = @flag_before_upd,
    flag_after_upd = @flag_after_upd;
EOS

  # csv ディレクトリ削除
  rm -rf $DIR/$dir_sub
done

read -p "Press ENTER key to close this terminal."
{% endhighlight %}

#### 5-2. 大字・町丁目レベル位置参照情報

File: `import_towns.sh`

{% highlight bash linenos %}
#!/bin/bash
# ========================================
# 大字・町丁目レベル位置参照情報インポート
# ========================================
#
# 当 Bash スクリプト（& zip ファイル）のあるディレクトリ
DIR=$(cd $(dirname $0); pwd)
# CSV ファイル名（UTF-8 変換後）
CSV=data.csv
# DB 情報
DB_USER=root
DB_PW=XXXXXXXX
DB=mlit_isj
DB_TBL=towns

# TABLE TRUNCATE
mysql -u $DB_USER -p$DB_PW $DB -e "TRUNCATE TABLE $DB_TBL"

# 都道府県別処理
for zip_file in `ls $DIR/*b.zip`; do
  # 作成されるサブディレクトリ名
  dir_sub=`basename $zip_file .zip`
  echo "* $dir_sub"

  # zip ファイル展開
  rm -rf $DIR/$dir_sub
  unzip $zip_file

  # UTF-8 変換, 改行コード Unix(\n) 変換
  nkf -w -Lu $dir_sub/??_????.* > $dir_sub/$CSV

  # CSV データインポート
  mysql --local-infile=1 -u $DB_USER -p$DB_PW $DB << EOS
    LOAD DATA LOCAL INFILE '$DIR/$dir_sub/$CSV'
    INTO TABLE $DB_TBL
    CHARACTER SET utf8
    FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '\\\'
    LINES TERMINATED BY '\n' STARTING BY ''
    IGNORE 1 LINES
    (@pref_code, @pref_name, @city_code, @city_name, @town_code,
     @town_name, @lat, @lon, @org_res_code, @town_div_code)
    SET
    pref_code = @pref_code, pref_name = @pref_name,
    city_code = @city_code, city_name = @city_name,
    town_code = @town_code, town_name = @town_name,
    loc = ST_GeomFromText(CONCAT('POINT(', @lon, ' ', @lat, ')')),
    org_res_code = @org_res_code,
    town_div_code = @town_div_code;
EOS

  # csv ディレクトリ削除
  rm -rf $DIR/$dir_sub
done

read -p "Press ENTER key to close this terminal."
{% endhighlight %}

### 6. 確認

処理終了後、インポートできているか確認する。（全都道府県で「街区レベル」が約 1,726 万レコード、「大字・町丁目レベル」が約 23 万レコード存在するはず）

``` text
mysql> SELECT pref_name, city_name, town_name, block_code, ST_AsText(loc),
    -> X(loc), Y(loc)
    -> FROM blocks ORDER BY id LIMIT 10;
+-----------+--------------------+--------------------------------+------------+-----------------------------+------------+-----------+
| pref_name | city_name          | town_name                      | block_code | ST_AsText(loc)              | X(loc)     | Y(loc)    |
+-----------+--------------------+--------------------------------+------------+-----------------------------+------------+-----------+
| 北海道    | 札幌市中央区       | 旭ケ丘五丁目                   | 5          | POINT(141.321212 43.037301) | 141.321212 | 43.037301 |
| 北海道    | 札幌市中央区       | 南七条西十一丁目               | 1281       | POINT(141.342094 43.050264) | 141.342094 | 43.050264 |
| 北海道    | 札幌市中央区       | 南三十条西十丁目               | 3          | POINT(141.346997 43.018933) | 141.346997 | 43.018933 |
| 北海道    | 札幌市中央区       | 南三十条西十丁目               | 2          | POINT(141.346589 43.019201) | 141.346589 | 43.019201 |
| 北海道    | 札幌市中央区       | 南二十五条西十三丁目           | 1          | POINT(141.34135 43.025739)  |  141.34135 | 43.025739 |
| 北海道    | 札幌市中央区       | 南二十五条西十三丁目           | 1          | POINT(141.340889 43.026055) | 141.340889 | 43.026055 |
| 北海道    | 札幌市中央区       | 南二十二条西六丁目             | 2          | POINT(141.352831 43.029995) | 141.352831 | 43.029995 |
| 北海道    | 札幌市中央区       | 南二十二条西六丁目             | 3          | POINT(141.353607 43.03022)  | 141.353607 |  43.03022 |
| 北海道    | 札幌市中央区       | 伏見五丁目                     | 2          | POINT(141.334589 43.03074)  | 141.334589 |  43.03074 |
| 北海道    | 札幌市中央区       | 南二十二条西六丁目             | 1          | POINT(141.352383 43.030803) | 141.352383 | 43.030803 |
+-----------+--------------------+--------------------------------+------------+-----------------------------+------------+-----------+
10 rows in set (0.060 sec)

mysql> SELECT pref_name, city_name, town_name, ST_AsText(loc),
    -> X(loc), Y(loc)
    -> FROM towns ORDER BY id LIMIT 10;
+-----------+--------------------+-----------------------+-----------------------------+------------+-----------+
| pref_name | city_name          | town_name             | ST_AsText(loc)              | X(loc)     | Y(loc)    |
+-----------+--------------------+-----------------------+-----------------------------+------------+-----------+
| 北海道    | 札幌市中央区       | 旭ヶ丘一丁目          | POINT(141.31998 43.041403)  |  141.31998 | 43.041403 |
| 北海道    | 札幌市中央区       | 旭ヶ丘二丁目          | POINT(141.321595 43.039804) | 141.321595 | 43.039804 |
| 北海道    | 札幌市中央区       | 旭ヶ丘三丁目          | POINT(141.319717 43.039789) | 141.319717 | 43.039789 |
| 北海道    | 札幌市中央区       | 旭ヶ丘四丁目          | POINT(141.3228 43.038765)   |   141.3228 | 43.038765 |
| 北海道    | 札幌市中央区       | 旭ヶ丘五丁目          | POINT(141.322718 43.037356) | 141.322718 | 43.037356 |
| 北海道    | 札幌市中央区       | 旭ヶ丘六丁目          | POINT(141.31897 43.037008)  |  141.31897 | 43.037008 |
| 北海道    | 札幌市中央区       | 円山                  | POINT(141.314493 43.048356) | 141.314493 | 43.048356 |
| 北海道    | 札幌市中央区       | 円山西町一丁目        | POINT(141.303129 43.048663) | 141.303129 | 43.048663 |
| 北海道    | 札幌市中央区       | 円山西町二丁目        | POINT(141.304846 43.044979) | 141.304846 | 43.044979 |
| 北海道    | 札幌市中央区       | 円山西町三丁目        | POINT(141.305022 43.043095) | 141.305022 | 43.043095 |
+-----------+--------------------+-----------------------+-----------------------------+------------+-----------+
10 rows in set (0.573 sec)
```

### 7. 参考サイト

* [Geometry Types - MariaDB Knowledge Base](https://mariadb.com/kb/en/library/geometry-types/ "Geometry Types - MariaDB Knowledge Base")

---

geometry 型に用意されている関数を使用すれば、 double 型で使用していたときよりも扱いやすくなるでしょう。

以上。

