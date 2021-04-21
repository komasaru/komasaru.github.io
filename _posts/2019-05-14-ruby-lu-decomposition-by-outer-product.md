---
layout   : single
title    : "Ruby - LU 分解（外積形式ガウス法(outer-product form)）！"
published: true
date     : 2019-05-14 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で正方行列の LU 分解アルゴリズムを実装してみました。

今回使用する分解法は「外積形式ガウス法(outer-product form)」です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.3 での作業を想定。

### 1. LU 分解について

![LU_DECOMPOSITION_1]({{site.baseurl}}/images/2019/05/14/LU_DECOMPOSITION_1.png "LU_DECOMPOSITION_1")
![LU_DECOMPOSITION_2]({{site.baseurl}}/images/2019/05/14/LU_DECOMPOSITION_2.png "LU_DECOMPOSITION_2")
![LU_DECOMPOSITION_3]({{site.baseurl}}/images/2019/05/14/LU_DECOMPOSITION_3.png "LU_DECOMPOSITION_3")

分解する方法には以下のようなものがある。（最初の3つがよく知られているもの）

* 外積形式ガウス法
* 内積形式ガウス法
* クラウト法
* ブロック形式ガウス法
* 縦ブロックガウス法
* 前進・後退代入
* ...

### 2. LU 分解（外積形式ガウス法(outer-product form)）について

* ガウス消去法と同等の操作で LU 分解する方法。
* 分解列の右側の領域が更新される方法で、 "right-looking" アルゴリズムと呼ばれる。
* 処理の中心の更新領域が多く、更新処理が分解行と分解列という少ないデータを所有するだけで要素ごとに独立して行えるため、並列化に向いている。

### 3. Ruby スクリプトの作成

* 本来、 L と U の2つの行列に分けるものだが1つの行列にまとめている。（実際に LU 分解を使用する際に L と U を意識して取り扱えばよいだけなので）
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `lu_decomposition.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# ***********************************************
# LU 分解（外積形式ガウス法(outer-product form)）
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
        if a[k][k] == 0
          puts "Can't divide by 0 ..."
          exit
        end
        tmp = 1.0 / a[k][k]
        (k + 1).upto(n - 1) { |i| a[i][k] *= tmp }
        (k + 1).upto(n - 1) do |j|
          tmp = a[k][j]
          (k + 1).upto(n - 1) { |i| a[i][j] -= a[i][k] * tmp }
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

* [Gist - Ruby script to do LU-decomposition by outer-product form.](https://gist.github.com/komasaru/5887c3ed3d96bc9bdc7134fffcf10a4e "Ruby script to do LU-decomposition by outer-product form.")

### 4. Ruby スクリプトの実行

``` text
$ ./lu_decomposition.rb
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

