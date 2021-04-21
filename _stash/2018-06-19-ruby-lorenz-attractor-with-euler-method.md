---
layout   : single
title    : "Ruby - ローレンツ・アトラクタ（Euler 法）！"
published: true
date     : 2018-06-19 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby でローレンツ・アトラクタを描画してみました。
（微分方程式の近似解法には Euler（オイラー）法を使用）

<!--more-->

### 0. 前提条件

* Ruby 2.5.0-p0 での作業を想定。

### 1. ローレンツ方程式／アトラクタとは

* 「ローレンツ方程式」とは、気象学者「エドワード・Ｎ・ローレンツ(Edward N. Lorenz)」が作成した力学系方程式をより単純化した、次のような非線形微分方程式。  
  パラメータ p, r, b をほんの少し変えるだけで、これらの方程式から得られる軌跡は大きく異なったものになる。

$$
\begin{eqnarray}
\frac{dx}{dt} &=& -px+py \\
\frac{dy}{dt} &=& -xz+rx-y \\
\frac{dz}{dt} &=& xy-bz
\end{eqnarray}
$$

* 「ローレンツ方程式」は、カオス理論を学習する際に序盤で登場する方程式で、カオス研究の先駆的なもの。
* 「アトラクタ」とは、ある力学系がそこに向かって時間発展する集合のことで、カオス理論における研究課題の一つ。
* 「ローレンツ・アトラクタ」とは、ストレンジ・アトラクタの一種。
* 「ローレンツ・アトラクタ」は、言い換えれば、「ローレンツ方程式のカオスのストレンジ・アトラクタ」である。

### 2.  Euler（オイラー）法とは

* 微分方程式の近似解法の中で計算が比較的簡単なものだが、その分、計算も粗い。
* 実際の研究等で使用されることはほとんどない。
* 近似解法の概念を理解するための一助にはなる。
* ここでは、 Euler 法の詳細については説明しない。

### 3. Ruby スクリプト作成

* 数値演算ライブラリ NArray は使用しない。（使用するほどでもないので）
* グラフ描画には "numo/gnuplot" ライブラリを使用。（要インストール）
* パラメータ `p`, `r`, `b` のデフォルト値は `10`, `28`, `8/3` としている。  
  変更したければ、 `lorenz` メソッド呼び出し時に引数で指定する。
* 実際、ローレンツ・アトラクタを計算する際に計算の粗い Euler 法を使用することはあまりない（ルンゲ＝クッタ法で計算することが多い）ので、あくまでも、参考程度に。

File: `lorenz_attractor_euler.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# *******************************
# Lorenz attractor (Euler method)
# *******************************
#
require 'numo/gnuplot'

class LorenzAttractorEuler
  DT            = 1e-3     # Differential interval
  STEP          = 100000   # Time step count
  X_0, Y_0, Z_0 = 1, 1, 1  # Initial values of x, y, z

  def initialize
    @res = [[], [], []]
  end

  def exec
    xyz = [X_0, Y_0, Z_0]
    STEP.times do
      l = lorenz(xyz)
      3.times do |i|
        xyz[i] += DT * l[i]
        @res[i] << xyz[i]
      end
    end
    plot
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}" }
    exit 1
  end

  private

  def lorenz(xyz, p=10, r=28, b=8/3.0)
    return [
      -p * xyz[0] + p * xyz[1],
      -xyz[0] * xyz[2] + r * xyz[0] - xyz[1],
      xyz[0] * xyz[1] - b * xyz[2]
    ]
  rescue => e
    raise
  end

  def plot
    x, y, z = @res

    begin
      Numo.gnuplot do
        set   terminal: "png"
        set   output:   "lorenz_attractor_euler.png"
        set   title:    "Lorenz attractor (Euler method)"
        set   xlabel:   "x"
        set   ylabel:   "y"
        set   zlabel:   "z"
        unset :key
        splot x, y, z, with: :lines, linecolor: {rgb: "blue"}
      end
    rescue => e
      raise
    end
  end
end

exit 0 unless __FILE__ == $0
LorenzAttractorEuler.new.exec
{% endhighlight %}

* [Gist - Ruby script to draw a lorenz attractor with Euler's method.](https://gist.github.com/komasaru/0e9ec99ceb90145ed56bd7fbb211f436 "Gist - Ruby script to draw a lorenz attractor with Euler's method.")

### 4. Ruby スクリプト実行

まず、実行権限を付与。

``` text
$ chmod +x lorenz_attractor_euler.rb
```

そして、実行。

``` text
$ ./lorenz_attractor_euler.rb
```

### 5. 結果確認

Ruby スクリプトと同じディレクトリ内に "lorenz_attractor_euler.png" という画像ファイルが作成されるので、確認してみる。

![LORENZ_ATTRACTOR_EULER]({{site.baseurl}}/images/2018/06/19/LORENZ_ATTRACTOR_EULER.png "LORENZ_ATTRACTOR_EULER")

---

以上。

