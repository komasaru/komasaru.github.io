---
layout   : single
title    : "C++ - 円周率計算（Chudnovsky の公式使用）！"
published: true
date     : 2015-05-06 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
- 円周率
---
こんにちは。

今、円周率を計算するための公式で最も高速だと言われているのは、 Ramanujan（ラマヌジャン）系の「Chudnovsky（チャドノフスキー）の公式」です。

今回は、C++ で Chudnovsky の公式を使用して円周率を計算してみました。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* 演算には GMP(The GNU Multi Precision Arithmetic Library) 任意精度算術ライブラリを使用する。  
  （C 用のライブラリではなく C++ 用にラップされたライブラリを使用）
* 計算に使用したマシンは CPU: Intel Core2Duo E8500 ( 3.16GHz ), MEM: 3.9GiB

### 1. Chudonvsky の公式を使用した円周率計算について

（数式が多いので $$\LaTeX$$ で作成した文書を貼り付け）（PDF ファイルは「[mk-mode SITE: アーカイブ](http://www.mk-mode.com/rails/archive#arc-math "mk-mode SITE: アーカイブ")」に置いた）

![CHUDNOVSKEY_1]({{site.baseurl}}/images/2015/05/06/CHUDNOVSKY_1.png "CHUDNOVSKY_1")
![CHUDNOVSKEY_2]({{site.baseurl}}/images/2015/05/06/CHUDNOVSKY_2.png "CHUDNOVSKY_2")
![CHUDNOVSKEY_3]({{site.baseurl}}/images/2015/05/06/CHUDNOVSKY_3.png "CHUDNOVSKY_3")
![CHUDNOVSKEY_4]({{site.baseurl}}/images/2015/05/06/CHUDNOVSKY_4.png "CHUDNOVSKY_4")

（Chudnovsky の公式に Binary Splitting Algorithm を適用することに特化しているので、他で説明されている Binary Splitting Algorithm とは若干異なることに注意）

### 2. C++ ソースコードの作成

級数計算部分で Binary Splitting Algorithm を適用し、四則演算・平方根計算では GMP ライブラリを使用する。

注意する点は、

* `mpz_class`, `mpf_class` へ代入する際の順序。  
  `res.Q  = C3_24 * n2 * n2 * n2;` を `res.Q  = n2 * n2 * n2 * C3_24;` としたり、`pi  = D * sqrt((mpf_class)E) * PQT.Q;` を `pi  = D * sqrt(E) * PQT.Q;` とキャストし忘れたりすると丸められる順序の違いにより誤差が発生してしまうということ。
* `N` を 1 進める度に $$log(53360^{3}) / log(10) \simeq 14.1816$$ 桁精度が上昇する。（14桁に丸めても問題ない）
* 浮動小数点の精度を $$a$$ とする場合、バイナリ `mpf_class` の精度は $$a \times log_2(10)$$ となる。

File: `chudnovsky.cpp`

{% highlight c linenos %}
/***************************************************************
 * Computing pi by Binary Splitting Algorithm with GMP libarary.
 **************************************************************/
#include <cmath>
#include <iostream>
#include <fstream>
#include <gmpxx.h>

using namespace std;

struct PQT
{
    mpz_class P, Q, T;
};

class Chudnovsky
{
    // Declaration
    mpz_class A, B, C, D, E, C3_24;  // GMP Integer
    int DIGITS, PREC, N;             // Integer
    double DIGITS_PER_TERM;          // Long
    clock_t t0, t1, t2;              // Time
    PQT compPQT(int n1, int n2);     // Computer PQT (by BSA)

public:
    Chudnovsky();                    // Constructor
    void compPi();                   // Compute PI
};

/*
 * Constructor
 */
Chudnovsky::Chudnovsky()
{
    // Constants
    DIGITS = 1000000;
    A      = 13591409;
    B      = 545140134;
    C      = 640320;
    D      = 426880;
    E      = 10005;
    DIGITS_PER_TERM = 14.1816474627254776555;  // = log(53360^3) / log(10)
    C3_24  = C * C * C / 24;
    N      = DIGITS / DIGITS_PER_TERM;
    PREC   = DIGITS * log2(10);
}

/*
 * Compute PQT (by Binary Splitting Algorithm)
 */
PQT Chudnovsky::compPQT(int n1, int n2)
{
    int m;
    PQT res;

    if (n1 + 1 == n2) {
        res.P  = (2 * n2 - 1);
        res.P *= (6 * n2 - 1);
        res.P *= (6 * n2 - 5);
        res.Q  = C3_24 * n2 * n2 * n2;
        res.T  = (A + B * n2) * res.P;
        if ((n2 & 1) == 1) res.T = - res.T;
    } else {
        m = (n1 + n2) / 2;
        PQT res1 = compPQT(n1, m);
        PQT res2 = compPQT(m, n2);
        res.P = res1.P * res2.P;
        res.Q = res1.Q * res2.Q;
        res.T = res1.T * res2.Q + res1.P * res2.T;
    }

    return res;
}

/*
 * Compute PI
 */
void Chudnovsky::compPi()
{
    cout << "**** PI Computation ( " << DIGITS << " digits )" << endl;

    // Time (start)
    t0 = clock();

    // Compute Pi
    PQT PQT = compPQT(0, N);
    mpf_class pi(0, PREC);
    pi  = D * sqrt((mpf_class)E) * PQT.Q;
    pi /= (A * PQT.Q + PQT.T);

    // Time (end of computation)
    t1 = clock();
    cout << "TIME (COMPUTE): "
         << (double)(t1 - t0) / CLOCKS_PER_SEC
         << " seconds." << endl;

    // Output
    ofstream ofs ("pi.txt");
    ofs.precision(DIGITS + 1);
    ofs << pi << endl;

    // Time (end of writing)
    t2 = clock();
    cout << "TIME (WRITE)  : "
         << (double)(t2 - t1) / CLOCKS_PER_SEC
         << " seconds." << endl;
}

int main()
{
    try
    {
        // Instantiation
        Chudnovsky objMain;

        // Compute PI
        objMain.compPi();
    }
    catch (...) {
        cout << "ERROR!" << endl;
        return -1;
    }

    return 0;
}
{% endhighlight %}

* [Gist - C++ source code to compute pi by Chudnovsky formula and Binary Splitting Algorithm using GMP libarary.](https://gist.github.com/komasaru/68f209118edbac0700da "Gist - C++ source code to compute pi with Chudnovsky formula and Binary Splitting Algorithm using GMP libarary.")

### 3. C++ ソースコードのコンパイル

作成した C++ ソースコードを以下のようにコンパイル。  
（`-Wall` 警告も出力するオプション、`-O2` 最適化のオプション、`-lgmp`, `-lgmpxx` は GMP, GMP(C++) ライブラリを使用するオプション）

``` text
$ g++ -Wall -O2 -o chudnovsky chudnovsky.cpp -lgmp -lgmpxx
```

### 4. 動作確認

``` text
$ ./chudnovsky
**** PI Computation ( 1000000 digits )
TIME (COMPUTE): 0.77846 seconds.
TIME (WRITE)  : 0.200936 seconds.
```

計算結果は "pi.txt" ファイルに出力される。（以下は、1,000,000 桁のうち最初と最後の150桁を抜粋後、可読性を高めるために整形）

File: `pi.txt`

{% highlight text linenos %}
3.14159265358979323846264338327950288419716939937510
  58209749445923078164062862089986280348253421170679
  82148086513282306647093844609550582231725359408128
                      :
                      :
                      :
  99779937654232062337471732470336976335792589151526
  03156140333212728491944184371506965520875424505989
  56787961303311646283996346460422090106105779458151
{% endhighlight %}

### 5. 計算結果検証

本来は別の公式・アルゴリズムで計算した結果と比較すべきでしょうが、（今回は計算桁数も少なくテキストエディタで開けるので）取り急ぎ任意の桁の数字が誤っていないかを別途計算済みの結果と目視で比較確認する。

当方は "[Pi Digits](http://bellard.org/pi/pi2700e9/pidigits.html "Pi Digits")" の計算結果と比較し、最初・中間・最後の部分が一致することを確認した。（現時点では１億桁までは）

テキストファイルのサイズは 1,000 万桁で 10MB(約 9.5 MiB), 1 億桁で 100MB(約 95.4MiB) になる。非力なマシンの場合は（そうでない場合も）テキストエディタで開くのに注意すること！

### 6. 桁別計算時間検証

<table class="common">
  <tr><th class="right">計算桁数(桁)</th><th class="right">計算時間(秒)</th><th class="right">結果出力時間(秒)</th></tr>
  <tr><td class="right">        100</td><td class="right">  0.000089</td><td class="right"> 0.000508</td></tr>
  <tr><td class="right">      1,000</td><td class="right">  0.000132</td><td class="right"> 0.000152</td></tr>
  <tr><td class="right">     10,000</td><td class="right">  0.001784</td><td class="right"> 0.000560</td></tr>
  <tr><td class="right">    100,000</td><td class="right">  0.044258</td><td class="right"> 0.010042</td></tr>
  <tr><td class="right">  1,000,000</td><td class="right">  0.784191</td><td class="right"> 0.199173</td></tr>
  <tr><td class="right"> 10,000,000</td><td class="right"> 14.686000</td><td class="right"> 3.520400</td></tr>
  <tr><td class="right">100,000,000</td><td class="right">248.655000</td><td class="right">56.875700</td></tr>
</table>

### 7. 参考サイト

1. [円周率.jp](http://xn--w6q13e505b.jp/ "円周率.jp")
2. [Pi Computation Record](http://bellard.org/pi/pi2700e9/announce.html "Pi Computation Record")

（計算アルゴリズムは 2 内の "pipcrecord.pdf" を参考にした）

---

ソースコードをより洗練したものにしたり、計算結果のファイル出力方法や結果の検証方法を改良したり、等々手を付ける余地はいくらでもあります。

ただ、非力なマシンでも１億桁計算するのに約４分しかかからないのは魅力であり、桁数を増やしてみようと意欲が湧いてきます。

以上。

