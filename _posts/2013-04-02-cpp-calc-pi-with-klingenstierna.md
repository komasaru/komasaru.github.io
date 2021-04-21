---
layout   : single
title    : "C++ - 円周率計算（Klingenstierna の公式）！"
published: true
date     : 2013-04-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
- 円周率
---

以前、円周率をマチンの公式で多桁計算する概念、C++ アルゴリズムを紹介しました。

* [C++ - 円周率計算（マチンの公式）！]({{site.baseurl}}/2013/03/21/cpp-calc-pi-with-machin/ "C++ - 円周率計算（マチンの公式）！")

今回は、マチンの公式同様 $$\arctan$$系の公式である「Klingenstierna の公式」を使用して、円周率 $$\pi$$ を計算してみました。

当然、プログラミン言語そのものが保有している三角関数は使用しません。級数展開して計算します。（多桁の円周率計算では、全く無意味ですから。但し、常用対数は影響がないので関数を使用）

<!--more-->

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* g++ (Ubuntu/Linaro 4.7.2-2ubuntu1) 4.7.2
* 多桁計算で使用する1つの配列のサイズは8桁としている。  
  （当方の環境で扱える int 型の範囲は -2,147,483,648 〜 2,147,483,647 であることから）
* 指定する桁数は int 型の範囲としているが、あまり大きいと計算に膨大な時間を要するので注意！

### 1. Klingenstierna の公式について

マチンの公式同様 Arctan 系の公式であり、考え方は同じ。  
数式が多いので $$\TeX$$ で記載。

![PI_KLINGENSTIERNA_1]({{site.baseurl}}/images/2013/04/02/PI_KLINGENSTIERNA_1.png "PI_KLINGENSTIERNA_1")

![PI_KLINGENSTIERNA_2]({{site.baseurl}}/images/2013/04/02/PI_KLINGENSTIERNA_2.png "PI_KLINGENSTIERNA_2")

ちなみに、$$\tan ^{-1} = \arctan$$ と置き換えてもよい。

なお、ここでは Klingenstierna の公式の証明はしない。（証明方法は何種類かあります）

また、上記の方法で算出した計算項数では、収束の速い方は無駄に多く計算していることになる。  
それを防ぎたかったら、各 Arctan 毎に必要な項数分だけ計算して、最後に合算する方法を取ると良いだろう。

### 2. C++ ソース作成

例として、以下のようにソースを作成した。  
基本的に、マチンの公式についての投稿で紹介したプログラムと同様だが、今回は、

* 計算桁数を入力するようにした。
* 計算する項数もプログラム内で計算させるようにした。
* 計算結果をテキストファイルに出力するようにした。

File: `calc_pi_klingenstierna.cpp`

{% highlight cpp linenos %}
/*********************************************
 * 円周率計算 by Klingenstierna の公式
 *********************************************/
#include <iostream>  // for cout
#include <math.h>    // for pow()
#include <stdio.h>   // for printf()
#include <time.h>    // for clock()
#define FNAME "pi_klingenstierna.txt"

using namespace std;

/*
 * 計算クラス
 */
class Calc
{
    // 各種変数
    int l, l1, n;    // 計算桁数、配列サイズ、計算項数
    int i, k;        // LOOP インデックス
    int cr, br;      // 繰り上がり、借り
    long w;          // 被乗数、被除数ワーク
    long r;          // 剰余ワーク
    clock_t t1, t2;  // 計算開始・終了CPU時刻
    double tt;       // 計算時間
    FILE *out_file;  // 結果出力ファイル

    public:
        // コンストラクタ
        Calc(int);
        // 計算
        void calc();
        // ロング + ロング
        void ladd(int *, int *, int *);
        // ロング - ロング
        void lsub(int *, int *, int *);
        // ロング / ショート
        void ldiv(int *, int, int *);
        // 結果出力
        void display(double, int *);
};

/*
 * コンストラクタ
 */
Calc::Calc(int x)
{
    l  = x;                // 計算桁数
    l1 = (l / 8) + 1;      // 配列サイズ
    n  = (l + 1) / 2 + 1;  // 計算項数
}

