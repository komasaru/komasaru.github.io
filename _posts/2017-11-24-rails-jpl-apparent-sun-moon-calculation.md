---
layout   : single
title    : "Ruby, Rails - 視位置（太陽／月）計算ページ！"
published: true
date     : 2017-11-24 00:20:00 +0900
comments : true
categories:
- Webサイト
- 暦・カレンダー
tags:
- Ruby
- Rails
- カレンダー
---

当方、以前からカレンダー関連のページを公開しております。

今回、太陽／月の視位置を計算するページを設置しました。

以下、そのページの紹介です。

<!--more-->

### 1. 公開ページ

* [mk-mode SITE : 視位置計算（太陽／月）計算](https://www.mk-mode.com/rails/cal_tool/apos_sun_moon "mk-mode SITE : 視位置計算（太陽／月）計算")

### 2. 注意事項

* リクエストを `apos_sun_moon.txt` とすれば、テキストで結果を返す。  
  （引数は `?year=2017&month=1&day=2&hour=12&min=34&sec=56` のように付与。引数なしでシステム時刻をJSTとみなす）
* 計算根拠となっているデータは NASA 提供の JPL DE430 である。
* 詳細は「<a href="https://www.mk-mode.com/octopress/2016/10/06/ruby-sun-moon-apparent-position-calculation/">Ruby - JPL DE430 データから太陽・月の視位置を計算！</a>」等を参照のこと。
* その他、カレンダー等については、当ブログ過去記事を参照のこと。
  - [Category: 暦・カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/categories/%E6%9A%A6-%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Category: 暦・カレンダー - mk-mode BLOG")
  - [Tag: カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/tags/%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Tag: カレンダー - mk-mode BLOG")

---

以上。

