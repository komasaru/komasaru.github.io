---
layout   : single
title    : "C++ - グリニッジ恒星時の計算（IAU2006 理論）！"
published: true
date     : 2021-02-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- C++
- カレンダー
---

グリニッジ視恒星時(GAST; Greenwich Apparent Sidereal Time)、グリニッジ平均恒星時(GMST; Greenwich Mean Sidereal Time)、分点均差(EE; Equation of Equinoxes )の計算を C++ で行いました。（使用するのは IAU2006 理論）

過去には Ruby, Python, Fortran95 で行っています。

* [Ruby - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2016/08/06/ruby-calc-greenwich-sidereal-time "Ruby - グリニッジ恒星時の計算（IAU2006 理論）！")
* [Python - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2018/07/20/python-calc-greenwich-sidereal-time "Python - グリニッジ恒星時の計算（IAU2006 理論）！")
* [Fortran - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2019/01/06/fortran95-greenwich-time "Fortran - グリニッジ恒星時の計算（IAU2006 理論）！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.8 (64bit) での作業を想定。
* GCC 10.2.0 (G++ 10.2.0) (C++17) でのコンパイルを想定。

### 1. 章動の計算について

当ブログ過去記事を参照のこと。

* [Ruby - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2016/08/06/ruby-calc-greenwich-sidereal-time "Ruby - グリニッジ恒星時の計算（IAU2006 理論）！")
* [Python - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2018/07/20/python-calc-greenwich-sidereal-time "Python - グリニッジ恒星時の計算（IAU2006 理論）！")

### 2. C++ ソースコードの作成

ここでは、実行部分のみ掲載。（全てのコードは GitHub リポジトリとして公開している）

File: `calc_greenwich_time.cpp`

{% highlight c linenos %}
/***********************************************************
  グリニジ視恒星時 GAST(= Greenwich Apparent Sidereal Time)等の計算
  : IAU2006 による計算

  * IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy)
    の提供する C ソースコード "gst06.c" 等で実装されているアルゴリズムを使用する。
  * 参考サイト
    - [SOFA Library Issue 2016-05-03 for ANSI C: Complete List](http://www.iausofa.org/2016_0503_C/CompleteList.html)
    - [USNO Circular 179](http://aa.usno.navy.mil/publications/docs/Circular_179.php)
    - [IERS Conventions Center](http://62.161.69.131/iers/conv2003/conv2003_c5.html)

    DATE          AUTHOR          VERSION
    2020.11.24    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.

  引数 : JST（日本標準時）
         書式: JST: 最大23桁の数字
               （先頭から、西暦年(4), 月(2), 日(2), 時(2), 分(2), 秒(2),
                           1秒未満(9)（小数点以下9桁（ナノ秒）まで））
               無指定なら現在(システム日時)を JST とみなす。
***********************************************************/
#include "common.hpp"
#include "greenwich.hpp"

#include <cstdlib>   // for EXIT_XXXX
#include <ctime>
#include <iomanip>   // for setprecision
#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
  namespace ns = calc_greenwich;
  std::string tm_str;    // time string
  unsigned int s_tm;     // size of time string
  int s_nsec;            // size of nsec string
  struct timespec utc;   // UTC
  struct timespec jst;   // JST
  struct tm t = {};      // for work
  double gast;           // GAST(rad.)
  double gmst;           // GMST(rad.)
  double ee;             // EE(rad.)
  double gast_deg;       // GAST(deg.)
  double gmst_deg;       // GMST(deg.)
  double ee_deg;         // EE(deg.)
  std::string gast_hms;  // GAST(hms)
  std::string gmst_hms;  // GMST(hms)
  std::string ee_hms;    // EE(hms)

  try {
    // 日付取得
    if (argc >1) {
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
      if (std::timespec_get(&jst, TIME_UTC) != 1) {
        std::cout << "[ERROR] Could not get now time!" << std::endl;
        return EXIT_FAILURE;
      }
    }

    // JST -> UTC
    utc = ns::jst2utc(jst);

    // Calculation & Display
    ns::Greenwich o_gr(utc);
    gast = o_gr.gast;
    gmst = o_gr.gmst;
    ee   = o_gr.ee;
    gast_deg = ns::rad2deg(gast);
    gmst_deg = ns::rad2deg(gmst);
    ee_deg   = ns::rad2deg(ee);
    gast_hms = ns::deg2hms(gast_deg);
    gmst_hms = ns::deg2hms(gmst_deg);
    ee_hms   = ns::deg2hms(ee_deg);
    std::cout << "      JST: " << ns::gen_time_str(jst)      << std::endl;
    std::cout << "      UTC: " << ns::gen_time_str(utc)      << std::endl;
    std::cout << "       TT: " << ns::gen_time_str(o_gr.tt)  << std::endl;
    std::cout << "      UT1: " << ns::gen_time_str(o_gr.ut1) << std::endl;
    std::cout << "      TDB: " << ns::gen_time_str(o_gr.tdb) << std::endl;
    std::cout << "     ERA = " << o_gr.era << " rad." << std::endl;
    std::cout << "      EO = " << o_gr.eo  << " rad." << std::endl;
    std::cout << "    GAST = " << gast     << " rad." << std::endl
              << "         = " << gast_deg << " deg." << std::endl
              << "         = " << gast_hms            << std::endl;
    std::cout << "    GMST = " << gmst     << " rad." << std::endl
              << "         = " << gmst_deg << " deg." << std::endl
              << "         = " << gmst_hms            << std::endl;
    std::cout << "      EE = " << ee       << " rad." << std::endl
              << "         = " << ee_deg   << " deg." << std::endl
              << "         = " << ee_hms              << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [GitHub - C++ source code to calculate Greenwich Times.](https://github.com/komasaru/calc_greenwich_time "GitHub - C++ source code to calculate Greenwich Times.")

### 3. ソースコードのビルド（コンパイル＆リンク）

* [リポジトリ](https://github.com/komasaru/calc_greenwich_time "GitHub - C++ source code to calculate Greenwich Times.")に `Makefile` があるので、それを使用して `make` するだけ。（リビルドする際は `make clean` をしてから）
* 上記の `Makefile` 内では別途個別にインストールした `c++102` コマンドを使用しているが、通常は `c++` であるので注意。

``` text
$ make
```

### 4. 動作確認

必要であれば、まず、うるう秒ファイル `LEAP_SEC.txt`, DUT1 ファイル `DUT1.txt` は適宜最新のものに更新する。（うるう秒、 DUT1 の値については「[C++ - 各種時刻系の換算！]({{site.baseurl}}/2021/01/06/cpp-time-series-conversion "C++ - 各種時刻系の換算！")」参照）

そして、コマンドライン引数に JST（日本標準時）を「年・月・日・時・分・秒・ナノ秒」を最大23桁で指定して実行する。（JST（日本標準時）を先頭から部分的に指定した場合は、指定していない部分を `0` とみなす）

``` text
$ ./calc_greenwich_time 20210217123456
      JST: 2021-02-17 12:34:56.000
      UTC: 2021-02-17 03:34:56.000
       TT: 2021-02-17 03:36:05.183
      UT1: 2021-02-17 03:34:55.800
      TDB: 2021-02-17 03:36:05.184
     ERA = 3.50467 rad.
      EO = -0.00465608 rad.
    GAST = 3.50933 rad.
         = 201.07 deg.
         =  13 h 24 m 16.760 s
    GMST = 3.5094 rad.
         = 201.074 deg.
         =  13 h 24 m 17.709 s
      EE = -6.89825e-05 rad.
         = -0.0039524 deg.
         = -00 h 00 m 00.949 s
```

* 国立天文台の「[グリニジ恒星時](https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/gst.cgi "グリニジ恒星時")」のページで計算したものと比較してみると、おおむね一致している。（視恒星時(GAST)・平均恒星時(GMST)で200ミリ秒の差異がある程度。分点近差(EE)は一致）

---

以上。

