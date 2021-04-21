---
layout   : single
title    : "Ruby - ケンドール順位相関係数の計算！"
published: true
date     : 2020-02-14 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby でケンドールの順位相関係数(Kendall's Rank Correlation Coefficient)の計算をしてみました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.2 buster (64bit) での作業を想定。
* Ruby 2.7.0 での作業を想定。

### 1. ケンドールの順位相関係数について

$$n$$ 対の順位データ $$(x_i, y_i) (i=1,2,\cdots,n)$$ があるとき、それの中から取り出した $$(x_s, y_s),\ (x_t, y_t)\ (1 \leq s \lt t \leq n)$$ において、

$$
\begin{eqnarray*}
P&:& x_s と x_t,\ y_s と y_t の大小関係が一致する組の数 \\
Q&:& x_s と x_t,\ y_s と y_t の大小関係が不一致の組の数 \\
N&:& 組の総数=\binom{n}{2}=\displaystyle _nC_2=\frac{n(n-1)}{2}
\end{eqnarray*}
$$

とおくと、 **ケンドールの順位相関係数(Kendall's Rank Correlation Coefficient)** $$\tau_a, \tau_b$$ は次式で表される。（ケンドールの $$\tau_a$$ (Kendall's tau a), ケンドールの $$\tau_b$$ (Kendall's tau b)とも呼ばれる）

(1)同順位（タイ）が存在しない場合、
$$
\begin{eqnarray*}
\tau_a = \frac{P - Q}{N}
\end{eqnarray*}
$$

(2)同順位（タイ）が存在する場合、
$$
\begin{eqnarray*}
\tau_b &=& \frac{P - Q}{\sqrt{N - T_x}\sqrt{N - T_y}} \\
但し、\ \ T_x &=& \displaystyle \sum_{i=1}^{n_x}\frac{t_i({t_i}^2 - 1)}{2} \\
T_y &=& \displaystyle \sum_{j=1}^{n_y}\frac{t_j({t_j}^2 - 1)}{2} \\
&&（n_x,\ n_y\ は同順位の数、\ t_i,\ t_j\ は同順位となる順位の個数）
\end{eqnarray*}
$$

また、次式で表されるものを **グッドマン＝クラスカルの $$\gamma$$ (Goodman and Kruskal's gamma)** と呼ぶ。

$$
\begin{eqnarray*}
\gamma = \frac{P - Q}{P + Q}
\end{eqnarray*}
$$

（注1）同順位（タイ）がない場合、 $$T_x = T_y = 0,\ P + Q = N$$ となり、結果として、 $$\tau_a = \tau_b = \gamma$$ となる。  
（注2）$$\tau_c$$ なる式もあるが、 $$\tau_a,\ \tau_b,\ \gamma$$ とやや性質が異なるので今回は割愛。

### 2. Ruby スクリプトの作成

* Array クラスを拡張する形式にしている。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `calc_rcc_kendall.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby

class Array
  def rcc_kendall(y)
    # 以下の場合は例外スロー
    # - 引数の配列が Array クラスでない
    # - 自身配列が空
    # - 配列サイズが異なる
    # - 数値以外のデータが存在する
    raise "Argument is not a Array class!"  unless y.class == Array
    raise "Self array is nil!"              if self.size == 0
    raise "Argument array size is invalid!" unless self.size == y.size
    (self + y).each do |v|
      raise "Items except numerical values exist!" unless v.to_s =~ /[\d\.]+/
    end

    # ランク付け
    # （同順位を中央（平均）順位(mid-rank)にする必要はない）
    rank_x = self.map { |v| self.count { |a| a > v } + 1 }
    rank_y = y.map { |v| y.count { |a| a > v } + 1 }
    # P（x_s と x_t, y_s と y_t の大小関係が一致する組の数）
    # Q（x_s と x_t, y_s と y_t の大小関係が不一致の組の数）
    # （x_s = x_t or y_s = y_t は除く）
    n, p, q = self.size, 0, 0
    0.upto(n - 2).each do |i|
      (i + 1).upto(n - 1).each do |j|
        w = (rank_x[i] - rank_x[j]) * (rank_y[i] - rank_y[j])
        case
        when w > 0; p += 1
        when w < 0; q += 1
        end
      end
    end
    # 同順位
    tai_x = rank_x.group_by { |a| a }.map do |k, v|
      [k, v.size]
    end.to_h.select { |k, v| v > 1 }
    tai_y = rank_y.group_by { |a| a }.map do |k, v|
      [k, v.size]
    end.to_h.select { |k, v| v > 1 }
    # Tx, Ty の sum 部分
    t_x = tai_x.map { |a| (a[1] * a[1] * a[1] - a[1]) / 2.0 }.sum
    t_y = tai_y.map { |a| (a[1] * a[1] * a[1] - a[1]) / 2.0 }.sum
    # 相関係数
    nn = (n * n - n) / 2.0
    return (p - q) / (Math.sqrt(nn - t_x) * Math.sqrt(nn - t_y))
  end
end

# タイ（同順位）が存在しない例
#X = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
#Y = [1, 3, 5, 7, 9, 2, 4, 6, 8, 10]
# タイ（同順位）が存在する例
X = [1, 2, 3, 4, 5, 5, 7, 8, 9, 10]
Y = [1, 3, 5, 6, 9, 2, 4, 6, 8, 10]
# サイズが異なる例
#X = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
#Y = [1, 3, 5, 7, 9, 2, 4, 6, 8]
# X のサイズがゼロの例
#X = []
#Y = [1, 3, 5, 7, 9, 2, 4, 6, 8, 10]
# 数値以外のものが存在する例
#X = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
#Y = [1, 3, 5, 7, 9, "ABC", 4, 6, 8, 10]

puts "  X = #{X}"
puts "  Y = #{Y}"
puts "  Kendall's RCC = #{X.rcc_kendall(Y)}"
{% endhighlight %}

* [Gist - Ruby script to calculate a Kendall's Rank Correlation Coefficient.](https://gist.github.com/komasaru/9d58ff0d987ee8751d9a4fc5efeb3bde "Gist - Ruby script to calculate a Kendall's Rank Correlation Coefficient.")

### 3. Ruby スクリプトの実行

``` text
$ ./calc_rcc_spearman.rb
  X = [1, 2, 3, 4, 5, 5, 7, 8, 9, 10]
  Y = [1, 3, 5, 6, 9, 2, 4, 6, 8, 10]
  Spearman's RCC = 0.7073170731707317
```

---

以上。

