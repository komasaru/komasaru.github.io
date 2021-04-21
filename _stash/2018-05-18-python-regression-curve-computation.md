---
layout   : single
title    : "Python - 2 つの list から単回帰曲線（二次回帰）計算！"
published: true
date     : 2018-05-18 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python で、数値からなる同サイズの list 2つを説明変数・目的変数とみなして単回帰曲線（二次回帰）を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [Ruby - Array クラス拡張で単回帰曲線計算！]({{site.baseurl}}/2018/05/16/ruby-simple-linear-regression-curve "Ruby - Array クラス拡張で単回帰曲線計算！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy は使用しない。（この程度の行列計算は list で充分）

File: `regression_curve.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Computation of a simple linear regression curve
"""
import math
import sys
import traceback


class RegressionCurve:
    def reg_curve(self, x, y):
        """ Regression line computation

        :param  list  x: 1st list of variables
        :param  list  y: 2nd list of variables
        :return list [a, b, c]: a-value, b-value, c-value
        """
        try:
            if type(x) != list:
                print("Argument(X) is not a list!")
                sys.exit()
            if type(y) != list:
                print("Argument(Y) is not a list!")
                sys.exit()
            if len(x) == 0:
                print("List(X) is none!")
                sys.exit()
            if len(y) == 0:
                print("List(Y) is none!")
                sys.exit()
            if len(x) != len(y):
                print("Argument list size is invalid!")
                sys.exit()
            n     = len(x)                                       # number of items
            m_x   = sum(x) / n                                   # avg(X)
            m_y   = sum(y) / n                                   # avg(Y)
            m_x2  = sum([a ** 2 for a in x]) / n                 # avg(X^2)
            m_x3  = sum([a ** 3 for a in x]) / n                 # avg(X^3)
            m_x4  = sum([a ** 4 for a in x]) / n                 # avg(X^4)
            m_xy  = sum([a * b for a, b in zip(x, y)]) / n       # avg(X * Y)
            m_x2y = sum([a * a * b for a, b in zip(x, y)]) / n   # avg(X^2 * Y)
            s_xx   = m_x2 - m_x * m_x                            # Sxx
            s_xy   = m_xy - m_x * m_y                            # Sxy
            s_xx2  = m_x3 - m_x * m_x2                           # Sxx2
            s_x2x2 = m_x4 - m_x2 * m_x2                          # Sx2x2
            s_x2y  = m_x2y - m_x2 * m_y                          # Sx2y
            b  = s_xy * s_x2x2 - s_x2y * s_xx2
            b /= s_xx * s_x2x2 - s_xx2 * s_xx2
            c  = s_x2y * s_xx - s_xy * s_xx2
            c /= s_xx * s_x2x2 - s_xx2 * s_xx2
            a = m_y - b * m_x - c * m_x2
            return [a, b, c, r]
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        #x = [107, 336, 233, 82, 61, 378, 129, 313, 142, 428]
        #y = [286, 851, 589, 389, 158, 1037, 463, 563, 372, 1020]
        x = [83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62]
        y = [183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175, 164, 175]
        print("説明変数 X =", x)
        print("目的変数 Y =", y)
        print("---")
        obj = RegressionCurve()
        reg_curve = obj.reg_curve(x, y)
        print("a =", reg_curve[0])
        print("b =", reg_curve[1])
        print("c =", reg_curve[2])
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute regression curve.](https://gist.github.com/komasaru/83dca9085c29ceb9285a18fac7e15066 "Gist - Python script to compute regression curve.")

ちなみに、 NumPy ライブラリを使用すると、 a, b, c 計算部分は1行で済ませられる。（但し、当方が想定している回帰曲線と係数 a, b, c が逆順になる。また、処理時間は NumPy を使用しない場合より長い（2〜3倍？））

File: `regression_curve_numpy.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Computation of a simple linear regression curve
"""
import sys
import traceback
import numpy as np


class RegressionCurve:
    def reg_curve(self, x, y):
        """ Regression line computation

        :param  list  x: 1st list of variables
        :param  list  y: 2nd list of variables
        :return list [a, b, c]: a-value, b-value, c-value
        """
        try:
            if type(x) != list:
                print("Argument(X) is not a list!")
                sys.exit()
            if type(y) != list:
                print("Argument(Y) is not a list!")
                sys.exit()
            if len(x) == 0:
                print("List(X) is none!")
                sys.exit()
            if len(y) == 0:
                print("List(Y) is none!")
                sys.exit()
            if len(x) != len(y):
                print("Argument list size is invalid!")
                sys.exit()
            c, b, a = np.polyfit(x, y, 2)
            return [a, b, c]
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        #x = [107, 336, 233, 82, 61, 378, 129, 313, 142, 428]
        #y = [286, 851, 589, 389, 158, 1037, 463, 563, 372, 1020]
        x = [83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62]
        y = [183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175, 164, 175]
        print("説明変数 X =", x)
        print("目的変数 Y =", y)
        print("---")
        obj = RegressionCurve()
        reg_curve = obj.reg_curve(x, y)
        print("a =", reg_curve[0])
        print("b =", reg_curve[1])
        print("c =", reg_curve[2])
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

さらに、相関係数も求めたければ、以下のようにすればよい。

File: `regression_curve_numpy.py`

{% highlight python linenos %}
            #
            # ---< 中略 >---
            #
            c, b, a = np.polyfit(x, y, 2)
            r = np.corrcoef(x, y)[0, 1]    # <= 相関係数
            return [a, b, c, r]
            #
            # ---< 中略 >---
            #
{% endhighlight %}

（`[0, 1]` の部分は `[1, 0]` でもよい）

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x regression_curve.py
```

そして、実行。

``` text
$ ./regression_curve.py
説明変数 X = [83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62]
目的変数 Y = [183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175, 164, 175]
---
a = 41.374539640720556
b = 3.0867232029882175
c = -0.016835648076371865

$ ./regression_curve_numpy.py
説明変数 X = [83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62]
目的変数 Y = [183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175, 164, 175]
---
a = 41.3745396405
b = 3.08672320299
c = -0.0168356480764
r = 0.788319080261
```

---

以上

