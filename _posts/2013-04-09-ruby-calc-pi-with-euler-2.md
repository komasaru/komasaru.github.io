---
layout   : single
title    : "Ruby - 円周率計算（オイラーの公式(2)）！"
published: true
date     : 2013-04-09 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
- 円周率
---

前回は、C++ による「オイラーの公式(2)による円周率計算」のアルゴリズムを紹介しました。

* [C++ - 円周率計算（オイラーの公式(2)）！]({{site.baseurl}}/2013/04/08/cpp-calc-pi-with-euler-2/ "C++ - 円周率計算（オイラーの公式(2)）！")

今日は、同じアルゴリズムを Ruby で実現してみました。  
アルゴリズム等については、上記リンクの記事を参照してください。  
Arctan 系公式による計算は項数・係数が異るだけなので、今回は汎用化した形にしました。

<!--more-->

以下、Ruby によるサンプルスクリプトです。

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* Ruby 2.0.0-p0 を使用。

### 1. Ruby スクリプト作成

File: `calc_pi_arctan_old.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************
# 円周率計算 by Arctan 系の公式
#
#    1: Machin
#    2: Klingenstierna
#    3: Euler
#    4: Euler(2)
#*********************************************
#
class CalcPiArctan
  # 公式
  FORMULA = ["Machin", "Klingenstierna", "Euler", "Euler2"]  # 公式名
  KK = [                                    # 公式内係数
    [16, 1,  5,  -4, 1, 239             ],  #   1: Machin
    [32, 1, 10,  -4, 1, 239, -16, 1, 515],  #   2: Klingenstierna
    [20, 1,  7,   8, 3,  79             ],  #   3: Euler
    [16, 1,  5,  -4, 1,  70,   4, 1,  99]   #   4: Euler(2)
  ]
  # 保存ファイル名
  FILE_PRE = "PI_"   # プリフィックス
  FILE_EXT = ".txt"  # 拡張子
  # 出力文字列 ( コンソール、テキストファイル共通 )
  STR_TITLE   = "** Pi Computation by Arctan method **"
  STR_FORMULA = "   Formula = [ %s ]"
  STR_DIGITS  = "   Digits  = %d"
  STR_TIME    = "   Time    = %f seconds"
  # 多桁計算
  MAX_DIGITS = 100000000  # 1つの int で8桁扱う

  def initialize(x, y)
    # 結果出力ファイル名生成
    @fname = "#{FILE_PRE}#{FORMULA[x - 1]}#{FILE_EXT}"
    puts
    puts "[ Output file : #{@fname} ]"
    puts
    @formula = FORMULA[x-1]             # 公式名取得
    @ks = KK[x-1].size / 3              # 計算対象公式の項数
    @kk = KK[x-1]                       # 計算対象公式の係数
    @l  = y                             # 計算桁数
    @l1 = (@l / 8) + 1                  # 配列サイズ
    n   = @l / Math::log10(@kk[2]) + 1
    @n  = (n / 2).truncate + 1          # 計算項数
  end

  # 計算・結果出力
  def calc
    # ==== 計算開始時刻
    t0 = Time.now
    # ==== 配列宣言・初期化
    s  = Array.new(@l1 + 2, 0)  # 総和
    a  = Array.new(@ks, nil)    # 公式の各項
    a.each_index {|i| a[i] = Array.new(@l1 + 2, 0)}
    q  = Array.new(@l1 + 2, 0)  # 各項の和
    # ==== 計算初期値
    0.upto(@ks - 1) do |i|
      a[i][0] = @kk[i * 3] * @kk[i * 3 + 2]
      a[i][0] *= -1 if @kk[i * 3] < 0
      # 分子が 1 で無ければ、さらに分子の値で除算しておく
      a[i] = long_div(a[i], @kk[i * 3 + 1]) unless @kk[i * 3 + 1] == 1
    end
    # ==== 計算
    1.upto(@n) do |k|
      # 各項の分数計算 ( １つ前の計算結果に追加で除算・乗算 )
      0.upto(@ks - 1) do |i|
        # 本来 x * x で除算したい（した方が高速だ）が、
        # x が 8桁以下でも x * x が8桁超になるケースがあるため２回に分けている。
        a[i] = long_div(a[i], @kk[i * 3 + 2])
        a[i] = long_div(a[i], @kk[i * 3 + 2])
        # 分子が 1 でない時
        #   本来 x * x を乗算したい（した方が高速だ）が、
        #   x が 8桁以下でも x * x が8桁超になるケースがあるため２回に分けている。
        unless @kk[i * 3 + 1] == 1
          a[i] = long_mul(a[i], @kk[i * 3 + 1])
          a[i] = long_mul(a[i], @kk[i * 3 + 1])
        end
      end
      # 各項の加減算
      1.upto(@ks - 1) do |i|
        if @kk[i * 3] >= 0  # 加算
          q = i == 1 ? long_add(a[i - 1], a[i]) : long_add(q, a[i])
        else                # 減算
          q = i == 1 ? long_sub(a[i - 1], a[i]) : long_sub(q, a[i])
        end
      end
      # 1 / (2 * k - 1) の部分
      q = long_div(q, 2 * k - 1)
      # 総和計算
      s = (k % 2) == 0 ? long_sub(s, q) : long_add(s, q)
    end
    # ==== 計算終了時刻
    t1 = Time.now
    # ==== 計算時間
    tt = t1 - t0
    # ==== 結果出力
    display(tt, s)
  rescue => e
    raise
  end

  # ロング + ロング
  def long_add(a, b)
    z = Array.new(@l1 + 2, 0)
    cr = 0
    (@l1 + 1).downto(0) do |i|
      z[i] = a[i] + b[i] + cr
      if z[i] < MAX_DIGITS
        cr = 0
      else
        z[i] -= MAX_DIGITS
        cr = 1
      end
    end
    return z
  rescue => e
    raise
  end

  # ロング - ロング
  def long_sub(a, b)
    z = Array.new(@l1 + 2, 0)
    br = 0
    (@l1 + 1).downto(0) do |i|
      z[i] = a[i] - b[i] - br
      if z[i] >= 0
        br = 0
      else
        z[i] += MAX_DIGITS
        br = 1
      end
    end
    return z
  rescue => e
    raise
  end

  # ロング * ショート
  def long_mul(a, b)
    z = Array.new(@l1 + 2, 0)
    cr = 0
    (@l1 + 1).downto(0) do |i|
      w = a[i]
      z[i] = (w * b + cr) % MAX_DIGITS
      cr = (w * b + cr) / MAX_DIGITS
    end
    return z
  rescue => e
    raise
  end

  # ロング / ショート
  def long_div(a, b)
    z = Array.new(@l1 + 2, 0)
    r = 0
    0.upto(@l1 + 1) do |i|
      w = a[i]
      z[i] = (w + r) / b
      r = ((w + r) % b) * MAX_DIGITS
    end
    return z
  rescue => e
    raise
  end

  # 結果出力
  def display(tt, s)
    puts STR_TITLE
    puts STR_FORMULA % @formula
    puts STR_DIGITS % @l
    puts STR_TIME % tt
    # ファイル出力
    out_file = File.open(@fname, "w")
    out_file.puts STR_TITLE
    out_file.puts STR_FORMULA % @formula
    out_file.puts STR_DIGITS % @l
    out_file.puts STR_TIME % tt
    out_file.puts "\n          %d." % s[0]
    1.upto(@l1 - 1) do |i|
      out_file.printf("%08d:", (i - 1) * 8 + 1) if i % 10 == 1
      out_file.printf(" %08d", s[i])
      out_file.puts if i % 10 == 0
    end
  rescue => e
    raise
  end
end

if __FILE__ == $0
  begin
    # ==== 使用公式番号入力
    print "1:Machin, 2:Klingenstierna, 3:Euler, 4:Euler(2) : "
    f = gets.to_i
    f = 1 if f < 1 || f > 8  # 範囲外なら 1:Machin と判断
    # ==== 計算桁数入力
    print "Please input number of Pi Decimal-Digits : "
    n = gets.to_i
    # 計算クラスインスタンス化
    obj = CalcPiArctan.new(f, n)
    # 円周率計算
    obj.calc
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}\n"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
  end
end
{% endhighlight %}

* [Gist - Ruby script to compute Pi with arctan's formula.(old ver.)](https://gist.github.com/komasaru/5269032  "Gist - Ruby script to compute Pi with arctan's formula.(old ver.)")

### 2. 実行

まず、実行権限を付与。

``` text
$ chmod +x calc_pi_arctan_old.rb
```

そして、実行。

``` text
$ ./calc_pi_arctan.rb
1:Machin, 2:Klingenstierna, 3:Euler, 4:Euler(2) : 4
Please input number of Pi Decimal-Digits : 10000