/*
 * 計算
 */
void Calc::calc()
{
    // 計算開始時刻
    t1 = clock();

    // 配列宣言
    int s[l1 + 1], a[l1 + 1], b[l1 + 1], c[l1 + 1], q[l1 + 1];

    // 配列初期化
    for (k = 0; k <= l1 + 1; k++)
        s[k] = a[k] = b[k] = c[k] = q[k] = 0;

    // Klingenstierna の公式
    a[0] = 32 *  10;
    b[0] =  4 * 239;
    c[0] = 16 * 515;
    for (k = 1; k <= n; k++) {
        ldiv(a,  10 *  10, a);
        ldiv(b, 239 * 239, b);
        ldiv(c, 515 * 515, c);
        lsub(a, b, q);
        lsub(q, c, q);
        ldiv(q, 2 * k - 1, q);
        if ((k % 2) != 0)
            ladd(s, q, s);
        else
            lsub(s, q, s);
    }

    // 計算終了時刻
    t2 = clock();

    // 計算時間
    tt = (double)(t2 - t1) / CLOCKS_PER_SEC;

    // 結果出力
    display(tt, s);
}

/*
 * ロング + ロング
 */
void Calc::ladd(int a[], int b[], int c[])
{
    cr = 0;
    for (i = l1 + 1; i >=0; i--) {
        c[i] = a[i] + b[i] + cr;
        if (c[i] < 100000000) {
            cr = 0;
        } else {
            c[i] -= 100000000;
            cr = 1;
        }
    }
}

/*
 * ロング - ロング
 */
void Calc::lsub(int a[], int b[], int c[])
{
    br = 0;
    for (i = l1 + 1; i >=0; i--) {
        c[i] = a[i] - b[i] - br;
        if (c[i] >= 0) {
            br = 0;
        } else {
            c[i] += 100000000;
            br = 1;
        }
    }
}

/*
 * ロング / ショート
 */
void Calc::ldiv(int d[], int e, int f[])
{
    r = 0;
    for (i = 0; i < l1 + 1; i++) {
        w = d[i];
        f[i] = (w + r) / e;
        r = ((w + r) % e) * 100000000;
    }
}

/*
 * 結果出力
 */
void Calc::display(double tt, int s[])
{
    printf("** Pi Computation with the Klingenstierna formula method **\n") ;
    printf("   Digits = %d.\n", l);
    printf("   Time   = %f seconds\n", tt);

    // ファイル出力
    out_file = fopen(FNAME,"w");
    fprintf(out_file, "** Pi Computation with the Klingenstierna formula method **\n") ;
    fprintf(out_file, "   Digits = %d.\n", l);
    fprintf(out_file, "   Time   = %f seconds.\n\n", tt);
    fprintf(out_file, "          %d.\n", s[0]);
    for (i = 1; i < l1; i++) {
        if (i % 10 == 1) fprintf(out_file, "%08d:", (i - 1) * 8 + 1);
        fprintf(out_file, " %08d", s[i]);
        if (i % 10 == 0) fprintf(out_file, "\n");
    }
    fprintf(out_file, "\n\n");
}

/*
 * メイン処理
 */
