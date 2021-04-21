---
layout   : single
title    : "Rails 4.0.0 - Rails 3.2 系から移行！"
published: true
date     : 2013-07-06 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Rails
- Ruby
---

Rails 4.0.0 がリリースされたので、当方の Rails 3.2.13 製Webサイトも Rails 4.0.0 に移行してみました。

実際には、アップグレードではなく「作り直し」です。  
作り直しと言っても、新規に空の Rails アプリを作成して、そこへ既存のコードを目視で移動する作業です。  
当方は、その方が Rails 4.0.0 のことをよく理解できるのではないかと思っただけであり、`rake rails:update` でのアップグレードがよければそれで構いません。

以下、当方の作業記録です。

<!--more-->

### 0. 前提条件

- Linux Mint 14, CentOS 6.4 での作業を想定。（どちらでも同じ）
- Ruby は 2.0.0-p247
- 移行前の Rails は 3.2.13
- 使用する DB は MySQL
- Web サーバに Nginx を使用。
- Rails サーバに Unicorn を使用。

環境が異なる場合、以下と同様な作業にならない可能性も充分ある。  
環境が異なる場合は、適宜置き換えて考えるか、別途お調べください。

### 1. Rails アプリ新規作成

今回は作り直しなので、まず Rails アプリを新規作成する。

``` bash 
$ rails new hoge -d mysql
```

### 2. Gemfile 編集

既存の Gemfile にあって新しい Gemfile に存在しないものを追加する。  
この際注意するのは、Rails 4.0.0 では `group :assets do` のブロックは不要だということ。  
3.2 系からアップグレードする場合と異なり、必要な Gem のバージョンは最新になっているので修正する必要はない。

### 3. スクリプト等の用意

app ディレクトリの contrlloers, views, models, helpers や assets 配下のスクリプト等を既存の Rails アプリからコピーして配置する。  
その他、lib, public ディレクトリに配置すべき物があればコピーして配置する。

### 4. database.yml 編集

生成されている "database.yml" をデータベース環境に合わせて編集する。  
これは Rails 3.2 系で使用していたものと全く同じにして問題ない。

### 5. routes.rb 編集

新規アプリの routes.rb にマッピングに関する記述を追加していく。  
既存のアプリの routes.rb の記述をそのままコピーしない。`match` は `get` （場合によっては `post`）に置き換えること。  
例えば、以下のように。

【変更前】

``` ruby 
  match ':controller(/:action(/:id(.:format)))'
  match 'feed/atom' => 'feed#atom'
```

【変更後】

``` ruby 
  get  ':controller(/:action(/:id(.:format)))'
  get  'feed/atom' => 'feed#atom'
```

`post` が必要な場合は、明示的に記述しないといけないようので、今まで指定していなくても指定する。  
例えば、

``` ruby 
  post 'contact/confirm' => 'contact#confirm'
```

### 6. environments/production.rb の編集

`assets.compile` がデフォルトでは無効になっているので、有効にしたい場合は編集する。  
（development や test でも有効にしたい場合は同様に編集する）

File: `config/environments/production.rb`

{% highlight ruby linenos %}
  #config.assets.compile = false
  # ↓ 変更
  config.assets.compile = true
{% endhighlight %}

また、当方 Web サーバに Nginx を使用しているので、 HTTP ヘッダに関する記述のコメントを解除して有効化した。

File: `config/environments/production.rb`

{% highlight ruby linenos %}
  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = "X-Sendfile" # for apache
  config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for nginx
{% endhighlight %}

### 7. ActiveRecord の編集

ActiveRecord の `find(:all)`、`find(:all, :conditions ...)` などの書き方が廃止になったようのなで、編集する。  
（"activerecord-deprecated_finders" という Gem を使うことで今までどおり使えるようにはなるが、非推奨なのでログにワーニング出力される）

例えば、以下のように記述していた部分は、以下のように書き換える。

【変更前】

File: `RAILS_APP/app/controllers/twitter_controlller.rb`

{% highlight ruby linenos %}
res = TwitterTimeline.find(
  :all,
  :select     => 'tweet_id, text, created_at',
  :conditions => ['screen_name = ?', "hoge"],
  :order      => 'tweet_id DESC',
  :limit      => 5
)
{% endhighlight %}

【変更後】

File: `RAILS_APP/app/controllers/twitter_controlller.rb`

