---
layout   : single
title    : "Rails - Bootstrap + Bootswatch 導入！"
published: true
date     : 2015-01-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Rails
- Bootstrap
---

こんにちは。

Rails アプリに Twitter Bootstarp のデザインを適用する方法についての記録です。

Bootstrap デフォルトのテーマでは代り映えがしないので Bootswatch のテーマを使用します。

さらに、動的スタイルシート言語は LESS ではなく SASS を使用する。

<!--more-->

### 0. 前提条件

* パッケージ管理ツール bower は使用しないことを想定。
* RubyGems パッケージを使用して導入する。  
  （Bootstrap のデザインを編集せずにそのまま使用するのであれば、 RubyGems パッケージを使用せずにソースを直接ダウンロードして使用したり、もしくは CDN を使用してもよいだろう）
* Bootswatch 用 RubyGems ライブラリは SASS 版の "bootswatch-rails" を使用する。（LESS 版の "twitter-bootswatch-rails" ではない）
* Rails アプリ作成済みであることを想定。
* テーマに Bootswatch を使用。
* 当然ながら、 Rails, HTML, CSS 等の知識が必要。

### 1. Gemfile の編集

File: `Gemfile`

{% highlight ruby linenos %}
# ==== bootstrap-sass
gem 'bootstrap-sass', '~> 3.3.1'
gem 'autoprefixer-rails'

# ==== bootswatch-rails
gem 'bootswatch-rails'
{% endhighlight %}

（`sass-rails` も必要だが、デフォルトで記述がある）

### 2. Bundle Install

``` text
$ bundle install
```

### 3. application.css.scss の作成

以下の `cerulean` は Bootswatch のテーマ。指定できるテーマは "[Bootswatch: Free themes for Bootstrap](http://bootswatch.com/ "Bootswatch: Free themes for Bootstrap")" や "[File: README - Documentation for bootswatch-rails (3.2.4)](http://www.rubydoc.info/gems/bootswatch-rails/3.2.4/frames "File: README - Documentation for bootswatch-rails (3.2.4)")" で確認可。

File: `app/assets/stylesheets/application.css.scss`

{% highlight css linenos %}
// for Glyphicons
@import "bootstrap-sprockets";

// First import cerulean variables
@import "bootswatch/cerulean/variables";
// Then bootstrap itself
@import "bootstrap";
// Bootstrap body padding for fixed navbar
body { padding-top: 60px; }
// And finally bootswatch style itself
@import "bootswatch/cerulean/bootswatch";
// Whatever application styles you have go last
//@import "base";
{% endhighlight %}

* `bootstrap-sprockets` は Glyphicons を使用するために必要で、 `@import "bootstrap";` より先に import する。
* `body { padding-top: 60px; }` は Navbar を最上部固定にした際にコンテンツが隠れないようにするための余白設定。
* コメントにもあるとおり、最終行の `base` は何か他にインポートする必要がある場合のみ有効にする。

### 4. application.css の削除

"application.css" は使用しないので削除。

``` text
$ rm -f app/assets/stylesheets/application.css
```

### 5. application.js の編集

File: `app/assets/javascripts/application.js`

{% highlight javascript linenos %}
//= require bootstrap-sprockets
{% endhighlight %}

（`jquery` も必要だが、デフォルトで記述がある）

### 6. View の編集等

必要に応じて View で HTML タグの要素を編集すれば、 Bootswatch のデザインが適用されるはず。

### 7. Asset Pipeline のプリコンパイル

Asset Pipeline 有効＆動的コンパイル無効にしている環境では、プリコンパイルしてみてエラーにならないことを確認する。（以下は Production 環境で有効にしている場合の例）

``` text
$ bundle exec rake assets:precompile RAILS_ENV=production
```

### 8. Web サーバ起動

Web サーバを起動（起動中なら再起動）して、 Web ブラウザで確認してみる。

### 参考サイト

* [Bootstrap · The world's most popular mobile-first and responsive front-end framework.](http://getbootstrap.com/ "Bootstrap · The world's most popular mobile-first and responsive front-end framework.")
* [Bootswatch: Free themes for Bootstrap](http://bootswatch.com/ "Bootswatch: Free themes for Bootstrap")
* [bootstrap-sass - RubyGems.org - your community gem host](http://rubygems.org/gems/bootstrap-sass "bootstrap-sass - RubyGems.org - your community gem host")
* [bootswatch-rails - RubyGems.org - your community gem host](http://rubygems.org/gems/bootswatch-rails "bootswatch-rails - RubyGems.org - your community gem host")

---

近いうち（そう遠くない時期）に当方 Web サイトを Bootswatch テーマを適用したものに差し替える予定です。（可能なら）

以上。

