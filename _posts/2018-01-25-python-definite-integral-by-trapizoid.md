---
layout   : single
title    : "Python - 数値積分（台形則による定積分）！"
published: true
date     : 2018-01-25 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 で台形則により数値積分（定積分）する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 数値積分（台形則による定積分）！]({{site.baseurl}}/2012/09/10/10002057 "C++ - 数値積分（台形則による定積分）！")
* [Ruby - 数値積分（台形則による定積分）！]({{site.baseurl}}/2012/09/11/11002028 "Ruby - 数値積分（台形則による定積分）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 必要に応じて、スクリプト内の定数や被積分関数を変更する。

File: `definite_integral_trapezoid.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Definite integral by by trapizoidal rule
"""
import math
import sys
import traceback


class DefiniteIntegralTrapezoid:
    M = 100  # Number of division

    def __init__(self):
        self.f = lambda x: math.sqrt(4 - x * x)

    def compute(self, a, b):
        """
        Computation of infinite intagral
        """
        try:
            h = (b - a) / self.M
            x, s = a, 0
            for k in range(1, self.M):
                x += h
                s += self.f(x)
            s = h * ((self.f(a) + self.f(b)) / 2 + s)
            print("  / {:f}".format(b))
            print("  |  f(x)dx = {:f} ".format(s))
            print("  / {:f}".format(a))
        except Exception as e:
            raise


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("USAGE: ./definite_integral_trapezoid.py A B")
        sys.exit(0)
    a, b = list(map(float, sys.argv[1:3]))
    if a == 0 and b == 0:
        sys.exit(0)

    try:
        obj = DefiniteIntegralTrapezoid()
        obj.compute(a, b)
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute definite integral by trapezoidal rule.](https://gist.github.com/komasaru/f546261c4e015459242cb175e7835c34 "Gist - Python script to compute definite integral by trapezoidal rule.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x definite_integral_trapezoid.py
```

そして、引数 A, B を指定して実行。  
（当然、今回使用の被積分関数では-2未満や2より大きい数値を指定するとエラーになる）

``` text
$ ./definite_integral_trapezoid.py 0 2
  / 2.000000
  |  f(x)dx = 3.140417
  / 0.000000
```

---

以上

