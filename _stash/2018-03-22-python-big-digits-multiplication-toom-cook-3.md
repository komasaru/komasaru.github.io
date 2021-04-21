---
layout   : single
title    : "Python - 多桁乗算（Toom-Cook 法 (3-way)）！"
published: true
date     : 2018-03-22 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Python
---

これまで、「標準（筆算）法」や「Karatsuba 法」による多桁同士の乗算アルゴリズムの Python への実装方法を紹介しました。

* [Python - 多桁乗算（標準（筆算）法）！]({{site.baseurl}}/2018/03/16/python-big-digits-multiplication-normal "Python - 多桁乗算（標準（筆算）法）！")
* [Python - 多桁乗算（Karatsuba 法）！]({{site.baseurl}}/2018/03/19/python-big-digits-multiplication-karatsuba "Python - 多桁乗算（Karatsuba 法）！")

今回は、「Karatsuba 法」の上位にある「Toom-Cook 法」アルゴリズムを実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. アルゴリズムについて

当ブログ過去記事を参照。

* [C++ - 多桁乗算（Toom-Cook 法 (3-way)）！]({{site.baseurl}}/2013/04/29/cpp-big-multiply-toom-cook-3 "C++ - 多桁乗算（Toom-Cook 法 (3-way)）！")
* [Ruby - 多桁乗算（Toom-Cook 法 (3-way)）！]({{site.baseurl}}/2013/04/30/ruby-big-multiply-toom-cook-3 "Ruby - 多桁乗算（Toom-Cook 法 (3-way)）！")

### 2. Python スクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 数値計算ライブラリ NumPy を使用しない。（この程度の計算では、逆に2倍程度時間がかかってしまうため）
* 必要であれば、スクリプト内の定数を変更する。

