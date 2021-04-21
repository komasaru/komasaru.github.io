---
layout   : single
title    : "Ruby - Array クラス拡張で単回帰曲線（4次回帰モデル）計算！"
published: true
date     : 2019-07-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で Array クラスを拡張して回帰式が4次の単回帰曲線を計算してみました。（連立方程式の解法にはガウスの消去法を使用）

前回は3次回帰モデルについて行なっています。

* [Ruby - Array クラス拡張で単回帰曲線（3次回帰モデル）計算！]({{site.baseurl}}/2019/07/14/ruby-simple-regression-curve-3d "Ruby - Array クラス拡張で単回帰曲線（3次回帰モデル）計算！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.3 での作業を想定。

### 1. 単回帰曲線（4次回帰モデル）の求め方

求める曲線を $$y=a+bx+cx^2+dx^3+ex^4$$ とすると、残差の二乗和 $$S$$ は

$$
S = \sum_{i=1}^{N}(y_i - a - bx_i - cx_i^2 - dx^3 - ex^4)^2
$$

となる。 $$a,b,c,d,e$$ それぞれで偏微分したものを $$0$$ とする。

$$
\begin{eqnarray*}
\frac{\partial S}{\partial a} &=& 2\sum_{i=1}^{N}(a+bx_i+cx_i^2+dx_i^3+ex_i^4 - y_i) = 0 \\
\frac{\partial S}{\partial b} &=& 2\sum_{i=1}^{N}(ax_i+bx_i^2+cx_i^3+dx_i^4+ex_i^5 - x_{i}y_i) = 0 \\
\frac{\partial S}{\partial c} &=& 2\sum_{i=1}^{N}(ax_i^2+bx_i^3+cx_i^4+dx_i^5+ex_i^6 - x_{i}^{2}y_i) = 0 \\
\frac{\partial S}{\partial d} &=& 2\sum_{i=1}^{N}(ax_i^3+bx_i^4+cx_i^5+dx_i^6+ex_i^7 - x_{i}^{3}y_i) = 0 \\
\frac{\partial S}{\partial e} &=& 2\sum_{i=1}^{N}(ax_i^4+bx_i^5+cx_i^6+dx_i^7+ex_i^8 - x_{i}^{3}y_i) = 0
\end{eqnarray*}
$$

これらを変形すると、

$$
\begin{eqnarray*}
aN + b\sum_{i=1}^{N}x_i + c\sum_{i=1}^{N}x_i^2 + d\sum_{i=1}^{N}x_i^3 + e\sum_{i=1}^{N}x_i^4 &=& \sum_{i=1}^{N}y_i \\
a\sum_{i=1}^{N}x_i + b\sum_{i=1}^{N}x_i^2 + c\sum_{i=1}^{N}x_i^3 + d\sum_{i=1}^{N}x_i^4 + e\sum_{i=1}^{N}x_i^5 &=& \sum_{i=1}^{N}x_{i}y_i \\
a\sum_{i=1}^{N}x_i^2 + b\sum_{i=1}^{N}x_i^3 + c\sum_{i=1}^{N}x_i^4 + d\sum_{i=1}^{N}x_i^5 + e\sum_{i=1}^{N}x_i^6 &=& \sum_{i=1}^{N}x_{i}^{2}y_i \\
a\sum_{i=1}^{N}x_i^3 + b\sum_{i=1}^{N}x_i^4 + c\sum_{i=1}^{N}x_i^5 + d\sum_{i=1}^{N}x_i^6 + e\sum_{i=1}^{N}x_i^7 &=& \sum_{i=1}^{N}x_{i}^{3}y_i \\
a\sum_{i=1}^{N}x_i^4 + b\sum_{i=1}^{N}x_i^5 + c\sum_{i=1}^{N}x_i^6 + d\sum_{i=1}^{N}x_i^7 + e\sum_{i=1}^{N}x_i^8 &=& \sum_{i=1}^{N}x_{i}^{4}y_i
\end{eqnarray*}
$$

となる。これらの連立方程式を解けばよい。

### 2. ガウスの消去法による連立方程式の解法について

当ブログ過去記事を参照。

* [Ruby - 連立方程式解法（ガウスの消去法）！ ]({{site.baseurl}}/2013/09/25/ruby-simultaneous-equation-by-gauss-elimination "Ruby - 連立方程式解法（ガウスの消去法）！ ")

### 3. Ruby スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `regression_curve_4d.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************
# Ruby script to calculate a simple regression curve.
# : y = a + b * x + c * x^2 + d * x^3 + e * x^4
# : 連立方程式を ガウスの消去法で解く方法
#*********************************************
#
class Array
  def reg_curve_4d(y)
    # 以下の場合は例外スロー
    # - 引数の配列が Array クラスでない
    # - 自身配列が空
    # - 配列サイズが異なれば例外
    raise "Argument is not a Array class!"  unless y.class == Array
    raise "Self array is nil!"              if self.size == 0
    raise "Argument array size is invalid!" unless self.size == y.size

    sum_x   = self.inject(0) { |s, a| s += a }
    sum_x2  = self.inject(0) { |s, a| s += a * a }
    sum_x3  = self.inject(0) { |s, a| s += a * a * a }
    sum_x4  = self.inject(0) { |s, a| s += a * a * a * a }
    sum_x5  = self.inject(0) { |s, a| s += a * a * a * a * a }
    sum_x6  = self.inject(0) { |s, a| s += a * a * a * a * a * a }
    sum_x7  = self.inject(0) { |s, a| s += a * a * a * a * a * a * a }
    sum_x8  = self.inject(0) { |s, a| s += a * a * a * a * a * a * a * a }
    sum_y   = y.inject(0) { |s, a| s += a }
    sum_xy  = self.zip(y).inject(0) { |s, a| s += a[0] * a[1] }
    sum_x2y = self.zip(y).inject(0) { |s, a| s += a[0] * a[0] * a[1] }
    sum_x3y = self.zip(y).inject(0) { |s, a| s += a[0] * a[0] * a[0] * a[1] }
    sum_x4y = self.zip(y).inject(0) { |s, a| s += a[0] * a[0] * a[0] * a[0] * a[1] }
    mtx = [
      [self.size,  sum_x, sum_x2, sum_x3, sum_x4,   sum_y],
      [    sum_x, sum_x2, sum_x3, sum_x4, sum_x5,  sum_xy],
      [   sum_x2, sum_x3, sum_x4, sum_x5, sum_x6, sum_x2y],
      [   sum_x3, sum_x4, sum_x5, sum_x6, sum_x7, sum_x3y],
      [   sum_x4, sum_x5, sum_x6, sum_x7, sum_x8, sum_x4y]
    ]
    ans = solve_ge(mtx)
    {a: ans[0][-1], b: ans[1][-1], c: ans[2][-1], d: ans[3][-1], e: ans[4][-1]}
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
reg_line = ary_x.reg_curve_4d(ary_y)
puts "a = #{reg_line[:a]}"
puts "b = #{reg_line[:b]}"
puts "c = #{reg_line[:c]}"
puts "d = #{reg_line[:d]}"
puts "e = #{reg_line[:e]}"
{% endhighlight %}

* [Gist - Ruby script to calculate a simple regression curve.(4d)](https://gist.github.com/komasaru/49d42f9cdc965653c9d16e7a826ac2b5 "Ruby script to calculate a simple regression curve.(4d)")

### 4. Ruby スクリプトの実行

``` text
$ ./regression_curve_4d.rb
説明変数 X = {83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62}
目的変数 Y = {183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175,164, 175}
---
a = -8069.31709645464
b = 454.222121309131
c = -9.336623651523444
d = 0.08475031013977985
e = -0.0002862803682765933
```

### 5. 視覚的な確認

参考までに、上記スクリプトで使用した2変量の各点と作成された単回帰曲線を gnuplot で描画してみた。

![REGRESSION_CURVE_4D]({{site.baseurl}}/images/2019/07/17/REGRESSION_CURVE_4D.png "REGRESSION_CURVE_4D")

### 6. その他

前回は3次回帰モデル、今回は4次回帰モデルについて行なったが、5次以降も同様に行える。（当ブログでは、5次以降については記事にしない）

---

以上。

