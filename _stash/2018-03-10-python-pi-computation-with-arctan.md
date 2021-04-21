---
layout   : single
title    : "Python - 円周率計算（Arctan 系公式）！"
published: true
date     : 2018-03-10 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
- 円周率
---

Python 3 で $$\arctan$$ 系の公式を利用して円周率を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 円周率計算（マチンの公式）！]({{site.baseurl}}/2013/03/21/cpp-calc-pi-with-machin/ "C++ - 円周率計算（マチンの公式）！")
* [C++ - 円周率計算（Klingenstierna の公式）！]({{site.baseurl}}/2013/04/02/cpp-calc-pi-with-klingenstierna/ "C++ - 円周率計算（Klingenstierna の公式）！")
* [C++ - 円周率計算（オイラーの公式）！]({{site.baseurl}}/2013/04/05/cpp-calc-pi-with-euler/ "C++ - 円周率計算（オイラーの公式）！")
* [C++ - 円周率計算（オイラーの公式(2)）！]({{site.baseurl}}/2013/04/08/cpp-calc-pi-with-euler-2/ "C++ - 円周率計算（オイラーの公式(2)）！")

これら以外に「Gauß の公式」、「Störmer の公式」２つ、「高野喜久雄の公式」もある。（アルゴリズムは8つとも同じ。計算する際の係数が異なるだけ）

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy を使用しない。（この程度の計算では、逆に2倍程度時間がかかってしまうため）
* 多桁計算のアルゴリズムは自前で実装。

File: `calc_pi_arctan.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Computation of Pi with arctan's formula

Formulas: 1: Machin
          2: Klingenstierna
          3: Euler
          4: Euler(2)
          5: Gauss
          6: Stormer
          7: Stormer(2)
          8: Takano
"""
import math
import sys
import time


class CalcPiArctan:
    FORMULA = [
      "Machin", "Klingenstierna", "Euler",    "Euler2",
      "Gauss",  "Stormer",        "Stormer2", "Takano"
    ]  # Formula names
    KK = [                                                    # Coefficients
      [ 16, 1,  5,  -4, 1, 239                            ],  #   1: Machin
      [ 32, 1, 10,  -4, 1, 239, -16, 1, 515               ],  #   2: Klingenstierna
      [ 20, 1,  7,   8, 3,  79                            ],  #   3: Euler
      [ 16, 1,  5,  -4, 1,  70,   4, 1,  99               ],  #   4: Euler(2)
      [ 48, 1, 18,  32, 1,  57, -20, 1, 239               ],  #   5: Gauss
      [ 24, 1,  8,   8, 1,  57,   4, 1, 239               ],  #   6: Stormer
      [176, 1, 57,  28, 1, 239, -48, 1, 682, 96, 1,  12943],  #   7: Stormer(2)
      [ 48, 1, 49, 128, 1,  57, -20, 1, 239, 48, 1, 110443]   #   8: Takano
    ]
    # File name
    FILE_PRE = "PI_"   # Prefix
    FILE_EXT = ".txt"  # Extension
    # Output strings
    STR_TITLE   = "** Pi Computation by Arctan method **"
    STR_FORMULA = "   Formula = [ {:s} ]"
    STR_DIGITS  = "   Digits  = {:d}"
    STR_TIME    = "   Time    = {:f} seconds"
    # Multi-digit computation
    MAX_DIGITS = 100000000  # 8-digits per 1 item

    def __init__(self, x, y):
        self.fname = self.FILE_PRE + self.FORMULA[x - 1] + self.FILE_EXT
        print("\n[ Output file :", self.fname, "]\n")
        self.formula = self.FORMULA[x - 1]
        self.ks      = int(len(self.KK[x-1]) / 3)
        self.kk      = self.KK[x - 1]
        self.l       = y
        self.l1      = int(self.l / 8) + 1
        self.n       = []
        for i in range(0, self.ks):
            n  = self.l / (math.log10(self.kk[i * 3 + 2]) \
               - math.log10(self.kk[i * 3 + 1])) + 1
            self.n.append(int(n / 2) + 1)

    def compute(self):
        """ Computation and display """
        try:
            t0 = time.time()
            a  = [[0 for _ in range(self.l1 + 2)] for _ in range(self.ks)]
            q  = [[0 for _ in range(self.l1 + 2)] for _ in range(self.ks)]
            sk = [[0 for _ in range(self.l1 + 2)] for _ in range(self.ks)]
            s  =  [0 for _ in range(self.l1 + 2)]
            for i in range(self.ks):
                a[i][0] = self.kk[i * 3] * self.kk[i * 3 + 2]
                if self.kk[i * 3] < 0:
                    a[i][0] *= -1
                if self.kk[i * 3 + 1] != 1:
                    a[i] = self.__long_div(a[i], self.kk[i * 3 + 1])
            for i in range(self.ks):
                for k in range(1, self.n[i] + 1):
                    a[i] = self.__long_div(a[i], self.kk[i * 3 + 2])
                    a[i] = self.__long_div(a[i], self.kk[i * 3 + 2])
                    if self.kk[i * 3 + 1] != 1:
                        a[i] = self.__long_mul(a[i], self.kk[i * 3 + 1])
                        a[i] = self.__long_mul(a[i], self.kk[i * 3 + 1])
                    q[i] = self.__long_div(a[i], 2 * k - 1)
                    if k % 2 == 0:
                        sk[i] = self.__long_sub(sk[i], q[i])
                    else:
                        sk[i] = self.__long_add(sk[i], q[i])
            for i in range(self.ks):
                if self.kk[i * 3] >= 0:
                    s = self.__long_add(s, sk[i])
                else:
                    s = self.__long_sub(s, sk[i])
            t1 = time.time()
            tt = t1 - t0
            self.__display(tt, s)
        except Exception as e:
            raise

    def __long_add(self, a, b):
        """ Computation of long + long

        :param  list a
        :param  list b
        :return list z
        """
        try:
            z = [0 for _ in range(self.l1 + 2)]
            cr = 0
            for i in reversed(range(self.l1 + 2)):
                z[i] = a[i] + b[i] + cr
                if z[i] < self.MAX_DIGITS:
                    cr = 0
                else:
                    z[i] -= self.MAX_DIGITS
                    cr = 1
            return z
        except Exception as e:
            raise

    def __long_sub(self, a, b):
        """ Computation of long - long

        :param  list a
        :param  list b
        :return list z
        """
        try:
            z = [0 for _ in range(self.l1 + 2)]
            br = 0
            for i in reversed(range(self.l1 + 2)):
                z[i] = a[i] - b[i] - br
                if z[i] >= 0:
                    br = 0
                else:
                    z[i] += self.MAX_DIGITS
                    br = 1
            return z
        except Exception as e:
            raise

    def __long_mul(self, a, b):
        """ Computation of long * short

        :param  list a
        :param  list b
        :return list z
        """
        try:
            z = [0 for _ in range(self.l1 + 2)]
            cr = 0
            for i in reversed(range(self.l1 + 2)):
                w = a[i]
                z[i] = (w * b + cr) % self.MAX_DIGITS
                cr = int((w * b + cr) / self.MAX_DIGITS)
            return z
        except Exception as e:
            raise

    def __long_div(self, a, b):
        """ Computation of long / short

        :param  list a
        :param  list b
        :return list z
        """
        try:
            z = [0 for _ in range(self.l1 + 2)]
            r = 0
            for i in range(self.l1 + 2):
                w = a[i]
                z[i] = int((w + r) / b)
                r = ((w + r) % b) * self.MAX_DIGITS
            return z
        except Exception as e:
            raise

    def __display(self, tt, s):
        """ Display

        :param float tt: elapsed time
        :param list   s: result of calculation
        """
        try:
            print(self.STR_TITLE)
            print(self.STR_FORMULA.format(self.formula))
            print(self.STR_DIGITS.format(self.l))
            print(self.STR_TIME.format(tt))
            out_file = open(self.fname, "w")
            out_file.write(self.STR_TITLE)
            out_file.write("\n")
            out_file.write(self.STR_FORMULA.format(self.formula))
            out_file.write("\n")
            out_file.write(self.STR_DIGITS.format(self.l))
            out_file.write("\n")
            out_file.write(self.STR_TIME.format(tt))
            out_file.write("\n\n          {:d}.\n".format(s[0]))
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
        print("1:Machin, 2:Klingenstierna, 3:Euler, 4:Euler(2)")
        print("5:Gauss, 6:Stormer, 7:Stormer(2), 8:Takano : ", end="")
        f = int(input())
        if f < 1 or f > 8:
            f = 1
        print("Please input number of Pi Decimal-Digits : ", end="")
        n = int(input())
        obj = CalcPiArctan(f, n)
        obj.compute()
    except Exception as e:
        print("EXCEPTION!", e.args, file=sys.stderr)
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute Pi with arctan's formula.](https://gist.github.com/komasaru/290022bcc86f380d771e687ddc3ea5f7 "Gist - Python script to compute Pi with arctan's formula.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x calc_pi_arctan.py
```

