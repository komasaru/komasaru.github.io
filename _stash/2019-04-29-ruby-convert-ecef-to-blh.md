---
layout   : single
title    : "Ruby - ECEF 座標 -> WGS84 (BLH) 座標 変換！"
published: true
date     : 2019-04-29 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Ruby
---

先日、 WGS84(World Geodetic System 1984) 測地系の緯度(Beta)／経度(Lambda)／楕円体高(Height)を ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標に変換する方法を Ruby で実装しました。

* [Ruby - WGS84 (BLH) 座標 -> ECEF 座標 変換！]({{site.baseurl}}/2019/04/26/ruby-convert-blh-to-ecef "Ruby - WGS84 (BLH) 座標 -> ECEF 座標 変換！")

今回は、逆に、 ECEF 座標を WGS84 の緯度(Beta)／経度(Lambda)／楕円体高(Height)に変換する方法を Ruby で実装してみました。

過去には Python で実装しています。

* [Python - ECEF 座標 -> WGS84 (BLH) 座標 変換！]({{site.baseurl}}/2018/09/05/python-convert-ecef-to-blh "Python - ECEF 座標 -> WGS84 (BLH) 座標 変換！")

<!--more-->

### 0. 前提条件

* Ruby 2.6.3 での動作を想定。
* ここでは、 WGS84(World Geodetic System 1984) 測地系や ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）の詳細についての説明はしない。

### 1. Ruby スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `ecef2blh.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#---------------------------------------------------------------------------------
# ECEF -> BLH 変換
# : ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標を
#   WGS84 の緯度(Latitude)／経度(Longitude)／楕円体高(Height)に変換する。
#
# Date          Author          Version
# 2019.02.19    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2019 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#
class ConvEcef2Blh
  USAGE = "[USAGE] ./ecef2blh.rb X Y Z"
  PI_180 = Math::PI / 180.0
  # WGS84 座標パラメータ
  A      = 6378137.0                # a(地球楕円体長半径(赤道面平均半径))
  ONE_F  = 298.257223563            # 1 / f(地球楕円体扁平率=(a - b) / a)
  B      = A * (1.0 - 1.0 / ONE_F)  # b(地球楕円体短半径)
  E2     = (1.0 / ONE_F) * (2 - (1.0 / ONE_F))
                                    # e^2 = 2 * f - f * f
                                    #     = (a^2 - b^2) / a^2
  ED2    = E2 * A * A / (B * B)     # e'^2= (a^2 - b^2) / b^2

  # Initialization
  # * コマンドライン引数の取得
  def initialize
    if ARGV.size < 3
      puts USAGE
      exit
    end
    @ecef = ARGV[0, 3].map(&:to_f)
  end

  # Execution
  def exec
    puts "ECEF: X = %12.3fm" % @ecef[0]
    puts "      Y = %12.3fm" % @ecef[1]
    puts "      Z = %12.3fm" % @ecef[2]
    blh = ecef2blh(@ecef)
    puts "--->"
    puts "BLH: LATITUDE(BETA) = %12.8f°" % blh[0]
    puts "  LONGITUDE(LAMBDA) = %12.8f°" % blh[1]
    puts "             HEIGHT = %12.3fm"  % blh[2]
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    e.backtrace.each { |tr| msg << "\t#{tr}\n" }
    $stderr.puts msg
    exit 1
  end

  private

  # ECEF -> BLH  変換
  #
  # @param ecef: ECEF 座標 [x, y, z]
  # @return blh: BLH  座標 [latitude, longitude, height]
  def ecef2blh(ecef)
    x, y, z = ecef
    n = lambda do |x|
      s = Math.sin(x * PI_180)
      A / Math.sqrt(1.0 - E2 * s * s)
    end
    p = Math.sqrt(x * x + y * y)
    theta = Math.atan2(z * A, p * B) / PI_180
    lat = Math.atan2(
      z + ED2 * B * Math.sin(theta * PI_180)**3,
      p - E2  * A * Math.cos(theta * PI_180)**3
    ) / PI_180
    lon = Math.atan2(y, x) / PI_180
    ht = (p / Math.cos(lat * PI_180)) - n.call(lat)
    return [lat, lon, ht]
  rescue => e
    raise
  end
end

ConvEcef2Blh.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to convert ECEF  to WGS84(BLH) coordinate.](https://gist.github.com/komasaru/f4693296ad38b562bd90067858ef1560 "Gist - Ruby script to convert ECEF to WGS84(BLH) coordinate.")

### 2. Ruby スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x ecef2blh.rb
```

そして、コマンドライン引数に ECEF 座標 X, Y, Z を指定して実行する。

``` text
$ ./ecef2blh.rb -3899086.094 3166914.545 3917336.601
ECEF: X = -3899086.094m
      Y =  3166914.545m
      Z =  3917336.601m
--->
BLH: LATITUDE(BETA) =  38.13579617°
  LONGITUDE(LAMBDA) = 140.91581617°
             HEIGHT =       41.940m
```

### 3. 参考文献

* [理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf](https://www.enri.go.jp/~fks442/K_MUSEN/1st/1st060428rev2.pdf "理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf")

---

人工衛星の正確な軌道計算等に利用できるでしょう。

以上。

