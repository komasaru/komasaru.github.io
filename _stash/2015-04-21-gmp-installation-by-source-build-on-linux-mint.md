---
layout   : single
title    : "GMP - ソースビルドでインストール (on Linux Mint)！"
published: true
date     : 2015-04-21 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---
こんにちは。

C や C++ で多倍長の数値演算を行いたく GMP ライブラリをソースビルドでインストールしてみました。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定しているが、 Unix 系 OS なら同様。
* 今回はソースをビルドしてインストールする。
* C だけでなく C++ でも使用可能となるようにする。
* 今回の動作確認は整数に関してのみ行なう。

### 1. GMP とは

* The GNU Multi Precision Arithmetic Library の略
* 符号付き整数や有理数、浮動小数を任意精度で扱うための算術ライブラリ
* GNU プロジェクトの一部

### 2. アーカイブの取得＆展開

最新の "tar.bz2" ファイルをダウンロードする。（"tar.lz", "tar.xz" でもよい。但し、"tar.lz" の展開には `lzip` コマンドが必要）

``` text
$ wget https://gmplib.org/download/gmp/gmp-6.0.0a.tar.bz2
$ tar jxvf gmp-6.0.0a.tar.bz2
```

### 3. ビルド＆インストール

以下の手順でビルド＆インストールする。（C++ に対応するために `configure` に `--enable-cxx` オプションを付加）

``` text
$ cd 6.0.0
$ ./configure --enable-cxx
$ make
$ make check
$ sudo make install
```

`/usr/local/lib` にインストールされる。

### 4. 動作確認用 C, C++ ソースコードの作成

動作確認用の C ソースコードを作成する。

File: `test_gmp.c`

{% highlight c linenos %}
/*************************************************************
 * GMP(The GNU Multi Presicion Arithmetic Library) Test by C.
 ************************************************************/
#include <gmp.h>

