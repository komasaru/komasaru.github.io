---
layout   : single
title    : "Ruby - メール(ISO-2022-JP)送信！"
published: true
date     : 2015-05-03 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Mail
---
こんにちは。

Ruby でメール（日本語）を送信する方法についての記録です。

メール送信に関しては多数の RubyGems ライブラリが公開されていますが、今回は "mail-iso-2022-jp" ライブラリを使用します。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* Ruby 2.2.2-p95 での作業を想定。
* SMTP プロトコルを使用したメール送信を想定。
* SMTP サーバのログイン情報を用意しておく。

### 1. RubyGems ライブラリのインストール

"mail-iso-2022-jp" という RubyGems ライブラリと、これが依存する "mail" という RubyGems ライブラリをインストールする。  
（日本語(ISO-2022-JP)を使用しないのであれば、 "mail" ライブラリのみでよい）

``` text
$ sudo gem install mail mail-iso-2022-jp
```

### 2. Ruby スクリプトの作成

以下は SMTP Over SSL でメールを送信する例。（説明についてはコメントを参照）  
（shebang ストリングは環境に合わせて変更すること。ちなみに、`env` を使用しても環境に依存することが多々あるため、当方は最初からフルパスで指定する方針）

File: `send_mail.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------
# メール送信（日本語(ISO-2022-JP)対応）
#
# Copyright(C) 2015 mk-mode.com All Rights Reserved.
#---------------------------------------------------
#
require 'mail'
require 'mail-iso-2022-jp'

class SendMail
  def initialize
    # メールオプジェクト生成
    @mail = Mail.new(charset: 'ISO-2022-JP') do
      from    "hoge@xxxxxxxx.com"
      to      "fuga@yyyyyyyy.com"     # <= 宛先が複数の場合は配列にする
      subject "** TEST（テスト） **"
      body    <<-EOS
This is a test of mail sending.
これはメール送信テストです。
      EOS
    end

    # オプション設定 (SMTP Over SSL)
    #   `password` の設定値を `($stdout.print "Password: "; gets.chomp)` に変更すると、
    #   当スクリプト実行の都度パスワードの問い合わせを行う。
    @smtp_opts = {
      address:        "smtp.xxxxxxx.com",  # <= SMTP サーバのアドレス
      port:            465,                # <= Port 番号（単純な SMTP なら 25）
      domain:         "xxxxxxx.com",       # <= ドメイン名
      user_name:      "hoge"  ,            # <= 送信ユーザ名
      password:       "xxxxxxxx",          # <= 送信ユーザパスワード
      authentication: :plain,              # <= 認証方式（コメントアウトしても問題ない）
      ssl:             true                # <= SSL 認証（単純な SMTP なら false もしくはコメントアウト）
    }
  end

  # メール送信
  def send_mail
    begin
      @mail.delivery_method(:smtp, @smtp_opts)
      @mail.deliver!
    rescue => e
      $stderr.puts "[#{e.class}] #{e.message}"
    end
  end
end

SendMail.new.send_mail unless __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to send a ISO-2022-JP mail.](https://gist.github.com/komasaru/68820f52b874bb9e614d "Gist - Ruby script to send a ISO-2022-JP mail.")

### 3. Ruby スクリプトの実行

``` text
$ ./send_mail.rb
```

### 4. 動作確認

指定の宛先にメールが配信されるか確認する。

### 5. 参考サイト

* [mail - RubyGems.org - your community gem host](https://rubygems.org/gems/mail "mail - RubyGems.org - your community gem host")
* [mail-iso-2022-jp - RubyGems.org - your community gem host](https://rubygems.org/gems/mail-iso-2022-jp "mail-iso-2022-jp - RubyGems.org - your community gem host")

---

今回は SMTP プロトコルを使用したメール送信でしたが、 sendmail でも送信することも可能です。

ちなみに、当方は今回仕組みを自作の Twitter Bot に実装し、（ツイートと同じ内容のうち必要なものだけを）携帯端末にメール送信するようにしています。

以上。

