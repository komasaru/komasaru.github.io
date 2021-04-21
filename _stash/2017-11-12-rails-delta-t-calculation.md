---
layout   : single
title    : "Ruby, Rails - ΔT（地球自転速度補正値）計算ページ！"
published: true
date     : 2017-11-12 00:20:00 +0900
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

今回、任意の年月のΔT（地球自転速度補正値）を個別に計算するページを設置しました。

以下、そのページの紹介です。

> 【2018-11-11 追記】  
> ΔT（地球自転速度補正値）計算は「[時刻系変換](https://www.mk-mode.com/rails/cal_tool/conv_time "時刻系変換")」に含まれているので、ΔT計算ページの運用は終了しました。  
> 【追記ここまで】

<!--more-->

### 1. 公開ページ

* ~~[mk-mode SITE : ΔT計算](https://www.mk-mode.com/rails/cal_tool/delta_t "mk-mode SITE : ΔT計算")~~ （2018-11-11削除）

### 2. 注意事項

* リクエストを `delta_t.txt` とすれば、テキストで結果を返す。  
  （引数は `?year=2017&month=1` のように付与。引数なしでシステム年月を年月(JST)とみなす）
* 根拠となっている計算式は NASA 提供のものである。
* 最近の NICT 提供のデータで計算可能なものはカッコ書きしている。
* ΔTの計算については「[Ruby - 地球自転速度補正値 ΔT の計算！ - mk-mode BLOG]({{site.baseurl}}/2016/07/29/ruby-delta-t-calculation/ "Ruby - 地球自転速度補正値 ΔT の計算！ - mk-mode BLOG")」を参照のこと。
* 計算方法等については、当ブログ過去記事を参照のこと。
  - [Category: 暦・カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/categories/%E6%9A%A6-%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Category: 暦・カレンダー - mk-mode BLOG")
  - [Tag: カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/tags/%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Tag: カレンダー - mk-mode BLOG")

---

以上。

