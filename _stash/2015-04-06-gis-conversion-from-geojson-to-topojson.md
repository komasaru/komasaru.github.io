---
layout   : single
title    : "GIS - GeoJSON を TopoJSON に変換！"
published: true
date     : 2015-04-06 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- 地図
---
こんにちは。

Web サイトで地図を表示するのに D3.js というものを使用するのですが、データ形式が GeoJSON か TopoJSON でなければなりません。

GeoJSON はファイル容量が非常に大きいので、TopoJSON に変換して容量を小さくするとパフォーマンスも向上するでしょう。

以下、 GeoJSON 形式のデータを TopoJSON 形式に変換する方法についての記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* GeoJSON 形式のデータファイル準備済み。（参照「[GIS - Shapefile を GeoJSON に変換！]({{site.baseurl}}/2015/04/03/gis-conversion-from-shapefile-to-geojson/ "GIS - Shapefile を GeoJSON に変換！")」）
* 属性情報は元々の国土交通省・国土数値情報を都道府県単位で融合したため、以下のようになっている（融合時に以下のように設定し直している）。
  - `PREF_CODE` ... 都道府県コード
  - `PREF_NAME` ... 都道府県名

### 1. TopoJSON について

TopoJSON を簡単に説明すると以下のとおり。

* 地理空間情報をエンコードするためのフォーマットで、同じく地理空間情報をエンコードするためのフォーマット GeoJSON を Topology の概念を利用して拡張した形式（トポロジ構造のデータ）である。  
  （ちなみに、「トポロジ」＝「位相幾何学」で、簡単に言えば「コーヒーカップとドーナツを（連続的に形状を変化させても穴が数が１個という性質は変わらないので）区別しない」ような数学的概念のこと）
* GeoJSON 形式と比べファイルサイズが格段に小さい。（GeoJSON の 10〜20% ほど）

### 2. npm のインストール

変換に使用する `topojson` コマンドは npm(Node Package Manager) でインストールするため、 npm 未インストールならインストールする。

``` text
$ sudo apt-get install npm
```

そして、なぜかこのままではコマンド名が `node` でなく `nodejs` となってしまうため、 `topojson` コマンドが動かない。 `nodejs` から `node` に名称変更する。

``` text
$ sudo update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10
$ node -v
v0.10.25
```

### 3. topojson のインストール

``` text
$ sudo npm install -g topojson
```

### 4. TopoJSON への変換

"japan.geojson" という GeoJSON 形式のファイルを "japan.topojson" という TopoJSON 形式のファイルへ変換する例。（各種属性情報も出力している）

``` text
$ topojson -p PREF_CODE -p PREF_NAME -o japan.topojson japan.geojson
bounds: 122.93366527 20.425119 153.98689789600007 45.5576666719149 (spherical)
pre-quantization: 3.45m (0.0000311°) 2.79m (0.0000251°)
topology: 82748 arcs, 4275177 points
post-quantization: 345m (0.00311°) 279m (0.00251°)
prune: retained 2130 / 82748 arcs (3%)
```

175MB ほどの GeoJSON ファイルから 1.3MB ほどの TopoJSON ファイルが生成された。

### 5. TopoJSON ファイルの内容確認

生成された TopoJSON ファイルの内容を確認してみる。（以下は可読性高めるため整形している）

``` text
{
  "type":"Topology",
  "objects":{
    "japan":{
      "type":"GeometryCollection",
      "geometries":[
        {
          "type":"MultiPolygon",
          "properties":{
            "PREF_CODE":"01",
            "PREF_NAME":"北海道"
          },
          "arcs":[
            [
              [0,1,2,3,4,5,6,7,8,9,10,11],[-13],[-14],[14],[-16]
            ],
                    :
            ===< 途中省略 >===
                    :
          ]
        }
          :
  ===< 途中省略 >===
          :
  "transform":{
    "scale":[0.003105633825982604,0.0025135061178032706],
    "translate":[122.93366527,20.425119]
  }
}
```

---

これで D3.js を使用して Web サイトに地図を表示させる準備が整いました。

以上。

