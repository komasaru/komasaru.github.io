---
layout   : single
title    : "Ruby on Rails - CSRF 対策（InvalidCrossOriginRequest 関連）！"
published: true
date     : 2014-04-15 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Rails
- CSRF
---

実は、最近の Rails ではデフォルトで CSRF（クロスサイトリクエストフォージェリ）対策はなされています。

しかし、その対策が原因でエラーになるケースもあります。  
（当方の場合、Rails 4.0.0 で問題なかった処理が 4.1.0 にアップデートした後にエラーが発生するようになった）

以下、備忘録です。

<!--more-->

### 0. 前提条件

- Rails 4.1.0 での作業を想定。
- CSRF についてはここでは説明しない。（必要なら各自お調べください）
- 今回発生した現象に対する対策についてのみ下記する。

### 1. デフォルト設定確認

Rails アプリの "/app/controllers/application_controller.rb" には、CSRF 対策としてデフォルとで以下のように記述されている。通常は変更する必要はないだろう。

コメントにもあるとおり、`protect_from_forgery with: :null_session` とすることでアプリ全体に対して CSRF 対策を無効にすることも可能である。（ただし、そうしても問題のないアプリに対してのみ）

File: `/app/controllers/application_controller.rb`

{% highlight ruby linenos %}
class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
end
{% endhighlight %}

### 2. 発生現象

Rails アプリのログに以下のような出力があった。

File: `/log/production.log`

{% highlight text linenos %}
I, [2014-04-13T16:14:55.292117 #4798]  INFO -- : Processing by JsonBlogController#index as */*
I, [2014-04-13T16:14:55.292357 #4798]  INFO -- :   Parameters: {"callback"=>"jQuery1102002235242399477899_1397373294976", "http_referer"=>"http://komasaru.github.io/", "_"=>"1397373294977"}
W, [2014-04-13T16:14:55.918983 #4798]  WARN -- : Security warning: an embedded <script> tag on another site requested protected JavaScript. If you know what you're doing, go ahead and disable forgery protection on this action to permit cross-origin JavaScript embedding.
I, [2014-04-13T16:14:55.919652 #4798]  INFO -- : Completed 500 Internal Server Error in 627ms
F, [2014-04-13T16:14:55.926267 #4798] FATAL -- :
ActionController::InvalidCrossOriginRequest (Security warning: an embedded <script> tag on another site requested protected JavaScript. If you know what you're doing, go ahead and disable forgery protection on this action to permit cross-origin JavaScript embedding.):
  actionpack (4.1.0) lib/action_controller/metal/request_forgery_protection.rb:217:in `verify_same_origin_request'
  activesupport (4.1.0) lib/active_support/callbacks.rb:424:in `block in make_lambda'
  activesupport (4.1.0) lib/active_support/callbacks.rb:231:in `call'
  activesupport (4.1.0) lib/active_support/callbacks.rb:231:in `block in halting'
  activesupport (4.1.0) lib/active_support/callbacks.rb:229:in `call'
  activesupport (4.1.0) lib/active_support/callbacks.rb:229:in `block in halting'
{% endhighlight %}

### 3. 原因

Rails アプリのあるコントローラで別ドメインのアクセスを解析するための処理（別ドメインに埋め込んだ JavaScript から各種情報を Rails アプリのコントローラに送信するような処理）を行なっているが、ドメイン名が異なるため受け付けられなくなっている。（ActionController で不正なリクエストと判断している）

### 4. 対策

エラーメッセージもあるとおり、クロスサイトの埋め込み JavaScript を許可するためには forgery protection を無効にすればよい。（ただし、無効にしても問題がない場合に限る）

実際には、該当のコントローラの冒頭に以下のような記述を追加すればよい。

File: `/app/contollers/hoge_controller.rb`

{% highlight ruby linenos %}
class HogeController < ApplicationController
  protect_from_forgery except: :index

  # ====< 以下省略 >====
end
{% endhighlight %}

### 5. Rails 再起動

設定を有効にするために Rails を再起動する。

そして、エラーが出力されなくなったか確認する。

---

Ruby や Rails はアップデート・アップグレードするたびに何かしら利用者側も対応を迫られる。しかし、それは日々発展しているということで。。。

以上。

