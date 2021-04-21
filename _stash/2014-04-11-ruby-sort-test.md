---
layout   : single
title    : "Ruby - ソート処理各種テスト！"
published: true
date     : 2014-04-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

前回は、各種ソート処理のアルゴリズムを C++ で実装することについて紹介しました。。

* [C++ - ソート処理各種テスト！]({{site.baseurl}}/2014/04/10/cpp-sort-test "C++ - ソート処理各種テスト！")

今回は、同じアルゴリズムを Ruby で実装してみました。

以下、Ruby スクリプトの紹介です。

<!--more-->

### 0. 前提条件

* ruby 2.1.1-p76 での作業を想定。
* 各種ソートの試行は以下のように行なった。
  * １回のソートに使用するデータの個数は 100 個。（C++ 版では 1,000 回だったが）
  * データそれぞれは 0 以上 10,000 未満の整数。
  * ソート試行（ループ）回数は、10,000 回。（１回のソートは一瞬であるため）
* 各種ソートのアルゴリズムの詳細については説明しない。（必要なら、別途お調べください）  
  ここでは、それぞれのアルゴリズムを Ruby で実装して試行することに専念している。

### 1. 各種ソート処理について

各種ソート処理の概要については、前回の記事を参照ください。

* [C++ - ソート処理各種テスト！]({{site.baseurl}}/2014/04/10/cpp-sort-test "C++ - ソート処理各種テスト！")

### 2. Ruby スクリプト作成

