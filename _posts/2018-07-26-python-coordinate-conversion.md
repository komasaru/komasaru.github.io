---
layout   : single
title    : "Python - 赤道・黄道座標の変換！"
published: true
date     : 2018-07-26 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Python
---

以前、赤道直交座標と黄道直交座標を相互に変換したり、直交座標と極座標を相互に変換したりする RubyGems ライブラリを作成しました。

* [Ruby - 赤道・黄道座標の変換（by 自作 gem ライブラリ）！]({{site.baseurl}}/2016/09/24/ruby-coordinate-conversion-by-my-gem "Ruby - 赤道・黄道座標の変換（by 自作 gem ライブラリ）！")

今回は、同様のことを Python で行ってみました。（但し、PyPI ライブラリではない）

<!--more-->

### 0. 前提条件

* Python 3.6.5 での作業を想定。
* 天文学的な計算については疎いため、誤りがあるかもしれない。

### 1. アルゴリズムについて

過去記事を参照。

* [赤道座標と黄道座標、直交座標と極座標の変換！]({{site.baseurl}}/2016/05/08/convert-celestial-coordinates "赤道座標と黄道座標、直交座標と極座標の変換！")

### 2. Python スクリプトの作成

* ライブラリ内で NumPy の matrix を使用。

次のスクリプトは実行部分。