int main(int argc, char *argv[])
{
    // Declaration
    mpz_t op1, op2, op3, op5, op6, op7, op8;  // GMP Integer
    mpz_t rop, rop2;                          // GMP Integer
    unsigned int op4;                         // Unsigned integer

    // Initialization
    op4 = 100;
    mpz_init(op1);
    mpz_init(op2);
    mpz_init(op3);
    mpz_init(op5);
    mpz_init(op6);
    mpz_init(op7);
    mpz_init(op8);
    mpz_init(rop);
    mpz_init(rop2);
    mpz_set_ui(op1, 123456789);   // GMP Unsigned integer
    mpz_set_ui(op2, 987654);      // GMP Unsigned integer
    mpz_set_ui(op3, 2);           // GMP Unsigned integer
    mpz_set_ui(op5, op4);         // GMP Unsigned integer
    mpz_set_ui(op6, 123456789);   // GMP Unsigned integer
    mpz_set_ui(op7, 987654);      // GMP Unsigned integer
    mpz_set_si(op8, -999999999);  // GMP Signed integer

    // Addition
    mpz_add(rop, op1, op2);
    gmp_printf("%Zd + %Zd = %Zd\n", op1, op2, rop);

    // Subtraction
    mpz_sub(rop, op1, op2);
    gmp_printf("%Zd - %Zd = %Zd\n", op1, op2, rop);

    // Multiplication
    mpz_mul(rop, op1, op2);
    gmp_printf("%Zd * %Zd = %Zd\n", op1, op2, rop);

    // Multiplication & addition
    mpz_addmul(rop, op2, op3);
    gmp_printf("+ %Zd * %Zd = %Zd\n", op2, op3, rop);

    // Multiplication & subtraction
    mpz_submul(rop, op2, op3);
    gmp_printf("- %Zd * %Zd = %Zd\n", op2, op3, rop);

    // Division(Remaider)
    mpz_cdiv_q(rop, op6, op7);
    gmp_printf("%Zd / %Zd = %Zd\n", op6, op7, rop);
    mpz_cdiv_qr(rop, rop2, op6, op7);
    gmp_printf("%Zd / %Zd = %Zd ... %Zd\n", op6, op7, rop, rop2);
    mpz_fdiv_q(rop, op6, op7);
    gmp_printf("%Zd / %Zd = %Zd\n", op6, op7, rop);
    mpz_fdiv_qr(rop, rop2, op6, op7);
    gmp_printf("%Zd / %Zd = %Zd ... %Zd\n", op6, op7, rop, rop2);
    mpz_tdiv_q(rop, op6, op7);
    gmp_printf("%Zd / %Zd = %Zd\n", op6, op7, rop);
    mpz_tdiv_qr(rop, rop2, op6, op7);
    gmp_printf("%Zd / %Zd = %Zd ... %Zd\n", op6, op7, rop, rop2);

    // Modulo
    mpz_mod(rop, op6, op7);
    gmp_printf("%Zd mod %Zd = %Zd\n", op6, op7, rop);

    // Left shift
    mpz_mul_2exp(rop, op3, op4);
    gmp_printf("%Zd << %d = %Zd\n", op3, op4, rop);

    // Power
    mpz_pow_ui(rop, op3, op4);
    gmp_printf("%Zd ^ %d = %Zd\n", op3, op4, rop);

    // Power and modulo
    mpz_powm(rop, op3, op5, op6);
    gmp_printf("(%Zd ^ %Zd) mod %Zd = %Zd\n", op3, op5, op6, rop);

    // Negative value (Sign inversion)
    mpz_neg(rop, op1);
    gmp_printf("%Zd * (-1) = %Zd\n", op1, rop);

    // Absolute value
    mpz_abs(rop, op8);
    gmp_printf("abs(%Zd) = %Zd\n", op8, rop);

    // Square root
    mpz_sqrt(rop, op1);
    gmp_printf("sqrt(%Zd) = %Zd\n", op1, rop);
    mpz_sqrtrem(rop, rop2, op1);
    gmp_printf("sqrt(%Zd) = %Zd ... %Zd\n", op1, rop, rop2);

    // Deallocation
    mpz_clear(op1);
    mpz_clear(op2);
    mpz_clear(op3);
    mpz_clear(op5);
    mpz_clear(op6);
    mpz_clear(op7);
    mpz_clear(op8);
    mpz_clear(rop);

    return 0;
}
{% endhighlight %}

