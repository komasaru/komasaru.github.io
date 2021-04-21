---
layout   : single
title    : "Ruby - 逆行列の計算（余因子行列を使用）！"
published: true
date     : 2020-03-09 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

前回、 Ruby で余因子展開による行列式の計算を行いましたが、今回は、それを応用して、逆行列の計算を行ってみました。

* [Ruby - 行列式の計算（余因子展開による）！]({{site.baseurl}}/2020/03/06/ruby-determinant-by-cofactor-expansion "Ruby - 行列式の計算（余因子展開による）！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 buster (64bit) での作業を想定。
* Ruby 2.7.0 での作業を想定。

### 1. 行列式の余因子展開について

 $$n(>1)$$ 次正方行列 $$A=(a _ {ij})$$ から第 $$i$$ 行と第 $$j$$ 列の成分をすべて取り除いて得られる $$n-1$$ 次行列の行列式に、 $$(-1)^{i+j}$$ を掛けたものを $$a _ {ij}$$ の **余因子** といい、 $$\tilde{A} _ {ij}$$ で表す。すなわち、

$$
\begin{eqnarray}
\tilde{A}_{ij}=(-1)^{i+j}\left|
\begin{array}{cccccc}
a_{11} & \cdots & a_{1\ j-1} & a_{1\ j+1} & \cdots & a_{1n} \\
\vdots & & \vdots & \vdots & & \vdots \\
a_{i-1\ 1} & \cdots & a_{i-1\ j-1} & a_{i-1\ j+1} & \cdots & a_{i-1\ n} \\
a_{i+1\ 1} & \cdots & a_{i+1\ j-1} & a_{i+1\ j+1} & \cdots & a_{i+1\ n} \\
\vdots & & \vdots & \vdots & & \vdots \\
a_{n1} & \cdots & a_{n\ j-1} & a_{n\ j+1} & \cdots & a_{nn} \\
\end{array}
\right|
\end{eqnarray}
$$

そして、次の定理が成り立つ。（証明略）

【定理】 $$n$$ 次正方行列 $$A=(a _ {ij})$$ に対して、

$$
\begin{eqnarray}
|A| &=& a_{i1}\tilde{A}_{i1} + a_{i2}\tilde{A}_{i2} + \cdots + a_{in}\tilde{A}_{in}\ \ (1<i\le n) \\
|A| &=& a_{1j}\tilde{A}_{1j} + a_{2j}\tilde{A}_{2j} + \cdots + a_{nj}\tilde{A}_{nj}\ \ (1<j\le n)
\end{eqnarray}
$$

(2)を行列式 ｜A｜ の $$i$$ 行についての **余因子展開**、(3)を行列式 ｜A｜ の $$j$$ 列についての **余因子展開** という。（余因子展開は、ラプラス展開や単に展開と呼ばれることもある）

### 2. 余因子行列と逆行列について

 $$n(>1)$$ 次正方行列 $$A=(a _ {ij})$$ に対して、 $$a _ {ij}$$ の余因子 $$\tilde{A} _ {ij}$$ を $$(j,i)$$ 成分とするような行列を $$A$$ の **余因子行列** といい、 $$\tilde{A}$$ で表す。すなわち、

$$
\begin{eqnarray}
\tilde{A}=\left(
\begin{array}{cccc}
\tilde{A}_{11} & \tilde{A}_{21} & \cdots & \tilde{A}_{n1} \\
\tilde{A}_{12} & \tilde{A}_{22} & \cdots & \tilde{A}_{n2} \\
\vdots & \vdots & & \vdots \\
\tilde{A}_{1n} & \tilde{A}_{2n} & \cdots & \tilde{A}_{nn} \\
\end{array}
\right)\ \ (n>1,\ \tilde{A}_{ij}の並び方に注意)
\end{eqnarray}
$$

そして、次の定理が成り立つ。（証明略）

【定理】 $$n$$ 次正方行列 $$A$$ の逆行列は次式で求められる。

$$
\begin{eqnarray}
A^{-1}=\frac{1}{|A|}\tilde{A}
\end{eqnarray}
$$

### 3. Ruby スクリプトの作成

* Array クラスを拡張する形で実装。
* 3行3列以下の行列の行列式については Sarrus による計算。  
  4行4列以上の行列の行列式については余因子展開（ラプラス展開）による計算。
* 行列式の計算方法
  1. 1行ずつチェックしながら生成する方法。
  2. 引数で与えた行列（配列）を一旦いわゆる「深いコピー」で複製してから、 i 行と j 列を削除する方法。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `test_inverse_matrix.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#***************************************************************
# Ruby script to calculate an inverse matrix by cofactor matrix.
#***************************************************************
#
class TestInverseMatrix
  #MTX = [
  #  [2]
  #]
  #MTX = [
  #  [1, 2],
  #  [3, 4],
  #]
  #MTX = [
  #  [1, 4, 7],
  #  [8, 5, 2],
  #  [3, 9, 6]
  #]
  #MTX = [
  #  [1, 3, 5, 7],
  #  [4, 2, 8, 6],
  #  [9, 3, 7, 5],
  #  [4, 0, 6, 8]
  #]
  MTX = [
    [1, 3, 5, 7, 9],
    [4, 2, 8, 6, 0],
    [9, 3, 7, 5, 1],
    [4, 0, 6, 8, 2],
    [3, 6, 9, 2, 5]
  ]

  def exec
    puts "Matrix A ="
    MTX.each { |row| p row }
    puts "det(A) = #{MTX.det}"
    puts "Cofactor Matrix of A ="
    MTX.cofactor_matrix.each { |row| p row }
    puts "Inverse Matrix of A ="
    MTX.inverse_matrix.each { |row| p row }
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{trace}" }
    exit 1
  end
end

class Array
  # 行列式の計算
  # * 当メソッドは再帰的に呼ばれる
  def det
    # 以下の場合は例外スロー
    # - 自身配列が Array クラスでない
    # - 自身配列が空
    # - 自身配列が正方行列でない
    raise "Self is not a Array class!"         unless self.class == Array
    raise "Self array is nil!"                 if self.size == 0
    raise "Self array is not a square matrix!" unless self.size == self[0].size
    m = self
    n = m.size
    # 3行3列以下の行列の場合、
    # => Sarrus による計算
    case n
    when 1; return m[0][0]
    when 2; return m[0][0] * m[1][1] \
                 - m[0][1] * m[1][0]
    when 3; return m[0][0] * m[1][1] * m[2][2] \
                 + m[0][1] * m[1][2] * m[2][0] \
                 + m[0][2] * m[1][0] * m[2][1] \
                 - m[0][0] * m[1][2] * m[2][1] \
                 - m[0][1] * m[1][0] * m[2][2] \
                 - m[0][2] * m[1][1] * m[2][0]
    end
    # 4行4列以上の行列の場合、
    # => 第1行についての余因子展開（ラプラス展開）による計算
    return n.times.map { |j| m[0][j] * cofactor(m, 0, j) }.sum
  end

  # 余因子行列の計算
  def cofactor_matrix
    # 以下の場合は例外スロー
    # - 自身配列が Array クラスでない
    # - 自身配列が空
    # - 自身配列が正方行列でない
    # - 自身配列のサイズが1x1の場合
    raise "Self is not a Array class!"           unless self.class == Array
    raise "Self array is nil!"                   if self.size == 0
    raise "Self array is not a square matrix!"   unless self.size == self[0].size
    raise "Can not calculate a cofactor matrix!" if self.size == 1
    m = self
    n = m.size
    return n.times.map do |i|
      n.times.map { |j| cofactor(m, i, j) }
    end.transpose
  end

  # 逆行列の計算
  # * 内部で余因子行列の計算も行っている
  def inverse_matrix
    # 以下の場合は例外スロー
    # - 自身配列が Array クラスでない
    # - 自身配列が空
    # - 自身配列が正方行列でない
    raise "Self is not a Array class!"         unless self.class == Array
    raise "Self array is nil!"                 if self.size == 0
    raise "Self array is not a square matrix!" unless self.size == self[0].size
    m = self
    return [[1.0 / m[0][0]]] if m.size == 1
    d = m.det
    return m.cofactor_matrix.map do |row|
      row.map { |col| col / d.to_f }
    end
  end

private
  # 余因子（正方行列 A の (i, j) に対する）
  # [方法-1] 1行ずつチェックしながら生成する方法
  # [方法-2] 引数で与えた行列（配列）を一旦いわゆる「深いコピー」で
  #          複製してから、 i 行と j 列を削除する方法
  #
  # @param   m: 行列配列
  # @param   i: 行インデックス
  # @param   j: 列インデックス
  # @return m2: 余因子
  def cofactor(m, i, j)
    # ====[ 方法-1 ]==>
    #m2 = []
    #n = m.size
    #n.times do |k|
    #  next if k == i
    #  row = []
    #  n.times do |l|
    #    next if l == j
    #    row << m[k][l]
    #  end
    #  m2 << row
    #end
    # <===[ 方法-1 ]===
    # ====[ 方法-2 ]==>
    m2 = Marshal.load(Marshal.dump(m))
    m2.delete_at(i)
    m2 = m2.transpose
    m2.delete_at(j)
    m2 = m2.transpose
    # <===[ 方法-2 ]===
    return (-1)**(i+j) * m2.det
  rescue => e
    raise
  end
end

TestInverseMatrix.new.exec if __FILE__ == $0
{% endhighlight %}

* [GitHub Gist - Ruby script to calculate an inverse matrix by cofactor matrix.](https://gist.github.com/komasaru/a28f19c1ebb318d457fa2b6624ac7093 "GitHub Gist - Ruby script to calculate an inverse matrix by cofactor matrix.")

### 4. Ruby スクリプトの実行

まず、実行権限を付与。

``` text
$ sudo chmod +x test_inverse_matrix.rb
```

そして、実行。

``` text
$ ./test_inverse_matrix.rb
Matrix A =
[1, 3, 5, 7, 9]
[4, 2, 8, 6, 0]
[9, 3, 7, 5, 1]
[4, 0, 6, 8, 2]
[3, 6, 9, 2, 5]
det(A) = 2320
Cofactor Matrix of A =
[-192, -600, 336, 376, 128]
[1208, 2180, 496, -2704, -1192]
[-752, -900, -424, 1376, 888]
[728, 1260, 176, -1184, -872]
[-272, -1140, -104, 1016, 568]
Inverse Matrix of A =
[-0.08275862068965517, -0.25862068965517243, 0.14482758620689656, 0.16206896551724137, 0.05517241379310345]
[0.5206896551724138, 0.9396551724137931, 0.21379310344827587, -1.1655172413793105, -0.5137931034482759]
[-0.32413793103448274, -0.3879310344827586, -0.18275862068965518, 0.593103448275862, 0.38275862068965516]
[0.3137931034482759, 0.5431034482758621, 0.07586206896551724, -0.5103448275862069, -0.3758620689655172]
[-0.11724137931034483, -0.49137931034482757, -0.04482758620689655, 0.4379310344827586, 0.24482758620689654]
```

---

以上。

