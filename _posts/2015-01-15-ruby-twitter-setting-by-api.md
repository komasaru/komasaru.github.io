---
layout   : single
title    : "Ruby - Twitter REST API でアカウントの設定！"
published: true
date     : 2015-01-15 00:20:00 +0900
comments : true
categories:
- プログラミング
- SNS
tags:
- Ruby
- Twitter
- OAuth
---

Twitter アカウントを複数（しかも同じ系統のもの）を所有している場合、同時にアカウントの設定を変更したい際に画面を開いて作業するのは大変骨の折れる作業になります。

そこで、当方が普段使用している Ruby スクリプトの重要部分のみ抜粋したもの（テスト用に作成したもの）を紹介します。  
（実際は、複数アカウントの Twitter Key や設定内容を一覧にした Yaml ファイルを読み込んでループ処理しています）

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* Ruby 2.2.0-p0 での作業を想定。
* RubyGems ライブラリ "twitter", "oauth" を使用するので、`gem install` 済みであること。
* Twitter API を使用するので、 Consumer Key, Secret や Access Token, Secret を取得済みであること。
* 設定する Twitter アカウントの項目は以下のとおり。
  - タイムゾーン
  - 名前（screen_name でない方）
  - URL
  - 場所
  - アカウント説明文
  - リンクの色
  - 背景画像（自アカウントのホーム画面の背景）
  - ヘッダ画像
  - プロフィール画像

### 1. Ruby スクリプト作成

以下のような簡単な Ruby スクリプトを作成。

File: `twitter_settings.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#
# ========================
# Twitter settings
# ========================
#
require 'twitter'
require 'oauth'

class TwitterSettings
  # Constants
  CONS_KEY  = "<your_consumer_key>"
  CONS_SEC  = "<your_consumer_secret>"
  ACCS_KEY  = "<your_access_token>"
  ACCS_SEC  = "<your_access_token_secret>"
  T_ZONE    = "Tokyo"
  NAME      = "テストアカウント"
  URL       = "http://xxx.yyy.zzz/"
  LOCATION  = "Ruby City MATSUE"
  DESC      = "これはテストアカウントです。"
  LN_COLOR  = "FA743E"
  PR_BGIMG  = "/path/to/background.gif"
  PR_BANNER = "/path/to/banner.jpg"
  PR_IMG    = "/path/to/profile.png"

  def initialize
    @client = Twitter::REST::Client.new do |config|
      config.consumer_key        = CONS_KEY
      config.consumer_secret     = CONS_SEC
      config.access_token        = ACCS_KEY
      config.access_token_secret = ACCS_SEC
    end
  end

  # Main process
  def exec
    # account/settings
    settings

    # account/update_profile
    update_profile

    # account/update_profile_background_image
    update_profile_background_image

    # account/update_profile_banner
    update_profile_banner

    # account/update_profile_image
    update_profile_image
  rescue => e
    $stderr.puts "[EXCEPTION][#{self.class.name}.#{__method__}] #{e}"
    exit 1
  end

private

  # account/settings
  # - time_zone: The timezone dates and times should be displayed in for the user.
  #              The timezone must be one of the Rails TimeZone names.
  def settings
    puts "* account/settings"

    begin
      @client.settings({time_zone: T_ZONE})
    rescue => e
      raise
    end
  end

  # account/update_profile
  # - name              : Maximum of 20 characters
  # - url               : Maximum of 100 characters
  # - location          : Maximum of 30 characters
  # - description       : Maximum of 160 characters
  # - profile_link_color: (ex: F00 or FA743E)
  def update_profile
    puts "* account/update_profile"

    begin
      @client.update_profile(
        {
          name:               NAME,
          url:                URL,
          location:           LOCATION,
          description:        DESC,
          profile_link_color: LN_COLOR
        }
      )
    rescue => e
      raise
    end
  end

  # account/update_profile_background_image
  # - The background image for the profile, base64-encoded. Must be a valid GIF,
  #   JPG, or PNG image of less than 800 kilobytes in size. Images with width
  #   larger than 2048 pixels will be forcibly scaled down. The image must be
  #   provided as raw multipart data, not a URL.
  def update_profile_background_image
    puts "* account/update_profile_background_image"

    begin
      @client.update_profile_background_image(
        File.open(PR_BGIMG), {tile: true, use: true}
      )
    rescue => e
      raise
    end
  end

  # account/update_profile_banner
  # - banner: The Base64-encoded or raw image data being uploaded as the user’s
  #           new profile banner.
  def update_profile_banner
    puts "* account/update_profile_banner"

    begin
      @client.update_profile_banner(File.open(PR_BANNER))
    rescue => e
      raise
    end
  end

  # account/update_profile_image
  # - image: The avatar image for the profile, base64-encoded. Must be a valid GIF,
  #          JPG, or PNG image of less than 700 kilobytes in size. Images with
  #          width larger than 400 pixels will be scaled down. Animated GIFs will
  #          be converted to a static GIF of the first frame, removing the animation.
  def update_profile_image
    puts "* account/update_profile_image"

    begin
      @client.update_profile_image(File.open(PR_IMG))
    rescue => e
      raise
    end
  end
end

TwitterSettings.new.exec
{% endhighlight %}

* [Gist - Ruby script to set informations of a twitter account.](https://gist.github.com/komasaru/75b2902a1c87b13b7804 "Gist - Ruby script to set informations of a twitter account.")

### 2. Ruby スクリプト実行

``` text
$ ./twitter_settings.rb
* account/settings
* account/update_profile
* account/update_profile_background_image
* account/update_profile_banner
* account/update_profile_image
```

### 3. 参考サイト

* [REST APIs - Twitter Developers](https://dev.twitter.com/rest/public "REST APIs - Twitter Developers")
* [File: README — Documentation for twitter (5.13.0)](http://www.rubydoc.info/gems/twitter "File: README — Documentation for twitter (5.13.0)")

---

同じシリーズの Twitter Bot を100件以上（当記事執筆時点）所有しているので、いざまとめて変更しようと思った際に重宝しております。

以上。

