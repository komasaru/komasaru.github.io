---
layout   : single
title    : "Python - べき剰余アルゴリズムの実装！"
published: true
date     : 2018-05-10 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---
こんにちは。

以前、 C++ や Ruby で「べき剰余」のアルゴリズムを実装しました。

* [C++ - べき剰余アルゴリズムの実装！]({{site.baseurl}}/2015/05/13/cpp-implementation-of-modular-exponentiation "C++ - べき剰余アルゴリズムの実装！")
* [Ruby - べき剰余アルゴリズムの実装！]({{site.baseurl}}/2015/05/15/ruby-implementation-of-modular-exponentiation "C++ - べき剰余アルゴリズムの実装！")

今回は Python で実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. べき剰余、べき剰余演算アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - べき剰余アルゴリズムの実装！]({{site.baseurl}}/2015/05/13/cpp-implementation-of-modular-exponentiation "C++ - べき剰余アルゴリズムの実装！")

### 2. Python スクリプトの作成

まず、非再帰的な記述方法で作成。  

File: `modular_exponentiation_1.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Modular Exponentiation (iterative)
"""
import sys
import traceback


class ModularExponentiation:
    def comp_mod_exp(self, b, e, m):
        """ Computation of modular exponentiation

        :param  int  b: base
        :param  int  e: exponent
        :param  int  m: modulus
        :return int me: modular expornentiation
        """
        ans = 1
        try:
            while e > 0:
                if (e & 1) == 1:
                    ans = (ans * b) % m
                e >>= 1
                b = (b * b) % m
            return ans
        except Exception as e:
            raise


if __name__ == '__main__':
    # me = b^e mod m
    b, e, m = 12345, 6789, 4567
    try:
        obj = ModularExponentiation()
        me = obj.comp_mod_exp(b, e, m)
        print("{}^{} mod {} = {}".format(b, e, m, me))
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute modular-exponentiation iteratively.](https://gist.github.com/komasaru/389caa790c42463a60069d9a49f39db7 "Gist - Python script to compute modular-exponentiation iteratively.")

次に、再帰的な記述方法で作成。(`comp_mod_exp` メソッドの内容が異なるだけ）

File: `modular_exponentiation_2.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Modular Exponentiation (recursive)
"""
import sys
import traceback


class ModularExponentiation:
    def comp_mod_exp(self, b, e, m):
        """ Computation of modular exponentiation

        :param  int  b: base
        :param  int  e: exponent
        :param  int  m: modulus
        :return int me: modular expornentiation
        """
        try:
            if e == 0:
                return 1
            ans = self.comp_mod_exp(b, e // 2, m)
            ans = (ans * ans) % m
            if e % 2 == 1:
                ans = (ans * b) % m
            return ans
        except Exception as e:
            raise


if __name__ == '__main__':
    # me = b^e mod m
    b, e, m = 12345, 6789, 4567
    try:
        obj = ModularExponentiation()
        me = obj.comp_mod_exp(b, e, m)
        print("{}^{} mod {} = {}".format(b, e, m, me))
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute modular-exponentiation recursively.](https://gist.github.com/komasaru/590612f2a7a7060a0d5501b343051d9f "Gist - Python script to compute modular-exponentiation recursively.")

### 3. 動作確認

``` text
$ ./modular_exponentiation_1.py
12345^6789 mod 4567 = 62

$ ./modular_exponentiation_2.py
12345^6789 mod 4567 = 62
```

### 6. 参考サイト

* [冪剰余 - Wikipedia](http://ja.wikipedia.org/wiki/%E5%86%AA%E5%89%B0%E4%BD%99 "冪剰余 - Wikipedia")

---

以上。

