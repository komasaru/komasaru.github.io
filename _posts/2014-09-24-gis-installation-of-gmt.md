---
layout   : single
title    : "GIS - GMT インストール！"
published: true
date     : 2014-09-24 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
---

高機能の地図・グラフ作成，データ処理ツール GMT（The Generic Mapping Tools）の導入についての記録です。

（GIS, GMT について精通している訳でもありません。乱文ご容赦ください）

<!--more-->

### 0. 前提条件

- Linux Mint 17 での作業を想定。
- 今回は APT でインストールする。（ソースをビルドしてインストールすることも可能）

### 1. GMT インストール

GMT 本体と海岸線データ（低解像度）をインストールする。（高解像度データ等は別途用意する必要がある）

``` text
$ sudo apt-get install gmt gmt-coast-low
```

### 2. パスの設定

インストール後デフォルトではパスが通っていないので Bash 設定ファイルで設定する。（以下は Bash で ".profile" に設定する場合。 ".bash_profile", ".bashrc" でもよいだろう）

File: `~/.profile`

{% highlight bash linenos %}
export PATH=/usr/lib/gmt/bin:$PATH
export GMTHOME=/usr/lib/gmt
{% endhighlight %}

そして、即時反映。（ログインし直してもよい）

``` text
$ source ~/.bash_profile
```

確認してみる。

``` text
$ echo $PATH
$ echo $GMTHOME
```

### 3. GMT インストール確認

GMT がインストールされているか、数あるコマンドのうち最も使用するであろう海岸線を描画するための `pscoast` コマンドで確認してみる。

``` text
$ pscoast
coast 4.5.11 [64-bit] - Plot continents, shorelines, rivers, and borders on maps

         :
====< 以下省略 >====
         :
```

バージョン情報やコマンド使用方法が表示されることで正常にインストールされていることが確認できた。

### 4. 地図描画テスト

試しに今回インストールした低解像度海岸線データを使用して日本地図を描画してみた。

``` text
$ pscoast -Jm1:25000000 -R120/155/20/50 -W -Gwheat -S240/255/255 -Bg5a10f5:."Map around Japan": -P > japan.eps
```

- **`-Jm1:25000000`**  
  投影法：メルカトル図法、1度あたり2,500万分の1スケール。  
  `-JM12c` のようすれば「メルカトル図法、全体の幅12cm」となる。  
  （小文字 `m` メルカトル図法、1度単位、大文字 `M` メルカトル図法、図全体）  
  メルカトル図法の他多数投影法あり。
- **`-R120/155/20/50`**  
  西端/東端/南端/北端の経緯度
- **`-W`**  
  海岸線を描画
- **`-Gtan`**  
  陸域の色：wheat（カラー名 or RGB で指定）
- **`-S224/238/228`**  
  水域の色：224/238/238（カラー名 or RGB で指定）
- **`-Bg5a10f5:."Map around Japan":`**  
  `B` 枠線、`g5` 5度間隔で経緯度線、`a10` 10度間隔でラベル、`f5` 5度間隔で枠線塗り分け、`:."タイトル":`
- **`-P`**  
  用紙向き：縦長（ポートレート）
- **`> japan.epx`**  
  出力先ファイル名

オプション等の詳細な使用方法は `pscoast --help` で確認可能。

### 5. 画像確認

作成された画像 japan.eps を開いて確認してみる。

![GMT_JAPAN]({{site.baseurl}}/images/2014/09/24/GMT_JAPAN.png "GMT_JAPAN")

---

GIS については不勉強で疎いですが、デフォルトで用意されている地図情報で不便を感じないし、 R 等より GMT で描画するようが容易かも知れません。

将来目論んでいることのために色々と少しずつ勉強していく所存です。（他にやりたいことは山ほどあるので、「可能なら。時間が取れれば」というスタンスで）

以上。

