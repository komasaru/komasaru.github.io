---
layout   : single
title    : "Ruby - Tumblr でテキスト投稿！"
published: true
date     : 2017-02-27 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Tumblr
---

Ruby で [Tumblr](https://www.tumblr.com/ "Tumblr") へテキスト投稿する方法についての記録です。

<!--more-->

### 0. 前提条件

* 今回の記事では LMDE2(Linux Mint Debian Edition 2), Ruby 2.3.3-p222 での作業を想定。
* [Tumblr API](https://www.tumblr.com/docs/en/api/v2 "API - Tumblr") の Consumer Key, Consumer Secret が取得済みであること。（過去参照： [Tumblr API - Consumer Key, Secret Key の取得！]({{site.baseurl}}/2017/02/15/tumblr-getting-consumer-secret-key/ "Tumblr API - Consumer Key, Secret Key の取得！ - mk-mode BLOG")）
* [Tumblr API](https://www.tumblr.com/docs/en/api/v2 "API - Tumblr") の Access Token, Access Token Secret が取得済みであること。（過去参照： [Ruby - Tumblr のアクセストークンを取得！]({{site.baseurl}}/2017/02/19/ruby-getting-tumblr-access-token/ "Ruby - Tumblr のアクセストークンを取得！ - mk-mode BLOG")）
* Tumblr への投稿には RubyGems ライブラリ [tumblr-client](https://rubygems.org/gems/tumblr_client "tumblr_client - RubyGems.org") を使用する。

### 1. RubyGems ライブラリ tumblr_client のインストール

RubyGems ライブラリ [tumblr-client](https://rubygems.org/gems/tumblr_client "tumblr_client - RubyGems.org") が未インストールなら、インストールしておく。

``` text
$ sudo gem install tumblr_client
```

### 2. Ruby スクリプトの作成

以下のように作成した。

単純に各種キーを設定後、インスタンス化して実行するだけである。  
（コマンドラインの第1引数にタイトル、第2引数に投稿する内容を指定して実行すると、投稿できる。投稿内容の改行は `\n` を指定する）

File: `tumblr_text.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#=タイトル、内容を引数で与えて Tumblr にテキスト投稿する
#
# date          name            version
# 2017.01.03    mk-mode         1.00 新規作成
#
# Copyright(C) 2017 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : 第１ - タイトル
#        第２ - 内容
#        ( 半角スペースが存在する場合は "" で括る。改行は \n を使用する )
#---------------------------------------------------------------------------------
#
require 'tumblr_client'

class TumblrText
  # Tumblr API Keys
  CONS_KEY = "<Consumer Key>"
  CONS_SEC = "<Consumer Secret>"
  ACCS_KEY = "<Access Token>"
  ACCS_SEC = "<Access Token Secret>"
  SITE = "<your_site>.tumblr.com"

  def initialize(args)
    @title, @body = args[0], args[1].gsub(/\\n/, "\n")
    Tumblr.configure do |config|
      config.consumer_key       = CONS_KEY
      config.consumer_secret    = CONS_SEC
      config.oauth_token        = ACCS_KEY
      config.oauth_token_secret = ACCS_SEC
    end
    @client = Tumblr::Client.new
  end

  def exec
    @client.text(SITE, {title: @title, body: @body})
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}" }
    exit 1
  end
end

if __FILE__ == $0
  exit if ARGV.size < 2
  TumblrText.new(ARGV).exec
end
{% endhighlight %}

* [Gist - Ruby script to post texts to Tumblr.](https://gist.github.com/komasaru/1bc44fccd951ea5fa6457f48ea061c4d "Gist - Ruby script to post texts to Tumblr.")

### 3. Ruby スクリプトの実行

第1引数にタイトル、第2引数に投稿内容を指定して実行する。

``` text
$ ./tumblr_text.rb TEST "これはテストです。\n（管理者）"
```

### 4. 確認

Tumblr サイトにアクセスし、投稿できていることを確認する。

### 参考サイト

* [tumblr-client](https://rubygems.org/gems/tumblr_client "tumblr_client - RubyGems.org")

---

今回はテキスト投稿のみでしたが、画像投稿をしたり、投稿した一覧を取得したりも容易にできます。

以上。

