---
layout   : single
title    : "Linux - ImageMagick 7 のインストール（ソースビルド）！"
published: true
date     : 2017-10-10 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LMDE2
- ImageMagick
---

画像操作／表示ツール ImageMagick 7 を Linux へソースをビルドしてインストールする方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2) での作業を想定。
* 当記事執筆時点で最新の 7.0.6-4 を、ソースをビルドしてインストールする。
* ImageMagick 7 系は 6 系とコマンドやオプションの使用方法が異なる部分がある。  
  しかし、 6 系の使用方法も一応サポートされている。

### 1. インストール済み ImageMagick のバージョンの確認

``` text
$ identify -version
Version: ImageMagick 6.8.9-9 Q16 x86_64 2017-07-15 http://www.imagemagick.org
Copyright: Copyright (C) 1999-2014 ImageMagick Studio LLC
Features: DPC Modules OpenMP
Delegates: bzlib cairo djvu fftw fontconfig freetype jbig jng jpeg lcms lqr ltdl lzma openexr pangocairo png rsvg tiff wmf x xml zlib
```

### 2. アーカイブ取得＆展開

``` text
$ wget ftp://ftp.kddlabs.co.jp/graphics/ImageMagick/ImageMagick-7.0.6-4.tar.gz
$ tar zxvf ImageMagick.tar.gz
```

ダウンロードは `https://www.imagemagick.org/download/ImageMagick.tar.gz` でもよいし、以下の一覧からミラーサイトを選んでもよい。

* [Mirror @ ImageMagick](http://www.imagemagick.org/script/mirror.php "Mirror @ ImageMagick")

### 3. コンパイル

Makefile を作成後、コンパイルする。

``` text
$ cd ImageMagick-7.0.6
$ ./configure
$ make
```

### 4. インストール

``` text
$ sudo make install
```

### 5. ランタイムリンクの設定

``` text
$ sudo ldconfig /usr/local/lib
```

### 6. インストールの確認

インストールできているか、バージョンを表示して確認してみる。（コマンドは `magick`）

``` text
$ magick -version
Version: ImageMagick 7.0.6-4 Q16 x86_64 2017-08-02 http://www.imagemagick.org
Copyright: © 1999-2017 ImageMagick Studio LLC
License: http://www.imagemagick.org/script/license.php
Features: Cipher DPC HDRI OpenMP
Delegates (built-in): bzlib djvu fftw fontconfig freetype gvc jbig jng jpeg lcms lqr lzma openexr pangocairo png tiff webp wmf x xml zlib
```

`/usr/local/bin/identify -version` 等でもよい。（`identify -version` だと、 PATH の関係でインストール済みの古い ImageMagick のバージョンが表示されるので注意）

### 7. 動作確認

ロゴ画像を作成してみる。

``` text
$ /usr/local/bin/convert logo: logo.gif
```

logo.gif を確認して、異常がないか確認する。

また、より包括的なテストを行いたければ、以下を実行する。

``` text
$ make check
```

最低限 Ghostscript に関するテストに成功すること。さもないと、 EPS や PS, PDF に関するテストに失敗する。

問題がなければ、インストール作業は完了。

### 8. 注意

* ImageMagick 7 系は、 6 系とコマンドやオプションの使い方の異なる部分がある。

### 9. 参考サイト

* [Install from Source @ ImageMagick](http://www.imagemagick.org/script/install-source.php "Install from Source @ ImageMagick")

---

以上。

