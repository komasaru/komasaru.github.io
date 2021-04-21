---
layout   : single
title    : "Ruby - 全角文字を2バイト換算して指定バイト数で切り捨て！"
published: true
date     : 2017-12-18 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

Ruby で文字列内の全角文字を2バイト換算し、指定バイト数で切り捨てる方法についての記録です。  
（正確には、「全角文字」ではなく、2バイト以上の文字）

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Ruby 2.4.3 （エンコード：UTF-8）での作業を想定。
* String クラスを拡張して実装する。

### 1. サンプルスクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 切り捨てたたことが分かるよう文字を設定することも可能にしている。

File: `str_trunc.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#**************************************************************
# 全角文字を2byte換算し、指定バイトで切り捨て（省略文字設定可）
# ※正確には、「全角文字」ではなく1byte超の文字
#**************************************************************
class String
  def trunc(trunc_at, om = "")
    om_size = (om.bytesize - om.size) / 2 + om.size
    if size == bytesize
      return size <= trunc_at ? self : "#{self[0, trunc_at - om_size]}#{om}"
    end
    return self if (self.bytesize - self.size) / 2 + self.size <= trunc_at
    size.times do |i|
      str_size = (self[0..i].bytesize - self[0..i].size) / 2 + self[0..i].size
      case
      when str_size <  trunc_at - om_size; next
      when str_size == trunc_at - om_size; return "#{self[0..i]}#{om}"
      else;                                return "#{self[0..(i - 1)]}#{om}"
      end
    end
    return self
  end
end

str = "abcdefg"
puts "str                 = #{str}"
puts "str.trunc(5)        = #{str.trunc(5)}"
puts "str.trunc(6)        = #{str.trunc(6)}"
puts "str.trunc(7)        = #{str.trunc(7)}"
puts "str.trunc(8)        = #{str.trunc(8)}"
puts "str.trunc(5, \"...\") = #{str.trunc(5, "...")}"
puts "str.trunc(6, \"...\") = #{str.trunc(6, "...")}"
puts "str.trunc(7, \"...\") = #{str.trunc(7, "...")}"
puts "str.trunc(8, \"...\") = #{str.trunc(8, "...")}"
puts
str = "AあBいCうDえEお"
puts "str                     = #{str}"
puts "str.trunc(12)           = #{str.trunc(12)}"
puts "str.trunc(13)           = #{str.trunc(13)}"
puts "str.trunc(14)           = #{str.trunc(14)}"
puts "str.trunc(15)           = #{str.trunc(15)}"
puts "str.trunc(16)           = #{str.trunc(16)}"
puts "str.trunc(12, \"...\")    = #{str.trunc(12, "...")}"
puts "str.trunc(13, \"...\")    = #{str.trunc(13, "...")}"
puts "str.trunc(14, \"...\")    = #{str.trunc(14, "...")}"
puts "str.trunc(15, \"...\")    = #{str.trunc(15, "...")}"
puts "str.trunc(16, \"...\")    = #{str.trunc(16, "...")}"
puts "str.trunc(12, \"(続く)\") = #{str.trunc(12, "(続く)")}"
puts "str.trunc(13, \"(続く)\") = #{str.trunc(13, "(続く)")}"
puts "str.trunc(14, \"(続く)\") = #{str.trunc(14, "(続く)")}"
puts "str.trunc(15, \"(続く)\") = #{str.trunc(15, "(続く)")}"
puts "str.trunc(16, \"(続く)\") = #{str.trunc(16, "(続く)")}"
{% endhighlight %}

* [Gist - Ruby script to truncate string, including multi-byte characters.](https://gist.github.com/komasaru/61321482c2dc8ed2b3168209e510b76d "Gist - Ruby script to truncate string, including multi-byte characters.")

### 2. サンプルスクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x str_trunc.rb
```

そして、実行。

``` text
$ ./str_trunc.rb
str                 = abcdefg
str.trunc(5)        = abcde
str.trunc(6)        = abcdef
str.trunc(7)        = abcdefg
str.trunc(8)        = abcdefg
str.trunc(5, "...") = ab...
str.trunc(6, "...") = abc...
str.trunc(7, "...") = abcdefg
str.trunc(8, "...") = abcdefg

str                     = AあBいCうDえEお
str.trunc(12)           = AあBいCうDえ
str.trunc(13)           = AあBいCうDえE
str.trunc(14)           = AあBいCうDえE
str.trunc(15)           = AあBいCうDえEお
str.trunc(16)           = AあBいCうDえEお
str.trunc(12, "...")    = AあBいCう...
str.trunc(13, "...")    = AあBいCうD...
str.trunc(14, "...")    = AあBいCうD...
str.trunc(15, "...")    = AあBいCうDえEお
str.trunc(16, "...")    = AあBいCうDえEお
str.trunc(12, "(続く)") = AあBい(続く)
str.trunc(13, "(続く)") = AあBいC(続く)
str.trunc(14, "(続く)") = AあBいC(続く)
str.trunc(15, "(続く)") = AあBいCうDえEお
str.trunc(16, "(続く)") = AあBいCうDえEお
```

---

Twitter でツイートする際の文字数計算等に利用できるでしょう。

以上。

