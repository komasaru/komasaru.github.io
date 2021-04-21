---
layout   : single
title: "Ruby - 逆ポーランド記法の評価（計算）！"
published: true
date     : 2020-11-04 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

前回、 Ruby で、入力した数式の文字列を逆ポーランド記法（RPN; 後置記法）に変換する処理を実装してみました。（スタック使用）

* [Ruby - 数式文字列 => 逆ポーランド記法 変換！]({{site.baseurl}}/2020/10/28/ruby-convert-infix-to-rpn-with-stack "Ruby - 数式文字列 => 逆ポーランド記法 変換！")

今回は、出力された逆ポーランド記法での表現を読み込んで計算する処理を実装してみました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.5 buster (64bit) での作業を想定。
* Ruby 2.7.2 での作業を想定。
* 演算子は `*`, `/`, `+`, `-` を想定。（単項演算子は非対応）

### 1. アルゴリズム（そのままロジック化）

1. RPN 文字列をトークン分割（配列化）
2. 配列の先頭から順次読み込んで判定（ループ処理）  
  a. 数値の場合  
     　=> そのまま、スタックへ push  
  b. その他（演算子）の場合  
     　=> スタックから2個 pop （最初を右側、次を左側のオペランドとする）  
     　　   左右のオペランドを演算子で計算し、結果を再度スタックへ push
3. 最後にスタックに残った値を pop して出力

### 2. Ruby スクリプトの作成

* String クラスを拡張する形式にしている。
* 正規表現について、文字列を事前コンパイルして正規表現オブジェクトを生成しているが、各箇所で直接使用してもよい。（正規表現コンパイルにかかる時間が問題になるような処理でもないので）
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `rpn.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************************
# Ruby script to caculate a formula string by RPN.
#*********************************************************

class String
  RE_0  = Regexp.new('[=\s]+$')
  RE_1  = Regexp.new('\s+')
  RE_D  = Regexp.new('\d+')
  RE_PL = Regexp.new('\+')
  RE_MN = Regexp.new('\-')
  RE_PR = Regexp.new('\*')
  RE_DV = Regexp.new('\/')

  def rpn
    stack = []
    self.sub(RE_0, "").split(RE_1).each do |t|
      if t =~ RE_D
        stack.push(t.to_f)
        next
      end
      r, l = stack.pop, stack.pop
      case t
      when RE_PL; stack.push(l.to_f + r.to_f)
      when RE_MN; stack.push(l.to_f - r.to_f)
      when RE_PR; stack.push(l.to_f * r.to_f)
      when RE_DV; stack.push(l.to_f / r.to_f)
      end
    end
    return stack.pop
  end
end

if __FILE__ == $0
  f = $stdin.gets.chomp
  exit if f == ""
  puts f.rpn
end
{% endhighlight %}

* [Gist - Ruby script to calculate a formula expressed with RPN.](https://gist.github.com/komasaru/4775935f3dc2f110b26b3847668a4fb7 "Gist - Ruby script to calculate a formula expressed with RPN.")

### 3. 動作確認

まず、実行権限を付与。

``` text
$ chmod +x rpn.rb
```

そして、実行。  
逆ポーランド記法を入力してエンターを押下すると、結果が出力される。

``` text
$ ./rpn.rb
2 3 12 8 - + * 7 /
2.0
```

[前回紹介のスクリプト]({{site.baseurl}}/2020/10/28/ruby-convert-infix-to-rpn-with-stack "Ruby - 数式文字列 => 逆ポーランド記法 変換！")と今回紹介のスクリプトをパイプ処理して、中置（挿入）記法の数式を一括で求めることも可能。

``` text
$ ./infix2rpn.rb | ./rpn.rb
2 * (3 + (12 - 8)) / 7
2.0
```

---

[前回紹介のスクリプト]({{site.baseurl}}/2020/10/28/ruby-convert-infix-to-rpn-with-stack "Ruby - 数式文字列 => 逆ポーランド記法 変換！")と今回紹介のスクリプトを融合し、一括処理することも容易であろう。（当ブログでの紹介は割愛）

以上。

