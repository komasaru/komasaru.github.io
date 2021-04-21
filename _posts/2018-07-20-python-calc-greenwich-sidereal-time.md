---
layout   : single
title    : "Python - グリニッジ恒星時の計算（IAU2006 理論）！"
published: true
date     : 2018-07-20 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Python
---

グリニッジ視恒星時(GAST; Greenwich Apparent Sidereal Time)、グリニッジ平均恒星時(GMST; Greenwich Mean Sidereal Time)、分点均差(EE; Equation of Equinoxes)の計算を Python で実装してみました。（使用するのは IAU2006 理論 等）

<!--more-->

### 0. 前提条件、事前知識

* グリニッジ時刻の計算には、 IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy) の提供する C ソースコードに実装されている数々のアルゴリズムを使用する。
* IAU SOFA のソースコードには、 MHB2000(Mathews-Herring-Buffett, 2000) の理論や IERS2003(International Earth Rotation & Reference Systems service, 2003) の理論の使用が混在していることに留意。
* ここでは「グリニッジ時刻」そのものが何かについては詳細には説明しない。
* また、算出アルゴリズムについてもここでは詳細には説明しない。（と言うより、煩雑で自分には説明できない）  
  参考サイトやソーススクリプトを参照のこと。
* グリニッジ時刻の計算に使用する章動の計算は、過去記事「[Ruby - 章動の計算（IAU2000A 理論）！]({{site.baseurl}}/2016/06/22/ruby-calc-nutation-by-iau2000a/ "Ruby - 章動の計算（IAU2000A 理論）！")」もご参照ください。（但し、IAU2000A 理論を若干補正した IAU2006 理論としている）
* 過去に、 Ruby でグリニッジ視恒星時(GAST; Greenwich Apparent Sidereal Time)、グリニッジ平均恒星時(GMST; Greenwich Mean Sidereal Time)、分点均差(EE; Equation of Equinoxes)の計算を行ったことがあるので、そちらの記事も参照のこと。（[Ruby - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2016/08/06/ruby-calc-greenwich-sidereal-time "Ruby - グリニッジ恒星時の計算（IAU2006 理論）！")）

### 1. Python スクリプトの作成

