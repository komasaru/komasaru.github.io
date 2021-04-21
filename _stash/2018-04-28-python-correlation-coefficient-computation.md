---
layout   : single
title    : "Python - 2 つの list から相関係数計算！"
published: true
date     : 2018-04-28 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python で、数値からなる同サイズの list 2つを2つの確率変数とみなして相関係数を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [Ruby - Array クラス拡張で相関係数計算！]({{site.baseurl}}/2014/11/04/ruby-correlation-coefficient "Ruby - Array クラス拡張で相関係数計算！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy は使用しない。（この程度の行列計算は list で充分）

File: `correlation_coefficient.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Correlation coefficient computaion
"""
import math
import sys
import traceback


class CorrelationCoefficient:
    def compute_r(self, x, y):
        """ R computation

        :param  list  x: 1st list of random variables
        :param  list  y: 2nd list of random variables
        :return float r: correlation coefficient of X and Y
        """
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
        try:
            mean_x, mean_y  = sum(x) / len(x), sum(y) / len(y)
            cov   = sum([(a - mean_x) * (b - mean_y) for a, b in zip(x, y)])
            var_x = sum([(a - mean_x) ** 2 for a in x])
            var_y = sum([(b - mean_y) ** 2 for b in y])
            return (cov / math.sqrt(var_x)) / math.sqrt(var_y)
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        obj = CorrelationCoefficient()
        print(obj.compute_r(x, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
        print(obj.compute_r(x, [2, 3, 3, 4, 6, 7, 8, 9, 10, 11]))
        print(obj.compute_r(x, [15, 13, 12, 12, 10, 10, 8, 7, 4, 3]))
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute correlation coefficient.](https://gist.github.com/komasaru/508b2aa4befba108a965154878843e4d "Gist - Python script to compute correlation coefficient.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x correlation_coefficient.py
```

そして、実行。

``` text
$ ./correlation_coefficient.rb
1.0
0.9923373049285564
-0.9803906931996748
```

---

以上

