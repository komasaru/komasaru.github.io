---
layout   : single
title    : "Ruby - ラグランジュ補間！"
published: true
date     : 2013-03-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

前回は、C++ による「ラグランジュ補間」のアルゴリズムを紹介しました。

* [C++ - ラグランジュ補間！]({{site.baseurl}}/2013/03/10/cpp-interpolate-lagrange/ "C++ - ラグランジュ補間！")

今日は、同じアルゴリズムを Ruby で実現してみました。
アルゴリズムについては、上記リンクの記事を参照してください。

<!--more-->

実際、ほとんど同じです。

以下、Ruby によるサンプルスクリプトです。

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* Ruby 1.9.3-p385 を使用。
* ラグランジュ補間そのものについての詳細は割愛。

### 1. Ruby スクリプト作成

File: `interpolate_lagrange.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************
# ラグランジュ補間
#*********************************************
#
class InterpolateLagrange
  # あらかじめ与える点
  X = [0.0, 2.0, 3.0, 5.0, 8.0]
  Y = [0.8, 3.2, 2.8, 4.5, 1.9]

  def initialize
    @n = X.size  # 点の数
  end

  # 計算・結果出力
  def calc
    puts "      x      y"
    X[0].step(X[@n - 1], 0.5) do |t|
      printf("%7.2f%7.2f\n", t, interpolate_lagrange(t))
    end
  end

  private

  # ラグランジュ補間
  def interpolate_lagrange(t)
    s = 0.0  # 総和初期化
    # 総和
    0.upto(@n - 1) do |i|
      p = Y[i]
      # 総積
      0.upto(@n - 1) do |j|
        p *= (t - X[j]) / (X[i] - X[j]) unless i == j
      end
      s += p
    end
    return s
  end
end

if __FILE__ == $0
  begin
    # 計算クラスインスタンス化
    obj = InterpolateLagrange.new
    # ラグランジュ補間計算
    obj.calc
  rescue => e
    $stderr.puts "[例外発生] #{e}"
  end
end
{% endhighlight %}

* [Gist - Ruby script to interpolate with Lagrange method.](https://gist.github.com/komasaru/5003139 "Gist - Ruby script to interpolate with Lagrange method.")

### 2. 実行

まず、実行権限を付与。

``` text
$ chmod +x interpolate_lagrange.rb
```

そして、実行。

``` text
$ ruby interpolate_lagrange.rb
      x      y
   0.00   0.80
   0.50   2.49
   1.00   3.23
   1.50   3.37
   2.00   3.20
   2.50   2.95
   3.00   2.80
   3.50   2.85
   4.00   3.17
   4.50   3.74
   5.00   4.50
   5.50   5.32
   6.00   6.03
   6.50   6.37
   7.00   6.05
   7.50   4.70
   8.00   1.90
```

C++ 版と同じ結果が得られました。

### 3. グラフ

参考までに、 R でグラフを作成してみた。

![INTERPOLATE_GRAPH]({{site.baseurl}}/images/2013/03/11/INTERPOLATE_GRAPH.png "INTERPOLATE_GRAPH")

---

以上。

