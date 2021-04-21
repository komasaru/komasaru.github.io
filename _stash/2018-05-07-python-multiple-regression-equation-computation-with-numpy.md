---
layout   : single
title    : "Python - 2 つの list から重回帰式計算（NumPy 版）！"
published: true
date     : 2018-05-07 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

前回、 Python で説明（独立）変数２個以上、目的（従属）変数１個の「重回帰式」を計算する方法についての紹介しました。（連立方程式の解法にはガウスの消去法を使用）

* [Python - 2 つの list から重回帰式計算！]({{site.baseurl}}/2018/05/05/python-multiple-regression-equation-computation "Python - 2 つの list から重回帰式計算！")

今回は、重回帰式を数値計算ライブラリ NumPy を使用して計算してみました。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* 数値計算ライブラリ NumPy を使用。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [Ruby - Array クラス拡張で重回帰式計算！]({{site.baseurl}}/2014/11/23/ruby-multiple-regression-function "Ruby - Array クラス拡張で重回帰式計算！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `regression_multi_numpy.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Computation of a multiple regression with NumPy
"""
import sys
import traceback
import numpy as np


class RegressionMulti:
    def reg_multi(self, x, y):
        """ Regression line computation

        :param  list x: list of explanatory variables
        :param  list y: list of objective variables
        :return list [b, a_0, a_1]: b, a_0, a_1 value
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
            e = np.array(x)
            o = np.array(y)
            e = np.vstack([np.ones(e.shape[1]), e])
            return np.linalg.lstsq(e.T, o)[0]
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        x = [
            [10, 9, 8, 6, 8, 4, 9, 10, 2, 3, 8, 6, 7, 5],
            [83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62]
        ]
        y   = [183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175, 164, 175]
        for i, a in enumerate(x):
            print("説明変数 X{} = {}".format(i + 1, x[i]))
        print("目的変数 Y  =", y)
        print("---")
        obj = RegressionMulti()
        res = obj.reg_multi(x, y)
        print("b   =", res[0])
        print("a_0 =", res[1])
        print("a_1 =", res[2])
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute multiple regression equation with NumPy.](https://gist.github.com/komasaru/795e73db8d5da36606e39142bc9b901d "Gist - Python script to compute multiple regression equation with NumPy.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x regression_multi_numpy.py
```

そして、実行。

``` text
$ ./regression_multi_numpy.py
説明変数 X1 = [10, 9, 8, 6, 8, 4, 9, 10, 2, 3, 8, 6, 7, 5]
説明変数 X2 = [83, 71, 64, 69, 69, 64, 68, 59, 81, 91, 57, 65, 58, 62]
目的変数 Y  = [183, 168, 171, 178, 176, 172, 165, 158, 183, 182, 163, 175, 164, 175]
---
b   = 142.291140153
a_0 = -0.975517494618
a_1 = 0.53444141503
```

---

以上

