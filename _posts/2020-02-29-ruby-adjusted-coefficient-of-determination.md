---
layout   : single
title    : "Ruby - 重回帰分析・自由度調整済み決定係数の計算！"
published: true
date     : 2020-02-29 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

重回帰分析における自由度調整済み決定係数の計算を Ruby で行ってみました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 buster (64bit) での作業を想定。
* Ruby 2.7.0 での作業を想定。

### 1. 自由度調整済み決定係数について

決定係数は説明変数（独立変数）の数が増えるほど 1 に近づくという性質を持っている。そのため、説明変数の数が多い（重回帰分析）場合には、補正した**自由度調整済み決定係数（自由度修正済み決定係数）**を使う。

計算式は次のとおり。

$$
\begin{eqnarray*}
自由度調整済み決定係数\ R^2_f = 1 - \frac{\frac{S_E}{N-p-1}}{\frac{S_{y^2}}{N-1}}
\end{eqnarray*}
$$

但し、

$$
\begin{eqnarray*}
標本値の変動 &=& \sum_{i=1}^{N}(y_i - \bar{y})^2 = S_{y^2} \\
残差の変動 &=& \sum_{i=1}^{N}(y_i - Y_i)^2 = S_E \\
p &:& 説明（独立）変数の個数 \\
N &:& データ数
\end{eqnarray*}
$$

* 通常（単回帰分析）の**決定係数**については、「[Ruby - 単回帰分析（線形回帰）の決定係数計算！ ]({{site.baseurl}}/2019/06/23/ruby-regression-coefficient-of-determination "Ruby - 単回帰分析（線形回帰）の決定係数計算！ ")」を参照。

### 2. Ruby スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `adjusted_coefficient_of_determination.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*******************************************************************
# Ruby script to calculate an adjusted coefficient of determination.
#*******************************************************************
#
class AdjustedCoefficientOfDetermination
  # 説明変数と目的変数
  X = [
    [17.5, 17.0, 18.5, 16.0, 19.0, 19.5, 16.0, 18.0, 19.0, 19.5],
    [30  , 25  , 20  , 30  , 45  , 35  , 25  , 35  , 35  , 40  ]
  ]
  Y  = [45, 38, 41, 34, 59, 47, 35, 43, 54, 52]

  def exec
    puts "説明変数 X1 = [#{X[0].join(', ')}]"
    puts "説明変数 X2 = [#{X[1].join(', ')}]"
    puts "目的変数 Y  = [#{Y.join(', ')}]"
    puts "---"
    # 重回帰式算出
    reg = X.reg_multi(Y)
    puts "    a = %20.16f" % reg[0]
    puts "    b = %20.16f" % reg[1]
    puts "    c = %20.16f" % reg[2]
    # 推定値配列
    y_e = calc_estimations(X, Y, reg)
    # 標本値 Y （目的変数）の平均
    y_b = Y.inject(0) { |s, a| s += a } / Y.size.to_f
    # 自由度調整済み決定係数
    p, n = X.size, Y.size
    r_2  = calc_s_e(Y, y_e) / (n - p - 1)
    r_2 /= calc_s_r(Y, y_b) / (n - 1)
    r_2  = 1 - r_2
    puts "---"
    puts "自由度調整済み決定係数 R2f = %20.16f" % r_2
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
    exit 1
  end

private
  # 推定値
  #
  # @param   xs: 説明変数配列(2個)
  # @param    y: 目的変数配列
  # @param  reg: 重回帰式の値 a, b, c
  # @return y_e: 推定値配列
  def calc_estimations(xs, y, reg)
    y_e = Array.new

    begin
      a, b, c = reg
      y.zip(xs[0], xs[1]).each do |y, x1, x2|
        y_e << a + b * x1 + c * x2
      end
      return y_e
    rescue => e
      raise
    end
  end

  # 標本値の変動
  #
  # @param  y_s: 標本値（目的変数）配列
  # @param  y_b: 標本値（目的変数）の平均
  # @return s_r: 標本値の変動
  def calc_s_r(y_s, y_b)
    s_r = 0.0

    begin
      y_s.each do |a|
        v = a - y_b
        s_r += v * v
      end
      return s_r
    rescue => e
      raise
    end
  end

  # 残差の変動
  #
  # @param  y_s: 標本値（目的変数）配列
  # @param  y_e: 推定値配列
  # @return s_e: 残差の変動
  def calc_s_e(y_s, y_e)
    s_e = 0.0

    begin
      y_s.zip(y_e).each do |a, b|
        v = a - b
        s_e += v * v
      end
      return s_e
    rescue => e
      raise
    end
  end
