---
layout   : single
title    : "MySQL - CSV データインポート！"
published: true
date     : 2013-06-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
---

過去には、テーブルデータを CSV 出力する方法を記事にしていました。

- [* MySQL - SELECT結果をCSV出力！]({{site.baseurl}}/2011/08/31/31002049/ "* MySQL - SELECT結果をCSV出力！")

今回は、MySQL データベースのテーブルへ CSV ファイルからデータをインポートする方法についてです。

普段頻繁に利用しない方法なので、備忘録として残しておきます。

<!--more-->

#### 0. 前提条件

- OS や MySQL のバージョンは特に問わないはず。（MariaDB も同じ）
- インポート先 DB に該当のテーブルが作成済みである。
- 読み込む CSV ファイルの項目数・属性がインポート先テーブルのカラム数と一致している。
- 読み込む CSV ファイルにはヘッダ行は存在しない。（１行目からデータとなっている）
- CSV ファイルもテーブルも同じ文字コード（当方は "UTF-8"）になっている。
  （CSV ファイルとテーブルとで文字コードが異なると文字化けするかもしれない（未確認））

#### 1. インポート方法

MySQL サーバに root でログインし、以下のようにに実行する。  
以下は、"hoge.csv" という CSV ファイルを "hoge" というデータベースの "hogehoge" テーブルにインポートする例。  

``` text 
> use hoge;
> LOAD DATA INFILE 'hoge.csv' INTO TABLE `hogehoge` FIELDS TERMINATED BY ',' ENCLOSED BY '"';
```

- `FIELDS TERMINATED BY ','` はデータが `,` で区切られているという意味。
- ` ENCLOSED BY '"'` は各データが `"` で囲われているという意味。  
  （各データが `"` で囲まれていなければ不要）

#### 2. 参考サイト

- [MySQL :: MySQL 5.6 Reference Manual :: 13.2.6 LOAD DATA INFILE Syntax](http://dev.mysql.com/doc/refman/5.6/en/load-data.html "MySQL :: MySQL 5.6 Reference Manual :: 13.2.6 LOAD DATA INFILE Syntax")  
  （MySQL 5.5 にも英語の同様のページ、MySQL 5.1 には英語・日本語の同様のページがある）

---

めったに使用することはないが、データベース移行時等に備えて記録しておいた次第です。

以上。

