---
layout   : single
title    : "Python - 線形計画法（シンプレックス法）！"
published: true
date     : 2018-04-16 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

今回は、線形計画法を「シンプレックス法」で解くアルゴリズムを Python3 で実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 線形計画法（シンプレックス法）！]({{site.baseurl}}/2014/02/21/cpp-linear-programming-by-simplex "C++ - 線形計画法（シンプレックス法）！")
* [Ruby - 線形計画法（シンプレックス法）！]({{site.baseurl}}/2014/02/22/ruby-linear-programming-simplex "Ruby - 線形計画法（シンプレックス法）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy は使用しない。（この程度の行列計算は List で充分）
* 必要であれば、スクリプト内の定数を変更する。（実装したい線形計画法に合わせて）

File: `linear_programming_simplex.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Linear programming with Simplex method
"""
import sys
import traceback


class LinearProgrammingSimplex:
    N_ROW = 4  # Number of rows
    N_COL = 6  # Number of columns
    N_VAR = 2  # Number of variants

    def __init__(self):
        self.a = [
            [ 1.0,  2.0,  1.0,  0.0,  0.0, 14.0],
            [ 1.0,  1.0,  0.0,  1.0,  0.0,  8.0],
            [ 3.0,  1.0,  0.0,  0.0,  1.0, 18.0],
            [-2.0, -3.0,  0.0,  0.0,  0.0,  0.0]
        ]

    def exec(self):
        """ Execution """
        try:
            while True:
                mn, y = self.__select_col(9999)
                if mn >= 0:
                    break
                mn, x = self.__select_row(9999, y)
                self.__divide_pivot_var(x, y)
                self.__sweep_out(x, y)
            self.__display()
        except Exception as e:
            raise

    def __select_col(self, mn):
        """ Column selection

        :param  float mn
        :return list: [float, int]
        """
        y = 0
        try:
            for k in range(self.N_COL - 1):
                if self.a[self.N_ROW - 1][k] >= mn:
                    continue
                mn, y = self.a[self.N_ROW - 1][k], k
            return [mn, y]
        except Exception as e:
            raise

    def __select_row(self, mn, y):
        """ Row selection

        :param  float mn
        :param  int    y
        :return list: [float, int]
        """
        x = 0
        try:
            for k in range(self.N_ROW - 1):
                p = self.a[k][self.N_COL - 1] / self.a[k][y]
                if self.a[k][y] <= 0 or p >= mn:
                    continue
                mn, x = p, k
            return [mn, x]
        except Exception as e:
            raise

    def __divide_pivot_var(self, x, y):
        """ Pivot coefficient division by p

        :param int x
        :param int y
        """
        try:
            p = self.a[x][y]
            for k in range(self.N_COL):
                self.a[x][k] /= p
        except Exception as e:
            raise

    def __sweep_out(self, x, y):
        """ Pivot sweeping out

        :param int x
        :param int y
        """
        try:
            for k in range(self.N_ROW):
                if k == x:
                    continue
                d = self.a[k][y]
                for j in range(self.N_COL):
                    self.a[k][j] -= d * self.a[x][j]
        except Exception as e:
            raise

    def __display(self):
        """ Display """
        try:
            for k in range(self.N_VAR):
                flag = -1
                for j in range(self.N_ROW):
                    if self.a[j][k] == 1:
                        flag = j
                v = 0.0 if flag == -1 else self.a[flag][self.N_COL - 1]
                print("x{:d} = {:8.4f}".format(k, v))
            z = self.a[self.N_ROW - 1][self.N_COL - 1]
            print("z  = {:8.4f}".format(z))
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = LinearProgrammingSimplex()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gits - Python script to execute linear programming with Simplex method.](https://gist.github.com/komasaru/d4ff236dba76d6572af004cb8947ff7f "Gist - Python script to execute linear programming with Simplex method.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x linear_programming_simplex.py
```

そして、実行。

``` text
$ ./linear_programming_simplex.py
x0 =   2.0000
x1 =   6.0000
z  =  22.0000
```

解が正しいこと確認する。

---

以上

