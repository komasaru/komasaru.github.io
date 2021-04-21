---
layout   : single
title    : "Ruby - WGS84 (BLH) 座標 -> ENU 座標 変換！"
published: true
date     : 2019-05-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Ruby
---

少し前に、 BLH 座標（WGS84 の緯度(Beta)／経度(Lambda)／楕円体高(Height)）から ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標への変換や、その逆の変換の処理を Ruby で実装しました。

* [Ruby - WGS84 (BLH) 座標 -> ECEF 座標 変換！]({{site.baseurl}}/2019/04/26/ruby-convert-blh-to-ecef "Ruby - WGS84 (BLH) 座標 -> ECEF 座標 変換！")
* [Ruby - ECEF 座標 -> WGS84 (BLH) 座標 変換！]({{site.baseurl}}/2019/04/29/ruby-convert-ecef-to-blh "Ruby - ECEF 座標 -> WGS84 (BLH) 座標 変換！")

今回は、 BLH 座標から ENU 座標（地平座標; EastNorthUp）への変換処理を Ruby で実装してみました。

<!--more-->

### 0. 前提条件

* Ruby 2.6.3 での動作を想定。
* ここでは、 WGS84(World Geodetic System 1984) 測地系、 ECEF 座標（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）、 ENU 座標（地平座標）の詳細についての説明はしない。

### 1. Ruby スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* ENU 座標の他に方位角・仰角・距離も計算している。

File: `blh2enu.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#---------------------------------------------------------------------------------
# BLH -> ENU 変換
# : WGS84 の緯度(Beta)／経度(Lambda)／楕円体高(Height)を
#   ENU (East/North/Up; 地平) 座標に変換する。
#   * 途中、 ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標
#     への変換を経由。
#
# Date          Author          Version
# 2019.02.20    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2019 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#
class ConvBlh2Enu
  USAGE =  "[USAGE] ./blh2enu.rb  BETA_O LAMBDA_O HEIGHT_O BETA LAMBDA HEIGHT\n"
  USAGE << "        (BETA: LATITUDE, LAMBDA: LONGITUDE)"
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
    if ARGV.size < 6
      puts USAGE
      exit
    end
    @blh_o = ARGV[0, 3].map(&:to_f)
    @blh   = ARGV[3, 3].map(&:to_f)
  end

  # Execution
  def exec
    puts "BLH_O: LATITUDE(BETA) = %12.8f°" % @blh_o[0]
    puts "    LONGITUDE(LAMBDA) = %12.8f°" % @blh_o[1]
    puts "               HEIGHT = %12.3fm"  % @blh_o[2]
    puts "BLH:   LATITUDE(BETA) = %12.8f°" % @blh[0]
    puts "    LONGITUDE(LAMBDA) = %12.8f°" % @blh[1]
    puts "               HEIGHT = %12.3fm"  % @blh[2]
    enu = blh2enu(@blh_o, @blh)
    az = Math.atan2(enu[0], enu[1]) / PI_180
    az += 360.0 if az < 0.0
    el = Math.atan2(
        enu[2],
        Math.sqrt(enu[0] * enu[0] + enu[1] * enu[1])
    ) / PI_180
    dst = Math.sqrt(enu.map { |a| a * a }.inject(:+))
    puts "--->"
    puts "ENU: E = %12.3fm"  % enu[0]
    puts "     N = %12.3fm"  % enu[1]
    puts "     U = %12.3fm"  % enu[2]
    puts "方位角 = %12.3f°" % az
    puts "  仰角 = %12.3f°" % el
    puts "  距離 = %12.3fm"  % dst
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    e.backtrace.each { |tr| msg << "\t#{tr}\n" }
    $stderr.puts msg
    exit 1
  end

  private

  # BLH -> ENU 変換(Earth, North, Up)
  #
  # @param blh_o: BLH 座標（原点） [latitude, longitude, height]
  # @param   blh: BLH 座標（対象） [latitude, longitude, height]
  # @return  enu: ENU 座標 [e, n, u]
  def blh2enu(blh_o, blh)
    x_o, y_o, z_o = blh2ecef(blh_o)
    x, y, z = blh2ecef(blh)
    mat_0 = mat_z(90.0)
    mat_1 = mat_y(90.0 - blh_o[0])
    mat_2 = mat_z(blh_o[1])
    mat = mul_mat(mul_mat(mat_0, mat_1), mat_2)
    return rotate(mat, [x - x_o, y - y_o, z - z_o])
  rescue => e
    raise
  end

  # BLH -> ECEF 変換
  #
  # @param   blh: BLH  座標 [latitude, longitude, height]
  # @return ecef: ECEF 座標 [x, y, z]
  def blh2ecef(blh)
    lat, lon, ht = blh
    n = lambda do |x|
      s = Math.sin(x * PI_180)
      A / Math.sqrt(1.0 - E2 * s * s)
    end
    c_lat = Math.cos(lat * PI_180)
    c_lon = Math.cos(lon * PI_180)
    s_lat = Math.sin(lat * PI_180)
    s_lon = Math.sin(lon * PI_180)
    x = (n.call(lat) + ht) * c_lat * c_lon
    y = (n.call(lat) + ht) * c_lat * s_lon
    z = (n.call(lat) * (1.0 - E2) + ht) * s_lat
    return [x, y, z]
  rescue => e
    raise
  end

  # x 軸を軸とした回転行列
  #
  # @param  ang: 回転量(°)
  # @return    : 回転行列(3x3)
  def mat_x(ang)
    a = ang * PI_180
    c = Math.cos(a)
    s = Math.sin(a)
    return [
      [1.0, 0.0, 0.0],
      [0.0,   c,   s],
      [0.0,  -s,   c]
    ]
  rescue => e
    raise
  end

  # y 軸を軸とした回転行列
  #
  # @param  ang: 回転量(°)
  # @return    : 回転行列(3x3)
  def mat_y(ang)
    a = ang * PI_180
    c = Math.cos(a)
    s = Math.sin(a)
    return [
      [   c, 0.0,  -s],
      [ 0.0, 1.0, 0.0],
      [   s, 0.0,   c]
    ]
  rescue => e
    raise
  end

  # z 軸を軸とした回転行列
  #
  # @param  ang: 回転量(°)
  # @return    : 回転行列(3x3)
  def mat_z(ang)
    a = ang * PI_180
    c = Math.cos(a)
    s = Math.sin(a)
    return [
      [  c,   s, 0.0],
      [ -s,   c, 0.0],
      [0.0, 0.0, 1.0]
    ]
  rescue => e
    raise
  end

  # 2行列(3x3)の積
  #
  # @param  mat_a: 3x3 行列
  # @param  mat_b: 3x3 行列
  # @return   mat: 3x3 行列
  def mul_mat(mat_a, mat_b)
    mat = Array.new(3).map { |a| Array.new(3, 0.0) }
    0.upto(2) do |i|
      0.upto(2) do |j|
        0.upto(2) do |k|
          mat[i][j] += mat_a[i][k] * mat_b[k][j]
        end
      end
    end
    return mat
  rescue => e
    raise
  end

  # 点の回転
  #
  # @param mat_r: 3x3 回転行列
  # @param    pt: 回転前座標 [x, y, z]
  # @return  mat: 回転後座標 [x, y, z]
  def rotate(mat_r, pt)
    mat = Array.new(3, 0.0)
    0.upto(2) do |i|
      0.upto(2) do |j|
        mat[i] += mat_r[i][j] * pt[j]
      end
    end
    return mat
  rescue => e
    raise
  end
end

ConvBlh2Enu.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to convert WGS84(BLH) to ENU coordinate.](https://gist.github.com/komasaru/ffc19808b780a85891813960c46999a8 "Gist - Ruby script to convert WGS84(BLH) to ENU coordinate.")

### 2. Ruby スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x blh2enu.rb
```

