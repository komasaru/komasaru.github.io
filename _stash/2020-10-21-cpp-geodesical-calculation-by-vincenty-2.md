---
layout   : single
title    : "C++ - Vincenty 法による地球楕円体上の位置計算！"
published: true
date     : 2020-10-21 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
- GIS
---

地球楕円体上の任意の2地点間の距離やそれぞれから見た方位角、また、1地点から見た方位角・距離にある地点の位置等を計算するために Vincenty 法なるアルゴリズムが存在します。

前回、 C++ で「地球楕円体上の任意の2地点間の距離やそれぞれから見た方位角」の計算処理を実装してみました。  
今回は、 C++ で「地球楕円体上の1地点から見た方位角・距離にある地点の位置等」の計算処理を実装してみました。

過去には、 Ruby や Fortran で実装しています。

* [Ruby - Vincenty 法による地球楕円体上の距離／位置計算！ ]({{site.baseurl}}/2019/09/26/ruby-geodesical-calculation-by-vincenty "Ruby - Vincenty 法による地球楕円体上の距離／位置計算！ ")
* [Fortran 2003 - Vincenty 法による地球楕円体上の距離／位置計算！ ]({{site.baseurl}}/2019/09/29/fortran03-geodesical-calculation-by-vincenty "Fortran 2003 - Vincenty 法による地球楕円体上の距離／位置計算！ ")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.5 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. Vincenty法 (Vincenty's formulae) について

#### 1-1. Introduction（紹介）

Vincenty 法(Vincenty's formulae)とは、T.Vincenty が考案した、楕円体上の2点間の距離を計算したり、1点から指定の方角・距離にある点を求めたりするのに使用する反復計算アルゴリズムである、

#### 1-2. Notation（表記法）

以下のように定義する。

$$
\begin{eqnarray*}
a &:& 赤道半径（長半径） \\
b &:& 極半径（短半径） \\
f &:& 扁平率 \\
&& = \frac{a - b}{a} \\
\phi_1, \phi_2 &:& 地点1,2の緯度（北緯:+, 南緯:-） \\
L_1, L_2 &:& 地点1,2の経度（東経:+, 西経:-） \\
L &:& 地点1と2の経度の差 \\
&& = L_1 - L_2 \\
s &:& 地点1と2の楕円体上の距離 \\
\alpha_1, \alpha_2 &:& 地点1,2における方位角（北を基点に時計回り） \\
\alpha &:& 赤道上での方位角 \\
U_1 &:& 地点1の更成緯度 \\
&& = \tan^{-1} \{(1 - f)\tan \phi_1\}  \\
&& (\because \tan U_1 = (1 - f)\tan \phi_1) \\
U_2 &:& 地点2の更成緯度 \\
&& = \tan^{-1} \{(1 - f)\tan \phi_2\}  \\
&& (\because \tan U_2 = (1 - f)\tan \phi_2) \\
\lambda_1, \lambda_2 &:& 補助球上の地点1,2の経度 \\
\lambda &:& 補助球上の地点1,2の経度の差 \\
\sigma &:& 補助球上の地点1から2までの距離（弧の長さ） \\
\sigma_1 &:& 補助球上の赤道から地点1までの距離（孤の長さ） \\
\sigma_m &:& 補助球上の赤道から\sigma_1の中点までの距離（孤の長さ） \\
\end{eqnarray*}
$$

#### 1-3. Direct formula （順解法）

地点1 $$(\phi_1, L_1)$$ と地点1における方位角 $$\alpha_1$$, 距離 $$s$$ が与えられたとき、地点2 $$(\phi_2, L_2)$$ と方位角 $$\alpha_2$$ を求める。

$$
\begin{eqnarray*}
\tan U_1 &=& (1 - f)\tan \phi_1 \\
U_1 &=& \tan^{-1} \{(1 - f)\tan \phi_1\} \ (= \tan^{-1} (\tan U_1)) \\
\sigma_1 &=& \tan^{-1} \frac{\tan U_1}{\cos \alpha_1} \\
\sin \alpha &=& \cos U_1 \sin \alpha_1 \\
u^2 &=& \cos^2 \alpha \left(\frac{a^2 - b^2}{b^2}\right) = (1 - \sin^2 \alpha)\left(\frac{a^2 - b^2}{b^2}\right) \\
A &=& 1 + \frac{u^2}{16384}[4096 + u^2 \{-768 + u^2 (320 - 175 u^2)\}] \\
B &=& \frac{u^2}{1024}[256 + u^2 \{-128 + u^2 (74 - 47 u^2)\}]
\end{eqnarray*}
$$

$$\displaystyle \sigma = \frac{s}{bA}$$ で初期化後、 $$\sigma$$ の値が収束する（無視できるレベルになる）まで、以下をループ処理する。

$$
\begin{eqnarray*}
2\sigma_m &=& 2\sigma_1 + \sigma \\
\Delta\sigma &=& B\sin\sigma[\cos2\sigma_m + \frac{1}{4}B\{\cos\sigma(-1 + 2\cos^2 2\sigma_m) \\
&& - \frac{1}{6}B\cos2\sigma_m(-3 + 4\sin^2\sigma)(-3 + 4\cos^2 2\sigma_m)\}] \\
\sigma &=& \frac{s}{bA} + \Delta\sigma
\end{eqnarray*}
$$

$$\sigma$$収束後、以下の処理を行なう。

$$
\begin{eqnarray*}
\phi_2 &=& \tan^{-1}\frac{\sin U_1\cos \sigma + \cos U_1 \sin \sigma \cos \alpha_1}{(1 - f)\sqrt{\sin^2\alpha + (\sin U_1 \sin \sigma - \cos U_1 \cos \sigma \cos \alpha_1)^2}} \\
\lambda &=& \tan^{-1}\frac{\sin \sigma \sin \alpha_1}{\cos U_1 \cos \sigma - \sin U_1 \sin \sigma \cos \alpha_1} \\
C &=& \frac{f}{16} \cos^2\alpha \{4 + f(4 - 3\cos^2\alpha)\} \\
L &=& \lambda - (1 - C)f\sin\alpha [\sigma + C\sin\sigma\{\cos 2\sigma_m + C\cos\sigma (-1 + 2\cos^2 2\sigma_m)\}] \\
L_2 &=& L + L_1 \\
\alpha_2 &=& \tan^{-1}\frac{\sin\alpha}{-\sin U_1 \sin\sigma + \cos U_1 \cos\sigma \cos\alpha_1}
\end{eqnarray*}
$$

#### 1-4. Inverse formula （逆解法）

楕円体上の2地点、地点1 $$(\phi_1, L_1)$$, 地点2 $$(\phi_2, L_2)$$ が与えられたとき、地点1, 2における方位角 $$\alpha_1, \alpha_2$$ と距離 $$s$$ を求める。

$$
\begin{eqnarray*}
U_1 &=& \tan^{-1} \{(1 - f)\tan \phi_1\}  \\
U_2 &=& \tan^{-1} \{(1 - f)\tan \phi_2\}  \\
L &=& L_1 - L_2
\end{eqnarray*}
$$

$$\lambda = L$$ で初期化後、 $$\lambda$$ の値が収束する（無視できるレベルになる）まで、以下をループ処理する。

$$
\begin{eqnarray*}
\sin\sigma &=& \sqrt{(\cos U_2 \sin\lambda)^2 + (\cos U_1 \sin U_2 - \sin U_1 \cos U_2 \cos\lambda)^2} \\
\cos\sigma &=& \sin U_1 \sin U_2 + \cos U_1 \cos U_2 \cos\lambda \\
\sigma &=& \tan^{-1}\frac{\sin\sigma}{\cos\sigma} \\
\sin\alpha &=& \frac{\cos U_1 \cos U_2 \sin\lambda}{\sin\sigma} \\
\cos^2\alpha &=& 1 - \sin^2\alpha \\
\cos2\sigma_m &=& \cos\sigma - \frac{2\sin U_1 \sin U_2}{\cos^2\alpha} \\
C &=& \frac{f}{16} \cos^2\alpha \{4 + f(4 - 3\cos^2\alpha)\} \\
L &=& \lambda - (1 - C)f\sin\alpha [\sigma + C\sin\sigma\{\cos 2\sigma_m + C\cos\sigma (-1 + 2\cos^2 2\sigma_m)\}]
\end{eqnarray*}
$$

$$\lambda$$ 収束後、以下の処理を行なう。

$$
\begin{eqnarray*}
u^2 &=& \cos^2 \alpha \left(\frac{a^2 - b^2}{b^2}\right) \\
A &=& 1 + \frac{u^2}{16384}[4096 + u^2 \{-768 + u^2 (320 - 175 u^2)\}] \\
B &=& \frac{u^2}{1024}[256 + u^2 \{-128 + u^2 (74 - 47 u^2)\}] \\
\Delta\sigma &=& B\sin\sigma[\cos2\sigma_m + \frac{1}{4}B\{\cos\sigma(-1 + 2\cos^2 2\sigma_m) \\
&& - \frac{1}{6}B\cos2\sigma_m(-3 + 4\sin^2\sigma)(-3 + 4\cos^2 2\sigma_m)\}] \\
s &=& bA(\sigma - \Delta\sigma) \\
\alpha_1 &=& \tan^{-1}\frac{\cos U_2 \sin\lambda}{\cos U_1 \sin U_2 - \sin U_1 \cos U_2 \cos\lambda} \\
\alpha_2 &=& \tan^{-1}\frac{\cos U_1 \sin\lambda}{-\sin U_1 \cos U_2 + \cos U_1 \sin U_2 \cos\lambda}
\end{eqnarray*}
$$

### 2. ソースコードの作成

* 今回の「地球楕円体上の1地点から見た方位角・距離にある地点の位置等」の計算に使用するのは「順解法」である。

File: `vincenty.hpp`

{% highlight c linenos %}
#ifndef VINCENTY_CALC_DESTINATION_VINCENTY_HPP_
#define VINCENTY_CALC_DESTINATION_VINCENTY_HPP_

#include <tuple>

namespace my_lib {
  class Vincenty {
    double b;                     // 極半径（短半径）
    double phi_1;                 // 地点 1 の緯度
    double l_1;                   // 地点 1 の経度
    double tan_u_1;               // tan(地点 1 の更成緯度)
    double u_1;                   // 地点 1 の更成緯度
    double deg2rad(double);       // 度 => ラジアン
    double rad2deg(double);       // ラジアン => 度
    double calc_a(double);        // A 計算
    double calc_b(double);        // B 計算
    double calc_c(double);        // C 計算
    double calc_dlt_sgm(double, double, double, double);  // Δσ 計算
    double norm_lng(double);      // 経度正規化
    double norm_az(double);       // 方位角正規化

  public:
    Vincenty(double, double);  // コンストラクタ
    std::tuple<double, double, double> calc_destination(double, double);
                               // 地点 2 の緯度・経度、地点 2 における方位を計算
                               // （Vincenty 順解法）
  };
}

#endif
{% endhighlight %}

File: `vincenty.cpp`

{% highlight c linenos %}
#include "vincenty.hpp"

#include <cmath>
#include <iostream>
#include <tuple>

namespace my_lib {
  // 定数
  constexpr double kA        = 6378137.0;             // GRS80 長半径
  constexpr double kF        = 1.0 / 298.257222101;   // GRS80 扁平率
  constexpr double kPi       = std::atan(1.0) * 4.0;  // PI
  constexpr double kPi2      = kPi * 2.0;             // PI * 2
  constexpr double kPi180    = kPi / 180.0;           // PI / 180
  constexpr double kPi180Inv = 1.0 / kPi180;          // 1 / (PI / 180)
  constexpr double kEps      = 1.0e-11;               // 1^(-11) = 10^(-12) で 0.06mm の精度

  Vincenty::Vincenty(double lat_1, double lng_1) {
    try {
      b = kA * (1.0 - kF);
      phi_1 = deg2rad(lat_1);
      l_1 = deg2rad(lng_1);
      tan_u_1 = (1.0 - kF) * std::tan(phi_1);
      u_1 = std::atan(tan_u_1);
    } catch (...) {
      throw;
    }
  }

  /**
   * @brief      地点 2 の緯度・経度、地点 2 における方位を計算
   *             （Vincenty 順解法）
   *
   * @param[in]  az_1: 地点 1 における方位角(double)
   * @param[in]     s: 地点 1〜2 の距離(double)
   * @return     {
   *               lat_2: 地点 2 の緯度(double),
   *               lng_2: 地点 2 の経度(double),
   *                az_2: 地点 2 における方位角(double)
   *             }(tuple)
   */
  std::tuple<double, double, double> Vincenty::calc_destination(
      double az_1, double s) {
    double lat_2 = 0.0;  // 地点 2 の緯度
    double lng_2 = 0.0;  // 地点 2 の経度
    double az_2  = 0.0;  // 地点 2 における方位角
    double alp_1;
    double cos_alp_1;  // cos(α_1)
    double sin_alp_1;  // sin(α_1)
    double sgm_1;
    double sin_alp;    // sin(α)
    double sin2_alp;   // sin(α)^2
    double cos2_alp;   // cos(α)^2 = 1 - sin(α)^2
    double u2;
    double aa;         // A
    double bb;         // B
    double cc;         // C
    double sgm;
    double sgm_prev;
    double cos_sgm;    // cos(σ)
    double sin_sgm;    // sin(σ)
    double cos_2_sgm_m;
    double d_sgm;      // Δσ
    double cos_u_1;    // cos(u_1)
    double sin_u_1;    // sin(u_1)
    double cu1_cs;     // cos(u_1) * cos(σ)
    double cu1_ss;     // cos(u_1) * sin(σ)
    double su1_cs;     // sin(u_1) * cos(σ)
    double su1_ss;     // sin(u_1) * sin(σ)
    double tmp;
    double phi_2;
    double lmd;
    double l;
    double l_2;
    double alp_2;

    try {
      alp_1 = deg2rad(az_1);
      cos_alp_1 = std::cos(alp_1);
      sin_alp_1 = std::sin(alp_1);
      sgm_1 = std::atan2(tan_u_1, cos_alp_1);
      sin_alp  = std::cos(u_1) * std::sin(alp_1);
      sin2_alp = sin_alp * sin_alp;
      cos2_alp = 1.0 - sin2_alp;
      u2 = cos2_alp * (kA * kA - b * b) / (b * b);
      aa = calc_a(u2);
      bb = calc_b(u2);
      sgm      = s / (b * aa);
      sgm_prev = kPi2;

      while (std::abs(sgm - sgm_prev) > kEps) {
        cos_sgm = std::cos(sgm);
        sin_sgm = std::sin(sgm);
        cos_2_sgm_m = std::cos(2.0 * sgm_1 + sgm);
        d_sgm = calc_dlt_sgm(bb, cos_sgm, sin_sgm, cos_2_sgm_m);
        sgm_prev = sgm;
        sgm = s / (b * aa) + d_sgm;
      }

      cos_u_1 = std::cos(u_1);
      sin_u_1 = std::sin(u_1);
      cu1_cs = cos_u_1 * cos_sgm;
      cu1_ss = cos_u_1 * sin_sgm;
      su1_cs = sin_u_1 * cos_sgm;
      su1_ss = sin_u_1 * sin_sgm;
      tmp = su1_ss - cu1_cs * cos_alp_1;
      phi_2 = std::atan2(
        su1_cs + cu1_ss * cos_alp_1,
        (1.0 - kF) * std::sqrt(sin_alp * sin_alp + tmp * tmp)
      );
      lmd = std::atan2(sin_sgm * sin_alp_1, cu1_cs - su1_ss * cos_alp_1);
      cc = calc_c(cos2_alp);
      l = lmd - (1.0 - cc) * kF * sin_alp
          * (sgm + cc * sin_sgm
          * (cos_2_sgm_m + cc * cos_sgm
          * (-1.0 + 2.0 * cos_2_sgm_m * cos_2_sgm_m)));
      l_2 = l + l_1;
      alp_2 = std::atan2(sin_alp, -su1_ss + cu1_cs * cos_alp_1) + kPi;
      lat_2 = rad2deg(phi_2);
      lng_2 = rad2deg(norm_lng(l_2));
      az_2  = rad2deg(norm_az(alp_2));

      return {lat_2, lng_2, az_2};
    } catch (...) {
      throw;
    }

    return {s, az_1, az_2};  // 計算成功
  }

  /**
   * @brief      度 => ラジアン
   *
   * @param[in]  deg: 度      (double)
   * @return     rad: ラジアン(double)
   */
  double Vincenty::deg2rad(double deg) {
    try {
      return deg * kPi180;
    } catch (...) {
      return 0.0;
    }
  }

  /**
   * @brief      ラジアン => 度
   *
   * @param[in]  rad: ラジアン(double)
   * @return     deg: 度      (double)
   */
  double Vincenty::rad2deg(double rad) {
    try {
      return rad * kPi180Inv;
    } catch (...) {
      return 0.0;
    }
  }

  /**
   * @brief  A 計算
   *
   * @param[in] u2: u^2 の値
   * @return     a: A の値(double)
   */
  double Vincenty::calc_a(double u2) {
    try {
      return 1.0 + u2 / 16384.0 * (4096.0 + u2 * (-768.0 + u2 * (320.0
             - 175.0 * u2)));
    } catch (...) {
      return 0.0;
    }
  }

  /**
   * @brief  B 計算
   *
   * @param[in] u2: u^2 の値
   * @return     b: B の値(double)
   */
  double Vincenty::calc_b(double u2) {
    try {
      return u2 / 1024.0 * (256.0 + u2 * (-128.0 + u2 * (74.0 - 47.0 * u2)));
    } catch (...) {
      return 0.0;
    }
  }

  /**
   * @brief  C 計算
   *
   * @param[in] cos2_alp: cos^2(α) の値
   * @return           c: C の値(double)
   */
  double Vincenty::calc_c(double cos2_alp) {
    try {
      return kF * cos2_alp * (4.0 + kF * (4.0 - 3.0 * cos2_alp)) / 16.0;
    } catch (...) {
      return 0.0;
    }
  }

  /**
   * Δσ 計算
   *
   * @param[in]          bb: B の値
   * @param[in]     cos_sgm: cos(σ) の値
   * @param[in]     sin_sgm: sin(σ) の値
   * @param[in] cos_2_sgm_m: cos(2σ_m) の値
   * @return        dlt_sgm: Δσ の値
   */
  double Vincenty::calc_dlt_sgm(
      double bb, double cos_sgm, double sin_sgm, double cos_2_sgm_m) {
    try {
      return bb * sin_sgm * (cos_2_sgm_m
             + bb / 4.0 * (cos_sgm * (-1.0 + 2.0 * cos_2_sgm_m * cos_2_sgm_m)
             - bb / 6.0 * cos_2_sgm_m * (-3.0 + 4.0 * sin_sgm * sin_sgm)
             * (-3.0 + 4.0 * cos_2_sgm_m * cos_2_sgm_m)));
    } catch (...) {
      return 0.0;
    }
  }

  /**
   * @brief      経度正規化
   *
   * @param[in]  lng: 正規化前の経度(rad)(double)
   * @return     lng: 正規化後の経度(rad)(double)
   */
  double Vincenty::norm_lng(double lng) {
    try {
      while (lng < -kPi) lng += kPi2;
      while (lng >  kPi) lng -= kPi2;
    } catch (...) {
      return 0.0;
    }

    return lng;
  }

  /*
   * 方位角正規化
   *
   *  @param[in]  alp: 正規化前の方位角(rad)
   *  @return     alp: 正規化後の方位角(rad)
   */
  double Vincenty::norm_az(double alp) {
    try {
      if (alp <  0.0) alp += kPi2;
      if (alp > kPi2) alp -= kPi2;
    } catch (...) {
      return 0.0;
    }

    return alp;
  }
}
{% endhighlight %}

File: `vincenty_destination.cpp`

{% highlight c linenos %}
/***********************************************************
  Vincenty 法で、1点から指定の方位角・距離にある点を求める

    DATE          AUTHOR          VERSION
    2020.09.15    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
***********************************************************/
#include "vincenty.hpp"

#include <cstdlib>   // for EXIT_XXXX
#include <iomanip>   // for setprecision
#include <iostream>
#include <string>
#include <tuple>

int main(int argc, char* argv[]) {
  double lat_1;  // 地点 1 緯度
  double lng_1;  // 地点 1 経度
  double az_1;   // 地点 1 における方位角
  double s;      // 地点 1〜2 の距離
  std::tuple<double, double, double> t;
                 // 地点 2 の緯度・経度、地点 2 における方位角

  try {
    // コマンドライン引数のチェック
    if (argc < 5) {
      std::cerr << "[ERROR] Number of arguments is wrong!\n"
                << "[USAGE] ./vincenty_destination lat_1 lng_1 az_1 s"
                << std::endl;
      return EXIT_FAILURE;
    }

    // 地点 1, 2 の緯度・経度、地点 1 における方位角、地点 1〜2 の距離取得
    lat_1 = std::stod(argv[1]);
    lng_1 = std::stod(argv[2]);
    az_1  = std::stod(argv[3]);
    s     = std::stod(argv[4]);
    std::cout << std::fixed << std::setprecision(8);
    std::cout << "  POINT-1: "
              << std::setw(13) << std::right << lat_1 << "°, "
              << std::setw(13) << std::right << lng_1 << "°"
              << std::endl;
    std::cout << "AZIMUTH-1: "
              << std::setw(17) << std::right << az_1 << "°"
              << std::endl;
    std::cout << "   LENGTH: "
              << std::setw(17) << std::right << s << "m"
              << std::endl;

    // 計算
    my_lib::Vincenty v(lat_1, lng_1);
    t = v.calc_destination(az_1, s);

    // 結果出力
    std::cout << std::fixed << std::setprecision(8);
    std::cout << "-->" << std::endl;
    std::cout << "  POINT-2: "
              << std::setw(13) << std::right << std::get<0>(t) << "°, "
              << std::setw(13) << std::right << std::get<1>(t) << "°"
              << std::endl;
    std::cout << "AZIMUTH-2: "
              << std::setw(17) << std::right << std::get<2>(t) << "°"
              << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to calculate geodesical values by Vincenty's formulae.(destination)](https://gist.github.com/komasaru/1e80fd4d186bee4519a2da7e6a22b99e "Gist - C++ source code to calculate geodesical values by Vincenty's formulae.(destination)")

### 3. ソースコードのコンパイル

まず、以下のように `Makefile` を作成する。（**行頭のインデントはタブ文字**）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors

vincenty_destination: vincenty_destination.o vincenty.o
  g++ $(gcc_options) -o $@ $^

vincenty_destination.o : vincenty_destination.cpp
  g++ $(gcc_options) -c $<

calc.o : vincenty.cpp
  g++ $(gcc_options) -c $<

run : vincenty_destination
  ./vincenty_destination

clean :
  rm -f ./vincenty_destination
  rm -f ./*.o

.PHONY : run clean
```

そして、ビルド（コンパイル＆リンク）。

``` text
$ make
```

### 4. 動作確認

コマンドライン引数に地点 1 の緯度(°)・経度(°)、地点 1 から見た地点 2 の方位角(°)・距離(m)を指定して実行する。

``` text
$ ./vincenty_destination 35.4681 133.0486 21.21518366 490.58216516
  POINT-1:   35.46810000°,  133.04860000°
AZIMUTH-1:       21.21518366°
   LENGTH:      490.58216516m
-->
  POINT-2:   35.47222200°,  133.05055600°
AZIMUTH-2:      201.21631869°
```

* `POINT-2` は地点 2 緯度・経度
* `AZIMUTH-2` は地点 2 から見た地点 1 の方位角

### 5. 参考

* [Direct and Inverse solutions of geodesics on the ellipsoid with application of nested equations - inverse.pdf](https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf "Direct and Inverse solutions of geodesics on the ellipsoid with application of nested equations - inverse.pdf")

---

以上。

