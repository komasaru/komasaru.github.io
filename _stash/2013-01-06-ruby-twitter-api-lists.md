---
layout   : single
title    : "Ruby - Twitter API でリスト取得！"
published: true
date     : 2013-01-06 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Twitter
---

Ruby で Twitter API を使用して、自分が作成したリストを取得する方法についてです。

当方は、以前から Ruby + Twitter API + MySQL でツイートやフォロー・フォロワー等を管理していますが、自分が作成したリストとフォローユーザとの連権はしていませんでした。  
しかし、この度、どのユーザをリストに追加したのかを把握するために、自分の作成したリストの一覧やリストに登録したユーザの一覧を管理するようにしました。

今回は、自分の作成したリストの一覧を取得する方法についてです。

<!--more-->

### 0. 前提条件

- Ruby 1.9.3-p327 で作成・動作確認。
- RubyGems twitter を導入済み。
- OAuth 認証のための Customer Key, Customer Secret, Access Token, Access Token Secret を取得済み。

OAuth 認証については、今回は説明しません。[当ブログ過去記事]({{site.baseurl}}/2011/07/17/17002038 "* Ruby - TwitterタイムラインをOAuth認証で取得！")やネット等でお調べください。

### 1. Ruby スクリプト作成

作成した Ruby スクリプトは以下の通り。  
このスクリプトでは、`screen_name` を指定して、そのユーザが作成したリストID・リスト名・モード(公開か非公開か)・作成日・登録ユーザ数を取得している。  
引数や取得できる項目等については [Twitter API のサイト](https://dev.twitter.com/docs/api/1.1 "REST API v1.1 Resources | Twitter Developers")等で確認できます。

File: `twitter_get_lists.rb`

{% highlight ruby linenos %}
# -*- coding: utf-8 -*-
require 'twitter'
require 'oauth'
require 'time'

# Twitter UserName
USER_NAME = "foo"
# Consumer key, Secretの設定
CONSUMER_KEY     = "XXXXXXXXXXXXXXXXXXXX"
CONSUMER_SECRET  = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
# Access Token Key, Secretの設定
ACCESS_TOKEN_KEY = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
ACCESS_SECRET    = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# メインクラス
class TwitterGetLists
  def initialize
    @count    = 0   # 件数カウント用
  end

  # リスト取得
  def get_list
    begin
      # OAuth 設定
      Twitter.configure do |config|
        config.consumer_key       = CONSUMER_KEY
        config.consumer_secret    = CONSUMER_SECRET
        config.oauth_token        = ACCESS_TOKEN_KEY
        config.oauth_token_secret = ACCESS_SECRET
      end

      # JSON データ取得
      client = Twitter::Client.new
      res = client.lists(:screen_name => USER_NAME)
      res.each do |list|
        list_id      = list[:id]
        list_name    = list[:name]
        mode         = list[:mode]
        created_at   = Time.parse(list[:created_at].to_s).strftime("%Y-%m-%d %H:%M:%S")
        member_count = list[:member_count]
        puts "[#{list_id}] #{list_name}, #{mode}, #{created_at}, #{member_count}"
        @count += 1
      end

      # 件数
      puts "COUNT : #{@count}"
    rescue => e
      str_msg = "[EXCEPTION][" + self.class.name + ".get_list] " + e.to_s
      STDERR.puts str_msg
      exit 1
    end
  end
end

################

####  MAIN  ####

################
begin
  puts "STARTED!!"
  puts "-" * 40

  # 処理クラスインスタンス化
  obj_main = TwitterGetLists.new

  # リスト取得
  obj_main.get_list

  puts "-" * 40
  puts "FINISHED!"
rescue => e
  str_msg = "[EXCEPTION]" + e.to_s
  STDERR.puts str_msg
  exit 1
end
{% endhighlight %}

- [gist - Ruby script to get twitter lists by Twitter API.](https://gist.github.com/4335177 "gist - Ruby script to get twitter lists by Twitter API.")

### 2. Ruby スクリプト実行

以下のようにして Ruby スクリプトを実行する。

``` bash 
$ ruby twitter_get_lists.rb
```

### 3. 参考サイト

- [REST API v1.1 Resources | Twitter Developers](https://dev.twitter.com/docs/api/1.1 "REST API v1.1 Resources | Twitter Developers")

---

これで、ツイッターのリストが取得できます。  
当方は、実際には、取得したデータをデータベース(MySQL)に保存したり（１日１回定時起動）して、別途作成した Rails アプリで閲覧・管理しています。

以上。

