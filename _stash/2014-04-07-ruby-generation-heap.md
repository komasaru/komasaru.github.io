---
layout   : single
title    : "Ruby - ヒープ生成（上方・下方移動）！"
published: true
date     : 2014-04-07 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

前々回、前回は「ヒープ（上方移動・下方移動）」のアルゴリズムを C++ で実装することについて紹介しました。。

* [C++ - ヒープ生成（上方移動）！]({{site.baseurl}}/2014/04/04/cpp-generation-heap-upward "C++ - ヒープ生成（上方移動）！")
* [C++ - ヒープ生成（下方移動）！]({{site.baseurl}}/2014/04/06/cpp-generation-heap-downward "C++ - ヒープ生成（下方移動）！")

今回は、同じアルゴリズムを Ruby で実装してみました。（上方・下方移動）

以下、Ruby スクリプトの紹介です。

<!--more-->

### 1. ヒープについて

「ヒープ」、「上方移動」、「下方移動」については前々回、前回の記事を参照ください。

* [C++ - ヒープ生成（上方移動）！]({{site.baseurl}}/2014/04/04/cpp-generation-heap-upward "C++ - ヒープ生成（上方移動）！")
* [C++ - ヒープ生成（下方移動）！]({{site.baseurl}}/2014/04/06/cpp-generation-heap-downward "C++ - ヒープ生成（下方移動）！")

### 2. Ruby スクリプト作成（上方移動）

以下のようにスクリプトを作成してみた。（要素はメルセンヌ・ツイスタに基づく疑似乱数で生成）

File: `heap_upward.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# **************************************
# ヒープ作成（上方移動）
# **************************************
#
class Heap
  N = 100  # データ個数

  def initialize
    # ヒープに追加する要素の配列を生成
    @base = Array.new
    N.times { |i| @base << Random.rand(N) + 1 }
    # 乱数の種を毎回同じ値で初期化するなら以下２行のように。
    #prng = Random.new(1234)
    #N.times { |i| @base << prng.rand(N) + 1 }
    display(0)
    # ヒープ用配列
    @heap = Array.new(N + 1)
  end

  # ヒープ生成
  def generate
    1.upto(N) do |n|
      # 元データ配列から１つヒープ要素として追加
      @heap[n] = @base[n - 1]
      s = n        # 追加要素の位置
      p = s / 2    # 親要素の位置
      while s >= 2 && @heap[p] > @heap[s]
        w        = @heap[p]
        @heap[p] = @heap[s]
        @heap[s] = w
        s = p      # 追加要素の位置
        p = s / 2  # 親要素の位置
      end
    end
    # 結果出力
    display(1)
  rescue => e
    raise
  end

  private

  # 結果出力
  #   param: 0 - Base 配列
  #          1 - Heap 配列
  def display(k)
    puts "#### #{k == 0 ? "Base" : "Heap"}"
    k.upto(N - 1 + k) do |i|
      printf("%5d ", k == 0 ? @base[i]: @heap[i])
      puts if (i + 1 - k) % 10 == 0 || i == N - 1 + k
    end
  rescue => e
    raise
  end
end

if __FILE__ == $0
  begin
    Heap.new.generate
  rescue => e
    puts "[#{e.class}] #{e.message}"
    e.backtrace.each{|trace| puts "\t#{trace}"}
    exit 1
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
  end
end
{% endhighlight %}

* [Gist - Ruby script to generate a heap by the upward method.](https://gist.github.com/komasaru/9775475 "Gist - Ruby script to generate a heap by the upward method.")

### 3. Ruby スクリプト作成（下方移動）

以下のようにスクリプトを作成してみた。（要素はメルセンヌ・ツイスタに基づく疑似乱数で生成）

File: `heap_downward.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# **************************************
# ヒープ作成（下方移動）
# **************************************
#
# ヒープクラス
class Heap
  N = 100  # データ個数

  def initialize
    # ヒープの元になる木を生成
    @heap = [nil]
    N.times { |i| @heap << Random.rand(N) + 1 }
    # 乱数の種を毎回同じ値で初期化するなら以下２行のように。
    #prng = Random.new(1234)
    #N.times { |i| @heap << prng.rand(N) + 1 }
    display(0)
  end

  # ヒープ生成
  def generate
    n = N           # データ個数
    (n / 2).downto(1) do |i|
      p = i         # 親要素の位置
      s = 2 * p     # 左の子要素の位置
      while s <= n
        s += 1 if s < n && @heap[s + 1] < @heap[s]  # 左右子要素の小さい方
        break if @heap[p] <= @heap[s]
        swap(p, s)  # 交換
        p = s       # 親要素の位置
        s = 2 * p   # 左の子要素の位置
      end
    end
    # 結果出力
    display(1)
  rescue => e
    raise
  end

  private

  # 交換
  def swap(a, b)
    w        = @heap[a]
    @heap[a] = @heap[b]
    @heap[b] = w
  end

  # 結果出力
  #   param: 0 - Tree 配列
  #          1 - Heap 配列
  def display(k)
    puts "#### #{k == 0 ? "Tree" : "Heap"}"
    1.upto(N) do |i|
      printf("%5d ", @heap[i])
      puts if i % 10 == 0 || i == N
    end
  rescue => e
    raise
  end