File: `multiply_toom_cook_3.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Multiplication of big-digit values with Toom-Cook 3-way method
"""
import random
import sys
import traceback


class MultiplyToomCook3:
    D_MAX = 729  # Maximum number of digits (power of 3)
    D     = 729  # Digits of computation (<= D_MAX)

    def __init__(self):
        self.a = [random.randrange(10) for _ in range(self.D)]
        self.b = [random.randrange(10) for _ in range(self.D)]

    def compute(self):
        """ Computation of multiplication """
        try:
            for i in range(self.D_MAX - len(self.a)):
                self.a.append(0)
            for i in range(self.D_MAX - len(self.b)):
                self.b.append(0)
            z = self.__multiply_toom_cook_3(self.a, self.b)
            z = self.__do_carry(z)
            self.__display(self.a, self.b, z)
        except Exception as e:
            raise

    def __multiply_normal(self, a, b):
        """ Normal multiplication

        :param  list a
        :param  list b
        :return list z
        """
        try:
            a_len, b_len = len(a), len(b)
            z = [0 for _ in range(a_len + b_len)]
            for j in range(b_len):
                for i in range(a_len):
                    z[j + i] += a[i] * b[j]
            return z
        except Exception as e:
            raise

    def __multiply_toom_cook_3(self, a, b):
        """ Toom-Cook 3-way multiplication

        :param  list a
        :param  list b
        :return list z
        """
        a_m1, a_m2, a_0, a_1, a_inf = [], [], [], [], []
        b_m1, b_m2, b_0, b_1, b_inf = [], [], [], [], []
        c_m1, c_m2, c_0, c_1, c_inf = [], [], [], [], []
        c0, c1, c2, c3, c4          = [], [], [], [], []
        try:
            t_len = len(a)
            # ９桁（配列９個）になった場合は標準乗算
            if t_len <= 9:
                return self.__multiply_normal(a, b)
            a0 = a[:(t_len // 3)]
            a1 = a[(t_len // 3):(t_len * 2 // 3)]
            a2 = a[(t_len * 2 // 3):]
            b0 = b[:(t_len // 3)]
            b1 = b[(t_len // 3):(t_len * 2 // 3)]
            b2 = b[(t_len * 2 // 3):]
            for i in range(t_len // 3):
                a_m2.append((a2[i] << 2) - (a1[i] << 1) + a0[i])
                b_m2.append((b2[i] << 2) - (b1[i] << 1) + b0[i])
            for i in range(t_len // 3):
                a_m1.append(a2[i] - a1[i] + a0[i])
                b_m1.append(b2[i] - b1[i] + b0[i])
            a_0, b_0 = a0, b0
            for i in range(t_len // 3):
                a_1.append(a2[i] + a1[i] + a0[i])
                b_1.append(b2[i] + b1[i] + b0[i])
            a_inf, b_inf= a2, b2
            c_m2  = self.__multiply_toom_cook_3(a_m2, b_m2)
            c_m1  = self.__multiply_toom_cook_3(a_m1, b_m1)
            c_0   = self.__multiply_toom_cook_3(a_0, b_0)
            c_1   = self.__multiply_toom_cook_3(a_1, b_1)
            c_inf = self.__multiply_toom_cook_3(a_inf, b_inf)
            c4 = c_inf
            for i in range((t_len // 3) * 2):
                c  = -c_m2[i]
                c += (c_m1[i] << 1) + c_m1[i]
                c -= (c_0[i] << 1) + c_0[i]
                c += c_1[i]
                c += (c_inf[i] << 3) + (c_inf[i] << 2)
                c  = c // 6
                c3.append(c)
            for i in range((t_len // 3) * 2):
                c  = (c_m1[i] << 1) + c_m1[i]
                c -= (c_0[i] << 2) + (c_0[i] << 1)
                c += (c_1[i] << 1) + c_1[i]
                c -= (c_inf[i] << 2) + (c_inf[i] << 1)
                c  = c // 6
                c2.append(c)
            for i in range((t_len // 3) * 2):
                c  = c_m2[i]
                c -= (c_m1[i] << 2) + (c_m1[i] << 1)
                c += (c_0[i] << 1) + c_0[i]
                c += (c_1[i] << 1)
                c -= (c_inf[i] << 3) + (c_inf[i] << 2)
                c  = c // 6
                c1.append(c)
            c0 = c_0
            z = c0 + c2 + c4
            for i in range((t_len // 3) * 2):
                z[i + int(t_len / 3)] += c1[i]
            for i in range((t_len // 3) * 2):
                z[i + t_len] += c3[i]
            return z
        except Exception as e:
            raise

    def __do_carry(self, a):
        """ Process of carrying

        :param  list a
        :return list a
        """
        cr = 0

        try:
            for i in range(len(a)):
                a[i] += cr
                cr = int(a[i] / 10)
                a[i] -= cr * 10
            if cr != 0:
                print("[ OVERFLOW!! ] ", cr)
            return a
        except Exception as e:
            raise

    def __display(self, a, b, z):
        """ Display

        :param list a
        :param list b
        :param list z
        """
        a_len = self.D_MAX
        b_len = self.D_MAX
        z_len = self.D_MAX * 2
        try:
            while a[a_len - 1] == 0:
                if a[a_len - 1] == 0:
                    a_len -= 1
            while b[b_len - 1] == 0:
                if b[b_len - 1] == 0:
                    b_len -= 1
            while z[z_len - 1] == 0:
                if z[z_len - 1] == 0:
                    z_len -= 1
            print("a =")
            for i in reversed(range(a_len)):
                print(a[i], end="")
                if (a_len - i) % 10 == 0:
                    print(" ", end="")
                if (a_len - i) % 50 == 0:
                    print()
            print()
            print("b =")
            for i in reversed(range(b_len)):
                print(b[i], end="")
                if (b_len - i) % 10 == 0:
                    print(" ", end="")
                if (b_len - i) % 50 == 0:
                    print()
            print()
            print("z =")
            for i in reversed(range(z_len)):
                print(z[i], end="")
                if (z_len - i) % 10 == 0:
                    print(" ", end="")
                if (z_len - i) % 50 == 0:
                    print()
            print()
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = MultiplyToomCook3()
        obj.compute()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to multiply big-digit values with Toom-Cook 3-way method.](https://gist.github.com/komasaru/c7306412ed3e76442f9ced2bc3090a64 "Gist - Python script to multiply big-digit values with Toom-Cook 3-way method.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x multiply_toom_cook_3.py
```