そして、実行。

``` text
$ ./calc_pi_arctan.py
1:Machin, 2:Klingenstierna, 3:Euler, 4:Euler(2)
5:Gauss, 6:Stormer, 7:Stormer(2), 8:Takano : 8
Please input number of Pi Decimal-Digits : 10000

[ Output file : PI_Takano.txt ]

** Pi Computation by Arctan method **
   Formula = [ Takano ]
   Digits  = 10000
   Time    = 23.749447 seconds
```

公式別にテキストファイルができているはずである。

File: `PI_Takano.txt`

{% highlight text linenos %}
** Pi Computation by Arctan method **
   Formula = [ Takano ]
   Digits  = 10000
   Time    = 23.749447 seconds

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
00000961: 17122680 66130019 27876611 19590921 64201989 38095257 20106548 58632788 65936153 38182796
        :
===< 途中省略 >===
        :
00009121: 37800297 41207665 14793942 59029896 95946995 56576121 86561967 33786236 25612521 63208628
00009201: 69222103 27488921 86543648 02296780 70576561 51446320 46927906 82120738 83778142 33562823
00009281: 60896320 80682224 68012248 26117718 58963814 09183903 67367222 08883215 13755600 37279839
00009361: 40041529 70028783 07667094 44745601 34556417 25437090 69793961 22571429 89467154 35784687
00009441: 88614445 81231459 35719849 22528471 60504922 12424701 41214780 57345510 50080190 86996033
00009521: 02763478 70810817 54501193 07141223 39086639 38339529 42578690 50764310 06383519 83438934
00009601: 15961318 54347546 49556978 10382930 97164651 43840700 70736041 12373599 84345225 16105070
00009681: 27056235 26601276 48483084 07611830 13052793 20542746 28654036 03674532 86510570 65874882
00009761: 25698157 93678976 69742205 75059683 44086973 50201410 20672358 50200724 52256326 51341055
00009841: 92401902 74216248 43914035 99895353 94590944 07046912 09140938 70012645 60016237 42880210
00009921: 92764579 31065792 29552498 87275846 10126483 69998922 56959688 15920560 01016552 56375678
{% endhighlight %}

---

以上

