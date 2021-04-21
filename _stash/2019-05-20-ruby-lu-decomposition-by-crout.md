---
layout   : single
title    : "Ruby - LU 分解（クラウト法(Crout method)）！"
published: true
date     : 2019-05-20 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で正方行列の LU 分解アルゴリズムを実装してみました。

今回使用する分解法は「クラウト法(Crout method)」です。

ちなみに、前々回は「外積形式ガウス法(outer-product form)」で、前回は「内積形式ガウス法(inner-product form)」で実装しました。

* [Ruby - LU 分解（外積形式ガウス法(outer-product form)）！]({{site.baseurl}}/2019/05/14/ruby-lu-decomposition-by-outer-product "Ruby - LU 分解（外積形式ガウス法(outer-product form)）！")
* [Ruby - LU 分解（内積形式ガウス法(inner-product form)）！]({{site.baseurl}}/2019/05/17/ruby-lu-decomposition-by-inner-product "Ruby - LU 分解（内積形式ガウス法(inner-product form)）！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.3 での作業を想定。

### 1. LU 分解について

![LU_DECOMPOSITION_1]({{site.baseurl}}/images/2019/05/20/LU_DECOMPOSITION_1.png "LU_DECOMPOSITION_1")
![LU_DECOMPOSITION_2]({{site.baseurl}}/images/2019/05/20/LU_DECOMPOSITION_2.png "LU_DECOMPOSITION_2")
![LU_DECOMPOSITION_3]({{site.baseurl}}/images/2019/05/20/LU_DECOMPOSITION_3.png "LU_DECOMPOSITION_3")

分解する方法には以下のようなものがある。（最初の3つがよく知られているもの）

* 外積形式ガウス法
* 内積形式ガウス法
* クラウト法
* ブロック形式ガウス法
* 縦ブロックガウス法
* 前進・後退代入
* ...

### 2. LU 分解（クラウト法(Crout method)）について

* LU 分解がなされたと仮定した上で、行列 U の対角要素を 1 として導出した方法。
* 長さ (1 ～ k - 1) のループ、長さ (k - n) のループの内、最も長いループを最内に移動可能なため、ベクトル計算機での実行性能が良い。
* 分解列および分解行の外側に 2 つの参照領域があり、どのようにデータ分割しても大量の通信が発生するため、分散メモリ型並列計算機での実装が困難。
* 参照領域があれば分解列と分解行は独立に計算が可能であるため、共有メモリ型並列計算機では並列化が可能。

### 3. Ruby スクリプトの作成

* 本来、 L と U の2つの行列に分けるものだが1つの行列にまとめている。（実際に LU 分解を使用する際に L と U を意識して取り扱えばよいだけなので）
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `lu_decomposition_3.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# ***********************************************
# LU 分解（クラウト法(Crout method)）
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
  # * U の対角要素を 1 とする
  #
  # @param   a: 元の正方行列 A(n, n)
  # @return  a: LU 分解後の正方行列 A(n, n)
  def lu_decompose(a)
    n = a.size

    begin
      0.upto(n - 1) do |k|
        k.upto(n - 1) do |i|
          sum = 0
          0.upto(k - 1) { |j| sum += a[i][j] * a[j][k] }
          a[i][k] -= sum
        end
        if a[k][k] == 0
          puts "Can't divide by 0 ..."
          exit
        end
        tmp = 1.0 / a[k][k]
        (k + 1).upto(n - 1) do |j|
          sum = 0
          0.upto(k - 1) { |i| sum += a[k][i] * a[i][j] }
          a[k][j] = (a[k][j] - sum) * tmp
        end
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

* [Gist - Ruby script to do LU-decomposition by Crout method.](https://gist.github.com/komasaru/0edb8589d6aa603f5956c995c113ad83 "Ruby script to do LU-decomposition by Crout method.")

### 4. Ruby スクリプトの実行

``` text
$ ./lu_decomposition_3.rb
A =
        2.00       -3.00        1.00
        1.00        1.00       -1.00
        3.00        5.00       -7.00
LU =
        2.00       -1.50        0.50
        1.00        2.50       -0.60
        3.00        9.50       -2.80
```

行列 U の対角成分を 1 として L と U に分けて LU を計算してみると、 A になるだろう。

---

以上。

