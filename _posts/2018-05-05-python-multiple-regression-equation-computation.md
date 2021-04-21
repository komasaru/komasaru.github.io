---
layout   : single
title    : "Python - 2 つの list から重回帰式計算！"
published: true
date     : 2018-05-05 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python で、説明（独立）変数２個以上、目的（従属）変数１個の「重回帰式」を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [Ruby - Array クラス拡張で重回帰式計算！]({{site.baseurl}}/2014/11/23/ruby-multiple-regression-function "Ruby - Array クラス拡張で重回帰式計算！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy は使用しない。（この程度の行列計算は list で充分）

File: `regression_multi.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Computation of a multiple regression equation
"""
import math
import sys
import traceback


class RegressionMulti:
    def reg_multi(self, x, y):
        """ Regression equation computation

        :param  list  x: 1st multiple list of variables
        :param  list  y: 2nd list of variables
        :return list [c] + v: c = constant, v = partial regression coefficients
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
            if len(x[0]) != len(y):
                print("Argument list size is invalid!")
                sys.exit()
            for i in range(1, len(x)):
                if len(x[0]) != len(x[i]):
                    print("Argument list size is invalid!")
                    sys.exit()
            lst = [y] + x
            mtx = [
                [self.__sum_p(lst[i], lst[j]) for j in range(len(lst))]
                for i in range(len(lst))
            ]
            v = self.__gauss_e(
                [mtx[i][1:] + [mtx[i][0]]for i in range(1, len(mtx))]
            )
            c = self.__calc_const(lst, v)
            return [c] + v
        except Exception as e:
            raise

    def __gauss_e(self, lst):
        """ Gaussian elimination

        :param  list lst: target list
        :return list ans: answer list
        """
        try:
            n = len(lst)
            for k in range(n - 1):
                for i in range(k + 1, n):
                    if lst[k][k] == 0:
                        print("解けない！")
                        sys.exit(0)
                    d = lst[i][k] / lst[k][k]
                    for j in range(k + 1, n + 1):
                        lst[i][j] -= lst[k][j] * d
            for i in reversed(range(n)):
                if lst[i][i] == 0:
                    print("解けない！")
                    sys.exit(0)
                d = lst[i][n]
                for j in range(i + 1, n):
                    d -= lst[i][j] * lst[j][n]
                lst[i][n] = d / lst[i][i]
            return [a[-1] for a in lst]
        except Exception as e:
            raise

    def __sum_p(self, lst_x, lst_y):
        """ Sum-of-producsts computation

        :param  list lst_x: 1st list
        :param  list lst_y: 2nd list
        :retrun list sum_prd: sum of products
        """
        try:
            avg_x = sum(lst_x) / len(lst_x)
            avg_y = sum(lst_y) / len(lst_y)
            prd = [(x - avg_x) * (y - avg_y) for x, y in zip(lst_x, lst_y)]
            return sum(prd)
        except Exception as e:
            raise

    def __calc_const(self, lst, v):
        """ Constant term computation

        :param  list lst
        :param  list v
        :return float c: constant term
        """
        try:
            lst_size = len(lst[0])
            s = [sum(l) for l in lst]
            c = s[0] / lst_size
            for i in range(1, len(lst)):
                c -= s[i] * v[i - 1] / lst_size
            return c
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        x = [
            [17.5, 17.0, 18.5, 16.0, 19.0, 19.5, 16.0, 18.0, 19.0, 19.5],
            [30, 25, 20, 30, 45, 35, 25, 35, 35, 40]
        ]
        y = [45, 38, 41, 34, 59, 47, 35, 43, 54, 52]
        for i, a in enumerate(x):
            print("説明変数 X{} = {}".format(i + 1, x[i]))
        print("目的変数 Y  =", y)
        print("---")
        obj = RegressionMulti()
        print(obj.reg_multi(x, y))
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute multiple regression equation.](https://gist.github.com/komasaru/211947ac6727eb8b2dd393925c4dab65 "Gist - Python script to compute multiple regression equation.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x regression_multi.py
```

そして、実行。

``` text
$ ./regression_multi.py
説明変数 X1 = [17.5, 17.0, 18.5, 16.0, 19.0, 19.5, 16.0, 18.0, 19.0, 19.5]
説明変数 X2 = [30, 25, 20, 30, 45, 35, 25, 35, 35, 40]
目的変数 Y  = [45, 38, 41, 34, 59, 47, 35, 43, 54, 52]
---
[-34.71293083506825, 3.469812630117974, 0.5330094841545223]
```

---

以上

