---
layout   : single
title    : "Ruby - OAuth のみでツイート！"
published: true
date     : 2017-03-19 00:20:00 +0900
comments : true
categories:
- プログラミング
- SNS
tags:
- Ruby
- Twitter
---

Ruby を使って Twitter でツイートするのに "[twitter](https://rubygems.org/gems/twitter "twitter - RubyGems.org - your community gem host")" という RubyGems ライブラリを使用することが多いと思います。

今回は RubyGems ライブラリ "[twitter](https://rubygems.org/gems/twitter "twitter - RubyGems.org - your community gem host")" を使用せず、 RubyGems ライブラリ "[oauth](https://rubygems.org/gems/oauth "oauth - RubyGems.org - your community gem host")" のみを使用してツイートしてみました。

<!--more-->

### 0. 前提条件

* Ruby 2.3.3-p222 での作業を想定。
* 当然ながら、Consumer Key, Consumer Secret, Access Token, Access Token Secret を取得済みであること。

### 1. 必要な RubyGems ライブラリのインストール

oauth, json ライブラリが未インストールならインストールしておく。（json は、レスポンスを取得するのに必要）

``` text
$ sudo gem install oauth json
```

### 2. Ruby スクリプトの作成

以下は、ごく簡単な作成例。

Consumer Key オブジェクトを生成後、それを元に Access Token オブジェクトを生成し、エンドポイント(`statuses/update.json`)を指定してテキストをポストする、というイメージ。

File: `tweet_oauth.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#=ツイートテスト(OAuth ライブラリのみを使用)
#
# date          name            version
# 2017.01.16    mk-mode         1.00 新規作成
#
# Copyright(C) 2017 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : なし
#---------------------------------------------------------------------------------
#
require 'json'
require 'oauth'

class TweetOauth
  # Twitter keys
  CONS_KEY = "... Consumer Key        ..."
  CONS_SEC = "... Consumer Key Secret ..."
  ACCS_KEY = "... Access Token        ..."
  ACCS_SEC = "... Access Token Secret ..."
  SITE = "https://api.twitter.com/"
  URL  = "#{SITE}1.1/statuses/update.json"

  def initialize
    cons = OAuth::Consumer.new(CONS_KEY, CONS_SEC, site: SITE)
    @accs = OAuth::AccessToken.new(cons, ACCS_KEY, ACCS_SEC)
  end

  def exec
    puts text = "これはテストです！"
    res = @accs.post(URL, status: text)
    puts JSON.parse(res.body)
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}" }
    exit 1
  end
end

TweetOauth.new.exec if__FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to tweet with only OAuth.](https://gist.github.com/komasaru/bdd2cf8f43a52044c23029b584b44f45 "Gist - Ruby script to tweet with only OAuth.")

### 3. Ruby スクリプトの実行

``` text
$ ./tweet_oauth.rb
これはテストです！
{
  "created_at"=> 

  ===< 中略 >===

  "lang"=>"ja"
}
```

### 4. 参考サイト

* [oauth - RubyGems.org - your community gem host](https://rubygems.org/gems/oauth "oauth - RubyGems.org - your community gem host")
* [Application-only authentication - Twitter Developers](https://dev.twitter.com/oauth/application-only "Application-only authentication - Twitter Developers")

---

場合によっては、RubyGems ライブラリ twitter を使用するより扱いやすいかもしれませんね。

また、実際に使用してみると、RubyGems ライブラリ twitter を使用した時よりも若干高速なのが分かります。（当然でしょうが）

以上。

