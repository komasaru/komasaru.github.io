---
layout   : single
title    : "Python - 多桁計算（その２）！"
published: true
date     : 2018-03-13 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

以前、 Python 3 で多桁計算を行う方法を紹介しました。

* [Python - 多桁計算！]({{site.baseurl}}/2018/02/19/python-big-digits-computation "Python - 多桁計算！")

今回はその改良版です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 多桁計算（その２）！]({{site.baseurl}}/2013/04/19/cpp-calc-big-digits-2 "C++ - 多桁計算（その２）！")
* [Ruby - 多桁計算（その２）！]({{site.baseurl}}/2013/04/20/ruby-calc-big-digits-2 "Ruby - 多桁計算（その２）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy を使用しない。（この程度の計算では、逆に2倍程度時間がかかってしまうため）
* 必要であれば、スクリプト内の定数を変更する。

File: `calc_big_digits_2.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Computation of big-digit values (Ver.2)
"""
import random
import sys
import traceback


class CalcBigDigits:
    N_A = 1000
    N_B = 996
    LIMIT = 4
    RANGE = 10**LIMIT
    SIZE_A = int((N_A-1) / LIMIT) + 1
    SIZE_B = int((N_B-1) / LIMIT) + 1

    def __init__(self):
        self.a = [random.randrange(self.RANGE) for _ in range(self.SIZE_A)]
        self.b = [random.randrange(self.RANGE) for _ in range(self.SIZE_B)]
        self.c =  random.randrange(self.RANGE)
        print("A =")
        self.__display(self.a)
        print("B =")
        self.__display(self.b)
        print("C =\n{:04d}\n\n".format(self.c))

    def compute_add(self):
        """ Addition """
        try:
            print("A + B =")
            self.__display(self.__long_add(self.a, self.b))
        except Exception as e:
            raise

    def compute_sub(self):
        """ Subtraction """
        try:
            print("A - B =")
            self.__display(self.__long_sub(self.a, self.b))
        except Exception as e:
            raise

    # 計算 ( 乗算 )
    def compute_mul(self):
        """ Multiplication """
        try:
            print("A * C =")
            self.__display(self.__long_mul(self.a, self.c))
        except Exception as e:
            raise

    # 計算 ( 除算 )
    def compute_div(self):
        """ Division """
        try:
            print("A / C =")
            self.__display(self.__long_div(self.a, self.c))
        except Exception as e:
            raise

    def __long_add(self, a, b):
        """ Computation of long + long

        :param  list a
        :param  list b
        :return list z
        """
        try:
            z = [0 for _ in range(max(len(a), len(b)) + 1)]
            for i in range(len(a)):
                z[i] = a[i]
            for i in range(len(b)):
                z[i] += b[i]
                if z[i] >= 10**self.LIMIT:
                    z[i] -= 10**self.LIMIT
                    z[i + 1] += 1
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
            z = [0 for _ in range(max(len(a), len(b)))]
            for i in range(len(a)):
                z[i] = a[i]
            for i in range(len(b)):
                z[i] -= b[i]
                if z[i] < 0:
                    z[i] += 10**self.LIMIT
                    z[i + 1] -= 1
            return z
        except Exception as e:
            raise

    def __long_mul(self, a, c):
        """ Computation of long * short

        :param  list a
        :param  list b
        :return list z
        """
        try:
            z = [0 for _ in range(len(a) + 1)]
            for i in range(len(a)):
                z[i] += a[i] * c
                if z[i] >= 10**self.LIMIT:
                    z[i + 1] += int(z[i] / 10**self.LIMIT)
                    z[i] %= 10**self.LIMIT
            return z
        except Exception as e:
            raise

    def __long_div(self, a, c):
        """ Computation of long / short

        :param  list a
        :param  list b
        :return list z
        """
        try:
            z = [0 for _ in range(len(a))]
            for i in reversed(range(len(a))):
                z[i] += int(a[i] / c)
                if i > 0:
                    a[i - 1] += (a[i] % c) * 10**self.LIMIT
            return z
        except Exception as e:
            raise

    def __display(self, s):
        """ Display

        :param  list s
        """
        try:
            size = len(s)
            if s[size - 1] == 0:
                size -= 1
            for i in reversed(range(size)):
                print("{:04d} ".format(s[i]), end="")
                if (size - i) % 10 == 0 and i != 0:
                    print()
            print("\n")
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = CalcBigDigits()
        obj.compute_add()
        obj.compute_sub()
        obj.compute_mul()
        obj.compute_div()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute big-digit values.(v2)](https://gist.github.com/komasaru/43c50d3f50b7baa5296f3d85da4deb5f "Gist - Python script to compute big-digit values.(v2)")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x calc_big_digits_2.py
```

そして、実行。

``` text
$ ./calc_big_digits_2.py
A =
4099 5640 2306 3387 7913 8073 4827 5311 9874 6122
6769 9412 5626 6028 7805 0108 6658 6159 0658 1661
0433 6462 9924 7261 8630 4304 1666 0165 9021 6910
9162 0702 4146 5326 2994 4416 5252 5269 6229 2304
 ---< 途中省略 >---
7087 9478 4503 8093 2139 8126 2780 4947 8607 8261
9728 5060 6177 1939 9567 9046 3852 8949 2890 3043
4448 5525 2677 3836 9395 2423 0220 9490 0630 4487
5154 8610 9049 0698 6697 6947 3919 9510 2559 5474

B =
9340 7370 1831 7562 4559 2419 9614 0734 9203 2275
0962 7844 3019 2928 5936 5727 4566 9926 9720 7950
2468 4314 9800 8092 6529 9314 2127 2835 5527 0734
3251 5143 0801 7004 3486 9874 5407 9562 0674 4537
 ---< 途中省略 >---
7626 6646 5134 4249 5754 4515 9821 6929 9567 0233
6349 2579 5409 6974 2750 3457 6046 7234 2261 3675
5632 2258 0597 8003 9226 7030 2072 4437 5867 8464
5730 1298 6182 2091 0157 9887 7813 7704 2595

C =
8498

A + B =
4100 4980 9676 5219 5476 2632 7247 4926 0609 5325
9045 0375 3470 9048 0733 6045 2386 0726 0585 1381
8383 8931 4239 7062 6723 0834 0980 2293 1857 2437
9896 3953 9289 6127 9998 7903 5127 0677 5791 2979
 ---< 途中省略 >---
3476 7105 1150 3227 6389 3880 7296 4769 5537 7828
9962 1409 8756 7349 6542 1796 7310 4996 0124 5304
8124 1157 4935 4434 7399 1649 7251 1562 5068 0355
3619 4341 0347 6880 8788 7105 3807 7324 0263 8069

A - B =
4098 6299 4936 1556 0351 3514 2407 5697 9139 6919
4494 8449 7782 3009 4876 4172 0931 1592 0731 1940
2483 3994 5609 7461 0537 7774 2351 8038 6186 1383
8427 7450 9003 4524 5990 0929 5377 9861 6667 1630
 ---< 途中省略 >---
0699 1851 7857 2958 7890 2371 8264 5126 1677 8694
9494 8711 3597 6530 2593 6296 0395 2902 5656 0782
0772 9893 0419 3239 1391 3196 3190 7417 6192 8619
6690 2880 7750 4516 4606 6789 4032 1696 4855 2879

A * C =
3483 8095 0679 9266 9451 1534 8456 4360 1269 4455
0509 0960 7957 4871 2576 6982 3442 4917 9741 3095
5546 5126 2510 0323 1312 1397 6807 7808 9836 6330
8965 9272 9119 7234 2892 6765 1631 5974 1255 6000
 ---< 途中省略 >---
0245 2844 5129 3794 5752 8053 6182 1901 1058 1806
3194 3799 3725 2406 6312 0769 0841 7624 6555 7553
4906 6009 5469 8995 7295 7009 8937 1743 8155 1033
8052

A / C =
4824 1515 9221 3918 3235 8288 4005 0967 2716 6536
4520 9946 5317 2545 0464 8280 3787 4981 2494 9000
9924 2719 4545 4532 6700 9065 8585 5690 6356 4263
2574 8061 2081 1162 9788 7051 6889 2997 9088 2919
 ---< 途中省略 >---
8947 9263 8860 6840 6848 4497 8560 2433 3499 4424
5385 3919 2959 7481 7095 6750 2768 7631 5474 5873
6701 0502 7862 3013 5791 0594 2834 7246 4851 0811
3856 0379 9775 3234 4901 9707 4511 5921 6944
```

---

以上

