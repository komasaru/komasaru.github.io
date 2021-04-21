---
layout   : single
title    : "C++ - ソート処理各種テスト！"
published: true
date     : 2014-04-10 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
---

各種ソート処理について C++ で実装して速度を計測してみました。

以下、各種ソート処理の概要と C++ ソースです。

<!--more-->

### 0. 前提条件

* c++ (Ubuntu/Linaro 4.6.3-1ubuntu5) 4.6.3 での作業を想定。
* 各種ソートの試行は以下のように行なった。
  * １回のソートに使用するデータの個数は 1,000 個。
  * データそれぞれは 0 以上 10,000 未満の整数。
  * ソート試行（ループ）回数は、10,000 回。（１回のソートは一瞬であるため）
* 各種ソートのアルゴリズムの詳細については説明しない。（必要なら、別途お調べください）  
  ここでは、それぞれのアルゴリズムを C++ で実装して試行することに専念している。

### 1. 各種ソートについて

* **基本交換法（バブル・ソート）**  
  隣接する２項を逐次交換する。原理は簡単だが交換回数が多い。  
  計算量：$$O(n^{2})$$
* **基本選択法（直接選択法）**  
  数列から最大（最小）を探すことを繰り返す。比較回数は多いが交換回数は少ない。  
  計算量：$$O(n^{2})$$
* **基本挿入法**  
  整列された部分数列に対し該当項を適切な位置に挿入することを繰り返す。  
  計算量：$$O(n^{2})$$
* **改良交換法（クイック・ソート）**  
  数列の要素を１つずつ取り出し、それが数列の中で何番目になるかその位置を求める。  
  計算量：$$O(n log_{2}n)$$
* **改良選択法（ヒープ・ソート）**  
  数列をヒープ構造（一種の木構造）にしてソートを行う。  
  計算量：$$O(n log_{2}n)$$
* **改良挿入法（シェル・ソート）**  
  数列を飛び(gap)のあるいくつかの部分数列に分け、そのそれぞれを基本挿入法でソートする。  
  計算量：$$O(n^{1.2})$$

### 2. C++ ソースコード作成

以下のように、作成してみた。（ヘッダファイルとメイン、サブとファイルを分割している）

File: `sort_test.cpp`

{% highlight c linenos %}
/***********************************************************
 * ソート処理各種のテスト
 **********************************************************/
#include <iostream>
#include "sort.h"

using namespace std;

/*
 * メイン処理
 */
int main()
{
    try
    {
        // ==== インスタンス化
        Sort objSort;

        // ==== ソート処理実行
        objSort.exec();
    }
    catch (...) {
        // ==== 異常終了
        cout << "例外発生！" << endl;
        return -1;
    }

    // ==== 正常終了
    return 0;
}
{% endhighlight %}

File: `sort.h`

{% highlight c linenos %}
#ifndef INCLUDED_SORT_H
#define INCLUDED_SORT_H

#include <stdio.h>
#include <time.h>

#define N 1000   // データ個数
#define M 10000  // 値 MAX ( M 未満 )
#define L 10000  // ソート試行回数

/*
 * ソートクラス
 */
class Sort
{
    // 各種変数
    double tt;                            // 計算時間
    clock_t t1, t2;                       // 計算開始CPU時刻、計算終了CPU時刻
    int i, j, k, l;                       // Loop インデックス
    int base[N];                          // 元データ用配列
    int a[N];                             // 作業用配列
    int h[N + 1];                         // 作業用配列(ヒープ・ソート用)
    int min, s, t, gap, m, n, p, w;       // ソート処理用ワーク

public:
    Sort();                               // コンストラクタ
    void exec();                          // ソート処理実行

private:
    void sort_bubble(int *);              // 基本交換法(バブル・ソート)
    void sort_selection(int *);           // 基本選択法(直接選択法)
    void sort_insertion(int *);           // 基本挿入法
    void sort_quick(int *);               // 改良交換法(クイック・ソート)
    void sort_heap_up(int *);             // 改良選択法(ヒープ・ソート)(上方移動)
    void sort_heap_down(int *);           // 改良選択法(ヒープ・ソート)(下方移動)
    void sort_shell(int *);               // 改良挿入法(シェル・ソート)
    void quick(int *, int, int);          // クイック・ソート用再帰関数
    void generate_heap_up(int *, int *);  // ヒープ・ソート用ヒープ作成(上方移動)関数
    void generate_heap_down(int *);       // ヒープ・ソート用ヒープ作成(下方移動)関数
    void swap(int *, int *);              // ヒープ・ソート用スワップ関数
    void copy_array(int *, int *);        // 配列コピー
    void display(int *, double, int);     // 結果出力
};

