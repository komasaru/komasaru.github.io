---
layout   : single
title    : "C++ - 重回帰分析・自由度調整済み決定係数の計算！"
published: true
date     : 2020-07-23 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

重回帰分析における自由度調整済み決定係数の計算を C++ で行ってみました。

過去には Fortran 等で実装しています。

* [Fortran - 重回帰分析・自由度調整済み決定係数の計算！]({{site.baseurl}}/2020/03/03/fortran95-adjusted-coefficient-of-determination "Fortran - 重回帰分析・自由度調整済み決定係数の計算！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. アルゴリズム

決定係数は説明変数（独立変数）の数が増えるほど 1 に近づくという性質を持っている。そのため、説明変数の数が多い（重回帰分析）場合には、補正した**自由度調整済み決定係数（自由度修正済み決定係数）**を使う。

計算式は次のとおり。

$$
\begin{eqnarray*}
自由度調整済み決定係数 R^2_f = 1 - \frac{\frac{S_E}{N-p-1}}{\frac{S_{y^2}}{N-1}}
\end{eqnarray*}
$$

但し、

$$
\begin{eqnarray*}
標本値の変動 &=& \sum_{i=1}^{N}(y_i - \bar{y})^2 = S_{y^2} \\
残差の変動 &=& \sum_{i=1}^{N}(y_i - Y_i)^2 = S_E \\
p &:& 説明（独立）変数の個数 \\
N &:& データ数
\end{eqnarray*}
$$

* 通常（単回帰分析）の**決定係数**については、「[Ruby - 単回帰分析（線形回帰）の決定係数計算！ ]({{site.baseurl}}/2019/06/23/ruby-regression-coefficient-of-determination "Ruby - 単回帰分析（線形回帰）の決定係数計算！ ")」を参照。

### 2. ガウスの消去法による連立方程式の解法について

当ブログ過去記事を参照。

* [C++ - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2013/09/24/cpp-simultaneous-equation-by-gauss-elimination "C++ - 連立方程式解法（ガウスの消去法）！")
* [Ruby - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2013/09/25/ruby-simultaneous-equation-by-gauss-elimination "Ruby - 連立方程式解法（ガウスの消去法）！")
* [Python - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2018/04/13/python-simultaneous-equations-with-gauss-elimination "Python - 連立方程式解法（ガウスの消去法）！")
* [Fortran - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2019/02/26/fortran95-simultaneous-equations-by-gauss-elimination "Fortran - 連立方程式解法（ガウスの消去法）！")

### 3. ソースコードの作成

* ファイル読み込み部分、計算部分、実行部分とソースファイルを分けている。

File: `file.hpp`

{% highlight c linenos %}
#ifndef ADJUSTED_COEFFICIENT_OF_DETERMINATION_FILE_HPP_
#define ADJUSTED_COEFFICIENT_OF_DETERMINATION_FILE_HPP_

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
      double s;
      while (iss >> s)
        rec.push_back(s);

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
#ifndef ADJUSTED_COEFFICIENT_OF_DETERMINATION_CALC_HPP_
#define ADJUSTED_COEFFICIENT_OF_DETERMINATION_CALC_HPP_

#include <vector>

class Calc {
  std::vector<std::vector<double>> data;             // 元データ
  std::vector<std::vector<double>> mtx;              // 計算用行列
  bool solve_ge(std::vector<std::vector<double>>&);  // ガウスの消去法

public:
  Calc(std::vector<std::vector<double>>& data) : data(data) {}
  unsigned int cnt;                                        // データ件数
  bool reg_multi_2e(double&, double&, double&);            // 重回帰式（説明変数2個）の計算
  bool y_e(double, double, double, std::vector<double>&);  // 計算・推定値
  double y_b();                                            // 計算・標本値 Y (目的変数)の平均
  double s_r(double);                                      // 計算・標本値の変動
  double s_e(std::vector<double>);                         // 計算・残差の変動
  double r_2(double);                                      // 計算・決定係数（公式使用）
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
 * @brief      重回帰式（説明変数2個）の計算
 *
 * @param[ref] a (double)
 * @param[ref] b (double)
 * @param[ref] c (double)
 * @return     真偽(bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::reg_multi_2e(double& a, double& b, double& c) {
  unsigned int i;     // loop インデックス
  double s_x1   = 0.0;  // sum(x1)
  double s_x2   = 0.0;  // sum(x2)
  double s_y    = 0.0;  // sum(y)
  double s_x1x1 = 0.0;  // sum(x1 * x1)
  double s_x1x2 = 0.0;  // sum(x1 * x2)
  double s_x1y  = 0.0;  // sum(x1 * y)
  double s_x2x1 = 0.0;  // sum(x2 * x1)
  double s_x2x2 = 0.0;  // sum(x2 * x2)
  double s_x2y  = 0.0;  // sum(x2 * y)
  double x1     = 0.0;  // x1 計算用
  double x2     = 0.0;  // x2 計算用
  double y      = 0.0;  // y  計算用

  try {
    // データ数
    cnt = data.size();

    // sum(x1), sum(x2), sum(y), ...
    for (i = 0; i < cnt; i++) {
      x1 = data[i][0];
      x2 = data[i][1];
      y  = data[i][2];
      s_x1   += x1;
      s_x2   += x2;
      s_y    += y;
      s_x1x1 += x1 * x1;
      s_x1x2 += x1 * x2;
      s_x1y  += x1 * y;
      s_x2x1 += x2 * x1;
      s_x2x2 += x2 * x2;
      s_x2y  += x2 * y;
    }
    // 行列1行目
    mtx.push_back({(double)cnt, s_x1, s_x2, s_y});
    // 行列2行目
    mtx.push_back({s_x1, s_x1x1, s_x1x2, s_x1y});
    // 行列3行目
    mtx.push_back({s_x2, s_x2x1, s_x2x2, s_x2y});

    // 計算（ガウスの消去法）
    if (!solve_ge(mtx)) {
      std::cout << "[ERROR] Failed to solve by the Gauss-Ellimination method!"
                << std::endl;
      return false;
    }

    // a, b, c
    a = mtx[0][3];
    b = mtx[1][3];
    c = mtx[2][3];
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

/**
 * @brief      計算・推定値
 *             (y_e = a + b * x)
 *
 * @param      切片     a (double)
 * @param      傾き     b (double)
 * @param[ref] 推定値 y_e (vector<double>)
 * @return     真偽       (bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::y_e(
  double a, double b, double c,
  std::vector<double>& y_e
) {
  unsigned int i;     // loop インデックス

  try {
    for (i = 0; i < cnt; i++)
      y_e.push_back(a + b * data[i][0] + c * data[i][1]);
  } catch (...) {
    return false;  // 計算失敗
  }

  return true;  // 計算成功
}

/**
 * @brief      計算・標本値 Y (目的変数)の平均
 *             (y_b = sum(y) / size(y))
 *
 * @return     標本値 Y (目的変数)の平均 (double)
 */
double Calc::y_b() {
  unsigned int i;     // loop インデックス
  double s = 0.0;

  try {
    for (i = 0; i < cnt; i++)
      s += data[i][2];
    return s / cnt;
  } catch (...) {
    throw;
  }
}

/**
 * @brief      計算・標本値の変動
 *             (sum((Y - y_b)**2))
 *
 * @param      標本値 Y の平均 y_b (double)
 * @return     推定値の変動        (double)
 */
double Calc::s_r(double y_b) {
  unsigned int i;     // loop インデックス
  double v = 0.0;
  double s = 0.0;

  try {
    for (i = 0; i < cnt; i++) {
      v = data[i][2] - y_b;
      s += v * v;
    }
    return s;
  } catch (...) {
    throw;
  }
}

/**
 * @brief      計算・残差の変動
 *             (sum((Y - y_e)**2))
 *
 * @param      推定値  y_b (vector<double>)
 * @return     残渣の変動  (double)
 */
double Calc::s_e(std::vector<double> y_e) {
  unsigned int i;     // loop インデックス
  double v = 0.0;
  double s = 0.0;

  try {
    for (i = 0; i < cnt; i++) {
      v = data[i][2] - y_e[i];
      s += v * v;
    }
    return s;
  } catch (...) {
    throw;
  }
}
{% endhighlight %}

File: `adjusted_coefficient_of_determination.cpp`

{% highlight c linenos %}
/***********************************************************
  重回帰分析（説明変数2個）決定係数計算

    DATE          AUTHOR          VERSION
    2020.07.20    mk-mode.com     1.00 新規作成

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
  std::vector<double> y_e;                // 推定値配列
  double y_b;                             // 標本値 Y （目的変数）の平均
  double s_r;                             // 推定値の変動
  double s_e;                             // 残差の変動
  double r_2;                             // 自由度調整済み決定係数
  int p;                                  // 説明（独立）変数の個数

  try {
    // コマンドライン引数のチェック
    if (argc != 2) {
      std::cerr << "[ERROR] Number of arguments is wrong!\n"
                << "[USAGE] ./adjusted_coefficient_of_determination <file_name>"
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
    std::cout << "説明変数 X  説明変数 Y  目的変数 Z" << std::endl;
    for (i = 0; i < data.size(); i++)
      std::cout << std::setw(10) << std::right << data[i][0]
                << "  "
                << std::setw(10) << std::right << data[i][1]
                << "  "
                << std::setw(10) << std::right << data[i][2]
                << std::endl;

    // 重回帰式
    Calc calc(data);
    if (!calc.reg_multi_2e(a, b, c)) {
      std::cout << "[ERROR] Failed to calculate!" << std::endl;
      return EXIT_FAILURE;
    }
    std::cout << std::fixed << std::setprecision(8);
    std::cout << "---\n"
              << "  a = " << std::setw(16) << std::right << a
              << "\n"
              << "  b = " << std::setw(16) << std::right << b
              << "\n"
              << "  c = " << std::setw(16) << std::right << c
              << std::endl;

    // 推定値
    if (!calc.y_e(a, b, c, y_e)) {
      std::cout << "[ERROR] Failed to calculate!" << std::endl;
      return EXIT_FAILURE;
    }
    // 標本値 Y （目的変数）の平均
    y_b  = calc.y_b();
    // 説明（独立）変数の個数
    p = 2;
    // 推定値の変動
    s_r  = calc.s_r(y_b);
    // 残差の変動
    s_e  = calc.s_e(y_e);
    // 自由度調整済み決定係数
    r_2 = 1.0 - (s_e / (calc.cnt - p - 1.0)) / (s_r / (calc.cnt - 1.0));
    std::cout << "---\n"
              << "R2f = " << std::setw(16) << std::right << r_2
              << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to calculate an adjusted coefficent of determination for multiple regression.](https://gist.github.com/komasaru/a593fb47b0fd3bfc7f4c5405cb66ee77 "Gist - C++ source code to calculate an adjusted coefficent of determination for multiple regression.")

### 4. ソースコードのコンパイル

まず、以下のように `Makefile` を作成する。（**行頭のインデントはタブ文字**）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors

adjusted_coefficient_of_determination: adjusted_coefficient_of_determination.o file.o calc.o
  g++ $(gcc_options) -o $@ $^

adjusted_coefficient_of_determination.o : adjusted_coefficient_of_determination.cpp
  g++ $(gcc_options) -c $<

file.o : file.cpp
  g++ $(gcc_options) -c $<

calc.o : calc.cpp
  g++ $(gcc_options) -c $<

run : adjusted_coefficient_of_determination
  ./adjusted_coefficient_of_determination

clean :
  rm -f ./adjusted_coefficient_of_determination
  rm -f ./*.o

.PHONY : run clean
```

そして、ビルド（コンパイル＆リンク）。

``` text
$ make
```

### 5. 動作確認

まず、以下のような入力ファイルを用意する。  
（各行は x, y （説明変数）と z （目的変数）の値）

File: `data.txt`

{% highlight text linenos %}
17.50 30.00 45.00
17.00 25.00 38.00
18.50 20.00 41.00
16.00 30.00 34.00
19.00 45.00 59.00
19.50 35.00 47.00
16.00 25.00 35.00
18.00 35.00 43.00
19.00 35.00 54.00
19.50 40.00 52.00
{% endhighlight %}

そして、実行。

``` text
$ ./adjusted_coefficient_of_determination data.txt
説明変数 X  説明変数 Y  目的変数 Z
   17.5000     30.0000     45.0000
   17.0000     25.0000     38.0000
   18.5000     20.0000     41.0000
   16.0000     30.0000     34.0000
   19.0000     45.0000     59.0000
   19.5000     35.0000     47.0000
   16.0000     25.0000     35.0000
   18.0000     35.0000     43.0000
   19.0000     35.0000     54.0000
   19.5000     40.0000     52.0000
---
  a =     -34.71293084
  b =       3.46981263
  c =       0.53300948
---
R2f =       0.81763371
```

* [Fortran 版]({{site.baseurl}}/2020/03/03/fortran95-adjusted-coefficient-of-determination "Fortran - 重回帰分析・自由度調整済み決定係数の計算！") や [Ruby 版]({{site.baseurl}}/2020/02/29/ruby-adjusted-coefficient-of-determination "Ruby - 重回帰分析・自由度調整済み決定係数の計算！") と答えが（概ね）一致することも確認。

---

以上。

