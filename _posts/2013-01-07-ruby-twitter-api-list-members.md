---
layout   : single
title    : "Ruby - Twitter API でリスト登録済みユーザ取得！"
published: true
date     : 2013-01-07 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Twitter
---

昨日は、Ruby で Twitter API を使用して自分が作成したリストの取得する方法について紹介しました。

- [Ruby - Twitter API でリスト取得！]({{site.baseurl}}/2013/01/06/ruby-twitter-api-lists "Ruby - Twitter API でリスト取得！")

今日は、Ruby + Twitter API で指定のリストに登録されているユーザの一覧を取得する方法についてです。

<!--more-->

### 0. 前提条件

- Ruby 1.9.3-p327 で作成・動作確認。
- RubyGems twitter を導入済み。
- OAuth 認証のための Customer Key, Customer Secret, Access Token, Access Token Secret を取得済み。

OAuth 認証については、今回は説明しません。[当ブログ過去記事]({{site.baseurl}}/2011/07/17/17002038 "* Ruby - TwitterタイムラインをOAuth認証で取得！")やネット等でお調べください。

### 1. Ruby スクリプト作成

作成した Ruby スクリプトは以下の通り。  
このスクリプトでは、`list_id` を指定して、そのリストに登録済みのユーザのユーザIDを取得している。  
引数や取得できる項目等については [Twitter API のサイト](https://dev.twitter.com/docs/api/1.1 "REST API v1.1 Resources | Twitter Developers")等で確認できます。

File: `twitter_get_list_members.rb`

{% highlight ruby linenos %}
# -*- coding: utf-8 -*-
require 'twitter'
require 'oauth'
require 'time'

# Twitter UserName
USER_NAME = "foo"
# Consumer key, Secret の設定
CONSUMER_KEY     = "XXXXXXXXXXXXXXXXXXXX"
CONSUMER_SECRET  = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
# Access Token Key, Secret の設定
ACCESS_TOKEN_KEY = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
ACCESS_SECRET    = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# メインクラス
class TwitterGetListMembers
  def initialize
    @ary_lists = [111111, 222222, 333333]  # 調べたいリストのID
    @count = 0                             # 件数カウント用
  end

  # ユーザ取得
  def get_members
    begin
      # Twitter.configure 設定
      Twitter.configure do |config|
        config.consumer_key       = CONSUMER_KEY
        config.consumer_secret    = CONSUMER_SECRET
        config.oauth_token        = ACCESS_TOKEN_KEY
        config.oauth_token_secret = ACCESS_SECRET
      end

      client = Twitter::Client.new
      @ary_lists.each do |list_id|
        res = client.list_members(:list_id => list_id)
        res.each do |member|
          user_id = member[:id]
          puts "[#{list_id}] #{user_id}"
        end
      end
    rescue => e
      str_msg = "[EXCEPTION][" + self.class.name + ".get_members] " + e.to_s
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
  obj_main = TwitterGetListMembers.new

  # 登録ユーザ取得
  obj_main.get_members

  puts "-" * 40
  puts "FINISHED!"
rescue => e
  str_msg = "[EXCEPTION]" + e.to_s
  STDERR.puts str_msg
  exit 1
end
{% endhighlight %}

- [gist - Ruby script to get members of lists by Twitter API.](https://gist.github.com/4335340 "Ruby script to get members of lists by Twitter API.")

### 2. Ruby スクリプト実行

以下のようにして Ruby スクリプトを実行する。

``` bash 
$ ruby twitter_get_list_members.rb
```

### 3. 参考サイト

- [REST API v1.1 Resources | Twitter Developers](https://dev.twitter.com/docs/api/1.1 "REST API v1.1 Resources | Twitter Developers")

---

これで、リストに登録済みのユーザ一覧が取得できました。  
当方は、実際には、取得したデータをデータベース(MySQL)に保存したり（１日１回定時起動）して、別途作成した Rails アプリで閲覧・管理しています。

ちなみに、自分以外のユーザのリストIDを指定してユーザ一覧が取得できるかどうか、非公開のリストは取得できるのか、等は確認していません。

以上。

