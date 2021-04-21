---
layout   : single
title    : "Ruby - 円周率計算（Chudnovsky の公式使用）！"
published: true
date     : 2015-05-08 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
- 円周率
---
こんにちは。

前回、C++ で Chudnovsky の公式を使用して円周率を１億桁まで計算しました。（任意精度算術ライブラリ GMP(The GNU Multi Precision Arithmetic Library) を使用）

今回は、同じことを Ruby で実装してみました。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* 演算には GMP(The GNU Multi Precision Arithmetic Library) 任意精度算術ライブラリを Ruby 用にラップした gmp という RubyGems ライブラリ使用するので、インストール済みであること。
* RubyGems ライブラリ gmp で浮動小数点数を扱う場合は MPFR(The GNU Multiple Precision Floating-Point Reliably) ライブラリが必要であるので、インストール済みであること。（後日、ソースをビルドしてインストール方法は紹介する予定）
* 計算に使用したマシンは CPU: Intel Core2Duo E8500 ( 3.16GHz ), MEM: 3.9GiB

### 1. Chudonvsky の公式を使用した円周率計算について

前回の記事を参照。（「[C++ - 円周率計算（Chudnovsky の公式使用）！]({{site.baseurl}}/2015/05/06/cpp-pi-computation-by-chudnovsky-bsa-with-gmp/ "C++ - 円周率計算（Chudnovsky の公式使用）！")」）

### 2. Ruby スクリプトの作成

級数計算部分で Binary Splitting Algorithm を適用し、四則演算・平方根計算では GMP ライブラリを使用する。

注意する点は、

* `n` を 1 進める度に $$log(53360^{3}) / log(10) \simeq 14.1816$$ 桁精度が上昇する。（14桁に丸めても問題ない）
* 浮動小数点の精度を $$a$$ とする場合、バイナリ `mpf_class` の精度は $$a \times log_2(10)$$ となる。
* 【疑問点】スクリプト中で `@n`, `@prec` 設定時に `@digits` を `+ 1` しているのは、こうしないと最後の１桁が合わなくなるため。

