---
layout   : single
title    : "Python - 素因数分解！"
published: true
date     : 2018-01-10 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python 3 で任意の自然数を素因数分解する方法についての記録です。（あまりに簡単なアルゴリズムですが）

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 素因数分解！]({{site.baseurl}}/2012/08/08/08002014 "C++ - 素因数分解！")
* [Ruby - 素因数分解！]({{site.baseurl}}/2012/08/09/09002015 "Ruby - 素因数分解！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `prime_fractorization.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Prime fractorization
"""
import sys
import traceback


class PrimeFractorization:
    def __init__(self):
        self.a = 2

    def decomposit_prime(self, n):
        try:
            while n >= self.a * self.a:
                if n % self.a == 0:
                    print(self.a, "* ", end="")
                    n //= self.a
                else:
                    self.a += 1
            print(n)
        except Exception as e:
            raise


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("USAGE: ./prime_factorization.py N")
        sys.exit(0)
    try:
        obj = PrimeFractorization()
        obj.decomposit_prime(int(sys.argv[1]))
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute prime fractorization.](https://gist.github.com/komasaru/567fb5a4638bed6e94fe9cff5668b629 "Gist - Python script to compute prime fractorization.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x prime_fractorization.py
```

そして、第1引数に自然数を指定して実行。

``` text
$ ./prime_fractorization.py 100
2 * 2 * 5 * 5

$ ./prime_fractorization.py 1122332211
3 * 3 * 7 * 7 * 11 * 13 * 13 * 37 * 37
```

---

以上

