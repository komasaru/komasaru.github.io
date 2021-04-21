---
layout   : single
title    : "Ruby - tweetstream で Twitter Streaming API を利用！"
published: true
date     : 2013-10-04 00:20:00 +0900
comments : true
categories:
- プログラミング
- SNS
tags:
- Ruby
- Twitter
---

過去には、Twitter REST API で自分のアカウントに関する様々情報を取得したり、ツイートするボットを作成したりして来ました。  
実際、今でも Ruby 製ボットが快調に動作しています。

今回は、REST API ではなく、Streaming API を Ruby で利用してみました。  
制限を気にすることなく、どんどんツイートを取得できるのに魅力を感じたからです。

以下、準備とコーディング例の紹介です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Ruby 2.0.0-p247 での作業を想定。
- Git でダウンロードしてパッチを当てるので、git がインストール済みであること。
- Twitter Streaming API には、本来 Public streams, User streams, Sites streams があるということを認識しておく。
  （今回は、それらのうち Public streams の機能を tweetstream で扱う）
- Twitter Streaming API そのものについては、ここでは説明しない。

#### 1. tweetstream インストール

RubyGems ライブラリ tweetstream をインストールする。

``` bash 
$ sudo gem install tweetstream
```

#### 2. tweetstream にパッチを当てる

