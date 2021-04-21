---
layout   : single
title    : "Python - 各種時刻系の変換！"
published: true
date     : 2018-07-23 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Python
---

以前、 Ruby で各種時刻系を変換するスクリプトを作成しました。

* [Ruby - 各種時刻系の換算！]({{site.baseurl}}/2016/04/02/ruby-calc-time-series "Ruby - 各種時刻系の換算！")

今回は、同様のことを Python で行ってみました。

<!--more-->

### 0. 前提条件

* Python 3.6.5 での作業を想定。
* 天文学的な計算については疎いため、誤りがあるかもしれない。

### 1. 各種時刻系について

原子時系（世界時系を含む）、力学時系、座標時系の順に記述。

* TAI（国際原子時; International Atomic Time）
  - UTC（協定世界時）を含む他の時刻基準の計算の基となる基礎的な国際時刻基準。
  - 原子時計によって定義される高精度＆安定、地球ジオイド面での時刻系。
  - 1 秒は SI 秒。
* UT（世界時; Universal Time）
  - ロンドンの旧グリニッジ天文台を通る子午線上で、平均太陽（平均的な動きの太陽）が南中する瞬間を12時として定義されている。
  - UT0, UT1, UT2, UTC の種類がある。
  - 単に UT と呼んだ場合は UT1 を指すことが多い。
* UT0（世界時0; Universal Time 0）
  - 世界各地の恒星や地球外の電波源の日周運動の観測結果を経度の差によって本初子午線における換算し平均して求めた時刻系。
  - 極運動の効果（地球の地理学的極と自転軸の極とのずれ）の補正を含まない。（特定の観測地での地球自転に基づく時刻）
* UT1（世界時1; Universal Time 1）
  - UT0 から観測地の経度に表れる極運動の効果（地球の地理学的極と自転軸の極とのずれ）を補正した（観測地点に依存しない）時刻系。
  - いわゆる地球の自転による時刻系。
  - 地球自転が一定していないため、季節により変動する。
  - UT1 = UTC + DUT1
* UT2（世界時2; Universal Time 2）
  - UT1 に季節変化を考慮（UT1 から年周期・半年周期等の成分の大部分を除外）した時刻系。
