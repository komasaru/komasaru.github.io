---
layout   : single
title    : "C++ - 二項係数の計算！"
published: true
date     : 2020-09-09 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C++
---

C++ で二項係数の計算をしてみました。（各種計算式を使用して）

過去には Ruby や Fortran で計算しています。

* [Ruby - 二項係数の計算！]({{site.baseurl}}/2020/02/05/ruby-binomial-coefficients "Ruby - 二項係数の計算！")
* [Fortran - 二項係数の計算！ ]({{site.baseurl}}/2020/02/08/fortran95-binomial-coefficients "Fortran - 二項係数の計算！ ")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。
* 任意精度算術ライブラリ GMP(The GNU Multi Precision Arithmetic Library) を利用する。

### 1. 二項係数について

$$n$$ 個の物から $$r$$ 個のものを選ぶ組み合わせは $$_nC_r$$ 通りあり、 $$\displaystyle \binom{n}{r}$$ とも表す。また、二項級数（二項定理）の係数であることから、 $$\textbf{二項係数}$$ とも呼ばれる。

以下、二項係数の主な重要性質。

$$
\begin{eqnarray}
\binom{n}{r} &=& _nC_r = \frac{_nP_r}{r!} = \frac{n!}{r!(n - r)!} \tag{1} \\
\binom{n}{r} &=& \binom{n}{n-r} \\
\binom{n}{0} &=& 1 \\
\binom{n}{r} &=& \binom{n-1}{r} + \binom{n-1}{r-1} \tag{2} \\
\binom{n}{r} &=& \frac{n}{r}\binom{n-1}{r-1} \tag{3} \\
\binom{n}{r} &=& \frac{n^{\underline{r}}}{r!} = \frac{n(n-1)(n-2)\cdots(n-(r-1))}{r(r-1)(r-2)\cdots1} = \prod_{i=1}^{r}\frac{n-i+1}{i} \tag{4} \\
&&(n^{\underline{r}}は下降階乗冪) \nonumber
\end{eqnarray}
$$

### 2. ソースコードの作成

* 4種の計算式を使用する。（前述の (1), (2), (3), (4)）  
（使用する計算式（メソッド）の切り替えはコメント／アンコメントで）
* 共通関数部分、計算部分、実行部分とソースファイルを分けている。
* $$\displaystyle \binom{n}{r}$$ を $$(n\ r)$$ で表示。

File: `common.hpp`

{% highlight c linenos %}
#ifndef BINOMIAL_COEFFICIENTS_COMMON_HPP_
#define BINOMIAL_COEFFICIENTS_COMMON_HPP_

#include <regex>
#include <string>

#include <gmp.h>
#include <gmpxx.h>

namespace my_lib {
  bool is_int(std::string);
  mpz_class fact(mpz_class);
}

#endif
{% endhighlight %}

File: `common.cpp`

{% highlight c linenos %}
#include "common.hpp"

namespace my_lib {
  /*
   * Integer judgment
   */
  bool is_int(std::string s) {
    std::smatch m;
    std::regex re("^[+-]?\\d+$");

    try {
      if (!std::regex_search(s, m, re))
        return false;
    } catch (std::regex_error& e) {
      return false;
    }

    return true;
  }

  /*
   * Caculation of fatorial
   */
  mpz_class fact(mpz_class n) {
    try {
      if (n == 0)
        return 1;
      return n * fact(n-1);
    } catch (...) {
      throw;
    }
  }
}
{% endhighlight %}

File: `calc.hpp`

{% highlight c linenos %}
#ifndef BINOMIAL_COEFFICIENTS_CALC_HPP_
#define BINOMIAL_COEFFICIENTS_CALC_HPP_

#include <iostream>  // for cout
#include <gmp.h>
#include <gmpxx.h>

namespace my_lib {
  class Calc {

  public:
      mpz_class binom_1(mpz_class, mpz_class);
      mpz_class binom_2(mpz_class, mpz_class);
      mpz_class binom_3(mpz_class, mpz_class);
      mpz_class binom_4(mpz_class, mpz_class);
  };
}

