---
layout   : single
title    : "MySQL - テーブル定義/データのみダンプ出力！"
published: true
date     : 2013-05-25 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
---

MySQL のダンプ出力に関しては、以前以下のような内容を記事にしました。

- [* MySQL - テーブル単位でダンプファイル出力！]({{site.baseurl}}/2012/05/12/12002031/ "* MySQL - テーブル単位でダンプファイル出力！")
- [* MySQL - 圧縮しながらダンプ出力！]({{site.baseurl}}/2012/06/16/16002013/ "* MySQL - 圧縮しながらダンプ出力！")

今回は、ダンプ出力時にテーブル定義のみを出力したり、テーブルデータのみを出力したりする方法についての記録です。

<!--more-->

#### 0. 前提条件

- MySQL 5.5.31 での作業を想定。  
  （バージョンは特に問わない。また、MariaDB でも同じはず）

#### 1. テーブル定義のみダンプ出力

テーブル定義のみを出力する、つまりテーブル行情報を出力しない場合は、 `--no-data` または `-d` オプションを指定する。  
（テーブル名を指定しない場合はデータベース単位でダンプされる）

``` text 
$ mysqldump -uroot -phogehoge -d DB名 [テーブル名]
```

#### 2. データのみダンプ出力

テーブルデータ（`insert 文`）のみを出力する、つまりテーブル定義を出力しない場合は、 `--no-create-info` または `-t`オプションを指定する。
（テーブル名を指定しない場合はデータベース単位でダンプされる）

``` text 
$ mysqldump -uroot -phogehoge -t DB名 [テーブル名]
```

#### 3. 参考サイト

- [MySQL :: MySQL 5.6 Reference Manual :: 4.5.4 mysqldump — A Database Backup Program](http://dev.mysql.com/doc/refman/5.6/en/mysqldump.html "MySQL :: MySQL 5.6 Reference Manual :: 4.5.4 mysqldump — A Database Backup Program")

#### 4. その他

ストレージエンジンが MyISAM だけのデータベースの場合は、 `mysqldump` より `mysqlhotcopy` の方が良いようだ（高速のようだ）。

---

普段、ダンプ出力の際はテーブル定義とテーブルデータをまとめて出力していますが、データだけ（もしくはテーブル定義だけ）をエクスポート＆インポートしたくなる局面があるため記録しておいた次第です。（ストレージエンジン移行時等）

以上。

