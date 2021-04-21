---
layout   : single
title    : "W3C - Facebook OGP 関連 meta タグが Invalid！"
published: true
date     : 2013-07-20 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- HTML
- Facebook
- W3C
---

少し前から、当方のブログサイトの HTML に埋め込んでいる Facebook 連携用（OGP:Open Graph Protocol） `meta` タグ部分で、 [W3C Validation](http://validator.w3.org/check?uri=referer "W3C Validation") が "Invalid" になるようになりました。

> ちなみに、当記事執筆当初の7月8日は Invalid 判定でしたが、当記事公開時（7月20日）現在は Valid 判定が出るようになりました。

以下、Invalid になっていた時の、その原因と現象確認についての記録です。

<!--more-->

#### 0. 前提条件

- 当然、HMTL のバージョンは "HTML5" である。（"HTML4.01" や "XHTML1.0" 等ではない）
- HTML に Facebook 連携用（OGP） `meta` タグを埋め込んでいる。
- 今まで [W3C Validation](http://validator.w3.org/check?uri=referer "W3C Validation") チェックで正当（Valid）な HTML として判定されていたのに、6月24日くらいから不正（Invalid）な HTML と判定されるようになった。

#### 1. 現象

ブログサイトの HTML5 に対して [W3C Validation](http://validator.w3.org/check?uri=referer "W3C Validation") チェックを実行すると、今まで（2013年6月24日くらいまで）問題なかった部分でも以下のようなエラーが発生し、Invalid と判定されるようになった。  
HTML に埋め込んでいる Facebook 連携用の `meta` タグ（og: Open Graph protocol）で発生している。（同じエラーが９個の `meta` タグで）  

![W3C_HTML5_INVALID_1]({{site.baseurl}}/images/2013/07/20/W3C_HTML5_INVALID_1.png "W3C_HTML5_INVALID_1")

#### 2. 原因

メッセージを見てみると、「必要な `name` 属性が無い」と言っているようだ。  
ちなみに、"meta" のリンク先の説明を確認してみると、

> `meta` 要素を指定する際には、 `name`, `http-equiv`, `charset`, `itemprop` 属性のうち、少なくとも一つを指定する必要があり、 `name`, `http-equiv`, `itemprop` 属性のどれかを指定する際には、必ず `content` 属性とセットで使用しなければならない。

のようだ。今までチェックが少し寛大だったのが、少しシビアになったようだ。

#### 3. 調査

以下は、ある日のブログ記事の HTML に埋め込まれていた OGP 関連の `meta` タグ部分。  
これは、HTML ソースから抜粋したものだが、Octopress(Ruby 製静的ブログシステム) なので、実際にはテンプレートを変更している。

``` html 
<meta property="og:title" content="特殊相対性理論における時間の遅れ！ - mk-mode BLOG">
<meta property="og:type" content="article">
<meta property="og:description" content="こんばんは。 特殊相対性理論とは、「広辞苑 第五版」より引用すると、 1905年、アインシュタインが絶対静止の座標系を否定して、互いに等速運動をしている座標系に関してはすべての自然法則は同一の形式を保つということを主張した理論。質量とエネルギーの等価性が導かれた。 ある限定的な「特殊な」 &hellip;">

<meta property="og:url" content="http://www.mk-mode.com/octopress/2013/07/08/time-dilation-on-special-relativity/">
<meta property="og:image" content="http://www.mk-mode.com/octopress/images/about_me.png">
<meta property="og:author" content="komasaru">
<meta property="og:site_name" content="mk-mode BLOG">
<meta property="og:locale" content="ja_JP">
<meta property="fb:app_id" content="418079851595631">
```

ちなみに、`meta` で `og`, `fb` を使用するために `head` タグに以下のような設定もしている。（今は設定しなくてもよいようだが）

``` html 
<head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# article: http://ogp.me/ns/article#">
```

まず、`meta` タグについて [HTML 5.1 Nightly](http://www.w3.org/html/wg/drafts/html/master/Overview.html "HTML 5.1 Nightly") でも確認してみた。  
`name` 属性に指定できる値は、`application-name`, `author`, `description`, `generator`, `keywords` のほか、[MetaExtensions - WHATWG Wiki](http://wiki.whatwg.org/wiki/MetaExtensions  "MetaExtensions - WHATWG Wiki")で提案され、かつ、拒絶されてない値でなければならいようだ。

そこで、[MetaExtensions - WHATWG Wiki](http://wiki.whatwg.org/wiki/MetaExtensions  "MetaExtensions - WHATWG Wiki") を確認してみると、`og:title` 等のキーワードは、"Registered Extensions" という一覧（登録済み meta 拡張？）に掲載されている  
しかし、"Proposals that don't meet the requirements for a registration" という一覧（登録条件を満たしていない提案？）にも `og:title` 等のキーワードが掲載されている。

どうやら、これから対応させるもののリストには登録済みだが、条件を満たしていないために現在調整中という意味であろう。  
将来 `property` という属性が廃止されて `name` 属性で `og:*` キーワードが指定できるようになるのではないでしょうか？

#### 4. 対応

現在のところ、Facebook 連携（OGP）用 `meta` タグ部分については、[W3C Validation](http://validator.w3.org/check?uri=referer "W3C Validation") チェックでで正当（Valid）に判定されるようにする術はないようだ。  
対応されるのを待つのみ？

ただ、[W3C Validation](http://validator.w3.org/check?uri=referer "W3C Validation") とは別のバリデーションチェックサイトを利用してチェックする方法もあるようだが、それでは本末転倒になってしまう。（「W3C でチェックしたいのに W3C 以外でチェックしろ」というのは答えになっていない）

#### 参考サイト

- [HTML 5.1 Nightly](http://www.w3.org/html/wg/drafts/html/master/single-page.html#the-meta-element "HTML 5.1 Nightly")
- [MetaExtensions - WHATWG Wiki](http://wiki.whatwg.org/wiki/MetaExtensions  "MetaExtensions - WHATWG Wiki")

---

というわけで、Facebook 連携（OGP）部分については対応されるのを待つことにした。

W3C Validation の HTML5 は現在ドラフト（まだ勧告となっていない）段階なので、勧告になるまではまだまだ変更はあるでしょうね。

以上。

