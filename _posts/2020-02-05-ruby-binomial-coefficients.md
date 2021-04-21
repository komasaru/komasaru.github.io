---
layout   : single
title    : "Ruby - 二項係数の計算！"
published: true
date     : 2020-02-05 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で二項係数の計算をしてみました。（各種計算式を使用して）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.2 (64bit) での作業を想定。
* Ruby 2.7.0 での作業を想定。

### 1. 二項係数について

$$n$$ 個の物から $$r$$ 個のものを選ぶ組み合わせは $$_nC_r$$ 通りあり、 $$\displaystyle \binom{n}{r}$$ とも表す。また、二項級数（二項定理）の係数であることから、 $$\textbf{二項係数}$$ とも呼ばれる。

以下、二項係数の主な重要性質。

$$
\begin{eqnarray}
\binom{n}{r} &=& _nC_r = \frac{_nP_r}{r!} = \frac{n!}{r!(n - r)!} \tag{1} \\
\binom{n}{r} &=& \binom{n}{n-r} \\
\binom{n}{0} &=& 1 \\
\binom{n}{r} &=& \binom{n-1}{r} + \binom{n-1}{r-1} \tag{2} \\
\binom{n}{r} &=& \frac{n}{r}\binom{n-1}{r-1} \tag{3} \\
\binom{n}{r} &=& \frac{n^{\underline{r}}}{r!} = \frac{n(n-1)(n-2)\cdots(n-(r-1))}{r(r-1)(r-2)\cdots1} = \prod_{i=1}^{r}\frac{n-i+1}{i} \tag{4} \\
&&(n^{\underline{r}}は下降階乗冪) \nonumber
\end{eqnarray}
$$

### 2. Ruby スクリプトの作成

* 4種の計算式を使用する。（前述の (1), (2), (3), (4)）  
  （使用する計算式（メソッド）の切り替えはコメント／アンコメントで）
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

まず、計算用モジュール。

File: `binom_coeff.rb`

{% highlight ruby linenos %}
#***************************************************
# 二項係数計算モジュール
#
#   DATE          AUTHOR          VERSION
#   2019.10.19    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2019 mk-mode.com All Rights Reserved.
#***************************************************
module BinomCoeff
  # 二項係数の計算(1)
  #   計算式: (n r) = n! / r!(n -r)!
  #
  # @param  n: n の値
  # @param  r: r の値
  # @return  : 二項係数
  def binom_1(n, r)
    return 1 if r == 0 || r == n
    return fact(n) / (fact(r) * fact(n - r))
  rescue => e
    raise
  end

  # 二項係数の計算(2)
  #   計算式: (n r) = ((n - 1) r) + ((n - 1) (k - 1))
  #           (recursively)
  #
  # @param  n: n の値
  # @param  r: r の値
  # @return  : 二項係数
  def binom_2(n, r)
    return 1 if r == 0 || r == n
    return binom_2(n - 1, r) + binom_2(n - 1, r - 1)
  rescue => e
    raise
  end

  # 二項係数の計算(3)
  #   計算式: (n r) = (n / r) * ((n - 1) (k - 1))
  #           (recursively)
  #
  # @param  n: n の値
  # @param  r: r の値
  # @return  : 二項係数
  def binom_3(n, r)
    return 1 if r == 0 || r == n
    return n * binom_3(n - 1, r - 1) / r
  rescue => e
    raise
  end

  # 二項係数の計算(4)
  #   計算式: (n r) = Π(n - i + 1) / i  (i = 1, ..., r)
  #
  # @param  n: n の値
  # @param  r: r の値
  # @return  : 二項係数
  def binom_4(n, r)
    return 1 if r == 0 || r == n
    return (1..r).inject(1) { |s, i| s * (n - i + 1) / i }
  rescue => e
    raise
  end

  # 階乗の計算
  def fact(x)
    return x == 0 ? 1 : (1..x).inject(&:*)
  rescue => e
    raise
  end
end
{% endhighlight %}

そして、実行部分。

