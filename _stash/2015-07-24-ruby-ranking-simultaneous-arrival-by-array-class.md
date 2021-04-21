---
layout   : single
title    : "Ruby - Array クラス拡張で配列要素にランク付け（同順位考慮）！"
published: true
date     : 2015-07-24 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

Ruby で配列内の数値をランク付け（同順位を考慮）する方法を、 Array クラスを拡張して実装してみました。

<!--more-->

### 0. 前提条件

* Ruby 2.2.2-p95 での作業を想定。
* 配列内の数値が大きい順に順位を付ける。
* 同順位を考慮する。（例：要素が 3, 1, 3, 2 で、大きい順に順位付ける場合の順位を 1, 4, 1, 3 とする）

### 1. Ruby スクリプトの作成

実質、配列の順位付を行なっているのは１行のみで、数値が自分より大きい要素の個数 +1 を順位とするアルゴリズム。

File: `array_rank.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#**********************************************************
# Ruby script to rank array items, considering same ranks.
#**********************************************************
#
class Array
  def rank
    # 以下の場合は例外スロー
    # - 自身配列が空
    # - 自身配列に数値以外の値を含む
    raise "Self array is nil!" if self.size == 0
    self.each do |v|
      raise "Items except numerical values exist!" unless v.to_s =~ /[\d\.]+/
    end

    # ランク付け
    self.map { |v| self.count { |a| a > v } + 1 }
  end
end

a = [9, 3, 2, 7, 1, 6, 8, 5, 10, 4]
b = [6, 8, 5, 8, 4, 9, 3, 3, 7, 1]
c = [6, 8.5, 5, 3.2, 7, 1, 8.1, 3.2, 9, 3]
d = [9, 3, 2, 7, "abc", 6, 8, 5, 10, 4]
puts "a = #{a}"
puts "--> #{a.rank}"
puts
puts "b = #{b}"
puts "--> #{b.rank}"
puts
puts "c = #{c}"
puts "--> #{c.rank}"
puts
puts "d = #{d}"
puts "--> #{d.rank}"
{% endhighlight %}

* [Gist - Ruby script to rank array items, considering same ranks.](https://gist.github.com/komasaru/0a58f9027edbc148399e "Gist - Ruby script to rank array items, considering same ranks.")

### 2. Ruby スクリプトの実行

``` text
$ ./array_rank.rb
a = [9, 3, 2, 7, 1, 6, 8, 5, 10, 4]
--> [2, 8, 9, 4, 10, 5, 3, 6, 1, 7]

b = [6, 8, 5, 8, 4, 9, 3, 3, 7, 1]
--> [5, 2, 6, 2, 7, 1, 8, 8, 4, 10]

c = [6, 8.5, 5, 3.2, 7, 1, 8.1, 3.2, 9, 3]
--> [5, 2, 6, 7, 4, 10, 3, 7, 1, 9]

d = [9, 3, 2, 7, "abc", 6, 8, 5, 10, 4]
./array_rank.rb:14:in `block in rank': Exist items except numerical values! (RuntimeError)
        from ./array_rank.rb:13:in `each'
        from ./array_rank.rb:13:in `rank'
        from ./array_rank.rb:33:in `<main>'
```

---

当方の場合、意外と利用頻度が高いので、単純な処理とは言えど結構重宝しています。

以上。

