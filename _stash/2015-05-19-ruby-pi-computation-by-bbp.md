---
layout   : single
title    : "Ruby - 円周率計算（BBP の公式使用）！"
published: true
date     : 2015-05-19 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
- 円周率
---
こんにちは。

前回、 BBP(Bailey, Borwein, Plouffe) の公式を使用して任意の桁の円周率を16進で計算するアルゴリズムを C++ で実装しました。

* [C++ - 円周率計算（BBP の公式使用）！]({{site.baseurl}}/2015/05/17/cpp-pi-computation-by-bbp/ "C++ - 円周率計算（BBP の公式使用）！")

今回は、同じアルゴリズムを Ruby で実装してみました。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* ruby 2.2.2-p95 での作業を想定。
* 計算に使用したマシンは CPU: Intel Core2Duo E8500 ( 3.16GHz ), MEM: 3.9GiB

### 1. BBP の公式を使用した円周率計算について

前回の記事を参照。

* [C++ - 円周率計算（BBP の公式使用）！]({{site.baseurl}}/2015/05/17/cpp-pi-computation-by-bbp/ "C++ - 円周率計算（BBP の公式使用）！")

### 2. Ruby スクリプトの作成

第1引数で計算を開始する桁を指定し、その桁から 10 桁を出力する仕様。（べき剰余の演算も自前で実装。「[Ruby - べき剰余アルゴリズムの実装！]({{site.baseurl}}/2015/05/15/ruby-implementation-of-modular-exponentiation "Ruby - べき剰余アルゴリズムの実装！")」参照）

File: `pi_bbp.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
#=======================================
# Computation of pi by BBP algorithm.
#=======================================
require 'benchmark'

class PiBbp
  EPS = 1.0e-17  # Loop-exit accuration of the right summation

  def comp_pi(d)
    d -= 1
    pi = (4 * s(1, d) - 2 * s(4, d) - s(5, d) - s(6, d)) % 1.0
    printf("FRACTION  : %.15f\n", pi)
    printf("HEX DIGITS: %10x\n", (pi * 16 ** 10).truncate)
  end

  def s(j, d)
    # Left sum
    s = 0.0
    k = 0
    while k <= d
      r = 8 * k + j
      t = mod_exp(16, d - k, r)
      t /= r.to_f
      s += t % 1.0
      s %= 1.0
      k += 1
    end

    # Right sum
    loop do
      r = 8 * k + j
      t = 16.0 ** (d - k) / r
      break if t < EPS
      s += t
      s %= 1.0
      k += 1
    end

    return s
  end

  def mod_exp(b, e, m)
    return 1 if e == 0
    ans = mod_exp(b, e / 2, m)
    ans = (ans * ans) % m
    ans = (ans * b) % m if e % 2 == 1
    return ans
  end
end

exit unless __FILE__ == $0
exit unless ARGV[0]
obj = PiBbp.new
res = Benchmark.realtime do
  obj.comp_pi(ARGV[0].to_i)
end
puts "( TIME: #{res} seconds )"
{% endhighlight %}

* [Gist - Ruby script to compute pi with BBP formula.](https://gist.github.com/komasaru/a091c46595cdbc8d276a "Gist - Ruby script code to compute pi with BBP formula.")

### 3. 動作確認

`HEX DIGITS` が求める円周率（16進）。（但し、計算公式の特性上、後半の桁の値は保証されない）

``` text
$ ./pi_bbp.rb 1
FRACTION  : 0.141592653589793
HEX DIGITS: 243f6a8885
TIME: 0.00012832199718104675 seconds )

$ ./pi_bbp.rb 91
FRACTION  : 0.910345837630448
HEX DIGITS: e90c6cc0ac
TIME: 0.0006358680002449546 seconds )

$ ./pi_bbp.rb 991
FRACTION  : 0.284592623548894
HEX DIGITS: 48db0fead3
TIME: 0.008182067002053373 seconds )

$ ./pi_bbp.rb 9991
FRACTION  : 0.151042259944499
HEX DIGITS: 26aab49ec6
( TIME: 0.10906490000343183 seconds )

$ ./pi_bbp.rb 99991
FRACTION  : 0.633399233605157
HEX DIGITS: a22673c1a5
( TIME: 1.3719816630000423 seconds )

$ ./pi_bbp.rb 999991
FRACTION  : 0.624957331312628
HEX DIGITS: 9ffd342362
( TIME: 14.838047453999025 seconds )

$ ./pi_bbp.rb 9999991
FRACTION  : 0.756411434763846
HEX DIGITS: c1a42e06a1
TIME: 177.62035008599923 seconds
```

（99,999,991桁目からの10桁（1億桁目まで）は計算していないが、当方の環境では30分少しかかりそう）

### 4. 計算結果の検証

"[Pi Digits](http://bellard.org/pi/pi2700e9/pidigits.html "Pi Digits")" の計算結果と比較し、任意のあらゆる部分が一致することを確認した。

### 5. 参考サイト

* [円周率.jp](http://xn--w6q13e505b.jp/ "円周率.jp")
* [BBP Code Directory](http://www.experimentalmath.info/bbp-codes/ "BBP Code Directory")
* [Pi Computation Record](http://bellard.org/pi/pi2700e9/announce.html "Pi Computation Record")

---

当然ながら同じアルゴリズムを C++ に実装した場合と比べると随分と速度が遅いです。

以上。

