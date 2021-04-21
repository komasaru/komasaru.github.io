---
layout   : single
title    : "C++ - バイアス・歳差・章動の適用！"
published: true
date     : 2021-02-03 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- C++
- カレンダー
---

赤道直交座標にバイアス・歳差・章動の回転を適用する処理を C++ で実装してみました。

過去には Ruby, Fortran95 で実装したことがあります。（Python でも作成したことがあるが、ブログ記事にはしていない）

* [Ruby - バイアス・歳差・章動の適用（by 自作 gem ライブラリ）！]({{site.baseurl}}/2016/09/20/ruby-bpn-rotation-by-my-gem "Ruby - バイアス・歳差・章動の適用（by 自作 gem ライブラリ）！")
* [Fortran - バイアス・歳差・章動の適用！]({{site.baseurl}}/2019/01/15/fortran95-jpl-bpn-rotation-apply "Fortran - バイアス・歳差・章動の適用！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.6 (64bit) での作業を想定。
* GCC 10.2.0 (G++ 10.2.0) (C++17) でのコンパイルを想定。

### 1. バイアス・歳差・章動について

* 「バイアス(frame bias)」とは、「GCRS(Geocentric Celestial Reference System; 地球重心天文座標系)」と「J2000.0 の平均座標系」との間のズレ。
* 「J2000.0 の平均座標系」に「歳差」を適用すると「瞬時の平均座標系」になる。
* 「瞬時の平均座標系」に「章動」を適用すると「瞬時の真座標系」になる。
* 「歳差(precession)」や「章動(nutation)」の詳細については、「[歳差・章動と地球の向き - 国立天文台暦計算室](http://eco.mtk.nao.ac.jp/koyomi/topics/html/topics2009_1.html "歳差・章動と地球の向き - 国立天文台暦計算室")」を参照のこと。

### 2. 章動係数データの準備

章動(Nutation)計算に使用する係数データを用意する。

IERS のページから「日月章動用の係数データ ([tab5.3a.txt](https://iers-conventions.obspm.fr/content/chapter5/additional_info/tab5.3a.txt "tab5.3a.txt"))」と「惑星章動用の係数データ ([tab5.3b.txt](https://iers-conventions.obspm.fr/content/chapter5/additional_info/tab5.3b.txt "tab5.3b.txt"))」を取得して、扱いやすいように整形する。（かつて、当方が Ruby 等で章動計算する際に取得したファイルとは URL が異なっている）

整形したもの(`NUT_LS.txt`, `NUT_PL.txt`)は後に紹介する GitHub リポジトリにもアップしている。  
**しかし、現在提供されているデータは、かつてのものと異なるようだ。（精査後、対応する予定）**

### 3. C++ ソースコードの作成

ここでは、実行部分のみ掲載。（全てのコードは GitHub リポジトリとして公開している）

File: `bpn_rotation.cpp`

{% highlight c linenos %}
/***********************************************************
  バイアス・歳差・章動適用

    DATE          AUTHOR          VERSION
    2020.11.16    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.

  引数 : JST（日本標準時） X Y Z
         書式 * JST: 最大23桁の数字
                （先頭から、西暦年(4), 月(2), 日(2), 時(2), 分(2), 秒(2),
                            1秒未満(9)（小数点以下9桁（ナノ秒）まで））
              * X, Y, Z: 元の赤道直交座標
***********************************************************/
#include "bpn.hpp"
#include "coord.hpp"
#include "time.hpp"

#include <cstdlib>   // for EXIT_XXXX
#include <ctime>
#include <iomanip>   // for setprecision
#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
  namespace ns = bpn_rotation;
  std::string tm_str;      // time string
  unsigned int s_tm;       // size of time string
  int s_nsec;              // size of nsec string
  struct timespec ts;      // UTC
  struct timespec ts_jst;  // JST
  struct timespec ts_tdb;  // TDB
  struct tm t = {};        // for work
  double jcn;              // Julian Century Number
  ns::Coord pos_src;       // 直交座標（元の）
  ns::Coord pos_res;       // 座標（適用後）

  try {
    // コマンドライン引数の個数チェック
    if (argc < 5) {
      std::cout << "Usage: ./bpn_rotation JST X Y Z" << std::endl;
      return EXIT_SUCCESS;
    }

    // 日本標準時取得
    tm_str = argv[1];
    s_tm = tm_str.size();
    if (s_tm > 23) {
      std::cout << "[ERROR] Over 23-digits!" << std::endl;
      return EXIT_FAILURE;
    }
    s_nsec = s_tm - 14;
    std::istringstream is(tm_str);
    is >> std::get_time(&t, "%Y%m%d%H%M%S");
    ts_jst.tv_sec  = mktime(&t);
    ts_jst.tv_nsec = 0;
    if (s_tm > 14) {
      ts_jst.tv_nsec = std::stod(
          tm_str.substr(14, s_nsec) + std::string(9 - s_nsec, '0'));
    }

    // 元の赤道直交座標取得
    pos_src.x = std::stod(argv[2]);
    pos_src.y = std::stod(argv[3]);
    pos_src.z = std::stod(argv[4]);

    // JST -> UTC
    ts = ns::jst2utc(ts_jst);

    // TDB（太陽系力学時）, T（JCN; ユリウス世紀数）計算
    // （TDB（太陽系力学時）の代わりに、実質的に同じとみなしてもよいと
    //   されている TT（地球時）を計算してもよい）
    ns::Time o_tm(ts);  // Object of UTC
    ts_tdb = o_tm.calc_tdb();
    ns::Time o_tm_tdb(ts_tdb);  // Object of TDB
    jcn = o_tm_tdb.calc_t();

    // Calculation & Display
    ns::Bpn o_bpn(jcn);
    std::cout << "      JST: "
              << ns::gen_time_str(ts_jst) << std::endl
              << "      TDB: "
              << ns::gen_time_str(ts_tdb) << std::endl
              << "T(of TDB): "
              << std::fixed << std::setprecision(10) << jcn
              << " century (= Julian Century Number)" << std::endl;
    pos_res = o_bpn.apply_bias(pos_src);           // バイアス適用
    std::cout << "---" << std::endl
              << "元の GCRS 座標: ["
              << pos_src.x << ", " << pos_src.y << ", " << pos_src.z
              << "]" << std::endl;
    std::cout << "+ バイアス適用: ["
              << pos_res.x << ", " << pos_res.y << ", " << pos_res.z
              << "]" << std::endl;
    pos_res = o_bpn.apply_prec(pos_res);           // 歳差適用
    std::cout << "+     歳差適用: ["
              << pos_res.x << ", " << pos_res.y << ", " << pos_res.z
              << "]" << std::endl;
    pos_res = o_bpn.apply_nut(pos_res);            // 章動適用
    std::cout << "+     章動適用: ["
              << pos_res.x << ", " << pos_res.y << ", " << pos_res.z
              << "]" << std::endl;
    pos_res = o_bpn.apply_bias(pos_src);           // バイアス適用
    std::cout << "---" << std::endl
              << "元の GCRS 座標: ["
              << pos_src.x << ", " << pos_src.y << ", " << pos_src.z
              << "]" << std::endl;
    std::cout << "+ バイアス適用: ["
              << pos_res.x << ", " << pos_res.y << ", " << pos_res.z
              << "]" << std::endl;
    pos_res = o_bpn.apply_prec_nut(pos_src);      // 歳差＆章動適用
    std::cout << "+ 歳差＆章動同時適用: " << std::endl
              << "                ["
              << pos_res.x << ", " << pos_res.y << ", " << pos_res.z
              << "]" << std::endl;
    pos_res = o_bpn.apply_bias_prec(pos_src);      // バイアス＆歳差適用
    std::cout << "---" << std::endl
              << "元の GCRS 座標: ["
              << pos_src.x << ", " << pos_src.y << ", " << pos_src.z
              << "]" << std::endl;
    std::cout << "+ バイアス＆歳差同時適用: " << std::endl
              << "                ["
              << pos_res.x << ", " << pos_res.y << ", " << pos_res.z
              << "]" << std::endl;
    pos_res = o_bpn.apply_nut(pos_res);            // 章動適用
    std::cout << "+     章動適用: ["
              << pos_res.x << ", " << pos_res.y << ", " << pos_res.z
              << "]" << std::endl;
    pos_res = o_bpn.apply_bias_prec_nut(pos_src);  // バイアス＆歳差＆章動適用
    std::cout << "---" << std::endl
              << "元の GCRS 座標: ["
              << pos_src.x << ", " << pos_src.y << ", " << pos_src.z
              << "]" << std::endl
              << "+ バイアス＆歳差＆章動同時適用: " << std::endl
              << "                ["
              << pos_res.x << ", " << pos_res.y << ", " << pos_res.z
              << "]" << std::endl;

  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [GitHub - C++ source code to apply bias-precession-nutation rotation.](https://github.com/komasaru/bpn_rotation "GitHub - C++ source code to apply bias-precession-nutation rotation.")

### 4. ソースコードのビルド（コンパイル＆リンク）

* [リポジトリ](https://github.com/komasaru/bpn_rotation "GitHub - C++ source code to apply bias-precession-nutation rotation.")に `Makefile` があるので、それを使用して `make` するだけ。（リビルドする際は `make clean` をしてから）
* 上記の `Makefile` 内では別途個別にインストールした `c++102` コマンドを使用しているが、通常は `c++` であるので注意。

``` text
$ make
```

### 5. 動作確認

必要であれば、まず、うるう秒ファイル `LEAP_SEC.txt`, DUT1 ファイル `DUT1.txt` は適宜最新のものに更新する。（うるう秒、 DUT1 の値については「[C++ - 各種時刻系の換算！]({{site.baseurl}}/2021/01/06/cpp-time-series-conversion "C++ - 各種時刻系の換算！")」参照）

そして、コマンドライン引数に JST（日本標準時）を「年・月・日・時・分・秒・ナノ秒」を最大23桁で、また、変換前直交座標 X, Y, Z を指定して実行する。（JST（日本標準時）を先頭から部分的に指定した場合は、指定していない部分を `0` とみなす）

``` text
$ ./bpn_rotation 20210203090000 -1.0020195 0.066043 0.0286337 20190115123456123
      JST: 2021-02-03 09:00:00.000
      TDB: 2021-02-03 00:01:09.184
T(of TDB): 0.2109103573 century (= Julian Century Number)
---
元の GCRS 座標: [-1.0020195000, 0.0660430000, 0.0286337000]
+ バイアス適用: [-1.0020194726, 0.0660433782, 0.0286337857]
+     歳差適用: [-1.0023763830, 0.0613166655, 0.0265800372]
+     章動適用: [-1.0023713807, 0.0613851791, 0.0266105235]
---
元の GCRS 座標: [-1.0020195000, 0.0660430000, 0.0286337000]
+ バイアス適用: [-1.0020194726, 0.0660433782, 0.0286337857]
+ 歳差＆章動同時適用:
                [-1.0023714061, 0.0613848008, 0.0266104377]
---
元の GCRS 座標: [-1.0020195000, 0.0660430000, 0.0286337000]
+ バイアス＆歳差同時適用:
                [-1.0023764106, 0.0613162172, 0.0265800300]
+     章動適用: [-1.0023714083, 0.0613847308, 0.0266105163]
---
元の GCRS 座標: [-1.0020195000, 0.0660430000, 0.0286337000]
+ バイアス＆歳差＆章動同時適用:
                [-1.0023714083, 0.0613847308, 0.0266105163]
```

* バイアス・歳差・章動を別々に適用したものと、2つか3つを同時に適用したもので若干の誤差が発生してしまう。（丸め誤差の関係かもしれない）

---

以上。

