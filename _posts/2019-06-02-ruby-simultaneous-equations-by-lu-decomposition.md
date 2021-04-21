---
layout   : single
title    : "Ruby - LU 分解を用いた連立1次方程式の解法！"
published: true
date     : 2019-06-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

連立1次方程式を LU 分解を用いて解くアルゴリズムを Ruby で実装してみました。  
（使用する LU 分解法は「外積形式ガウス法(outer-product form)」）

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.3 での作業を想定。

### 1. LU 分解（外積形式ガウス法）について

当ブログ過去記事を参照。

[Ruby - LU 分解（外積形式ガウス法(outer-product form)）！]({{site.baseurl}}/2019/05/14/ruby-lu-decomposition-by-outer-product "Ruby - LU 分解（外積形式ガウス法(outer-product form)）！")

### 2. Ruby スクリプトの作成

* 本来、 L と U の2つの行列に分けるものだが1つの行列にまとめている。（実際に LU 分解を使用する際に L と U を意識して取り扱えばよいだけなので）  
  また、 行列 L の対角成分が 1 であることを想定。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `sle_lu.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************
# 連立1次方程式の解法 ( LU 分解（外積形式ガウス法） )
#*********************************************
#
class SleLu
  #A = [
  #  [1, 2],
  #  [4 ,5]
  #]
  #B = [3, 6]
  A = [
    [3.0,  1.0,  1.0,  1.0],
    [1.0,  2.0,  1.0, -1.0],
    [1.0,  1.0, -4.0,  1.0],
    [1.0, -1.0,  1.0,  1.0]
  ]
  B = [0.0, 4.0, -4.0, 2.0]

  def initialize
    # 行列 A
    @a = Marshal.load(Marshal.dump(A))
    # 次元の数
    @n = @a.size
    # 解
    @x = Array.new(@n, 0.0)
  end

  # 主処理
  def exec
    exit if @n < 1
    puts "A ="
    display_mtx(@a)
    puts "b ="
    display_vec(B)
    lu_decompose
    #puts "(LU) ="
    #display_mtx(@a)
    solve
    puts "x ="
    display_vec(@x)
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
  end

  private

  # 行列 A の LU 分解
  def lu_decompose
    0.upto(@n - 1) do |k|
      if @a[k][k] == 0
        puts "Can't decompose A to LU ..."
        exit
      end
      tmp = 1.0 / @a[k][k]
      (k + 1).upto(@n - 1) { |i| @a[i][k] *= tmp }
      (k + 1).upto(@n - 1) do |j|
        tmp = @a[k][j]
        (k + 1).upto(@n - 1) { |i| @a[i][j] -= @a[i][k] * tmp }
      end
    end
  rescue => e
    raise
  end

  # 連立1次方程式の解法
  # * @a は LU 分解済み
  # * L の対角成分が 1
  def solve
    # 前進代入
    # * Ly = b から y を計算
    y = Array.new(@n)
    0.upto(@n - 1) do |i|
      sum = B[i]
      0.upto(i - 1) { |j| sum -= @a[i][j] * y[j] }
      y[i] = sum
    end
    # 後退代入
    # * Ux = y から x を計算
    (@n - 1).downto(0) do |i|
      sum = y[i]
      (i + 1).upto(@n - 1) { |j| sum -= @a[i][j] * @x[j] }
      @x[i] = sum / @a[i][i]
    end
  rescue => e
    raise
  end

  def display_mtx(mtx)
    mtx.each do |row|
      puts row.map { |a| "%8.2f" % a }.join
    end
  rescue => e
    raise
  end

  def display_vec(vec)
    puts vec.map { |a| "%8.2f" % a }.join
  rescue => e
    raise
  end
end

SleLu.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to solve simultaneous equations by LU-decomposition(outer-product form).](https://gist.github.com/komasaru/ae84e81f9498c3f2e120f117f5e45303 "Ruby script to solve simultaneous equations by LU-decomposition(outer-product form).")

### 3. Ruby スクリプトの実行

``` text
$ ./sle_lu.rb
A =
    3.00    1.00    1.00    1.00
    1.00    2.00    1.00   -1.00
    1.00    1.00   -4.00    1.00
    1.00   -1.00    1.00    1.00
b =
    0.00    4.00   -4.00    2.00
x =
   27.00  -28.00  -10.00  -43.00
```

検算してみると、正しいことが分かる。

---

以上。

