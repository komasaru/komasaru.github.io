---
layout   : single
title    : "LMDE 3 - Vim 最新版インストール（ソースビルド）！"
published: true
date     : 2018-11-05 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Vim
---

高機能テキストエディタ Vim の最新版を、 LMDE 3 (Linux Mint Debian Edition 3) にソースをビルドしてインストールする方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* 当記事執筆時点で最新の Vim 8.1 をインストールする。

### 1. 依存パッケージのインストール

``` text
$ sudo apt install git gettext libtinfo-dev libacl1-dev libgpm-dev
$ sudo apt install build-essential
$ sudo apt install libxmu-dev libgtk2.0-dev libxpm-dev
$ sudo apt install libperl-dev python3-dev ruby-dev
```

* 可能なら `sudo apt build-dep vim` でもよい。

### 2. ソースの取得

``` text
$ git clone https://github.com/vim/vim.git
```

### 3. ビルド＆インストール

``` text
$ cd vim/src
$ make distclean  # <= 過去にビルドしたことがある場合はクリーン
$ ./configure --with-features=huge --enable-gui=gtk2 --enable-fail-if-missing
$ make
$ sudo make install
```

* `configure` オプションについて
  + `--with-features=huge` は、ほとんどの機能を有効にしてコンパイルするオプション。
  + `--enable-gui=gtk2` は、 gvim (GTK2 GUI版)もビルドするためのオプション。
  + `--enable-fail-if-missing` は、足りないパッケージがある場合にエラーとするためのオプション。

### 4. 動作確認

取り急ぎ、バージョンを表示してみる。

``` text
$ vim --version
VIM - Vi IMproved 8.1 (2018 May 18, compiled Jul 24 2018 16:14:28)
適用済パッチ: 1-209

         :
===< 以下、省略 >===
         :
```

その他、各種操作も確認してみる。（但し、場合によっては Vim を Apt でインストールした環境と設定が異なり、調整が必要になるかもしれない）

---

以上、

