---
layout   : single
title    : "C++ - 単回帰直線の計算！"
published: true
date     : 2020-05-08 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

C++ で、数値からなる同サイズの配列2つを説明変数・目的変数とみなして単回帰直線を計算する方法についての記録です。  
今回は連立1次方程式を解くのに「ガウスの消去法」を使用します。（分散／共分散を使用する方法（実際にはその変形版）もある）

過去には Fortran 等で実装しています。

* [Fortran - 2つの配列から単回帰直線計算(Ver.2)！]({{site.baseurl}}/2019/06/14/fortran95-simple-linear-regression-line-v2 "Fortran - 2つの配列から単回帰直線計算(Ver.2)！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [Ruby - Array クラス拡張で単回帰直線計算！]({{site.baseurl}}/2014/11/05/ruby-simple-linear-regression-line "Ruby - Array クラス拡張で単回帰直線計算！")
* [Python - 2 つの list から単回帰直線計算！]({{site.baseurl}}/2018/05/02/python-regression-line-computation "Python - 2 つの list から単回帰直線計算！")

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
#ifndef REGRESSION_LINE_FILE_HPP_
#define REGRESSION_LINE_FILE_HPP_

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
#ifndef REGRESSION_LINE_CALC_HPP_
#define REGRESSION_LINE_CALC_HPP_

#include <vector>

class Calc {
  std::vector<std::vector<double>> data;             // 元データ
  std::vector<std::vector<double>> mtx;              // 計算用行列
  bool solve_ge(std::vector<std::vector<double>>&);  // ガウスの消去法

public:
  Calc(std::vector<std::vector<double>>& data) : data(data) {}
  unsigned int cnt;                                  // データ件数
  bool reg_line(double&, double&);                   // 単回帰直線の計算
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
 * @brief      単回帰直線の計算
 *
 * @param[ref] 切片 a (double)
 * @param[ref] 傾き b (double)
 * @return     真偽(bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::reg_line(double& a, double& b) {
  unsigned int i;     // loop インデックス
  double s_x  = 0.0;  // sum(x)
  double s_y  = 0.0;  // sum(y)
  double s_xx = 0.0;  // sum(xx)
  double s_xy = 0.0;  // sum(xy)

  try {
    // データ数
    cnt = data.size();

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

File: `regression_line.cpp`

{% highlight c linenos %}
/***********************************************************
  単回帰直線計算
  : y = a + b * x
  : 連立方程式をガウスの消去法で解く方法

    DATE          AUTHOR          VERSION
    2020.04.30    mk-mode.com     1.00 新規作成

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

  try {
    // コマンドライン引数のチェック
    if (argc != 2) {
      std::cerr << "[ERROR] Number of arguments is wrong!\n"
                << "[USAGE] ./regression_line <file_name>"
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
    if (!calc.reg_line(a, b)) {
      std::cout << "[ERROR] Failed to calculate!" << std::endl;
      return EXIT_FAILURE;
    }

    // 結果出力
    std::cout << std::fixed << std::setprecision(8);
    std::cout << "---\n"
              << "切片 a = " << std::setw(16) << std::right << a
              << "\n"
              << "傾き b = " << std::setw(16) << std::right << b
              << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to calculate a simple linear regression line.](https://gist.github.com/komasaru/728eab81abc5e061dab8e5a0f063d39a "C++ source code to calculate a simple linear regression line.(Ver.2)")

### 4. ソースコードのコンパイル

まず、以下のように `Makefile` を作成する。（**行頭のインデントはタブ文字**）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors

regression_line: regression_line.o file.o calc.o
	g++ $(gcc_options) -o $@ $^

regression_line.o : regression_line.cpp
	g++ $(gcc_options) -c $<

file.o : file.cpp
	g++ $(gcc_options) -c $<

calc.o : calc.cpp
	g++ $(gcc_options) -c $<

run : regression_line
	./regression_line

clean :
	rm -f ./regression_line
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
$ ./regression_line data.txt
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
```

参考までに、上記で使用した2変量の各点と作成された単回帰直線を gnuplot で描画してみた。

![REGRESSION_LINE]({{site.baseurl}}/images/2020/05/08/REGRESSION_LINE.png "REGRESSION_LINE")

---

以上。