[ Output file : PI_Euler2.txt ]

** Pi Computation by Arctan method **
   Formula = [ Euler2 ]
   Digits  = 10000
   Time    = 11.852143 seconds
```

"PI_Euler2.txt" というテキストファイルができているはずである。

File: `PI_Euler2.txt`

{% highlight text linenos %}
** Pi Computation by Arctan method **
   Formula = [ Euler2 ]
   Digits  = 10000
   Time    = 11.852143 seconds

          3.
00000001: 14159265 35897932 38462643 38327950 28841971 69399375 10582097 49445923 07816406 28620899
00000081: 86280348 25342117 06798214 80865132 82306647 09384460 95505822 31725359 40812848 11174502
00000161: 84102701 93852110 55596446 22948954 93038196 44288109 75665933 44612847 56482337 86783165
00000241: 27120190 91456485 66923460 34861045 43266482 13393607 26024914 12737245 87006606 31558817
00000321: 48815209 20962829 25409171 53643678 92590360 01133053 05488204 66521384 14695194 15116094
00000401: 33057270 36575959 19530921 86117381 93261179 31051185 48074462 37996274 95673518 85752724
00000481: 89122793 81830119 49129833 67336244 06566430 86021394 94639522 47371907 02179860 94370277
00000561: 05392171 76293176 75238467 48184676 69405132 00056812 71452635 60827785 77134275 77896091
00000641: 73637178 72146844 09012249 53430146 54958537 10507922 79689258 92354201 99561121 29021960
00000721: 86403441 81598136 29774771 30996051 87072113 49999998 37297804 99510597 31732816 09631859
00000801: 50244594 55346908 30264252 23082533 44685035 26193118 81710100 03137838 75288658 75332083
00000881: 81420617 17766914 73035982 53490428 75546873 11595628 63882353 78759375 19577818 57780532
00000961: 17122680 66130019 27876611 19590921 64201989 38095257 20106548 58632788 65936153 38182796
        :
===< 途中省略 >===
        :
00009121: 37800297 41207665 14793942 59029896 95946995 56576121 86561967 33786236 25612521 63208628
00009201: 69222103 27488921 86543648 02296780 70576561 51446320 46927906 82120738 83778142 33562823
00009281: 60896320 80682224 68012248 26117718 58963814 09183903 67367222 08883215 13755600 37279839
00009361: 40041529 70028783 07667094 44745601 34556417 25437090 69793961 22571429 89467154 35784687
00009441: 88614445 81231459 35719849 22528471 60504922 12424701 41214780 57345510 50080190 86996033
00009521: 02763478 70810817 54501193 07141223 39086639 38339529 42578690 50764310 06383519 83438934
00009601: 15961318 54347546 49556978 10382930 97164651 43840700 70736041 12373599 84345225 16105070
00009681: 27056235 26601276 48483084 07611830 13052793 20542746 28654036 03674532 86510570 65874882
00009761: 25698157 93678976 69742205 75059683 44086973 50201410 20672358 50200724 52256326 51341055
00009841: 92401902 74216248 43914035 99895353 94590944 07046912 09140938 70012645 60016237 42880210
00009921: 92764579 31065792 29552498 87275846 10126483 69998922 56959688 15920560 01016552 56375678
{% endhighlight %}

C++ 版と同じ結果が得られました。

### 3. 参考サイト

* [円周率を求める公式・アルゴリズム - 円周率.jp -](http://xn--w6q13e505b.jp/formula/ "円周率を求める公式・アルゴリズム - 円周率.jp -")
* [πのArctan公式集](http://www5f.biglobe.ne.jp/~tsuushin/sub1d.html "πのArctan公式集")

---

C++ 版同様、「オイラーの公式」より「オイラーの公式(2)」の方が若干時間がかかりました。

Arctan 系の公式による計算を汎用することができたので、他の Arctan 系公式による計算も容易にできるようになりました。  
もちろん、もっと桁数を増やしたり高速化するには、まだまだ改良が必要ですが。。。

以上。

