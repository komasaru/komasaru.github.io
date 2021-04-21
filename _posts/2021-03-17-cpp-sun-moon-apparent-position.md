---
layout   : single
title    : "C++ - JPL DE430 データから太陽・月の視位置を計算！"
published: true
date     : 2021-03-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- C++
- カレンダー
---

C++ で、 NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している太陽・月・惑星の暦の最新版 DE430 からデータを取得し、太陽と月の視位置を高精度で計算してみました

過去には Ruby, Fortran95 で行っています。

* [Ruby - JPL DE430 データから太陽・月の視位置を計算！]({{site.baseurl}}/2016/10/06/ruby-sun-moon-apparent-position-calculation "Ruby - JPL DE430 データから太陽・月の視位置を計算！")
* [Fortran - JPL DE430 データから太陽・月の視位置を計算！]({{site.baseurl}}/2019/01/18/fortran95-jpl-sun-moon-apparent-position "Fortran - JPL DE430 データから太陽・月の視位置を計算！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.8 (64bit) での作業を想定。
* GCC 10.2.0 (G++ 10.2.0) (C++17) でのコンパイルを想定。

### 1. 天文暦バイナリデータについて

当ブログ過去記事を参照のこと。

* [JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data "JPL 天文暦データのバイナリ化！")
* [C++ - JPL 天文暦バイナリデータの読み込み！]({{site.baseurl}}/2021/03/03/cpp-jpl-ephemeris-binary-reading "C++ - JPL 天文暦バイナリデータの読み込み！")
* [C++ - JPL 天文暦データから ICRS 座標を計算！]({{site.baseurl}}/2021/03/10/cpp-jpl-ephemeris-icrs-coordinate "C++ - JPL 天文暦データから ICRS 座標を計算！")

また、天文暦データには各種バージョンが存在するが、日本の国立天文台が現在使用している DE430 を当方も採用する。

### 2. ソースコードの作成

ここでは、実行部分のみ掲載。（全てのコードは GitHub リポジトリとして公開している）

File: `apparent_sun_moon.cpp`

{% highlight c linenos %}
/***********************************************************
  太陽・月の視位置計算

  * JPLEPH(JPL の DE430 バイナリデータ)読み込み、視位置を計算する
    (自作 RubyGems ライブラリ mk_apos を使用)

    DATE        AUTHOR       VERSION
    2021.01.11  mk-mode.com  1.00 新規作成

  Copyright(C) 2021 mk-mode.com All Rights Reserved.
----------------------------------------------------------
  引数 : JST（日本標準時）
           書式：最大23桁の数字
                 （先頭から、西暦年(4), 月(2), 日(2), 時(2), 分(2), 秒(2),
                             1秒未満(9)（小数点以下9桁（ナノ秒）まで））
                 無指定なら現在(システム日時)と判断。
***********************************************************/
#include "apos.hpp"
#include "position.hpp"

#include <cstdlib>   // for EXIT_XXXX
#include <ctime>
#include <iomanip>
#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
  static constexpr double kPi = atan(1.0) * 4;  // 円周率
  namespace ns = apparent_sun_moon;
  std::string tm_str;   // time string
  unsigned int s_tm;    // size of time string
  int s_nsec;           // size of nsec string
  int ret;              // return of functions
  struct timespec jst;  // JST
  struct timespec utc;  // UTC
  struct tm t = {};     // for work
  ns::Position pos_s;   // 視位置（太陽）
  ns::Position pos_m;   // 視位置（月）

  try {
    // 日付取得
    if (argc > 1) {
      // コマンドライン引数より取得
      tm_str = argv[1];
      s_tm = tm_str.size();
      if (s_tm > 23) {
        std::cout << "[ERROR] Over 23-digits!" << std::endl;
        return EXIT_FAILURE;
      }
      s_nsec = s_tm - 14;
      std::istringstream is(tm_str);
      is >> std::get_time(&t, "%Y%m%d%H%M%S");
      jst.tv_sec  = mktime(&t);
      jst.tv_nsec = 0;
      if (s_tm > 14) {
        jst.tv_nsec = std::stod(
            tm_str.substr(14, s_nsec) + std::string(9 - s_nsec, '0'));
      }
    } else {
      // 現在日時の取得
      ret = std::timespec_get(&jst, TIME_UTC);
      if (ret != 1) {
        std::cout << "[ERROR] Could not get now time!" << std::endl;
        return EXIT_FAILURE;
      }
    }

    // JST -> UTC
    utc = ns::jst2utc(jst);

    // 視位置計算
    ns::Apos o_a(utc);
    pos_s = o_a.sun();
    pos_m = o_a.moon();

    // 結果出力
    std::cout << "            JST: "
              << ns::gen_time_str(jst) << std::endl;
    std::cout << "            UTC: "
              << ns::gen_time_str(utc) << std::endl;
    std::cout << "            TDB: "
              << ns::gen_time_str(o_a.tdb) << std::endl;
    std::cout << "        JD(TDB): "
              << std::fixed << std::setprecision(8)
              << o_a.jd << " day" << std::endl;
    std::cout << "---" << std::endl
              << std::fixed << std::setprecision(10);
    std::cout << "* 視位置: 太陽" << std::endl
              << "  = [赤経: "
              << std::setw(14) << pos_s.alpha
              << " rad, 赤緯: "
              << std::setw(14) << pos_s.delta
              << " rad]" << std::endl
              << "  = [赤経: "
              << std::setw(14) << pos_s.alpha * 180.0 / kPi
              << " deg, 赤緯: "
              << std::setw(14) << pos_s.delta * 180.0 / kPi
              << " deg]" << std::endl
              << "  = [黄経: "
              << std::setw(14) << pos_s.lambda
              << " rad, 黄緯: "
              << std::setw(14) << pos_s.beta
              << " rad]" << std::endl
              << "  = [黄経: "
              << std::setw(14) << pos_s.lambda * 180.0 / kPi
              << " deg, 黄緯: "
              << std::setw(14) << pos_s.beta   * 180.0 / kPi
              << " deg]" << std::endl;
    std::cout << "* 視位置: 月" << std::endl
              << "  = [赤経: "
              << std::setw(14) << pos_m.alpha
              << " rad, 赤緯: "
              << std::setw(14) << pos_m.delta
              << " rad]" << std::endl
              << "  = [赤経: "
              << std::setw(14) << pos_m.alpha * 180.0 / kPi
              << " deg, 赤緯: "
              << std::setw(14) << pos_m.delta * 180.0 / kPi
              << " deg]" << std::endl
              << "  = [黄経: "
              << std::setw(14) << pos_m.lambda
              << " rad, 黄緯: "
              << std::setw(14) << pos_m.beta
              << " rad]" << std::endl
              << "  = [黄経: "
              << std::setw(14) << pos_m.lambda * 180.0 / kPi
              << " deg, 黄緯: "
              << std::setw(14) << pos_m.beta   * 180.0 / kPi
              << " deg]" << std::endl;
    std::cout << "* 距離: 太陽" << std::endl
              << "  = " << pos_s.d_ec << " AU" << std::endl;
    std::cout << "* 距離: 月" << std::endl
              << "  = " << pos_m.d_ec << " AU" << std::endl;
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "* 視半径: 太陽" << std::endl
              << "  = " << pos_s.a_radius << " ″" << std::endl;
    std::cout << "* 視半径: 月" << std::endl
              << "  = " << pos_m.a_radius << " ″" << std::endl;
    std::cout << "* （地平）視差: 太陽" << std::endl
              << "  = " << pos_s.parallax << " ″" << std::endl;
    std::cout << "* （地平）視差: 月" << std::endl
              << "  = " << pos_m.parallax << " ″" << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [GitHub - C++ source code to calculate apparent positions of Sun and Moon.](https://github.com/komasaru/apparent_sun_moon "GitHub - C++ source code to calculate apparent positions of Sun and Moon.")

### 3. ソースコードのビルド（コンパイル＆リンク）

* [リポジトリ](https://github.com/komasaru/apparent_sun_moon "GitHub - C++ source code to calculate apparent positions of Sun and Moon.")に `Makefile` があるので、それを使用して `make` するだけ。（リビルドする際は `make clean` をしてから）
* 上記の `Makefile` 内では別途個別にインストールした `c++102` コマンドを使用しているが、通常は `c++` であるので注意。

``` text
$ make
```

### 4. 準備

* JPL 天文暦バイナリデータ `JPLEPH` を実行ファイルと同じディレクトリ内に配置。  
  （参照「[JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data "JPL 天文暦データのバイナリ化！")」）
* 必要であれば、うるう秒ファイル `LEAP_SEC.txt`, DUT1 ファイル `DUT1.txt` は適宜最新のものに更新する。（うるう秒、 DUT1 の値については「[C++ - 各種時刻系の換算！]({{site.baseurl}}/2021/01/06/cpp-time-series-conversion "C++ - 各種時刻系の換算！")」参照）
* 係数データ `NUT_LS.txt`, `NUT_PL.txt` については、「[こちら]({{site.baseurl}}/2016/06/22/ruby-calc-nutation-by-iau2000a "Ruby - 章動の計算（IAU2000A 理論）！")」を参照のこと。

### 5. 動作確認

コマンドライン引数に JST（日本標準時）を「年・月・日・時・分・秒・ナノ秒」を最大23桁で指定して実行する。（JST（日本標準時）を指定しない場合は、システム日時を JST とみなす。 JST（日本標準時）を先頭から部分的に指定した場合は、指定していない部分を `0` とみなす）

``` text
$ ./apparent_sun_moon 20210317123456
            JST: 2021-03-17 12:34:56.000
            UTC: 2021-03-17 03:34:56.000
            TDB: 2021-03-17 03:36:05.184
        JD(TDB): 2459290.65006000 day
---
* 視位置: 太陽
  = [赤経:   6.2313802814 rad, 赤緯:  -0.0224448365 rad]
  = [赤経: 357.0317906669 deg, 赤緯:  -1.2859944011 deg]
  = [黄経:   6.2267310725 rad, 黄緯:  -0.0000012827 rad]
  = [黄経: 356.7654106175 deg, 黄緯:  -0.0000734931 deg]
* 視位置: 月
  = [赤経:   0.6431402971 rad, 赤緯:   0.2003899540 rad]
  = [赤経:  36.8492246598 deg, 赤緯:  11.4814986212 deg]
  = [黄経:   0.6677287251 rad, 黄緯:  -0.0511440262 rad]
  = [黄経:  38.2580378093 deg, 黄緯:  -2.9303368512 deg]
* 距離: 太陽
  = 0.9949678913 AU
* 距離: 月
  = 0.0027049459 AU
* 視半径: 太陽
  = 964.50 ″
* 視半径: 月
  = 885.92 ″
* （地平）視差: 太陽
  = 8.84 ″
* （地平）視差: 月
  = 3251.27 ″
```

---

JPL バイナリデータを使って太陽・月の正確な視位置が計算できるようになったので、正確なカレンダーの作成も可能になりました。

以上、

