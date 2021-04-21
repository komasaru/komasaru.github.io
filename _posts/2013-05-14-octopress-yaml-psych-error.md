---
layout   : single
title    : "Octopress - Yaml で Psych エラー！"
published: true
date     : 2013-05-14 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- Markdown
---

Ruby 製静的ブログシステム Octopress でジェネレート（ `rake generate` ）時、Psych 関連のエラーが発生することがあります。  
（ただし、一口に Psych エラーと言っても、エラーの原因は環境により異なるので、エラーメッセージをよく確認すること）

以下、原因と対策についてのメモです。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia(64bit) を使用。
- Octopress 2.0.0 を使用。
- Octopress で使用する Ruby(rbenv インストール) は 1.9.3-p194 である。

### 1. 現象

Octopress をジェネレートする際に発生するエラーは以下のとおり。  
今回問題になるのは7行目以降。

``` text 
$ rake generate
## Generating Site with Jekyll
unchanged sass/screen.scss
Configuration from /home/foo/octopress/_config.yml
/home/foo/.rbenv/versions/1.9.3-p194/lib/ruby/gems/1.9.1/gems/blankslate-3.1.2/lib/blankslate.rb:51: warning: undefining `object_id' may cause serious problems
Building site: source -> public/octopress
/home/foo/.rbenv/versions/1.9.3-p194/lib/ruby/1.9.1/psych.rb:203:in `parse': (<unknown>): found unexpected end of stream while scanning a quoted scalar at line 3 column 8 (Psych::SyntaxError)
	from /home/foo/.rbenv/versions/1.9.3-p194/lib/ruby/1.9.1/psych.rb:203:in `parse_stream'
	from /home/foo/.rbenv/versions/1.9.3-p194/lib/ruby/1.9.1/psych.rb:151:in `parse'
	from /home/foo/.rbenv/versions/1.9.3-p194/lib/ruby/1.9.1/psych.rb:127:in `load'
	from /home/foo/.rbenv/versions/1.9.3-p194/lib/ruby/gems/1.9.1/gems/jekyll-0.11.2/lib/jekyll/convertible.rb:33:in `read_yaml'
	from /home/foo/.rbenv/versions/1.9.3-p194/lib/ruby/gems/1.9.1/gems/jekyll-0.11.2/lib/jekyll/post.rb:39:in `initialize'
	from /home/foo/octopress/plugins/preview_unpublished.rb:23:in `new'
	from /home/foo/octopress/plugins/preview_unpublished.rb:23:in `block in read_posts'
	from /home/foo/octopress/plugins/preview_unpublished.rb:21:in `each'
	from /home/foo/octopress/plugins/preview_unpublished.rb:21:in `read_posts'
	from /home/foo/.rbenv/versions/1.9.3-p194/lib/ruby/gems/1.9.1/gems/jekyll-0.11.2/lib/jekyll/site.rb:128:in `read_directories'
	from /home/foo/.rbenv/versions/1.9.3-p194/lib/ruby/gems/1.9.1/gems/jekyll-0.11.2/lib/jekyll/site.rb:98:in `read'
	from /home/foo/.rbenv/versions/1.9.3-p194/lib/ruby/gems/1.9.1/gems/jekyll-0.11.2/lib/jekyll/site.rb:38:in `process'
	from /home/foo/.rbenv/versions/1.9.3-p194/lib/ruby/gems/1.9.1/gems/jekyll-0.11.2/bin/jekyll:250:in `<top (required)>'
	from /home/foo/.rbenv/versions/1.9.3-p194/bin/jekyll:23:in `load'
	from /home/foo/.rbenv/versions/1.9.3-p194/bin/jekyll:23:in `<main>'
```

### 2. 原因

最初は何のことかピンと来ないが、エラー内容をよく読むと "quoted scalar" 読込中の（しかも、３行目８桁目での）エラーであることがすぐに分かる。  
実際、記事ファイル（Markdown ファイル）を確認してみると、Yaml 部分が以下のようになっていた。

``` text 
---
layout   : single
title    : "Linux - cron で時報を鳴らす！
published: false
date     : 2013-05-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
---
  ：
  ：
```

_**「記事タイトルの文字列を囲うダブルクォーテーションが対になっていなかった！」**_

### 3. 対策

当然、以下のいずれかの対応をとればよい。

- 記事タイトルの文字列を囲うダブルクォーテーションを対にする。
- 記事タイトルの文字列を囲うダブルクォーテーションを削除する。

当方は、いつもダブルクォーテーションで囲うようにしているので、前者の対応をとった。

### 4. その他

記事が大量にある場合、どの記事でエラーがで発生しているのか即座に判断できない。  
しかし、昨日は正常で今日はエラーとなれば、今日追加した記事に不具合があることくらいは想像がつくだろう。

---

Octopress でブログを書くようになって約半年ですが、初めて遭遇したエラーでした。  
今後、同じようなエラーで慌てないように記録しておいた次第です。

以上。

