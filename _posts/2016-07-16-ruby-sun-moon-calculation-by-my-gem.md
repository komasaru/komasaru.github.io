---
layout   : single
title    : "Ruby - 日・月の出・入・南中計算 gem の作成！"
published: true
date     : 2016-07-16 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
- RubyGems
---

当方、 「[日の出・日の入りの計算―天体の出没時刻の求め方](http://www.amazon.co.jp/gp/product/4805206349/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=247&creative=1211&creativeASIN=4805206349&linkCode=as2&tag=komasaru-22 "日の出・日の入りの計算―天体の出没時刻の求め方 - 長沢 工 - 本 - Amazon.co.jp")」を参考に日・月の出・入・南中を計算する Ruby スクリプトを作成しておりましたが、あらゆる面で流用したくなったために、今回 RubyGems ライブラリにし公開することとしました。

以下では、今回作成した gem の簡単な利用方法をご紹介します。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 自作した gem ライブラリの名称は "[mk_sunmoon](https://rubygems.org/gems/mk_sunmoon "mk_sunmoon - RubyGems.org")" で、計算対象年月日は 0000-01-01 〜 9999-01-01。
* 当ライブラリの計算可能項目
  + 日の出（時刻、方位角）
  + 日南中（時刻、高度）
  + 日の入（時刻、方位角）
  + 月の出（時刻、方位角）
  + 月南中（時刻、高度）
  + 月の入（時刻、方位角）

### 1. インストール

``` text
$ sudo gem install mk_sunmoon
```

### 2. Ruby スクリプトの作成例

File: `sun_moon.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
# 日の出・日の入の時刻・方位、日の南中の時刻・高度、
# 月の出・月の入の時刻・方位、月の南中の時刻・高度  の算出
#
# date          name            version
# 2016.06.13    mk-mode         1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# [引数] 第１: 日付 (Format: 99999999, Default: システム日付)
#              計算対象の日付(グレゴリオ暦)(JST)を半角８桁数字で指定。
#        第２: 緯度 (Format: [+-]999.99999999, Default: 35.47222222)
#              (度で指定。北緯は +, 南緯は -, 小数点以下は省略可)
#        第３: 経度 (Format: [+-]999.99999999, Default: 133.05055556)
#              (度で指定。東経は +, 西経は - ,小数点以下は省略可)
#        第４: 標高 (Format: [+]9999.99999999, Default: 0.0)
#              (メートルで指定。小数点以下は省略可)
#---------------------------------------------------------------------------------
#+
require 'mk_sunmoon'

class SunMoon
  USAGE =<<-EOS
  [USAGE] ./sun_moon.rb [date[, latitude[, longitude[, altitude]]]]
  引数
  第１: 日付 (Format: 99999999, Default: システム日付)
        計算対象の日付(グレゴリオ暦)(JST)を半角８桁数字で指定。
  第２: 緯度 (Format: [+-]999.99999999, Default: 35.47222222)
        (度で指定。北緯は +, 南緯は -, 小数点以下は省略可)
  第３: 経度 (Format: [+-]999.99999999, Default: 133.05055556)
        (度で指定。東経は +, 西経は - ,小数点以下は省略可)
  第４: 標高 (Format: [+]9999.99999999, Default: 0.0)
        (メートルで指定。小数点以下は省略可)
EOS
  def initialize
    check_args(ARGV)
    @obj = MkSunmoon.new(*ARGV)
  end

  def exec
    begin
      sign_lat = @obj.lat < 0 ? "S" : "N"
      sign_lon = @obj.lon < 0 ? "W" : "E"
      sr = @obj.sunrise
      ss = @obj.sunset
      sm = @obj.sun_mp
      mr = @obj.moonrise
      ms = @obj.moonset
      mm = @obj.moon_mp
      str  = sprintf("  %04d-%02d-%02d", @obj.year, @obj.month, @obj.day)
      str << " [#{@obj.lat}#{sign_lat}, #{@obj.lon}#{sign_lon}, #{@obj.alt}m]\n"
      str << "  日の出: #{sr[0]} (方位角: "
      str << (sr[1] == "---" ? "--------°)\n" : sprintf("%8.4f°)\n", sr[1]))
      str << "  日南中: #{sm[0]} (  高度: "
      str << (sm[1] == "---" ? "--------°)\n" : sprintf("%8.4f°)\n", sm[1]))
      str << "  日の入: #{ss[0]} (方位角: "
      str << (ss[1] == "---" ? "--------°)\n" : sprintf("%8.4f°)\n", ss[1]))
      str << "  月の出: #{mr[0]} (方位角: "
      str << (mr[1] == "---" ? "--------°)\n" : sprintf("%8.4f°)\n", mr[1]))
      str << "  月南中: #{mm[0]} (  高度: "
      str << (mm[1] == "---" ? "--------°)\n" : sprintf("%8.4f°)\n", mm[1]))
      str << "  月の入: #{ms[0]} (方位角: "
      str << (ms[1] == "---" ? "--------°)\n" : sprintf("%8.4f°)\n", ms[1]))
      puts str
    rescue => e
      $stderr.puts "[#{e.class}] #{e.message}"
      e.backtrace.each { |tr| $stderr.puts "\t#{tr}" }
      exit 1
    end
  end

  private

  def check_args(args)
    date, lat, lon, alt = args

    begin
      if (date && date !~ /^\d{8}$/) ||
         (lat && lat !~ /^[+-]?\d{,2}(\.\d*)?$/) ||
         (lon && lon !~ /^[+-]?\d{,3}(\.\d*)?$/) ||
         (alt && alt !~ /^+?\d{,4}(\.\d*)?$/)
        puts USAGE
        exit 0
      end
    rescue => e
      raise
    end
  end
end

SunMoon.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate a Japan's Sun/Moon phenomenons with a selfmade gem library.](https://gist.github.com/komasaru/7d64afb7c56661fab6cd52e94fa25864 "Gist - Ruby script to calculate a Japan's Sun/Moon phenomens with a selfmade gem library.")

### 3. サンプルスクリプトの実行

``` text
$ ./sun_moon.rb 20160613 35.47222222 133.05055556 0
  2016-06-13 [35.47222222N, 133.05055556E, 0.0m]
  日の出: 04:51:52 (方位角:  60.3626°)
  日南中: 12:07:52 (  高度:  77.7587°)
  日の入: 19:23:59 (方位角: 299.6796°)
  月の出: 12:48:14 (方位角:  89.5617°)
  月南中: 18:58:52 (  高度:  54.1050°)
  月の入: 00:32:24 (方位角: 272.8283°)
```

### 4. gem ライブラリ

* [mk_sunmoon - RubyGems.org](https://rubygems.org/gems/mk_sunmoon "mk_sunmoon - RubyGems.org")
* [komasaru/mk_sunmoon: Sunrise, Sunset, Moonrise, Moonset library.](https://github.com/komasaru/mk_sunmoon "komasaru/mk_sunmoon: Sunrise, Sunset, Moonrise, Moonset library.")

---

以前作成した Ruby スクリプトを何かと応用したかったので gem ライブラリ化した次第です。

以上。

