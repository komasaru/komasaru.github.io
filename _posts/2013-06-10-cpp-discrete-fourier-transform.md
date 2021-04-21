---
layout   : single
title    : "C++ - （離散）フーリエ変換！"
published: true
date     : 2013-06-10 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
---

以前、「フーリエ級数展開」を C++ で実装したり、「複素フーリエ級数展開」についての記事を紹介しました。

* [C++ - フーリエ級数展開]({{site.baseurl}}/2013/05/16/cpp-expand-fourier-series "C++ - フーリエ級数展開！")
* [複素フーリエ級数展開！]({{site.baseurl}}/2013/05/19/expand-fourier-series-complex "複素フーリエ級数展開！")

今回は、「フーリエ変換・離散フーリエ変換」、特に C++ での離散フーリエ変換の実装についてです。  
それほど、深くは掘り下げていません。当方が将来目論んでいることの準備として、軽くまとめているだけです。  
深く知りたい方は、別途お調べください。情報は多数あります。

<!--more-->

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* g++ (Ubuntu/Linaro 4.7.2-2ubuntu1) 4.7.2
* 数式が多いので、一部 $$\TeX$$ で記載。  
  また、自然対数の底 $$e$$ は $$\exp$$ で表示するようにするようにしている（指数部分の可視性を重視して）

### 1. フーリエ変換について

**フーリエ変換(Fourier Transform = FT)**とは、複素関数 (または実関数) から別の複素関数への変換のことで、時間領域から周波数領域への変換である。また、逆の変換を**フーリエ逆変換(Inverse Fourier Transform = IFT)**という。

### 2. フーリエ変換の導出

![ABOUT_DFT_1]({{site.baseurl}}/images/2013/06/10/ABOUT_DFT_1.png "ABOUT_DFT_1")
![ABOUT_DFT_2]({{site.baseurl}}/images/2013/06/10/ABOUT_DFT_2.png "ABOUT_DFT_2")

### 3. 離散フーリエ変換とは

今まで連続の値について考えてきたが、当然コンピュータでは連続の値は扱えない。そのため、プログラムで実装するには、離散の概念を用いた**離散フーリエ変換(Discrete Fourier Transform = DFT)**、**逆離散フーリエ変換(Inverse Discrete Fourier Transform = IDFT)**を使用する。

### 4. 離散フーリエ変換の導出

![ABOUT_DFT_3]({{site.baseurl}}/images/2013/06/10/ABOUT_DFT_3.png "ABOUT_DFT_3")

### 5. C++ ソース作成

* 変換元の周期関数は、 $$f(t) = 2 * \sin(4t) + 3 \times \cos(2t)$$ とした。
* `t` の範囲は $$0 \sim 2\pi$$ に限定している。  
* 分割数は `N` の値を変更して対応する。（以下の例では `N=100` としている）
* 「元データ作成」、「元データを離散フーリエ変換」、「離散フーリエ変換されたデータを逆離散フーリエ変換」としている。

File: `discrete_fourier_transform.cpp`

{% highlight cpp linenos %}
/*********************************************
 * 離散フーリエ変換                          *
 *   f(t) = 2 * sin(4 * t) + 3 * cos(2 * t)  *
 *          ( 0 <= t < 2 * pi )              *
 *********************************************/
#include <iostream>  // for cout
#include <math.h>    // for sin(), cos()
#include <stdio.h>   // for printf()

#define N 100                // 分割数
#define CSV_DFT  "DFT.csv"   // 出力ファイル (DFT)
#define CSV_IDFT "IDFT.csv"  // 出力ファイル (IDFT)

using namespace std;

/*
 * 計算クラス
 */
class Calc
{
    double SRC_re[N];   //元データの実部
    double SRC_im[N];   //元データの虚部
    double DFT_re[N];   //DFTの実部
    double DFT_im[N];   //DFTの虚部
    double IDFT_re[N];  //IDFTの実部
    double IDFT_im[N];  //IDFTの虚部

    public:
        void makeSourceData();  // 元データ作成
        void executeDFT();      // 離散フーリエ変換
        void executeIDFT();     // 逆離散フーリエ変換

    private:
        double calcTerm(int n, double x);  //各項計算
};

/*
 * 元データ作成
 */
