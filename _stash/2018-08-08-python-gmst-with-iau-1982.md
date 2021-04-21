---
layout   : single
title    : "Python - GMST（グリニッジ平均恒星時）の計算（IAU1982理論）！"
published: true
date     : 2018-08-08 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Python
---

前回、 Python でグリニッジ平均恒星時等(GMST; Greenwich Mean Sidereal Time)を IAU1982 理論（David Vallado 氏による計算式）を使用して計算しました。

* [Ruby - GMST（グリニッジ平均恒星時）の計算（IAU1982理論）！]({{site.baseurl}}/2018/08/05/ruby-gmst-with-iau-1982 "Ruby - GMST（グリニッジ平均恒星時）の計算（IAU1982理論）！")

今回は同じ計算を Python で実装してみました。

<!--more-->

### 0. 前提条件

* Python 3.6.5 での動作を想定。
* ここでは GMST についての説明はしない。
* 天文学的な計算については疎いため、誤りがあるかもしれない。

### 1. Python スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `calc_gmst_iau_82.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
グリニジ平均恒星時 GMST(= Greenwich Mean Sidereal Time)の計算
: IAU1982 版

  Date          Author          Version
  2016.06.15    mk-mode.com     1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
---
  引数 : 日時(UT1（世界時1）)
           書式：YYYYMMDD or YYYYMMDDHHMMSS
           無指定なら現在(システム日時)を UT1 とみなす。
"""
from datetime import datetime
import math
import re
import sys
import traceback


class GmstIau82:
    PI2 = math.pi * 2    # => 6.283185307179586
    D2R = math.pi / 180  # => 0.017453292519943295

    def __init__(self):
        self.__get_arg()

    def exec(self):
        try:
            print(self.ut1.strftime("%Y-%m-%d %H:%M:%S UT1"))
            jd_ut1 = self.__gc2jd(self.ut1)
            print("JD(UT1):", jd_ut1)
            gmst = self.__calc_gmst(jd_ut1)
            gmst_d = gmst * 180 / math.pi
            gmst_h = self.__deg2hms(gmst_d)
            print((
                "GMST = {} rad.\n"
                "     = {} deg.\n"
                "     = {}"
            ).format(
                gmst, gmst_d, gmst_h
            ))
        except Exception as e:
            raise

    def __get_arg(self):
        """ コマンドライン引数の取得
            * コマンドライン引数で指定した日時を self.ut1 に設定
            * コマンドライン引数が存在しなければ、現在時刻を self.ut1 に設定
        """
        try:
            if len(sys.argv) < 2:
                self.ut1 = datetime.now()
                return
            if re.search(r"^(\d{8}|\d{14})$", sys.argv[1]):
                dt = sys.argv[1].ljust(14, "0")
            else:
                sys.exit(0)
            try:
                self.ut1 = datetime.strptime(dt, "%Y%m%d%H%M%S")
            except ValueError as e:
                print("Invalid date!")
                sys.exit(0)
        except Exception as e:
            raise

    def __gc2jd(self, ut1):
        """ 年月日(グレゴリオ暦) -> ユリウス日(JD) 変換
            : フリーゲルの公式を使用
                JD = int(365.25 * year)
                   + int(year / 400)
                   - int(year / 100)
                   + int(30.59 * (month - 2))
                   + day
                   + 1721088
              ※上記の int(x) は厳密には、x を超えない最大の整数
                (ちなみに、準JDを求めるなら `+ 1721088` が `- 678912` となる)

        :param  datetime ut1: UT1（世界時1）
        :return float     jd: Julian Day
        """
        try:
            year, month, day     = ut1.year, ut1.month, ut1.day
            hour, minute, second = ut1.hour, ut1.minute, ut1.second
            # 1月,2月は前年の13月,14月とする
            if month < 3:
                year  -= 1
                month += 12
            # 日付(整数)部分計算
            jd  = int(365.25 * year) \
                + year // 400 \
                - year // 100 \
                + int(30.59 * (month - 2)) \
                + day \
                + 1721088.5
            # 時間(小数)部分計算
            t  = (second / 3600 \
               + minute / 60 \
               + hour) / 24.0
            return jd + t
        except Exception as e:
            raise

    def __calc_gmst(self, jd_ut1):
        """ GMST（グリニッジ平均恒星時）計算
            : IAU1982理論(by David Vallado)によるもの
                GMST = 18h 41m 50.54841s
                     + 8640184.812866s T + 0.093104s T^2 - 0.0000062s T^3 
                (但し、 T = 2000年1月1日12時(UT1)からのユリウス世紀単位)

        :param  float  jd_ut1: UT1 に対するユリウス日
        :return datetime gmst: グリニッジ平均恒星時(単位:radian)
        """
        try:
            t_ut1= (jd_ut1 - 2451545.0) / 36525
            gmst =  67310.54841 \
                 + (876600.0 * 3600.0 + 8640184.812866 \
                 + (0.093104 \
                 -  6.2e-6 * t_ut1) * t_ut1) * t_ut1
            gmst = (gmst * self.D2R / 240.0) % self.PI2
            if gmst < 0.0:
                gmst += self.PI2
            return gmst
        except Exception as e:
            raise

    def __deg2hms(self, deg):
        """ 99.999° -> 99h99m99s 変換

        :param  float deg: degree
        :return string:    99 h 99 m 99.999 s
        """
        sign = ""
        try:
            h = int(deg / 15)
            _m = (deg - h * 15.0) * 4.0
            m = int(_m)
            s = (_m - m) * 60.0
            if s < 0:
                s *= -1
                sign = "-"
            return "{}{:2d} h {:02d} m {:06.3f} s".format(sign, h, m, s)
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        GmstIau82().exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to calculate GMST with IAU1982 theory.](https://gist.github.com/komasaru/0abd83f1fd1498b2535789cd47d9d3b6 "Gist - Python script to calculate GMST with IAU1982 theory.")

### 2. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x calc_gmst_iau_82.py
```

そして、コマンドライン引数に UT1（世界時1）を `YYYYMMDD[HHMMSS]` の書式で指定して実行する。（引数無指定なら、現在時刻を UT1 とみなす）

``` text
$ ./calc_gmst_iau_82.py 20180616
2018-06-16 00:00:00 UT1
JD(UT1): 2458285.5
GMST = 4.611451424267976 rad.
     = 264.2167040401474 deg.
     = 17 h 36 m 52.009 s
```

### 3. 計算結果の検証

まず、「[Ruby - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2016/08/06/ruby-calc-greenwich-sidereal-time "Ruby - グリニッジ恒星時の計算（IAU2006 理論）！")」のスクリプトで計算した結果と比較してみる。  
このスクリプトは地球時(TT)を指定して計算するようにしているので正確に比較はできないが、UT1 が近似するように TT を指定して実行して結果を得ると、高い精度で一致することが分かる。

次に、国立天文台・暦象年表のツール「[グリニジ恒星時](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/gst.cgi "グリニジ恒星時")」で計算した値と比較してみる。  
時角で2/1000秒の誤差に収まることが確認できた。

また、（当然ながら）前回のブログ記事で紹介した Ruby 版での計算結果と同じになることも確認できた。

---

以上。

