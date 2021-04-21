---
layout   : single
title    : "Debian 10 (buster) - 地図描画ツール GMT インストール（ソースビルド）！"
published: true
date     : 2020-01-29 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- munin
---

Debian GNU/Linux 10 (buster) に地図描画ツール GMT(Generic Mapping Tool) をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* 当記事執筆時点で最新の安定版 6.0.0 をインストールする。
* root での作業を想定。
* Github からソースを取得するので、 git がインストール済みであること。

### 1. 依存パッケージのインストール

``` text
# apt install subversion build-essential cmake \
libcurl4-gnutls-dev  libnetcdf-dev libgdal-dev \
libfftw3-dev libpcre3-dev liblapack-dev libblas-dev
```

* 「[BuildingGMT - GMT - GMT - The Generic Mapping Tools](http://gmt.soest.hawaii.edu/projects/gmt/wiki/BuildingGMT "BuildingGMT - GMT - GMT - The Generic Mapping Tools")」では、 `libgdal1-dev` をインストールするよう案内されているが、 `libgdal1-dev` は存在しないので `libgdal-dev` とした。（問題なさそう）

### 2. ソースコードの取得

GMT のソースコード、海岸線データのアーカイブ、国別ポリゴンデータのアーカイブを取得する。（海岸線／国別ポリゴンデータのダウンロード元は近場の東海大学のサイトを選んだ）

``` text
# cd /usr/local/src
# wget ftp://ftp.scc.u-tokai.ac.jp/pub/gmt/gmt-6.0.0-src.tar.gz
# wget ftp://ftp.scc.u-tokai.ac.jp/pub/gmt/gshhg-gmt-2.3.7.tar.gz
# wget ftp://ftp.scc.u-tokai.ac.jp/pub/gmt/dcw-gmt-1.1.4.tar.gz
```

* 開発中の最新版を使用したければ、 `git clone https://github.com/GenericMappingTools/gmt.git` で取得する。

### 3. GMT ソースコードの展開

``` text
# tar zxvf gmt-6.0.0-src.tar.gz
```

### 4. 海岸線データの展開

まず、海岸線／国別ポリゴンデータを格納するディレクトリを作成する。

``` text
# mkdir /usr/local/share/gmt
```

そして、海岸線データ(GSHHG)(54.4MB)を展開＆リネームする。（リネームしたくなければ、しなくてよい）

``` text
# tar zxvf gshhg-gmt-2.3.7.tar.gz
# mv gshhg-gmt-2.3.7 /usr/local/share/gmt/gshhg
```

### 5. 国別ポリゴンデータの展開

国別ポリゴンデータ(20.1MB)を展開＆リネームする。（リネームしたくなければ、しなくてよい）

``` text
# tar zxvf dcw-gmt-1.1.4.tar.gz
# mv dcw-gmt-1.1.4 /usr/local/share/gmt/dcw
```

### 6. CMake ファイルの編集

GMT 5 系からは `configure` ではなく `cmake` を使用する。  
まず、用意されている cmake テンプレートを複製する。

``` text
# cd /usr/local/src/gmt
# cp cmake/ConfigUser{Template,}.cmake
```

そして、以下のように編集（コメント解除＆変更）する。

File: `cmake/ConfigUser.cmake`

``` text
set (CMAKE_INSTALL_PREFIX /usr/local)
set (GSHHG_ROOT /usr/local/share/gmt/gshhg)
set (DCW_ROOT /usr/local/share/gmt/dcw)
```

### 7. GMT のビルド＆インストール

``` text
# mkdir build
# cd build
# cmake ..
# make
# make install
```

### 8. 動作確認

GMT のパラメータデフォルト値の一覧を表示してみる。

``` text
# gmtdefaults -D
#
# GMT 6.0.0 Defaults file
#
# COLOR Parameters
#
COLOR_BACKGROUND               = black
COLOR_FOREGROUND               = white
COLOR_NAN                      = 127.5
COLOR_MODEL                    = none
COLOR_HSV_MIN_S                = 1
COLOR_HSV_MAX_S                = 0.1
COLOR_HSV_MIN_V                = 0.3
COLOR_HSV_MAX_V                = 1

         :
====< 以下省略 >====
         :
```

### 9. 地図描画の確認

（適当なディレクトリへ移動し、）試しに地図を描画してみる。

``` text
# cd /path/to/work
# gmtset PS_MEDIA = CUSTOM_18cx20c
# gmt pscoast -P -JM15c -R126/149/25/46 -Dh -Wthinnest,black -Gwheat -S240/255/255 -Bg5a10f5::WSen -X2 -Y1.5 > MAP_TEST.ps
```

１行目の `gmtset` コマンドでは、各種初期設定を行っている。

* `PS_MEDIA` で出力する用紙のサイズを指定。  
  上記の場合は、横18cm, 縦20cm ということ。  
  `a4` のようにも指定可能。 eps ファイルを出力したい場合は `a4+` のように `+` を付与する。  
  ちなみに、4 系では `PAPER_MEDIA` で用紙サイズをしていした。
* デフォルトに戻すには、 `gmtdefaults -D > .gmtdefaults4` とする。

２行目の `gmt pscoast` コマンドでは、大陸の描画を行っている。（GMT の持っている地図データ使用）

* `-P` は、ポートレート（縦長）に指定するオプション。
* `-J` は、地図の種類と大きさを指定するオプションで、 `-JM15c` はメルカトル図法で15cm四方の図。  
  １度単位でサイズを指定したい場合は、 `-Jm1c` のように小文字の `m` を使用する。  
  縦横異なる比率で指定したい場合は、 `-Jm2cx1.8c` 等のように指定する。
* `-R` は、描画領域を指定するオプションで、 `-R西端/東端/南端/北端` で指定。
* `-D` は、地図データの分解能を指定するオプションで、 `-Dh` は高解像度。（中： `i`, 低： `l` 等)
* `-W` は、海岸線を描画するオプションで、 `-Wthinnest,black` は極細(0.25p)の黒線。（様々な指定方法あり）
* `-G` は、陸域の塗りつぶし色を指定するオプションで、 `-Gwheat` は小麦色。
* `-S` は、海域の塗りつぶし色を指定するオプションで、 `-S200/255/255` は白色がやや青みがかった色。
* `-B` は、枠線を描画するオプションで、 `g5` は5度間隔で経緯度線、 `a10` は10度間隔でラベル、 `f5` は5度間隔で枠線塗り分け。
* `-X` は、x 軸方向へ移動（単位:cm）するオプションで、 `-X2` は縦軸の目盛の値のために 2cm 移動。
* `-Y` は、y 軸方向へ移動（単位:cm）するオプションで、 `-Y1.5` は横軸の目盛の値のために 1.5cm 移動。

以下が出力された地図。（公開の都合上、 PNG に変換している）

![MAP_TEST]({{site.baseurl}}/images/2020/01/29/MAP_TEST.png "MAP_TEST")

### 10. 参考サイト

* [BuildingGMT - GMT - GMT - The Generic Mapping Tools](http://gmt.soest.hawaii.edu/projects/gmt/wiki/BuildingGMT "BuildingGMT - GMT - GMT - The Generic Mapping Tools")

---

以上。

