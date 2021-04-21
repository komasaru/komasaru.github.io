---
layout   : single
title    : "Ruby - シュバルツシルト半径の計算！"
published: true
date     : 2016-09-03 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

太陽系の太陽・惑星・月のシュバルツシルト半径(Schwarzschild radius)を計算してみました。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。

### 1. シュバルツシルト半径について

専門ではないので詳細に説明できないが、簡単に言うと、

* 強い重力による時空の歪みの影響で、一度入ったら光でさえ抜け出せなくなる天体の半径。
* ブラックホールなら、その大きさを表すものとして使われる。
* シュバルツシルト半径の計算式は、  
  $$
  r = 2 * G * M / c^{2}
  $$
  但し、
  - $$G: 万有引力定数(単位: m^{3} kg^{-1} s^{-2})$$
  - $$M: 質量(単位: kg)$$
  - $$c: 光速(単位: m/s)$$
* ひいては、天体の視位置を正確に計算する際に、質量の大きな天体の重力場による光の曲がりに関わってくる。

### 2. Ruby スクリプトの作成

単純に計算式に当てはめて計算しているだけ。

但し、

* 太陽・惑星・月の質量については、過去記事「[Ruby - JPL 天文暦データから惑星質量を計算！]({{site.baseurl}}/2016/08/14/ruby-planetary-mass-calculation-with-jpl "Ruby - JPL 天文暦データから惑星質量を計算！")」を参照のこと。
* 万有引力定数については、 "[CODATA Value: Newtonian constant of gravitation](http://physics.nist.gov/cgi-bin/cuu/Value?bg "CODATA Value: Newtonian constant of gravitation")" を参照のこと

File: `calc_schwarzschild_radius.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= シュバルツシルト半径(Schwarzschild radius) の計算
#  : JPL DE430 の惑星質量データを利用して、太陽・惑星・月のシュバルツシルト半径を求める。
#
#  * JPL データ  : ftp://ssd.jpl.nasa.gov/pub/eph/planets/ascii/de430/header.430_572
#  * 万有引力定数: http://physics.nist.gov/cgi-bin/cuu/Value?bg
#  * シュバルツシルト半径 r = 2 * G * M / c^2
#
# date          name            version
# 2016.07.18    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#++

class CalcSchwarzschildRadius
  MASS = {
    "  太陽" => 1.988475e+30,
    "  水星" => 3.301096e+23,
    "  金星" => 4.867466e+24,
    "  地球" => 5.972365e+24,
    "    月" => 7.346031e+22,
    "  火星" => 6.417120e+23,
    "  木星" => 1.898580e+27,
    "  土星" => 5.684766e+26,
    "天王星" => 8.682168e+25,
    "海王星" => 1.024340e+26,
    "冥王星" => 1.463872e+22
  }                  # 天体の質量   (単位： kg)
  C  = 299792458.0   # 光の速度     (単位： m/s)
  G  = 6.67408e-11   # 万有引力定数 (単位： m^3 kg^-1 s^-2)

  def calc
    puts "[シュバルツシルト半径]"
    MASS.each do |k, m|
      printf("  %s: %13.8f m\n", k, 2 * G * m / (C * C))
    end
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    msg << e.backtrace.each { |tr| "\t#{tr}"}.join("\n")
    $stderr.puts msg
    exit 1
  end
end

CalcSchwarzschildRadius.new.calc if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate Schwarzschild radius.](https://gist.github.com/komasaru/6f59466c21037557342ff0ffb2f9b055 "Gist - Ruby script to calculate Schwarzschild radius.")

### 3. Ruby スクリプトの実行

``` text
$ ./calc_schwarzschild_radius.rb
[シュバルツシルト半径]
    太陽: 2953.24945925 m
    水星:    0.00049027 m
    金星:    0.00722908 m
    地球:    0.00887006 m
      月:    0.00010910 m
    火星:    0.00095306 m
    木星:    2.81973892 m
    土星:    0.84429184 m
  天王星:    0.12894609 m
  海王星:    0.15213325 m
  冥王星:    0.00002174 m
```

---

太陽系惑星の視位置を正確に計算するのに必要な情報だったので、調査・計算してみた次第です。

以上。

