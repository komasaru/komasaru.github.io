---
layout   : single
title    : "MySQL(MariaDB) - innotop コマンド導入(on Linux Mint)！"
published: true
date     : 2015-02-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
- LinuxMint
---

こんにちは。

MySQL の各種状態を `top` コマンド風に表示して確認できるツール "innotop" コマンドをインストールします。

名称どおり対象のストレージエンジンは "InnoDB" ですが、当然 MariaDB にも対応しています。

<!--more-->

### 0. 前提条件

* MySQL 5.6.23 での作業を想定。
* インストール作業は root ユーザで作業を行う。  
  （一般ユーザで作業を行うと、インストール先がコマンドのみならずマニュアル等も一般ユーザディレクトリ配下になってしまうため）

### 1. 依存パッケージのインストール

``` text
# apt-get install libterm-readkey-perl libdbd-mysql-perl
```

### 2. ソースのダウンロード

「[innotop/innotop](https://github.com/innotop/innotop "innotop/innotop")」から `git clone` する。  
（ちなみに、innotop プロジェクト自体が Google Code から Git へ移行しているので、「[Downloads - innotop - A powerful top clone for MySQL - Google Project Hosting](https://code.google.com/p/innotop/downloads/list "Downloads - innotop - A powerful top clone for MySQL - Google Project Hosting")」のページにあるソースは古くバグもあるので注意）

``` text
# cd /usr/local/src

# git clone https://github.com/innotop/innotop
Cloning into 'innotop'...
remote: Counting objects: 377, done.
remote: Total 377 (delta 0), reused 0 (delta 0)
Receiving objects: 100% (377/377), 1.05 MiB | 288.00 KiB/s, done.
Resolving deltas: 100% (239/239), done.
Checking connectivity... done.
```

### 3. ビルド＆インストール

``` text
# cd innotop

# perl Makefile.PL
Checking if your kit is complete...
Looks good
Writing Makefile for innotop
Writing MYMETA.yml and MYMETA.json

# make install
cp innotop blib/script/innotop
/usr/bin/perl -MExtUtils::MY -e 'MY->fixin(shift)' -- blib/script/innotop
Manifying blib/man1/innotop.1p
Installing /usr/local/bin/innotop
Appending installation info to /usr/local/lib/perl/5.18.2/perllocal.pod
```

### 4. インストール確認

``` text
# innotop --version
innotop  Ver 1.10.0
```

### 5. 動作確認

実行は以下のように行う。  
（`-d` or `--delay` で更新間隔、 `-m` or `--mode` で表示モードを指定可能）  
（詳細は `man innotop` 等で確認）

以下は、 "C(ommnad Summary)" の例。

``` text
$ innotop -u root -p<root_password> -d 5 -m C
```

``` text
[RO] Command Summary (? for help) localhost, 2h10m, 0.20 QPS, 1/1/0 con/run/cac thds, 5.6.23-log

___________________ Command Summary ____________________
Name                    Value  Pct     Last Incr  Pct
Com_admin_commands        293  31.88%          1  33.33%
Com_show_status           264  28.73%          2  66.67%
Com_show_engine_status     86   9.36%          0   0.00%
Com_set_option             52   5.66%          0   0.00%
Com_show_master_status     51   5.55%          0   0.00%
Com_show_slave_status      49   5.33%          0   0.00%
Com_show_processlist       47   5.11%          0   0.00%
Com_insert                 32   3.48%          0   0.00%
Com_show_variables         24   2.61%          0   0.00%
Com_select                  8   0.87%          0   0.00%
Com_show_fields             6   0.65%          0   0.00%
Com_show_grants             3   0.33%          0   0.00%
Com_show_open_tables        3   0.33%          0   0.00%
Com_delete                  1   0.11%          0   0.00%
Com_alter_db_upgrade        0   0.00%          0   0.00%
Com_alter_db                0   0.00%          0   0.00%
Com_alter_event             0   0.00%          0   0.00%
```

以下は、 "Q(uery List)" の例。

``` text
$ innotop -u root -p<root_password> -d 5 -m Q
```

``` text
[RO] Query List (? for help) localhost, 2h11m, 0.60 QPS, 1/1/0 con/run/cac thds, 5.6.23-log

When   Load  Cxns  QPS   Slow  Se/In/Up/De%  QCacheHit  KCacheHit  BpsIn  BpsOut
Now    0.10     1  0.40     0   0/ 0/ 0/ 0       0.00%    100.00%  17.51    1.90k
Total  0.00   214  0.07     0   1/ 5/ 0/ 0       0.00%     50.00%   6.73  272.39

Cmd    ID      State               User   Host           DB
Query  339938  checking permissio  root   localhost      information_
Query  339939  checking permissio  root   localhost      information_
```

### 6. その他

* 当然、 `-h` or `--host` オプションでリモート接続も可能。
* 指定するモードによっては、リモート接続で `SUPER` 等の権限が必要。

### 7. 参考サイト

[innotop/innotop](https://github.com/innotop/innotop "innotop/innotop")

---

GUI ツールを使用したり、コマンドラインから `SHOW PROCESSLIST` を数秒間隔で表示させるなどして MySQL サーバの状態を確認するより、格段に便利でしょう。

以上。

