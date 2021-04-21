---
layout   : single
title    : "Python - 一様乱数（線形合同法）！"
published: true
date     : 2018-01-13 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 で線形合同法を使って一様乱数を生成する方法についての記録です。（簡単なアルゴリズムですが）

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 一様乱数（線形合同法）！]({{site.baseurl}}/2012/08/13/13002033 "C++ - 一様乱数（線形合同法）！")
* [Ruby - 一様乱数（線形合同法）！]({{site.baseurl}}/2012/08/14/14002016 "Ruby - 一様乱数（線形合同法）！")
* [Fortran - 一様乱数（線形合同法）！]({{site.baseurl}}/2017/05/02/fortran-calc-random-number-by-lcg "Fortran - 一様乱数（線形合同法）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 必要であれば、スクリプト内の定数を変更する。

File: `rndnum_lcgs.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Random number generatrion with LCG algorithm
"""
import sys
import traceback


class RndnumLcgs:
    A = 1103515245  # Multiplier
    C = 12345       # Increment
    M = 2 ** 31     # Modulus
    N = 1000        # Number to generate

    def __init__(self):
        self.r = self.C  # Initialization of seed

    def generate_rndnum(self):
        try:
            for i in range(self.N):
                self.r = (self.A * self.r + self.C) % self.M
                print("{:>10} ".format(self.r), end="")
                if i % 5 == 4:
                    print()
            print()
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = RndnumLcgs()
        obj.generate_rndnum()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to generate random numbers with LCGs algorithm.](https://gist.github.com/komasaru/df06b72faae10a71515d4ceccc2802f8 "Gist - Python script to generate random numbers with LCGs algorithm.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x rndnum_lcgs.py
```

そして、実行。

``` text
$ ./rndnum_lcgs.py
1406932606  654583775 1449466924  229283573 1109335178
1051550459 1293799192  794471793  551188310  803550167
1772930244  370913197  639546082 1381971571 1695770928
                          :
                    ===< 中略 >===
                          :
 314175751 1392898612  831268957  568833490 2071631523
1378483616  283635033  149380382 1813379583 1371624396
1386284565 1202203946 1490695963 1268113592 1603858065

```

---

以上

