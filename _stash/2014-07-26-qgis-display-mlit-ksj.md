---
layout   : single
title    : "QGIS(Quantum GIS) - 国土交通省・国土数値情報からの地図表示！"
published: true
date     : 2014-07-26 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- Linux
- LinuxMint
- QGIS
---

少し前にフリーでオープンソースの地理情報システム QGIS(Quantum GIS) で国土地理院の地球地図日本や基盤地図情報を表示してみたことを紹介しました。

- [QGIS(Quantum GIS) – Linux Mint へインストール！]({{site.baseurl}}/2014/07/11/qgis-gsi-global-map-japan "QGIS(Quantum GIS) - Linux Mint へインストール！")
- [GIS - 国土地理院・基盤地図情報表示！]({{site.baseurl}}/2014/07/15/gsi-display-fgd "GIS - 国土地理院・基盤地図情報表示！")

今回は、国土交通省の「国土数値情報」のデータを利用して QGIS 上で地図を表示してみました。  
ちなみに、今まで他の地図情報を扱ってきましたが、今回の「国土数値情報」を扱うのが当方の最終目標でした。

以下、その記録です。（当方 GIS については素人です。乱文ご容赦ください）

<!--more-->

### 0. 前提条件

- QGIS 2.4 での作業を想定。(on Linux Mint 17)
- 利用するデータ形式は JPGIS2.1 形式。

### 1. データダウンロード

「[国土数値情報ダウンロードサービス](http://nlftp.mlit.go.jp/ksj/index.html "国土数値情報ダウンロードサービス")」ページの "JPGIS2.1" から「行政区域」のページヘ移動し必要な都道府県データをダウンロードする。（途中で簡単なアンケートに回答する）

ダウンロードしたら Zip ファイルを展開する。  
以下は、「行政区域データ・島根県分、"N03-140401_32_GML.zip"」を展開した場合。

``` text
KS-META-N03-14_32_140401.xml
N03-14_32_140401.dbf
N03-14_32_140401.prj
N03-14_32_140401.sbn
N03-14_32_140401.sbx
N03-14_32_140401.shp
N03-14_32_140401.shx
N03-14_32_140401.xml
```

### 2. QGIS で表示

QGIS を起動し「ベクタレイヤの追加」で Shape ファイルを開く。エンコーディングはラベルが文字化けしないよう "Shift_JIS" にした方がよいだろう。

以下は島根県分のみを表示させた例。（画像左上の小さな点は「竹島」）

![QGIS_MLIT_KSJ_1]({{site.baseurl}}/images/2014/07/26/QGIS_MLIT_KSJ_1.png "QGIS_MLIT_KSJ_1")

以下は島根県分にラベル表示を追加してズームアップした例。  
ただし、島々それぞれが１つの地物になっているため大量に表示されてしまう。不要な場合は手作業で削除する必要がある。

![QGIS_MLIT_KSJ_2]({{site.baseurl}}/images/2014/07/26/QGIS_MLIT_KSJ_2.png "QGIS_MLIT_KSJ_2")

以下は全都道府県分を表示させた例。

![QGIS_MLIT_KSJ_3]({{site.baseurl}}/images/2014/07/26/QGIS_MLIT_KSJ_3.png "QGIS_MLIT_KSJ_3")

### 参考サイト

- [国土数値情報ダウンロードサービス](http://nlftp.mlit.go.jp/ksj/index.html "国土数値情報ダウンロードサービス")

---

国土数値情報のデータは市町村合併に関しても新しい情報が反映されてるし、扱いやすいような感じもしました。

色々と応用していけたらと考えている次第です。

以上。

