---
layout   : single
title    : "Ruby - 素数判定！"
published: true
date     : 2014-12-31 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

過去にも「素数判定」に関する記事を公開しましたが、再考してみました。

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit) での作業を想定。
* Ruby 2.1.5-p273 での作業を想定。

### 1. Ruby スクリプト作成

#### 1-1. 引数で与えた数値が素数かどうかを判定

File: `prime_number_1.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
# --------------------------------------
#   Check a prime number
# --------------------------------------

def is_prime(n)
  res = (2..Math.sqrt(n)).any? { |i| n % i == 0 }
  puts "#{n}: #{res || n == 1 ? '-----' : 'PRIME'}"
end

is_prime(12345678923)
{% endhighlight %}

* [Gist - Ruby script to check a prime number.](https://gist.github.com/komasaru/07e03e00f52ac65e60ca "Gist - Ruby script to check a prime number.")

#### 1-2. 引数で与えた x 番目の素数を算出

（クラス化する程でもないけども、敢えてクラス化した）

File: `prime_number_2.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
# --------------------------------------
#   Calculate Xth prime number
# --------------------------------------

class PrimeNumber2
  def exec(no)
    n, i = 2, 0
    loop do
      i += 1 if is_prime(n)
      break if i == no
      n += 1
    end
    puts "#{i}th PRIME NUMBER: #{n}."
  end

private

  def is_prime(n)
    res = (2..Math.sqrt(n)).any? { |i| n % i == 0 }
    return res || n == 1 ? false : true
  end
end

PrimeNumber2.new.exec(100000) if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate Xth prime number.](https://gist.github.com/komasaru/8f3c93fe2823c32cbecc "Gist - Ruby script to calculate Xth prime number.")

#### 1-3. 引数で与えた数値までを一覧表示

（クラス化する程でもないけども、敢えてクラス化した）

File: `prime_number_list.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
# --------------------------------------
#   Prime numbers list
# --------------------------------------

class PrimeNumber
  def exec(nums)
    (1..nums).each do |n|
      puts "#{n}: #{is_prime(n) ? 'PRIME' : '----- '}"
    end
  end

private

  def is_prime(n)
    res = (2..Math.sqrt(n)).any? { |i| n % i == 0 }
    return res || n == 1 ? false : true
  end
end

PrimeNumber.new.exec(99) if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to list prime numbers.](https://gist.github.com/komasaru/49ca44157469ba528563 "Gist - Ruby script to list prime numbers.")

### 2. Ruby スクリプト実行

File: `引数で与えた数値が素数かどうかを判定`

{% highlight text linenos %}
$ ./prime_number_1.rb
12345678923: PRIME
{% endhighlight %}

File: `引数で与えた`

{% highlight text linenos %} x 番目の素数を算出
$ ./prime_number_2.rb
100000th PRIME NUMBER: 1299709.
{% endhighlight %}

File: `引数で与えた数値までを一覧表示`

{% highlight text linenos %}
$ ./prime_number_list.rb
1: -----
2: PRIME
3: PRIME
4: -----
5: PRIME

         :
====< 途中省略 >====
         :

95: -----
96: -----
97: PRIME
98: -----
99: -----
{% endhighlight %}

---

時に振り返って、過去に考えたロジックを考え直してみるのもいいでしょう。

また、 Array クラスの `any?` メソッドの便利さに気付いたので、再考してみて良かったと感じました。

以上。

