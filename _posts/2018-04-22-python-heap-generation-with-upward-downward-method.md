---
layout   : single
title    : "Python - ヒープ生成（上方・下方移動）！"
published: true
date     : 2018-04-22 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

今回は、ヒープ（上方移動・下方移動）のアルゴリズムを Python3 で実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - ヒープ生成（上方移動）！]({{site.baseurl}}/2014/04/04/cpp-generation-heap-upward "C++ - ヒープ生成（上方移動）！")
* [C++ - ヒープ生成（下方移動）！]({{site.baseurl}}/2014/04/06/cpp-generation-heap-downward "C++ - ヒープ生成（下方移動）！")
* [Ruby - ヒープ生成（上方・下方移動）！]({{site.baseurl}}/2014/04/07/ruby-generation-heap "Ruby - ヒープ生成（上方・下方移動）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy は使用しない。（この程度の行列計算は List で充分）
* 必要であれば、スクリプト内の定数を変更する。

File: `heap_upward.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Heap generation with the upward method
"""
import random
import sys
import traceback


class Heap:
    N = 100  # Number of data

    def __init__(self):
        self.base = []
        for _ in range(self.N):
            self.base.append(random.randrange(self.N) + 1)
        self.__display(0)
        self.heap = [0 for _ in range(self.N + 1)]

    def generate(self):
        """ Heap generation """
        try:
            for n in range(1, self.N + 1):
                self.heap[n] = self.base[n - 1]
                s = n
                p = int(s / 2)
                while s >= 2 and self.heap[p] > self.heap[s]:
                    w = self.heap[p]
                    self.heap[p] = self.heap[s]
                    self.heap[s] = w
                    s = p
                    p = int(s / 2)
            self.__display(1)
        except Exception as e:
            raise

    def __display(self, k):
        """ Display

        :param int k: 0: list of base,
                      1: list of heap
        """
        try:
            print("#### ", end="")
            if k == 0:
                print("Base")
            else:
                print("Heap")
            for i in range(k, self.N + k):
                if k == 0:
                    print("{:5d} ".format(self.base[i]), end="")
                else:
                    print("{:5d} ".format(self.heap[i]), end="")
                if (i + 1 - k) % 10 == 0 or i == self.N - 1 + k:
                    print()
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = Heap()
        obj.generate()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to generate a heap by the upward method.](https://gist.github.com/komasaru/1d970bea3b8bc875afb3a6790ff94991 "Gist - Python script to generate a heap by the upward method.")

File: `heap_downward.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Heap generation with the downward method
"""
import random
import sys


class Heap:
    N = 100  # Number of data

    def __init__(self):
        self.heap = [0]
        for _ in range(self.N):
            self.heap.append(random.randrange(self.N) + 1)
        self.__display(0)

    def generate(self):
        """ Heap generation """
        try:
            n = self.N
            for i in range(int(n / 2), 0, -1):
                p = i
                s = 2 * p
                while s <= n:
                    if s < n and self.heap[s + 1] < self.heap[s]:
                        s += 1
                    if self.heap[p] <= self.heap[s]:
                        break
                    self.__swap(p, s)
                    p = s
                    s = 2 * p
            self.__display(1)
        except Exception as e:
            raise

    def __swap(self, a, b):
        """ Swapping

        :param int a: index of heap list
        :param int b: index of heap list
        """
        try:
            w = self.heap[a]
            self.heap[a] = self.heap[b]
            self.heap[b] = w
        except Exception as e:
            raise

    def __display(self, k):
        """ Display

        :param int k: 0: list of tree,
                      1: list of heap
        """
        try:
            print("#### ", end="")
            if k == 0:
                print("Tree")
            else:
                print("Heap")
            for i in range(1, self.N + 1):
                print("{:5d} ".format(self.heap[i]), end="")
                if i % 10 == 0 or i == self.N:
                    print()
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = Heap()
        obj.generate()
    except Exception as e:
        print("EXCEPTION!", e.args, file=sys.stderr)
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to generate a heap by the downward method.](https://gist.github.com/komasaru/5ada928b50296cd0f98337e4cbc1a1a0 "Gist - Python script to generate a heap by the downward method.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x heap_upward.py
$ chmod +x heap_downward.py
```

そして、実行。

``` text
$ ./heap_upward.py
#### Base
   31     6    16    22    45     5    62    78    90    14
   51     7    84    39    46    47    71    12    97    33
   87    66    98    79    47     1    29    51    93    10
   14    41    55    97    14    28    32    40    97    29
   83    76    98    83    58    28    62    96    76    25
   37    40    26    11    88    23    79    15    16    61
   54    34    25     6    65    18    50    96    70    95
   78    34    92    83    56    83    85    37     2    69
   38    84     1    26    75    10    51    60    73    37
   89    50    25    11    48    50    55    26    69    16
#### Heap
    1     1     5     6     2     6    10    14    12    10
   11    16     7    15    14    14    41    31    28    29
   22    37    25    26    16    26    11    51    16    46
   25    47    18    70    71    34    32    83    37    38
   33    75    26    60    58    50    28    55    50    25
   37    84    40    29    88    62    79    93    23    61
   54    39    34    78    65    55    50    97    96    95
   78    90    92    83    56    97    85    97    40    69
   45    84    83    87    76    98    51    83    73    66
   89    98    51    62    48    96    76    79    69    47

$ ./heap_downward.py
#### Tree
   35    89    14    86    95    49    69     3   100    84
   62    98    78    34    19    17    59    77    41    39
  100    27     2    32    43    18    78    91    34    93
   12     8    66    69    11    12    73    63    20    43
   70    29    73    82    56    62    40    56    71    71
   85    25    32    72    13    13    14    90     5    98
   47    64    61     8    89     8    31    74    38    79
   75    65    70    37    12    85    88    58    65    72
   28     9     5    57    40    87    92    29    98    77
   82    20    63    52     1    61    47    96    14    92
#### Heap
    1     2     5     3     5    13    12     8    12     9
   20    14    18    13    14     8    11    12    20    28
   29    27    40    32    43    25    72    14    34    47
   19    17     8    38    59    65    37    63    41    35
   39    40    73    29    56    62    52    47    71    71
   85    49    32    78    78    91    69    90    34    98
   93    64    61    86    89    66    31    74    69    79
   75    77    70   100    73    85    88    58    65    72
   43    84    70    57   100    87    92    82    98    77
   82    95    63    89    62    61    56    96    98    92
```

---

以上

