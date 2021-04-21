---
layout   : single
title    : "Bash - ImageMagick で複数画像を一括作成！"
published: true
date     : 2015-04-15 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- bash
---
こんにちは。

bash スクリプトで ImageMagick を使用して複数の画像を一括で作成する方法についての備忘録です。

シリーズ化したい画像や大量にサンプル画像が必要な際に役立つ（GUI ツールを使用するよりは楽になる）と思います。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* Bash 4.3.33 での作業を想定。
* ImageMagick 6.7.7-10 での作業を想定。

### 1. bash スクリプトの作成

それほど凝ったものでもないので、説明はしない。  
（以下のの `ps_city` は、市の名称が２文字の場合と３文字の場合でポイントサイズを分けるために計算している）

File: `image_magick.sh`

{% highlight bash linenos %}
#!/bin/bash

CITIES=(
  "SHIMANE   matsue     島根   松江"
  "OKAYAMA   okayama    岡山   岡山"
  "HOKKAIDO  sapporo    北海道 札幌"
  "TOCHIGI   utsunomiya 栃木   宇都宮"
  "KAGOSHIMA kagoshima  鹿児島 鹿児島"
)

for row in "${CITIES[@]}"
do
  echo "* $row"
  read pref_a city_a pref_n city_n < <(echo $row)
  ps_city=`expr 108 / ${#city_n}`
  convert \
    -size 128x128 gradient:darkblue-darkgreen \
    -gravity NorthWest \
    -font Courier-Bold \
    -pointsize 16 -fill gray \
    -stroke none                  -annotate +6+48 "$pref_a" \
    -font /usr/share/fonts/opentype/ipaexfont-gothic/ipaexg.ttf \
    -pointsize 36 -fill orange \
    -stroke black -strokewidth 10 -annotate +6+6  "$pref_n" \
    -stroke none                  -annotate +6+6  "$pref_n" \
    -gravity SouthEast \
    -pointsize $ps_city -fill red \
    -stroke black -strokewidth 10 -annotate +8+6  "$city_n" \
    -stroke none                  -annotate +8+6  "$city_n" \
    ./image_magick/${city_a}.png
done
{% endhighlight %}

### 2. bash スクリプトの実行

画像保存用ディレクトリを作成（今回の場合、スクリプトのあるディレクトリに "image_magick" というディレクトリを作成）して、bash スクリプトを実行する。

``` text
$ ./image_magick.sh
* SHIMANE   matsue     島根   松江
* OKAYAMA   okayama    岡山   岡山
* HOKKAIDO  sapporo    北海道 札幌
* TOCHIGI   utsunomiya 栃木   宇都宮
* KAGOSHIMA kagoshima  鹿児島 鹿児島
```

### 3. 画像の確認

今回の例の場合、以下のような５つの画像が作成されるはず。（以下は１枚に結合している）

![IMAGE_MAGICK]({{site.baseurl}}/images/2015/04/15/IMAGE_MAGICK.png "IMAGE_MAGICK")

### 4. 参考サイト

* [ImageMagick v6 Examples](http://www.imagemagick.org/Usage/ "ImageMagick v6 Examples")

---

これを色々の場面に応用できるでしょう。

以上。

