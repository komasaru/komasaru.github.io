---
layout   : single
title    : "C++ - 連立方程式解法（ガウス・ジョルダン（ピボット選択）法）！"
published: true
date     : 2013-09-22 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
---

先日は、連立方程式を「ガウス・ジョルダン法」で解くアルゴリズムを C++ で実装したことを紹介しました。

* [C++ - 連立方程式解法（ガウス・ジョルダン法）！]({{site.baseurl}}/2013/09/20/cpp-simultaneous-equation-by-gauss-jorden "C++ - 連立方程式解法（ガウス・ジョルダン法）！")

今回は、連立方程式を「ガウス・ジョルダン法」を応用した「ガウス・ジョルダン（ピボット選択）法」で解くアルゴリズムを C++ で実装してみました。

以下、簡単な説明と C++ ソースコードの紹介です。

<!--more-->

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* g++ (Ubuntu/Linaro 4.7.2-2ubuntu1) 4.7.2

### 1. ガウス・ジョルダン（ピボット選択）法による連立方程式の解法について（簡単に）

（数式が多いので、$$\LaTeX$$ で記載）

![GAUSS_JORDEN_PIVOT]({{site.baseurl}}/images/2013/09/22/GAUSS_JORDEN_PIVOT.png "GAUSS_JORDEN_PIVOT")

### 2. C++ ソース作成

File: `gauss_jorden_pivot.cpp`

{% highlight cpp linenos %}
/*********************************************
 * 連立方程式の解法 ( ガウス・ジョルダン法（ピボット選択法） )
 *********************************************/
#include <iostream>  // for cout
#include <math.h>    // for fabs()
#include <stdio.h>   // for printf()
#include <stdlib.h>  // for exit()

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
    double p, d;         // ピボット係数、ピボット行ｘ係数
    double max, dummy;   // 最大絶対値、入れ替え時ダミー
    int i, j, k;         // LOOP インデックス
    int s;               // 入替行

    public:
        // 連立方程式を解く（ガウス・ジョルダン法（ピボット選択法））
        void calcGaussJordenPivot();
};

/*
 * 連立方程式を解く（ガウス・ジョルダン法（ピボット選択法））
 */
void Calc::calcGaussJordenPivot()
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
        // 行入れ替え
        max = 0; s = k;
        for (j = k; j < N; j++) {
            if (fabs(a[j][k]) > max) {
                max = fabs(a[j][k]);
                s = j;
            }
        }
        if (max == 0) {
            printf("解けない！");
            exit(1);
        }
        for (j = 0; j <= N; j++) {
            dummy   = a[k][j];
            a[k][j] = a[s][j];
            a[s][j] = dummy;
        }

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

        // 連立方程式を解く（ガウス・ジョルダン法（ピボット選択法））
        objCalc.calcGaussJordenPivot();
    }
    catch (...) {
        cout << "例外発生！" << endl;
        return -1;
    }

    // 正常終了
    return 0;
}
{% endhighlight %}

* [Gist - C++ source code to solve simultaneous equations with Gauss-Jorden(pivot) method.](https://gist.github.com/komasaru/32ed46f425fc42a7cc32322f8a6ce070 "Gist - C++ source code to solve simultaneous equations with Gauss-Jorden(pivot) method.")

### 3. C++ ソースコンパイル

（`-Wall` は警告出力、`-O2` 最適化のオプション）

``` text
$ g++ -Wall -O2 -o gauss_jorden_pivot gauss_jorden_pivot.cpp
```

何も出力されなければ成功。

### 4. 実行

実際に、次の連立方程式を解いてみる。

![EQUATION_1]({{site.baseurl}}/images/2013/09/22/EQUATION_1.png "EQUATION_1")

``` text
$ ./gauss_jorden_pivot
+2.000000x1 -3.000000x2 +1.000000x3 = +5.000000
+1.000000x1 +1.000000x2 -1.000000x3 = +2.000000
+3.000000x1 +5.000000x2 -7.000000x3 = +0.000000
x1 = 3.000000
x2 = 1.000000
x3 = 2.000000
```

コンソールには元の連立方程式と解が出力される。

---

通常のガウス・ジョルダン法で連立方程式を解くより精度は向上するはずです。（特に解が実数になるような場合に）

※ちなみに、以前 C 言語によるアルゴリズムに関する書物を参考に作成していた C 言語プログラムを、 C++ に移植した形態となっています。

以上。

