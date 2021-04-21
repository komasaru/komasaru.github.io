---
layout   : single
title    : "MPFR - ソースビルドでインストール (on Linux Mint)！"
published: true
date     : 2015-05-10 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
---
こんにちは。

C や C++ で多倍長浮動小数点演算を行いたく MPFR ライブラリをソースビルドでインストールしてみました。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定しているが、 Unix 系 OS なら同様。

### 1. MPFR とは

* The GNU Multiple Precision Floating-Point Reliably の略
* 多倍長浮動小数点を高精度で扱うためのライブラリ
* GNU プロジェクトの一部

### 2. アーカイブの取得＆展開

最新の "tar.gz" ファイルをダウンロード後に展開。（tar.xz”, "tar.bz2", "zip" でもよい）

``` text
$ wget http://www.mpfr.org/mpfr-current/mpfr-3.1.2.tar.gz
$ tar zxvf mpfr-3.1.2.tar.gz
```

### 3. ビルド＆インストール

``` text
$ cd mpfr-3.1.2
$ ./configure
$ make
$ make check
$ sudo make install
```

/usr/local/lib にインストールされる。

### 4. 動作確認用 C ソースコードの作成

動作確認用の C ソースコードを作成する。  
（以下は、[参考サイト](http://www.mpfr.org/sample.html "Starting with the GNU MPFR Library")の Sample コードで、$$1+\frac{1}{1!}+\frac{1}{2!}+\cdots+\frac{1}{100!}$$ を 200 bit の精度で計算するもの）

File: `text_mpfr.c`

{% highlight c linenos %}
/*************************************************************
 * MPFR(The GNU Multi Presicion Floating-Point Reliably Library) Test by C.
 ************************************************************/
#include <stdio.h>

#include <gmp.h>
#include <mpfr.h>

int main (void)
{
    unsigned int i;
    mpfr_t s, t, u;

    mpfr_init2 (t, 200);
    mpfr_set_d (t, 1.0, MPFR_RNDD);
    mpfr_init2 (s, 200);
    mpfr_set_d (s, 1.0, MPFR_RNDD);
    mpfr_init2 (u, 200);
    for (i = 1; i <= 100; i++) {
        mpfr_mul_ui (t, t, i, MPFR_RNDU);
        mpfr_set_d (u, 1.0, MPFR_RNDD);
        mpfr_div (u, u, t, MPFR_RNDD);
        mpfr_add (s, s, u, MPFR_RNDD);
    }
    printf ("Sum is ");
    mpfr_out_str (stdout, 10, 0, s, MPFR_RNDD);
    putchar ('\n');
    mpfr_clear (s);
    mpfr_clear (t);
    mpfr_clear (u);
    return 0;
}
{% endhighlight %}

### 5. C ソースコードのコンパイル

`-Wall` は警告も出力するオプション、`-O2` は最適化のオプション、`-lmpfr`, `-lgmp` は MPFR, GMP ライブラリを読み込むオプション。

``` text
$ gcc -Wall -O2 -o test_mpfr_c test_mpfr.c -lmpfr -lgmp
```

### 6. 動作確認

``` text
$ ./test_mpfr_c
Sum is 2.7182818284590452353602874713526624977572470936999595749669131
```

### 参考サイト

* [The GNU MPFR Library](http://www.mpfr.org/ "The GNU MPFR Library")

---

以上。