#endif
{% endhighlight %}

File: `sort.cpp`

{% highlight c linenos %}
#include <cstdlib>   // for srand()
#include "sort.h"

using namespace std;

/*
 * コンストラクタ
 */
Sort::Sort()
{
    // 元になる配列を生成
    srand((unsigned int)time(NULL));
    printf("#### Base Array\n");
    for (i = 0; i < N; i++) {
        base[i] = rand() % M;
        printf("%5d ", base[i]);
        if ((i + 1) % 10 == 0) printf("\n");
    }
    printf("\n");
}

/*
 * 計算
 */
void Sort::exec()
{
    // 基本交換法（バブル・ソート）
    printf("%-22s", "1  : Bubble Sort");
    sort_bubble(base);

    // 基本選択法（直接選択法）
    printf("%-22s", "2  : Selection Sort");
    sort_selection(base);

    // 基本挿入法
    printf("%-22s", "3  : Insertion Sort");
    sort_insertion(base);

    // 改良交換法（クイック・ソート）
    printf("%-22s", "4  : Quick Sort");
    sort_quick(base);

    // 改良選択法（ヒープ・ソート）（上方移動）
    printf("%-22s", "5-1: Heap Sort(Up)");
    sort_heap_up(base);

    // 改良選択法（ヒープ・ソート）（下方移動）
    printf("%-22s", "5-2: Heap Sort(Down)");
    sort_heap_down(base);

    // 改良挿入法（シェル・ソート）
    printf("%-22s", "6  : Shell Sort");
    sort_shell(base);
}

/*
 * 基本交換法（バブル・ソート）
 */
void Sort::sort_bubble(int *base)
{
    // 処理開始時刻
    t1 = clock();

    // 指定回数 LOOP
    for (l = 0; l < L; l++) {
        // 配列コピー
        for (i = 0; i < N; i++) a[i] = base[i];

        // ソート処理
        for (i = 1; i < N - 1; i++) {
            for (j = N - 1; j > i; j--) {
                if (a[j] < a[j - 1]) {
                    t        = a[j];
                    a[j]     = a[j - 1];
                    a[j - 1] = t;
                }
            }
        }
    }

    // 処理時間計算・結果出力
    t2 = clock();
    tt = (double)(t2 - t1) / CLOCKS_PER_SEC;
    display(a, tt, 0);
}

/*
 * 基本選択法（直接選択法）
 */
void Sort::sort_selection(int *base)
{
    // 処理開始時刻
    t1 = clock();

    // 指定回数 LOOP
    for (l = 0; l < L; l++) {
        // 配列コピー
        for (i = 0; i < N; i++) a[i] = base[i];

        // ソート処理
        for (i = 0; i < N - 1; i++) {
            min = a[i];
            s = i;
            for (j = i + 1; j < N ; j++) {
                if (a[j] < min) {
                    min = a[j];
                    s   = j;
                }
            }
            t    = a[i];
            a[i] = a[s];
            a[s] = t;
        }
    }

    // 処理時間計算・結果出力
    t2 = clock();
    tt = (double)(t2 - t1) / CLOCKS_PER_SEC;
    display(a, tt, 0);
}

/*
 * 基本挿入法
 */
void Sort::sort_insertion(int *base)
{
    // 処理開始時刻
    t1 = clock();

    // 指定回数 LOOP
    for (l = 0; l < L; l++) {
        // 配列コピー
        for (i = 0; i < N; i++) a[i] = base[i];

        // ソート処理
        for (i = 1; i < N; i++) {
            for (j = i - 1; j >= 0; j--) {
                if (a[j] > a[j + 1]) {
                    t        = a[j];
                    a[j]     = a[j + 1];
                    a[j + 1] = t;
                } else {
                    break;
                }
            }
        }
    }

    // 処理時間計算・結果出力
    t2 = clock();
    tt = (double)(t2 - t1) / CLOCKS_PER_SEC;
    display(a, tt, 0);
}

/*
 * 改良交換法 (クイック・ソート)
 */
void Sort::sort_quick(int *base)
{
    // 処理開始時刻
    t1 = clock();

    // 指定回数 LOOP
    for (l = 0; l < L; l++) {
        // 配列コピー
        for (i = 0; i < N; i++) a[i] = base[i];

        // ソート処理
        quick(a, 0, N - 1);
    }

    // 処理時間計算・結果出力
    t2 = clock();
    tt = (double)(t2 - t1) / CLOCKS_PER_SEC;
    display(a, tt, 0);
}

