---
layout   : single
title    : "Ruby, Rails - 惑星間距離計算ページ！"
published: true
date     : 2018-09-29 00:20:00 +0900
comments : true
categories:
- Webサイト
- 暦・カレンダー
tags:
- Ruby
- Rails
- Python
---

当方 Ruby on Rails 製 Web サイト内に 2 つの惑星の距離を計算するページを設置しました。（計算自体は Python で）

<!--more-->

### 0. 公開ページ

* [mk-mode SITE : 惑星間計算](https://www.mk-mode.com/rails/cal_tool/dist_pl "mk-mode SITE : 惑星間計算")

### 1. ページのイメージ

以下は、火星が地球に再接近する頃の地球と火星の距離を2018年7月31日16時50分57秒の少し前から1秒間隔で計算した例。

![DIST_PL.png]({{site.baseurl}}/images/2018/09/29/DIST_PL.png "DIST_PL.png")

### 2. 注意事項

* リクエストを `dist_pl.txt` とすれば、テキストで結果を返す。  
  （引数は `?target=4¢er=3&year=2017&month=10&day=14&hour=12&min=34&sec=56&int_sec=10` のように付与。引数なしでシステム日付をJSTとみなす）
* 計算根拠となっているデータは NASA 提供の JPL DE430 である。
* 計算結果の出力は 600 件。
* 距離は重心と重心の間の距離。
* 距離の単位は km.
* 都度計算しているので、ページが表示されるまで多少時間がかかる。

---

以上。

