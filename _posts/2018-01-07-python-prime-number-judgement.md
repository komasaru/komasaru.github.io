---
layout   : single
title    : "Python - 素数判定！"
published: true
date     : 2018-01-07 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 で、 1 より大きい任意の自然数が素数であるか否かを判定する方法についての記録です。（あまりに簡単なアルゴリズムですが）

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 素数判定！]({{site.baseurl}}/2012/08/02/02002047 "C++ - 素数判定！")
* [Ruby - 素数判定！]({{site.baseurl}}/2014/12/31/ruby-calc-prime-number "Ruby - 素数判定！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `prime_number.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Prime number judgement.
"""
import math
import sys
import traceback


class PrimeNumber:
    def is_prime(self, n):
        try:
            res = any(n % i == 0 for i in range(2, int(math.sqrt(n)) + 1))
            return not(res)
        except Exception as e:
            raise


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("USAGE: ./prime_number.py N")
        sys.exit(0)
    try:
        n = int(sys.argv[1])
        if n < 2:
            print("Should be integers greater than 1.")
            sys.exit(0)
        obj = PrimeNumber()
        judge = "" if obj.is_prime(n) else "NOT "
        print("{} : {}PRIME NUMBER".format(n, judge))
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to judge prime number.](https://gist.github.com/komasaru/0fb220f1a8a1898b4ae1b26f8125c03c "Gist - Python script to judge prime number.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x prime_number.py
```

そして、第1引数に 1 より大きい自然数を指定して実行。

``` text
$ ./prime_number.py 12345678923
12345678923 : PRIME NUMBER

$ ./prime_number.py 12345678924
12345678924 : NOT PRIME NUMBER
```

---

以上

