---
layout   : single
title    : "Ruby - 多桁計算！"
published: true
date     : 2013-03-19 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

前回は、C++ による「多桁計算」のアルゴリズムを紹介しました。

* [C++ - 多桁計算！]({{site.baseurl}}/2013/03/18/cpp-calc-big-digits/ "C++ - 多桁計算！")

今日は、同じアルゴリズムを Ruby で実現してみました。  
Ruby では桁数（整数型の範囲）をあまり気にしなくても、メモリの許される限り計算できますが、それでも都合が悪いこともあるでしょうし・・・・
アルゴリズムについては、上記リンクの記事を参照してください。

<!--more-->

実際、ほとんど同じです。

以下、Ruby によるサンプルスクリプトです。

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* Ruby 2.0.0-p0 を使用。

### 1. Ruby スクリプト作成

今回作成した Ruby ソースは以下の通りです。

File: `calc_big_digits.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************
# 多桁計算
#*********************************************
#
class CalcBigDigits
  # 配列サイズ
  N = 5

  def initialize
    # 計算する数字（a, b: 加減算用、c, d: 剰除算用）
    @a = [56789012,34567890,12345678,90123456,78901234]
    @b = [12345678,90123456,78901234,56789012,34567890]
    @c = [      12,34567890,12345678,90123456,78901234]
    @d = 99
  end

  # 計算・結果出力
  def calc
    long_add  # ロング + ロング
    long_sub  # ロング - ロング
    long_mul  # ロング * ショート
    long_div  # ロング / ショート
  end

  # ロング + ロング
  def long_add
    # 計算
    @z = Array.new(N, 0)
    carry = 0
    (N - 1).downto(0) do |i|
      @z[i] = @a[i] + @b[i] + carry
      if @z[i] < 100000000
        carry = 0
      else
        @z[i] = @z[i] - 100000000
        carry = 1
      end
    end
    # 結果出力
    print " "
    display_l(@a)
    print "+"
    display_l(@b)
    print "="
    display_l(@z)
    print "\n"
  end

  # ロング - ロング
  def long_sub
    # 計算
    @z = Array.new(N, 0)
    borrow = 0
    (N - 1).downto(0) do |i|
      @z[i] = @a[i] - @b[i] - borrow
      if @z[i] >= 0
        borrow = 0
      else
        @z[i] += 100000000
        borrow = 1
      end
    end
    # 結果出力
    print " "
    display_l(@a)
    print "-"
    display_l(@b)
    print "="
    display_l(@z)
    print "\n"
  end

  # ロング * ショート
  def long_mul
    # 計算
    @z = Array.new(N, 0)
    carry = 0
    (N - 1).downto(0) do |i|
      w = @c[i]
      @z[i] = (w * @d + carry) % 100000000
      carry = (w * @d + carry) / 100000000
    end
    # 結果出力
    print " "
    display_l(@c)
    print "*"
    display_s(@d)
    print "="
    display_l(@z)
    print "\n"
  end

  # ロング / ショート
  def long_div
    # 計算
    @z = Array.new(N, 0)
    remainder = 0
    0.upto(N - 1) do |i|
      w = @c[i]
      @z[i] = (w + remainder) / @d
      remainder = ((w + remainder) % @d) * 100000000
    end
    # 結果出力
    print " "
    display_l(@c)
    print "/"
    display_s(@d)
    print "="
    display_l(@z)
    print "\n"
  end

  # 結果出力（ロング用）
  def display_l(s)
    0.upto(N - 1) {|i| printf(" %08d", s[i])}
    print "\n"
  end

  # 結果出力（ショート用）
  def display_s(s)
    0.upto(N - 2) {|i| printf(" %8s", " ")}
    printf(" %08d\n", s)
  end
end

# メイン処理
begin
  # 計算クラスインスタンス化
  obj = CalcBigDigits.new
  # 多桁計算
  obj.calc
rescue => e
  $stderr.puts "[例外発生] #{e}"
end
{% endhighlight %}

* [Gist - Ruby script to compute big-digit values.](https://gist.github.com/komasaru/5106587 "Gist - Ruby script to compute big-digit values.")

### 2. 実行

まず、実行権限を付与。

``` text
$ chmod +x calc_big_digits.rb
```

そして、実行。

``` text
$ ./calc_big_digits.rb
  56789012 34567890 12345678 90123456 78901234
+ 12345678 90123456 78901234 56789012 34567890
= 69134691 24691346 91246913 46912469 13469124

  56789012 34567890 12345678 90123456 78901234
- 12345678 90123456 78901234 56789012 34567890
= 44443333 44444433 33444444 33334444 44333344

  00000012 34567890 12345678 90123456 78901234
*                                     00000099
= 00001222 22221122 22222211 22222222 11222166

  00000012 34567890 12345678 90123456 78901234
/                                     00000099
= 00000000 12470382 72851976 55455792 49281830

```

C++ 版と同じ結果が得られました。

---

Ruby の場合、今回のような加減乗除は普通にできますが、もっと大きな数字を扱うような場合（円周率計算等）には、今回のようなアルゴリズムを意識しないといけないでしょう。

以上。

