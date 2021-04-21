---
layout   : single
title    : "Ruby - JPL DE430 データから太陽・月の視位置を計算（自作 gem ライブラリ）（その２）！"
published: true
date     : 2018-08-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
- RubyGems
---

以前、太陽と月の視位置を高精度で計算するための RubyGems ライブラリを作成したことを紹介しました。

* [Ruby - JPL DE430 データから太陽・月の視位置を計算（by 自作 gem ライブラリ）！]({{site.baseurl}}/2016/10/10/ruby-sun-moon-apparent-position-calculation-by-my-gem "Ruby - JPL DE430 データから太陽・月の視位置を計算（by 自作 gem ライブラリ）！")

視半径や（地平）視差の計算はしておりませんでしたが、今回それらも計算するよう処理を追加したので、改めて記録として残しておきます。

<!--more-->

### 0. 前提条件

* Ruby 2.5.1-p57 での作業を想定。
* 自作した RubyGems ライブラリは [mk_apos](https://rubygems.org/gems/mk_apos "RubyGems - mk_apos")  
  （このライブラリ内では、他の自作ライブラリ [eph_jpl](https://rubygems.org/gems/eph_jpl "RubyGems - eph_jpl"), [eph_bpn](https://rubygems.org/gems/eph_bpn "RubyGems - eph_bpn"), [mk_time](https://rubygems.org/gems/mk_time "RubyGems - mk_time"), [mk_coord](https://rubygems.org/gems/mk_coord "RubyGems - mk_coord") も使用している）

### 1. 事前準備

JPL DE430 のデータを使用するので、バイナリデータ "linux_p1550p2650.430" を[こちら](ftp://ssd.jpl.nasa.gov/pub/eph/planets/Linux/de430/)から取得し “JPLEPH” とリネームして適当なディレクトリに配置しておく。

ただし、このバイナリファイルはサイズが大きいので、必要な年代のテキストデータのみをマージ＆バイナリ化してもよい。（参考：[JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data/ "JPL 天文暦データのバイナリ化！")）

### 2. Ruby スクリプトの作成例

* `FILE_BIN` の値は、 "JPLEPH" の配置場所に合わせて編集すること。

File: `apparent_sun_moon_jpl.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= 太陽・月の視位置計算
#
#  * JPLEPH(JPL の DE430 バイナリデータ)読み込み、視位置を計算する
#    (自作 RubyGems ライブラリ mk_apos を使用)
#
# date          name            version
# 2016.09.14    mk-mode.com     1.00 新規作成
# 2018.06.08    mk-mode.com     1.01 視半径／（地平）視差の取得を追加
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : 日時(JST)
#          書式：YYYYMMDD or YYYYMMDDHHMMSS
#          無指定なら現在(システム日時)と判断。
#---------------------------------------------------------------------------------
#++
require 'date'
require 'mk_apos'

class ApparentSunMoon
  USAGE    = "[USAGE] ./apparent_sun_moon.rb [YYYYMMDD|YYYYMMDDHHMMSS|YYYYMMDDHHMMSSU...]"
  FILE_BIN = "/home/masaru/src/calendar/ephemeris_jpl/JPLEPH"     # JPL バイナリデータ
  AU       = 149597870.7  # 1天文単位 (km)

  #=========================================================================
  # 初期処理
  #
  # @param:  <none>
  # @return: <none>
  #=========================================================================
  def initialize
    @jst = get_arg
    @utc = jst2utc(@jst)
  end

  #=========================================================================
  # 主処理
  #
  # @param:  <none>
  # @return: <none>
  #=========================================================================
  def exec
    # 計算
    @apos = MkApos.new(FILE_BIN, @utc.strftime("%Y%m%d%H%M%S%6N"))
    sun  = @apos.sun
    moon = @apos.moon
    # 結果出力
    puts "* 計算対象時刻 (JST) = #{@jst.strftime("%Y-%m-%d %H:%M:%S.%3N")}"
    puts "               (UTC) = #{@apos.utc.strftime("%Y-%m-%d %H:%M:%S.%3N")}"
    puts "               (TDB) = #{@apos.tdb.strftime("%Y-%m-%d %H:%M:%S.%3N")}"
    puts "                (JD) = #{@apos.jd_tdb}"
    puts "* 視位置：太陽"
    printf("  = [赤経: %14.10f rad, 赤緯: %14.10f rad]\n", sun[0][0], sun[0][1])
    printf("  = [赤経: %14.10f deg, 赤緯: %14.10f deg]\n", sun[0][0] * 180 / Math::PI, sun[0][1] * 180 / Math::PI)
    printf("  = [黄経: %14.10f rad, 黄緯: %14.10f rad]\n", sun[1][0], sun[1][1])
    printf("  = [黄経: %14.10f deg, 黄緯: %14.10f deg]\n", sun[1][0] * 180 / Math::PI, sun[1][1] * 180 / Math::PI)
    puts "* 視位置：月"
    printf("  = [赤経: %14.10f rad, 赤緯: %14.10f rad]\n", moon[0][0], moon[0][1])
    printf("  = [赤経: %14.10f deg, 赤緯: %14.10f deg]\n", moon[0][0] * 180 / Math::PI, moon[0][1] * 180 / Math::PI)
    printf("  = [黄経: %14.10f rad, 黄緯: %14.10f rad]\n", moon[1][0], moon[1][1])
    printf("  = [黄経: %14.10f deg, 黄緯: %14.10f deg]\n", moon[1][0] * 180 / Math::PI, moon[1][1] * 180 / Math::PI)
    puts "* 視黄経差：太陽 - 月"
    printf("  = %.10f rad = %.10f deg\n", sun[1][0] - moon[1][0], (sun[1][0] - moon[1][0]) * 180 / Math::PI)
    puts "* 距離：太陽"
    printf("  = %.10f AU = %.2f km\n", sun[0][2], sun[0][2] * AU)
    puts "* 距離：月"
    printf("  = %.10f AU = %.2f km\n", moon[0][2], moon[0][2] * AU)
    puts "* 視半径：太陽"
    printf("  = %.2f ″\n", sun[2][0])
    puts "* 視半径：月"
    printf("  = %.2f ″\n", moon[2][0])
    puts "* （地平）視差：太陽"
    printf("  = %.2f ″\n", sun[2][1])
    puts "* （地平）視差：月"
    printf("  = %.2f ″\n", moon[2][1])
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    msg << e.backtrace.each { |tr| "\t#{tr}"}.join("\n")
    $stderr.puts msg
    exit 1
  end

  private

  #=========================================================================
  # 引数取得
  #
  # @param:  <none>
  # @return: UTC  (Time Object)
  #=========================================================================
  def get_arg
    unless arg = ARGV.shift
      t = Time.now
      return Time.new(t.year, t.month, t.day, t.hour, t.min, t.sec)
    end
    (puts USAGE; exit 0) unless arg =~ /^\d{8}$|^\d{14,}$/
    year, month, day = arg[ 0, 4].to_i, arg[ 4, 2].to_i, arg[ 6, 2].to_i
    hour, min,   sec = arg[ 8, 2].to_i, arg[10, 2].to_i, arg[12, 2].to_i
    usec = arg.split(//).size > 14 ? arg[14..-1] : "0"
    (puts USAGE; exit 0) unless Date.valid_date?(year, month, day)
    (puts USAGE; exit 0) if hour > 23 || min > 59 || sec > 59
    d = usec.split(//).size
    return Time.new(year, month, day, hour, min, sec + Rational(usec.to_i, 10 ** d), "+09:00")
  rescue => e
    raise
  end

  #=========================================================================
  # JST -> UTC
  #
  # @param:  JST  (Time Object)
  # @return: UTC  (Time Object)
  #=========================================================================
  def jst2utc(jst)
    return jst - 9 * 60 * 60
  rescue => e
    raise
  end
end

ApparentSunMoon.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate apparent position of Sun and Moon.](https://gist.github.com/komasaru/d6e4470ccb89b0fe672fda77fb87fc36 "Gist - Ruby script to calculate apparent position of Sun and Moon.")

### 3. Ruby スクリプトの実行

コマンドライン引数に日時(JST)を `YYYYMMDD` or `YYYYMMDDHHMMSS` or `YYYYMMDDHHMMSSU...` の書式で指定指定実行する。（指定しない場合はシステム時刻を JST とみなす）  
以下は 2017年02月26日23時58分16秒（太陽と月の視黄経差が 0.0 に近づく日時） の例。

``` text
$ ./apparent_sun_moon_jpl.rb 20170226235816
* 計算対象時刻 (JST) = 2017-02-26 23:58:16.000
               (UTC) = 2017-02-26 14:58:16.000
               (TDB) = 2017-02-26 14:59:25.183
                (JD) = 2457811.1245970363
* 視位置：太陽
  = [赤経:   5.9314947579 rad, 赤緯:  -0.1482282942 rad]
  = [赤経: 339.8496158309 deg, 赤緯:  -8.4928556631 deg]
  = [黄経:   5.9027340605 rad, 黄緯:   0.0000119200 rad]
  = [黄経: 338.2017492555 deg, 黄緯:   0.0006829680 deg]
* 視位置：月
  = [赤経:   5.9344172269 rad, 赤緯:  -0.1554058261 rad]
  = [赤経: 340.0170609725 deg, 赤緯:  -8.9040979467 deg]
  = [黄経:   5.9027322049 rad, 黄緯:  -0.0077251597 rad]
  = [黄経: 338.2016429370 deg, 黄緯:  -0.4426190448 deg]
* 視黄経差：太陽 - 月
  = 0.0000018556 rad = 0.0001063186 deg
* 距離：太陽
  = 0.9902304099 AU = 148136360.82 km
* 距離：月
  = 0.0025279571 AU = 378177.00 km
* 視半径：太陽
  = 969.11 ″
* 視半径：月
  = 947.94 ″
* （地平）視差：太陽
  = 8.88 ″
* （地平）視差：月
  = 3478.92 ″
```

### 4. 計算結果の検証

国立天文台サイト内の暦計算室の計算結果と高い精度で一致することも確認する。

* [太陽の地心座標 - 国立天文台暦計算室](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/sun.cgi "太陽の地心座標 - 国立天文台暦計算室")
* [月の地心座標 - 国立天文台暦計算室](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/moon.cgi "月の地心座標 - 国立天文台暦計算室")

### 5. 参考サイト

* [暦象年表の改訂について（国立天文台）（PDF 1.7MB）](http://www.nao.ac.jp/contents/about-naoj/reports/report-naoj/11-34-2.pdf "暦象年表の改訂について - 国立天文台")
* [RubyGems - mk_apos](https://rubygems.org/gems/mk_apos "RubyGems - mk_apos")
* [RubyGems - eph_jpl](https://rubygems.org/gems/eph_jpl "RubyGems - eph_jpl")
* [RubyGems - eph_bpn](https://rubygems.org/gems/eph_bpn "RubyGems - eph_bpn")
* [RubyGems - mk_time](https://rubygems.org/gems/mk_time "RubyGems - mk_time")
* [RubyGems - mk_coord](https://rubygems.org/gems/mk_coord "RubyGems - mk_coord")

---

以上。

