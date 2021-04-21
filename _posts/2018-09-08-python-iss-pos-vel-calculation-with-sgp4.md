---
layout   : single
title    : "Python - ISS 位置／速度計算（SGP4 アルゴリズム）！"
published: true
date     : 2018-09-08 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Python
- 人工衛星
---

Python で、 NASA 提供の最新の TLE（2行軌道要素形式）、IERS 提供の最新の EOP（地球回転パラメータ）、最新のうるう秒総和(DAT = TAI - UTC)等から、 SGP4 アルゴリズムを用いて ISS の位置と移動速度を計算してみました。

<!--more-->

### 0. 前提条件

* Python 3.6.5 での動作を想定。
* 当方、 Python の複数バージョンが共存する環境のため、 3.6 系は `python3.6`, `pip3.6` で使用できるようにしている。
* ここでは、各種座標系、 SGP4 アルゴリズム（Simplified General Perturbations Satellite Orbit Model 4; NASA, NORAD が使用している、近地球域の衛星の軌道計算用で、周回周期225分未満の衛星に使用すべきアルゴリズム）等についての詳細は説明しない。

### 1. 事前準備

まず、計算に使用する TLE データを用意する。  
  ここでは詳細に説明しないが、「[こちらのページ](https://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html "Human Space Flight (HSF) - Realtime Data")」から TLE データのみを抽出したテキストファイルを "data/tle_iss_nasa.txt" として配置する。（当方、「[Python - TLE（2行軌道要素形式）の取得(NASA）！]({{site.baseurl}}/2018/08/14/python-tle-getting-from-nasa "Python - TLE（2行軌道要素形式）の取得(NASA)！")」を応用（改造）して、日々自動で最新の情報に更新している）

File: `data/tle_iss_nasa.txt`

{% highlight text linenos %}
1 25544U 98067A   18176.55918965  .00016717  00000-0  10270-3 0  9008
2 25544  51.6377 336.9772 0003910 225.4028 134.6805 15.53973338 39819

1 25544U 98067A   18177.52382121  .00016717  00000-0  10270-3 0  9016
2 25544  51.6380 332.1703 0003810 229.4612 130.6209 15.53978055 39968

         :
===< 以下、省略 >===
         :
{% endhighlight %}

次に、 EOP データを用意する。  
「[Ruby, Python - EOP（地球姿勢パラメータ）CSV 生成！]({{site.baseurl}}/2018/08/29/ruby-python-eop-getting-from-iers "Ruby, Python - EOP（地球姿勢パラメータ）CSV 生成！")」を利用する。  
当方、日々自動で最新のデータに更新するようにしている。当 CSV データ生成に使用する元のデータも、自動で FTP 取得するようにしている。（ファイル名： "data/eop.csv"）

File: `data/eop.csv`

{% highlight text linenos %}
1973-01-02,41684.0,F,0.143,0.0,0.137,0.0,F,0.8075,0.0,0.0,0.1916,F,-18.637,0.0,-3.667,0.0
1973-01-03,41685.0,F,0.141,0.0,0.134,0.0,F,0.8044,0.0,3.5563,0.1916,F,-18.636,0.0,-3.571,0.0
1973-01-04,41686.0,F,0.139,0.0,0.131,0.0,F,0.8012,0.0,2.6599,0.1916,F,-18.669,0.0,-3.621,0.0
1973-01-05,41687.0,F,0.137,0.0,0.128,0.0,F,0.7981,0.0,3.0344,0.1916,F,-18.751,0.0,-3.769,0.0
1973-01-06,41688.0,F,0.136,0.0,0.126,0.0,F,0.7949,0.0,3.1276,0.1916,F,-18.868,0.0,-3.868,0.0

         :
===< 以下、省略 >===
         :
{% endhighlight %}

最後に、うるう秒総和(DAT = TAI - UTC)を用意する。  
頻繁更新されるものではないので、スクリプト内で定数として設定してもよいが、当方は、「[こちら](https://hpiers.obspm.fr/iers/bul/bulc/Leap_Second.dat)」のファイルをダウンロードして使用するようにしている。  
当方、日々自動でダウンロードしている。（ファイル名： "file/Leap_Second.dat"）

File: `file/Leap_Second.dat`

{% highlight text linenos %}
       :
===< 中略 >===
       :

    53736.0    1  1 2006       33
    54832.0    1  1 2009       34
    56109.0    1  7 2012       35
    57204.0    1  7 2015       36
    57754.0    1  1 2017       37
{% endhighlight %}

【注】"file" ディレクトリはダウンロードしただけのファイル用、 "data" ディレクトリは加工済みデータ用として分けている。

### 2. PyPI ライブラリのインストール

公開されている SGP4 用ライブラリを使用するので、インストールしておく。（計算の根源(SGP4)部分は奥が深すぎて、自力で実装するには難があるので）

``` text
$ sudo pip3.6 install sgp4
```

### 3. Python スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 計算の流れが分かるよう、 `exec` メソッドにコメントを記述している。

File: `iss_sgp4.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Getting of ISS position.

  Date          Author          Version
  2018.06.10    mk-mode.com     1.00 新規作成
  2018.11.27    mk-mode.com     1.01 EOP からの Polar Motion(y 値) 取得に
                                     誤りがあったため修正

Copyright(C) 2018 mk-mode.com All Rights Reserved.
---
  引数: 日時(JST)
          書式：YYYYMMDD or YYYYMMDDHHMMSS
          無指定なら現在(システム日時)を JST とみなす。
---
  MEMO:
    TEME: True Equator, Mean Equinox; 真赤道面平均春分点
     PEF: Pseudo Earth Fixed; 擬地球固定座標系
    ECEF: Earth Centered, Earth Fixed; 地球中心・地球固定直交座標系
"""
import math
import re
import sys
import traceback
import numpy as np
from datetime import datetime
from datetime import timedelta
from sgp4.earth_gravity import wgs84
from sgp4.io import twoline2rv


class IssSgp4:
    JST_UTC = 9
    PI2 = math.pi * 2    # => 6.283185307179586
    D2R = math.pi / 180  # => 0.017453292519943295
    CSV_EOP  = "data/eop.csv"
    FILE_DAT = "file/Leap_Second.dat"
    FILE_TLE = "data/tle_iss_nasa.txt"
    PTN_0 = re.compile(r'\n')
    PTN_1 = re.compile(r',')
    PTN_2 = re.compile(r'\s+')
    PI_180 = math.pi / 180.0
    # 以下、 WGS84 座標パラメータ
    A     = 6378137.0              # a(地球楕円体長半径(赤道面平均半径))
    ONE_F = 298.257223563          # 1 / f(地球楕円体扁平率=(a - b) / a)
    B     = A * (1 - 1 / ONE_F)    # b(地球楕円体短半径)
    E2    = (1 / ONE_F) * (2 - (1 / ONE_F))
                                   # e^2 = 2 * f - f * f
                                   #     = (a^2 - b^2) / a^2
    ED2    = E2 * A * A / (B * B)  # e'^2= (a^2 - b^2) / b^2

    def __init__(self):
        # コマンドライン引数取得
        self.__get_arg()
        # 各種時刻換算
        self.utc = self.jst - timedelta(hours=self.JST_UTC)
        eop = self.__get_eop()
        flag_pm, self.pm_x, self.pm_y = eop[2], float(eop[3]), float(eop[5])
        flag_dut, dut1 = eop[7], float(eop[8])
        self.lod = 0.0 if eop[10] == "" else float(eop[10])
        self.ut1 = self.utc + timedelta(seconds=dut1)
        dat = self.__get_dat()
        tai = self.utc + timedelta(seconds=dat)
        tt = tai + timedelta(seconds=32.184)
        self.jd_ut1 = self.__gc2jd(self.ut1)
        jd_tt = self.__gc2jd(tt)
        self.t_tt= (jd_tt - 2451545) / 36525
        # TLE 取得
        self.tle_1, self.tle_2 = self.__get_tle(self.utc)
        print((
            "[初期データ]\n"
            "{} JST\n"
            "{} UTC\n"
            "DUT1 = {} sec.\n"
            "{} UT1 ({})\n"
            "TAI - UTC = {} sec.\n"
            "{} TAI\n"
            "{} TT\n"
            "JD(UT1) = {} day.\n"
            " JD(TT) = {} day.\n"
            "  T(TT) = {}\n"
            "    LOD = {} msec.\n"
            "Polar Motion = [{} mas., {} mas.] ({})\n"
            "TLE = {}\n      {}"
        ).format(
            self.jst.strftime("%Y-%m-%d %H:%M:%S.%f"),
            self.utc.strftime("%Y-%m-%d %H:%M:%S.%f"),
            dut1,
            self.ut1.strftime("%Y-%m-%d %H:%M:%S.%f"),
            flag_dut,
            dat,
            tai.strftime("%Y-%m-%d %H:%M:%S.%f"),
            tt.strftime("%Y-%m-%d %H:%M:%S.%f"),
            self.jd_ut1,
            jd_tt,
            self.t_tt,
            self.lod,
            self.pm_x, self.pm_y, flag_pm,
            self.tle_1, self.tle_2
        ))

    def exec(self):
        """ Execution """
        print("\n[途中経過]")
        try:
            # ISS 位置／速度取得
            pos, vel = self.__get_pv(self.tle_1, self.tle_2, self.ut1)
            print((
                "TEME POS = {}\n"
                "     VEL = {}"
            ).format(pos, vel))
            # GMST（グリニッジ平均恒星時）計算
            gmst = self.__calc_gmst(self.jd_ut1)
            print("GMST = {} rad.".format(gmst))
            # Ω（月の平均昇交点黄経）計算（IAU1980章動理論）
            om = self.__calc_om(self.t_tt)
            print("om =", om)
            # GMST に運動項を適用（1997年より新しい場合）
            gmst_g = self.__apply_kinematic(gmst, self.jd_ut1, om)
            print("GMST_G = {} rad.".format(gmst_g))
            # GMST 回転行列（z軸を中心とした回転）
            mtx_z = self.__r_z(gmst_g)
            print("ROTATE MATRIX(for GMST) =\n{}".format(mtx_z))
            # 極運動(Polar Motion)回転行列
            pm_x_r = self.pm_x * math.pi / (180 * 60 * 60 * 1000)
            pm_y_r = self.pm_y * math.pi / (180 * 60 * 60 * 1000)
            print("Polar Motion [x, y] =\n[{} rad., {} rad.]" \
                .format(pm_x_r, pm_y_r))
            mtx_pm = self.__r_pm(pm_x_r, pm_y_r, self.t_tt)
            print("ROTATE MATRIX(for Polar Motion) =\n{}".format(mtx_pm))
            # PEF 座標の計算（GMST 回転行列の適用）
            pos = np.matrix([[pos[0]],[pos[1]],[pos[2]]])
            r_pef = mtx_z * pos
            print("POSITION(PEF) =\n{}".format(r_pef.T))
            # ECEF 座標（位置）の計算（極運動(Polar Motion)の適用）
            r_ecef = mtx_pm * r_pef
            print("POSITION(ECEF) =\n{}".format(r_ecef.T))
            # Ω_earth値の計算
            om_e = self.__calc_om_e(self.lod)
            print("om_earth =\n{}".format(om_e))
            # PEF 座標（速度）の計算（GMST 回転行列の適用）
            vel = np.matrix([[vel[0]], [vel[1]], [vel[2]]])
            v_pef = mtx_z * vel - np.cross(om_e, r_pef.T).T
            print("VELOCITY(PEF) =\n{}".format(v_pef.T))
            # ECEF 座標（速度）の計算（極運動(Polar Motion)の適用）
            v_ecef = mtx_pm * v_pef
            print("VELOCITY(ECEF) =\n{}".format(v_ecef.T))
            # ECEF 座標 => BLH(Beta, Lambda, Height) 変換
            x, y, z = r_ecef[0, 0], r_ecef[1, 0], r_ecef[2, 0]
            lat, lon, ht = self.__ecef2blh(x, y, z)
            vel_ecef = math.sqrt(
                sum(map(lambda x: x * x, v_ecef.T.tolist()[0]))
            )
            # 結果出力
            print((
                "\n[計算結果]\nWGS84(BLH):\n"
                "  POSITION  LAT = {:9.4f} °\n"
                "            LON = {:9.4f} °\n"
                "         HEIGHT = {:9.4f} km\n"
                "  VELOCITY      = {:9.4f} km/s"
            ).format(lat, lon, ht, vel_ecef))
        except Exception as e:
            raise

    def __get_arg(self):
        """ コマンドライン引数の取得
            * 引数で指定した日時を self.jst に設定
            * 引数が存在しなければ、現在時刻を self.jst に設定
        """
        try:
            if len(sys.argv) < 2:
                self.jst = datetime.now()
                return
            if re.search(r"^(\d{8}|\d{14})$", sys.argv[1]):
                dt = sys.argv[1].ljust(14, "0")
            else:
                sys.exit(0)
            try:
                self.jst = datetime.strptime(dt, "%Y%m%d%H%M%S")
            except ValueError as e:
                print("Invalid date!")
                sys.exit(0)
        except Exception as e:
            raise

    def __get_eop(self):
        """ EOP （地球回転パラメータ）取得
            * 予め作成しておいた CSV データから取得する

        :return list eop: [date, mjd, flag_pm, pm_x, pm_x_e, pm_y, pm_y_e,
                           flag_dut, dut1, dut1_e, lod, lod_e,
                           flag_nut, nut_x, nut_x_e, nut_y, nut_y_e]
        """
        eop = []
        try:
            with open(self.CSV_EOP, "r") as f:
                csv = f.read()
            lines = re.split(self.PTN_0, csv.strip())
            for l in reversed(lines):
                items = re.split(self.PTN_1, l)
                if items[0] == self.utc.strftime("%Y-%m-%d"):
                    eop = items
                    break
            return eop
        except Exception as e:
            raise

    def __get_dat(self):
        """ DAT (= TAI - UTC)（うるう秒の総和）取得
            * 予め取得しておいたテキストファイルから取得する

        :return int dat: DAT = TAI - UTC
        """
        dat = 0
        try:
            with open(self.FILE_DAT, "r") as f:
                for l in reversed(f.readlines()):
                    items = re.split(self.PTN_2, l.strip())
                    if items[0] == "#":
                        break
                    date = "{:04d}-{:02d}-{:02d}".format(
                        int(items[3]), int(items[2]), int(items[1])
                    )
                    dat = int(items[-1])
                    if date <= self.utc.strftime("%Y-%m-%d"):
                        break
            return dat
        except Exception as e:
            raise

    def __gc2jd(self, gc):
        """ GC（グレゴリオ暦） -> JD（ユリウス日） 変換
            * フリーゲルの公式を使用

        :param  datetime gc: グレゴリオ暦
        :return float    jd: ユリウス日
        """
        year, month,  day    = gc.year, gc.month,  gc.day
        hour, minute, second = gc.hour, gc.minute, gc.second
        second += gc.microsecond * 1e-6
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

    def __get_tle(self, utc):
        """ TLE 取得

        :param  datetime utc: UTC
        :return list: [tle_1, tle_2]
        """
        tle = ""
        utc_tle = None
        try:
            with open(self.FILE_TLE, "r") as f:
                txt = f.read()
            for new in reversed(re.split(r'\n\n', txt)):
                tle = new
                item_utc = re.split(" +", tle)[3]
                y = 2000 + int(item_utc[0:2])
                d = float(item_utc[2:])
                utc_tle = datetime(y, 1, 1) + timedelta(days=d)
                if utc_tle <= self.utc:
                    break
            return re.split(r'\n', tle)
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
            t_ut1 = (jd_ut1 - 2451545.0) / 36525.0
            gmst =  67310.54841 \
                 + (876600.0 * 3600.0 + 8640184.812866 \
                 + (0.093104 \
                 -  6.2e-6 * t_ut1) * t_ut1) * t_ut1
            gmst = (gmst * self.D2R / 240) % self.PI2
            if gmst < 0.0:
                gmst += self.PI2
            return gmst
        except Exception as e:
            raise

    def __calc_om(self, t_tt):
        """ Ω（月の平均昇交点黄経）計算（IAU1980章動理論）
            : Ω = 125°02′40″.280
                 - ((5 * 360)° + 134°08′10″.539) * T
                 + 7″.455 * T2
                 + 0″.008 * T3

        :param  float t_tt: ユリウス世紀数(TT)
        :return float   om: Ω（月の平均昇交点黄経）
        """
        try:
            om =  125.04452222  \
               + ((-6962890.5390 \
               +  (7.455 \
               +   0.008 * t_tt) * t_tt) * t_tt) / 3600
            om %= 360
            om *= self.D2R
            return om
        except Exception as e:
            raise

    def __calc_om_e(self, lod):
        """ Ω_earth値の計算

        :param float lod: Length Of Day
        :return np.matrix
        """
        try:
            theta_sa = 7.29211514670698e-05 * (1  - lod / 86400)
            return np.matrix([[0, 0, theta_sa]])
        except Exception as e:
            raise

    def __apply_kinematic(self, gmst, jd_ut1, om):
        """ GMST に運動項を適用（1997年より新しい場合）
            : gmst_g = gmst \
                     + 0.00264 * PI / (3600 * 180) * sin(om) \
                     + 0.000063 * PI / (3600 * 180) * sin(2.0 * om)

        :param float   gmst: GMST（グリニッジ平均恒星時）（適用前）
        :param float jd_ut1: ユリウス日(UT1)
        :param float     om: Ω（月の平均昇交点黄経）
        return float gmst_g: GMST（グリニッジ平均恒星時）（適用後）
        """
        try:
            if jd_ut1 > 2450449.5:
                gmst_g = gmst \
                       + 0.00264 * math.pi / (3600 * 180) * math.sin(om) \
                       + 0.000063 * math.pi / (3600 * 180) * math.sin(2 * om)
            else:
                gmst_g = gmst
            gmst_g %= self.PI2
            return gmst_g
        except Exception as e:
            raise

    def __get_pv(self, tle_1, tle_2, ut1):
        """ ISS 位置／速度取得

        :param  string tle_1: TLE 1行目
        :param  string tle_2: TLE 2行目
        :param  datetime ut1: UT1
        :return list: [position, velocity]
        """
        try:
            sat = twoline2rv(tle_1, tle_2, wgs84)
            pos, vel = sat.propagate(
                ut1.year, ut1.month, ut1.day,
                ut1.hour, ut1.minute, ut1.second
            )
            if sat.error != 0:
                print(sat.error_message)
                sys.exit(0)
            return [pos, vel]
        except Exception as e:
            raise

    def __r_z(self, theta):
        """ 回転行列生成(z軸中心)
              ( cos(θ)  -sin(θ)  0 )
              ( sin(θ)  +cos(θ)  0 )
              (    0         0     1 )

        :param  float     theta: 角度(Unit: rad)
        :return np.matrix r_mtx: 回転行列
        """
        try:
            s, c = np.sin(theta), np.cos(theta)
            r_mtx = np.matrix([
                [  c,   s, 0.0],
                [ -s,   c, 0.0],
                [0.0, 0.0, 1.0]
            ], dtype="float64")
            return r_mtx
        except Exception as e:
            raise

    def __r_pm(self, pm_x, pm_y, t_tt):
        """ 極運動(Polar Motion)回転行列

        :param  float      pm_x: Polar Motion X
        :param  float      pm_y: Polar Motion Y
        :param  float      t_tt: ユリウス世紀数(TT)
        :return np.matrix r_mtx: 回転行列
        """
        try:
            conv = math.pi / (3600 * 180)
            c_xp = np.cos(pm_x)
            s_xp = np.sin(pm_x)
            c_yp = np.cos(pm_y)
            s_yp = np.sin(pm_y)
            # approximate sp value in rad
            sp = -47.0e-6 * t_tt * conv
            s_sp, c_sp = np.sin(sp), np.cos(sp)
            r_mtx = np.matrix([
                [ c_xp * c_sp,
                  c_xp * s_sp,
                  s_xp],
                [-c_yp * s_sp + s_yp * s_xp * c_sp,
                  c_yp * c_sp + s_yp * s_xp * s_sp,
                 -s_yp * c_xp,],
                [-s_yp * s_sp - c_yp * s_xp * c_sp,
                  s_yp * c_sp - c_yp * s_xp * s_sp,
                  c_yp * c_xp]
            ], dtype="float64")
            return r_mtx
        except Exception as e:
            raise

    def __ecef2blh(self, x, y, z):
        """ ECEF 座標 => BLH(Beta, Lambda, Height) 変換
               β = atan {(z + e'^2 * b * sin^3(θ)) / (p − e^2 * a * cos^3(θ))}
               λ = atan (y / x)
               h  = (p / cos(β)) − N
            但し、
                p = sqrt(x^2 + y^2)
               θ = atan(za / pb)
              e^2 = (a^2 - b^2) / a^2
             e'^2 = (a^2 - b^2) / b^2

        :param  float x: X(unit: km)
        :param  float y: Y(unit: km)
        :param  float z: Z(unit: km)
        :return list  blh: BLH [latitude(°), longitude(°), height(km)]
        """
        try:
            x *= 1000
            y *= 1000
            z *= 1000
            n = lambda x: self.A / \
                math.sqrt(1 - self.E2 * math.sin(x * self.PI_180)**2)
            p = math.sqrt(x * x + y * y)
            theta = math.atan2(z * self.A, p * self.B) / self.PI_180
            lat = math.atan2(
                z + self.ED2 * self.B * math.sin(theta * self.PI_180)**3,
                p - self.E2 * self.A * math.cos(theta * self.PI_180)**3
            ) / self.PI_180
            lon = math.atan2(y, x) / self.PI_180
            ht = (p / math.cos(lat * self.PI_180)) - n(lat)
            ht /= 1000
            return [lat, lon, ht]
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = IssSgp4()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to calclulate the ISS position/velocity with SGP4 algorithm.](https://gist.github.com/komasaru/65c6e73e278c5274da2361006af94975 "Gist - Python script to calclulate the ISS position/velocity with SGP4 algorithm.")

### 4. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x iss_sgp4.py
```

そして、コマンドライン引数に JST（日本標準時を）を `YYYYMMDD` or `YYYYMMDDHHMMSS` の書式で指定して実行する。

（計算の流れが分かるよう、途中経過も出力するようにしている）

``` text
$ ./iss_sgp4.py 20180702
[初期データ]
2018-07-02 00:00:00.000000 JST
2018-07-01 15:00:00.000000 UTC
DUT1 = 0.0703261 sec.
2018-07-01 15:00:00.070326 UT1 (P)
TAI - UTC = 37 sec.
2018-07-01 15:00:37.000000 TAI
2018-07-01 15:01:09.184000 TT
JD(UT1) = 2458301.125000814 day.
 JD(TT) = 2458301.125800741 day.
  T(TT) = 0.18497264341521985
    LOD = 0.0 msec.
Polar Motion = [0.15758 mas., 0.002103 mas.] (P)
TLE = 1 25544U 98067A   18181.44661943  .00016717  00000-0  10270-3 0  9069
      2 25544  51.6371 312.6198 0003776 246.6820 113.3935 15.53966319 40575

[途中経過]
TEME POS = (1192.6003206913392, 4689.200073968695, 4748.001287417389)
     VEL = (-5.810595608895324, 4.214560451426063, -2.6989950757139676)
GMST = 2.524055685468248 rad.
om = 2.2214951481154466
GMST_G = 2.524055695357558 rad.
ROTATE MATRIX(for GMST) =
[[-0.8153071   0.57902878  0.        ]
 [-0.57902878 -0.8153071   0.        ]
 [ 0.          0.          1.        ]]
Polar Motion [x, y] =
[7.639693986924068e-10 rad., 1.019563171373354e-11 rad.]
ROTATE MATRIX(for Polar Motion) =
[[ 1.00000000e+00 -4.21483160e-11  7.63969399e-10]
 [ 4.21483160e-11  1.00000000e+00 -1.01956317e-11]
 [-7.63969399e-10  1.01956317e-11  1.00000000e+00]]
POSITION(PEF) =
[[ 1742.846305   -4513.68802818  4748.00128742]]
POSITION(ECEF) =
[[ 1742.84630882 -4513.68802816  4748.00128604]]
om_earth =
[[0.00000000e+00 0.00000000e+00 7.29211515e-05]]
VELOCITY(PEF) =
[[ 6.84862834 -0.19874931 -2.69899508]]
VELOCITY(ECEF) =
[[ 6.84862834 -0.19874931 -2.69899508]]

[計算結果]
WGS84(BLH):
  POSITION  LAT =   44.6400 °
            LON =  -68.8872 °
         HEIGHT =  411.3464 km
  VELOCITY      =    7.3640 km/s
```

### 5. 結果の検証

JAXA 提供のページの情報と比較し、概ね合致していることを確認する。（但し、 このページは目視できる機会に限定されている）

* [「きぼう」を見よう](http://kibo.tksc.jaxa.jp/ "「きぼう」を見よう")

### 6. 参考サイト

* [理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf](https://www.enri.go.jp/~fks442/K_MUSEN/1st/1st060428rev2.pdf "理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf")
* [sgp4 · PyPI](https://pypi.org/project/sgp4/ "sgp4 · PyPI")
* [Python - TLE（2行軌道要素形式）の取得(NASA）！]({{site.baseurl}}/2018/08/14/python-tle-getting-from-nasa "Python - TLE（2行軌道要素形式）の取得(NASA)！")
* [Ruby, Python - EOP（地球姿勢パラメータ）CSV 生成！]({{site.baseurl}}/2018/08/29/ruby-python-eop-getting-from-iers "Ruby, Python - EOP（地球姿勢パラメータ）CSV 生成！")
* [IERS - Earth orientation data](https://www.iers.org/IERS/EN/DataProducts/EarthOrientationData/eop.html "IERS - Earth orientation data")
* [Leap_Second.dat](https://hpiers.obspm.fr/iers/bul/bulc/Leap_Second.dat "Leap_Second.dat")

---

当方、これを応用して、10秒間隔の JSON データを作成したり、特定エリアの上空に進入した際に自動で Twitter に投稿したりしております。

以上。

