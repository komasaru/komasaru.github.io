---
layout   : single
title    : "MariaDB(MySQL) - XML ダンプ出力から HTML テーブル定義書生成！"
published: true
date     : 2015-09-12 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- XML
- Linux
- MariaDB
- MySQL
---

MariaDB(MySQL) のテーブル定義書を HTML で生成する方法についての記録です。

実際には、スキーマ（テーブル定義）を XML 出力し、それに XSL テンプレートを適用します。

（テーブル定義を行なってからテーブルを作成するのが本来の手順でしょうが）

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* MariaDB 10.0.21 サーバでの作業を想定。
* HTML 生成に `xsltproc` コマンドを使用するので、未インストールならインストールしておく。

### 1. XML ダンプ出力

`mysqldump` コマンドを使用してスキーマ（テーブル定義）のみを XML フォーマットで出力する。  
（以下は `test` というデータベースの `towns` というテーブルを "test_towns.xml" という XML ファイルに出力する例）

``` text
$ mysqldump -u username -p --xml --no-data test towns > test_towns.xml
```

参考までに、今回出力された XML ファイルの内容は以下のとおり。

File: `text.xml`

{% highlight xml linenos %}
<?xml version="1.0"?>
<mysqldump xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<database name="test">
  <table_structure name="towns">
    <field Field="id" Type="int(11)" Null="NO" Key="PRI" Extra="auto_increment" Comment="" />
    <field Field="pref_code" Type="varchar(2)" Null="NO" Key="MUL" Default="" Extra="" Comment="" />
    <field Field="city_code" Type="varchar(5)" Null="NO" Key="MUL" Default="" Extra="" Comment="" />
    <field Field="town_code" Type="varchar(12)" Null="NO" Key="MUL" Default="" Extra="" Comment="" />
    <field Field="latitude" Type="double" Null="YES" Key="" Default="0" Extra="" Comment="" />
    <field Field="longitude" Type="double" Null="YES" Key="" Default="0" Extra="" Comment="" />
    <field Field="upd_datetime" Type="datetime" Null="YES" Key="" Default="0000-00-00 00:00:00" Extra="" Comment="" />
    <key Table="towns" Non_unique="0" Key_name="PRIMARY" Seq_in_index="1" Column_name="id" Collation="A" Cardinality="0" Null="" Index_type="BTREE" Comment="" Index_comment="" />
    <key Table="towns" Non_unique="1" Key_name="idx_1" Seq_in_index="1" Column_name="pref_code" Collation="A" Cardinality="0" Null="" Index_type="BTREE" Comment="" Index_comment="" />
    <key Table="towns" Non_unique="1" Key_name="idx_1" Seq_in_index="2" Column_name="city_code" Collation="A" Cardinality="0" Null="" Index_type="BTREE" Comment="" Index_comment="" />
    <key Table="towns" Non_unique="1" Key_name="idx_1" Seq_in_index="3" Column_name="town_code" Collation="A" Cardinality="0" Null="" Index_type="BTREE" Comment="" Index_comment="" />
    <key Table="towns" Non_unique="1" Key_name="idx_2" Seq_in_index="1" Column_name="city_code" Collation="A" Cardinality="0" Null="" Index_type="BTREE" Comment="" Index_comment="" />
    <key Table="towns" Non_unique="1" Key_name="idx_2" Seq_in_index="2" Column_name="town_code" Collation="A" Cardinality="0" Null="" Index_type="BTREE" Comment="" Index_comment="" />
    <key Table="towns" Non_unique="1" Key_name="idx_3" Seq_in_index="1" Column_name="town_code" Collation="A" Cardinality="0" Null="" Index_type="BTREE" Comment="" Index_comment="" />
    <options Name="towns" Engine="InnoDB" Version="10" Row_format="Compact" Rows="0" Avg_row_length="0" Data_length="16384" Max_data_length="0" Index_length="49152" Data_free="0" Auto_increment="1" Create_time="2015-08-18 14:06:07" Collation="utf8_general_ci" Create_options="" Comment="" />
  </table_structure>
</database>
</mysqldump>
{% endhighlight %}

ちなみに、今回使用しているテーブルの CREATE 文は以下のようになっている。

``` sql
CREATE TABLE `towns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pref_code` varchar(2) NOT NULL DEFAULT '',
  `city_code` varchar(5) NOT NULL DEFAULT '',
  `town_code` varchar(12) NOT NULL DEFAULT '',
  `latitude` double DEFAULT '0',
  `longitude` double DEFAULT '0',
  `upd_datetime` datetime DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `idx_1` (`pref_code`,`city_code`,`town_code`),
  KEY `idx_2` (`city_code`,`town_code`),
  KEY `idx_3` (`town_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### 2. XSL テンプレートの作成