/*
 * 改良選択法 (ヒープ・ソート)(上方移動)
 */
void Sort::sort_heap_up(int *base)
{
    // 処理開始時刻
    t1 = clock();

    // 指定回数 LOOP
    for (l = 0; l < L; l++) {
        // 初期ヒープ作成(上方移動)
        generate_heap_up(h, base);

        // ソート処理
        n = N;  // データ個数
        m = N;  // n の保存
        while (n > 1) {
            swap(&h[1], &h[n]);
            n--;    // 木の終端切り離し

            p = 1;
            s = 2 * p;
            while (s <= n) {
                if (s < n && h[s + 1] > h[s]) s++;
                if (h[p] >= h[s]) break;
                swap(&h[p], &h[s]);
                p = s;
                s = 2 * p;
            }
        }
    }

    // 処理時間計算・結果出力
    t2 = clock();
    tt = (double)(t2 - t1) / CLOCKS_PER_SEC;
    display(h, tt, 1);
}

/*
 * 改良選択法 (ヒープ・ソート)(下方移動)
 */
void Sort::sort_heap_down(int *base)
{
    // 処理開始時刻
    t1 = clock();

    // 指定回数 LOOP
    for (l = 0; l < L; l++) {
        // 元の配列を元の木としてコピー
        for (i = 1; i <= N; i++)
            h[i] = base[i - 1];

        // 初期ヒープ作成(下方移動)
        generate_heap_down(h);

        // ソート処理
        n = N;  // データ個数
        m = N;  // n の保存
        while (n > 1) {
            swap(&h[1], &h[n]);
            n--;    // 木の終端切り離し

            p = 1;
            s = 2 * p;
            while (s <= n) {
                if (s < n && h[s + 1] > h[s]) s++;
                if (h[p] >= h[s]) break;
                swap(&h[p], &h[s]);
                p = s;
                s = 2 * p;
            }
        }
    }

    // 処理時間計算・結果出力
    t2 = clock();
    tt = (double)(t2 - t1) / CLOCKS_PER_SEC;
    display(h, tt, 1);
}

/*
 * 改良挿入法 (シェル・ソート)
 */
void Sort::sort_shell(int *base)
{
    // 処理開始時刻
    t1 = clock();

    // 指定回数 LOOP
    for (l = 0; l < L; l++) {
        // 配列コピー
        for (i = 0; i < N; i++) a[i] = base[i];

        // ソート処理
        gap = N / 2;
        while (gap >0) {
            for (k = 0; k < gap; k++) {
                for (i = k + gap; i < N; i += gap) {
                    for (j = i - gap; j >= k; j -= gap) {
                        if (a[j] > a[j + gap]) {
                            t          = a[j];
                            a[j]       = a[j + gap];
                            a[j + gap] = t;
                        } else {
                            break;
                        }
                    }
                }
            }
            gap /= 2;
        }
    }

    // 処理時間計算・結果出力
    t2 = clock();
    tt = (double)(t2 - t1) / CLOCKS_PER_SEC;
    display(a, tt, 0);
}

/*
 * クイック・ソート用再帰関数
 */
void Sort::quick(int *a, int left, int right)
{
    if (left < right) {
        s = a[left];             // 最左項を軸にする
        i = left;                // 軸より小さいグループ
        j = right + 1;           // 軸より大きいグループ
        while (1) {
            while (a[++i] < s);
            while (a[--j] > s);
            if (i >= j) break;
            t    = a[i];
            a[i] = a[j];
            a[j] = t;
        }
        a[left] = a[j];
        a[j]    = s;             // 軸を正しい位置に挿入
        quick(a, left, j - 1);   // 左部分列に対する再帰呼び出し
        quick(a, j + 1, right);  // 右部分列に対する再帰呼び出し
    }
}

/*
 * ヒープ・ソート用ヒープ生成（上方移動）関数
 */
void Sort::generate_heap_up(int *heap, int *base)
{
    for (i = 1; i <= N; i++) {
        // 元データ配列から１つヒープ要素として追加
        heap[i] = base[i - 1];

        s = i;          // 追加要素の位置
        p = s / 2;      // 親要素の位置
        while (s >= 2 && heap[p] < heap[s]) {
            w       = heap[p];
            heap[p] = heap[s];
            heap[s] = w;
            s = p;      // 追加要素の位置
            p = s / 2;  // 親要素の位置
        }
    }
}

/*
 * ヒープ・ソート用ヒープ生成（下方移動）関数
 */
