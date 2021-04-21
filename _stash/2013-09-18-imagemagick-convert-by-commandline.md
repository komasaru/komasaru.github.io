---
layout   : single
title    : "ImageMagick - convert コマンドで画像変換！"
published: true
date     : 2013-09-18 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- 画像
- ImageMagick
---

コマンドラインから画像処理ソフト ImageMagick の `convert` コマンドを使用して、画像を色々と変換してみました。

`convert` コマンドでどのような変換ができるかを確認するためです。

今回、やってみたことは以下の通り。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業・動作確認を想定。
- 画像処理処理ソフト ImageMagick がインストール済みである。
- 画像に関する用語については説明しない。必要であれば、別途お調べください。
- 今回使用する画像以下のような画像（ファイル名："test.jpg", 幅：320px, 高さ：240px）

![test]({{site.baseurl}}/images/2013/09/18/test.jpg "元画像")

#### サイズ変更

画像のサイズをピクセル値を指定して変更する場合は、以下のようにする。

``` bash 
$ convert test.jpg -geometry 240x180 test_resize_1.jpg
```

![test_resize_1]({{site.baseurl}}/images/2013/09/18/test_resize_1.jpg "サイズ変更１")

画像のサイズを比率を指定して変更する場合は、以下のようにする。

``` bash 
$ convert test.jpg -geometry 100%x70% test_resize_2.jpg
```

![test_resize_2]({{site.baseurl}}/images/2013/09/18/test_resize_2.jpg "サイズ変更２")

`80%x80%` のように幅・高さが同じなら `80%` と記述してもよい。  
また、元の画像のサイズより小さくなる場合のみ適用したいときは `240x180>` と、元の画像のサイズより大きくなる場合のみ適用したいときは `240x180<` とするようだ。

#### 上下反転

画像を上下反転させたい場合は、以下のようにする。

``` bash 
$ convert test.jpg -flip test_flip.jpg
```

![test_flip]({{site.baseurl}}/images/2013/09/18/test_flip.jpg "上下反転")

#### 左右反転

画像を左右反転させたい場合は、以下のようにする。

``` bash 
$ convert test.jpg -flop test_flop.jpg
```

![test_flop]({{site.baseurl}}/images/2013/09/18/test_flop.jpg "左右反転")

#### 回転（時計回り）

画像を時計回りに回転させたい場合は、以下のようにする。  
半時計回りならマイナス値で指定する。

``` bash 
$ convert test.jpg -rotate 30 test_rotate.jpg
```

![test_rotate]({{site.baseurl}}/images/2013/09/18/test_rotate.jpg "回転")

#### 枠付け

画像の周りに単純に色を付ける場合は、以下のようにする。

``` bash 
$ convert test.jpg -bordercolor blue -border 10x10 test_border.jpg
```

![test_border]({{site.baseurl}}/images/2013/09/18/test_border.jpg "色枠")

画像の周りに立体的な枠を付ける場合は、以下のようにする。

``` bash 
$ convert test.jpg -mattecolor yellow -frame 10x10+4+4 test_frame.jpg
```

![test_frame]({{site.baseurl}}/images/2013/09/18/test_frame.jpg "フレーム")

画像が浮き上がったように見える枠を付ける場合は、以下のようにする。

``` bash 
$ convert test.jpg -raise 10x10 test_raise.jpg
```

![test_raise]({{site.baseurl}}/images/2013/09/18/test_raise.jpg "浮き上げ")

#### モノクロ変換

画像をモノクロ画像に変換するには、以下のようにする。

``` bash 
$ convert test.jpg -monochrome test_monochrome.jpg
```

![test_monochrome]({{site.baseurl}}/images/2013/09/18/test_monochrome.jpg "モノクロ変換")

#### 二値化

画像を二値化変換するには、以下のようにする。  
`-threshold` の設定値は画像の輝度に合わせて調節する。

``` bash 
$ convert test.jpg -threshold 10000 test_threshold.jpg
```

![test_threshold]({{site.baseurl}}/images/2013/09/18/test_threshold.jpg "二値化")

#### メディアンフィルタ

画像にメディアンフィルタをかけるには、以下のようにする。  
`-median` の設定値は適当に調節する。

``` bash 
$ convert test.jpg -median 10 test_median.jpg
```

![test_median]({{site.baseurl}}/images/2013/09/18/test_median.jpg "メディアンフィルタ")

#### ぼかし

