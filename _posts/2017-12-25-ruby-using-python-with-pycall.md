---
layout   : single
title    : "Ruby - PyCall で Python ライブラリを使用！"
published: true
date     : 2017-12-25 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Python
---

Ruby で Python のライブラリを使用したいことがあると思います。

以下、 Ruby で Python ライブラリを使用する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Ruby 2.4.3 での作業を想定。
* 使用する Python のバージョンは 2.7.9 を想定。
* マシンに Python を複数インストールしていて、システム標準以外のバージョンの Python を使用する方法については不明。（要調査）

### 1. 準備

Python がインストールされていなければインストールしておく。（PyPI も）

### 2. RubyGem ライブラリ PyCall のインストール

``` text
$ sudo gem install --pre pycall
```

### 3. サンプルスクリプトの作成

例として、軌道要素(TLE)から人工衛星の位置／速度を計算するソーススクリプトを作成する。

File: `pycall_sgp4.rb`

{% highlight python linenos %}
#! /usr/local/bin/ruby

require 'pycall/import'
include PyCall::Import

pyfrom 'sgp4.earth_gravity', import: :wgs72
pyfrom 'sgp4.io', import: :twoline2rv

TLE_1 = "1 25544U 98067A   17293.55189421  .00016717  00000-0  10270-3 0  9004"
TLE_2 = "2 25544  51.6380 133.3720 0005197  35.8378 324.3123 15.54181626  1244"

satellite = twoline2rv(TLE_1, TLE_2, wgs72)
res = satellite.propagate(2017, 10, 21, 15, 44, 10)
position, velocity = res[0], res[1]
puts "ERROR:\n\t#{satellite.error}(#{satellite.error_message})"
puts "POSITION:\n\t#{position}"
puts "VOLOCITY:\n\t#{velocity}"
{% endhighlight %}

* [Gist - Sample script of Ruby to use Python with PyCall.](https://gist.github.com/komasaru/307e0eb225387d8b4f355968920d113d "Gist - Sample script of Ruby to use Python with PyCall.")

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* TLE データは [Human Space Flight (HSF) - Realtime Data](https://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html "Human Space Flight (HSF) - Realtime Data") から拝借。
* 測地系は WGS72 を使用。

### 4. PyPI ライブラリのインストール

上記のサンプルソース内で使用する PyPI ライブラリ sgp4 をインストールする。

``` text
$ sudo pip install sgp4
```

### 5. サンプルスクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x pycall_sgp4.rb
```

そして、実行。

``` text
$ ./pycall_sgp4.rb
ERROR:
        0()
POSITION:
        (-4956.077785047007, 443.72256791453077, 4595.716324639249)
VOLOCITY:
        (2.197965467515399, -6.7082256206170685, 3.01223611957471)
```

* TEME(True Equator, Mean Equinox; 赤道直角座標系)で結果を出力。
* 位置の単位は km, 速度の単位は km/sec.

### 7. 参考サイト

* [mrkn/pycall.rb: Calling Python functions from the Ruby language](https://github.com/mrkn/pycall.rb "mrkn/pycall.rb: Calling Python functions from the Ruby language")
* [sgp4 1.4 : Python Package Index](https://pypi.python.org/pypi/sgp4/ "sgp4 1.4 : Python Package Index")

---

Ruby から Python ライブラリが使用できれば、実現の難しかった Ruby での機械学習等に手軽に取り組めるでしょう。

以上。

