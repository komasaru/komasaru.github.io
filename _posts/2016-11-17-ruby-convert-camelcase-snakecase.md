---
layout   : single
title    : "Ruby - キャメルケース <-> スネークケースの変換！"
published: true
date     : 2016-11-17 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- 正規表現
---

Ruby で、キャメルケースな class 名をスネークケースに変換してメソッド内で使用したかったので、 String クラスを拡張して実装してみました。（結局、よくある方法ですが）

以下、備忘録です。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。

### 1. 実装とスクリプト作成例

File: `conv_camel_snake.rb`

{% highlight ruby linenos %}
class String
  def to_camel
    self.split(/_/).map(&:capitalize).join
    # or
    #self.split(/_/).map{ |w| w[0] = w[0].upcase; w }.join
  end

  def to_snake
    self.gsub(/([A-Z]+)([A-Z][a-z])/, '\1_\2')
        .gsub(/([a-z\d])([A-Z])/, '\1_\2')
        .downcase
  end
end

src = "CamlCase1ASnakeCase2B"
puts "  SRC: #{src}"
snake = "CamlCase1ASnakeCase2B".to_snake
puts "SNAKE: #{snake}"
camel = snake.to_camel
puts "CAMEL: #{camel}"
{% endhighlight %}

* [Gist - Ruby script to convert CamelCase and snake_case each other.](https://gist.github.com/komasaru/b3f22d5bcb8555deea1707b84d294045 "Gist - Ruby script to convert CamelCase and snake_case each other.")

スネークケース変換時、連続する大文字はそれぞれに分離し、数字は分離しないようにしている。（※当方はこれで満足しているが、必要であれば各自調整をしてください）

---

以上。

