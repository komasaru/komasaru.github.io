---
layout   : single
title    : "Python - JPL 天文暦データから ICRS 座標を計算！"
published: true
date     : 2018-07-08 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Python
- カレンダー
---

以前、 NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している月・惑星の暦の最新版 DE430 のバイナリ形式のデータを Ruby で読み込み、さらに、読み込んだデータから ICRS 座標を計算する Ruby スクリプトを作成しました。

* [Ruby - JPL 天文暦データから ICRS 座標を計算！]({{site.baseurl}}/2016/04/30/ruby-calc-jpl-icrs-coordinate "Ruby - JPL 天文暦データから ICRS 座標を計算！")

今回は、同様のことを Python で実現してみました。

<!--more-->

### 0. 前提条件

* Python 3.6.5 での作業を想定。
* 計算には NASA の機関 JPL の提供するバイナリデータを使用するので、以下で紹介するスクリプトと同じディレクトリ内にファイル名 "JPLEPH" として配置しておく。（バイナリデータの準備については「[JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data "JPL 天文暦データのバイナリ化！")」を参照）

### 1. 計算方法

計算方法は、過去記事（＆記事内のリンク）を参照。

* [Ruby - JPL 天文暦データから ICRS 座標を計算！]({{site.baseurl}}/2016/04/30/ruby-calc-jpl-icrs-coordinate "Ruby - JPL 天文暦データから ICRS 座標を計算！")

### 2. Python スクリプトの作成

* スクリプトは、本体 "jpl_calc_de430.py" とライブラリ（バイナリデータ読み込み部分） "lib_calc_de430.py" に分けている。