* 以下はメインのスクリプト。
* ライブラリも多数作成しているが、紙面の都合上割愛する。  
  GitHub リポジトリとして公開しているので、「[komasaru/greenwich_time_py: Greenwich Time calculator. (Python Ver.)](https://github.com/komasaru/greenwich_time_py "komasaru/greenwich_time_py: Greenwich Time calculator. (Python Ver.)")」をご参照ください。
* あらゆるメソッドは IAU SOFA の提供する C ソースコードに実装されているアルゴリズムに則って作成している。
* 当スクリプトでは計算の途中経過も出力するようにしている。

File: `greenwich_time.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
グリニジ視恒星時 GAST(= Greenwich Apparent Sidereal Time)等の計算
: IAU2006 による計算

  * IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy)
    の提供する C ソースコード "gst06.c" 等で実装されているアルゴリズムを使用する。
  * 参考サイト
    - [SOFA Library Issue 2016-05-03 for ANSI C: Complete List]
      (http://www.iausofa.org/2016_0503_C/CompleteList.html)
    - [USNO Circular 179]
      (http://aa.usno.navy.mil/publications/docs/Circular_179.php)
    - [IERS Conventions Center]
      (http://62.161.69.131/iers/conv2003/conv2003_c5.html)

  Date          Author          Version
  2016.06.21    mk-mode.com     1.00 新規作成

Copyright(C) 2016 mk-mode.com All Rights Reserved.
---
  引数: 日時(TT（地球時）)
          書式：YYYYMMDD or YYYYMMDDHHMMSS
          無指定なら現在(システム日時)を地球時とみなす。
"""
from datetime import datetime
import re
import sys
import traceback
# Original library
from lib import cip_cio     as lcc
from lib import const       as lcst
from lib import greenwich   as lgw
from lib import nutation    as lnt
from lib import precision   as lpr
from lib import rotation_fw as lfw
from lib import time        as ltm


class GreenwichTime:
    def __init__(self):
        self.__get_arg()

    def exec(self):
        try:
            # === Time calculation
            self.jd     = ltm.calc_jd(self.tt)
            self.jc     = ltm.calc_jc(self.jd)
            self.dt     = ltm.calc_dt(self.tt)
            self.ut1    = ltm.tt2ut1(self.tt, self.dt)
            self.jd_ut1 = ltm.calc_jd(self.ut1)
            # === Fukushima-Williams angles for frame bias and precession.
            #       Ref: iauPfw06(date1, date2, &gamb, &phib, &psib, &epsa)
            prec = lpr.Precision(self.jc)
            self.gam_b, self.phi_b, self.psi_b = prec.calc_pfw_06()
            self.eps_a = prec.calc_obl_06()
            # === Nutation components.
            #       Ref: iauNut06a(date1, date2, &dp, &de)
            nut = lnt.Nutation(self.jc)
            self.d_psi, self.d_eps = nut.calc_nut_06_a()
            # === Equinox based nutation x precession x bias matrix.
            #       Ref: iauFw2m(gamb, phib, psib + dp, epsa + de, rnpb)
            r_fw = lfw.RotationFw()
            self.r_mtx = r_fw.fw2m(
                self.gam_b, self.phi_b,
                self.psi_b + self.d_psi,
                self.eps_a + self.d_eps
            )
            # === Extract CIP coordinates.
            #       Ref: iauBpn2xy(rnpb, &x, &y)
            cc = lcc.CipCio(self.jc)
            self.x, self.y = cc.bpn2xy(self.r_mtx)
            # === The CIO locator, s.
            #       Ref: iauS06(tta, ttb, x, y)
            self.s = cc.s_06(self.x, self.y)
            # Greenwich time
            gw = lgw.Greenwich(self.jd_ut1)
            # === Greenwich apparent sidereal time.
            #       Ref: iauEra00(uta, utb), iauEors(rnpb, s)
            self.era = gw.era_00()
            self.eo = gw.eors(self.r_mtx, self.s)
            self.gast = gw.gast(self.era, self.eo)
            self.gast_deg = self.gast / lcst.PI_180
            # === Greenwich mean sidereal time, IAU 2006.
            #       Ref: iauGmst06(uta, utb, tta, ttb)
            self.gmst = gw.gmst(self.era, self.jc)
            self.gmst_deg = self.gmst / lcst.PI_180
            # === Equation of Equinoxes
            self.ee = gw.ee(self.gast, self.gmst)
            self.ee_deg = self.ee / lcst.PI_180
            # === Display
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
                dt = sys.argv[1].ljust(20, "0")
            else:
                sys.exit(0)
            try:
                self.tt = datetime.strptime(dt, "%Y%m%d%H%M%S%f")
            except ValueError as e:
                print("Invalid date!")
                sys.exit(0)
        except Exception as e:
            raise

    def __display(self):
        """ Display """
        try:
            print((
                "     TT = {}\n"
                "    UT1 = {}\n"
                " JD(TT) = {}\n"
                "JD(UT1) = {}\n"
                "     JC = {}\n"
                "     DT = {}\n"
                " GAMMA_ = {}\n"
                "   PHI_ = {}\n"
                "   PSI_ = {}\n"
                "  EPS_A = {}\n"
                "  D_PSI = {}\n"
                "  D_EPS = {}\n"
                "  r_mtx = \n{}\n"
                "      x = {}\n"
                "      y = {}\n"
                "      s = {}\n"
                "    ERA = {} rad\n"
                "     EO = {} rad\n"
                "   GAST = {} rad\n"
                "        = {} °\n"
                "        = {}\n"
                "   GMST = {} rad\n"
                "        = {} °\n"
                "        = {}\n"
                "     EE = {} rad\n"
                "        = {} °\n"
                "        = {}"
            ).format(
                self.tt.strftime("%Y-%m-%d %H:%M:%S.%f"),
                self.ut1.strftime("%Y-%m-%d %H:%M:%S.%f"),
                self.jd,
                self.jd_ut1,
                self.jc,
                self.dt,
                self.gam_b,
                self.phi_b,
                self.psi_b,
                self.eps_a,
                self.d_psi,
                self.d_eps,
                self.r_mtx,
                self.x,
                self.y,
                self.s,
                self.era,
                self.eo,
                self.gast,
                self.gast_deg,
                ltm.deg2hms(self.gast_deg),
                self.gmst,
                self.gmst_deg,
                ltm.deg2hms(self.gmst_deg),
                self.ee,
                self.ee_deg,
                ltm.deg2hms(self.ee_deg)
            ))
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        GreenwichTime().exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [komasaru/greenwich_time_py: Greenwich Time calculator. (Python Ver.)](https://github.com/komasaru/greenwich_time_py "komasaru/greenwich_time_py: Greenwich Time calculator. (Python Ver.)")


### 2. Python スクリプトの実行

`YYYYMMDD` or `YYYYMMDDHHMMSS` or `YYYYMMDDHHMMSSUUUUUU` で地球時(TT) を指定して実行する。（引数なしでシステム時刻を地球時とみなす）

以下は、地球時 TT 2016-04-25 12:34:56 のグリニッジ恒星時を計算する例。（= 世界時 UT1 2018-04-25 12:33:46.816）  
（検証に使用する国立天文台のツールでは「世界時」で計算するようになっているため、当スクリプトで地球時で指定する場合は +ΔT 秒する必要がある。（但し、1秒未満には対応していない））

``` text
$ ./greenwich_time.py 20180425123456
     TT = 2018-04-25 12:34:56.000000
    UT1 = 2018-04-25 12:33:46.816000
 JD(TT) = 2458234.0242592595
JD(UT1) = 2458234.023449074
     JC = 0.1831355033335923
     DT = 69.184
 GAMMA_ = 9.19623227255278e-06
   PHI_ = 0.40905108008073254
   PSI_ = 0.0044735471377375996
  EPS_A = 0.4090510158568844
  D_PSI = -6.84648244230752e-05
  D_EPS = -2.7913673447397097e-05
  r_mtx =
[[  9.99990335e-01  -4.03244790e-03  -1.75206681e-03]
 [  4.03249690e-03   9.99991869e-01   2.44372220e-05]
 [  1.75195403e-03  -3.15021898e-05   9.99998465e-01]]
      x = 0.001751954027059747
      y = -3.150218978292818e-05
      s = 2.004040915031634e-08
    ERA = 0.7275578076936355 rad
     EO = -0.004032466382461003 rad
   GAST = 0.7315902740760966 rad
        = 41.91703503737949 °
        =  2 h 47 m 40.088 s
   GMST = 0.7316530811499254 rad
        = 41.920633617633456 °
        =  2 h 47 m 40.952 s
     EE = -6.280707382888551e-05 rad
        = -0.0035985802539617072 °
        = - 0 h 00 m 00.864 s
```

### 3. 計算結果の検証

国立天文台・暦象年表のツールで計算した値と比較してみた。

グリニッジ視恒星時・平均恒星時は時角で約1秒(1/100°)の誤差に、分点均差は時角で1/1000秒未満の誤差に収まることが確認できた。（Ruby 版と同じ結果になることも確認できた）

* [グリニジ恒星時](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/gst.cgi "グリニジ恒星時")

### 4. 参考サイト

* [SOFA Library Issue 2016-05-03 for ANSI C: Complete List](http://www.iausofa.org/2016_0503_C/CompleteList.html "SOFA Library Issue 2016-05-03 for ANSI C: Complete List")

---

今回のグリニッジ視恒星時の計算も、天体位置やこよみを正確に計算する際に必要になってきます。

当方、今後挑戦してみようと考えております。（可能ならば）

以上。

