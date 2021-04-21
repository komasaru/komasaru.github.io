---
layout   : single
title: "C++ - 各種時刻系の換算！"
published: true
date     : 2021-01-06 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- C++
- カレンダー
---

暦計算や天文計算を行う際に必要な各種時刻系換算を C++ で行いました。

過去には Ruby, Python, Fortran95 で行っています。

* [Ruby - 各種時刻系の換算！]({{site.baseurl}}/2016/04/02/ruby-calc-time-series "Ruby - 各種時刻系の換算！")
* [Python - 各種時刻系の変換！]({{site.baseurl}}/2018/07/23/python-calc-time-series "Python - 各種時刻系の変換！")
* [Fortran - 各種時刻系の換算！ ]({{site.baseurl}}/2018/12/26/fortran95-convert-time-series "Fortran - 各種時刻系の換算！ ")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.6 (64bit) での作業を想定。
* GCC 10.2.0 (G++ 10.2.0) (C++17) でのコンパイルを想定。

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
  - TAI = UTC - (UTC - TAI) = UTC + うるう秒の総和
  - 現時点の -(UTC - TAI)（うるう秒の総和）は「[こちら](https://jjy.nict.go.jp/QandA/data/leapsec.html "日本標準時プロジェクト　Information of Leap second")」を参照。
  - 1 秒 = SI 秒
* DUT1（ΔUT1）
  - DUT1 = UT1 - UTC
  - 現在は DUT1 の絶対値が1秒を越えないよう、うるう秒による調整が行われている。
  - 現時点の DUT1 は「[こちら](https://jjy.nict.go.jp/QandA/data/dut1.html "日本標準時プロジェクト　Announcement of DUT1")」を参照。
* TT（地球時; Terrestrial Time）
  - かつて TDT（地球力学時）と呼ばれていた時刻系を再定義したもので、地球ジオイド面での座表時。
  - TAI の1977年1月1日0時0分0秒を力学時の1977年1月1.0003725日とし、TT の１日は平均海面における原子時計による秒の86400倍と定義されている。  
    （0.0003725 日 = 32.184 秒）
  - 元期 J2000.0 は、ユリウス日で 2,451,545.0 TT（2000年1月1日12h TT）。
  - 1 秒は SI 秒。
  - TT = TAI + 32.184 （秒）  
    さらには、
    * = UTC - (UTC - TAI) + 32.184
    * = UTC + うるう秒の総和 + 32.184
    * = UT1 - (UT1 - UTC) + うるう秒の総和 + 32.184
    * = UT1 - DUT1 + うるう秒の総和 + 32.184
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

### 2. C++ ソースコードの作成

ここでは、実行部分のみ掲載。（全てのコードは GitHub リポジトリとして公開している）

File: `conv_time.cpp`

{% highlight c linenos %}
/***********************************************************
  各種時刻換算

    DATE          AUTHOR          VERSION
    2020.10.22    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.

  引数 : JST（日本標準時）
           書式：最大23桁の数字
                 （先頭から、西暦年(4), 月(2), 日(2), 時(2), 分(2), 秒(2),
                             1秒未満(9)（小数点以下9桁（ナノ秒）まで））
                 無指定なら現在(システム日時)と判断。
  ------------------------------------------------------------------------------
  * 定数 DUT1 (= UT1 - UTC) の値は以下を参照。
      [日本標準時プロジェクト Announcement of DUT1](http://jjy.nict.go.jp/QandA/data/dut1.html)
    但し、値は 1.0 秒以下なので、精度を問わないなら 0.0 固定でもよい(?)
  * UTC - TAI（協定世界時と国際原子時の差）は、以下のとおりとする。
    - 1972年07月01日より古い場合は一律で 10
    - 2019年07月01日以降は一律で 37
    - その他は、指定の値
      [日本標準時プロジェクト　Information of Leap second](http://jjy.nict.go.jp/QandA/data/leapsec.html)
  * ΔT = TT - UT1 は、以下のとおりとする。
    - 1972-01-01 以降、うるう秒挿入済みの年+5までは、以下で算出
        ΔT = 32.184 - (UTC - TAI) - DUT1
      UTC - TAI は [うるう秒実施日一覧](http://jjy.nict.go.jp/QandA/data/leapsec.html) を参照
    - その他の期間は NASA 提供の略算式により算出
      [NASA - Polynomial Expressions for Delta T](http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html)
***********************************************************/
#include "time.hpp"

#include <cstdlib>   // for EXIT_XXXX
#include <ctime>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

int main(int argc, char* argv[]) {
  namespace ns = conv_time;
  std::string tm_str;   // time string
  unsigned int s_tm;    // size of time string
  int s_nsec;           // size of nsec string
  int ret;              // return of functions
  struct timespec jst;  // JST
  struct timespec utc;  // UTC
  struct tm t = {};     // for work

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

    // Calculation & display
    ns::Time o_tm(utc);
    std::cout << "            JST: "
              << ns::gen_time_str(jst) << std::endl;
    std::cout << "               ( UNIX time: "
              << jst.tv_sec << "." << std::setw(9) << std::right
              << std::setfill('0') << jst.tv_nsec << " sec. )" << std::endl;
    std::cout << "            UTC: "
              << ns::gen_time_str(utc) << std::endl;
    std::cout << "               ( UNIX time: "
              << utc.tv_sec << "." << std::setw(9) << std::right
              << std::setfill('0') << utc.tv_nsec << " sec. )" << std::endl;
    std::cout << "      JST - UTC: 9" << std::endl;
    std::cout << "             JD: "
              << std::fixed << std::setprecision(10) << o_tm.calc_jd()
              << " day" << std::endl;
    std::cout << "              T: "
              << std::fixed << std::setprecision(10) << o_tm.calc_t()
              << " century (= Julian Century Number)" << std::endl;
    std::cout << "      UTC - TAI: "
              << o_tm.calc_utc_tai()
              << " sec. (= amount of leap seconds)" << std::endl;
    std::cout << "           DUT1: "
              << std::fixed << std::setprecision(1) << o_tm.calc_dut1()
              << " sec." << std::endl;
    std::cout << "        delta-T: "
              << std::fixed << std::setprecision(3) << o_tm.calc_dlt_t()
              << " sec." << std::endl;
    std::cout << "            TAI: "
              << ns::gen_time_str(o_tm.calc_tai()) << std::endl;
    std::cout << "            UT1: "
              << ns::gen_time_str(o_tm.calc_ut1()) << std::endl;
    std::cout << "             TT: "
              << ns::gen_time_str(o_tm.calc_tt())  << std::endl;
    std::cout << "            TCG: "
              << ns::gen_time_str(o_tm.calc_tcg()) << std::endl;
    std::cout << "            TCB: "
              << ns::gen_time_str(o_tm.calc_tcb()) << std::endl;
    std::cout << "            TDB: "
              << ns::gen_time_str(o_tm.calc_tdb()) << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [GitHub - C++ source code to convert time series. ](https://github.com/komasaru/conv_time "GitHub - C++ source code to convert time series. ")

### 3. ソースコードのビルド（コンパイル＆リンク）

* [リポジトリ](https://github.com/komasaru/conv_time "GitHub - C++ source code to convert time series. ")に `Makefile` があるので、それを使用して `make` するだけ。（リビルドする際は `make clean` をしてから）
* 上記の `Makefile` 内では別途個別にインストールした `c++102` コマンドを使用しているが、通常は `c++` であるので注意。

``` text
$ make
```

### 4. 動作確認

必要であれば、まず、うるう秒ファイル LEAP_SEC.txt, DUT1 ファイル DUT1.txt は適宜最新のものに更新する。（うるう秒、 DUT1 の値については上記「各種時刻系について」参照）

そして、コマンドライン引数に JST（日本標準時）を「年・月・日・時・分・秒・ナノ秒」を最大23桁で指定して実行する。（JST（日本標準時）を指定しない場合は、システム日時を JST とみなす。 JST（日本標準時）を先頭から部分的に指定した場合は、指定していない部分を `0` とみなす）

``` text
$ ./conv_time 20210107123456123456789
            JST: 2021-01-07 12:34:56.123
               ( UNIX time: 1609990496.123456789 sec. )
            UTC: 2021-01-07 03:34:56.123
               ( UNIX time: 1609958096.123456789 sec. )
      JST - UTC: 9
             JD: 2459221.6492606886 day
              T: 0.2101752022 century (= Julian Century Number)
      UTC - TAI: -37 sec. (= amount of leap seconds)
           DUT1: -0.2 sec.
        delta-T: 69.384 sec.
            TAI: 2021-01-07 03:35:33.123
            UT1: 2021-01-07 03:34:55.923
             TT: 2021-01-07 03:36:05.307
            TCG: 2021-01-07 03:36:06.275
            TCB: 2021-01-07 03:36:26.845
            TDB: 2021-01-07 03:36:05.307
```

---

以上。