int main()
{
    int n;  // 計算桁数

    try
    {
        // 計算桁数入力
        printf("Please input number of Pi Decimal-Digits : ");
        scanf("%d", &n);

        // 計算クラスインスタンス化
        Calc objCalc(n);

        // 円周率計算
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

* [Gist - C++ source code to compute Pi with Klingenstierna's formula.](https://gist.github.com/komasaru/237fcec794ee4235b582aedc363849c5 "Gist - C++ source code to compute Pi with Klingenstierna's formula.")

### 3. C++ ソースコンパイル

``` text
$ g++ calc_pi_klingenstierna.cpp -o calc_pi_klingenstierna
```

何も出力されなければ成功。

### 4. 実行

``` text
$ ./calc_pi_klingenstierna
Please input number of Pi Decimal-Digits : 10000
** Pi Computation with the Klingenstierna formula method **
   Digits = 10000.
   Time   = 0.850000 seconds
```

"pi_klingenstierna.txt" というテキストファイルができているはずである。

File: `pi_klingenstierna.txt`

{% highlight text linenos %}
** Pi Computation with the Klingenstierna formula method **
   Digits = 10000.
   Time   = 0.850000 seconds.

          3.
00000001: 14159265 35897932 38462643 38327950 28841971 69399375 10582097 49445923 07816406 28620899
00000081: 86280348 25342117 06798214 80865132 82306647 09384460 95505822 31725359 40812848 11174502
00000161: 84102701 93852110 55596446 22948954 93038196 44288109 75665933 44612847 56482337 86783165
00000241: 27120190 91456485 66923460 34861045 43266482 13393607 26024914 12737245 87006606 31558817
00000321: 48815209 20962829 25409171 53643678 92590360 01133053 05488204 66521384 14695194 15116094
00000401: 33057270 36575959 19530921 86117381 93261179 31051185 48074462 37996274 95673518 85752724
00000481: 89122793 81830119 49129833 67336244 06566430 86021394 94639522 47371907 02179860 94370277
00000561: 05392171 76293176 75238467 48184676 69405132 00056812 71452635 60827785 77134275 77896091
00000641: 73637178 72146844 09012249 53430146 54958537 10507922 79689258 92354201 99561121 29021960
00000721: 86403441 81598136 29774771 30996051 87072113 49999998 37297804 99510597 31732816 09631859
00000801: 50244594 55346908 30264252 23082533 44685035 26193118 81710100 03137838 75288658 75332083
00000881: 81420617 17766914 73035982 53490428 75546873 11595628 63882353 78759375 19577818 57780532
00000961: 17122680 66130019 27876611 19590921 64201989 38095257 20106548 58632788 65936153 38182796
        :
===< 途中省略 >===
        :
00009121: 37800297 41207665 14793942 59029896 95946995 56576121 86561967 33786236 25612521 63208628
00009201: 69222103 27488921 86543648 02296780 70576561 51446320 46927906 82120738 83778142 33562823
00009281: 60896320 80682224 68012248 26117718 58963814 09183903 67367222 08883215 13755600 37279839
00009361: 40041529 70028783 07667094 44745601 34556417 25437090 69793961 22571429 89467154 35784687
00009441: 88614445 81231459 35719849 22528471 60504922 12424701 41214780 57345510 50080190 86996033
00009521: 02763478 70810817 54501193 07141223 39086639 38339529 42578690 50764310 06383519 83438934
00009601: 15961318 54347546 49556978 10382930 97164651 43840700 70736041 12373599 84345225 16105070
00009681: 27056235 26601276 48483084 07611830 13052793 20542746 28654036 03674532 86510570 65874882
00009761: 25698157 93678976 69742205 75059683 44086973 50201410 20672358 50200724 52256326 51341055
00009841: 92401902 74216248 43914035 99895353 94590944 07046912 09140938 70012645 60016237 42880210
00009921: 92764579 31065792 29552498 87275846 10126483 69998922 56959688 15920560 01016552 56375678
{% endhighlight %}

当方の非力なマシンでも１秒かかりませんでした。  
また、マチンの公式で計算出力した結果と一致しました。  

### 5. 参考サイト

* [円周率を求める公式・アルゴリズム - 円周率.jp -](http://xn--w6q13e505b.jp/formula/ "円周率を求める公式・アルゴリズム - 円周率.jp -")
* [πのArctan公式集](http://www5f.biglobe.ne.jp/~tsuushin/sub1d.html "πのArctan公式集")

---

自分の環境と相談して、計算する桁数を大きくしてみるのもよいでしょう。

また、結果が何万桁以上になる場合は、多桁（多倍長）乗算に上記の方法ではなく「Karatsuba法」や「Toom-Cook法」や「FFT（高速フーリエ変換）」を使うのが一般的なようです。  
いつか、挑戦してみたい次第です。

以上。

