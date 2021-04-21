---
layout   : single
title    : "QGIS(Quantum GIS) - Linux Mint へインストール！"
published: true
date     : 2014-07-09 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- Linux
- LinuxMint
- QGIS
---

フリーでオープンソースの地理情報システム QGIS(Quantum GIS) を Linux Mint へインストールして使用してみました。  
クロスプラットフォーム対応なので、 Windows, Mac, Linux, BSD に対応しています。（Android もまもなく対応予定）

<!--more-->

### 0. 今回の前提条件

- Linux Mint 17 上に QGIS 2.4 をインストールすることを想定。  
- 地図データをダウンロードできるサイトは多数あるが、今回は「QGIS」サンプルと「e-Stat（政府統計の総合窓口）」のデータを使用する。

### 1. QGIS インストール

``` text
$ sudo apt-get install python-software-properties
$ sudo add-apt-repository ppa:ubuntugis/ubuntugis-unstable
[sudo] password for hoge:
You are about to add the following PPA to your system:
 Unstable releases of Ubuntu GIS packages. These releases are more bleeding
edge and while generally they should work well, they dont receive the same
amount of quality assurance as our stable releases do.
 More info: https://launchpad.net/~ubuntugis/+archive/ubuntugis-unstable
Press [ENTER] to continue or ctrl-c to cancel adding it
$ sudo apt-get update
$ sudo apt-get install qgis python-qgis qgis-plugin-grass
```

`add-apt-repository` 時のメッセージは安定版ではない旨の警告であるので、気にしなくてよい。  
（QGIS 2.2 の場合は、 `python-software-properties`, `qgis python-qgis`, `qgis-plugin-grass` のインストールは不要だった気がする（記憶が曖昧））

インストールが完了すると、アプリケーションメニューの「教育・教養」グループ（なければ作られる）に「GRASS GIS」、「QGIS Browser」、「QGIS Desktop」が作られる。

![QGIS_1]({{site.baseurl}}/images/2014/07/09/QGIS_1.png "QGIS_1")

デスクトップで地図を閲覧・編集する場合は「QGIS Desktop」を起動する。

![QGIS_2]({{site.baseurl}}/images/2014/07/09/QGIS_2.png "QGIS_2")

### 2. Shape ファイル準備

例として２種類のファイルを準備する。（QGIS のサンプルデータ、 国勢調査のデータ）

1. 「[QGISのダウンロード](http://qgis.org/ja/site/forusers/download.html "QGISのダウンロード")」ページの「サンプルデータセットを公開中」リンクをクリックして進んだページから "qgis_sample_data.zip" をダウンロードする。
2. Shape ファイル（GIS 業界の事実上の世界標準フォーマット）をダウンロードできるサイトは色々あるが、今回は「[政府統計の総合窓口 GL01010101](http://www.e-stat.go.jp/SG1/estat/eStatTopPortal.do "政府統計の総合窓口 GL01010101")」からダウンロードする。  
「[政府統計の総合窓口 GL01010101](http://www.e-stat.go.jp/SG1/estat/eStatTopPortal.do "政府統計の総合窓口 GL01010101")」ページの「地図で見る統計（統計ＧＩＳ）」リンクをクリックして進み、さらに「データダウンロード」リンクをクリックして進んだページから適当なデータを選択して適当なディレクトリにダウンロードする。  
 （今回当方は「平成22年国勢調査（小地域）2010/10/01」-「男女別人口総数及び世帯総数」-「島根県」-「松江市」-「世界測地系平面直角座標系・Shape形式」をダウンロードした。定義書も併せてダウンロードしておくと良いだろう。また、今回は統計データはダウンロードしない）

そして、ダウンロードしたアーカイブファイルは展開しておく。

### 3. Shape ファイル読み込み

#### 1. QGIS のサンプルデータ（アラスカ州データ）

このサンプルデータはプロジェクト化されているので、「プロジェクト」-「開く」で "qgis_sample_data/projects/relations.qgs" ファイルを選択して読み込む。さらに、Shape ファイルを何種か追加読み込みしてみた。

![QGIS_3]({{site.baseurl}}/images/2014/07/09/QGIS_3.png "QGIS_3")

#### 2. 国勢調査（平成22年、島根県松江市「男女別人口総数及び世帯総数」のデータで使用されている地図データ）

「レイヤ」-「ベクタレイヤの追加」で準備した Shape ファイルを選択して読み込む。（データを扱うことも考慮して、エンコーディングは "Shift_JIS" にしたほうが良いかもしれない）  
さらに、宍道湖・中海を削除、背景色を変更、市町村名ラベルを表示するようにしてみた。（ズームすれば表示されていない市町村名も表示される）

![QGIS_4]({{site.baseurl}}/images/2014/07/09/QGIS_4.png "QGIS_4")

（使用データの出典：総務省統計局、平成22年国勢調査（小地域）2010/10/01）

### 参考サイト

- [QGISプロジェクトへようこそ!](http://qgis.org/ja/site/ "QGISプロジェクトへようこそ!")

---

地図を自分で作成するのもおもしろいです。

CSV 形式等のデータを読み込んで市町村ごとに色分けをしたり等様々なことが可能です。少しずつでも習得したいものです。

以上。

