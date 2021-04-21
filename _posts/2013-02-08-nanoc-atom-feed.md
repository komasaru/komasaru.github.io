---
layout   : single
title    : "nanoc - Atom フィード配信！"
published: true
date     : 2013-02-08 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
- Feed
- atom
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") ブログで、Atom フィードを配信する方法についてです。

RSS 1.0, 2.0 等のフィードもありますが、当方は最近は Atom フィード１本に統一しています。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。
- nanoc 用ブログヘルパー（Blogging, Rendering, LinkTo, Tagging）のインクルード設定済みで、nanoc をブログとして利用できるように各種設定も済んでいる。

### 1. Builder インストール

XML を作成するための RubyGems パッケージ Builder が未インストールならインストールする。

``` bash 
$ sudo gem install builder
```

### 2. config.yaml 編集

Atom フィードの生成に使われる属性を `config.yaml` に設定する。  
以下は当方の例。

File: `config.yaml`

{% highlight ruby linenos %}
title: mk-mode SITE
base_url: http://www.mk-mode.com/nanoc
author_name: mk-mode.com
author_uri: http://www.mk-mode.com
{% endhighlight %}

### 3. テンプレート作成

Atom フィード表示用のテンプレート `content/atom_feed.html` を以下の内容で作成する。  
以下は当方の例で、最近の10件を表示するようにしている。

File: `content/atom_feed.html`

{% highlight html linenos %}
<%= atom_feed :limit => 10 %>
{% endhighlight %}

### 4. Rules 編集

テンプレート `content/atom_feed.html` のコンパイル・ルーティング設定をする。

File: `Rules`

{% highlight ruby linenos %}
compile '/atom_feed' do
  filter :erb
end

route '/atom_feed' do
  '/atom_feed.xml'
end
{% endhighlight %}

### 5. HEAD タグ編集

Atom フィードを使用するために `head` タグ内に以下の記述を追加する。  
以下は当方の例。

File: `layouts/_head.html`

{% highlight html linenos %}
<link rel="alternate" type="application/atom+xml" href="/atom_feed.xml" title="mk-mode BLOG">
{% endhighlight %}

### 6. リンク作成

Atom フィードのページを表示するためのリンクを適当な位置に作成する。  
当方はサイドバーにリンクを作成した。

### 7. 確認

nanoc をコンパイル・プレビューして `http://localhost:3000/atom_feed.xml` にアクセスして確認してみる。  
また、リンクをクリックして同じページへ遷移するか確認してみる。  
以下は当方の例。

![NANOC_ATOM_FEED]({{site.baseurl}}/images/2013/02/08/NANOC_ATOM_FEED.png "NANOC_ATOM_FEED")

### 8. 参考サイト

- [nanoc導入メモ 3/5 「カスタマイズ」編 - ナレッジエース](http://n.blueblack.net/articles/2012-05-05_01_nanoc_customize/ "nanoc導入メモ 3/5 「カスタマイズ」編 - ナレッジエース")

---

これで、Atom フィードが使えるようになりました。  
通常のフィード購読以外に、更新 Ping の送信にも使えます。

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