void Calc::makeSourceData()
{
    int i;

    for (i = 0; i < N; i++) {
        SRC_re[i] = 2 * sin(4 * (2 * M_PI / N) * i)
                  + 3 * cos(2 * (2 * M_PI / N) * i);
        SRC_im[i] = 0.0;
    }
}

/*
 * 離散フーリエ変換
 */
void Calc::executeDFT()
{
    int k, n;  // LOOPインデックス
    FILE *pf;  // ファイルポインタ

    // 出力ファイルOPEN
    pf = fopen(CSV_DFT, "w");

    // ヘッダ出力 ( k, 角周波数, 元データ(実部), 元データ(虚部), DFT(実部), DFT(虚部) )
    fprintf(pf, "k,f,x_re,x_im,X_re,X_im\n");

    // 計算・結果出力
    for (k = 0; k < N; k++) {
        DFT_re[k] = 0.0;
        DFT_im[k] = 0.0;
        for (n = 0; n < N; n++) {
            DFT_re[k] += SRC_re[n] * ( cos((2 * M_PI / N) * k * n))
                       + SRC_im[n] * ( sin((2 * M_PI / N) * k * n));
            DFT_im[k] += SRC_re[n] * (-sin((2 * M_PI / N) * k * n))
                       + SRC_im[n] * ( cos((2 * M_PI / N) * k * n));
        }
        fprintf(pf, "%d,%lf,%lf,%lf,%lf,%lf\n",
            k, (2 * M_PI / N) * k, SRC_re[k], SRC_im[k], DFT_re[k], DFT_im[k]);
    }

    // 出力ファイルCLOSE
    fclose(pf);
}

/*
 * 逆離散フーリエ変換
 */
void Calc::executeIDFT()
{
    int k, n;  // LOOPインデックス
    FILE *pf;  // ファイルポインタ

    // 出力ファイルOPEN
    pf = fopen(CSV_IDFT, "w");

    // ヘッダ出力 ( k, 角周波数, DFT(実部), DFT(虚部), IDFT(実部), IDFT(虚部) )
    fprintf(pf, "k,f,X_re,X_im,x_re,x_im\n");

    // 計算・結果出力
    for (n = 0; n < N; n++) {
        IDFT_re[n] = 0.0;
        IDFT_im[n] = 0.0;
        for (k = 0; k < N; k++) {
            IDFT_re[n] += DFT_re[k] * (cos((2 * M_PI / N) * k * n))
                        - DFT_im[k] * (sin((2 * M_PI / N) * k * n));
            IDFT_im[n] += DFT_re[k] * (sin((2 * M_PI / N) * k * n))
                        + DFT_im[k] * (cos((2 * M_PI / N) * k * n));
        }
        IDFT_re[n] /= N;
        IDFT_im[n] /= N;
        fprintf(pf, "%d,%lf,%lf,%lf,%lf,%lf\n",
            n, (2 * M_PI / N) * n, DFT_re[n], DFT_im[n], IDFT_re[n], IDFT_im[n]);
    }

    // 出力ファイルCLOSE
    fclose(pf);
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

        // 元データ作成
        objCalc.makeSourceData();

        // 離散フーリエ変換
        objCalc.executeDFT();

        // 逆離散フーリエ変換
        objCalc.executeIDFT();
    }
    catch (...) {
        cout << "例外発生！" << endl;
        return -1;
    }

    // 正常終了
    return 0;
}
{% endhighlight %}

離散フーリエ変換と逆離散フーリエ変換の処理は、実質符号を変えるだけなので、１つにまとめても良いかもしれない。

