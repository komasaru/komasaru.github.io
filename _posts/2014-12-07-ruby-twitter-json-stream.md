---
layout   : single
title    : "Ruby - twitter-stream で Twitter Streaming API を利用！"
published: true
date     : 2014-12-07 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Twitter
---

以前、 Ruby + tweetstream で Twitter Streaming API を使用してツイートする方法についてに記録しました。

今回は、 Ruby + twitter-stream(json_stream) で同じことをしてみました。

以下、その記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit) での作業を想定。
* Ruby 2.1.5-p273 での作業を想定。
* OAuth 認証が必要なので、 Twitter の各種キー(ConsumerKey etc)が取得済みであること。
* 今回はテストのため、取得するのは Public streams - sample データ。

### 1. RubyGems ライブラリ twitter-stream のインストール

"twitter-stream" という RubyGems ライブラリが必要なので、インストールする。

``` text
$ sudo gem install twitter-stream
```

### 2. Ruby スクリプト作成

ドキュメントの Example を参考にして、以下のようにテスト用のスクリプトを作成。（但し、当ライブラリについて不勉強のため例外処理は未実装）  
（シェバングストリング等は適宜変更すること）

File: `json_stream.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#
# Ruby script to get tweet statuses by twitter-stream gem library.
#
require 'json'
require 'twitter/json_stream'

# Twitter OAuth keys
CONS_KEY = "<your_consumer_key>"
CONS_SEC = "<your_consumer_secret>"
ACCS_KEY = "<your_access_token_key>"
ACCS_SEC = "<your_access_token_secret>"

# EventMachine 実行
EventMachine::run do
  stream = Twitter::JSONStream.connect(
    host: "stream.twitter.com",
    path: "/1.1/statuses/sample.json",
    oauth: {
      consumer_key:    CONS_KEY,
      consumer_secret: CONS_SEC,
      access_key:      ACCS_KEY,
      access_secret:   ACCS_SEC
    },
    ssl: true
  )

  stream.each_item do |item|
    json = JSON.parse(item)
    #p json; exit  # <= JSON データの構造を知りたい場合はコメント解除

    # "user" 存在しなければ次へ、
    # 存在すれば "name", "screen_name", "text" を取得
    next unless user = json["user"]
    name, screen_name, text = user["name"], user["screen_name"], json["text"]

    # "lang" が "ja" でなければ次へ
    next unless user["lang"] == "ja"

    # コンソール出力
    puts "\n**** #{name} [ #{screen_name} ]"
    puts text
  end

  stream.on_error do |message|
    # No need to worry here. It might be an issue with Twitter.
    # Log message for future reference. JSONStream will try to reconnect after a timeout.
  end

  stream.on_max_reconnects do |timeout, retries|
    # Something is wrong on your side. Send yourself an email.
  end

  stream.on_no_data do
    # Twitter has stopped sending any data on the currently active
    # connection, reconnecting is probably in order
  end
end
{% endhighlight %}

* [Gist - Ruby script to get tweet statuses by twitter-stream gem library.](https://gist.github.com/komasaru/6e5a2dadb59808b1e96f "Gist - Ruby script to get tweet statuses by twitter-stream gem library.")

### 3. Ruby スクリプト実行

``` text
$ ./json_stream.rb

            :
===< 延々と出力される >===
            :

```

### 4.  tweetstream ライブラリとの違い

以前紹介した Ruby + tweetstream 「[Ruby - tweetstream で Twitter Streaming API を利用！]({{site.baseurl}}/2013/10/04/ruby-twitter-streaming-api-by-tweetstream/ "Ruby - tweetstream で Twitter Streaming API を利用！")」 と速度を比較してみたが、甲乙付け難い結果であった。

### 5. 参考サイト

* [twitter-stream - RubyGems.org - your community gem host](http://rubygems.org/gems/twitter-stream)

---

現在、当方は Ruby + tweetstream をよく利用していいますが、特に twitter-stream に変更する理由も見つからなかったので、当面は現状のままでよいと判断しました。

但し、別の方法を知っておくだけで有事の際には有益に感じることもあるでしょう。

以上。

