---
layout   : single
title: 'Linux - 圧縮済みテキストファイルを展開せずに閲覧！'
published: true
date     : 2017-06-23 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

Linux で、圧縮したファイルを展開（解凍）することなく閲覧する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2; 64bit) での作業を想定。
* ファイル閲覧には `less` コマンドを使用。

### 1. tar.gz ファイルの場合

``` text
$ tar zxOf test.tar.gz | less
```

* `O` は英大文字の「オー」
* 圧縮ファイルが複数のテキストファイルを圧縮したものなら、全てを閲覧可能。

圧縮ファイル中の特定のファイルのみを閲覧したければ、そのファイル名を明示する。

``` text
$ tar zxOf test.tar.gz test_1.txt | less
```

### 2. gz ファイルの場合

``` text
$ gunzip -c test.gz | less
```

### 3. zip ファイルの場合

``` text
$ unzip -c test.zip | less
```

* 複数のテキストファイルを圧縮したものなら、全てを閲覧可能。

圧縮ファイル中の特定のファイルのみを閲覧したければ、そのファイル名を明示する。

``` text
$ unzip -c test.zip text_1.txt | less
```

---

以上。

