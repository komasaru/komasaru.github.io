---
layout   : single
title    : "Debian 10 (buster) - 仮想化ソフト VirtualBox のインストール！"
published: true
date     : 2020-02-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- munin
---

Debian GNU/Linux 10 (buster) に仮想化ソフト VirtualBox をインストールする方法についての記録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) へのインストールを想定。
* サーバ CUI 環境ではなく、ローカルな GUI 環境を想定。
* 当記事執筆時点で最新の 6.1.2 をインストール。

### 1. sources.list の編集

`/etc/apt/sources.list` に直接記述してもよいが、当方は `/etc/apt/sources.list.d/virtualbox.list` を作成した。

File: `/etc/apt/sources.list.d/virtualbox.list`

``` text
deb [arch=amd64] https://download.virtualbox.org/virtualbox/debian buster contrib
```

### 2. 署名キーの導入

署名キーの取得＆導入。

``` text
$ wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | sudo apt-key add -
$ wget -q https://www.virtualbox.org/download/oracle_vbox.asc -O- | sudo apt-key add -
```

参考までに、 `oracle_vbox_2016.asc` のフィンガープリントは次のとおり。

``` text
B9F8 D658 297A F3EF C18D  5CDF A2F6 83C5 2980 AECF
Oracle Corporation (VirtualBox archive signing key) <info@virtualbox.org>
```

`oracle_vbox.asc` のフィンガープリントは次のとおり。

``` text
7B0F AB3A 13B9 0743 5925  D9C9 5442 2A4B 98AB 5139
Oracle Corporation (VirtualBox archive signing key) <info@virtualbox.org>
```

### 3. VirtualBox のインストール

``` text
$ sudo apt update
$ sudo apt install virtualbox-6.1
```

### 4. インストールの確認

「メニュー」の「システム管理」に「Oracle VM VirtualBox」があるはず。

取り急ぎ、起動することを確認する。  
可能なら、その他の処理に問題がないことも確認する。

### 5. 参考

* [Linux_Downloads - Oracle VM VirtualBox](https://www.virtualbox.org/wiki/Linux_Downloads "Linux_Downloads - Oracle VM VirtualBox")

---

以上。

