---
layout   : single
title    : "GCC - ccache でビルド高速化！"
published: true
date     : 2014-11-07 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- GCC
- C言語
---

ccache は、コンパイラ・キャッシュで前回のプリプロセスの結果を再利用して次回以降のコンパイル時間を大幅に短縮する。  
よって、ビルド（コンパイル＋リンク）が大幅に高速化されます。

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit), CentOS 7.0(64bit) での作業を想定。  
* GCC(GNU Compiler Collection) 4.9.1 を想定。（別バージョンも同様のはず）
* 今回は使用しないが、make 時に `make -j [並列実行数]` で並列化することも可能であることも認識しておくとよいかも。

### 1. ccache インストール

パッケージマネージャもしくは `apt-get` コマンド等でインストールするだけ。  
（CentOS なら yum インストールできる（但し、ベースリポジトリには存在しないので "EPEL" リポジトリから））

``` text
$ sudo apt-get install ccache
```

### 2. ccache インストール確認

``` text
$ ccache --version
ccache version 3.1.9

Copyright (C) 2002-2007 Andrew Tridgell
Copyright (C) 2009-2011 Joel Rosdahl

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 3 of the License, or (at your option) any later
version.
```

### 3. 使用方法

（キャッシュを利用するため、初回は高速化されず、２回目以降高速化されることを理解しておくこと）

#### 3-1. Makefile を使用しない場合

以下のように先頭に `ccache` を追加する。

``` text
$ ccache g++ -Wall -O2 -o Hoge Hoge.cpp
```

#### 3-2. Makefile を使用する場合M

C++ なら変数 CXX を、C なら CC を上書きして `make` する。

File: `C++`

{% highlight text linenos %} の場合
$ make CXX="ccache g++"
{% endhighlight %}

File: `C`

{% highlight text linenos %} の場合
$ make CC="ccache gcc"
{% endhighlight %}

もしくは、Makefile 内で変数 CXX, CC を書き換えたり、 ".bashrc" 等で環境変数を設定しておいても良いだろう。

ちなみに、コンパイル・キャッシュは "$HOME/.ccache" に保存されている。

---

当方の場合、10秒位かかっていたビルドが1秒未満になり、ストレスが無くなりました。

以上。

