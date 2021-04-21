---
layout   : single
title    : "Ruby - グリニッジ恒星時の計算（by 自作 gem ライブラリ）！"
published: true
date     : 2016-09-28 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
- RubyGems
---

以前、 Ruby でグリニッジ恒星時（視恒星時、平均恒星時、分点均差）を計算するプログラムを作りました。

* [Ruby - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2016/08/06/ruby-calc-greenwich-sidereal-time "Ruby - グリニッジ恒星時の計算（IAU2006 理論）！")

しかし、他のプログラム内でも使用したかったので、今回 RubyGems ライブラリ化しました。

以下、その簡単な使用例です。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 自作した RubyGems ライブラリは "[mk_greenwich](https://rubygems.org/gems/mk_greenwich "mk_greenwich - RubyGems.org")"
* バイアス・歳差・章動の計算も必要であるため、当ライブラリでは別の自作ライブラリ "eph_bpn" を使用するようにしている。  
  バイアス・歳差・章動については、過去記事「[Ruby - バイアス・歳差・章動の適用（by 自作 gem ライブラリ）！]({{site.baseurl}}/2016/09/20/ruby-bpn-rotation-by-my-gem "Ruby - バイアス・歳差・章動の適用（by 自作 gem ライブラリ）！")」を参照のこと。
* 以下で出現する英略語について
  - ERA: Earth Rotation Angle; 地球回転角
  - EO: Equation of the Origins; 原点差
  - GAST: Greenwich Apparent Sidereal Time; グリニッジ視恒星時
  - GMST: Greenwich Mean Sidereal Time; グリニッジ平均恒星時
  - EE: Equation of Equinoxes; 分点均差

### 1. Ruby スクリプトの作成例

File: `calc_greenwich_time.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= グリニジ視恒星時 GAST(= Greenwich Apparent Sidereal Time)等の計算
#  : IAU2006 による計算
#
#  * IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy)
#    の提供する C ソースコード "gst06.c" 等で実装されているアルゴリズムを使用する。
#  * 参考サイト
#    - [SOFA Library Issue 2016-05-03 for ANSI C: Complete List](http://www.iausofa.org/2016_0503_C/CompleteList.html)
#    - [USNO Circular 179](http://aa.usno.navy.mil/publications/docs/Circular_179.php)
#    - [IERS Conventions Center](http://62.161.69.131/iers/conv2003/conv2003_c5.html)
#
# Date          Author          Version
# 2016.09.06    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : 日時(UTC（協定世界時）)
#          書式：YYYYMMDD or YYYYMMDDHHMMSS
#          無指定なら現在(システム日時)を UTC とみなす。
#---------------------------------------------------------------------------------
#++
require 'mk_greenwich'

class CalcGreenwichTime
  def initialize
    @utc = get_arg
  end

  def calc
    begin
      g = MkGreenwich.new(@utc.strftime("%Y%m%d%H%M%S"))
      puts g.utc.strftime("    UTC = %Y-%m-%d %H:%M:%S.%L")
      puts g.tt.strftime("     TT = %Y-%m-%d %H:%M:%S.%L")
      puts g.ut1.strftime("    UT1 = %Y-%m-%d %H:%M:%S.%L")
      puts g.tdb.strftime("    TDB = %Y-%m-%d %H:%M:%S.%L")
      puts "    ERA = #{g.era}"
      puts "     EO = #{g.eo}"
      puts "GAST: #{g.gast} rad"
      puts "    = #{g.gast_deg} °"
      puts "    = #{g.gast_hms}"
      puts "GMST: #{g.gmst} rad"
      puts "    = #{g.gmst_deg} °"
      puts "    = #{g.gmst_hms}"
      puts "  EE: #{g.ee} rad"
      puts "    = #{g.ee_deg} °"
      puts "    = #{g.ee_hms}"
    rescue => e
      msg = "[#{e.class}] #{e.message}\n"
      msg << e.backtrace.map { |tr| "\t#{tr}"}.join("\n")
      $stderr.puts msg
      exit 1
    end
  end

  private

  # コマンドライン引数の取得
  def get_arg
    unless arg = ARGV.shift
      t = Time.now
      return Time.new(t.year, t.month, t.day, t.hour, t.min, t.sec)
    end
    exit 0 unless arg =~ /^\d{8}$|^\d{14}$/
    year, month, day = arg[ 0, 4].to_i, arg[ 4, 2].to_i, arg[ 6, 2].to_i
    exit 0 unless Date.valid_date?(year, month, day)
    hour, min,   sec = arg[ 8, 2].to_i, arg[10, 2].to_i, arg[12, 2].to_i
    exit 0 if hour > 23 || min > 59 || sec > 59
    return Time.new(year, month, day, hour, min, sec)
  rescue => e
    raise
  end
end

CalcGreenwichTime.new.calc if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate Greenwich times.](https://gist.github.com/komasaru/8cfb03670a68c4941b9e9360d7cfe5f6 "Gist - Ruby script to calculate Greenwich times.")

### 2. Ruby スクリプトの実行

コマンドライン引数に UTC を YYYYMMDD or YYYYMMDDHHMMSS の形式で指定して実行する。（未指定ならシステム時刻を UTC とみなす）

``` text
$ ./calc_greenwich_time.rb 20160906
    UTC = 2016-09-06 00:00:00.000
     TT = 2016-09-06 00:01:08.184
    UT1 = 2016-09-05 23:59:59.700
    TDB = 2016-09-06 00:01:08.183
    ERA = 6.026682507434728
     EO = -0.003708039788085105
GAST: 6.030390547222813 rad
    = 345.51592717145417 °
    = 23 h 02 m 03.823 s
GMST: 6.030412554087049 rad
    = 345.5171880718952 °
    = 23 h 02 m 04.125 s
  EE: -2.2006864235812884e-05 rad
    = -0.001260900441029472 °
    = -0 h 00 m 00.303 s
```

### 3. 計算結果の検証

国立天文台・暦象年表のツールで計算した値と比較してみた。

グリニッジ視恒星時・平均恒星時は 1/10000° の精度、分点均差は時角で 1/1000s の精度で一致することが確認できた。

* [グリニジ恒星時 - 国立天文台暦計算室](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/gst.cgi "グリニジ恒星時 - 国立天文台暦計算室")

---

天体の各種計算をするのよく使用するのでライブラリ化した次第です。

以上。

