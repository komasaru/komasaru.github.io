---
layout   : single
title: "Ruby - 数式文字列 => 逆ポーランド記法 変換（スタック使用）！"
published: true
date     : 2020-10-28 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で、入力した数式の文字列を逆ポーランド記法（RPN; 後置記法）に変換する処理を実装してみました。  
今回はスタックを使用した処理です。（後日、二分木を使用した処理についても紹介予定）  
逆ポーランド記法の数式文字列から値を計算する処理（逆ポーランド計算機）については、次回紹介予定です。

ちなみに、過去には Fortran95 で実装しています。

* [Fortran - スタックの実装（逆ポーランド記法による電卓）！]({{site.baseurl}}/2018/11/26/fortran95-stack-computation "Fortran - スタックの実装（逆ポーランド記法による電卓）！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.5 buster (64bit) での作業を想定。
* Ruby 2.7.2 での作業を想定。
* 演算子は `*`, `/`, `+`, `-` を想定。（単項演算子は非対応）
* 括弧は `(`, `)` のみに対応。

### 1. アルゴリズム（そのままロジック化）

1. 数式文字列をトークン分割（配列化）
2. 配列の先頭から順次読み込んで判定（ループ処理）  
  a. 数値の場合  
     => そのまま、出力
  b. 括弧・開き `(` の場合  
     => そのまま、スタックへ push
  c. 括弧・閉じ `)` の場合  
     => `(` が出るまでスタックから pop して出力  
        但し、 `(`, `)` は廃棄
  d. その他（演算子）の場合  
     => そのまま、スタックへ push  
        但し、スタックトップの演算子の方が優先度が高ければ、それを pop して出力  
        （※演算子・括弧の優先度： `*` = `/` > `+` = `-` > `(` = `)`）

### 2. Ruby スクリプトの作成

* String クラスを拡張する形式にしている。
* 括弧の開きと閉じの対応のチェックは行わない。
* 正規表現について、文字列を事前コンパイルして正規表現オブジェクトを生成しているが、各箇所で直接使用してもよい。（正規表現コンパイルにかかる時間が問題になるような処理でもないので）
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `infix2rpn.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************************
# Ruby script to convert string to RPN.
# (Unary operators are not supported)
#*********************************************************

class String
  RE_0   = Regexp.new('\s+|\=')
  RE_1   = Regexp.new('[\d\.]+|[()*/+\-]')
  RE_D   = Regexp.new('\d+')
  RE_K_0 = Regexp.new('\(')
  RE_K_1 = Regexp.new('\)')
  RE_K_2 = Regexp.new('[()]')
  PRI = {"*" => 3, "/" => 3, "+" => 2, "-" => 2, "(" => 1, ")" => 1}

  def to_rpn
    stack = []
    rpn = []
    self.gsub(RE_0, "").scan(RE_1).each do |t|
      case t
      when RE_D
        rpn << t
      when RE_K_0
        stack << t
      when RE_K_1
        while stack[-1] != "("
          s = stack.pop
          rpn << s if s !~ RE_K_2
        end
        stack.pop
      else
        while stack != [] && PRI[stack[-1]] >= PRI[t]
          rpn << stack.pop
        end
        stack << t
      end
    end
    until stack == []
      s = stack.pop
      rpn << s if s !~ RE_K_2
    end
    return rpn.join(" ")
  end
end

if __FILE__ == $0
  f = $stdin.gets.chomp
  exit if f == ""
  puts f.to_rpn
end
{% endhighlight %}

* [Gist - Ruby script to convert a formula string to a RPN.](https://gist.github.com/komasaru/c2d100ac0b26a049a2965eb3fd307ca1 "Gist - Ruby script to convert a formula string to a RPN.")

### 3. 動作確認

まず、実行権限を付与。

``` text
$ chmod +x infix2rpn.rb
```

そして、実行。  
元の数式（中置記法）を入力してエンターを押下すると、逆ポーランド記法(RPN)で出力される。

``` text
$ ./infix2rpn.rb
2 * (3 + (12 - 8)) / 7
2 3 12 8 - + * 7 /
```

---

次回、逆ポーランド記法の数式文字列から値を計算する処理（逆ポーランド計算機）について紹介する予定です。

以上。

