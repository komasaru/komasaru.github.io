---
layout   : single
title    : "Ruby - Array クラス拡張で単回帰曲線（分数（逆数）回帰モデル）計算！"
published: true
date     : 2019-07-26 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で Array クラスを拡張して単回帰曲線（分数（逆数）回帰モデル）を計算してみました。（連立方程式の解法にはガウスの消去法を使用）

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.3 での作業を想定。

### 1. 単回帰曲線（分数（逆数）回帰モデル）の求め方

求める曲線を $$\displaystyle y=a+\frac{b}{x}$$ とすると、残差の二乗和 $$S$$ は

$$
S = \sum_{i=1}^{N}(y_i - a - \frac{b}{x})^2
$$

となる。 $$a,b$$ それぞれで偏微分したものを $$0$$ とする。

$$
\begin{eqnarray*}
\frac{\partial S}{\partial a} &=& 2\sum_{i=1}^{N}(a+\frac{b}{x_i} - y_i)= 0 \\
\frac{\partial S}{\partial b} &=& 2\sum_{i=1}^{N}(a+\frac{b}{x_i} - y_i)\frac{1}{x_i}= 0
\end{eqnarray*}
$$

これらを変形すると、

$$
\begin{eqnarray*}
aN + b\sum_{i=1}^{N}\frac{1}{x_i} &=& \sum_{i=1}^{N}y_i \\
a\sum_{i=1}^{N}\frac{1}{x_i} + b\sum_{i=1}^{N}\frac{1}{x_i^2} &=& \sum_{i=1}^{N}\frac{y_i}{x_i }
\end{eqnarray*}
$$

となる。これらの連立方程式を解けばよい。

### 2. ガウスの消去法による連立方程式の解法について

当ブログ過去記事を参照。

* [Ruby - 連立方程式解法（ガウスの消去法）！ ]({{site.baseurl}}/2013/09/25/ruby-simultaneous-equation-by-gauss-elimination "Ruby - 連立方程式解法（ガウスの消去法）！ ")

### 3. Ruby スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `regression_curve_frac.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************
# Ruby script to calculate a simple regression curve.
# : y = a + b / x
# : 連立方程式を ガウスの消去法で解く方法
#*********************************************
#
class Array
  def reg_curve_frac(y)
    # 以下の場合は例外スロー
    # - 引数の配列が Array クラスでない
    # - 自身配列が空
    # - 配列サイズが異なれば例外
    raise "Argument is not a Array class!"  unless y.class == Array
    raise "Self array is nil!"              if self.size == 0
    raise "Argument array size is invalid!" unless self.size == y.size

    sum_ix  = self.inject(0) { |s, a| s += 1.0 / a }
    sum_ix2 = self.inject(0) { |s, a| s += (1.0 / a) * (1.0 / a) }
    sum_y   = y.inject(0) { |s, a| s += a }
    sum_yix = self.zip(y).inject(0) { |s, a| s += a[1] / a[0].to_f }
    mtx = [
      [self.size,  sum_ix,   sum_y],
      [   sum_ix, sum_ix2, sum_yix]
    ]
    ans = solve_ge(mtx)
    {a: ans[0][-1], b: ans[1][-1]}
  end

  private

  # 連立方程式の解（ガウスの消去法）
  def solve_ge(a)
    n = a.size
    # 前進消去
    (n - 1).times do |k|
      (k + 1).upto(n - 1) do |i|
        d = a[i][k] / a[k][k].to_f
        (k + 1).upto(n) do |j|
          a[i][j] -= a[k][j] * d
        end
      end
    end
    # 後退代入
    (n - 1).downto(0) do |i|
      d = a[i][n]
      (i + 1).upto(n - 1) do |j|
        d -= a[i][j] * a[j][n]
      end
      a[i][n] = d / a[i][i].to_f
    end
    return a
  end
end

# 説明変数と目的変数
#ary_x = [107, 336, 233, 82, 61, 378, 129, 313, 142, 428]
#ary_y = [286, 851, 589, 389, 158, 1037, 463, 563, 372, 1020]
ary_x = [83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62]
ary_y = [183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175, 164, 175]
puts "説明変数 X = {#{ary_x.join(', ')}}"
puts "目的変数 Y = {#{ary_y.join(', ')}}"
puts "---"

# 単回帰曲線算出
reg_line = ary_x.reg_curve_frac(ary_y)
puts "a = #{reg_line[:a]}"
puts "b = #{reg_line[:b]}"
{% endhighlight %}

* [Gist - Ruby script to calculate a simple regression curve.(frac)](https://gist.github.com/komasaru/47ac57a919f0d8849fdc75e51334a832 "Ruby script to calculate a simple regression curve.(frac)")

### 4. Ruby スクリプトの実行

``` text
$ ./regression_curve_frac.rb
説明変数 X = {83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62}
目的変数 Y = {183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175,164, 175}
---
a = 220.77419385311254
b = -3264.22565196197
```

### 5. 視覚的な確認

参考までに、上記スクリプトで使用した2変量の各点と作成された単回帰曲線を gnuplot で描画してみた。

![REGRESSION_CURVE_FRAC]({{site.baseurl}}/images/2019/07/26/REGRESSION_CURVE_FRAC.png "REGRESSION_CURVE_FRAC")

---

以上。

