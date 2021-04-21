---
layout   : single
title    : "C++ - 章動の計算（IAU2000A 理論）！"
published: true
date     : 2021-01-27 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- C++
- カレンダー
---

天体の回転に使用する章動の計算を C++ で行いました。（使用するのは IAU2000A 理論）

過去には Ruby, Python, Fortran95 で行っています。

* [Ruby - 章動の計算（IAU2000A 理論）！]({{site.baseurl}}/2016/06/22/ruby-calc-nutation-by-iau2000a "Ruby - 章動の計算（IAU2000A 理論）！")
* [Python - 章動の計算（IAU2000A 理論）！]({{site.baseurl}}/2018/07/14/python-calc-nutation-by-iau2000a "Python - 章動の計算（IAU2000A 理論）！")
* [Fortran - 章動の計算（IAU2000A 理論）！ ]({{site.baseurl}}/2019/01/03/fortran95-nutation-model "Fortran - 章動の計算（IAU2000A 理論）！ ")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.6 (64bit) での作業を想定。
* GCC 10.2.0 (G++ 10.2.0) (C++17) でのコンパイルを想定。

### 1. 章動（IAU2000A 理論）について

* 章動の計算には、 IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy) の提供する C ソースコードに実装されているアルゴリズム "nut00a.c" を使用する。
* IAU SOFA のソースコードには、 MHB2000(Mathews-Herring-Buffett, 2000) の理論や IERS2003(International Earth Rotation & Reference Systems service, 2003) の理論の使用が混在していることに留意。
* ここでは「章動（しょうどう）」そのものが何かについては詳細には説明しないが、簡単に説明すると、章動には
  - 黄経における章動($$\Delta\psi$$)
  - 黄道傾斜における章動($$\Delta\varepsilon$$)

  があり、それぞれが
  - 日月章動(luni-solar nutation)
  - 惑星章動(planetary nutation)

  で構成されている。
* また、算出アルゴリズムについてもここでは詳細には説明しない。（と言うより、煩雑で自分には説明できない）  
  参考サイトやソーススクリプトを参照のこと。
* 今回は IAU2000A 理論に基づいて計算しているが、簡略版の IAU2000B 理論 "nut00b.c" も存在する。
* IAU2000A 理論に若干の補正を加えた IAU2006 理論も存在するが、今回は非考慮。

### 2. 係数データの準備

計算に使用する係数データを用意する。

