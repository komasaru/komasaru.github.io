---
layout   : single
title    : "C++ - ランク付け（同順位考慮）！"
published: true
date     : 2020-09-16 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C++
---

C++ で複数の整数入力値にランクを付ける処理（同順位考慮）を実装してみました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. ソースコードの作成

* 整数限定。（微改修で小数点数対応化）
* 数値が大きい順に順位を付ける。
* 同順位を考慮する。（例：要素が 3, 1, 3, 2 で、大きい順に順位付ける場合の順位を 1, 4, 1, 3 とする）
* 入力値全てを vector に格納し、自身より大きい要素の個数 +1 をその要素の順位とするアルゴリズム。

File: `rank.cpp`

{% highlight c linenos %}
/***************************************************************
  Rank of numbers (integer)

  $ g++ -std=c++17 -Wall -O2 --pedantic-errors -o rank rank.cpp

    DATE          AUTHOR          VERSION
    2020.08.31    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
***************************************************************/
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

  bool rank_int(std::vector<int>& ns, std::vector<int>& rs) {
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

  void display(std::vector<int>& ns, std::vector<int>& rs) {
    std::vector<int>::iterator it;  // イテレータ

    try {
      std::cout << "---" << std::endl;
      std::cout << "VALS = [";
      for (it = ns.begin(); it != ns.end(); ++it) {
        std::cout << *it;
        if (it != ns.end() - 1) std::cout << ", ";
      }
      std::cout << "]" << std::endl;
      std::cout << "RANK = [";
      for (it = rs.begin(); it != rs.end(); ++it) {
        std::cout << *it;
        if (it != rs.end() - 1) std::cout << ", ";
      }
      std::cout << "]" << std::endl;
    } catch (...) {
      throw;
    }
  }
}

int main(int argc, char* argv[]) {
  std::string buf;      // 入力バッファ
  std::vector<int> ns;  // 入力値
  std::vector<int> rs;  // ランク

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
    if (!funcs::rank_int(ns, rs)) {
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

* [Gist - C++ source code to rank, considering same ranks.](https://gist.github.com/komasaru/0054bf03b781b62874c69476e40056a1 "Gist - C++ source code to rank, considering same ranks.")

### 2. ソースコードのコンパイル

``` text
$ g++ -std=c++17 -Wall -O2 --pedantic-errors -o rank rank.cpp 
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
RANK = [4, 6, 2, 5, 2, 1, 7]
```

---

今回は整数限定でしたが、実数に拡張することもそう難しくはないでしょう。

以上。

