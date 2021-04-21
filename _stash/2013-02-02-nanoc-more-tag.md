---
layout   : single
title    : "nanoc - more タグ埋め込み！"
published: true
date     : 2013-02-02 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") でのブログ運用で、内容の長い記事を「続きを読む」等でコンパクトにしたい時があります。（トップページ等で）

ヘルパーに専用のメソッドを用意することで実現可能です。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。
- nanoc 用ブログヘルパー（Blogging, Rendering, LinkTo）のインクルード設定済み。
- テンプレート機能は ERB を使用。

### 1. more タグ埋め込み

記事内の適当な箇所に `more` タグを埋め込む。

File: `articles/2013-01-16-test-more-tag.md`

{% highlight yaml linenos %}
---
title: TEST [ more tag ]
created_at: 2013/01/16 00:20:00
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

<!--more-->

### Header 3

> This is a blockquote.
> 
> This is the second paragraph in the blockquote.
>
> ## This is an H2 in a blockquote

{% endhighlight %}

### 2. ヘルパー編集

ヘルパー用のファイル（当方はデフォルトの `lib/default.rb` ではなく `lib/helpers.rb` とした）に以下のような記述を追加する。

File: `lib/helpers.rb`

{% highlight ruby linenos %}
def get_post_start(post)
  content = post.compiled_content
  if content =~ /\s<!--more-->\s/
    content = content.partition('<!--more-->').first +
    "<div class='read-more'><a href='#{post.path}'>続きを読む &raquo;</a></div>"
  end
  return content
end
{% endhighlight %}

### 3. メソッド埋め込み

`more` タグを使用したい HTML ファイルを編集する。  
当方の場合、トップページで使用したいので `content/index.html` を編集した。  
（以下は当方の一例）

File: `content/index.html`

{% highlight html linenos %}
<article>
  <%= get_post_start(post) %>
</article>
{% endhighlight %}

### 4. コンパイル

いつものようにコンパイルする。

File: `Rules`

{% highlight ruby linenos %}
$ nanoc compile
{% endhighlight %}

### 5. 確認

`nanoc view` 実行後、ブラウザで確認してみる。  
指定の場所に「続きを読む」が表示されるはずである。  
（以下は現時点での（調整中段階の）一例）

![NANOC_MORE_TAG]({{site.baseurl}}/images/2013/02/02/NANOC_MORE_TAG.png "NANOC_MORE_TAG")

### 6. 参考サイト

- [nanoc - yet.org](http://www.yet.org/2012/11/nanoc/ "nanoc - yet.org")

---

これで、トップページでの記事の一覧でもコンパクトに表示されるようになりました。

`more` タグを使用せず、無条件に記事の先頭から指定の文字数分を表示させる方法もあるようですが、自分の意図しない箇所で記事が途切れるのに違和感を感じるので、今回は上記の方法を採用しました。

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

