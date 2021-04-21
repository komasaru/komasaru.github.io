---
layout   : single
title    : "Jekyll 環境の構築（テーマは Gem 化された Minimal Mistakes）！"
published: true
date     : 2019-01-27 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Jekyll
- Ruby
- HTML
- Markdown
- JavaScript
- CSS
---

プレーンテキストから静的な Web/Blog サイトを生成する Ruby 製ツール Jekyll の環境を構築してみました。（使用するテーマは Minimal Mistakes）

以下、作業記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.0-p0 での作業を想定。
* 作業ディレクトリはホームディレクトリ直下の `jekyll` を想定。
* Jekyll で使用するテーマは **Gem 化された** [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/ "Minimal Mistakes") とする。（4.15.1 を想定）
* Jekyll でブログサイトを運用することを想定。（後日、 Octopress からの移行も）
* GitHub Pages での運用は想定していない。（自前サーバでの運用を想定）
* Jekyll 3.8.5 での作業を想定。
* カスタマイズ量は多め。

### 1. Jekyll のインストール

``` text
$ sudo gem install jekyll
```

### 2. Minimal Mistakes のインストール

ディレクトリを作成し、そのディレクトリ内へ移動。

``` text
$ mkdir jekyll
$ cd jekyll
```

`Gemfile` を作成。（デフォルトの `liquid` を使用せず、`jekyll-archives` を使用することを想定）

File: `Gemfile`

``` ruby
source "https://rubygems.org"
gem "minimal-mistakes-jekyll"

# If you have any plugins, put them here!
group :jekyll_plugins do
  gem "jekyll-archives"
end
```

そして、インストール。

``` text
$ bundle install
```

### 3. 各種ファイルの配置

