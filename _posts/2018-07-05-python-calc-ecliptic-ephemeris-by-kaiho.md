---
layout   : single
title    : "Python - 太陽・月の視黄経・視黄緯等の計算（海保略算式版）！"
published: true
date     : 2018-07-05 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Python
---

前回、 Python で、海上保安庁・海洋情報部の「[コンピュータによる天体の位置計算式](http://www1.kaiho.mlit.go.jp/KOHO/ "コンピュータによる天体の位置計算式")」を利用して、太陽や月の視赤経や視赤緯等を計算してみました。

* [Python - 太陽・月の視赤経・視赤緯等の計算（海保略算式版）！]({{site.baseurl}}/2018/07/02/python-calc-ephemeris-by-kaiho "Python - 太陽・月の視赤経・視赤緯の計算（海保略算式版）！")

今回は、太陽・月の視赤経・視赤緯を視黄経・視黄緯に変換してみました。

<!--more-->

### 0. 前提条件

* Python 3.6.4 での作業を想定。

### 1. 計算方法

* 視黄経・視黄緯の変換以外の部分は、「[Ruby - 太陽・月の視赤経・視赤緯等の計算（海保略算式版）！]({{site.baseurl}}/2016/05/04/ruby-calc-ephemeris-by-kaiho "Ruby - 太陽・月の視赤経・視赤緯等の計算（海保略算式版）！")」のままなので、そちらを参照のこと。
* 赤経・赤緯から黄経・黄緯への変換については、過去記事の「[赤道座標と黄道座標、直交座標と極座標の変換！]({{site.baseurl}}/2016/05/08/convert-celestial-coordinates "赤道座標と黄道座標、直交座標と極座標の変換！")」を参照のこと。

### 2. Python スクリプトの作成

（プログラム中、 `R.A.` は「視赤経」、 `DEC.` は「視赤緯」、 `DIST.` は「地心距離」、 `H.P.` は「視差」、 `hG.` は「グリニジ時角」、 `S.D.` は「視半径」、 `EPS.` は「黄道傾斜角」、 `ALPHA` は「視赤経」、 `DELTA` は「視赤緯」、 `LAMBDA` は「視黄経」、 `BETA` は「視黄緯」という意味で使用している）

File: `eph_sun_moon_ecliptic.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
----------------------------------------------------
海上保安庁の天測暦より太陽・月の視位置を計算
（視黄経・視黄緯の計算を追加したもの）

  date          name            version
  2018.03.30    mk-mode.com     1.00 新規作成

  Copyright(C) 2018 mk-mode.com All Rights Reserved.
----------------------------------------------------
 引数 : JST（日本標準時）
          書式：YYYYMMDD or YYYYMMDDHHMMSS
          無指定なら現在(システム日時)と判断。
----------------------------------------------------
"""
import datetime
import math
import re
import sys
import traceback
import consts as cst


class EphSunMoon:
    JST_UTC = 9  # JST - UTC
    MSG_ERR_1 = "[ERROR] Format: YYYYMMDD or YYYYMMDDHHMMSS"
    MSG_ERR_2 = "[ERROR] It should be between 20080101090000 and 20190101085959."
    MSG_ERR_3 = "[ERROR] Invalid date!"
    DIVS = {
        "SUN_RA":   cst.SUN_RA,
        "SUN_DEC":  cst.SUN_DEC,
        "SUN_DIST": cst.SUN_DIST,
        "MOON_RA":  cst.MOON_RA,
        "MOON_DEC": cst.MOON_DEC,
        "MOON_HP":  cst.MOON_HP,
        "R":        cst.R,
        "EPS":      cst.EPS
    }
    DELTA_T = {
        2008: 65, 2009: 66, 2010: 66, 2011: 67, 2012: 67, 2013: 67,
        2014: 67, 2015: 68, 2016: 68, 2017: 68, 2018: 69
    }

    def __init__(self):
        self.vals = {}    # 所要値格納用dict
        self.__get_arg()  # 引数取得

    def exec(self):
        """ 実行 """
        try:
            self.__calc_t()       # 通日 T の計算
            self.__calc_f()       # 世界時 UT(時・分・秒) の端数計算
            self.__get_delta_t()  # ΔT（世界時 - 地球時）の取得
            self.__calc_tm()      # 計算用時刻引数 tm の計算
            self.__calc()         # 各種計算
            self.__display()      # 結果出力
        except Exception as e:
            raise

    def __get_arg(self):
        """ 引数取得
            * コマンドライン引数を取得して日時の妥当性チェックを行う。
            * コマンドライン引数無指定なら、現在日時とする。
            * JST, UTC をインスタンス変数 jst, utc に格納する。
        """
        try:
            if len(sys.argv) < 2:
                self.jst = datetime.datetime.now()
            else:
                arg = sys.argv[1]
                if re.search(r"^([0-9]{8}|[0-9]{14})$", arg) is None:
                    print(self.MSG_ERR_1)
                    sys.exit()
                arg = arg.ljust(14, "0")
                try:
                    self.jst = datetime.datetime.strptime(arg, "%Y%m%d%H%M%S")
                except ValueError:
                    print(self.MSG_ERR_3)
                    sys.exit(1)
            self.utc = self.jst - datetime.timedelta(hours=self.JST_UTC)
        except Exception as e:
            raise

    def __calc_t(self):
        """ 通日 T の計算
            * 通日 T は1月0日を第0日とした通算日数で、次式により求める。
                T = 30 * P + Q * (S - Y) + P * (1 - Q) + 日
              但し、
                P = 月 - 1, Q = [(月 + 7) / 10]
                Y = [(年 / 4) - [(年 / 4)] + 0.77]
                S = [P * 0.55 - 0.33]
              で、[] は整数部のみを抜き出すことを意味する。
            * 求めた通日 T はインスタンス変数 t に格納する。
        """
        try:
            p = self.utc.month - 1
            q = (self.utc.month + 7) // 10
            y = int(self.utc.year / 4 - self.utc.year // 4 + 0.77)
            s = int(p * 0.55 - 0.33)
            self.t = 30 * p + q * (s - y) + p * (1 - q) + self.utc.day
        except Exception as e:
            raise

    def __calc_f(self):
        """ 世界時 UT(時・分・秒) の端数計算
            * 次式により求め、インスタンス変数 f に格納する。
                F = 時 / 24 + 分 / 1440 + 秒 / 86400
        """
        try:
            self.f = self.utc.hour / 24 \
                   + self.utc.minute / 1440 \
                   + self.utc.second / 86400
        except Exception as e:
            raise

    def __get_delta_t(self):
        """ ΔT（世界時 - 地球時）の取得
            * あらかじめ予測されている ΔT の値を取得し、インスタンス変数 delta_t
              に格納する。
        """
        try:
            self.delta_t = self.DELTA_T[self.utc.year]
        except Exception as e:
            raise

    def __calc_tm(self):
        """ 計算用時刻引数 tm の計算
            * 次式により求め、インスタンス変数 tm, tm_r に格納する。
              (R 計算用は tm_r, その他は tm)
                tm   = T + F + ΔT / 86400
                tm_r = T + F
        """
        try:
            self.tm_r = self.t + self.f
            self.tm   = self.tm_r + self.delta_t / 86400
        except Exception as e:
            raise

    def __calc(self):
        """ 各種計算
            * 各種値を計算し、インスタンス変数 vals に格納する。
        """
        try:
            # 各種係数からの計算
            for div, vals in self.DIVS.items():
                a, b, coeffs = self.__get_coeffs(vals)    # 係数値等の取得
                t = self.tm_r if div == "R" else self.tm  # 計算用時刻引数
                theta = self.__calc_theta(a, b, t)        # θ の計算
                val = self.__calc_ft(theta, coeffs)       # 所要値の計算
                if re.search(r"(_RA|^R)$", div) is not(None):
                    while val >= 24.0:
                        val -= 24.0
                    while val <= 0.0:
                        val += 24.0
                self.vals[div] = val
            # グリニジ時角の計算
            self.vals["SUN_H" ] = self.__calc_h(self.vals["SUN_RA" ])
            self.vals["MOON_H"] = self.__calc_h(self.vals["MOON_RA"])
            # 視半径の計算
            self.vals["SUN_SD" ] = self.__calc_sd_sun()
            self.vals["MOON_SD"] = self.__calc_sd_moon()
            # 視黄経・視黄緯の計算
            self.vals["SUN_LAMBDA"] = self.__calc_lambda(
                self.vals["SUN_RA"], self.vals["SUN_DEC"]
            )
            self.vals["SUN_BETA"] = self.__calc_beta(
                self.vals["SUN_RA"], self.vals["SUN_DEC"]
            )
            self.vals["MOON_LAMBDA"] = self.__calc_lambda(
                self.vals["MOON_RA"], self.vals["MOON_DEC"]
            )
            self.vals["MOON_BETA"] = self.__calc_beta(
                self.vals["MOON_RA"], self.vals["MOON_DEC"]
            )
            # 視黄経差（太陽 - 月）
            self.vals["LAMBDA_S_M"] = self.__calc_lambda_sun_moon()
        except Exception as e:
            raise

    def __get_coeffs(self, vals):
        """ 係数等の取得
            * 引数の文字列の定数配列から a, b, 係数配列を取得する。

        :param  list vals: 定数名
        :return list: [a, b, 係数配列]
        """
        a, b = 0, 0
        coeffs = []
        try:
            for row in vals:
                if row[0] != self.utc.year:
                    continue
                if row[1][0] <= int(self.tm) and int(self.tm) <= row[1][1]:
                    a, b   = row[1]
                    coeffs = row[2]
                    break
            return [a, b, coeffs]
        except Exception as e:
            raise

    def __calc_theta(self, a, b, t):
        """ θ の計算
            * θ を次式により計算する。
                θ = cos^(-1)((2 * t - (a + b)) / (b - a))
              但し、0°<= θ <= 180°

        :param  int   a
        :param  int   b
        :param  float t
        :return float theta: 単位: °
        """
        try:
            if b < t:  # 年末のΔT秒分も計算可能とするための応急処置
                b = t
            theta = (2 * t - (a + b)) / (b - a)
            theta = math.acos(theta) * 180 / math.pi
            return theta
        except Exception as e:
            raise

    def __calc_ft(self, theta, coeffs):
        """ 所要値の計算
            * θ, 係数配列から次式により所要値を計算する。
                f(t) = C_0 + C_1 * cos(θ) + C_2 * cos(2θ) + ... + C_N * cos(Nθ)

        :param  float theta: θ
        :param  list coeffs: 係数配列
        :return float    ft: 所要値
        """
        ft = 0.0
        try:
            for i, c in enumerate(coeffs):
                ft += c * math.cos(theta * i * math.pi / 180)
            return ft
        except Exception as e:
            raise

    def __calc_h(self, ra):
        """ グリニジ時角の計算
            * 次式によりグリニジ時角を計算する。
                h = E + UT
              (但し、E = R - R.A.)

        :param  float ra: R.A.
        :return float  h: 単位 h
        """
        try:
            e = self.vals["R"] - ra
            h = e + self.f * 24
            return h
        except Exception as e:
            raise

    def __calc_sd_sun(self):
        """ 視半径（太陽）の計算
            * 次式により視半径を計算する。
                S.D.= 16.02 ′/ Dist.

        :return float sd: 単位 ′
        """
        try:
            sd = 16.02 / self.vals["SUN_DIST"]
            return sd
        except Exception as e:
            raise

    def __calc_sd_moon(self):
        """ 視半径（月）の計算
            * 次式により視半径を計算する。
                S.D.= sin^(-1) (0.2725 * sin(H.P.))

        :return float sd: 単位 ′
        """
        try:
            sd = 0.2725 * math.sin(self.vals["MOON_HP"] * math.pi / 180.0)
            sd = math.asin(sd) * 60.0 * 180.0 / math.pi
            return sd
        except Exception as e:
            raise

    def __calc_lambda(self, alpha, delta):
        """ 視黄経の計算
            * 次式により視黄経を計算する
                λ = arctan(sinδ sinε + cosδ sinα cosε / cosδ cosα)
              (α: 視赤経、δ: 視赤緯、 ε: 黄道傾斜角)

        :param  float alpha: 視赤経, RA
        :param  float delta: 視赤緯, DEC
        :return float    lm: 視黄経
        """
        try:
            alpha = alpha * 15 * math.pi / 180
            delta = delta * math.pi / 180
            eps = self.vals["EPS"] * math.pi / 180
            lm_a  = math.sin(delta) * math.sin(eps)
            lm_a += math.cos(delta) * math.sin(alpha) * math.cos(eps)
            lm_b  = math.cos(delta) * math.cos(alpha)
            lm  = math.atan2(lm_a, lm_b) * 180 / math.pi
            if lm < 0:
                lm += 180
            return lm
        except Exception as e:
            raise

    def __calc_beta(self, alpha, delta):
        """ 視黄緯の計算
            * 次式により視黄経を計算する
                β  = arcsin(sinδ cosε − cosδ sinα sinε)
              (α: 視赤経、δ: 視赤緯、 ε: 黄道傾斜角)

        :param  float alpha: 視赤経, RA
        :param  float delta: 視赤緯, DEC
        :return float    bt: 視黄緯
        """
        try:
            alpha = alpha * 15 * math.pi / 180
            delta = delta * math.pi / 180
            eps = self.vals["EPS"] * math.pi / 180
            bt  = math.sin(delta) * math.cos(eps)
            bt -= math.cos(delta) * math.sin(alpha) * math.sin(eps)
            bt  = math.asin(bt) * 180 / math.pi
            return bt
        except Exception as e:
            raise

    def __calc_lambda_sun_moon(self):
        """ 視黄経差（太陽 - 月）の計算
            * SUN_LAMBDA - MOON_LAMBDA

        :return float: 視黄経差（太陽 - 月）
        """
        try:
            return self.vals["SUN_LAMBDA"] - self.vals["MOON_LAMBDA"]
        except Exception as e:
            raise

    def __display(self):
        """ 結果出力 """
        try:
            s  = (
                "[ JST: {},  UTC: {} ]\n"
                "  SUN  R.A. = {:12.8f} h  (= {:s})\n"
                "  SUN  DEC. = {:12.8f} °  (= {:s})\n"
                "  SUN DIST. = {:12.8f} AU\n"
                "  SUN   hG. = {:12.8f} h  (= {:s})\n"
                "  SUN  S.D. = {:12.8f} ′  (= {:s})\n"
                "  MOON R.A. = {:12.8f} h  (= {:s})\n"
                "  MOON DEC. = {:12.8f} °  (= {:s})\n"
                "  MOON H.P. = {:12.8f} °  (= {:s})\n"
                "  MOON  hG. = {:12.8f} h  (= {:s})\n"
                "  MOON S.D. = {:12.8f} ′  (= {:s})\n"
                "         R  = {:12.8f} h  (= {:s})\n"
                "       EPS. = {:12.8f} °  (= {:s})\n"
                "  ---\n"
                "  SUN  LAMBDA ={:13.8f} °  (={:s})\n"
                "  SUN    BETA ={:13.8f} °  (={:s})\n"
                "  MOON LAMBDA ={:13.8f} °  (={:s})\n"
                "  MOON   BETA ={:13.8f} °  (={:s})\n"
                "  DIFF LAMBDA ={:13.8f} °"
            ).format(
                self.jst.strftime("%Y-%m-%d %H:%M:%S"),
                self.utc.strftime("%Y-%m-%d %H:%M:%S"),
                self.vals["SUN_RA"],
                self.__hour2hms(self.vals["SUN_RA"]),
                self.vals["SUN_DEC"],
                self.__deg2dms(self.vals["SUN_DEC"]),
                self.vals["SUN_DIST"],
                self.vals["SUN_H"],
                self.__hour2hms(self.vals["SUN_H"]),
                self.vals["SUN_SD"],
                self.__deg2dms(self.vals["SUN_SD"] / 60),
                self.vals["MOON_RA"],
                self.__hour2hms(self.vals["MOON_RA"]),
                self.vals["MOON_DEC"],
                self.__deg2dms(self.vals["MOON_DEC"]),
                self.vals["MOON_HP"],
                self.__deg2dms(self.vals["MOON_HP"]),
                self.vals["MOON_H"],
                self.__hour2hms(self.vals["MOON_H"]),
                self.vals["MOON_SD"],
                self.__deg2dms(self.vals["MOON_SD"] / 60),
                self.vals["R"],
                self.__hour2hms(self.vals["R"]),
                self.vals["EPS"],
                self.__deg2dms(self.vals["EPS"]),
                self.vals["SUN_LAMBDA"],
                self.__deg2dms(self.vals["SUN_LAMBDA"]),
                self.vals["SUN_BETA"],
                self.__deg2dms(self.vals["SUN_BETA"]),
                self.vals["MOON_LAMBDA"],
                self.__deg2dms(self.vals["MOON_LAMBDA"]),
                self.vals["MOON_BETA"],
                self.__deg2dms(self.vals["MOON_BETA"]),
                self.vals["LAMBDA_S_M"]
            )
            print(s)
        except Exception as e:
            raise

    def __hour2hms(self, hour):
        """ 99.999h -> 99h99m99s 変換

        :param  float hour
        :return string: 99 h 99 m 99.999 s
        """
        try:
            h   = int(hour)
            h_r = hour - h
            m   = int(h_r * 60)
            m_r = h_r * 60 - m
            s   = m_r * 60
            return " {:02d} h {:02d} m {:06.3f} s".format(h, m, s)
        except Exception as e:
            raise

    def __deg2dms(self, deg):
        """ 99.999° -> 99°99′99″ 変換

        :param  float deg
        :return string: 99 ° 99 ′ 99.999 ″
        """
        try:
            pm  = "-" if deg < 0 else " "
            if deg < 0:
                deg *= -1
            d   = int(deg)
            d_r = deg - d
            m   = int(d_r * 60)
            m_r = d_r * 60 - m
            s   = m_r * 60
            return "{:3s} ° {:02d} ′ {:06.3f} ″".format(pm + str(d), m, s)
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = EphSunMoon()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [GitHub - komasaru/CalendarPy/ephemeris_jcg_i](https://github.com/komasaru/CalendarPy/tree/master/ephemeris_jcg_i "GitHub - komasaru/CalendarPy/ephemeris_jcg_i")

（上記スクリプト内で import している "consts.py" も同梱）

### 3. Ruby スクリプトの実行

``` text
$ ./eph_sun_moon_ecliptic.py 20180504152437
[ JST: 2018-05-04 15:24:37,  UTC: 2018-05-04 06:24:37 ]
  SUN  R.A. =   2.75277777 h  (=  02 h 45 m 10.000 s)
  SUN  DEC. =  15.96284158 °  (=  15 ° 57 ′ 46.230 ″)
  SUN DIST. =   1.00824828 AU
  SUN   hG. =  18.46372880 h  (=  18 h 27 m 49.424 s)
  SUN  S.D. =  15.88894355 ′  (=  0  ° 15 ′ 53.337 ″)
  MOON R.A. =  18.15278576 h  (=  18 h 09 m 10.029 s)
  MOON DEC. = -20.34141810 °  (= -20 ° 20 ′ 29.105 ″)
  MOON H.P. =   0.90747015 °  (=  0  ° 54 ′ 26.893 ″)
  MOON  hG. =   3.06372080 h  (=  03 h 03 m 49.395 s)
  MOON S.D. =  14.83656276 ′  (=  0  ° 14 ′ 50.194 ″)
         R  =  14.80622878 h  (=  14 h 48 m 22.424 s)
       EPS. =  23.43526871 °  (=  23 ° 26 ′ 06.967 ″)
  ---
  SUN  LAMBDA =  43.74801937 °  (= 43 ° 44 ′ 52.870 ″)
  SUN    BETA =   0.00001629 °  (= 0  ° 00 ′ 00.059 ″)
  MOON LAMBDA = 272.15189981 °  (= 272 ° 09 ′ 06.839 ″)
  MOON   BETA =   3.07673578 °  (= 3  ° 04 ′ 36.249 ″)
  DIFF LAMBDA =-228.40388044 °
```

### 4. データの検証

国立天文台のツール等で計算した値と比較してみたが、かなりの精度で一致することが確認できた。

* [太陽の地心座標](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/sun.cgi "太陽の地心座標")
* [月の地心座標](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/moon.cgi "月の地心座標")

### 5. 参考サイト

* [天文・暦情報](http://www1.kaiho.mlit.go.jp/KOHO/ "天文・暦情報")

---

以上。

