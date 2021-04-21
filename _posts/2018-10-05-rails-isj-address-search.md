---
layout   : single
title    : "Ruby, Rails - 位置参照情報：住所検索ページ！"
published: true
date     : 2018-10-05 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Ruby
- Rails
- GIS
---

国土交通省・国土政策局提供の位置参照情報（大字・町丁目レベル）を住所ベースで検索できるページを自 Web サイト内に設置しました。

今回はそのページの紹介のみ。

<!--more-->

### 0. 公開ページ

* [mk-mode SITE : 位置参照情報 - 住所検索](https://www.mk-mode.com/rails/isj/search_addr "mk-mode SITE : 位置参照情報 - 住所検索")

### 1. ページのイメージ

![ISJ_ADDR.png]({{site.baseurl}}/images/2018/10/05/ISJ_ADDR.png "ISJ_ADDR.png")

### 2. 注意事項

* 「市区町村」と「大字・町丁目」は AND 条件。
* 「市区町村」や「大字・町丁目」内で複数文字列を半角スペースで区切った場合、 AND 条件。
* 情報の出典：[国土交通省・位置参照情報](http://nlftp.mlit.go.jp/isj/index.html "国土交通省・位置参照情報")

### 3. その他

情報のデータベース(MariaDB(MySQL))化については、過去記事を参照のこと。

* [MariaDB(MySQL) - 国土交通省・位置参照情報をデータベース化（その２）！]({{site.baseurl}}/2018/09/17/mysql-import-mlit-isj-v2 "MariaDB(MySQL) - 国土交通省・位置参照情報をデータベース化（その２）！")

---

以上。