tweetstream はインストールしただけでは、Ruby 2.0 で使用できないようなので、 em-twitter に「[Fix for Ruby 2.0 tweetstream issue](https://gist.github.com/jfrazee/5400423 "Fix for Ruby 2.0 tweetstream issue")」のパッチを当てる。（[こちら](https://github.com/tweetstream/tweetstream/issues/117 "Ruby 2.0.0 support · Issue #117 · tweetstream/tweetstream")には、2.0.0-p195 では動作するような記述があるが、今回の当方の環境 2.0.0-p247 では動作しなかったのでパッチを適用した）

``` bash 
$ cd /usr/local/lib/ruby/gems/2.0.0/gems/em-twitter-0.2.2/lib/em-twitter
$ sudo git clone https://gist.github.com/5400423.git
$ sudo mv 5400423/em-twitter-connection.diff ./
$ sudo patch < em-twitter-connection.diff
$ sudo rm -rf 5400423/ em-twitter-connection.diff
```

もしも、`sudo git clone https:// ...` で以下のエラーとなる場合は、`sudo git clone git:// ...` とすると良いかもしれない。

``` bash 
error: RPC failed; result=22, HTTP code = 400
```

#### 3. Ruby スクリプト作成

"[tweetstream/tweetstream](https://github.com/tweetstream/tweetstream "tweetstream/tweetstream")" の説明を参考に、Ruby スクリプトを作成してみる。

File: `test_tweetstream.rb`

{% highlight ruby linenos %}
require 'tweetstream'

# Consumer key, Secretの設定
CONSUMER_KEY     = "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CONSUMER_SECRET  = "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# Access Token Key, Secretの設定
ACCESS_TOKEN_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
ACCESS_SECRET    = "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

TweetStream.configure do |config|
  config.consumer_key       = CONSUMER_KEY
  config.consumer_secret    = CONSUMER_SECRET
  config.oauth_token        = ACCESS_TOKEN_KEY
  config.oauth_token_secret = ACCESS_SECRET
  config.auth_method        = :oauth
end

TweetStream::Client.new.sample do |status|
  puts "#{status.user.screen_name}: #{status.text}"
end
{% endhighlight %}

- [Gist - Ruby script testing to get tweets by tweetstream.](https://gist.github.com/komasaru/6568377 "Gist - Ruby script testing to get tweets by tweetstream.")

`sample` は世界中のランダムに抽出したツイートが取得される。（約１％？）  
Twitter Streaming API の Public streams の [GET statuses/sample - Twitter Developers](https://dev.twitter.com/docs/api/1.1/get/statuses/sample "GET statuses/sample - Twitter Developers") に当たるもの。

#### 4. Ruby スクリプト実行

作成した Ruby スクリプトを実行してみる。  
永遠にツイートが表示されるので、終了するには `CTRL` + `C` を押下する。

``` bash 
$ ruby tweet_stream.rb

                     :
====< 永遠に世界中のツイートが表示される >====
                     :

```

#### 5. その他の例

上記の例では、 `sample` で世界中のツイート（ランダムに抽出）が表示された。  
さらに、言語設定が「日本語」で、リツイート以外のツイートを抽出するには以下のようにする。

``` ruby 
TweetStream::Client.new.sample do |status|
  if status.user.lang == "ja" && !status.text.index("RT")
    puts "#{status.user.screen_name}: #{status.text}"
  end
end
```

`sample` ではなく、キーワードで抽出するには以下のようにする。  
Twitter Streaming API の Public streams の [POST statuses/filter - Twitter Developers](https://dev.twitter.com/docs/api/1.1/post/statuses/filter "POST statuses/filter - Twitter Developers")  のパラメータ `track` に当たるもの。  
以下は、"tokyo" または "FM" という単語を含むツイートから、言語設定が「日本語」でリツイート以外のツイートを取得する例。

``` ruby 
TweetStream::Client.new.track('tokyo', 'FM') do |status|
  if status.user.lang == "ja" && !status.text.index("RT")
    puts "#{status.user.screen_name}: #{status.text}"
  end
end
```

特定のアカウントのツイート、ツイート文内に特定のアカウントを含むツイートを取得するには以下のようにする。  
Twitter Streaming API の Public streams の [POST statuses/filter - Twitter Developers](https://dev.twitter.com/docs/api/1.1/post/statuses/filter "POST statuses/filter - Twitter Developers")  のパラメータ `follow` に当たるもの。

``` ruby 
TweetStream::Client.new.follow(783214, 7080152) do |status|
  puts "#{status.user.screen_name}: #{status.text}"
end
```

自分のタイムライン（フォローしているアカウント）を取得するには以下のようにする。  
Twitter Streaming API の User streams の [User streams - Twitter Developers](https://dev.twitter.com/docs/streaming-apis/streams/user "User streams - Twitter Developers")  に当たるもの。

``` ruby 
TweetStream::Client.new.userstream do |status|
  puts "#{status.user.screen_name}: #{status.text}"
end
```

表示され続けないようにある件数表示さたら終了するようにするには、以下のようにする。  
以下は、10件表示したら終了する例。

``` ruby 
@statuses = []
TweetStream::Client.new.sample do |status, client|
  puts "#{status.user.screen_name}: #{status.text}"
  @statuses << status
  client.stop if @statuses.size >= 10
end
```

#### 6. 注意

Twitter API は １アカウント当たり１つしか接続できないようだ。  
Streaming API の Public streams で接続中に REST API や別の Public streams で接続すると古い方の接続が切断される。tweetstream の `on_reconnect` を利用したり、 `TweetStream::ReconnectError` の例外を捕獲するなど、個別に対策する必要あある。  
ちなみに、Streaming API の User streams で接続した場合は、別の接続と衝突しても切断されないようだ。（別の接続数が多すぎるとどうなるかは未確認。「[The Streaming APIs - Twitter Developers](https://dev.twitter.com/docs/streaming-apis "The Streaming APIs - Twitter Developers")」中の、Public streams, User streams の接続についての記述を確認すること）

#### 参考サイト

- [The Streaming APIs - Twitter Developers](https://dev.twitter.com/docs/streaming-apis "The Streaming APIs - Twitter Developers")
- [tweetstream - RubyGems.org - your community gem host](http://rubygems.org/gems/tweetstream "tweetstream - RubyGems.org - your community gem host")
- [tweetstream/tweetstream](https://github.com/tweetstream/tweetstream "tweetstream/tweetstream")
- [Ruby 2.0.0 support · Issue #117 · tweetstream/tweetstream](https://github.com/tweetstream/tweetstream/issues/117 "Ruby 2.0.0 support · Issue #117 · tweetstream/tweetstream")
- [Fix for Ruby 2.0 tweetstream issue](https://gist.github.com/jfrazee/5400423 "Fix for Ruby 2.0 tweetstream issue")

---

今回の例では、常にアクセスしているのでマシンやネットワークへの負担が気になりますが、改良すれば便利なツールになるでしょう。

以上。

