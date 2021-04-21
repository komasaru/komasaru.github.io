---
layout   : single
title    : "C++ - 単回帰分析（線形回帰）の決定係数計算！"
published: true
date     : 2020-06-27 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

C++ で2つの単回帰分析（線形回帰; 単回帰直線）の決定係数を計算してみました。

過去には Fortran 等で実装しています。

* [Ruby - 単回帰分析（線形回帰）の決定係数計算！]({{site.baseurl}}/2019/06/23/ruby-regression-coefficient-of-determination "Ruby - 単回帰分析（線形回帰）の決定係数計算！")
* [Fortran - 単回帰分析（線形回帰）の決定係数計算！]({{site.baseurl}}/2019/06/29/fortran95-regression-coefficient-of-determination "Fortran - 単回帰分析（線形回帰）の決定係数計算！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. 決定係数について

回帰分析において、目的変数の標本値（実測値）に対する目的変数の推測値（予測値）の説明力を表す指標（言い換えれば、説明変数（独立変数）が目的変数（従属変数）をどれくらい説明できているかを表す統計量）が

$$
\begin{eqnarray*}
決定係数 R^2
\end{eqnarray*}
$$

である。（「$$R$$の$$2$$乗」で表現するが、必ずしも何かの値の $$2$$ 乗になるという意味ではない）

決定係数 $$R^2$$ は次のように定義する。（定義の仕方は複数あるが、次の定義が最も一般的）

$$
\begin{eqnarray*}
決定係数 R^2 = \frac{推定値の変動}{標本値の変動} = \frac{S_R}{S_{y^2}}
\end{eqnarray*}
$$

但し、

$$
\begin{eqnarray*}
標本値の変動 &=& \sum_{i=1}^{N}(y_i - \bar{y})^2 = S_{y^2} \\
推定値の変動 &=& \sum_{i=1}^{N}(Y_i - \bar{y})^2 = S_R \\
残差の変動 &=& \sum_{i=1}^{N}(y_i - Y_i)^2 = S_E 
\end{eqnarray*}
$$

これら3つの変動の間には次のような関係が成り立つ。

$$
\begin{eqnarray*}
標本値の変動 = 推定値の変動 + 残差の変動
\end{eqnarray*}
$$

これから、

$$
\begin{eqnarray*}
1 &=& \frac{推定値の変動}{標本値の変動} + \frac{残差の変動}{標本値の変動} \\
\therefore \ \ 1 &=& 決定係数 R^2 + \frac{残差の変動}{標本値の変動} \\
\end{eqnarray*}
$$

よって、

$$
\begin{eqnarray*}
決定係数 R^2 &=& 1 - \frac{残差の変動}{標本値の変動}
\end{eqnarray*}
$$

となる。これは、「残差の変動が $$0$$ に近ければ、決定係数が $$1$$ が近くなる」ということで、「決定係数 $$R^2$$ が $$1$$ に近いほど、当てはまりが良い（説明変数が目的変数をより説明できている）」と表現できることになる。

ちなみに、単回帰分析（線形回帰）の場合、

$$
\begin{eqnarray*}
(xとyの相関係数)^2 = 決定係数
\end{eqnarray*}
$$

となる。また、

$$
\begin{eqnarray*}
S_{y^2} &=& \sum_{i=1}^{N}y_i^2 - \frac{\left( \displaystyle{\sum_{i=1}^{N}y_i} \right)^2}{N} \\
S_{xy} &=& \sum_{i=1}^{N}x_{i}y_{i} - \frac{\displaystyle{\sum_{i=1}^{N}x_i} \sum_{i=1}^{N}y_i}{N} \\
S_R &=& b \cdot S_{xy} \\
\end{eqnarray*}
$$

でるあること（導出方法は略）を利用して、
$$
\begin{eqnarray*}
決定係数 R^2 &=& \frac{S_R}{S_{y^2}}
\end{eqnarray*}
$$

を求めることもできる。

### 2. ソースコードの作成

* 以下のソースコードでは4種の方法で決定係数を計算している。
* ファイル読み込み部分、計算部分、実行部分とソースファイルを分けている。

File: `file.hpp`

{% highlight c linenos %}
#ifndef COEFFICIENT_OF_DETERMINATION_LINE_FILE_HPP_
#define COEFFICIENT_OF_DETERMINATION_LINE_FILE_HPP_

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
#ifndef COEFFICIENT_OF_DETERMINATION_LINE_CALC_HPP_
#define COEFFICIENT_OF_DETERMINATION_LINE_CALC_HPP_

#include <vector>

class Calc {
  std::vector<std::vector<double>> data;             // 元データ
  std::vector<std::vector<double>> mtx;              // 計算用行列
  bool solve_ge(std::vector<std::vector<double>>&);  // ガウスの消去法

public:
  Calc(std::vector<std::vector<double>>& data) : data(data) {
    cnt = data.size();
  }
  unsigned int cnt;                                  // データ件数
  bool reg_line(double&, double&, double&);          // 単回帰直線の計算
  bool y_e(double, double, std::vector<double>&);    // 計算・推定値
  double y_b();                                      // 計算・標本値 Y (目的変数)の平均
  double s_r(std::vector<double>, double);           // 計算・推定値の変動
  double s_y2(double);                               // 計算・標本値の変動
  double s_e(std::vector<double>);                   // 計算・残渣の変動
  double r_2(double);                                // 計算・決定係数（公式使用）
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
 * @brief      単回帰直線の計算
 *
 * @param[ref] 切片     a (double)
 * @param[ref] 傾き     b (double)
 * @param[ref] 相関係数 r (double)
 * @return     真偽       (bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::reg_line(double& a, double& b, double& r) {
  unsigned int i;     // loop インデックス
  double s_x  = 0.0;  // sum(x)
  double s_y  = 0.0;  // sum(y)
  double s_xx = 0.0;  // sum(xx)
  double s_xy = 0.0;  // sum(xy)
  double m_x  = 0.0;  // x の相加平均
  double m_y  = 0.0;  // y の相加平均
  double cov  = 0.0;  // x と y の共分散
  double v_x  = 0.0;  // x の分散
  double v_y  = 0.0;  // y の分散

  try {
    // sum(x), sum(y), sum(xx), sum(xy)
    for (i = 0; i < cnt; i++) {
      s_x  += data[i][0];
      s_y  += data[i][1];
      s_xx += data[i][0] * data[i][0];
      s_xy += data[i][0] * data[i][1];
    }
    // 行列1行目
    mtx.push_back({(double)cnt, s_x, s_y});
    // 行列2行目
    mtx.push_back({s_x, s_xx, s_xy});

    // 計算（ガウスの消去法）
    if (!solve_ge(mtx)) {
      std::cout << "[ERROR] Failed to solve by the Gauss-Ellimination method!"
                << std::endl;
      return false;
    }

    // 切片、傾き
    a = mtx[0][2];
    b = mtx[1][2];

    // 相関係数
    m_x = s_x / cnt;
    m_y = s_y / cnt;
    for (i = 0; i < cnt; i++) {
      cov += (data[i][0] - m_x) * (data[i][1] - m_y);
      v_x += (data[i][0] - m_x) * (data[i][0] - m_x);
      v_y += (data[i][1] - m_y) * (data[i][1] - m_y);
    }
    r = (cov / std::sqrt(v_x)) / std::sqrt(v_y);
  } catch (...) {
    return false;  // 計算失敗
  }

  return true;  // 計算成功
}

/**
 * @brief      ガウスの消去法
 *
 * @param[ref] 行列（配列） mtx (double)
 * @return     真偽             (bool)
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
  double a, double b,
  std::vector<double>& y_e
) {
  unsigned int i;     // loop インデックス

  try {
    for (i = 0; i < cnt; i++)
      y_e.push_back(a + b * data[i][0]);
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
      s += data[i][1];
    return s / cnt;
  } catch (...) {
    throw;
  }
}

/**
 * @brief      計算・推定値の変動
 *             (sum((y_e - y_b)**2))
 *
 * @param      推定値          y_e (vector<double>)
 * @param      標本値 Y の平均 y_b (double)
 * @return     推定値の変動        (double)
 */
double Calc::s_r(std::vector<double> y_e, double y_b) {
  unsigned int i;     // loop インデックス
  double v = 0.0;
  double s = 0.0;

  try {
    for (i = 0; i < cnt; i++) {
      v = y_e[i] - y_b;
      s += v * v;
    }
    return s;
  } catch (...) {
    throw;
  }
}

/**
 * @brief      計算・標本値の変動
 *             (sum((y - y_b)**2))
 *
 * @param      標本値 Y の平均 y_b (double)
 * @return     標本値の変動        (double)
 */
double Calc::s_y2(double y_b) {
  unsigned int i;     // loop インデックス
  double v = 0.0;
  double s = 0.0;

  try {
    for (i = 0; i < cnt; i++) {
      v = data[i][1] - y_b;
      s += v * v;
    }
    return s;
  } catch (...) {
    throw;
  }
}

/**
 * @brief      計算・残渣の変動
 *             (sum((y - y_e)**2))
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
      v = data[i][1] - y_e[i];
      s += v * v;
    }
    return s;
  } catch (...) {
    throw;
  }
}

/**
 * @brief      計算・決定係数（公式使用）
 *
 * @param      回帰直線の傾き b (double)
 * @return     決定係数         (double)
 */
double Calc::r_2(double b) {
  unsigned int i;     // loop インデックス
  double s_x  = 0.0;
  double s_y  = 0.0;
  double s_y2 = 0.0;
  double s_xy = 0.0;

  try {
    for (i = 0; i < cnt; i++) {
      s_x  += data[i][0];
      s_y  += data[i][1];
      s_y2 += data[i][1] * data[i][1];
      s_xy += data[i][0] * data[i][1];
    }
    return b * (s_xy - s_x * s_y / cnt) / (s_y2 - s_y * s_y / cnt);
  } catch (...) {
    throw;
  }
}
{% endhighlight %}

File: `coefficient_of_determination_line.cpp`

{% highlight c linenos %}
/***********************************************************
  単回帰分析（線形回帰）決定係数計算
  : y = a + b * x
  : 連立方程式をガウスの消去法で解く方法

    DATE          AUTHOR          VERSION
    2020.06.22    mk-mode.com     1.00 新規作成

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
  double a;                               // 切片
  double b;                               // 傾き
  double r;                               // 相関係数
  std::vector<double> y_e;                // 推定値
  double y_b;                             // 標本値 Y （目的変数）の平均
  double s_r;                             // 推定値の変動
  double s_y2;                            // 標本値の変動
  double s_e;                             // 残差の変動

  try {
    // === コマンドライン引数のチェック
    if (argc != 2) {
      std::cerr << "[ERROR] Number of arguments is wrong!\n"
                << "[USAGE] ./coefficient_of_determination_line <file_name>"
                << std::endl;
      return EXIT_FAILURE;
    }

    // === ファイル名取得
    f_data = argv[1];

    // === データ取得
    File file(f_data);
    if (!file.get_text(data)) {
      std::cout << "[ERROR] Failed to read the file!" << std::endl;
      return EXIT_FAILURE;
    }
    std::cout << std::fixed << std::setprecision(4);
    std::cout << "説明変数 X  目的変数 Y" << std::endl;
    for (i = 0; i < data.size(); i++)
      std::cout << std::setw(10) << std::right << data[i][0]
                << "  "
                << std::setw(10) << std::right << data[i][1]
                << std::endl;

    // === 計算（線形回帰）
    Calc calc(data);
    if (!calc.reg_line(a, b, r)) {
      std::cout << "[ERROR] Failed to calculate!" << std::endl;
      return EXIT_FAILURE;
    }
    std::cout << std::fixed << std::setprecision(8);
    std::cout << "---\n"
              << "    切片 a = " << std::setw(16) << std::right << a
              << "\n"
              << "    傾き b = " << std::setw(16) << std::right << b
              << "\n"
              << "相関係数 r = " << std::setw(16) << std::right << r
              << std::endl;

    // === 計算（決定係数）
    // 推定値
    if (!calc.y_e(a, b, y_e)) {
      std::cout << "[ERROR] Failed to calculate!" << std::endl;
      return EXIT_FAILURE;
    }
    // 標本値 Y （目的変数）の平均
    y_b  = calc.y_b();
    // 推定値の変動
    s_r  = calc.s_r(y_e, y_b);
    // 標本値の変動
    s_y2 = calc.s_y2(y_b);
    // 残差の変動
    s_e  = calc.s_e(y_e);
    std::cout << "---" << std::endl;
    // 解法-1. 決定係数 (= 推定値の変動 / 標本値の変動)
    std::cout << "    R2 (1) = " << std::setprecision(16) << std::right
              << s_r / s_y2 << std::endl;
    // 解法-2. 決定係数 (= 1 - 残差の変動 / 標本値の変動)
    std::cout << "    R2 (2) = " << std::setprecision(16) << std::right
              << 1.0 - s_e / s_y2 << std::endl;
    // 解法-3. 決定係数 (公式使用(解法-1,2の変形))
    std::cout << "    R2 (3) = " << std::setprecision(16) << std::right
              << calc.r_2(b) << std::endl;
    // 解法-4. 決定係数 (= 相関係数の2乗)
    std::cout << "    R2 (4) = " << std::setprecision(16) << std::right
              << r * r << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to calculate a coefficent of determination for simple linear regression.](https://gist.github.com/komasaru/3efe686080f8a11ceed884bc81c063ff "C++ source code to calculate a coefficent of determination for simple linear regression.")

### 3. ソースコードのコンパイル

まず、以下のように `Makefile` を作成する。（**行頭のインデントはタブ文字**）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors

coefficient_of_determination_line: coefficient_of_determination_line.o file.o calc.o
	g++ $(gcc_options) -o $@ $^

coefficient_of_determination_line.o : coefficient_of_determination_line.cpp
	g++ $(gcc_options) -c $<

file.o : file.cpp
	g++ $(gcc_options) -c $<

calc.o : calc.cpp
	g++ $(gcc_options) -c $<

run : coefficient_of_determination_line
	./coefficient_of_determination_line

clean :
	rm -f ./coefficient_of_determination_line
	rm -f ./*.o

.PHONY : run clean
```

そして、ビルド（コンパイル＆リンク）。

``` text
$ make
```

### 4. 動作確認

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
$ ./coefficient_of_determination_line data.txt
説明変数 X  目的変数 Y
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
    切片 a =      99.07475877
    傾き b =       2.14452350
相関係数 r =       0.94519501
---
    R2 (1) = 0.8933936043913586
    R2 (2) = 0.8933936043913584
    R2 (3) = 0.8933936043913586
    R2 (4) = 0.8933936043913578
```

参考までに、上記で使用した2変量の各点と作成された単回帰直線を gnuplot で描画してみた。

![REGRESSION_LINE]({{site.baseurl}}/images/2020/06/27/REGRESSION_LINE.png "REGRESSION_LINE")

---

以上。

