---
layout   : single
title    : "Python - 多倍長浮動小数点数の加減算！"
published: true
date     : 2018-03-28 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python3 で、多桁（多倍長）の浮動小数点同士で加減算する方法についてです。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 多倍長浮動小数点数の加減算！]({{site.baseurl}}/2013/05/05/cpp-add-big-float "C++ - 多倍長浮動小数点数の加減算！")
* [Ruby - 多倍長浮動小数点数の加減算！]({{site.baseurl}}/2013/05/06/ruby-add-big-float "Ruby - 多倍長浮動小数点数の加減算！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy を使用しない。（この程度の計算では、逆に2倍程度時間がかかってしまうため）
* 必要であれば、スクリプト内の定数を変更する。
* 今回、 A - C < 0 (A < C) になることは想定していない。

File: `add_big_float.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Comutation between two big-digit floats
"""
import random
import sys
import traceback


class AddBigFloat:
    D_MAX = 1001  # Number of significant digits

    def __init__(self):
        # Should be A > C
        self.a, self.b, self.c = [], [], []
        self.a.append(random.randrange(self.D_MAX - 1) + 1)
        self.b.append(random.randrange(self.D_MAX - 1) + 1)
        self.c.append(self.a[0] - random.randrange(self.a[0]) - 1)
        self.a += [random.randrange(10)for _ in range(self.D_MAX - 1)]
        self.b += [random.randrange(10)for _ in range(self.D_MAX - 1)]
        self.c += [random.randrange(10)for _ in range(self.D_MAX - 1)]

    def compute(self):
        """ Computation """
        try:
            print("A =")
            self.__fdisp(self.a)
            print("B =")
            self.__fdisp(self.b)
            print("C =")
            self.__fdisp(self.c)
            print("A + B =")
            self.__fdisp(self.__fadd(self.a, self.b, 1))
            print("A - C =")
            self.__fdisp(self.__fadd(self.a, self.c, -1))
        except Exception as e:
            raise

    def __add(self, a, b, flag):
        """ Addition or subtraction between two integers

        :param  list   a
        :param  list   b
        :param  int flag
        :return list   z
        """
        try:
            if flag >= 0:
                z = [a[i] + b[i] for i in range(len(a))]
            else:
                z = [a[i] - b[i] for i in range(len(a))]
            return self.__norm(z)
        except Exception as e:
            raise

    def __fadd(self, a, b, flag):
        """ Addition or subtraction between two floats

        :param  list   a
        :param  list   b
        :param  int flag
        :return list   z
        """
        z = []
        try:
            if a[0] >= b[0]:
                k = a[0] - b[0]
                z = a[:(k + 1)]
                z += self.__add(a[(k + 1):], b[1:(len(a) + k)], flag)
            else:
                z.append(b[0])
                k = b[0] - a[0]
                if flag >= 0:
                    z += b[1:(k + 1)]
                else:
                    z += [-b[i] for i in range(1, k + 1)]
                z += self.__add(a[1:(-k)], b[(k + 1):], flag)
            return self.__fnorm([z[0]] + self.__norm(z[1:]))
        except Exception as e:
            raise

    def __norm(self, a):
        """ Normalization of a integer

        :param  list a
        :return list a
        """
        cr = 0
        try:
            for i in range(len(a) - 1, 0, -1):
                cr        = int(a[i] / 10)
                a[i]     -= cr * 10
                a[i - 1] += cr
            for i in range(len(a) - 1, 0, -1):
                if a[i] < 0:
                    a[i - 1] -= 1
                    a[i]     += 10
            return a
        except Exception as e:
            raise

    def __fnorm(self, a):
        """ Normalization of a float

        :param  list a
        :return list a
        """
        k = 0
        try:
            if a[1] >= 10:
                for i in range(len(a) - 2, 1, -1):
                    a[i + 1] = a[i]
                a[2] = a[1] % 10
                a[1] = int(a[1] / 10)
                a[0] += 1
            exp = a[0]
            for i in range(1, len(a) + 1):
                if a[i] != 0:
                    k = i - 1
                    break
            for i in range(1, len(a) - k):
                a[i] = a[i + k]
            for i in range(len(a) - k, len(a)):
                a[i] = 0
            a[0] = exp - k
            return a
        except Exception as e:
            raise

    def __fdisp(self, s):
        """ Display

        :param list s
        """
        try:
            if s[1] < 0:
                print("ANS. < 0\nPlease retry!")
                sys.exit()
            print("0.", end="")
            for i in range(1, len(s)):
              print(s[i], end="")
              if i % 10 == 0:
                  print(" ", end="")
              if i % 50 == 0:
                  print("\n  ", end="")
            if s[0] < 0:
                print(" * 10^({})".format(s[0]))
            else:
                print(" * 10^{}".format(s[0]))
            print()
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = AddBigFloat()
        obj.compute()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute big-digit floats.](https://gist.github.com/komasaru/77be09a274175db1797536dae2424a72 "Gist - Python script to compute big-digit floats.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x add_big_float.py
```

そして、実行。

``` text
$ ./add_big_float.py
```

---

以上