* [Gist - C++ source code to compute discrete Fourier transform.](https://gist.github.com/komasaru/7cbb88f543c05c5f1e0f1e918b2146b0 "Gist - C++ source code to compute discrete Fourier transform.")

### 6. C++ ソースコンパイル

（`-Wall` は警告出力、`-O2` 最適化のオプション）

``` text
g++ -Wall -O2 -o discrete_fourier_transform discrete_fourier_transform.cpp
```

何も出力されなければ成功。

### 7. 実行

``` text
$ ./discrete_fourier_transform
```

コンソールには特に何も表示しない。  
アプリと同じディレクトリに "DFT.csv", "IDFT.csv" という CSV ファイルが作成される。  
内容は以下のようになっているはず。

File: `DFT.csv`

{% highlight text linenos %}
k,f,x_re,x_im,X_re,X_im
0,0.000000,3.000000,0.000000,0.000000,0.000000
1,0.062832,3.473724,0.000000,0.000000,-0.000000
2,0.125664,3.869257,0.000000,150.000000,-0.000000
3,0.188496,4.158424,0.000000,0.000000,-0.000000
4,0.251327,4.317576,0.000000,0.000000,-100.000000
5,0.314159,4.329164,0.000000,-0.000000,0.000000
6,0.376991,4.182959,0.000000,0.000000,0.000000
7,0.439823,3.876846,0.000000,0.000000,0.000000
8,0.502655,3.417134,0.000000,0.000000,0.000000
9,0.565487,2.818364,0.000000,0.000000,-0.000000
         :
====< 途中省略 >====
         :
90,5.654867,-0.248520,0.000000,-0.000000,-0.000000
91,5.717699,-0.263689,0.000000,-0.000000,0.000000
92,5.780530,-0.202174,0.000000,-0.000000,-0.000000
93,5.843362,-0.052303,0.000000,-0.000000,0.000000
94,5.906194,0.190852,0.000000,0.000000,0.000000
95,5.969026,0.524938,0.000000,-0.000000,-0.000000
96,6.031858,0.940264,0.000000,0.000000,100.000000
97,6.094690,1.420235,0.000000,-0.000000,-0.000000
98,6.157522,1.942242,0.000000,150.000000,-0.000000
99,6.220353,2.478964,0.000000,0.000000,-0.000000
{% endhighlight %}

File: `IDFT.csv`

{% highlight text linenos %}
k,f,X_re,X_im,x_re,x_im
0,0.000000,0.000000,0.000000,3.000000,-0.000000
1,0.062832,0.000000,-0.000000,3.473724,-0.000000
2,0.125664,150.000000,-0.000000,3.869257,-0.000000
3,0.188496,0.000000,-0.000000,4.158424,-0.000000
4,0.251327,0.000000,-100.000000,4.317576,-0.000000
5,0.314159,-0.000000,0.000000,4.329164,-0.000000
6,0.376991,0.000000,0.000000,4.182959,-0.000000
7,0.439823,0.000000,0.000000,3.876846,-0.000000
8,0.502655,0.000000,0.000000,3.417134,-0.000000
9,0.565487,0.000000,-0.000000,2.818364,-0.000000
         :
====< 途中省略 >====
         :
90,5.654867,-0.000000,-0.000000,-0.248520,0.000000
91,5.717699,-0.000000,0.000000,-0.263689,-0.000000
92,5.780530,-0.000000,-0.000000,-0.202174,-0.000000
93,5.843362,-0.000000,0.000000,-0.052303,0.000000
94,5.906194,0.000000,0.000000,0.190852,-0.000000
95,5.969026,-0.000000,-0.000000,0.524938,-0.000000
96,6.031858,0.000000,100.000000,0.940264,0.000000
97,6.094690,-0.000000,-0.000000,1.420235,0.000000
98,6.157522,150.000000,-0.000000,1.942242,0.000000
99,6.220353,0.000000,-0.000000,2.478964,-0.000000
{% endhighlight %}

離散フーリエ変換後のデータを逆離散フーリエ変換して、元のデータに戻っていることが分かる。

### 8. グラフ化

R でグラフ化（プロット）してみた。（実部と虚部を重ねて）  

【元データ】

![GRAPH_SRC]({{site.baseurl}}/images/2013/06/10/GRAPH_SRC.png "GRAPH_SRC")

【DFTデータ】

![GRAPH_DFT]({{site.baseurl}}/images/2013/06/10/GRAPH_DFT.png "GRAPH_DFT")

【IDFTデータ】

![GRAPH_IDFT]({{site.baseurl}}/images/2013/06/10/GRAPH_IDFT.png "GRAPH_IDFT")

---

電気工学、音響学、振動、光学等でよく使用する重要な概念です。応用範囲は広いので他にも利用できるかと思います。

近いうちに、離散フーリエ変換を高速に行う「高速フーリエ変換」について考えてみたいとも思っています。

以上。

