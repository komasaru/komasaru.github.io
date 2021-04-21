---
layout   : single
title    : "C++ - 実数判定（正規表現）！"
published: true
date     : 2020-09-02 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C++
- 正規表現
---

C++ で文字列が実数か否かを正規表現を使用して判定する方法についてです。  
（別途作成予定のツールで部品として使用するための事前準備）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. ソースコードの作成

* 正規表現を使用して判定する。
* `stof` 等を利用した判定方法もあるが、期待しない例外が発生したり、場合分けが面倒になる。

File: `is_real.cpp`

{% highlight c linenos %}
/***************************************************************
  Check real number

  $ g++ -std=c++17 -Wall -O2 --pedantic-errors -o is_real is_real.cpp

    DATE          AUTHOR          VERSION
    2020.08.24    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
***************************************************************/
#include <iostream>   // for cout
#include <regex>      // for regex etc.

namespace funcs {
  bool is_real(std::string s) {
    std::smatch m;
    std::regex re("^[+-]?(\\d+\\.\\d*|\\.\\d+)$");

    try {
      if (!std::regex_search(s, m, re))
        return false;
    } catch (std::regex_error& e) {
      //std::cout << "[EXCEPTION] Regex error! ("
      //          << e.what() << ")" << std::endl;
      return false;
    }

    return true;
  }
}

int main(int argc, char* argv[]) {
  std::string buf;

  try {
    while (true) {
      std::cout << "n? ";
      getline(std::cin, buf);
      if (buf.empty())
        break;
      std::cout << buf << ": ";
      if (!funcs::is_real(buf))
        std::cout << "NOT ";
      std::cout << "REAL NUMBER\n---" << std::endl;
    }
  } catch (...) {
    std::cerr << "EXCEPTION!" << std::endl;
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to judge if a string is an real number.](https://gist.github.com/komasaru/6251f48d728f07496cfac69f4cff4c49 "Gist - C++ source code to judge if a string is an real number.")

### 2. ソースコードのコンパイル

``` text
$ g++ -std=c++17 -Wall -O2 --pedantic-errors -o is_real is_real.cpp
```

### 3. 動作確認

``` text
$ ./is_real
n? 1.2
1.2: REAL NUMBER
---
n? 1.
1.: REAL NUMBER
---
n? .1
.1: REAL NUMBER
---
n? -2.3
-2.3: REAL NUMBER
---
n? -.3
-.3: REAL NUMBER
---
n? -4.
-4.: REAL NUMBER
---
n? 1.a
1.a: NOT REAL NUMBER
---
n? -12345.456789
-12345.456789: REAL NUMBER
---
n? -4.56O143
-4.56O143: NOT REAL NUMBER
---
n?
```

* 最後の小数点以下第3位の `O` はアルファベット大文字の「オー」

---

以上。

