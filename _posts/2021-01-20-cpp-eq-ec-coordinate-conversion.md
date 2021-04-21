---
layout   : single
title    : "C++ - 赤道・黄道座標の変換！"
published: true
date     : 2021-01-20 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- C++
- カレンダー
---

赤道直交座標と黄道直交座標や、直交座標と極座標の相互変換を C++ で行いました。

過去には Ruby, Python, Fortran95 で行っています。

* [Ruby - 赤道・黄道座標の変換（by 自作 gem ライブラリ）！]({{site.baseurl}}/2016/09/24/ruby-coordinate-conversion-by-my-gem "Ruby - 赤道・黄道座標の変換（by 自作 gem ライブラリ）！")
* [Python - 赤道・黄道座標の変換！]({{site.baseurl}}/2018/07/26/python-coordinate-conversion "Python - 赤道・黄道座標の変換！")
* [Fortran - 赤道・黄道座標の変換！]({{site.baseurl}}/2018/12/29/fortran95-convert-eq-ec-coordinates "Fortran - 赤道・黄道座標の変換！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.6 (64bit) での作業を想定。
* GCC 10.2.0 (G++ 10.2.0) (C++17) でのコンパイルを想定。

### 1. 赤道座標と黄道座標の相互変換について

当ブログ過去記事を参照。

* [赤道座標と黄道座標、直交座標と極座標の変換！]({{site.baseurl}} "赤道座標と黄道座標、直交座標と極座標の変換！")

また、計算に使用する平均黄道傾斜角は実際には時々刻々と変化しているので、当ソースコードでも、指定時刻の値を計算するようにしている。（上記で紹介の Ruby, Python, Fortran95 版では値を固定しているが）

### 2. C++ ソースコードの作成

ここでは、実行部分のみ掲載。（全てのコードは GitHub リポジトリとして公開している）

File: `conv_coord.cpp`

{% highlight c linenos %}
/***********************************************************
  天体座標変換

    DATE          AUTHOR          VERSION
    2020.11.02    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.

  ----------------------------------------------------------
  引数 : JST（日本標準時） X Y Z
         書式 * JST: 最大23桁の数字
                （先頭から、西暦年(4), 月(2), 日(2), 時(2), 分(2), 秒(2),
                            1秒未満(9)（小数点以下9桁（ナノ秒）まで））
              * X, Y, Z: 元の赤道直交座標
***********************************************************/
#include "convert.hpp"
#include "coord.hpp"
#include "obliquity.hpp"
#include "time.hpp"

#include <cmath>
#include <cstdlib>   // for EXIT_XXXX
#include <ctime>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>


int main(int argc, char* argv[]) {
  static constexpr double kPi = atan(1.0) * 4.0;
  namespace ns = conv_coord;
  std::string     tm_str;     // time string
  unsigned int    s_tm;       // size of time string
  int             s_nsec;     // size of nsec string
  ns::Coord       pos_src;    // 直交座標（元の）
  ns::Coord       pos_res;    // 座標（計算結果用）
  struct timespec jst;        // JST
  struct timespec utc;        // UTC
  struct          tm t = {};  // for work
  double          jcn;        // Julian Century Number
  double          eps;        // 黄道傾斜角

  try {
    // コマンドライン引数の個数チェック
    if (argc < 5) {
      std::cout << "Usage: ./conv_coord JST X Y Z" << std::endl;
      return EXIT_SUCCESS;
    }

    // JST 取得
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

    // 元の赤道直交座標取得
    pos_src.x = std::stod(argv[2]);
    pos_src.y = std::stod(argv[3]);
    pos_src.z = std::stod(argv[4]);

    // JST -> UTC
    utc = ns::jst2utc(jst);

    // ユリウス世紀数計算
    ns::Time o_tm(utc);
    jcn = o_tm.calc_t();

    // 黄道傾斜角計算
    ns::Obliquity o_ob;
    eps = o_ob.calc_ob(jcn);

    // 事前準備の情報
    std::cout << "JST: "
              << ns::gen_time_str(jst) << std::endl
              << "UTC: "
              << ns::gen_time_str(utc) << std::endl
              << " JD: "
              << std::fixed << std::setprecision(10) << o_tm.calc_jd()
              << " day" << std::endl
              << "  T: "
              << jcn
              << " century (= Julian Century Number)" << std::endl
              << "EPS:  "
              << eps
              << " rad." << std::endl
              << "     "
              << eps * 180.0 / kPi
              << " deg." << std::endl
              << "---" << std::endl;

    // 座標クラスのインスタンス化
    ns::Convert o_cd(eps);

    // 計算＆結果出力
    std::cout << "RECT_EQ = ["
              << pos_src.x << ", " << pos_src.y << ", " << pos_src.z
              << "]" << std::endl;
    pos_res = o_cd.rect_eq2ec(pos_src);
    std::cout << "RECT_EC = ["
              << pos_res.x << ", " << pos_res.y << ", " << pos_res.z
              << "]" << std::endl;
    pos_res = o_cd.rect_ec2eq(pos_res);
    std::cout << "RECT_EQ = ["
              << pos_res.x << ", " << pos_res.y << ", " << pos_res.z
              << "]" << std::endl;
    pos_res = o_cd.rect2pol(pos_res);
    std::cout << " POL_EQ = ["
              << pos_res.x << ", " << pos_res.y
              << "] (R = " << pos_res.z << ")" << std::endl;
    pos_res = o_cd.pol_eq2ec(pos_res);
    std::cout << " POL_EC = ["
              << pos_res.x << ", " << pos_res.y
              << "] (R = " << pos_res.z << ")" << std::endl;
    pos_res = o_cd.pol_ec2eq(pos_res);
    std::cout << " POL_EQ = ["
              << pos_res.x << ", " << pos_res.y
              << "] (R = " << pos_res.z << ")" << std::endl;
    pos_res = o_cd.pol2rect(pos_res);
    std::cout << "RECT_EQ = ["
              << pos_res.x << ", " << pos_res.y << ", " << pos_res.z
              << "]" << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [GitHub - C++ source code to convert ecliptic-equator coordinates.](https://github.com/komasaru/conv_coord "GitHub - C++ source code to convert ecliptic-equator coordinates.")

### 3. ソースコードのビルド（コンパイル＆リンク）

* [リポジトリ](https://github.com/komasaru/conv_coord "GitHub - C++ source code to convert ecliptic-equator coordinates.")に `Makefile` があるので、それを使用して `make` するだけ。（リビルドする際は `make clean` をしてから）
* 上記の `Makefile` 内では別途個別にインストールした `c++102` コマンドを使用しているが、通常は `c++` であるので注意。

``` text
$ make
```

### 4. 動作確認

コマンドライン引数に JST（日本標準時）を「年・月・日・時・分・秒・ナノ秒」を最大23桁で、また、変換元の赤道直交座標 X, Y, Z を指定して実行する。（JST（日本標準時）を先頭から部分的に指定した場合は、指定していない部分を `0` とみなす）

``` text
$ ./conv_coord 20210120 0.994436592207009973 -0.038162917689578336 -0.016551776709600584
JST: 2021-01-20 00:00:00.000
UTC: 2021-01-19 15:00:00.000
 JD: 2459234.1250000000 day
  T: 0.2105167693 century (= Julian Century Number)
EPS:  0.4090447984 rad.
     23.4365405792 deg.
---
RECT_EQ = [0.9944365922, -0.0381629177, -0.0165517767]
RECT_EC = [0.9944365922, -0.0415977108, -0.0000076183]
RECT_EQ = [0.9944365922, -0.0381629177, -0.0165517767]
 POL_EQ = [6.2448277088, -0.0166305998] (R = 0.9953062371)
 POL_EC = [6.2413792492, -0.0000076542] (R = 0.9953062371)
 POL_EQ = [6.2448277088, -0.0166305998] (R = 0.9953062371)
RECT_EQ = [0.9944365922, -0.0381629177, -0.0165517767]
```

国立天文台の [Web サイト](https://eco.mtk.nao.ac.jp/koyomi/cande/ "暦象年表 - 国立天文台暦計算室") 上で計算した結果とおおむね一致する（確認可能なもののみ）。

---

以上。

