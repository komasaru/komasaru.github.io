---
layout   : single
title    : "GMT - 5.1 系をソースからインストール！"
published: true
date     : 2014-12-13 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- 地図
- GMT
---

"[Installing - GMT - GMT - The Generic Mapping Tools](http://gmt.soest.hawaii.edu/projects/gmt/wiki/Installing "Wiki - GMT - GMT - The Generic Mapping Tools")" に「4 系の Ubuntu/Debian パッケージには大きな問題があるため、問題のないソースをビルドする方法で」旨の注意書きがあるので、ソースをビルドしてインストールすることにしました。（4 系ではなく 最新の 5 系を）

実際、パッケージでインストールした GMT 4.5.11 では `pscoast` した際に、余分な線が描画されることがありました。（4 系のバグが原因かどうかは不明ですが）

以下、インストール作業の記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit) で QGIS 2.6.1 を使用して作業することを想定。
* GMT 5.1.1 （当記事執筆時点で最新）をインストールする。
* GMT 4 系と共存させることは考えない。（共存を考えるのであれば、インストール Prefix を変えるなどの設定が必要）
* ドキュメントのインストール、 CPack パーケージング(プラットフォーム固有のインストーラの作成）は行わない。
* 下記で紹介する記録は、ほぼ公式サイトの説明通り。

### 1. 依存パッケージのインストール

依存するパッケージが未インストールなら、インストールしておく。

``` text
$ sudo apt-get install ghostscript build-essential cmake libnetcdf-dev libgdal1-dev libfftw3-dev libpcre3-dev
```

### 2. アーカイブファイルのダウンロード＆展開

アーカイブファイル(約128MB)をダンロードする。  
（ダウンロード先はユーザホームディレクトリ、ダウンロード元は近場の東海大学のサイトを選んだ）

``` text
$ wget ftp://ftp.scc.u-tokai.ac.jp/pub/gmt/gmt-5.1.1-src.tar.gz
```

そして、展開する。

``` text
$ tar zxvf gmt-5.1.1-src.tar.gz
```

【補足】もしも、開発中の GMT のソースが欲しければ、 SVN でバージョン管理されているので以下のように `svn` コマンドでチェックアウトする。（当記事執筆時点で、開発中のバージョンは 5.1.2）

``` text
$ svn checkout svn://gmtserver.soest.hawaii.edu/gmt5/trunk gmt5-dev
```

### 3. 海岸線データのダウンロード＆展開

GMT が用意している海岸線データ(GSHHG)(約54MB)をダウンロードする。  
（ダウンロード先は "/usr/local/share/gmt"、ダウンロード元は近場の東海大学のサイトを選んだ）

``` text
$ sudo mkdir /usr/local/share/gmt
$ cd /usr/local/share/gmt
$ sudo wget ftp://ftp.scc.u-tokai.ac.jp/pub/gmt/gshhg-gmt-2.3.0.tar.gz
```

そして、展開＆リネームする。（リネームしたくなければ、しなくてよい）

``` text
$ sudo tar zxvf gshhg-gmt-2.3.0.tar.gz
$ sudo mv gshhg-gmt-2.3.0 gshhg
```

### 4. 国別ポリゴンデータのダウンロード＆展開

GMT が用意しているポリゴンデータ(約20MB)をダウンロードする。  
（ダウンロード先は "/usr/local/share/gmt"、ダウンロード元は近場の東海大学のサイトを選んだ）

``` text
$ sudo wget ftp://ftp.scc.u-tokai.ac.jp/pub/gmt/dcw-gmt-1.1.1.tar.gz
```

そして、展開＆リネームする。（リネームしたくなければ、しなくてよい）

``` text
$ sudo tar zxvf dcw-gmt-1.1.1.tar.gz
$ sudo mv dcw-gmt-1.1.1 dcw
```

### 5. CMake ファイルの編集

GMT 5 系は `configure` ではなく `cmake` を使用する。  
まず、用意されている cmake テンプレートを複製する。

``` text
$ cd ~/gmt-5.1.1
$ cp cmake/ConfigUser{Template,}.cmake
```

そして、以下のように編集（コメント解除＆変更、`FLOCK` の行は追加）する。

File: `cmake/ConfigUser.cmake`

{% highlight text linenos %}
set (CMAKE_INSTALL_PREFIX /usr/local)
set (GSHHG_ROOT /usr/local/share/gmt/gshhg)
set (DCW_ROOT /usr/local/share/gmt/dcw)
set (FLOCK TRUE)
{% endhighlight %}

### 6. GMT のビルド＆インストール

``` text
$ mkdir build
$ cd build
$ cmake ..
$ make
$ sudo make install
```

### 7. 動作確認

GMT のパラメータデフォルト値の一覧を表示してみる。

``` text
$ gmtdefaults -D
#
# GMT 5.1.1 Defaults file
# vim:sw=8:ts=8:sts=8
# $Revision: 12822 $
# $LastChangedDate: 2014-02-01 00:39:56 +0100 (Sat, 01 Feb 2014) $
#
# COLOR Parameters
#
COLOR_BACKGROUND                = black
COLOR_FOREGROUND                = white
COLOR_NAN                       = 127.5
COLOR_MODEL                     = none
COLOR_HSV_MIN_S                 = 1
COLOR_HSV_MAX_S                 = 0.1
COLOR_HSV_MIN_V                 = 0.3
COLOR_HSV_MAX_V                 = 1

         :
====< 以下省略 >====
         :
```

### 8. 地図描画の確認

試しに地図を描画してみる。

``` text
$ cd ~/
$ gmtset PS_MEDIA = CUSTOM_18cx20c
$ pscoast -P -JM15c -R126/149/25/46 -Dh -Wthinnest,black -Gwheat -S240/255/255 -Bg5a10f5::WSen -X2 -Y1.5 > MAP_TEST.ps
```

１行目の `gmtset` コマンドでは、各種初期設定を行っている。

- `PS_MEDIA` で出力する用紙のサイズを指定。  
  上記の場合は、横18cm, 縦20cm ということ。  
  `a4` のようにも指定可能。 eps ファイルを出力したい場合は `a4+` のように `+` を付与する。  
  ちなみに、4 系では `PAPER_MEDIA` で用紙サイズをしていした。
- デフォルトに戻すには、 `gmtdefaults -D > .gmtdefaults4` とする。

２行目の `pscoast` コマンドでは、大陸の描画を行っている。（GMT の持っている地図データ使用）

- `-P` は、ポートレート（縦長）に指定するオプション。
- `-J` は、地図の種類と大きさを指定するオプションで、 `-JM15c` はメルカトル図法で15cm四方の図。  
  １度単位でサイズを指定したい場合は、 `-Jm1c` のように小文字の `m` を使用する。  
  縦横異なる比率で指定したい場合は、 `-Jm2cx1.8c` 等のように指定する。
- `-R` は、描画領域を指定するオプションで、 `-R西端/東端/南端/北端` で指定。
- `-D` は、地図データの分解能を指定するオプションで、 `-Dh` は高解像度。（中： `i`, 低： `l` 等)
- `-W` は、海岸線を描画するオプションで、 `-Wthinnest,black` は極細(0.25p)の黒線。（様々な指定方法あり）
- `-G` は、陸域の塗りつぶし色を指定するオプションで、 `-Gwheat` は小麦色。
- `-S` は、海域の塗りつぶし色を指定するオプションで、 `-S200/255/255` は白色がやや青みがかった色。
- `-B` は、枠線を描画するオプションで、 `g5` は5度間隔で経緯度線、 `a10` は10度間隔でラベル、 `f5` は5度間隔で枠線塗り分け。
- `-X` は、x 軸方向へ移動（単位:cm）するオプションで、 `-X2` は縦軸の目盛の値のために 2cm 移動。
- `-Y` は、y 軸方向へ移動（単位:cm）するオプションで、 `-Y1.5` は横軸の目盛の値のために 1.5cm 移動。

以下が出力された地図。（公開の都合上、 JPEG に変換している）

![MAP_TEST]({{site.baseurl}}/images/2014/12/13/MAP_TEST.jpg "MAP_TEST")

ちなみに、パッケージでインストールした GMT 4.5.11 で描画した場合、以下のように余分な線が描画されることがあった。（オプションの指定の仕方によってはこの現象は発生しない）

![MAP_TEST_4]({{site.baseurl}}/images/2014/12/13/MAP_TEST_4.jpg "MAP_TEST_4")

### 9. その他

環境変数は特に設定する必要はないようだ。

### 参考サイト

* [BuildingGMT - GMT - GMT - The Generic Mapping Tools](http://gmt.soest.hawaii.edu/projects/gmt/wiki/BuildingGMT "BuildingGMT - GMT - GMT - The Generic Mapping Tools")

---

パッケージでインストールした GMT 4.5.11 では余分な線が描画されることがありましたが、 5.1.1 ではそれが解消されました。

以上。

