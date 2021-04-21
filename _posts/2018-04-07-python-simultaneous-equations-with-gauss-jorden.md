---
layout   : single
title    : "Python - 連立方程式解法（ガウス・ジョルダン法）！"
published: true
date     : 2018-04-07 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python3 で、「ガウス・ジョルダン法」による連立方程式の解法を実装する方法についてです。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 連立方程式解法（ガウス・ジョルダン法）！]({{site.baseurl}}/2013/09/20/cpp-simultaneous-equation-by-gauss-jorden "C++ - 連立方程式解法（ガウス・ジョルダン法）！")
* [Ruby - 連立方程式解法（ガウス・ジョルダン法）！]({{site.baseurl}}/2013/09/21/ruby-simultaneous-equation-by-gauss-jorden "Ruby - 連立方程式解法（ガウス・ジョルダン法）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy は使用しない。（この程度の行列計算は List で充分）
* 必要であれば、スクリプト内の定数を変更する。（解きたい連立方程式に合わせて）

File: `gauss_jorden.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Simultaneous equations solving with Gauss-Jorden method
"""
import sys
import traceback


class GaussJorden:
    def __init__(self):
        self.a = [
          #[ 2, -3,  1,  5],
          #[ 1,  1, -1,  2],
          #[ 3,  5, -7,  0]
          [ 1, -2,  3, -4,  5],
          [-2, -5, -8, -3, -9],
          [ 5,  4,  7,  1, -1],
          [ 9,  7,  3,  5,  4]
        ]
        self.n = len(self.a)

    def exec(self):
        """ Solving and display """
        try:
            self.__display_equations()
            for k in range(self.n):
                p = self.a[k][k]
                for j in range(k, self.n + 1):
                    self.a[k][j] /= p
                for i in range(self.n):
                    if i == k:
                        continue
                    d = self.a[i][k]
                    for j in range(k, self.n + 1):
                        self.a[i][j] -= d * self.a[k][j]
            self.__display_answers()
        except Exception as e:
            raise

    def __display_equations(self):
        """ Display of source equations """
        try:
            for i in range(self.n):
                for j in range(self.n):
                    print("{:+d}x{:d} ".format(self.a[i][j], j + 1), end="")
                print("= {:+d}".format(self.a[i][self.n]))
        except Exception as e:
            raise

    def __display_answers(self):
        """ Display of answer """
        try:
            for k in range(self.n):
                print("x{:d} = {:f}".format(k + 1, self.a[k][self.n]))
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = GaussJorden()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to solve simultaneous equations with Gauss-Jorden method.](https://gist.github.com/komasaru/1e685bfd4629e64b68616001156f4d84 "Gist - Python script to solve simultaneous equations with Gauss-Jorden method.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x gauss_jorden.py
```

そして、実行。

``` text
$ ./gauss_jorden.py
+2x1 -3x2 +1x3 = +5
+1x1 +1x2 -1x3 = +2
+3x1 +5x2 -7x3 = +0
x1 = 3.000000
x2 = 1.000000
x3 = 2.000000
```

解が正しいこと確認する。

---

以上

