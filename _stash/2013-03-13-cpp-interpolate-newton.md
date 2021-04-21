---
layout   : single
title    : "C++ - ニュートン補間！"
published: true
date     : 2013-03-13 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
---

何組かの x, y データが与えられ、これらの点全てを通る補間多項式を求める方法に「ニュートン補間」というものがあります。

先日は「ラグランジュ補間」について紹介しました。

* [C++ - ラグランジュ補間！]({{site.baseurl}}/2013/03/10/cpp-interpolate-lagrange/ "C++ - ラグランジュ補間！")

以下、一部 $$\TeX$$ で記載。

<!--more-->

![INTERPOLATE_NEWTON_1]({{site.baseurl}}/images/2013/03/13/INTERPOLATE_NEWTON_1.png "INTERPOLATE_NEWTON_1")

![INTERPOLATE_NEWTON_2]({{site.baseurl}}/images/2013/03/13/INTERPOLATE_NEWTON_2.png "INTERPOLATE_NEWTON_2")

アルゴリズムとしては、係数（差分商）を求め、求まった多項式から補間点を算出していく形になる。

以下、C++ によるサンプルソースです。

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* g++ (Ubuntu/Linaro 4.7.2-2ubuntu1) 4.7.2
* ニュートン補間そのものについての詳細は割愛。

### 1. C++ ソース作成

File: `interpolate_newton.cpp`

{% highlight cpp linenos %}
/*********************************************
 * ニュートン補間
 *********************************************/
#include <iostream>  // for cout
#include <stdio.h>   // for printf()

using namespace std;

/*
 * 計算クラス
 */
class Calc
{
    // 各種変数
    int    n;       // あらかじめ与える点の数
    int    i, j;    // LOOP インデックス
    double t;       // LOOP インデックス
    double c[100];  // 係数配列
    double w[100];  // 作業用配列
    double s;       // 総和

    public:
        // 計算
        void calc();
        // ニュートン補間
        double interpolateNewton(double x[], double y[], int n, double t);
};

/*
 * 計算
 */
void Calc::calc()
{
    // あらかじめ与える点
    double x[] = {0.0, 2.0, 3.0, 5.0, 8.0};
    double y[] = {0.8, 3.2, 2.8, 4.5, 1.9};

    // 点の数
    n = sizeof(x) / sizeof(x[0]);

    // 結果出力
    printf("      x      y\n");
    for (t = x[0]; t <= x[n - 1]; t += .5)
        printf("%7.2f%7.2f\n", t, interpolateNewton(x, y, n, t));
}

/*
 * ニュートン補間
 */
double Calc::interpolateNewton(double x[], double y[], int n, double t)
{
    // 係数
    for (i = 0; i < n; i++) {
        w[i] = y[i];
        for (j = i - 1; j >= 0; j--)
            w[j] = (w[j+1] - w[j]) / (x[i] - x[j]);
        c[i] = w[0];
    }

    // 総和
    s = c[n-1];
    for (i = n - 2; i >= 0; i--)
        s = s * (t - x[i]) + c[i];

    return s;
}

/*
 * メイン処理
 */
int main()
{
    try
    {
        // 計算クラスインスタンス化
        Calc objCalc;

        // ニュートン補間計算
        objCalc.calc();
    }
    catch (...) {
        cout << "例外発生！" << endl;
        return -1;
    }

    // 正常終了
    return 0;
}
{% endhighlight %}

* [Gist - C++ source code to interpolate with Newton method.](https://gist.github.com/komasaru/6a10c02cf3f5e5fe411d7fb3987b36dd "Gist - C++ source code to interpolate with Newton method.")

### 2. C++ ソースコンパイル

``` text
$ g++ interpolate_newton.cpp -o interpolate_newton
```

何も出力されなければ成功です。

### 3. 実行

``` text
$ ./interpolate_newton
      x      y
   0.00   0.80
   0.50   2.49
   1.00   3.23
   1.50   3.37
   2.00   3.20
   2.50   2.95
   3.00   2.80
   3.50   2.85
   4.00   3.17
   4.50   3.74
   5.00   4.50
   5.50   5.32
   6.00   6.03
   6.50   6.37
   7.00   6.05
   7.50   4.70
   8.00   1.90
```

あらかじめ与えられた点以外の点も計算されているのが分かる。  
また、「ラグランジュ補間」と同じ結果になっているのも分かる。（[C++ - ラグランジュ補間！]({{site.baseurl}}/2013/03/10/cpp-interpolate-lagrange "C++ - ラグランジュ補間！")）

### 4. グラフ

参考までに、 R でグラフを作成してみた。

![INTERPOLATE_GRAPH]({{site.baseurl}}/images/2013/03/13/INTERPOLATE_GRAPH.png "INTERPOLATE_GRAPH")

---

数学はおもしろいけど、コンピュータで実証するというのもおもしろいです。

※ちなみに最近の当方の C++ アルゴリズムについての記事は、古い C によるアルゴリズムに関する書物を参考に C++ に移植した形態となっています。

以上。

