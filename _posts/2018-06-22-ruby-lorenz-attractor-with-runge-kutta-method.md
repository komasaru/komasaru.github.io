---
layout   : single
title    : "Ruby - ローレンツ・アトラクタ（Runge-Kutta 法）！"
published: true
date     : 2018-06-22 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

前回、微分方程式の近似解法に Euler（オイラー）法を使用して、ローレンツ・アトラクタを計算＆描画してみました。（Ruby で）

* [Ruby - ローレンツ・アトラクタ（Euler 法）！]({{site.baseurl}}/2018/06/19/ruby-lorenz-attractor-with-euler-method "Ruby - ローレンツ・アトラクタ（Euler 法）！")

今回は、微分方程式の近似解法に Runge-Kutta（ルンゲ＝クッタ）法を使用して、計算＆描画してみました。（Ruby で）

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

### 2.  Runge-Kutta（ルンゲ＝クッタ）法とは

* Euler 法よりは計算に時間がかかるが、その分、精度も高い。
* 実際の研究等では、 Euler 法ではなく Runge-Kutta 法が使用されることが多い。
* ここでは、 Runge-Kutta 法の詳細については説明しない。

### 3. Ruby スクリプト作成

* 数値演算ライブラリ NArray は使用しない。（使用するほどでもないので）
* グラフ描画には "numo/gnuplot" ライブラリを使用。（要インストール）
* パラメータ `p`, `r`, `b` のデフォルト値は `10`, `28`, `8/3` としている。  
  変更したければ、 `lorenz` メソッド呼び出し時に引数で指定する。
* 今回使用するのは 4次 の Runge-Kutta 法。

File: `lorenz_attractor_runge_kutta.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# *************************************
# Lorenz attractor (Runge-Kutta method)
# *************************************
#
require 'numo/gnuplot'

class LorenzAttractorRungeKutta
  DT            = 1e-3     # Differential interval
  STEP          = 100000   # Time step count
  X_0, Y_0, Z_0 = 1, 1, 1  # Initial values of x, y, z

  def initialize
    @res = [[], [], []]
  end

  def exec
    xyz = [X_0, Y_0, Z_0]
    STEP.times do
      k_0 = lorenz(xyz)
      k_1 = lorenz(xyz.zip(k_0).map { |x, k| x + k * DT / 2.0 })
      k_2 = lorenz(xyz.zip(k_1).map { |x, k| x + k * DT / 2.0 })
      k_3 = lorenz(xyz.zip(k_2).map { |x, k| x + k * DT })
      3.times do |i|
        xyz[i] += (k_0[i] + 2 * k_1[i] + 2 * k_2[i] + k_3[i]) * DT / 6.0
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
        set   output:   "lorenz_attractor_runge_kutta.png"
        set   title:    "Lorenz attractor (Runge-Kutta method)"
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

LorenzAttractorRungeKutta.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to draw a lorenz attractor with Runge-Kutta's method.](https://gist.github.com/komasaru/dba70cb2e5b1585ed929cba3cbde1f5e "Gist - Ruby script to draw a lorenz attractor with Runge-Kutta's method.")

### 4. Ruby スクリプト実行

まず、実行権限を付与。

``` text
$ chmod +x lorenz_attractor_runge_kutta.rb
```

そして、実行。

``` text
$ ./lorenz_attractor_runge_kutta.rb
```

### 5. 結果確認

Ruby スクリプトと同じディレクトリ内に "lorenz_attractor_runge_kutta.png" という画像ファイルが作成されるので、確認してみる。

![LORENZ_ATTRACTOR_RUNGE_KUTTA]({{site.baseurl}}/images/2018/06/22/LORENZ_ATTRACTOR_RUNGE_KUTTA.png "LORENZ_ATTRACTOR_RUNGE_KUTTA")

---

以上。

