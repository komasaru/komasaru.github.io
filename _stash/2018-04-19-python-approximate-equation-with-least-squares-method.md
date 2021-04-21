---
layout   : single
title    : "Python - 最小二乗法！"
published: true
date     : 2018-04-19 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

今回は、近似方程式を「最小二乗法」で解くアルゴリズムを Python3 で実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 最小二乗法！]({{site.baseurl}}/2014/03/02/cpp-least-squares-method "C++ - 最小二乗法！")
* [Ruby - 最小二乗法！]({{site.baseurl}}/2014/03/03/ruby-least-squares-method "Ruby - 最小二乗法！")
* [Fortran - 最小二乗法！]({{site.baseurl}}/2014/03/04/fortran-least-squares-method "Fortran - 最小二乗法！")
* [Java - 最小二乗法！]({{site.baseurl}}/2014/03/05/java-least-squares-method "Java - 最小二乗法！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy は使用しない。（この程度の行列計算は List で充分）
* 必要であれば、スクリプト内の定数を変更する。（解きたい近似方程式に合わせて）

File: `least_squares_method.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Solving approximate equation with least squares method
"""
import sys
import traceback


class LeastSquaresMethod:
    N, M = 7, 5                    # Number of data, Dimension of curve
    X = [-3, -2, -1,  0, 1, 2, 3]  # Measurement data x
    Y = [ 5, -2, -3, -1, 1, 4, 5]  # Measurement data y

    def __init__(self):
        self.a = [[0.0 for _ in range(self.M + 2)] for _ in range(self.M + 1)]
        self.s = [0.0 for _ in range(2 * self.M + 1)]
        self.t = [0.0 for _ in range(self.M + 1)]

    def exec(self):
        """ Executeion """
        try:
            self.__calc_st()
            self.__ins_st()
            self.__sweep_out()
            self.__display()
        except Exception as e:
            raise

    def __calc_st(self):
        """ Calculation of s and t """
        try:
            for i in range(self.N):
                for j in range(2 * self.M + 1):
                    self.s[j] += (self.X[i] ** j)
                for j in range(self.M + 1):
                    self.t[j] += (self.X[i] ** j) * self.Y[i]
        except Exception as e:
            raise

    def __ins_st(self):
        """ Insertion of s and t into a """
        try:
            for i in range(self.M + 1):
                for j in range(self.M + 1):
                    self.a[i][j] = self.s[i + j]
                self.a[i][self.M + 1] = self.t[i]
        except Exception as e:
            raise

    def __sweep_out(self):
        """ Sweeping out """
        try:
            for k in range(self.M + 1):
                p = self.a[k][k]
                for j in range(k, self.M + 2):
                    self.a[k][j] /= p
                for i in range(self.M + 1):
                    if i == k:
                        continue
                    d = self.a[i][k]
                    for j in range(k, self.M + 2):
                        self.a[i][j] -= d * self.a[k][j]
        except Exception as e:
            raise

    def __display(self):
        """ Computation of y value and display """
        try:
            for k in range(self.M + 1):
                print("a{:d} = {:10.6f}".format(k, self.a[k][self.M + 1]))
            print("    x    y")
            for px in [0.5 * i for i in range(-6, 7)]:
                p = 0
                for k in range(self.M + 1):
                    p += self.a[k][self.M + 1] * (px ** k)
                print("{:5.1f}{:5.1f}".format(px, p))
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = LeastSquaresMethod()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to solve approximate equation with least squares method.](https://gist.github.com/komasaru/e4ce0cc56639557d2ab343bff3666ec1 "Gist - Python script to solve approximate equation with least squares method.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x least_squares_method.py
```

そして、実行。

``` text
$ ./least_squares_method.py
a0 =  -1.259740
a1 =   2.100000
a2 =   0.424242
a3 =  -0.083333
a4 =   0.030303
a5 =  -0.016667
    x    y
 -3.0  5.0
 -2.5  0.3
 -2.0 -2.1
 -1.5 -2.9
 -1.0 -2.8
 -0.5 -2.2
  0.0 -1.3
  0.5 -0.1
  1.0  1.2
  1.5  2.6
  2.0  3.9
  2.5  4.9
  3.0  5.0
```

C++ 版等と同じ結果になるはず。

---

以上

