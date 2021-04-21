---
layout   : single
title    : "Python - ECEF 座標 -> WGS84 (BLH) 座標 変換！"
published: true
date     : 2018-09-05 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Python
---

先日、 WGS84(World Geodetic System 1984) 測地系の緯度(Beta)／経度(Lambda)／楕円体高(Height)を ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標に変換する方法を Python で実装しました。

* [Python - WGS84 (BLH) 座標 -> ECEF 座標 変換！]({{site.baseurl}}/2018/09/02/python-convert-blh-to-ecef "Python - WGS84 (BLH) 座標 -> ECEF 座標 変換！")

今回は、逆に、 ECEF 座標を WGS84 の緯度(Beta)／経度(Lambda)／楕円体高(Height)に変換する方法を Python で実装してみました。

<!--more-->

### 0. 前提条件

* Python 3.6.5 での動作を想定。
* ここでは、 WGS84(World Geodetic System 1984) 測地系や ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）の詳細についての説明はしない。

### 1. Python スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `ecef2blh.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
ECEF -> BLH 変換
: ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標を
  WGS84 の緯度(Latitude)／経度(Longitude)／楕円体高(Height)に変換する。

  Date          Author          Version
  2018.06.28    mk-mode.com     1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
---
引数: X Y Z
"""
import math
import sys
import traceback


class EcefToBlh:
    USAGE = "[USAGE] ./ecef2blh.py X Y Z"
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
            if len(sys.argv) < 4:
                print(self.USAGE)
                sys.exit(0)
            self.x, self.y, self.z = \
                map(lambda x: float(x), sys.argv[1:4])
        except Exception as e:
            raise

    def exec(self):
        """ Execution """
        try:
            print((
                "ECEF: X = {:12.3f}m\n"
                "      Y = {:12.3f}m\n"
                "      Z = {:12.3f}m"
            ).format(self.x, self.y, self.z))
            lat, lon, ht = self.__ecef2blh(self.x, self.y, self.z)
            print("--->")
            print((
                "BLH: LATITUDE(BETA) = {:12.8f}°\n"
                "  LONGITUDE(LAMBDA) = {:12.8f}°\n"
                "             HEIGHT = {:7.3f}m"
            ).format(lat, lon, ht))
        except Exception as e:
            raise

    def __ecef2blh(self, x, y, z):
        """ ECEF -> BLH  変換

        :param  float lat: X
        :param  float lon: Y
        :param  float  ht: Z
        :return list  blh: BLH Coordinate [latitude, longitude, height]
        """
        try:
            n = lambda x: self.A / \
                math.sqrt(1.0 - self.E2 * math.sin(x * self.PI_180)**2)
            p = math.sqrt(x * x + y * y)
            theta = math.atan2(z * self.A, p * self.B) / self.PI_180
            lat = math.atan2(
                z + self.ED2 * self.B * math.sin(theta * self.PI_180)**3,
                p - self.E2 * self.A * math.cos(theta * self.PI_180)**3
            ) / self.PI_180
            lon = math.atan2(y, x) / self.PI_180
            ht = (p / math.cos(lat * self.PI_180)) - n(lat)
            return [lat, lon, ht]
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = EcefToBlh()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to convert ECEF  to WGS84(BLH) coordinate.](https://gist.github.com/komasaru/35b905306d9b00f5d978a2682f5a23fe "Gist - Python script to convert ECEF to WGS84(BLH) coordinate.")

### 2. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x ecef2blh.py
```

そして、コマンドライン引数に ECEF 座標 X, Y, Z を指定して実行する。

``` text
$ ./ecef2blh.py -3899086.094 3166914.545 3917336.601
ECEF: X = -3899086.094m
      Y =  3166914.545m
      Z =  3917336.601m
--->
BLH: LATITUDE(BETA) =  38.13579617°
  LONGITUDE(LAMBDA) = 140.91581617°
             HEIGHT =  41.940m
```

### 3. 参考文献

* [理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf](https://www.enri.go.jp/~fks442/K_MUSEN/1st/1st060428rev2.pdf "理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf")

---

人工衛星の正確な軌道計算等に利用できるでしょう。

以上。

