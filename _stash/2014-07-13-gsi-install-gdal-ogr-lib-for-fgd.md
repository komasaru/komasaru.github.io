---
layout   : single
title    : "国土地理院・基盤地図情報対応ライブラリ GDAL/OGR インストール！"
published: true
date     : 2014-07-13 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- Linux
- LinuxMint
- QGIS
---

フリーでオープンソースの地理情報システム QGIS(Quantum GIS) では国土地理院の基盤地図情報をそのまま（JPGIS, JPGIS(GML) 形式）では読み込めません。  
QGIS インストール時に GIS ラスターデータフォーマット用ライブラリ GDAL/OGR もインストールされますが、これは基盤地図情報のデータ形式に対応していません。（`ogr2ogr2 --formats` や `gdal_translate --formats` で表示される一覧に `FGD(Japanese Fundamental Geographic Data)` がない）

国土地理院のサイトには別フォーマットにコンバートできるツールが用意されていますが、これは Windows 専用です。  
Linux でも Wine（Unix 系 OS で Windows プログラムを動作させるためのソフト）を使用すれば可能でしょうが、個人的には本末転倒に感じるというかあまりやりたくはありません。

そこで、「文部科学省宇宙利用促進調整委託費『衛星利用の裾野拡大プログラム』の課題として進められているプロジェクト」で公開されている基盤地図情報のデータ形式にも対応したライブラリをインストールして使用します。

<!--more-->

### 0. 前提条件

- Linux Mint 17(64bit) での作業を想定。
- 既に QGIS インストール済みである場合は GDAL/OGR(QGIS 2.4 の場合は 1.11.0 ?) ライブラリもインストールされているので、これからインストールするライブラリとの衝突（ライブラリの読み込み順）に注意する。(`ldd` コマンド等で確認)

### 1. 基盤地図対応ライブラリ GDAL/OGR インストール

基盤地図情報のデータ形式 JPGIS の読み込みに対応した GDAL/OGR(MEXT 版)をインストールする。

まず、「[FOSS4G を活用した衛星データ利用のためのオープン・リソースの構築｜OSGeo.JP](http://www.osgeo.jp/foss4g-mext/ "FOSS4G を活用した衛星データ利用のためのオープン・リソースの構築｜OSGeo.JP") 」からソースをダウンロードする。

そして、ダウンロードしたアーカイブファイルを適当なディレクトリに配置し以下を実行する。（よくある手順）  
ただし、 `configure` に実行権限が付与されていないので、その場合は実行権限を付与する。`sudo chmod +x` 等で。  
また、 `sudo make install` 時に `install-sh` も実行されるが、これにも実行権限が付与されていないので、実行権限を付与する。

``` text
$ tar zxvf mext_gdal.1.10.0.tar.gzf
$ cd mext_gdal
$ sudo chmod +x configure
$ ./configure
$ make
$ sudo chmod +x install-sh
$ sudo make install
```

ちなみに、Windows 環境ならバイナリファイルのアーカイブをダウンロード＆展開して配置するだけでよいようだ。（当方未確認）  
（と言うか、Windows 環境なら国土地理院のコンバートソフトを使った方がよい気もする。）

### 2. インストール確認

色々コマンドはあるが、ファイルフォーマット変換コマンド `ogr2ogr` でインストールできているか確認してみる。

``` text
$ ogr2ogr --version
GDAL 1.10.0, released 2013/04/24
```

対応しているファイル形式の一覧も表示してみる。

``` text
$ ogr2ogr --formats
Supported Formats:
  -> "ESRI Shapefile" (read/write)
  -> "MapInfo File" (read/write)
  -> "UK .NTF" (readonly)
  -> "SDTS" (readonly)
  -> "TIGER" (read/write)
  -> "S57" (read/write)
  -> "DGN" (read/write)
  -> "VRT" (readonly)
  -> "REC" (readonly)
  -> "Memory" (read/write)
  -> "BNA" (read/write)
  -> "CSV" (read/write)
  -> "GML" (read/write)
  -> "GPX" (read/write)
  -> "KML" (read/write)
  -> "GeoJSON" (read/write)
  -> "GMT" (read/write)
  -> "PCIDSK" (read/write)
  -> "XPlane" (readonly)
  -> "AVCBin" (readonly)
  -> "AVCE00" (readonly)
  -> "DXF" (read/write)
  -> "Geoconcept" (read/write)
  -> "GeoRSS" (read/write)
  -> "GPSTrackMaker" (read/write)
  -> "PGDump" (read/write)
  -> "GPSBabel" (read/write)
  -> "SUA" (readonly)
  -> "OpenAir" (readonly)
  -> "PDS" (readonly)
  -> "HTF" (readonly)
  -> "AeronavFAA" (readonly)
  -> "EDIGEO" (readonly)
  -> "SVG" (readonly)
  -> "Idrisi" (readonly)
  -> "ARCGEN" (readonly)
  -> "SEGUKOOA" (readonly)
  -> "SEGY" (readonly)
  -> "ODS" (read/write)
  -> "XLSX" (read/write)
  -> "PDF" (read/write)
  -> "FGD" (readonly)
```

最後に "FGD" が追加された。

### 3. エラーになる場合

もしも、以下のように既存の GDAL/OGR ライブラリとのバージョン違い云々のエラーが出力される場合、

``` text
$ ogr2ogr --version
ERROR 1: ogr2ogr was compiled against GDAL 1.10 but current library version is 1.11
```

これは、コマンドとライブラリの組み合わせが正しくないためであり、以下のようにライブラリのパスを指定して実行みるとよい。（継続的に使用する場合には basr_profile, bashrc 等に設定するとよい）

``` text
$ LD_LIBRARY_PATH=/usr/lib ogr2ogr --version
```

また、場合によってはこのライブラリのバージョン違いにより GQIS 起動時にエラーになるかもしれない。  
その場合は、QGIS 起動時のライブラリパスも確認してみるとよいだろう。

### 4. データ形式変換

実際に基盤地図情報のデータ形式 JPGIS を QGIS で読み込める形式の１つである ESRI Shape ファイル形式に変換してみる。
と言いたいとこだが、これについては基盤地図情報のデータを取得することも含め次回の記事で紹介する。

### 参考サイト

- [FOSS4G を活用した衛星データ利用のためのオープン・リソースの構築｜OSGeo.JP](http://www.osgeo.jp/foss4g-mext/ "FOSS4G を活用した衛星データ利用のためのオープン・リソースの構築｜OSGeo.JP")

---

これで、国土地理院の基盤地図情報のデータを Linux のみで扱えるようになりました（なったはずです）。

使用については次回。

以上。

