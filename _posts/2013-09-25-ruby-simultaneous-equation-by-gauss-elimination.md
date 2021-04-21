---
layout   : single
title    : "Ruby - 連立方程式解法（ガウスの消去法）！"
published: true
date     : 2013-09-25 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

ここ最近、連立方程式を「ガウス・ジョルダン法」や「ガウス・ジョルダン（ピボット選択）法」で解くアルゴリズムを Ruby で実装したことを紹介しました。

* [Ruby - 連立方程式解法（ガウス・ジョルダン法）！]({{site.baseurl}}/2013/09/21/ruby-simultaneous-equation-by-gauss-jorden "Ruby - 連立方程式解法（ガウス・ジョルダン法）！")
* [Ruby - 連立方程式解法（ガウス・ジョルダン（ピボット選択）法）！]({{site.baseurl}}/2013/09/23/ruby-simultaneous-equation-by-pivot "Ruby - 連立方程式解法（ガウス・ジョルダン（ピボット選択）法）！")

また、前回は連立方程式を「ガウスの消去法」で解くアルゴリズムを C++ で実装してみました。

* [C++ - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2013/09/24/cpp-simultaneous-equation-by-gauss-elimination "C++ - 連立方程式解法（ガウスの消去法）！")

今回は、連立方程式を「ガウスの消去法」で解くアルゴリズムを Ruby で実装してみました。

<!--more-->

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* Ruby 2.0.0-p247 を使用。
* 連立方程式の解法（ガウスの消去法）についての説明は割愛。（「[C++ - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2013/09/24/cpp-simultaneous-equation-by-gauss-elimination/ "C++ - 連立方程式解法（ガウスの消去法）！")」を参照）

### 1. Ruby スクリプト作成

File: `gauss_elimination.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************
# 連立方程式の解法 ( ガウスの消去法 )
#*********************************************
#
class GaussElimination
  def initialize
    # 係数
    @a = [
      #[ 2, -3,  1,  5],
      #[ 1,  1, -1,  2],
      #[ 3,  5, -7,  0]
      [ 1, -2,  3, -4,  5],
      [-2,  5,  8, -3,  9],
      [ 5,  4,  7,  1, -1],
      [ 9,  7,  3,  5,  4]
    ]
    # 次元の数
    @n = @a.size
  end

  # 計算・結果出力
  def exec
    # 元の連立方程式をコンソール出力
    display_equations
    # 前進消去
    (@n - 1).times do |k|
      (k + 1).upto(@n - 1) do |i|
        d = @a[i][k] / @a[k][k].to_f
        (k + 1).upto(@n) do |j|
          @a[i][j] -= @a[k][j] * d
        end
      end
    end
    # 後退代入
    (@n - 1).downto(0) do |i|
      d = @a[i][@n]
      (i + 1).upto(@n - 1) do |j|
        d -= @a[i][j] * @a[j][@n]
      end
      @a[i][@n] = d / @a[i][i].to_f
    end
    # 結果出力
    display_answers
  rescue => e
    raise
  end

  private

  # 元の連立方程式をコンソール出力
  def display_equations
    @n.times do |i|
      @n.times { |j| printf("%+dx%d ", @a[i][j], j + 1) }
      puts "= %+d" % @a[i][@n]
    end
  rescue => e
    raise
  end

  # 結果出力
  def display_answers
    0.upto(@n - 1) { |k| puts "x%d = %f" % [k + 1, @a[k][@n]] }
  rescue => e
    raise
  end
end

if __FILE__ == $0
  begin
    obj = GaussElimination.new
    obj.exec
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
  end
end
{% endhighlight %}

* [Gist - Ruby script to solve simultaneous equations with Gauss elimination method.](https://gist.github.com/komasaru/6520902 "Gist - Ruby script to solve simultaneous equations with Gauss elimination method.")

### 2. 実行

まず、実行権限を付与。

``` text
$ chmod +x gauss_elimination.rb
```

実際に、次の連立方程式を解いてみる。

![EQUATION_3]({{site.baseurl}}/images/2013/09/25/EQUATION_3.png "EQUATION_3")

``` text
$ ./gauss_elimination.rb
+1x1 -2x2 +3x3 -4x4 = +5
-2x1 +5x2 +8x3 -3x4 = +9
+5x1 +4x2 +7x3 +1x4 = -1
+9x1 +7x2 +3x3 +5x4 = +4
x1 = 1.000000
x2 = 3.000000
x3 = -2.000000
x4 = -4.000000
```

---

前回の C++ 版同様、何てことない内容でした。  
色々と数値を変えてみたり、元の数を増やしてみるのもよいでしょう。

以上。

