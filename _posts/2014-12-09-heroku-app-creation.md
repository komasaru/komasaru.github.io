---
layout   : single
title    : "Heroku - Ruby 製 Twitter Bot の運用！"
published: true
date     : 2014-12-09 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Heroku
- Ruby
---

Ruby で自作した Twitter Streaming を取得する Bot を動作させる方法についての記録です。

（当方、自宅サーバ派のため PaaS に精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

* Ruby 2.1.5-p273 での作業を想定。
* Heroku アカウント作成済み。
* Git 導入済み。

### 1. 使用する Ruby スクリプト

tweetstream ライブラリを使用して Twitter の Public streams - sample を取得する例。

File: `ts_test.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
# ---------------------------------------------------------
# Ruby script to get tweet statuses by tweetstream library.
# ---------------------------------------------------------
#
require 'tweetstream'

# Twitter OAuth keys ( from environment variables )
CONS_KEY = ENV['TW_CONS_KEY']
CONS_SEC = ENV['TW_CONS_SEC']
ACCS_KEY = ENV['TW_ACCS_KEY']
ACCS_SEC = ENV['TW_ACCS_SEC']

# Coniguring of TweetStream
TweetStream.configure do |config|
  config.consumer_key       = CONS_KEY
  config.consumer_secret    = CONS_SEC
  config.oauth_token        = ACCS_KEY
  config.oauth_token_secret = ACCS_SEC
  config.auth_method        = :oauth
end

# Instantiation
client = TweetStream::Client.new

# Getting Twitter streamings
client.sample do |item|
  # If "user" does not exist, go next.
  # If "user" exists, get "name", "screen_name", "text".
  next unless user = item.user
  name, screen_name, lang, text = user.name, user.screen_name, user.lang, item.text

  # If lang is not "ja", go next.
  next unless lang == "ja"
  # If a tweet sentense does not include specified strings, go next.
  #next unless text =~ /Ruby/

  # コンソール出力
  $stdout.puts "\n**** #{name} [ #{screen_name} ]"
  puts text
end

# Output error messages
client.on_error do |message|
  $stderr.puts "[ERROR] #{message}"
end

# Output reconnect messages
client.on_reconnect do |timeout, retries|
  $stderr.puts "[RECONNECT] timeout: #{timeout}, retires: #{retries}"
end
{% endhighlight %}

* [Gist - Ruby script to get tweet statuses by tweetstream library.](https://gist.github.com/komasaru/6a6bf1990f75f8050024 "Gits - Ruby script to get tweet statuses by tweetstream library.")

### 2. foreman ライブラリのインストール

プロセス管理に必要な foreman という RubyGems ライブラリをインストールする。

今回は RubyGems を Gemfile で管理しているので、Gemfile を編集する。

File: `Gemfile`

{% highlight ruby linenos %}
source 'https://rubygems.org'
gem 'tweetstream'
gem 'foreman'      # <= 追加
{% endhighlight %}

そして、インストール

``` text
$ bundle install
```

Gemfile を使用していないのなら、普通にインストールする。

``` text
$ sudo gem install foreman
```

### 3. foreman 設定ファイルの作成

foreman 起動時に "Procfile" に記述されたプロセス起動コマンドが実行されるので、 "Procfile" を作成する。

``` text
ts_test: bundle exec ruby ts_test.rb
```

### 4. 環境変数の設定（ローカル環境）

セキュリティの関係上 Ruby スクリプトに直接 Twitter 用の OAuth キー情報を記述せず、環境変数から取得することにしている。  
環境変数を設定するためには ".env" ファイルに記述しておく必要があるようなので、 ".env" ファイルを作成する。

File: `.env`

{% highlight text linenos %}
TW_CONS_KEY=<your_consumer_key>
TW_CONS_SEC=<your_consumer_secret>
TW_ACCS_KEY=<your_access_token>
TW_ACCS_SEC=<your_access_token_secret>
{% endhighlight %}

### 5. プロセスの起動（ローカル環境）

ローカル環境で以下のコマンドを実行し、プロセスを起動してみる。

``` text
$ foreman start
23:18:01 ts_test.1 | started with pid 29102
23:18:01 ts_test.1 | The source :rubygems is deprecated because HTTP requests are insecure.
23:18:01 ts_test.1 | Please change your source to 'https://rubygems.org' if possible, or 'http://rubygems.org' if not.

```

### 6. Git コミット

Git コミットしておく必要があるため、コミットする。

まず、

``` text
$ git init
```

`.env` はセキュリティの関係上 `.gitignore` に記述して除外するようにする。

File: `.gitignore`

{% highlight text linenos %}
.env
{% endhighlight %}

そして、ステージング、コミットする。

``` text
$ git add .
$ git commit -m "Initial commit."
```

### 7. Heroku アプリケーションの作成

名称を指定して Heroku アプリケーションを作成する。（当然 Heroku にログイン後）

``` text
$ heroku create heroku-ts-test
Creating heroku-ts-test... done, stack is cedar-14
https://heroku-ts-test.herokuapp.com/ | git@heroku.com:heroku-ts-test.git
Git remote heroku added
```

（以前は `--stack cedar` が必要だったが、現在はデフォルトなので指定する必要はない）

### 8. Heroku へのデプロイ

``` text
$ git push heroku master
       :
====< 省略 >====
       :

-----> Discovering process types
       Procfile declares types -> ts_test
       Default types for Ruby  -> console, rake

-----> Compressing... done, 17.3MB
-----> Launching... done, v4
       https://heroku-ts-test.herokuapp.com/ deployed to Heroku

To git@heroku.com:heroku-ts-test.git
 * [new branch]      master -> master
```

### 9. 環境変数の設定（Heroku 上）

File: `.env`

{% highlight text linenos %}
$ heroku config:set TW_CONS_KEY=<your_consumer_key>
$ heroku config:set TW_CONS_SEC=<your_consumer_secret>
$ heroku config:set TW_ACCS_KEY=<your_access_token>
$ heroku config:set TW_ACCS_SEC=<your_access_token_secret>
{% endhighlight %}

### 10. プロセスの起動（Heroku 上）

プロセスが１個だけ起動するように設定して起動する。

``` text
$ heroku scale ts_test=1
Scaling dynos... done, now running ts_test at 1:1X.
```

### 11. プロセスの動作確認（Heroku 上）

Heroku 上でプロセスが動作しているか確認する。

``` text
$ heroku ps
=== ts_test (1X): `bundle exec ruby ts_test.rb`
ts_test.1: up 2014/11/29 23:40:50 (~ 1m ago)

```

### 12. ログの確認（Heroku 上）

ログを確認してみる。

``` text
$ heroku logs --tail
            :
====< 延々と出力される >====
            :
```

### 13. プロセスの停止（Heroku 上）

起動中のプロセスを停止するには以下のようにする。（起動プロセス数を `0` にする）

``` text
$ heroku scale ts_test=0
Scaling dynos... done, now running ts_test at 0:1X.
```

---

当方は自宅サーバで運用することが多いですが、ものによっては Heroku で運用してもよいかなと思っています。

また、Heroku の Dyno プロセス無料枠が「750時間/月」なので、複数プロセスを運用する場合は注意する必要がありそうです。  
一度もアイドル状態にならずに24時間1ケ月連続稼働だと744時間になので、１プロセスの連続稼働なら問題はなさそうですが。

以上。

