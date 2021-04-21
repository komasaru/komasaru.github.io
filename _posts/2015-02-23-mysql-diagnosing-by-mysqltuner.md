---
layout   : single
title    : "MySQL(MariaDB) - MySQLTuner でチューニング診断！"
published: true
date     : 2015-02-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
- MariaDB
---
こんにちは。

MySQL や MariaDB のチューニングを診断する MySQLTuner の導入についてです。

当方よく使用するツールですが、記事にしたことがなかった（記録を取っていなかった）ので、今回記録しておいた次第です。

<!--more-->

### 0. 前提条件

* MySQL 5.6.23 (on Linux Mint 17.1), MariaDB 5.5.41 (on CentOS 6.6), MariaDB 10.0.15 (on Debian GNU/Linux 7.8.0) で動作確認。  
  （付属の "README.md" に MySQL 5.6 系をサポートしているという情報はないが、問題なさそう。また、MariaDB 10.x 系はフルサポートされている訳ではない）
* インストール先は "/usr/local/src" ディレクトリ配下を想定。
* root ユーザでの作業を想定。

### 1. MySQLTuner のインストール

アーカイブファイルをダウンロード後、展開するだけでよい。（実行権限を付与されているはずだが、付与されていなければ付与する）

``` text
# cd /usr/local/src/
# wget -O MySQLTuner.zip https://github.com/rackerhacker/MySQLTuner-perl/archive/master.zip
# unzip MySQLTuner.zip
# cd MySQLTuner-perl-master
# chmod +x mysqltuner.pl
```

### 1. 診断の実行

MySQL(MariaDB) サーバが起動していることを確認して以下のように実行後、ユーザ名(root)・パスワード(root)を入力する。（以下はチューニングがまだ十分でない場合の例）

``` text
# ./mysqltuner.pl

 >>  MySQLTuner 1.4.0 - Major Hayden <major@mhtx.net>
 >>  Bug reports, feature requests, and downloads at http://mysqltuner.com/
 >>  Run with '--help' for additional options and output filtering
Please enter your MySQL administrative login: root
Please enter your MySQL administrative password:
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.
[OK] Currently running supported MySQL version 5.6.23-log
[OK] Operating on 64-bit architecture

-------- Storage Engine Statistics -------------------------------------------
[--] Status: Warning: Using a password on the command line interface can be insecure.
+ARCHIVE +BLACKHOLE +CSV -FEDERATED +InnoDB +MRG_MYISAM
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.
[--] Data in PERFORMANCE_SCHEMA tables: 0B (Tables: 52)
[--] Data in MyISAM tables: 0B (Tables: 4)
[--] Data in InnoDB tables: 16G (Tables: 302)
[!!] Total fragmented tables: 96
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.
Warning: Using a password on the command line interface can be insecure.

-------- Security Recommendations  -------------------------------------------
Warning: Using a password on the command line interface can be insecure.
[OK] All database users have passwords assigned
Warning: Using a password on the command line interface can be insecure.

-------- Performance Metrics -------------------------------------------------
[--] Up for: 2m 19s (147 q [1.058 qps], 31 conn, TX: 129K, RX: 18K)
[--] Reads / Writes: 87% / 13%
[--] Total buffers: 1.3G global + 7.4M per thread (214 max threads)
[OK] Maximum possible memory usage: 2.8G (72% of installed RAM)
[!!] Slow queries: 18% (27/147)
[OK] Highest usage of available connections: 1% (3/214)
[OK] Key buffer size / total MyISAM indexes: 128.0M/103.0K
[OK] Key buffer hit rate: 100.0% (1M cached / 0 reads)
[!!] Query cache efficiency: 7.6% (6 cached / 79 selects)
[OK] Query cache prunes per day: 0
[OK] Sorts requiring temporary tables: 10% (1 temp sorts / 10 sorts)
[!!] Joins performed without indexes: 3
[OK] Temporary tables created on disk: 25% (11 on disk / 43 total)
[OK] Thread cache hit rate: 90% (3 created / 31 connections)
[OK] Table cache hit rate: 98% (390 open / 397 opened)
[OK] Open file limit used: 5% (59/1K)
[OK] Table locks acquired immediately: 100% (280 immediate / 280 locks)
[!!] InnoDB  buffer pool / data size: 1.0G/16.1G
[OK] InnoDB log waits: 0
-------- Recommendations -----------------------------------------------------
General recommendations:
    Run OPTIMIZE TABLE to defragment tables for better performance
    MySQL started within last 24 hours - recommendations may be inaccurate
    Adjust your join queries to always utilize indexes
Variables to adjust:
    query_cache_limit (> 4M, or use smaller result sets)
    join_buffer_size (> 1.0M, or always use indexes with joins)
    innodb_buffer_pool_size (>= 16G)

```

以下のように、コマンド実行時にユーザ名・パスワードを指定してもよい。

``` text
# ./mysqltuner.pl -user root -pass <root_password>
```

### 2. チューニング

`[!!]` が警告である。この情報や `Recommendations` を参考にしてチューニングする（"my.cnf" の編集等を行う）。

ちなみに、 MySQL 5.6 系はパスワードを直接指定してアクセスすると、それが安全でないと警告する。`Warning: Using a password on the command line interface can be insecure.` はそのため（"mysqltuner.pl" がパスワードを指定してアクセスしているため）。

### 3. 参考サイト

* [major/MySQLTuner-perl](https://github.com/major/MySQLTuner-perl/ "major/MySQLTuner-perl")

---

以上。

