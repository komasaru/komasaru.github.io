---
layout   : single
title    : "C++ - 整数判定（正規表現）！"
published: true
date     : 2020-08-26 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C++
- 正規表現
---

C++ で文字列が整数か否かを正規表現を使用して判定する方法についてです。  
（別途作成予定のツールで部品として使用するための事前準備）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. ソースコードの作成

* 正規表現を使用して判定する。
* `stoi` 等を利用した判定方法もあるが、期待しない例外が発生したり、場合分けが面倒になる。

File: `is_integer.cpp`

{% highlight c linenos %}
/***************************************************************
  Check integer

    DATE          AUTHOR          VERSION
    2020.08.21    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
***************************************************************/
#include <iostream>   // for cout
#include <regex>      // for regex etc.

namespace funcs {
  bool is_int(std::string s) {
    std::smatch m;
    std::regex re("^[+-]?\\d+$");

    try {
      if (!std::regex_search(s, m, re))
        return false;
    } catch (std::regex_error& e) {
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
      if (!funcs::is_int(buf))
        std::cout << "NOT ";
      std::cout << "INTEGER\n---" << std::endl;
    }
  } catch (...) {
    std::cerr << "EXCEPTION!" << std::endl;
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to judge if a string is an integer.](https://gist.github.com/komasaru/74a8c82430826eb58a257cff67c18363 "Gist - C++ source code to judge if a string is an integer.")

### 2. ソースコードのコンパイル

``` text
$ g++ -std=c++17 -Wall -O2 --pedantic-errors -o is_integer is_integer.cpp
```

### 3. 動作確認

``` text
$ ./is_integer
n? 1
1: INTEGER
---
n? 12a
12a: NOT INTEGER
---
n? 12a34
12a34: NOT INTEGER
---
n? -12345
-12345: INTEGER
---
n? -456a
-456a: NOT INTEGER
---
n? 1.23
1.23: NOT INTEGER
---
n? -2.46
-2.46: NOT INTEGER
---
n? -x.xxxx
-x.xxxx: NOT INTEGER
---
n? -12345678901234567890
-12345678901234567890: INTEGER
---
n?
```

---

以上。

