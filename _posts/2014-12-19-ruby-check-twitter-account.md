---
layout   : single
title    : "Ruby - Twitter アカウント(Screen Name)登録済みチェック！"
published: true
date     : 2014-12-19 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Twitter
---

Twitter アカウントの Screen Name (@xxxx の部分) が登録済みか否かをチェックするための Ruby スクリプトです。

１個や数個程度なら Web ブラウザで `https://twitter.com/xxxxxxxx` のように URL を指定してチェックすればよいのですが、一度に大量にチェックしたいケースがあったために Ruby スクリプトを作成した次第です。

以下、その記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit) での作業を想定。
* Ruby 2.1.5-p273 での作業を想定。
* 単純に HTTP ステータスが `HTTPSuccess` になるかどうかをチェックしているだけ。

### 1. Ruby スクリプトの作成

以下のような Ruby スクリプトを作成した。

File: `check_twitter_accounts.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#= Twitter アカウント登録済みチェック
#
# date          name            version
# 2014.12.07    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2014 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : なし
#---------------------------------------------------------------------------------
#++
require 'net/http'

class CheckTwitterAccount
  URL = "https://twitter.com/"
  ACCOUNTS = [
    "hogehoge",
    "fugafuga",
    "zxc123vbn456m"
  ]

  # Main process
  def exec
    begin
      ACCOUNTS.each do |ac|
        res = url_request("#{URL}#{ac}")
        puts res ? "  * #{ac}" : "  - #{ac}"
      end
    rescue => e
      STDERR.puts "[#{e.class}] #{e.message}"
      e.backtrace.each{|trace| STDERR.puts "\t#{trace}"}
      exit 1
    end
  end

private

  # Check URL request recursively
  #   @param  url[String]
  #   @param  limit[Integer]
  #   @return [Boolean]
  def url_request(url, limit = 5)
    return false if limit == 0

    begin
      res = Net::HTTP.get_response(URI.parse(url))
    rescue
      return false
    else
      case res
      when Net::HTTPSuccess
        return true
      when Net::HTTPRedirection
        url_request(res['location'], limit - 1)
      else
        return false
      end
    end
  end
end

CheckTwitterAccount.new.exec
{% endhighlight %}

* [Gist - Ruby script to check existance of twitter accounts.](https://gist.github.com/komasaru/0ccca36036920eecb555 "Gist - Ruby script to check existance of twitter accounts.")

### 2. Ruby スクリプト実行

実行してみる。  
Twitter アカウントが登録済み（URL が存在）の場合は 行頭に `*` を、未登録（URL が未存在）の場合は行頭に `-` を出力するようにしている。

``` text
$ ./check_twitter_account.rb
  * hogehoge
  * fugafuga
  - zxc123vbn456m
```

### 3. その他

Ruby スクリプトを見ても分かるとおり、HTTP ステータスをチェックしているだけである。  
よって、 Twitter アカウントの存在チェックのみならず、単純に URL 存在チェックのにも流用可能である。

---

当方、Twitter Bot をシリーズ化して運用しています。  
しかし、自分が決めた命名規則で新規にアカウントを登録しようとした際に登録済みであることが稀にあるため、今回のようなチェックスクリプトを作成した次第です。

以上。

