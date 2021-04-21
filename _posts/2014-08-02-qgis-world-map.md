---
layout   : single
title    : "QGIS(Quantum GIS) - 世界地図表示！"
published: true
date     : 2014-08-02 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- Linux
- LinuxMint
- QGIS
---

Shapefile 形式等の地図情報は国内外問わず多数公開されていますが、今回は海外で公開されている Shapefile を使用して QGIS で世界地図を表示してみます。

（当方、GIS については素人です。乱文ご容赦ください）

<!--more-->

### 0. 前提条件

- Linux Mint 17 での作業を想定。
- Quntum GIS 2.4 での作業を想定。

### 1. Natural Earth の Shapefile データ

"[Natural Earth](http://www.naturalearthdata.com/ "Natural Earth")" という地図データを無償で提供しているサイトの Shapefile データを取得して世界地図を表示してみる。

上から、1/10,000,000、1/50,000,000、1/110,000,000 縮尺の国境界データを地図化したもの。

![QGIS_NATURAL_EARTH_1_1]({{site.baseurl}}/images/2014/08/02/QGIS_NATURAL_EARTH_1_1.png "QGIS_NATURAL_EARTH_1_1")
![QGIS_NATURAL_EARTH_2_1]({{site.baseurl}}/images/2014/08/02/QGIS_NATURAL_EARTH_2_1.png "QGIS_NATURAL_EARTH_2_1")
![QGIS_NATURAL_EARTH_3_1]({{site.baseurl}}/images/2014/08/02/QGIS_NATURAL_EARTH_3_1.png "QGIS_NATURAL_EARTH_3_1")

全体図として見ただけでは小島の有無が認識できる程度。

次に、これらの地図の日本部分をズームアップしてみた。  
同様に、上から 1/10,000,000、1/50,000,000、1/110,000,000 縮尺。

![QGIS_NATURAL_EARTH_1_2]({{site.baseurl}}/images/2014/08/02/QGIS_NATURAL_EARTH_1_2.png "QGIS_NATURAL_EARTH_1_2")
![QGIS_NATURAL_EARTH_2_2]({{site.baseurl}}/images/2014/08/02/QGIS_NATURAL_EARTH_2_2.png "QGIS_NATURAL_EARTH_2_2")
![QGIS_NATURAL_EARTH_3_2]({{site.baseurl}}/images/2014/08/02/QGIS_NATURAL_EARTH_3_2.png "QGIS_NATURAL_EARTH_3_2")

当然縮尺により粗さは異なる。  
島根県を中心に見てみると、1/10,000,000 では「隠岐諸島・島前」も存在しているが、1/50,000,000 では「隠岐諸島・島前」は無くなり、さらに 1/110,000,000 では「隠岐諸島・島後」も無くなる。（ちなみに、1/10,000,000 では隠岐の島と鬱陵島（ウルルン島）の間に「竹島」（極小の点）も存在している）

### 2. DIVA-GIS の Shapefile データ

"[DIVA-GIS](http://www.diva-gis.org/ "DIVA-GIS")" という地図データを無償で提供しているサイトの Shapefile データを取得して世界地図を表示してみる。

![QGIS_DIVA_GIS_1]({{site.baseurl}}/images/2014/08/02/QGIS_DIVA_GIS_1.png "QGIS_DIVA_GIS_1")

結果として、Natural Earth の 1/10,000,000 縮尺と同レベルの精度に感じた。

そして、日本部分をズームアップしてみた。

![QGIS_DIVA_GIS_2]({{site.baseurl}}/images/2014/08/02/QGIS_DIVA_GIS_2.png "QGIS_DIVA_GIS_2")

こちらも、Natural Earth の 1/10,000,000 縮尺と同レベルの精度に感じた。

### 3. Global Administrative Areas の Shapefile データ

"[Global Administrative Areas](http://www.gadm.org/ "Global Administrative Areas")" という地図データを無償で提供しているサイトの Shapefile データを取得して日本地図を表示してみる。（全世界分として Shapefile が提供されておらず、世界地図を生成するには各国分の Shapefile を結合しなればならないため）

![QGIS_GADM_1]({{site.baseurl}}/images/2014/08/02/QGIS_GADM_1.png "QGIS_GADM_1")

これは行政区域データを表示したものだが、あからさまにデータがおかしいのが分かる。最新の市町村合併情報が反映されてなく、「米子市」の形がおかしく、「境港市」が無い。

### 4. 所感

海外のサイトが提供するデータは世界地図レベルでは問題なく利用できるであろう。しかし、各国レベルでズームアップすると粗さが目立つ。

よって、日本国内で日本地図を利用する場合は日本国内で提供されているデータを利用するのが良さそうである。

---

世界地図を描画する際に参考になればと記録しておいた次第です。

以上。

