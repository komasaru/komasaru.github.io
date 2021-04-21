---
layout   : single
title    : "jQuery - 古いブログ記事にメッセージを付加！"
published: true
date     : 2015-12-24 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- HTML
- JavaScript
- jQuery
---

ブログ記事が古い場合に、昔執筆した記事で情報が古い可能性があるというメッセージを jQuery を使用して出力するようにします。

<!--more-->

### 0. 前提条件

* ブログサイトの HTML 内に記事を執筆か投稿した日時が格納されていること。
* jQuery を利用できる環境が整っていること。
* jQuery スクリプトは別ファイルに分けることを想定。（当然、分けなくても大丈夫）
* HTML の構成等は環境（使用しているブログソフトや個人の趣味趣向等）により異なるので、以下の文章は適宜置き換えて考えること。

### 1. 想定する HTML の構成

* JavaScript(jQuery) は別ファイルに分け、 `<haed>` タグ内から呼び出す。
* `<body>` - `<article class='hentry'>` - `<header>` - `<time>` タグの `datetime` 属性にブログの投稿日時が格納されていることを想定。
* `<div class='entry-content'>` タグ内がブログ記事の内容。

``` html
<head>
    :
  <script src="/path/to/my_custom.js" type="text/javascript"></script>
    :
</head>

<body>
    :
  <article class='hentry'>
    <header>
      <time class='entry-date' datetime='2014-11-29T00:20:00+09:00'>2014-11-29 00:20</time>
        :
    </header>
      :
    <div class='entry-content'>
      :
    </div>
  </article>
    :
<body>
```

### 2. jQuery スクリプトの作成

File: `/path/to/my_custom.js`

{% highlight javascript linenos %}
$(document).ready(function(){
    // １年以上前の記事ならメッセージを表示
    $('article.hentry header time').each(function(){
        // １年前の日付を取得
        var pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 1);

        // 該当記事の日付を取得
        var thisDate = $(this).attr('datetime');
        var thisDate = new Date(thisDate);

        // メッセージ出力
        if (thisDate <= pastDate) {
            $("div.entry-content").before('<div class="remark">※この記事は１年以上前に書かれたもので、情報が古い場合があります。</div>');
        }
    });
});
{% endhighlight %}

### 3. スタイルシートの編集

必要なら CSS スタイルシートを編集する。（以下は当方の例）

``` css
div.remark {
  color:     #F06060;
  font-size: 0.8em;
}
```

### 4. 動作確認

ブラウザで確認してみる。  
１年以上前の記事の場合記事本文の先頭にメッセージが出力されるはず。

![JQUERY_OLD_POST]({{site.baseurl}}/images/2015/12/24/JQUERY_OLD_POST.png "JQUERY_OLD_POST")

---

これで、記事を閲覧された方が古い情報だと思わず信じ込んでしまうことが少なくなるでしょう。

以上。

