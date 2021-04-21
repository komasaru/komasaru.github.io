---
layout   : single
title    : "C++ - JPL 天文暦データから ICRS 座標を計算！"
published: true
date     : 2021-03-10 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- C++
- カレンダー
---

前回、 NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している月・惑星の暦の最新版 DE430 のバイナリ形式のデータを C++ で読み込んでみました。

* [C++ - JPL 天文暦バイナリデータの読み込み！]({{site.baseurl}}/2021/03/03/cpp-jpl-ephemeris-binary-reading "C++ - JPL 天文暦バイナリデータの読み込み！")

今回は、読み込んだデータから ICRS 座標を計算してみました。 C++ で。

過去には Ruby, Python, Fortran95 で行っています。

* [Ruby - JPL 天文暦データから ICRS 座標を計算！]({{site.baseurl}}/2016/04/30/ruby-calc-jpl-icrs-coordinate "Ruby - JPL 天文暦データから ICRS 座標を計算！")
* [Python - JPL 天文暦データから ICRS 座標を計算！]({{site.baseurl}}/2018/07/08/python-calc-jpl-icrs-coordinate "Python - JPL 天文暦データから ICRS 座標を計算！")
* [Fortran - JPL 天文暦データから ICRS 座標を計算！]({{site.baseurl}}/2019/01/12/fortran95-jpl-ephemeris-icrs-coordinate "Fortran - JPL 天文暦データから ICRS 座標を計算！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.8 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. 天文暦バイナリデータについて

当ブログ過去記事を参照のこと。

* [JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data "JPL 天文暦データのバイナリ化！")

また、天文暦データには各種バージョンが存在するが、日本の国立天文台が現在使用している DE430 を当方も採用する。

### 2. ソースコードの作成

ここでは、実行部分のみ掲載。（全てのコードは GitHub リポジトリとして公開している）

File: `jpl_calc_430.cpp`

{% highlight c linenos %}
/***********************************************************
  JPLEPH(JPL の DE430 バイナリデータ)読み込み、座標（位置・速度）を計算する
  * 例として、 対象: 3（地球）, 基準: 12（太陽系重心） として計算

    DATE        AUTHOR       VERSION
    2020.12.31  mk-mode.com  1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.

----------------------------------------------------------
  【引数】
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
    [第３] ユリウス日（省略可。省略時は現在日時のユリウス日）
----------------------------------------------------------
  【注意事項】
    * 求める座標は「赤道直角座標(ICRS)」
    * 天体番号は、係数データの番号（並び順）と若干異なるので注意する。
      （特に、天体番号 3, 10, と 12 以降）
      係数データの並び順：
        水星(1)、金星(2)、地球 - 月の重心(3)、火星(4)、木星(5)、土星(6)、
        天王星(7)、海王星(8)、冥王星(9)、月（地心）(10)、太陽(11)、
        地球の章動(12)、月の秤動(13)
    * 時刻系は「太陽系力学時(TDB)」である。（≒地球時(TT)）
    * 天体番号が 1 〜 13 の場合は、 x, y, z の位置・速度（6要素）、
      天体番号が 14 の場合は、黄経における章動 Δψ, 黄道傾斜における章動 Δε の
      角位置・角速度（4要素）、
      天体番号が 15 の場合は、 φ, θ, ψ の角位置・角速度（6要素）。
    * 対象天体番号 = 基準天体番号 は、無意味なので処理しない。
    * 天体番号が 12 の場合は、 x, y, z の位置・速度の値は全て 0.0 とする。
    * 単位は、
      + 対象天体番号が 14, 15 の場合は、
        角位置: radian, 角速度: radian/day 
        で固定。
      + その他の場合は、
        位置: km or AU, 速度: km/sec or AU/day
        で、どちらを使用するかは jpl.cpp 内の定数 kKm で指定する。
    * その他、JPL 提供の FORTRAN プログラム "testeph.f" を参考にした。
***********************************************************/
#include "jpl.hpp"

#include <cstdlib>   // for EXIT_XXXX
#include <iomanip>
#include <iostream>
#include <string>
//#include <unordered_map>

int main(int argc, char* argv[]) {
  static constexpr char kAstrs[15][24] = {
    "Mercury", "Venus", "Earth", "Mars", "Jupiter",
    "Saturn", "Uranus", "Neptune", "Pluto", "Moon", "Sun",
    "Solar system Barycenter", "Earth-Moon barycenter",
    "Earth Nutations", "Lunar mantle Librations"
  };
  static constexpr double kJd0      = 2458849.5;  // 2000-01-01 UTC
  static constexpr bool   kFlgKm    = false;      // 単位フラグ
                                                  //    true: km, km/sec
                                                  //   false: AU, AU/day
  static constexpr bool   kFlgBary  = true;       // 基準フラグ
                                                  //    true: 太陽系重心が基準
                                                  //   false: 太陽が基準
  static constexpr char   kRad[]    = "rad";
  static constexpr char   kRadDay[] = "rad/day";
  static constexpr char   kKm[]     = "km";
  static constexpr char   kKmSec[]  = "km/sec";
  static constexpr char   kAu[]     = "AU";
  static constexpr char   kAuDay[]  = "AU/day";
  unsigned int astr_t;       // 天体番号（対象）
  unsigned int astr_c;       // 天体番号（基準）
  double       jd   = kJd0;  // ユリウス日
  std::string  unit_0;       // 単位（位置／角位置）
  std::string  unit_1;       // 単位（速度／角速度）
  namespace ns = jpl_calc_430;

  try {
    if (argc < 3) {
      std::cout << "[USAGE] ./jpl_calc_430 TARGET_NO CENTER_NO [JULIAN_DAY]"
                << std::endl;
      return EXIT_FAILURE;
    }

    // 天体番号（対象）取得
    astr_t = atoi(argv[1]);
    if (astr_t < 1 || astr_t > 15) {
      std::cout << "[ERROR} !!! TARGET_NO must be between 1 and 15 !!!"
                << std::endl;
      return EXIT_FAILURE;
    }
    // 天体番号（基準）取得
    astr_c = atoi(argv[2]);
    if (astr_c < 0 || astr_c > 13) {
      std::cout << "[ERROR} !!! CENTER_NO must be between 0 and 13 !!!"
                << std::endl;
      return EXIT_FAILURE;
    }
    // 天体番号（対象・基準）の対応チェック
    // （対象=14|15 のときは、基準=0）
    if (astr_c == 0 && (astr_t != 14 && astr_t != 15)) {
      std::cout << "[ERROR} !!! If CENTER_NO == 0, TARGET_NO must be 14|15 !!!"
                << std::endl;
      return EXIT_FAILURE;
    }
    if ((astr_t == 14 || astr_t == 15) && astr_c != 0) {
      std::cout << "[ERROR} !!! If TARGET_NO == 14|15, CENTER_NO must be 0 !!!"
                << std::endl;
      return EXIT_FAILURE;
    }
    // ユリウス日取得
    if (argc > 3) { jd = atof(argv[3]); }

    // バイナリファイル読み込み
    ns::Jpl o_jpl(jd, kFlgKm, kFlgBary);
    o_jpl.read_bin();

    // 位置・速度(Positions(Radian), Velocities(Radian/Day)) 計算
    o_jpl.calc_pv(astr_t, astr_c);

    // 単位文字列
    if (astr_t == 14 || astr_t == 15) {
      unit_0 = kRad;
      unit_1 = kRadDay;
    } else {
      unit_0 = kAu;
      unit_1 = kAuDay;
      if (kFlgKm) {
        unit_0 = kKm;
        unit_1 = kKmSec;
      }
    }

    // 結果出力
    // （単に取得した情報を確認するためだけのものなので、
    //   視認性は考慮していない）
    std::cout << "---" << std::endl;
    std::cout << " Target-Astro No. : " << std::setw(2) << astr_t
              << " (" << kAstrs[astr_t - 1] << ")" << std::endl;
    if (astr_c != 0) {
      std::cout << " Center-Astro No. : " << std::setw(2) << astr_c
                << " (" << kAstrs[astr_c - 1] << ")" << std::endl;
    }
    std::cout << "       Julian Day : " << std::fixed << std::setprecision(8)
              << jd << " day" << std::endl;
    std::cout << "              1AU : " << o_jpl.au << " km" << std::endl;
    if (astr_t == 14) {
      std::cout << "  Position(Δψ) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.pos[0] << " " << unit_0 << std::endl;
      std::cout << "  Position(Δε) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.pos[1] << " " << unit_0 << std::endl;
      std::cout << "  Velocity(Δψ) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.vel[0] << " " << unit_1 << std::endl;
      std::cout << "  Velocity(Δε) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.vel[1] << " " << unit_1 << std::endl;
    } else if (astr_t == 15) {
      std::cout << "  Position(φ) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.pos[0] << " " << unit_0 << std::endl;
      std::cout << "  Position(θ) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.pos[1] << " " << unit_0 << std::endl;
      std::cout << "  Position(ψ) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.pos[2] << " " << unit_0 << std::endl;
      std::cout << "  Velocity(φ) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.vel[0] << " " << unit_1 << std::endl;
      std::cout << "  Velocity(θ) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.vel[1] << " " << unit_1 << std::endl;
      std::cout << "  Velocity(ψ) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.vel[2] << " " << unit_1 << std::endl;
    } else {
      std::cout << "  Position(x) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.pos[0] << " " << unit_0 << std::endl;
      std::cout << "  Position(y) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.pos[1] << " " << unit_0 << std::endl;
      std::cout << "  Position(z) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.pos[2] << " " << unit_0 << std::endl;
      std::cout << "  Velocity(x) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.vel[0] << " " << unit_1 << std::endl;
      std::cout << "  Velocity(y) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.vel[1] << " " << unit_1 << std::endl;
      std::cout << "  Velocity(z) = "
                << std::setw(32) << std::fixed << std::setprecision(20)
                << o_jpl.vel[2] << " " << unit_1 << std::endl;
    }
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [GitHub - C++ source code to calculate an ICRS coordinate with JPL ephemeris binary data.](https://github.com/komasaru/jpl_calc_430 "GitHub - C++ source code to calculate an ICRS coordinate with JPL ephemeris binary data.")

### 3. ソースコードのビルド（コンパイル＆リンク）

* [リポジトリ](https://github.com/komasaru/jpl_calc_430 "GitHub - C++ source code to calculate an ICRS coordinate with JPL ephemeris binary data.")に `Makefile` があるので、それを使用して `make` するだけ。（リビルドする際は `make clean` をしてから）
* 上記の `Makefile` 内では別途個別にインストールした `c++92` コマンドを使用しているが、通常は `c++` であるので注意。

``` text
$ make
```

### 4. 準備

* JPL 天文暦バイナリデータ `JPLEPH` を実行ファイルと同じディレクトリ内に配置。  
  （参照「[JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data "JPL 天文暦データのバイナリ化！")」）

### 5. 動作確認

第1引数に対象天体番号(`1`〜`15`)、第2引数に基準天体番号（`0`〜`13`）、第3引数にユリウス日を指定して実行。（第1、第２引数は必須）

``` text
$ ./jpl_calc_430 3 11 2459283.625
---
 Target-Astro No. :  3 (Earth)
 Center-Astro No. : 11 (Sun)
       Julian Day : 2459283.62500000 day
              1AU : 149597870.69999999 km
  Position(x) =          -0.97639614730316137692 AU
  Position(y) =           0.16650560913255582629 AU
  Position(z) =           0.07218526011608403237 AU
  Velocity(x) =          -0.00342963319361286496 AU/day
  Velocity(y) =          -0.01558292355965176790 AU/day
  Velocity(z) =          -0.00675473296789738144 AU/day
```

---

JPL バイナリデータを使って天体（特に、太陽、月、地球）の正確な ICRS 座標が計算できれば、正確なカレンダーの作成も可能になります。

以上、

