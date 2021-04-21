---
layout   : single
title    : "Ruby - 単回帰分析（2次曲線回帰）の決定係数計算！"
published: true
date     : 2019-06-26 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で2つの単回帰分析（2次曲線回帰）の決定係数を計算してみました。

単回帰曲線（2次）の計算は Array クラスを拡張して行なっています。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.3 での作業を想定。

### 1. 決定係数について

前回記事を参照。

* [Ruby - 単回帰分析（線形回帰）の決定係数計算！]({{site.baseurl}}/2019/06/23/ruby-regression-coefficient-of-determination "Ruby - 単回帰分析（線形回帰）の決定係数計算！")

### 2. Ruby スクリプトの作成

* 以下のスクリプトでは2種の方法で決定係数を計算している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `coefficient_of_determination_2d.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************************
# Ruby script to calculate a coefficient of determination.
#*********************************************************
#
class CoefficientOfDetermination
  # 説明変数と目的変数
  X = [83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62]
  Y = [183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175, 164, 175]

  # Execution
  def exec
    puts "説明変数 X = {#{X.join(', ')}}"
    puts "目的変数 Y = {#{Y.join(', ')}}"
    puts "---"
    # 単回帰曲線算出
    reg_curve = X.reg_curve(Y)
    puts "          a = %20.16f" % reg_curve[:a]
    puts "          b = %20.16f" % reg_curve[:b]
    puts "          c = %20.16f" % reg_curve[:c]
    # 推定値
    y_e = calc_estimations(X, reg_curve[:a], reg_curve[:b], reg_curve[:c])
    # 標本値 Y （目的変数）の平均
    y_b = Y.inject(0) { |s, a| s += a } / Y.size.to_f
    puts "決定係数"
    # 解法-1. 決定係数 (= 推定値の変動 / 標本値の変動)
    r_2 = calc_s_r(y_b, y_e) / calc_s_y2(y_b, Y)
    puts "     R2 (1) = %20.16f" % r_2
    # 解法-2. 決定係数 (= 1 - 残差の変動 / 標本値の変動)
    r_2 = 1.0 - calc_s_e(Y, y_e) / calc_s_y2(y_b, Y)
    puts "     R2 (2) = %20.16f" % r_2
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
    exit 1
  end

  private

  # 推定値
  #
  # @param   xs: 説明変数配列
  # @param    a: 回帰曲線の a
  # @param    b: 回帰曲線の b
  # @param    b: 回帰曲線の c
  # @return y_e: 推定値配列
  def calc_estimations(xs, a, b, c)
    y_e = Array.new

    begin
      xs.each { |x| y_e << a + b * x + c * x * x }
      return y_e
    rescue => e
      raise
    end
  end

  # 推定値の変動
  #
  # @param  y_b: 標本値（目的変数）の平均
  # @param  y_e: 推定値配列
  # @return s_r: 推定値の変動
  def calc_s_r(y_b, y_e)
    s_r = 0.0

    begin
      y_e.each do |a|
        v = a - y_b
        s_r += v * v
      end
      return s_r
    rescue => e
      raise
    end
  end

  # 標本値の変動
  #
  # @param   y_b: 標本値（目的変数）の平均
  # @param   y_s: 標本値（目的変数）配列
  # @return s_y2: 標本値の変動
  def calc_s_y2(y_b, y_s)
    s_y2 = 0.0

    begin
      y_s.each do |a|
        v = a - y_b
        s_y2 += v * v
      end
      return s_y2
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
  # 単回帰曲線(2次)
  def reg_curve(y)
    # 以下の場合は例外スロー
    # - 引数の配列が Array クラスでない
    # - 自身配列が空
    # - 配列サイズが異なれば例外
    raise "Argument is not a Array class!"  unless y.class == Array
    raise "Self array is nil!"              if self.size == 0
    raise "Argument array size is invalid!" unless self.size == y.size

    n      = self.size                                          # number of items
    m_x    = self.sum / n.to_f                                  # avg(X)
    m_y    = y.sum / n.to_f                                     # avg(Y)
    m_x2   = self.map { |x| x ** 2 }.sum / n.to_f               # avg(X^2)
    m_x3   = self.map { |x| x ** 3 }.sum / n.to_f               # avg(X^3)
    m_x4   = self.map { |x| x ** 4 }.sum / n.to_f               # avg(X^4)
    m_xy   = self.zip(y).map { |a, b| a * b }.sum / n.to_f      # avg(X * Y)
    m_x2y  = self.zip(y).map { |a, b| a * a * b }.sum / n.to_f  # avg(X^2 * Y)
    s_xx   = m_x2 - m_x * m_x                                   # Sxx
    s_xy   = m_xy - m_x * m_y                                   # Sxy
    s_xx2  = m_x3 - m_x * m_x2                                  # Sxx2
    s_x2x2 = m_x4 - m_x2 * m_x2                                 # Sx2x2
    s_x2y  = m_x2y - m_x2 * m_y                                 # Sx2y
    b  = s_xy * s_x2x2 - s_x2y * s_xx2
    b /= s_xx * s_x2x2 - s_xx2 * s_xx2
    c  = s_x2y * s_xx - s_xy * s_xx2
    c /= s_xx * s_x2x2 - s_xx2 * s_xx2
    a = m_y - b * m_x - c * m_x2
    {a: a, b: b, c: c}
  end
end

CoefficientOfDetermination.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate a coefficent of determination for simple 2D regression.](https://gist.github.com/komasaru/5ab976d32e8324d8ca6a55958ee8b871 "Ruby script to calculate a coefficent of determination for simple 2D regression.")

### 4. Ruby スクリプトの実行

``` text
$ ./coefficient_of_determination_2d.rb
説明変数 X = {83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62}
目的変数 Y = {183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175,164, 175}
---
          a =  41.3745396407205561
          b =   3.0867232029882175
          c =  -0.0168356480763719
決定係数
     R2 (1) =   0.6664619960148396
     R2 (2) =   0.6664619960150644
```

決定係数が 約0.67 となっているので、2次回帰曲線の当てはまりはやや良いと言える。

### 5. 視覚的な確認

参考までに、上記スクリプトで使用した2変量の各点と作成された2次回帰曲線を gnuplot で描画してみた。

![REGRESSION_2D]({{site.baseurl}}/images/2019/06/26/REGRESSION_2D.png "REGRESSION_2D")

---

以上。

