---
layout   : single
title    : "Fortran - 多倍長演算ライブラリ FMLIB のインストール！"
published: true
date     : 2019-02-02 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Fortran
---

Fortran 90/95 で多倍長演算をすべく、ライブラリ FMLIB をインストールしました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linuz Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 でのビルド（コンパイル＆リンク）を想定。

### 1. FMLIB について

FMLIB とは、 Fortran 90/95 用の多倍長演算パッケージである。

### 2. ファイルの準備

「[こちら](http://dmsmith.lmu.build/ "Fortran Software for Multiple Precision Arithmetic")」のページ内から [FM_files.zip](http://dmsmith.lmu.build/FM1.3/FM_files.zip "FM_files.zip") というアーカイブファイルをダウンロードし、展開しておく。（必要なファイルを個別にダウンロードしてもよいが、当記事執筆時点では、各ファイルが PDF 化されていて扱いにくい）

そして、展開したディレクトリ内から、以下のファイルを適当な（コンパイル用）ディレクトリ内に配置する。

* `fm.f95`
* `fmzm90.f95`
* `fmsave.f95`
* `TestFM.f95`
* `SampleFM.f95`
* `SampleFM.chk`
* `FM_User_Manual.txt`

### 3. モジュール等のコンパイル

``` text
$ gfortran fmsave.f95 -c -O3
$ gfortran fm.f95 -c -O3
$ gfortran fmzm90.f95 -c -O3
```

### 4. テストプログラムのコンパイル＆リンク、実行

``` text
$ gfortran TestFM.f95 -c -O3
$ gfortran fmsave.o fm.o fmzm90.o TestFM.o -o TestFM
$ ./TestFM
```

`TEMPFM`, `TestFM.out`, `FMERRMSG.out`というファイルが生成される。

### 5. サンプルプログラムのコンパイル＆リンク、実行

``` text
$ gfortran SampleFM.f95 -c -O3
$ gfortran fmsave.o fm.o fmzm90.o SampleFM.o -o SampleFM
$ ./SampleFM
```

`SampleFM.out` というファイルが生成されるので、 `SampleFM.chk` と内容が同じであることを確認する。

---

次回、 FMLIB を実際に使用して計算してみたいと思います。

以上。

