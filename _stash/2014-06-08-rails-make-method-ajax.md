---
layout   : single
title    : "Ruby on Rails - メソッド(Action)の Ajax 化！"
published: true
date     : 2014-06-08 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Rails
- Ajax
- JavaScript
- jQuery
---

Ruby on Rails で Submit ボタンを押下後に画面遷移することなく部分的に表示を更新する方法についての備忘録です。

ちなみに、以前は別のアプローチで Rails + jQuery の Ajax 化（遅延読み込み）の記事を紹介しています。

- [Ruby on Rails - jQuery で Ajax 処理（遅延読み込み）！](http://www.mk-mode.com/octopress/2012/06/14/14002011/ "Ruby on Rails - jQuery で Ajax 処理（遅延読み込み）！")

<!--more-->

### 0. 前提条件

- Rails 4.1.0 での作業を想定。
- jQuery 導入済みであることを想定。（但し、通常の JavaScript でも代替可能のはず）
- Form の Submit ボタン押下でメソッド（Controller の Action）を呼び、結果を部分的に View（部分テンプレート）に反映させることを想定。  
  （Submit ボタン押下に限らず、リンククリックの場合も同様）

### 1. 準備

以下のような View テンプレートがあるとする。（説明用に簡素な例）  
（「検索」ボタン押下で、 "HogeContller" の "fuga" Action が呼ばれ、検索結果は下部の div 要素に表示される）  
（以下の `div` 要素内で使用する "_fuga_dtl.html.erb" のソースコードは割愛）

File: `app/views/hoge/fuga.html.erb`

{% highlight erb linenos %}
<%= form_tag({controller: "hoge", action: "fuga"}) do %>
  <%= submit_tag("検索", name: nil) %>
<% end %>

<div id="fuga-dtl">
  <%= render :partial => 'fuga_dtl' %>
</div>
{% endhighlight %}

（`div` 要素内は、後述の "js.erb" で更新するので通常不要であるが、当方の場合は検索時のみでなく初期表示でも使用するので記述している）

また、以下のような Controller があるとする。（説明用に簡素な例）

File: `app/controllers/hoge_controller.rb`

{% highlight ruby linenos %}
class HogeController < ApplicationController
  def fuga

    # ===< 何かしらの処理 >===

    # render での返却はなし
  end
end
{% endhighlight %}

### 2. 既存 View テンプレート（html.erb ファイル）の編集

View テンプレートを以下のように編集する。（`data: {remote: true}` 部分を追記）  
（ちなみに、旧バージョンの Rails なら `:remote => true` だろう）

File: `app/views/hoge/fuga.html.erb`

{% highlight erb linenos %}
<%= form_tag({controller: "hoge", action: "fuga"}, {data: {remote: true}}) do %>
  <%= submit_tag("実行", name: nil) %>
<% end %>

<div id="fuga-dtl">
  <%= render :partial => 'fuga_dtl' %>
</div>
{% endhighlight %}

### 3. Ajax 用テンプレート（js.erb ファイル）の作成

Ajax 処理用のテンプレート（js.erb ファイル）を以下のように作成する。（名前は html.erb ファイルと同じ）  
（jQuery で id が `fuga-dtl` である要素に "_fuga_dtl.html.erb" をレンダリングした結果を HTML として埋め込む、ということ）  

File: `app/views/hoge/fuga.js.erb`

{% highlight ruby linenos %}
$('#fuga-dtl').html('<%= j(render("fuga_dtl")) %>');
{% endhighlight %}

jQuery でなく通常の JavaScript なら以下のようになるだろう。（当方未確認）

File: `app/views/hoge/fuga.js.erb`

{% highlight ruby linenos %}
document.getElementById('fuga-dtl').innerHTML('<%= j(render("fuga_dtl")) %>');
{% endhighlight %}

（ちなみに、 `j` メソッドは `escape_javascript` ヘルパのエイリアス）

### 4. 動作確認

動作確認をしてみる。

Submit ボタンを押下後に画面全体が更新されることなく、部分的に更新されるようになるはずである。

### 5. その他

最初から存在していた "fuga.html.erb" と この "fuga.js.erb" と２つのテンプレートが存在することになるが、 Ajax 処理（Ajax リクエスト）の場合は "js" で取り扱われるため、 Controller 内では特に何も変更していない。

意図的に Controller 内で Ajax リクエストか否かを判定したい場合は、以下のようにすればよいだろう。

``` ruby
class HogeController < ApplicationController

  if request.xhr?
    # Ajax リクエストの場合の処理 ( true の場合 )
  else
    # その他の場合の処理 ( false の場合 )
  end

end
```

---

ページ全体が更新されない（ページが部分的に更新される）ので若干軽くなり、また視覚的も新鮮な感じがします。

以上。

