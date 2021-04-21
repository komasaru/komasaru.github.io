---
layout   : single
title    : "Ruby - フーリエ級数展開！"
published: true
date     : 2013-05-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

前回は、「フーリエ級数展開」を C++ で実装してみました。

* [C++ - フーリエ級数展開！]({{site.baseurl}}/2013/05/16/cpp-expand-fourier-series/ "C++ - フーリエ級数展開！")

今回は、同じことを Ruby で実装してみました。実際、ほとんど同じです。「フーリエ級数展開」についての詳細は上記の前回記事を参照ください。

<!--more-->

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* Ruby 2.0.0-p0 を使用。

### 1. Ruby スクリプト作成

File: `fourier_series_expansion.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************
# フーリエ級数展開
#   f(t) = -1 (-pi < t <= 0 )
#           1 (  0 < t <= pi)
#*********************************************
#
class FourierSeriesExpansion
  N = 3  # 計算項数

  # フーリエ級数展開
  def expand_fourier_series
    open("FourierSeriesExpansion.csv", "w") do |f|
      # ヘッダ出力
      f.puts "t,f(t)"
      # 1 / 1000 刻みで計算
      y = 0
      ((Math::PI * -1000).truncate).upto(Math::PI * 1000) do |t|
        1.upto(N) { |i| y += calc_term(i, t / 1000.0) }
        f.puts "%.3f,%.6f" % [t / 1000.0, 4 / Math::PI * y]
        y = 0
      end
    end
  rescue => e
    raise
  end

  private

  # 各項計算
  def calc_term(n, t)
    return Math::sin((2 * n - 1) * t) / (2 * n - 1)
  rescue => e
    raise
  end
end

if __FILE__ == $0
  begin
    # 計算クラスインスタンス化
    obj = FourierSeriesExpansion.new
    # フーリエ級数展開
    obj.expand_fourier_series
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
  end
end
{% endhighlight %}

* [Gist - Ruby script to expand Fourier's series.](https://gist.github.com/komasaru/5516410 "Gist - Ruby script to expand Fourier's series.")

### 2. 実行

まず、実行権限を付与。

``` text
$ chmod +x fourier_series_expansion.rb
```

そして、実行。

``` text
$ ./fourier_series_expansion.rb
```

コンソールには特に何も表示しない。  
アプリと同じディレクトリに `FourierSeriesExpansion.csv` という CSV ファイルが作成される。  
内容は以下のようになっているはず。

File: `FourierSeriesExpansion.csv`

{% highlight text linenos %}
t,f(t)
-3.141,-0.002264
-3.140,-0.006083
-3.139,-0.009903
-3.138,-0.013723
-3.137,-0.017542
-3.136,-0.021361
-3.135,-0.025180
-3.134,-0.028999
-3.133,-0.032817
-3.132,-0.036635
-3.131,-0.040452
-3.130,-0.044269
-3.129,-0.048086
-3.128,-0.051901
-3.127,-0.055717
-3.126,-0.059531
-3.125,-0.063345
-3.124,-0.067159
-3.123,-0.070971
         :
====< 途中省略 >====
         :
3.122,0.074783
3.123,0.070971
3.124,0.067159
3.125,0.063345
3.126,0.059531
3.127,0.055717
3.128,0.051901
3.129,0.048086
3.130,0.044269
3.131,0.040452
3.132,0.036635
3.133,0.032817
3.134,0.028999
3.135,0.025180
3.136,0.021361
3.137,0.017542
3.138,0.013723
3.139,0.009903
3.140,0.006083
3.141,0.002264
{% endhighlight %}

### 3. グラフ化

数字だけを眺めてもよく分からないので、R でグラフ化（プロット）してみた。  

【元の関数グラフ】

![r_fourier_series_0]({{site.baseurl}}/images/2013/05/17/r_fourier_series_0.png "r_fourier_series_0")

以下、計算項数を 1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000, 10000, 100000 個として計算した結果をグラフ化したもの。

![r_fourier_series_1]({{site.baseurl}}/images/2013/05/17/r_fourier_series_1.png "r_fourier_series_1")
![r_fourier_series_2]({{site.baseurl}}/images/2013/05/17/r_fourier_series_2.png "r_fourier_series_2")
![r_fourier_series_3]({{site.baseurl}}/images/2013/05/17/r_fourier_series_3.png "r_fourier_series_3")
![r_fourier_series_5]({{site.baseurl}}/images/2013/05/17/r_fourier_series_5.png "r_fourier_series_5")
![r_fourier_series_10]({{site.baseurl}}/images/2013/05/17/r_fourier_series_10.png "r_fourier_series_10")
![r_fourier_series_20]({{site.baseurl}}/images/2013/05/17/r_fourier_series_20.png "r_fourier_series_20")
![r_fourier_series_50]({{site.baseurl}}/images/2013/05/17/r_fourier_series_50.png "r_fourier_series_50")
![r_fourier_series_100]({{site.baseurl}}/images/2013/05/17/r_fourier_series_100.png "r_fourier_series_100")
![r_fourier_series_200]({{site.baseurl}}/images/2013/05/17/r_fourier_series_200.png "r_fourier_series_200")
![r_fourier_series_500]({{site.baseurl}}/images/2013/05/17/r_fourier_series_500.png "r_fourier_series_500")
![r_fourier_series_1000]({{site.baseurl}}/images/2013/05/17/r_fourier_series_1000.png "r_fourier_series_1000")
![r_fourier_series_10000]({{site.baseurl}}/images/2013/05/17/r_fourier_series_10000.png "r_fourier_series_10000")
![r_fourier_series_100000]({{site.baseurl}}/images/2013/05/17/r_fourier_series_100000.png "r_fourier_series_100000")

項数を増やすにつれて元の関数のグラフに近付いていくのがよく分かる。

---

電気工学、音響学、振動、光学等でよく使用する重要な概念です。応用範囲は広いので他にも利用できるかと思います。

以上。

