---
layout   : single
title    : "Ruby - JPL 天文暦データから地球と惑星の距離を計算！"
published: true
date     : 2016-08-30 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している太陽・月・惑星の暦の最新版 DE430 には太陽・月・惑星の位置（ICRS座標系）の情報が格納されています。

それらの値を使用して、地球から太陽・月・その他の惑星との間の距離を Ruby で計算してみました。（JPL DE430 の情報を読み込むには自作の RubyGems ライブラリ "eph_jpl" を使用する）

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* JPL DE430 のバイナリデータを[こちら](ftp://ssd.jpl.nasa.gov/pub/eph/planets/ascii/de430/header.430_572)から取得し "JPLEPH" とリネームして適当なディレ取りに配置しておく。
* 当方作成の RubyGems ライブラリ [eph_jpl - RubyGems.org](https://rubygems.org/gems/eph_jpl "eph_jpl - RubyGems.org") がインストール済みであること。

### 1. Ruby スクリプトの作成

File: `jpl_distance_earth.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= JPLEPH(JPL の DE430 バイナリデータ)読込後に座標（位置・速度）を計算し、さらに
#  地球から太陽・惑星・月までの距離を計算する。
#  : 自作の RubyGems ライブラリ eph_jpl を使用する
#    （JPL DE430 のバイナリデータが準備済みであること）
#
# date          name            version
# 2016.07.13    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 【引数】 ユリウス日
#          （省略可。省略時は現在日時のユリウス日を地球時TT(≒太陽系力学時TDB)とみなす）
#---------------------------------------------------------------------------------
#++
require 'eph_jpl'

class JplDistanceEarth
  FILE_BIN = "/path/to/JPLEPH"
  USAGE    = "【使用方法】 ./jpl_distance_earth.rb [ユリウス日]"
  CENTER   = 3
  KM       = false  # true: km, false: AU
  BODIES = {
     1 => "  水星 (Mercury)",  2 => "  金星 (Venus)  ",  3 => "  地球 (Earth)  ",
     4 => "  火星 (Mars)   ",  5 => "  木星 (Jupiter)",  6 => "  土星 (Saturn) ",
     7 => "天王星 (Uranus) ",  8 => "海王星 (Neptune)",  9 => "冥王星 (Pluto)  ",
    10 => "    月 (Moon)   ", 11 => "  太陽 (Sun)    "
  }

  def initialize
    @jd   = get_args
    @unit = KM ? "KM" : "AU"
  end

  def exec
    puts "JD(TT) = #{@jd}\n#{BODIES[3]}"
    BODIES.each do |target, target_name|
      next if target == 3
      eph = EphJpl.new(FILE_BIN, target, CENTER, @jd, KM)
      ps = eph.calc[0,3]
      d = calc_distance(ps)
      d = KM ? sprintf("%19.8f", d) : sprintf("%11.8f", d)
      puts "- #{target_name} : #{d} #{@unit}"
    end
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    msg << e.backtrace.each { |tr| "\t#{tr}"}.join("\n")
    $stderr.puts msg
    exit 1
  end

  private

  #=========================================================================
  # コマンドライン引数取得
  #
  # @param:  <none>
  # @return: jd
  #=========================================================================
  def get_args
    jd = ARGV.shift
    return jd ? jd.to_f : gc2jd({
      year:  Time.now.strftime("%Y").to_i,
      month: Time.now.strftime("%m").to_i,
      day:   Time.now.strftime("%d").to_i,
      hour:  Time.now.strftime("%H").to_i,
      min:   Time.now.strftime("%M").to_i,
      sec:   Time.now.strftime("%S").to_i
    })
  rescue => e
    puts USAGE
    raise
  end

  #=========================================================================
  # 年月日(グレゴリオ暦)からユリウス日(JD)を計算する
  #
  # * フリーゲルの公式を使用する
  #   JD = int(365.25 * year)
  #      + int(year / 400)
  #      - int(year / 100)
  #      + int(30.59 (month - 2))
  #      + day
  #      + 1721088
  # * 上記の int(x) は厳密には、 x を超えない最大の整数
  # * 「ユリウス日」でなく「準ユリウス日」を求めるなら、
  #   `+ 1721088` を `- 678912` とする。
  #
  # @param:  hash = {
  #            year(int), month(int), day(int), hour(int), min(int), sec(int)
  #          }
  # @return: jd (ユリウス日)
  #=========================================================================
  def gc2jd(hash)
    year  = hash[:year]
    month = hash[:month]
    day   = hash[:day]
    hour  = hash[:hour]
    min   = hash[:min]
    sec   = hash[:sec]

    begin
      # 1月,2月は前年の13月,14月とする
      if month < 3
        year  -= 1
        month += 12
      end
      # 日付(整数)部分計算
      jd = (365.25 * year).floor \
         + (year / 400.0).floor \
         - (year / 100.0).floor \
         + (30.59 * (month - 2)).floor \
         + day \
         + 1721088
      # 時間(小数)部分計算
      t = (sec / 3600.0 + min / 60.0 + hour) / 24.0
      return jd + t
    rescue => e
      raise
    end
  end

  #=========================================================================
  # 距離計算
  #
  # @param:  ps       (x-座標, y-座標, z-座標)
  # @return: distance (距離)
  #=========================================================================
  def calc_distance(ps)
    return Math.sqrt(ps.inject(0) { |s, a| s + a * a })
  rescue => e
    raise
  end
end

JplDistanceEarth.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate planetary distances.](https://gist.github.com/komasaru/f73e86318d91edadee59bceceb5abf61 "Gist - Ruby script to calculate planetary distances.")

### 2. Ruby スクリプトの実行

以下は、「地球時(TT)2016年7月13日0時0時0分0秒」で計算した例。（距離単位を AU で計算したものと km で計算したもの）

``` text
$ ./jpl_distance_earth.rb 2457582.5
JD(TT) = 2457582.5
地球 (Earth)
-   水星 (Mercury) :  1.32217757 AU
-   金星 (Venus)   :  1.69764291 AU
-   火星 (Mars)    :  0.62571104 AU
-   木星 (Jupiter) :  5.91822023 AU
-   土星 (Saturn)  :  9.23857800 AU
- 天王星 (Uranus)  : 19.99078537 AU
- 海王星 (Neptune) : 29.30214573 AU
- 冥王星 (Pluto)   : 32.12201719 AU
-     月 (Moon)    :  0.00270216 AU
-   太陽 (Sun)     :  1.01654960 AU

$ ./jpl_distance_earth.rb 2457582.5
JD(TT) = 2457582.5
地球 (Earth)
-   水星 (Mercury) :  197794949.19472104 KM
-   金星 (Venus)   :  253963763.90310407 KM
-   火星 (Mars)    :   93605038.57629812 KM
-   木星 (Jupiter) :  885353144.47506535 KM
-   土星 (Saturn)  : 1382071597.57920527 KM
- 天王星 (Uranus)  : 2990578925.21471119 KM
- 海王星 (Neptune) : 4383538608.69842434 KM
- 冥王星 (Pluto)   : 4805385374.42336559 KM
-     月 (Moon)    :     404237.25163473 KM
-   太陽 (Sun)     :  152073656.28368542 KM
```

### 3. 計算結果の検証

国立天文台暦計算室・暦象年表のツールで確認してみる。

* [太陽の地心座標](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/sun.cgi "太陽の地心座標")
* [月の地心座標](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/moon.cgi "月の地心座標")
* [惑星の地心座標](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/planet.cgi "惑星の地心座標")

かなりの精度で一致することが確認できる。（但し、月は AU 単位では確認できない）

### 4. 参考サイト

* [eph_jpl - RubyGems.org](https://rubygems.org/gems/eph_jpl "eph_jpl - RubyGems.org")
* [komasaru/eph_jpl: Ephemeris calculation tool by JPL method.](https://github.com/komasaru/eph_jpl "komasaru/eph_jpl: Ephemeris calculation tool by JPL method.")

---

JPL 天文暦データから太陽・月・惑星の位置情報（ICRS 座標）を取得する RubyGems ライブラリを自作していたので、距離の計算自体は中学数学レベルで済みました。

以上。

