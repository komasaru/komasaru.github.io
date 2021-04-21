---
layout   : single
title: "C++ - 数式文字列 => 逆ポーランド記法 変換＆計算（二分木使用）！"
published: true
date     : 2020-12-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

C++ で、入力した数式の文字列を逆ポーランド記法（RPN; 後置記法）に変換する処理を実装してみました。（ついでに、後置・中置・前置記法での計算も）  
前回・前々回はスタックを使用した処理についてでした。

* [C++ - 数式文字列 => 逆ポーランド記法 変換！]({{site.baseurl}}/2020/11/18/cpp-convert-str-to-rpn-with-stack "C++ - 数式文字列 => 逆ポーランド記法 変換！")
* [C++ - 逆ポーランド記法の評価（計算）！]({{site.baseurl}}/2020/11/25/cpp-calc-with-rpn-stack "C++ - 逆ポーランド記法の評価（計算）！")

今回は二分木を使用した処理についてです。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.6 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。
* 演算子は `*`, `/`, `+`, `-` を想定。（単項演算子は非対応）
* 括弧は `(`, `)` のみに対応。

### 1. アルゴリズム

次のリンク先（分かりやすく、きれいにまとまっている）のとおり。（自分で説明しようとすると、煩雑化しそう）

* [二分木を使った数式の逆ポーランド記法化と計算 - Programming/Tips - 総武ソフトウェア推進所](https://smdn.jp/programming/tips/polish/ "二分木を使った数式の逆ポーランド記法化と計算 - Programming/Tips - 総武ソフトウェア推進所")

### 2. C++ ソースコードの作成

File: `infix2rpn_bt.cpp`

{% highlight c linenos %}
/***************************************************************
  Convert an infix formula to an RPN (by binary tree).
  (Unary operators are not supported)

    DATE          AUTHOR          VERSION
    2020.10.08    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
***************************************************************/
#include <iostream>   // for cout
#include <regex>      // for regex_search.
#include <string>

namespace my_lib {

/*
 * @brief  Node クラス
 */
class Node {
  std::string expr;         // このノードが表す式
  Node *n_left  = nullptr;  // 子ノード（左）
  Node *n_right = nullptr;  // 子ノード（右）
  std::string rm_most_outer_bracket(std::string);  // 数式の最も外側のカッコを除去
  int get_operator_pos(std::string);               // 演算子の位置

public:
  Node(std::string expr) : expr(expr) {}  // コンストラクタ
  bool valid_bracket();                   // 丸カッコ対応数チェック
  void parse();                           // 解析（二分木に分割）
  void gen_post();                        // 変換（後置記法（逆ポーランド記法; RPN））
  void gen_in();                          // 変換（中置記法（挿入記法））
  void gen_pre();                         // 変換（前置記法（ポーランド記法））
  double calc();                          // 値の計算
};

/*
 * @brief  丸カッコ対応数チェック
 *
 * @return OK|NG (true|false)
 */
bool Node::valid_bracket() {
  bool res  = true;       // 結果(true|false)
  unsigned int nest = 0;  // 丸カッコのネスト数
  unsigned int i;         // ループインデックス

  try {
    for (i = 0; i < expr.size(); ++i) {
      if (expr[i] == '(') ++nest;
      if (expr[i] == ')') {
        --nest;
        if (nest < 0) break;
      }
    }
    if (nest != 0) res = false;
  } catch (...) {
    return false;
  }

  return res;
}

/*
 * @brief  解析（二分木に分割）
 */
void Node::parse() {
  int pos;  // 演算子の位置

  try {
    // 数式の最も外側のカッコを除去
    expr = rm_most_outer_bracket(expr);
    //# 演算子の位置
    pos = get_operator_pos(expr);
    // 演算子が存在しない場合、項とみなす
    if (pos < 0) return;
    // 子ノード（左）
    n_left = new Node(rm_most_outer_bracket(expr.substr(0, pos)));
    n_left->parse();
    // 子ノード（右）
    n_right = new Node(rm_most_outer_bracket(
          expr.substr(pos + 1, expr.size())));
    n_right->parse();
    // 演算子
    expr = expr[pos];
  } catch (...) {
    throw;
  }

  return;
}

/* @brief     数式の最も外側のカッコを除去
 *
 * @param[in] 括弧除去前の文字列(string)
 * @return    括弧除去後の文字列(string)
 */
std::string Node::rm_most_outer_bracket(std::string s) {
  bool res  = false;             // true: 数式の最も外側にカッコあり, false: なし
  unsigned int sz_s = s.size();  // 文字列長さ
  unsigned int nest = 0;         // カッコのネスト数
  unsigned int i;                // ループインデックス
  std::smatch sm;                // 正規表現マッチ

  try {
    // 最初の文字が "(" の場合、最も外側にカッコがあると仮定
    if (s[0] == '(') {
      res  = true;
      nest = 1;
    }
    // 2文字目以降、チェック
    for (i = 1; i < sz_s; ++i) {
      if (s[i] == '(') {
        ++nest;
      } else if (s[i] == ')') {
        --nest;
        // 最後以外でカッコが全て閉じられた場合、最も外側にカッコはないと判断
        // 例:"(1+2)+(3+4)"などの場合
        if (nest == 0 && i < sz_s - 2) {
          res = false;
          break;
        }
      }
    }
    // 最も外側にカッコがない場合、元の文字列をそのまま返す
    if (!res) return s;
    // カッコ内が空の場合、エラー
    if (std::regex_match(s, sm, std::regex("^\\(\\)$"))) {
      std::cout << "[ERROR] Empty bracket! (" << s << ")" << std::endl;
    }
    // 最も外側のカッコを除去
    s = s.substr(1, s.size() - 2);
    // 更に最も外側にカッコが残っている場合、再帰的に処理
    if (std::regex_match(s, sm, std::regex("^\\(.*?\\)$"))) {
      s = rm_most_outer_bracket(s);
    }
  } catch (...) {
    throw;
  }

  return s;
}

/*
 * @brief     演算子の位置取得
 *
 * @param[in] 数式文字列(string)
 * @return    演算子の位置(int)
 */
int Node::get_operator_pos(std::string s) {
  // 演算子の位置が不正なら、終了
  if (s == "") return -1;

  int pos = -1;               // 演算子の位置初期化
  unsigned nest = 0;          // カッコのネスト数
  unsigned int pri_min = 4;   // 演算子のこれまでで最も低い優先度
                              // （値が大きいほど優先度高）
  unsigned int pri;           // 演算子の優先度
  unsigned int i;             // ループインデックス

  try {
    for (i = 0; i < s.size(); ++i) {
      pri = 0;  // 演算子の優先度
      if (s[i] == '=') {
        pri = 1;
      } else if (s[i] == '+' || s[i] == '-') {
        pri = 2;
      } else if (s[i] == '*' || s[i] == '/') {
        pri = 3;
      } else if (s[i] == '(') {
        ++nest;
        continue;
      } else if (s[i] == ')') {
        --nest;
        continue;
      } else {
        continue;
      }
      if (nest == 0 && pri <= pri_min) {
        pri_min = pri;
        pos = i;
      }
    }
  } catch (...) {
    return 0;
  }

  return pos;
}

/*
 * @brief  変換（後置記法（逆ポーランド記法; RPN））
 */
void Node::gen_post() {
  try {
    if (n_left)  n_left->gen_post();
    if (n_right) n_right->gen_post();
    std::cout << expr << " ";
  } catch (...) {
    throw;
  }

  return;
}

/*
 * @brief  変換（中置記法（挿入記法））
 */
void Node::gen_in() {
  try {
    if (n_left && n_right) std::cout << "(";
    if (n_left) n_left ->gen_in();
    std::cout << expr;
    if (n_right) n_right->gen_in();
    if (n_left && n_right) std::cout << ")";
  } catch (...) {
    throw;
  }

  return;
}

/*
 * @brief  変換（前置記法（ポーランド記法））
 */
void Node::gen_pre() {
  try {
    std::cout << expr << " ";
    if (n_left)  n_left->gen_pre();
    if (n_right) n_right->gen_pre();
  } catch (...) {
    throw;
  }

  return;
}

/*
 * @brief  値の計算
 *
 * @return 計算結果(double)
 */
double Node::calc() {
  if (!n_left || !n_right) return stod(expr);

  double op_l;       // オペランド（左）
  double op_r;       // オペランド（右）
  double res = 0.0;  // 計算結果

  try {
    op_l = n_left->calc();
    op_r = n_right->calc();
    if (expr == "+") {
      res = op_l + op_r;
    } else if (expr == "-") {
      res = op_l - op_r;
    } else if (expr == "*") {
      res = op_l * op_r;
    } else if (expr == "/") {
      res = op_l / op_r;
    }
  } catch (...) {
    return 0.0;
  }

  return res;
}

/*
 * @brief  実行クラス
 */
class Infix2RpnBt {
  std::string f;  // 中置記法(infix formula)文字列

public:
  Infix2RpnBt(std::string f) : f(f) {}  // コンストラクタ
  void exec();
};

void Infix2RpnBt::exec() {
  std::regex re("(\\s+)");  // 正規表現（1個以上のスペース）
  std::string s = "";       // 空文字（スペース除去用）

  try {
    // スペース除去
    f = std::regex_replace(f, re, s);
    // Node クラスのインスタンス化
    my_lib::Node n_root(f);
    // 丸カッコ対応数チェック
    if (!n_root.valid_bracket()) {
      std::cout << "[ERROR] Brackets are unbalanced!" << std::endl;
      return;
    }
    // 解析（二分木分割）
    std::cout << "---" << std::endl;
    std::cout << "                Formula: " << f << std::endl;
    n_root.parse();
    // 変換（後置記法（逆ポーランド記法; RPN））
    std::cout << "Reverse Polish Notation: ";
    n_root.gen_post();
    std::cout << std::endl;
    // 変換（中置記法（挿入記法））
    std::cout << "         Infix Notation: ";
    n_root.gen_in();
    std::cout << std::endl;
    // 変換（前置記法（ポーランド記法））
    std::cout << "        Polish Notation: ";
    n_root.gen_pre();
    std::cout << std::endl;
    // 値の計算
    std::cout << "                Answer = "
              << n_root.calc() << std::endl;
  } catch (...) {
    throw;
  }
}

}  // namespace my_lib

int main(int argc, char* argv[]) {
  std::string buf;

  try {
    std::cout << "Formula? ";
    getline(std::cin, buf);
    if (buf.empty()) return EXIT_SUCCESS;
    my_lib::Infix2RpnBt i2r(buf);
    i2r.exec();
  } catch (...) {
    std::cerr << "EXCEPTION!" << std::endl;
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to convert a formula string to a RPN with a binary tree.](https://gist.github.com/komasaru/0b095b3b62753cfe3a2274c0b11d3b03 "Gist - C++ source code to convert a formula string to a RPN with a binary tree.")

### 3. ソースコードのコンパイル

``` text
$ g++ -std=c++17 -Wall -O2 --pedantic-errors -o infix2rpn_bt infix2rpn_bt.cpp
```

### 4. 動作確認

実行後、数式を入力・エンターすると、各種記法と計算結果が出力される。

``` text
$ ./infix2rpn_bt
Formula? (1 + 2.3 * (13 - 9)) / ((20 + 25) - 6 * 2)
---
                Formula: (1+2.3*(13-9))/((20+25)-6*2)
Reverse Polish Notation: 1 2.3 13 9 - * + 20 25 + 6 2 * - /
         Infix Notation: ((1+(2.3*(13-9)))/((20+25)-(6*2)))
        Polish Notation: / + 1 * 2.3 - 13 9 - + 20 25 * 6 2
                Answer = 0.309091
```

---

以上。