#endif
{% endhighlight %}

File: `calc.cpp`

{% highlight c linenos %}
#include "calc.hpp"
#include "common.hpp"

namespace my_lib {
  /*
   * 二項係数の計算(1)
   *   計算式: (n r) = n! / r!(n -r)!
   *
   * @param n: n の値
   * @param r: r の値
   * @return : 二項係数
   */
  mpz_class Calc::binom_1(mpz_class n, mpz_class r) {
    try {
      if (r == 0 || r == n)
        return 1;
      return my_lib::fact(n) / (my_lib::fact(r) * my_lib::fact(n - r));
    } catch (...) {
      throw;
    }
  }

  /*
   * 二項係数の計算(2)
   *   計算式: (n r) = ((n - 1) r) + ((n - 1) (k - 1))
   *           (recursively)
   *
   * @param  n: n の値
   * @param  r: r の値
   * @return  : 二項係数
   */
  mpz_class Calc::binom_2(mpz_class n, mpz_class r) {
    try {
      if (r == 0 || r == n)
        return 1;
      return binom_2(n - 1, r) + binom_2(n - 1, r - 1);
    } catch (...) {
      throw;
    }
  }

  /*
   * 二項係数の計算(3)
   *   計算式: (n r) = (n / r) * ((n - 1) (k - 1))
   *           (recursively)
   *
   * @param  n: n の値
   * @param  r: r の値
   * @return  : 二項係数
   */
  mpz_class Calc::binom_3(mpz_class n, mpz_class r) {
    try {
      if (r == 0 || r == n)
        return 1;
      return n * binom_3(n - 1, r - 1) / r;
    } catch (...) {
      throw;
    }
  }

  /*
   * 二項係数の計算(4)
   *   計算式: (n r) = Π(n - i + 1) / i  (i = 1, ..., r)
   *
   * @param  n: n の値
   * @param  r: r の値
   * @return  : 二項係数
   */
  mpz_class Calc::binom_4(mpz_class n, mpz_class r) {
    mpz_class a;
    int i;

    try {
      if (r == 0 || r == n)
        return 1;
      a = 1;
      for (i = 1; i <= r; i++)
        a = a * (n - i + 1) / i;
      return a;
    } catch (...) {
      throw;
    }
  }
}
{% endhighlight %}

File: `binomial_coefficients.cpp`

{% highlight c linenos %}
/***************************************************************
  Binomial coefficients
  by GMP(The GNU Multi Presicion Arithmetic Library).

    DATE          AUTHOR          VERSION
    2020.08.24    mk-mode.com     1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.
***************************************************************/
#include "common.hpp"
#include "calc.hpp"

#include <iostream>  // for cout
#include <gmp.h>
#include <gmpxx.h>

