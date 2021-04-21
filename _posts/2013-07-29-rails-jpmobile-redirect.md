---
layout   : single
title    : "Rails - jpmobile でリダイレクト！"
published: true
date     : 2013-07-29 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Rails
---

当方の Ruby on Rails 製[ホームページ](http://www.mk-mode.com/rails/ "mk-mode SITE")は、先日 jpmobile でスマートフォン対応しました。  

携帯電話からのアクセスは需要が少ないと見込んで非対応としております。

しかし、携帯電話からのアクセスの際に無条件に PC 用ページが表示されてしまっては不親切ですので、携帯電話からアクセスされた場合は別途メッセージを表示させるようにしました。

Rails のコントローラ側で `redirect_to` を使用するのですが、それについて記録しておきます。

<!--more-->

#### 0. 前提条件

- 使用する Rails は 4.0.0 を想定。
- jbmobile インストー済み。  
  （「[Rails - jpmobile で携帯・スマホ対応！]({{site.baseurl}}/2013/07/28/rails-install-jpmobile "Rails - jpmobile で携帯・スマホ対応！")」を参照）

#### 1. コントローラ編集

各コントローラ内でフィルタ設定を行う。

【リダイレクト先にコントローラを指定する場合】

File: `top_controller.rb`

{% highlight ruby linenos %}
class TopController < ApplicationController
  # フィルタを追加
  before_filter :redirect_if_mobile

  def index
  end

  private
  # リダイレクト
  def redirect_if_mobile
    # コントローラを指定する場合
    redirect_to :controller => 'mobile' if request.mobile?
  end
end
{% endhighlight %}

【リダイレクト先に直接 HTML を指定する場合】

File: `top_controller.rb`

{% highlight ruby linenos %}
class TopController < ApplicationController
  # フィルタを追加
  before_filter :redirect_if_mobile

  def index
  end

  private
  # リダイレクト
  def redirect_if_mobile
    # 直接 HTML を指定する場合
    redirect_to "http://www.mk-mode.com/rails/mobile.html" if request.mobile?
  end
end
{% endhighlight %}

【補足】  
上記は `request.mobile?` で携帯電話からのアクセスかどうかのみを判定しているが、携帯キャリア別に処理をしたいのなら以下のようにすればよい。

``` ruby 
case request.mobile
when Jpmobile::Mobile::Docomo
  # docomo 用処理
when Jpmobile::Mobile::Au
  # au 用処理
when Jpmobile::Mobile::Softbank
  # SoftBank 用処理
when Jpmobile::Mobile::Willcom
  # Willcom 用処理
when Jpmobile::Mobile::Emobile
  # EMOBILE 用処理
else
  # 上記に当てはまらなかった場合の処理
end
```

#### 2. リダイレクト先準備

リダイレクト先にコントローラを指定する場合は、当然該当のコントローラ、ビューを作成する。  
直接 HTML を指定する場合は、当然該当の HTML ファイルを作成する。

当方の場合、携帯電話から Rails サイトにアクセスがあった場合にメッセージを表示させるだけにした。  
簡単な HTML ファイル作成し、 "public" ディレクトリに配置した。

#### 参考サイト

- [jpmobile/jpmobile](https://github.com/jpmobile/jpmobile "jpmobile/jpmobile")
- [jpmobileはじめの一歩 － ＠IT](http://www.atmarkit.co.jp/fcoding/articles/jpmobile/02/jpmobile02b.html "jpmobileはじめの一歩 － ＠IT")

---

当方の Ruby on Rails 製[ホームページ](http://www.mk-mode.com/rails/ "mk-mode SITE")では、各種情報を公開しています。  
少しずつでもアクセス数が増えることを期待しています。

以上。

