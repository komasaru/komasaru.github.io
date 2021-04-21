---
layout   : single
title    : "Python - テイラー展開 [ cos(x) ]！"
published: true
date     : 2018-02-04 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 で$$\cos x$$のテイラー展開を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - テイラー展開 [ cos(x) ]！]({{site.baseurl}}/2012/10/21/21002010 "C++ - テイラー展開 [ cos(x) ]！")
* [Ruby - テイラー展開 [ cos(x) ]！]({{site.baseurl}}/2012/10/22/22002053 "Ruby - テイラー展開 [ cos(x) ]！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 必要であれば、スクリプト内の定数や被積分関数を変更する。

File: `taylor_expansion_cos.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Taylor expansion (cos(x))
"""
import math
import sys
import traceback


class TaylorExpansionCos:
    EPS = 1e-08         # Precision
    PI  = 3.1415926535  # Pi

    def compute(self):
        """ Computation of Taylor expansion """
        try:
            rad = self.PI / 180
            print("    x      mycos(x)        cos(x)")
            for x in range(0, 181, 10):
                cos, cos_2 = math.cos(x * rad), self.__cos(x * rad)
                print("{:5.1f}{:14.6f}{:14.6f}".format(x, cos_2, cos))
        except Exception as e:
            raise

    def __cos(self, x):
        """ Computation of cos(x)

        :param  float   x
        :return float exp
        """
        try:
            d = s = e = 1.0
            x %=  2 * self.PI
            for k in range(1, 201, 2):
              d = s
              e *= -x * x / (k * (k + 1))
              s += e
              if abs(s - d) / abs(d) < self.EPS:
                  return s
            return 9999.0
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = TaylorExpansionCos()
        obj.compute()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute Taylor expansion (cos(x)).](https://gist.github.com/komasaru/893a8910b9604ca14eeb0ce4b1853aca "Gist - Python script to compute Taylor expansion (cos(x)).")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x taylor_expansion_cos.py
```

そして、実行。

``` text
$ ./taylor_expansion_cos.py
    x      mycos(x)        cos(x)
  0.0      1.000000      1.000000
 10.0      0.984808      0.984808
 20.0      0.939693      0.939693
 30.0      0.866025      0.866025
 40.0      0.766044      0.766044
 50.0      0.642788      0.642788
 60.0      0.500000      0.500000
 70.0      0.342020      0.342020
 80.0      0.173648      0.173648
 90.0      0.000000      0.000000
100.0     -0.173648     -0.173648
110.0     -0.342020     -0.342020
120.0     -0.500000     -0.500000
130.0     -0.642788     -0.642788
140.0     -0.766044     -0.766044
150.0     -0.866025     -0.866025
160.0     -0.939693     -0.939693
170.0     -0.984808     -0.984808
180.0     -1.000000     -1.000000
```

---

以上

