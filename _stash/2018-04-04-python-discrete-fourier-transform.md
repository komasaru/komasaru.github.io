---
layout   : single
title    : "Python - （離散）フーリエ変換！"
published: true
date     : 2018-04-04 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python3 で、（離散）フーリエ変換を実装する方法についてです。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - （離散）フーリエ変換！]({{site.baseurl}}/2013/06/10/cpp-discrete-fourier-transform "C++ - （離散）フーリエ変換！")
* [Ruby - （離散）フーリエ変換！]({{site.baseurl}}/2013/06/11/ruby-discrete-fourier-transform "Ruby - （離散）フーリエ変換！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy を使用しない。（この程度の計算では、逆に2倍程度時間がかかってしまうため）
* 必要であれば、スクリプト内の定数を変更する。（`N` は分割数）

File: `discrete_fourier_transform.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Discrete Fourier transform

  f(t) = 2 * sin(4 * t) + 3 * cos(2 * t)
         ( 0 <= t < 2 * pi )
"""
import math
import sys
import traceback


class DiscreteFourierTransform:
    N = 100                # Number of division
    CSV_DFT  = "DFT.csv"   # Output file (DFT)
    CSV_IDFT = "IDFT.csv"  # Output file (IDFT)

    def __init__(self):
        self.src_re, self.src_im = [], []
        self.dft_re, self.dft_im = [], []

    def make_source_data(self):
        """ Maiking source data """
        try:
            for i in range(self.N):
                val  = 2 * math.sin(4 * (2 * math.pi / self.N) * i) \
                     + 3 * math.cos(2 * (2 * math.pi / self.N) * i)
                self.src_re.append(val)
                self.src_im.append(0.0)
        except Exception as e:
            raise

    def dft(self):
        """ Discrete Fourier Transformation """
        try:
            with open(self.CSV_DFT, "w") as f:
                f.write("k,f,x_re,x_im,X_re,X_im\n")
                for k in range(self.N):
                    dft_re,dft_im = 0.0, 0.0
                    for n in range(self.N):
                        v_re = self.src_re[n] \
                             * ( math.cos((2 * math.pi / self.N) * k * n)) \
                             + self.src_im[n] \
                             * ( math.sin((2 * math.pi / self.N) * k * n))
                        v_im = self.src_re[n] \
                             * (-math.sin((2 * math.pi / self.N) * k * n)) \
                             + self.src_im[n] \
                             * ( math.cos((2 * math.pi / self.N) * k * n))
                        dft_re += v_re
                        dft_im += v_im
                    self.dft_re.append(dft_re)
                    self.dft_im.append(dft_im)
                    f.write("{:d},".format(k))
                    f.write("{:.6f},".format((2 * math.pi / self.N) * k))
                    f.write("{:.6f},".format(self.src_re[k]))
                    f.write("{:.6f},".format(self.src_im[k]))
                    f.write("{:.6f},".format(dft_re))
                    f.write("{:.6f}\n".format(dft_im))
        except Exception as e:
            raise

    def idft(self):
        """ Inverse Discrete Fourier Transformation """
        try:
            with open(self.CSV_IDFT, "w") as f:
                f.write("k,f,X_re,X_im,x_re,x_im\n")
                for n in range(self.N):
                    idft_re, idft_im  = 0.0, 0.0
                    for k in range(self.N):
                        v_re = self.dft_re[k] \
                             * (math.cos((2 * math.pi / self.N) * k * n)) \
                             - self.dft_im[k] \
                             * (math.sin((2 * math.pi / self.N) * k * n))
                        v_im = self.dft_re[k] \
                             * (math.sin((2 * math.pi / self.N) * k * n)) \
                             + self.dft_im[k] \
                             * (math.cos((2 * math.pi / self.N) * k * n))
                        idft_re += v_re
                        idft_im += v_im
                    idft_re /= self.N
                    idft_im /= self.N
                    f.write("{:d},".format(n))
                    f.write("{:.6f},".format((2 * math.pi / self.N) * n))
                    f.write("{:.6f},".format(self.dft_re[n]))
                    f.write("{:.6f},".format(self.dft_im[n]))
                    f.write("{:.6f},".format(idft_re))
                    f.write("{:.6f}\n".format(idft_im))
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = DiscreteFourierTransform()
        obj.make_source_data()
        obj.dft()
        obj.idft()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compute discrete Fourier transform.](https://gist.github.com/komasaru/8a67134047cb71508cc05c615f3bb568 "Gist - Python script to compute discrete Fourier transform.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x discrete_fourier_transform.py
```

そして、実行。

``` text
$ ./discrete_fourier_transform.py
```

コンソールには特に何も表示しない。  
アプリと同じディレクトリに "DFT.csv", "IDFT.csv" という CSV ファイルが作成される。  
内容は以下のようになっているはず。


File: `DFT.csv`

{% highlight text linenos %}
k,f,x_re,x_im,X_re,X_im
0,0.000000,3.000000,0.000000,0.000000,0.000000
1,0.062832,3.473724,0.000000,0.000000,-0.000000
2,0.125664,3.869257,0.000000,150.000000,-0.000000
3,0.188496,4.158424,0.000000,0.000000,-0.000000
4,0.251327,4.317576,0.000000,0.000000,-100.000000
5,0.314159,4.329164,0.000000,-0.000000,0.000000
6,0.376991,4.182959,0.000000,0.000000,0.000000
7,0.439823,3.876846,0.000000,0.000000,0.000000
8,0.502655,3.417134,0.000000,0.000000,0.000000
9,0.565487,2.818364,0.000000,0.000000,-0.000000
         :
====< 途中省略 >====
         :
90,5.654867,-0.248520,0.000000,-0.000000,-0.000000
91,5.717699,-0.263689,0.000000,-0.000000,0.000000
92,5.780530,-0.202174,0.000000,-0.000000,-0.000000
93,5.843362,-0.052303,0.000000,-0.000000,0.000000
94,5.906194,0.190852,0.000000,0.000000,0.000000
95,5.969026,0.524938,0.000000,-0.000000,-0.000000
96,6.031858,0.940264,0.000000,0.000000,100.000000
97,6.094690,1.420235,0.000000,-0.000000,-0.000000
98,6.157522,1.942242,0.000000,150.000000,-0.000000
99,6.220353,2.478964,0.000000,0.000000,-0.000000
{% endhighlight %}

File: `IDFT.csv`

{% highlight text linenos %}
k,f,X_re,X_im,x_re,x_im
0,0.000000,0.000000,0.000000,3.000000,-0.000000
1,0.062832,0.000000,-0.000000,3.473724,-0.000000
2,0.125664,150.000000,-0.000000,3.869257,-0.000000
3,0.188496,0.000000,-0.000000,4.158424,-0.000000
4,0.251327,0.000000,-100.000000,4.317576,-0.000000
5,0.314159,-0.000000,0.000000,4.329164,-0.000000
6,0.376991,0.000000,0.000000,4.182959,-0.000000
7,0.439823,0.000000,0.000000,3.876846,-0.000000
8,0.502655,0.000000,0.000000,3.417134,-0.000000
9,0.565487,0.000000,-0.000000,2.818364,-0.000000
         :
====< 途中省略 >====
         :
90,5.654867,-0.000000,-0.000000,-0.248520,0.000000
91,5.717699,-0.000000,0.000000,-0.263689,-0.000000
92,5.780530,-0.000000,-0.000000,-0.202174,-0.000000
93,5.843362,-0.000000,0.000000,-0.052303,0.000000
94,5.906194,0.000000,0.000000,0.190852,-0.000000
95,5.969026,-0.000000,-0.000000,0.524938,-0.000000
96,6.031858,0.000000,100.000000,0.940264,0.000000
97,6.094690,-0.000000,-0.000000,1.420235,0.000000
98,6.157522,150.000000,-0.000000,1.942242,0.000000
99,6.220353,0.000000,-0.000000,2.478964,-0.000000
{% endhighlight %}

### 4. グラフ化

数字だけを眺めてもよく分からないので、R でグラフ化（プロット）してみるとよいだろう。

グラフは C++, Ruby での実装を紹介した過去記事に掲載のものを参照。

* [C++ - （離散）フーリエ変換！]({{site.baseurl}}/2013/06/10/cpp-discrete-fourier-transform "C++ - （離散）フーリエ変換！")
* [Ruby - （離散）フーリエ変換！]({{site.baseurl}}/2013/06/11/ruby-discrete-fourier-transform "Ruby - （離散）フーリエ変換！")

---

電気工学、音響学、振動、光学等でよく使用する重要な概念です。応用範囲は広いので他にも利用できるかと思います。

以上

