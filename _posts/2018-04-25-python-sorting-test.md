---
layout   : single
title    : "Python - ソート処理各種テスト！"
published: true
date     : 2018-04-25 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

今回は、各種ソート処理のアルゴリズムを Python3 で実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - ソート処理各種テスト！]({{site.baseurl}}/2014/04/10/cpp-sort-test "C++ - ソート処理各種テスト！")
* [Ruby - ソート処理各種テスト！]({{site.baseurl}}/2014/04/11/ruby-sort-test "Ruby - ソート処理各種テスト！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy は使用しない。（この程度の行列計算は List で充分）
* 必要であれば、スクリプト内の定数を変更する。

File: `sort_test.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Test of sorting algorithms
"""
import copy
import random
import sys
import time
import traceback


class SortTest:
    N = 100    # Number of data
    M = 10000  # Maximum value ( < M )
    L = 10000  # Count of sort trying

    def __init__(self):
        self.base = [random.randrange(self.N) + 1 for _ in range(self.N)]
        print("#### Base list")
        self.__display_list(self.base)

    def exec(self):
        """ Execution of test """
        try:
            self.__sort_bubble()
            self.__sort_selection()
            self.__sort_insertion()
            self.__sort_quick()
            self.__sort_heap_up()
            self.__sort_heap_down()
            self.__sort_shell()
        except Exception as e:
            raise

    def __sort_bubble(self):
        """ Basic exchange method (Bubble sort) """
        print("1  : Bubble Sort      ", end="")
        try:
            t1 = time.time()
            for l in range(self.L):
                self.a = copy.deepcopy(self.base)
                for i in range(self.N - 1):
                    for j in reversed(range(i + 1, self.N)):
                        if self.a[j] < self.a[j - 1]:
                            self.a[j - 1], self.a[j] \
                                    = self.a[j], self.a[j - 1]
            t2 = time.time()
            self.__display(self.a, t2 - t1)
        except Exception as e:
            raise

    def __sort_selection(self):
        """ Basic exchange method (Selection sort) """
        print("2  : Selection Sort   ", end="")
        try:
            t1 = time.time()
            for l in range(self.L):
                self.a = copy.deepcopy(self.base)
                for i in range(self.N - 1):
                    min, s = self.a[i], i
                    for j in range(i + 1, self.N):
                        if self.a[j] < min:
                            min, s = self.a[j], j
                    self.a[i], self.a[s] = self.a[s], self.a[i]
            t2 = time.time()
            self.__display(self.a, t2 - t1)
        except Exception as e:
            raise

    def __sort_insertion(self):
        """ Insertion sort """
        print("3  : Insertion Sort   ", end="")
        try:
            t1 = time.time()
            for l in range(self.L):
                self.a = copy.deepcopy(self.base)
                for i in range(1, self.N):
                    for j in reversed(range(i)):
                        if self.a[j] > self.a[j + 1]:
                            self.a[j], self.a[j + 1] \
                                = self.a[j + 1], self.a[j]
                        else:
                            break
            t2 = time.time()
            self.__display(self.a, t2 - t1)
        except Exception as e:
            raise

    def __sort_quick(self):
        """ Improved exchange method (Quick sort) """
        print("4  : Quick Sort       ", end="")
        try:
            t1 = time.time()
            for l in range(self.L):
                self.a = copy.deepcopy(self.base)
                self.__quick(0, self.N - 1)
            t2 = time.time()
            self.__display(self.a, t2 - t1)
        except Exception as e:
            raise

    def __sort_heap_up(self):
        """ Improved exchange method (Heap sort with upward method) """
        print("5-1: Heap Sort(Up)    ", end="")
        try:
            t1 = time.time()
            self.h = [0 for _ in range(self.N + 1)]
            for l in range(self.L):
                self.__generate_heap_up()
                n, m = self.N, self.N
                while n > 1:
                    self.h[1], self.h[n] = self.h[n], self.h[1]
                    n -= 1
                    p = 1
                    s = 2 * p
                    while s <= n:
                        if s < n and self.h[s + 1] > self.h[s]:
                            s += 1
                        if self.h[p] >= self.h[s]:
                            break
                        self.h[p], self.h[s] = self.h[s], self.h[p]
                        p = s
                        s = 2 * p
            del(self.h[0])
            t2 = time.time()
            self.__display(self.h, t2 - t1)
        except Exception as e:
            raise

    def __sort_heap_down(self):
        """ Improved exchange method (Heap sort with downward method) """
        print("5-2: Heap Sort(Down)  ", end="")
        try:
            t1 = time.time()
            self.h = [0 for _ in range(self.N + 1)]
            for l in range(self.L):
                for i in range(1, self.N + 1):
                    self.h[i] = self.base[i - 1]
                self.__generate_heap_down()
                n, m = self.N, self.N  # データ個数, n の保存
                while n > 1:
                    self.h[1], self.h[n] = self.h[n], self.h[1]
                    n -= 1
                    p = 1
                    s = 2 * p
                    while s <= n:
                        if s < n and self.h[s + 1] > self.h[s]:
                            s += 1
                        if self.h[p] >= self.h[s]:
                            break
                        self.h[p], self.h[s] = self.h[s], self.h[p]
                        p = s
                        s = 2 * p
            del(self.h[0])
            t2 = time.time()
            self.__display(self.h, t2 - t1)
        except Exception as e:
            raise

    def __sort_shell(self):
        """ Improved insertion method (Shell sort) """
        print("6  : Shell Sort       ", end="")
        try:
            t1 = time.time()
            for l in range(self.L):
              self.a = copy.deepcopy(self.base)
              #gap = int(self.N / 2)
              gap = self.N // 2
              while gap > 0:
                  for k in range(gap):
                      i = k + gap
                      while i < self.N:
                          j = i - gap
                          while j >= k:
                              if self.a[j] > self.a[j + gap]:
                                  self.a[j], self.a[j + gap] \
                                      = self.a[j + gap], self.a[j]
                              else:
                                  break
                              j -= gap
                          i += gap
                  #gap = int(gap / 2)
                  gap = gap // 2
            t2 = time.time()
            self.__display(self.a, t2 - t1)
        except Exception as e:
            raise

    def __quick(self, left, right):
        """ Recursive function for quick sort

        :param int  left:  index of left-side list
        :param int right: index of right-side list
        """
        try:
            if left >= right:
                return
            s, i, j = self.a[left], left, right + 1
            while True:
                i += 1
                while i < self.N and self.a[i] < s:
                    i += 1
                j -= 1
                while j < self.N and self.a[j] > s:
                    j -= 1
                if i >= j:
                    break
                self.a[i], self.a[j] = self.a[j], self.a[i]
            self.a[left], self.a[j] = self.a[j], s
            self.__quick(left, j - 1)
            self.__quick(j + 1, right)
        except Exception as e:
            raise

    def __generate_heap_up(self):
        """ Function for heap(upward) generation """
        try:
            for i in range(1, self.N + 1):
                self.h[i] = self.base[i - 1]
                s = i
                #p = int(s / 2)
                p = s // 2
                while s >= 2 and self.h[p] < self.h[s]:
                    self.h[p], self.h[s] = self.h[s], self.h[p]
                    s = p
                    #p = int(s / 2)
                    p = s // 2
        except Exception as e:
            raise

    def __generate_heap_down(self):
        """ Function for heap(downward) generation """
        try:
            n = self.N
            for i in reversed(range(1, n // 2 + 1)):
                p = i
                s = 2 * p
                while s <= n:
                    if s < n and self.h[s + 1] > self.h[s]:
                        s += 1
                    if self.h[p] >= self.h[s]:
                        break
                    self.h[p], self.h[s] = self.h[s], self.h[p]
                    p = s
                    s = 2 * p
        except Exception as e:
            raise

    def __display_list(self, l):
        """ Display of list

        :param list l: target list for display
        """
        try:
            for i in range(self.N):
                print("{:5d} ".format(l[i]), end="")
                if (i + 1)  % 10 == 0 or i == self.N - 1:
                    print()
            print()
        except Exception as e:
            raise

    def __display(self, l, tt):
        """ Display of result

        :param list   l: target list for display
        :param float tt: elapsed time
        """
        try:
            # ソート結果を確認したければ、以下2行をコメント解除
            #print("\n#### Sorted list")
            #self.__display_list(l)
            print("Time: {:6.2f} sec.".format(tt))
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = SortTest()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to test sorting algorithms.](https://gist.github.com/komasaru/bde3c408fdd8738c7226fadc3319ddb1 "Gist - Python script to test sorting algorithms.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x sort_test.py
```

そして、実行。

``` text
$ ./sort_test.py
#### Base list
   64     4    17    72     6     7    18    75    65    76
   40    46    57    74    34    95    25    67    20    90
   58    65    93    79    17    81    94    93    33    47
   20    87    28    53    16    57    88    85    63    88
    7     8     1    45     8    21    46    60    21    39
   75    25    93     2    82    44    48    61    12    25
   21    13    53     7    81     1    22     5    10    23
   49    46    20    41    51    21    42    33    57    11
   50    72    88    59    35    85    21    85    26    42
   66    82    65    89    78    13   100    93    86    18

1  : Bubble Sort      Time:  21.15 sec.
2  : Selection Sort   Time:   7.72 sec.
3  : Insertion Sort   Time:  18.46 sec.
4  : Quick Sort       Time:   3.85 sec.
5-1: Heap Sort(Up)    Time:   5.80 sec.
5-2: Heap Sort(Down)  Time:   6.06 sec.
6  : Shell Sort       Time:   5.90 sec.
```

クイック・ソートが最も速く、バブル・ソートが最も遅かった。  
ヒープ・ソート（上方／下方）とシェル・ソートはほぼ同じだった。

---

以上

