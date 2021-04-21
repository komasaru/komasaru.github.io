---
layout   : single
title    : "Ruby on Rails - Atom 1.0 Feed 生成！"
published: true
date     : 2013-01-11 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Ruby
- Rails
- Atom
- Feed
---

ブログでは通常 RSS や Atom の Feed(フィード) の機能を使用します。  
ホームページでも Feed 機能を使用することで SEO 的にも効果を発揮します。

という訳で、今回は Ruby on Rails 製のサイトの Atom 1.0 Feed を生成する方法についての記録です。

<!--more-->

### 0. 前提条件

- Ruby 1.9.3-p327 + Rails 3.2.9 (Linux Mint 13 64bit)で作成・動作確認。
- Ruby 1.9.3-p194 + Rails 3.2.6 (CentOS 6.3 32bit)で動作確認。
- 別途 Feed 用のコントローラ `feed` を作成した。

### 1. テンプレート作成

Atom 1.0 Feed 用のテンプレート（ファイル名：`feed/atom.xml.builder`）を以下のように作成する。  
`@entries` の内容は参考サイトと異なる。（当方は配列形式のデータを渡すようにしているため）  
当然ながら `@` で始まる変数はコントローラで指定する。  
変数やメンバの意味については説明するまでもないかと。  
（但し、日時は `2013-01-11T00:20:00+09:00Z` という書式）

File: `feed/atom.xml.builder`

{% highlight ruby linenos %}
atom_feed(:language => 'ja-JP',
          :root_url => @site_url,
          :url      => @atom_url,
          :id       => @site_url) do |feed|
  feed.title    @site_title
  feed.subtitle @site_description
  feed.updated  Time.now
  feed.author{|author| author.name(@author)}

  @entries.each do |entry|
    feed.entry(entry,
               :url       => entry[1],
               :id        => entry[1],
               :published => entry[2],
               :updated   => entry[2]) do |item|
      item.title(entry[0])
      item.content(entry[3], :type => 'html')
      item.author{|author| author.name(@author)}
    end
  end
end
{% endhighlight %}

### 2. コントローラ作成

以下のように Rails コントローラを作成する。  
値をセットする部分については特に難しいことはないが、最後の `respond_to` で拡張子が `.xml` の場合に前述の `.builder` でページを生成することに重要な意味がある。

File: `feed_controller.rb`

{% highlight ruby linenos %}
class FeedController < ApplicationController
  #----------------------------------------
  # Atom Feed
  #----------------------------------------
  def atom
    # 各種設定
    @site_title       = "XXXXXXXX"
    @site_description = "YYYYYYYY"
    @site_url         = "http://xxxxxxxx/"
    @atom_url         = "http://xxxxxxxx/feed/atom.xml"
    @author           = "ZZZZZZZZ"

    # -----------------------------------------------------------
    # ここで @entries へ値を格納する処理
    # 当方は [タイトル, URL, 日時, 内容] という内容の配列とした。
    # -----------------------------------------------------------

    # ページ生成
    respond_to do |format|
      format.xml
    end
  end
end
{% endhighlight %}

### 3. リンク作成

場合により Ruby on Rails サイトへ Atom 1.0 Feed のリンクを貼るとよい。  
当方はサイドバーにリンクを作成した。

### 4. 確認

ブラウザで `＜サイトURL＞/feed/atom/atom.xml` へアクセスすると、Atom 1.0 Feed が生成され・表示されるはず。  
ちなみに、このままでは `/feed/atom/atom.xml` と見栄えがよくないので、当方は `config/routes.rb` でルーティングを変更している。  
また、当方のホームページは頻繁に更新していないので、Feed に流す情報はホームページにも表示させてるブログ・ツイッターの最新情報とした。

- [mk-mode SITE](http://www.mk-mode.com/rails/ "mk-mode SITE")

### 5. 参考サイト

- [Rails で Atom / RSS フィードを生成する Builder テンプレート - WebOS Goodies](http://webos-goodies.jp/archives/builder_templates_for_atom_and_rss_feeds.html "Rails で Atom / RSS フィードを生成する Builder テンプレート - WebOS Goodies")

---

これで、ホームページでも動的に Atom 1.0 Feed が生成されるようになりました。

当方の場合、この Atom 1.0 Feed を利用して、ブログ同様に Ping 送信処理を定期的に行なっています。  
（Regular の Ping 送信では Feed は必要ありませんが、Extended 対応の Ping サーバでは Feed が必要となるので、Ping 送信に成功する率が高くなります）

以上。

