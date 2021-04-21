---
layout   : single
title    : "Python - Matplotlib Basemap で地図描画！"
published: true
date     : 2018-09-14 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Python
- GIS
- 地図
---

Python で地図を描画するために Matplotlib の Basemap をインストールしてみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Python 3.6.5 での作業を想定。
* 当方、 Python の複数バージョンが共存する環境のため、 3.6 系は `python3.6`, `pip3.6` で使用できるようにしている。

### 1. libgeos-dev のインストール

未インストールならインストールしておく。

``` text
$ sudo apt install libgeos-dev
```

### 2. matplotlib, numpy のインストール

matplotlib(>=1.0.0), numpy(>=1.2.1) が未インストールならインストールしておく。

``` text
$ sudo pip3.6 install matplotlib
$ sudo pip3.6 install numpy
```

### 3. アーカイブのダウンロード

アーカイブをダウンロード後、展開する。

``` text
$ wget -O basemap-1.1.0 https://github.com/matplotlib/basemap/archive/v1.1.0.tar.gz
$ tar zxvf basemap-1.1.0.tar.gz
```

* 最新版は「[こちら](https://github.com/matplotlib/basemap/releases "Releases · matplotlib/basemap")」で確認のこと。

### 4. GEOS ライブラリのインストール

libgeos-dev がインストール済みなら、 `export ...` 行のみ実行すればよい。

``` text
$ cd basemap-1.1.0/geos-3.3.3
$ export GEOS_DIR=/usr/include
$ ./configure --prefix=$GEOS_DIR
$ make
$ sudo make install
```

* `GEOS_DIR` には libgeos-dev がインストールされているディレクトリを指定。

### 5. basemap のインストール

展開された basemap-1.1.0 ディレクトリ直下で pip インストールする。

``` text
$ cd ..
$ sudo pip3.6 install .
```

### 6. 動作確認

取り急ぎ、インポートできるか確認してみる。

``` text
$ python3.6 -c "from mpl_toolkits.basemap import Basemap"
```

エラーが出力されなければ O.K.

次に、サンプルスクリプトを実行してみる。

``` text
$ cd examples
$ python3.6 simpletest.py
```

![PYTHON_BASEMAP_EXAMPLE]({{site.baseurl}}/images/2018/09/14/PYTHON_BASEMAP_EXAMPLE.png "PYTHON_BASEMAP_EXAMPLE")

* 実行時に `_tkinter` メソッドがない旨のエラーが出る場合、それは Python そのものをビルドする際に tk-dev ライブラリが入っていなかったためであるので、 tk-dev ライブラリをインストールしてから再度 Python をビルドする。

### 7. 参考サイト

* [Welcome to the Matplotlib Basemap Toolkit documentation — Basemap Matplotlib Toolkit 1.1.0 documentation](https://matplotlib.org/basemap/ "Welcome to the Matplotlib Basemap Toolkit documentation — Basemap Matplotlib Toolkit 1.1.0 documentation")

---

Basemap の Web サイトには描画例も多数掲載されているので、参考にして容易に地図が描画できるようになるでしょう。

以上。

