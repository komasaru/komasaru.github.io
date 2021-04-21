---
layout   : single
title    : "Python - ラグランジュ補間！"
published: true
date     : 2018-02-13 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 でラグランジュ補間を行う方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - ラグランジュ補間！]({{site.baseurl}}/2013/03/10/cpp-interpolate-lagrange "C++ - ラグランジュ補間！")
* [Ruby - ラグランジュ補間！]({{site.baseurl}}/2013/03/11/ruby-interpolate-lagrange "Ruby - ラグランジュ補間！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 必要であれば、スクリプト内の定数を変更する。

File: `interpolate_lagrange.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Interpolation with Lagrange method
"""
import sys
import traceback


class InterpolateLagrange:
    X = [0.0, 2.0, 3.0, 5.0, 8.0]
    Y = [0.8, 3.2, 2.8, 4.5, 1.9]

    def __init__(self):
        self.n = len(self.X)

    def compute(self):
        """ Computation of interpolation with Lagrange method """
        try:
            print("      x      y")
            for a in range(int(self.X[-1]) * 2 + 1):
                t = 0.5 * a
                print("{:7.2f}{:7.2f}".format(t, self.__interpolate(t)))
        except Exception as e:
            raise

    def __interpolate(self, t):
        """ Interpoalation with Lagrange method

        :param float t
        """
        try:
            s = 0.0
            for i in range(0, self.n):
                p = self.Y[i]
                for j in range(0, self.n):
                    if i != j:
                        p *= (t - self.X[j]) / (self.X[i] - self.X[j])
                s += p
            return s
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = InterpolateLagrange()
        obj.compute()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to interpolate with Lagrange method.](https://gist.github.com/komasaru/aaca82968cf0b42c7d9aa3a90f17be62 "Gist - Python script to interpolate with Lagrange method.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x interpolate_lagrange.py
```

そして、実行。

``` text
$ ./interpolate_lagrange.py
      x      y
   0.00   0.80
   0.50   2.49
   1.00   3.23
   1.50   3.37
   2.00   3.20
   2.50   2.95
   3.00   2.80
   3.50   2.85
   4.00   3.17
   4.50   3.74
   5.00   4.50
   5.50   5.32
   6.00   6.03
   6.50   6.37
   7.00   6.05
   7.50   4.70
   8.00   1.90
```

---

以上