void Sort::generate_heap_down(int *heap)
{
    n = N;              // データ個数
    for (i = n / 2; i >= 1; i--) {
        p = i;          // 親要素の位置
        s = 2 * p;      // 左の子要素の位置
        while (s <= n) {
            if (s < n && heap[s + 1] > heap[s]) s++;  // 左右子要素の小さい方
            if (heap[p] >= heap[s]) break;
            swap(&heap[p], &heap[s]);  // 交換
            p = s;      // 親要素の位置
            s = 2 * p;  // 左の子要素の位置
        }
    }
}

/*
 * ヒープ・ソート用スワップ関数
 */
void Sort::swap(int *a, int *b)
{
    t  = *a;
    *a = *b;
    *b = t;
}

/*
 * 結果出力
 *   k = 0 (ヒープ以外用)
 *   k = 1 (ヒープ用)
 */
void Sort::display(int *a, double tt, int k)
{
    // ソート結果確認
    //  (ソート結果を確認したければ、以下のコメント解除)
    //printf("\n");
    //for (i = k; i < N + k; i++) {
    //    printf("%5d ", a[i]);
    //    if ((i + 1 - k) % 10 == 0) printf("\n");
    //}

    // 処理時間出力
    printf("Time: %6.2lf sec.\n", tt);
}
{% endhighlight %}

* [Gist - C++ source code to test sorting algorithms.](https://gist.github.com/komasaru/5614cd0ba34937765ac3c71957b00f9b "Gist - C++ source code to test sorting algorithms.")

### 3. C++ ソースコンパイル

（`-Wall` は警告出力、`-O2` 最適化のオプション）

``` text
$ g++ -Wall -O2 -o sort_test sort.h sort.cpp sort_test.cpp
```

何も出力されなければ成功。

### 4. 実行

``` text
$ ./sort_test

#### Base Array

 3363   658  6626  6241  6913   524  7298  7813  6854  5659
 7515  9857  6991  1365  1699  9280  3575  5902  3565  9067
 4318  9795  9867  8825  2972  1451  9100  5907  4745  6697
 9229  8108  3707  5855  4350   620  6379  8000  8434  3233
   11  2301  9442  7002  3666  1141  6283  3594  3396  9848
 9013  4066  9643  8880  2891  8967  6683  8343  1226  1429
 1392   455  9537  5100  6310   239  2072  9041  4592  6858
 2274  4603  9160  8068  7958  2826  9210   593  2772  8958
  441  1785  3024  6437   665  2267  1756  3701  6963  2983
 5130  8355  3438  1019  3455  6101  7611  5528  5142  2203

                   ====< 途中省略 >====

  560  1082  5720  3416  8565  7506  5820  2002  6923  7262
 5790  4352  1380  5314  5603  1346  4262  9839  5431  9088
 6807  7771  8492  4661  2574  8774  3475  5575  5246  7110
 2425  5806  8192  8146  5575  3109  5652  7747  5112  8927
 5009  7254  3280  6389  8920  5235  4087  3182  1427  9518
 8622  8234  7289  7114  2895  6216  2241  2722  1791  7487
 9832  4216  9645  8025  8714  5220  1134  4367  9319  2598
 3294  4328  6204  2926  7069  5125  8162  7508  4659  5941
 3378  9634  4175   668  3100  7071  3236  5341  9793  5027
 9180  5978  5595  8826  4003   662   398  1489  5029  9718

1  : Bubble Sort      Time:  15.92 sec.
2  : Selection Sort   Time:   9.12 sec.
3  : Insertion Sort   Time:   4.29 sec.
4  : Quick Sort       Time:   0.69 sec.
5-1: Heap Sort(Up)    Time:   0.68 sec.
5-2: Heap Sort(Down)  Time:   0.64 sec.
6  : Shell Sort       Time:   0.80 sec.
```

### 4. 結果

何回か実行してみた結果、処理の早い順は大体以下のようになった。（「改良選択法」と「改良交換法」は、入れ替わることもあった）

1. 改良選択法（ヒープ・ソート（下方移動））
2. 改良選択法（ヒープ・ソート（上方移動））
3. 改良交換法（クイック・ソート）
4. 改良挿入法（シェル・ソート）
5. 基本挿入法
6. 基本選択法（直接選択法）
7. 基本交換法（バブル・ソート）

---

多方面で使用することのあるアルゴリズムについてでした。  
情報処理技術者試験等でよく出題されるアルゴリズムですが、実際に使用する局面も多々ありますし。。。

以上。

