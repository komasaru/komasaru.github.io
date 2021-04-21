---
layout   : single
title    : "Ruby - Array クラスを拡張して重回帰分析（説明変数3個）！"
published: true
date     : 2020-02-23 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

以前、 Ruby で、説明（独立）変数2個、目的（従属）変数1個の「重回帰式」を計算する方法を紹介しました。

* [Ruby - Array クラス拡張で重回帰式計算！]({{site.baseurl}}/2014/11/23/ruby-multiple-regression-function "Ruby - Array クラス拡張で重回帰式計算！")
* [Ruby - Array クラスを拡張して重回帰分析（2次多項式モデル）！]({{site.baseurl}}/2019/09/14/ruby-multiple-regression-function-2d "Ruby - Array クラスを拡張して重回帰分析（2次多項式モデル）！")

今回は、説明（独立）変数3個の場合の重回帰式を計算してみました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 buster (64bit) での作業を想定。
* Ruby 2.7.0 での作業を想定。

### 1. アルゴリズム

求める重回帰式を $$y=b_0+b_1x_1+b_2x_2+b_3x_3$$ とすると、残差の二乗和 $$S$$ は

$$
\begin{eqnarray*}
S = \sum_{i=1}^{N}(y_i - b_0 - b_1x_{1i} - b_2x_{2i} - b_3x_{3i})^2
\end{eqnarray*}
$$

となる。 $$b_0,\ b_1,\ b_2,\ b_3$$ それぞれで偏微分したものを $$0$$ とする。

$$
\begin{eqnarray*}
\frac{\partial S}{\partial b_0} &=& 2\sum_{i=1}^{N}(b_0 + b_1x_{1i} + b_2x_{2i} + b_3x_{3i} - y_i) = 0 \\
\frac{\partial S}{\partial b_1} &=& 2\sum_{i=1}^{N}(b_0x_{1i} + b_1x_{1i}x_{1i} + b_2x_{1i}x_{2i} + b_3x_{1i}x_{3i} - x_{1i}y_i) = 0 \\
\frac{\partial S}{\partial b_2} &=& 2\sum_{i=1}^{N}(b_0x_{2i} + b_1x_{2i}x_{1i} + b_2x_{2i}x_{2i} + b_3x_{2i}x_{3i} - x_{2i}y_i) = 0 \\
\frac{\partial S}{\partial b_3} &=& 2\sum_{i=1}^{N}(b_0x_{3i} + b_1x_{3i}x_{1i} + b_2x_{3i}x_{2i} + b_3x_{3i}x_{3i} - x_{3i}y_i) = 0
\end{eqnarray*}
$$

これらを変形すると、

$$
\begin{eqnarray*}
b_0N + b_1\sum_{i=1}^{N}x_{1i} + b_2\sum_{i=1}^{N}x_{2i} + b_3\sum_{i=1}^{N}x_{3i} &=& \sum_{i=1}^{N}y_i \\
b_0\sum_{i=1}^{N}x_{1i} + b_1\sum_{i=1}^{N}x_{1i}x_{1i} + b_2\sum_{i=1}^{N}x_{1i}x_{2i} + b_3\sum_{i=1}^{N}x_{1i}x_{3i} &=& \sum_{i=1}^{N}x_{1i}y_i \\
b_0\sum_{i=1}^{N}x_{2i} + b_1\sum_{i=1}^{N}x_{2i}x_{1i} + b_2\sum_{i=1}^{N}x_{2i}x_{2i} + b_3\sum_{i=1}^{N}x_{2i}x_{3i} &=& \sum_{i=1}^{N}x_{2i}y_i \\
b_0\sum_{i=1}^{N}x_{3i} + b_1\sum_{i=1}^{N}x_{3i}x_{1i} + b_2\sum_{i=1}^{N}x_{3i}x_{2i} + b_3\sum_{i=1}^{N}x_{3i}x_{3i} &=& \sum_{i=1}^{N}x_{3i}y_i
\end{eqnarray*}
$$

となる。これらの連立1次方程式を解けばよい。

