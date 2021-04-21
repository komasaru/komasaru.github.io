---
layout   : single
title    : "Ruby - Twitter API で画像添付ツイート！"
published: true
date     : 2013-03-30 00:20:00 +0900
comments : true
categories:
- SNS
- プログラミング
tags:
- Ruby
- Twitter
---

Ruby で Twitter API を使用して、画像を添付したツイートを行う方法についてです。

普段使用している Ruby スクリプトから抜粋した形です。

<!--more-->

### 0. 前提条件

- Ruby 2.0.0-p0 で作成・動作確認。
- RubyGems twitter, oauth を導入済み。
- OAuth 認証のための Customer Key, Customer Secret, Access Token, Access Token Secret を取得済み。

OAuth 認証については、今回は説明しません。[当ブログ過去記事]({{site.baseurl}}/2011/07/17/17002038 "* Ruby - TwitterタイムラインをOAuth認証で取得！")やネット等でお調べください。

### 1. Ruby スクリプト作成

作成した Ruby スクリプトは以下の通り。  
OAuth 認証の設定をして画像ファイルを指定してツイートするだけ。  
当然、ツイート文＋画像ファイルのURLを合わせた文字数が140字を超えると例外が発生する。

``` ruby 
require 'twitter'
require 'oauth'

# Consumer key, Secretの設定
CONSUMER_KEY     = "XXXXXXXXXXXXXXXXXXXX"
CONSUMER_SECRET  = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
# Access Token Key, Secretの設定
ACCESS_TOKEN_KEY = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
ACCESS_SECRET    = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

begin
  # Twitter.configure 設定
  Twitter.configure do |config|
    config.consumer_key       = CONSUMER_KEY
    config.consumer_secret    = CONSUMER_SECRET
    config.oauth_token        = ACCESS_TOKEN_KEY
    config.oauth_token_secret = ACCESS_SECRET
  end

  # Twitter クラスインスタンス化
  client = Twitter::Client.new

  # ツイート文設定
  str_out = "＜ここにツイートする文章を設定＞"

  # ツイート
  #client.update(str_out)  # <= 画像添付が無い場合
  open("/path/to/image_file") do |img|
    client.update_with_media(str_out, img)
  end                      # <= 画像添付が有る場合
rescue => e
  STDERR.puts "[EXCEPTION] " + e.to_s
  exit 1
end
```

- [gist - Ruby script to tweet with image files.](https://gist.github.com/komasaru/5185245 "gist - Ruby script to tweet with image files.")

### 2. 参考サイト

- [REST API v1.1 Resources - Twitter Developers](https://dev.twitter.com/docs/api/1.1 "REST API v1.1 Resources - Twitter Developers")

---

このスクリプトを定時起動するなりすれば、自動ツイート Bot になります。  
ちなみに、当方は CentOS サーバで cron 起動しています。（画像添付はしていませんが）

以上。

