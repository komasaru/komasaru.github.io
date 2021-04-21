---
layout   : single
title    : "Ruby - 単回帰分析（線形回帰）の決定係数計算！"
published: true
date     : 2019-06-23 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で2つの単回帰分析（線形回帰; 単回帰直線）の決定係数を計算してみました。

単回帰直線や相関係数の計算は Array クラスを拡張して行なっています。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.3 での作業を想定。

### 1. 決定係数について

回帰分析において、目的変数の標本値（実測値）に対する目的変数の推測値（予測値）の説明力を表す指標（言い換えれば、説明変数（独立変数）が目的変数（従属変数）をどれくらい説明できているかを表す統計量）が

$$
\begin{eqnarray*}
決定係数 R^2
\end{eqnarray*}
$$

である。（「$$R$$の$$2$$乗」で表現するが、必ずしも何かの値の $$2$$ 乗になるという意味ではない）

決定係数 $$R^2$$ は次のように定義する。（定義の仕方は複数あるが、次の定義が最も一般的）

$$
\begin{eqnarray*}
決定係数 R^2 = \frac{推定値の変動}{標本値の変動} = \frac{S_R}{S_{y^2}}
\end{eqnarray*}
$$

但し、

$$
\begin{eqnarray*}
標本値の変動 &=& \sum_{i=1}^{N}(y_i - \bar{y})^2 = S_{y^2} \\
推定値の変動 &=& \sum_{i=1}^{N}(Y_i - \bar{y})^2 = S_R \\
残差の変動 &=& \sum_{i=1}^{N}(y_i - Y_i)^2 = S_E 
\end{eqnarray*}
$$

これら3つの変動の間には次のような関係が成り立つ。

$$
\begin{eqnarray*}
標本値の変動 = 推定値の変動 + 残差の変動
\end{eqnarray*}
$$

これから、

$$
\begin{eqnarray*}
1 &=& \frac{推定値の変動}{標本値の変動} + \frac{残差の変動}{標本値の変動} \\
\therefore \ \ 1 &=& 決定係数 R^2 + \frac{残差の変動}{標本値の変動} \\
\end{eqnarray*}
$$

よって、

$$
\begin{eqnarray*}
決定係数 R^2 &=& 1 - \frac{残差の変動}{標本値の変動}
\end{eqnarray*}
$$

となる。これは、「残差の変動が $$0$$ に近ければ、決定係数が $$1$$ が近くなる」ということで、「決定係数 $$R^2$$ が $$1$$ に近いほど、当てはまりが良い（説明変数が目的変数をより説明できている）」と表現できることになる。

ちなみに、単回帰分析（線形回帰）の場合、

$$
\begin{eqnarray*}
(xとyの相関係数)^2 = 決定係数
\end{eqnarray*}
$$

となる。また、

$$
\begin{eqnarray*}
S_{y^2} &=& \sum_{i=1}^{N}y_i^2 - \frac{\left( \displaystyle{\sum_{i=1}^{N}y_i} \right)^2}{N} \\
S_{xy} &=& \sum_{i=1}^{N}x_{i}y_{i} - \frac{\displaystyle{\sum_{i=1}^{N}x_i} \sum_{i=1}^{N}y_i}{N} \\
S_R &=& b \cdot S_{xy} \\
\end{eqnarray*}
$$

でるあること（導出方法は略）を利用して、
$$
\begin{eqnarray*}
決定係数 R^2 &=& \frac{S_R}{S_{y^2}}
\end{eqnarray*}
$$

を求めることもできる。

### 2. Ruby スクリプトの作成

