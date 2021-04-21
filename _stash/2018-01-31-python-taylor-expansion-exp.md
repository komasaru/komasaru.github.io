---
layout   : single
title    : "Python - テイラー展開 [ exp(x) ]！"
published: true
date     : 2018-01-31 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 で$$e ^ {x}$$のテイラー展開を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - テイラー展開 [ exp(x) ]！]({{site.baseurl}}/2012/10/19/19002055 "C++ - テイラー展開 [ exp(x) ]！")
* [Ruby - テイラー展開 [ exp(x) ]！]({{site.baseurl}}/2012/10/20/20002000 "Ruby - テイラー展開 [ exp(x) ]！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 必要であれば、スクリプト内の定数や被積分関数を変更する。

File: `taylor_expansion.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Taylor expansion (exp(x))
"""
import math
import sys
import traceback


class TaylorExpansion:
    EPS = 1e-08  # Precision

    def compute(self):
        """ Computation of Taylor expansion """
        try:
            print("    x      myexp(x)        exp(x)")
            for x in range(-50, 51, 10):
                exp, exp_2 = math.exp(x), self.__calc_exp(x)
                print("{:5.1f}{:14g}{:14g}".format(x, exp_2, exp))
        except Exception as e:
            raise


    def __calc_exp(self, x):
        """ Computation of exp(x)

        :param  float   x
        :return float exp
        """
        try:
            d = s = e = 1.0
            for k in range(1, 201):
                d = s
                e = e * abs(x) / k
                s += e
                if abs(s - d) / abs(d) < self.EPS:
                    return s if x > 0 else 1.0 / s
            return 0.0
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = TaylorExpansion()
        obj.compute()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute Taylor expansion (exp(x)).](https://gist.github.com/komasaru/40db0411618710dc4ab5f1b7747717b3 "Gist - Python script to compute Taylor expansion (exp(x)).")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x taylor_expansion.py
```

そして、実行。

``` text
$ ./taylor_expansion.py
    x      myexp(x)        exp(x)
-50.0   1.92875e-22   1.92875e-22
-40.0   4.24835e-18   4.24835e-18
-30.0   9.35762e-14   9.35762e-14
-20.0   2.06115e-09   2.06115e-09
-10.0   4.53999e-05   4.53999e-05
  0.0             1             1
 10.0       22026.5       22026.5
 20.0   4.85165e+08   4.85165e+08
 30.0   1.06865e+13   1.06865e+13
 40.0   2.35385e+17   2.35385e+17
 50.0   5.18471e+21   5.18471e+21
```

---

以上

