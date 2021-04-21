---
layout   : single
title    : "Ruby on Rails - PubSubHubbub Subscriber 実装！"
published: true
date     : 2013-11-20 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Rails
- Feed
- XML
---

今回は、PubSubHubbub という Google 提唱のフィードをリアルタイムで配信するプロトコルについてです。

中でも、フィードを購読する側（Subcriber）を Rails で実装する方法についての記録です。

ブログの更新通知を即座に行うのにも利用したりしますが、当方の場合は「気象庁防災情報XML」をリアルタイム受信するために使用したく、実装を試みた次第です。

<!--more-->

### 0. 前提条件

- OS: Linux Mint 14(64bit)
- Ruby: 2.0.0-p247
- Rails: 4.0.0
- Web サイトを公開できる環境が必要  
  当方は、Ruby on Rails 製サイトを Nginx + Unicorn で構築している。当然、 Apache 等の Web サーバで PHP 等を使用することも可能。（実際にはそちらの方が多いでしょう）
- 今回、Subscriber(Callbak) の URL は `http://www.mk-mode.com/rails/jmx` を想定。  
  （将来的なことを考えて "jmx" を使用しているだけであり、当然何でもよい）
- 今回、フィードの URL は `http://www.mk-mode.com/test_op/atom.xml` を想定。
- **Subscriber やフィードの URL は、今回の当方のテスト用なので、このまま使用してもダメ。**  
  **自分のものに置き換えて考えること。**

### 1. PubSubHubbub 概要

