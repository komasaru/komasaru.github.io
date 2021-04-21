---
layout   : single
title    : "Python - フーリエ級数展開！"
published: true
date     : 2018-03-31 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python3 で、フーリエ級数展開を実装する方法についてです。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - フーリエ級数展開！]({{site.baseurl}}/2013/05/16/cpp-expand-fourier-series "C++ - フーリエ級数展開！")
* [Ruby - フーリエ級数展開！]({{site.baseurl}}/2013/05/17/ruby-expand-fourier-series "Ruby - フーリエ級数展開！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy を使用しない。（この程度の計算では、逆に2倍程度時間がかかってしまうため）
* 必要であれば、スクリプト内の定数を変更する。（`N` は計算項数）

File: `fourier_series_expansion.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Fourier's series expansion

  f(t) = -1 (-pi < t <= 0 )
          1 (  0 < t <= pi)
"""
import math
import sys
import traceback


class FourierSeriesExpansion:
    N = 3  # Number of items
    CSV_FILE = "FourierSeriesExpansion.csv"

    def expand_fourier_series(self):
        """ Fourier's series expansion """
        try:
            with open(self.CSV_FILE, "w") as f:
                f.write("t,f(t)\n")
                y = 0
                for t in range(int(math.pi * -1000), int(math.pi * 1000) + 1):
                    for i in range(1, self.N + 1):
                        y += self.__calc_term(i, t / 1000.0)
                    ft = 4 / math.pi * y
                    f.write("{:.3f},{:.6f}\n".format(t / 1000.0, ft))
                    y = 0
        except Exception as e:
            raise

    def __calc_term(self, n, t):
        """ Computation for each item

        :param  int n
        :param  int t
        :return float
        """
        try:
            return math.sin((2 * n - 1) * t) / (2 * n - 1)
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = FourierSeriesExpansion()
        obj.expand_fourier_series()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to expand Fourier's series.](https://gist.github.com/komasaru/13764b6ca3d455ed6e527db34505ede5 "Gist - Python script to expand Fourier's series.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x fourier_series_expansion.py
```

そして、実行。

``` text
$ ./fourier_series_expansion.py
```

同じディレクトリ内に "FourierSeriesExpansion.csv" という CSV ファイルが作成される。

File: `FourierSeriesExpansion.csv`

{% highlight text linenos %}
t,f(t)
-3.141,-0.002264
-3.140,-0.006083
-3.139,-0.009903
-3.138,-0.013723
-3.137,-0.017542
-3.136,-0.021361
-3.135,-0.025180
-3.134,-0.028999
-3.133,-0.032817
-3.132,-0.036635
-3.131,-0.040452
-3.130,-0.044269
-3.129,-0.048086
-3.128,-0.051901
-3.127,-0.055717
-3.126,-0.059531
-3.125,-0.063345
-3.124,-0.067159
-3.123,-0.070971
         :
====< 途中省略 >====
         :
3.122,0.074783
3.123,0.070971
3.124,0.067159
3.125,0.063345
3.126,0.059531
3.127,0.055717
3.128,0.051901
3.129,0.048086
3.130,0.044269
3.131,0.040452
3.132,0.036635
3.133,0.032817
3.134,0.028999
3.135,0.025180
3.136,0.021361
3.137,0.017542
3.138,0.013723
3.139,0.009903
3.140,0.006083
3.141,0.002264
{% endhighlight %}

### 4. グラフ化

数字だけを眺めてもよく分からないので、R でグラフ化（プロット）してみるとよいだろう。

グラフは C++, Ruby での実装を紹介した過去記事に掲載のものを参照。

* [C++ - フーリエ級数展開！]({{site.baseurl}}/2013/05/16/cpp-expand-fourier-series "C++ - フーリエ級数展開！")
* [Ruby - フーリエ級数展開！]({{site.baseurl}}/2013/05/17/ruby-expand-fourier-series "Ruby - フーリエ級数展開！")

---

電気工学、音響学、振動、光学等でよく使用する重要な概念です。応用範囲は広いので他にも利用できるかと思います。

以上

