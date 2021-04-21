---
layout   : single
title    : "Octopress - Facebook OGP 設定！"
published: true
date     : 2012-12-31 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Facebook
- OGP
---

ブログに Facebook の「いいね」ボタンを設置しただけでは、SEO 的にあまり効果がありません。  
SEO 的には、OGP(OpenGraphProtocol) の設定をする必要があります。

OGP とは、簡単に言うと、「いいね」した人の Facebook ページ上でその記事がどのような記事なのかを知らせるための機能で、HTML 内に埋め込む `meta` タグのことです。  
OGP を設定しておくことで、Facebook 側での展開が期待できるのです。  
（今は、OGP の設定をしなくても「ある程度」の情報は、Facebook 側で既存の `meta` タグから取得してくれるようですが）

<!--more-->

### 0. 前提条件

- Linux Mint 13 Maya (64bit)
- Ruby 1.9.3-p194
- Octopress 2.0
- Facebook に登録済みで、かつ AppID を取得済みである。

使用する環境は特に問わないはず。

### 1. _config.yml 編集

使用する値を設定しておく。  
`og:image` (Facebook 投稿時の画像へのパス) のデフォルトパス、AppID、ロケールを設定する。

File: `_config.yml`

{% highlight text linenos %} 
og_image: /images/about_me.png
og_locale: ja_JP
fb_app_id: 999999999999999
{% endhighlight %}

AppID は知られたくないからではなく、当方のものが誤ってコピペされないように伏せている。  
よく他人のソースをコピペしたま使用しているのが見受けられるので。

### 2. facebook_ogp.html 作成

`source/_include/custom/` ディレクトリに `facebook_ogp.html` ファイルを以下のような内容で作成する。  
ページタイトルが存在すれば各記事のページ、存在しなければブログのトップページと認識させる設定にしている。

File: `facebook_ogp.html`

{% highlight text linenos %} 
{{ "{% if page.title " }}%}
<meta property="og:title" content="{{ "{{ page.title " }}}} - {{ "{{ site.title " }}}}" />
<meta property="og:type" content="article" />
<meta property="og:description" content="{{ "{{ description | strip_html | condense_spaces | truncate:150 " }}}}" />
{{ "{% else " }}%}
<meta property="og:title" content="{{ "{{ site.title " }}}}" />
<meta property="og:type" content="blog" />
<meta property="og:description" content="{{ "{{ site.description " }}}}" />
{{ "{% endif " }}%}
<meta property="og:url" content="{{ "{{ canonical " }}}}" />
<meta property="og:image" content="{{ "{{ site.url " }}}}{{ "{{ site.og_image " }}}}" />
<meta property="og:author" content="{{ "{{ site.author " }}}}" />
<meta property="og:site_name" content="{{ "{{ site.title " }}}}" />
<meta property="og:locale" content="{{ "{{ site.og_locale " }}}}" />
<meta property="fb:app_id" content="{{ "{{ site.fb_app_id " }}}}" />
{% endhighlight %}

自分で試行してみた結果、 `og:author` には使用できない文字があるようだ。アルファベットだけの名前に変更したほうがよい。

### 3. head.html 編集

`source/_includes` の `head.html` で上記の `facebook_ogp.html` を読み込むように設定する。  
`</head>` の直前くらいがよいでしょう。

File: `source/_includes/head.html`

{% highlight text linenos %} 
  {{ "{% include custom/facebook_ogp.html " }}%}
{% endhighlight %}

また、当方は元から存在する以下のコードは `og:authoer` と重複する警告が発生するため削除した。(無視してもよいようだが)

File: `source/_includes/head.html`

{% highlight text linenos %} 
  <meta name="author" content="{{ "{{ site.author " }}}}">
{% endhighlight %}

### 4. 設定のチェック

設定が正しいかどうか [デバッガー - Facebook開発者](http://developers.facebook.com/tools/debug "デバッガー - Facebook開発者") でチェックする。
以下のようにエラーや警告が出ないことを確認する。  
(ステータスコードは 206(範囲リクエスに成功) or 200(リクエストに成功))

![OP_FACEBOOK_OGP]({{site.baseurl}}/images/2012/12/31/OP_FACEBOOK_OGP.png "OP_FACEBOOK_OGP")

---

今回は Octopress での実装方法について記載しましたが、 HTML に OGP 用の `meta` タグを埋め込むということを理解すれば、どんな環境でも実現できます。

ちなみに、Facebbok は Twitter 同様に仕様変更のスピードが速いので、AppID 取得方法等が日々変化しています。Web で調べながら作業するなら、その情報が最新の情報かどうか確認してから作業した方がよいと思います。

以上。