### 2. ガウスの消去法による連立方程式の解法について

当ブログ過去記事を参照。

* [Ruby - 連立方程式解法（ガウスの消去法）！ ]({{site.baseurl}}/2013/09/25/ruby-simultaneous-equation-by-gauss-elimination "Ruby - 連立方程式解法（ガウスの消去法）！ ")

### 3. ソースコードの作成

File: `regression_multi_3e.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************
# Ruby script to calculate a multiple regression function.
# （説明変数3個のケース）
#*********************************************
#
class Array
  def reg_multi_3e(y)
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
    x1, x2, x3 = self
    sum_x1   = x1.sum
    sum_x2   = x2.sum
    sum_x3   = x3.sum
    sum_y    = y.sum
    sum_x1x1 = x1.map { |a| a * a }.sum
    sum_x1x2 = x1.zip(x2).map { |a, b| a * b }.sum
    sum_x1x3 = x1.zip(x3).map { |a, b| a * b }.sum
    sum_x1y  = x1.zip(y).map { |a, b| a * b }.sum
    sum_x2x1 = sum_x1x2
    sum_x2x2 = x2.map { |a| a * a }.sum
    sum_x2x3 = x2.zip(x3).map { |a, b| a * b }.sum
    sum_x2y  = x2.zip(y).map { |a, b| a * b }.sum
    sum_x3x1 = sum_x1x3
    sum_x3x2 = sum_x2x3
    sum_x3x3 = x3.map { |a| a * a }.sum
    sum_x3y  = x3.zip(y).map { |a, b| a * b }.sum
    mtx = [
      [s_size, sum_x1  , sum_x2  , sum_x3  , sum_y  ],
      [sum_x1, sum_x1x1, sum_x1x2, sum_x1x3, sum_x1y],
      [sum_x2, sum_x2x1, sum_x2x2, sum_x2x3, sum_x2y],
      [sum_x3, sum_x3x1, sum_x3x2, sum_x3x3, sum_x3y]
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

# 説明(独立)変数と目的(従属)変数
ary_x = [
  [17.5, 17.0, 18.5, 16.0, 19.0, 19.5, 16.0, 18.0, 19.0, 19.5],
  [30.0, 25.0, 20.0, 30.0, 45.0, 35.0, 25.0, 35.0, 35.0, 40.0],
  [18.5, 19.0, 21.5, 20.0, 24.0, 25.5, 23.0, 26.0, 28.0, 29.5]
]
ary_y = [45, 38, 41, 34, 59, 47, 35, 43, 54, 52]
# 重回帰式算出(b0, b1, b2, ...)
reg_multi = ary_x.reg_multi_3e(ary_y)
# 結果出力
ary_x.each_with_index do |x, i|
  puts "説明変数 X#{i + 1} = {#{ary_x[i].join(', ')}}"
end
puts "目的変数 Y  = {#{ary_y.join(', ')}}"
puts "---"
p reg_multi
{% endhighlight %}

* [Gist - Ruby script to compute multiple regression equations.(3 explanatory variables)](https://gist.github.com/komasaru/40335ba450e8bd53f4a1a95931c42f8a "Gist - Ruby script to compute multiple regression equations.(3 explanatory variables)")

### 4. 動作確認

``` text
$ ./regression_multi_3e.rb
説明変数 X1 = {17.5, 17.0, 18.5, 16.0, 19.0, 19.5, 16.0, 18.0, 19.0, 19.5}
説明変数 X2 = {30.0, 25.0, 20.0, 30.0, 45.0, 35.0, 25.0, 35.0, 35.0, 40.0}
説明変数 X3 = {18.5, 19.0, 21.5, 20.0, 24.0, 25.5, 23.0, 26.0, 28.0, 29.5}
目的変数 Y  = {45, 38, 41, 34, 59, 47, 35, 43, 54, 52}
---
[-37.046366113015196, 3.9414008260831355, 0.5888215133139995, -0.3379207311714562]
```

* 4次元であるため、グラフを描画して視覚的に確認することはできない。

---

以上。