File: `sort_test.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# **************************************
# ソート処理各種テスト
# **************************************
#
class SortTest
  N = 100    # データ個数
  M = 10000  # 値 MAX ( M 未満 )
  L = 10000  # ソート試行回数

  def initialize
    # ヒープに追加する要素の配列を生成
    @base = Array.new
    N.times { |i| @base << Random.rand(N) + 1 }
    # 乱数の種を毎回同じ値で初期化するなら以下２行のように。
    #prng = Random.new(1234)
    #N.times { |i| @base << prng.rand(N) + 1 }
    # ベース配列出力
    display_base
    # 処理用配列
    @a = Array.new  # ソート処理用
    @h = Array.new  # ヒープ用
  end

  def exec
    # 基本交換法（バブル・ソート）
    printf("%-22s", "1  : Bubble Sort")
    sort_bubble
    # 基本選択法（直接選択法）
    printf("%-22s", "2  : Selection Sort")
    sort_selection
    # 基本挿入法
    printf("%-22s", "3  : Insertion Sort")
    sort_insertion
    # 改良交換法（クイック・ソート）
    printf("%-22s", "4  : Quick Sort")
    sort_quick
    # 改良選択法（ヒープ・ソート）（上方移動）
    printf("%-22s", "5-1: Heap Sort(Up)")
    sort_heap_up
    # 改良選択法（ヒープ・ソート）（下方移動）
    printf("%-22s", "5-2: Heap Sort(Down)")
    sort_heap_down
    # 改良挿入法（シェル・ソート）
    printf("%-22s", "6  : Shell Sort")
    sort_shell
  rescue => e
    raise
  end

  private

  # 基本交換法（バブル・ソート）
  def sort_bubble
    # 処理開始時刻
    t1 = Time.now
    # 指定回数 LOOP
    L.times do |l|
      # 配列コピー
      #@a = @base.clone
      @a = Marshal.load(Marshal.dump(@base))
      # ソート処理
      0.upto(N - 2) do |i|
        (N - 1).downto(i + 1) do |j|
          @a[j - 1], @a[j] = @a[j], @a[j - 1] if @a[j] < @a[j - 1]
        end
      end
    end
    # 処理時間計算・結果出力
    t2 = Time.now
    display(0, @a, t2 - t1)
  rescue => e
    raise
  end

  # 基本選択法（直接選択法）
  def sort_selection
    # 処理開始時刻
    t1 = Time.now
    # 指定回数 LOOP
    L.times do |l|
      # 配列コピー
      #@a = @base.clone
      @a = Marshal.load(Marshal.dump(@base))
      # ソート処理
      0.upto(N - 2) do |i|
        min, s = @a[i], i
        (i + 1).upto(N - 1) do |j|
          min, s = @a[j], j if @a[j] < min
        end
        @a[i], @a[s] = @a[s], @a[i]
      end
    end
    # 処理時間計算・結果出力
    t2 = Time.now
    display(0, @a, t2 - t1)
  rescue => e
    raise
  end

  # 基本挿入法
  def sort_insertion
    # 処理開始時刻
    t1 = Time.now
    # 指定回数 LOOP
    L.times do |l|
      # 配列コピー
      #@a = @base.clone
      @a = Marshal.load(Marshal.dump(@base))
      # ソート処理
      1.upto(N - 1) do |i|
        (i - 1).downto(0) do |j|
          if @a[j] > @a[j + 1]
            @a[j], @a[j + 1] = @a[j + 1], @a[j]
          else
            break
          end
        end
      end
    end
    # 処理時間計算・結果出力
    t2 = Time.now
    display(0, @a, t2 - t1)
  rescue => e
    raise
  end

  # 改良交換法 (クイック・ソート)
  def sort_quick
    # 処理開始時刻
    t1 = Time.now
    # 指定回数 LOOP
    L.times do |l|
      # 配列コピー
      #@a = @base.clone
      @a = Marshal.load(Marshal.dump(@base))
      # ソート処理
      quick(0, N - 1)
    end
    # 処理時間計算・結果出力
    t2 = Time.now
    display(0, @a, t2 - t1)
  rescue => e
    raise
  end

  # 改良選択法 (ヒープ・ソート)(上方移動)
  def sort_heap_up
    # 処理開始時刻
    t1 = Time.now
    # 指定回数 LOOP
    L.times do |l|
      # 初期ヒープ作成(上方移動)
      generate_heap_up
      # ソート処理
      n, m = N, N  # データ個数、n の保存
      while n > 1
        @h[1], @h[n] = @h[n], @h[1]
        n -= 1     # 木の終端切り離し
        p = 1; s = 2 * p
        while s <= n
          s += 1 if s < n && @h[s + 1] > @h[s]
          break if @h[p] >= @h[s]
          @h[p], @h[s] = @h[s], @h[p]
          p = s; s = 2 * p
        end
      end
    end
    # 処理時間計算・結果出力
    t2 = Time.now
    display(1, @h, t2 - t1)
  rescue => e
    raise
  end

  # 改良選択法 (ヒープ・ソート)(下方移動)
  def sort_heap_down
    # 処理開始時刻
    t1 = Time.now
    # 指定回数 LOOP
    L.times do |l|
      # 元の配列を元の木としてコピー
      1.upto(N) { |i| @h[i] = @base[i - 1] }
      # 初期ヒープ作成(下方移動)
      generate_heap_down
      # ソート処理
      n, m = N, N  # データ個数, n の保存
      while n > 1
        @h[1], @h[n] = @h[n], @h[1]
        n -= 1     # 木の終端切り離し
        p = 1; s = 2 * p
        while s <= n
          s += 1 if s < n && @h[s + 1] > @h[s]
          break if @h[p] >= @h[s]
          @h[p], @h[s] = @h[s], @h[p]
          p = s; s = 2 * p
        end
      end
    end
    # 処理時間計算・結果出力
    t2 = Time.now
    display(1, @h, t2 - t1)
  rescue => e
    raise
  end

  # 改良挿入法 (シェル・ソート)
  def sort_shell
    # 処理開始時刻
    t1 = Time.now
    # 指定回数 LOOP
    L.times do |l|
      # 配列コピー
      #@a = @base.clone
      @a = Marshal.load(Marshal.dump(@base))
      # ソート処理
      gap = N / 2
      while gap > 0
        0.upto(gap - 1) do |k|
          i = k + gap
          while i < N
            j = i - gap
            while j >= k
              if @a[j] > @a[j + gap]
                @a[j], @a[j + gap] = @a[j + gap], @a[j]
              else
                break
              end
              j -= gap
            end
            i += gap
          end
        end
        gap /= 2
      end
    end
    # 処理時間計算・結果出力
    t2 = Time.now
    display(0, @a, t2 - t1)
  rescue => e
    raise
  end

  # クイック・ソート用再帰関数
  def quick(left, right)
    return unless left < right
    # 最左項を軸に. 軸より小さいグループ. 軸より大きいグループ.
    s, i, j = @a[left], left, right + 1
    loop do
      i += 1; i += 1 while @a[i] && @a[i] < s
      j -= 1; j -= 1 while @a[j] && @a[j] > s
      break if i >= j
      @a[i], @a[j] = @a[j], @a[i]
    end
    @a[left], @a[j] = @a[j], s  # 軸を正しい位置に挿入
    quick(left, j - 1)          # 左部分列に対する再帰呼び出し
    quick(j + 1, right)         # 右部分列に対する再帰呼び出し
  rescue => e
    raise
  end

  # ヒープ・ソート用ヒープ生成（上方移動）関数
  def generate_heap_up
    1.upto(N) do |i|
      # 元データ配列から１つヒープ要素として追加
      @h[i] = @base[i - 1]
      s = i        # 追加の位置
      p = s / 2    # 親要素の位置
      while s >= 2 && @h[p] < @h[s]
        @h[p], @h[s] = @h[s], @h[p]
        s = p      # 追加要素の位置
        p = s / 2  # 親要素の位置
      end
    end
  rescue => e
    raise
  end

  # ヒープ・ソート用ヒープ生成（下方移動）関数
  def generate_heap_down
    n = N          # データ個数
    (n / 2).downto(1) do |i|
      p = i        # 親要素の位置
      s = 2 * p    # 左の子要素の位置
      while s <= n
        s += 1 if s < n && @h[s + 1] > @h[s]  # 左右子要素の小さい方
        break if @h[p] >= @h[s]
        @h[p], @h[s] = @h[s], @h[p]  # 交換
        p = s      # 親要素の位置
        s = 2 * p  # 左の子要素の位置
      end
    end
  rescue => e
    raise
  end

  # ベース配列出力
  #   param: 配列
  def display_base
    puts "#### Base Array"
    0.upto(N - 1) do |i|
      printf("%5d ", @base[i])
      puts if (i + 1)  % 10 == 0 || i == N - 1
    end
    puts
  rescue => e
    raise
  end

  # 結果出力
  #   param: 0(Heap 以外配列), 1(Heap 配列)
  #          配列
  #          経過時間
  def display(k, ary, tt)
    # ソート結果出力出力 ( 必要ならコメント解除 )
    #puts
    #k.upto(N - 1 + k) do |i|
    #  printf("%5d ", ary[i])
    #  puts if (i + 1 - k)  % 10 == 0 || i == N - 1 + k
    #end
    # 経過時間出力
    puts "Time: %6.2f sec." % tt
  rescue => e
    raise
  end
end

if __FILE__ == $0
  begin
    SortTest.new.exec
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
  end
end
{% endhighlight %}

* [Gist - Ruby script to test sorting algorithms.](https://gist.github.com/komasaru/9969731 "Gist - Ruby script to test sorting algorithms.")

### 3. 実行

まず、実行権限を付与。

``` text
$ chmod +x sort_test.rb
```

そして、実行。

``` text
$ ./sort_test.rb

