---
layout   : single
title    : "Ruby on Rails - jQuery で Ajax 処理の callback 判定！"
published: true
date     : 2014-06-09 00:20:00 +0900
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

Ruby on Rails + jQuery で Ajax 処理を行う際に、そのステータスにより処理を振り分ける必要があるケースもあります。

その方法についての備忘録です。

<!--more-->

### 0. 前提条件

- Rails 4.1.0 での作業を想定。
- jQuery 導入済みであることを想定。

### 1. 準備

以下のような View テンプレートがあるとする。（説明用に簡素な例）  
（Form 内の Submit ボタン押下でメソッド `hoge` Controller, `fuga` Action を Ajax 呼び出しする）

File: `app/views/hoge/fuga.html.erb`

{% highlight erb linenos %}
<%= form_tag({controller: "hoge", action: "fuga"}, {id: "frm-search", data: {remote: true}}) do %>
  <%= submit_tag("検索", name: nil) %>
<% end %>
{% endhighlight %}

（古いバージョンの Rails では記述が若干異なるので注意）

### 2. jQuery スクリプト作成

以下のような jQuery スクリプトを作成する。（ファイル名は任意）

File: `app/assets/javascripts/my_custom.js`

{% highlight javascript linenos %}
$(function($){
    $('#frm-search')
        .bind("ajax:beforeSend", function(jqXHR, settings){
           // Ajax リクエスト送信前の処理
        })
        .bind("ajax:complete", function(jqXHR, textStatus){
           // Ajax リクエスト完了時の処理
        })
        .bind("ajax:error", function(jqXHR, textStatus, errorThrown){
           // Ajax リクエスト失敗時の処理
        });
        .bind("ajax:success", function(data, textStatus, jqXHR){
           // Ajax リクエスト成功時の処理
        })
});
{% endhighlight %}

`function` の Callback 引数は使用しないならなくてもよい。

各 Callback 引数の意味は以下のとおり。

- `jqXHR` : XMLHTTPRequest object.
- `settings` : PlainObject setting data.
- `textStatus` : Status string
- `errorThrown` : Error string
- `data` : PlainObject data

ちなみに、新しい jQuery なら `bind` の代わりに `on` を使用してもよいだろう。  
`live` や `delegate` でもよいだろう。（書式に注意）

### 3. 使い道

当方は、あるボタン押下時に jQuery の blockUI プラグインで画面をロックして Ajax 処理を行い、Ajax 処理が完了した時点で blockUI のロックを解除する、といった使い方をしている。

### 4. 参考サイト

- [jQuery.ajax() - jQuery API Documentation](http://api.jquery.com/jQuery.ajax/ "jQuery.ajax() - jQuery API Documentation")

---

HTML だけでは実現不可能な場合に JavaScript の恩恵を感じますが、 jQuery は更に恩恵を感じる今日この頃です。  
サーバサイドの JavaScript にも興味があるので、機会があれば。。。

以上。

