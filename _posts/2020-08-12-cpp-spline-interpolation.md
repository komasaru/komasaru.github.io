---
layout   : single
title    : "C++ - 3次スプライン補間！"
published: true
date     : 2020-08-12 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

C++ で3次スプライン補間のアルゴリズムを実装してみました。

過去には Ruby, Python, Fortran で実装しています。

* [Ruby - ３次スプライン補間！]({{site.baseurl}}/2016/01/12/ruby-spline-interpolation "Ruby - ３次スプライン補間！")
* [Python - ３次スプライン補間！]({{site.baseurl}}2018/05/13/python-spline-interpolation "Python - ３次スプライン補間！")
* [Fortran - ３次スプライン補間！]({{site.baseurl}}/2019/04/11/fortran95-spline-interpolation "Fortran - ３次スプライン補間！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. 3次スプライン補間について

過去記事を参照のこと。

* [Ruby - ３次スプライン補間！]({{site.baseurl}}/2016/01/12/ruby-spline-interpolation "Ruby - ３次スプライン補間！")
* [Python - ３次スプライン補間！]({{site.baseurl}}2018/05/13/python-spline-interpolation "Python - ３次スプライン補間！")
* [Fortran - ３次スプライン補間！]({{site.baseurl}}/2019/04/11/fortran95-spline-interpolation "Fortran - ３次スプライン補間！")

### 2. ソースコードの作成

* ファイル読み込み部分、計算部分、実行部分とソースファイルを分けている。

File: `file.hpp`

{% highlight c linenos %}
#ifndef SPLINE_INTERPOLATION_FILE_HPP_
#define SPLINE_INTERPOLATION_FILE_HPP_

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
#ifndef SPLINE_INTERPOLATION_CALC_HPP_
#define SPLINE_INTERPOLATION_CALC_HPP_

#include <vector>

class Calc {
  std::vector<std::vector<double>> data_src;  // 元データ
  std::size_t n;                              // 与えられた点の数
  bool calc_a(
    std::vector<double>&,
    std::vector<double>&
  );                                          // 配列 a 計算
  bool calc_b(
    std::vector<double>&,
    std::vector<double>&
  );                                          // 配列 b 計算
  bool calc_c(
    std::vector<double>&,
    std::vector<double>&
  );                                          // 配列 c 計算
  bool calc_d(
    std::vector<double>&,
    std::vector<double>&
  );                                          // 配列 d 計算
  bool calc_h(
    std::vector<std::vector<double>>&,
    std::vector<double>&
  );                                          // 配列 h 計算
  bool calc_v(
    std::vector<std::vector<double>>&,
    std::vector<double>&
  );                                          // 配列 v 計算
  bool calc_w(
    std::vector<std::vector<double>>&,
    std::vector<double>&,
    std::vector<double>&
  );                                          // 配列 w 計算
  bool gen_mtx(
    std::vector<double>&,
    std::vector<double>&,
    std::vector<std::vector<double>>&
  );                                          // 計算用行列生成
  bool solve_gauss_jordan(
    std::vector<std::vector<double>>&,
    std::vector<double>&
  );                                          // Gauss-Jordan 解法
  unsigned int search_i(double);              // 計算対象インデックス検索

public:
  Calc(std::vector<std::vector<double>>& data_src)
    : data_src(data_src), n(get_size()) {}    // コンストラクタ
  unsigned int get_size();                    // 行列サイズ取得
  bool interpolate_spline(
    std::vector<std::vector<double>>&,
    std::vector<std::vector<double>>&
  );                                          // 3次スプライン補間
};

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

/**
 * @brief      配列サイズ取得
 *
 * @return     配列サイズ(unsigned int)
 */
unsigned int Calc::get_size() {
  return data_src.size();
}

/**
 * @brief      3次スプライン補間
 *
 * @param[ref] n x 2 行列（配列） data_src (double)
 * @param[ref] ? x 2 行列（配列） data_res (double)
 * @return     真偽(bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::interpolate_spline(
  std::vector<std::vector<double>>& data_src,
  std::vector<std::vector<double>>& data_res
) {
  std::vector<double> a;                 // 配列 a
  std::vector<double> b;                 // 配列 b
  std::vector<double> c;                 // 配列 c
  std::vector<double> d;                 // 配列 a
  std::vector<double> h;                 // 配列 h
  std::vector<double> v;                 // 配列 v
  std::vector<double> w;                 // 配列 w
  std::vector<std::vector<double>> mtx;  // 計算用行列
  std::size_t i;                         // loop インデックス
  double s;                              // step
  double x;                              // 計算対象 x 値
  double y;                              // 計算結果 y 値
  unsigned int idx;                      // 計算対象インデックス

  try {
    // 配列 h 計算
    if (!calc_h(data_src, h)) {
      std::cout << "[ERROR] H array could not be calculated!" << std::endl;
      return false;
    };
    // 配列 w 計算
    if (!calc_w(data_src, h, w)) {
      std::cout << "[ERROR] W array could not be calculated!" << std::endl;
      return false;
    };
    // 行列生成
    if (!gen_mtx(h, w, mtx)) {
      std::cout << "[ERROR] Matrix could not be generated!" << std::endl;
      return false;
    };
    // 配列 v 計算
    if (!calc_v(mtx, v)) {
      std::cout << "[ERROR] V array could not be calculated!" << std::endl;
      return false;
    };
    // 配列 b 計算
    if (!calc_b(v, b)) {
      std::cout << "[ERROR] B array could not be calculated!" << std::endl;
      return false;
    };
    // 配列 a 計算
    if (!calc_a(v, a)) {
      std::cout << "[ERROR] B array could not be calculated!" << std::endl;
      return false;
    };
    // 配列 d 計算
    if (!calc_d(v, d)) {
      std::cout << "[ERROR] D array could not be calculated!" << std::endl;
      return false;
    };
    // 配列 c 計算
    if (!calc_c(v, c)) {
      std::cout << "[ERROR] C array could not be calculated!" << std::endl;
      return false;
    };
    // 補間
    s = 0.1;
    for (i = 0; i <= (data_src[n - 1][0] - data_src[0][0]) / s; i++) {
      std::vector<double> row;
      x = i * s;
      idx = search_i(x);
      y = a[idx] * std::pow(x - data_src[idx][0], 3.0) +
          b[idx] * std::pow(x - data_src[idx][0], 2.0) +
          c[idx] * (x - data_src[idx][0]) +
          d[idx];
      row.push_back(x);
      row.push_back(y);
      data_res.push_back(row);
    }
  } catch (...) {
    return false;  // 計算失敗
  }

  return true;  // 計算成功
}

bool Calc::calc_a(
  std::vector<double>& v,
  std::vector<double>& a
) {
  std::size_t i;

  try {
    for (i = 0; i < n - 1; i++)
      a.push_back(
        (v[i + 1] - v[i]) /
        (6 * (data_src[i + 1][0] - data_src[i][0]))
      );
  } catch (...) {
    return false;
  }

  return true;
}

bool Calc::calc_b(
  std::vector<double>& v,
  std::vector<double>& b
) {
  std::size_t i;

  try {
    for (i = 0; i < n - 1; i++)
      b.push_back(v[i] / 2.0);
  } catch (...) {
    return false;
  }

  return true;
}

bool Calc::calc_c(
  std::vector<double>& v,
  std::vector<double>& c
) {
  std::size_t i;

  try {
    for (i = 0; i < n - 1; i++)
      c.push_back(
        (data_src[i + 1][1] - data_src[i][1]) /
        (data_src[i + 1][0] - data_src[i][0]) -
        (data_src[i + 1][0] - data_src[i][0]) *
        (2.0 * v[i] + v[i + 1]) / 6.0
      );
  } catch (...) {
    return false;
  }

  return true;
}

bool Calc::calc_d(
  std::vector<double>& v,
  std::vector<double>& d
) {
  std::size_t i;

  try {
    for (i = 0; i < n; i++)
      d.push_back(data_src[i][1]);
  } catch (...) {
    return false;
  }

  return true;
}

bool Calc::calc_h(
  std::vector<std::vector<double>>& data,
  std::vector<double>& h
) {
  std::size_t i;

  try {
    for (i = 0; i < n - 1; i++)
      h.push_back(data[i + 1][0] - data[i][0]);
  } catch (...) {
    return false;
  }

  return true;
}

bool Calc::calc_v(
  std::vector<std::vector<double>>& mtx,
  std::vector<double>& v
) {
  std::size_t i;
  std::vector<double> g; // Gauss-Jordan 計算用配列

  try {
    if (!solve_gauss_jordan(mtx, g)) {
      std::cout << "[ERROR] Could not be solved by Gauss-Jordan!" << std::endl;
      return false;
    };
    v.push_back(0.0);
    for (i = 0; i < n - 2; i++)
      v.push_back(g[i]);
    v.push_back(0.0);
  } catch (...) {
    return false;
  }

  return true;
}

bool Calc::calc_w(
  std::vector<std::vector<double>>& data,
  std::vector<double>& h,
  std::vector<double>& w
) {
  std::size_t i;

  try {
    for (i = 1; i < n - 1; i++)
      w.push_back(
        6.0 * ((data[i + 1][1] - data[i][1]) / h[i]
        - (data[i][1] - data[i - 1][1]) / h[i - 1])
      ) ;
  } catch (...) {
    return false;
  }

  return true;
}

bool Calc::gen_mtx(
  std::vector<double>& h,
  std::vector<double>& w,
  std::vector<std::vector<double>>& mtx
) {
  std::size_t i;
  std::size_t j;

  try {
    for (i = 0; i < n - 2; i++) {
      std::vector<double> row;
      for (j = 0; j < n - 1; j++)
        row.push_back(0.0);
      mtx.push_back(row);
    }
    for (i = 0; i < n - 2; i++) {
      mtx[i][i] = 2.0 * (h[i] + h[i + 1]);
      mtx[i][n - 2] = w[i];
      if (i == 0)
        continue;
      mtx[i - 1][i] = h[i];
      mtx[i][i - 1] = h[i];
    }
  } catch (...) {
    return false;
  }

  return true;
}

bool Calc::solve_gauss_jordan(
  std::vector<std::vector<double>>& mtx,
  std::vector<double>& g
) {
  std::size_t i;
  std::size_t j;
  std::size_t k;
  double p;
  double d;

  try {
    for (k = 0; k < n - 2; k++) {
      p = mtx[k][k];
      for (j = k; j < n - 1; j++)
        mtx[k][j] /= p;
      for (i = 0; i < n - 2; i++) {
        if (i == k)
          continue;
        d = mtx[i][k];
        for (j = k; j < n - 1; j++)
          mtx[i][j] -= d * mtx[k][j];
      }
    }
    for (i = 0; i < n - 2; i++)
      g.push_back(mtx[i][n - 2]);
  } catch (...) {
    return false;
  }

  return true;
}

unsigned int Calc::search_i(double x) {
  std::size_t i;
  std::size_t j;
  double k;

  try {
    i = 0.0;
    j = n - 1;
    while (i < j) {
      k = (i + j) / 2.0;
      if (data_src[k][0] < x) {
        i = k + 1;
      } else {
        j = k;
      }
    }
    if (i > 0.0)
      i--;
    return i;
  } catch (...) {
    return 0;
  }
}
{% endhighlight %}

File: `spline_interpolation.cpp`

{% highlight c linenos %}
/***********************************************************
  3次スプライン補間

    DATE          AUTHOR          VERSION
    2020.07.31    mk-mode.com     1.00 新規作成

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
  std::string f_data;                         // データファイル名
  std::vector<std::vector<double>> data_src;  // データ配列（与えられた点）
  std::vector<std::vector<double>> data_res;  // データ配列（計算結果）
  std::size_t i;                              // loop インデックス

  try {
    // コマンドライン引数のチェック
    if (argc != 2) {
      std::cerr << "[ERROR] Number of arguments is wrong!\n"
                << "[USAGE] ./spline_interpolation <file_name>"
                << std::endl;
      return EXIT_FAILURE;
    }

    // ファイル名取得
    f_data = argv[1];

    // データ取得
    File file(f_data);
    if (!file.get_text(data_src)) {
      std::cout << "[ERROR] Failed to read the file!" << std::endl;
      return EXIT_FAILURE;
    }

    // 計算用オプジェクトのインスタンス化
    Calc calc(data_src);

    // 計算（補間）
    if (!calc.interpolate_spline(data_src, data_res)) {
      std::cout << "[ERROR] Failed to decompose!" << std::endl;
      return EXIT_FAILURE;
    }

    // 結果出力
    std::cout << std::setw(10) << std::right << "x"
              << std::setw(10) << std::right << "y"
              << std::endl;
    std::cout << std::fixed << std::setprecision(4);
    for (i = 0; i < data_res.size(); i++) {
      std::cout << std::setw(10) << std::right << data_res[i][0]
                << std::setw(10) << std::right << data_res[i][1]
                << std::endl;
    }
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to interpolate by 3D-Spline.](https://gist.github.com/komasaru/fb31c087c71292b3a815535b8aae0fa1 "Gist - C++ source code to interpolate by 3D-Spline.")

### 3. ソースコードのコンパイル

まず、以下のように `Makefile` を作成する。（**行頭のインデントはタブ文字**）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors

spline_interpolation: spline_interpolation.o file.o calc.o
  g++ $(gcc_options) -o $@ $^

spline_interpolation.o : spline_interpolation.cpp
  g++ $(gcc_options) -c $<

file.o : file.cpp
  g++ $(gcc_options) -c $<

calc.o : calc.cpp
  g++ $(gcc_options) -c $<

run : spline_interpolation
  ./spline_interpolation

clean :
  rm -f ./spline_interpolation
  rm -f ./*.o

.PHONY : run clean
```

そして、ビルド（コンパイル＆リンク）。

``` text
$ make
```

### 4. 動作確認

まず、以下のような入力ファイル（予め与える点 (x, y)）を用意する。

File: `data.txt`

{% highlight text linenos %}
0.0 0.8
2.0 3.2
3.0 2.8
5.0 4.5
7.0 2.5
8.0 1.9
{% endhighlight %}

そして、実行。

``` text
$ ./spline_interpolation data.txt
         x         y
    0.0000    0.8000
    0.1000    0.9861
    0.2000    1.1713
    0.3000    1.3544
    0.4000    1.5346
    0.5000    1.7108
    0.6000    1.8820
    0.7000    2.0473
    0.8000    2.2056
    0.9000    2.3559
    1.0000    2.4973
    1.1000    2.6287
    1.2000    2.7492
    1.3000    2.8578
    1.4000    2.9534
    1.5000    3.0351
    1.6000    3.1019
    1.7000    3.1528
    1.8000    3.1868
    1.9000    3.2028
    2.0000    3.2000
    2.1000    3.1782
    2.2000    3.1408
    2.3000    3.0921
    2.4000    3.0366
    2.5000    2.9784
    2.6000    2.9220
    2.7000    2.8716
    2.8000    2.8316
    2.9000    2.8063
    3.0000    2.8000
    3.1000    2.8160
    3.2000    2.8530
    3.3000    2.9087
    3.4000    2.9810
    3.5000    3.0673
    3.6000    3.1656
    3.7000    3.2734
    3.8000    3.3884
    3.9000    3.5085
    4.0000    3.6312
    4.1000    3.7543
    4.2000    3.8755
    4.3000    3.9924
    4.4000    4.1028
    4.5000    4.2045
    4.6000    4.2950
    4.7000    4.3721
    4.8000    4.4335
    4.9000    4.4769
    5.0000    4.5000
    5.1000    4.5012
    5.2000    4.4815
    5.3000    4.4426
    5.4000    4.3862
    5.5000    4.3141
    5.6000    4.2279
    5.7000    4.1293
    5.8000    4.0201
    5.9000    3.9020
    6.0000    3.7766
    6.1000    3.6457
    6.2000    3.5109
    6.3000    3.3740
    6.4000    3.2368
    6.5000    3.1008
    6.6000    2.9678
    6.7000    2.8395
    6.8000    2.7177
    6.9000    2.6039
    7.0000    2.5000
    7.1000    2.4071
    7.2000    2.3246
    7.3000    2.2514
    7.4000    2.1862
    7.5000    2.1279
    7.6000    2.0754
    7.7000    2.0275
    7.8000    1.9831
    7.9000    1.9410
    8.0000    1.9000
```

### 5. グラフ確認

別途、 gnuplot で予め与えた点と補間した点をプロットしてみた。

![SPLINE_INTERPOLATION]({{site.baseurl}}/images/2020/08/12/SPLINE_INTERPOLATION.png "SPLINE_INTERPOLATION")

---

以上。

