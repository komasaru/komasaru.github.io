---
layout   : single
title    : "Rails - sitemap generator で sitemap.xml 生成！"
published: true
date     : 2013-08-08 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- HTML
- Ruby
- Rails
---

Web サイトにはサイトマップというものを設置して、そのサイトにどのようなページ（リンク）があるのかを知らせる方法があります。
人が目で見て確認するサイトマップページ（HTML 形式）はよく見かけると思いますが、検索エンジンのクローラ（ボット）に検索してもらうためには、HTML 形式のサイトマップではなく、XML 形式のものが必要となります。（通称、sitemap.xml（robots.txt と併用））

サイトの規模が大きくなると、自分でサイトマップを作成するのは手がかかりすぎて大変です。
sitemap.xml を生成してくる Web サービスも存在しますが、サイトを更新する頻度が高い場合には、その都度そのサービスを利用するのも面倒です。

Rails 製サイトの場合、sitemap generator という RubyGem ライブラリを利用すれば sitemap.xml ファイルを容易に生成できるようになるようなので、試してみました。

以下、作業記録です。

<!--more-->

#### 0. 前提条件

- Ruby 2.0.0-p247, Rails 4.0.0 で作業、動作確認した。

#### 1. Gemfile 編集

Gemfile に sitemap generator をインストールするための記述を追加する。

File: `Gemfile`

{% highlight ruby linenos %}
gem 'sitemap_generator'
{% endhighlight %}

#### 2. インストール

いつものようにインストールする。

``` bash 
$ bundle install

$ bundle list | grep 'sitemap*'
  * sitemap_generator (4.1.1)
```

sitemap_generator_4.1.1 がインストールされた。

#### 3. sitemap generator 設定ファイル生成

以下のようにして、sitemap generator の設定ファイルを生成する。  

``` bash 
$ rake sitemap:install
created: config/sitemap.rb
```

config ディレクトリ配下に sitemap.rb が生成された。

#### 4. sitemap.rb 編集

sitemap.rb を以下のように編集する
（sitemap.rb 内のにも記述例が記載されている）

File: `config/sitemap.rb`

{% highlight ruby linenos %}
# 自サイトのホスト名
SitemapGenerator::Sitemap.default_host = 'http://www.mk-mode.com'

# デフォルトでは public ディレクトリ配下にサイトマップが作成されるが、
# サイトマップを配置する場所をさらに指定したい場合は以下のように追加する。
# SitemapGenerator::Sitemap.sitemaps_path = 'sitemaps/'

SitemapGenerator::Sitemap.create do
  # top ディレクトリ、blog ディレクトリのサイトマップを生成する場合
  add '/top',  :priority => 0.7, :changefreq => 'daily'
  add '/blog', :priority => 0.7, :changefreq => 'daily'
end
{% endhighlight %}

また、オプションを指定しなかった場合は、以下がデフォルトで設定されるようだ。

``` ruby 
:priority => 0.5, :changefreq => 'weekly',
:lastmod => Time.now, :host => default_host
```

以下のような設定を追加すると、sitemap.xml.gz と sitemap1.xml.gz が生成されるようになる。  
sitemap.xml.gz には sitemap1.xml.gz へのリンクが設定され、sitemap1.xml.gz に実際のサイトマップが生成される。  
サイトマップが増えると、sitemap2.xml.gz, sitemap3.xml.gz ... と増える。

File: `config/sitemap.rb`

{% highlight ruby linenos %}
SitemapGenerator::Sitemap.create_index = true
{% endhighlight %}

#### 5. サイトマップ生成

以下のコマンドを実行する。

``` ruby 
$ rake sitemap:refresh
In /var/www/rails/mk-mode/public/
+ sitemap.xml.gz                                           3 links /  364 Bytes
Sitemap stats: 3 links / 1 sitemaps / 0m00s

Pinging with URL http://www.mk-mode.com/sitemap.xml.gz:
  Successful ping of Google
  Successful ping of Bing
  Successful ping of Sitemap Writer
```

設定したディレクトリ配下に sitemap.xml.gz が作成される。  
また、同時に Google, Bing, Sitemap Writer に送信されるようだ。（当然、それぞれサイト・サイトマップを登録していないと意味がない？）

#### 6. sitemap.xml 確認

作成された sitemap.xml.gz を展開して sitemap.xml の内容を確認してみる。

File: `sitemap.xml`

{% highlight xml linenos %}
<?xml version="1.0" encoding="UTF-8"?><urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:geo="http://www.google.com/geo/schemas/sitemap/1.0" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:pagemap="http://www.google.com/schemas/sitemap-pagemap/1.0" xmlns:xhtml="http://www.w3.org/1999/xhtml"><url><loc>http://www.mk-mode.com</loc><lastmod>2013-07-23T22:24:41+09:00</lastmod><changefreq>always</changefreq><priority>1.0</priority></url><url><loc>http://www.mk-mode.com/top</loc><lastmod>2013-07-23T22:24:41+09:00</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url><url><loc>http://www.mk-mode.com/blog</loc><lastmod>2013-07-23T22:24:41+09:00</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url></urlset>
{% endhighlight %}

改行やスペースが削除されていていて、このままでは人間には見にくい（実際、クローラ（ボット）のためのファイルなので仕方ない）が、ブラウザで確認すると見やすくなる。

![RAILS_SITEMAP_GENERATOR]({{site.baseurl}}/images/2013/08/08/RAILS_SITEMAP_GENERATOR.png "RAILS_SITEMAP_GENERATOR")

#### 7. 補足

クラーラに読ませるサイトマップと言えば、大抵 "sitemap.xml" という XML 形式のファイルであるが、Web サーバ側で GZip 圧縮に対応していれば、"sitemap.xml.gz" という GZip 形式のファイルでもよい。  
体感的に違いは感じられないが、圧縮されていればトラフィックの節約にもなるので、GZip 対応しているのなら "sitemap.xml.gz" の方がよいでしょう。

また、今回のように sitema_generator を使用する方法以外に、Rails で動的に（sitemap.xml にアクセスがあるたびにコントローラで）処理を行う方法もあるようだ。  
ただ、クローラにアクセスされるたびに処理が動くので、負荷が心配になるかもしれない。（実際、当方はそれが心配でその方法は採用しなかった）

#### 参考サイト

- [kjvarga/sitemap_generator](https://github.com/kjvarga/sitemap_generator "kjvarga/sitemap_generator")

sitemap.xml や robots.txt については、当ブログ過去記事もご参照ください。

- [Web サイトの sitemap.xml と robots.txt について！]({{site.baseurl}}/2013/07/31/web-sitemap-robots "Web サイトの sitemap.xml と robots.txt について！")

---

sitemap.xml の設定をしなかった場合に比べて、設定した場合はより自分の意図したとおりに検索エンジンのクローラがクロールしてくれるので、なかなか検索エンジンにインデックスされないという事態は減少するでしょう。  
（ただ、クローラは sitemap.xml の設定通りにクロールするとも限らないようですし、robots.txt とともに悪用するクローラもいるようですが）

以上。