end

exit 0 unless __FILE__ == $0

begin
  Heap.new.generate
rescue => e
  puts "[#{e.class}] #{e.message}"
  e.backtrace.each{|trace| puts "\t#{trace}"}
  exit 1
  $stderr.puts "[#{e.class}] #{e.message}"
  e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
end
{% endhighlight %}

* [Gist - Ruby script to generate a heap by the downward method.](https://gist.github.com/komasaru/9775492 "Gist - Ruby script to generate a heap by the downward method.")

### 4. 実行

まず、実行権限を付与。

``` text
$ chmod +x heap_upward.rb
$ chmod +x heap_downward.rb
```

そして、実行。

``` text
$ ./heap_upward.rb

#### Base

   71    84    97    53    41     4    86    55    68     8
    7    10    52    64    44    89    13    73    73     8
    4    16    94    17    87    12    40     6    37    83
   32    39    17    25    72    29    31    21    51    10
    9     7     8    64    77     5    54    92    79    42
   40    40    61    72    64    42    68    35     6    21
   96    71    71    69    14    97    43    91    12    73
   91    81    46    53    97    93    23    16    79    44
   14    13    69    86     6    15    52    43    94    64
   43    76    33    20    63    71    24     8    90    82

#### Heap

    4     4     6    12     5     8     6    13    16     6
    7    12    17    10    21    17    14    31    21     9
    7    43    16    24    41    40    40    42    35    32
   64    39    43    25    72    46    53    29    23    14
   10     8     8    53    43    33    20    71    40    82
   42    52    61    72    64    86    68    44    37    83
   96    71    71    89    69    97    55    91    84    73
   91    81    73    68    97    93    73    51    79    71
   44    13    69    86     8    15    52    64    94    77
   64    94    76    54    63    97    79    92    90    87 

$ ./heap_downward.rb

#### Tree

   29    39    30    97    77    21    74    24    85    83
  100    93    49    65    80    22    64    66    42    35
   99    79    43    85    41    38    74    76    43    90
    3    60    16    28     6    24    91    59    99    91
   27    22    62    19     4     9    85    72    53     1
   96    93    85    69    86    74    69    75    12    39
   55    26    68     8    93    47    50     1    29     1
   75    73    55    49    10    33    36    32    24    63
   91    29    37    50    58    23    28    10    91     1
   32    64    25    40    96    96    34     9    87    99

#### Heap

    1     1     1     6     1     9     3     8    10    22
    4    21    38    12    26    16    24    24    24    27
   23    10     9    30    41    49    69    69    43    39
   68    22    29    28    39    55    49    33    32    63
   29    50    28    19    32    25    40    34    53    93
   96    93    85    74    86    74    76    75    65    90
   55    80    74    60    93    47    50    64    29    97
   75    73    85    66    91    59    36    42    99    91
   91    35    37    99    58    62    83    77    91    79
  100    64    43    85    96    96    72    85    87    99
```

実際に配列を置き換えてみると、ヒープになっていることが確認できる。

また、上方移動と下方移動とでは同じ要素を使ってヒープを生成しても並び順は異なる。  
これは、「乱数の種を同じ値で初期化」して実行してみると分かる。

---

ヒープについて知っておくと、ヒープを使ったソート処理（ヒープ・ソート）を行う際には役立つでしょう。

以上。

