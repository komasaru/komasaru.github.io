---
layout   : single
title    : "Ruby - LU 分解（内積形式ガウス法(inner-product form)）！"
published: true
date     : 2019-05-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で正方行列の LU 分解アルゴリズムを実装してみました。

今回使用する分解法は「内積形式ガウス法(inner-product form)」です。

ちなみに、前回は「外積形式ガウス法(outer-product form)」で実装しました。

* [Ruby - LU 分解（外積形式ガウス法(outer-product form)）！]({{site.baseurl}}/2019/05/14/ruby-lu-decomposition-by-outer-product "Ruby - LU 分解（外積形式ガウス法(outer-product form)）！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.3 での作業を想定。

### 1. LU 分解について

![LU_DECOMPOSITION_1]({{site.baseurl}}/images/2019/05/17/LU_DECOMPOSITION_1.png "LU_DECOMPOSITION_1")
![LU_DECOMPOSITION_2]({{site.baseurl}}/images/2019/05/17/LU_DECOMPOSITION_2.png "LU_DECOMPOSITION_2")
![LU_DECOMPOSITION_3]({{site.baseurl}}/images/2019/05/17/LU_DECOMPOSITION_3.png "LU_DECOMPOSITION_3")

分解する方法には以下のようなものがある。（最初の3つがよく知られているもの）

* 外積形式ガウス法
* 内積形式ガウス法
* クラウト法
* ブロック形式ガウス法
* 縦ブロックガウス法
* 前進・後退代入
* ...

### 2. LU 分解（内積形式ガウス法(inner-product form)）について

* LU 分解がなされたと仮定した上で、行列 L の対角要素を 1 として導出した方法。
* 分解列の左側の領域が主に参照される方法で、 "left-looking" アルゴリズムと呼ばれる。
* 並列化について
  + 行列 A を列方向分散 (＊, Cyclic)
    - 参照領域のデータがないので、通信が多発する。（ベクトルリダクションが毎回必要）
  + 行列 A を行方向分散 (Cyclic, ＊)
    - 上三角行列 U の要素（データ数が少ない）を所有すれば、独立して計算可能。

### 3. Ruby スクリプトの作成

* 本来、 L と U の2つの行列に分けるものだが1つの行列にまとめている。（実際に LU 分解を使用する際に L と U を意識して取り扱えばよいだけなので）
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `lu_decomposition_2.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# ***********************************************
# LU 分解（内積形式ガウス法(inner-product form)）
# ***********************************************
#
class LuDecomposition
  # 元の行列
  A = [
    [2, -3,  1],
    [1,  1, -1],
    [3,  5, -7]
  ]

  # 実行
  def exec
    display("A", A)       # 元の行列 A
    lu = lu_decompose(A)  # LU 分解
    display("LU", lu)     # 結果出力
  end

  private

  # LU 分解
  # * L の対角要素を 1 とする
  #
  # @param   a: 元の正方行列 A(n, n)
  # @return  a: LU 分解後の正方行列 A(n, n)
  def lu_decompose(a)
    n = a.size

    begin
      0.upto(n - 1) do |k|
        0.upto(k - 1) do |j|
          tmp = a[j][k]
          (j + 1).upto(n - 1) { |i| a[i][k] -= a[i][j] * tmp }
        end
        if a[k][k] == 0
          puts "Can't divide by 0 ..."
          exit
        end
        tmp = 1.0 / a[k][k]
        (k + 1).upto(n - 1) { |i| a[i][k] *= tmp }
      end
      return a
    rescue => e
      raise
    end
  end

  # 行列出力
  #
  # @param s: 行列名
  # @param a: 行列(n * n)
  def display(s, a)
    n = a.size

    begin
      puts "#{s} = "
      n.times do |i|
        n.times { |j| print "  %10.2f" % a[i][j] }
        puts
      end
    rescue => e
      raise
    end
  end
end

LuDecomposition.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to do LU-decomposition by inner-product form.](https://gist.github.com/komasaru/5c924c257cbc1208b162090d6c530536 "Ruby script to do LU-decomposition by inner-product form.")

### 4. Ruby スクリプトの実行

``` text
$ ./lu_decomposition_2.rb
A =
        2.00       -3.00        1.00
        1.00        1.00       -1.00
        3.00        5.00       -7.00
LU =
        2.00       -3.00        1.00
        0.50        2.50       -1.50
        1.50        3.80       -2.80
```

行列 L の対角成分を 1 として L と U に分けて LU を計算してみると、 A になるだろう。

---

以上。

