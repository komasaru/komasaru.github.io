---
layout   : single
title    : "C++ - 連立方程式解法（ガウスの消去法）！"
published: true
date     : 2013-09-24 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
---

ここ最近、連立方程式を「ガウス・ジョルダン法」や「ガウス・ジョルダン（ピボット選択）法」で解くアルゴリズムを C++ で実装したことを紹介しました。

* [C++ - 連立方程式解法（ガウス・ジョルダン法）！]({{site.baseurl}}/2013/09/20/cpp-simultaneous-equation-by-gauss-jorden "C++ - 連立方程式解法（ガウス・ジョルダン法）！")
* [C++ - 連立方程式解法（ガウス・ジョルダン（ピボット選択）法）！]({{site.baseurl}}/2013/09/22/cpp-simultaneous-equation-by-pivot "C++ - 連立方程式解法（ガウス・ジョルダン（ピボット選択）法）！")

今回は、連立方程式を「ガウスの消去法」で解くアルゴリズムを C++ で実装してみました。

以下、簡単な説明と C++ ソースコードの紹介です。

<!--more-->

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* g++ (Ubuntu/Linaro 4.7.2-2ubuntu1) 4.7.2

### 1. ガウスの消去法による連立方程式の解法について（簡単に）

（数式が多いので、$$\LaTeX$$ で記載）

![GAUSS_ELIMINATION_1]({{site.baseurl}}/images/2013/09/24/GAUSS_ELIMINATION_1.png "GAUSS_ELIMINATION_1")
![GAUSS_ELIMINATION_2]({{site.baseurl}}/images/2013/09/24/GAUSS_ELIMINATION_2.png "GAUSS_ELIMINATION_2")

### 2. C++ ソース作成

File: `gauss_elimination.cpp`

{% highlight cpp linenos %}
/*********************************************
 * 連立方程式の解法 ( ガウスの消去法 )
 *********************************************/
#include <iostream>  // for cout
#include <stdio.h>   // for printf()

// 元の数定義
#define N 4  // 3

using namespace std;

/*
 * 計算クラス
 */
class Calc
{
    double a[N][N + 1];

    // 各種変数
    double d;     // ダミー
    int i, j, k;  // LOOP インデックス

    public:
        // 連立方程式を解く（ガウスの消去法）
        void calcGaussElimination();
};

/*
 * 連立方程式を解く（ガウスの消去法）
 */
void Calc::calcGaussElimination()
{
    // 係数
    static double a[N][N + 1] = {
        //{ 2.0, -3.0,  1.0,  5.0},
        //{ 1.0,  1.0, -1.0,  2.0},
        //{ 3.0,  5.0, -7.0,  0.0}
        { 1.0, -2.0,  3.0, -4.0,  5.0},
        {-2.0,  5.0,  8.0, -3.0,  9.0},
        { 5.0,  4.0,  7.0,  1.0, -1.0},
        { 9.0,  7.0,  3.0,  5.0,  4.0}
    };

    // 元の連立方程式をコンソール出力
    for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++)
            printf("%+fx%d ", a[i][j], j + 1);
        printf("= %+f\n", a[i][N]);
    }

    // 前進消去
    for (k = 0; k < N -1; k++) {
        for (i = k + 1; i < N; i++) {
            d = a[i][k] / a[k][k];
            for (j = k + 1; j <= N; j++)
                a[i][j] -= a[k][j] * d;
        }
    }

    // 後退代入
    for (i = N - 1; i >= 0; i--) {
        d = a[i][N];
        for (j = i + 1; j < N; j++)
            d -= a[i][j] * a[j][N];
        a[i][N] = d / a[i][i];
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

        // 連立方程式を解く（ガウスの消去法）
        objCalc.calcGaussElimination();
    }
    catch (...) {
        cout << "例外発生！" << endl;
        return -1;
    }

    // 正常終了
    return 0;
}
{% endhighlight %}

* [Gist - C++ source code to solve simultaneous equations with Gauss elimination method.](https://gist.github.com/komasaru/ac7523e6be4291ea6e462eeaf6fc3981 "Gist - C++ source code to solve simultaneous equations with Gauss elimination method.")

### 3. C++ ソースコンパイル

（`-Wall` は警告出力、`-O2` 最適化のオプション）

``` text
$ g++ -Wall -O2 -o gauss_elimination gauss_elimination.cpp
```

何も出力されなければ成功。

### 4. 実行

実際に、次の連立方程式を解いてみる。

![EQUATION_3]({{site.baseurl}}/images/2013/09/24/EQUATION_3.png "EQUATION_3")

``` text
$ ./gauss_elimination
+1.000000x1 -2.000000x2 +3.000000x3 -4.000000x4 = +5.000000
-2.000000x1 +5.000000x2 +8.000000x3 -3.000000x4 = +9.000000
+5.000000x1 +4.000000x2 +7.000000x3 +1.000000x4 = -1.000000
+9.000000x1 +7.000000x2 +3.000000x3 +5.000000x4 = +4.000000
x1 = 1.000000
x2 = 3.000000
x3 = -2.000000
x4 = -4.000000
```

コンソールには元の連立方程式と解が出力される。

---

人間がよく行う連立方程式の解法の一つでしょう。  
何てことない内容でした。

※ちなみに、以前 C 言語によるアルゴリズムに関する書物を参考に作成していた C 言語プログラムを、 C++ に移植した形態となっています。

以上。

