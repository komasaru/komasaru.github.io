---
layout   : single
title    : "Ruby - 地球楕円体上の2地点間中心角の計算！"
published: true
date     : 2019-10-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
- GIS
---

地球楕円体上の2地点と地球中心がなす中心角を Ruby で計算してみました。

単純に2点の直交座標を計算後、2ベクトルのなす角を計算するだけ。（他にも算出方法はありますが）

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.4 での作業を想定。

### 1. 計算手順

1. 地点1の緯度・経度を $$\phi_1, \lambda_1$$, 地点2の緯度・経度を $$\phi_2, \lambda_2$$ とする。
2. 地点1の緯度 $$\phi_1$$,経度 $$\lambda_1$$, 地点2の緯度 $$\phi_2$$,経度 $$\lambda_2$$ を直交座標（ECEF(Earth Centerd Earth Fixed)座標） $$(x_1, y_1, z_1), (x_2, y_2, z_2)$$ に変換する。
3. 地球中心から地点1, 地球中心から地点2という2つのベクトルとみなし、2ベクトルのなす角 $$\psi$$ を計算する。  
   $$\displaystyle \psi = \cos^{-1}\frac{x_1 x_2 + y_1 y_2 + z_1 z_2}{\sqrt{x_1 x_1 + y_1 y_1 + z_1 z_1}\sqrt{x_2 x_2 + y_2 y_2 + z_2 z_2}} $$

ECEF 座標の計算については過去記事を参照。（今回の計算のキモとなる部分）

* [Ruby - WGS84 (BLH) 座標 -> ECEF 座標 変換！]({{site.baseurl}}/2019/04/26/ruby-convert-blh-to-ecef "Ruby - WGS84 (BLH) 座標 -> ECEF 座標 変換！")

### 2. Ruby スクリプトの作成

* 地球楕円体は **GRS-80**, **WGS-84**, **BESSEL** を考慮。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `calc_central_angle.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#---------------------------------------------------------------------------------
# 2地点の緯度・経度から中心角を計算
# * 2地点の緯度(Beta)／経度(Lambda)／楕円体高(Height)から
#   地球中心から2地点への線分のなす中心角を求める。
# * CalcCentralAngle クラスが実行クラス
# * CentralAngle クラスが計算の本質部分
#
#   Date          Author          Version
#   2019.08.29    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2019 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# コマンドライン引数：
#   第1: 緯度-1
#   第2: 経度-1
#   第3: 緯度-2
#   第4: 経度-2
#   第5: 地球楕円体("GRS80"|"WGS84"|"BESSEL") (optional)
#   * 緯度は、東経が +, 西経が - で指定。
#   * 経度は、北緯が +, 南緯が - で指定。
#   * 2地点の高度(標高)は 0m に限定。
#   * 地球楕円体省略時は "GRS80" とみなす。
#---------------------------------------------------------------------------------
#
class CalcCentralAngle
  USAGE = "[USAGE] ./calc_central_angle.rb LAT_1 LNG_1 LAT_2 LNG_2 [ELLIPSOID]"

  # Initialization
  # * コマンドライン引数の取得
  def initialize
    if ARGV.size < 4
      puts USAGE
      exit
    end
    args = ARGV[0, 4].map(&:to_f)
    @pt_1 = args[0, 2]
    @pt_2 = args[2, 2]
    @el   = "GRS80"
    @el   = ARGV[4] if ARGV[4]
  end

  # Execution
  def exec
    puts "      POINT-1: %8.4f° %9.4f°" % @pt_1
    puts "      POINT-2: %8.4f° %9.4f°" % @pt_2
    puts "    ELLIPSOID: #{@el}"
    obj = CentralAngle.new(*((@pt_1 + @pt_2) << @el))
    ca = obj.calc_central_angle
    puts "CENTRAL-ANGLE: %8.4f°" % ca
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    e.backtrace.each { |tr| msg << "\t#{tr}\n" }
    $stderr.puts msg
    exit 1
  end
end

class CentralAngle
  # 地球楕円体(長半径, 扁平率の逆数)
  ELLIPSOID = {
    "GRS80"  => [6_378_137.0  , 298.257_222_101],
    "WGS84"  => [6_378_137.0  , 298.257_223_563],
    "BESSEL" => [6_377_397.155, 299.152_813_000]
  }
  PI_180 = Math::PI / 180.0

  def initialize(lat_1, lng_1, lat_2, lng_2, ellipsoid="GRS80")
    @lat_1, @lng_1 = lat_1, lng_1
    @lat_2, @lng_2 = lat_2, lng_2
    el  = ELLIPSOID[ellipsoid]
    @a  = el[0]
    f   = 1 / el[1]
    @e2 = f * (2 - f)
  end

  # 中心角の計算
  # * 2ベクトルのなす角とみなして計算
  #
  # @return: 中心角 (Unit: °)
  def calc_central_angle
    x_1, y_1, z_1 = blh2ecef(@lat_1, @lng_1)
    x_2, y_2, z_2 = blh2ecef(@lat_2, @lng_2)
    return Math.acos(
      (x_1 * x_2 + y_1 * y_2 + z_1 * z_2) /
      (Math.sqrt(x_1 * x_1 + y_1 * y_1 + z_1 * z_1) *
       Math.sqrt(x_2 * x_2 + y_2 * y_2 + z_2 * z_2))
    ) / PI_180
  rescue => e
    raise
  end

private
  # BLH座標 -> ECEF直交座標 変換
  #
  # @param        lat: BLH  座標 緯度 (Unit: °)
  # @param        lng:           経度 (Unit: °)
  # @param         ht:           高度 (Unit: m)
  # @return [x, y, z]: ECEF 座標      (Unit: m)
def blh2ecef(lat, lng, ht=0.0)
    s = Math.sin(lat * PI_180)
    n = @a / Math.sqrt(1.0 - @e2 * s * s)
    x = (n + ht) \
      * Math.cos(lat * PI_180) \
      * Math.cos(lng * PI_180)
    y = (n + ht) \
      * Math.cos(lat * PI_180) \
      * Math.sin(lng * PI_180)
    z = (n * (1.0 - @e2) + ht) \
      * Math.sin(lat * PI_180)
    return [x, y, z]
  rescue => e
    raise
  end
end

CalcCentralAngle.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate a central angle betweetn 2 points on earth.](https://gist.github.com/komasaru/a4fc9d0f8a96bfad1d7ce86eba54bf3f "Gist - Ruby script to a calculate central angle betweetn 2 points on earth.")

### 3. Ruby スクリプトの実行

地点1の緯度・経度、地点2の緯度・経度、オプションで地球楕円体(`GRS80|WGS84|BESSEL`)を指定して実行。

``` text
$ ./calc_central_angle.rb 35.0 135.0 40.0 140.0
      POINT-1:  35.0000°  135.0000°
      POINT-2:  40.0000°  140.0000°
    ELLIPSOID: GRS80
