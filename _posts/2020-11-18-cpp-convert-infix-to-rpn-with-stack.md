---
layout   : single
title: "C++ - 数式文字列 => 逆ポーランド記法 変換（スタック使用）！"
published: true
date     : 2020-11-18 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

C++ で、入力した数式の文字列を逆ポーランド記法（RPN; 後置記法）に変換する処理を実装してみました。  
今回はスタックを使用した処理です。（後日、二分木を使用した処理についても紹介予定）  
逆ポーランド記法の数式文字列から値を計算する処理（逆ポーランド計算機）については、次回紹介予定です。

ちなみに、過去には Fortran95 や Ruby で実装しています。

* [Fortran - スタックの実装（逆ポーランド記法による電卓）！]({{site.baseurl}}/2018/11/26/fortran95-stack-computation "Fortran - スタックの実装（逆ポーランド記法による電卓）！")
* [Ruby - 数式文字列 => 逆ポーランド記法 変換（スタック使用）！]({{site.baseurl}}/2020/10/28/ruby-convert-infix-to-rpn-with-stack "Ruby - 数式文字列 => 逆ポーランド記法 変換（スタック使用）！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.6 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。
* 演算子は `*`, `/`, `+`, `-` を想定。（単項演算子は非対応）
* 括弧は `(`, `)` のみに対応。

### 1. アルゴリズム（そのままロジック化）

1. 数式文字列をトークン分割（配列化）
2. 配列の先頭から順次読み込んで判定（ループ処理）  
  a. 数値の場合  
     => そのまま、出力  
  b. 括弧・開き `(` の場合  
     => そのまま、スタックへ push  
  c. 括弧・閉じ `)` の場合  
     => `(` が出るまでスタックから pop して出力  
        但し、 `(`, `)` は廃棄  
  d. その他（演算子）の場合  
     => そのまま、スタックへ push  
        但し、スタックトップの演算子の方が優先度が高ければ、それを pop して出力  
        （※演算子・括弧の優先度： `*` = `/` > `+` = `-` > `(` = `)`）

### 2. C++ ソースコードの作成

* 括弧の開きと閉じの対応のチェックは行わない。
* 正規表現について、文字列を事前コンパイルして正規表現オブジェクトを生成しているが、各箇所で直接使用してもよい。（正規表現コンパイルにかかる時間が問題になるような処理でもないので）

File: `infix2rpn.cpp`

{% highlight c linenos %}
/***************************************************************
  Convert an infix formula to an RPN.
  (Unary operators are not supported)

    DATE          AUTHOR          VERSION
    2020.10.05    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
***************************************************************/
#include <iostream>   // for cout
#include <regex>      // for regex_search.
#include <stack>
#include <string>
#include <unordered_map>
#include <vector>

namespace my_lib {

class Infix2Rpn {
  std::string f;                   // 中置記法(infix formula)文字列
  std::vector<std::string> str2ary(std::string);  // 文字列の配列化

public:
  Infix2Rpn(std::string f) : f(f) {}  // コンストラクタ
  std::string convert();              // 中置記法 => 後置記法 変換
};

/*
 * 中置記法 => 後置記法 変換
 *
 * @return 変換後文字列(string)
 */
std::string Infix2Rpn::convert() {
  std::stack<std::string> st;  // 作業用スタック
  std::vector<std::string> v;  // 変換後配列
  std::regex re_d("\\d+");     // 正規表現（数値）
  std::regex re_k_0("\\(");    // 正規表現（括弧・開き）
  std::regex re_k_1("\\)");    // 正規表現（括弧・閉じ）
  std::unordered_map<std::string, int> kPri = {
    {"*", 3}, {"/", 3}, {"+", 2}, {"-", 2}, {"(", 1}, {")", 1},
  };                           // 演算子・括弧優先度
  std::smatch sm;              // 正規表現（マッチ部分）
  unsigned int sz_v;           // 変換後配列サイズ
  unsigned int i;              // ループインデックス
  std::string rpn;             // 変換後文字列

  try {
    for (std::string t : str2ary(f)) {
      if (std::regex_search(t, sm, re_d)) {
        v.push_back(t);
      } else if (std::regex_search(t, sm, re_k_0)) {
        st.push(t);
      } else if (std::regex_search(t, sm, re_k_1)) {
        while (st.top() != "(") {
          v.push_back(st.top());
          st.pop();
        }
        st.pop();
      } else {
        while (!st.empty() && (kPri[st.top()] >= kPri[t])) {
          v.push_back(st.top());
          st.pop();
        }
        st.push(t);
      }
    }
    while (!st.empty()) {
      v.push_back(st.top());
      st.pop();
    }
    // 配列 => 文字列（スペース区切り）
    sz_v = v.size();
    for (i = 0; i < sz_v - 1; i++) rpn += v[i] + " ";
    rpn += v[sz_v - 1];
  } catch (...) {
    return "";  // 変換失敗
  }

  return rpn;
}

/**
 * @brief      中置記法文字列の配列化
 *
 * @param[ref] 中置記法文字列 f (string)
 * @return     配列(vector)
 */
std::vector<std::string> Infix2Rpn::str2ary(std::string f) {
  std::vector<std::string> v;
  std::regex re("([0-9\\.]+|[()*/+\\-])");
  std::smatch sm;

  try {
    f.erase(remove(f.begin(), f.end(),' '), f.end());
    while (std::regex_search(f, sm, re)) {
      v.push_back(sm[1].str());
      f = sm.suffix();
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
    my_lib::Infix2Rpn i2r(buf);
    std::cout << i2r.convert() << std::endl;
  } catch (...) {
    std::cerr << "EXCEPTION!" << std::endl;
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to convert a formula string to a RPN.](https://gist.github.com/komasaru/54b50fbbc18d459d7b036bad406d6362 "Gist - C++ source code to convert a formula string to a RPN.")

### 3. ソースコードのコンパイル

``` text
$ g++ -std=c++17 -Wall -O2 --pedantic-errors -o infix2rpn infix2rpn.cpp
```

### 4. 動作確認

``` text
$ ./infix2rpn
? (1 + 2.3 * (13 - 9)) / ((20 + 25) - 6 * 2)
1 2.3 13 9 - * + 20 25 + 6 2 * - /
```

---

次回、逆ポーランド記法の数式文字列から値を計算する処理（逆ポーランド計算機）について紹介する予定です。

以上。

