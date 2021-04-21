---
layout   : single
title: "C++ - 逆ポーランド記法の評価（計算）！"
published: true
date     : 2020-11-25 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

前回、 C++ で、入力した数式の文字列を逆ポーランド記法（RPN; 後置記法）に変換する処理を実装してみました。（スタック使用）

* [C++ - 数式文字列 => 逆ポーランド記法 変換！]({{site.baseurl}}/2020/11/18/cpp-convert-str-to-rpn-with-stack "C++ - 数式文字列 => 逆ポーランド記法 変換！")

今回は、出力された逆ポーランド記法での表現を読み込んで計算する処理を実装してみました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.6 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。
* 演算子は `*`, `/`, `+`, `-` を想定。（単項演算子は非対応）

### 1. アルゴリズム（そのままロジック化）

1. RPN 文字列をトークン分割（配列化）
2. 配列の先頭から順次読み込んで判定（ループ処理）  
  a. 数値の場合  
     => そのまま、スタックへ push  
  b. その他（演算子）の場合  
     => スタックから2個 pop （最初を右側、次を左側のオペランドとする）  
        左右のオペランドを演算子で計算し、結果を再度スタックへ push
3. 最後にスタックに残った値を pop して出力

### 2. C++ ソースコードの作成

* 正規表現について、文字列を事前コンパイルして正規表現オブジェクトを生成しているが、各箇所で直接使用してもよい。（正規表現コンパイルにかかる時間が問題になるような処理でもないので）

File: `rpn.cpp`

{% highlight c linenos %}
/***************************************************************
  Caculate a formula string by RPN.

    DATE          AUTHOR          VERSION
    2020.10.07    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
***************************************************************/
#include <iostream>   // for cout
#include <regex>      // for regex_search.
#include <stack>
#include <string>
#include <unordered_map>
#include <vector>

namespace my_lib {

class Rpn {
  std::string rpn;                                // RPN 文字列
  std::vector<std::string> str2ary(std::string);  // 文字列の配列化

public:
  Rpn(std::string rpn) : rpn(rpn) {}  // コンストラクタ
  double calc();                      // 計算
};

/*
 * RPN による計算
 *
 * @return 計算結果(double)
 */
double Rpn::calc() {
  std::stack<double> st;        // 作業用スタック
  std::regex re_0("[=\\s]+$");  // 正規表現（末尾の=とスペース）
  std::regex re_1("\\s+");      // 正規表現（スペース）
  std::regex re_d("\\d+");      // 正規表現（数字）
  std::regex re_pl("\\+");      // 正規表現（+）
  std::regex re_mn("\\-");      // 正規表現（-）
  std::regex re_pr("\\*");      // 正規表現（*）
  std::regex re_dv("\\/");      // 正規表現（/）
  std::smatch sm;               // 正規表現（マッチ部分）
  double l;                     // オペランド（左）
  double r;                     // オペランド（右）
  double ans;                   // 計算結果

  try {
    for (std::string t : str2ary(rpn)) {
      if (std::regex_search(t, sm, re_d)) {
        st.push(stod(t));
        continue;
      }
      r = st.top();
      st.pop();
      l = st.top();
      st.pop();
      if        (std::regex_search(t, sm, re_pl)) {
        st.push(l + r);
      } else if (std::regex_search(t, sm, re_mn)) {
        st.push(l - r);
      } else if (std::regex_search(t, sm, re_pr)) {
        st.push(l * r);
      } else if (std::regex_search(t, sm, re_dv)) {
        st.push(l / r);
      }
    }
    ans = st.top();
  } catch (...) {
    return 0.0;  // 変換失敗
  }

  return ans;
}

/**
 * @brief      RPN 文字列の配列化
 *
 * @param[ref] RPN 文字列 rpn (string)
 * @return     配列(vector)
 */
std::vector<std::string> Rpn::str2ary(std::string rpn) {
  std::vector<std::string> v;
  std::regex re_0("([=\\s]+$)");  // 正規表現（末尾の=とスペース）
  std::regex re_1("([0-9\\.]+|[()*/+\\-])");
  std::string fmt = "";
  std::smatch sm;

  try {
    rpn = std::regex_replace(rpn, re_0, fmt);
    while (std::regex_search(rpn, sm, re_1)) {
      v.push_back(sm[1].str());
      rpn = sm.suffix();
    }
  } catch (...) {
    return {};  // 配列化失敗
  }

  return v;  // 配列化成功
}

}  // namespace my_lib

int main(int argc, char* argv[]) {
  std::string buf;

  try {
    std::cout << "? ";
    getline(std::cin, buf);
    if (buf.empty()) return EXIT_SUCCESS;
    my_lib::Rpn r(buf);
    std::cout << r.calc() << std::endl;
  } catch (...) {
    std::cerr << "EXCEPTION!" << std::endl;
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to calculate a formula expressed with RPN.](https://gist.github.com/komasaru/074b850f4f435813c1daadfc171ab4b8 "Gist - C++ source code to calculate a formula expressed with RPN.")

### 3. ソースコードのコンパイル

``` text
$ g++ -std=c++17 -Wall -O2 --pedantic-errors -o rpn rpn.cpp
```

### 4. 動作確認

``` text
$ ./rpn
? 1 2.3 13 9 - * + 20 25 + 6 2 * - /
0.309091
```

[前回紹介のスクリプト]({{site.baseurl}}/2020/11/18/cpp-convert-str-to-rpn-with-stack "C++ - 数式文字列 => 逆ポーランド記法 変換！")と今回紹介の処理をパイプ処理して、中置（挿入）記法の数式を一括で求めることも可能。（以下は、2つの実行ファイルを同じディレクトリに配置して実行した例）

``` text
$ ./infix2rpn | ./rpn
? (1 + 2.3 * (13 - 9)) / ((20 + 25) - 6 * 2)
0.309091
```

---

[前回紹介のスクリプト]({{site.baseurl}}/2020/11/18/cpp-convert-str-to-rpn-with-stack "C++ - 数式文字列 => 逆ポーランド記法 変換！")と今回紹介の処理を融合し、一括で処理することも容易であろう。（当ブログでの紹介は割愛）

以上。

