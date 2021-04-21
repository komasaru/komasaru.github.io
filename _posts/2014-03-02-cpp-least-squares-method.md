---
layout   : single
title    : "C++ - 最小二乗法！"
published: true
date     : 2014-03-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
---

今回は、最小二乗法で近似方程式で解くアルゴリズムを C++ で実装してみました。

以下、簡単な説明と C++ ソースコードの紹介です。

<!--more-->

### 0. 前提条件

* Linux Mint 13 Maya (64bit) での作業を想定。
* g++ (Ubuntu/Linaro 4.6.3-1ubuntu5) 4.6.3

### 1. 最小二乗法について

（数式が多いので、別途 $$\LaTeX$$ で作成した文書を貼り付け）

![LEAST_SQUARES_METHOD_FIG_1]({{site.baseurl}}/images/2014/03/02/LEAST_SQUARES_METHOD_FIG_1.png "LEAST_SQUARES_METHOD_FIG_1")
![LEAST_SQUARES_METHOD]({{site.baseurl}}/images/2014/03/02/LEAST_SQUARES_METHOD.png "LEAST_SQUARES_METHOD")

### 2. C++ ソース作成

以下のように C++ ソールコードを作成してみた。  
処理系によっては、べき乗を求める `pow` 関数がエラーになるので、自前で `ipow` 関数を作成している。

File: `least_squares_method.cpp`

{% highlight c linenos %}
/*********************************************
 * 最小二乗法                                *
 *********************************************/
#include <iostream>  // for cout
#include <stdio.h>   // for printf()

#define N 7      // データ数
#define M 5      // 予測曲線の次数

using namespace std;

/*
 * 計算クラス
 */
class Calc
{
    // 各種変数
    double a[M + 1][M + 2], s[2 * M + 1], t[M + 1];
    int i, j, k;
    double p, d, px;

    public:
        Calc();                         // コンストラクタ
        void calcLeastSquaresMethod();  // 最小二乗法
        double ipow(double, int);       // べき乗計算
};

/*
 * コンストラクタ
 */
Calc::Calc()
{
    // s, t 初期化
    for (i = 0; i <= 2 * M; i++)
        s[i] = 0;
    for (i = 0; i <= M; i++)
        t[i] = 0;
}

/*
 * 最小二乗法
 */
void Calc::calcLeastSquaresMethod()
{
    // 測定データ
    static double x[] = {-3, -2, -1,  0, 1, 2, 3};
    static double y[] = { 5, -2, -3, -1, 1, 4, 5};

    // s[], t[] 計算
    for (i = 0; i < N; i++) {
        for (j = 0; j <= 2 * M; j++)
            s[j] += ipow(x[i], j);
        for (j = 0; j <= M; j++)
            t[j] += ipow(x[i], j) * y[i];
    }

    // a[][] に s[], t[] 代入
    for (i = 0; i <= M; i++) {
        for (j = 0; j <= M; j++)
            a[i][j] = s[i + j];
        a[i][M + 1] = t[i];
    }

    // 掃き出し
    for (k = 0; k <= M; k++) {
        p = a[k][k];
        for (j = k; j <= M + 1; j++)
            a[k][j] /= p;
        for (i = 0; i <= M; i++) {
            if (i != k) {
                d = a[i][k];
                for (j = k; j <= M + 1; j++)
                    a[i][j] -= d * a[k][j];
            }
        }
    }

    // y 値計算＆結果出力
    for (k = 0; k <= M; k++)
        printf("a%d = %10.6f\n", k, a[k][M + 1]);
    printf("    x    y\n");
    for (px = -3; px <= 3; px += .5) {
        p = 0;
        for (k = 0; k <= M; k++)
            p += a[k][M + 1] * ipow(px, k);
        printf("%5.1f%5.1f\n", px, p);
    }
}

/*
 * べき乗計算
 */
double Calc::ipow(double p, int n)
{
    int k;
    double s = 1;

    for (k = 1; k <= n; k++)
        s *= p;

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

        // 最小二乗法
        objCalc.calcLeastSquaresMethod();
    }
    catch (...) {
        cout << "例外発生！" << endl;
        return -1;
    }

    // 正常終了
    return 0;
}
{% endhighlight %}

* [Gist - C++ source code to solve approximate equation with least squares method.](https://gist.github.com/komasaru/bae500597e8aff860c45b1762ff81f76 "Gist - C++ source code to solve approximate equation with least squares method.")

### 3. C++ ソースコンパイル

（`-Wall` は警告出力、`-O2` 最適化のオプション）

``` text
$ g++ -Wall -O2 -o least_squares_method least_squares_method.cpp
```

何も出力されなければ成功。

### 4. 実行

``` text
$ ./least_squares_method
a0 =  -1.259740
a1 =   2.100000
a2 =   0.424242
a3 =  -0.083333
a4 =   0.030303
a5 =  -0.016667
    x    y
 -3.0  5.0
 -2.5  0.3
 -2.0 -2.1
 -1.5 -2.9
 -1.0 -2.8
 -0.5 -2.2
  0.0 -1.3
  0.5 -0.1
  1.0  1.2
  1.5  2.6
  2.0  3.9
  2.5  4.9
  3.0  5.0
```

### 5. 確認

参考までに、測定データと予測データをグラフにしてみた。

![LEAST_SQUARES_METHOD_FIG_2]({{site.baseurl}}/images/2014/03/02/LEAST_SQUARES_METHOD_FIG_2.png "LEAST_SQUARES_METHOD_FIG_2")

---

測定データや次数を変更してみて色々試してみるのもよいでしょう。

※ちなみに、以前 C 言語によるアルゴリズムに関する書物を参考に作成していた C 言語プログラムを、 C++ に移植した形態となっています。

以上。

