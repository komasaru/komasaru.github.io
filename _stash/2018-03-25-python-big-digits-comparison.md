---
layout   : single
title    : "Python - 多倍長整数の大小比較！"
published: true
date     : 2018-03-25 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

Python3 で、多桁（多倍長）整数同士の大小を比較する方法についてです。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 多倍長整数の大小比較！！]({{site.baseurl}}/2013/05/02/cpp-compare-big-digits "C++ - C++ - 多倍長整数の大小比較！！")
* [Ruby - 多倍長整数の大小比較！！]({{site.baseurl}}/2013/05/03/ruby-compare-big-digits "Ruby - C++ - 多倍長整数の大小比較！！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy を使用しない。（この程度の計算では、逆に2倍程度時間がかかってしまうため）
* 必要であれば、スクリプト内の定数を変更する。

File: `compare_big_digits.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Comparison between two big-digit integers
"""
import random
import sys
import traceback


class CompareBigDigits:
    D_L = 1000  # Number of big-digit integer (Left-hand side)
    D_R = 1001  # Number of big-digit integer (Right-hand side)

    def __init__(self):
        self.l = [random.randrange(10) for _ in range(self.D_L)]
        self.r = [random.randrange(10) for _ in range(self.D_R)]

    def exec(self):
        """ Execution """
        try:
            s = self.__compare(self.l, self.r)
            self.__display(self.l, self.r, s)
        except Exception as e:
            raise

    def __compare(self, l, r):
        """ Comparison

        :param list l
        :param list r
        :return int s: 1 (l > r)
                       0 (l = r)
                      -1 (l < r)
        """
        try:
            size_l, size_r = len(l), len(r)
            if size_l > size_r:
                for i in range(size_l - 1, size_r - 1, -1):
                    if l[i] != 0:
                        return 1
            if size_l < size_r:
                for i in range(size_r - 1, size_l - 1, -1):
                    if r[i] != 0:
                        return -1
            for i in range(min([size_l, size_r]) - 1, -1 , -1):
                if l[i] > r[i]:
                    return  1
                if l[i] < r[i]:
                    return -1
            return 0
        except Exception as e:
            raise

    def __display(self, l, r, s):
        """ Display

        :param list l
        :param list r
        :param int  s:-1 or 0 or 1
        """
        try:
            print("[LEFT] =")
            for i in range(self.D_L - 1, -1, -1):
                print(l[i], end="")
                if (self.D_L - i) % 10 == 0:
                    print(" ", end="")
                if (self.D_L - i) % 50 == 0:
                    print()
            print()
            print("[RIGHT] =")
            for i in range(self.D_R - 1, -1, -1):
                print(r[i], end="")
                if (self.D_R - i) % 10 == 0:
                    print(" ", end="")
                if (self.D_R - i) % 50 == 0:
                    print()
            print()
            # 大小比較結果
            sign = "=" if s == 0 else (">" if s > 0 else "<")
            print("[LEFT] {} [RIGHT]".format(sign))
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = CompareBigDigits()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to compare big digits.](https://gist.github.com/komasaru/cd069235a890dc0537de6da247b4931f "Gist - Python script to compare big digits.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x compare_big_digits.py
```

そして、実行。

``` text
$ ./compare_big_digits.py
6416884340 8863088791 8069171553 2736574947 9259696278
6452889592 8205208035 3050507641 0877435156 1022909330
4353997600 2374909299 5334789719 5865434341 8441473739
9112707965 1421951202 3108908089 1903879353 4630657760
4725151081 9083561716 4430546472 1051012136 9281404597
0544369218 1025781533 6580219220 9247443390 3850469562
7686348814 0404764875 4761080226 9441532233 0795257837
4253917566 7815624729 3056280181 6330605646 8341162562
4153563127 7266194446 3318632128 8005471486 9927745429
5172844166 1990882654 3353456931 1446672264 3660485373
8198999097 8678452512 9864981774 6514378207 8739209879
2700167534 5044485382 3149058666 7545960753 7337833788
5390755981 3567466098 1235066993 7063345946 3751395313
4223075290 4419774792 6971535614 9455611818 3183977474
2278835277 4872250470 8096024890 2110866982 7045877776
4892075177 2230622884 7222768437 0924514618 2933346440
7114788485 1775258924 9559987257 8078364472 9150098658
0836543612 8733957988 2092869492 6242675023 7942557471
9477931153 5466534248 6399700218 9501963590 5362464752
5795423193 2781083256 0310367299 8719585818 1417091484

[RIGHT] =
0279669545 1758327582 3967059894 9847262356 3705345653
7507784621 7905724229 0816037770 9313611131 1453829194
4501621111 1905195907 9565596310 7557873633 9065434157
0860678258 7083670107 4810263719 3393682565 6335160342
6452292200 8443356770 8308296272 7557038483 9301090821
1566225648 1138903923 2373140571 0772197928 4188096579
2151063184 0447359503 7207499214 9385633383 4466279961
5854764608 7197845518 7356985905 2632460147 9684829195
8833991669 1866039387 2296395485 6114172338 4663997794
0038849312 3052672229 1628481632 3864226499 4223036531
0087006276 7425099819 5244884704 8669524540 7241835321
1490794824 0951797698 8379194201 1414678605 3585751585
1473078949 1720698528 5483245843 4362507443 4733001490
3278784064 1457999514 0939063265 6596075216 5536748101
3293163324 9423279577 6628530234 5354426547 7743310182
0833067261 7505282769 6820985354 0901853013 5768285656
2402278202 7919370116 7121288762 7423149331 4715546965
4067105908 6759233152 6574439407 0183571077 0811384191
2255801063 9370604295 1631733383 0194654531 5994334815
4070430598 4034838198 0834280924 2836497588 2542826086
5
[LEFT] > [RIGHT]
```

---

以上

