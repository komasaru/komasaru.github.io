---
layout   : single
title    : "Ruby - Array クラス拡張で重回帰式計算！"
published: true
date     : 2014-11-23 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

以前、２変量（説明（独立）変数１個、目的（従属）変数１個）の「単回帰直線」の計算を Ruby の Array クラスを拡張する方法で実装しました。

* [Ruby - Array クラス拡張で単回帰直線計算！]({{site.baseurl}}/2014/11/05/ruby-simple-linear-regression-line "Ruby - Array クラス拡張で単回帰直線計算！")

今回は、説明（独立）変数２個以上、目的（従属）変数１個の「重回帰式」の計算を Ruby の Array クラスを拡張する方法で実装してみました。

<!--more-->

### 0. 前提条件

* Ruby 2.1.4-p265 での作業を想定。

### 1. 重回帰式について

まず、簡単に重回帰式について。  
ここでは詳細に説明しない。過去の当ブログ記事等を参照のこと。  
（偏微分して得られた連立方程式を解く（平方和・積和を行列に見立てて計算する）方法。分散・共分散を行列に見立てて計算する方法等もある）

* [Excel製の数学文書をLATEXで整形！]({{site.baseurl}}/2011/08/21/21002012/ "Excel製の数学文書をLATEXで整形！")

連立方程式の解法には「ガウスの消去法」を使用した。

* [Ruby - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2013/09/25/ruby-simultaneous-equation-by-gauss-elimination/ "Ruby - 連立方程式解法（ガウスの消去法）！")

### 2. Ruby スクリプト作成

以下のように Array クラスを拡張してメソッドを定義してみた。  
（ちなみに、x1, x2, ... を左辺、y を右辺として連立方程式を解いている）

> 【2019-06-24】  
> 以下のソーススクリプトを行列をイメージしやすくなるよう変更した。

File: `regression_multi.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************
# Ruby script to calculate a multiple regression function.
#*********************************************
#
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

# 説明(独立)変数と目的(従属)変数
ary_x = [
  [17.5, 17.0, 18.5, 16.0, 19.0, 19.5, 16.0, 18.0, 19.0, 19.5],
  [30, 25, 20, 30, 45, 35, 25, 35, 35, 40]
]
ary_y = [45, 38, 41, 34, 59, 47, 35, 43, 54, 52]
# 重回帰式算出(b0, b1, b2, ...)
reg_multi = ary_x.reg_multi(ary_y)
# 結果出力
ary_x.each_with_index do |x, i|
  puts "説明変数 X#{i + 1} = {#{ary_x[i].join(', ')}}"
end
puts "目的変数 Y  = {#{ary_y.join(', ')}}"
puts "---"
p reg_multi
{% endhighlight %}

- [Gist - Ruby script to calculate a multiple regression function.](https://gist.github.com/komasaru/9ca1b80c699105a7d5f3 "Gist - Ruby script to calculate a multiple regression function.")

### 3. Ruby スクリプト実行

実行してみる。

``` text
$ ruby regression_multi.rb
説明変数 X1 = {17.5, 17.0, 18.5, 16.0, 19.0, 19.5, 16.0, 18.0, 19.0, 19.5}
説明変数 X2 = {30, 25, 20, 30, 45, 35, 25, 35, 35, 40}
目的変数 Y  = {45, 38, 41, 34, 59, 47, 35, 43, 54, 52}
---
[-34.71293083506825, 3.469812630117974, 0.5330094841545223]
```

表計算ソフト等で計算した結果と同じになっていることを確認する。

---

重回分析を手軽に行いたい案件があったため、今回 Array クラスを拡張してみた次第です。

以上。

