---
layout   : single
title    : "MySQL - InnoDB データファイル ibdata1 の最適化！"
published: true
date     : 2013-08-03 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
---

MySQL のストレージエンジン InnoDB は、デフォルトでは ibdata1 というファイルにデータを保存・蓄積しています。  
そして、この ibdata1 ファイルは、データ領域が不足すると自動で拡張されるようになっています。（設定により初期サイズと拡張サイズは異なる）

ibdata1 ファイルのサイズは、データを削除しても縮小されることはないので、ファイルサイズはメンテナンスしないと日々拡大していきます。

以下、最適化についての記録です。

<!--more-->

### 0. 前提条件

- 対象の MySQL サーバのバージョンは 5.6.11
  （インストールは「[こちら](http://www.mk-mode.com/octopress/2013/05/30/mysql-5-6-install-by-src-build-to-mint/ "MySQL - 5.6.11 ソースビルドでインストール(on Linux Mint)！")」の方法で行なっている）
- 対象のデータベースがストレージエンジンに InnoDB を使用している。
- データファイルをテーブル単位で作成するように設定している。  
  この場合は、ibdata1 ファイル１個と、データベース用ディレクトリ配下にテーブル単位で ibd ファイル、frm ファイルが作成される。  
  デフォルトの設定の場合は、データベース１個に対し ibdata1 ファイル１個だけだがその場合も同様。

### 1. テーブルスペースファイルサイズの確認

テーブルスペースファイルのサイズを確認する。

``` bash 
# ls -l ib*
-rw-rw---- 1 mysql mysql  268435456  7月 22 09:32 ib_logfile0
-rw-rw---- 1 mysql mysql  268435456  7月 21 19:54 ib_logfile1
-rw-rw---- 1 mysql mysql 1610612736  7月 22 09:32 ibdata1

# ls -l hoge/
合計 32176744
-rw-rw---- 1 mysql mysql       8762  5月 12 09:56 a.frm
-rw-rw---- 1 mysql mysql 1501560832  7月 21 17:59 a.ibd
-rw-rw---- 1 mysql mysql       8784  5月 12 10:05 b.frm
-rw-rw---- 1 mysql mysql 2222981120  7月 21 17:59 b.ibd
-rw-rw---- 1 mysql mysql       8780  5月 12 10:16 c.frm
-rw-rw---- 1 mysql mysql 2139095040  7月 21 17:59 c.ibd
-rw-rw---- 1 mysql mysql       8912  5月 12 10:26 d.frm
-rw-rw---- 1 mysql mysql 2902458368  7月 21 17:59 d.ibd
-rw-rw---- 1 mysql mysql       8832  5月 12 10:40 e.frm
-rw-rw---- 1 mysql mysql 2306867200  7月 22 09:33 e.ibd
-rw-rw---- 1 mysql mysql       8786  5月 12 10:51 f.frm
-rw-rw---- 1 mysql mysql 2390753280  7月 21 15:24 f.ibd
-rw-rw---- 1 mysql mysql       8844  5月 12 11:01 g.frm
-rw-rw---- 1 mysql mysql 2650800128  7月 21 17:59 g.ibd
  :
  :
```

### 2. 最適化・その１

まず、よくある最適化の方法を試行してみる。  
MySQL サーバに root でログイン後、以下のようにテーブル単位で実行する。

``` bash 
mysql> use DB
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed

mysql> ALTER TABLE tbl_name ENGINE=INNODB;
Query OK, 0 rows affected (0.18 sec)
```

ただし、この方法は単純に最適化（テーブル再構成）されるだけであって、ibdata1, ibd ファイルが縮小されるわけではない。  
さらに、大きなサイズのデータベースやテーブルの場合、最適化に時間がかかりすぎる。

### 3. 最適化・その２

ファイルサイズを縮小させたければ、一端全てのデータベースに対してダンプエクスポート、テーブルスペースを再作成、ダンプインポートするといった手順が必要になる。

#### 3-1. ダンプファイルのエクスポート

`mysqldump` を使用して、ストレージエンジンに InnoDB を使用している**全て**のデータベースのダンプファイルをエクスポートする。  

``` bash 
$ mysqldump -u root -p hoge > dump_hoge.sql
```

#### 3-2. データベース削除

MySQL サーバに root でログイン後、InnoDB ストレージエンジンを使用しているデータベースを全て削除する。

``` bash 
mysql > DROP DATABASE hoge;
```

#### 3-3. MySQL サーバの停止

MySQL サーバを停止する。

``` bash 
$ service mysqld stop
```

#### 3-4. テーブルスペース削除

MySQL データディレクトリへ移動後、全てのテーブルスペースファイルを削除する。  
実際には、ibdata1, ib_logfile0, ib_logfile1 を削除する。

``` bash 
$ rm -f ib*
```

（InnoDB に関する設定を変更したければ、ここで（MySQL サーバを起動する前に） MySQL 設定ファイル "my.cnf" を編集する）

#### 3-5. MySQL サーバの起動

MySQL サーバを起動する。

``` bash 
$ service mysqld start
```

#### 3-6. データベース作成

MySQL サーバに root でログイン後、データベース（削除したデータベース。これからインポートしようとしているデータベース）を作成する。

``` bash 
mysql > CREATE DATABASE hoge;
```

#### 3-7. ダンプファイルのインポート

エクスポートしていた各データベースのダンプファイルをインポートする。

``` bash 
$ mysql -u root -p hoge < dump_hoge.sql
```

ただ、インポートするダンプファイルのサイズが大きい場合、InnoDB のデフォルトの設定ではインポートに時間がかる。  
適宜、設定ファイルで調整すること。（「[過去記事](http://www.mk-mode.com/octopress/2013/05/27/mysql-innodb-chuning/ "MySQL - InnoDB チューニング！")」参照）

### 4. テーブルスペースファイルサイズの再確認

最適化後のテーブルスペースファイルのサイズを確認してみる。

``` bash 
$ ls -l ib*
-rw-rw---- 1 mysql mysql  268435456  7月 22 21:50 ib_logfile0
-rw-rw---- 1 mysql mysql  268435456  7月 22 21:50 ib_logfile1
-rw-rw---- 1 mysql mysql 1073741824  7月 22 21:50 ibdata1

$ ls -l hoge/
合計 22819296
-rw-rw---- 1 mysql mysql       8762  7月 22 21:56 a.frm
-rw-rw---- 1 mysql mysql 1275068416  7月 22 22:12 a.ibd
-rw-rw---- 1 mysql mysql       8784  7月 22 22:12 b.frm
-rw-rw---- 1 mysql mysql 1488977920  7月 22 22:22 b.ibd
-rw-rw---- 1 mysql mysql       8780  7月 22 22:22 c.frm
-rw-rw---- 1 mysql mysql 1426063360  7月 22 22:32 c.ibd
-rw-rw---- 1 mysql mysql       8912  7月 22 22:34 d.frm
-rw-rw---- 1 mysql mysql 2004877312  7月 22 22:48 d.ibd
-rw-rw---- 1 mysql mysql       8832  7月 22 22:47 e.frm
-rw-rw---- 1 mysql mysql 1551892480  7月 22 22:59 e.ibd
-rw-rw---- 1 mysql mysql       8786  7月 22 22:58 f.frm
-rw-rw---- 1 mysql mysql 1614807040  7月 22 23:10 f.ibd
-rw-rw---- 1 mysql mysql       8844  7月 22 23:09 g.frm
-rw-rw---- 1 mysql mysql 1811939328  7月 22 23:23 g.ibd
  :
  :
```

明らかに、サイズが小さくなりました。

### 参考サイト

- [MySQL :: MySQL 5.6 Reference Manual :: 5.3.4 Defragmenting a Table](http://dev.mysql.com/doc/refman/5.6/en/innodb-file-defragmenting.html "MySQL :: MySQL 5.6 Reference Manual :: 5.3.4 Defragmenting a Table")

---

これで、多少すっきりしました。

データベースやテーブルのサイズが大きいと作業に時間がかかりますが、日々行う作業でもありませんし、作業が必要に感じた時でかつ作業を行う時間のある時に実行すればよいかと：思います。

以上。

