---
layout   : single
title    : "Ruby, Rails - 郵便番号検索ページについて！"
published: true
date     : 2017-03-27 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Ruby
- Rails
---

当方 Web サイトには郵便番号検索ページを設けております。

今回は紹介のみ。

<!--more-->

### 公開ページ

「[郵便番号データダウンロード - 日本郵便](http://www.post.japanpost.jp/zipcode/download.html "郵便番号データダウンロード - 日本郵便")」からダウンロードしたデータをデータベース(MariaDB(MySQL))に登録して検索可能にしたものである。  
データは日々自動でチェックし、変更があれば最新の情報に更新するようにしている。

公開しているページは、通常の郵便番号検索と大口事業所用の郵便番号検索。

* [mk-mode SITE : 郵便番号検索](http://www.mk-mode.com/rails/postal "mk-mode SITE : 郵便番号検索")  
  - 検索結果で、町域名の先頭に「※」マークが付加されているデータは元データが分割されている可能性が考えられるデータで、日本郵便提供のCSVデータの仕様により自動化が不可能なものである。
  - 「※」マークが付加されているデータで町域名が分割されているように見えるデータはご自身でチェックしてみて下さい。
* [mk-mode SITE : 郵便番号（大口事業所）検索](http://www.mk-mode.com/rails/postal_j "mk-mode SITE : 郵便番号（大口事業所）検索")

---

以上。

