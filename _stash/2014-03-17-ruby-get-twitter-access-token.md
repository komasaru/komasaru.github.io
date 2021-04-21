---
layout   : single
title    : "Ruby - Twitter アプリの登録済み Consumer Key から Access Token を取得！"
published: true
date     : 2014-03-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- SNS
tags:
- Ruby
- Twitter
- OAuth
---

Twitter アプリを開発する際は Consumer Key, Consumer Secret, Access Token, Access Token Secret が必要です。

Twitter アプリを開発する都度開発者サイトで登録してもよいのですが、その頻度がそれほど頻繁でなくても結構面倒な作業です。  
（最近（当記事公開時点）では、アプリを新規に登録する際に携帯電話との関連付けも必須になったようなので余計に。。。）

そこで、当方は１組の登録済み Consumer Key, Consumer Secret から Access Token, Access Token Secret を取得する Ruby スクリプトを作成して使用しています。

Web サイトで検索すれば Ruby に限らず色々とヒットするとは思いますが、参考までに当方が使用している Ruby スクリプトを紹介します。

<!--more-->

### 0. 前提条件

- Linux Mint 13(64bit) での作業を想定。
- Ruby 2.1.1-p76 での作業を想定。
- OAuth という RubyGem パッケージが必要なので、未インストールなら `gem install oauth` でインストールしておく。

### 1. Ruby スクリプト

File: `twitter_access_token.rb`

{% highlight ruby linenos %}
# ***************************************
# Oauth - Access Token, Secret 取得処理
# ***************************************
require 'oauth'

class TwitterAccessToken
  SITE_URL = "https://twitter.com"

  def get_token
    # Consumer 情報入力
    print 'Please input CONSUMER KEY   : '
    consumer_key    = gets.chomp
    print 'Please input CONSUMER SECRET: '
    consumer_secret = gets.chomp

    # Oauth オブジェクト生成
    oauth = OAuth::Consumer.new(
      consumer_key,
      consumer_secret,
      site: SITE_URL
    )

    # リクエストトークン取得
    request_token = oauth.get_request_token

    # PIN コード取得
    puts  "Please access this URL      : #{request_token.authorize_url}"
    print "Please enter the PIN code   : "
    pin_code = gets.to_i

    # アクセストークン取得
    access_token = request_token.get_access_token(
      oauth_verifier: pin_code
    )

    # アクセストークン表示
    puts "---"
    puts "ACCESS TOKEN                : #{access_token.token}"
    puts "ACCESS TOKEN SECRET         : #{access_token.secret}"
  rescue => e
    puts "[#{e.class}] #{e.message}"
    exit 1
  end
end

TwitterAccessToken.new.get_token
{% endhighlight %}

- [Gist - Ruby script to get twitter access token from consumer key.](https://gist.github.com/komasaru/9461154 "Gist - Ruby script to get twitter access token from consumer key.")

### 2. 実行

1. コンソールで、作成した Ruby スクリプトを実行する。
2. Consumer Key と Cunsumer Secret が問われるので登録したいアプリのものを入力する。
3. 認証用ページの URL が出力される。
4. Web ブラウザで認証用ページへアクセスする。
5. 認証用ページで「認証」ボタンをクリックする。
6. PIN コードが表示されるので、控える。
7. コンソールに戻り、控えた PIN コードを入力する。
8. 取得した Access Token, Access Token Secret が表示される。

``` text
$ ruby twitter_access_token.rb
Please input CONSUMER KEY   : XXXXXXXXXXXXXXXXXXXX
Please input CONSUMER SECRET: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Please access this URL      : https://twitter.com/oauth/authorize?oauth_token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Please enter the PIN code   : 9999999
---
ACCESS TOKEN                : 999999999-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ACCESS TOKEN SECRET         : XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

これで、アプリ登録の手間がかなり楽になります。  
同じ仕組みを実装して Web アプリを作ってみてもよいでしょう。

以上。