File: `chudnovsky.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
#**************************************************************
# Computing pi by Binary Splitting Algorithm with GMP libarary.
#**************************************************************
require 'gmp'

class Chudnovsky
  # Constants
  A = 13591409
  B = 545140134
  C = 640320
  D = 426880
  E = 10005
  DIGITS_PER_TERM = Math.log(53360 ** 3) / Math.log(10)  # = 14.1816474627254776555

  def initialize(digits)
    @digits = digits
    @c3_24  = C ** 3 / 24
    @n      = ((@digits + 1) / DIGITS_PER_TERM).truncate  # Somehow, need to add 1 to digits.
    @prec   = ((@digits + 1) * Math.log2(10)).truncate    # Somehow, need to add 1 to digits.
  end

  # Compute PI
  def comp_pi
    puts "**** PI Computation ( #{@digits} digits )"

    begin
      # Compute Pi
      pqt = comp_pqt(0, @n)
      pi  = GMP.F(D)
      pi *= GMP.F(E, @prec).sqrt
      pi *= pqt[:q]
      pi /= A * pqt[:q] + pqt[:t]

      # Output
      File.open("pi.txt", "w") { |f| f.puts pi }
    rescue => e
      raise
    end
  end

private

  # Compute PQT (by Binary Splitting Algorith)
  def comp_pqt(n1, n2)
    pqt = Hash.new

    begin
      if n1 + 1 == n2
        pqt[:p]  = GMP.Z(2 * n2 - 1)
        pqt[:p] *= GMP.Z(6 * n2 - 1)
        pqt[:p] *= GMP.Z(6 * n2 - 5)
        pqt[:q]  = GMP.Z(@c3_24 * n2 * n2 * n2)
        pqt[:t]  = GMP.Z((A + B * n2) * pqt[:p])
        pqt[:t]  = pqt[:t].neg if (n2 & 1) == 1
      else
        m = (n1 + n2) / 2
        res1 = comp_pqt(n1, m)
        res2 = comp_pqt(m, n2)
        pqt[:p] = res1[:p] * res2[:p]
        pqt[:q] = res1[:q] * res2[:q]
        pqt[:t] = res1[:t] * res2[:q]+ res1[:p] * res2[:t]
      end

      return pqt
    rescue => e
      raise
    end
  end
end

if __FILE__ ==$0
  begin
    digits = ARGV[0] ? ARGV[0].to_i : 100
    obj = Chudnovsky.new(digits)
    res = Benchmark.realtime { obj.comp_pi }
    puts "( TIME: #{res} seconds )"
  rescue => e
    puts "[#{e.class}] #{e.message}\n"
    e.backtrace.each{ |tr| puts "\t#{tr}" }
    exit 1
  end
end
{% endhighlight %}

* [Gist - Ruby script to compute pi by Chudnovsky formula and Binary Splitting Algorithm using GMP libarary.](https://gist.github.com/komasaru/a5639355b3b37302a970 "Gist - Ruby script to compute pi with Chudnovsky formula and Binary Splitting Algorithm using GMP libarary.")

### 3. 動作確認

引数に計算したい桁数を指定して実行する。（以下は 1,000,000 桁を計算する例。引数を指定しない場合のデフォルト値は `100`）

``` text
$ ./chudnovsky.rb 1000000
**** PI Computation ( 1000000 digits )
( TIME: 1.8596882179990644 seconds )
```

計算結果は "pi.txt" ファイルに出力される。  
以下は、1,000,000 桁のうち最初と最後の150桁を抜粋後、可読性を高めるために整形。また、指数表現で出力されることに留意。

File: `pi.txt`

{% highlight text linenos %}
0.314159265358979323846264338327950288419716939937510
   58209749445923078164062862089986280348253421170679
   82148086513282306647093844609550582231725359408128
                      :
                      :
                      :
   99779937654232062337471732470336976335792589151526
   03156140333212728491944184371506965520875424505989
   567879613033116462839963464604220901061057794581514e+1
{% endhighlight %}

### 4. 計算結果検証

本来は別の公式・アルゴリズムで計算した結果と比較すべきでしょうが、（今回は計算桁数も少なくテキストエディタで開けるので）取り急ぎ任意の桁の数字が誤っていないかを別途計算済みの結果と目視で比較確認する。

当方は "[Pi Digits](http://bellard.org/pi/pi2700e9/pidigits.html "Pi Digits")" の計算結果と比較し、最初・中間・最後の部分が一致することを確認した。（現時点では１億桁までは）

テキストファイルのサイズは 1,000 万桁で 10MB(約 9.5 MiB), 1 億桁で 100MB(約 95.4MiB) になる。非力なマシンの場合は（そうでない場合も）テキストエディタで開くのに注意すること！

### 5. 桁別計算時間検証

<table class="common">
  <tr><td class="right">計算桁数(桁)</td><td class="right">計算時間(秒)（結果出力時間を含む）</td></tr>
  <tr><td class="right">        100</td><td class="right">  0.00043896799616049975</td></tr>
  <tr><td class="right">      1,000</td><td class="right">  0.00116081099986331540</td></tr>
  <tr><td class="right">     10,000</td><td class="right">  0.01096508799673756600</td></tr>
  <tr><td class="right">    100,000</td><td class="right">  0.13042284899711376000</td></tr>
  <tr><td class="right">  1,000,000</td><td class="right">  1.86623293700540670000</td></tr>
  <tr><td class="right"> 10,000,000</td><td class="right"> 26.85289008899417200000</td></tr>
  <tr><td class="right">100,000,000</td><td class="right">440.39495715600060000000</td></tr>
</table>

### 6. 参考サイト

1. [円周率.jp](http://xn--w6q13e505b.jp/ "円周率.jp")
2. [Pi Computation Record](http://bellard.org/pi/pi2700e9/announce.html "Pi Computation Record")

（計算アルゴリズムは 2 内の "pipcrecord.pdf" を参考にした）

---

当然ながら C++ より計算に時間がかかりますが、それでも１億桁を計算してファイル出力するのに約７分少ししかかからないのには一種の感動を覚えます。（ライブラリのおかげで）

以上。

