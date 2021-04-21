---
layout   : single
title: 'LMDE2 - QGIS(Quantum GIS) インストール！'
published: true
date     : 2017-07-02 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

フリーでオープンソースの地理情報システム QGIS(Quantum GIS) を LMDE2 (Linux Mint Debian Edition 2) にインストールする方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Long Term Release 版でなく、最新の LTR candidate 版をインストール。

### 1. リポジトリの設定

File: `/etc/apt/sources.list.d/qgis.list`

{% highlight text linenos %}
deb     http://qgis.org/debian jessie main
deb-src http://qgis.org/debian jessie main
{% endhighlight %}

### 2. パッケージリストの更新

``` text
$ sudo apt update
```

### 3. GPG エラーが発生する場合

パッケージリストの更新で、以下のような公開鍵を利用できないと GPG エラーが発生する場合、

``` text
W: GPG エラー: http://qgis.org jessie InRelease: 公開鍵を利用できないため、
以下の署名は検証できませんでした: NO_PUBKEY 073D307A618E5811
```

apt keyring に qgis.prg リポジトリの公開鍵を追加する必要がある。

``` text
$ wget -O - http://qgis.org/downloads/qgis-2016.gpg.key | gpg --import
      :
===< 中略 >===
      :
gpg: 鍵618E5811: 公開鍵“QGIS Archive Automatic Signing Key (2016) <qgis-developer@lists.osgeo.org>”を読み込みました
gpg:     処理数の合計: 1
gpg:           読込み: 1  (RSA: 1)
gpg: 絶対的に信用する鍵が見つかりません

$ gpg --fingerprint 073D307A618E5811
pub   2048R/618E5811 2016-08-17 [満了: 2017-08-17]
                 指紋 = 942D 6AD5 DF3E 75DE A9AF  72B2 073D 307A 618E 5811
uid                  QGIS Archive Automatic Signing Key (2016) <qgis-developer@lists.osgeo.org>
sub   2048R/D34A963D 2016-08-17

$ gpg --export --armor 073D307A618E5811 | sudo apt-key add -
OK
```

ちなみに、上記の代わりに以下を実行してもよいだろう。

``` text
$ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-key 073D307A618E5811
```

公開鍵を追加できたら、再度パッケージリストの更新を試みる。

### 4. QGIS のインストール

``` text
$ sudo apt install qgis python-qgis qgis-plugin-grass
```

### 5. インストールの確認

インストールが完了すると、アプリケーションメニューの「教育・教養」グループ（なければ作られる）に「GRASS GIS」、「QGIS Browser」、「QGIS Desktop」が作られる。

以下は、「QGIS Desktop」を起動して「ヘルプ」ー「QGIS について」を確認したところ。

![QGIS_INSTALL]({{site.baseurl}}/images/2017/07/02/QGIS_INSTALL.png "QGIS_INSTALL")

### 6. 参考サイト

* [QGISのインストーラー](http://qgis.org/ja/site/forusers/alldownloads.html#linux "QGISのインストーラー")

当ブログの QGIS 等に関する過去記事は以下を参照。

* [Tag: QGIS - mk-mode BLOG](http://www.mk-mode.com/octopress/tags/qgis/ "Tag: QGIS - mk-mode BLOG")
* [Tag: GIS - mk-mode BLOG](http://www.mk-mode.com/octopress/tags/gis/ "Tag: GIS - mk-mode BLOG")
* [Tag: 地図 - mk-mode BLOG](http://www.mk-mode.com/octopress/tags/%E5%9C%B0%E5%9B%B3/ "Tag: 地図 - mk-mode BLOG")

---

これで、 Shapefile 等の地図データを使用して地図を描画したりすることができます。

以上。

