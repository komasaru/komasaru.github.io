---
layout   : single
title    : "Python - 多桁計算！"
published: true
date     : 2018-02-19 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 で多桁計算を行う方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 多桁計算！]({{site.baseurl}}/2013/03/18/cpp-calc-big-digits "C++ - 多桁計算！")
* [Ruby - 多桁計算！]({{site.baseurl}}/2013/03/19/ruby-calc-big-digits "Ruby - 多桁計算！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy を使用しない。（この程度の計算では、逆に2倍程度時間がかかってしまうため）
* 必要であれば、スクリプト内の定数を変更する。

File: `calc_big_digits.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Computation of big-digit values
"""
import sys
import traceback


class CalcBigDigits:
    N = 5

    def __init__(self):
        # a, b: for addition, subtraction
        # c, d: for multiplication, division
        self.a = [56789012,34567890,12345678,90123456,78901234]
        self.b = [12345678,90123456,78901234,56789012,34567890]
        self.c = [      12,34567890,12345678,90123456,78901234]
        self.d = 99

    def compute(self):
        """ Computation of big-digit values """
        try:
            self.__long_add()  # long + long
            self.__long_sub()  # long - long
            self.__long_mul()  # long * short
            self.__long_div()  # long / short
        except Exception as e:
            raise

    def __long_add(self):
        """ Computation of long + long """
        try:
            z = [0 for _ in range(self.N)]
            carry = 0
            for i in reversed(range(self.N)):
                z[i] = self.a[i] + self.b[i] + carry
                if z[i] < 100000000:
                    carry = 0
                else:
                    z[i] = z[i] - 100000000
                    carry = 1
            print(" ", end="")
            self.__display_l(self.a)
            print("+", end="")
            self.__display_l(self.b)
            print("=", end="")
            self.__display_l(z)
            print()
        except Exception as e:
            raise

    def __long_sub(self):
        """ Computation of long - long """
        try:
            z = [0 for _ in range(self.N)]
            borrow = 0
            for i in reversed(range(self.N)):
                z[i] = self.a[i] - self.b[i] - borrow
                if z[i] >= 0:
                    borrow = 0
                else:
                    z[i] += 100000000
                    borrow = 1
            print(" ", end="")
            self.__display_l(self.a)
            print("-", end="")
            self.__display_l(self.b)
            print("=", end="")
            self.__display_l(z)
            print()
        except Exception as e:
            raise

    def __long_mul(self):
        """ Computation of long * short """
        try:
            z = [0 for _ in range(self.N)]
            carry = 0
            for i in reversed(range(self.N)):
                w = self.c[i]
                z[i] = (w * self.d + carry) % 100000000
                carry = int((w * self.d + carry) / 100000000)
            print(" ", end="")
            self.__display_l(self.c)
            print("*", end="")
            self.__display_s(self.d)
            print("=", end="")
            self.__display_l(z)
            print()
        except Exception as e:
            raise

    def __long_div(self):
        """ Computation of long / short """
        try:
            z = [0 for _ in range(self.N)]
            remainder = 0
            for i in range(self.N):
                w = self.c[i]
                z[i] = int((w + remainder) / self.d)
                remainder = ((w + remainder) % self.d) * 100000000
            print(" ", end="")
            self.__display_l(self.c)
            print("/", end="")
            self.__display_s(self.d)
            print("=", end="")
            self.__display_l(z)
            print()
        except Exception as e:
            raise

    def __display_l(self, s):
        """ Display for a long value

        :param int s
        """
        try:
            for i in range(self.N):
                print(" {:08d}".format(s[i]), end="")
            print()
        except Exception as e:
            raise

    def __display_s(self, s):
        """ Display for a short value

        :param int s
        """
        try:
            for _ in range(self.N - 1):
                print(" " * 9, end="")
            print(" {:08d}".format(s))
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = CalcBigDigits()
        obj.compute()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute big-digit values.](https://gist.github.com/komasaru/297bc023f5570298721efcf06b834b1f "Gist - Python script to compute big-digit values.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x calc_big_digits.py
```

そして、実行。

``` text
$ ./calc_big_digits.py
  56789012 34567890 12345678 90123456 78901234
+ 12345678 90123456 78901234 56789012 34567890
= 69134691 24691346 91246913 46912469 13469124

  56789012 34567890 12345678 90123456 78901234
- 12345678 90123456 78901234 56789012 34567890
= 44443333 44444433 33444444 33334444 44333344

  00000012 34567890 12345678 90123456 78901234
*                                     00000099
= 00001222 22221122 22222211 22222222 11222166

  00000012 34567890 12345678 90123456 78901234
/                                     00000099
= 00000000 12470382 72851976 55455792 49281830
```

---

以上