File: `jpl_calc_de430.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
JPLEPH(JPL の DE430 バイナリデータ)読み込み、座標（位置・速度）を計算

  date          name            version
  2018.04.05    mk-mode.com     1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
----------------------------------------------------------------------
* 引数
  [第１] 対象天体番号（必須）
          1: 水星            (Mercury)
          2: 金星            (Venus)
          3: 地球            (Earth)
          4: 火星            (Mars)
          5: 木星            (Jupiter)
          6: 土星            (Saturn)
          7: 天王星          (Uranus)
          8: 海王星          (Neptune)
          9: 冥王星          (Pluto)
         10: 月              (Moon)
         11: 太陽            (Sun)
         12: 太陽系重心      (Solar system Barycenter)
         13: 地球 - 月の重心 (Earth-Moon Barycenter)
         14: 地球の章動      (Earth Nutations)
         15: 月の秤動        (Lunar mantle Librations)
  [第２] 基準天体番号（必須。 0, 1 - 13）
         （ 0 は、対象天体番号が 14, 15 のときのみ）
  [第３] ユリウス日（省略可。省略時は現在日時をUTCとみなしたユリウス日）

* 注意事項
  - 求める座標は「赤道直角座標(ICRS)」
  - 天体番号は、係数データの番号（並び順）と若干異なるので注意する。
    （特に、天体番号 3, 10, と 12 以降）
    係数データの並び順：
      水星(1)、金星(2)、地球 - 月の重心(3)、火星(4)、木星(5)、土星(6)、
      天王星(7)、海王星(8)、冥王星(9)、月（地心）(10)、太陽(11)、
      地球の章動(12)、月の秤動(13)
  - 時刻系は「太陽系力学時(TDB)」である。（≒地球時(TT)）
  - 天体番号が 1 〜 13 の場合は、 x, y, z の位置・速度（6要素）、
    天体番号が 14 の場合は、黄経における章動 Δψ, 黄道傾斜における章動 Δε の
    角位置・角速度（4要素）、
    天体番号が 15 の場合は、 φ, θ, ψ の角位置・角速度（6要素）。
  - 対象天体番号 = 基準天体番号 は、無意味なので処理しない。
  - 天体番号が 12 の場合は、 x, y, z の位置・速度の値は全て 0.0 とする。
  - その他、JPL 提供の FORTRAN プログラム "testeph.f" を参考にした。
"""
import datetime
import struct
import sys
import traceback
import lib_read_de430


class JplCalcDe430:
    USAGE = (
        "【使用方法】 ./jpl_calc_de430.rb 対象天体番号 基準天体番号 [ユリウス日]\n"
        "【天体番号】（対象: 1 - 15, 基準: 0 - 13）\n"
        "   1: 水星,  2: 金星,  3: 地球,  4: 火星,  5: 木星,\n"
        "   6: 土星,  7: 天王星,  8: 海王星,  9: 冥王星, 10: 月,\n"
        "  11: 太陽,  12: 太陽系重心,  13: 地球 - 月の重心,\n"
        "  14: 地球の章動,  15: 月の秤動,\n"
        "   0: 対象天体番号 14, 15 の場合に指定\n"
        "  ※対象天体番号≠基準天体番号"
    )
    ASTRS = [
        "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus",
        "Neptune", "Pluto", "Moon", "Sun", "Solar system Barycenter",
        "Earth-Moon barycenter", "Earth Nutations", "Lunar mantle Librations"
    ]
    KIND = 2      # 計算区分（0: 計算しない、1: 位置のみ計算、2: 位置・速度を計算）
                  # （但し、現時点では 1 の場合の処理は実装していない）
    BARY = True   # 基準フラグ（True: 太陽系重心が基準, False: 太陽が基準）
    KM   = False  # 単位フラグ（True: km, km/sec, False: AU, AU/day）

    def __init__(self):
        # コマンドライン引数取得
        self.__get_args()
        # DE430 読み込み
        de = lib_read_de430.JplReadDe430(self.jd)
        de.read_de430()
        self.sss    = de.sss
        self.au     = de.au
        self.emrat  = de.emrat
        self.ipts   = de.ipts
        self.jds    = de.jds
        self.coeffs = de.coeffs
        # 各種初期化
        self.lists = [0 for _ in range(12)]     # 計算対象フラグ一覧配列
        self.pvs   = [[0.0 for _ in range(6)] for _ in range(11)]
                                                # 位置・角度データ配列
        self.pvs_2 = [None for _ in range(13)]  # 位置・角度データ配列（対象 - 基準 算出用）
        self.rrds  = [0.0 for _ in range(6)]    # 算出データ（対象 - 基準）配列

    def exec(self):
        """ Execution """
        try:
            self.__check_jd()  # 引数のユリウス日をチェック
            self.__get_list()  # 計算対象フラグ一覧（係数データの並びに対応）取得
            self.__calc()      # 各種計算
            self.__display()   # 結果出力
        except Exception as e:
            raise

    def __get_args(self):
        """ コマンドライン引数取得
            * 第１引数の値をインスタンス変数 self.astrs[0] に設定する
            * 第２引数の値をインスタンス変数 self.astrs[1] に設定する
            * 第３引数の値をインスタンス変数 self.jd に設定する
              （但し、第３引数が存在しない場合は現在日時を設定する）
        """
        try:
            # 対象、基準天体番号
            if len(sys.argv) < 3:
                print(self.USAGE)
                sys.exit(0)
            target, center = int(sys.argv[1]), int(sys.argv[2])
            if ((target < 1 or target > 15) or
                (center < 0 or center > 13) or
                 target == center or
                (target == 14 and center != 0) or
                (target == 15 and center != 0) or
                (target != 14 and target != 15 and center == 0)):
                print(self.USAGE)
                sys.exit(0)
            self.astrs = [target, center]
            # ユリウス日
            if len(sys.argv) > 3:
                self.jd = sys.argv[3]
            else:
                self.jd = self.__gc_to_jd(datetime.datetime.now())
        except Exception as e:
            raise

    def __gc_to_jd(self, t):
        """ 年月日(グレゴリオ暦)からユリウス日(JD)を計算する
            * フリーゲルの公式を使用する
              JD = int(365.25 * year)
                 + int(year / 400)
                 - int(year / 100)
                 + int(30.59 (month - 2))
                 + day
                 + 1721088.5
            * 上記の int(x) は厳密には、 x を超えない最大の整数

        :param  object t: datetime
        :return float jd: ユリウス日
        """
        year, month,  day    = t.year, t.month,  t.day
        hour, minute, second = t.hour, t.minute, t.second
        try:
            # 1月,2月は前年の13月,14月とする
            if month < 3:
                year  -= 1
                month += 12
            # 日付(整数)部分計算
            jd  = int(365.25 * year) + year // 400 - year // 100 \
                + int(30.59 * (month - 2)) + day + 1721088.5
            # 時間(小数)部分計算
            t  = (second / 3600 + minute / 60 + hour) / 24
            return jd + t
        except Exception as e:
            raise

    def __check_jd(self):
        """ 引数のユリウス日をチェック """
        try:
            if self.jd < self.sss[0] or self.jd >= self.sss[1]:
                print("Please input JD s.t. {} <= JD < {}.".format(*self.sss))
                sys.exit(0)
        except Exception as e:
            raise

    def __get_list(self):
        """ 計算対象フラグ一覧取得
            * チェビシェフ多項式による計算が必要な天体の一覧をインスタンス変数
              （リスト） self.lists に設定する
            * 配列の並び順（係数データの並び順から「太陽」を除外した13個）
              self.lists = [
                  水星, 金星, 地球 - 月の重心, 火星, 木星, 土星, 天王星, 海王星,
                  冥王星, 月（地心）, 地球の章動, 月の秤動
              ]
        """
        try:
            if self.astrs[0] == 14:
                if self.ipts[11][1] > 0:
                    self.lists[10] = self.KIND
                return
            if self.astrs[0] == 15:
                if self.ipts[12][1] > 0:
                    self.lists[11] = self.KIND
            for k in self.astrs:
                if k <= 10:
                    self.lists[k - 1] = self.KIND
                if k == 10:
                    self.lists[2] = self.KIND
                if k ==  3:
                    self.lists[9] = self.KIND
                if k == 13:
                    self.lists[2] = self.KIND
        except Exception as e:
            raise

    def __calc(self):
        """ Calclulation """
        try:
            # 補間（11:太陽）
            self.pv_sun = self.__interpolate(11)
            # 補間（1:水星〜10:月）
            for i in range(10):
                if self.lists[i] == 0:
                    continue
                self.pvs[i] = self.__interpolate(i + 1)
                if i > 8:
                    continue
                if self.BARY:
                    continue
                self.pvs[i] = [a - b for a, b in zip(self.pvs[i], self.pv_sun)]
            # 補間（14:地球の章動）
            if self.lists[10] > 0 and self.ipts[11][1] > 0:
                p_nut = self.__interpolate(14)
            # 補間（15:月の秤動）
            if self.lists[11] > 0 and self.ipts[12][1] > 0:
                self.pvs[10] = self.__interpolate(15)
            # 対象天体と基準天体の差
            if self.astrs[0] == 14:
                if self.ipts[11][1] > 0:
                    self.rrds = p_nut + [0.0, 0.0]
            elif self.astrs[0] == 15:
                if self.ipts[12][1] > 0:
                    self.rrds = self.pvs[10]
            else:
                for i in range(10):
                    self.pvs_2[i] = self.pvs[i]
                if 11 in self.astrs:
                    self.pvs_2[10] = self.pv_sun
                if 12 in self.astrs:
                    self.pvs_2[11] = [0.0 for _ in range(6)]
                if 13 in self.astrs:
                    self.pvs_2[12] = self.pvs[2]
                if (self.astrs[0] * self.astrs[1] == 30 or \
                    self.astrs[0] + self.astrs[1] == 13):
                    self.pvs_2[2] = [0.0 for _ in range(6)]
                else:
                    if self.lists[2] != 0:
                        self.pvs_2[2] = [
                            a - b / (1.0 + self.emrat)
                            for a, b in zip(self.pvs[2], self.pvs[9])
                        ]
                    if self.lists[9] != 0:
                        self.pvs_2[9] = [
                            a + b
                            for a, b in zip(self.pvs_2[2], self.pvs[9])
                        ]
                for i in range(6):
                    self.rrds[i] = self.pvs_2[self.astrs[0] - 1][i] \
                                 - self.pvs_2[self.astrs[1] - 1][i]
        except Exception as e:
            raise

    def __interpolate(self, astr):
        """ 補間
            * 使用するチェビシェフ多項式の係数は、
            * 天体番号が 1 〜 13 の場合は、 x, y, z の位置・速度（6要素）、
              天体番号が 14 の場合は、 Δψ, Δε の角位置・角速度（4要素）、
              天体番号が 15 の場合は、 φ, θ, ψ の角位置・角速度（6要素）。
            * 天体番号が 12 の場合は、 x, y, z の位置・速度の値は全て 0.0 とする。

        :param  int astr: 天体番号
        :return list pvs: [
                              x 位置, y 位置, z 位置,
                              x 速度, y 速度, z 速度
                          ]
                          但し、
                          14（地球の章動）の場合は、
                          [
                              Δψ の角位置, Δε の角位置,
                              Δψ の角速度, Δε の角速度
                          ]
                          15（月の秤動）の場合は、
                          [
                              φ の角位置, θ の角位置, ψ の角位置,
                              φ の角速度, θ の角速度, ψ の角速度
                          ]
        """
        pvs = []
        try:
            tc, idx_sub = self.__norm_time(astr)
            n_item = 2 if astr == 14 else 3  # 要素数
            i_ipt  = astr - 3 if astr > 13 else astr - 1
            i_coef = astr - 3 if astr > 13 else astr - 1
            # 位置
            ps = [1, tc]
            for _ in range(2, self.ipts[i_ipt][1]):
                ps.append(2 * tc * ps[-1] - ps[-2])
            for i in range(n_item):
                val = 0
                for j in range(self.ipts[i_ipt][1]):
                    val += self.coeffs[i_coef][idx_sub][i][j] * ps[j]
                if not(self.KM) and astr < 14:
                    val /= self.au
                pvs.append(val)
            # 速度
            vs = [0, 1, 2 * 2 * tc]
            for i in range(3, self.ipts[i_ipt][1]):
                vs.append(2 * tc * vs[-1] + 2 * ps[i - 1] - vs[-2])
            for i in range(n_item):
                val = 0
                for j in range(self.ipts[i_ipt][1]):
                    val += self.coeffs[i_coef][idx_sub][i][j] \
                         * vs[j] * 2 * self.ipts[i_ipt][2] / self.sss[2]
                if astr < 14:
                    val /= 86400 if self.KM else self.au
                pvs.append(val)
            return pvs
        except Exception as e:
            raise

    def __norm_time(self, astr):
        """ チェビシェフ多項式用に時刻を正規化、サブ区間のインデックス算出

        :param  int astr: 天体番号
        :return list: [チェビシェフ時間, サブ区間のインデックス]
        """
        try:
            idx = astr - 2 if astr > 13 else astr
            jd_start = self.jds[0]
            tc = (self.jd - jd_start) / self.sss[2]
            temp = tc * self.ipts[idx - 1][2]
            idx = int(temp - int(tc))          # サブ区間のインデックス
            tc = (temp % 1 + int(tc)) * 2 - 1  # チェビシェフ時間
            return [tc, idx]
        except Exception as e:
            raise

    def __display(self):
        """ Display """
        try:
            s = (
                "  Target: {:2d} ({})\n"
                "  Center: {:2d}"
            ).format(
                self.astrs[0], self.ASTRS[self.astrs[0] - 1],
                self.astrs[1]
            )
            if self.astrs[1] != 0:
                s += " ({})".format(self.ASTRS[self.astrs[1] - 1])
            s += (
                "\n"
                "      JD: {:16.8f} day\n"
                "     1AU: {:11.1f} km\n"
            ).format(self.jd, self.au)
            print(s)
            s = ""
            if self.astrs[0] == 14:
                s = (
                    "  Position(Δψ) = {:32.20f} rad\n"
                    "  Position(Δε) = {:32.20f} rad\n"
                    "  Velocity(Δψ) = {:32.20f} rad/day\n"
                    "  Velocity(Δε) = {:32.20f} rad/day\n"
                ).format(
                    self.rrds[0], self.rrds[1],
                    self.rrds[2], self.rrds[3]
                )
            elif self.astrs[0] == 15:
                s = (
                    "  Position(φ) = {:32.20f} rad\n"
                    "  Position(θ) = {:32.20f} rad\n"
                    "  Position(ψ) = {:32.20f} rad\n"
                    "  Velocity(φ) = {:32.20f} rad/day\n"
                    "  Velocity(θ) = {:32.20f} rad/day\n"
                    "  Velocity(ψ) = {:32.20f} rad/day\n"
                ).format(
                    self.rrds[0], self.rrds[1], self.rrds[2],
                    self.rrds[3], self.rrds[4], self.rrds[5]
                )
            else:
                unit_0, unit_1 = ["km", "sec"] if self.KM else ["AU", "day"]
                s = (
                    "  Position(x) = {:32.20f} {}\n"
                    "  Position(y) = {:32.20f} {}\n"
                    "  Position(z) = {:32.20f} {}\n"
                    "  Velocity(x) = {:32.20f} {}/{}\n"
                    "  Velocity(y) = {:32.20f} {}/{}\n"
                    "  Velocity(z) = {:32.20f} {}/{}\n"
                ).format(
                    self.rrds[0], unit_0,
                    self.rrds[1], unit_0,
                    self.rrds[2], unit_0,
                    self.rrds[3], unit_0, unit_1,
                    self.rrds[4], unit_0, unit_1,
                    self.rrds[5], unit_0, unit_1
                )
            print(s)
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = JplCalcDe430()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

File: `lib_read_de430.py`

{% highlight python linenos %}
"""
JPLEPH(JPL の DE430 バイナリデータ)読み込みライブラリ

  date          name            version
  2018.04.05    mk-mode.com     1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
----------------------------------------------------------------------
     1: 水星 (Mercury)
     2: 金星 (Venus)
     3: 地球 - 月の重心 (Earth-Moon barycenter)
     4: 火星 (Mars)
     5: 木星 (Jupiter)
     6: 土星 (Saturn)
     7: 天王星 (Uranus)
     8: 海王星 (Neptune)
     9: 冥王星 (Pluto)
    10: 月（地心） (Moon (geocentric))
    11: 太陽 (Sun)
    12: 地球の章動（1980年IAUモデル） (Earth Nutations in longitude and obliquity(IAU 1980 model))
    13: 月の秤動 (Lunar mantle libration)
"""
import datetime
import struct


class JplReadDe430:
    FILE_BIN = "JPLEPH"
    KSIZE    = 2036
    RECL     = 4

    def __init__(self, jd):
        self.pos = 0                         # レコード位置
        self.jd = jd

    def read_de430(self):
        """ Execution """
        try:
            with open(self.FILE_BIN, "rb") as f:
                self.__get_ttl(f)     # TTL
                self.__get_cnam(f)    # CNAM
                self.__get_ss(f)      # SS
                self.__get_ncon(f)    # NCON
                self.__get_au(f)      # AU
                self.__get_emrat(f)   # EMRAT
                self.__get_ipt(f)     # IPT
                self.__get_numde(f)   # NUMDE
                self.__get_ipt_13(f)  # IPT
                self.__get_cval(f)    # CVAL
                self.__get_coeff(f)   # 係数取得
            self.__get_jdepoc()       # JDEPOC
        except Exception as e:
            raise

    def __get_ttl(self, f):
        """ TTL（タイトル）取得
            - 84 byte * 3
            - ASCII文字列(後続のnull文字やスペースを削除)

        :param file_object f
        """
        len_rec = 84
        self.ttl = ""
        try:
            for i in range(3):
                f.seek(self.pos + len_rec * i)
                a = struct.unpack(str(len_rec) + "s", f.read(len_rec))[0]
                if i != 0:
                    self.ttl += "\n"
                self.ttl += a.decode("utf-8").rstrip()
            self.pos += len_rec * 3
        except Exception as e:
            raise

    def __get_cnam(self, f):
        """ CNAM（定数名）取得
            - 6 byte * 400
            - ASCII文字列(後続のnull文字やスペースを削除)

        :param file_object f
        """
        len_rec = 6
        self.cnams = []
        try:
            for i in range(400):
                f.seek(self.pos + len_rec * i)
                a = struct.unpack(str(len_rec) + "s", f.read(len_rec))[0]
                self.cnams.append(a.decode("utf-8").rstrip())
            self.pos += len_rec * 400
        except Exception as e:
            raise

    def __get_ss(self, f):
        """ SS（ユリウス日（開始、終了）、分割日数）取得
            - 8 byte * 3
            - 倍精度浮動小数点数(機種依存)

        :param file_object f
        """
        len_rec = 8
        self.sss = []
        try:
            for i in range(3):
                f.seek(self.pos + len_rec * i)
                a = struct.unpack("d", f.read(len_rec))[0]
                self.sss.append(a)
            self.pos += len_rec * 3
        except Exception as e:
            raise

    def __get_ncon(self, f):
        """ NCON（定数の数）取得
            - 4 byte * 1
            - unsigned int (符号なし整数, エンディアンと int のサイズに依存)

        :param file_object f
        """
        len_rec = 4
        try:
            f.seek(self.pos)
            a = struct.unpack("I", f.read(len_rec))[0]
            self.ncon = a
            self.pos += len_rec
        except Exception as e:
            raise

    def __get_au(self, f):
        """ AU（天文単位）取得
            - 8 byte * 1
            - 倍精度浮動小数点数(機種依存)

        :param file_object f
        """
        len_rec = 8
        try:
            f.seek(self.pos)
            a = struct.unpack("d", f.read(len_rec))[0]
            self.au = a
            self.pos += len_rec
        except Exception as e:
            raise

    def __get_emrat(self, f):
        """ EMRAT（地球と月の質量比）取得
            - 8 byte * 1
            - 倍精度浮動小数点数(機種依存)

        :param file_object f
        """
        len_rec = 8
        try:
            f.seek(self.pos)
            a = struct.unpack("d", f.read(len_rec))[0]
            self.emrat = a
            self.pos += len_rec
        except Exception as e:
            raise

    def __get_numde(self, f):
        """ NUMDE（DEバージョン番号）取得
            - 4 byte * 1
            - unsigned int (符号なし整数, エンディアンと int のサイズに依存)

        :param file_object f
        """
        len_rec = 4
        try:
            f.seek(self.pos)
            a = struct.unpack("I", f.read(len_rec))[0]
            self.numde = a
            self.pos += len_rec
        except Exception as e:
            raise

    def __get_ipt(self, f):
        """ IPT（オフセット、係数の数、サブ区間数）（水星〜月の章動）取得
            - 4 byte * 12 * 3
            - unsigned int (符号なし整数, エンディアンと int のサイズに依存)

        :param file_object f
        """
        len_rec = 4
        self.ipts = []
        try:
            for i in range(12):
                l = []
                for j in range(3):
                    f.seek(self.pos + len_rec * j)
                    a = struct.unpack("I", f.read(len_rec))[0]
                    l.append(a)
                self.ipts.append(l)
                self.pos += len_rec * 3
        except Exception as e:
            raise

    def __get_ipt_13(self, f):
        """ IPT_13（オフセット、係数の数、サブ区間数）（月の秤動）取得
            - 4 byte * 1 * 3
            - unsigned int (符号なし整数, エンディアンと int のサイズに依存)

        :param file_object f
        """
        len_rec = 4
        try:
            l = []
            for i in range(3):
                f.seek(self.pos + len_rec * i)
                a = struct.unpack("I", f.read(len_rec))[0]
                l.append(a)
            self.ipts.append(l)
            self.pos += len_rec * 3
        except Exception as e:
            raise

    def __get_cval(self, f):
        """ CVAL（定数値）取得
            - 8 byte * @ncon
            - 倍精度浮動小数点数(機種依存)

        :param file_object f
        """
        self.pos = self.KSIZE * self.RECL
        len_rec = 8
        self.cvals = []
        try:
            for i in range(self.ncon):
                f.seek(self.pos + len_rec * i)
                a = struct.unpack("d", f.read(len_rec))[0]
                self.cvals.append(a)
        except Exception as e:
            raise

    def __get_coeff(self, f):
        """ COEFF 取得
            * レコード位置計算
            * 対象区間のユリウス日（開始、終了）をインスタンス変数(list)
              self.jds に設定する
            * 全ての係数の値をインスタンス変数（配列） self.coeffs に設定する
              （x, y, z やサブ区間毎に分割して格納）
            * 8 byte * ?
            * 倍精度浮動小数点数(機種依存)
            * 最初の2要素は当該データの開始・終了ユリウス日
        """
        idx = (self.jd - self.sss[0]) // self.sss[2]
        pos = int(self.KSIZE * self.RECL * (2 + idx))
        recl = 8
        items = []
        self.coeffs = []
        try:
            for i in range(self.KSIZE // 2):
                f.seek(pos + recl * i)
                a = struct.unpack("d", f.read(recl))[0]
                items.append(a)
            self.jds = [items.pop(0), items.pop(0)]
            for i, ipt in enumerate(self.ipts):
                n = 2 if i == 11 else 3
                l_1 = []
                for _ in range(ipt[2]):
                    l_0 = []
                    for _ in range(n):
                        l_0.append(items[:ipt[1]])
                        items = items[ipt[1]:]
                    l_1.append(l_0)
                self.coeffs.append(l_1)
        except Exception as e:
            raise

    def __get_jdepoc(self):
        """ JDEPOC 取得
            * self.cvals（定数値配列）の中から「元期」をインスタンス変数
              self.jdepoc に設定する
        """
        try:
            self.jdepoc = self.cvals[4]
        except Exception as e:
            raise
{% endhighlight %}

* [Gist - Python script to calc ICRS coordinates with JPL binary data DE430.](https://gist.github.com/komasaru/e233f884fe7335de8178082d0a80315a "Gist - Python script to calc ICRS coordinates with JPL binary data DE430.")

### 3. Python スクリプトの実行

コマンドライン引数に対象天体番号、中心天体番号、ユリウス日（地球時）を指定して実行する。（ユリウス日を省略した場合はシステム時刻をユリウス日（地球時）とみなす）  
※以下の例では、対象天体番号：3（地球）、中心天体番号：11（太陽）、ユリウス日（2018年4月7日0時）としている。

``` text
$ ./jpl_calc_de430.py 11 3 2458215.5
  Target:  3 (Earth)
  Center: 11 (Sun)
      JD: 2458215.50000000 day
     1AU: 149597870.7 km

  Position(x) =           0.95774801301855128077 AU
  Position(y) =           0.26660104935545975158 AU
  Position(z) =           0.11557000572573243591 AU
  Velocity(x) =          -0.00470901442891790475 AU/day
  Velocity(y) =           0.01516443149083217083 AU/day
  Velocity(z) =           0.00657334302616718099 AU/day
```

### 4. データの検証

上記の例のように、地球を中心とした太陽の位置なら、国立天文台のツールで確認できる。

上記の例の場合、位置が一致することが確認できた。（日時：2018年4月7日0時0分0秒、時刻系：地球時、直角座標の座標系：ICRS）

* [太陽の赤道直角座標と黄経・黄緯](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/sun_rect.cgi "太陽の赤道直角座標と黄経・黄緯")

---

以上。

