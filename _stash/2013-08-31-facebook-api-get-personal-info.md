---
layout   : single
title    : "Ruby - Facebook API でアカウント情報取得！"
published: true
date     : 2013-08-31 00:20:00 +0900
comments : true
categories:
- SNS
tags:
- Facebook
- Ruby
---

Ruby + Facebook API で自分のアカウントの情報を取得する方法についてです。

ただし、Facebook API 用の RubyGems ライブラリは使用しません。  
忠実に、HTTP リクエストを投げて、戻ってきた JSON 形式のデータを取得する方法です。

<!--more-->

#### 0. 前提条件

* Ruby 2.0.0-p247 で作成・動作確認。
* 当然 Facebook アカウント取得済み。
* 当然 Facebook アプリ作成済み。
* アクセストークンには複数種類があることを認識している。（「[Facebook API - アクセストークン！]({{site.baseurl}}/2013/08/29/facebook-api-access-token "Facebook API - アクセストークン！")」も参照）
* **Facebook API は非常に頻繁に仕様変更があるため、当記事の内容が通用しなくなる可能性は非常に大きい。**

#### 1. Ruby スクリプト作成

以下のような Ruby スクリプトを作成する。  
実際に使用する場合は、定数に値を設定する。  
また、以下は取得したデータを一括で出力しているが、JSON 形式データなので当然個別に指定して取得することも可能。  
もちろん、URL を指定する時点で取得する項目を指定することも可能。（クエリストリングに `fields=id,name` 等を付与することで）  
（ちなみに、App Access Token では自アカウントに "me" は指定できないようだ）

File: `fb_api.rb`

{% highlight ruby linenos %}
require 'json'
require 'net/https'

# 各種定数
URL_BASE   = "https://graph.facebook.com/{自分のユーザID or ユーザ名}"
APP_ID     = "{Facebook アプリの APP-ID}"
APP_SECRET = "{Facebook アプリの APP-SECRET}"

# [CLASS] Facebook API
class FbApi
  def initialize
    # App Access Token 取得
    @token = get_token
  end

  # Facebook 情報取得
  def get_info
    begin
      uri = URI.parse(URL_BASE)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      res = http.request(Net::HTTP::Get.new("#{uri.request_uri}?access_token=#{@token}"))
      contents = JSON.parse(res.body)
      puts JSON.pretty_generate(contents)
      # 個別に取得するなら以下のように。
      #puts contents["location"]["id"]
      #puts contents["location"]["name"]
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.get_info] #{e}"
      exit 1
    end
  end

private

  # App Access Token 取得
  # ( ここでのアクセストークンは、
  #   User に紐付いている User Access Token ではない。
  #   Facebook アプリに紐付いていている App Access Token のこと。 )
  def get_token
    begin
      uri = URI.parse("https://graph.facebook.com/oauth/access_token")
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      res = http.request(Net::HTTP::Get.new("#{uri.request_uri}?client_id=#{APP_ID}&client_secret=#{APP_SECRET}&grant_type=client_credentials"))
      return res.body.split("=")[1]
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.get_token] #{e}"
      exit 1
    end
  end
end

# 開始メッセージ
puts "#### Get Facebook information [ START ]"

# Facebook 情報取得
obj_main = FbApi.new
obj_main.get_info

# 終了メッセージ
puts "#### Get Facebook information [ E N D ]"
{% endhighlight %}

- [Gist - Ruby script to get Facebook user informations by Facebook API.](https://gist.github.com/komasaru/6259750 "Gist - Ruby script to get Facebook user informations by Facebook API.")

#### 2. Ruby スクリプト実行

作成した Ruby スクリプトを実行してみる。

``` bash 
$ ruby fb_api.rb

#### Get Facebook information [ START ]

{
  "id": "999999999999999",
  "name": "姓 名",
  "first_name": "名",
  "last_name": "姓",
  "link": "http://www.facebook.com/xxxxxxxxxxxxx",
  "username": "xxxxxxxxxxxxx",
  "location": {
    "id": "197013146978193",
    "name": "島根県松江市"
  },
  "quotes": "どんなに石下を固めても、高いところに上がらなければ水平線は見えません。\n高い塔（技術開発）を建ててみなければ、新たな水平線は見えてこないのです。",
  "sports": [
    {
      "id": "145721112161192",
      "name": "自転車競技"
    }
  ],
  "favorite_teams": [
    {
      "id": "129160933813749",
      "name": "島根スサノオマジック"
    },
    {
      "id": "209252052429922",
      "name": "チームがんばれ！ニッポン！(Japan Olympic Team)"
    }
  ],
  "favorite_athletes": [
    {
      "id": "126411047453055",
      "name": "宇佐美里香(Rika Usami)"
    },
    {
      "id": "199013876792444",
      "name": "隠岐の海 歩"
    },
    {
      "id": "331199495270",
      "name": "Kei Nishikori"
    }
  ],
  "gender": "male",
  "email": "masaru@mk-mode.com",
  "locale": "ja_JP",
  "languages": [
    {
      "id": "208998719126251",
      "name": "日本語"
    }
  ]
}

#### Get Facebook information [ E N D ]

```

正常に取得できている。

#### 参考サイト

プログラムを作成・実行する前に、どのようなリクエストでどのような値が取得できるかを以下のサイトで事前に確認できる。（ブラウザで確認するより断然確認しやすい）

- [Graph API Explorer- Facebook Developers](https://developers.facebook.com/tools/explorer "Graph API Explorer- Facebook Developers")

その他、ドキュメントは以下を参照。

- [Graph API - Facebook開発者](https://developers.facebook.com/docs/reference/api/ "Graph API - Facebook開発者")

---

今回はユーザ情報を取得したが、当然様々な情報が取得可能です。情報の取得どころか投稿等も可能です。

何か有用なアプリを作ってみたくなります。

以上。

