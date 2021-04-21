---
layout   : single
title    : "単回帰分析 - 各種モデル（直線／曲線回帰）の比較！"
published: true
date     : 2019-08-08 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

これまで Ruby で Array クラスを拡張して単回帰直線や各種単回帰曲線を計算してみました。

今回、それぞれの回帰モデル間にどのような違いがあるのか、グラフを並べて比較してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.3 での作業を想定。

### 1. 各種単回帰モデルについて

過去記事を参照。

* [Ruby - Array クラス拡張で単回帰直線計算(Ver.2)！]({{site.baseurl}}/2019/06/08/ruby-simple-linear-regression-line-v2 "Ruby - Array クラス拡張で単回帰直線計算(Ver.2)！")
* [Ruby - Array クラス拡張で単回帰曲線計算(Ver.2)！]({{site.baseurl}}/2019/06/11/ruby-simple-linear-regression-curve-v2 "Ruby - Array クラス拡張で単回帰曲線計算(Ver.2)！")
* [Ruby - Array クラス拡張で単回帰曲線（3次回帰モデル）計算！]({{site.baseurl}}/2019/07/14/ruby-simple-regression-curve-3d "Ruby - Array クラス拡張で単回帰曲線（3次回帰モデル）計算！")
* [Ruby - Array クラス拡張で単回帰曲線（4次回帰モデル）計算！]({{site.baseurl}}/2019/07/17/ruby-simple-regression-curve-4d "Ruby - Array クラス拡張で単回帰曲線（4次回帰モデル）計算！")
* [Ruby - Array クラス拡張で単回帰曲線（ルート回帰モデル）計算！]({{site.baseurl}}/2019/07/20/ruby-simple-regression-curve-sqrt "Ruby - Array クラス拡張で単回帰曲線（ルート回帰モデル）計算！")
* [Ruby - Array クラス拡張で単回帰曲線（自然対数回帰モデル）計算！]({{site.baseurl}}/2019/07/23/ruby-simple-regression-curve-ln "Ruby - Array クラス拡張で単回帰曲線（自然対数回帰モデル）計算！")
* [Ruby - Array クラス拡張で単回帰曲線（分数（逆数）回帰モデル）計算！]({{site.baseurl}}/2019/07/26/ruby-simple-regression-curve-frac "Ruby - Array クラス拡張で単回帰曲線（分数（逆数）回帰モデル）計算！")
* [Ruby - Array クラス拡張で単回帰曲線（べき乗回帰モデル）計算！]({{site.baseurl}}/2019/07/29/ruby-simple-regression-curve-power "Ruby - Array クラス拡張で単回帰曲線（べき乗回帰モデル）計算！")
* [Ruby - Array クラス拡張で単回帰曲線（指数（ab指数）回帰モデル）計算！]({{site.baseurl}}/2019/08/02/ruby-simple-regression-curve-exp "Ruby - Array クラス拡張で単回帰曲線（指数（ab指数）回帰モデル）計算！")
* [Ruby - Array クラス拡張で単回帰曲線（e指数回帰モデル）計算！]({{site.baseurl}}/2019/08/05/ruby-simple-regression-curve-expe "Ruby - Array クラス拡張で単回帰曲線（e指数回帰モデル）計算！")

### 2. 使用する説明変数と目的変数

以下のような、体重(kg)と身長(cm)のようなデータ。

``` text
説明変数 X = {83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62}
目的変数 Y = {183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175,164, 175}
```

### 3. 各種グラフ

【直線回帰モデル】 $$y=a+bx$$

![REGRESSION_LINE]({{site.baseurl}}/images/2019/08/08/REGRESSION_LINE.png "REGRESSION_LINE")

【2次曲線回帰モデル】 $$y=a+bx+cx^2$$

![REGRESSION_CURVE_2D]({{site.baseurl}}/images/2019/08/08/REGRESSION_CURVE_2D.png "REGRESSION_CURVE_2D")

【3次曲線回帰モデル】 $$y=a+bx+cx^2+dx^3$$

![REGRESSION_CURVE_3D]({{site.baseurl}}/images/2019/08/08/REGRESSION_CURVE_3D.png "REGRESSION_CURVE_3D")

【4次曲線回帰モデル】 $$y=a+bx+cx^2+dx^3+ex^4$$

![REGRESSION_CURVE_4D]({{site.baseurl}}/images/2019/08/08/REGRESSION_CURVE_4D.png "REGRESSION_CURVE_4D")

【ルート回帰モデル】 $$y=a+b\sqrt{x}$$

![REGRESSION_CURVE_SQRT]({{site.baseurl}}/images/2019/08/08/REGRESSION_CURVE_SQRT.png "REGRESSION_CURVE_SQRT")

【自然対数回帰モデル】 $$y=a+b\log_e{x}$$

![REGRESSION_CURVE_LN]({{site.baseurl}}/images/2019/08/08/REGRESSION_CURVE_LN.png "REGRESSION_CURVE_LN")

【分数（逆数）回帰モデル】 $$\displaystyle y=a+\frac{b}{x}$$

![REGRESSION_CURVE_FRAC]({{site.baseurl}}/images/2019/08/08/REGRESSION_CURVE_FRAC.png "REGRESSION_CURVE_FRAC")

【べき乗回帰モデル】 $$y=ax^b$$

![REGRESSION_CURVE_POW]({{site.baseurl}}/images/2019/08/08/REGRESSION_CURVE_POW.png "REGRESSION_CURVE_POW")

【指数（ab指数）回帰モデル】 $$y=ab^x$$

![REGRESSION_CURVE_EXP]({{site.baseurl}}/images/2019/08/08/REGRESSION_CURVE_EXP.png "REGRESSION_CURVE_EXP")

【e指数回帰モデル】 $$y=ae^{bx}$$

![REGRESSION_CURVE_EXP_E]({{site.baseurl}}/images/2019/08/08/REGRESSION_CURVE_EXP_E.png "REGRESSION_CURVE_EXP_E")

---

以上。

