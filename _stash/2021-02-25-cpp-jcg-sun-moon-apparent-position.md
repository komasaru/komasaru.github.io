---
layout   : single
title    : "C++ - 太陽・月の視位置計算（海保略算式版）！"
published: true
date     : 2021-02-25 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- C++
- カレンダー
---

C++ で、海上保安庁・海洋情報部の「[コンピュータによる天体の位置計算式](https://www1.kaiho.mlit.go.jp/KOHO/ "天文・暦情報")」を利用して、太陽や月の視位置等を計算してみました。

過去には Ruby, Python, Fortran95 で行っています。

* [Ruby - 太陽・月の視赤経・視赤緯等の計算（海保略算式版）！]({{site.baseurl}}/2016/05/04/ruby-calc-ephemeris-by-kaiho "Ruby - 太陽・月の視赤経・視赤緯等の計算（海保略算式版）！")
* [Ruby - 太陽・月の視黄経・視黄緯の計算（海保略算式版）！]({{site.baseurl}}/2016/05/12/ruby-calc-ecliptic-ephemeris-by-kaiho "Ruby - 太陽・月の視黄経・視黄緯の計算（海保略算式版）！")
* [Python - 太陽・月の視赤経・視赤緯等の計算（海保略算式版）！]({{site.baseurl}}/2018/07/02/python-calc-ephemeris-by-kaiho "Python - 太陽・月の視赤経・視赤緯等の計算（海保略算式版）！")
* [Python - 太陽・月の視黄経・視黄緯等の計算（海保略算式版）！]({{site.baseurl}}/2018/07/05/python-calc-ecliptic-ephemeris-by-kaiho "Python - 太陽・月の視黄経・視黄緯等の計算（海保略算式版）！")
* [Fortran - 太陽・月の視位置計算（海保略算式版）！]({{site.baseurl}}/2019/01/21/fortran95-jcg-sun-moon-apparent-position "Fortran - 太陽・月の視位置計算（海保略算式版）！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.8 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. 海保略算式について

* 「[コンピュータによる天体の位置計算式](https://www1.kaiho.mlit.go.jp/KOHO/ "天文・暦情報")」内の PDF ドキュメントや、（当記事冒頭に記載の）当ブログ過去記事を参照のこと。
* 当然ながら、用意されている係数データファイルの年しか値を計算できない。

### 2. ソースコードの作成

ここでは、実行部分のみ掲載。（全てのコードは GitHub リポジトリとして公開している）

File: `ephemeris_jcg.cpp`

{% highlight c linenos %}
/***********************************************************
  海上保安庁の天測暦より太陽・月の視位置を計算
  （視黄経・視黄緯の計算を追加したもの）

    DATE          AUTHOR          VERSION
    2020.12.07    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.

  引数 : UT1（世界時1）
           書式：最大23桁の数字
                 （先頭から、西暦年(4), 月(2), 日(2), 時(2), 分(2), 秒(2),
                             1秒未満(9)（小数点以下9桁（ナノ秒）まで））
                 無指定なら現在(システム日時)と判断。
***********************************************************/
#include "common.hpp"
#include "eph_jcg.hpp"

#include <cstdlib>   // for EXIT_XXXX
#include <ctime>
#include <iomanip>
#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
  std::string tm_str;   // time string
  unsigned int s_tm;    // size of time string
  int s_nsec;           // size of nsec string
  int ret;              // return of functions
  struct timespec ut1;  // UTC
  struct tm t = {};     // for work
  namespace ns = ephemeris_jcg;

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
      ut1.tv_sec  = mktime(&t);
      ut1.tv_nsec = 0;
      if (s_tm > 14) {
        ut1.tv_nsec = std::stod(
            tm_str.substr(14, s_nsec) + std::string(9 - s_nsec, '0'));
      }
    } else {
      // 現在日時の取得
      ret = std::timespec_get(&ut1, TIME_UTC);
      if (ret != 1) {
        std::cout << "[ERROR] Could not get now time!" << std::endl;
        return EXIT_FAILURE;
      }
    }

    // Calculation & display
    ns::EphJcg o_e(ut1);
    std::cout << "[ UT1: " << ns::gen_time_str(ut1) << " ]" << std::endl;
    std::cout << std::fixed << std::setprecision(8);
    std::cout << "SUN     R.A. =  "
              << std::setw(12) << o_e.sun_ra   << " h"
              << " (= " << ns::hour2hms(o_e.sun_ra) << ")" << std::endl;
    std::cout << "        Dec. =  "
              << std::setw(12) << o_e.sun_dec  << " °"
              << " (= " << ns::deg2dms(o_e.sun_dec) << ")" << std::endl;
    std::cout << "       Dist. =  "
              << std::setw(12) << o_e.sun_dist << " AU" << std::endl;
    std::cout << "          hG =  "
              << std::setw(12) << o_e.sun_hg   << " h"
              << " (= " << ns::hour2hms(o_e.sun_hg) << ")" << std::endl;
    std::cout << "        S.D. =  "
              << std::setw(12) << o_e.sun_sd   << " ′"
              << " (= " << ns::deg2dms(o_e.sun_sd / 60.0) << ")" << std::endl;
    std::cout << "VENUS   R.A. =  "
              << std::setw(12) << o_e.vns_ra   << " h"
              << " (= " << ns::hour2hms(o_e.vns_ra) << ")" << std::endl;
    std::cout << "        Dec. =  "
              << std::setw(12) << o_e.vns_dec  << " °"
              << " (= " << ns::deg2dms(o_e.vns_dec) << ")" << std::endl;
    std::cout << "       Dist. =  "
              << std::setw(12) << o_e.vns_dist << " AU" << std::endl;
    std::cout << "          hG =  "
              << std::setw(12) << o_e.vns_hg   << " h"
              << " (= " << ns::hour2hms(o_e.vns_hg) << ")" << std::endl;
    std::cout << "        S.D. =  "
              << std::setw(12) << o_e.vns_sd   << " ″"
              << " (= " << ns::deg2dms(o_e.vns_sd / 3600.0) << ")" << std::endl;
    std::cout << "MARS    R.A. =  "
              << std::setw(12) << o_e.mrs_ra   << " h"
              << " (= " << ns::hour2hms(o_e.mrs_ra) << ")" << std::endl;
    std::cout << "        Dec. =  "
              << std::setw(12) << o_e.mrs_dec  << " °"
              << " (= " << ns::deg2dms(o_e.mrs_dec) << ")" << std::endl;
    std::cout << "       Dist. =  "
              << std::setw(12) << o_e.mrs_dist << " AU" << std::endl;
    std::cout << "          hG =  "
              << std::setw(12) << o_e.mrs_hg   << " h"
              << " (= " << ns::hour2hms(o_e.mrs_hg) << ")" << std::endl;
    std::cout << "        S.D. =  "
              << std::setw(12) << o_e.mrs_sd   << " ″"
              << " (= " << ns::deg2dms(o_e.mrs_sd / 3600.0) << ")" << std::endl;
    std::cout << "JUPITER R.A. =  "
              << std::setw(12) << o_e.jpt_ra   << " h"
              << " (= " << ns::hour2hms(o_e.jpt_ra) << ")" << std::endl;
    std::cout << "        Dec. =  "
              << std::setw(12) << o_e.jpt_dec  << " °"
              << " (= " << ns::deg2dms(o_e.jpt_dec) << ")" << std::endl;
    std::cout << "       Dist. =  "
              << std::setw(12) << o_e.jpt_dist << " AU" << std::endl;
    std::cout << "          hG =  "
              << std::setw(12) << o_e.jpt_hg   << " h"
              << " (= " << ns::hour2hms(o_e.jpt_hg) << ")" << std::endl;
    std::cout << "     S.D.(P) =  "
              << std::setw(12) << o_e.jpt_sd_p << " ″"
              << " (= " << ns::deg2dms(o_e.jpt_sd_p / 3600.0) << ")" << std::endl;
    std::cout << "     S.D.(E) =  "
              << std::setw(12) << o_e.jpt_sd_e << " ″"
              << " (= " << ns::deg2dms(o_e.jpt_sd_e / 3600.0) << ")" << std::endl;
    std::cout << "SATURN  R.A. =  "
              << std::setw(12) << o_e.sat_ra   << " h"
              << " (= " << ns::hour2hms(o_e.sat_ra) << ")" << std::endl;
    std::cout << "        Dec. =  "
              << std::setw(12) << o_e.sat_dec  << " °"
              << " (= " << ns::deg2dms(o_e.sat_dec) << ")" << std::endl;
    std::cout << "       Dist. =  "
              << std::setw(12) << o_e.sat_dist << " AU" << std::endl;
    std::cout << "          hG =  "
              << std::setw(12) << o_e.sat_hg   << " h"
              << " (= " << ns::hour2hms(o_e.sat_hg) << ")" << std::endl;
    std::cout << "     S.D.(P) =  "
              << std::setw(12) << o_e.sat_sd_p << " ″"
              << " (= " << ns::deg2dms(o_e.sat_sd_p / 3600.0) << ")" << std::endl;
    std::cout << "     S.D.(E) =  "
              << std::setw(12) << o_e.sat_sd_e << " ″"
              << " (= " << ns::deg2dms(o_e.sat_sd_e / 3600.0) << ")" << std::endl;
    std::cout << "R            =  "
              << std::setw(12) << o_e.r        << " h"
              << " (= " << ns::hour2hms(o_e.r) << ")" << std::endl;
    std::cout << "EPSILON      =  "
              << std::setw(12) << o_e.eps      << " °"
              << " (= " << ns::deg2dms(o_e.eps) << ")" << std::endl;
    std::cout << "MOON    R.A. =  "
              << std::setw(12) << o_e.mon_ra   << " h"
              << " (= " << ns::hour2hms(o_e.mon_ra) << ")" << std::endl;
    std::cout << "        Dec. =  "
              << std::setw(12) << o_e.mon_dec  << " °"
              << " (= " << ns::deg2dms(o_e.mon_dec) << ")" << std::endl;
    std::cout << "        H.P. =  "
              << std::setw(12) << o_e.mon_hp   << " °"
              << " (= " << ns::deg2dms(o_e.mon_hp) << ")" << std::endl;
    std::cout << "          hG =  "
              << std::setw(12) << o_e.mon_hg   << " h"
              << " (= " << ns::hour2hms(o_e.mon_hg) << ")" << std::endl;
    std::cout << "        S.D. =  "
              << std::setw(12) << o_e.mon_sd   << " ′"
              << " (= " << ns::deg2dms(o_e.mon_sd / 60.0) << ")" << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [GitHub - C++ source code to calculate ephemerises by JCG method.](https://github.com/komasaru/ephemeris_jcg "GitHub - C++ source code to calculate ephemerises by JCG method.")

### 3. ソースコードのビルド（コンパイル＆リンク）

* [リポジトリ](https://github.com/komasaru/calc_greenwich_time "GitHub - C++ source code to calculate Greenwich Times.")に `Makefile` があるので、それを使用して `make` するだけ。（リビルドする際は `make clean` をしてから）
* 上記の `Makefile` 内では別途個別にインストールした `c++92` コマンドを使用しているが、通常は `c++` であるので注意。

``` text
$ make
```

### 4. 動作確認

* [海保サイト](https://www1.kaiho.mlit.go.jp/KOHO/ "天文・暦情報")からダウンロードした各年の係数ファイル(`na99-data.txt` という名称のファイル)を `txt` ディレクトリに配置する。（但し、環境によっては、文字コード(Character Set)を Shift-JIS から UTF-8 に変換する必要がある）
* 説明書に記載の ΔT の値を一覧にしたファイル `delta_t.txt` を `txt` ディレクトリに配置する。
* そして、コマンドライン引数に UT1（世界時1）を「年・月・日・時・分・秒・ナノ秒」を最大23桁で指定して実行する。（UT1（世界時1）を先頭から部分的に指定した場合は、指定していない部分を `0` とみなす）

``` text
$ ./ephemeris_jcg 20210225123456123456789
[ UT1: 2021-02-25 12:34:56.123 ]
SUN     R.A. =   22.58939081 h (=  22 h 35 m 21.807 s)
        Dec. =   -8.89332277 ° (= -  8 °53 ′35.962 ″)
       Dist. =    0.98992685 AU
          hG =    0.36567242 h (=   0 h 21 m 56.421 s)
        S.D. =   16.18301392 ′ (=    0 °16 ′10.981 ″)
VENUS   R.A. =   22.16846023 h (=  22 h 10 m  6.457 s)
        Dec. =  -12.69874078 ° (= - 12 °41 ′55.467 ″)
       Dist. =    1.69930817 AU
          hG =    0.78660301 h (=   0 h 47 m 11.771 s)
        S.D. =    4.88434065 ″ (=    0 ° 0 ′ 4.884 ″)
MARS    R.A. =    3.56720128 h (=   3 h 34 m  1.925 s)
        Dec. =   20.68476558 ° (=   20 °41 ′ 5.156 ″)
       Dist. =    1.43241090 AU
          hG =   19.38786195 h (=  19 h 23 m 16.303 s)
        S.D. =    3.28118141 ″ (=    0 ° 0 ′ 3.281 ″)
JUPITER R.A. =   21.23015770 h (=  21 h 13 m 48.568 s)
        Dec. =  -16.63843988 ° (= - 16 °38 ′18.384 ″)
       Dist. =    5.98670945 AU
          hG =    1.72490553 h (=   1 h 43 m 29.660 s)
     S.D.(P) =   15.38407715 ″ (=    0 ° 0 ′15.384 ″)
     S.D.(E) =   16.43640816 ″ (=    0 ° 0 ′16.436 ″)
SATURN  R.A. =   20.70890348 h (=  20 h 42 m 32.053 s)
        Dec. =  -18.68353162 ° (= - 18 °41 ′ 0.714 ″)
       Dist. =   10.83194503 AU
          hG =    2.24615975 h (=   2 h 14 m 46.175 s)
     S.D.(P) =    6.81318081 ″ (=    0 ° 0 ′ 6.813 ″)
     S.D.(E) =    7.63482456 ″ (=    0 ° 0 ′ 7.635 ″)
R            =   10.37280672 h (=  10 h 22 m 22.104 s)
EPSILON      =   23.43731626 ° (=   23 °26 ′14.339 ″)
MOON    R.A. =    9.15218237 h (=   9 h  9 m  7.857 s)
        Dec. =   20.79643783 ° (=   20 °47 ′47.176 ″)
        H.P. =    0.96526323 ° (=    0 °57 ′54.948 ″)
          hG =   13.80288087 h (=  13 h 48 m 10.371 s)
        S.D. =   15.78136265 ′ (=    0 °15 ′46.882 ″)
```

---

以上。