#### Base Array

    9    82    33    22    59    30    57   100    49    88
   89    38    54    46    36    90    53    71    32    85
   30    44    49     6     6    94    39    60    97    43
   87    63    88     3    31    18    96    12    16    21
   78    65    83    60    94    56    34    21    45    13
   76    68    42    15    22    29    40    39    72    66
   36    13    68    47    27    71    42    88    74    99
   43    70    98     2    83    35    93    30    88    76
   54    70    70    89    55    68    83    34    30    81
    3    93    94    36    53    28    88    90    72    16

1  : Bubble Sort      Time:   9.36 sec.
2  : Selection Sort   Time:   4.83 sec.
3  : Insertion Sort   Time:   7.42 sec.
4  : Quick Sort       Time:   0.98 sec.
5-1: Heap Sort(Up)    Time:   2.29 sec.
5-2: Heap Sort(Down)  Time:   2.19 sec.
6  : Shell Sort       Time:   1.74 sec.
```

### 4. 結果

何回か実行してみた結果、処理の早い順は大体以下のようになった。（シェル・ソートとヒープ・ソート（上方／下方）は、ほぼ同じで若干の順位変動あり）

1. 改良交換法（クイック・ソート）
2. 改良挿入法（シェル・ソート）
3. 改良選択法（ヒープ・ソート（上方移動））
4. 改良選択法（ヒープ・ソート（下方移動））
5. 基本選択法（直接選択法）
6. 基本挿入法
7. 基本交換法（バブル・ソート）

ちなみに、同様のアルゴリズムを C++ で実装して実行してみた結果は以下のとおりでした。（ソートに使用するデータ個数が異なるが）

1. 改良選択法（ヒープ・ソート（下方移動））
2. 改良選択法（ヒープ・ソート（上方移動））
3. 改良交換法（クイック・ソート）
4. 改良挿入法（シェル・ソート）
5. 基本挿入法
6. 基本選択法（直接選択法）
7. 基本交換法（バブル・ソート）

基本的に改良型の方が早いのは分かるが、言語によってことなる場合もあるようだ。

---

当然ながら、大量のデータを扱う場合は、軽量言語（or スクリプト言語 or インタプリタ型言語）はコンパイル型言語にかないません（or かなわない部分もあります or 優る部分もあります）。  
ですが、知っておいて損はないアルゴリズムです。

以上。

