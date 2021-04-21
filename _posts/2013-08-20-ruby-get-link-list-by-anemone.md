---
layout   : single
title    : "Ruby - Anemone でサイト内リンク一覧取得！"
published: true
date     : 2013-08-20 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

通常、サイト内のリンクを検索するには  HTML パーサ等を使用するかと思います。（Ruby だと Nokogiri, Hpricot 等）

しかし、自分で HTML パーサを使用しなくても簡単にリンクの一覧を取得できるライブラリがあります。

Anemone という RubyGems ライブラリです。

以下、インストール方法と使用例の紹介です。

<!--more-->

#### 0. 前提条件

- Ruby 2.0.0-p247 での作業・動作確認を想定。

#### 1. anemone インストール

RubyGems ライブラリなので、いつものようにインストールできる。

``` bash 
$ gem install anemone
```

#### 2. Ruby スクリプト作成例

以下のように、簡単な例を作成してみた。

File: `test_anemone.rb`

{% highlight ruby linenos %}
require 'anemone'

url = "http://www.mk-mode.com/rails/"
opts = {
  :skip_query_strings => true,
  :depth_limit => 1,
}

Anemone.crawl(url, opts) do |anemone|
  anemone.on_every_page do |page|
    puts page.url
  end
end
{% endhighlight %}

オプションについて、

- `:skip_query_strings => true` はクエリストリング（URL に付与する `?` で始まるオプション文字列）はスキップする。
- `:depth_limit => 1` は読み込む階層の深さを `1` に設定。（該当 URL 内に存在するリンクのみを検出するという意味）  
  デフォルトは `:depth_limit => false` で、存在する URL を再帰的に取得していく。
- `:storage` を設定すれば MongoDB 等のデータベースも使用できるようだ。（デフォルトは使用しない（RAMを使用する）設定になっている）

その他のオプションデフォルト値は、"＜anemone インストールディレクトリ＞/lib/anemone/core.rb" を見れば分かる。

#### 3. Ruby スクリプト実行

作成した Ruby スクリプトを実行してみる。

``` bash 
$ ruby test_anemone.rb
http://www.mk-mode.com/rails/
http://www.mk-mode.com/rails/calendar/calendar
http://www.mk-mode.com/rails/calendar/calendar/
http://www.mk-mode.com/rails/calendar/calendar_year
http://www.mk-mode.com/
http://www.mk-mode.com/rails/
http://www.mk-mode.com/rails/calendar/holiday
http://www.mk-mode.com/rails/calendar/sekki24
http://www.mk-mode.com/octopress/
http://www.mk-mode.com/rails/calendar/zassetsu
        :
===< 途中省略 >===
        :
http://www.mk-mode.com/octopress/2013/08/04/octopress-sitemap-option/
http://www.mk-mode.com/octopress/2013/08/03/mysql-innodb-optimization
http://www.mk-mode.com/octopress/2013/08/03/mysql-innodb-optimization/
http://www.mk-mode.com/octopress/2013/08/01/blog-access
http://www.mk-mode.com/octopress/2013/08/01/blog-access/
http://www.mk-mode.com/rails/contact
http://www.mk-mode.com/octopress/2013/07/31/web-sitemap-robots
http://www.mk-mode.com/octopress/2013/07/31/web-sitemap-robots/
http://www.mk-mode.com/rails/feed/atom.xml
http://www.mk-mode.com/rails/movies/Fedora_16_64_Server.flv
```

#### 参考サイト

- [Anemone - Ruby Web-Spider Framework](http://anemone.rubyforge.org/ "Anemone - Ruby Web-Spider Framework")
- [anemone - RubyGems.org - your community gem host](http://rubygems.org/gems/anemone "anemone - RubyGems.org - your community gem host")

---

単にサイト内の URL 一覧を取得するだけなら、HTML パーサを使用するより格段に便利です。

用途に合わせて使い分けると良いかも知れません。

以上。

