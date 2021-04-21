---
layout   : single
title    : "Python - 円周率計算（マチンの公式）！"
published: true
date     : 2018-02-22 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
- 円周率
---

Python 3 でマチンの公式を利用して円周率を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 円周率計算（by マチンの公式）！]({{site.baseurl}}/2013/03/21/cpp-calc-pi-with-machin "C++ - 円周率計算（by マチンの公式）！")
* [Ruby - 円周率計算（by マチンの公式）！]({{site.baseurl}}/2013/03/22/ruby-calc-pi-with-machin "Ruby - 円周率計算（by マチンの公式）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy を使用しない。（この程度のリスト計算では、逆に2倍程度時間がかかってしまうため）
* 必要であれば、スクリプト内の定数を変更する。
* 多桁計算のアルゴリズムは自前で実装。

File: `calc_pi_machin.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Computation of Pi with Machin's formula
"""
import sys
import time
import traceback


class CalcPiMachin:
    L     = 1000  # Digits of computation
    FNAME = "pi_machin.txt"

    def __init__(self):
        self.l1 = int(self.L / 8 + 1)
        self.n  = int(self.L / 1.39794 + 1)

    def compute(self):
        """ Computation of Pi """
        try:
            t0 = time.time()
            s = [0 for _ in range(self.l1 + 2)]
            a = [0 for _ in range(self.l1 + 2)]
            b = [0 for _ in range(self.l1 + 2)]
            q = [0 for _ in range(self.l1 + 2)]
            a[0] = 16 *   5
            b[0] =  4 * 239
            for k in range(1, self.n + 1):
                a = self.__long_div(a,   5 *   5)
                b = self.__long_div(b, 239 * 239)
                q = self.__long_sub(a,         b)
                q = self.__long_div(q, 2 * k - 1)
                if k % 2 == 0:
                    s = self.__long_sub(s, q)
                else:
                    s = self.__long_add(s, q)
            t1 = time.time()
            tt = t1 - t0
            self.__display(tt, s)
        except Exception as e:
            raise

    def __long_add(self, a, b):
        """ Computation of long + long

        :param  list a: integral values
        :param  list b: integral values
        :return list z: integral values
        """
        try:
            z = [0 for _ in range(self.n)]
            cr = 0
            for i in reversed(range(self.l1 + 2)):
                z[i] = a[i] + b[i] + cr
                if z[i] < 100000000:
                    cr = 0
                else:
                    z[i] -= 100000000
                    cr = 1
            return z
        except Exception as e:
            raise

    def __long_sub(self, a, b):
        """ Computation of long - long

        :param  list a: integral values
        :param  list b: integral values
        :return list z: integral values
        """
        try:
            z = [0 for _ in range(self.n)]
            br = 0
            for i in reversed(range(self.l1 + 2)):
                z[i] = a[i] - b[i] - br
                if z[i] >= 0:
                    br = 0
                else:
                    z[i] += 100000000
                    br = 1
            return z
        except Exception as e:
            raise

    def __long_div(self, a, b):
        """ Computation of long / short

        :param  list a: integral values
        :param  list b: integral values
        :return list z: integral values
        """
        try:
            z = [0 for _ in range(self.n)]
            r = 0
            for i in range(self.l1 + 2):
                w = a[i]
                z[i] = (w + r) // b
                r = ((w + r) % b) * 100000000
            return z
        except Exception as e:
            raise

    def __display(self, tt, s):
        """ Display

        :param float tt: elapsed time
        :param list   s: result of calculation
        """
        try:
            print("** Pi Computation with the Machin formula method **")
            print("   Digits = {:d}.".format(self.L))
            print("   Time   = {:f} seconds".format(tt))
            out_file = open(self.FNAME, "w")
            out_file.write("** Pi Computation with the Machin formula method **\n")
            out_file.write("   Digits = {:d}.\n".format(self.L))
            out_file.write("   Time   = {:f} seconds.\n\n".format(tt))
            out_file.write("          {:d}.\n".format(s[0]))
            for i in range(1, self.l1):
                if i % 10 == 1:
                    out_file.write("{:08d}:".format((i - 1) * 8 + 1))
                out_file.write(" {:08d}".format(s[i]))
                if i % 10 == 0:
                    out_file.write("\n")
            out_file.close
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = CalcPiMachin()
        obj.compute()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute Pi with Machin's formula.](https://gist.github.com/komasaru/876f4ce53843535af91c778899b39e5e "Gist - Python script to compute Pi with Machin's formula.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x calc_pi_machin.py
```

そして、実行。

``` text
$ ./calc_pi_machin.py
** Pi Computation with the Machin formula method **
   Digits = 1000.
   Time   = 0.280194 seconds
```

"pi_machin.txt" という名称のテキストファイルに結果が出力される。

File: `pi_machin.txt`

{% highlight text linenos %}
** Pi Computation with the Machin formula method **
   Digits = 1000.
   Time   = 0.280194 seconds.

          3.
00000001: 14159265 35897932 38462643 38327950 28841971 69399375 10582097 49445923 07816406 28620899
00000081: 86280348 25342117 06798214 80865132 82306647 09384460 95505822 31725359 40812848 11174502
00000161: 84102701 93852110 55596446 22948954 93038196 44288109 75665933 44612847 56482337 86783165
00000241: 27120190 91456485 66923460 34861045 43266482 13393607 26024914 12737245 87006606 31558817
00000321: 48815209 20962829 25409171 53643678 92590360 01133053 05488204 66521384 14695194 15116094
00000401: 33057270 36575959 19530921 86117381 93261179 31051185 48074462 37996274 95673518 85752724
00000481: 89122793 81830119 49129833 67336244 06566430 86021394 94639522 47371907 02179860 94370277
00000561: 05392171 76293176 75238467 48184676 69405132 00056812 71452635 60827785 77134275 77896091
00000641: 73637178 72146844 09012249 53430146 54958537 10507922 79689258 92354201 99561121 29021960
00000721: 86403441 81598136 29774771 30996051 87072113 49999998 37297804 99510597 31732816 09631859
00000801: 50244594 55346908 30264252 23082533 44685035 26193118 81710100 03137838 75288658 75332083
00000881: 81420617 17766914 73035982 53490428 75546873 11595628 63882353 78759375 19577818 57780532
00000961: 17122680 66130019 27876611 19590921 64201989
{% endhighlight %}

---

以上

