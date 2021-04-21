---
layout   : single
title    : "nanoc - 記事の公開・下書き管理！"
published: true
date     : 2013-02-09 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") でブログ記事を作成する際、その記事が公開してもよい状態かまだ編集中なのかを指定したい場合があります。  
他のブログシステムではよくある機能です。  

nanoc には標準でそのような機能はありませんが、メタデータ部分に適当なキーワードを設定することで可能になります。  
（メタデータに設定しただけで機能しているものと勘違いしている方もおられるように感じるので）

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p385 を使用。
- nanoc 用ブログヘルパー（Blogging, Rendering, LinkTo, Tagging）のインクルード設定済みで、nanoc をブログとして利用できるように各種設定も済んでいる。

### 1. Rules 編集

`Rules` ファイルの `preprocess` の先頭に以下のような記述を追加する。  
メタデータの `published` というキーワードに `false` が設定されている記事（アイテム）はコンパイルしない（アイテムのリストから削除する）という設定。  
`published` は他のブログシステム（Octopress）に合わせているだけあり、 `published` でなくても `publish` でも他の単語でもよい。

File: `Rules`

{% highlight ruby linenos %}
preprocess do
  items.delete_if { |item| item[:published] == false }

    :

{% endhighlight %}

### 2. 記事編集

記事ファイルのメタデータ部分に以下のように記述する。  
以下は当方の例で、編集中（公開しない）設定にしている。  
記事を公開してもよい状態になったら `false` を `true` に変更する。（実際は `published: false` 以外の記事がコンパイルされるので `true` でなくても、`published` 自体が存在しなくてもよい）

File: `content/articles/2013-01-21-test-published.ｍｄ`

{% highlight text linenos %}
---
title: TEST [ 記事の公開・編集中設定 ]
created_at: 2013/01/21 00:20:00
kind: article
published: false
categories:
- Test
tags:
- nanoc
- ruby
---
{% endhighlight %}

### 3. 確認

nanoc をコンパイルしてみて、 `published: false` の記事がコンパイルされていない（公開用ディレクトリに作成されていない）ことを確認する。

---

これで、編集中（草稿段階）の記事が公開されなくなります。  
ついでに、公開設定している記事の日時が未来の場合も記事をコンパイルしないように `Rules` を編集してもよいかもしれない。

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

