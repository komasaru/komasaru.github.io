---
layout   : single
title    : "Python - 最大公約数の計算（ユークリッドの互除法）！"
published: true
date     : 2018-01-04 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 で、ユークリッドの互除法を使用して、2つの自然数の最大公約数を計算する方法についての記録です。（あまりに簡単なアルゴリズムですが）

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++, Ruby - ユークリッドの互除法！]({{site.baseurl}}/2012/07/28/28002013 "C++, Ruby - ユークリッドの互除法！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `gcd_euclid.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
G.C.D. Computation with Euclid's algorithm
"""
import sys
import traceback


class GcdEuclid:
    """ Class for G.C.D. Euclid's algorithm """
    def gcd(self, a, b):
        """ G.C.D. Calculation

        :param int a: A value
        :param int b: B value
        """
        try:
            return a if b == 0 else self.gcd(b, a % b)
        except Exception as e:
            raise


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("USAGE: ./gcd_euclid.py A B")
        sys.exit(0)
    try:
        a, b = list(map(int, sys.argv[1:3]))
        if a == 0 or b == 0:
            print("Should be integers greater than 0.")
            sys.exit(0)
        obj = GcdEuclid()
        print("GCD({}, {}) = {}".format(a, b, obj.gcd(a, b)))
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute G.C.D. with Eublid's algorithm.](https://gist.github.com/komasaru/9af9ecfb6e4c690d1ff46c31f5416851 "Gist - Python script to compute G.C.D. with Eublid's algorithm.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x gcd_euclid.py
```

そして、第1、第2引数に自然数を指定して実行。（どちらかに `0` を指定した場合は、処理を終了する）

``` text
$ ./gcd_euclid.py 123 45
GCD(123, 45) = 3
```

---

以上

