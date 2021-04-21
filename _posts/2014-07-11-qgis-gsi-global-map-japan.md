---
layout   : single
title    : "QGIS(Quantum GIS) - 国土地理院・地球地図日本を表示！"
published: true
date     : 2014-07-11 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- Linux
- LinuxMint
- QGIS
---

前回フリーでオープンソースの地理情報システム QGIS(Quantum GIS) を Linux Mint へインストールし、例として「QGIS」サンプルと「e-Stat（政府統計の総合窓口）」のデータを使用して地図を表示してみました。

- [QGIS(Quantum GIS) - Linux Mint へインストール！]({{site.baseurl}}/2014/07/09/qgis-installation-to-linx-mint "QGIS(Quantum GIS) - Linux Mint へインストール！")

今回は、国土地理院の「地球地図日本」の Shape 形式データを利用して日本地図を表示してみました。

<!--more-->

### 0. 今回の前提条件

- Linux Mint 17 での作業を想定。
- Quntum GIS 2.4 での作業を想定。
- 使用したデータは「第2版ベクタ（2011年公開）」の Shape ファイル。

### 1. データダウンロード

「[地球地図日本のデータ｜国土地理院](http://www.gsi.go.jp/kankyochiri/gm_jpn.html "地球地図日本のデータ｜国土地理院")」のページから「第2版ベクタ（2011年公開）」の Shape ファイルのアーカイブ（zip ファイル）をダウンロードし展開する。（「行政界」、「水系」、「人口集中域」、「交通」とこれら全ての「全レイヤ」のアーカイブが存在するので希望のものを）

ただし、2011年公開のデータであるため市町村によっては行政界が「合併前」のものになっている。

### 2. データ読み込み

QGIS Desktop を起動し、「ベクタレイヤの追加」で先ほど展開した Shape ファイル（またはディレクトリ）を読み込ませる。  
今回は「行政界」と「人口集中域」のデータを使用してみた。

デザイン等を調整してみたものが以下の２種類。

![QGIS_GM_JAPAN_1]({{site.baseurl}}/images/2014/07/11/QGIS_GM_JAPAN_1.png "QGIS_GM_JAPAN_1")

（出典：地球地図日本(国土地理院技術資料D・1-No.576)）

![QGIS_GM_JAPAN_2]({{site.baseurl}}/images/2014/07/11/QGIS_GM_JAPAN_2.png "QGIS_GM_JAPAN_2")

（出典：地球地図日本(国土地理院技術資料D・1-No.576)）

### 3. 地球地図データの利用について

少量のデータのみの非営利目的の利用は「出典の明記」のみでよいことになっている。（「少量」がどの程度の量かは不明だが）  
そうでない場合は「出典の明記」の他に「利用報告」、必要に応じて「利用申請手続き」が必要である。

- [地球地図データの利用について｜国土地理院](http://www.gsi.go.jp/kankyochiri/gm_jpn.html#gm_jpn_use "地球地図データの利用について｜国土地理院")

もう少し自由に地図データを利用したければ、国土交通省の「[国土数値情報ダウンロードサービス](http://nlftp.mlit.go.jp/ksj/index.html "国土数値情報ダウンロードサービス")」を利用したほうがよいだろう。（当然「出典の明記」は必要だが、「利用報告」や「申請手続き」は必要ない）

### 参考サイト

- [地球地図日本のデータ｜国土地理院](http://www.gsi.go.jp/kankyochiri/gm_jpn.html "地球地図日本のデータ｜国土地理院")

---

GIS や QGIS についてはまだ不勉強で疎いので、少しずつ理解していこうかと思っている次第です。

それにしても、自分で地図を描画するのは面白いですね。二次利用の際には注意が必要ですが。

以上。

