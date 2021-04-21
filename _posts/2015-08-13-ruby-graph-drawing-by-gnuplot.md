---
layout   : single
title    : "Ruby - gnuplot でグラフ描画！"
published: true
date     : 2015-08-13 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- gnuplot
---

Ruby で容易にグラフを描画できる RubyGems ライブラリ gnuplot を使用してみました。

RubyGems ライブラリ gnuplot は、2次元や3次元のグラフを描画するためのコマンドラインツール Gnuplot を Ruby で使用できるようにラップしたものです。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) 一般ユーザでの作業を想定。
* Ruby 2.2.2-p95 での作業を想定。
* Gnuplot インストール済みであること。（[Linux Mint - Gnuplot でグラフ描画！]({{site.baseurl}}/2015/07/30/linux-mint-installation-gnuplot/ "Linux Mint - Gnuplot でグラフ描画！")）

### 1. RubyGems パッケージのインストール

``` text
$ sudo gem install gnuplot
```

### 2. 動作確認

#### 2-1. 作成例・１

単純な$$sin$$曲線・$$cos$$曲線を描画する例。

File: `gnuplot_1.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#-----------------------------------------------
# Ruby script to draw a graph by gnuplot.(Ex.1)
#-----------------------------------------------
require 'gnuplot'

Gnuplot.open do |gp|
  Gnuplot::Plot.new(gp) do |plot|
    plot.xrange "[-10:10]"
    plot.title  "作成例１"
    plot.xlabel "x"
    plot.ylabel "y"
    plot.grid

    plot.data << Gnuplot::DataSet.new("sin(x)") do |ds|
      ds.with      = "lines"
      ds.linewidth = 2
    end

    plot.data << Gnuplot::DataSet.new("cos(x)") do |ds|
      ds.with      = "lines"
      ds.linewidth = 2
    end
  end
end
{% endhighlight %}

* [Gist - Ruby script to draw a graph by gnuplot.(Ex.1)](https://gist.github.com/komasaru/18575f0245952cae7d02 "Gist - Ruby script to draw a graph by gnuplot.(Ex.1)")

そして、実行権限を付与して実行。

``` text
$ sudo chmod +x gnuplot_1.rb

$ ./gnuplot_1.rb
```

Gnuplot ウィンドウが開き、グラフが描画される。

![GNUPLOT_1]({{site.baseurl}}/images/2015/08/13/GNUPLOT_1.png "GNUPLOT_1")

但し、環境によってはこのウィンドウを閉じようとしてもうまく閉じれないかもしれない。（termnal が "wxt" の場合。 terminal が "x11" 等なら閉じれるが、日本語は使用できない）  
ちなみに、本家の gnuplot では、この問題は "Close" を "exit" でなく "exit gnuplot" にバインドすれば解決するようだが、今回の RubyGems ライブラリでは通用しない模様。（試行してみた結果）

#### 2-2. 作成例・２

$$y=x^3 - 2x + 2 \ (x={-2.0,-1.9,\cdots,1.9,2.0})$$のグラフを PNG ファイルに描画・出力する例。

File: `gnuplot_2.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#-----------------------------------------------
# Ruby script to draw a graph by gnuplot.(Ex.2)
#-----------------------------------------------
require 'gnuplot'

Gnuplot.open do |gp|
  Gnuplot::Plot.new(gp) do |plot|
    plot.terminal "png enhanced font 'IPA P ゴシック' fontscale 1.2"
    plot.output   "gnuplot_2.png"
    plot.title    "作成例２"
    plot.xlabel   "x"
    plot.ylabel   "y=x^3-2x+2"
    plot.grid

    x = (-20..20).collect { |v| v.to_f / 10.0 }
    y = x.collect { |v| v ** 3 - 2 * v + 2}

    plot.data << Gnuplot::DataSet.new([x, y]) do |ds|
      ds.with      = "linespoints"  # 点のみなら "points"
      ds.linewidth = 2
      ds.linecolor = 3
      ds.notitle
    end
  end
end
{% endhighlight %}

* [Gist - Ruby script to draw a graph by gnuplot.(Ex.2)](https://gist.github.com/komasaru/27e65a70d4681dd73370 "Gist - Ruby script to draw a graph by gnuplot.(Ex.2)")

そして、実行権限を付与して実行。

``` text
$ sudo chmod +x gnuplot_2.rb

$ ./gnuplot_2.rb
```

"gnuplot_2.png" というファイルが出力される。

![GNUPLOT_2]({{site.baseurl}}/images/2015/08/13/GNUPLOT_2.png "GNUPLOT_2")

#### 2-3. 作成例・３

$$z=sin(x)cos(x)$$の三次元グラフを PNG ファイルに描画・出力する例。

File: `gnuplot_3.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#-----------------------------------------------
# Ruby script to draw a graph by gnuplot.(Ex.3)
#-----------------------------------------------

require 'gnuplot'

Gnuplot.open do |gp|
  Gnuplot::SPlot.new(gp) do |plot|
    plot.terminal "png enhanced font 'IPA P ゴシック' fontscale 1.2"
    plot.output   "gnuplot_3.png"
    plot.set      "object 1 rect from screen 0,0 to screen 1,1 fc rgb '#D0D0E0' fillstyle solid 1.0 behind"
    plot.title    "作成例３"
    plot.xrange   "[-10:10]"
    plot.yrange   "[-10:10]"
    plot.xlabel   "x"
    plot.ylabel   "y"
    plot.zlabel   "z"
    plot.pm3d
    plot.grid

    plot.data << Gnuplot::DataSet.new("sin(x)*cos(y)") do |ds|
      ds.with      = "lines"
      ds.linecolor = 6
    end
  end
end
{% endhighlight %}

* [Gist - Ruby script to draw a graph by gnuplot.(Ex.3)](https://gist.github.com/komasaru/1395add506fd9a1a4bd6 "Gist - Ruby script to draw a graph by gnuplot.(Ex.3)")

そして、実行権限を付与して実行。

``` text
$ sudo chmod +x gnuplot_3.rb

$ ./gnuplot_3.rb
```

![GNUPLOT_3]({{site.baseurl}}/images/2015/08/13/GNUPLOT_3.png "GNUPLOT_3")

### 参考サイト

* [gnuplot](http://www.gnuplot.info/ "gnuplot")
* [gnuplot - RubyGems.org - your community gem host](https://rubygems.org/gems/gnuplot "gnuplot - RubyGems.org - your community gem host")

---

Ruby で処理した得た数値をグラフ化することが多い場合は重宝するでしょう。

以上。

