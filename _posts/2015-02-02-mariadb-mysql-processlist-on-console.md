---
layout   : single
title    : "MariaDB(MySQL) - Server Status をコンソールでリアルタイムに監視！"
published: true
date     : 2015-02-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
- LinuxMint
---

こんにちは。

MariaDB(MySQL) の Server Status をコンソールでリアルタイムに監視する方法についての備忘録です。  

とは言っても、今は MySQL Workbench で監視したり、ターミナル上で `innotop` コマンドを使用することが多いですが。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* 監視する MariaDB サーバは別マシン(Debian GNU/Linux 7.8.0)に構築した 10.0.15 を想定。  
  （MariaDB, MySQL ならプラットフォームやバージョンによる違いはないはず）

### 1. Server Status 監視コマンド

以下のように実行するだけ。
以下は 5 秒間隔で IP アドレスが 192.168.11.11 であるマシンに構築した MariaDB サーバの Status を監視する例。  
（ローカルマシン上なら `-h` オプションは不要。当然、 IP アドレスでなくてもホスト名でもよい）

``` text
$ watch -n 5 mysqladmin processlist -h 192.168.11.11 -u root -p<root_password>
```

### 2. 監視

前項コマンド実行後、コンソールがクリアされて以下のように表示される。（一部マスク処理）

``` text
Every 5.0s: mysqladmin processlist -h 192.168.11.11 -u root -pXXXXXXXXXXXXXXX Wed Jan 28 23:56:37 2015

Warning: Using a password on the command line interface can be insecure.
+--------+------+------------------------+----+---------+------+-------+------------------+----------+
| Id     | User | Host                   | db | Command | Time | State | Info             | Progress |
+--------+------+------------------------+----+---------+------+-------+------------------+----------+
| 171008 | root | XXXX.mk-mode.com:51117 |    | Query   | 0    | init  | show processlist | 0.000    |
+--------+------+------------------------+----+---------+------+-------+------------------+----------+
```

---

単純に通常のコマンドを `watch` コマンドで繰り返し実行しているだけですが、結構重宝していました。

以上。

