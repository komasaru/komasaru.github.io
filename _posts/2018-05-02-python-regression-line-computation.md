---
layout   : single
title    : "Python - 2 つの list から単回帰直線計算！"
published: true
date     : 2018-05-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python で、数値からなる同サイズの list 2つを説明変数・目的変数とみなして単回帰直線を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [Ruby - Array クラス拡張で単回帰直線計算！]({{site.baseurl}}/2014/11/05/ruby-simple-linear-regression-line "Ruby - Array クラス拡張で単回帰直線計算！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy は使用しない。（この程度の行列計算は list で充分）

File: `regression_line.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Computation of a simple lenear regression line
"""
import sys
import traceback


class RegressionLine:
    def reg_line(self, x, y):
        """ Regression line computation

        :param  list  x: 1st list of variables
        :param  list  y: 2nd list of variables
        :return list [a, b]: a = intercept, b = slope
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
            sum_x, sum_y = sum(x), sum(y)
            sum_xx = sum([a * a for a in x])
            sum_xy = sum([a * b for a, b in zip(x, y)])
            a  = sum_xx * sum_y - sum_xy * sum_x
            a /= len(x) * sum_xx - sum_x * sum_x
            b  = len(x) * sum_xy - sum_x * sum_y
            b /= len(x) * sum_xx - sum_x * sum_x
            return [a, b]
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        x = [107, 336, 233, 82, 61, 378, 129, 313, 142, 428]
        y = [286, 851, 589, 389, 158, 1037, 463, 563, 372, 1020]
        print("説明変数 X =", x)
        print("目的変数 Y =", y)
        print("---")
        obj = RegressionLine()
        reg_line = obj.reg_line(x, y)
        print("切片 a =", reg_line[0])
        print("傾き b =", reg_line[1])
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute regression line.](https://gist.github.com/komasaru/8ef169120f50146b24b229f561c153fa "Gist - Python script to compute regression line.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x regression_line.py
```

そして、実行。

``` text
$ ./regression_line.py
説明変数 X = [107, 336, 233, 82, 61, 378, 129, 313, 142, 428]
目的変数 Y = [286, 851, 589, 389, 158, 1037, 463, 563, 372, 1020]
---
切片 a = 99.07475877245791
傾き b = 2.144523500351028
```

---

以上

