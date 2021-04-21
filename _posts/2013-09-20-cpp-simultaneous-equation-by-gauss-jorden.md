---
layout   : single
title    : "C++ - 連立方程式解法（ガウス・ジョルダン法）！"
published: true
date     : 2013-09-20 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
---

今回は、連立方程式を「ガウス・ジョルダン法」で解くアルゴリズムを C++ で実装してみました。

以下、簡単な説明と C++ ソースコードの紹介です。

<!--more-->

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* g++ (Ubuntu/Linaro 4.7.2-2ubuntu1) 4.7.2

### 1. ガウス・ジョルダン法による連立方程式の解法について（簡単に）

（数式が多いので、$$\LaTeX$$ で記載）

![GAUSS_JORDEN_1]({{site.baseurl}}/images/2013/09/20/GAUSS_JORDEN_1.png "GAUSS_JORDEN_1")
![GAUSS_JORDEN_2]({{site.baseurl}}/images/2013/09/20/GAUSS_JORDEN_2.png "GAUSS_JORDEN_2")

### 2. C++ ソース作成

File: `gauss_jorden.cpp`

{% highlight cpp linenos %}
/*********************************************
 * 連立方程式の解法 ( ガウス・ジョルダン法 )
 *********************************************/
#include <iostream>  // for cout
#include <stdio.h>   // for printf()

// 元の数定義
#define N 3  // 4

using namespace std;

/*
 * 計算クラス
 */
class Calc
{
    double a[N][N + 1];  // 係数用配列

    // 各種変数
    double p, d;  // ピボット係数、ピボット行ｘ係数
    int i, j, k;  // LOOP インデックス

    public:
        // 連立方程式を解く（ガウス・ジョルダン法）
        void calcGaussJorden();
};

/*
 * 連立方程式を解く（ガウス・ジョルダン法）
 */
void Calc::calcGaussJorden()
{
    // 係数
    static double a[N][N + 1] = {
        { 2.0, -3.0,  1.0,  5.0},
        { 1.0,  1.0, -1.0,  2.0},
        { 3.0,  5.0, -7.0,  0.0}
        //{ 1.0, -2.0,  3.0, -4.0,  5.0},
        //{-2.0,  5.0,  8.0, -3.0,  9.0},
        //{ 5.0,  4.0,  7.0,  1.0, -1.0},
        //{ 9.0,  7.0,  3.0,  5.0,  4.0}
    };

    // 元の連立方程式をコンソール出力
    for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++)
            printf("%+fx%d ", a[i][j], j + 1);
        printf("= %+f\n", a[i][N]);
    }

    for (k = 0; k < N; k++) {
        // ピボット係数
        p = a[k][k];

        // ピボット行を p で除算
        for (j = k; j < N + 1; j++)
            a[k][j] /= p;

        // ピボット列の掃き出し
        for (i = 0; i < N; i++) {
            if (i != k) {
                d = a[i][k];
                for (j = k; j < N + 1; j++)
                    a[i][j] -= d * a[k][j];
            }
        }
    }

    // 結果出力
    for (k = 0; k < N; k++)
        printf("x%d = %f\n", k + 1, a[k][N]);
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

        // 連立方程式を解く（ガウス・ジョルダン法）
        objCalc.calcGaussJorden();
    }
    catch (...) {
        cout << "例外発生！" << endl;
        return -1;
    }

    // 正常終了
    return 0;
}
{% endhighlight %}

* [Gist - C++ source code to solve simultaneous equations with Gauss-Jorden method.](https://gist.github.com/komasaru/576acdb809dfa65ae218523e784fbf0e "Gist - C++ source code to solve simultaneous equations with Gauss-Jorden method.")

### 3. C++ ソースコンパイル

（`-Wall` は警告出力、`-O2` 最適化のオプション）

``` text
$ g++ -Wall -O2 -o gauss_jorden gauss_jorden.cpp
```

何も出力されなければ成功。

### 4. 実行

実際に、次の連立方程式を解いてみる。

![EQUATION_1]({{site.baseurl}}/images/2013/09/20/EQUATION_1.png "EQUATION_1")

``` text
$ ./gauss_jorden
+2.000000x1 -3.000000x2 +1.000000x3 = +5.000000
+1.000000x1 +1.000000x2 -1.000000x3 = +2.000000
+3.000000x1 +5.000000x2 -7.000000x3 = +0.000000
x1 = 3.000000
x2 = 1.000000
x3 = 2.000000
```

コンソールには元の連立方程式と解が出力される。

---

よくある連立方程式の解法についてでした。

※ちなみに、以前 C 言語によるアルゴリズムに関する書物を参考に作成していた C 言語プログラムを、 C++ に移植した形態となっています。

以上。

