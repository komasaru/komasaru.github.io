---
layout   : single
title    : "Linux Mint - RStudio インストール！"
published: true
date     : 2013-05-12 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- LinuxMint
- R
---

Redhat 系ディストリビューションでの R（統計解析向けプログラミング言語）の GUI ツール RStudio のインストール方法は、以前記録していました。

- [* Scientific Linux - RStudio インストール！](http://www.mk-mode.com/octopress/2012/10/13/13002056/ "* Scientific Linux - RStudio インストール！")

今回は、GNU 系ディストリビューションでの RStudio のインストール方法についての記録です。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- R version 2.15.3 がインストール済み。
- RStudio にはデスクトップ版とサーバ版があるが、デスクトップ版をインストールする。

### 1. ファイルダウンロード

「[RStudio - Download](http://www.rstudio.com/ide/download/ "RStudio - Download")」から環境にあったパッケージをダウンロードする。  
今回は Linux Mint 14(64bit) なので "RStudio 0.97.449 - Debian 6+/Ubuntu 10.04+ (64-bit)" をダウンロードし、適当な場所に配置する。  
（ダウンロードは以下のようにしてもよい。）

``` text 
$ wget http://download1.rstudio.org/rstudio-0.97.449-amd64.deb
```

### 2. インストール

ダウンロードした deb パッケージをダブルクリックするか、以下のようにインストールする。

``` text 
$ sudo dpkg -i rstudio-0.97.449-amd64.deb
```

``` text 
Unknown media type in type ...
```

と10個くらいメッセージが出力されるが、特に問題なしと判断。

### 3. 動作確認

メニューの [プログラミング] に [RStudio] ができているはずなので、起動させてみる。  
以下はデモを実行させたところ。

![RSTUDIO]({{site.baseurl}}/images/2013/05/12/RSTUDIO.png "RSTUDIO")

### 参考サイト

- [The R Project for Statistical Computing](http://www.r-project.org/ "The R Project for Statistical Computing")
- [RStudio - Home](http://www.rstudio.com/ "RStudio - Home")

---

グループ等で複数人で RStudio を使用するならサーバ版が便利かも知れません。

以上。