インストール直後は `Gemfile` と `Gemfile.lock` しかないので、 [ZIP ファイル](https://github.com/mmistakes/minimal-mistakes/archive/master.zip "Minimal Mistakes Theme") か [GitHub](https://github.com/mmistakes/minimal-mistakes "mmistakes/minimal-mistakes: A flexible two-column Jekyll theme perfect for building personal sites, blogs, and portfolios.") か `minimal-mistakes-jekyll` gem から取得するなどして、配置する。

最低限、以下は必要。

* `_data/navigation.yml`  
  取り急ぎ、 `main:` のみでよい。必要になった際にメニューとして追加していく。
* `_config.yml`  
  今回は `minimal-mistakes-jekyll` gem を使用するので、 `theme: "minimal-mistakes-jekyll"` の記述は必須。
* `index.html`  
  index ページ。

### 4. Jekyll の基本的な使い方

以下のサイトを参照すれば分かるが、

* [Jekyll](https://jekyllrb.com/ "Jekyll")
* [Jekyll Tips](https://jekylltips-ja.github.io/ "Jekyll Tips")

基本的には、

1. `_posts` ディレクトリ内に Yaml Front Matter 付き Markdown 形式で記述したテキストファイルを配置。
2. `bundle exec jekyll build` でビルド。
3. `bundle exec jekyll serve` でローカルサーバ起動。
4. Web ブラウザで `http://localhost:4000` にアクセスして確認。
5. （公開する場合は Web サーバにアップロードする）

記事ファイルの記述例。

``` text
---
layout   : single
title    : "Jekyll 環境の構築（テーマは Gem 化された Minimal Mistakes）！"
published: false
date     : 2019-01-27 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Jekyll
- Ruby
- HTML
- Markdown
- JavaScript
- CSS
---

以下、記事本文
※Markdown 形式、 Liquid 形式、 HTML 形式等で記述
```

これまでの最低限必要なファイルのみを配置した状態では、 Web ブラウザで次のように表示されるはず。

![JEKYLL]({{site.baseurl}}/images/2019/01/27/JEKYLL.png "JEKYLL")

### 5. ディレクトリ構成

以下、当方の例。  
基本的に、カスタマイズしたいもののみを `minimal-mistakes-jekyll` gem から複製して編集。必要であれば、新規追加も。

``` text
.
├── _data
│   └── navigation.yml
├── _includes   <= インクルードファイル
├── _layouts    <= レイアウトフィアル
├── _pages      <= 追加ページ用
├── _posts      <= 記事データ用
├── _site       <= このディレクトリ配下を Web サーバへ配置
├── assets      <= サイト内で使用する CSS, 画像, JS ファイル
│   ├── css
│   ├── images
│   └── js
├── images      <= 投稿に使用する画像ファイル
├── Gemfile
├── Gemfile.lock
├── _config.yml
└── index.html
```

### 6. 設定ファイルの編集

設定ファイル `_config.yml` を編集する。

#### 6-1. テーマの設定

``` yaml
# Theme Settings
#
# Review documentation to determine if you should use `theme` or `remote_theme`
# https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/#installing-the-theme

theme                : "minimal-mistakes-jekyll"
# remote_theme       : "mmistakes/minimal-mistakes"
minimal_mistakes_skin: "dark"  # "default", "air", "aqua", "contrast", "dark", "dirt", "neon", "mint", "plum", "sunrise"
```

* `theme` : 今回、 `minimal-mistakes-jekyll` の設定が必須。
* `remote_theme` : GitHub Pages を利用するならコメント解除。
* `minimal_mistakes_skin` : Minimal Mistakes テーマ用のスキン。好みのものに変更。

#### 6-2. サイトの設定

``` yaml
# Site Settings
locale               : "ja-JP"  # "en-US"
title                : "mk-mode BLOG"
title_separator      : "-"
name                 : "mk-mode.com"
description          : "このブログは自作の自宅サーバに構築した Debian GNU/Linux で運用しています。PC・サーバ構築等の話題を中心に公開しております。"
url                  : "https://www.mk-mode.com"  # the base hostname & protocol for your site e.g. "https://mmistakes.github.io"
baseurl              : "/blog"  # the subpath of your site, e.g. "/blog"
repository           : # GitHub username/repo-name e.g. "mmistakes/minimal-mistakes"
teaser               : # path of fallback teaser image, e.g. "/assets/images/500x300.png"
breadcrumbs          : false  # true, false (default)
words_per_minute     : 200
comments:
  provider           : "disqus"  # false (default), "disqus", "discourse", "facebook", "google-plus", "staticman", "staticman_v2", "utterances", "custom"
  disqus:
    shortname        : "xxxxxxxx"  # https://help.disqus.com/customer/portal/articles/466208-what-s-a-shortname-
  discourse:
    server           : # https://meta.discourse.org/t/embedding-discourse-comments-via-javascript/31963 , e.g.: meta.discourse.org
  facebook:
    # https://developers.facebook.com/docs/plugins/comments
    appid            :
    num_posts        : # 5 (default)
    colorscheme      : # "light" (default), "dark"
  utterances:
    theme            : # "github-light" (default), "github-dark"
    issue_term       : # "pathname" (default)
staticman:
  allowedFields      : # ['name', 'email', 'url', 'message']
  branch             : # "master"
  commitMessage      : # "New comment by {fields.name}"
  filename           : # comment-{@timestamp}
  format             : # "yml"
  moderation         : # true
  path               : # "/_data/comments/{options.slug}" (default)
  requiredFields     : # ['name', 'email', 'message']
  transforms:
    email            : # "md5"
  generatedFields:
    date:
      type           : # "date"
      options:
        format       : # "iso8601" (default), "timestamp-seconds", "timestamp-milliseconds"
  endpoint           : # URL of your own deployment with trailing slash, will fallback to the public instance
reCaptcha:
  siteKey            :
  secret             :
search               : true  # true, false (default)
search_provider      : "google"  # lunr (default), algolia, google
search_full_content  : true  # true, false (default)
algolia:
  application_id     : # YOUR_APPLICATION_ID
  index_name         : # YOUR_INDEX_NAME
  search_only_api_key: # YOUR_SEARCH_ONLY_API_KEY
  powered_by         : # true (default), false
google:
  search_engine_id   : "9999999999999999:9999999999"  # YOUR_SEARCH_ENGINE_ID
  instant_search     : false  # false (default), true
```

* `locale` : 言語・国
* `title` : サイトのタイトル
* `title_separator` : 記事タイトルとサイトタイトルの区切り記号
* `name` : 管理者名
* `description` : サイトの説明
* `url` : サイトの URL.（プロトコル(`http` or `https`) + `://` + ドメイン名）
* `baseurl` : サイトのサブディレクトリ。必要なら設定。
* `repository` : GitHub Pages を利用する場合に設定。
* `teaser` : 関連記事を表示する際に使用するデフォルトの画像。必要なら設定。
* `breadcrumbs` : いわゆるパンくずリスト。必要なら `true` に設定。
* `words_per_minute` : 1つの記事を読むのに必要な時間を計算するのに使用する単語数
* `comments` : コメント機能
  + `provider` : コメントを使用する場合に、使用したいコメントサービスを指定し、以降で各種アカウントを設定  
  `comments` と同じ階層に `staticman` が存在するが、これもコメントサービスの一種
* `reCaptcha` : コメント入力時に使用する Google のボット防御システム
  + `siteKey`, `secret` : 使用する場合に Site Key, Secret Code を取得して設定
* `search` : 検索サービス
* `search_provider` : 使用する検索サービス。
* `search_full_content` : 検索サービスとして Lunr を使用する際に1記事あたり全ての語を取得するための設定。（デフォルトは `false` で、1記事あたり 50語しか取得しない）
* `algolia` : `search_provider` に `algoria` を設定した場合に設定
* `google` : `search_provider` に `google` を設定した場合に設定  
  + `search_engine_id` : 使用する場合に、 Search Engine ID を取得して設定  
    （ちなみに、 Google Adsense 向けの Search Enigine なら、 ID の頭に `partner-pub-`が付く）
  + `instant_search` : 検索語を入力しながら（確定しなくとも）リアルタイムで検索結果を表示する機能（おそらく）

#### 6-3. SEO の設定

``` yaml
# SEO Related
google_site_verification: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
bing_site_verification  :
yandex_site_verification:
naver_site_verification :
```

* `google_site_verification` : Google のサイト所有者検証用コード  
  使用する場合は、 Google Search Console からコードを取得して設定。（`meta` タグにセットされる）  
  （ちなみに、 Google の場合、コードを `meta` タグにセットする方法以外に、指定の HTML ファイルを設置する方法等もある）

#### 6-4. SNS 系の設定

``` yaml
# Social Sharing
twitter:
  username: "account_name"
facebook:
  username :
  app_id   :
  publisher:
og_image: "https://www.mk-mode.com/blog/assets/images/about_me.png"  # Open Graph/Twitter default site image
# For specifying social profiles
# - https://developers.google.com/structured-data/customize/social-profiles
social:
  type : # Person or Organization (defaults to Person)
  name : # If the user or organization name differs from the site's name
  links: # An array of links to social media profiles
```

* `twitter` : 記事が共有される際に使用される。
* `facebook` : 記事が共有される際に使用される。
* `og_image` : 記事が共有された場合に使用される画像
* `social` : Google+ 用？（当方不使用なので、詳細不明）  
  Google+ 用だとしても、サービス自体が2019年に終了なので不要。

#### 6-5. アクセス解析の設定

``` yaml
# Analytics
analytics:
  provider: "google"  # false (default), "google", "google-universal", "custom"
  google:
    tracking_id : "UA-99999999-9"
    anonymize_ip: # true, false (default)
```

* `analytics` : アクセス解析の設定
  + `provider` : 使用するアクセス解析サービス
  + `google` : `provider` で `google` を設定した場合に設定
    - `tracking_id` : Tracking ID を取得して設定

#### 6-6. サイト管理者の設定

``` yaml
# Site Author
author:
  name    : "mk-mode.com"
  avatar  : "/assets/images/about_me.png"
  bio     : "Linux, Debian, IT, Server, PG, Ruby, Rails, Python, Fortran, PC, MariaDB, math, GIS, etc..." # "I am an amazing person."
  location: "Ruby City MATSUE"
  email   :
  links:
    - label: "Email"
      icon : "fas fa-fw fa-envelope-square"
      # url: "mailto:webmaster@mk-mode.com"
    - label: "mk-mode SITE"
      icon : "fas fa-fw fa-link"
      url  : "https://www.mk-mode.com"
    - label: "Twitter"
      icon : "fab fa-fw fa-twitter-square"
      url  : "https://twitter.com/account_name"
    - label: "Facebook"
      icon : "fab fa-fw fa-facebook-square"
      # url: "https://facebook.com/"
    - label: "GitHub"
      icon : "fab fa-fw fa-github"
      url  : "https://github.com/komasaru"
    - label: "Instagram"
      icon : "fab fa-fw fa-instagram"
      # url: "https://instagram.com/"
```

* `author` : サイト管理者の設定  
  ここで設定されたものは左サイドバーに表示される（Minimal Mistakes の場合）
  + `name` : サイトの管理者名
  + `avatar` : 管理者のアバタ画像
  + `bio` : 管理者のプロフィール
  + `location` : 管理者の居住地
  + `email` : 管理者のメールアドレス
  + `links` : 各種リンク
    - `label` : リンクのラベル
    - `icon` : リンクのアイコン。（Font Awesome で設定）
    - `url` : リンク URL. （コメント化すると、ラベル・アイコンは表示されない）

#### 6-7. フッタの設定

``` yaml
# Site Footer
footer:
  links:
    - label: "Twitter"
      icon : "fab fa-fw fa-twitter-square"
      url  : "https://twitter.com/rsm_mzk"
    - label: "Facebook"
      icon : "fab fa-fw fa-facebook-square"
      # url:
    - label: "GitHub"
      icon : "fab fa-fw fa-github"
      url  : "https://github.com/komasaru"
    - label: "GitLab"
      icon : "fab fa-fw fa-gitlab"
      # url:
    - label: "Bitbucket"
      icon : "fab fa-fw fa-bitbucket"
      # url:
    - label: "Instagram"
      icon : "fab fa-fw fa-instagram"
      # url:
```

* `footer` : フッタに表示するリンクの設定
  + `links` : 各種リンク
    - `label` : リンクのラベル
    - `icon` : リンクのアイコン（Font Awesome で設定）
    - `url` : リンク URL. （コメント化すると、ラベル・アイコンは表示されない）

#### 6-8. ファイル読み込みの設定

``` yaml
# Reading Files
include:
  - .htaccess
  - _pages
exclude:
  - "*.sublime-project"
  - "*.sublime-workspace"
  - vendor
  - .asset-cache
  - .bundle
  - .jekyll-assets-cache
  - .sass-cache
  - assets/js/plugins
  - assets/js/_main.js
  - assets/js/vendor
  - Capfile
  - CHANGELOG
  - config
  - Gemfile
  - Gruntfile.js
  - gulpfile.js
  - LICENSE
  - log
  - node_modules
  - package.json
  - Rakefile
  - README
  - tmp
  - /docs # ignore Minimal Mistakes /docs
  - /test # ignore Minimal Mistakes /test
keep_files:
  - .git
  - .svn
encoding    : "utf-8"
markdown_ext: "markdown,mkdown,mkdn,mkd,md"
```

* `include` : 強制的に変換対象に含めるディレクトリ／ファイルを設定。
* `exclude` : 変換対象から除外するディレクトリ／ファイルを設定。
* `keep_files` : Jekyll によって生成はされないが、保存しておきたいディレクトリ／ファイルを設定。
* `encoding` : ページのエンコード
* `markdown_ext` : Markdown ファイルの拡張子一覧

#### 6-9. 変換の設定

``` yaml
# Conversion
markdown         : kramdown
highlighter      : rouge
lsi              : false
excerpt_separator: "<!--more-->"  #"\n\n"
incremental      : false  # (Incremental regeneration is still an experimental feature)


# Markdown Processing
kramdown:
  input         : GFM
  hard_wrap     : false
  auto_ids      : true
  footnote_nr   : 1
  entity_output : as_char
  toc_levels    : 1..6
  smart_quotes  : lsquo,rsquo,ldquo,rdquo
  enable_coderay: false
```

* `markdown` : 使用する Markdown コンバータ
* `highlighter` : 使用する syntax highlighter
* `lsi` : 関連記事のインデックスを作成するか否か。
* `excerpt_separator` : 記事一覧表示時にこの文字列以前を抜粋
* `incremental` : 記事ビルド時に増分のみビルドするか否か（但し、実験的機能）
* `kramdown` : `markdown` で `kramdown` を設定した場合に設定。
  + `input` : `GFM` を設定することで、 GitHub Flavored Markdown を使用可能。
  + `auto_ids` : `true` を設定することで、 TOC に対応。（目次からのページ内リンク）
  + ...

#### 6-10. スタイルシート(SCSS)の設定

``` yaml
# Sass/SCSS
sass:
  sass_dir: _sass
  style   : compressed # http://sass-lang.com/documentation/file.SASS_REFERENCE.html#output_style
```

* `sass` : SCSS の設定
  + `sass_dir` : 生成される Sass ファイルを配置するディレクトリ
  + `style` : 生成される Sass ファイルを圧縮(minify)する場合は `compressed` を設定

#### 6-11. 出力の設定

``` yaml
# Outputting
permalink    : /:year/:month/:day/:title/  # /:categories/:title/
paginate     : 10 # amount of posts to show
paginate_path: /page:num/
timezone     : Asia/Tokyo  # https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
```

* `permalink` : 記事のパス形式
* `paginate` : ページ処理する際の1ページの最大記事数
* `paginate_path` : ページ処理する際のページのパス形式
* `timezone` : タイムゾーン

#### 6-12. プラグインの設定

``` yaml
# Plugins (previously gems:)
plugins:
  - jekyll-paginate
  - jekyll-sitemap
  - jekyll-gist
  - jekyll-feed
  - jemoji
  - jekyll-include-cache
  - jekyll-archives

# mimic GitHub Pages with --safe
whitelist:
  - jekyll-paginate
  - jekyll-sitemap
  - jekyll-gist
  - jekyll-feed
  - jemoji
  - jekyll-include-cache
  - jekyll-archives
```

* `plugins` : 使用するプラグインを設定  
  上記の `jekyll-paginate` 〜 `jekyll-include-cache` は Minimal Mistakes のデフォルト。  
  追加したいプラグインがあれば、 `jekyll-include-cache` より後ろに追加。（`Gemfile` への記述も必要）
* `whitelist` : GitHub Pages で使用するプラグインを配列化して設定（`plugins` と同じ？当方、不使用なので詳細不明）

#### 6-13. フィードの設定

``` yaml
# Jekyll Feed
feed:
  path: "atom.xml"
atom_feed:
  path: "https://www.mk-mode.com/blog/atom.xml"  # blank (default) uses feed.xml
```

* `feed`
  + `path` : 生成するフィードのファイル名
* `atom_feed`
  + `path` : フッタのリンクに使用する Atom フィードの URL

#### 6-14. アーカイブの設定

``` yaml
# Archives
#  Type
#  - GitHub Pages compatible archive pages built with Liquid ~> type: liquid (default)
#  - Jekyll Archives plugin archive pages ~> type: jekyll-archives
#  Path (examples)
#  - Archive page should exist at path when using Liquid method or you can
#    expect broken links (especially with breadcrumbs enabled)
#  - <base_path>/tags/my-awesome-tag/index.html ~> path: /tags/
#  - <base_path/categories/my-awesome-category/index.html ~> path: /categories/
#  - <base_path/my-awesome-category/index.html ~> path: /
category_archive:
  type: jekyll-archives  # liquid
  path: /categories/
tag_archive:
  type: jekyll-archives  # liquid
  path: /tags/
# https://github.com/jekyll/jekyll-archives
jekyll-archives:
  enabled:  all
    #- year
    #- month
    #- day
    #- categories
    #- tags
  layouts:
    year    : archive-taxonomy
    month   : archive-taxonomy
    day     : archive-taxonomy
    category: archive-taxonomy
    tag     : archive-taxonomy
  permalinks:
    year    : /:year/
    month   : /:year/:month/
    day     : /:year/:month/:day/
    category: /categories/:name/
    tag     : /tags/:name/
```

* `category_archive`, `tag_archive` : カテゴリ／タグ一覧の設定
  + `type` : アーカイブ生成プラグイン  
    `jekyll-archives` を使用する場合は、 `plugins` で設定しておく。
  + `path` : カテゴリ／タグ一覧ページのパス
* `jekyll-archives` : ekyll-archives の設定
  + `enabled` : 有効にしたいアーカイブを設定
    - `all` で年／月／日／カテゴリ／タグの全て。
    - 個別に有効にするなら、 `year`, `month`, `day`, `categories`, `tags` から必要なもののみを配列化して指定。
  + `layouts` : 配下で各アーカイブのレイアウトを指定。
  + `permalinks` : 配下で各アーカイブのパスの形式を指定。

#### 6-15. HTML 圧縮(minify)の設定

``` yaml
# HTML Compression
# - http://jch.penibelst.de/
compress_html:
  clippings : all
  comments  : all
  endings   : all
  ignore:
    envs    : development
  blanklines: true
  profile   : false
  startings : []
```

* `compress_html` : HTML minify の設定
  + `clippings` : 空白を除去しても安全な要素に囲まれた空白を除去
  + `comments` : コメントを除去
  + `endings` : 任意の終了タグを除去
  + `ignore` : 無効化
    - `envs` : 無効化する環境
  + `blanklines` : 空白行を除去
  + `profile` : プロファイルモードの有効／無効
  + `startings` : 任意の開始タグを除去

この機能は、レイアウトファイル内で `layout` に `compress` が設定されているものに適用される。  
例えば、 `_layouts/default.html` に `layout: compress` を設定すれば、概ね全てのページに適用される。  
しかし、当方の Syntax highlight(rouge) の環境の場合、圧縮後の HTML が不正となった上に、行番号が表示されない等の不具合が発生する。（Liquid タグ `highlight` に `linenos` オプションを使用した場合）
従って、当方の環境では minify 機能は無効にした。

#### 6-16. Yaml Front Matter 既定値の設定

（記事内の Yaml Front Matter で指定しなかった場合の既定値）

``` yaml
# Defaults
defaults:
  # _posts
  - scope:
      path          : ""
      type          : posts
    values:
      layout        : single
      classes       : wide
      author_profile: true
      read_time     : false
      comments      : true
      share         : true
      related       : true
```

* `defaults` : Yaml Front Matter 既定値の設定
  + `scope` : 既定値を適用する範囲
    - `path` : パス（`""` で当該 Jekyll プロジェクト全体）
    - `type` : ページのタイプ（`posts`, `pages`, `drafts` 等）
  + `values` : 既定値
    - `layout` : レイアウト
    - `classes` : クラス（`wide` で記事ペインの幅がワイドになる）
    - `author_profile` : サイト管理者の表示
    - `read_time` : 記事を読むのに必要な時間の表示
    - `comments` : コメント欄の表示
    - `share` : 共有の表示
    - `related` : 関連記事の表示

#### 6-17. JavaScript 追加の設定

``` yaml
head_scripts:
  - "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"
```

* `head_scripts` : head タグ内に設定する JavaScript の URL を設定しておくと、`_includes/head.html` で実装される。  
  当方、数式処理のために MathJax を追加。

### 7. その他の編集

広告用 HTML コードの挿入以外で行ったこと。

#### 7-1. 記事の横幅拡大

メイン領域（ペイン）の右側に TOC 領域（記事内の目次）は不要なので、レイアウトファイルの Yaml Front Matter に以下の記述を追加した。  
（対象ファイル： `archive.html`, `categories.html`, `tags.html`）

``` yaml
classes: wide
```

※記事は `single.html` だが、 `_config.yml` で既定値として `classes: wide` を指定しているの、 `single.html` には追加しなくてもよい。

#### 7-2. カテゴリ／タグ／年別アーカイブ一覧ページの作成

デフォルトでは存在しないので、 `_page` ディレクトリ内に作成する。

File: `_page/category-archive.md`

``` text
---
title         : "カテゴリ別一覧"
layout        : categories
classes       : wide
permalink     : /categories/
author_profile: true
---
```

File: `_page/tag-archive.md`

``` text
---
title         : "タグ別一覧"
layout        : tags
classes       : wide
permalink     : /tags/
author_profile: true
---
```

File: `_page/year-archive.md`

``` text
---
title         : "アーカイブ"
layout        : posts
classes       : wide
permalink     : /year-archive/
author_profile: true
---
```

#### 7-3. Google カスタム検索用ページの作成

当方、サイト内検索に Google カスタム検索を使用するので、 `_page` ディレクトリ内に作成した。

File: `_page/search.md`

``` text
---
title         : "ページ内検索"
layout        : single
classes       : wide
permalink     : /search/
author_profile: false
---

{% raw %}{% include search/google-search-scripts.html %}{% endraw %}
```

#### 7-4. 404 ページの作成

ページが存在しない場合のエラーページがないので、 `_page` ディレクトリ内に作成する。

File: `_page/404.md`

``` text
---
layout        : single
title         : "404 ERROR - Not Found"
excerpt       : "Page not found."
sitemap       : false
permalink     : /404.html
author_profile: true
---

Sorry, but the page you were trying to view does not exist!
```

#### 7-5. カテゴリ／タグ一覧のページ内リンクの変更

デフォルトでは、カテゴリ／タグ一覧ページは、 `#` を使ってページ内リンクしているが、日本語のカテゴリ／タグ名の場合に正常に機能しない（当方の環境の場合、ブラウザで URL を再確定しないと機能しない）ので、 `#` を除去し、カテゴリ／タグ別のページに遷移するよう変更した。  
（`_config.yml` でアーカイブページの生成を liquid から jekyll-archives に変更して、カテゴリ／タグ別のページを生成している）

File: `categories.html`

``` html
{% raw %}<a href="#{{ category[0] | slugify }}">{% endraw %}
```

の行を以下のように。

``` html
{% raw %}<a href="{{ category[0] | slugify }}">{% endraw %}
```

File: `tags.html`

``` html
{% raw %}<a href="#{{ tag[0] | slugify }}">{% endraw %}
```

の行を以下のように。

``` html
{% raw %}<a href="{{ tag[0] | slugify }}">{% endraw %}
```

※年別アーカイブ（`posts.html` を使用するもの）に関しては、デフォルトのまま。（ページ内リンク）

#### 7-6. 更新日時の書式変更

記事の最後等に表示される投稿／更新日時の書式を以下のように変更。  
（対象フィル： `single.html`）

``` text
date: "%B %d, %Y"
```

となっている箇所を全て（`meta`, `time` タグ内、計5箇所）、以下のように。

``` text
date: "%Y-%m-%d %H:%M"
```

#### 7-7. 画像の配置

プロフィール画像や favicon が無いので、 `assets/images` ディレクトリ内に配置する。

当方、 `about_me.png` と `favicon.ico` を配置した。（`about_me.png` は、 `_config.yml` 内の `og_image` や `avatar` で指定している）

* 投稿記事内で使用する画像は `assets/images` ディレクトリ内ではなく、 `images` ディレクトリ内に年月日別に作成したディレクトリ内に配置する。

#### 7-8. favicon の設定

favicon を表示させるために `head` タグ内に記述する。  
実際には、 `head` カスタマイズ用インクルードファイルに追記。

File: `_includes/head/custom.html`

``` html
{% raw %}<link rel="icon" href="{{ site.baseurl }}/assets/images/favicon.ico">{% endraw %}
```

#### 7-9. Google Analytics の設定

Google Analytics の機能を実装するために `head` タグ内に記述する。  
実際には、 `head` カスタマイズ用インクルードファイルに追記。（`_config.yml` 内でも設定）

File: `_includes/head/custom.html`

``` html
{% raw %}{% include analytics-providers/google.html %}{% endraw %}
```

#### 7-10. ページトップボタンの設置

ページを下部にスクロールした際に表示するページの最上部に戻るためのボタンを設置する。  
実際には、 `footer` カスタマイズ用インクルードファイルに追記。  
（当方、アイコン画像は Font Awesome 使用）

File: `_includes/footer/custom.html`

``` html
<p id="page-top">
  <a href="#">
    <i class="fa fa-angle-double-up fa-2x" aria-hidden="true"></i>
  </a>
</p>
```

#### 7-11. 自作 JavaScript の追加

JavaScript を追加したければ、 `assets/js` ディレクトリ配下にファイルを作成し、 `_config.yml` の `head_scripts` に追加する。但し、この場合、 JavaScript は `head` タグ内に追加される。

`_config.yml` 内で `footer_scripts` に設定すると、 `footer` タグ内に追加されるが、 jQuery より先に取り込まれることになっているため、 jQuery を利用した JavaScript を追加したければ、 jQuery より後で取り込むようにしなければならない。  
その場合、以下のように追加する。（以下は `my_custom.js` という自作スクリプトを取り込む例）

File: `_includes/scripts.html`

``` html
{% raw %}{% if site.footer_scripts %}
  {% for script in site.footer_scripts %}
    {% if script contains "://" %}
      {% capture script_path %}{{ script }}{% endcapture %}
    {% else %}
      {% capture script_path %}{{ script | relative_url }}{% endcapture %}
    {% endif %}
    <script src="{{ script_path }}"></script>
  {% endfor %}
{% else %}
  <script src="{{ '/assets/js/main.min.js' | relative_url }}"></script>
  <script defer src="https://use.fontawesome.com/releases/v5.6.0/js/all.js" integrity="sha384-z9ZOvGHHo21RqN5De4rfJMoAxYpaVoiYhuJXPyVmSs8yn20IE3PmBM534CffwSJI" crossorigin="anonymous"></script>
  <script src="{{ '/assets/js/my_custom.js' | relative_url }}"></script>
{% endif %}{% endraw %}

        :
===< 以下省略 >===
        :
```

#### 7-12. ナビゲーションメニューの編集

メニューに表示させたいリンクを追加する。（以下、当方の例）

File: `_data/navigation.yml`

``` yaml
# main links
main:
  - title: "Archives"
    url  : /year-archive/
  - title: "Categories"
    url  : /categories/
  - title: "Tags"
    url  : /tags/
  - title: "Calendar"
    url  : https://www.mk-mode.com/rails/calendar/calendar
  - title: "JMAXML"
    url  : https://www.mk-mode.com/rails/jmaxml
```

#### 7-13. スタイルシートの編集

minimal-mistakes-jekyll gem の `assets/css/main.css` を当該プロジェクトの `assets/css` ディレクトリ配下に複製して、最終行に追加していく。

#### 7-14. ヘッダ画像の追加

ページのヘッダ部分に画像を設定したい場合、画像ファイルを `/assets/images` ディレクトリに配置し、各記事の Markdown ファイルの Yaml Front Matter に以下のような記述を追加する。（以下、画像ファイルが `header.jpg` である例）

``` text
header:
  image: /assets/images/header.jpg
```

* トップページにヘッダ画像を追加する場合は `index.html` に。
* `image_description` に画像の説明を設定可能。
* `caption` に画像のキャプションを設定可能

画像にオーバレイテキストを設定することも可能。（以下、当方の例）

``` text
excerpt: "<small>当ブログは自前の Debian GNU/Linux サーバで運用。<br />PC・サーバ構築等の話題が中心。</small>"
header:
  overlay_image: /assets/images/header.jpg
```

### 8. 公開方法

ビルドすると `_site` ディレクトリ内に生成されるので、丸ごと公開先にアップロードすればよい。（Rsync などで）

但し、開発環境（`JEKYLL_ENV` が `development`）としてビルドされているので、 `JEKYLL_ENV=production` としてビルドしないと不都合が出てくる。

``` text
$ JEKYLL_ENV=production bundle exec jekyll build
```

### 9. その他

* フッタにアクセスカウンタを設置しているが、別途 Rails で作成したアクセス解析処理を jQuery で非同期で実行している。
* 当方、記事が多く、全ての記事のビルドに時間がかかるため、プレビューで確認する際、該当の記事ファイル以外を `_posts` ディレクトリから `_stash` ディレクトリに移動し、該当の記事ファイルに問題がないことが確認できたら、 `_stash` ディレクトリ内の記事ファイルを `_posts` ディレクトリ内に戻すようにしている。（別途、 Rakefile を作成して）
* その他、日常的に使用するコマンド類を Rakefile で定義するなどして効率化を図っている。

### 10. 参考サイト

カスタマイズ方法も含め、大抵のことは以下のサイトに記載されている。

* [Jekyll](https://jekyllrb.com/ "Jekyll")
* [Jekyll Tips](https://jekylltips-ja.github.io/ "Jekyll Tips")
* [Quick-Start Guide - Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/ "Quick-Start Guide - Minimal Mistakes")

---

次回、 Ruby 製 CMS の Octopress の記事を Jekyll 用に移行する方法について記録します。

以上。

