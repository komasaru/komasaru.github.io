---
layout   : single
title    : "MySQL - InnoDB データファイルをテーブル単位に変更！"
published: true
date     : 2013-05-28 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
---

MySQL でストレージエンジンに InnoDB を指定していると、データファイル・ログファイルが作成されます。  
デフォルトでは、データファイル（`ibdata1`）はデータベースが複数あっても１つのファイルとして作成されます。  

これだと、データベースが複数あったりサイズが膨大になったりすると、パフォーマンスが悪くなるだけでなく管理も煩雑になってしまいます。

設定ファイルに `innodb_file_per_table` を設定することで、このデータファイルをテーブル単位で管理できるようになります。  
ただ、既にデータベースを InnoDB で運用している場合は、今後作成するテーブルに対してのみ適用され、既存のテーブルについては適用されません。  
そこで、既存のテーブルに対しても適用させる方法を以下に記録しておきます。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia(64bit) での作業を想定。
- MySQL 5.5.31 での作業を想定。  
  （5.1 系や 5.6 系、MariaDB でもだいたい同じであるが、若干異なる部分もある）
- ストレージエンジン InnoDB の仕組みについてある程度理解できている。
- MySQL のデータディレクトリは `/var/lib/mysql/` を想定。
- 膨大データのインポート高速化については、前回の記事を参照ください。  
  ( [MySQL - InnoDB チューニング！]({{site.baseurl}}/2013/05/27/mysql-innodb-chuning/ "MySQL - InnoDB チューニング！") )

#### 1. データベースバックアップ

既存の InnoDB のデータベース全てを `mysqldump` でエクスポートする。

``` bash 
$ mysqldump -uroot -p hoge > db_hoge
```

ちなみに、MySQL 運用中なら `--lock-all-tables` オプションを指定して（テーブルをロックして）エクスポートした方がよいだろう。

#### 2. データベース削除

MySQL サーバに root でログインして、既存の InnoDB のデータベース全てを削除する。

``` bash 
mysql> DROP DATABASE hoge;
```

#### 3. MySQL 停止

MySQL サービスを停止する。

``` bash 
$ sudo service mysql stop
```

#### 4. データファイル・ログファイル削除

データファイル（"ibdata1"）とフォルファイル（"ib_logfile0", "ib_logfile1"）を削除する。

``` bash 
$ sudo rm -f /var/lib/mysql/ibdata1
$ sudo rm -f /var/lib/mysql/ib_logfile*
```

#### 5. 設定ファイル編集

MySQL 設定ファイルの `[mysqld]` に以下の記述を追加する。

File: `/etc/mysql/my.cnf`

{% highlight bash linenos %}
innodb_file_per_table
{% endhighlight %}

#### 6. MySQL 起動

MySQL サービスを再起動する。

``` bash 
$ sudo service mysql restart
```

#### 7. 設定確認

MySQL サーバに root でログインして、設定が反映されているか（`innodb_file_per_table` が `ON`になっているか）確認する。

``` bash 
mysql> SHOW VARIABLES LIKE 'innodb_file_per_table';
+-----------------------+-------+
| Variable_name         | Value |
+-----------------------+-------+
| innodb_file_per_table | ON    |
+-----------------------+-------+
1 row in set (0.00 sec)
```

#### 8. データベース作成

MySQL サーバに root でログインして、削除したデータベースを改めて作成する。

``` bash 
mysql> CREATE DATABASE hoge;
```

#### 9. データベースリストア

エクスポートしていたデータを、改めて作成したデータベースにインポートする。

``` bash 
$ sudo mysql -uroot -p hoge < db_hoge
```

#### 10. 動作確認

データファイルがテーブル別に作成されていることを確認する。  
（データファイルはテーブル別のディレクトリ配下に作成される）  
**MySQL データディレクトリに再度 "ibdata1", "ib_logfile0", "ib_logfile1" が作成されるが、共有データなので削除してはいけない。**

``` bash 
$ sudo ls -l /var/lib/mysql/hoge/
```

---

管理は明らかにしやすくなっています。  
パフォーマンスが良くなったか否かの判断は、実際に運用してみてから行うつもりです。

以上。

