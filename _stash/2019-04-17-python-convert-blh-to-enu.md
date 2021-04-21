---
layout   : single
title    : "Python - WGS84(BLH) 座標 -> ENU 座標 変換！"
published: true
date     : 2019-04-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Python
---

以前、 BLH 座標（WGS84 の緯度(Beta)／経度(Lambda)／楕円体高(Height)）から ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標への変換や、その逆の変換の処理を Python で実装しました。

* [Python - WGS84 (BLH) 座標 -> ECEF 座標 変換！]({{site.baseurl}}/2018/09/02/python-convert-blh-to-ecef "Python - WGS84 (BLH) 座標 -> ECEF 座標 変換！")
* [Python - ECEF 座標 -> WGS84 (BLH) 座標 変換！]({{site.baseurl}}/2018/09/05/python-convert-ecef-to-blh "Python - ECEF 座標 -> WGS84 (BLH) 座標 変換！")

今回は BLH 座標から ENU 座標（地平座標; EastNorthUp）への変換処理を Python で実装してみました。

<!--more-->

### 0. 前提条件

* Python 3.7.2 での動作を想定。
* ここでは、 WGS84(World Geodetic System 1984) 測地系、 ECEF 座標（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）、 ENU 座標（地平座標）の詳細についての説明はしない。

### 1. Python スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* ENU 座標の他に方位角・仰角・距離も計算している。

File: `blh2enu.py`

{% highlight python linenos %}
#! /usr/local/bin/python3
"""
BLH -> ENU 変換
: WGS84 の緯度(Beta)／経度(Lambda)／楕円体高(Height)を
  ENU (East/North/Up; 地平) 座標に変換する。
  * 途中、 ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標
    への変換を経由。

  Date          Author          Version
  2019.02.18    mk-mode.com     1.00 新規作成

Copyright(C) 2019 mk-mode.com All Rights Reserved.
---
引数: LATITUDE(BETA) LONGITUDE(LAMBDA) HEIGHT
"""
import math
import sys
import traceback


