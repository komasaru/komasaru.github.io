---
layout   : single
title    : "Ruby - Twitter Gem 不具合！"
published: true
date     : 2013-12-02 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Twitter
---

Ruby で Twitter API を使用するのに "Twitter" という RubyGems ライブラリを使用していましたが、アップデートしたら使用できなくなりました。

ライブラリの README にも記載がありますが、以下にその原因と対策について記録しておきます。

<!--more-->

#### 0. 前提条件

- Ruby 2.0.0-p353 での作業を想定。
- RubyGems ライブラリ Twitter のバージョン 4.6.2 では正常に動作する。
- RubyGems ライブラリ Twitter のバージョン 5.0.0 以上（？）ではエラーが発生する。

### 1. 現象

Ruby で Twitter Gem(5.0.0) を `require` してツイートしようとする以下のようなエラーが出力される。

``` text 
undefined method `configure' for Twitter:Module
```

### 2. 原因

新しいバージョンの Gem では、`configure` の使用方法が異なるためのようだ。

### 3. 対策

今まで、`configure` してインスタンス化する部分は以下のようにしていたが、

``` ruby 
Twitter.configure do |config|
  config.consumer_key       = CONSUMER_KEY
  config.consumer_secret    = CONSUMER_SECRET
  config.oauth_token        = ACCESS_TOKEN_KEY
  config.oauth_token_secret = ACCESS_SECRET
end

client = Twitter::Client.new
```

新しいバージョンでは、以下のようにするらしい

``` ruby 
client = Twitter::REST::Client.new do |config|
  config.consumer_key       = CONSUMER_KEY
  config.consumer_secret    = CONSUMER_SECRET
  config.oauth_token        = ACCESS_TOKEN_KEY
  config.oauth_token_secret = ACCESS_SECRET
end
```

---

ライブラリの README に記載されていました。

同じ RubyGems ライブラリでも、メジャーバージョンアップ時には仕様が変わることがあるので要注意ですね。

以上。

