---
layout   : single
title    : "QGIS(QuantumGIS) - 国土数値情報・ポリゴンの融合！"
published: true
date     : 2014-07-28 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- Linux
- LinuxMint
- QGIS
---

国土交通省提供の国土数値情報（行政区域データ）を取得して地理情報システム QGIS(Quantum GIS) で表示させる場合に、そのままだと地物それぞれがポリゴンになっているために市区町村単位でラベル表示をしたい際に地物（ポリゴン）単位に表示されてしまいます。

そこで、同じ市区町村を１つのポリゴンに融合する方法についての記録です。（結合ではなく融合です）

（当方 GIS については素人です。乱文ご容赦ください）

<!--more-->

### 0. 前提条件

- Linux Mint 17 での作業を想定。
- Quntum GIS 2.4 での作業を想定。
- 使用したデータは国土交通省提供・国土数値情報（行政区域データ[JPGIS2.1形式]）の島根県分。（ファイル名："N03-14_32_140401.shp"）

### 1. 元の SHAPE ファイル確認

融合する前に元の SHAPE ファイルを確認してみる。（「市区町村名（項目名："N03_004"）」ラベルも表示）  
ご覧のとおり、各地物（ポリゴン）にラベルが表示されるため海岸線の小島それぞれにもラベルが付いてしまう。

![QGIS_POLYGON_FUSION_1_1]({{site.baseurl}}/images/2014/07/28/QGIS_POLYGON_FUSION_1_1.png "QGIS_POLYGON_FUSION_1_1")

この時の属性テーブルは以下のようになっている。

![QGIS_POLYGON_FUSION_1_2]({{site.baseurl}}/images/2014/07/28/QGIS_POLYGON_FUSION_1_2.png "QGIS_POLYGON_FUSION_1_2")

### 2. ポリゴンの融合

QGIS メニューの「ベクタ」ー「空間演算ツール」ー「融合」を使用する。

![QGIS_POLYGON_FUSION_2_1]({{site.baseurl}}/images/2014/07/28/QGIS_POLYGON_FUSION_2_1.png "QGIS_POLYGON_FUSION_2_1")

「入力ベクタレイヤ」欄には今開いている SHAPE ファイルがセットされている。  
「融合フィールド」欄では融合したい項目をセットする。今回は市区町村で融合したいので "N03_004"（市区町村名） を選択する。（市区町村と１対１の "N03_007"（行政区域コード）でもよい）  
「出力シェープファイル」欄では出力ファイル名を指定する。日本語が文字化けしないようエンコードは "Shift_JIS" を指定する。

![QGIS_POLYGON_FUSION_2_2]({{site.baseurl}}/images/2014/07/28/QGIS_POLYGON_FUSION_2_2.png "QGIS_POLYGON_FUSION_2_2")

OK ボタン押下で融合処理が始まる。（「結果をキャンバスに追加する」にチェックを入れれば処理終了後にレイヤに追加される）  
融合処理が終了したら「閉じる」ボタンで閉じる。

### 3. 融合後 SHAPE ファイル確認

「ベクタレイヤの追加」で先ほど融合した SHAPE ファイルを追加し確認してみる。（「市区町村名（項目名："N03_004"）」ラベルも表示）  
ご覧のとおり、ラベルが市区町村単位で表示されるようになった。

![QGIS_POLYGON_FUSION_3_1]({{site.baseurl}}/images/2014/07/28/QGIS_POLYGON_FUSION_3_1.png "QGIS_POLYGON_FUSION_3_1")

この時の属性テーブルは以下のようになっている。

![QGIS_POLYGON_FUSION_3_2]({{site.baseurl}}/images/2014/07/28/QGIS_POLYGON_FUSION_3_2.png "QGIS_POLYGON_FUSION_3_2")

### 4. その他

今回は市区町村で融合したが、同様に都道府県で融合することもできる。（都道府県で融合するので、属性テーブルの市区町村情報がおかしくなる（都道府県内の任意の１市区町村が設定される）ことに留意すること）

---

融合することができるということを知っただけで応用範囲拡大の可能性を感じた次第です。

以上。

