---
layout   : single
title    : "Ruby - 赤道・黄道座標の変換（by 自作 gem ライブラリ）！"
published: true
date     : 2016-09-24 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
- RubyGems
---

赤道直交座標と黄道直交座標を相互に変換したり、直交座標と極座標を相互に変換したりする RubyGems ライブラリを作成しました。

以下、その簡単な使用例です。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 自作した RubyGems ライブラリは "[mk_coord](https://rubygems.org/gems/mk_coord"mk_coord - RubyGems.org")"
* 当ライブラリには任意の日時の平均黄道傾斜角を計算する機能を持たせていない。  
  必要であれば、別の自作ライブラリ "eph_bpn" をご使用ください。（過去記事参照：「[Ruby - バイアス・歳差・章動の適用（by 自作 gem ライブラリ）！]({{site.baseurl}}/2016/09/20/ruby-bpn-rotation-by-my-gem "Ruby - バイアス・歳差・章動の適用（by 自作 gem ライブラリ）！")」）

### 1. Ruby スクリプトの作成例

File: `coord_conversion.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= 赤道・黄道座標変換
#
# date          name            version
# 2016.08.29    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#++
require "mk_coord"

class CoordConversion
  # 黄道傾斜角(単位: rad)
  # (Math::PI は MkCoord::Const::PI と置き換えてもよい)
  EPS = 23.43929 * Math::PI / 180.0
  # 元の赤道直交座標
  POS = [
     0.99443659220700997281,
    -0.03816291768957833647,
    -0.01655177670960058384
  ]  # <= ある日の地球重心から見た太陽重心の位置(単位: AU)

  def exec
    puts "元の赤道直交座標:\n  #{POS}"
    rect_ec = MkCoord.rect_eq2ec(POS, EPS)
    puts "黄道直交座標に変換:\n  #{rect_ec}"
    rect_eq = MkCoord.rect_ec2eq(rect_ec, EPS)
    puts "赤道直交座標に戻す:\n  #{rect_eq}"
    *pol_eq, r = MkCoord.rect2pol(rect_eq)
    puts "赤道極座標に変換:\n  #{pol_eq[0, 2]} (R = #{r})"
    pol_ec = MkCoord.pol_eq2ec(pol_eq[0, 2], EPS)
    puts "黄道極座標に変換:\n  #{pol_ec[0, 2]}"
    pol_eq = MkCoord.pol_ec2eq(pol_ec, EPS)
    puts "赤道極座標に戻す:\n  #{pol_eq[0, 2]}"
    rect_eq = MkCoord.pol2rect(pol_eq[0, 2], r)
    puts "赤道直交座標に戻す:\n  #{rect_eq}"
  rescue => e
    puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}" }
    exit 1
  end
end

CoordConversion.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to convert celestial coordinates.](https://gist.github.com/komasaru/ffa7220cda43e1ba0f143b00b0ba49e6 "Gist - Ruby script to convert celestial coordinates.")

### 2. Ruby スクリプトの実行

``` text
$ ./coord_conversion.rb
元の赤道直交座標:
  [0.99443659220701, -0.038162917689578336, -0.016551776709600584]
黄道直交座標に変換:
  [0.99443659220701, -0.04159771108146677, -5.622172494390565e-06]
赤道直交座標に戻す:
  [0.99443659220701, -0.038162917689578336, -0.016551776709600584]
赤道極座標に変換:
  [6.24482770879939, -0.016630599800372015] (R = 0.9953062370542631)
黄道極座標に変換:
  [6.241379248856413, -5.648686087788284e-06]
赤道極座標に戻す:
  [6.24482770879939, -0.01663059980037209]
赤道直交座標に戻す:
  [0.99443659220701, -0.03816291768957855, -0.01655177670960066]
```

---

各種天体計算によく使用するので、ライブラリ化した次第です。

以上。