File: `conv_coord.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
赤道・黄道座標変換

  date          name            version
  2018.04.27    mk-mode         1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
"""
import math
import sys
import traceback
from lib import coord as lcd


class ConvCoord:
    # 黄道傾斜角(単位: rad)
    EPS = 23.43929 * math.pi / 180
    # 元の赤道直交座標
    # (ある日の地球重心から見た太陽重心の位置(単位: AU))
    POS = [ 0.99443659220700997281, -0.03816291768957833647, -0.01655177670960058384]

    def exec(self):
        try:
            self.rect_ec = lcd.rect_eq2ec(self.POS, self.EPS)
            self.rect_eq = lcd.rect_ec2eq(self.rect_ec, self.EPS)
            self.pol_eq, self.r = lcd.rect2pol(self.rect_eq)
            self.pol_ec = lcd.pol_eq2ec(self.pol_eq, self.EPS)
            self.pol_eq = lcd.pol_ec2eq(self.pol_ec, self.EPS)
            self.rect_eq_2 = lcd.pol2rect(self.pol_eq, self.r)
            self.__display()
        except Exception as e:
            raise

    def __display(self):
        """ 結果出力 """
        try:
            pass
            print((
                "元の赤道直交座標:\n  {}\n"
                "黄道直交座標に変換:\n  {}\n"
                "赤道直交座標に戻す:\n  {}\n"
                "赤道極座標に変換:\n  {} (R = {})\n"
                "黄道極座標に変換:\n  {}\n"
                "赤道極座標に戻す:\n  {}\n"
                "赤道直交座標に戻す:\n  {}"
            ).format(
                self.POS,
                self.rect_ec,
                self.rect_eq,
                self.pol_eq, self.r,
                self.pol_ec,
                self.pol_eq,
                self.rect_eq_2
            ))
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = ConvCoord()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

次の3つのスクリプトはライブラリ部分。（lib ディレクトリを作成後、その配下へ）

File: `lib/coord.py`

{% highlight python linenos %}
"""
Modules for coordinates
"""
import math
import numpy as np
import sys
from lib import matrix        as lmtx
from lib import trigonometric as ltrg


def rect_eq2ec(rect, eps):
    """ 直交座標：赤道座標 -> 黄道座標.

    :param  list rect: 赤道直交座標
    :param  float eps: 黄道傾斜角 (Unit: rad)
    :return list     : 黄道直交座標
    """
    try:
        mtx_rect = np.matrix([rect]).transpose()
        r_mtx = lmtx.r_x(eps)
        return lmtx.rotate(r_mtx, mtx_rect).A1.tolist()
    except Exception as e:
        raise

def rect_ec2eq(rect, eps):
    """ 直交座標：黄道座標 -> 赤道座標.

    :param  list rect: 黄道直交座標
    :param  float eps: 黄道傾斜角 (Unit: rad)
    :return list     : 赤道直交座標
    """
    try:
        mtx_rect = np.matrix([rect]).transpose()
        r_mtx = lmtx.r_x(-eps)
        return lmtx.rotate(r_mtx, mtx_rect).A1.tolist()
    except Exception as e:
        raise

def pol_eq2ec(pol, eps):
    """ 極座標：赤道座標 -> 黄道座標.

    :param  list  pol: 赤道極座標
    :param  float eps: 黄道傾斜角 (Unit: rad)
    :return list     : 黄道極座標 [λ, β]
    """
    try:
        alp, dlt = pol
        lmd = ltrg.comp_lambda(alp, dlt, eps)
        bet = ltrg.comp_beta(alp, dlt, eps)
        return [lmd, bet]
    except Exception as e:
        raise

def pol_ec2eq(pol, eps):
    """ 極座標：赤道座標 -> 黄道座標.

    :param  list  pol: 赤道極座標
    :param  float eps: 黄道傾斜角 (Unit: rad)
    :return list     : 黄道極座標 [α, δ]
    """
    try:
        lmd, bet = pol
        alp = ltrg.comp_alpha(lmd, bet, eps)
        dlt = ltrg.comp_delta(lmd, bet, eps)
        return [alp, dlt]
    except Exception as e:
        raise

def rect2pol(rect):
    """ 直交座標 -> 極座標

    :param  list rect: 直交座標
    :return list     : 極座標 [[λ, φ], 距離]
    """
    try:
        x, y, z = rect
        r = math.sqrt(x * x + y * y)
        lmd = math.atan2(y, x)
        phi = math.atan2(z, r)
        if lmd < 0:
            lmd %= math.pi * 2
        d = math.sqrt(x * x + y * y + z * z)
        return [[lmd, phi], d]
    except Exception as e:
        raise

def pol2rect(pol, r):
    """ 極座標 -> 直交座標

    :param  list pol: 極座標
    :return list    : 直交座標
    """
    try:
        lmd, phi = pol
        r_mtx = lmtx.r_y(phi)
        r_mtx = lmtx.r_z(-lmd, r_mtx)
        return lmtx.rotate(
            r_mtx, np.matrix([[r], [0.0], [0.0]])
        ).A1.tolist()
    except Exception as e:
        raise
{% endhighlight %}

File: `lib/matrix.py`

{% highlight python linenos %}
"""
Modules for matrixes
"""
import numpy as np


R_UNIT = np.eye(3, dtype="float64")


def r_x(phi, r_src=R_UNIT):
    """ 回転行列生成(x軸中心)
          ( 1      0          0     )
          ( 0  +cos(phi)  +sin(phi) )
          ( 0  -sin(phi)  +cos(phi) )

    :param  np.matrix r_src: Rotation matrix
    :param  float       phi: Angle (Unit: rad)
    :return np.matrix r_dst: Rotated matrix
    """
    try:
        s, c = np.sin(phi), np.cos(phi)
        r_mx = np.matrix([
            [1,  0, 0],
            [0,  c, s],
            [0, -s, c]
        ], dtype="float64")
        return r_mx * r_src
    except Exception as e:
        raise

def r_y(theta, r_src=R_UNIT):
    """ 回転行列生成(y軸中心)
          ( +cos(theta)  0  -sin(theta) )
          (     0        1      0       )
          ( +sin(theta)  0  +cos(theta) )

    :param  np.matrix r_src: Rotation matrix
    :param  float     theta: Angle (Unit: rad)
    :return np.matrix r_dst: Rotated matrix
    """
    try:
        s, c = np.sin(theta), np.cos(theta)
        r_mx = np.matrix([
            [c, 0, -s],
            [0, 1,  0],
            [s, 0,  c]
        ], dtype="float64")
        return r_mx * r_src
    except Exception as e:
        raise

def r_z(psi, r_src=R_UNIT):
    """ 回転行列生成(z軸中心)
          ( +cos(psi)  +sin(psi)  0 )
          ( -sin(psi)  +cos(psi)  0 )
          (     0          0      1 )

    :param  np.matrix r_src: Rotation matrix
    :param  float       psi: Angle (Unit: rad)
    :return np.matrix r_dst: Rotated matrix
    """
    try:
        s, c = np.sin(psi), np.cos(psi)
        r_mx = np.matrix([
            [ c, s, 0],
            [-s, c, 0],
            [ 0, 0, 1]
        ], dtype="float64")
        return r_mx * r_src
    except Exception as e:
        raise

def rotate(r, pos):
    """ 座標回転

    :param  np.matrix r    : 回転行列
    :param  np.matrix pos  : 回転前直交座標
    :return np.matrix pos_r: 回転後直交座標
    """
    try:
        return r * pos
    except Exception as e:
        raise
{% endhighlight %}

File: `lib/trigonometric.py`

{% highlight python linenos %}
"""
Modules for trigonometrics
"""
import math
import numpy as np


def comp_lambda(alp, dlt, eps):
    """ λ の計算
        * λ = arctan((sinδ sinε + cosδ sinα cosε ) / cosδ cosα)

    :param  float alp: α (Unit: rad)
    :param  float dlt: δ (Unit: rad)
    :param  float eps: ε (Unit: rad)
    :return float lmd: λ (Unit: rad)
    """
    try:
        a = math.sin(dlt) * math.sin(eps) \
          + math.cos(dlt) * math.sin(alp) * math.cos(eps)
        b = math.cos(dlt) * math.cos(alp)
        lmd = math.atan2(a, b)
        if lmd < 0:
            lmd %= math.pi * 2
        return lmd
    except Exception as e:
        raise

def comp_beta(alp, dlt, eps):
    """ β の計算
        * β = arcsisn((sinδ cosε - cosδ sinα sinε)

    :param  float alp: α (unit: rad)
    :param  float dlt: δ (unit: rad)
    :param  float eps: ε (unit: rad)
    :return float bet: β (unit: rad)
    """
    try:
        a = math.sin(dlt) * math.cos(eps) \
          - math.cos(dlt) * math.sin(alp) * math.sin(eps)
        return math.asin(a)
    except Exception as e:
        raise

def comp_alpha(lmd, bet, eps):
    """ α の計算
        * α = arctan((-sinβ sinε + cosβ sinλ cosε ) / cosβ cosλ)

    :param  float lmd: λ (unit: rad)
    :param  float bet: β (unit: rad)
    :param  float eps: ε (unit: rad)
    :return float alp: α (unit: rad)
    """
    try:
        a = -math.sin(bet) * math.sin(eps) \
          +  math.cos(bet) * math.sin(lmd) * math.cos(eps)
        b =  math.cos(bet) * math.cos(lmd)
        alp = math.atan2(a, b)
        if a < 0:
            alp %= math.pi * 2
        return alp
    except Exception as e:
        raise

def comp_delta(lmd, bet, eps):
    """ δ の計算
        * δ = arcsisn((sinβ cosε + cosβ sinλ sinε)

    :param  float lmd: λ (unit: rad)
    :param  float bet: β (unit: rad)
    :param  float eps: ε (unit: rad)
    :return float dlt: δ (unit: rad)
    """
    try:
        a = math.sin(bet) * math.cos(eps) \
          + math.cos(bet) * math.sin(lmd) * math.sin(eps)
        return math.asin(a)
    except Exception as e:
        raise
{% endhighlight %}

* [Gist - Python script to convert coordinates.](https://gist.github.com/komasaru/b8fca575ddab23c56d94a9155446f7ea "Gist - Python script to convert coordinates.")

### 3. Python スクリプトの実行

* 黄道傾斜角εや元の赤道直交座標(3x1行列)は実行スクリプト内で指定する。

``` text
$ ./conv_coord.py
元の赤道直交座標:
  [0.99443659220701, -0.038162917689578336, -0.016551776709600584]
黄道直交座標に変換:
  [0.99443659220701, -0.04159771108146677, -5.622172494390565e-06]
赤道直交座標に戻す:
  [0.99443659220701, -0.038162917689578336, -0.016551776709600584]
赤道極座標に変換:
  [6.24482770879939, -0.01663059980037209] (R = 0.9953062370542631)
黄道極座標に変換:
  [6.241379248856413, -5.648686087788284e-06]
赤道極座標に戻す:
  [6.24482770879939, -0.01663059980037209]
赤道直交座標に戻す:
  [0.99443659220701, -0.03816291768957855, -0.01655177670960066]
```

---

これらの座標変換は、天体の各種計算でよく使用します。

以上。

