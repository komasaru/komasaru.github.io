---
layout   : single
title    : "Python - 円周率計算（Chudnovsky の公式使用）！"
published: true
date     : 2018-05-21 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
- 円周率
---
こんにちは。

以前、 C++ や Ruby で Chudnovsky の公式を使用して円周率を計算しました。（任意精度算術ライブラリ GMP(The GNU Multi Precision Arithmetic Library) を使用）

* [C++ - 円周率計算（Chudnovsky の公式使用）！]({{site.baseurl}}/2015/05/06/cpp-pi-computation-by-chudnovsky-bsa-with-gmp "C++ - 円周率計算（Chudnovsky の公式使用）！")
* [Ruby - 円周率計算（Chudnovsky の公式使用）！]({{site.baseurl}}/2015/05/08/ruby-pi-computation-by-chudnovsky-bsa-with-gmp "Ruby - 円周率計算（Chudnovsky の公式使用）！")

今回は、同じことを Python で実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* 演算には GMP(The GNU Multi Precision Arithmetic Library) 任意精度算術ライブラリを Python 用にラップした gmp という PyPI ライブラリを使用するので、インストール済みであること。
* GMP で浮動小数点数を扱う場合は MPFR(The GNU Multiple Precision Floating-Point Reliably) ライブラリが必要であるので、インストール済みであること。（参照：「[MPFR - ソースビルドでインストール (on Linux Mint)！]({{site.baseurl}}/2015/05/10/mpfr-installation-by-source-build-on-linux-mint "MPFR - ソースビルドでインストール (on Linux Mint)！")」）
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 円周率計算（Chudnovsky の公式使用）！]({{site.baseurl}}/2015/05/06/cpp-pi-computation-by-chudnovsky-bsa-with-gmp "C++ - 円周率計算（Chudnovsky の公式使用）！")
* [Ruby - 円周率計算（Chudnovsky の公式使用）！]({{site.baseurl}}/2015/05/08/ruby-pi-computation-by-chudnovsky-bsa-with-gmp "Ruby - 円周率計算（Chudnovsky の公式使用）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 級数計算部分で Binary Splitting Algorithm を適用し、四則演算・平方根計算では GMP ライブラリを使用する。
* `n` を 1 進める度に $$log(53360^{3}) / log(10) \simeq 14.1816$$ 桁精度が上昇する。（14桁に丸めても問題ない）
* 浮動小数点の精度を $$a$$ とする場合、バイナリ `mpf_class` の精度は $$a \times log_2(10)$$ となる。

File: `chudnovsky.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
PI Computation by Binary Splitting Algorithm with GMP libarary
"""
import math
import sys
import traceback
from gmpy2 import mpz
from gmpy2 import isqrt
from time  import time


class PiChudnovsky:
    A = 13591409
    B = 545140134
    C = 640320
    D = 426880
    E = 10005
    C3_24  = C ** 3 // 24
    DIGITS_PER_TERM = math.log(53360 ** 3) / math.log(10)  #=> 14.181647462725476
    FILENAME = "pi.txt"

    def __init__(self, digits):
        """ Initialization

        :param int digits: digits of PI computation
        """
        self.digits = digits
        self.n      = math.floor(self.digits / self.DIGITS_PER_TERM + 1)
        self.prec   = math.floor((self.digits + 1) * math.log2(10))

    def compute(self):
        """ Computation """
        try:
            tm_s = time()
            p, q, t = self.__bsa(0, self.n)
            one_sq = mpz(10) ** (2 * self.digits)
            sqrt_c = isqrt(self.E * one_sq)
            pi = (q * self.D * sqrt_c) // t
            with open(self.FILENAME, "w") as f:
                f.write(str(pi))
            return time() - tm_s
        except Exception as e:
            raise

    def __bsa(self, a, b):
        """ PQT computation by BSA(= Binary Splitting Algorithm)

        :param int a: positive integer
        :param int b: positive integer
        :return list [int p_ab, int q_ab, int t_ab]
        """
        try:
            if a + 1 == b:
                if a == 0:
                    p_ab = q_ab = mpz(1)
                else:
                    p_ab = mpz((6 * a -5) * (2 * a - 1) * (6 * a - 1))
                    q_ab = mpz(a * a * a * self.C3_24)
                t_ab = p_ab * (self.A + self.B * a)
                if a & 1:
                    t_ab *= -1
            else:
                m = (a + b) // 2
                p_am, q_am, t_am = self.__bsa(a, m)
                p_mb, q_mb, t_mb = self.__bsa(m, b)
                p_ab = p_am * p_mb
                q_ab = q_am * q_mb
                t_ab = q_mb * t_am + p_am * t_mb
            return [p_ab, q_ab, t_ab]
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        if len(sys.argv) < 2:
            digits = 100
        else:
            digits = int(sys.argv[1])
        print("#### PI COMPUTATION ( {} digits )".format(digits))
        obj = PiChudnovsky(digits)
        tm = obj.compute()
        print("  Output  file:", "pi.txt")
        print("  Elapsed time: {} seconds".format(tm))
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute pi with Chudnovsky formula and Binary Splitting Algorithm, using GMP libarary.](https://gist.github.com/komasaru/c3f5227513e1692c8fba42fe337316bc "Gist - Python script to compute pi with Chudnovsky formula and Binary Splitting Algorithm, using GMP libarary.")

### 3. 動作確認

引数に計算したい桁数を指定して実行する。（以下は 1,000,000 桁を計算する例。引数を指定しない場合のデフォルト値は `100`）

``` text
$ ./pi_chudnovsky.py 1000000
#### PI COMPUTATION ( 1000000 digits )
  Output  file: pi.txt
  Elapsed time: 1.5609240531921387 seconds
```

計算結果は "pi.txt" ファイルに出力される。

File: `pi.txt`

{% highlight text linenos %}
314159265358979323846264338327950 ... 以下省略
{% endhighlight %}

### 4. 計算結果検証

本来は別の公式・アルゴリズムで計算した結果と比較すべきでしょうが、（今回は計算桁数も少なくテキストエディタで開けるので）取り急ぎ任意の桁の数字が誤っていないかを別途計算済みの結果と目視で比較確認する。

当方は "[Pi Digits](http://bellard.org/pi/pi2700e9/pidigits.html "Pi Digits")" の計算結果と比較し、最初・中間・最後の部分が一致することを確認した。（現時点では１億桁までは）

テキストファイルのサイズは 1,000 万桁で 10MB(約 9.5 MiB), 1 億桁で 100MB(約 95.4MiB) になる。非力なマシンの場合は（そうでない場合も）テキストエディタで開くのに注意すること！

### 5. 桁別計算時間検証

計算桁数(桁) | 計算時間(秒)（結果出力時間を含む）
------------:|----------------------------------:
         100 |   0.00047278404235839844
       1,000 |   0.00058913230895996090
      10,000 |   0.00402903556823730500
     100,000 |   0.13316392898559570000
   1,000,000 |   1.50634384155273440000
  10,000,000 |  27.24020838737487800000
 100,000,000 | 475.28785514831543000000

ちなみに、同じアルゴリズムを Ruby で同じように実装して計算した場合と比べてみても、さほど速度に変わりはなかった。

### 6. 参考サイト

1. [円周率.jp](http://xn--w6q13e505b.jp/ "円周率.jp")
2. [Pi Computation Record](http://bellard.org/pi/pi2700e9/announce.html "Pi Computation Record")

（計算アルゴリズムは 2 内の "pipcrecord.pdf" を参考にした）

---

当然ながら C++ より計算に時間がかかりますが、それでも１億桁を計算してファイル出力するのに約７分少ししかかからないのには一種の感動を覚えます。（ライブラリのおかげで）

以上。

