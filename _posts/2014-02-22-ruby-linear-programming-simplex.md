---
layout   : single
title    : "Ruby - 線形計画法（シンプレックス法）！"
published: true
date     : 2014-02-22 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

前回は、C++ による「線形計画法（シンプレックス法）」のアルゴリズムを紹介しました。

* [C++ - 線形計画法（シンプレックス法）！]({{site.baseurl}}/2014/02/21/cpp-linear-programming-by-simplex/ "C++ - 線形計画法（シンプレックス法）！")

今回は、同じアルゴリズムを Ruby で実現してみました。アルゴリズムについては、上記リンクの記事を参照してください。

<!--more-->

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* Ruby 2.0.0-p247 を使用。
* 線形計画法（シンプレックス法）についての説明は割愛。（「[C++ - 線形計画法（シンプレックス法）！]({{site.baseurl}}/2014/02/21/cpp-linear-programming-by-simplex/ "C++ - 線形計画法（シンプレックス法）！")」を参照）

### 1. Ruby スクリプト作成

File: `linear_programming_simplex.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# ***************************************
# 線形計画法（シンプレックス法）
# ***************************************
#
class LinearProgrammingSimplex
  N_ROW = 4  # 行数
  N_COL = 6  # 列数
  N_VAR = 2  # 変数の数

  def initialize
    # 係数行列
    @a = [
      [ 1.0,  2.0,  1.0,  0.0,  0.0, 14.0],
      [ 1.0,  1.0,  0.0,  1.0,  0.0,  8.0],
      [ 3.0,  1.0,  0.0,  0.0,  1.0, 18.0],
      [-2.0, -3.0,  0.0,  0.0,  0.0,  0.0]
    ]
  end

  # 実行
  def exec
    loop do
      # 列選択
      min, y = select_col(9999)
      break if min >= 0
      # 行選択
      min, x = select_row(9999, y)
      # ピボット係数を p で除算
      divide_pibot_var(x, y)
      # ピボット列の掃き出し
      sweap_out(x, y)
    end
    # 結果出力
    display
  rescue => e
    raise
  end

  private

  # 列選択
  def select_col(min)
    y = 0

    begin
      (N_COL - 1).times do |k|
        next unless @a[N_ROW - 1][k] < min
        min, y = @a[N_ROW - 1][k], k
      end
      return [min, y]
    rescue => e
      raise
    end
  end

  # 行選択
  def select_row(min, y)
    x = 0

    begin
      (N_ROW - 1).times do |k|
        p = @a[k][N_COL - 1] / @a[k][y].to_f
        next unless  @a[k][y] > 0 && p < min
        min, x = p, k
      end
      return [min, x]
    rescue => e
      raise
    end
  end

  # ピボット係数を p で除算
  def divide_pibot_var(x, y)
    p = @a[x][y]
    N_COL.times { |k| @a[x][k] /= p.to_f }
  rescue => e
    raise
  end

  # ピボット掃き出し
  def sweap_out(x, y)
    N_ROW.times do |k|
      next if k == x
      d = @a[k][y]
      N_COL.times { |j| @a[k][j] -= d * @a[x][j] }
    end
  rescue => e
    raise
  end

  # 結果出力
  def display
    N_VAR.times do |k|
      flag = -1
      N_ROW.times { |j| flag = j if @a[j][k] == 1 }
      puts "x%d = %8.4f" % [k, flag == -1 ? 0.0 : @a[flag][N_COL - 1]]
    end
    puts "z  = %8.4f" % @a[N_ROW - 1][N_COL - 1]
  rescue => e
    raise
  end
end

if __FILE__ == $0
  begin
    # インスタンス化＆実行
    LinearProgrammingSimplex.new.exec
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
  end
end
{% endhighlight %}

* [Gits - Ruby script to execute linear programming with Simplex method.](https://gist.github.com/komasaru/8928838 "Gist - Ruby script to execute linear programming with Simplex method.")

### 2. 実行

まず、実行権限を付与。

``` text
$ chmod +x linear_programming_simplex.rb
```

そして、実行。

``` text
$ ./linear_programming_simplex.rb
x0 =   2.0000
x1 =   6.0000
z  =  22.0000
```

コンソールには商品の生産量とそのときの売上高が出力される。

---

色々と数値を変えてみたり、元の数を増やしてみるのもよいでしょう。

以上。

