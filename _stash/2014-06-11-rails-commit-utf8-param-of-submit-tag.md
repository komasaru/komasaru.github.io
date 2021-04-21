---
layout   : single
title    : "Ruby on Rails - submit_tag で付加される commit, utf8 パラメータ！"
published: true
date     : 2014-06-11 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Rails
---

Ruby on Rails で `submit_tag` メソッドを使用して `submit` タグを生成すると、Submit 後の URL に自分の意識していないパラメータが勝手に付加されます。 `utf8` と `commit` です。

以下、現象と対策方法についての備忘録です。

<!--more-->

### 0. 前提条件

- Rails 4.1.0 での作業を想定。

### 1. 現象確認

例えば、Rails の HTML 生成部分（erb ファイル）を以下のようにしたとする。

``` erb
<%= form_tag({controller: "hoge", action: "fuga" }, {method: "get"}) do %>

  <!-- セレクトボックス、テキストボックス、ラジオボタン -->

  <%= submit_tag("検　索") %>

<% end %>
```

すると、生成後の HTML は以下のようになる。

``` html
<form accept-charset="UTF-8" action="/jmaxml" method="get">

  <!-- セレクトボックス、テキストボックス、ラジオボタン -->

  <input name="commit" type="submit" value="検　索" />

</form>
```

そして、ボタン押下後の URL は以下のようになる。

``` text
http://＜・・・＞/hoge/fuga?utf8=✓&commit=検　索
```

### 2. commit パラメータについて

#### 2-1. 原因

HTML の `name="commit"` や URL の `commit=検　索` は、押下されたボタンをサーバ側で判断できるようにデフォルトで付加される機能のようだ。

- [rails/actionpack/lib/action_view/helpers/form_tag_helper.rb at 4-0-stable · rails/rails](https://github.com/rails/rails/blob/4-0-stable/actionpack/lib/action_view/helpers/form_tag_helper.rb#L445 "rails/actionpack/lib/action_view/helpers/form_tag_helper.rb at 4-0-stable · rails/rails")

#### 2-2. 対策

１つのフォームで複数のボタンを使用しないのなら区別する必要もない。その場合は、 `name` 属性に `nil` を指定すればよい。  
区別する必要があるのなら、明示的に `name` 属性を指定すればよい。

``` erb
<%= form_tag({controller: "hoge", action: "fuga" }, {method: "get"}) do %>

  <!-- セレクトボックス、テキストボックス、ラジオボタン -->

  <%= submit_tag("検　索", name: nil) %>

<% end %>
```

### 3. utf8 パラメータについて

#### 3-1. 原因

古い Internet Explorer 対策のためにデフォルトで付加されるパラメータのようだ。

- [rails/actionpack/lib/action_view/helpers/form_tag_helper.rb at 4-0-stable · rails/rails](https://github.com/rails/rails/blob/4-0-stable/actionpack/lib/action_view/helpers/form_tag_helper.rb#L719 "rails/actionpack/lib/action_view/helpers/form_tag_helper.rb at 4-0-stable · rails/rails")
- [What is the _snowman param in Ruby on Rails 3 forms for? - Stack Overflow](http://stackoverflow.com/questions/3222013/what-is-the-snowman-param-in-ruby-on-rails-3-forms-for "What is the _snowman param in Ruby on Rails 3 forms for? - Stack Overflow")
- [Rails 3 UTF-8 query string showing up in URL? - Stack Overflow](http://stackoverflow.com/questions/4104474/rails-3-utf-8-query-string-showing-up-in-url "Rails 3 UTF-8 query string showing up in URL? - Stack Overflow")

#### 3-2. 対策

"config/intializers" ディレクトリ配下に適当な名前でファイルを作成し、以下のような内容を記述すればよいようだ。

File: `config/initializers/utf8_enforcer_tag.rb`

{% highlight ruby linenos %}
module ActionView
  module Helpers
    module FormTagHelper
      def utf8_enforcer_tag
        "".html_safe
      end
    end
  end
end
{% endhighlight %}

（`html_safe` は authenticity_token エラー防止のため）

- [utf - Override utf8_enforcer_tag using Rails custom form builder? - Stack Overflow](http://stackoverflow.com/questions/16011285/override-utf8-enforcer-tag-using-rails-custom-form-builder "utf - Override utf8_enforcer_tag using Rails custom form builder? - Stack Overflow")

### 4. 動作確認

Rails を再起動して、生成される HTML を確認してみる。

``` html
<form accept-charset="UTF-8" action="/jmaxml" method="get">

  <!-- セレクトボックス、テキストボックス、ラジオボタン -->

   <input type="submit" value="検　索" />

</form>
```

Submit 後の URL も確認してみる。 `utf8=✓` も `commit=検　索` も無くなったはずである。

---

これで URL がスッキリしました。

以上。

