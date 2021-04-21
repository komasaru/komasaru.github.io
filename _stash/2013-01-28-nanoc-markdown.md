---
layout   : single
title    : "nanoc - Markdown 記法を使用！"
published: true
date     : 2013-01-28 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
- Markdown
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") でページ・記事を作成する際にいちいち HTML を記述しては効率が悪いです。

当方は Markdown 記法が好きなので、[nanoc](http://nanoc.stoneship.org/ "nanoc") で使えるようにしてみました。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。

### 1. RubyGems パッケージインストール

Markdown 記法をパースするのに必要な `kramdown` という RubyGems パッケージをインストールする。  
ちなみに、Ruby で使える Markdown パーサには Kramdown 以外に BlueCloth, RDiscount, Redcarpet, Maruku 等もあるようだ。

``` ruby 
$ sudo gem install kramdown
```

### 2. Rules 編集

コンパイル時に `kramdown` でフィルターするよう `Rules` ファイルの該当の箇所に以下のように記述を追加する。  
（以下はデフォルトの場合）

File: `Rules`

{% highlight ruby linenos %}
compile '*' do
  if item.binary?
    # don’t filter binary items
  else
    filter :erb
    filter :kramdown  # <= 追加
    layout 'default'
  end
end
{% endhighlight %}

### 3. 記事作成

試しに以下のように Markdown 記法で記事を作成してみる。  
作成は `nanoc create_item test-markdown` か既存のファイルを複製する。

File: `test-markdown`

{% highlight text linenos %} 
---
title: TEST [ Markdown ]
created_at: 2013/01/13 00:20:00
kind: article
---
A First Level Header
====================

A Second Level Header
---------------------

Now is the time for all good men to come to
the aid of their country. This is just a
regular paragraph.

The quick brown fox jumped over the lazy
dog's back.

### Header 3

> This is a blockquote.
> 
> This is the second paragraph in the blockquote.
>
> ## This is an H2 in a blockquote
{% endhighlight %}

### 4. 確認

コンパイルして作成される画面をブラウザで確認してみる。  
URL は `http://127.0.0.1:3000/test-markdown/` となる。

``` bash 
$ nanoc compile
$ nanoc view
```

![NANOC]({{site.baseurl}}/images/2013/01/28/NANOC.png "NANOC")

うまく HTML に変換できているようだ。（）

### 参考サイト

- [nanoc > Getting Started](http://nanoc.stoneship.org/docs/3-getting-started/ "nanoc > Getting Started")

---

現在、メインで使用している [Octopress](http://octopress.org/ "Octopress") によるブログでも Markdown を使用しているので、[nanoc](http://nanoc.stoneship.org/ "nanoc") での作業も楽になりました。

ちなみに、当記事執筆時点では nanoc によるブログは公開していません。  
しかし、現在メインで公開しているブログを今後移行するのかも知れませんし、メインのブログとは別にサブ（もしくは、クローン）として今後公開するかも知れません。あしからず。

以上。

