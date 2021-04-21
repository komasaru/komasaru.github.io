---
layout   : single
title    : "C++ - フーリエ級数展開！"
published: true
date     : 2013-05-16 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
---

今回は、「フーリエ級数展開」を C++ で実装してみました。

ちなみに、テイラー展開は以前紹介しています。

* [C++ - テイラー展開 ( exp(x) )！]({{site.baseurl}}/2012/10/19/19002055/ "C++ - テイラー展開 ( exp(x) )！")
* [C++ - テイラー展開 ( cos(x) )！]({{site.baseurl}}/2012/10/21/21002010/ "C++ - テイラー展開 ( cos(x) )！")

<!--more-->

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* g++ (Ubuntu/Linaro 4.7.2-2ubuntu1) 4.7.2

### 1. フーリエ級数展開について（簡単に）

（数式が多いので、一部 $$\TeX$$ で記載）

フーリエ級数展開の基本概念は、19 世紀前半にフランスの数学者フーリエ（Fourier,1764-1830）が熱伝導問題の解析の過程で考え出したものであり、「任意の周期関数は三角関数の和で表される」というものである。

![EXPAND_FOURIER_SERIES_1]({{site.baseurl}}/images/2013/05/16/EXPAND_FOURIER_SERIES_1.png "EXPAND_FOURIER_SERIES_1")
![EXPAND_FOURIER_SERIES_2]({{site.baseurl}}/images/2013/05/16/EXPAND_FOURIER_SERIES_2.png "EXPAND_FOURIER_SERIES_2")
![EXPAND_FOURIER_SERIES_3]({{site.baseurl}}/images/2013/05/16/EXPAND_FOURIER_SERIES_3.png "EXPAND_FOURIER_SERIES_3")

さらに、与えられた関数がフーリエ級数の部分和で近似されるとき、項数をいくら増やしていっても、不連続点の近傍で誤差が生じる。これを「ギップス現象」という。

以下は１つの簡単な例。

![EXPAND_FOURIER_SERIES_4]({{site.baseurl}}/images/2013/05/16/EXPAND_FOURIER_SERIES_4.png "EXPAND_FOURIER_SERIES_4")
![EXPAND_FOURIER_SERIES_5]({{site.baseurl}}/images/2013/05/16/EXPAND_FOURIER_SERIES_5.png "EXPAND_FOURIER_SERIES_5")
![EXPAND_FOURIER_SERIES_6]({{site.baseurl}}/images/2013/05/16/EXPAND_FOURIER_SERIES_6.png "EXPAND_FOURIER_SERIES_6")

### 2. C++ ソース作成

* `t` の範囲は $$- \pi \sim \pi$$ に限定している。
* 計算項数は `N` の値を変更して対応する。

File: `fourier_series_expansion.cpp`

{% highlight cpp linenos %}
/*********************************************
 * フーリエ級数展開                          *
 *   f(t) = -1 (-pi < t <= 0 )               *
 *           1 (  0 < t <= pi)               *
 *********************************************/
#include <iostream>  // for cout
#include <math.h>    // for sin()
#include <stdio.h>   // for printf()

#define N 3          // 計算項数

using namespace std;

/*
 * 計算クラス
 */
class Calc
{
    public:
        void expandFourierSeries();        // フーリエ級数展開

    private:
        double calcTerm(int n, double x);  //各項計算
};

/*
 * フーリエ級数展開
 */
void Calc::expandFourierSeries()
{
    int i;            // LOOPインデックス
    double t, y = 0;  // 横軸、縦軸
    FILE *pf;         // ファイルポインタ

    // 出力ファイルOPEN
    pf = fopen("FourierSeriesExpansion.csv", "w");

    // ヘッダ出力
    fprintf(pf, "t,f(t)\n");

    // 1 / 1000 刻みで計算
    for (t = -M_PI; t < M_PI; t += 0.001) {
        for (i = 1; i <= N; i++) y += calcTerm(i, t);
        fprintf(pf, "%lf,%lf\n", t, 4 / M_PI * y);
        y=0;
    }

    // 出力ファイルCLOSE
    fclose(pf);
}

/*
 * 各項計算
 */
double Calc::calcTerm(int n, double t)
{
  return sin((2 * n - 1) * t) / (2 * n - 1);
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

        // フーリエ級数展開
        objCalc.expandFourierSeries();
    }
    catch (...) {
        cout << "例外発生！" << endl;
        return -1;
    }

    // 正常終了
    return 0;
}
{% endhighlight %}