* [Gist - C source code to calculate values with GMP library.](https://gist.github.com/komasaru/b605f9193ecb7e4231fa "Gist - C source code to calculate values with GMP library.")

（除算・剰余で使用している `cdiv` の `c` は ceil の略で小数点以下切り上げ、`fdiv` の `f` は floor の略で整数部分のみ、`tdiv` の `t` は truncate の略で小数点以下切り捨てという意味）

上記の他に、素数、最大公約数、最小公倍数、ヤコビ、ルシャンドル、クロネッカー、フィボナッチ、値の比較、論理演算・ビット演算等々、様々な関数が用意されている。

同様に、動作確認用の C++ ソースコードを作成する。C と同様の記述も可能だが C++ 用にラップされた記述方法で作成する。（除算＆剰余、べき乗＆剰余等は個別に工夫すればよいので省略）

File: `test_gmp.cpp`

{% highlight c linenos %}
/***************************************************************
 * GMP(The GNU Multi Presicion Arithmetic Library) Test by C++.
 **************************************************************/
#include <iostream>  // for cout
#include <gmp.h>
#include <gmpxx.h>

using namespace std;

class TestGmp
{
    // Declaration
    mpz_class op1, op2, op3, op5, op6, op7;  // GMP Integer
    mpz_class rop;                           // GMP Integer
    unsigned int op4;                        // Unsigned integer

public:
    TestGmp();        // Constructor
    void execTest();  // Execute test
};

/*
 * Constructor
 */
TestGmp::TestGmp()
{
    // Initialization
    op1 = 123456789;   // GMP Integer
    op2 = 987654;      // GMP Integer
    op3 = 2;           // GMP Integer
    op4 = 100;         // Unsigned integer
    op5 = 123456789;   // GMP Integer
    op6 = 987654;      // GMP Integer
    op7 = -999999999;  // GMP Integer
}

/*
 * Execute test
 */
void TestGmp::execTest()
{
    // Addition
    rop = op1 + op2;
    cout << op1 << " + " << op2 << " = " << rop << endl;

    // Subtraction
    rop = op1 - op2;
    cout << op1 << " - " << op2 << " = " << rop << endl;

    // Multiplication
    rop = op1 * op2;
    cout << op1 << " * " << op2 << " = " << rop << endl;

    // Division(Remaider)
    rop = op5 / op6;
    cout << op5 << " / " << op6 << " = " << rop << endl;

    // Modulo
    rop = op5 % op6;
    cout << op5 << " % " << op6 << " = " << rop << endl;

    // Left shift
    rop = op3 << op4;
    cout << op3 << " << " << op4 << " = " << rop << endl;

    // Absolute value
    rop = abs(op7);
    cout << "abs(" << op7 << ") = " << rop << endl;

    // Square root
    rop = sqrt(op1);
    cout << "sqrt(" << op1 << ") = " << rop << endl;
}

int main()
{
    try
    {
        // Instantiation
        TestGmp objGmp;

        // Execute test
        objGmp.execTest();
    }
    catch (...) {
        cout << "ERROR!" << endl;
        return -1;
    }

    return 0;
}
{% endhighlight %}

* [Gist - C++ source code to calculate values with GMP library.](https://gist.github.com/komasaru/27fb23b7ef1cf66a4a3a "Gist - C++ source code to calculate values with GMP library.")

### 5. C, C++ ソースコードのコンパイル

`-Wall` は警告も出力するオプション、`-O2` は最適化のオプション、`-lgmp` は GMP ライブラリを読み込むオプション。  
`-lgmp` は最後に指定する。

``` text
$ gcc -Wall -O2 -lgmp -o test_gmp_c test_gmp.c

$ g++ -Wall -O2 -lstdc++ -lgmp -lgmpxx -o test_gmp_cpp test_gmp.cpp
```

### 6. 動作確認

``` text
$ ./test_gmp_c
123456789 + 987654 = 124444443
123456789 - 987654 = 122469135
123456789 * 987654 = 121932591483006
+ 987654 * 2 = 121932593458314
- 987654 * 2 = 121932591483006
123456789 / 987654 = 126
123456789 / 987654 = 126 ... -987615
123456789 / 987654 = 125
123456789 / 987654 = 125 ... 39
123456789 / 987654 = 125
123456789 / 987654 = 125 ... 39
123456789 mod 987654 = 39
2 << 100 = 2535301200456458802993406410752
2 ^ 100 = 1267650600228229401496703205376
(2 ^ 100) mod 123456789 = 83598172
123456789 * (-1) = -123456789
abs(-999999999) = 999999999
sqrt(123456789) = 11111
sqrt(123456789) = 11111 ... 2468

$ ./test_gmp_cpp
123456789 + 987654 = 124444443
123456789 - 987654 = 122469135
123456789 * 987654 = 121932591483006
123456789 / 987654 = 125
123456789 % 987654 = 39
2 << 100 = 2535301200456458802993406410752
abs(-999999999) = 999999999
sqrt(123456789) = 11111
```

### 参考サイト

* [The GNU MP Bignum Library](https://gmplib.org/ "The GNU MP Bignum Library")

（ドキュメントは [GNU MP 6.0.0](https://gmplib.org/manual/ "GNU MP 6.0.0")）

---

整数以外に有理数や浮動小数についても理解すると、数値計算を行う際に威力を発揮することでしょう。

以上。

