---
layout   : single
title    : "Python - 平均黄道傾斜角の計算！"
published: true
date     : 2018-07-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Python
- カレンダー
---

以前、 Ruby で平均黄道傾斜角の計算を実装しました。

* [Ruby - 平均黄道傾斜角の計算！]({{site.baseurl}}/2016/06/18/ruby-calc-mean-obliquity-ecliptic "Ruby - 平均黄道傾斜角の計算！")

今回は、同様のことを Python で実現してみました。

<!--more-->

### 0. 前提条件

* Python 3.6.5 での作業を想定。

### 1. 計算方法

計算方法等については、過去記事を参照。

* [Ruby - 平均黄道傾斜角の計算！]({{site.baseurl}}/2016/06/18/ruby-calc-mean-obliquity-ecliptic "Ruby - 平均黄道傾斜角の計算！")

### 2. Python スクリプトの作成

File: `mean_obliquity_ecliptic.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
平均黄道傾斜角の計算

  date          name            version
  2018.04.09    mk-mode.com     1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
---
引数 : 日時(TT（地球時）)
         書式：YYYYMMDD or YYYYMMDDHHMMSS or YYYYMMDDHHMMSSUUUUUU
         無指定なら現在(システム日時)を地球時とみなす。
"""
from datetime import datetime
import re
import sys
import traceback


class MeanObliquityEcliptic:
    def __init__(self):
        self.__get_arg()

    def exec(self):
        """ 実行 """
        try:
            self.__calc_jd()
            self.__calc_t()
            self.__calc_eps_a()
            self.__display()
        except Exception as e:
            raise

    def __get_arg(self):
        """ コマンドライン引数の取得
            * コマンドライン引数で指定した日時を self.tt に設定
            * コマンドライン引数が存在しなければ、現在時刻を self.tt に設定
        """
        try:
            if len(sys.argv) < 2:
                self.tt = datetime.now()
                return
            if re.search(r"^(\d{8}|\d{14}|\d{20})$", sys.argv[1]):
                tt = sys.argv[1].ljust(20, "0")
            else:
                sys.exit(0)
            try:
                self.tt = datetime.strptime(tt, "%Y%m%d%H%M%S%f")
            except ValueError as e:
                print("Invalid date!")
                sys.exit(0)
        except Exception as e:
            raise

    def __calc_jd(self):
        """ ユリウス日の計算
            * 地球時 self.tt のユリウス日を計算し、self.jd に設定
        """
        year, month,  day    = self.tt.year, self.tt.month,  self.tt.day
        hour, minute, second = self.tt.hour, self.tt.minute, self.tt.second
        second += self.tt.microsecond
        try:
            if month < 3:
                year  -= 1
                month += 12
            d = int(365.25 * year) + year // 400  - year // 100 \
              + int(30.59 * (month - 2)) + day + 1721088.5
            t  = (second / 3600 + minute / 60 + hour) / 24
            self.jd = d + t
        except Exception as e:
            raise

    def __calc_t(self):
        """ ユリウス世紀数の計算
            * ユリウス日 self.jd のユリウス世紀数を計算し、 self.t に設定
        """
        try:
            self.t = (self.jd - 2451545) / 36525
        except Exception as e:
            raise

    def __calc_eps_a(self):
        """ 黄道傾斜角(εA)の計算
            * ユリウス世紀数 self.t から黄道傾斜角 ε （単位: rad）を計算し、
              self.eps_a に設定
            * 以下の計算式により求める。
                ε = 84381.406 - 46.836769 * T - 0.0001831 T^2 + 0.00200340 T^3
                  - 5.76 * 10^(-7) * T^4 - 4.34 * 10^(-8) * T^5
              ここで、 T は J2000.0 からの経過時間を 36525 日単位で表したユリウス
              世紀数で、 T = (JD - 2451545) / 36525 である。
        """
        t = self.t
        try:
            self.eps_a = (84381.406      \
                       + (  -46.836769   \
                       + (   -0.0001831  \
                       + (    0.00200340 \
                       + (   -5.76e-7    \
                       + (   -4.34e-8)   \
                       * t) * t) * t) * t) * t) / 3600
        except Exception as e:
            raise

    def __display(self):
        """ 結果表示 """
        try:
            print((
                "           地球時(TT): {}\n"
                "       ユリウス日(JD): {}\n"
                "   ユリウス世紀数(JC): {}\n"
                "平均黄道傾斜角(eps_a): {} °"
            ).format(
                datetime.strftime(self.tt, "%Y-%m-%d %H:%M:%S.%f"),
                self.jd, self.t, self.eps_a
            ))
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = MeanObliquityEcliptic()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to calc a Mean Obliquity of the Ecliptic.](https://gist.github.com/komasaru/d1f96345c2096730a15a8871479438cf "Gist - Python script to calc a Mean Obliquity of the Ecliptic.")
`__calc_eps_a()` メソッド内の t のべき乗計算部分を特殊な記述にしているのは、演算コストのかかる乗算回数を減らして高速化を図るため。（例えば、`1 + 2 * t + 3 * t**2 + 4 * t**3` だと乗算回数が「6回」だが、`1 + (2 + (3 + 4 * t) * t) * t` と書き換えることで乗算回数が「3回」になる）

### 3. Python スクリプトの実行

`YYYYMMDD` or `YYYYMMDDHHMMSS` or `YYYYMMDDHHMMSSUUUUUU` で地球時(TT) を指定して実行する。（引数なしでシステム時刻を地球時とみなす）

``` text
$ ./mean_obliquity_ecliptic.py 20180503123456123456
           地球時(TT): 2018-05-03 12:34:56.000000
       ユリウス日(JD): 2458242.0242592595
   ユリウス世紀数(JC): 0.18335453139656285
平均黄道傾斜角(eps_a): 23.436893964544698 °
```

### 4. 計算結果の検証

国立天文台・暦象年表のツールで計算した値と比較してみたが、かなりの精度で一致することが確認できた。

* [章動 - 国立天文台暦計算室](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/nutation.cgi "章動 - 国立天文台暦計算室")

---

以上。

