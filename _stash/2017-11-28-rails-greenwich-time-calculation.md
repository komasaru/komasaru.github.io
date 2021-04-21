---
layout   : single
title    : "Ruby, Rails - グリニッジ恒星時計算ページ！"
published: true
date     : 2017-11-28 00:20:00 +0900
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

今回、グリニッジ恒星時を計算するページを設置しました。

以下、そのページの紹介です。

<!--more-->

### 1. 公開ページ

* [mk-mode SITE : グリニッジ恒星時計算](https://www.mk-mode.com/rails/cal_tool/greenwich_time "mk-mode SITE : グリニッジ恒星時計算")

### 2. 注意事項

* リクエストを `greenwich_time.txt` とすれば、テキストで結果を返す。  
  （引数は `?year=2017&month=1&day=2&hour=12&min=34&sec=56` のように付与。引数なしでシステム時刻をUTCとみなす）
* 計算根拠となっている理論は IAU2006.
* 各項目
  - `ERA` : Earth Rotation Angle; 地球回転角
  - `EO` : Equation of the Origins; 原点差
  - `GAST` : Greenwich Apparent Sidereal Time; グリニッジ視恒星時
  - `GMST` : Greenwich Mean Sidereal Time; グリニッジ平均恒星時
  - `EE` : Equation of Equinoxes; 分点均差
* 詳細は「<a href="https://www.mk-mode.com/octopress/2016/08/06/ruby-calc-greenwich-sidereal-time/">Ruby - グリニッジ恒星時の計算（IAU2006 理論）！</a>」等を参照のこと。</li>
* その他、カレンダー等については、当ブログ過去記事を参照のこと。
  - [Category: 暦・カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/categories/%E6%9A%A6-%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Category: 暦・カレンダー - mk-mode BLOG")
  - [Tag: カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/tags/%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Tag: カレンダー - mk-mode BLOG")

---

以上。

