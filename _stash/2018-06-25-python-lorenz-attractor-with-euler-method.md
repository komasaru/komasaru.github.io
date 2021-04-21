---
layout   : single
title    : "Python - ローレンツ・アトラクタ（Euler 法）！"
published: true
date     : 2018-06-25 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

先日、 Ruby でローレンツ・アトラクタを計算＆描画しました。

* [Ruby - ローレンツ・アトラクタ（Euler 法）！]({{site.baseurl}}/2018/06/19/ruby-lorenz-attractor-with-euler-method "Ruby - ローレンツ・アトラクタ（Euler 法）！")
* [Ruby - ローレンツ・アトラクタ（Runge-Kutta 法）！]({{site.baseurl}}/2018/06/22/ruby-lorenz-attractor-with-runge-kutta-method "Ruby - ローレンツ・アトラクタ（Runge-Kutta 法）！")

今回は、 Python でローレンツ・アトラクタを計算＆描画してみました。（微分方程式の近似解法には、同じく Euler（オイラー）法を使用）

<!--more-->

### 0. 前提条件

* Python 3.6.4 （エンコード：UTF-8）での作業を想定。

### 1. ローレンツ方程式／アトラクタとは

* 「ローレンツ方程式」とは、気象学者「エドワード・Ｎ・ローレンツ(Edward N. Lorenz)」が作成した力学系方程式をより単純化した、次のような非線形微分方程式。  
  パラメータ p, r, b をほんの少し変えるだけで、これらの方程式から得られる軌跡は大きく異なったものになる。

$$
\begin{eqnarray}
\frac{dx}{dt} &=& -px+py \\
\frac{dy}{dt} &=& -xz+rx-y \\
\frac{dz}{dt} &=& xy-bz
\end{eqnarray}
$$

* 「ローレンツ方程式」は、カオス理論を学習する際に序盤で登場する方程式で、カオス研究の先駆的なもの。
* 「アトラクタ」とは、ある力学系がそこに向かって時間発展する集合のことで、カオス理論における研究課題の一つ。
* 「ローレンツ・アトラクタ」とは、ストレンジ・アトラクタの一種。
* 「ローレンツ・アトラクタ」は、言い換えれば、「ローレンツ方程式のカオスのストレンジ・アトラクタ」である。

### 2.  Euler（オイラー）法とは

* 微分方程式の近似解法の中で計算が比較的簡単なものだが、その分、計算も粗い。
* 実際の研究等で使用されることはほとんどない。
* 近似解法の概念を理解するための一助にはなる。
* ここでは、 Euler 法の詳細については説明しない。

### 3. Python スクリプト作成

* 数値演算ライブラリ NumPy は使用しない。（使用するほどでもないので）
* グラフ描画には "matplotlib" ライブラリを使用。（要インストール）
* パラメータ `p`, `r`, `b` のデフォルト値は `10`, `28`, `8/3` としている。  
  変更したければ、 `lorenz` メソッド呼び出し時に引数で指定する。
* 実際、ローレンツ・アトラクタを計算する際に計算の粗い Euler 法を使用することはあまりない（ルンゲ＝クッタ法で計算することが多い）ので、あくまでも、参考程度に。

File: `lorenz_attractor_euler.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Lorenz attractor (Euler method)
"""
import sys
import traceback
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D


class LorenzAttractorEuler:
    DT            = 1e-3     # Differential interval
    STEP          = 100000   # Time step count
    X_0, Y_0, Z_0 = 1, 1, 1  # Initial values of x, y, z

    def __init__(self):
        self.res = [[], [], []]

    def exec(self):
        """ Loranz attractor (Euler method) execution """
        try:
            xyz = [self.X_0, self.Y_0, self.Z_0]
            for _ in range(self.STEP):
                l = self.__lorenz(xyz)
                for i in range(3):
                    xyz[i] += self.DT * l[i]
                    self.res[i].append(xyz[i])
            self.__plot()
        except Exception as e:
            raise

    def __lorenz(self, xyz, p=10, r=28, b=8/3.0):
        """ Lorenz equation

        :param  list xyz
        :param  float  p
        :param  float  r
        :param  float  b
        :return list xyz
        """
        try:
            return [
                -p * xyz[0] + p * xyz[1],
                -xyz[0] * xyz[2] + r * xyz[0] - xyz[1],
                xyz[0] * xyz[1] - b * xyz[2]
            ]
        except Exception as e:
            raise

    def __plot(self):
        """ Protting """
        try:
            fig = plt.figure()
            ax = Axes3D(fig)
            ax.set_xlabel("x")
            ax.set_ylabel("y")
            ax.set_zlabel("z")
            ax.set_title("Lorenz attractor (Euler method)")
            ax.plot(self.res[0], self.res[1], self.res[2], lw=1)
            #plt.show()
            plt.savefig("lorenz_attractor_euler.png")
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = LorenzAttractorEuler()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to draw a lorenz attractor with Euler's method.](https://gist.github.com/komasaru/47f757cab99399ff653dbe31eef237a2 "Gist - Python script to draw a lorenz attractor with Euler's method.")

### 4. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x lorenz_attractor_euler.py
```

そして、実行。

``` text
$ ./lorenz_attractor_euler.py
```

### 5. 結果確認

Python スクリプトと同じディレクトリ内に "lorenz_attractor_euler.png" という画像ファイルが作成されるので、確認してみる。

![LORENZ_ATTRACTOR_EULER]({{site.baseurl}}/images/2018/06/25/LORENZ_ATTRACTOR_EULER.png "LORENZ_ATTRACTOR_EULER")

---

以上。

