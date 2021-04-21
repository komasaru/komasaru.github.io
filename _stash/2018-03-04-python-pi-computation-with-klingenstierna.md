---
layout   : single
title    : "Python - 円周率計算（Klingenstierna の公式）！"
published: true
date     : 2018-03-04 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
- 円周率
---

Python 3 で Klingenstierna の公式を利用して円周率を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 円周率計算（Klingenstierna の公式）！]({{site.baseurl}}/2013/04/02/cpp-calc-pi-with-klingenstierna "C++ - 円周率計算（Klingenstierna の公式）！")
* [Ruby - 円周率計算（Klingenstierna の公式）！]({{site.baseurl}}/2013/04/03/ruby-calc-pi-with-klingenstierna "Ruby - 円周率計算（Klingenstierna の公式）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy を使用しない。（この程度の計算では、逆に2倍程度時間がかかってしまうため）
* 必要であれば、スクリプト内の定数を変更する。
* 多桁計算のアルゴリズムは自前で実装。

File: `calc_pi_klingenstierna.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Computation of Pi with Klingenstierna's formula
"""
import sys
import time
import traceback


class CalcPiKlingenstierna:
    L     = 10000  # Digits of computation
    FNAME = "pi_klingenstierna.txt"

    def __init__(self):
        self.l1 = int(self.L / 8) + 1
        self.n  = int((self.L + 1) / 2) + 1

    def compute(self):
        """ Computation of Pi """
        try:
            t0 = time.time()
            s = [0 for _ in range(self.l1 + 2)]
            a = [0 for _ in range(self.l1 + 2)]
            b = [0 for _ in range(self.l1 + 2)]
            c = [0 for _ in range(self.l1 + 2)]
            q = [0 for _ in range(self.l1 + 2)]
            a[0] = 32 *  10
            b[0] =  4 * 239
            c[0] = 16 * 515
            for k in range(1, self.n + 1):
                a = self.__long_div(a,  10 *  10)
                b = self.__long_div(b, 239 * 239)
                c = self.__long_div(c, 515 * 515)
                q = self.__long_sub(a,         b)
                q = self.__long_sub(q,         c)
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

        :param  list a
        :param  list b
        :return list z
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

        :param  list a
        :param  list b
        :return list z
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

        :param  list a
        :param  list b
        :return list z
        """
        try:
            z = [0 for _ in range(self.n)]
            r = 0
            for i in range(self.l1 + 2):
                w = a[i]
                z[i] = int((w + r) / b)
                r = ((w + r) % b) * 100000000
            return z
        except Exception as e:
            raise

    def __display(self, tt, s):
        """ Display

        :param float tt
        :param list   s
        """
        try:
            print("** Pi Computation with the Klingenstierna formula method **")
            print("   Digits = {:d}.".format(self.L))
            print("   Time   = {:f} seconds".format(tt))
            out_file = open(self.FNAME, "w")
            out_file.write("** Pi Computation with the Klingenstierna formula method **\n")
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
        obj = CalcPiKlingenstierna()
        obj.compute()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute Pi with Klingenstierna's formula.](https://gist.github.com/komasaru/08b50450250b3ac58bd1c0a549c779e5 "Gist - Python script to compute Pi with Klingenstierna's formula.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x calc_pi_klingenstierna.py
```

そして、実行。

``` text
$ ./calc_pi_klingenstierna.py
** Pi Computation with the Klingenstierna formula method **
   Digits = 10000.
   Time   = 24.730267 seconds
```

"pi_klingenstierna.txt" という名称のテキストファイルに結果が出力される。

File: `pi_klingenstierna.txt`

{% highlight text linenos %}
** Pi Computation with the Klingenstierna formula method **
   Digits = 10000.
   Time   = 24.730267 seconds

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