そして、実行。

``` text
$ ./multiply_toom_cook_3.py
a =
9984175809 3286351933 4524087480 7671484443 2467573618
8875252515 7549251990 8495941435 9005372498 4515519291
0446904427 5108794238 4184112839 1927131190 3419813231
4075514955 6695775392 0207352574 2631461806 1747407391
7335451153 5930192777 9495477057 3313992260 1230537476
4781491650 2329540260 9151232540 5392786710 7267233811
7000564768 8964804879 0174266758 4401494165 1240665980
2428904303 1438341920 3786584056 7680618986 0119710816
4769291295 6736157259 5245811952 0648512236 6008216202
3909556894 7614443397 3525684215 4611073005 8484652142
0171417758 1651360039 5484649217 7457490737 9902481917
3348222394 8418031201 2629251623 8618110019 3185737282
4815478139 8720641170 5269481170 3007034111 9963050044
3051715805 7289330793 8313937207 0500412500 9191994540
9370143544 2396069851 03831965
b =
3360413303 4220719136 6844662485 6383299284 9273757226
3871217726 1206546887 5508967333 6302248385 9664059652
9514749048 4760393035 3871575399 1970836937 5524069097
3274436129 1928518900 0985554755 9179523513 3721068512
3766600160 6594030629 0279608993 0674038863 7620945536
9911200690 8220758407 3007181603 8345168855 3207874164
0213255576 3720989690 8977318517 6330441467 5674210028
1713642147 0579545896 7037707795 3880511803 9466865034
8343606302 6143729905 1655468567 8531997223 4858768944
9785735805 8041045782 0849804380 5999587065 4732948051
5262851758 0751068467 4199821619 9630248416 4873517698
1138555258 0584430068 8190075477 1379429681 9311825696
5266397983 3076795503 9633087032 8747551561 4171608862
1740467122 4046695270 8637644049 3538476350 4448653923
4690650661 4031167447 031735465
z =
3355095721 3372777392 7968734308 9588283000 5541485846
9704143740 7652303835 1780697356 8058373427 2212506668
8695664688 0127756820 8798765375 6392327667 6021297777
1691010913 9388901925 7568580892 0252208886 9447346276
9105853715 2960496690 4034444350 4795704880 0819380895
6106199760 9007022977 3684723156 7395235362 6765638398
0249602139 2857170858 9575539294 4975634730 4902599764
2396723552 4031823674 7000081564 3059728720 8783986161
3475720219 4112730295 3010437050 7994867335 0728425982
0839698883 5566844041 9189206299 5003573250 7400371204
3972532085 9045084253 5107015385 9963204349 5890266628
2281710944 9752876591 6665162666 8029651339 1652234273
7839344357 8190100549 4480385439 3180978778 3453037988
8505626969 7466242276 8897193116 8046401684 1644809122
9333366013 7493904916 1341003743 6987732054 7099230862
3587584087 2524145934 7875118921 3426108148 3187316726
8957652763 5971067309 6144481294 9116437353 3106567154
4086839721 1818998837 0671549358 7627108387 7059961399
3748497292 7663101488 2804514916 6456022366 1183658361
9054407032 6786206023 1229085140 3113384634 8524897936
4178698076 4247028413 7823399728 5890730381 2366408093
8429607513 3084648991 2476519783 1312169321 8428195982
8615575632 2507543326 1163660946 9370404329 7756703778
0049349995 5148158613 6035319015 7736582555 2973595737
7493109082 0095600562 5343019379 8179202658 3061440766
4163263940 5398118104 0493087985 9401392230 0083245711
5379448669 3427246461 9722069908 9124692510 8034118049
7806329355 0228855878 8787012996 6942151287 2453189577
1421672922 5220654945 3176820011 5193619813 5556153569
1138725
```

---

以上