int main(int argc, char* argv[]) {
  my_lib::Calc bc;
  mpz_class n;
  mpz_class r;
  std::string buf_n;
  std::string buf_r;

  try {
    while (true) {
      // n, r 入力＆チェック
      std::cout << "n? ";
      getline(std::cin, buf_n);
      if (buf_n.empty())
        break;
      std::cout << "r? ";
      getline(std::cin, buf_r);
      if (buf_r.empty())
        break;
      if (!my_lib::is_int(buf_n)) {
        std::cout << "n is not a integer !!" << std::endl;
        break;
      }
      n.set_str(buf_n, 10);
      if (!my_lib::is_int(buf_r)) {
        std::cout << "r is not a integer !!" << std::endl;
        break;
      }
      r.set_str(buf_r, 10);
      if (r < 0) {
        std::cout << "r < 0 !!" << std::endl;
        break;
      }
      if (n < r) {
        std::cout << "n < r !!" << std::endl;
        break;
      }
      if (r * 2 > n)
        r = n - r;
      // 計算
      // （計算方法 1 - 4 から選ぶ）
      std::cout << "(" << n << " " << r << ") = "
      //        << bc.binom_1(n, r)  << std::endl;
      //        << bc.binom_2(n, r)  << std::endl;  // <= too slow
                << bc.binom_3(n, r)  << std::endl;
      //        << bc.binom_4(n, r)  << std::endl;
      std::cout << "---" << std::endl;
    }
  } catch (...) {
    std::cerr << "EXCEPTION!" << std::endl;
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to calculate binomial coefficients.](https://gist.github.com/komasaru/bda0a82f67fc1e1648e7ae60388d8489 "Gist - C++ source code to calculate binomial coefficients.")

### 3. ソースコードのコンパイル

まず、以下のように `Makefile` を作成する。（**行頭のインデントはタブ文字**）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors -lgmp -lgmpxx

binomial_coefficients: binomial_coefficients.o common.o calc.o
  g++ $(gcc_options) -o $@ $^

binomial_coefficientso : binomial_coefficients.cpp
  g++ $(gcc_options) -c $<

common.o : common.cpp
  g++ $(gcc_options) -c $<

calc.o : calc.cpp
  g++ $(gcc_options) -c $<

run : binomial_coefficients
  ./binomial_coefficients

clean :
  rm -f ./binomial_coefficients
  rm -f ./*.o

.PHONY : run clean
```

そして、ビルド（コンパイル＆リンク）。

``` text
$ make
```

### 4. 動作確認

``` text
$ ./binomial_coefficients
n? 0
r? 1
n < r !!

$ ./binomial_coefficients
n? 1
r? -1
r < 0 !!

$./binomial_coefficients
n? 1
r? 0.9
r is not a integer !!

$./binomial_coefficients
n? 1.1
r? 1
n is not a integer !!

$./binomial_coefficients
n? 1
r? 0
(1 0) = 1
---
n? 1
r? 1
(1 0) = 1
---
n? 10
r? 2
(10 2) = 45
---
n? 100
r? 3
(100 3) = 161700
---
n? 1000
r? 4
(1000 4) = 41417124750
---
n? 5000
r? 500
(5000 500) = 1523835705022762417731122990382870117598055177177749896120639633248
52197721349960590884233711082048864016759544054508257767390473359453022881045964
12151481279032572628587506952815691445272815864618334838578548489705130296370245
64696619256490139380256756521034067102189053550770577321962948522784729534964403
92540565238652496586095257231832780763525058654245376714838913660805861811146730
93555560987897570461892398850728174637647049432100899628473901889341073510672285
79300289733788771300549317475095309560616933594701759502335749628087140048422879
21921934995121777448532875190191549476629085646880295182806621692835943142454947
817131669088583382928050125741393952210717943794438066831202814961683139272640
---
n? 5000
r? 2500
(5000 2500) = 159371868534943837569102579293591908725712943416872973851142188872
51837382493431686287213219873720822167251140255586274319294525384036479538230600
45455657769129873122313919773933964584614308322449299176148648925847304800236435
69324440941033122054431815988922710259363445810754908935865678405373624758440142
03104454736819415705000424225962058208266135708049851520824960607972807738936458
48289449988113029002848965835841822271292556855461484325271065638860012861073778
99921899687103515889919865427858237130967767130609676943231412653788905965373961
47632671481841535540424355320173551397630020464441895106536721014270759750902584
26372731594098223421430173974301569687693275235007610580759241697870484100945163
80576648834071389764219710654228317495379496864978320655899261989942546527231492
15649094893728739354576215354622894873385925840937185218967602378468492022604595
97759609074699359963531119710383496975952571120686883790602219730843976469983385
08204919354733582579870624849879889676174460976122775385758620413007337772999115
85208214180922176383626728533535383779826850949403248877209443871900080303347588
15325466470631385207196227449676806821464461022872946644055882208785540986721560
17625258655808836672678297382431552986285808523385657662333675986503447991467900
65148746117755061771145797054498841333445350685855168429875466164635559238590876
50313307613765393769667190506797376737518707832888662700172790377793259351868797
507163339600827270303879295319252652644612708041188699645673663207276383716320
---
n?
```

* 計算結果が多桁になる最後の2件は、実際には改行されていない。

---

以上。

