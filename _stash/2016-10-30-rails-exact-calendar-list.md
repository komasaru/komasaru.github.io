---
layout   : single
title    : "Ruby, Rails - 月別カレンダーページの更新！"
published: true
date     : 2016-10-30 00:20:00 +0900
comments : true
categories:
- Webサイト
- 暦・カレンダー
tags:
- Ruby
- Rails
- カレンダー
---

これまでコツコツと太陽と月の視位置を正確に計算するプログラムを作成してきました。

この度、高精度で計算できるようになったので、 Rails 製の自 Web サイト上の月別カレンダーページを更新いたしました。

<!--more-->

### 0. 前提条件

* よくある三角関数を多用した略算式では誤差が発生するため、 NASA の機関 JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している太陽・月・惑星の暦の最新版 DE430 を使用している。
* 計算アルゴリズムには [IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy) の提供する C ソースコード](http://www.iausofa.org/2016_0503_C/CompleteList.html "SOFA Library Issue 2016-05-03 for ANSI C: Complete List") や、[国立天文台も採用している方法(PDF)](http://www.nao.ac.jp/contents/about-naoj/reports/report-naoj/11-34-2.pdf "暦象年表の改訂について - 国立天文台")を使用している。
* 実際の計算には、別途自作した RubyGems ライブラリ [mk_cal_jpl](https://rubygems.org/gems/mk_cal_jpl) ( [mk_apos](https://rubygems.org/gems/mk_apos), [eph_jpl](https://rubygems.org/gems/eph_jpl), [eph_bpn](https://rubygems.org/gems/eph_bpn), [mk_coord](https://rubygems.org/gems/mk_coord), [mk_time](https://rubygems.org/gems/mk_time) )を使用している。

### 1. 月別カレンダーのページ

今回は、公開中のページを更新したという紹介をするのみ。

実際に公開しているページは以下。

* [mk-mode SITE : カレンダー（月間）](http://www.mk-mode.com/rails/calendar/calendar "mk-mode SITE : カレンダー（月間）")

ちなみに、各種の値を一連で確認しやすくするために、よくある1行で1週間のレイアウトではなく、1行で1日のレイアウトとしている。（過去には、1行で1週間のレイアウトにしておりましたが）

### 2. CSV データ

カレンダーデータの更新に伴い、ダウンロード可能な CSV ファイルの内容も更新しました。

* [mk-mode SITE : カレンダーCSVデータダウンロード](http://www.mk-mode.com/rails/calendar/csv "mk-mode SITE : カレンダーCSVデータダウンロード")

よろしければ、ご自由にご活用ください。

### 3. その他

* データの正確性については万全を期したつもりでが、誤りもあるかもしれません。自己の責任の元でのご利用をお願いいたいします。
* カレンダー作成に関することは、当ブログでも色々と紹介しております。ご参照ください。
  - [Category: 暦・カレンダー](http://www.mk-mode.com/octopress/categories/%E6%9A%A6-%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Category: 暦・カレンダー")
  - [Tag: カレンダー](http://www.mk-mode.com/octopress/tags/%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Tag: カレンダー")
  - [Google カスタム検索](https://cse.google.co.jp/cse?cx=partner-pub-7320193476057758%3A6328726109&ie=UTF-8&q=%E6%9A%A6+%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC&siteurl=www.mk-mode.com%2Foctopress%2Ftags%2F%25E3%2582%25AB%25E3%2583%25AC%25E3%2583%25B3%25E3%2583%2580%25E3%2583%25BC%2F&ref=www.mk-mode.com%2Foctopress%2Fcategories%2F%25E6%259A%25A6-%25E3%2582%25AB%25E3%2583%25AC%25E3%2583%25B3%25E3%2583%2580%25E3%2583%25BC%2F&ss=2943j3876099j4#gsc.tab=0&gsc.q=%E6%9A%A6%20%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC&gsc.page=1 "Google カスタム検索")
* ご質問やお問合せ等は「[こちら](http://www.mk-mode.com/rails/contact "mk-mode SITE : お問合せ")」へお願いいたします。

---

以上。

