---
layout   : single
title    : "Octopress - Atom フィードを W3C で Valid に！"
published: true
date     : 2013-01-05 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Atom
- W3C
---

当ブログの HTML5 については、[The W3C Markup Validation Service](http://validator.w3.org/ "The W3C Markup Validation Service") でエラーにならないよう調整済みです。  

- [Octopress - HTML5 ソースを W3C で Valid に！]({{site.baseurl}}/2013/01/04/octopress-html5-w3c-valid "Octopress - HTML5 ソースを W3C で Valid に！")

今回は、同様に当ブログの Atom フィードを [W3C Feed Validation Service, for Atom and RSS](http://validator.w3.org/appc/ "W3C Feed Validation Service, for Atom and RSS") でチェックしてみました。

実は HTML5 が W3C Valid になるように調整済みだったので、エラーはありませんでした。  
いくつかの警告がありましたので、可能な部分についてのみ対応しました。

<!--more-->

### 0. 前提条件

- Linux Mint 13 Maya (64bit)
- Ruby 1.9.3-p194
- Octopress 2.0
- デフォルトのテーマ(Classic)をそのままかカスタマイズして使用している。

### 1. 対応内容

以下のような対応をしました。  

#### 1. 文字コードについての警告

【現象】以下のような警告が出ていた。

``` text
Your feed appears to be encoded as "utf-8", but your server is reporting "US-ASCII" [help]
```

【対応】Web サーバのエンコードと違うらしいので、ブログを運用している Web サーバ(当方の場合は、自宅サーバ上のApache)の設定に以下のような記述を追加した。

File: `/etc/httpd/conf/httpd\.conf`

{% highlight text linenos %} 
AddType "text/xml; charset=utf-8" xml
{% endhighlight %}

サーバを自分で編集できない環境の場合は対応不可。警告は消せないが、エラーではないので大丈夫。

#### 2. その他の警告

その他に以下のような警告があった。

1. HTML5 では定義されているタグなのに、Atom フィードでは定義されていないタグ。( `<figcaption>` )
2. 記事によっては、記事内に存在すべきではないタグが存在している。( `<ifram>`, `<script>` )

1 については、対応しようがないので修正しなかった。  
2 については、記事外に移動できるものは移動させた。

### 2. 構文チェック

[W3C Feed Validation Service, for Atom and RSS](http://validator.w3.org/appc/ "W3C Feed Validation Service, for Atom and RSS") でチェックしてみる。  
エラーが無ければ OK. 警告があれば、可能な限り対応する。

### 3. Valid アイコン表示

構文チェックでエラーが無ければ、公式の Valid アイコンをサイトに貼ることができる。  
当ブログの場合は、サイドバーに貼りつけた。

### その他

当ブログではエラーは出ないものの、多少の警告が残ってしまった。  
記事の性質上、やむを得ないものなので、これで良しとした。

---

これで当ブログは HTML5, Atomフィードに関しては W3C Valid となりました。  

今回の当記録が参考になれば幸いだと思っている次第です。

以上。