[PubSubHubbub](https://code.google.com/p/pubsubhubbub/ "PubSubHubbub") とは、フィードをリアルタイムで配信（プッシュ）するプロトコルである。名称が長いので PuSH などと略すこともある。

通常、フィードがいつ更新されるか分からないので、利用者側は定期的にフィード URL にアクセスしてフィードを取得し、内容をチェックする必要があります。当然これではタイムラグが発生する。

しかし、PubSubHubbub の場合、利用者側とフィード側の間に Hub を介在させることで、フィード更新をリアルタイムで利用者側に通知することできる。  
あらかじめ、Hub に利用者側（Subscriber と呼ぶ）とフィード側（Publisher と呼ぶ）を登録しておくことで可能となる。  
実際には、以下の図のように、Publisher が Hub に対して更新フィード（フィードを更新した旨のみのフィード）を発行すると、Hub が登録されている Subscriber に更新フィードを配信し、更新フィードを受け取った Subscriber は必要に応じてその更新フィードに記載されている本文（本来の）フィードの URL にアクセスして本文フィードを受け取るという形式となる。

![PUSH_FIG]({{site.baseurl}}/images/2013/11/20/PUSH_FIG.png "PUSH_FIG")

つまり、速効性が求められる場合に有用である。その利用例として「[気象庁防災情報XML](http://xml.kishou.go.jp/ "気象庁防災情報XML")」が挙げられる。

というわけで、PubSubHubbub を実現させるためには、Publisher（フィード発行側）と Subscriber（フィード購読側）、それらを仲介する（フィード発行を知らせる）Hub が必要となる。  
Publisher はフィードを発行する側なので、フィード（その URL）に相当する。フィード発行機能のあるブログ等が利用できる。  
Hub は Publisher と Subscriber を登録しておくもので、Google がテスト用に公開している [Hub](https://pubsubhubbub.appspot.com/ "Google Pubsubhubbub Hub") 等を利用できる。  
Subscriber は Hub からフィード発行の情報を受信する側なので、自分に相当する。なので、Hub からの情報を処理できるように実装しなければならない。（今回紹介する部分）

### 2. Publisher（フィード発行側）準備

任意のタイミングで容易にフィード発行できるもの、つまりブログを用意する。  
フィード発行機能があるのなら、普段利用しているブログでもよいが、テストを行うのに不具合（テスト用の投稿が公開されてしまう）を感じるので、当方は別途テスト用のブログを簡易的に構築した。（普段使用しているブログを複製して）

テスト用ブログの URL は `http://www.mk-mode.com/test_op/`、フィード URL は `http://www.mk-mode.com/test_op/atom.xml` とする。

### 3. Subscriber（フィード購読側）準備

Hub からの通知を正常に受け取るために、Web サーバ側で実装する。  
今回は、Ruby on Rails（コントローラ）で実装する。

URL は `http://www.mk-mode.com/rails/jmx` （コントローラ名は JmxController("jmx_controller.rb")）とする。  
そして、重要なのは、普段の Hub からのフィード更新通知は POST リクエストだが、 Hub 登録時や定期的に Hub から購読確認の GET リクエストが飛んでくるので、そのための処理が必要だということ。

GET リクエスト時には、HEADER の `Content-Type` に `text/plain` を設定し、GET リクエスト受信時に取得した「チャレンジコード(`hub.challenge` の値)」をそのまま、ステータスコード `200` とともに返却しないといけない。（チャレンジコードの末尾に改行があってはならない）

POST リクエスト時は Publisher 発行の更新フィードがそのまま Hub 経由で飛んでくる。あとは、好みの処理を行えばよい。（以下の例では、単純にファイル保存しているだけであるが、実際には更新フィード内記載の実際のフィードの URL にアクセスして処理を行うことになるであろう）  
また、ヘッダ `HTTP_X_HUB_SIGNATURE` の値は、`hub.verify_token` から計算した `HMAC-SHA1` の値と等しくなるはずなので、実際にはこれらが一致することを確認できた時だけ処理を行うようにすれば、セキュアな処理になるだろう。

File: `jmx_controller.rb`

{% highlight ruby linenos %} 
class JmxController < ApplicationController
  DATA_DIR     = "/path/to/jmx/data/"
  VERIFY_TOKEN = "hoge"

  # application_controller 内の
  # "protect_from_forgery with: :exception"
  # を無効にする設定
  # （ワーニングが出力されないようにするため）
  skip_before_filter :verify_authenticity_token

  def index
    req_method = request.request_method

    # HTTP リクエスト別に振り分け
    if req_method == "GET"
      # 各パラメータの取得
      p_mode         = params['hub.mode']
      p_topic        = params['hub.topic']
      p_challenge    = params['hub.challenge']
      p_verify_token = params['hub.verify_token']

      # hub.mode チェック
      if p_mode == "subscribe" || p_mode == "unsubscribe"
        # hub.verify_token チェック
        if p_verify_token == VERIFY_TOKEN
          # Content-type に "text/plain" を指定し、
          # challenge コードをそのまま返却
          response.headers['Content-Type'] = "text/plain"
          render text: p_challenge.chomp, status: 200
        else
          render nothing: true, status: 404
        end
      else
        render nothing: true, status: 404
      end
    elsif req_method == "POST"
      # リクエストボディの取得
      req_body = request.body.read

      # ヘッダ HTTP_X_HUB_SIGNATURE の値を取得
      hub_sig = request.env['HTTP_X_HUB_SIGNATURE']

      # HMAC-SHA1 の計算
      sha1 = OpenSSL::HMAC::hexdigest(OpenSSL::Digest::SHA1.new, VERIFY_TOKEN, req_body)

      logger.info "#### hub_sig = #{hub_sig}"
      logger.info "#### sha1    = #{sha1}"

      # ファイルとして保存
      # ## 実際は、HTTP_X_HUB_SIGNATURE の値と
      # ## と verigy_token から計算した HMAC-SHA1 が等しい場合のみ処理を行う
      file_name = "#{Time.now.strftime("%Y%m%d%H%M%S")}_atom.xml"
      File.open("#{DATA_DIR}#{file_name}", 'wb') { |f| f.write req_body }

      render nothing: true, status: 200
    end
  end
end
{% endhighlight %}

- [Gist - Rails controller to receive feeds from the Hub of PubSubHubbub.](https://gist.github.com/komasaru/7209862 "Gist - Rails controller to receive feeds from the Hub of PubSubHubbub.")

GET リクエスト時のパラメータは以下のとおり。

- `hub.mode` ... `subscribe`（購読登録） か `unsubscribe`（登録解除）
- `hub.topic` ... フィードの URL 
- `hub.challenge` ... Hub 側指定の認証用のランダムな文字列
- `hub.verify_token` ... 購読者側指定の認証用のランダムな文字列（但し、Hub 登録時に指定した場合のみ）
- `hub.lease_seconds` ... Hub 再登録までの時間（但し、Hub 登録時に指定した場合のみ。上記の例では使用していない）

Rails のバージョン等によっては、 "config/routes.rb" を適切に設定（POST リクエストを処理できるように）する必要がある。  
当方の場合、"config/routes.rb" に以下の記述を追加している。

File: `config/routes.rb`

{% highlight ruby linenos %} 
  post 'jmx' => 'jmx#index'
{% endhighlight %}

### 4. Hub 登録

Publisher（フィード発行側） と Subscriber（フィード購読者側）を仲介する Hub の登録を行う。

今回は Google がテスト用に公開している [Hub](https://pubsubhubbub.appspot.com/ "Google Pubsubhubbub Hub") を利用する。 [Hub](https://pubsubhubbub.appspot.com/ "Google Pubsubhubbub Hub") ページの下方にある "Subscribe" というリンク（`https://pubsubhubbub.appspot.com/subscribe`）をクリックする。

Subscribe 登録画面が表示されるので以下のように入力して "Do It!" ボタンをクリックする。

![PUSH_SUB_1]({{site.baseurl}}/images/2013/11/20/PUSH_SUB_1.png "PUSH_SUB_1")

- "Callback URL" には、用意した Subscriber の URL を入力する。
- "Topic URL" には、フィード発行側の URL を入力する。
- "Verify Type" は、デフォルトのまま。
- "Mode" は、"Subscribe" を選択する。
- "Verify Token" は、認証用文字列を入力する。（利用したい場合のみ）
- "HMAC secret" は、デフォルト（空白）のまま。
- "Lease seconds" は、デフォルト（空白）のまま。（指定すれば、購読意思確認（Hub から GET リクエストが届く）間隔を変更できる。デフォルトは「５日」）

登録が成功したかは [Subscribe](https://pubsubhubbub.appspot.com/subscribe "Subscribe") ページの下部に以下のように入力して "Get Info" ボタンをクリックする。

![PUSH_SUB_2]({{site.baseurl}}/images/2013/11/20/PUSH_SUB_2.png "PUSH_SUB_2")

以下のような画面が表示されるので確認する。

![PUSH_SUB_3]({{site.baseurl}}/images/2013/11/20/PUSH_SUB_3.png "PUSH_SUB_3")

ログファイル（Web サーバや Rails のログ）でも確認できるので、正常にやり取りできているか確認する。

### 5. フィード作成

動作確認のためにフィードを作成してみる。  
実際には、ブログ記事を作成してデプロイ等行い、フィードを発行する。

### 6. フィード発行通知

動作確認のために、先ほど作成したフィードを Hub に対して発行する。

[Subscribe](https://pubsubhubbub.appspot.com/subscribe "Subscribe") 同様、[Hub](https://pubsubhubbub.appspot.com/ "Google Pubsubhubbub Hub") ページの下方にある "Publish" というリンク（`https://pubsubhubbub.appspot.com/publish`）をクリックする。

Publish 登録画面が表示されるので以下のように入力して "Publish" ボタンをクリックする。

![PUSH_PUB_1]({{site.baseurl}}/images/2013/11/20/PUSH_PUB_1.png "PUSH_PUB_1")

- "Topic URL" には、フィードの URL を入力する。

フィード発行通知が成功したかは [Publish](https://pubsubhubbub.appspot.com/publish "Publish") ページの下部に以下のように入力して "Get Info" ボタンをクリックする。

![PUSH_PUB_2]({{site.baseurl}}/images/2013/11/20/PUSH_PUB_2.png "PUSH_PUB_2")

以下のような画面が表示されるので確認する。

![PUSH_PUB_3]({{site.baseurl}}/images/2013/11/20/PUSH_PUB_3.png "PUSH_PUB_3")

### 7. フィード受信確認

Subscriber （Rails 側）でフィードが受信できているか、確認する。  
今回の例（前述の controller の処理）の場合、指定の場所に受信したフィードをファイルとして保存できているか確認する。

実際の作業では、「Subscriber のコード（controller）を編集し、フィードを作成・発行後動作を確認する」の繰り返しになるだろう。

### 8. 応用

当記事内でも何度か登場してきた「気象庁防災情報XML」、これも PubSubHubbub プロトコルを利用したシステムである。

これまで説明したとおりに Subscriber が実装できれば、Hub（「気象庁防災情報XML」の場合は、Alert HUB） の登録を気象庁にお願いする。（登録者数把握のために気象庁側が登録するようになっている）  
登録されれば気象庁から即時に各種更新フィードが送信されるので、その更新フィード内に記載の実フィードの URL にアクセスすれば目的の情報が取得できる。

「気象庁防災情報XML」の仕様や技術情報、環境や登録方法等については全て「[気象庁防災情報XMLフォーマット](http://xml.kishou.go.jp/ "気象庁防災情報XMLフォーマット")」に記載されている。  
特に Subscriber の構築については「[気象庁XML利活用セミナー](http://xml.kishou.go.jp/seminar/seminarInfo.html "気象庁XML利活用セミナー")」の「気象庁XMLを入手しよう」が参考になるだろう。（但し、当然ながら自分で自由に利用できる Web サーバや、動的処理ができる言語（PHP, Rails, JavaScript 等々のうちどれか）の知識も必要である）

また、いくつかの Web サイトでも PubSubHubbub を利用して「気象庁防災情報XML」を取得する方法等が紹介されているので、参考にするとよい。

### 参考サイト

- [pubsubhubbub - A simple, open, webhook based pubsub protocol & open source reference implementation. - Google Project Hosting](https://code.google.com/p/pubsubhubbub/ "pubsubhubbub - A simple, open, webhook based pubsub protocol & open source reference implementation. - Google Project Hosting")
- [気象庁防災情報XMLフォーマット](http://xml.kishou.go.jp/ "気象庁防災情報XMLフォーマット")

---

以上。

