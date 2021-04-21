---
layout   : single
title: "C++ - ローレンツ・アトラクタ（Euler 法）"
published: true
date     : 2020-12-09 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

C++ でローレンツ・アトラクタの計算をしてみました。  
今回は、微分方程式の近似解法に Euler（オイラー）法を使用します。

過去には Ruby や Python で同様のことをしています。

* [Ruby - ローレンツ・アトラクタ（Euler 法）！]({{site.baseurl}}/2018/06/19/ruby-lorenz-attractor-with-euler-method "Ruby - ローレンツ・アトラクタ（Euler 法）！")
* [Python - ローレンツ・アトラクタ（Euler 法）！]({{site.baseurl}}/2018/06/25/python-lorenz-attractor-with-euler-method "Python - ローレンツ・アトラクタ（Euler 法）！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.6 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. ローレンツ方程式／アトラクタとは

* 「ローレンツ方程式」とは、気象学者「エドワード・Ｎ・ローレンツ(Edward N. Lorenz)」が作成した力学系方程式をより単純化した、次のような非線形微分方程式。  
  パラメータ p, r, b をほんの少し変えるだけで、これらの方程式から得られる軌跡は大きく異なったものになる。

$$
\begin{eqnarray}
\frac{dx}{dt} &=& -px+py \\
\frac{dy}{dt} &=& -xz+rx-y \\
\frac{dz}{dt} &=& xy-bz
\end{eqnarray}
$$

* 「ローレンツ方程式」は、カオス理論を学習する際に序盤で登場する方程式で、カオス研究の先駆的なもの。
* 「アトラクタ」とは、ある力学系がそこに向かって時間発展する集合のことで、カオス理論における研究課題の一つ。
* 「ローレンツ・アトラクタ」とは、ストレンジ・アトラクタの一種。
* 「ローレンツ・アトラクタ」は、言い換えれば、「ローレンツ方程式のカオスのストレンジ・アトラクタ」である。

### 2.  Euler（オイラー）法とは

* 微分方程式の近似解法の中で計算が比較的簡単なものだが、その分、計算も粗い。
* 実際の研究等で使用されることはほとんどない。
* 近似解法の概念を理解するための一助にはなる。
* ここでは Euler 法の詳細については説明しない。

### 3. C++ ソースコードの作成

* パラメータ p, r, b の値はコマンドライン引数で指定する。
* 実際、ローレンツ・アトラクタを計算する際に計算の粗いこの「Euler 法」を使用することはあまりない（「ルンゲ＝クッタ法」で計算することが多い）ので、あくまでも参考程度に。
* 計算部分と実行部分とでファイルを分けている。

File: `calc.hpp`

{% highlight c linenos %}
#ifndef LORENZ_ATTRACTOR_EULER_CALC_HPP_
#define LORENZ_ATTRACTOR_EULER_CALC_HPP_

#include <vector>

namespace my_lib {

class Calc {
  double p;
  double r;
  double b;
  bool lorenz(const double[], double(&)[3]);  // 計算（各ステップ）

public:
  Calc(double p, double r, double b) : p(p), r(r), b(b) {}  // コンストラクタ
  bool lorenz_euler(std::vector<std::vector<double>>&);     // 計算
};

}  // namespace my_lib

#endif
{% endhighlight %}

File: `calc.cpp`

{% highlight c linenos %}
#include "calc.hpp"

#include <cmath>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <vector>

namespace my_lib {

// 定数
constexpr double kDt   = 1.0e-3;  // Differential interval
constexpr int    kStep = 100000;  // Time step count
constexpr double kX0   = 1.0;     // Initial value of x
constexpr double kY0   = 1.0;     // Initial value of y
constexpr double kZ0   = 1.0;     // Initial value of z

/**
 * @brief      計算（ローレンツ・アトラクタ（Euler 法）
 *
 * @param[ref] データ配列（計算結果） rec: (vector<vector<double>>)
 * @return     真偽(true|false)(bool)
 */
bool Calc::lorenz_euler(std::vector<std::vector<double>>& res) {
  double xyz[] = {kX0, kY0, kZ0};
  double xyz_l[3];  // 計算用（LorenzAttractor）
  unsigned int i;   // ループインデックス
  unsigned int j;   // ループインデックス

  try {
    for (i = 0; i < kStep; ++i) {
      if (!lorenz(xyz, xyz_l)) return false;
      for (j = 0; j < 3; ++j) xyz[j] += kDt * xyz_l[j];
      res.push_back({xyz[0], xyz[1], xyz[2]});
    }
  } catch (...) {
    return false;  // 計算失敗
  }

  return true;  // 計算成功
}

bool Calc::lorenz(const double xyz[], double(&xyz_l)[3]) {
  try {
    xyz_l[0] = -p * xyz[0] + p * xyz[1];
    xyz_l[1] = -xyz[0] * xyz[2] + r * xyz[0] - xyz[1];
    xyz_l[2] = xyz[0] * xyz[1] - b * xyz[2];
  } catch (...) {
    return false;
  }

  return true;
}

}  // namespace my_lib
{% endhighlight %}

File: `lorenz_attractor_euler.cpp`

{% highlight c linenos %}
/***********************************************************
  Lorenz attractor (Euler method)

    DATE          AUTHOR          VERSION
    2020.09.18    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
***********************************************************/
#include "calc.hpp"

#include <cstdlib>   // for EXIT_XXXX
#include <iomanip>   // for setprecision
#include <iostream>
#include <string>
#include <vector>

int main(int argc, char* argv[]) {
  double p;
  double r;
  double b;
  std::vector<std::vector<double>> res;  // データ配列（計算結果）
  std::size_t i;                         // loop インデックス

  try {
    // コマンドライン引数のチェック
    if (argc < 4) {
      std::cerr << "[ERROR] Number of arguments is wrong!\n"
                << "[USAGE] ./lorenz_attractor_euler p r b"
                << std::endl;
      return EXIT_FAILURE;
    }

    // p, r, b の取得
    p = std::stod(argv[1]);
    r = std::stod(argv[2]);
    b = std::stod(argv[3]);

    // 計算用オプジェクトのインスタンス化
    my_lib::Calc calc(p, r, b);

    // 計算
    if (!calc.lorenz_euler(res)) {
      std::cout << "[ERROR] Failed to calculare!" << std::endl;
      return EXIT_FAILURE;
    }

    // 結果出力
    std::cout << std::fixed << std::setprecision(8);
    for (i = 0; i < res.size(); ++i) {
      std::cout << std::setw(14) << std::right << res[i][0]
                << std::setw(14) << std::right << res[i][1]
                << std::setw(14) << std::right << res[i][2]
                << std::endl;
    }
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to calculate a Lorenz attractor by Euler's method.](https://gist.github.com/komasaru/86f8dbd84b92f97fe06cf4eaba9d77d4 "Gist - C++ source code to calculate a Lorenz attractor by Euler's method.")

### 4. ソースコードのコンパイル

まず、以下のように `Makefile` を作成する。（**行頭のインデントはタブ文字**）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors

lorenz_attractor_euler: lorenz_attractor_euler.o calc.o
  g++ $(gcc_options) -o $@ $^

lorenz_attractor_euler.o : lorenz_attractor_euler.cpp
  g++ $(gcc_options) -c $<

calc.o : calc.cpp
  g++ $(gcc_options) -c $<

run : lorenz_attractor_euler
  ./lorenz_attractor_euler

clean :
  rm -f ./lorenz_attractor_euler
  rm -f ./*.o

.PHONY : run clean
```

そして、ビルド（コンパイル＆リンク）。

``` text
$ make
```

### 5. 動作確認

コマンドライン引数に p, r, b の値を指定して実行する。  
計算結果が出力される。

``` text
$ ./lorenz_attractor_euler 10 28 2.66666667

                      :

    8.08095432    9.90859884   23.79420889
    8.09923077    9.93267705   23.81082860
    8.11756523    9.95667344   23.82778010
    8.13595631    9.98058503   23.84506330
    8.15440260   10.00440883   23.86267807
```

計算結果をファイルに出力したければ、以下のようにする。

``` text
$ ./lorenz_attractor_euler 10 28 2.66666667 > data.txt
```

### 6. 結果確認

参考までに、出力された計算結果を GNUplot で描画してみた。

![LORENZ_ATTRACTOR_EULER]({{site.baseurl}}/images/2020/12/09/LORENZ_ATTRACTOR_EULER.png "LORENZ_ATTRACTOR_EULER")

---

以上。