* [Gist - C++ source code to expand Fourier's series.](https://gist.github.com/komasaru/461d1d4b59b168d8675c757c9f9c476d "Gist - C++ source code to expand Fourier's series.")

### 3. C++ ソースコンパイル

（`-Wall` は警告出力、`-O2` 最適化のオプション）

``` text
$ g++ -Wall -O2 -o fourier_series_expansion fourier_series_expansion.cpp
```

何も出力されなければ成功。

### 4. 実行

``` text
$ ./fourier_series_xxpansion
```

コンソールには特に何も表示しない。  
アプリと同じディレクトリに `FourierSeriesExpansion.csv` という CSV ファイルが作成される。  
内容は以下のようになっているはず。

File: `FourierSeriesExpansion.csv`

{% highlight text linenos %}
t,f(t)
-3.141593,-0.000000
-3.140593,-0.003820
-3.139593,-0.007639
-3.138593,-0.011459
-3.137593,-0.015278
-3.136593,-0.019098
-3.135593,-0.022917
-3.134593,-0.026735
-3.133593,-0.030554
-3.132593,-0.034372
-3.131593,-0.038190
-3.130593,-0.042007
-3.129593,-0.045824
-3.128593,-0.049640
-3.127593,-0.053456
-3.126593,-0.057271
-3.125593,-0.061085
-3.124593,-0.064899
-3.123593,-0.068712
         :
====< 途中省略 >====
         :
3.122407,0.073230
3.123407,0.069418
3.124407,0.065605
3.125407,0.061792
3.126407,0.057978
3.127407,0.054163
3.128407,0.050347
3.129407,0.046531
3.130407,0.042714
3.131407,0.038897
3.132407,0.035080
3.133407,0.031261
3.134407,0.027443
3.135407,0.023624
3.136407,0.019805
3.137407,0.015986
3.138407,0.012167
3.139407,0.008347
3.140407,0.004528
3.141407,0.000708
{% endhighlight %}

### 5. グラフ化

数字だけを眺めてもよく分からないので、R でグラフ化（プロット）してみた。  

【元の関数グラフ】

![r_fourier_series_0]({{site.baseurl}}/images/2013/05/16/r_fourier_series_0.png "r_fourier_series_0")

以下、計算項数を 1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000, 10000, 100000 個として計算した結果をグラフ化したもの。

![r_fourier_series_1]({{site.baseurl}}/images/2013/05/16/r_fourier_series_1.png "r_fourier_series_1")
![r_fourier_series_2]({{site.baseurl}}/images/2013/05/16/r_fourier_series_2.png "r_fourier_series_2")
![r_fourier_series_3]({{site.baseurl}}/images/2013/05/16/r_fourier_series_3.png "r_fourier_series_3")
![r_fourier_series_5]({{site.baseurl}}/images/2013/05/16/r_fourier_series_5.png "r_fourier_series_5")
![r_fourier_series_10]({{site.baseurl}}/images/2013/05/16/r_fourier_series_10.png "r_fourier_series_10")
![r_fourier_series_20]({{site.baseurl}}/images/2013/05/16/r_fourier_series_20.png "r_fourier_series_20")
![r_fourier_series_50]({{site.baseurl}}/images/2013/05/16/r_fourier_series_50.png "r_fourier_series_50")
![r_fourier_series_100]({{site.baseurl}}/images/2013/05/16/r_fourier_series_100.png "r_fourier_series_100")
![r_fourier_series_200]({{site.baseurl}}/images/2013/05/16/r_fourier_series_200.png "r_fourier_series_200")
![r_fourier_series_500]({{site.baseurl}}/images/2013/05/16/r_fourier_series_500.png "r_fourier_series_500")
![r_fourier_series_1000]({{site.baseurl}}/images/2013/05/16/r_fourier_series_1000.png "r_fourier_series_1000")
![r_fourier_series_10000]({{site.baseurl}}/images/2013/05/16/r_fourier_series_10000.png "r_fourier_series_10000")
![r_fourier_series_100000]({{site.baseurl}}/images/2013/05/16/r_fourier_series_100000.png "r_fourier_series_100000")

項数を増やすにつれて元の関数のグラフに近付いていくのがよく分かる。

---

電気工学、音響学、振動、光学等でよく使用する重要な概念です。応用範囲は広いので他にも利用できるかと思います。

以上。