IERS のページから「日月章動用の係数データ ([tab5.3a.txt](https://iers-conventions.obspm.fr/content/chapter5/additional_info/tab5.3a.txt "tab5.3a.txt"))」と「惑星章動用の係数データ ([tab5.3b.txt](https://iers-conventions.obspm.fr/content/chapter5/additional_info/tab5.3b.txt "tab5.3b.txt"))」を取得して、扱いやすいように整形する。（かつて、当方が Ruby 等で章動計算する際に取得したファイルとは URL が異なっている）

整形したもの(`NUT_LS.txt`, `NUT_PL.txt`)は後に紹介する GitHub リポジトリにもアップしている。  
**しかし、現在提供されているデータは、かつてのものと異なるようだ。（精査後、対応する予定）**

### 3. C++ ソースコードの作成

ここでは、実行部分のみ掲載。（全てのコードは GitHub リポジトリとして公開している）

File: `calc_nutation.cpp`

{% highlight c linenos %}
/***********************************************************
  章動の計算
  : IAU2000A 章動理論(MHB2000, IERS2003)による
    黄経における章動(Δψ), 黄道傾斜における章動(Δε) の計算

  * IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy)
    の提供する C ソースコード "nut00a.c" で実装されているアルゴリズムを使用する。
  * 係数データファイルの項目について
    - 日月章動(luni-solar nutation, "dat_ls.txt")
      (左から) L L' F D Om PS PST PC EC ECT ES
    - 惑星章動(planetary nutation, "dat_pl.txt)
      (左から) L L' F D Om Lm Lv Le LM Lj Ls Lu Ln Pa PS PC ES EC
  * 参考サイト
    - [SOFA Library Issue 2012-03-01 for ANSI C: Complete List](http://www.iausofa.org/2012_0301_C/sofa/)
    - [USNO Circular 179](http://aa.usno.navy.mil/publications/docs/Circular_179.php)
    - [IERS Conventions Center](http://62.161.69.131/iers/conv2003/conv2003_c5.html)

    DATE          AUTHOR          VERSION
    2020.11.10    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
------------------------------------------------------------
  引数 : TT（地球時）
           書式：最大23桁の数字
                 （先頭から、西暦年(4), 月(2), 日(2), 時(2), 分(2), 秒(2),
                             1秒未満(9)（小数点以下9桁（ナノ秒）まで））
                 無指定なら現在(システム日時)と判断。
***********************************************************/
#include "nutation.hpp"
#include "time.hpp"

#include <cstdlib>   // for EXIT_XXXX
#include <ctime>
#include <iomanip>   // for setprecision
#include <iostream>
#include <sstream>
#include <string>
#include <vector>


int main(int argc, char* argv[]) {
  constexpr double kR2D = 57.29577951308232087679815;   // Radians to degrees
  constexpr double kD2S = 3600.0;                       // Degrees to seconds
  namespace ns = calc_nutation;
  std::string tm_str;  // time string
  unsigned int s_tm;   // size of time string
  int s_nsec;          // size of nsec string
  int ret;             // return of functions
  struct timespec tt;  // TT
  struct tm t = {};    // for work
  double jcn;          // Julian Century Number
  double dpsi;         // delta-psi(rad)
  double deps;         // delta-eps(rad)
  double dpsi_d;       // delta-psi(deg)
  double deps_d;       // delta-eps(deg)
  double dpsi_s;       // delta-psi(sec)
  double deps_s;       // delta-eps(sec)

  try {
    // 地球時取得
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
      tt.tv_sec  = mktime(&t);
      tt.tv_nsec = 0;
      if (s_tm > 14) {
        tt.tv_nsec = std::stod(
            tm_str.substr(14, s_nsec) + std::string(9 - s_nsec, '0'));
      }
    } else {
      // 現在日時の取得
      ret = std::timespec_get(&tt, TIME_UTC);
      if (ret != 1) {
        std::cout << "[ERROR] Could not get now time!" << std::endl;
        return EXIT_FAILURE;
      }
    }

    // Calculation
    ns::Time o_tm(tt);      // Object of TT
    jcn = o_tm.calc_t();    // ユリウス世紀数(for TT)
    ns::Nutation o_n(jcn);  // Object of Nutation
    if (!o_n.calc_nutation(dpsi, deps)) {
      std::cout << "[ERROR] Could not calculate delta-psi, "
                << "delta-epsilon!" << std::endl;
      return EXIT_FAILURE;
    }
    dpsi_d = dpsi   * kR2D;
    deps_d = deps   * kR2D;
    dpsi_s = dpsi_d * kD2S;
    deps_s = deps_d * kD2S;

    // Display
    std::cout << "         TT: "
              << ns::gen_time_str(tt) << std::endl
              << "   T(of TT): "
              << std::fixed << std::setprecision(10) << jcn
              << " century (= Julian Century Number)" << std::endl
              << std::setprecision(20)
              << "  DeltaPsi = "
              << std::setw(24) << dpsi   << " rad" << std::endl
              << "           = "
              << std::setw(24) << dpsi_d << " °"  << std::endl
              << "           = "
              << std::setw(24) << dpsi_s << " ″"  << std::endl
              << "  DeltaEps = "
              << std::setw(24) << deps   << " rad" << std::endl
              << "           = "
              << std::setw(24) << deps_d << " °"  << std::endl
              << "           = "
              << std::setw(24) << deps_s << " ″"  << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [GitHub - C++ source code to calculate nutation by IAU2000A model.](https://github.com/komasaru/calc_nutation "GitHub - C++ source code to calculate nutation by IAU2000A model.")

### 4. ソースコードのビルド（コンパイル＆リンク）

* [リポジトリ](https://github.com/komasaru/calc_nutation "GitHub - C++ source code to calculate nutation by IAU2000A model.")に `Makefile` があるので、それを使用して `make` するだけ。（リビルドする際は `make clean` をしてから）
* 上記の `Makefile` 内では別途個別にインストールした `c++102` コマンドを使用しているが、通常は `c++` であるので注意。

``` text
$ make
```

### 5. 動作確認

必要であれば、まず、うるう秒ファイル `LEAP_SEC.txt`, DUT1 ファイル `DUT1.txt` は適宜最新のものに更新する。（うるう秒、 DUT1 の値については「[C++ - 各種時刻系の換算！]({{site.baseurl}}/2021/01/06/cpp-time-series-conversion "C++ - 各種時刻系の換算！")」参照）

そして、コマンドライン引数に TT（地球時）を「年・月・日・時・分・秒・ナノ秒」を最大23桁で指定して実行する。（TT（地球時）を先頭から部分的に指定した場合は、指定していない部分を `0` とみなす）

``` text
$ ./calc_nutation 20210127090000
         TT: 2021-01-27 09:00:00.000
   T(of TT): 0.2107289528 century (= Julian Century Number)
  DeltaPsi =  -0.00007406544379546047 rad
           =  -0.00424363733724329381 °
           = -15.27709441407585799766 ″
  DeltaEps =   0.00000896822031600513 rad
           =   0.00051384117385057534 °
           =   1.84982822586207129589 ″
```

国立天文台の [Web サイト](https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/nutation.cgi "章動 - 国立天文台暦計算室") 上で計算した結果とおおむね一致する。

---

以上。