File: `test_binom.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#***************************************************
# 二項係数の計算
#
#   DATE          AUTHOR          VERSION
#   2019.10.19    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2019 mk-mode.com All Rights Reserved.
#***************************************************
#
require './binom_coeff'

class TestBinom
  include BinomCoeff

  # テストしたい n と r の組み合わせ
  DATA = [
    [   0,     1],
    [   1,    -1],
    [   1,   0.9],
    [ 1.1,     1],
    [   1,     0],
    [   1,     1],
    [  10,     2],
    [ 100,     3],
    [1000,     4],
    [5000,   500],
    [5000,  2500],
  ]

  # 計算
  #
  #   計算式
  #     1. (n r) = n! / r!(n -r)!
  #     2. (n r) = ((n - 1) r) + ((n - 1) (k - 1))
  #                (recursively)
  #     3. (n r) = (n / r) * ((n - 1) (k - 1))
  #                (recursively)
  #     4. (n r) = Π(n - i + 1) / i  (i = 1, ..., r)
  #
  #   **注意**
  #     計算式(2) では、 n と r の組み合わせにより重くなる。
  def calc
    DATA.each do |n, r|
      if n.integer? && r.integer? && r >= 0 && n >= r
        r = n - r if r * 2 > n
        b = binom_1(n, r)
        #b = binom_2(n, r)
        #b = binom_3(n, r)
        #b = binom_4(n, r)
      else
        b = "ERROR"
      end
      puts "(%5s %5s) = %s" % [n.to_s, r.to_s, b]
    end
  rescue => e
    msg = "[ERROR][#{self.class.name}.#{__method__}] #{e}\n"
    msg << e.backtrace.map { |tr| "\t#{tr}" }.join("\n")
    $stderr.puts msg
  end
end

TestBinom.new.calc if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate binomial coefficients.](https://gist.github.com/komasaru/5a2ae4c3905ecd4d7d868303b79af88a "Gist - Ruby script to calculate binomial coefficients.")

### 3. Ruby スクリプトの実行

使用する計算式を指定（`binom_1` 〜 `binom_4` のどれか1つをアンコメント）し、（実行権限付与後）実行。  
（$$\displaystyle \binom{n}{r}$$ を $$(n\ r)$$ で表示）

``` text
$ ./test_binom.rb
(    0     1) = ERROR
(    1    -1) = ERROR
(    1   0.9) = ERROR
(  1.1     1) = ERROR
(    1     0) = 1
(    1     1) = 1
(   10     2) = 45
(  100     3) = 161700
( 1000     4) = 41417124750
( 5000   500) = 1523835705022762417731122990382870117598055177177749896120639633
24852197721349960590884233711082048864016759544054508257767390473359453022881045
96412151481279032572628587506952815691445272815864618334838578548489705130296370
24564696619256490139380256756521034067102189053550770577321962948522784729534964
40392540565238652496586095257231832780763525058654245376714838913660805861811146
73093555560987897570461892398850728174637647049432100899628473901889341073510672
28579300289733788771300549317475095309560616933594701759502335749628087140048422
87921921934995121777448532875190191549476629085646880295182806621692835943142454
94781713166908858338292805012574139395221071794379443806683120281496168313927264
0
( 5000  2500) = 1593718685349438375691025792935919087257129434168729738511421888
72518373824934316862872132198737208221672511402555862743192945253840364795382306
00454556577691298731223139197739339645846143083224492991761486489258473048002364
35693244409410331220544318159889227102593634458107549089358656784053736247584401
42031044547368194157050004242259620582082661357080498515208249606079728077389364
58482894499881130290028489658358418222712925568554614843252710656388600128610737
78999218996871035158899198654278582371309677671306096769432314126537889059653739
61476326714818415355404243553201735513976300204644418951065367210142707597509025
84263727315940982234214301739743015696876932752350076105807592416978704841009451
63805766488340713897642197106542283174953794968649783206558992619899425465272314
92156490948937287393545762153546228948733859258409371852189676023784684920226045
95977596090746993599635311197103834969759525711206868837906022197308439764699833
85082049193547335825798706248498798896761744609761227753857586204130073377729991
15852082141809221763836267285335353837798268509494032488772094438719000803033475
88153254664706313852071962274496768068214644610228729466440558822087855409867215
60176252586558088366726782973824315529862858085233856576623336759865034479914679
00651487461177550617711457970544988413334453506858551684298754661646355592385908
76503133076137653937696671905067973767375187078328886627001727903777932593518687
97507163339600827270303879295319252652644612708041188699645673663207276383716320
```

（実際には、折り返しはない）

### 4. ベンチマーク

N=100, R=3 として 10,000 回実行した場合のベンチマークをとってみた。

File: `bm_binom.rb`

{% highlight ruby lino %}
#! /usr/local/bin/ruby
#***************************************************
# 二項係数の計算
#
#   DATE          AUTHOR          VERSION
#   2019.10.19    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2019 mk-mode.com All Rights Reserved.
#***************************************************
#
require 'benchmark'
require './binom_coeff'

class BmBinom
  include BinomCoeff

  N        = 100
  R        = 3
  LOOP_CNT = 10000

  # 計算
  #
  #   計算式
  #     1. (n r) = n! / r!(n -r)!
  #     2. (n r) = ((n - 1) r) + ((n - 1) (k - 1))
  #                (recursively)
  #     3. (n r) = (n / r) * ((n - 1) (k - 1))
  #                (recursively)
  #     4. (n r) = Π(n - i + 1) / i  (i = 1, ..., r)
  #
  #   **注意**
  #     計算式(2) では、 n と r の組み合わせにより重くなる。
  def calc
    Benchmark.bm(10) do |x|
      x.report("TEST-1") do
        LOOP_CNT.times { |_| binom_1(N, R) }
      end
      x.report("TEST-2") do
        LOOP_CNT.times { |_| binom_2(N, R) }
      end
      x.report("TEST-3") do
        LOOP_CNT.times { |_| binom_3(N, R) }
      end
      x.report("TEST-4") do
        LOOP_CNT.times { |_| binom_4(N, R) }
      end
    end
  rescue => e
    msg = "[ERROR][#{self.class.name}.#{__method__}] #{e}\n"
    msg << e.backtrace.map { |tr| "\t#{tr}" }.join("\n")
    $stderr.puts msg
  end
end

BmBinom.new.calc if __FILE__ == $0
{% endhighlight %}

``` text
$ ./bm_binom.rb
                 user     system      total        real
TEST-1       0.544000   0.004000   0.548000 (  0.560607)
TEST-2     187.144000   0.188000 187.332000 (191.788672)
TEST-3       0.004000   0.000000   0.004000 (  0.003551)
TEST-4       0.008000   0.000000   0.008000 (  0.007427)
```

今回使用した計算式の中では、(3) の $$\displaystyle \binom{n}{r} = \frac{n}{r} \binom{n-1}{r-1}$$ （再帰的）が最速であった。

---

以上。

