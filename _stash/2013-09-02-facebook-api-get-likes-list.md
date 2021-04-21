---
layout   : single
title    : "Ruby - Facebook API で「いいね」一覧取得！"
published: true
date     : 2013-09-02 00:20:00 +0900
comments : true
categories:
- SNS
tags:
- Facebook
- Ruby
---

Ruby + Facebook API で自分のアカウントの「いいね」している一覧を取得する方法についてです。

ただし、Facebook API 用の RubyGems ライブラリは使用しません。  
忠実に、HTTP リクエストを投げて戻ってきた JSON 形式のデータを取得する方法です。

<!--more-->

#### 0. 前提条件

* Ruby 2.0.0-p247 で作成・動作確認。
* 当然 Facebook アカウント取得済み。
* 当然 Facebook アプリ作成済み。
* アクセストークンには複数種類があることを認識している。（「[Facebook API - アクセストークン！]({{site.baseurl}}/2013/08/29/facebook-api-access-token "Facebook API - アクセストークン！")」も参照）
* Facebook アプリの詳細設定で、2013/10/02 からデフォルト設定になる "October 2013 Breaking Changes" を今から適用したいので、この設定を「有効」にする。（後述の参考サイトを参照）  
  （現在は、"USER_ID/likes" がデフォルトでは全件取得するが、2013/10/02 以降はデフォルトで25件取得しページング機能も有効になる。この機能を今から利用するということ）
* **Facebook API は非常に頻繁に仕様変更があるため、当記事の内容が通用しなくなる可能性は非常に大きい。**

#### 1. Ruby スクリプト作成

以下のような Ruby スクリプトを作成する。  
実際に使用する場合は、定数に値を設定する。

【2013.10.03 Facebook API の仕様変更に伴い、offset オプションを使用しないよう修正】

File: `fb_api_likes.rb`

{% highlight ruby linenos %}
require 'json'
require 'net/https'

# 各種定数
URL_BASE   = "https://graph.facebook.com/{ユーザID or ユーザ名}"
APP_ID     = "{Facebook アプリの APP-ID}"
APP_SECRET = "{Facebook アプリの APP-SECRET}"
LIMIT      =  25  # １回に取得する件数

# [CLASS] Facebook API
class FbApiLikes
  def initialize
    # App Access Token 取得
    @token = get_token
  end

  # Facebook 情報取得
  def get_info
    begin
      cnt_all =  0   # 総件数 初期化

      # データ取得
      json = fetch_data

      # データが存在しなければ終了
      return unless json["data"]
      cnt_all += json["data"].size

      # 取得データを画面表示 (名前、ID、日時(UTC))
      json["data"].each do |j|
        puts "* #{j["name"]}"
        puts "\t[ #{j["id"]}, #{j["created_time"]} ]"
      end

      # 次ページ URL 取得
      next_url = json["paging"]["next"]

      # 次ページが存在する限り LOOP
      while next_url
        # データ取得
        json = fetch_data(next_url)

        # データが存在しなければ終了
        cnt = json["data"].size
        cnt_all += cnt
        break if cnt == 0

        # 取得データを画面表示 (名前、ID、日時(UTC))
        json["data"].each do |j|
          puts "* #{j["name"]}"
          puts "\t[ #{j["id"]}, #{j["created_time"]} ]"
        end

        # 次ページ offset 取得
        next_url = json["paging"]["next"]
      end

      # 総件数表示
      puts "TOTAL: #{cnt_all} likes."
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
      res = http.request(Net::HTTP::Get.new(
        "#{uri.request_uri}?client_id=#{APP_ID}&client_secret=#{APP_SECRET}&grant_type=client_credentials"
      ))
      return res.body.split("=")[1]
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.get_token] #{e}"
      exit 1
    end
  end

  # 情報取得実体
  def fetch_data(url = "")
    begin
      uri = URI.parse(URL_BASE)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE

      if url == ""
        res = http.request(Net::HTTP::Get.new(
          "#{uri.request_uri}?access_token=#{@token}&limit=#{LIMIT}"
        ))
      else
        res = http.request(Net::HTTP::Get.new(url))
      end

      return JSON.parse(res.body)
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.fetch_data] #{e}"
      exit 1
    end
  end
end

# 開始メッセージ
puts "#### Get Facebook Likes [ START ]"

# Facebook 「いいね」情報取得
obj_main = FbApiLikes.new
obj_main.get_info

# 終了メッセージ
puts "#### Get Facebook Likes [ E N D ]"

{% endhighlight %}

- [Gist - Ruby script to get a list of Facebook likes by Facebook API.](https://gist.github.com/komasaru/6260203 "Gist - Ruby script to get a list of Facebook likes by Facebook API.")

#### 2. Ruby スクリプト実行

作成した Ruby スクリプトを実行してみる。

``` bash 
$ ruby fb_api_likes.rb

#### Get Facebook Likes [ START ]

* ご縁の国しまね
        [ 508692832535015, 2013-07-31T11:17:28+0000 ]
* NTTドコモ（NTT DOCOMO）
        [ 124946600918797, 2013-07-13T08:38:10+0000 ]
* 島根県雲南市役所
        [ 598070113565938, 2013-07-12T13:54:18+0000 ]
* とりりん～鳥取大学～
        [ 562343010455837, 2013-06-26T12:03:53+0000 ]
* 松江歴史館
        [ 271046983030508, 2013-06-26T12:00:59+0000 ]

===< 途中省略 >===

* Kei Nishikori
        [ 331199495270, 2012-03-26T02:22:34+0000 ]
* 島根スサノオマジック
        [ 129160933813749, 2012-03-18T03:04:04+0000 ]
* くらしまねっと
        [ 291578434230865, 2012-03-06T08:30:58+0000 ]
* Facebook navi （フェイスブックナビ）
        [ 211790478849971, 2011-12-07T08:20:48+0000 ]
* フェイスブック ジャパン
        [ 365989369023, 2011-12-07T08:20:47+0000 ]
TOTAL: 120 likes.

#### Get Facebook Likes [ E N D ]

```

正常に取得できている。

#### 参考サイト

プログラムを作成・実行する前に、どのようなリクエストでどのような値が取得できるかを以下のサイトで事前に確認できる。（ブラウザで確認するより断然確認しやすい）

- [Graph API Explorer- Facebook Developers](https://developers.facebook.com/tools/explorer "Graph API Explorer- Facebook Developers")

その他、ドキュメントは以下を参照。（ページング仕様も掲載されている）

- [Graph API - Facebook開発者](https://developers.facebook.com/docs/reference/api/ "Graph API - Facebook開発者")

2013/10/02 からの仕様変更については以下を参照。

- [Developer Roadmap - Facebook開発者](https://developers.facebook.com/roadmap/#q4_2013 "Developer Roadmap - Facebook開発者")

---

今回は「いいね」している一覧を取得したが、当然友達の一覧等様々な情報が取得できます。ドキュメントを参考にするとよい。

Facebook 公式では、各種情報を簡単に一覧で確認することが容易ではない場合が多いですが、Facebook API を使用して自分で使いやすようなアプリを作成すると良いかも知れません。

また、Facebook API 用の RubyGems ライブラリも各種存在するようですが、単純にデータを取得するだけならライブラリは必要ありません。（今のところ）

以上。

