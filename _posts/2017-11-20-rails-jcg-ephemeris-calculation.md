---
layout   : single
title    : "Ruby, Rails - 天体暦（天体位置表）（海保版）計算ページ！"
published: true
date     : 2017-11-20 00:20:00 +0900
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

今回、天体暦（天体位置表）（海保版）を計算するページを設置しました。

以下、そのページの紹介です。

<!--more-->

### 1. 公開ページ

* [mk-mode SITE : 天体暦（天体位置表）（海保版）計算](https://www.mk-mode.com/rails/cal_tool/eph_jcg "mk-mode SITE : 天体暦（天体位置表）（海保版）計算")

### 2. 注意事項

* リクエストを `eph_jcg.txt` とすれば、テキストで結果を返す。  
  （引数は `?year=2017&month=1&day=2&hour=12&min=34&sec=56` のように付与。引数なしでシステム時刻をJSTとみなす）
* `R.A.` は「視赤経」
* `DEC.` は「視赤緯」
* `DIST.` は「地心距離」
* `H.P.` は「視差」
* `hG.`“は「グリニジ時角」
* `S.D.` は「視半径」
* `EPS.` は「黄道傾斜角」
* `ALPHA` は「視赤経」
* `DELTA` は「視赤緯」
* `LAMBDA` は「視黄経」
* `BETA` は「視黄緯」
* 詳細は「<a href="https://www.mk-mode.com/octopress/2016/05/12/ruby-calc-ecliptic-ephemeris-by-kaiho/">Ruby - 太陽・月の視黄経・視黄緯の計算（海保略算式版）！</a>」等を参照のこと。</li>
* その他、カレンダー等については、当ブログ過去記事を参照のこと。
  - [Category: 暦・カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/categories/%E6%9A%A6-%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Category: 暦・カレンダー - mk-mode BLOG")
  - [Tag: カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/tags/%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Tag: カレンダー - mk-mode BLOG")

---

以上。

