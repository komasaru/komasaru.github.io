---
layout   : single
title    : "GIS - GMT で標高データを描画（その２）！"
published: true
date     : 2016-05-20 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- 地図
- GMT
---

こんにちは。

以前、GMT(The Generic Mapping Tools) で地図に標高データを反映させる方法について紹介しました。

* [GIS - GMT で標高データを描画！]({{site.baseurl}}/2015/01/06/gmt-paint-map-with-elevation-data/ "GIS - GMT で標高データを描画！")

今回は、もう少し洗練したものに仕上げてみました。

（当方、 GIS についてはそれほど精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* GMT 5.1.1 での作業を想定。  
  （参照：[GMT - 5.1 系をソースからインストール！]({{site.baseurl}}/2014/12/13/gis-newest-gmt-installation-by-src/ "GMT - 5.1 系をソースからインストール！")）
* 日本と周辺の陸地・海底を標高・水深で色分けする。

### 1. 標高データの準備

過去記事「[GIS - GMT で標高データを描画！]({{site.baseurl}}/2015/01/06/gmt-paint-map-with-elevation-data/ "GIS - GMT で標高データを描画！")」を参照。

### 2. シェルスクリプトの作成

以下は「メルカトル図法」で描画する例。（各種説明は「[GIS - GMT で標高データを描画！]({{site.baseurl}}/2015/01/06/gmt-paint-map-with-elevation-data/ "GIS - GMT で標高データを描画！")」を参照）

File: `JAPAN_ETOPO1.sh`

{% highlight sh linenos %}
#! /bin/bash

# 各種定数
GRD_PATH=/path/to/ETOPO1_Bed_g_gmt4.grd
IMG_DIR=imgs
IMG_FILE=JAPAN_ETOPO1
T=-10000/10000/100
R=122/148/23/47
J=M12c
E=100
B=a5f5g5
D=9c/-1c/5c/0.5ch
F=+j+a+f12p,Helvetica,black

# 用紙サイズ
gmtset PS_MEDIA = Custom_15cx17c

# 範囲抽出
grdcut $GRD_PATH -R$R -G${IMG_FILE}.grd

# 配色設定
makecpt -Cglobe -T$T -Z > ${IMG_FILE}.cpt

# 陰影データ作成
grdgradient $IMG_FILE.grd -A270 -G${IMG_FILE}.int -Ne0.7

# 図描画
grdimage ${IMG_FILE}.grd -I${IMG_FILE}.int -R -J$J -C${IMG_FILE}.cpt -E$E -X1.5 -Y2.5 -P -K > ${IMG_DIR}/${IMG_FILE}.ps

# 海岸線描画
pscoast -R -J -Dh -W,darkgreen -O -K >> ${IMG_DIR}/${IMG_FILE}.ps

# 縦軸・横軸描画
psbasemap -R -J -B$B -O -K >> ${IMG_DIR}/${IMG_FILE}.ps

# コピーライト描画
echo "132 36 BL 0.0 (c)mk-mode.com" | pstext -R -J -F$F -O -K >> ${IMG_DIR}/${IMG_FILE}.ps

# 凡例描画
psscale -Ba4000g2000f1000 -C${IMG_FILE}.cpt -D$D -O >> ${IMG_DIR}/${IMG_FILE}.ps

# ps -> png
ps2raster ${IMG_DIR}/${IMG_FILE}.ps -Tg -Qt -Qg -E$E
# ps -> jpg
#ps2raster ${IMG_DIR}/${IMG_FILE}.ps -Qt -Qg -E$E
{% endhighlight %}

以下は「アルベルス正積円錐図法」で描画する例。（各種説明は「[GIS - GMT で標高データを描画！]({{site.baseurl}}/2015/01/06/gmt-paint-map-with-elevation-data/ "GIS - GMT で標高データを描画！")」を参照）

File: `JAPAN_ETOPO1_b.sh`

{% highlight sh linenos %}
#! /bin/bash

# 各種定数
GRD_PATH=/path/to/ETOPO1_Bed_g_gmt4.grd
IMG_DIR=imgs
IMG_FILE=JAPAN_ETOPO1_b
T=-10000/10000/100
R=122/148/23/47
J=b135/35/30/40/1:20000000
E=100
W=,darkgreen
B=a5f5g5
D=11c/-1c/5c/0.5ch
F=+j+a+f12p,Helvetica,black

# 用紙サイズ
gmtset PS_MEDIA = Custom_15.5cx17c

# 範囲抽出
grdcut $GRD_PATH -R$R -G${IMG_FILE}.grd

# 配色設定
makecpt -Cglobe -T$T -Z > ${IMG_FILE}.cpt

# 陰影データ作成
grdgradient $IMG_FILE.grd -A270 -G${IMG_FILE}.int -Ne0.7

# 図描画
grdimage ${IMG_FILE}.grd -I${IMG_FILE}.int -R -J$J -C${IMG_FILE}.cpt -E$E -X1 -Y2.5 -P -K > ${IMG_DIR}/${IMG_FILE}.ps

# 海岸線描画
pscoast -R -J -Dh -W$W -O -K >> ${IMG_DIR}/${IMG_FILE}.ps

# 縦軸・横軸描画
psbasemap -R -J -B$B -O -K >> ${IMG_DIR}/${IMG_FILE}.ps

# コピーライト描画
echo "132 36 BL 0.0 (c)mk-mode.com" | pstext -R -J -F$F -O -K >> ${IMG_DIR}/${IMG_FILE}.ps

# 凡例描画
psscale -Ba4000g2000f1000 -C${IMG_FILE}.cpt -D$D -O >> ${IMG_DIR}/${IMG_FILE}.ps

# ps -> png
ps2raster ${IMG_DIR}/${IMG_FILE}.ps -Tg -Qt -Qg -E$E
# ps -> jpg
#ps2raster ${IMG_DIR}/${IMG_FILE}.ps -Qt -Qg -E$E
{% endhighlight %}

（以前の「[GIS - GMT で標高データを描画！]({{site.baseurl}}/2015/01/06/gmt-paint-map-with-elevation-data/ "GIS - GMT で標高データを描画！")」と大きく異なるのは、陰影データを作成・描画している箇所）

* [Gist - Bash script to paint a Japan's elevetion map by GMT(Mercator).](https://gist.github.com/komasaru/059258df6e290e8fde12ef989f4c3221 "Gist - Bash script to paint a Japan's elevetion map by GMT(Mercator).")
* [Gist - Bash script to paint a Japan's elevetion map by GMT(Albers).](https://gist.github.com/komasaru/8ce2b221936c40c3158d7d70c027e4fc "Gist - Bash script to paint a Japan's elevetion map by GMT(Albers).")

### 3. シェルスクリプトの実行

``` text
$ ./JAPAN_ETOPO1.sh
$ ./JAPAN_ETOPO1_b.sh
```

### 4. 画像の確認

メルカトル図法で描画した画像、アルベルス正積円錐図法で描画した画像を確認してみる。

![JAPAN_ETOPO1]({{site.baseurl}}/images/2016/05/20/JAPAN_ETOPO1.png "JAPAN_ETOPO1")
![JAPAN_ETOPO1_B]({{site.baseurl}}/images/2016/05/20/JAPAN_ETOPO1_b.png "JAPAN_ETOPO1_B")

### 5. 参考サイト

* [Documentation - GMT - GMT — The Generic Mapping Tools](http://gmt.soest.hawaii.edu/projects/gmt/wiki/Documentation "Documentation - GMT - GMT — The Generic Mapping Tools")

---

綺麗な地図が描画できるので、何かと応用できそうです。

以上。

