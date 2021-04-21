---
layout   : single
title    : "Ruby, Rails - 天体暦（天体位置表）（JPL版）計算ページ！"
published: true
date     : 2017-11-16 00:20:00 +0900
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

今回、 ICRS(International Celestial Reference System) 天体暦（天体位置表）（JPL版）を計算するページを設置しました。

以下、そのページの紹介です。

<!--more-->

### 1. 公開ページ

* [mk-mode SITE : 天体暦（天体位置表）（JPL版）計算](https://www.mk-mode.com/rails/cal_tool/eph_jpl "mk-mode SITE : 天体暦（天体位置表）（JPL版）計算")

### 2. 注意事項

* リクエストを `eph_jpl.txt` とすれば、テキストで結果を返す。  
  （引数は `?target=3&center=11&jd=2458041.5` のように付与）
* 計算根拠となっているデータは NASA 提供の JPL DE430 である。
* 座標系は ICRS(International Celestial Reference System) 座標系である。
* 対象天体が「地球の章動」、「月の秤動」の場合、基準天体の選択は無視する。
* ユリウス日を省略した場合、現在システム日時を UTC とみなしてユリウス日とする。
* Position は基準天体から見た対象天体の位置。
* Velocity は基準天体から見た対象天体の移動速度。
* 詳細は「<a href="https://www.mk-mode.com/octopress/2016/04/30/ruby-calc-jpl-icrs-coordinate/">Ruby - JPL 天文暦データから ICRS 座標を計算！</a>」等を参照のこと。</li>
* その他、カレンダー等については、当ブログ過去記事を参照のこと。
  - [Category: 暦・カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/categories/%E6%9A%A6-%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Category: 暦・カレンダー - mk-mode BLOG")
  - [Tag: カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/tags/%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Tag: カレンダー - mk-mode BLOG")

---

以上。

