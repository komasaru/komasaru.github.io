---
layout   : single
title    : "Python - 正規乱数（ボックス＝ミューラー法）！"
published: true
date     : 2018-01-19 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 で Box-Muller 法を使って正規乱数を生成する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 正規乱数（ボックス＝ミューラー法）！]({{site.baseurl}}/2012/08/31/31002021 "C++ - 正規乱数（ボックス＝ミューラー法）！")
* [Ruby - 正規乱数（ボックス＝ミューラー法）！]({{site.baseurl}}/2012/09/02/02002000 "Ruby - 正規乱数（ボックス＝ミューラー法）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 必要であれば、スクリプト内の定数を変更する。

File: `rndnum_box_muller.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Random number generatrion with Box-Muller algorithm
"""
import math
import random
import sys
import traceback


class RndnumBoxMuller:
    M     = 10        # Average
    S     = 2.5       # Standard deviation
    N     = 10000     # Number to generate
    SCALE = N // 100  # Scale for histgram

    def __init__(self):
        self.hist = [0 for _ in range(self.M * 5)]

    def generate_rndnum(self):
        """ Generation of random numbers """
        try:
            for _ in range(self.N):
                res = self.__rnd()
                self.hist[res[0]] += 1
                self.hist[res[1]] += 1
        except Exception as e:
            raise

    def display(self):
        """ Display """
        try:
            for i in range(0, self.M * 2 + 1):
                print("{:>3}:{:>4} | ".format(i, self.hist[i]), end="")
                for j in range(1, self.hist[i] // self.SCALE + 1):
                    print("*", end="")
                print()
        except Exception as e:
            raise

    def __rnd(self):
        """ Generation of random integers """
        try:
            r_1 = random.random()
            r_2 = random.random()
            x = self.S \
              * math.sqrt(-2 * math.log(r_1)) \
              * math.cos(2 * math.pi * r_2) \
              + self.M
            y = self.S \
              * math.sqrt(-2 * math.log(r_1)) \
              * math.sin(2 * math.pi * r_2) \
              + self.M
            return [math.floor(x), math.floor(y)]
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = RndnumBoxMuller()
        obj.generate_rndnum()
        obj.display()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to generate random numbers with Box-Muller algorithm.](https://gist.github.com/komasaru/832dc945e9d4e175e328fa9779c7a18b "Gist - Python script to generate random numbers with Box-Muller algorithm.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x rndnum_box_muller.py
```

そして、実行。

``` text
$ ./rndnum_box_muller.py
  0:   3 |
  1:   6 |
  2:  39 |
  3:  99 |
  4: 296 | **
  5: 656 | ******
  6:1227 | ************
  7:1957 | *******************
  8:2562 | *************************
  9:3077 | ******************************
 10:3177 | *******************************
 11:2662 | **************************
 12:1914 | *******************
 13:1192 | ***********
 14: 666 | ******
 15: 291 | **
 16: 130 | *
 17:  32 |
 18:  10 |
 19:   4 |
 20:   0 |
```

---

以上

