---
layout   : single
title    : "Python - 一様乱数の一様性検定（カイ２乗検定）！"
published: true
date     : 2018-01-16 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 で、一様乱数の一様性を「カイ２乗検定」で検定する方法についての記録です。（簡単なアルゴリズムですが）

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 一様乱数の一様性検定（カイ２乗検定）！]({{site.baseurl}}/2012/08/18/18002013 "C++ - 一様乱数の一様性検定（カイ２乗検定）！")
* [Ruby - 一様乱数の一様性検定（カイ２乗検定）！]({{site.baseurl}}/2012/08/19/19002044 "Ruby - 一様乱数の一様性検定（カイ２乗検定）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 必要であれば、スクリプト内の定数を変更する。

File: `chi_2_rndnum.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Test for uniformity of random number with Chi-square algorithm
"""
import math
import sys
import traceback


class Chi2Rndnum:
    A = 1103515245  # Multiplier
    C = 12345       # Increment
    M = 2 ** 31     # Modulus
    N = 1000        # Number to generate
    M_MAX = 10      # Range of integer random number
    F = N / M_MAX   # Expectation
    S = 40.0 / F    # Scale for histgram

    def __init__(self):
        self.r = 12345
        self.hist = [0 for _ in range(self.M_MAX + 1)]
        self.e = 0.0

    def generate_rndnum(self):
        """ Generation of random numbers """
        try:
            for _ in range(self.N):
                self.hist[self.__rnd()] += 1
        except Exception as e:
            raise

    def display(self):
        """ Calculation and display """
        try:
            for i in range(1, self.M_MAX + 1):
                print("{:>3}:{:>3} ".format(i, self.hist[i]), end="")
                for _ in range(int(self.hist[i] * self.S)):
                    print("*", end="")
                print()
                self.e = self.e \
                       + (self.hist[i] - self.F) \
                       * (self.hist[i] - self.F) / self.F
            print("Chi-square =", self.e)
        except Exception as e:
            raise

    def __rnd(self):
        """ Generation of integer between 1 and 10 """
        try:
            self.r = (self.A * self.r + self.C) % self.M
            return math.floor(self.M_MAX * (self.r / (self.M - 0.9))) + 1
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = Chi2Rndnum()
        obj.generate_rndnum()
        obj.display()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to test for uniformity of random number with Chi-square algorithm.](https://gist.github.com/komasaru/c166f03122d0f710f5a497fedd6a8199 "Gist - Python script to test for uniformity of random number with Chi-square algorithm.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x chi_2_rndnum.py
```

そして、実行。

``` text
$ ./chi_2_rndnum.py
  1:105 ******************************************
  2: 89 ***********************************
  3:109 *******************************************
  4: 99 ***************************************
  5:100 ****************************************
  6: 97 **************************************
  7:103 *****************************************
  8:116 **********************************************
  9: 89 ***********************************
 10: 93 *************************************
Chi-2 = 6.72
```

---

以上

