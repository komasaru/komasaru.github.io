---
layout   : single
title    : "Web サイトの sitemap.xml と robots.txt について！"
published: true
date     : 2013-07-31 00:20:00 +0900
comments : true
categories:
- Webサイト
- ブログ
tags:
- HTML
---

Web サイトやブログサイト等を運営していると、アクセスが気になります。

検索エンジンで検索に引っかかるようにするには色々と手段はありますが、検索エンジンのクローラ（ロボット）により収集されたデータで検索エンジン側でインデックスされる必要もあります。

黙っていれば勝手にクローラによりクロールされますが、ある程度指定しておいた方がよいでしょう。

"sitemap.xml" と "robots.txt" がキーになります。  
以下に概要を記録しておくことにしました。

<!--more-->

### 1. sitemap.xml について

"sitemap.xml" は、検索エンジンのクローラがより正確にサイトの情報を取得できるようにするためのファイルです。

"sitemap.xml" が無くても検索エンジンのクローラはある頻度でサイトをクロールしますが、クローラの都合で勝手にクロールされたり、なかなかクロールされないページがあったりするので、SEO 対策として "sitemap.xml" ファイルを作成するのです。

#### 1-1. sitemap.xml の記述方法

"sitemap.xml" の記述方法は「[sitemaps.org - Protocol](http://www.sitemaps.org/protocol.html "sitemaps.org - Protocol")」に記載されいる。

例として、以下のような書式になる。（※配置場所はサイトのドキュメントルート）

``` html 
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>http://www.mk-mode.com/</loc>
      <lastmod>2013-07-10T13:57:16+09:00</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
   </url>

     :
     :

</urlset>
```

- `<?xml version="1.0" encoding="UTF-8"?>` は決まり文句。（必須）
- `urlset` （必須）  
  このタグ内に全てのページについての記載をする。
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` は決まり文句。
- `url` （必須）  
  ページの単位。
- `loc` （必須）  
  ページの URL を指定する。
- `lastmod` （任意）  
  [W3C Datetime formart](http://www.w3.org/TR/NOTE-datetime "W3C Datetime formart") に基づいたフォーマットでファイルの最終更新日時を指定する。  
  `2013-07-10T13:57:16+09:00` や `2013-07-10` のように。
- `changefreq` （任意）  
  更新頻度を以下の中から選択して指定する。  
  * `always` - アクセスのたびに更新されている
  * `hourly` - １時間に１回
  * `daily` - １日に１回
  * `weekly` - １週間に１回
  * `monthly` - １ヶ月に１回
  * `yearly` - １年に１回
  * `never` - 更新されない（アーカイブページに指定する）
- `priority` （任意）  
  サイト内の他の URL と比較した優先度を 0.0 〜 1.0 の値で指定する。（デフォルトは0.5）  
  例えば、トップページを 1.0 に、サブページを 0.8 に、サブページ内の個別ページを 0.5 に、というように。

#### 1-2. 注意

1. 更新頻度（`changefreq`）を指定したからといって、クローラがそのとおりにクロールするという訳でもない。`never` でも、不意の更新に備えてクロールするようだ。
2. "sitemap.xml" をブラウザで確認した際に "この XML ファイルにはスタイル情報が関連づけられていないようです。以下にドキュメントツリーを表示します。" と表示されるかも知れないが、RSS に関するものなので気にする必要はない。（"sitemap.xml" の正式な書き方をしているのだから）
3. 規模の大きなサイトの場合、自分で入力するのは大変面倒なので、実際はサイトマップ作成サービスや各種ツールを使うのが良かろう。
4. Web サーバが GZip 圧縮に対応しているなら、"sitemap.xml" ではなく "sitemap.xml.gz" と圧縮したファイルを置いてもよい。

#### 1-3. 参考サイト

- [sitemaps.org - プロトコル](http://www.sitemaps.org/ja/protocol.html "sitemaps.org - プロトコル")

### 2. robots.txt について

"robots.txt" は、"sitemap.xml" の位置を検索エンジンのクローラに通知したり、クローラされたくないディレクトリを指定したりするファイルである。

#### 2-1. robots.txt の記述方法

"robots.txt" の記述方法は「[http://www.robotstxt.org/](The Web Robots Pages "http://www.robotstxt.org/")」に記載されいる。

例として、以下のような書式になる。（※配置場所はサイトのドキュメントルート）

``` bash 
User-agent: *
Disallow: /hoge/
Sitemap: http://www.mk-mode.com/octopress/sitemap.xml
```

- `User-agent`  
  クローラを指定する。  
  全てに対して有効にしたければ `*` を指定するが、通常はこれで問題ない。  
  「Google クローラ」を指定するのなら `googlebot`、「Yahoo!クローラ」を指定するのなら `Slurp`、「MSN Live Search クローラ」を指定するのら `msnbot` とする。
- `Disallow`  
  クロールを拒否したいディレクトリ・ファイルを指定する。
- `Allow`  
  クロールを許可するディレクトリ・ファイルを指定する。  
  デフォルトで許可しているので指定する必要はない。`Disallow` で拒否指定したディレクトリ内で許可したいディレクトリがあれば指定する。
- `Sitemap`  
  "sitemap.xml" ファイルの位置を指定する。

#### 2-2. クロール拒否設定

クロール（インデックスを作成）を拒否したい場合は、HTML の `head` タグ内に以下のような `meta` タグを追加して対応することも可能である。  
（"robots.txt" ファイルを配置できない環境でクロールを拒否したい場合にも有効）

``` html 
<meta name=”robots” content=”noindex,nofollow”>
```

`noindex` はインデックスの作成拒否、`nofollow` はサイトの巡回拒否、という意味。`noindex,nofollow` の代わりに `none` としてもよい。

`name` 属性の `robots` はクローラ全般を対象としているが、特定のクローラだけを指定したければ、`robots` ではなく `googlebot`（Google クローラの場合）のように指定する。

#### 2-3. 注意

`Disallow` にはクロールしても意味が無かったり、秘密にしておきたいディレクトリやファイルを指定することになるかと思うが、それを悪用する（敢えてアクセスして情報を入手しようとする）クローラもあるので注意が必要。

アクセスされたくなければ、認証をかけたり、".htaccess"（WebサーバにApacheを使用している場合）を使用したりする。

#### 2-4. 参考サイト

- [The Web Robots Pages](http://www.robotstxt.org/ "The Web Robots Pages")
- [robots.txtファイルの使い方や記述方法を解説します - SEOのホワイトハットジャパン](http://whitehatseo.jp/robots-txt%E3%81%AE%E8%A8%98%E8%BF%B0%E4%BE%8B%E3%81%A8%E4%BD%BF%E3%81%84%E6%96%B9%E3%82%92%E8%A7%A3%E8%AA%AC%E3%81%97%E3%81%BE%E3%81%99/ "robots.txtファイルの使い方や記述方法を解説します - SEOのホワイトハットジャパン")

### 3. 検索エンジンサイト登録

"sitemap.xml" を作成しても、検索エンジンサイトに登録しないと意味がない。  
登録することで、自動でクローラが巡回してくれる。

登録方法は検索エンジンサイトにより異なるので、ここでは紹介しないが、難しいことではない。  
（[こちら](http://tafcue.com/2009/05/seo-xml-sitemap001.html "XML サイトマップファイル（sitemap.xml）の作成方法 （SEO対策） - ネットビジネス支援 情報サイト")が参考になる）

ちなみに、Google の場合は「ウェブマスターツール」（要 Google アカウント）の「クロール」ー「サイトマップ」でサイトを追加してサイトマップを送信（登録）する。（少し前は登録方法が若干異なっていたかもしれない）  
また、Yahoo! の場合は、以前は「サイトエクスプローラ」で登録していたようだが、現在は終了している。Google と連動しているので Google に登録しておけばよいということ。  
さらに、MSN の場合は、「Bing Web マスターツール」（要 マイクロソフトアカウント）で登録する。

---

常にサイトのアクセスや SEO を気にしている方なら、常識的な話でした。

やはり、勝手にクローラに巡回されるよりある程度制限（設定）しておいた方がよいでしょう。

以上。

