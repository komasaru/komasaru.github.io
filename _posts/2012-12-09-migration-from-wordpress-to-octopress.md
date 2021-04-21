---
layout   : single
title    : "ブログを WordPress から Octopress に移行！"
published: true
date     : 2012-12-09 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- WordPress
---

2009年01月05日から４年近く WordPress で運用してきた当方のブログを、このほど [Octopress](http://octopress.org/ "Octopress") に移行しました。  
よくある GitHub Pages を使った運用ではなく、自宅サーバでの運用です。

<!--more-->
移行した理由は、以下の通り。

- Ruby 製なので、Rubyist には扱いやすい。(必要なら、プラグインを作成する。自分には php より手を付けやすい)
- 静的 CMS なので、動作が軽い。
- 記事が Markdown 記法で記述できる。
- DB を使用せず、１記事に付き１ファイル(Markdownファイル)で管理する。
- git, rake, jekyll, yaml 等の技術・知識も身に付く。
- github pages が利用できる。(当方は github でなく、自宅サーバで運用しているが)

今のところ、以下のような不自由さを若干感じていますが、そう感じているだけで、別の視点・手法を見出す機会にもなると感じています。

- 静的 CMS なので、WordPress のプラグイン等で実現できていた機能が Octopress で容易に実現できない。
- 静的 CMS なので、コメント機能がない。(外部サービスで対応)
- HTML5, CSS3 のデザインなので、まだ不慣れである。

そして、今まで WordPress に投稿してきた記事ですが、全記事・全画像を Octopress へ書式等変換して移行しています。  
(コメントは外部サービスを利用するため、移行対象外)

旧(WordPress)記事へのアクセスを Octopress へリダイレクトできるように記事を移行し、Web サーバ側でも RewriteRule を設定しています。  
それでも、パーマリンク設定の都合でリダイレクトできない記事があるかも知れませんが、状態を見て可能な限り対応する予定です。

テーマもダウンロードできるものが何種類か用意されてますが、デフォルトでも見やすくて充分満足です。当方は若干カスタマイズして使用しています。  
(HTML5, CSS3 は W3C 「未勧告」なので(仕様が世界統一の規格として認められていないので)、XHTML, CSS2 で Valid を保ってきた自分にとっては若干心苦しい点もあるが)

ちなみに、WordPress ブログでプラグインで行なっていたアクセス解析は、Octopress では jQuery と自宅サーバ上の Ruby on Rails で実現させています。  
今のところ、Octopress ブログへのアクセスは記録していますが、表示は総ページビュー数のみとしています。

その他、Octopress 環境の構築方法や WordPress からの移行方法については、今後公開していく予定です。

以上。

