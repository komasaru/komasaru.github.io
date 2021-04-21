---
layout   : single
title: 'Octopress - PubSubHubbub でリアルタイムフィード配信'
published: true
date     : 2017-07-30 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Feed
- XML
---

PubSubHubbub というフィードをリアルタイムで配信する Google 提唱のプロトコルを利用し、 Ruby 製ブログシステム Octopress の更新情報配信時に、 Google 等にほぼリアルタイムにインデックスしてもらう方法についての記録です。

<!--more-->

### 1. 設定ファイルの編集

設定ファイル "＿config.yml" に、以下のような記述を追加する。

File: `_config.yml`

{% highlight text linenos %}
# PubSubHubbub
atom_url: http://www.mk-mode.com/octopress/atom.xml
hub_urls:
  - https://pubsubhubbub.appspot.com
  - https://push.superfeedr.com
{% endhighlight %}

* フィードの URL を "＿config.yml" 内の `site` や `subscribe_rss` を組み合わせて生成するなら、敢えて `atom_url` を設定しなくてもよいだろう。
* `hub_urls` は、複数の URL に対応できるよう配列化している。  
  （Web 上には1つの URL しか指定できない例がよく紹介されているが）
* Superfeedr について
  + 以前は `https://superfeedr.com/hubbub` だった？
  + ユーザ登録していれば、 `https://username.superfeedr.com` ？（未確認）

### 2. フィード用テンプレートの編集

フィード用テンプレート "source/atom.xml" を以下のように編集する。

* 8行目 `link` タグに `type` 属性を追加。  
* 10行目（`link` タグと `updated` タグの間）を追加。  
* 以下の全角の `｛` や `｝` は、実際は半角。

File: `source/atom.xml`

{% highlight xml linenos %}
---
layout: null
---
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">

  <title><![CDATA[｛｛ site.title | cdata_escape ｝｝]]></title>
  <link href="｛｛ site.url ｝｝/atom.xml" rel="self" type="application/atom+xml" />
  <link href="｛｛ site.url ｝｝/" />
  ｛% for hub_url in site.hub_urls %｝<link href="｛｛ hub_url ｝｝" rel="hub" />｛% endfor %｝
  <updated>｛｛ site.time | date_to_xmlschema ｝｝</updated>
  <id>｛｛ site.url ｝｝/</id>
  <author>
    <name><![CDATA[｛｛ site.author | strip_html ｝｝]]></name>
    ｛% if site.email %｝<email><![CDATA[｛｛ site.email ｝｝]]></email>｛% endif %｝
  </author>
  <generator uri="http://octopress.org/">Octopress</generator>

  ｛% for post in site.posts limit: 20 %｝
  <entry>
    <title type="html"><![CDATA[｛% if site.titlecase %｝｛｛ post.title | titlecase | cdata_escape ｝｝｛% else %｝｛｛ post.title | cdata_escape ｝｝｛% endif %｝]]></title>
    <link href="｛｛ site.url ｝｝｛｛ post.url ｝｝" />
    <updated>｛｛ post.date | date_to_xmlschema ｝｝</updated>
    <id>｛｛ site.url ｝｝｛｛ post.id ｝｝</id>
    <content type="html"><![CDATA[｛｛ post.content | expand_urls: site.url | cdata_escape ｝｝]]></content>
  </entry>
  ｛% endfor %｝
</feed>
{% endhighlight %}

### 3. ビルド定義ファイルの編集

ビルド定義ファイル "Rakefile" を編集する。  
（`require` 記述部に以下の3行、 `:deploy` タスク内に PubSubHubbub に関する行を追加）

File: `Rakefile`

{% highlight text linenos %}
require 'yaml'
require 'net/http'
require 'uri'

#
# ===< 中略 >===
#

##############
# Deploying  #
##############

desc "Default deploy task"
task :deploy do
  # Check if preview posts exist, which should not be published
  if File.exists?(".preview-mode")
    puts "## Found posts in preview mode, regenerating files ..."
    File.delete(".preview-mode")
    Rake::Task[:generate].execute
  end

  Rake::Task[:copydot].invoke(source_dir, public_dir)
  Rake::Task["#{deploy_default}"].execute

  # PubSubHubbub
  cfg = YAML.load_file('_config.yml')
  cfg["hub_urls"].each do |hub_url|
    resp, data = Net::HTTP.post_form(
      URI.parse(hub_url),
      {'hub.mode' => 'publish','hub.url' => cfg["atom_url"]}
    )
    raise "!! Hub notification error: #{resp.code} #{resp.msg}, #{data}" unless resp.code == "204"
    puts "## Notified hub (#{hub_url}) that feed #{cfg["atom_url"]} has been updated"
  end
end
{% endhighlight %}

### 4. ジェネレート＆デプロイ

あとは、いつものようにジェネレート＆デプロイすればよい。

``` text
$ bin/rake generate
$ bin/rake deploy
```

もしくは、

``` text
$ bin/rake gen_deploy
```

### 5. 確認

生成されたフィードを確認してみる。（7行目（`hub` に関する記述）が追加されているのを確認する）

File: `atom.xml`

{% highlight xml linenos %}
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">

  <title><![CDATA[mk-mode BLOG]]></title>
  <link href="https://www.mk-mode.com/octopress/atom.xml" rel="self" />
  <link href="https://www.mk-mode.com/octopress/" />
  <link href="https://pubsubhubbub.appspot.com" rel="hub" /><link href="https://push.superfeedr.com" rel="hub" />
  <updated>2017-07-21T23:07:52+09:00</updated>
  <id>https://www.mk-mode.com/octopress/</id>

        :
  ===< 後略 >===
        :
{% endhighlight %}

作成したばかりのブログ記事が Google 検索でヒットすることも確認する。

**しかし、現時点ではなぜかうまく機能しない。**  
**デプロイ直後に Google からクロールされているのは確認できるが、なかなかインデックスされない。**  
**原因調査中！**

---

以上。

