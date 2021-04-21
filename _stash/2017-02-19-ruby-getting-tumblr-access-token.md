---
layout   : single
title    : "Ruby - Tumblr のアクセストークンを取得！"
published: true
date     : 2017-02-19 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Tumblr
- OAuth
---

[Tumblr API](https://www.tumblr.com/docs/en/api/v2 "API - Tumblr") を使用するのに必要な Access Token, Access Token Secret を Ruby で取得する方法についての記録です。

ちなみに、前回は Consumer Key, Consumer Secret Key の取得についてでした。

* [Tumblr API - Consumer Key, Secret Key の取得！]({{site.baseurl}}/2017/02/15/tumblr-getting-consumer-secret-key/ "Tumblr API - Consumer Key, Secret Key の取得！ - mk-mode BLOG")

<!--more-->

### 0. 前提条件

* [Tumblr](https://www.tumblr.com/ "Tumblr") のアカウントが作成済みであること。  
  さらに、以下の作業を行う前にログイン済みであること。
* [Tumblr API](https://www.tumblr.com/docs/en/api/v2 "API - Tumblr") の Consumer Key, Consumer Secret が取得済みであること。（過去参照： [Tumblr API - Consumer Key, Secret Key の取得！]({{site.baseurl}}/2017/02/15/tumblr-getting-consumer-secret-key "Tumblr API - Consumer Key, Secret Key の取得！ - mk-mode BLOG")）
* Access Token, Access Token Secret を取得する方法は色々ありますが、今回は Ruby で OAuth ライブラリを使用して行う。
* LMDE2(Linux Mint Debian Edition 2), Ruby 2.3.3-p222 での作業を想定。

### 1. RubyGems ライブラリ OAuth のインストール

RubyGems ライブラリ OAuth が未インストールなら、インストールしておく。

``` text
$ sudo gem install oauth
```

### 2. Ruby スクリプトの作成

以下のように作成した。（説明はスクリプト内のコメントを参照）

File: `get_access_token_tumblr.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
# ***************************************
# Tumblr - Access Token, Secret 取得処理
# ***************************************
require 'oauth'

class TumblrAccessToken
  SITE_URL = "http://www.tumblr.com"

  def get_token
    # Consumer 情報入力
    print 'Please input CONSUMER KEY      : '
    cons_key = gets.chomp
    print 'Please input CONSUMER SECRET   : '
    cons_sec = gets.chomp

    # Oauth オブジェクト生成
    oauth = OAuth::Consumer.new(
      cons_key,
      cons_sec,
      site: SITE_URL
    )

    # リクエストトークン取得
    req_token = oauth.get_request_token(exclude_callback: true)

    # OAuth Verifier 取得
    puts  "Please access this URL         : #{req_token.authorize_url}"

    # callback 先の URL にある oauth_verifier= のランダムな文字列を貼り付け
    print "Please paste the oauth_verifier: "
    verifier = gets.chomp

    # アクセストークン取得
    access_token = req_token.get_access_token(
      oauth_verifier: verifier
    )

    # アクセストークン表示
    puts "---"
    puts "  ACCESS_TOKEN:        #{access_token.token}"
    puts "  ACCESS_TOKEN_SECRET: #{access_token.secret}"
  rescue => e
    puts "[#{e.class}] #{e.message}"
    exit 1
  end
end

TumblrAccessToken.new.get_token if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to get Tumblr access token from consumer key.](https://gist.github.com/komasaru/3e0daa529fe53d0db008c1d4cdbb0a5f "Gist - Ruby script to get Tumblr access token from consumer key.")

### 3. Ruby スクリプトの実行

``` text
$ ./get_access_token.rb
Please input CONSUMER KEY      : >> Consumer Key を貼り付ける <<
Please input CONSUMER SECRET   : >> Consumer Secret を貼り付ける <<
Please access this URL         : >> ここに表示される URL にブラウザでアクセスする <<
Please paste the oauth_verifier: >> 表示されたページの URL から oauth_verifier の値を貼り付ける <<
---
  ACCESS_TOKEN:        >> ここに Access Token が表示される <<
  ACCESS_TOKEN_SECRET: >> ここに Access Token Secret が表示される <<
```

### 4. 参考

参考までに、 Twitter API 用の Access Token, Access Token Secret の取得方法も同様にできる。

* [Ruby - Twitter アプリの登録済み Consumer Key から Access Token を取得！]({{site.baseurl}}/2014/03/17/ruby-get-twitter-access-token/ "Ruby - Twitter アプリの登録済み Consumer Key から Access Token を取得！")

---

これで [Tumblr API](https://www.tumblr.com/docs/en/api/v2 "API - Tumblr") を使用する準備が整いました。

以上。