end

class Array
  def reg_multi(y)
    # 元の数、変量内のサンプル数
    e_size, s_size = self.size, y.size
    # 以下の場合は例外スロー
    # - 引数の配列が Array クラスでない
    # - 自身配列が空
    # - 配列サイズが異なれば例外
    raise "Argument is not a Array class!"    unless y.class == Array
    raise "Self array is nil!"                if     e_size == 0
    raise "Argument array size is invalid!"   unless self[0].size == s_size
    1.upto(e_size - 1) do |i|
      raise "Argument array size is invalid!" unless self[0].size == self[i].size
    end
    x1, x2 = self
    sum_x1   = x1.sum
    sum_x2   = x2.sum
    sum_y    = y.sum
    sum_x1x1 = x1.map { |a| a * a }.sum
    sum_x1x2 = x1.zip(x2).map { |a, b| a * b }.sum
    sum_x1y  = x1.zip(y).map { |a, b| a * b }.sum
    sum_x2x1 = sum_x1x2
    sum_x2x2 = x2.map { |a| a * a }.sum
    sum_x2y  = x2.zip(y).map { |a, b| a * b }.sum
    mtx = [
      [s_size, sum_x1  , sum_x2  , sum_y  ],
      [sum_x1, sum_x1x1, sum_x1x2, sum_x1y],
      [sum_x2, sum_x2x1, sum_x2x2, sum_x2y]
    ]
    # 連立方程式を解く (ガウスの消去法)
    return gauss_e(mtx)
  end

private
  # ガウスの消去法
  def gauss_e(ary)
    # 行数
    n = ary.size
    # 前進消去
    0.upto(n - 2) do |k|
      (k + 1).upto(n - 1) do |i|
        if ary[k][k] == 0
          puts "解けない！"
          exit 1
        end
        d = ary[i][k] / ary[k][k].to_f
        (k + 1).upto(n) do |j|
          ary[i][j] -= ary[k][j] * d
        end
      end
    end
    # 後退代入
    (n - 1).downto(0) do |i|
      if ary[i][i] == 0
        puts "解けない！"
        exit 1
      end
      d = ary[i][n]
      (i + 1).upto(n - 1) do |j|
        d -= ary[i][j] * ary[j][n]
      end
      ary[i][n] = d / ary[i][i].to_f
    end
    return ary.map { |a| a[-1] }
  end
end

AdjustedCoefficientOfDetermination.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate an adjusted coefficient of determination.](https://gist.github.com/komasaru/2e90663ab6c94ebe0335b996ef422a41 "Gist - Ruby script to calculate an adjusted coefficient of determination.")

### 3. Ruby スクリプトの実行

まず、実行権限を付与。

``` text
$ sudo chmod +x adjusted_coefficient_of_determination.rb
```

そして、実行。

``` text
$ ./adjusted_coefficient_of_determination.rb
説明変数 X1 = [17.5, 17.0, 18.5, 16.0, 19.0, 19.5, 16.0, 18.0, 19.0, 19.5]
説明変数 X2 = [30, 25, 20, 30, 45, 35, 25, 35, 35, 40]
目的変数 Y  = [45, 38, 41, 34, 59, 47, 35, 43, 54, 52]
---
    a = -34.7129308350682493
    b =   3.4698126301179739
    c =   0.5330094841545223
---
自由度調整済み決定係数 R2f =   0.8176337138681722
```

---

以上。

