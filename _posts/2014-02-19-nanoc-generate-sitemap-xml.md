---
layout   : single
title    : "nanoc - sitemap.xml 生成！"
published: true
date     : 2014-02-19 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
- XML
---

Ruby 製の静的 CMS システム [nanoc](http://nanoc.stoneship.org/ "nanoc") でコンパイル時に sitemap.xml を生成させる方法についての記録です。

sitemap.xml は検索エンジンのクローラ（ボット）にクロールを許可する一覧が記述されている XML ファイルです。人間が見てどうこうするものではありません。

<!--more-->

### 0. 前提条件

- Ruby 2.1.0-p0 を想定。
- RubyGems 2.2.1 を想定。
- nanoc 3.6.7 を想定。
- Nanoc サイトの URL は `http://www.mk-mode.com/nanoc` を想定。  
  （当方は、ベースは `http://www.mk-mode.com` とし、サブディレクトリ運用している）
- sitemap ジェネレータには "Nanoc3::Helpers::XMLSitemap" という nanoc ヘルパを使用する

### 1. Gem パッケージ builder のインストール

"Nanoc3::Helpers::XMLSitemap" を使用するには builder という Gem パッケージが必要なので、未インストールならインストールする。

``` text
$ gem install builder
```

### 2. ヘルパのインクルード設定

Nanoc::Helpers::XMLSitemap を使うにはインクルードする必要があるので、"lib/default.rb" に以下の記述を追加する。

File: `lib/default.rb`

{% highlight ruby linenos %}
include Nanoc3::Helpers::XMLSitemap
{% endhighlight %}

### 3. URL の設定

`base_url` を設定する必要があるので、設定していなければ "config.yaml" に以下の記述を追加する。

File: `config.yaml`

{% highlight text linenos %}
base_url: http://www.mk-mode.com
{% endhighlight %}

### 4. アイテムの生成

"sitemap.xml" 用アイテムを生成する。（１行記述するだけなので `create_item` する程でもないが）
（当方はサブディレクトリ運用しているの `nanoc/` を付与している）

``` text
$ nanoc create_item nanoc/sitemap
      create  content/sitemap.html
An item has been created at /nanoc/sitemap/.
```

### 5. アイテムの編集

生成した "sitemap.xml" 用アイテムを以下のように編集する。（当方はサブディレクトリ運用しているの `nanoc/` を付与している）  
（`<%= ... %>` は eRuby（組み込み Ruby）。隠しファイル、バイナリファイルは除外）

File: `content/nanoc/sitemap.html`

{% highlight html linenos %}
<%= xml_sitemap :items => @items.reject{ |i| i[:is_hidden] || i.binary? } %>
{% endhighlight %}

デフォルトでは各記事に対して `loc` と `lasdmod` タグが生成されるが、各記事ファイル内（yaml 部分）で `changefreq`（更新間隔） や `priority`（優先度）を指定していれば、それも反映されるようだ。

### 6. Rules の編集

"sitemap.html" をコンパイルし "sitemap.xml" を生成するよう、以下のような記述を追加する。  
`erb` は eRuby のこと。また `compile`, `route` の順にも注意する。（`compile *` や `route *` より先に記述）  
（当方はサブディレクトリ運用しているの `/nanoc/` を付与している）

File: `Rules`

{% highlight ruby linenos %}
compile '/nanoc/sitemap' do
  filter :erb
end

route '/nanoc/sitemap' do
  item.identifier.chop + '.xml'
end
{% endhighlight %}

### 7. コンパイル

コンパイルし、エラーが発生しないことを確認する。

``` text
$ nanoc compile
```

### 8. 確認

"output" ディレクトリに "sitemap.xml" が作成されていること、内容が正しいことを確認する。  
以下は、当方の "sitemap.xml" の一部。

File: `sitemap.xml`

{% highlight xml linenos %}
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://www.mk-mode.com/nanoc/</loc>
    <lastmod>2013-04-27</lastmod>
  </url>
  <url>
    <loc>http://www.mk-mode.com/nanoc/archives/</loc>
    <lastmod>2013-04-27</lastmod>
  </url>
  <url>
    <loc>http://www.mk-mode.com/nanoc/2009/01/05/05165522/</loc>
    <lastmod>2014-02-06</lastmod>
  </url>
  <url>
    <loc>http://www.mk-mode.com/nanoc/2009/01/05/05190900/</loc>
    <lastmod>2014-02-06</lastmod>
  </url>

    :

{% endhighlight %}

### 9. 参考サイト

- [Module: Nanoc::Helpers::XMLSitemap — Documentation by YARD 0.8.5.2](http://nanoc.ws/docs/api/Nanoc/Helpers/XMLSitemap.html "Module: Nanoc::Helpers::XMLSitemap — Documentation by YARD 0.8.5.2")

---

以上。

