---
layout   : single
title    : "Ruby - Array クラス拡張で単回帰曲線計算(Ver.2)！"
published: true
date     : 2019-06-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で Array クラスを拡張して回帰式が2次の単回帰曲線を計算してみました。  
※今回は連立1次方程式を解くのに「ガウスの消去法」を使用。

過去にも行いましたが、その際は連立1次方程式を解くのに分散／共分散を使用する方法（実際にはその変形版）を使用しました。

* [Ruby - Array クラス拡張で単回帰曲線計算！]({{site.baseurl}}/2018/05/16/ruby-simple-linear-regression-curve "Ruby - Array クラス拡張で単回帰曲線計算！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.3 での作業を想定。

### 1. 単回帰曲線（2次回帰）について

求める曲線を $$y=a+bx+cx^2$$ とすると、残差の二乗和 $$S$$ は

$$
\begin{eqnarray*}
S = \sum_{i=1}^{N}(y_i - a - bx_i - cx_i^2)^2
\end{eqnarray*}
$$

となる。 $$a,b,c$$ それぞれで偏微分すると、

$$
\begin{eqnarray*}
\frac{\partial S}{\partial a} =& 2\sum_{i=1}^{N}(a+bx_i+cx_i^2 - y_i) &= 0 \\
\frac{\partial S}{\partial b} =& 2\sum_{i=1}^{N}(ax_i+bx_i^2+cx_i^3 - x_{i}y_i) &= 0 \\
\frac{\partial S}{\partial c} =& 2\sum_{i=1}^{N}(ax_i^2+bx_i^3+cx_i^4 - x_{i}^{2}y_i) &= 0
\end{eqnarray*}
$$

となる。これらを変形すると、

$$
\begin{eqnarray*}
aN + b\sum_{i=1}^{N}x_i + c\sum_{i=1}^{N}x_i^2 &=& \sum_{i=1}^{N}y_i \\
a\sum_{i=1}^{N}x_i + b\sum_{i=1}^{N}x_i^2 + c\sum_{i=1}^{N}x_i^3 &=& \sum_{i=1}^{N}x_{i}y_i \\
a\sum_{i=1}^{N}x_i^2 + b\sum_{i=1}^{N}x_i^3 + c\sum_{i=1}^{N}x_i^4 &=& \sum_{i=1}^{N}x_{i}^{2}y_i
\end{eqnarray*}
$$

となる。これらの連立1次方程式を解けばよい。

### 2. ガウスの消去法による連立1次方程式の解法について

当ブログ過去記事を参照。

[Ruby - 連立方程式解法（ガウスの消去法）！ ]({{site.baseurl}}/2013/09/25/ruby-simultaneous-equation-by-gauss-elimination "Ruby - 連立方程式解法（ガウスの消去法）！ ")

### 3. Ruby スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `regression_curve_2.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************
# Ruby script to calculate a simple linear regression curve.
# : y = a + b * x + c * x^2
# : 連立方程式を ガウスの消去法で解く方法
#*********************************************
#
class Array
  def reg_curve(y)
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
    sum_y   = y.inject(0) { |s, a| s += a }
    sum_xy  = self.zip(y).inject(0) { |s, a| s += a[0] * a[1] }
    sum_x2y = self.zip(y).inject(0) { |s, a| s += a[0] * a[0] * a[1] }
    mtx = [
      [self.size,  sum_x, sum_x2,   sum_y],
      [    sum_x, sum_x2, sum_x3,  sum_xy],
      [   sum_x2, sum_x3, sum_x4, sum_x2y]
    ]
    ans = solve_ge(mtx)
    {a: ans[0][-1], b: ans[1][-1], c: ans[2][-1]}
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
reg_line = ary_x.reg_curve(ary_y)
puts "a = #{reg_line[:a]}"
puts "b = #{reg_line[:b]}"
puts "c = #{reg_line[:c]}"
{% endhighlight %}

* [Gist - Ruby script to calculate a simple linear regression curve.(Ver.2)](https://gist.github.com/komasaru/54bcd3a9e1ed07efd647301f2459b82d "Ruby script to calculate a simple linear regression curve.(Ver.2)")

### 4. Ruby スクリプトの実行

``` text
$ ./regression_curve_2.rb
説明変数 X = {83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62}
目的変数 Y = {183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175,164, 175}
---
a = 41.37453964054464
b = 3.0867232029931357
c = -0.01683564807640552
```

### 5. 視覚的な確認

参考までに、上記スクリプトで使用した2変量の各点と作成された単回帰曲線を gnuplot で描画してみた。

![REGRESSION_CURVE_2]({{site.baseurl}}/images/2019/06/11/REGRESSION_CURVE_2.png "REGRESSION_CURVE_2")

---

以上。

