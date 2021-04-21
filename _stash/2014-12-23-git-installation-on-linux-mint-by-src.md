---
layout   : single
title    : "Git - Linux Mint へソースビルドでインストール！"
published: true
date     : 2014-12-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- LinuxMint
- Git
---

以前 Redhat 系 Linux へソースビルドでインストールする方法を記録していました。

* [Git - Linux にソースビルドでインストール！]({{site.baseurl}}/2014/04/02/git-installation-on-linux-by-src/ "Git - Linux にソースビルドでインストール！")

（但し、 この方法より「[Git - Git のインストール](http://git-scm.com/book/ja/v1/%E4%BD%BF%E3%81%84%E5%A7%8B%E3%82%81%E3%82%8B-Git%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB "Git - Git のインストール")」に記載されている方法の方が良いと思う）

今回は Linux Mint へソースビルドでインストールす方法の備忘録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* apt パッケージでインストールしていた git はアンインストール済み。

### 1. 依存パッケージのインストール

``` text
$ apt-get install libcurl4-gnutls-dev libexpat1-dev \
gettext libz-dev libssl-dev
```

### 2. アーカイブファイルの取得

``` text
$ wget https://www.kernel.org/pub/software/scm/git/git-2.2.1.tar.gz
$ tar zxvf git-2.2.1.tar.gz
```

### 3. ビルド＆インストール

``` text
$ cd git-2.2.1
$ make prefix=/usr/local all
$ sudo make prefix=/usr/local install
```

### 4. インストール確認

``` text
$ git --version
git version 2.2.1
```

その他、各種作業に問題がないことを確認しておく。  
(`git status`, `git add`, `git clone`, `git push`, `git pull` etc.)

### 5. 参考サイト

* [Git - Downloads](http://git-scm.com/downloads "Git - Downloads")
* [Git - Git のインストール](http://git-scm.com/book/ja/v1/%E4%BD%BF%E3%81%84%E5%A7%8B%E3%82%81%E3%82%8B-Git%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB "Git - Git のインストール")

---

これで、 apt パッケージでインストールできるバージョンに関係なく最新バージョンの Git が使用できるようになりました。

以上。

