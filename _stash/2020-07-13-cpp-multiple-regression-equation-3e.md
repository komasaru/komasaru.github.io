---
layout   : single
title    : "C++ - 重回帰式計算（説明変数3個）！"
published: true
date     : 2020-07-13 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

C++ で、数値からなる同サイズの配列4個を説明変数3個・目的変数1個とみなして重回帰式を計算する方法についての記録です。  
連立1次方程式を解くのに「ガウスの消去法」を使用します。

過去には Fortran 等で実装しています。

* [Fortran - 重回帰式計算（説明変数2個）（その2）！]({{site.baseurl}}/2019/09/11/fortran95-multiple-regression-equation-v2 "Fortran - 重回帰式計算（説明変数2個）（その2）！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. アルゴリズム

求める重回帰式を $$y=b_0+b_1x_1+b_2x_2+b_3x_3$$ とすると、残差の二乗和 $$S$$ は

$$
\begin{eqnarray*}
S = \sum_{i=1}^{N}(y_i - b_0 - b_1x_{1i} - b_2x_{2i} - b_3x_{3i})^2
\end{eqnarray*}
$$

となる。 $$b_0,\ b_1,\ b_2,\ b_3$$ それぞれで偏微分したものを $$0$$ とする。

$$
\begin{eqnarray*}
\frac{\partial S}{\partial b_0} &=& 2\sum_{i=1}^{N}(b_0 + b_1x_{1i} + b_2x_{2i} + b_3x_{3i} - y_i) = 0 \\
\frac{\partial S}{\partial b_1} &=& 2\sum_{i=1}^{N}(b_0x_{1i} + b_1x_{1i}x_{1i} + b_2x_{1i}x_{2i} + b_3x_{1i}x_{3i} - x_{1i}y_i) = 0 \\
\frac{\partial S}{\partial b_2} &=& 2\sum_{i=1}^{N}(b_0x_{2i} + b_1x_{2i}x_{1i} + b_2x_{2i}x_{2i} + b_3x_{2i}x_{3i} - x_{2i}y_i) = 0 \\
\frac{\partial S}{\partial b_3} &=& 2\sum_{i=1}^{N}(b_0x_{3i} + b_1x_{3i}x_{1i} + b_2x_{3i}x_{2i} + b_3x_{3i}x_{3i} - x_{3i}y_i) = 0
\end{eqnarray*}
$$

これらを変形すると、

$$
\begin{eqnarray*}
b_0N + b_1\sum_{i=1}^{N}x_{1i} + b_2\sum_{i=1}^{N}x_{2i} + b_3\sum_{i=1}^{N}x_{3i} &=& \sum_{i=1}^{N}y_i \\
b_0\sum_{i=1}^{N}x_{1i} + b_1\sum_{i=1}^{N}x_{1i}x_{1i} + b_2\sum_{i=1}^{N}x_{1i}x_{2i} + b_3\sum_{i=1}^{N}x_{1i}x_{3i} &=& \sum_{i=1}^{N}x_{1i}y_i \\
b_0\sum_{i=1}^{N}x_{2i} + b_1\sum_{i=1}^{N}x_{2i}x_{1i} + b_2\sum_{i=1}^{N}x_{2i}x_{2i} + b_3\sum_{i=1}^{N}x_{2i}x_{3i} &=& \sum_{i=1}^{N}x_{2i}y_i \\
b_0\sum_{i=1}^{N}x_{3i} + b_1\sum_{i=1}^{N}x_{3i}x_{1i} + b_2\sum_{i=1}^{N}x_{3i}x_{2i} + b_3\sum_{i=1}^{N}x_{3i}x_{3i} &=& \sum_{i=1}^{N}x_{3i}y_i
\end{eqnarray*}
$$

となる。これらの連立1次方程式を解けばよい。

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
#ifndef REGRESSION_MULTI_3E_FILE_HPP_
#define REGRESSION_MULTI_3E_FILE_HPP_

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
      double x1, x2, x3, y;
      while (iss >> x1 >> x2 >> x3 >> y) {
        rec.push_back(x1);
        rec.push_back(x2);
        rec.push_back(x3);
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
#ifndef REGRESSION_MULTI_3E_CALC_HPP_
#define REGRESSION_MULTI_3E_CALC_HPP_

#include <vector>

class Calc {
  std::vector<std::vector<double>> data;             // 元データ
  std::vector<std::vector<double>> mtx;              // 計算用行列
  bool solve_ge(std::vector<std::vector<double>>&);  // ガウスの消去法

public:
  Calc(std::vector<std::vector<double>>& data) : data(data) {}
  unsigned int cnt;                                  // データ件数
  bool reg_multi_3e(double&, double&, double&, double&);  // 重回帰式（説明変数3個）の計算
};

#endif
{% endhighlight %}

File: `calc.cpp`

{% highlight c linenos %}
#include "calc.hpp"

#include <cmath>
#include <iostream>
#include <sstream>
#include <vector>

/**
 * @brief      重回帰式（説明変数3個）の計算
 *
 * @param[ref] a (double)
 * @param[ref] b (double)
 * @param[ref] c (double)
 * @param[ref] d (double)
 * @return     真偽(bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::reg_multi_3e(double& a, double& b, double& c, double& d) {
  unsigned int i;     // loop インデックス
  double s_x1   = 0.0;  // sum(x1)
  double s_x2   = 0.0;  // sum(x2)
  double s_x3   = 0.0;  // sum(x3)
  double s_y    = 0.0;  // sum(y)
  double s_x1x1 = 0.0;  // sum(x1 * x1)
  double s_x1x2 = 0.0;  // sum(x1 * x2)
  double s_x1x3 = 0.0;  // sum(x1 * x3)
  double s_x1y  = 0.0;  // sum(x1 * y)
  double s_x2x1 = 0.0;  // sum(x2 * x1)
  double s_x2x2 = 0.0;  // sum(x2 * x2)
  double s_x2x3 = 0.0;  // sum(x2 * x3)
  double s_x2y  = 0.0;  // sum(x2 * y)
  double s_x3x1 = 0.0;  // sum(x3 * x1)
  double s_x3x2 = 0.0;  // sum(x3 * x2)
  double s_x3x3 = 0.0;  // sum(x3 * x3)
  double s_x3y  = 0.0;  // sum(x3 * y)
  double x1     = 0.0;  // x1 計算用
  double x2     = 0.0;  // x2 計算用
  double x3     = 0.0;  // x3 計算用
  double y      = 0.0;  // y  計算用

  try {
    // データ数
    cnt = data.size();

    // sum(x1), sum(x2), sum(x3), sum(y), ...
    for (i = 0; i < cnt; i++) {
      x1 = data[i][0];
      x2 = data[i][1];
      x3 = data[i][2];
      y  = data[i][3];
      s_x1   += x1;
      s_x2   += x2;
      s_x3   += x3;
      s_y    += y;
      s_x1x1 += x1 * x1;
      s_x1x2 += x1 * x2;
      s_x1x3 += x1 * x3;
      s_x1y  += x1 * y;
      s_x2x1 += x2 * x1;
      s_x2x2 += x2 * x2;
      s_x2x3 += x2 * x3;
      s_x2y  += x2 * y;
      s_x3x1 += x3 * x1;
      s_x3x2 += x3 * x2;
      s_x3x3 += x3 * x3;
      s_x3y  += x3 * y;
    }
    // 行列1行目
    mtx.push_back({(double)cnt, s_x1, s_x2, s_x3, s_y});
    // 行列2行目
    mtx.push_back({s_x1, s_x1x1, s_x1x2, s_x1x3, s_x1y});
    // 行列3行目
    mtx.push_back({s_x2, s_x2x1, s_x2x2, s_x2x3, s_x2y});
    // 行列4行目
    mtx.push_back({s_x3, s_x3x1, s_x3x2, s_x3x3, s_x3y});

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

File: `regression_multi_3e.cpp`

{% highlight c linenos %}
/***********************************************************
  重回帰式計算（説明（独立）変数3個限定）

    DATE          AUTHOR          VERSION
    2020.07.10    mk-mode.com     1.00 新規作成

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
                << "[USAGE] ./regression_multi_3e <file_name>"
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
    std::cout << "説明変数 X1  説明変数 X2  説明変数 X3  目的変数 Y" << std::endl;
    for (i = 0; i < data.size(); i++)
      std::cout << std::setw(11) << std::right << data[i][0]
                << "  "
                << std::setw(11) << std::right << data[i][1]
                << "  "
                << std::setw(11) << std::right << data[i][2]
                << "  "
                << std::setw(10) << std::right << data[i][3]
                << std::endl;

    // 計算
    Calc calc(data);
    if (!calc.reg_multi_3e(a, b, c, d)) {
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

* [Gist - C++ source code to compute multiple regression equations.(3 explanatory variables)](https://gist.github.com/komasaru/03a557aa5ef672a876abe3f496269896 "Gist - C++ source code to compute multiple regression equations.(3 explanatory variables)")

### 4. ソースコードのコンパイル

まず、以下のように `Makefile` を作成する。（**行頭のインデントはタブ文字**）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors

regression_multi_3e: regression_multi_3e.o file.o calc.o
  g++ $(gcc_options) -o $@ $^

regression_multi_3e.o : regression_multi_3e.cpp
  g++ $(gcc_options) -c $<

file.o : file.cpp
  g++ $(gcc_options) -c $<

calc.o : calc.cpp
  g++ $(gcc_options) -c $<

run : regression_multi_3e
  ./regression_multi_3e

clean :
  rm -f ./regression_multi_3e
  rm -f ./*.o

.PHONY : run clean
```

そして、ビルド（コンパイル＆リンク）。

``` text
$ make
```

### 5. 動作確認

まず、以下のような入力ファイルを用意する。  
（各行は x1, x2, x3 （説明変数）と y （目的変数）の値）

File: `data.txt`

{% highlight text linenos %}
17.50 30.00 18.50 45.00
17.00 25.00 19.00 38.00
18.50 20.00 21.50 41.00
16.00 30.00 20.00 34.00
19.00 45.00 24.00 59.00
19.50 35.00 25.50 47.00
16.00 25.00 23.00 35.00
18.00 35.00 26.00 43.00
19.00 35.00 28.00 54.00
19.50 40.00 29.50 52.00
{% endhighlight %}

そして、実行。

``` text
$ ./regression_multi_3e data.txt
説明変数 X1  説明変数 X2  説明変数 X3  目的変数 Y
    17.5000      30.0000      18.5000     45.0000
    17.0000      25.0000      19.0000     38.0000
    18.5000      20.0000      21.5000     41.0000
    16.0000      30.0000      20.0000     34.0000
    19.0000      45.0000      24.0000     59.0000
    19.5000      35.0000      25.5000     47.0000
    16.0000      25.0000      23.0000     35.0000
    18.0000      35.0000      26.0000     43.0000
    19.0000      35.0000      28.0000     54.0000
    19.5000      40.0000      29.5000     52.0000
---
a =     -37.04636611
b =       3.94140083
c =       0.58882151
d =      -0.33792073
```

* 「1. アルゴリズム」内の $$b_0, b_1, b_2, b_3$$ は、ソースコード内の $$a, b, c, d$$ に対応。

### 6. 視覚的な確認

4次元であるため、3次元（説明変数2個、目的変数1個）の重回帰式のように、グラフを描画して視覚的に確認することはできない。

---

以上。