* UTC（協定世界時, Coordinated Universal Time）
  - TAI（国際原子時）に由来する原子時系時刻で、UT1（世界時1）に同調するよう調整された基準時刻。
  - 世界各地の標準の基準となっている。
  - TAI（国際原子時）から整数秒ずれている。
  - UT1 - TAI の絶対値が 0.9 秒以内となるよううるう秒で調整されている。
  - TAI = UTC - (UTC - TAI) = UTC - うるう秒の総和
  - 現時点の UTC - TAI（うるう秒の総和）は「[こちら](http://jjy.nict.go.jp/QandA/data/leapsec.html "")」を参照。
  - 1 秒 = SI 秒
* DUT1（ΔUT1）
  - DUT1 = UT1 - UTC
  - 現在は DUT1 の絶対値が1秒を越えないよう、うるう秒による調整が行われている。
  - 現時点の DUT1 は「[こちら](http://jjy.nict.go.jp/QandA/data/dut1.html "")」を参照。
* TT（地球時; Terrestrial Time）
  - かつて TDT（地球力学時）と呼ばれていた時刻系を再定義したもので、地球ジオイド面での座表時。
  - TAI の1977年1月1日0時0分0秒を力学時の1977年1月1.0003725日とし、TT の１日は平均海面における原子時計による秒の86400倍と定義されている。  
    （0.0003725 日 = 32.184 秒）
  - 元期 J2000.0 は、ユリウス日で 2,451,545.0 TT（2000年1月1日12h TT）。
  - 1 秒は SI 秒。
  - TT = TAI + 32.184 （秒）  
    さらには、
    * = UTC - (UTC - TAI) + 32.184
    * = UTC - うるう秒の総和 + 32.184
    * = UT1 - (UT1 - UTC) - うるう秒の総和 + 32.184
    * = UT1 - DUT1 - うるう秒の総和 + 32.184
    * = UT1 + ΔT  
      （但し、 ΔT は地球時と世界時のズレ。ユリウス日から直接 ΔT を求めるには「[NASA - Polynomial Expressions for Delta T](http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html "NASA - Polynomial Expressions for Delta T")」を参照）
  - ΔT = TT - UT1 = TAI - UTC - DUT1 + 32.184
* TDT（地球力学時; Terrestrial Dynamical Time）
  - かつて使われていた力学時。
  - 現在は使用されていない。
  - TDT = TT = TAI + 32.184 （秒）
* TDB（太陽系力学時; Barycentric Dynamical Time）
  - 太陽系重心における力学時。
  - 一般相対性理論による重力の影響が加味されれている。
  - TT と比較すると周期的項が異なるが、その差は極小（最大でも10ms程度）のため無視しても問題ない。  
    TDB = TT + TDB_0 + 周期項  
    （但し、 TDB_0 = -6.55 * 10^(-5)）
  - 2006年のIAU勧告では TDB は次のように定義された。（TDB は TT, TCG, TCB と原点がわずかにずれているため）  
    TDB = TCB - L_B * (JD_TCB - T_0) * 86400 + TDB_0  
    （但し、 JD_TCB: TCB におけるユリウス日, L_B = 1.550519768 * 10^(-8), T_0 = 2443144.5003725, TDB_0 = -6.55 * 10^(-5)）
* TCG（地球重心座標時; Geocentric Coordinate Time）
  - 地球重心を原点として考える座標時。
  - 周期的項はない。
  - TT と比較して1年あたり約22ミリ秒速く進む。
  - TCG - TT = L_G * (JD - T_0) * 86,400  
    （但し、 JD: ユリウス日, L_G = 6.969290134 * 10^(-10), T_0 = 2443144.5003725）
  - dTT / dTCG = 1 - L_G  
    （但し、L_G = 6.969290134 * 10^(-10)）
    （詳細不明）
* TCB（太陽系重心座標時; Barycentric Coordinate Time)
  - 太陽系重心を原点として考える座標時。
  - TT と比較して1年あたり約0.49秒速く進む。
  - 小さな周期的項が存在するが、周期項を無視して平均化すると、  
    TCB - TT = L_B * (JD - T_0) * 86400
  - 2006年IAU勧告では、TDB（太陽系力学時）と TCB（太陽系重心座標時）の関係を次の一次式で定義するすることが推奨されている。  
    TDB = TCB − L_B * (JD_TCB − T_0) * 86,400 + TDB_0  
    （但し、 JD_TCB: TCB におけるユリウス日, L_B = 1.550519768 * 10^(-8), T_0 = 2443144.5003725, TDB_0 = -6.55 * 10^(-5)）
  - dTCG / dATCB = 1 - L_C  
    （但し、L_C = 1.4808268674 * 10^(-8), TCB = ATCB + 周期的項（1.6ms程度）, ATCB = Average of TCB）
    （詳細不明）

### 2. Python スクリプトの作成

次のスクリプトは実行部分。

File: `conv_time.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
各種時刻換算

  date          name            version
  2018.04.26    mk-mode         1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
---
  引数 : JST（日本標準時）
           書式：YYYYMMDD or YYYYMMDDHHMMSS or YYYYMMDDHHMMSSUUUUUU
           無指定なら現在(システム日時)と判断。（上記の U はマイクロ秒）
---
* 定数 DUT1 (= UT1 - UTC) の値は以下を参照。
    [日本標準時プロジェクト Announcement of DUT1]
    (http://jjy.nict.go.jp/QandA/data/dut1.html)
  但し、値は 1.0 秒以下なので、精度を問わないなら 0.0 固定でもよい(?)
* UTC - TAI（協定世界時と国際原子時の差）は、以下のとおりとする。
  - 1972年07月01日より古い場合は一律で 10
  - 2019年07月01日以降は一律で 37
  - その他は、指定の値
    [日本標準時プロジェクト　Information of Leap second]
    (http://jjy.nict.go.jp/QandA/data/leapsec.html)
* ΔT = TT - UT1 は、以下のとおりとする。
  - 1972-01-01 以降、うるう秒挿入済みの年+2までは、以下で算出
      ΔT = 32.184 - (UTC - TAI) - DUT1
    UTC - TAI は
    [うるう秒実施日一覧](http://jjy.nict.go.jp/QandA/data/leapsec.html)
    を参照
  - その他の期間は NASA 提供の略算式により算出
    [NASA - Polynomial Expressions for Delta T]
    (http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html)
"""
from datetime import datetime
from datetime import timedelta
import re
import sys
import traceback
from lib import delta_t as ldt
from lib import time_   as ltm


class ConvTime:
    MSG_ERR_1 = "[ERROR] Format: YYYYMMDD or YYYYMMDDHHMMSS or YYYYMMDDHHMMSSUUUUUU"
    MSG_ERR_2 = "[ERROR] Invalid date!"
    JST_UTC = 9

    def __init__(self):
        self.__get_arg()

    def exec(self):
        try:
            self.jd      = ltm.gc2jd(self.utc)
            self.t       = ltm.jd2jc(self.jd)
            self.utc_tai = ltm.utc2utc_tai(self.utc)
            self.dut1    = ltm.utc2dut1(self.utc)
            odt          = ldt.DeltaT(self.utc.year, self.utc.month)
            self.dt      = odt.delta_t()
            self.tai     = ltm.utc2tai(self.utc, self.utc_tai)
            self.ut1     = ltm.utc2ut1(self.utc, self.dut1)
            self.tt      = ltm.tai2tt(self.tai)
            self.tcg     = ltm.tt2tcg(self.tt, self.jd)
            self.tcb     = ltm.tt2tcb(self.tt, self.jd)
            self.jd_tcb  = ltm.gc2jd(self.tcb)
            self.tdb     = ltm.tcb2tdb(self.tcb, self.jd_tcb)
            self.__display()
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
                self.jst = datetime.now()
            else:
                arg = sys.argv[1]
                if re.search(r"^(\d{8}|\d{14}|\d{20})$", arg) is None:
                    print(self.MSG_ERR_1)
                    sys.exit()
                arg = arg.ljust(20, "0")
                try:
                    self.jst = datetime.strptime(arg, "%Y%m%d%H%M%S%f")
                except ValueError:
                    print(self.MSG_ERR_2)
                    sys.exit(1)
            self.utc = self.jst - timedelta(hours=self.JST_UTC)
        except Exception as e:
            raise

    def __display(self):
        """ 結果出力 """
        try:
            print((
                "      JST: {}\n"
                "      UTC: {}\n"
                "JST - UTC: {} hours\n"
                "       JD: {:.10f} days\n"
                "        T: {:.10f} century (= Julian Century Number)\n"
                "UTC - TAI: {} seconds (= amount of leap seconds)\n"
                "     DUT1: {:.1f} seconds\n"
                "  delta T: {:.3f} seconds\n"
                "      TAI: {}\n"
                "      UT1: {}\n"
                "       TT: {}\n"
                "      TCG: {}\n"
                "      TCB: {}\n"
                "   JD_TCB: {:.10f} days\n"
                "      TDB: {}"
            ).format(
                self.jst.strftime('%Y-%m-%d %H:%M:%S.%f'),
                self.utc.strftime('%Y-%m-%d %H:%M:%S.%f'),
                self.JST_UTC,
                self.jd,
                self.t,
                self.utc_tai,
                self.dut1,
                self.dt,
                self.tai.strftime('%Y-%m-%d %H:%M:%S.%f'),
                self.ut1.strftime('%Y-%m-%d %H:%M:%S.%f'),
                self.tt .strftime('%Y-%m-%d %H:%M:%S.%f'),
                self.tcg.strftime('%Y-%m-%d %H:%M:%S.%f'),
                self.tcb.strftime('%Y-%m-%d %H:%M:%S.%f'),
                self.jd_tcb,
                self.tdb.strftime('%Y-%m-%d %H:%M:%S.%f')
            ))
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = ConvTime()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

次のスクリプトはライブラリ部分。（lib ディレクトリを作成後、その配下へ）  

* うるう秒の最新情報は、「[うるう秒実施日一覧](http://jjy.nict.go.jp/QandA/data/leapsec.html)」で確認すること。
* DUT1 の最新情報は、「[日本標準時プロジェクト Announcement of DUT1](http://jjy.nict.go.jp/QandA/data/dut1.html)」で確認すること。
* うるう秒が実施されていない時期のΔTは、 NASA 提供の略算式による。（参照： [NASA - Polynomial Expressions for Delta T](http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html)）

File: `lib/time_.py`

{% highlight python linenos %}
"""
各種時刻換算用ライブラリ
"""
import datetime


# Constants
J2000   = 2451545          # Reference epoch (J2000.0), Julian Date
JC      = 36525            # Days per Julian century
DAYSEC  = 86400            # Seconds per a day
TT_TAI  = 32.184           # TT - TAI
L_G     = 6.969290134e-10  # for TCG
L_B     = 1.550519768e-8   # for TCB, TDB
T_0     = 2443144.5003725  # for TCG, TDB, TCB
TDB_0   = -6.55e-5         # for TDB
LEAP_SEC = [
    ["19720101", -10],
    ["19720701", -11],
    ["19730101", -12],
    ["19740101", -13],
    ["19750101", -14],
    ["19760101", -15],
    ["19770101", -16],
    ["19780101", -17],
    ["19790101", -18],
    ["19800101", -19],
    ["19810701", -20],
    ["19820701", -21],
    ["19830701", -22],
    ["19850701", -23],
    ["19880101", -24],
    ["19900101", -25],
    ["19910101", -26],
    ["19920701", -27],
    ["19930701", -28],
    ["19940701", -29],
    ["19960101", -30],
    ["19970701", -31],
    ["19990101", -32],
    ["20060101", -33],
    ["20090101", -34],
    ["20120701", -35],
    ["20150701", -36],
    ["20170101", -37],
    ["20190101",   0]  # (<= Provisional end-point)
]
DUT1 = [
    ["19880317",  0.2],
    ["19880512",  0.1],
    ["19880825",  0.0],
    ["19881110", -0.1],
    ["19890119", -0.2],
    ["19890406", -0.3],
    ["19890608", -0.4],
    ["19890921", -0.5],
    ["19891116", -0.6],
    ["19900101",  0.3],
    ["19900301",  0.2],
    ["19900412",  0.1],
    ["19900510",  0.0],
    ["19900726", -0.1],
    ["19900920", -0.2],
    ["19901101", -0.3],
    ["19910101",  0.6],
    ["19910207",  0.5],
    ["19910321",  0.4],
    ["19910425",  0.3],
    ["19910620",  0.2],
    ["19910822",  0.1],
    ["19911017",  0.0],
    ["19911121", -0.1],
    ["19920123", -0.2],
    ["19920227", -0.3],
    ["19920402", -0.4],
    ["19920507", -0.5],
    ["19920701",  0.4],
    ["19920903",  0.3],
    ["19921022",  0.2],
    ["19921126",  0.1],
    ["19930114",  0.0],
    ["19930218", -0.1],
    ["19930401", -0.2],
    ["19930506", -0.3],
    ["19930701",  0.6],
    ["19930819",  0.5],
    ["19931007",  0.4],
    ["19931118",  0.3],
    ["19931230",  0.2],
    ["19940210",  0.1],
    ["19940317",  0.0],
    ["19940421", -0.1],
    ["19940609", -0.2],
    ["19940701",  0.8],
    ["19940811",  0.7],
    ["19941006",  0.6],
    ["19941117",  0.5],
    ["19941222",  0.4],
    ["19950223",  0.3],
    ["19950316",  0.2],
    ["19950413",  0.1],
    ["19950525",  0.0],
    ["19950713", -0.1],
    ["19950907", -0.2],
    ["19951026", -0.3],
    ["19951130", -0.4],
    ["19960101",  0.5],
    ["19960222",  0.4],
    ["19960411",  0.3],
    ["19960516",  0.2],
    ["19960808",  0.1],
    ["19961003",  0.0],
    ["19961205", -0.1],
    ["19970206", -0.2],
    ["19970320", -0.3],
    ["19970508", -0.4],
    ["19970626", -0.5],
    ["19970701",  0.5],
    ["19970918",  0.4],
    ["19971030",  0.3],
    ["19971218",  0.2],
    ["19980219",  0.1],
    ["19980326",  0.0],
    ["19980507", -0.1],
    ["19980813", -0.2],
    ["19981126", -0.3],
    ["19990101",  0.7],
    ["19990304",  0.6],
    ["19990527",  0.5],
    ["19991014",  0.4],
    ["20000106",  0.3],
    ["20000413",  0.2],
    ["20001019",  0.1],
    ["20010301",  0.0],
    ["20011004", -0.1],
    ["20020214", -0.2],
    ["20021024", -0.3],
    ["20030403", -0.4],
    ["20040429", -0.5],
    ["20050317", -0.6],
    ["20060101",  0.3],
    ["20060427",  0.2],
    ["20060928",  0.1],
    ["20061222",  0.0],
    ["20070315", -0.1],
    ["20070614", -0.2],
    ["20071129", -0.3],
    ["20080313", -0.4],
    ["20080807", -0.5],
    ["20081120", -0.6],
    ["20090101",  0.4],
    ["20090312",  0.3],
    ["20090611",  0.2],
    ["20091112",  0.1],
    ["20100311",  0.0],
    ["20100603", -0.1],
    ["20110106", -0.2],
    ["20110512", -0.3],
    ["20111104", -0.4],
    ["20120209", -0.5],
    ["20120510", -0.6],
    ["20120701",  0.4],
    ["20121025",  0.3],
    ["20130131",  0.2],
    ["20130411",  0.1],
    ["20130822",  0.0],
    ["20131121", -0.1],
    ["20140220", -0.2],
    ["20140508", -0.3],
    ["20140925", -0.4],
    ["20141225", -0.5],
    ["20150319", -0.6],
    ["20150528", -0.7],
    ["20150701",  0.3],
    ["20150917",  0.2],
    ["20151126",  0.1],
    ["20160131",  0.0],
    ["20160324", -0.1],
    ["20160519", -0.2],
    ["20160901", -0.3],
    ["20161117", -0.4],
    ["20170101",  0.6],
    ["20170126",  0.5],
    ["20170330",  0.4],
    ["20170629",  0.3],
    ["20171130",  0.2],
    ["20180315",  0.1],
    ["20180615",  0.0]  # (<= Provisional end-point)
]


def gc2jd(gc):
    """ ユリウス日の計算

    :param  datetime gc: グレゴリオ暦
    :return float    jd: ユリウス日
    """
    year, month,  day    = gc.year, gc.month,  gc.day
    hour, minute, second = gc.hour, gc.minute, gc.second
    second += gc.microsecond
    try:
        if month < 3:
            year  -= 1
            month += 12
        d = int(365.25 * year) + year // 400  - year // 100 \
          + int(30.59 * (month - 2)) + day + 1721088.5
        t  = (second / 3600 + minute / 60 + hour) / 24
        return d + t
    except Exception as e:
        raise

def jd2t(jd):
    """ ユリウス世紀数の計算

    :param  float jd: ユリウス日
    :return float  t: ユリウス世紀数
    """
    try:
        return (jd - J2000) / JC
    except Exception as e:
        raise

def utc2utc_tai(utc):
    """ UTC - TAI (協定世界時と国際原子時の差 = うるう秒の総和)

    :param  datetime  utc: 協定世界時
    :return float utc_tai: 協定世界時と国際原子時の差(うるう秒の総和)
                           (Unit: seconds)
    """
    utc_tai = 0
    target = utc.strftime("%Y%m%d")
    try:
        for date, sec in reversed(LEAP_SEC):
            if date <= target:
                utc_tai = sec
                break
        return utc_tai
    except Exception as e:
        raise

def utc2dut1(utc):
    """ DUT1 (= UT1(世界時1) - UTC(協定世界時)) の取得
        * Ref: http://jjy.nict.go.jp/QandA/data/dut1.html

    :param  datetime utc: 協定世界時
    :return float   dut1: DUT1 (Unit: seconds)
    """
    dut1 = 0
    target = utc.strftime("%Y%m%d")
    try:
        for date, sec in reversed(DUT1):
            if date <= target:
                dut1 = sec
                break
        return dut1
    except Exception as e:
        raise

def utc2dt(utc):
    """ UTC -> ΔT
        * うるう秒調整が明確な場合は、うるう秒総和を使用した計算
        * そうでない場合は、NASA の計算式による計算

    :param  datetime utc: 協定世界時
    :return float     dt: ΔT (Unit: seconds)
    """
    try:
        if                        utc.year <  -500:
            dt = __dt_before_m500(utc)
        elif -500 <= utc.year and utc.year <   500:
            dt = __dt_before_500(utc)
        elif  500 <= utc.year and utc.year <  1600:
            dt = __dt_before_1600(utc)
        elif 1600 <= utc.year and utc.year <  1700:
            dt = __dt_before_1700(utc)
        elif 1700 <= utc.year and utc.year <  1800:
            dt = __dt_before_1800(utc)
        elif 1800 <= utc.year and utc.year <  1860:
            dt = __dt_before_1860(utc)
        elif 1860 <= utc.year and utc.year <  1900:
            dt = __dt_before_1900(utc)
        elif 1900 <= utc.year and utc.year <  1920:
            dt = __dt_before_1920(utc)
        elif 1920 <= utc.year and utc.year <  1941:
            dt = __dt_before_1941(utc)
        elif 1941 <= utc.year and utc.year <  1961:
            dt = __dt_before_1961(utc)
        elif 1961 <= utc.year and utc.year <  1986:
            dt = __dt_before_1986(utc)
        elif 1986 <= utc.year and utc.year <  2005:
            dt = __dt_before_2005(utc)
        elif 2005 <= utc.year and utc.year <  2050:
            dt = __dt_before_2050(utc)
        elif 2050 <= utc.year and utc.year <= 2150:
            dt = __dt_until_2150(utc)
        elif 2150 <  utc.year:
            dt = __dt_after_2150(utc)
        return dt
    except Exception as e:
        raise

def __dt_before_m500(utc):
    """ year < -500    dt: ΔT

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = (y - 1820) / 100
    try:
        return -20 + 32 * t ** 2
    except Exception as e:
        raise

def __dt_before_500(utc):
    """ -500 <= year and year < 500

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = y / 100
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

def __dt_before_1600(utc):
    """ 500 <= year and year < 1600

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = (y - 1000) / 100
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

def __dt_before_1700(utc):
    """ 1600 <= year and year < 1700

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = y - 1600
    try:
        return 120           \
            + ( -0.9808      \
            + ( -0.01532     \
            + (  1.0 / 7129) \
            * t) * t) * t
    except Exception as e:
        raise

def __dt_before_1800(utc):
    """ 1700 <= year and year < 1800

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = y - 1700
    try:
        return 8.83           \
           + ( 0.1603         \
           + (-0.0059285      \
           + ( 0.00013336     \
           + (-1.0 / 1174000) \
           * t) * t) * t) * t
    except Exception as e:
        raise

def __dt_before_1860(utc):
    """ 1800 <= year and year < 1860

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = y - 1800
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

def __dt_before_1900(utc):
    """ 1860 <= year and year < 1900

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = y - 1860
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

def __dt_before_1920(utc):
    """ 1900 <= year and year < 1920

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = y - 1900
    try:
        return -2.79      \
            + ( 1.494119  \
            + (-0.0598939 \
            + ( 0.0061966 \
            + (-0.000197) \
            * t) * t) * t) * t
    except Exception as e:
        raise

def __dt_before_1941(utc):
    """ 1920 <= year and year < 1941

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = y - 1920
    try:
        return 21.20       \
            + ( 0.84493    \
            + (-0.076100   \
            + ( 0.0020936) \
            * t) * t) * t
    except Exception as e:
        raise

def __dt_before_1961(utc):
    """ 1941 <= year and year < 1961

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = y - 1950
    try:
        return 29.07        \
            + ( 0.407       \
            + (-1.0 / 233   \
            + ( 1.0 / 2547) \
            * t) * t) * t
    except Exception as e:
        raise

def __dt_before_1986(utc):
    """ 1961 <= year and year < 1986

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = y - 1975
    try:
        if utc < datetime.datetime(1972, 1, 1):
            # 1972年1月より前は NASA 提供の略算式で
            return 45.45       \
                + ( 1.067      \
                + (-1.0 / 260  \
                + (-1.0 / 718) \
                * t) * t) * t
        elif utc < datetime.datetime(1972, 7, 1):
            return TT_TAI + 10
        elif utc < datetime.datetime(1973, 1, 1):
            return TT_TAI + 11
        elif utc < datetime.datetime(1974, 1, 1):
            return TT_TAI + 12
        elif utc < datetime.datetime(1975, 1, 1):
            return TT_TAI + 13
        elif utc < datetime.datetime(1976, 1, 1):
            return TT_TAI + 14
        elif utc < datetime.datetime(1977, 1, 1):
            return TT_TAI + 15
        elif utc < datetime.datetime(1978, 1, 1):
            return TT_TAI + 16
        elif utc < datetime.datetime(1979, 1, 1):
            return TT_TAI + 17
        elif utc < datetime.datetime(1980, 1, 1):
            return TT_TAI + 18
        elif utc < datetime.datetime(1981, 7, 1):
            return TT_TAI + 19
        elif utc < datetime.datetime(1982, 7, 1):
            return TT_TAI + 20
        elif utc < datetime.datetime(1983, 7, 1):
            return TT_TAI + 21
        elif utc < datetime.datetime(1985, 7, 1):
            return TT_TAI + 22
        elif utc < datetime.datetime(1988, 1, 1):
            return TT_TAI + 23
    except Exception as e:
        raise

def __dt_before_2005(utc):
    """ 1986 <= year and year < 2005

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = y - 2000
    try:
        # 以下の7行は NASA 提供の略算式
        #return 63.86           \
        #    + ( 0.3345         \
        #    + (-0.060374       \
        #    + ( 0.0017275      \
        #    + ( 0.000651814    \
        #    + ( 0.00002373599) \
        #    * t) * t) * t) * t) * t
        if utc < datetime.datetime(1988, 1, 1):
            return TT_TAI + 23
        elif utc < datetime.datetime(1990, 1, 1):
            return TT_TAI + 24
        elif utc < datetime.datetime(1991, 1, 1):
            return TT_TAI + 25
        elif utc < datetime.datetime(1992, 7, 1):
            return TT_TAI + 26
        elif utc < datetime.datetime(1993, 7, 1):
            return TT_TAI + 27
        elif utc < datetime.datetime(1994, 7, 1):
            return TT_TAI + 28
        elif utc < datetime.datetime(1996, 1, 1):
            return TT_TAI + 29
        elif utc < datetime.datetime(1997, 7, 1):
            return TT_TAI + 30
        elif utc < datetime.datetime(1999, 1, 1):
            return TT_TAI + 31
        elif utc < datetime.datetime(2006, 1, 1):
            return TT_TAI + 32
    except Exception as e:
        raise

def __dt_before_2050(utc):
    """ 2005 <= year and year < 2050

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = y - 2000
    try:
        if utc < datetime.datetime(2006, 1, 1):
            return TT_TAI + 32
        elif utc < datetime.datetime(2009, 1, 1):
            return TT_TAI + 33
        elif utc < datetime.datetime(2012, 7, 1):
            return TT_TAI + 34
        elif utc < datetime.datetime(2015, 7, 1):
            return TT_TAI + 35
        elif utc < datetime.datetime(2017, 1, 1):
            return TT_TAI + 36
        elif utc < datetime.datetime(2019, 1, 1):
            # 第28回うるう秒実施までの暫定措置
            return TT_TAI + 37
        else:
            # 2019年1月以降は NASA 提供の略算式で
            return 62.92      \
                + ( 0.32217   \
                + ( 0.005589) \
                * t) * t
    except Exception as e:
        raise

def __dt_until_2150(utc):
    """ 2050 <= year and year <= 2150

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    try:
        return - 20 \
               + 32 * ((y - 1820) / 100) ** 2 \
               - 0.5628 * (2150 - y)
    except Exception as e:
        raise

def __dt_after_2150(utc):
    """ 2150 < year

    :param datetime utc: 協定世界時
    :return float    dt: ΔT
    """
    y = utc.year + (utc.month - 0.5) / 12
    t = (y - 1820) / 100
    try:
        return -20 + 32 * t ** 2
    except Exception as e:
        raise

def utc2tai(utc, utc_tai):
    """ UTC(協定世界時) -> TAI(国際原子時)
        * TAI = UTC - UTC_TAI

    :param  datetime     utc: 協定世界時
    :param  datetime utc_tai: 協定世界時と国際原子時の差(うるう秒の総和)
    :return datetime     tai: 国際原子時
    """
    try:
        return utc - datetime.timedelta(seconds=utc_tai)
    except Exception as e:
        raise

def utc2ut1(utc, dut1):
    """ UTC(協定世界時) -> UT1(世界時1)
        * UT1 = UTC + DUT1

    :param  datetime  utc: 協定世界時
    :param  datetime dut1: DUT1
    :return datetime  ut1: 世界時1
    """
    try:
        return utc + datetime.timedelta(seconds=dut1)
    except Exception as e:
        raise

def tai2tt(tai):
    """ TAI(協定世界時) -> TT(地球時) 
        * TT = TAI + TT_TAI
             = UT1 + ΔT

    :param  datetime tai: 国際原子時
    :return datetime  tt: 地球時
    """
    try:
        return tai + datetime.timedelta(seconds=TT_TAI)
    except Exception as e:
        raise

def tt2tcg(tt, jd):
    """ TT(地球時) -> TCG(地球重心座標時)
        * TCG = TT + L_G * (JD - T_0) * 86400
          （JD: ユリウス日,
            L_G = 6.969290134 * 10^(-10), T_0 = 2,443,144.5003725）

    :param  datetime  tt: 地球時
    :param  float     jd: ユリウス日
    :return datetime tcg: 地球重心座標時
    """
    try:
        s = L_G * (jd - T_0) * DAYSEC
        return tt + datetime.timedelta(seconds=s)
    except Exception as e:
        raise

def tt2tcb(tt, jd):
    """ TT(地球時) -> TCB(太陽系重心座標時)
        * TCB = TT + L_B * (JD - T_0) * 86400

    :param  datetime  tt: 地球時
    :param  float     jd: ユリウス日
    :return datetime tcb: 太陽系重心座標時
    """
    try:
        s = L_B * (jd - T_0) * DAYSEC
        return tt + datetime.timedelta(seconds=s)
    except Exception as e:
        raise

def tcb2tdb(tcb, jd_tcb):
    """ TCB(太陽系重心座標時) -> TDB(太陽系力学時)
        * TDB = TCB - L_B * (JD_TCB - T_0) * 86400 + TDB_0

    :param  datetime tcb: 太陽系重心座標時
    :param  float jd_tcb: ユリウス日 (for TCB)
    :return datetime tdb: 太陽系力学時
    """
    try:
        s = L_B * (jd_tcb - T_0) * DAYSEC - TDB_0
        return tcb - datetime.timedelta(seconds=s)
    except Exception as e:
        raise
{% endhighlight %}

* [Gist - Python script to convert time series.](https://gist.github.com/komasaru/2186817d0814064dfc56dc34e0f6461e "Gist - Python script to convert time series.")

### 3. Python スクリプトの実行

引数に JST（日本標準時; UTC + 9）で年月日 or 年月日時分秒を指定して実行。（引数無指定で、システム日時を JST と判断する）

``` text
$ ./conv_time.py 20180630123456
      JST: 2018-06-30 12:34:56.000000
      UTC: 2018-06-30 03:34:56.000000
JST - UTC: 9 hours
       JD: 2458299.6492592595 days
        T: 0.1849322179 century (= Julian Century Number)
UTC - TAI: -37 seconds (= amount of leap seconds)
     DUT1: 0.0 seconds
  delta T: 69.184 seconds
      TAI: 2018-06-30 03:35:33.000000
      UT1: 2018-06-30 03:34:56.000000
       TT: 2018-06-30 03:36:05.184000
      TCG: 2018-06-30 03:36:06.096562
      TCB: 2018-06-30 03:36:25.486581
   JD_TCB: 2458299.6502893521 days
      TDB: 2018-06-30 03:36:05.183933
```

---

特に、 TT, TDB, TCG, TCB あたりは天文学的な計算を行う際に必要になってきます。

以上。

