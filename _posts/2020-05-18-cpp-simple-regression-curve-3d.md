---
layout   : single
title    : "C++ - 単回帰曲線（3次回帰モデル）の計算！"
published: true
date     : 2020-05-18 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

C++ で、数値からなる同サイズの配列2つを説明変数・目的変数とみなして単回帰曲線（3次回帰モデル）を計算する方法についての記録です。  
今回は連立1次方程式を解くのに「ガウスの消去法」を使用します。

過去には Fortran 等で実装しています。

* [Fortran - 2つの配列から単回帰曲線（3次回帰モデル）計算！]({{site.baseurl}}/2019/08/11/fortran95-simple-regression-curve-3d "Fortran - 2つの配列から単回帰曲線（3次回帰モデル）計算！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. アルゴリズムについて

求める曲線を $$y = a + bx + cx ^2 + dx ^3$$ とすると、残差の二乗和 $$S$$ は

$$
S = \sum_{i=1}^{N}(y_i - a - bx_i - cx_i^2 - dx^3)^2
$$

となる。 $$a,b,c,d$$ それぞれで偏微分したものを $$0$$ とする。

$$
\begin{eqnarray*}
\frac{\partial S}{\partial a} &=& 2\sum_{i=1}^{N}(a + bx_i + cx_i^2 + dx_i^3 - y_i) = 0 \\
\frac{\partial S}{\partial b} &=& 2\sum_{i=1}^{N}(ax_i + bx_i^2 + cx_i^3 + dx_i^4 - x_{i}y_i) = 0 \\
\frac{\partial S}{\partial c} &=& 2\sum_{i=1}^{N}(ax_i^2 + bx_i^3 + cx_i^4 + dx_i^5 - x_{i}^{2}y_i) = 0 \\
\frac{\partial S}{\partial d} &=& 2\sum_{i=1}^{N}(ax_i^3 + bx_i^4 + cx_i^5 + dx_i^6 - x_{i}^{3}y_i) = 0
\end{eqnarray*}
$$

これらを変形すると、

$$
\begin{eqnarray*}
aN + b\sum_{i=1}^{N}x_i + c\sum_{i=1}^{N}x_i^2 + d\sum_{i=1}^{N}x_i^3 &=& \sum_{i=1}^{N}y_i \\
a\sum_{i=1}^{N}x_i + b\sum_{i=1}^{N}x_i^2 + c\sum_{i=1}^{N}x_i^3 + d\sum_{i=1}^{N}x_i^4 &=& \sum_{i=1}^{N}x_{i}y_i \\
a\sum_{i=1}^{N}x_i^2 + b\sum_{i=1}^{N}x_i^3 + c\sum_{i=1}^{N}x_i^4 + d\sum_{i=1}^{N}x_i^5 &=& \sum_{i=1}^{N}x_{i}^{2}y_i \\
a\sum_{i=1}^{N}x_i^3 + b\sum_{i=1}^{N}x_i^4 + c\sum_{i=1}^{N}x_i^5 + d\sum_{i=1}^{N}x_i^6 &=& \sum_{i=1}^{N}x_{i}^{3}y_i
\end{eqnarray*}
$$

となる。これらの連立方程式を解けばよい。

### 2. ガウスの消去法による連立1次方程式の解法について

当ブログ過去記事を参照。

* [C++ - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2013/09/24/cpp-simultaneous-equation-by-gauss-elimination "C++ - 連立方程式解法（ガウスの消去法）！")
* [Ruby - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2013/09/25/ruby-simultaneous-equation-by-gauss-elimination "Ruby - 連立方程式解法（ガウスの消去法）！")
* [Python - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2018/04/13/python-simultaneous-equations-with-gauss-elimination "Python - 連立方程式解法（ガウスの消去法）！")
* [Fortran - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2019/02/26/fortran95-simultaneous-equations-by-gauss-elimination "Fortran - 連立方程式解法（ガウスの消去法）！")

### 3. ソースコードの作成

* ファイル読み込み部分、計算部分、実行部分とソースファイルを分けている。

File: `file.hpp`

{% highlight c linenos %}
#ifndef REGRESSION_CURVE_3D_FILE_HPP_
#define REGRESSION_CURVE_3D_FILE_HPP_

#include <fstream>
#include <string>
#include <vector>

class File {
  std::string f_data;

public:
  File(std::string f_data) : f_data(f_data) {}
  bool get_text(std::vector<std::vector<double>>&);
};

#endif
{% endhighlight %}

File: `file.cpp`

{% highlight c linenos %}
#include "file.hpp"

#include <iostream>
#include <sstream>
#include <string>
#include <vector>

bool File::get_text(std::vector<std::vector<double>>& data) {
  try {
    // ファイル OPEN
    std::ifstream ifs(f_data);
    if (!ifs.is_open()) return false;  // 読み込み失敗

    // ファイル READ
    std::string buf;                   // 1行分バッファ
    while (getline(ifs, buf)) {
      std::vector<double> rec;         // 1行分ベクタ
      std::istringstream iss(buf);     // 文字列ストリーム
      std::string field;               // 1列分文字列

      // 1行分文字列を1行分ベクタに追加
      double x, y;
      while (iss >> x >> y) {
        rec.push_back(x);
        rec.push_back(y);
      }

      // １行分ベクタを data ベクタに追加
      if (rec.size() != 0) data.push_back(rec);
    }
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return false;
  }

  return true;  // 読み込み成功
}
{% endhighlight %}

File: `calc.hpp`

{% highlight c linenos %}
#ifndef REGRESSION_CURVE_3D_CALC_HPP_
#define REGRESSION_CURVE_3D_CALC_HPP_

#include <vector>

class Calc {
  std::vector<std::vector<double>> data;             // 元データ
  std::vector<std::vector<double>> mtx;              // 計算用行列
  bool solve_ge(std::vector<std::vector<double>>&);  // ガウスの消去法

public:
  Calc(std::vector<std::vector<double>>& data) : data(data) {}
  unsigned int cnt;                                  // データ件数
  bool reg_curve_3d(double&, double&, double&, double&);
                                                     // 単回帰曲線（3次）の計算
};

#endif
{% endhighlight %}

File: `calc.cpp`

{% highlight c linenos %}
#include "calc.hpp"

#include <iostream>
#include <sstream>
#include <vector>

/**
 * @brief      単回帰曲線（3次）の計算
 *
 * @param[ref] a (double)
 * @param[ref] b (double)
 * @param[ref] c (double)
 * @param[ref] d (double)
 * @return     真偽(bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::reg_curve_3d(double& a, double& b, double& c, double& d) {
  unsigned int i;     // loop インデックス
  double s_x   = 0.0;  // sum(x)
  double s_x2  = 0.0;  // sum(xx)
  double s_x3  = 0.0;  // sum(xxx)
  double s_x4  = 0.0;  // sum(xxxx)
  double s_x5  = 0.0;  // sum(xxxxx)
  double s_x6  = 0.0;  // sum(xxxxxx)
  double s_y   = 0.0;  // sum(y)
  double s_xy  = 0.0;  // sum(xy)
  double s_x2y = 0.0;  // sum(xxy)
  double s_x3y = 0.0;  // sum(xxxy)
  double x     = 0.0;  // x      計算用
  double x2    = 0.0;  // xx     計算用
  double x3    = 0.0;  // xxx    計算用
  double x4    = 0.0;  // xxxx   計算用
  double x5    = 0.0;  // xxxxx  計算用
  double x6    = 0.0;  // xxxxxx 計算用
  double y     = 0.0;  // y      計算用

  try {
    // データ数
    cnt = data.size();

    // sum(x), sum(xx), sum(xxx), sum(xxxx), sum(xxxxx), sum(xxxxxx),
    // sum(y), sum(xx), sum(xy), sum(x2y), sum(x3y)
    for (i = 0; i < cnt; i++) {
      x  = data[i][0];
      y  = data[i][1];
      x2 = x  * x;
      x3 = x2 * x;
      x4 = x3 * x;
      x5 = x4 * x;
      x6 = x5 * x;
      s_x   += x;
      s_x2  += x2;
      s_x3  += x3;
      s_x4  += x4;
      s_x5  += x5;
      s_x6  += x6;
      s_y   += y;
      s_xy  += x  * y;
      s_x2y += x2 * y;
      s_x3y += x3 * y;
    }
    // 行列1行目
    mtx.push_back({(double)cnt, s_x, s_x2, s_x3, s_y});
    // 行列2行目
    mtx.push_back({s_x, s_x2, s_x3, s_x4, s_xy});
    // 行列3行目
    mtx.push_back({s_x2, s_x3, s_x4, s_x5, s_x2y});
    // 行列4行目
    mtx.push_back({s_x3, s_x4, s_x5, s_x6, s_x3y});

    // 計算（ガウスの消去法）
    if (!solve_ge(mtx)) {
      std::cout << "[ERROR] Failed to solve by the Gauss-Ellimination method!"
                << std::endl;
      return false;
    }

    // a, b, c, d
    a = mtx[0][4];
    b = mtx[1][4];
    c = mtx[2][4];
    d = mtx[3][4];
  } catch (...) {
    return false;  // 計算失敗
  }

  return true;  // 計算成功
}

/**
 * @brief      ガウスの消去法
 *
 * @param[ref] 行列（配列） mtx (double)
 * @return     真偽(bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::solve_ge(std::vector<std::vector<double>>& mtx) {
  int i;     // loop インデックス
  int j;     // loop インデックス
  int k;     // loop インデックス
  int n;     // 元（行）の数
  double d;  // 計算用

  try {
    n = (int)mtx.size();

    // 前進消去
    for (k = 0; k < n - 1; k++) {
      for (i = k + 1; i < n; i++) {
        d = mtx[i][k] / mtx[k][k];
        for (j = k + 1; j <= n; j++)
          mtx[i][j] -= mtx[k][j] * d;
      }
    }

    // 後退代入
    for (i = n - 1; i >= 0; i--) {
      d = mtx[i][n];
      for (j = i + 1; j < n; j++)
        d -= mtx[i][j] * mtx[j][n];
      mtx[i][n] = d / mtx[i][i];
    }
  } catch (...) {
    return false;  // 計算失敗
  }

  return true;  // 計算成功
}
{% endhighlight %}

File: `regression_curve_3d.cpp`

{% highlight c linenos %}
/***********************************************************
  単回帰曲線（3次回帰モデル）計算
  : y = a + b * x + c * x^2 + d * x^3
  : 連立方程式をガウスの消去法で解く方法

    DATE          AUTHOR          VERSION
    2020.05.09    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
***********************************************************/
#include "calc.hpp"
#include "file.hpp"

#include <cstdlib>   // for EXIT_XXXX
#include <iomanip>   // for setprecision
#include <iostream>
#include <string>
#include <vector>

int main(int argc, char* argv[]) {
  std::string f_data;                     // データファイル名
  std::vector<std::vector<double>> data;  // データ配列
  std::size_t i;                          // loop インデックス
  double a;                               // 定数 a
  double b;                               // 係数 b
  double c;                               // 係数 c
  double d;                               // 係数 d

  try {
    // コマンドライン引数のチェック
    if (argc != 2) {
      std::cerr << "[ERROR] Number of arguments is wrong!\n"
                << "[USAGE] ./regression_curve_3d <file_name>"
                << std::endl;
      return EXIT_FAILURE;
    }

    // ファイル名取得
    f_data = argv[1];

    // データ取得
    File file(f_data);
    if (!file.get_text(data)) {
      std::cout << "[ERROR] Failed to read the file!" << std::endl;
      return EXIT_FAILURE;
    }

    // データ一覧出力
    std::cout << std::fixed << std::setprecision(4);
    std::cout << "説明変数 X  目的変数 Y" << std::endl;
    for (i = 0; i < data.size(); i++)
      std::cout << std::setw(10) << std::right << data[i][0]
                << "  "
                << std::setw(10) << std::right << data[i][1]
                << std::endl;

    // 計算
    Calc calc(data);
    if (!calc.reg_curve_3d(a, b, c, d)) {
      std::cout << "[ERROR] Failed to calculate!" << std::endl;
      return EXIT_FAILURE;
    }

    // 結果出力
    std::cout << std::fixed << std::setprecision(8);
    std::cout << "---\n"
              << "a = " << std::setw(16) << std::right << a
              << "\n"
              << "b = " << std::setw(16) << std::right << b
              << "\n"
              << "c = " << std::setw(16) << std::right << c
              << "\n"
              << "d = " << std::setw(16) << std::right << d
              << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to calculate a simple regression curve(3d).](https://gist.github.com/komasaru/753122ca871e2371a6e541a72e201ba1 "C++ source code to calculate a simple regression curve(3d).")

### 4. ソースコードのコンパイル

まず、以下のように `Makefile` を作成する。（**行頭のインデントはタブ文字**）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors

regression_curve_3d: regression_curve_3d.o file.o calc.o
  g++ $(gcc_options) -o $@ $^

regression_curve_3d.o : regression_curve_3d.cpp
  g++ $(gcc_options) -c $<

file.o : file.cpp
  g++ $(gcc_options) -c $<

calc.o : calc.cpp
  g++ $(gcc_options) -c $<

run : regression_curve_3d
  ./regression_curve_3d

clean :
  rm -f ./regression_curve_3d
  rm -f ./*.o

.PHONY : run clean
```

そして、ビルド（コンパイル＆リンク）。

``` text
$ make
```

### 5. 動作確認

まず、以下のような入力ファイルを用意する。  
（各行は x と y の値）

File: `data.txt`

{% highlight text linenos %}
107  286
336  851
233  589
 82  389
 61  158
378 1037
129  463
313  563
142  372
428 1020
{% endhighlight %}

そして、ファイル名を引数に指定して実行。

``` text
$ ./regression_curve_3d data.txt
明変数 X  目的変数 Y
  107.0000    286.0000
  336.0000    851.0000
  233.0000    589.0000
   82.0000    389.0000
   61.0000    158.0000
  378.0000   1037.0000
  129.0000    463.0000
  313.0000    563.0000
  142.0000    372.0000
  428.0000   1020.0000
---
a =      37.38771427
b =       3.68116689
c =      -0.00953082
d =       0.00001548
```

参考までに、上記で使用した2変量の各点と作成された単回帰直線を gnuplot で描画してみた。

![REGRESSION_CURVE_3D]({{site.baseurl}}/images/2020/05/18/REGRESSION_CURVE_3D.png "REGRESSION_CURVE_3D")

---

以上。

