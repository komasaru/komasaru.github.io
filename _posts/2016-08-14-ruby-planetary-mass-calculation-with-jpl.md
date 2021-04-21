---
layout   : single
title    : "Ruby - JPL 天文暦データから惑星質量を計算！"
published: true
date     : 2016-08-14 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している月・惑星の暦の最新版 DE430 には各種定数値も掲載されています。

その定数値の中に、太陽や惑星の質量に万有引力定数を乗じたものがあります。

その値から太陽や惑星の質量を Ruby で算出して確認してみました。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。

### 1. 事前情報

* JPL DE430 の定数データは[こちら](ftp://ssd.jpl.nasa.gov/pub/eph/planets/ascii/de430/header.430_572)。
* 万有引力定数の最新の国際的な定義値は[こちら](http://physics.nist.gov/cgi-bin/cuu/Value?bg)。
* JPL DE430 の定数データのうち、 `GM1` 〜 `GMS` が「水星」〜「太陽」の質量に万有引力定数を乗じたもので、単位は $$AU^{3} / day^{2}$$.
  （但し、`GMB` は「地球ー月の重心」）
* JPL DE430 の定数データのうち、 `EMRAT` は「地球と月の質量比」で、単位は $$GM(earth) / GM(moon)$$.
* JPL DE430 の定数データのうち、 `AU` は「天文単位」で、単位は $$m$$.

### 2. Ruby スクリプトの作成

* `G`, `DAYSEC` 以外の定数は JPL DE430 の値。
* 計算時、単位を揃えることに注意する。
* 地球と月の GM 値は存在しないので、`GMB` と `EMRAT` から計算する。

File: `jpl_planetary_mass.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= 太陽・惑星・月の質量計算
#  : JPL DE430 の定数データから太陽・惑星・月の質量を求める。
#
#  * JPL データ  : ftp://ssd.jpl.nasa.gov/pub/eph/planets/ascii/de430/header.430_572
#  * 万有引力定数: http://physics.nist.gov/cgi-bin/cuu/Value?bg
#
# date          name            version
# 2016.07.01    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#++

class JplPlanetaryMass
  EMRAT  = 0.813005690741906200e+02  # Earth-Moon ratio     （単位： GM(earth) / GM(moon)）
  GM1    = 0.491248045036476000e-10  # Mercury              （単位： au^3 / day^2）
  GM2    = 0.724345233264412000e-09  # Venus                （単位： au^3 / day^2）
  GMB    = 0.899701139019987100e-09  # Earth-Moon Barycenter（単位： au^3 / day^2）
  GM4    = 0.954954869555077000e-10  # Mars                 （単位： au^3 / day^2）
  GM5    = 0.282534584083387000e-06  # Jupiter              （単位： au^3 / day^2）
  GM6    = 0.845970607324503000e-07  # Saturn               （単位： au^3 / day^2）
  GM7    = 0.129202482578296000e-07  # Uranus               （単位： au^3 / day^2）
  GM8    = 0.152435734788511000e-07  # Neptune              （単位： au^3 / day^2）
  GM9    = 0.217844105197418000e-11  # Pluto                （単位： au^3 / day^2）
  GMS    = 0.295912208285591100e-03  # Sun                  （単位： au^3 / day^2）
  G      = 6.67408e-11               # 万有引力定数         （単位： m^3 kg^-1 s^-2）
  AU     = 149597870700              # 天文単位             （単位： m）
  DAYSEC = 86400                     # seconds / day

  def calc
    m_1 = (GM1 * AU ** 3 / DAYSEC ** 2) / G
    m_2 = (GM2 * AU ** 3 / DAYSEC ** 2) / G
    m_e = ((GMB * EMRAT / (1.0 + EMRAT)) * AU ** 3 / DAYSEC ** 2) / G
    m_4 = (GM4 * AU ** 3 / DAYSEC ** 2) / G
    m_5 = (GM5 * AU ** 3 / DAYSEC ** 2) / G
    m_6 = (GM6 * AU ** 3 / DAYSEC ** 2) / G
    m_7 = (GM7 * AU ** 3 / DAYSEC ** 2) / G
    m_8 = (GM8 * AU ** 3 / DAYSEC ** 2) / G
    m_9 = (GM9 * AU ** 3 / DAYSEC ** 2) / G
    m_s = (GMS * AU ** 3 / DAYSEC ** 2) / G
    m_m = m_e / EMRAT  # = ((GMB / (1.0 + EMRAT)) * AU ** 3 / 86400 ** 2) / G
    puts "[質量]"
    printf("  太陽 = %e kg\n", m_s)
    printf("  水星 = %e kg\n", m_1)
    printf("  金星 = %e kg\n", m_2)
    printf("  地球 = %e kg\n", m_e)
    printf("    月 = %e kg\n", m_m)
    printf("  火星 = %e kg\n", m_4)
    printf("  木星 = %e kg\n", m_5)
    printf("  土星 = %e kg\n", m_6)
    printf("天王星 = %e kg\n", m_7)
    printf("海王星 = %e kg\n", m_8)
    printf("冥王星 = %e kg\n", m_9)
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    msg << e.backtrace.each { |tr| "\t#{tr}"}.join("\n")
    $stderr.puts msg
    exit 1
  end
end

JplPlanetaryMass.new.calc if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate planetary masses from JPL DE430.](https://gist.github.com/komasaru/dd58947e88c7cdec9c21c9aeb47e7e92 "Gist - Ruby script to calculate planetary masses from JPL DE430.")

### 3. Ruby スクリプトの実行

``` text
$ ./jpl_planetary_mass.rb
[質量]
  太陽 = 1.988475e+30 kg
  水星 = 3.301096e+23 kg
  金星 = 4.867466e+24 kg
  地球 = 5.972365e+24 kg
    月 = 7.346031e+22 kg
  火星 = 6.417120e+23 kg
  木星 = 1.898580e+27 kg
  土星 = 5.684766e+26 kg
天王星 = 8.682168e+25 kg
海王星 = 1.024340e+26 kg
冥王星 = 1.463872e+22 kg
```

JPL データや万有引力定数の違い等で若干異なることがあるかもしれないが、大体合っているようだ。

---

JPL 天文暦データから惑星の質量が取得できないものかと考えていたけど、できたので安心しました。

以上。

