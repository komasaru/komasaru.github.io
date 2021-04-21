---
layout   : single
title    : "C++ - ランク付け（同順位は中央順位法で）！"
published: true
date     : 2020-09-23 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C++
---

前回、 C++ で複数の整数入力値にランクを付ける処理（同順位考慮）を実装してみましたが、今回はその発展形として、同順位（タイ）がある場合は中央（平均）順位(mid-rank)法で順位を付けるようにしてみました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. ソースコードの作成

* 整数限定。（微改修で小数点数対応化）
* 数値が大きい順に順位を付ける。
* 同順位を考慮する。（例：要素が 2, 1, 3, 2 で、大きい順に順位付ける場合の順位を 2.5, 4, 1, 2.5 とする）

File: `rank_2.cpp`

{% highlight c linenos %}
/***************************************************************
  Rank of numbers (integer) (by central rank method)

    DATE          AUTHOR          VERSION
    2020.09.04    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
***************************************************************/
#include <algorithm>  // for count
#include <iostream>   // for cout
#include <regex>      // for regex_search

namespace funcs {
  bool is_int(std::string s) {
    std::smatch m;
    std::regex re("^[+-]?\\d+$");

    try {
      if (!std::regex_search(s, m, re)) return false;
    } catch (std::regex_error& e) {
      return false;
    }

    return true;
  }

  bool rank_int(std::vector<int>& ns, std::vector<double>& rs) {
    unsigned int s;
    unsigned int i;
    unsigned int j;
    unsigned int c;

    try {
      s = ns.size();
      for (i = 0; i < s; i++) {
        c = 0;
        for (j = 0; j < s; j++) {
          if (ns[i] < ns[j]) c++;
        }
        rs.push_back(c + 1);
      }
    } catch (...) {
      return false;
    }

    return true;
  }

  bool mid_rank(std::vector<int>& ns, std::vector<double>& rs) {
    std::vector<double> rs_w;  // 作業用
    unsigned int i;
    unsigned int j;
    unsigned int c;
    double s;

    try {
      // 一旦、通常のランク付け
      if (!funcs::rank_int(ns, rs)) {
        std::cout << "[ERROR] Failed to rank!" << std::endl;
        return EXIT_FAILURE;
      }
      // ランク用 vector を作業にコピー
      std::copy(rs.begin(), rs.end(), std::back_inserter(rs_w));
      // 中央（平均）順位法(mid-rank)でランク付け
      rs.clear();
      for (i = 0; i < rs_w.size(); i++) {
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

  void display(std::vector<int>& ns, std::vector<double>& rs) {
    std::vector<int>::iterator it_n;     // イテレータ
    std::vector<double>::iterator it_r;  // イテレータ

    try {
      std::cout << "---" << std::endl;
      std::cout << "VALS = [";
      for (it_n = ns.begin(); it_n != ns.end(); ++it_n) {
        std::cout << *it_n;
        if (it_n != ns.end() - 1) std::cout << ", ";
      }
      std::cout << "]" << std::endl;
      std::cout << "RANK = [";
      for (it_r = rs.begin(); it_r != rs.end(); ++it_r) {
        std::cout << *it_r;
        if (it_r != rs.end() - 1) std::cout << ", ";
      }
      std::cout << "]" << std::endl;
    } catch (...) {
      throw;
    }
  }
}

int main(int argc, char* argv[]) {
  std::string buf;         // 入力バッファ
  std::vector<int> ns;     // 入力値
  std::vector<double> rs;  // ランク

  try {
    // 値入力
    while (true) {
      std::cout << "n? ";
      getline(std::cin, buf);
      if (buf.empty()) break;
      if (!funcs::is_int(buf)) {
        std::cout << "NOT INTEGER !!" << std::endl;
        continue;
      }
      ns.push_back(stoi(buf));
    }
    // ランク計算
    if (!funcs::mid_rank(ns, rs)) {
      std::cout << "[ERROR] Failed to rank!" << std::endl;
      return EXIT_FAILURE;
    }
    // 結果出力
    funcs::display(ns, rs);
  } catch (...) {
    std::cerr << "EXCEPTION!" << std::endl;
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to rank, considering same ranks(mid-rank method).](https://gist.github.com/komasaru/525179291398345100e120b5872254e4 "Gist - C++ source code to rank, considering same ranks(mid-rank method).")

### 2. ソースコードのコンパイル

``` text
$ g++ -std=c++17 -Wall -O2 --pedantic-errors -o rank_2 rank_2.cpp
```

### 3. 動作確認

* 空エンターで、入力終了＆計算。

``` text
$ ./rank
n? 1
n? -4
n? 5
n? -2
n? a
NOT INTEGER !!
n? 5.6
NOT INTEGER !!
n? 5
n? 10
n? -8
n?
---
VALS = [1, -4, 5, -2, 5, 10, -8]
RANK = [4, 6, 2.5, 5, 2.5, 1, 7]
```

---

今回は整数限定でしたが、実数に拡張することもそう難しくはないでしょう。

以上。

