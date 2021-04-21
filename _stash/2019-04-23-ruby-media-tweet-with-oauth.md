---
layout   : single
title    : "Ruby - Twitter ツイートで画像添付（OAuth のみで）！"
published: true
date     : 2019-04-23 00:20:00 +0900
comments : true
categories:
- プログラミング
- SNS
tags:
- Ruby
- Twitter
- OAuth
---

以前、 Ruby で Twitter 用の Gem ライブラリを使用せず、 OAuth のみでツイートする方法を紹介しました。
* [Ruby - OAuth のみでツイート！]({{site.baseurl}}/2017/03/19/ruby-tweet-with-only-oauth-gem/ "Ruby - OAuth のみでツイート！")

但し、画像は添付できない仕様でした。

今回、画像も添付できるよう仕様を変更しました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.3 での作業を想定。
* 複数の Twitter アカウントを使い分けることを想定。
* Twitter API のキー(Consumber Key/Secret, Access Token/Secret)が取得済みであること。
* 画像ファイルはいくらでも指定できるようにしているが、 Twitter 側の仕様上、最大4つまでしか添付できない。

### 1. ライブラリのインストール

OAuth, YAML を使用するので、対応の RubyGems ライブラリをインストールしておく。

``` text
$ sudo gem install oauth
$ sudo gem install yaml
```

### 2. Twitter キー情報ファイルの作成

Twitter API キー情報を `twitter.yml` というファイルに YAML 型式で記載しておく。

File: `twitter.yml`

``` text
account_1:
  cons_key: AAAAAAAAAAAAAAAAAAAAAAAAA
  cons_sec: BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
  accs_key: CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
  accs_sec: DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
account_2:
  cons_key: EEEEEEEEEEEEEEEEEEEEEEEEE
  cons_sec: FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
  accs_key: GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
  accs_sec: HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
```

### 3. Ruby スクリプトの作成

File: `tweet_oauth.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# アカウント名、文字列、画像ファイルを引数で与えてツイートする
# (twitter gem を使用せず oauth gem のみで行うバージョン)
#
# date          name            version
# 2017.01.16    mk-mode         1.00 新規作成
# 2019.02.15    mk-mode         1.01 画像添付機能追加
#
# Copyright(C) 2016-2019 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : account_name tweet_text [image_path...]
#        * ツイート文に半角スペースが存在する場合は "" で括る。改行は \n を使用する。
#        * 画像はいくつでも指定可能だが、 Twitter の仕様で4個までしか添付できない。
#---------------------------------------------------------------------------------
#
require 'json'
require 'oauth'
require 'yaml'

class Tweet
  YML_FILE  = "/path/to/twitter.yml"
  SITE_API  = "https://api.twitter.com"
  URL_UPD   = "/1.1/statuses/update.json"
  SITE_UL   = "https://upload.twitter.com"
  URL_MEDIA = "/1.1/media/upload.json"

  def initialize
    @ac   = ARGV.shift
    @text = ARGV.shift
    @media_paths = ARGV
  end

  def exec
    get_tw_keys
    exit 0 unless @tw
    format_text
    exit 0 if @text == ""
    tw_id = tweet
    puts "[#{@ac}]"
    puts @text
    puts "(#{@media_paths.join(",")})" unless @media_paths == []
    puts "(TWEET-ID: #{tw_id})"
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}" }
    exit 1
  end

  private

  # APIキー取得
  def get_tw_keys
    @tw = YAML.load_file(YML_FILE)
  rescue => e
    raise
  end

  # ツイート文整形
  def format_text
    @text = @text.gsub(/\\n/, "\n")
  rescue => e
    raise
  end

  # ツイート
  def tweet
    return unless @tw[@ac]
    return unless @tw[@ac]["accs_key"] || @tw[@ac]["accs_sec"]
    # OAuth 設定(for statuses/update)
    cons = OAuth::Consumer.new(
      @tw[@ac]["cons_key"],
      @tw[@ac]["cons_sec"],
      site: SITE_API
    )
    accs = OAuth::AccessToken.new(
      cons,
      @tw[@ac]["accs_key"],
      @tw[@ac]["accs_sec"]
    )
    # OAuth 設定(for media/upload)
    cons_ul = OAuth::Consumer.new(
      @tw[@ac]["cons_key"],
      @tw[@ac]["cons_sec"],
      site: SITE_UL
    )
    accs_ul = OAuth::AccessToken.new(
      cons_ul,
      @tw[@ac]["accs_key"],
      @tw[@ac]["accs_sec"]
    )
    # POST
    if @media_paths == []
      res = accs.post(URL_UPD, status: @text)
    else
      media_ids = []
      @media_paths.each do |f|
        img = File.open(f, "rb")
        res = accs_ul.post(
          URL_MEDIA,
          media_data: Base64.encode64(img.read)
        )
        exit if res.code.to_i > 202
        j = JSON.parse(res.body)
        media_ids << j["media_id_string"]
      end
      res = accs.post(URL_UPD, {
        status: @text, media_ids: media_ids.join(",")
      })
    end
    j = JSON.parse(res.body)
    return j["id_str"] ? j["id_str"] : "0"
  rescue => e
    raise
  end
end

if __FILE__ == $0
  exit if ARGV.size < 2
  Tweet.new.exec
end
{% endhighlight %}

* [Gist - Ruby script to tweet with image files.](https://gist.github.com/komasaru/33f8bb2c087410606687e2a24a49674d "Gist - Ruby script to tweet with image files.")

### 4. Ruby スクリプトの実行

まず、実行権限を付与。

``` text
$ sudo chmod +x tweet_oauth.rb
```

そして、アカウント名とツイート文、更に、画像を添付したい場合は続けて画像ファイルのパス（複数あればスペースで区切る）を引数に指定して実行する。

* ツイート文に半角スペースが含まれる場合はシングル／ダブルクォーテーションでくくること。
* 改行は \n で行うこと。

``` text
$ ./tweet_oauth.rb account_1 "これは Ruby によるツイートテストです。\nこれは Ruby によるツイートテストです。" /path/to/image_1 /path/to/image_2
[account_1]
これは Ruby によるツイートテストです。
これは Ruby によるツイートテストです。
(/path/to/image_1,/path/to/image_2)
(TWEET-ID: 1096279664610336769)
```

### 5. 参考ページ

* [POST media/upload — Twitter Developers](https://developer.twitter.com/en/docs/media/upload-media/api-reference/post-media-upload "POST media/upload — Twitter Developers")
* [POST statuses/update — Twitter Developers](https://developer.twitter.com/en/docs/tweets/post-and-engage/api-reference/post-statuses-update "POST statuses/update — Twitter Developers")

---

以上

