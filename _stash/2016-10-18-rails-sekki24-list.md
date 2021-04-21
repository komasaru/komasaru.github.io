---
layout   : single
title    : "Ruby, Rails - 二十四節気（時刻入り）一覧ページ！"
published: true
date     : 2016-10-18 00:20:00 +0900
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

この度、高精度で計算できるようになったので、既存の Rails 製の自 Web サイト上「二十四節気一覧」ページに二十四節気の瞬間の時刻を追加しました。（国立天文台の計算と高精度で一致するはず）

<!--more-->

### 0. 前提条件

* 太陽の視位置を計算するのに、よくある三角関数を多用した略算式では誤差が発生するため、 NASA の機関 [JPL(Jet Propulsion Laboratory)](http://www.jpl.nasa.gov/ "NASA Jet Propulsion Laboratory (JPL) - Space Mission and Science News, Videos and Images") が惑星探査用に編纂・発行している太陽・月・惑星の暦の最新版 [DE430](ftp://ssd.jpl.nasa.gov/pub/eph/planets/) を使用している。
* 太陽の視位置計算アルゴリズムには [IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy) の提供する C ソースコード](http://www.iausofa.org/2016_0503_C/CompleteList.html "SOFA Library Issue 2016-05-03 for ANSI C: Complete List") や、[国立天文台も採用している方法(PDF)](http://www.nao.ac.jp/contents/about-naoj/reports/report-naoj/11-34-2.pdf "暦象年表の改訂について - 国立天文台")を使用している。
* 実際の計算には、別途自作した RubyGems ライブラリ [mk_apos](https://rubygems.org/gems/mk_apos) ( [eph_jpl](https://rubygems.org/gems/eph_jpl), [eph_bpn](https://rubygems.org/gems/eph_bpn), [mk_coord](https://rubygems.org/gems/mk_coord), [mk_time](https://rubygems.org/gems/mk_time) )を使用している。
* 自作の RubyGems ライブラリ [mk_apos](https://rubygems.org/gems/mk_apos) は任意の日時の太陽・月の視位置を JPL DE430 データから高精度で計算するものだが、二十四節気の瞬間の時刻を算出するには二分法を使用している。（ここでは、そのプログラムの紹介はしない）

### 1. 二十四節気一覧ページの紹介

今回は、そういうページを作成して公開したという紹介をするのみ。

実際に公開しているページは以下。

* [mk-mode SITE : 二十四節気一覧](http://www.mk-mode.com/rails/calendar/sekki24 "mk-mode SITE : 二十四節気一覧")

---

二十四節気の瞬間を都度コマンドラインで計算していたのを、自分の Web ページで容易に確認できるようにしてみた次第です。

以上。