* 以下のスクリプトでは4種の方法で決定係数を計算している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `coefficient_of_determination_line.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************************
# Ruby script to calculate a coefficient of determination.
#*********************************************************
#
class CoefficientOfDetermination
  # 説明変数と目的変数
  X = [107, 336, 233,  82,  61,  378, 129, 313, 142,  428]
  Y = [286, 851, 589, 389, 158, 1037, 463, 563, 372, 1020]

  # Execution
  def exec
    puts "説明変数 X = {#{X.join(', ')}}"
    puts "目的変数 Y = {#{Y.join(', ')}}"
    puts "---"
    # 単回帰直線算出（切片と傾き）
    reg_line = X.reg_line(Y)
    puts "    切片  a = %20.16f" % reg_line[:intercept]
    puts "    傾き  b = %20.16f" % reg_line[:slope]
    # 相関係数
    r = X.r(Y)
    puts "相関係数  r = %20.16f" % r
    # 推定値
    y_e = calc_estimations(X, Y, reg_line[:intercept], reg_line[:slope])
    # 標本値 Y （目的変数）の平均
    y_b = Y.inject(0) { |s, a| s += a } / Y.size.to_f
    puts "決定係数"
    # 解法-1. 決定係数 (= 推定値の変動 / 標本値の変動)
    r_2 = calc_s_r(y_b, y_e) / calc_s_y2(y_b, Y)
    puts "     R2 (1) = %20.16f" % r_2
    # 解法-2. 決定係数 (= 1 - 残差の変動 / 標本値の変動)
    r_2 = 1.0 - calc_s_e(Y, y_e) / calc_s_y2(y_b, Y)
    puts "     R2 (2) = %20.16f" % r_2
    # 解法-3. 決定係数 (公式使用(解法-1,2の変形))
    r_2 = calc_r_2(X, Y, reg_line[:slope])
    puts "     R2 (3) = %20.16f" % r_2
    # 解法-4. 決定係数 (= 相関係数の2乗)
    r_2 = r * r
    puts "     R2 (4) = %20.16f" % r_2
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
    exit 1
  end

  private

  # 推定値
  #
  # @param   xs: 説明変数配列
  # @param    y: 目的変数配列
  # @param    a: 回帰直線の切片
  # @param    b: 回帰直線の傾き
  # @return y_e: 推定値配列
  def calc_estimations(xs, y, a, b)
    y_e = Array.new

    begin
      xs.each { |x| y_e << a + b * x }
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

  # 決定係数 (公式使用)
  #
  # @param    x: 説明変数配列
  # @param    y: 目的変数配列
  # @param    b: 回帰直線の傾き
  # @return r_2: 残差の変動
  def calc_r_2(x, y, b)
    n = x.size
    sum_x  = x.inject(0.0) { |s, a| s += a }
    sum_y  = y.inject(0.0) { |s, a| s += a }
    sum_y2 = y.inject(0.0) { |s, a| s += a * a }
    sum_xy = x.zip(y).inject(0.0) { |s, a| s += a[0] * a[1] }
    s_y2 = sum_y2 - sum_y * sum_y / n.to_f
    s_xy = sum_xy - sum_x * sum_y / n.to_f
    s_r  = b * s_xy
    return s_r / s_y2
  rescue => e
    raise
  end
end

class Array
  # 単回帰直線
  def reg_line(y)
    # 以下の場合は例外スロー
    # - 引数の配列が Array クラスでない
    # - 自身配列が空
    # - 配列サイズが異なれば例外
    raise "Argument is not a Array class!"  unless y.class == Array
    raise "Self array is nil!"              if self.size == 0
    raise "Argument array size is invalid!" unless self.size == y.size

    # x の総和
    sum_x = self.inject(0) { |s, a| s += a }
    # y の総和
    sum_y = y.inject(0) { |s, a| s += a }
    # x^2 の総和
    sum_xx = self.inject(0) { |s, a| s += a * a }
    # x * y の総和
    sum_xy = self.zip(y).inject(0) { |s, a| s += a[0] * a[1] }
    # 切片 a
    a  = sum_xx * sum_y - sum_xy * sum_x
    a /= (self.size * sum_xx - sum_x * sum_x).to_f
    # 傾き b
    b  = self.size * sum_xy - sum_x * sum_y
    b /= (self.size * sum_xx - sum_x * sum_x).to_f
    {intercept: a, slope: b}
  end

  # 相関係数
  def r(y)
    # 以下の場合は例外スロー
    # - 引数の配列が Array クラスでない
    # - 自身配列が空
    # - 配列サイズが異なれば例外
    raise "Argument is not a Array class!"  unless y.class == Array
    raise "Self array is nil!"              if self.size == 0
    raise "Argument array size is invalid!" unless self.size == y.size

    # x の相加平均, y の相加平均 (arithmetic mean)
    mean_x = self.inject(0) { |s, a| s += a } / self.size.to_f
    mean_y = y.inject(0) { |s, a| s += a } / y.size.to_f
    # x と y の共分散の分子 (covariance)
    cov = self.zip(y).inject(0) { |s, a| s += (a[0] - mean_x) * (a[1] - mean_y) }
    # x の分散の分子, y の分散の分子 (variance)
    var_x = self.inject(0) { |s, a| s += (a - mean_x) ** 2 }
    var_y = y.inject(0) { |s, a| s += (a - mean_y) ** 2 }
    # 相関係数 (correlation coefficient)
    r = cov / Math.sqrt(var_x)
    r /= Math.sqrt(var_y)
  end
end

CoefficientOfDetermination.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate a coefficent of determination for simple linear regression.](https://gist.github.com/komasaru/a71bb6a9adbcc7fab8a3e21b16e6ba4f "Ruby script to calculate a coefficent of determination for simple linear regression.")

### 4. Ruby スクリプトの実行

``` text
$ ./coefficient_of_determination_line.rb
説明変数 X = {107, 336, 233, 82, 61, 378, 129, 313, 142, 428}
目的変数 Y = {286, 851, 589, 389, 158, 1037, 463, 563, 372, 1020}
---
    切片  a =  99.0747587724579120
    傾き  b =   2.1445235003510281
相関係数  r =   0.9451950086576620
決定係数
     R2 (1) =   0.8933936043913584
     R2 (2) =   0.8933936043913584
     R2 (3) =   0.8933936043913585
     R2 (4) =   0.8933936043913578
```

決定係数が 約0.9 となっているので、単回帰直線の当てはまりは良いと言える。

### 5. 視覚的な確認

参考までに、上記スクリプトで使用した2変量の各点と作成された単回帰直線を gnuplot で描画してみた。

![REGRESSION_LINE]({{site.baseurl}}/images/2019/06/23/REGRESSION_LINE.png "REGRESSION_LINE")

---

以上。

