---
layout   : single
title    : "Debian 10 (buster) - rootkit 検出ツール chkrootkit インストール！"
published: true
date     : 2019-10-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 10 (buster) に rootkit 検出ツール chkrootkit をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* 接続元のマシンは LMDE 3(Linux Mint Debian Edition 3; 64bit) を想定。
* chkrootkit が検知できるのは既知の rootkit のみであり、新規の rootkit は検知できないことを認識しておく。
* chkrootkit では誤検知もあるので、検知結果は参考程度に留める。
* コマンド自体が改竄されてからでは遅いので、OS インストール直後に行うのがよいらしい。
* root ユーザでの作業を想定。

### 1. chkrootkit のインストール

``` text
# apt -y install chkrootkit
```

### 2. chkrootkit の実行

以下のようにして chkrootkit を実行してみる。  
問題のある（"INFECTED" の）場合のみ出力する。

``` text
# chkrootkit | grep INFECTED
```

### 3. 自動実行用スクリプト作成

**今は自動で /etc/cron.daily/chkrtootkit が作成され、毎日自動で実行されるので、この作業は不要**

これで、rootkit が仕掛けられていた場合に root 宛にメールが届くようになる。

---

以上。

