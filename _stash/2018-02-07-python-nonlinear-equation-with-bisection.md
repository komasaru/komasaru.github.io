---
layout   : single
title    : "Python - 非線形方程式の解法（２分法）！"
published: true
date     : 2018-02-07 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 で非線形方程式を2分法を使用して解く方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 非線形方程式の解法（２分法）！]({{site.baseurl}}/2012/11/11/11002058 "C++ - 非線形方程式の解法（２分法）！")
* [Ruby - 非線形方程式の解法（２分法）！]({{site.baseurl}}/2012/11/12/12002031 "Ruby - 非線形方程式の解法（２分法）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 関数は $$f(x) = x^{3} - x + 1 \ \ (-2 \leqq x \leqq 2)$$ を想定している。
* 必要であれば、スクリプト内の定数や関数を変更する。

File: `nonlinear_equation.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Nonlinear equation with bisection method
"""
import sys
import traceback


class NonlinearEquation:
    EPS = 1e-08  # Precision of truncation
    LIMIT = 50   # Number of truncation

    def __init__(self):
        self.f = lambda x: x**3 - x + 1

    def compute(self):
        """
        Computation of nonlinear equation with bisection method
        """
        try:
            low, high  = -2.0, 2.0
            cnt_loop = 0
            for k in range(1, self.LIMIT + 1):
                cnt_loop = k
                x = (low + high) / 2
                if self.f(x) > 0:
                    high = x
                else:
                    low  = x
                if self.f(x) == 0 or abs(high - low) / abs(low) < self.EPS:
                    print("x = {:f}".format(x))
                    break
            if cnt_loop == self.LIMIT:
                print("収束しない")
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = NonlinearEquation()
        obj.compute()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute nonlinear equation with bisection method.](https://gist.github.com/komasaru/8c42cc11a59cc0657bee6f4ca91dacaf "Gist - Python script to compute nonlinear equation with bisection method.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x nonlinear_equation.py
```

そして、実行。

``` text
$ ./nonlinear_equation.py
x = -1.324718
```

---

以上

