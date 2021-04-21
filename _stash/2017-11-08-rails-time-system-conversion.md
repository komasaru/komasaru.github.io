---
layout   : single
title    : "Ruby, Rails - 時刻系変換ページ！"
published: true
date     : 2017-11-08 00:20:00 +0900
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

今回、各種時刻系を変換するページを設置しました。

以下、そのページの紹介です。

<!--more-->

### 1. 公開ページ

* [mk-mode SITE : 時刻系変換](https://www.mk-mode.com/rails/cal_tool/conv_time "mk-mode SITE : 時刻系変換")

### 2. 注意事項

* リクエストを `conv_time.txt` とすれば、テキストで結果を返す。  
  （引数は `?year=2017&month=1&day=2&hour=12&min=34&sec=56` のように付与。引数なしでシステム時刻をJSTとみなす）
* 計算の根拠となっているデータは NASA JPL DE430 である。
* 出力する項目は以下のとおり。
  - JST: 日本標準時 (Japan Standard Time)
  - UTC: 協定世界時 (Coordinated Universal Time)
  - JST - UTC: 日本標準時と協定世界時の差（単位：時間）
  - JD: ユリウス通日（Julian Day; 単位：日）
  - T: ユリウス世紀数（Julian Century Number; 単位：世紀）
  - UTC - TAI: 協定世界時と国際原子時の差（=うるう秒の総和; 単位：秒）
  - DUT1: 世界時１と協定世界時の差（=ΔUT1; 単位：秒）
  - delta T: 地球自転速度補正値(= TT - UT1 = TAI - UTC - DUT1 + 32.184; 単位：秒)
  - TAI: 国際原子時 (International Atomic Time)
  - UT1: 世界時１ (Universal Time 1)
  - TT: 地球時 (Terrestrial Time)
  - TCG: 地球重心座標時 (Geocentric Coordinate Time)
  - TCB: 太陽系重心座標時 (Barycentric Coordinate Time)
  - TDB: 太陽系力学時 (Barycentric Dynamical Time)
* UTC - TAI（うるう秒の総和）は、最後の実施日の24か月後まで有効。その後やうるう秒実施前は 0 に統一。
* DUT1 は、最後の実施日の3か月後まで有効。その後や DUT1 実施前は 0.0 に統一。
* 計算方法等については、当ブログ過去記事を参照のこと。
  - [Category: 暦・カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/categories/%E6%9A%A6-%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Category: 暦・カレンダー - mk-mode BLOG")
  - [Tag: カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/tags/%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Tag: カレンダー - mk-mode BLOG")

---

以上。

