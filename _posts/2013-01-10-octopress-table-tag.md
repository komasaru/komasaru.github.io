---
layout   : single
title    : "Octopress - 容易に table タグ！"
published: true
date     : 2013-01-10 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- HTML
- CSS
---

[Octopress](http://octopress.org/ "Octopress") のブログ記事中で `<table>` タグを使用する際に、HTML ではなく容易に記述できる方法があるようです。

<!--more-->

### 0. 前提条件

- Linux Mint 13 Maya (64bit)
- Ruby 1.9.3-p194
- Octopress 2.0

使用する環境は特に問わないはず。

### 1. CSS ファイル作成

後述の参考サイトを参考に以下のような CSS ファイルを作成した。（各自、自由に調整すべし）  
ファイル名は `source/stylesheets/table.css` とした。

File: `source/stylesheets/table.css`

{% highlight css linenos %}
* + table {
    border-style:solid;
    border-width:1px;
    border-color:#e7e3e7;
    margin: 10px 0 30px 0;
}

* + table th, * + table td {
    border-style:dashed;
    border-width:1px;
    border-color:#8888AA;
}

* + table th {
    border-top:    1px #666688 solid;
    border-bottom: 2px #666688 solid;
    font-weight:bold;
    background-color: #C0C0C0;
    padding: 2px 9px;
}

* + table td {
    border-bottom: 1px #666688 solid;
    background-color: #F0F0F0;
    padding: 0 10px;
}

* + table th[align="left"], * + table td[align="left"] {
    text-align:left;
}

* + table th[align="right"], * + table td[align="right"] {
    text-align:right;
}

* + table th[align="center"], * + table td[align="center"] {
    text-align:center;
}
{% endhighlight %}

### 2. head.html の編集

前述の CSS ファイルを読み込ませるために `source/_includes/head.html` に以下のように記述を追加する。

File: `source/_includes/head.html`

{% highlight html linenos %}
<head>
    :
  <link href="{{ root_url }}/stylesheets/table.css" rel="stylesheet" type="text/css">
    :
</head>
{% endhighlight %}

### 3. 記述方法

記事を作成する際は以下のようにする。  
ヘッダーと明細の間に区切りで、１つ以上の `-` の左に `:` で左寄せ、両サイドに `:` で中央揃え、右に `:` で右寄せになる。  
以下は一つの例。

``` text
左寄せ|中央揃え|右寄せ
:---|:--:|---:
テスト１|テスト１１|テスト１１１
テスト２２|テスト２２２|テスト２２２２
テスト３３３|テスト３３３３|テスト３
テスト４４４４|テスト４|テスト４４
```

以下のように表示されるはず。

左寄せ|中央揃え|右寄せ
:---|:--:|---:
テスト１|テスト１１|テスト１１１
テスト２２|テスト２２２|テスト２２２２
テスト３３３|テスト３３３３|テスト３
テスト４４４４|テスト４|テスト４４

### 4. 問題点

上記の方法で、面倒なタグ付けをせずに容易に表を作成するすることができますが、当方は実際にはタグ付けしています。  
なぜなら、この方法による表作成は HMTL 生成時に勝手に `align` 属性が作られてしまうからです。  
それがなぜ問題かというと、HTML5 では、`align` 属性は CSS 側で実現させないといけない仕様になっていて、W3C Validation で Invalid になってしまうからです。  
当然、この記事も Invalid になってしまいます。  
Octopress(jekyll) の HTML 生成部分で処理しているようですが、当方がまだ Octopress(jekyll) について疎い段階なので、調査・対策はとっていない次第。

### 参考サイト

- [Octopressでテーブルをmarkdownで編集できるようにする - 酒と泪とRubyとRailsと](http://morizyun.github.com/blog/octopress-table-tag-css/ "Octopressでテーブルをmarkdownで編集できるようにする - 酒と泪とRubyとRailsと")

---

W3C Validation(HTML5) で Invalid になることを気にしないのであれば、上記の方法で容易に表を作成できます。

以上。

