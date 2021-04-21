---
layout   : single
title    : "Python - 地球自転速度補正値 ΔT の計算！"
published: true
date     : 2018-07-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Python
---

地球自転速度補正値 delta T (ΔT) の計算式が [NASA - Polynomial Expressions for Delta T](http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html "NASA - Polynomial Expressions for Delta T") に掲載されていますので、 Python で実装しました。(-1900年〜3000年対応）

さらに、1972年から2018年までは、[うるう秒実施日一覧: NICT - 日本標準時プロジェクト](http://jjy.nict.go.jp/QandA/data/leapsec.html "うるう秒実施日一覧: NICT - 日本標準時プロジェクト")で公開されている「うるう秒」に 32.184(= TT（地球時） - TAI（国際原子時）) を加算した値とも比較できるようにしてみました。

各種時刻系については、当ブログ過去記事等をご参照ください。

* [Ruby - 各種時刻系の換算！]({{site.baseurl}}/2016/04/02/ruby-calc-time-series "Ruby - 各種時刻系の換算！")

ちなみに、過去に同じことを Ruby で行っています。

* [Ruby - 地球自転速度補正値 ΔT の計算！]({{site.baseurl}}/2016/07/29/ruby-delta-t-calculation "Ruby - 地球自転速度補正値 ΔT の計算！")

<!--more-->

### 0. 前提条件

* Python 3.6.5 での作業を想定。
* NASA の計算式で計算できる西暦は -1900年から3000年。  
  （AD元年の前年はBC元年なので、今回の計算上の 0年 は BC1年、 -1900年 は BC1901年）
* うるう秒が実際されたのは1972年から2017年（当記事執筆時点）。（[うるう秒実施日一覧: NICT - 日本標準時プロジェクト](http://jjy.nict.go.jp/QandA/data/leapsec.html "うるう秒実施日一覧: NICT - 日本標準時プロジェクト")）  
  次回、いつ「うるう秒」が挿入（or 削除）されるかは不明なので、以下のスクリプト内の NICT 版メソッドでの対応は2019年直前までとしている。
* 「ΔT = TT - UT1 = TAI - UTC - DUT1 + 32.184 = 32.184 - (UTC - TAI) - DUT1 = 32.184 - うるう秒総和 - DUT1」であることから、本来は DUT1(= UT1 - UTC) も考慮すべきであるが、今回は考慮しない。（誤差は大きくても 1 秒未満。参照「[日本標準時プロジェクト　Announcement of DUT1](http://jjy.nict.go.jp/QandA/data/dut1.html "日本標準時プロジェクト　Announcement of DUT1")」）

### 1. Python スクリプトの作成

File: `calc_delta_t.py`

{% highlight ruby linenos %}
#! /usr/local/bin/python3.6
"""
地球自転速度の補正値 delta T(ΔT)の計算
: [NASA - Polynomial Expressions for Delta T]
  (http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html)
  の計算式を使用する。
  1972年 - 2018年は、比較対象として「うるう年総和 + 32.184(TT - TAI)」
  の値も計算する。

  date          name            version
  2018.04.17    mk-mode.com     1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
---
  引数 : YYYYMM
         * YYYYMM は UTC
         * 無指定なら現在年月を UTC とみなす。
"""
from datetime import datetime
import re
import sys
import traceback

class CalcDeltaT:
    USAGE     = "[USAGE] ./calc_delta_t.py [[+-]YYYYMM]"
    MSG_ERR_1 = "[ERROR] Year must be between -1999 and 3000!"
    MSG_ERR_2 = "[ERROR] Month must be between 1 and 12!"
    TT_TAI    = 32.184

    def __init__(self):
        self.__get_arg()

    def exec(self):
        try:
            print("[{:04d}-{:02d}] ".format(self.year, self.month))
            # NASA Ver. (-1999 - 3000)
            if                         self.year <  -500:
                dt = self.__calc_before_m500()
            elif -500 <= self.year and self.year <   500:
                dt = self.__calc_before_500()
            elif  500 <= self.year and self.year <  1600:
                dt = self.__calc_before_1600()
            elif 1600 <= self.year and self.year <  1700:
                dt = self.__calc_before_1700()
            elif 1700 <= self.year and self.year <  1800:
                dt = self.__calc_before_1800()
            elif 1800 <= self.year and self.year <  1860:
                dt = self.__calc_before_1860()
            elif 1860 <= self.year and self.year <  1900:
                dt = self.__calc_before_1900()
            elif 1900 <= self.year and self.year <  1920:
                dt = self.__calc_before_1920()
            elif 1920 <= self.year and self.year <  1941:
                dt = self.__calc_before_1941()
            elif 1941 <= self.year and self.year <  1961:
                dt = self.__calc_before_1961()
            elif 1961 <= self.year and self.year <  1986:
                dt = self.__calc_before_1986()
            elif 1986 <= self.year and self.year <  2005:
                dt = self.__calc_before_2005()
            elif 2005 <= self.year and self.year <  2050:
                dt = self.__calc_before_2050()
            elif 2050 <= self.year and self.year <= 2150:
                dt = self.__calc_until_2150()
            elif 2150 <  self.year:
                dt = self.__calc_after_2150()
            print("delta T =", dt)
            # NICT Ver.  (1972-01-01 - 2018-12-31)
            if 1972 <= self.year and self.year <= 2018:
                print("   (NICT: {})".format(self.__calc_nict()))
        except Exception as e:
            raise

    def __get_arg(self):
        """ Argument getting """
        try:
            if len(sys.argv) > 1:
                ym = sys.argv[1]
            else:
                ym = datetime.now().strftime("%Y%m")
            if re.search(r"^[+-]?\d{6}$", ym) is None:
                print(self.USAGE)
                sys.exit(0)
            m = re.findall(r"([+-]?\d{4})(\d{2})", ym)[0]
            self.year, self.month = int(m[0]), int(m[1])
            if self.year < -1999 or self.year > 3000:
                print(self.MSG_ERR_1)
                sys.exit(0)
            if self.month < 1 or self.month > 12:
                print(self.MSG_ERR_2)
                sys.exit(0)
            self.y = self.year + (self.month - 0.5) // 12
        except Exception as e:
            raise

    def __calc_before_m500(self):
        """ year < -500

        :return float
        """
        try:
            t = (self.y - 1820) / 100
            return -20 + 32 * t ** 2
        except Exception as e:
            raise

    def __calc_before_500(self):
        """ -500 <= year and year < 500

        :return float
        """
        t = self.y / 100
        try:
            return 10583.6           \
                + (-1014.41          \
                + (   33.78311       \
                + (   -5.952053      \
                + (   -0.1798452     \
                + (    0.022174192   \
                + (    0.0090316521) \
                * t) * t) * t) * t) * t) * t
        except Exception as e:
            raise

    def __calc_before_1600(self):
        """ 500 <= year and year < 1600

        :return float
        """
        t = (self.y - 1000) / 100
        try:
            return 1574.2           \
                + (-556.01          \
                + (  71.23472       \
                + (   0.319781      \
                + (  -0.8503463     \
                + (  -0.005050998   \
                + (   0.0083572073) \
                * t) * t) * t) * t) * t) * t
        except Exception as e:
            raise

    def __calc_before_1700(self):
        """ 1600 <= year and year < 1700

        :return float
        """
        t = self.y - 1600
        try:
            return 120           \
                + ( -0.9808      \
                + ( -0.01532     \
                + (  1.0 / 7129) \
                * t) * t) * t
        except Exception as e:
            raise

    def __calc_before_1800(self):
        """ 1700 <= year and year < 1800

        :return float
        """
        t = self.y - 1700
        try:
            return 8.83           \
               + ( 0.1603         \
               + (-0.0059285      \
               + ( 0.00013336     \
               + (-1.0 / 1174000) \
               * t) * t) * t) * t
        except Exception as e:
            raise

    def __calc_before_1860(self):
        """ 1800 <= year and year < 1860

        :return float
        """
        t = self.y - 1800
        try:
            return 13.72            \
                + (-0.332447        \
                + ( 0.0068612       \
                + ( 0.0041116       \
                + (-0.00037436      \
                + ( 0.0000121272    \
                + (-0.0000001699    \
                + ( 0.000000000875) \
                * t) * t) * t) * t) * t) * t) * t
        except Exception as e:
            raise

    def __calc_before_1900(self):
        """ 1860 <= year and year < 1900

        :return float
        """
        t = self.y - 1860
        try:
            return 7.62          \
               + ( 0.5737        \
               + (-0.251754      \
               + ( 0.01680668    \
               + (-0.0004473624  \
               + ( 1.0 / 233174) \
               * t) * t) * t) * t) * t
        except Exception as e:
            raise

    def __calc_before_1920(self):
        """ 1900 <= year and year < 1920

        :return float
        """
        t = self.y - 1900
        try:
            return -2.79      \
                + ( 1.494119  \
                + (-0.0598939 \
                + ( 0.0061966 \
                + (-0.000197) \
                * t) * t) * t) * t
        except Exception as e:
            raise

    def __calc_before_1941(self):
        """ 1920 <= year and year < 1941

        :return float
        """
        t = self.y - 1920
        try:
            return 21.20       \
                + ( 0.84493    \
                + (-0.076100   \
                + ( 0.0020936) \
                * t) * t) * t
        except Exception as e:
            raise

    def __calc_before_1961(self):
        """ 1941 <= year and year < 1961

        :return float
        """
        t = self.y - 1950
        try:
            return 29.07        \
                + ( 0.407       \
                + (-1.0 / 233   \
                + ( 1.0 / 2547) \
                * t) * t) * t
        except Exception as e:
            raise

    def __calc_before_1986(self):
        """ 1961 <= year and year < 1986

        :return float
        """
        t = self.y - 1975
        try:
            return 45.45       \
                + ( 1.067      \
                + (-1.0 / 260  \
                + (-1.0 / 718) \
                * t) * t) * t
        except Exception as e:
            raise

    def __calc_before_2005(self):
        """ 1986 <= year and year < 2005

        :return float
        """
        t = self.y - 2000
        try:
            return 63.86           \
                + ( 0.3345         \
                + (-0.060374       \
                + ( 0.0017275      \
                + ( 0.000651814    \
                + ( 0.00002373599) \
                * t) * t) * t) * t) * t
        except Exception as e:
            raise

    def __calc_before_2050(self):
        """ 2005 <= year and year < 2050

        :return float
        """
        t = self.y - 2000
        try:
            return 62.92      \
                + ( 0.32217   \
                + ( 0.005589) \
                * t) * t
        except Exception as e:
            raise

    def __calc_until_2150(self):
        """ 2050 <= year and year <= 2150

        :return float
        """
        try:
            return - 20 \
                   + 32 * ((self.y - 1820) / 100) ** 2 \
                   - 0.5628 * (2150 - self.y)
        except Exception as e:
            raise

    def __calc_after_2150(self):
        """ 2150 < year

        :return float
        """
        t = (self.y - 1820) / 100
        try:
            return -20 + 32 * t ** 2
        except Exception as e:
            raise

    def __calc_nict(self):
        """ NICT Ver.  (1972-01-01 - 2018-12-31)

        :return float dt
        """
        ym = "{:04d}{:02d}".format(self.year, self.month)
        try:
            if ym < "197207":
                dt = self.TT_TAI + 10
            elif ym < "197301":
                dt = self.TT_TAI + 11
            elif ym < "197401":
                dt = self.TT_TAI + 12
            elif ym < "197501":
                dt = self.TT_TAI + 13
            elif ym < "197601":
                dt = self.TT_TAI + 14
            elif ym < "197701":
                dt = self.TT_TAI + 15
            elif ym < "197801":
                dt = self.TT_TAI + 16
            elif ym < "197901":
                dt = self.TT_TAI + 17
            elif ym < "198001":
                dt = self.TT_TAI + 18
            elif ym < "198107":
                dt = self.TT_TAI + 19
            elif ym < "198207":
                dt = self.TT_TAI + 20
            elif ym < "198307":
                dt = self.TT_TAI + 21
            elif ym < "198507":
                dt = self.TT_TAI + 22
            elif ym < "198801":
                dt = self.TT_TAI + 23
            elif ym < "199001":
                dt = self.TT_TAI + 24
            elif ym < "199101":
                dt = self.TT_TAI + 25
            elif ym < "199207":
                dt = self.TT_TAI + 26
            elif ym < "199307":
                dt = self.TT_TAI + 27
            elif ym < "199407":
                dt = self.TT_TAI + 28
            elif ym < "199601":
                dt = self.TT_TAI + 29
            elif ym < "199707":
                dt = self.TT_TAI + 30
            elif ym < "199901":
                dt = self.TT_TAI + 31
            elif ym < "200601":
                dt = self.TT_TAI + 32
            elif ym < "200901":
                dt = self.TT_TAI + 33
            elif ym < "201207":
                dt = self.TT_TAI + 34
            elif ym < "201507":
                dt = self.TT_TAI + 35
            elif ym < "201701":
                dt = self.TT_TAI + 36
            elif ym < "201901":
                dt = self.TT_TAI + 37  # <= 第28回うるう秒実施までの暫定措置
            return dt
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = CalcDeltaT()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to calculate deltaT by NASA method.](https://gist.github.com/komasaru/27dc12ef55ef912ba3ee57353fb06c0d "Gist - Python script to calculate deltaT by NASA method.")

`t` のべき乗計算部分を特殊な記述に変更しているのは、乗算回数を減らして高速化するため。  
（例えば、`1 + 2 * t + 3 * t**2 + 4 * t**3` だと乗算回数が「6回」だが、`1 + (2 + (3 + 4*t)*t)*t` と書き換えることで乗算回数が「3回」になる）

### 2. Python スクリプトの実行

``` text
$ ./calc_delta_t.py 000112
[0001-12]
delta T = 10563.74738216227

$ ./calc_delta_t.py 190007
[1900-07]
delta T = -1.997290733102346

$./calc_delta_t.py 200007
[2000-07]
delta T = 64.02380536456008
   (NICT: 64.184)

$ ./calc_delta_t.py 201807
[2018-07]
delta T = 70.81503007812505
   (NICT: 69.184)

$ ./calc_delta_t.py 300007
[3000-07]
delta T = 4439.771605555555
```

---

NASA 版の計算式では細かい補正が行われてはいますが、当方は、うるう秒挿入（or 削除）が確実な場合は「うるう秒挿入（or 削除）総和 + 32.184(TT - TAI)」を ΔT とするようにしています。

以上。