そして、コマンドライン引数に原点と対象の緯度、経度、楕円体高を指定して実行する。

次は、[参考文献](https://www.enri.go.jp/~fks442/K_MUSEN/1st/1st060428rev2.pdf "理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf")内の実行例（仙台空の滑走路の長さ）と同じパラメータで実行。

``` text
$ ./blh2enu.rb 38.13877338 140.89872429 44.512 38.14227288 140.93265738 45.664
BLH_O: LATITUDE(BETA) =  38.13877338°
    LONGITUDE(LAMBDA) = 140.89872429°
               HEIGHT =       44.512m
BLH:   LATITUDE(BETA) =  38.14227288°
    LONGITUDE(LAMBDA) = 140.93265738°
               HEIGHT =       45.664m
--->
ENU: E =     2974.681m
     N =      388.988m
     U =        0.447m
方位角 =       82.550°
  仰角 =        0.009°
  距離 =     3000.006m
```

次は、島根県本庁舎から見た松江市本庁舎の位置の計算例。（但し、標高 0m と想定）

```
$ ./blh2enu.rb 35.472222 133.050556 0 35.468056 133.048611 0
BLH_O: LATITUDE(BETA) =  35.47222200°
    LONGITUDE(LAMBDA) = 133.05055600°
               HEIGHT =        0.000m
BLH:   LATITUDE(BETA) =  35.46805600°
    LONGITUDE(LAMBDA) = 133.04861100°
               HEIGHT =        0.000m
--->
ENU: E =     -176.539m
     N =     -462.213m
     U =       -0.019m
方位角 =      200.904°
  仰角 =       -0.002°
  距離 =      494.779m
```

* U の値や仰角が負の値になっているのは地球が球体であるためで、誤りではない。
* 概ね、島根県本庁舎から西に 176.539m, 南に 462.213m の所に松江市本庁舎が位置しているということ。

### 3. 参考文献

* [理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf](https://www.enri.go.jp/~fks442/K_MUSEN/1st/1st060428rev2.pdf "理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf")

※上記の参考文献のソースコード内、方位角の計算に誤りがある（ように見受けられる）ので、注意。

---

人工衛星の正確な軌道計算等に利用できるでしょう。

以上。

