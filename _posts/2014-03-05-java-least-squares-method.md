---
layout   : single
title    : "Java - 最小二乗法！"
published: true
date     : 2014-03-05 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Java
---

これまで、C++, Ruby, Fortran による「最小二乗法」のアルゴリズムを紹介しました。

* [C++ - 最小二乗法！]({{site.baseurl}}/2014/03/02/cpp-least-squares-method/ "C++ - 最小二乗法！")
* [Ruby - 最小二乗法！]({{site.baseurl}}/2014/03/03/ruby-least-squares-method/ "Ruby - 最小二乗法！")
* [Fortran - 最小二乗法！]({{site.baseurl}}/2014/03/04/fortran-least-squares-method/ "Fortran - 最小二乗法！")

今回は、同じアルゴリズムを Java で実現してみました。アルゴリズムについては、上記リンクの記事を参照してください。

<!--more-->

### 0. 前提条件

* Linux Mint 13 Maya (64bit) での作業を想定。
* コンパイラ・ランタイムは、 Oracle Java 1.7.0_51 を想定。
* 最小二乗法についての説明は割愛。（「[C++ - 最小二乗法！]({{site.baseurl}}/2014/03/02/cpp-least-squares-method/ "C++ - 最小二乗法！")」を参照）

### 1. Java ソースコード作成

File: `LeastSquaresMethod.java`

{% highlight java linenos %}
/**************************************
 最小二乗法 ( LeastSquaresMethod.java )
 **************************************/

/*
 * 計算クラス
 */
class Calc {
    // 定数定義
    static final byte N = 7;  // データ数
    static final byte M = 5;  // 予測曲線の次数
    static final double X[] = {-3, -2, -1,  0, 1, 2, 3};  // 測定データ x
    static final double Y[] = { 5, -2, -3, -1, 1, 4, 5};  // 測定データ y

    // 変数宣言
    double s[]   = new double[2 * M + 1];
    double t[]   = new double[M + 1];
    double a[][] = new double[M + 1][M + 2];

    // コンストラクタ
    Calc() {
        // s[] 初期化
        for (int i = 0; i <= 2 * M; i++)
            s[i] = 0;
        // t[] 初期化
        for (int i = 0; i <= M; i++)
            t[i] = 0;
    }

    // 最小二乗法
    void calcLeastSquaresMethod() {
        try {
            // s[], t[] 計算
            calcST();

            // a[][] に s[], t[] 代入
            insST();

            // 掃き出し
            sweepOut();
        } catch(Exception e) {
            e.printStackTrace();
        }
    }

    // s[], t[] 計算
    private void calcST() {
        for (int i = 0; i < N; i++) {
            for (int j = 0; j <= 2 * M; j++)
                s[j] += Math.pow(X[i], j);
            for (int j = 0; j <= M; j++)
                t[j] += Math.pow(X[i], j) * Y[i];
        }
    }

    // a[][] に s[], t[] 代入
    private void insST() {
        for (int i = 0; i <= M; i++) {
            for (int j = 0; j <= M; j++)
                a[i][j] = s[i + j];
            a[i][M + 1] = t[i];
        }
    }

    // 掃き出し
    private void sweepOut() {
        for (int k = 0; k <= M; k++) {
            double p = a[k][k];
            for (int j = k; j <= M + 1; j++)
                a[k][j] /= p;
            for (int i = 0; i <= M; i++) {
                if (i != k) {
                    double d = a[i][k];
                    for (int j = k; j <= M + 1; j++)
                        a[i][j] -= d * a[k][j];
                }
            }
        }
    }

    // y 値計算＆結果出力
    void display() {
        try {
            for (int k = 0; k <= M; k++)
                System.out.printf("a%d = %10.6f\n", k, a[k][M + 1]);
            System.out.println("    x    y");
            for (double px = -3; px <= 3; px += .5) {
                double p = 0;
                for (int k = 0; k <= M; k++)
                    p += a[k][M + 1] * Math.pow(px, k);
                System.out.printf("%5.1f%5.1f\n", px, p);
            }
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}

/*
 * メイン
 */
class LeastSquaresMethod {
    public static void main (String[] args) {
        Calc obj = new Calc();

        try {
            // 最小二乗法計算
            obj.calcLeastSquaresMethod();

            // 結果出力
            obj.display();
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
{% endhighlight %}

* [Gist - Java source code to solve approximate equation with least squares method.](https://gist.github.com/komasaru/16685923a607793fef7c2b01c4b5ca5c "Gist - Java source code to solve approximate equation with least squares method.")

### 2. Java ソースコードコンパイル

``` text
$ javac LeastSquaresMethod.java
```

何も出力されなければ成功。

### 3. 実行

実際に、実行してみる。

``` text
$ java LeastSquaresMethod
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

C++ 版、Ruby 版、Fortran 版と同じ結果になるはず。

---

「昔取った杵柄」で Java でも実装してみた次第です。

以上。

