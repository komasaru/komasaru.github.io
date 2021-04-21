---
layout   : single
title    : "Ruby, Rails - カレンダー個別計算ページ！"
published: true
date     : 2017-11-04 00:20:00 +0900
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

今回、任意の日付のカレンダーを個別に計算するページを設置しました。

以下、そのページの紹介です。

<!--more-->

### 1. 公開ページ

* [mk-mode SITE : カレンダー計算](https://www.mk-mode.com/rails/cal_tool/jpl_cal "mk-mode SITE : カレンダー計算")

### 2. 注意事項

* リクエストを `jpl_cal.txt` とすれば、テキストで結果を返す。  
  （引数は `?year=2017&month=1&day=2` のように付与。引数なしでシステム日付をJSTとみなす）
* あらかじめ計算しておいた情報を表示する[一覧ページ](https://www.mk-mode.com/rails/calendar/calendar "mk-mode SITE : カレンダー（月間）")とは異なり、「計算」ボタン押下後に計算を行うため、結果表示に若干時間がかかる。
* 計算の根拠となっているデータは NASA JPL DE430 である。
* 計算結果は、左から  
  年月日、曜日、ユリウス通日UTC(JST)、日の干支、旧暦年月日、六曜、（二十四節気）、（雑節）、（節句）、太陽の視黄経、月の視黄経、月齢  
  （カッコの項目は、存在しない場合は省略）
* 計算方法等については、当ブログ過去記事を参照のこと。
  - [Category: 暦・カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/categories/%E6%9A%A6-%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Category: 暦・カレンダー - mk-mode BLOG")
  - [Tag: カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/tags/%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Tag: カレンダー - mk-mode BLOG")

---

以上。

