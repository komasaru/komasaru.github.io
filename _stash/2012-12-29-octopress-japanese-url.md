---
layout   : single
title    : "Octopress - URL に日本語を使う設定！"
published: true
date     : 2012-12-29 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
---

[Octopress](http://octopress.org/ "Octopress") でカテゴリやタグに日本語を使用すると、URL に日本語が含まれることになり、404 エラーでうまく表示できません。(ローカル環境(WEBrick or thin)で `rake preview` した時のこと。サーバ(Apache)では正常に表示できます)

![OP_404ERROR_1]({{site.baseurl}}/images/2012/12/29/OP_404ERROR_1.png 'OP_404ERROR #1')

しかし、設定を編集することで、問題は解決できます。

以下、作業記録です。

<!--more-->

### 0. 前提条件

- 作業 OS は Linux Mint 13 Maya (64bit)
- Ruby 1.9.3-p194
- Octopress 2.0

### 1. config.ru の編集

`config.rb` を以下のように編集する。(`URI.unescape` させるだけということ)

File: `config.ru`

{% highlight diff linenos %} 
diff --git a/config.ru b/config.ru
index b1b746b..ab2150e 100644
--- a/config.ru
+++ b/config.ru
@@ -1,5 +1,7 @@
+# coding: utf-8
 require 'bundler/setup'
 require 'sinatra/base'
+require 'uri'
 
 # The project root directory
 $root = ::File.dirname(__FILE__)
@@ -7,7 +9,8 @@ $root = ::File.dirname(__FILE__)
 class SinatraStaticServer < Sinatra::Base  
 
   get(/.+/) do
-    send_sinatra_file(request.path) {404}
+    #send_sinatra_file(request.path) {404}
+    send_sinatra_file(URI.unescape(request.path)) {404}
   end
 
   not_found do
@@ -22,4 +25,4 @@ class SinatraStaticServer < Sinatra::Base
 
 end
{% endhighlight %}

### 2. 確認

確認してみる。

``` bash 
$ rake generate
$ rake preview
```

日本語のカテゴリ名、タグ名をクリックしても 404 エラーにはならないはず。

![OP_404ERROR_2]({{site.baseurl}}/images/2012/12/29/OP_404ERROR_2.png 'OP_404ERROR #2')

### 3. その他

前述のようにクリックで 404 エラーにはならないものの、 [The W3C Markup Validation Service](http://validator.w3.org/ "The W3C Markup Validation Service") で警告(エラーではない)となるかもしれない。  
気にしないのなら、それでよいが、当方は気にする気質なので、対応しておきました。  
詳細は記載しませんが、リンクを作っている部分に URL エンコードさせる処理を追加するだけです。

### 参考サイト

- [Octopress does not unescape the path by default — Gist](https://gist.github.com/3787436 "Octopress does not unescape the path by default — Gist")

---

これで、ローカル環境でも日本語 URL で苦慮しなくてもよくなりました。

もしかしたら、日本語の記事タイトルもいけるかも知れませんが、未確認です。  
(今のところ、記事タイトルについては `rake new_post` をカスタマイズしてまでやる意味を感じないから)

以上。