以下のように XSL テンプレートを作成する。（あくまで一例。必要であれば適宜編集）

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  version="1.0">

  <xsl:output method="html" encoding="utf-8" version="1.0" />

  <xsl:template match="mysqldump">
    <html>
    <head>
      <title>データベース・テーブル定義</title>
      <style type="text/css">
        h2 {
          background-color: #8fbc8f;
          padding:          5px;
        }
        h4 {
          color:            #666;
          margin-top:       5px;
          margin-bottom:    5px;
        }
        table {
          border-collapse:  separate;
          border-spacing:   0px;
          border-top:       1px solid #ccc;
          border-left:      1px solid #ccc;
          margin-bottom:    5px;
        }
        table th {
          text-align:       left;
          vertical-align:   top;
          color:            #444;
          background-color: #ccc;
          border-top:       1px solid #fff;
          border-left:      1px solid #fff;
          border-right:     1px solid #ccc;
          border-bottom:    1px solid #ccc;
          padding:          4px;
          white-space:      nowrap;
        }
        table td {
          background-color: #fafafa;
          border-right:     1px solid #ccc;
          border-bottom:    1px solid #ccc;
          padding:          4px;
          white-space:      nowrap;
        }
        .tbl-db-name {
          margin-bottom:    10px;
        }
        .th-db-title {
          background-color: #bdb76b;
          width:            200px;
        }
        .th-tbl-title {
          width:            200px;
        }
        .td-name {
          width:            200px;
        }
        .th-no {
          width:            50px;
          text-align:       right;
        }
        .th-field,
        .th-type,
        .th-extra,
        .th-default,
        .th-comment,
        .th-keyname {
          width:            200px;
        }
        .th-null,
        .th-key {
          width:            50px;
        }
        .th-columns {
          width:            400px;
        }
        .th-nonunique {
          width:            100px;
        }
        .td-no {
          text-align:       right;
        }
      </style>
    </head>
    <body>
      <h2>データベース・テーブル定義書</h2>
      <xsl:apply-templates select="database" />
    </body>
    </html>
  </xsl:template>

  <xsl:template match="database">
    <table class="tbl-db-name">
      <tr>
        <th class="th-db-title">データベース名</th>
        <td class="td-name"><xsl:value-of select="@name" /></td>
      </tr>
    </table>
    <xsl:apply-templates select="table_structure" />
  </xsl:template>

  <xsl:template match="table_structure">
    <table>
      <tr>
        <th class="th-tbl-title">テーブル名</th>
        <td class="td-name"><xsl:value-of select="@name" /></td>
      </tr>
    </table>

    <h4>カラム情報</h4>
    <table>
      <thead>
        <tr>
          <th class="th-no"     >#</th>
          <th class="th-field"  >フィールド名</th>
          <th class="th-type"   >データ型</th>
          <th class="th-null"   >Null</th>
          <th class="th-key"    >キー</th>
          <th class="th-extra"  >Extra</th>
          <th class="th-default">デフォルト</th>
          <th class="th-comment">備考</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="field">
        <tr>
          <td class="td-no"><xsl:value-of select="position()"/></td>
          <td><xsl:value-of select="@Field"   /></td>
          <td><xsl:value-of select="@Type"    /></td>
          <td><xsl:value-of select="@Null"    /></td>
          <td><xsl:value-of select="@Key"     /></td>
          <td><xsl:value-of select="@Extra"   /></td>
          <td><xsl:value-of select="@Default" /></td>
          <td><xsl:value-of select="@Comment" /></td>
        </tr>
        </xsl:for-each>
      </tbody>
    </table>

    <h4>インデックス情報</h4>
    <table>
      <thead>
        <tr>
          <th class="th-keyname"  >インデックス名</th>
          <th class="th-columns"  >カラムリスト</th>
          <th class="th-nonunique">ユニーク</th>
          <th class="th-comment"  >備考</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="key">
          <xsl:variable name="key_name" select="@Key_name" />
          <xsl:if test="not(preceding-sibling::key[@Key_name=$key_name])">
          <tr>
            <td><xsl:value-of select="$key_name" /></td>
            <td>
              <xsl:for-each select="../key[@Key_name=$key_name]">
                <xsl:value-of select="@Column_name"/>
                <xsl:if test="position()!=last()">
                  <xsl:text>, </xsl:text>
                </xsl:if>
              </xsl:for-each>
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="@Non_unique='0'">1</xsl:when>
                <xsl:otherwise>0</xsl:otherwise>
              </xsl:choose>
            </td>
            <td><xsl:value-of select="@Comment"    /></td>
          </tr>
          </xsl:if>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:template>

  <xsl:template name="no_increment">
    <xsl:param name="no" />

    <xsl:value-of select="$no + 1" />
  </xsl:template>

