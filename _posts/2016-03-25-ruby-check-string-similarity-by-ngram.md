---
layout   : single
title    : "Ruby - String クラス拡張で２つの文字列の類似度をチェック（N-gram 版）！"
published: true
date     : 2016-03-25 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

2つの文字列がどれくらい類似しているかを N-gram モデルを利用してチェックしてみました。

そのようなライブラリを作成している方もおられますが、ライブラリを使用するほどのことでもないので Ruby の String クラスを拡張して実装しています。

<!--more-->

### 0. 前提条件

* Ruby 2.3.0-p0 での作業を想定。

### 1. N-gram モデルについて

N-gram モデルは、簡単に説明すると、N 文字を元に文字列のインデックスを作成する方法のことである。（一般的に N = 3 について考えることが多い）

例えば、「吾輩は猫である。」という文字列を N = 3 の N-gram モデルで考えると、以下のように 6 個のインデックスが作成される。

``` text
吾輩は
輩は猫
は猫で
猫であ
である
ある。
```

### 2. 2つの文字列の類似度を測る方法

例えば、「吾輩は猫である。（以下、文１）」と「吾輩は犬である。（以下、文２）」の２つの文字列の類似度を N = 3 の N-gram モデルで測る場合、3 文字インデックスは以下のようになる。

``` text
吾輩は  <=  文１, 文２
輩は猫  <=  文１
は猫で  <=  文１
猫であ  <=  文１
である  <=  文１, 文２
ある。  <=  文１, 文２
輩は犬  <=  文２
は犬で  <=  文２
犬であ  <=  文２
```

重複数を全体数で除して求めた率を「類似度」とすることにする。

上記の例の場合は、 3 / 9 ≒ 0.3 となる。

### 3. Ruby スクリプトの作成

String クラスを拡張したテスト用 Ruby スクリプトを以下のように作成する。

File: `check_string_similarity_by_ngram.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
# coding: utf-8
#********************************************************************
# Ruby script to check a degree of string similarity by n-gram model.
#********************************************************************
#
class String
  def sim_ngram(str, n = 3)
    # 空白文字(半角スペース、改行、復帰、改ページ、水平タブ)は除去
    strings = [self.gsub(/\s+/, ""), str.gsub(/\s+/, "")]
    lengths = strings.map { |s| s.split(//).size }
    # 文字列の文字数が N より少なければ例外スロー
    raise "Length of a self string is shorter than N(=#{n})"   if lengths[0] < n
    raise "Length of a target string is shorter than N(=#{n})" if lengths[1] < n

    # N 文字ずつ分割
    arrays = strings.map { |s| s.chars.each_cons(n).collect(&:join) }
    # 重複要素数
    count_dup = (arrays[0] & arrays[1]).size
    # 全要素数
    count_all = (arrays[0] + arrays[1]).uniq.size
    # 類似度返却
    return count_dup / count_all.to_f
  end
end

str_1 = "良識はこの世のものでもっとも公平に配分されている"
str_2 = "良識はこの世でもっとも公平に分け与えられているものである"

puts str_1
puts str_2
puts "String similarity(1-gram): #{str_1.sim_ngram(str_2, 1)}"
puts "String similarity(2-gram): #{str_1.sim_ngram(str_2, 2)}"
puts "String similarity(3-gram): #{str_1.sim_ngram(str_2)}"
puts "String similarity(4-gram): #{str_1.sim_ngram(str_2, 4)}"
{% endhighlight %}

* [Gist - Ruby script to check a degree of string similarity by n-gram model.](https://gist.github.com/komasaru/41b0c93e264be75eabfa "Gist - Ruby script to check a degree of string similarity by n-gram model.")

### 4. Ruby スクリプトの実行

実行権限を付与後、実行。

``` text
$ chmod +x check_string_similarity_by_ngram.rb

$ ./check_string_similarity_by_ngram.rb
文１：良識はこの世のものでもっとも公平に配分されている
文２：良識はこの世でもっとも公平に分け与えられているものである
類似度(1-gram): 0.72
類似度(2-gram): 0.5151515151515151
類似度(3-gram): 0.37142857142857144
類似度(4-gram): 0.24324324324324326
```

ちなみに、N = 3 の場合について見てみると以下のようになる。

``` text
良識は  <= 文1, 文2
識はこ  <= 文1, 文2
はこの  <= 文1, 文2
この世  <= 文1, 文2
の世の  <= 文1
世のも  <= 文1
のもの  <= 文1
もので  <= 文1, 文2
のでも  <= 文1
でもっ  <= 文1, 文2
もっと  <= 文1, 文2
っとも  <= 文1, 文2
とも公  <= 文1, 文2
も公平  <= 文1, 文2
公平に  <= 文1, 文2
平に配  <= 文1
に配分  <= 文1
配分さ  <= 文1
分され  <= 文1
されて  <= 文1
れてい  <= 文1, 文2
ている  <= 文1, 文2
の世で  <= 文2
世でも  <= 文2
平に分  <= 文2
に分け  <= 文2
分け与  <= 文2
け与え  <= 文2
与えら  <= 文2
えられ  <= 文2
られて  <= 文2
いるも  <= 文2
るもの  <= 文2
のであ  <= 文2
である  <= 文2
```

* 重複数 / 全体数 = 13 / 35 = 0.37142857142857144

---

文字列の類似度を調べたい場合に役に立つでしょう。

「N-gram モデル」を利用した類似度チェック方法の他に「Levenshtein 距離」と「Jaro-Winkler 距離」と利用した方法もあるので、いつか検証してみたいと思っています。

以上。