class BlhToEnu:
    USAGE = (
        "[USAGE] ./blh2enu.py BETA_O LAMBDA_O HEIGHT_O BETA LAMBDA HEIGHT\n"
        "        (BETA: LATITUDE, LAMBDA: LONGITUDE)"
    )
    PI_180 = math.pi / 180.0
    # WGS84 座標パラメータ
    A      = 6378137.0                # a(地球楕円体長半径(赤道面平均半径))
    ONE_F  = 298.257223563            # 1 / f(地球楕円体扁平率=(a - b) / a)
    B      = A * (1.0 - 1.0 / ONE_F)  # b(地球楕円体短半径)
    E2     = (1.0 / ONE_F) * (2 - (1.0 / ONE_F))
                                      # e^2 = 2 * f - f * f
                                      #     = (a^2 - b^2) / a^2
    ED2    = E2 * A * A / (B * B)     # e'^2= (a^2 - b^2) / b^2

    def __init__(self):
        """ Initialization
            : コマンドライン引数の取得
        """
        try:
            if len(sys.argv) < 7:
                print(self.USAGE)
                sys.exit(0)
            self.b_o, self.l_o, self.h_o, self.b, self.l, self.h = \
                map(lambda x: float(x), sys.argv[1:7])
        except Exception as e:
            raise

    def exec(self):
        """ Execution """
        try:
            print((
                "BLH_O: BETA = {:12.8f}°\n"
                "     LAMBDA = {:12.8f}°\n"
                "     HEIGHT = {:7.3f}m"
            ).format(self.b_o, self.l_o, self.h_o))
            print((
                "BLH:   BETA = {:12.8f}°\n"
                "     LAMBDA = {:12.8f}°\n"
                "     HEIGHT = {:7.3f}m"
            ).format(self.b, self.l, self.h))
            enu = self.__blh2enu(
                self.b_o, self.l_o, self.h_o, self.b, self.l, self.h
            )
            az = math.atan2(enu[0], enu[1]) * 180.0 / math.pi
            if az < 0.0:
                az += 360.0
            el = math.atan2(
                enu[2],
                math.sqrt(enu[0] * enu[0] + enu[1] * enu[1])
            ) * 180.0 / math.pi
            dst = math.sqrt(sum([a * a for a in enu]))
            print("--->")
            print((
                "ENU: E = {:12.3f}m\n"
                "     N = {:12.3f}m\n"
                "     U = {:12.3f}m\n"
                "方位角 = {:12.3f}°\n"
                "  仰角 = {:12.3f}°\n"
                "  距離 = {:12.3f}m"
            ).format(*enu, az, el, dst))
        except Exception as e:
            raise

    def __blh2enu(self, b_o, l_o, h_o, b, l, h):
        """ BLH -> ENU 変換(Earth, North, Up)

        :param  float b_o: 原点 Beta(Latitude)
        :param  float l_o: 原点 Lambda(Longitude)
        :param  float h_o: 原点 Height
        :param  float   b: 対象 Beta(Latitude)
        :param  float   l: 対象 Lambda(Longitude)
        :param  float   h: 対象 Height
        :return list  enu: ENU 座標 [e, n, u]
        """
        try:
            x_o, y_o, z_o = self.__blh2ecef(b_o, l_o, h_o)
            x, y, z = self.__blh2ecef(b, l, h)
            mat_0 = self.__mat_z(90.0)
            mat_1 = self.__mat_y(90.0 - b_o)
            mat_2 = self.__mat_z(l_o)
            mat = self.__mul_mat(self.__mul_mat(mat_0, mat_1), mat_2)
            return self.__rotate(mat, [x - x_o, y - y_o, z - z_o])
        except Exception as e:
            raise

    def __blh2ecef(self, lat, lon, ht):
        """ BLH -> ECEF 変換

        :param  float lat: Latitude
        :param  float lon: Longitude
        :param  float  ht: Height
        :return list     : ECEF 座標 [x, y, z]
        """
        try:
            n = lambda x: self.A / \
                math.sqrt(1.0 - self.E2 * math.sin(x * self.PI_180)**2)
            x = (n(lat) + ht) \
              * math.cos(lat * self.PI_180) \
              * math.cos(lon * self.PI_180)
            y = (n(lat) + ht) \
              * math.cos(lat * self.PI_180) \
              * math.sin(lon * self.PI_180)
            z = (n(lat) * (1.0 - self.E2) + ht) \
              * math.sin(lat * self.PI_180)
            return [x, y, z]
        except Exception as e:
            raise

    def __mat_x(self, ang):
        """ x 軸を軸とした回転行列

        :param  float ang: 回転量(°)
        :return list     : 回転行列(3x3)
        """
        try:
            a = ang * self.PI_180
            c = math.cos(a)
            s = math.sin(a)
            return [
                [1.0, 0.0, 0.0],
                [0.0,   c,   s],
                [0.0,  -s,   c]
            ]
        except Exception as e:
            raise

    def __mat_y(self, ang):
        """ y 軸を軸とした回転行列

        :param  float ang: 回転量(°)
        :return list     : 回転行列(3x3)
        """
        try:
            a = ang * self.PI_180
            c = math.cos(a)
            s = math.sin(a)
            return [
                [   c, 0.0,  -s],
                [ 0.0, 1.0, 0.0],
                [   s, 0.0,   c]
            ]
        except Exception as e:
            raise

    def __mat_z(self, ang):
        """ z 軸を軸とした回転行列

        :param  float ang: 回転量(°)
        :return list     : 回転行列(3x3)
        """
        try:
            a = ang * self.PI_180
            c = math.cos(a)
            s = math.sin(a)
            return [
                [  c,   s, 0.0],
                [ -s,   c, 0.0],
                [0.0, 0.0, 1.0]
            ]
        except Exception as e:
            raise

    def __mul_mat(self, mat_a, mat_b):
        """ 2行列(3x3)の積

        :param  list mat_a: 3x3 行列
        :param  list mat_b: 3x3 行列
        :return list      : 3x3 行列
        """
        try:
            return [
                [sum([mat_a[k][i] * mat_b[i][j] for i in range(3)
                ]) for j in range(3)] for k in range(3)
            ]
        except Exception as e:
            raise

    def __rotate(self, mat, pt):
        """ 点の回転

        :param  list mat: 3x3 回転行列
        :param  list  pt: 回転前座標 [x, y, z]
        :return list    : 回転後座標 [x, y, z]
        """
        try:
            return [
                sum([mat[j][i] * pt[i] for i in range(3)])
                for j in range(3)
            ]
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = BlhToEnu()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to convert WGS84(BLH) to ENU coordinate.](https://gist.github.com/komasaru/6ce0634475923ddac597f868288c54e9 "Gist - Python script to convert WGS84(BLH) to ENU coordinate.")

### 2. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x blh2enu.py
```

そして、コマンドライン引数に原点と対象の緯度、経度、楕円体高を指定して実行する。

次は、[参考文献](https://www.enri.go.jp/~fks442/K_MUSEN/1st/1st060428rev2.pdf "理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf")内の実行例（仙台空の滑走路の長さ）と同じパラメータで実行。

``` text
$ ./blh2enu.py 38.13877338 140.89872429 44.512 38.14227288 140.93265738 45.664
BLH_O: BETA =  38.13877338°
     LAMBDA = 140.89872429°
     HEIGHT =  44.512m
BLH:   BETA =  38.14227288°
     LAMBDA = 140.93265738°
     HEIGHT =  45.664m
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
$ ./blh2enu.py 35.472222 133.050556 0 35.468056 133.048611 0
BLH_O: BETA =  35.47222200°
     LAMBDA = 133.05055600°
     HEIGHT =   0.000m
BLH:   BETA =  35.46805600°
     LAMBDA = 133.04861100°
     HEIGHT =   0.000m
--->
ENU: E =     -176.539m
     N =     -462.213m
     U =       -0.019m
方位角 =      200.904°
  仰角 =       -0.002°
  距離 =      494.779m
```

* U 値や仰角が負の値になっているのは、地球が球体であるため。誤りではない。
* 概ね、島根県本庁舎から西に 176.539m, 南に 462.213m の所に松江市本庁舎が位置しているということ。

### 3. 参考文献

* [理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf](https://www.enri.go.jp/~fks442/K_MUSEN/1st/1st060428rev2.pdf "理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf")

※上記の参考文献のソースコード内、方位角の計算に誤りがあるので、注意。

---

人工衛星の正確な軌道計算等に利用できるでしょう。

以上。

