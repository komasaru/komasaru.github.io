---
layout   : single
title    : "C++ - ケンドール順位相関係数の計算！"
published: true
date     : 2020-10-07 00:20:00 +0900
comments : true
categories:
- 数学
- プログラミング
tags:
- C++
---

C++ でケンドールの順位相関係数(Kendall's Rank Correlation Coefficient)の計算をしてみました。

過去には Ruby や Fortran で行っています。

* [Ruby - ケンドール順位相関係数の計算！]({{site.baseurl}}/2020/02/14/ruby-rcc-kendall "Ruby - ケンドール順位相関係数の計算！")
* [Fortran - ケンドール順位相関係数の計算！]({{site.baseurl}}/2020/02/20/fortran95-rcc-kendall "Fortran - ケンドール順位相関係数の計算！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.5 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. ケンドールの順位相関係数について

$$n$$ 対の順位データ $$(x_i, y_i) (i=1,2,\cdots,n)$$ があるとき、それの中から取り出した $$(x_s, y_s),\ (x_t, y_t)\ (1 \leq s \lt t \leq n)$$ において、

$$
\begin{eqnarray*}
P&:& x_s と x_t,\ y_s と y_t の大小関係が一致する組の数 \\
Q&:& x_s と x_t,\ y_s と y_t の大小関係が不一致の組の数 \\
N&:& 組の総数=\binom{n}{2}=\displaystyle _nC_2=\frac{n(n-1)}{2}
\end{eqnarray*}
$$

とおくと、 **ケンドールの順位相関係数(Kendall's Rank Correlation Coefficient)** $$\tau_a, \tau_b$$ は次式で表される。（ケンドールの $$\tau_a$$ (Kendall's tau a), ケンドールの $$\tau_b$$ (Kendall's tau b)とも呼ばれる）

(1)同順位（タイ）が存在しない場合、
$$
\begin{eqnarray*}
\tau_a = \frac{P - Q}{N}
\end{eqnarray*}
$$

(2)同順位（タイ）が存在する場合、
$$
\begin{eqnarray*}
\tau_b &=& \frac{P - Q}{\sqrt{N - T_x}\sqrt{N - T_y}} \\
但し、\ \ T_x &=& \displaystyle \sum_{i=1}^{n_x}\frac{t_i({t_i}^2 - 1)}{2} \\
T_y &=& \displaystyle \sum_{j=1}^{n_y}\frac{t_j({t_j}^2 - 1)}{2} \\
&&（n_x,\ n_y\ は同順位の数、\ t_i,\ t_j\ は同順位となる順位の個数）
\end{eqnarray*}
$$

また、次式で表されるものを **グッドマン＝クラスカルの $$\gamma$$ (Goodman and Kruskal's gamma)** と呼ぶ。

$$
\begin{eqnarray*}
\gamma = \frac{P - Q}{P + Q}
\end{eqnarray*}
$$

（注1）同順位（タイ）がない場合、 $$T_x = T_y = 0,\ P + Q = N$$ となり、結果として、 $$\tau_a = \tau_b = \gamma$$ となる。  
（注2）$$\tau_c$$ なる式もあるが、 $$\tau_a,\ \tau_b,\ \gamma$$ とやや性質が異なるので今回は割愛。

### 2. ソースコードの作成

File: `file.hpp`

{% highlight c linenos %}
#ifndef RCC_KENDALL_FILE_HPP_
#define RCC_KENDALL_FILE_HPP_

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
#ifndef RCC_KENDALL_CALC_HPP_
#define RCC_KENDALL_CALC_HPP_

#include <unordered_map>
#include <vector>

class Calc {
  std::vector<double> data_x;  // 元データ(x)
  std::vector<double> data_y;  // 元データ(y)
  unsigned cnt;                // データ件数
  bool rank_dbl(std::vector<double>&, std::vector<double>&);             // ランク付け
  bool calc_pq(std::vector<double>&, std::vector<double>&, int&, int&);  // P, Q
  bool count_tai(
      std::vector<double>&, std::unordered_map<double, unsigned int>&);  // 同順位の数
  double sum_t(std::unordered_map<double, unsigned int>);                // Tx, Ty の sum 部分

public:
  Calc(std::vector<std::vector<double>>&);
  double kendall();  // ケンドール順位相関係数の計算
};

#endif
{% endhighlight %}

File: `calc.cpp`

{% highlight c linenos %}
#include "calc.hpp"

#include <algorithm>    // for std::count
#include <cmath>        // for std::sqrt
#include <iostream>
#include <unordered_map>
#include <vector>

Calc::Calc(std::vector<std::vector<double>>& data) {
  try {
    cnt = data.size();
    for (auto d : data) {
      data_x.push_back(d[0]);
      data_y.push_back(d[1]);
    }
  } catch (...) {
    throw;
  }
}

/**
 * @brief      ケンドール順位相関係数の計算
 *
 * @return     RCC(double)
 */
double Calc::kendall() {
  std::vector<double> rank_x;                      // ランク(X)
  std::vector<double> rank_y;                      // ランク(Y)
  int p = 0;                                       // P
  int q = 0;                                       // Q
  std::unordered_map<double, unsigned int> tai_x;  // 同順位の数(X)
  std::unordered_map<double, unsigned int> tai_y;  // 同順位の数(Y)
  double t_x;                                      // Tx の sum 部分
  double t_y;                                      // Ty の sum 部分
  double nn;                                       // (n * n - n) / 2.0
  double rcc  = 0.0;                               // 順位相関係数

  try {
    // ランク付け
    if (!rank_dbl(data_x, rank_x)) {
      std::cout << "[ERROR] Failed to rank!" << std::endl;
      return rcc;
    }
    if (!rank_dbl(data_y, rank_y)) {
      std::cout << "[ERROR] Failed to rank!" << std::endl;
      return rcc;
    }
    // P, Q 計算
    if (!calc_pq(rank_x, rank_y, p, q)) {
      std::cout << "[ERROR] Failed to calculate P, Q!" << std::endl;
      return rcc;
    }
    // 同順位の数（2個以上のみ）
    if (!count_tai(rank_x, tai_x)) {
      std::cout << "[ERROR] Failed to count tais!" << std::endl;
      return rcc;
    }
    if (!count_tai(rank_y, tai_y)) {
      std::cout << "[ERROR] Failed to count tais!" << std::endl;
      return rcc;
    }
    // Tx, Ty の sum 部分
    t_x = sum_t(tai_x);
    t_y = sum_t(tai_y);
    // 順位相関係数
    nn = (cnt * cnt - cnt) / 2.0;
    rcc = (p - q) / (std::sqrt(nn - t_x) * std::sqrt(nn - t_y));
  } catch (...) {
    throw;
  }

  return rcc;  // 計算成功
}

/**
 * @brief      ランク付け
 *
 * @param[ref] 元配列 ns (dbl)
 * @param[ref] ランク配列 rs (int)
 * @return     真偽(bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::rank_dbl(std::vector<double>& ns, std::vector<double>& rs) {
  unsigned int i;
  unsigned int j;
  unsigned int c;

  try {
    for (i = 0; i < cnt; i++) {
      c = 0;
      for (j = 0; j < cnt; j++)
        if (ns[i] < ns[j]) c++;
      rs.push_back(c + 1);
    }
  } catch (...) {
    return false;
  }

  return true;
}

/**
 * @brief      P（x_s と x_t, y_s と y_t の大小関係が一致する組の数）
 *             （x_s = x_t or y_s = y_t は除く）
 *
 * @param[ref] ランク配列 rank_x (dbl)
 * @param[ref] ランク配列 rank_y (dbl)
 * @param[ref] P (int)
 * @param[ref] Q (int)
 * @return     真偽(bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::calc_pq(
    std::vector<double>& rank_x, std::vector<double>& rank_y, int& p, int& q) {
  unsigned int i;
  unsigned int j;
  double w;

  try {
    for (i = 0; i < cnt - 1; i++) {
      for (j = i + 1; j < cnt; j++) {
        w = (rank_x[i] - rank_x[j]) * (rank_y[i] - rank_y[j]);
        if (w > 0) p++;
        if (w < 0) q++;
      }
    }
  } catch (...) {
    return false;
  }

  return true;
}

/**
 * @brief      同順位の数
 *             （数が 2 未満は除去）
 *
 * @param[ref] ランク配列 rank (double)
 * @param[ref] 同順位の数の連想配列 tai (<double, unsigned int>)
 * @return     真偽(bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::count_tai(
    std::vector<double>& rank, std::unordered_map<double, unsigned int>& tai) {
  unsigned int i;

  try {
    for (i = 0; i < cnt; i++) {
      if (tai.find(rank[i]) == tai.end()) {
        tai[rank[i]] = 1;
        continue;
      }
      tai[rank[i]]++;
    }
    // 個数が 2 未満のものは削除
    for (auto it = tai.begin(); it != tai.end();) {
      if (it->second < 2) {
        it = tai.erase(it);
      } else {
        ++it;
      }
    }
  } catch (...) {
    return false;
  }

  return true;
}

/**
 * @brief     Tx, Ty の sum 部分
 *
 * @param[in] 同順位の数の連想配列 tai (<double, unsigned int>)
 * @return    Tx, Ty の sum
 */
double Calc::sum_t(std::unordered_map<double, unsigned int> tai) {
  double s = 0.0;

  try {
    for (const auto [k, v] : tai) {
      s += (v * v * v - v) / 2.0;
    }
  } catch (...) {
    return s;
  }

  return s;
}
{% endhighlight %}

File: `rcc_kendall.cpp`

{% highlight c linenos %}
/***********************************************************
  ケンドール順位相関係数の計算

    DATE          AUTHOR          VERSION
    2020.09.11    mk-mode.com     1.00 新規作成

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
  double rcc;                             // 順位相関係数

  try {
    // コマンドライン引数のチェック
    if (argc != 2) {
      std::cerr << "[ERROR] Number of arguments is wrong!\n"
                << "[USAGE] ./rcc_spearmn <file_name>"
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
    std::cout << "         X           Y" << std::endl;
    for (i = 0; i < data.size(); i++)
      std::cout << std::setw(10) << std::right << data[i][0]
                << "  "
                << std::setw(10) << std::right << data[i][1]
                << std::endl;

    // 計算
    Calc calc(data);
    rcc = calc.kendall();

    // 結果出力
    std::cout << std::fixed << std::setprecision(8);
    std::cout << "---\n"
              << "Kendall's RCC = " << std::setw(16) << std::right << rcc
              << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to calculate a Kendall's Rank Correlation Coefficient.](https://gist.github.com/komasaru/3fd50ace9d989258b91f5f71e5dfb83c "Gist - C++ source code to calculate a Kendall's Rank Correlation Coefficient.")

### 3. ソースコードのコンパイル

まず、以下のように `Makefile` を作成する。（**行頭のインデントはタブ文字**）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors

rcc_kendall: rcc_kendall.o file.o calc.o
  g++ $(gcc_options) -o $@ $^

rcc_kendall.o : rcc_kendall.cpp
  g++ $(gcc_options) -c $<

file.o : file.cpp
  g++ $(gcc_options) -c $<

calc.o : calc.cpp
  g++ $(gcc_options) -c $<

run : rcc_kendall
  ./rcc_kendall

clean :
  rm -f ./rcc_kendall
  rm -f ./*.o

.PHONY : run clean
```

そして、ビルド（コンパイル＆リンク）。

``` text
$ make
```

### 4. 動作確認

まず、以下のような入力ファイル（1行に X, Y）を用意する。

File: `data.txt`

{% highlight text linenos %}
 1  1
 2  3
 3  5
 4  6
 5  9
 5  2
 7  4
 8  6
 9  8
10 10
{% endhighlight %}

そして、実行。

``` text
$ ./rcc_kendall data.txt
         X           Y
    1.0000      1.0000
    2.0000      3.0000
    3.0000      5.0000
    4.0000      6.0000
    5.0000      9.0000
    5.0000      2.0000
    7.0000      4.0000
    8.0000      6.0000
    9.0000      8.0000
   10.0000     10.0000
---
Kendall's RCC =       0.64285714
```

---

以上。

