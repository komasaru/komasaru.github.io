---
layout   : single
title    : "C++ - 平均黄道傾斜角の計算！"
published: true
date     : 2021-01-13 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- C++
- カレンダー
---

平均黄道傾斜角（地球自転軸の傾き、地球公転面と赤道のなす角）の計算を C++ で行いました。  
23.4度等と簡単に表すことが多いですが、実際は時々刻々と変化しております。  
天文や暦等を正確に計算する際に必要になってきます。

過去には Ruby, Python で行っています。

* [Ruby - 平均黄道傾斜角の計算！]({{site.baseurl}}/2016/06/18/ruby-calc-mean-obliquity-ecliptic "Ruby - 平均黄道傾斜角の計算！")
* [Python - 平均黄道傾斜角の計算！]({{site.baseurl}}/2018/07/11/python-calc-mean-obliquity-ecliptic "Python - 平均黄道傾斜角の計算！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.6 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. 平均黄道傾斜角について

* 計算には、「[暦象年表の改訂について（国立天文台）（PDF 1.7MB）](https://www.nao.ac.jp/contents/about-naoj/reports/report-naoj/11-34-2.pdf "暦象年表の改訂について")」で紹介されている計算式を使用する。

### 2. C++ ソースコードの作成

ここでは、実行部分のみ掲載。（全てのコードは GitHub リポジトリとして公開している）

File: `calc_obliquity.cpp`

{% highlight c linenos %}
/***********************************************************
  黄道傾斜角計算

    DATE          AUTHOR          VERSION
    2020.10.30    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.

  ----------------------------------------------------------
  引数 : JST（日本標準時）
           書式：最大23桁の数字
                 （先頭から、西暦年(4), 月(2), 日(2), 時(2), 分(2), 秒(2),
                             1秒未満(9)（小数点以下9桁（ナノ秒）まで））
                 無指定なら現在(システム日時)と判断。
***********************************************************/
#include "common.hpp"
#include "time.hpp"
#include "obliquity.hpp"

#include <cmath>
#include <cstdlib>   // for EXIT_XXXX
#include <ctime>
#include <iostream>
#include <sstream>
#include <string>

int main(int argc, char* argv[]) {
  // 定数
  static constexpr double kPi = atan(1.0) * 4.0;

  // 変数
  std::string     tm_str;  // time string
  unsigned int    s_tm;    // size of time string
  int             s_nsec;  // size of nsec string
  int             ret;     // return of functions
  struct timespec jst;     // JST
  struct timespec utc;     // UTC
  struct tm       t = {};  // for work
  double          jcn;     // Julian Century Number
  double          eps;     // 黄道傾斜角
  namespace       ns = calc_obliquity;

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

    // ユリウス世紀数計算
    ns::Time o_tm(utc);
    jcn = o_tm.calc_t();

    // 黄道傾斜角計算
    ns::Obliquity o_ob;
    eps = o_ob.calc_ob(jcn);

    // 結果出力
    std::cout << "JST: "
              << ns::gen_time_str(jst) << std::endl;
    std::cout << "UTC: "
              << ns::gen_time_str(utc) << std::endl;
    std::cout << " JD: "
              << std::fixed << std::setprecision(10) << o_tm.calc_jd()
              << " day" << std::endl;
    std::cout << "  T: "
              << std::fixed << std::setprecision(10) << jcn
              << " century (= Julian Century Number)" << std::endl;
    std::cout << "EPS:  "
              << std::fixed << std::setprecision(10) << eps
              << " rad." << std::endl;
    std::cout << "     "
              << std::fixed << std::setprecision(10) << eps * 180.0 / kPi
              << " deg." << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [GitHub - C++ source code to calculate an obliquity.](https://github.com/komasaru/calc_obliquity "GitHub - C++ source code to calculate an obliquity.")

### 3. ソースコードのビルド（コンパイル＆リンク）

* [リポジトリ](https://github.com/komasaru/calc_obliquity "GitHub - C++ source code to calculate an obliquity.")に `Makefile` があるので、それを使用して `make` するだけ。（リビルドする際は `make clean` をしてから）
* 上記の `Makefile` 内では別途個別にインストールした `c++92` コマンドを使用しているが、通常は `c++` であるので注意。

``` text
$ make
```

### 4. 動作確認

コマンドライン引数に JST（日本標準時）を「年・月・日・時・分・秒・ナノ秒」を最大23桁で指定して実行する。（JST（日本標準時）を指定しない場合は、システム日時を JST とみなす。 JST（日本標準時）を先頭から部分的に指定した場合は、指定していない部分を `0` とみなす）  
出力結果の `EPS` の値が平均黄道傾斜角である（単位: ラジアン、度）。

``` text
$ ./calc_obliquity 20210113
JST: 2021-01-13 00:00:00.000
UTC: 2021-01-12 15:00:00.000
 JD: 2459227.1250000000 day
  T: 0.2103251198 century (= Julian Century Number)
EPS:  0.4090448419 rad.
     23.4365430726 deg.
```

---

以上。