画像にぼかしをかけるには、以下のようにする。  
`-blur` の設定値は適当に調節する。

``` bash 
$ convert test.jpg -blur 5x5 test_blur.jpg
```

![test_blur]({{site.baseurl}}/images/2013/09/18/test_blur.jpg "ぼかし")

#### モザイク

画像にモザイクをかけるには、以下のようにする。  
２つの `-sample` を使用する。１つ目の `-sample` 値が元画像の 1/x 倍なら、２つ目の `-sample` 値は元画像の x 倍を指定する。

``` bash 
$ convert test.jpg -sample 20% -sample 500% test_sample.jpg
```

![test_sample]({{site.baseurl}}/images/2013/09/18/test_sample.jpg "モザイク")

#### エッジ検出

画像のエッジを検出するに、以下のようにする。  
`-edge` の設定値は適当に調節する。

``` bash 
$ convert test.jpg -edge 10 test_edge.jpg
```

![test_edge]({{site.baseurl}}/images/2013/09/18/test_edge.jpg "エッジ検出")

#### エンボス

画像にエンボス効果をかけるには、以下のようにする。  
`-emboss` の設定値は適当に調節する。

``` bash 
$ convert test.jpg -emboss 10 test_emboss.jpg
```

![test_emboss]({{site.baseurl}}/images/2013/09/18/test_emboss.jpg "エンボス")

#### 水墨画風

画像を水墨画風に変換するには、以下のようにする。  
`-charcoal` の設定値は適当に調節する。

``` bash 
$ convert test.jpg -charcoal 5 test_charcoal.jpg
```

![test_charcoal]({{site.baseurl}}/images/2013/09/18/test_charcoal.jpg "水墨画風")

#### ぬりえ風

画像をぬりえ風に変換するには、以下のようにする。

``` bash 
$ convert test.jpg -edge 1 -negate -normalize -colorspace Gray \
    -blur -0x.5 -contrast-stretch 0x50% test_colorspace_1.jpg
```

![test_colorspace_1]({{site.baseurl}}/images/2013/09/18/test_colorspace_1.jpg "ぬりえ風１")

以下のようなコマンドでもよい。

``` bash 
$ convert test.jpg -background white -flatten -colorspace Gray \
    -negate -edge 1 -negate -normalize -threshold 50% -despeckle \
    -blur 0x.5 -contrast-stretch 0x50% test_colorspace_2.jpg
```

![test_colorspace_2]({{site.baseurl}}/images/2013/09/18/test_colorspace_2.jpg "ぬりえ風２")

さらに、以下のようなコマンドだと、よりぬりえ風に近づいた。（画像の質による）

``` bash 
$ convert test.jpg -colorspace gray \
    \( +clone -blur 0x2 \) +swap -compose divide -composite \
    -linear-stretch 5%x0% test_colorspace_3.jpg
```

![test_colorspace_3]({{site.baseurl}}/images/2013/09/18/test_colorspace_3.jpg "ぬりえ風３")

#### スケッチ風

画像をスケッチ風に変換するには、以下のようにする。

``` bash 
$ convert test.jpg -colorspace gray -sketch 0x20+135 test_sketch_1.jpg
```

![test_sketch_1]({{site.baseurl}}/images/2013/09/18/test_sketch_1.jpg "スケッチ風１")

以下のように、あらかじめスケッチ風背景画像を作成しておき、次にその画像を元の画像に重ね合わせるような方法も可能。

``` bash 
$ convert -size 256x256 xc:  +noise Random  -virtual-pixel tile \
    -motion-blur 0x20+135 -charcoal 1 -resize 50% pencil_tile.gif
$ convert test.jpg -colorspace gray \
    \( +clone -tile pencil_tile.gif -draw "color 0,0 reset" \
    +clone +swap -compose color_dodge -composite \) \
    -fx 'u*.2+v*.8' test_sketch_2.jpg
```

![pencil_tile]({{site.baseurl}}/images/2013/09/18/pencil_tile.gif "スケッチ風背景")
![test_sketch_2]({{site.baseurl}}/images/2013/09/18/test_sketch_2.jpg "スケッチ風２")

#### 参考サイト

- [ImageMagick: Command-line Tools](http://www.imagemagick.org/script/command-line-tools.php "ImageMagick: Command-line Tools")

---

これらの他にも、様々な画像変換方法が考えられます。  
他の方法は、必要になった際に考えることにします。

以上。

