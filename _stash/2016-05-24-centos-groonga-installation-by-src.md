---
layout   : single
title    : "CentOS 6.7 - Groonga インストール（by ソースビルド）！"
published: true
date     : 2016-05-24 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- CentOS
- Groonga
---

オープンソースのカラムストア機能付き全文検索エンジン [Groonga](http://groonga.org/ja/ "Groonga - カラムストア機能付き全文検索エンジン") を、 CentOS にソースをビルドしてインストールする方法についての記録です。

ちなみに、以前、 Linux Mint にソースをビルドしてインストールする方法については紹介しました。

* [Linux Mint - Groonga インストール（by ソースビルド）！]({{site.baseurl}}/2015/08/09/linux-mint-groonga-installation-by-src/ "Linux Mint - Groonga インストール（by ソースビルド）！")

<!--more-->

### 0. 前提条件

* CentOS 6.7(32bit) での作業を想定。
* 当記事執筆時点で最新の Groonga 6.0.2 をソースをビルドしてインストールする。
* ここでは、全文検索がどういうものかという説明はしない。

### 1. 依存パッケージのインストール

``` text
# yum -y install wget tar gcc-c++ make mecab
```

（`mecab` はトークナイザに MeCab を使用したい場合のみ）

### 2. ソースコードの取得

アーカイブを取得後、展開する。

``` text
# cd /usr/local/src/
# wget http://packages.groonga.org/source/groonga/groonga-6.0.2.tar.gz
# tar zxvf groonga-6.0.2.tar.gz
```

### 3. ビルド＆インストール

``` text
# cd groonga-6.0.2
# ./configure
# make -j$(grep '^processor' /proc/cpuinfo | wc -l)
# make install
```

（`make` の `-j` オプションは、 CPU プロセッサ数が1個であったり、ビルドに要する時間を気にしないなら使用しなくてもよい）

### 4. インストールの確認

バージョンを表示してみて、インストールできているかを確認する。

``` text
# groonga --version
Groonga 6.0.2 [linux-gnu,i686,utf8,match-escalation-threshold=0,nfkc,onigmo,zlib,epoll]

configure options: <>
```

（`configure` 時にオプションを指定していれば `configure options: ` に記載される）

### 5. 動作確認

必要なら、各種動作確認をしてみる。

当ブログの過去記事を参照。

* [Linux Mint - Groonga インストール（by ソースビルド）！](http://www.mk-mode.com/octopress/2015/08/09/linux-mint-groonga-installation-by-src/ "Linux Mint - Groonga インストール（by ソースビルド）！")

### 6. 参考サイト

* [Groonga - カラムストア機能付き全文検索エンジン](http://groonga.org/ja/ "Groonga - カラムストア機能付き全文検索エンジン")

---

以上。

