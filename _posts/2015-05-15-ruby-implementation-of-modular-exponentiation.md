---
layout   : single
title    : "Ruby - べき剰余アルゴリズムの実装！"
published: true
date     : 2015-05-15 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- C言語
---
こんにちは。

前回 C++ で「べき剰余」のアルゴリズムを実装しました。

* [C++ - べき剰余アルゴリズムの実装！]({{site.baseurl}}/2015/05/13/cpp-implementation-of-modular-exponentiation "C++ - べき剰余アルゴリズムの実装！")

今回は Ruby で実装してみました。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* Ruby 2.2.2-p95 での作業を想定。

### 1. べき剰余、べき剰余演算アルゴリズムについて

前回の記事を参照。

* [C++ - べき剰余アルゴリズムの実装！]({{site.baseurl}}/2015/05/13/cpp-implementation-of-modular-exponentiation "C++ - べき剰余アルゴリズムの実装！")

### 2. Ruby スクリプトの作成

まず、非再帰的な記述方法で作成。  

File: `modular_exponentiation_1.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
#*************************************
# Modular Exponentiation (iterative). 
#*************************************
class ModularExponentiation
  def comp_mod_exp(b, e, m)
    ans = 1
    while e > 0
      ans = (ans * b) % m if (e & 1) == 1
      e >>= 1
      b = (b * b) % m
    end
    return ans
  rescue => e
    raise
  end
end

exit unless __FILE__ == $0

begin
  # me = b^e mod m
  b, e, m = 12345, 6789, 4567
  obj = ModularExponentiation.new
  me = obj.comp_mod_exp(b, e, m)
  puts "#{b}^#{e} mod #{m} = #{me}"
rescue => e
  puts "[#{e.class}] #{e.message}"
  e.backtrace.each{ |bt| puts "\t#{bt}" }
  exit 1
end
{% endhighlight %}

* [Gist - Ruby script to compute modular-exponentiation iteratively.](https://gist.github.com/komasaru/bcbd785acda1bc2abb69 "Gist - Ruby script to compute modular-exponentiation iteratively.")

次に、再帰的な記述方法で作成。(`comp_mod_exp` メソッドの内容が異なるだけ）

File: `modular_exponentiation_2.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
#*************************************
# Modular Exponentiation (recursive). 
#*************************************
class ModularExponentiation
  def comp_mod_exp(b, e, m)
    return 1 if e == 0
    ans = comp_mod_exp(b, e / 2, m)
    ans = (ans * ans) % m
    ans = (ans * b) % m if e % 2 == 1
    return ans
  rescue => e
    raise
  end
end

exit unless __FILE__ == $0

begin
  # me = b^e mod m
  b, e, m = 12345, 6789, 4567
  obj = ModularExponentiation.new
  me = obj.comp_mod_exp(b, e, m)
  puts "#{b}^#{e} mod #{m} = #{me}"
rescue => e
  puts "[#{e.class}] #{e.message}"
  e.backtrace.each{ |bt| puts "\t#{bt}" }
  exit 1
end
{% endhighlight %}

* [Gist - Ruby script to compute modular-exponentiation recursively.](https://gist.github.com/komasaru/3b68332a54f297a66016 "Gist - Ruby script to compute modular-exponentiation recursively.")

### 3. 動作確認

``` text
$ ./modular_exponentiation_1
12345^6789 mod 4567 = 62

$ ./modular_exponentiation_2
12345^6789 mod 4567 = 62
```

### 6. 参考サイト

* [冪剰余 - Wikipedia](http://ja.wikipedia.org/wiki/%E5%86%AA%E5%89%B0%E4%BD%99 "冪剰余 - Wikipedia")

---

Ruby で「べき剰余」を計算する際に役立ちます。（実際、個人的にべき剰余の計算が必要な局面があるので）

以上。

