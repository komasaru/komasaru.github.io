---
layout   : single
title    : "Octopress - sitemap.xml に更新頻度・優先度追加！"
published: true
date     : 2013-08-04 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
---

Ruby 製静的ブログシステム [Octopress](http://octopress.org/ "Octopress") では、ジェネレート時に sitemap.xml を生成してくれるプラグインがデフォルトで用意されています。  
sitemap.xml は、検索エンジンのクローラに読ませるサイトのリンク情報・更新情報等が記載された XML 形式のファイルです。（「[Web サイトの sitemap.xml と robots.txt について！]({{site.baseurl}}/2013/07/31/web-sitemap-robots "Web サイトの sitemap.xml と robots.txt について！")」も参照）

適切なフォーマットで生成されるので、全く問題ありませんが、必須でないタグのうち `changefreq` タグ（更新頻度）と `priority` タグ（優先度）は組み込まれません。

以下、ジェネレート時に `changefreq` タグと `priority` タグも組み込むようにする設定についての記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Octopre 2.0.0 を使用。
- ジェネレートに使用する Ruby は 2.0.0-p247 を想定。
- 調査した結果判明したことを記録しているだけであり、当方は実際には運用で実行はしていない。

#### 1. sitemap.xml 確認（対応前）

Octopress でジェネレートした際に生成される sitemap.xml は、デフォルトでは以下のようになります。

File: `sitemap.xml`

{% highlight xml linenos %}
<?xml version='1.0' encoding='UTF-8'?---
＜記事本文＞

{% endhighlight %}

ちなみに、記事用のファイルではなくアーカーブやカテゴリ別ページ用のファイルも同様に設定できる。

#### 2. ジェネレート

いつものようにジェネレートする。

``` bash 
$ rake generate
```

#### 3. sitemap.xml 確認（対応後）

生成された sitemap.xml ファイルの内容を確認してみる。

File: `sitemap.xml`

{% highlight xml linenos %}
<?xml version='1.0' encoding='UTF-8'?>
<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>

    <!-- 途中省略 -->

    <url>
        <loc>http://www.mk-mode.com/octopress/2013/08/04/octopress-sitemap-option/</loc>
        <lastmod>2013-07-22T23:15:42+09:00</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.5</priority>
    </url>

    <!-- 途中省略 -->

</urlset>
{% endhighlight %}

`changefreq` タグと `priority` タグも追加された。

---

実際には、当方は上記の設定は行なっていません。デフォルト設定のまま使用しています。

現在運用中のブログの途中から設定を追加すると、設定されていない過去記事と設定されている最近の記事が混在することになり、あまり気持ちが良くないからです。（無論、全記事に無条件に追記すればよい話ではありますが）

とりあえず、不便を感じていないので現状のままということにしています。

以上。

