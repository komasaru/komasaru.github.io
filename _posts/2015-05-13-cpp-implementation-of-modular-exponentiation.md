---
layout   : single
title    : "C++ - べき剰余アルゴリズムの実装！"
published: true
date     : 2015-05-13 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
---
こんにちは。

C++ に「べき剰余アルゴリズム」を実装したい事案があったので、記録しておきます。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* G++ 4.8.2, 4.9.1 での作業を想定。（特別なことはしていないので、他のバージョンでも問題ないはず）

### 1. べき剰余について

その名のとおり、べき乗の剰余のことである。

底を $$b(\in\mathbb{Z})$$ 、べき指数を $$e(\in\mathbb{Z})$$ 、剰余を $$m(\in\mathbb{Z})$$ とすると、べき剰余 $$c$$ は次のように表される。

$$
c \equiv b^e \pmod m
$$

### 2. べき剰余演算アルゴリズムについて

当然単純にべき乗後に剰余を計算してもよいが、計算機ではべき乗時にすぐにオーバーフローしてしまうことは目に見えている。（この場合の計算量は、 $$O(\log(e))$$回の乗算と最後の剰余１回となる）  
そこで、計算機での計算に都合のいいように計算しなければならない。

たとえば、$$a, b (\in\mathbb{Z})$$ があるとき、

$$
(a \times b)\pmod m \equiv ((a\pmod m) \times (b\pmod m))\pmod m
$$

と変形できる。このアルゴリズムを使用すると、剰余計算が$$O(\log(e))$$回に増えるが乗算それぞれの計算コストは低くなるため、計算機にとってはパフォーマンスが良くなる。

また、プログラミングで実装する際、

$$
b^e = 
\begin{cases}
    b \, ( b^{2})^{\frac{e - 1}{2}} & \mbox{( } e \mbox{ ：奇数)} \\
    (b^{2})^{\frac{e}{2}} & \mbox{( } e \mbox{ ：偶数)}
\end{cases}
$$

であることを再帰的に利用するとパフォーマンスがよくなるだろう。

### 3. C++ ソースコードの作成

まず、比較のために非再帰的な記述方法で作成。

File: `modular_exponentiation_1.cpp`

{% highlight c linenos %}
/***************************************************************
 * Modular Exponentiation (iterative).
 **************************************************************/
#include <iostream>
#include <stdlib.h>

using namespace std;

class ModularExponentiation
{
    int ans;                    // Answer
public:
    int compME(int, int, int);  // Compute Modular Exponentiation
};

/*
 * Compute Modular Exponentiation
 */
int ModularExponentiation::compME(int b, int e, int m)
{
    ans = 1;

    while (e > 0) {
       if ((e & 1) == 1) ans = (ans * b) % m;
       e >>= 1;
       b = (b * b) % m;
    }

    return ans;
}

int main()
{
    try
    {
        // Declaration
        int b, e, m, me;  // me = b^e mod m
        b = 12345; e = 6789; m = 4567;

        // Instantiation
        ModularExponentiation objMain;

        // Modular Exponentiation Computation
        me = objMain.compME(b, e, m);

        // Display
        cout << b << "^" << e << " mod " << m << " = "
             << me << endl;
    }
    catch (...) {
        cout << "ERROR!" << endl;
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to compute modular exponetiation iteratively.](https://gist.github.com/komasaru/573f949235ef5d57ea2f "Gist - C++ source code to compute modular exponetiation iteratively.")

次に、再帰的な記述方法で作成。(`compME` 関数の内容が異なるだけ）

File: `modular_exponentiation_2.cpp`

{% highlight c linenos %}
/***************************************************************
 * Modular Exponentiation (recursive).
 **************************************************************/
#include <iostream>
#include <stdlib.h>

using namespace std;

class ModularExponentiation
{
    int ans;                    // Answer
public:
    int compME(int, int, int);  // Compute Modular Exponentiation
};

/*
 * Compute Modular Exponentiation
 */
int ModularExponentiation::compME(int b, int e, int m)
{
    if (e == 0) return 1;

    ans = compME(b, e / 2, m);
    ans = (ans * ans) % m;
    if (e % 2 == 1) ans = (ans * b) % m;

    return ans;
}

int main()
{
    try
    {
        int b, e, m, me;  // me = b^e mod m
        b = 12345; e = 6789; m = 4567;

        // Instantiation
        ModularExponentiation objMain;

        // Compute Modular Exponentiation
        me = objMain.compME(b, e, m);

        // Display
        cout << b << "^" << e << " mod " << m << " = "
             << me << endl;
    }
    catch (...) {
        cout << "ERROR!" << endl;
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}
{% endhighlight %}

* [Gist - C++ source code to compute modular exponetiation recursively.](https://gist.github.com/komasaru/03c42ccb8ea0eda3722e "Gist - C++ source code to compute modular exponetiation recursively.")

### 4. C++ ソースコードのコンパイル

作成した C++ ソースコードを以下のようにコンパイル。  
（`-Wall` 警告も出力するオプション、`-O2` 最適化のオプション）

``` text
$ g++ -Wall -O2 -o modular_exponentiation_1 modular_exponentiation_1.cpp
$ g++ -Wall -O2 -o modular_exponentiation_2 modular_exponentiation_2.cpp
```

### 5. 動作確認

``` text
$ ./modular_exponentiation_1
12345^6789 mod 4567 = 62

$ ./modular_exponentiation_2
12345^6789 mod 4567 = 62
```

### 6. 参考サイト

* [冪剰余 - Wikipedia](http://ja.wikipedia.org/wiki/%E5%86%AA%E5%89%B0%E4%BD%99 "冪剰余 - Wikipedia")

---

べき乗の計算だけで莫大な桁数になるものが、整数型の範囲内でコストをかけずに瞬時に計算できるのはよいですね。

プログラミングで実装する際のアルゴリズム考察は重要であると再認識した次第です。

以上。