</xsl:stylesheet>
```

* [Gist - XSL template to generate a HTML from a XML of MariaDB(MySQL)'s table definition.](https://gist.github.com/komasaru/ecce393eb6056d4c92a7 "Gist - XSL template to generate a HTML from a XML of MariaDB(MySQL)'s table definition.")

### 3. HTML の生成

`xsltproc` コマンドを使用して HTML を生成する。

``` text
$ xsltproc --output test_towns.html table_definition.xsl test_towns.xml
```

### 4. HTML の確認

生成された HTML を確認してみる。

File: `test_towns.html`

{% highlight html linenos %}
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>データベース・テーブル定義</title>
<style type="text/css">
        h2 {
          background-color: #8fbc8f;
          padding:          5px;
        }
        h4 {
          color:            #666;
          margin-top:       5px;
          margin-bottom:    5px;
        }
        table {
          border-collapse:  separate;
          border-spacing:   0px;
          border-top:       1px solid #ccc;
          border-left:      1px solid #ccc;
          margin-bottom:    5px;
        }
        table th {
          text-align:       left;
          vertical-align:   top;
          color:            #444;
          background-color: #ccc;
          border-top:       1px solid #fff;
          border-left:      1px solid #fff;
          border-right:     1px solid #ccc;
          border-bottom:    1px solid #ccc;
          padding:          4px;
          white-space:      nowrap;
        }
        table td {
          background-color: #fafafa;
          border-right:     1px solid #ccc;
          border-bottom:    1px solid #ccc;
          padding:          4px;
          white-space:      nowrap;
        }
        .tbl-db-name {
          margin-bottom:    10px;
        }
        .th-db-title {
          background-color: #bdb76b;
          width:            200px;
        }
        .th-tbl-title {
          width:            200px;
        }
        .td-name {
          width:            200px;
        }
        .th-no {
          width:            50px;
          text-align:       right;
        }
        .th-field,
        .th-type,
        .th-extra,
        .th-default,
        .th-comment,
        .th-keyname {
          width:            200px;
        }
        .th-null,
        .th-key {
          width:            50px;
        }
        .th-columns {
          width:            400px;
        }
        .th-nonunique {
          width:            100px;
        }
        .td-no {
          text-align:       right;
        }
      </style>
</head>
<body>
<h2>データベース・テーブル定義書</h2>
<table class="tbl-db-name"><tr>
<th class="th-db-title">データベース名</th>
<td class="td-name">test</td>
</tr></table>
<table><tr>
<th class="th-tbl-title">テーブル名</th>
<td class="td-name">towns</td>
</tr></table>
<h4>カラム情報</h4>
<table>
<thead><tr>
<th class="th-no">#</th>
<th class="th-field">フィールド名</th>
<th class="th-type">データ型</th>
<th class="th-null">Null</th>
<th class="th-key">キー</th>
<th class="th-extra">Extra</th>
<th class="th-default">デフォルト</th>
<th class="th-comment">備考</th>
</tr></thead>
<tbody>
<tr>
<td class="td-no">1</td>
<td>id</td>
<td>int(11)</td>
<td>NO</td>
<td>PRI</td>
<td>auto_increment</td>
<td></td>
<td></td>
</tr>
<tr>
<td class="td-no">2</td>
<td>pref_code</td>
<td>varchar(2)</td>
<td>NO</td>
<td>MUL</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td class="td-no">3</td>
<td>city_code</td>
<td>varchar(5)</td>
<td>NO</td>
<td>MUL</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td class="td-no">4</td>
<td>town_code</td>
<td>varchar(12)</td>
<td>NO</td>
<td>MUL</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td class="td-no">5</td>
<td>latitude</td>
<td>double</td>
<td>YES</td>
<td></td>
<td></td>
<td>0</td>
<td></td>
</tr>
<tr>
<td class="td-no">6</td>
<td>longitude</td>
<td>double</td>
<td>YES</td>
<td></td>
<td></td>
<td>0</td>
<td></td>
</tr>
<tr>
<td class="td-no">7</td>
<td>upd_datetime</td>
<td>datetime</td>
<td>YES</td>
<td></td>
<td></td>
<td>0000-00-00 00:00:00</td>
<td></td>
</tr>
</tbody>
</table>
<h4>インデックス情報</h4>
<table>
<thead><tr>
<th class="th-keyname">インデックス名</th>
<th class="th-columns">カラムリスト</th>
<th class="th-nonunique">ユニーク</th>
<th class="th-comment">備考</th>
</tr></thead>
<tbody>
<tr>
<td>PRIMARY</td>
<td>id</td>
<td>1</td>
<td></td>
</tr>
<tr>
<td>idx_1</td>
<td>pref_code, city_code, town_code</td>
<td>0</td>
<td></td>
</tr>
<tr>
<td>idx_2</td>
<td>city_code, town_code</td>
<td>0</td>
<td></td>
</tr>
<tr>
<td>idx_3</td>
<td>town_code</td>
<td>0</td>
<td></td>
</tr>
</tbody>
</table>
</body>
</html>
{% endhighlight %}

さらに、 HTML ファイルをブラウザで開いて確認してみる。

![TABLE_DEF_HTML]({{site.baseurl}}/images/2015/09/12/TABLE_DEF_HTML.png "TABLE_DEF_HTML")

---

大量にテーブル定義書を生成したければシェル化するのもよいでしょう。

以上。

