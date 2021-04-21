---
layout   : single
title    : "Ruby - スピアマン順位相関係数の計算！"
published: true
date     : 2020-02-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby でスピアマンの順位相関係数(Spearman's Rank Correlation Coefficient)の計算をしてみました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.2 (64bit) での作業を想定。
* Ruby 2.7.0 での作業を想定。

### 1. スピアマンの順位相関係数について

各変量を順位に変換してピアソンの積率相関係数（いわゆる相関係数）を求めたものを **スピアマンの順位相関係数(Spearman's Rank Correlation Coefficient)** と呼ぶ。

実際にはまず、 $$n$$ 対の変数 $$X, Y$$ のそれぞれに順位をつける。但し、同順位（タイ）がある場合は**中央（平均）順位(mid-rank)** で順位をつける。  
（e.g. 2位が3個ある場合、 $$(2+3+4)/3=3$$。3位が2個ある場合、 $$(3+4)/2=3.5$$）

そして、次の式によりスピアマンの順位相関係数 $$r_s$$（または $$\rho$$）を求める。

(1) 同順位（タイ）が存在しない場合、
$$
\begin{eqnarray*}
r_s = 1 - \frac{6}{n(n^{2} - 1)} \displaystyle \sum^{n}_{i=1}(X_i - Y_i)^2
\end{eqnarray*}
$$

(2) 同順位（タイ）が存在する場合、
$$
\begin{eqnarray*}
r_s &=& \frac{T_x + T_y - \displaystyle \sum_{i=1}^{n}(X_i - Y_i)^2}{2\sqrt{T_xT_y}} \\
但し、\ \ T_x &=& \left\{n(n^2 - 1) - \displaystyle \sum_{i=1}^{n_x}t_i({t_i}^2 - 1)\right\} /\ 12 \\
T_y &=& \left\{n(n^2 - 1) - \displaystyle \sum_{j=1}^{n_y}t_j({t_j}^2 - 1)\right\} /\ 12 \\
&&（n_x,\ n_y\ は同順位の数、\ t_i,\ t_j\ は同順位となる順位の個数）
\end{eqnarray*}
$$

（注） 同順位が存在しない場合は (2) の $$\sum t_i({t_i}^2 - 1),\ \sum t_j({t_j}^2 - 1)$$ が $$0$$ となり、結局 (1) になる。よって、同順位（タイ）が存在しない場合と存在する場合で場合分けをせず、全て (2) で計算しても、結果は同じになる。

また、スピアマンの順位相関係数は、値を順位に置き換えたもの（同順位（タイ）は中央順位法）の相関係数（ピアソンの積率相関係数）であるので、当然、以下の計算式でも計算できる。

$$
\begin{eqnarray*}
r_s = \frac{\displaystyle \sum_{i=1}^{n}(X_i - \overline{X})(Y_i - \overline{Y})}{\sqrt{\displaystyle \sum_{i=1}^{n}(X_i - \overline{X})^2 \displaystyle \sum_{i=1}^{n}(Y_i - \overline{Y})^2}}
\end{eqnarray*}
$$

さらに、同順位（タイ）が存在する場合の計算式を以下のように説明している文献（特に海外の文献）も多い。（但し、前述の計算式で計算した結果と若干の差異がある）

$$
\begin{eqnarray*}
r_s &=& 1 - \frac{6}{n(n^2 - 1)}\left\{ \displaystyle\sum_{i=1}^{n}(X_i - Y_i)^2 + T_x + T_y \right\} \\
但し、\ \ T_x &=& \displaystyle \sum_{i=1}^{n_x}\frac{t_i({t_i}^2-1)}{12} \\
T_y &=& \displaystyle \sum_{j=1}^{n_y}\frac{t_j({t_j}^2-1)}{12} \\
&&（n_x,\ n_y\ は同順位の数、\ t_i,\ t_j\ は同順位となる順位の個数）
\end{eqnarray*}
$$

### 2. Ruby スクリプトの作成

* Array クラスを拡張する形式にしている。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `calc_rcc_spearman.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby

class Array
  def rcc_spearman(y)
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
    rank_x = self.map { |v| self.count { |a| a > v } + 1 }
    rank_y = y.map { |v| y.count { |a| a > v } + 1 }
    # 同順位を中央（平均）順位(mid-rank)に
    rank_x = rank_x.map do |v|
      c = rank_x.count(v)
      (v...(v + c)).sum / c.to_f
    end
    rank_y = rank_y.map do |v|
      c = rank_y.count(v)
      (v...(v + c)).sum / c.to_f
    end
    # 同順位の数
    tai_x = rank_x.group_by { |a| a }.map { |k, v| [k, v.size] }.to_h
    tai_y = rank_y.group_by { |a| a }.map { |k, v| [k, v.size] }.to_h
    # Tx, Ty の sum 部分
    s_x = tai_x.select { |k, v| v > 1 }.map do |a|
      a[1] * a[1] * a[1] - a[1]
    end.sum
    s_y = tai_y.select { |k, v| v > 1 }.map do |a|
      a[1] * a[1] * a[1] - a[1]
    end.sum
    # 相関係数
    n = self.size
    n3 = n * n * n - n
    t_x = (n3 - s_x) / 12.0
    t_y = (n3 - s_y) / 12.0
    s = rank_x.zip(rank_y).inject(0) { |s, a| s + (a[0] - a[1]) * (a[0] - a[1]) }
    return (t_x + t_y - s) / (2 * Math.sqrt(t_x * t_y))
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
puts "  Spearman's RCC = #{X.rcc_spearman(Y)}"
{% endhighlight %}

* [Gist - Ruby script to calculate a Spearman's Rank Correlation Coefficient.](https://gist.github.com/komasaru/51a8341e56a5c9453ce60812a7d089f0 "Gist - Ruby script to calculate a Spearman's Rank Correlation Coefficient.")

### 3. Ruby スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x calc_rcc_spearman.rb
```

そして、実行。

``` text
$ ./calc_rcc_spearman.rb
  X = [1, 2, 3, 4, 5, 5, 7, 8, 9, 10]
  Y = [1, 3, 5, 6, 9, 2, 4, 6, 8, 10]
  Spearman's RCC = 0.7073170731707317
```

---

以上。

