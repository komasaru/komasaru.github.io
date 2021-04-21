---
layout   : single
title    : "Python - ネイピア数（自然対数の底）e 計算！"
published: true
date     : 2018-02-25 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 でネイピア数（自然対数の底）$$e$$ を多桁計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - ネイピア数（自然対数の底）e 計算！]({{site.baseurl}}/2013/03/24/cpp-calc-napier "C++ - ネイピア数（自然対数の底）e 計算！")
* [Ruby - ネイピア数（自然対数の底）e 計算！]({{site.baseurl}}/2013/03/25/ruby-calc-napier "Ruby - ネイピア数（自然対数の底）e 計算！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy を使用しない。（この程度の計算では、逆に2倍程度時間がかかってしまうため）
* 必要であれば、スクリプト内の定数を変更する。
* 多桁計算のアルゴリズムは自前で実装。

File: `calc_napier.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Computation of Napier's constant
"""
import sys
import traceback


class CalcNapier:
    L  = 1000            # Digits of computation
    L1 = int(L / 8) + 1  # Length of list
    L2 = L1 + 1          # Length of list + 1
    N  = 451             # Number of items

    def compute(self):
        """ Computation of Napier's constant """
        try:
            s = [0 for _ in range(self.L2 + 1)]
            a = [0 for _ in range(self.L2 + 1)]
            s[0], a[0] = 1, 1
            for k in range(1, self.N + 1):
                a = self.__long_div(a, k)
                s = self.__long_add(s, a)
            self.__display(s)
        except Exception as e:
            raise

    def __long_add(self, a, b):
        """ Computation of long + long

        :param  list a: integral values
        :param  list b: integral values
        :return list z: integral values
        """
        try:
            z = [0 for _ in range(self.N)]
            carry = 0
            for i in reversed(range(self.L2 + 1)):
                z[i] = a[i] + b[i] + carry
                if z[i] < 100000000:
                    carry = 0
                else:
                    z[i] -= 100000000
                    carry = 1
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
            z = [0 for _ in range(self.N)]
            r = 0
            for i in range(self.L2 + 1):
                w = a[i]
                z[i] = int(int(w + r) / b)
                r = ((w + r) % b) * 100000000
            return z
        except Exception as e:
            raise

    def __display(self, s):
        """ Display

        :param list s: integral values
        """
        try:
            print("{:7d}. ".format(s[0]), end="")
            for i in range(1, self.L1):
                print("{:08d} ".format(s[i]), end="")
            print()
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = CalcNapier()
        obj.compute()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute Napier constant.](https://gist.github.com/komasaru/1c22f124ef5ac30406148b4cd9c82f39 "Gist - Python script to compute Napier constant.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x calc_napier.py
```

そして、実行。

``` text
$ ./calc_napier.py
      2. 71828182 84590452 35360287 47135266 24977572 47093699 95957496 
69676277 24076630 35354759 45713821 78525166 42742746 63919320 03059921 
81741359 66290435 72900334 29526059 56307381 32328627 94349076 32338298 
80753195 25101901 15738341 87930702 15408914 99348841 67509244 76146066 
80822648 00168477 41185374 23454424 37107539 07774499 20695517 02761838 
60626133 13845830 00752044 93382656 02976067 37113200 70932870 91274437 
47047230 69697720 93101416 92836819 02551510 86574637 72111252 38978442 
50569536 96770785 44996996 79468644 54905987 93163688 92300987 93127736 
17821542 49992295 76351482 20826989 51936680 33182528 86939849 64651058 
20939239 82948879 33203625 09443117 30123819 70684161 40397019 83767932 
06832823 76464804 29531180 23287825 09819455 81530175 67173613 32069811 
25099618 18815930 41690351 59888851 93458072 73866738 58942287 92284998 
92086805 82574927 96104841 98444363 46324496 84875602 33624827 04197862 
32090021 60990235 30436994 18491463 14093431 73814364 05462531 52096183 
69088870 70167683 96424378 14059271 45635490 61303107 20851038 37505101 
15747704 17189861 06873969 65521267 15468895 70350354
```

---

以上