CENTRAL-ANGLE:   6.3792°

$./calc_central_angle.rb 35.0 135.0 40.0 140.0 WGS84
      POINT-1:  35.0000°  135.0000°
      POINT-2:  40.0000°  140.0000°
    ELLIPSOID: WGS84
CENTRAL-ANGLE:   6.3792°

$./calc_central_angle.rb 35.0 135.0 40.0 140.0 BESSEL
      POINT-1:  35.0000°  135.0000°
      POINT-2:  40.0000°  140.0000°
    ELLIPSOID: BESSEL
CENTRAL-ANGLE:   6.3792°

$ ./calc_central_angle.rb 35.0 135.0 40.0 135.0
      POINT-1:  35.0000°  135.0000°
      POINT-2:  40.0000°  135.0000°
    ELLIPSOID: GRS80
CENTRAL-ANGLE:   4.9912°

$ ./calc_central_angle.rb 0.0 135.0 0.0 140.0
      POINT-1:   0.0000°  135.0000°
      POINT-2:   0.0000°  140.0000°
    ELLIPSOID: GRS80
CENTRAL-ANGLE:   5.0000°

$./calc_central_angle.rb 0.0 -45.0 0.0 135.0
      POINT-1:   0.0000°  -45.0000°
      POINT-2:   0.0000°  135.0000°
    ELLIPSOID: GRS80
CENTRAL-ANGLE: 180.0000°

$ ./calc_central_angle.rb 0.0 -135.0 0.0 135.0
      POINT-1:   0.0000° -135.0000°
      POINT-2:   0.0000°  135.0000°
    ELLIPSOID: GRS80
CENTRAL-ANGLE:  90.0000°

$ ./calc_central_angle.rb 90.0 135.0 90.0 135.0
      POINT-1:  90.0000°  135.0000°
      POINT-2:  90.0000°  135.0000°
    ELLIPSOID: GRS80
CENTRAL-ANGLE:   0.0000°
```

---

当初、地図上の正確な位置計算に利用しようと考えていたが、結局、別の方法を採用することにしたので、今回の方法は使い道がなくなった。

しかし、高校数学の復習にはなった。

以上。

