---
layout   : single
title    : "Ruby - 最小二乗法！"
published: true
date     : 2014-03-03 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

前回は、C++ による「最小二乗法」のアルゴリズムを紹介しました。

* [C++ - 最小二乗法！]({{site.baseurl}}/2014/03/02/cpp-least-squares-method/ "C++ - 最小二乗法！")

今回は、同じアルゴリズムを Ruby で実現してみました。アルゴリズムについては、上記リンクの記事を参照してください。

<!--more-->

以下、Ruby によるサンプルスクリプトです。

### 0. 前提条件

* Linux Mint 13 Maya (64bit) での作業を想定。
* Ruby 2.1.0-p0 を使用。
* 最小二乗法についての説明は割愛。（「[C++ - 最小二乗法！]({{site.baseurl}}/2014/03/02/cpp-least-squares-method/ "C++ - 最小二乗法！")」を参照）

### 1. Ruby スクリプト作成

File: `least_squares_method.rb`

{% highlight ruby linenos %}
# ***************************************
# 最小二乗法
# ***************************************

# 計算クラス
class Calc
  # 定数
  N, M = 7, 5                    # データ数, 予測曲線の次数
  X = [-3, -2, -1,  0, 1, 2, 3]  # 測定データ x
  Y = [ 5, -2, -3, -1, 1, 4, 5]  # 測定データ y

  def initialize
    # a, s, t データ
    @a = Array.new(M + 1).map{Array.new(M + 2, 0.0)}
    @s = Array.new(2 * M + 1, 0.0)
    @t = Array.new(M + 1, 0.0)
  end

  # 最小二乗法
  def calc_least_squares_method
    # s, t 計算
    calc_st

    # a に s, t 代入
    ins_st

    # 掃き出し
    sweap_out

    # y 値計算＆結果出力
    display
  end

  private

  # s, t 計算
  def calc_st
    0.upto(N - 1) do |i|
      0.upto(2 * M) { |j| @s[j] += (X[i] ** j) }
      0.upto(M) { |j| @t[j] += (X[i] ** j) * Y[i] }
    end
  end

  # a に s, t 代入
  def ins_st
    0.upto(M) do |i|
      0.upto(M) { |j| @a[i][j] = @s[i + j] }
      @a[i][M + 1] = @t[i]
    end
  end

  # 掃き出し
  def sweap_out
    0.upto(M) do |k|
      p = @a[k][k]
      k.upto(M + 1) { |j| @a[k][j] /= p }
      0.upto(M) do |i|
        unless i == k
          d = @a[i][k]
          k.upto(M + 1) { |j| @a[i][j] -= d * @a[k][j] }
        end
      end
    end
  end

  # y 値計算＆結果出力
  def display
    0.upto(M) { |k| printf("a%d = %10.6f\n", k, @a[k][M + 1]) }
    puts "    x    y"
    -3.step(3, 0.5) do |px|
      p = 0
      0.upto(M) { |k| p += @a[k][M + 1] * (px ** k) }
      printf("%5.1f%5.1f\n", px, p)
    end
  end
end

# インスタンス化＆実行
Calc.new.calc_least_squares_method
{% endhighlight %}

* [Gist - Ruby script to solve approximate equation with least squares method.](https://gist.github.com/komasaru/9202158 "Gist - Ruby script to solve approximate equation with least squares method.")

### 2. 実行

まず、実行権限を付与。

``` text
$ chmod +x least_squares_method.rb
```

そして、実行。

``` text
$ ./least_squares_method.rb
a0 =  -1.259740
a1 =   2.100000
a2 =   0.424242
a3 =  -0.083333
a4 =   0.030303
a5 =  -0.016667
    x    y
 -3.0  5.0
 -2.5  0.3
 -2.0 -2.1
 -1.5 -2.9
 -1.0 -2.8
 -0.5 -2.2
  0.0 -1.3
  0.5 -0.1
  1.0  1.2
  1.5  2.6
  2.0  3.9
  2.5  4.9
  3.0  5.0
```

C++ 版と同じ結果になるはず。

---

色々と数値や次数を変えてみるのもよいでしょう。

以上。

