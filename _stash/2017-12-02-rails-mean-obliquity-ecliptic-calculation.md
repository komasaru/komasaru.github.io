---
layout   : single
title    : "Ruby, Rails - 平均黄道傾斜角計算ページ！"
published: true
date     : 2017-12-02 00:20:00 +0900
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

今回、平均黄道傾斜角$$\epsilon_a$$を計算するページを設置しました。

以下、そのページの紹介です。

<!--more-->

### 1. 公開ページ

* [mk-mode SITE : 平均黄道傾斜角計算](https://www.mk-mode.com/rails/cal_tool/eps_a "mk-mode SITE : 平均黄道傾斜角計算")

### 2. 注意事項

* リクエストを `eps_a.txt` とすれば、テキストで結果を返す。  
  （引数は `?year=2017&month=1&day=2&hour=12&min=34&sec=56` のように付与。引数なしでシステム時刻を地球時とみなす）
* 計算根拠となっているのは国立天文台も使用している計算式。
* ユリウス日／ユリウス世紀数は、地球時(TT)に対するもの。
* 詳細は「<a href="https://www.mk-mode.com/octopress/2016/06/18/ruby-calc-mean-obliquity-ecliptic/">Ruby - 平均黄道傾斜角の計算！</a>」等を参照のこと。
* その他、カレンダー等については、当ブログ過去記事を参照のこと。
  - [Category: 暦・カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/categories/%E6%9A%A6-%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Category: 暦・カレンダー - mk-mode BLOG")
  - [Tag: カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/tags/%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Tag: カレンダー - mk-mode BLOG")

---

以上。

