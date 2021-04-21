---
layout   : single
title    : "C++ - 円周率計算（BBP の公式使用）！"
published: true
date     : 2015-05-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
- 円周率
---
こんにちは。

円周率を計算する際、小数点以下1桁目から希望の桁までを全て計算する方法以外に、希望の桁だけを計算する方法もあります。

小数点以下1桁目から希望の桁までを全て計算した後、任意の桁の値が正しいかどうかを検証するために使用したりします。

今回は BBP(Bailey, Borwein, Plouffe ) の公式を使用して任意の桁の円周率を16進で計算するアルゴリズムを、C++ で実装してみました。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* 計算に使用したマシンは CPU: Intel Core2Duo E8500 ( 3.16GHz ), MEM: 3.9GiB

### 1. BBP の公式を使用した円周率計算について

（数式が多いので $$\LaTeX$$ で作成した文書を貼り付け）（PDF ファイルは「[mk-mode SITE: アーカイブ](http://www.mk-mode.com/rails/archive#arc-math "mk-mode SITE: アーカイブ")」に置いた）

![PI_BBP]({{site.baseurl}}/images/2015/05/17/PI_BBP.png "PI_BBP")

### 2. C++ ソースコードの作成

第1引数で計算を開始する桁を指定し、その桁から 14 桁ほど計算後に先頭 10 桁を出力する仕様。（べき剰余の演算も自前で実装。「[C++ - べき剰余アルゴリズムの実装！]({{site.baseurl}}/2015/05/13/cpp-implementation-of-modular-exponentiation "C++ - べき剰余アルゴリズムの実装！")」参照）

File: `pi_bbp.cpp`

{% highlight c linenos %}
/***************************************************************
 * Computing pi with BBP formula.
 **************************************************************/
#include <math.h>
#include <iostream>
#include <stdio.h>
#include <stdlib.h>

using namespace std;

class Bbp
{
    // Declaration
    int     d;                          // Digits to compute
    double  pi;                         // Pi
    char    pi_hex[14];                 // Pi(Hex)
    clock_t t0, t1;                     // Time
    double  S(int);                     // Compute S
    long    compModExp(int, int, int);  // Computer Modular Exponentiation
    void    convHex(double, char[]);    // Convert Pi to Hex-string

public:
    Bbp(int);            // Constructor
    void compPi();       // Compute PI
};

/*
 * Constructor
 */
Bbp::Bbp(int d)
{
    cout << "**** PI Computation ( digit: " << d << " )" << endl;
    this->d = d - 1;
}

/*
 * Compute PI
 */
void Bbp::compPi()
{
    // Time (start)
    t0 = clock();

    // Compute Pi
    pi = 4.0 * S(1) - 2.0 * S(4) - S(5) - S(6);
    pi = pi - (int)pi + 1.0;
    convHex(pi, pi_hex);
    printf("FRACTION  : %.15f\n",   pi);
    printf("HEX DIGITS: %10.10s\n", pi_hex);

    // Time (end of computation)
    t1 = clock();
    cout << "( TIME: " << (double)(t1 - t0) / CLOCKS_PER_SEC
         << " seconds )" << endl;
}

/*
 * Compute S
 */
double Bbp::S(int j)
{
    double s = 0.0;        // Summation of Total, Left
    double t;              // Each term of right summation
    int    r;              // Denominator
    int    k;              // Loop index
    double EPS = 1.0e-17;  // Loop-exit accuration of the right summation

    // Left Sum (0 ... d)
    for (k = 0; k <= d; k++) {
        r = 8 * k + j;
        t = (double)compModExp(16, d - k, r);
        t /= r;
        s += t - (int)t;
        s -= (int)s;
    }

    // Right sum (d + 1 ...)
    while (1) {
        r = 8 * k + j;
        t = pow(16.0, (double)(d - k));
        t /= (double)r;
        if (t < EPS) break;
        s += t;
        s -= (int)s;
        k ++;
    }

    return s;
}

/*
 * Compute Modular Exponentiation
 */
long Bbp::compModExp(int b, int e, int m)
{
    long ans;

    if (e == 0) return 1;

    ans = compModExp(b, e / 2, m);
    ans = (ans * ans) % m;
    if ((e % 2) == 1) ans = (ans * b) % m;

    return ans;
}

/*
 * Convert Pi to Hex-strings
 */
void Bbp::convHex(double x, char chx[]) {
    double y;
    int i;
    const char hx[] = "0123456789ABCDEF";

    y = fabs(x);
    for (i = 0; i < 16; i++) {
        y = 16.0 * (y - floor(y));
        chx[i] = hx[(int)(y)];
    }
}

int main(int argc, char** argv)
{
    try
    {
        // Getting arguments
        if (argc == 1) {
            cout << "Please input a digit to compute!" << endl;
            return EXIT_FAILURE;
        }
        int d = atoi(argv[1]);

        // Instantiation
        Bbp objMain(d);

        // Compute PI
        objMain.compPi();
    }
    catch (...) {
        cout << "ERROR!" << endl;
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to compute pi with BBP formula.](https://gist.github.com/komasaru/9e418eb666ab649ef589 "Gist - C++ source code to compute pi with BBP formula.")

### 3. C++ ソースコードのコンパイル

作成した C++ ソースコードを以下のようにコンパイル。  
（`-Wall` 警告も出力するオプション、`-O2` 最適化のオプション）

``` text
$ g++ -Wall -O2 -o pi_bbp pi_bbp.cpp
```

### 4. 動作確認

`HEX DIGITS` が求める円周率（16進）。（但し、計算公式の特性上、後半の桁の値は保証されない）

``` text
$ ./pi_bbp 1
**** PI Computation ( digit: 1 )
FRACTION  : 0.141592653589793
HEX DIGITS: 243F6A8885
( TIME: 5.1e-05 seconds )

$ ./pi_bbp 91
**** PI Computation ( digit: 91 )
FRACTION  : 0.910345837630448
HEX DIGITS: E90C6CC0AC
( TIME: 0.0001 seconds )

$ ./pi_bbp 991
**** PI Computation ( digit: 991 )
FRACTION  : 0.284592623548894
HEX DIGITS: 48DB0FEAD3
( TIME: 0.001648 seconds )

$ ./pi_bbp 9991
**** PI Computation ( digit: 9991 )
FRACTION  : 1.151042259944499
HEX DIGITS: 26AAB49EC6
( TIME: 0.015286 seconds )

$ ./pi_bbp 99991
**** PI Computation ( digit: 99991 )
FRACTION  : 1.633399233605157
HEX DIGITS: A22673C1A5
( TIME: 0.173048 seconds )

$ ./pi_bbp 999991
**** PI Computation ( digit: 999991 )
FRACTION  : 1.624957331312628
HEX DIGITS: 9FFD342362
( TIME: 2.06615 seconds )

$ ./pi_bbp 9999991
**** PI Computation ( digit: 9999991 )
FRACTION  : 0.756411434763846
HEX DIGITS: C1A42E06A1
( TIME: 24.2591 seconds )

$ ./pi_bbp 99999991
**** PI Computation ( digit: 99999991 )
FRACTION  : 0.610248188412270
HEX DIGITS: 9C3939ABAC
( TIME: 280.681 seconds )
```

### 5. 計算結果検証

"[Pi Digits](http://bellard.org/pi/pi2700e9/pidigits.html "Pi Digits")" の計算結果と比較し、任意のあらゆる部分が一致することを確認した。

### 6. 参考サイト

* [円周率.jp](http://xn--w6q13e505b.jp/ "円周率.jp")
* [BBP Code Directory](http://www.experimentalmath.info/bbp-codes/ "BBP Code Directory")
* [Pi Computation Record](http://bellard.org/pi/pi2700e9/announce.html "Pi Computation Record")

---

Chudnovsky の公式を使用して小数点以下1桁目から1億桁目まで計算するのと、 BBP の公式を使用して1億桁目（但し、16進）を計算するのとではあまり計算時間に差がないようなので、円周率の任意の桁の値を検証するのにそれほどストレスを感じないでしょう。（当然、環境にもよるでしょうが）

以上。

