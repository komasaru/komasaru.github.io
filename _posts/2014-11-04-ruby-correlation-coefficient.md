---
layout   : single
title    : "Ruby - Array クラス拡張で相関係数計算！"
published: true
date     : 2014-11-04 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

2変量の間にどれくらいの相関があるのかを調べる指標の「相関係数」を Ruby で簡単に計算するように試してみました。

Array クラスを拡張する方法です。

それほど難しい数学的アルゴリズムでも、それほど難しいプログラミングロジックでもありませんが、少し頻繁に使用することになりそうなので試してみた次第です。

<!--more-->

### 0. 前提条件

- Ruby 2.1.3-p242 での作業を想定。

### 1. 相関係数について

まず、簡単に相関係数の定義について。  
（数式が多いので、別途 $$\LaTeX$$ で作成した文書を貼り付け）

![CORRELATION_COEFFICIENT]({{site.baseurl}}/images/2014/11/04/CORRELATION_COEFFICIENT.png "相関係数")

### 2. Ruby スクリプト作成

以下のように Array クラスを拡張してメソッドを定義してみた。  
（ちなみに、相関係数を表す数学的な略称を表す `r` をメソッド名にしている。別の意味に捉えられる可能性のある `C` や `O` ではなく `R` を使用するのが慣例となっているため）

File: `correlation_coefficient.rb`

{% highlight ruby linenos %}
class Array
  def r(y)
    # 以下の場合は例外スロー
    # - 引数の配列が Array クラスでない
    # - 自身配列が空
    # - 配列サイズが異なれば例外
    raise "Argument is not a Array class!"  unless y.class == Array
    raise "Self array is nil!"              if self.size == 0
    raise "Argument array size is invalid!" unless self.size == y.size

    # x の相加平均, y の相加平均 (arithmetic mean)
    mean_x = self.inject(0) { |s, a| s += a } / self.size.to_f
    mean_y = y.inject(0) { |s, a| s += a } / y.size.to_f
    # x と y の共分散の分子 (covariance)
    cov = self.zip(y).inject(0) { |s, a| s += (a[0] - mean_x) * (a[1] - mean_y) }
    # x の分散の分子, y の分散の分子 (variance)
    var_x = self.inject(0) { |s, a| s += (a - mean_x) ** 2 }
    var_y = y.inject(0) { |s, a| s += (a - mean_y) ** 2 }
    # 相関係数 (correlation coefficient)
    r = cov / Math.sqrt(var_x)
    r /= Math.sqrt(var_y)
  end
end

ary = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
p ary.r([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
p ary.r([2, 3, 3, 4, 6, 7, 8, 9, 10, 11])
p ary.r([15, 13, 12, 12, 10, 10, 8, 7, 4, 3])
{% endhighlight %}

- [Gist - Ruby script to calculate a correlation coefficient.](https://gist.github.com/komasaru/b56131a6385bf52bdd0a "Gist - Ruby script to calculate a correlation coefficient.")

### 3. Ruby スクリプト実行

実行してみる。

``` text
$ ruby correlation_coefficient.rb
1.0
0.9923373049285564
-0.9803906931996748
```

---

単回帰分析を行うにあたって、予め2変量の相関を調べておきたかったための作業でした。

以上。

