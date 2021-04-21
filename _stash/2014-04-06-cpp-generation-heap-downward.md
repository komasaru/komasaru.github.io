---
layout   : single
title    : "C++ - ヒープ生成（下方移動）！"
published: true
date     : 2014-04-06 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
---

前回は「ヒープ」の生成を「上方移動」で行うアルゴリズム、C++ での実装について紹介しました。

* [C++ - ヒープ生成（上方移動）！]({{site.baseurl}}/2014/04/04/cpp-generation-heap-upward "C++ - ヒープ生成（上方移動）！")

今回は「下方移動」によるヒープの生成についてです。

以下、簡単な説明と C++ ソースコードの紹介です。

<!--more-->

### 1. ヒープについて

「ヒープ」、「上方移動」については前回の記事を参照ください。

* [C++ - ヒープ生成（上方移動）！]({{site.baseurl}}/2014/04/04/cpp-generation-heap-upward "C++ - ヒープ生成（上方移動）！")

### 2. ヒープ生成方法（下方移動）

下方移動のアルゴリズムは、

* まず、上方移動同様、上位の親要素から順に配列化して考える。
* 子要素を持つ最後の親要素から順に上位へ以下の処理を繰り返す。
  - 親要素のほうが子要素より小さければ、２つの子要素のうち小さい方と親要素を交換する。
  - 交換した子要素を新たな親要素とし、親要素 ＜ 子要素 の関係を満たす間、下方のループに対して同じ処理を繰り返す。

![HEAP_4]({{site.baseurl}}/images/2014/04/05/HEAP_4.png "HEAP_4")

### 3. C++ ソースコード作成

以下のようにソースコードを作成してみた。（要素は乱数で生成）

File: `heap_downward.cpp`

{% highlight c linenos %}
/***********************************************************
 * ヒープ生成（下方移動）
 **********************************************************/
#include <cstdlib>   // for srand()
#include <iostream>  // for cout
#include <stdio.h>   // for printf()

#define N 100        // データ個数

using namespace std;

/*
 * ヒープクラス
 */
class Heap
{
    // 各種変数
    int n, i, s, p, w;            // Loop インデックス等
    int heap[N + 1];              // 木（後のヒープ）用配列

    public:
        Heap();                   // コンストラクタ
        void generate();          // ヒープ生成
    private:
        void swap(int *, int *);  // 要素交換
};

/*
 * コンストラクタ
 */
Heap::Heap()
{
    // ヒープの元になる木を生成
    srand((unsigned int)time(NULL));
    printf("#### Tree\n");
    for (i = 1; i <= N; i++) {
        heap[i] = rand() % N + 1;
        printf("%5d ", heap[i]);
        if (i % 10 == 0) printf("\n");
    }
    printf("\n");
}

/*
 * ヒープ生成
 */
void Heap::generate()
{
    n = N;              // データ個数
    for (i = n / 2; i >= 1; i--) {
        p = i;          // 親要素の位置
        s = 2 * p;      // 左の子要素の位置
        while (s <= n) {
            if (s < n && heap[s + 1] < heap[s]) s++;  // 左右子要素の小さい方
            if (heap[p] <= heap[s]) break;
            swap(&heap[p], &heap[s]);
            p = s;      // 親要素の位置
            s = 2 * p;  // 左の子要素の位置
        }
    }

    // 結果出力
    printf("#### Heap\n");
    for (i = 1; i <= n; i++) {
        printf("%5d ", heap[i]);
        if (i % 10 == 0) printf("\n");
    }
    printf("\n");
}

void Heap::swap(int *a, int *b)
{
    w  = *a;
    *a = *b;
    *b = w;
}

/*
 * メイン処理
 */
int main()
{
    try
    {
        // ==== インスタンス化
        Heap objHeap;

        // ==== ヒープ生成
        objHeap.generate();
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

* [Gist - C++ source code to generate a heap with the downward method.](https://gist.github.com/komasaru/2b1e52dad78e9d3eaeff0de591b02163 "Gist - C++ source code to generate a heap with the downward method.")

### 4. C++ ソースコンパイル

（-Wall は警告出力、-O2 最適化のオプション）

``` text
$ g++ -Wall -O2 -o heap_downward heap_downward.cpp
```

何も出力されなければ成功。

### 5. 実行

``` text
$ ./heap_downward.rb

#### Tree

   12    36    56    34     3    41    14    99    43    36
   84    66    54    40    29    88    65    47    67    56
   71     3    73    86    60     7    30    12    57    41
    2    68    29    57     1    83    50    67    82    44
    2    17     9     7    56    38    94    20    36    61
   28     7    15   100    44    74     6    25    37    63
   17    38    82    97    47    35    80    48    53    13
   91     6    29    99    12    84    88     6    56    24
   18    83    82    84    82    25     9    39     1    46
    1    17    35    35    66    33    21    45    80    73

#### Heap

    1     1     2     6     1     7     6    13     6     2
    3    20     7    12    14    29    34    12    36    18
    9     3    17    21    28    15    30    40    25    17
   29    47    35    48    65    29    43    67    56    24
   56    17     9     7    46    35    35    33    36    61
   60    54    41   100    44    74    56    57    37    63
   41    38    82    97    68    88    80    57    53    99
   91    83    47    99    50    84    88    82    67    36
   44    83    82    84    82    25    71    39    12    84
   56    38    73    94    66    66    86    45    80    73
```

実際に配列を置き換えてみると、ヒープになっていることが確認できる。

---

あらかじめ配列が用意されている場合は、今回の下方移動の方が良いかも知れません。

以上。