{% highlight ruby linenos %}
@tweet_list = TwitterTimeline
  .select('tweet_id, text, created_at')
  .where(screen_name: 'hoge')
  .order('tweet_id DESC')
  .limit(5)
{% endhighlight %}

当方は、ActiveRecord 部分は Model で scope を定義し、Controller で scope を使うようにしたので、結局以下のようにした。

【Controller】

File: `RAILS_APP/app/controllers/twitter_controlller.rb`

{% highlight ruby linenos %}
@tweet_list = TwitterTimeline.get_list_5
{% endhighlight %}

【Model】

File: `RAILS_APP/app/models/twitter_timeline.rb`

{% highlight ruby linenos %}
class TwitterTimeline < ActiveRecord::Base
  scope :get_list_5, -> {
    select('tweet_id, text, created_at')
    .where(screen_name: 'ko_masaru')
    .order('tweet_id DESC')
    .limit(5)
  }
end
{% endhighlight %}

ちなみに、ActiveRecord は Rails 4.0.0 でかなり変更されているので、"activerecord-deprecated_finders" Gem を使用しない場合は、[ドキュメント](http://railsdoc.com/model "モデル(model) - Railsドキュメント")を参照して対応すること。

### 8. turbolinks 無効化

Rails 4.0.0 ではデフォルトで "turbolinks" というページ遷移を Ajax で行なってくれる Gem がバンドルされるようになっている。  
しかし、既に jQuery を使用している場合は衝突して jQuery が不具合を起こすので無効化する。

#### 8-1. Gemfile 編集

"Gemfile" 内の "turbolinks" 部分を削除またはコメントアウトする。

File: `Gemfile`

{% highlight ruby linenos %}
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
# gem 'turbolinks'  # <- コメントアウト
{% endhighlight %}

#### 8-2. application.html.erb 編集

"app/views/layouts/application.html.erb" ファイル内の "turbolinks" 部分を削除する

File: `app/views/layouts/application.html.erb`

{% highlight html linenos %}
  <%= stylesheet_link_tag    "application", media: "all", "data-turbolinks-track" => true %>
  <%= javascript_include_tag "application", "data-turbolinks-track" => true %>

  ↓ 変更

  <%= stylesheet_link_tag    "application", media: "all" %>
  <%= javascript_include_tag "application" %>
{% endhighlight %}

#### 8-3. application.js 編集

"app/assets/javascripts/application.js" 内の "turbolinks" 部分を削除またはコメントアウトする

File: `app/assets/javascripts/application.js`

{% highlight js linenos %}
//= require jquery
//= require jquery_ujs
//  require turbolinks  // <- コメントアウト
//= require_tree .
{% endhighlight %}

#### 8-4. bundle install

変更を有効化するため以下を実行する。

``` bash 
$ bundle install
```

### 9. その他

当方、Web サーバは Nginx、Rails サーバは Unicorn を使用しているので、その辺の設定も不具合がないかチェックする。

後は、実際に Development モードで動かしてみてログ等をチェックして調整し、問題なければ Production モードで公開する、といった感じになるでしょう。

### 参考サイト

- [Ruby on Rails Guides](http://edgeguides.rubyonrails.org/upgrading_ruby_on_rails.html#upgrading-from-rails-3-2-to-rails-4-0 "Ruby on Rails Guides")
- [モデル(model) - Railsドキュメント](http://railsdoc.com/model "モデル(model) - Railsドキュメント")
- [Rails 4.0を使ってみよう – その2 ActiveRecordの使い方 | TechRacho](http://techracho.bpsinc.jp/baba/2012_10_11/6234 "Rails 4.0を使ってみよう – その2 ActiveRecordの使い方 | TechRacho")

---

環境や Rails アプリでやりたいことによっては、他にも対応が必要な場合もありますが、今回当方が Rails アプリを作り直す作業で行ったことは大体以上のようなことでした。

やはり、日々洗練されてきているように感じます。  
また、Rails 4.0.0 にしたことによる大きな不具合は今のところ発生していません。

ただいつも思うのですが、Ruby や Rails が初心者でも使いやすいというのは、使える環境が整ってからの話であり、環境を整えること自体は初心者には容易ではないと感じています。（普段 Rails に（初心者よりは）触れる機会のある人間でもそうだから。。。）

以上。

