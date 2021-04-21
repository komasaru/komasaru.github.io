---
layout   : single
title    : "C++ - スピアマン順位相関係数の計算！"
published: true
date     : 2020-09-30 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

C++ でスピアマンの順位相関係数(Spearman's Rank Correlation Coefficient)の計算をしてみました。

過去には Ruby や Fortran で行っています。

* [Ruby - スピアマン順位相関係数の計算！]({{site.baseurl}}/2020/02/11/ruby-rcc-spearman "Ruby - スピアマン順位相関係数の計算！")
* [Fortran - スピアマン順位相関係数の計算！]({{site.baseurl}}/2020/02/17/fortran95-rcc-spearman "Fortran - スピアマン順位相関係数の計算！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.5 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. スピアマンの順位相関係数について

各変量を順位に変換してピアソンの積率相関係数（いわゆる相関係数）を求めたものを **スピアマンの順位相関係数(Spearman's Rank Correlation Coefficient)** と呼ぶ。

実際にはまず、 $$n$$ 対の変数 $$X, Y$$ のそれぞれに順位をつける。但し、同順位（タイ）がある場合は**中央（平均）順位(mid-rank)** で順位をつける。  
（e.g. 2位が3個ある場合、 $$(2+3+4)/3=3$$。3位が2個ある場合、 $$(3+4)/2=3.5$$）

そして、次の式によりスピアマンの順位相関係数 $$r_s$$（または $$\rho$$）を求める。

(1) 同順位（タイ）が存在しない場合、

$$
\begin{eqnarray*}
r_s = 1 - \frac{6}{n(n^{2} - 1)} \displaystyle \sum^{n}_{i=1}(X_i - Y_i)^2
\end{eqnarray*}
$$

(2) 同順位（タイ）が存在する場合、

$$
\begin{eqnarray*}
r_s &=& \frac{T_x + T_y - \displaystyle \sum_{i=1}^{n}(X_i - Y_i)^2}{2\sqrt{T_xT_y}} \\
但し、\ \ T_x &=& \left\{n(n^2 - 1) - \displaystyle \sum_{i=1}^{n_x}t_i({t_i}^2 - 1)\right\} /\ 12 \\
T_y &=& \left\{n(n^2 - 1) - \displaystyle \sum_{j=1}^{n_y}t_j({t_j}^2 - 1)\right\} /\ 12 \\
&&（n_x,\ n_y\ は同順位の数、\ t_i,\ t_j\ は同順位となる順位の個数）
\end{eqnarray*}
$$

（注） 同順位が存在しない場合は (2) の $$\sum t_i({t_i}^2 - 1),\ \sum t_j({t_j}^2 - 1)$$ が $$0$$ となり、結局 (1) になる。よって、同順位（タイ）が存在しない場合と存在する場合で場合分けをせず、全て (2) で計算しても、結果は同じになる。

また、スピアマンの順位相関係数は、値を順位に置き換えたもの（同順位（タイ）は中央順位法）の相関係数（ピアソンの積率相関係数）であるので、当然、以下の計算式でも計算できる。

$$
\begin{eqnarray*}
r_s = \frac{\displaystyle \sum_{i=1}^{n}(X_i - \overline{X})(Y_i - \overline{Y})}{\sqrt{\displaystyle \sum_{i=1}^{n}(X_i - \overline{X})^2 \displaystyle \sum_{i=1}^{n}(Y_i - \overline{Y})^2}}
\end{eqnarray*}
$$

さらに、同順位（タイ）が存在する場合の計算式を以下のように説明している文献（特に海外の文献）も多い。（但し、前述の計算式で計算した結果と若干の差異がある）

$$
\begin{eqnarray*}
r_s &=& 1 - \frac{6}{n(n^2 - 1)}\left\{ \displaystyle\sum_{i=1}^{n}(X_i - Y_i)^2 + T_x + T_y \right\} \\
但し、\ \ T_x &=& \displaystyle \sum_{i=1}^{n_x}\frac{t_i({t_i}^2-1)}{12} \\
T_y &=& \displaystyle \sum_{j=1}^{n_y}\frac{t_j({t_j}^2-1)}{12} \\
&&（n_x,\ n_y\ は同順位の数、\ t_i,\ t_j\ は同順位となる順位の個数）
\end{eqnarray*}
$$

### 2. ソースコードの作成

File: `file.hpp`

{% highlight c linenos %}
#ifndef RCC_SPEARMAN_FILE_HPP_
#define RCC_SPEARMAN_FILE_HPP_

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
#ifndef RCC_SPEARMAN_CALC_HPP_
#define RCC_SPEARMAN_CALC_HPP_

#include <unordered_map>
#include <vector>

class Calc {
  std::vector<double> data_x;  // 元データ(x)
  std::vector<double> data_y;  // 元データ(y)
  unsigned cnt;                // データ件数
  bool rank_dbl(std::vector<double>&, std::vector<double>&);  // ランク付け
  bool mid_rank(std::vector<double>&, std::vector<double>&);  // 中央順位法
  bool count_tai(std::vector<double>&, std::unordered_map<double, unsigned int>&);  // 同順位の数
  double sum_t(std::unordered_map<double, unsigned int>);  // Tx, Ty の sum 部分

public:
  Calc(std::vector<std::vector<double>>&);
  double spearman();  // スピアマン順位相関係数の計算
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
 * @brief      スピアマン順位相関係数の計算
 *
 * @return     RCC(double)
 */
double Calc::spearman() {
  std::vector<double> rank_x;            // ランク(X)
  std::vector<double> rank_y;            // ランク(Y)
  std::unordered_map<double, unsigned int> tai_x;  // 同順位の数(X)
  std::unordered_map<double, unsigned int> tai_y;  // 同順位の数(Y)
  double s_x;                            // Tx の sum 部分
  double s_y;                            // Ty の sum 部分
  unsigned int n3;                       // n * n * n - n
  double t_x;                            // (n3 - s_x) / 12.0
  double t_y;                            // (n3 - s_y) / 12.0
  double s;                              // Rs の sum 部分
  unsigned int i;                        // loop インデックス
  double rcc  = 0.0;                     // 順位相関係数

  try {
    // ランク付け
    if (!mid_rank(data_x, rank_x)) {
      std::cout << "[ERROR] Failed to rank!" << std::endl;
      return rcc;
    }
    if (!mid_rank(data_y, rank_y)) {
      std::cout << "[ERROR] Failed to rank!" << std::endl;
      return rcc;
    }
    // 同順位の数
    if (!count_tai(rank_x, tai_x)) {
      std::cout << "[ERROR] Failed to count tais!" << std::endl;
      return rcc;
    }
    if (!count_tai(rank_y, tai_y)) {
      std::cout << "[ERROR] Failed to count tais!" << std::endl;
      return rcc;
    }
    // Tx, Ty の sum 部分
    s_x = sum_t(tai_x);
    s_y = sum_t(tai_y);
    // 順位相関係数
    n3 = cnt * cnt * cnt - cnt;
    t_x = (n3 - s_x) / 12.0;
    t_y = (n3 - s_y) / 12.0;
    s = 0.0;
    for (i = 0; i < cnt; i++) {
      s += (rank_x[i] - rank_y[i]) * (rank_x[i] - rank_y[i]);
    }
    rcc = (t_x + t_y - s) / (2 * std::sqrt(t_x * t_y));
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
 * @brief      中央順位法
 *
 * @param[ref] 元配列 ns (dbl)
 * @param[ref] ランク配列 rs (int)
 * @return     真偽(bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Calc::mid_rank(std::vector<double>& ns, std::vector<double>& rs) {
  std::vector<double> rs_w;  // 作業用
  unsigned int i;
  unsigned int j;
  unsigned int c;
  double s;

  try {
    // 一旦、通常のランク付け
    if (!rank_dbl(ns, rs)) {
      std::cout << "[ERROR] Failed to rank!" << std::endl;
      return EXIT_FAILURE;
    }
    // ランク用 vector を作業にコピー
    std::copy(rs.begin(), rs.end(), std::back_inserter(rs_w));
    // 中央（平均）順位法(mid-rank)でランク付け
    rs.clear();
    c = std::count(rs_w.begin(), rs_w.end(), 1.0);
    for (i = 0; i < cnt; i++) {
      c = std::count(rs_w.begin(), rs_w.end(), rs_w[i]);
      s = 0;
      for (j = rs_w[i]; j < rs_w[i] + c; j++) s += j;
      rs.push_back(s / c);
    }
  } catch (...) {
    return false;
  }

  return true;
}

/**
 * @brief      同順位の数
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
      if (v < 2) continue;
      s += v * v * v - v;
    }
  } catch (...) {
    return s;
  }

  return s;
}
{% endhighlight %}

File: `rcc_spearman.cpp`

{% highlight c linenos %}
/***********************************************************
  スピアマン順位相関係数の計算

    DATE          AUTHOR          VERSION
    2020.08.31    mk-mode.com     1.00 新規作成

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
    rcc = calc.spearman();

    // 結果出力
    std::cout << std::fixed << std::setprecision(8);
    std::cout << "---\n"
              << "Spearman's RCC = " << std::setw(16) << std::right << rcc
              << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to calculate a Spearman's Rank Correlation Coefficient.](https://gist.github.com/komasaru/6dda10847bf3a13e67155c64ccfd2e6f "Gist - C++ source code to calculate a Spearman's Rank Correlation Coefficient.")

### 3. ソースコードのコンパイル

まず、以下のように `Makefile` を作成する。（**行頭のインデントはタブ文字**）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors

rcc_spearman: rcc_spearman.o file.o calc.o
  g++ $(gcc_options) -o $@ $^

rcc_spearman.o : rcc_spearman.cpp
  g++ $(gcc_options) -c $<

file.o : file.cpp
  g++ $(gcc_options) -c $<

calc.o : calc.cpp
  g++ $(gcc_options) -c $<

run : rcc_spearman
  ./rcc_spearman

clean :
  rm -f ./rcc_spearman
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
$ ./rcc_spearman data.txt
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
Spearman's RCC =       0.70731707
```

---

以上。

