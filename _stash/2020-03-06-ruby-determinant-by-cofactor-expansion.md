---
layout   : single
title    : "Ruby - 行列式の計算（余因子展開による）！"
published: true
date     : 2020-03-06 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で余因子展開による行列式の計算を行ってみました。

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

(2)を行列式｜A｜の $$i$$ 行についての **余因子展開**、(3)を行列式｜A｜の $$j$$ 列についての **余因子展開** という。（余因子展開は、ラプラス展開や単に展開と呼ばれることもある）

### 2. Ruby スクリプトの作成

* Array クラスを拡張する形で実装。
* 3行3列以下の行列については Sarrus による計算。  
  4行4列以上の行列については余因子展開（ラプラス展開）による計算。
* 方法-1. 1行ずつチェックしながら生成する方法
* 方法-2. 引数で与えた行列（配列）を一旦いわゆる「深いコピー」で複製してから、 i 行と j 列を削除する方法
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `test_determinant.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#**************************************************************
# Ruby script to calculate a determinant by cofactor expansion.
#**************************************************************
#
class TestDeterminant
  #MTX = [
  #  [1]
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

TestDeterminant.new.exec if __FILE__ == $0
{% endhighlight %}

* [GitHub Gist - Ruby script to calculate a determinant by cofactor expansion.](https://gist.github.com/komasaru/50784d31fe9b239b5d3813360fad6637 "GitHub Gist - Ruby script to calculate a determinant by cofactor expansion.")

### 3. Ruby スクリプトの実行

まず、実行権限を付与。

``` text
$ sudo chmod +x test_determinant.rb
```

そして、実行。

``` text
$ ./test_determinant.rb
Matrix A =
[1, 3, 5, 7, 9]
[4, 2, 8, 6, 0]
[9, 3, 7, 5, 1]
[4, 0, 6, 8, 2]
[3, 6, 9, 2, 5]
det(A) = 2320
```

---

以上。

