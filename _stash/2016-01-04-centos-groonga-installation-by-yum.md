---
layout   : single
title    : "CentOS - Groonga インストール（by yum パッケージ）！"
published: true
date     : 2016-01-04 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Groonga
---

カラムストア機能付き全文検索エンジン Groonga を、CentOS 6.7 に Groonga 公式 yum リポジトリを使用してインストールする方法についてです。

<!--more-->

### 0. 前提条件

* CentOS 6.7(32bit) での作業を想定。
* 当記事執筆時点で最新の Groonga 5.1.0 をインストールする。

### 1. yum リポジトリの導入

``` text
# rpm -ivh http://packages.groonga.org/centos/groonga-release-1.1.0-1.noarch.rpm
# yum makecache
```

### 2. Groonga のインストール

``` text
# yum -y install groonga
```

形態素解析エンジン MeCab をトークナイザとして使用するために groonga-tokenizer-mecab をインストールする。

``` text
# yum -y install groonga-tokenizer-mecab
```

### 3. Groonga インストールの確認

``` text
# groonga --version
Groonga 5.1.0 [linux-gnu,i686,utf8,match-escalation-threshold=0,nfkc,mecab,mruby,onigmo,zlib,epoll]

configure options: < '--build=i686-redhat-linux-gnu' '--host=i686-redhat-linux-gnu'
 '--target=i686-redhat-linux-gnu' '--program-prefix=' '--prefix=/usr' '--exec-prefix=/usr'
 '--bindir=/usr/bin' '--sbindir=/usr/sbin' '--sysconfdir=/etc' '--datadir=/usr/share'
 '--includedir=/usr/include' '--libdir=/usr/lib' '--libexecdir=/usr/libexec'
 '--localstatedir=/var' '--sharedstatedir=/var/lib' '--mandir=/usr/share/man'
 '--infodir=/usr/share/info' '--disable-static' '--with-package-platform=redhat'
 '--with-mecab' '--with-munin-plugins' '--enable-mruby' 'build_alias=i686-redhat-linux-gnu'
 'host_alias=i686-redhat-linux-gnu' 'target_alias=i686-redhat-linux-gnu'
 'CFLAGS=-O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector
  --param=ssp-buffer-size=4 -m32 -march=i686 -mtune=atom -fasynchronous-unwind-tables'
 'CXXFLAGS=-O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector
  --param=ssp-buffer-size=4 -m32 -march=i686 -mtune=atom -fasynchronous-unwind-tables'
 'PKG_CONFIG_PATH=:/usr/lib/pkgconfig:/usr/share/pkgconfig'>
```

### 4. 動作確認

以下の過去記事を参照。

* [Linux Mint - Groonga インストール（by ソースビルド）！]({{site.baseurl}}/2015/08/09/linux-mint-groonga-installation-by-src/ "Linux Mint - Groonga インストール（by ソースビルド）！")

### 5. 参考サイト

* [2.5. CentOS — Groonga v5.1.0ドキュメント](http://groonga.org/ja/docs/install/centos.html#centos-6 "2.5. CentOS — Groonga v5.1.0ドキュメント")

---

以上。

