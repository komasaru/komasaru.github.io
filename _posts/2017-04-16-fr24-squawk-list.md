---
layout   : single
title    : "Ruby, Rails - Flightradar24 (SQUAWK) ページについて！"
published: true
date     : 2017-04-16 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Ruby
- Rails
---

[Flightradar24.com](https://www.flightradar24.com/ "Flightradar24.com") API で取得した全世界の SQUAK 7500, 7600, 7700 発信状況を確認するためのページを作成しました。

今回はそのページのご紹介です。

<!--more-->

### 公開ページ

* [mk-mode SITE : Flightradar24 (SQUAWK 75-77)](http://www.mk-mode.com/rails/fr24/squawk "mk-mode SITE : Flightradar24 (SQUAWK 75-77)")  

### 注意事項

* 出典は [Flightradar24.com](https://www.flightradar24.com/ "Flightradar24.com")
* 一覧データは [Flightradar24.com](https://www.flightradar24.com/ "Flightradar24.com") API で取得できたもの(ADS-B, MLAT etc.)のみ。
* システム内部でのデータ取得は60秒間隔で行っている。
* SQUAWK 7500 は「ハイジャック」、7600 は「無線機故障」、7700 は「緊急事態」のこと。
* 当ページのデータは、当方が別用途で使用するために記録していたものの確認用であり、視認性を考慮せず、そのまま出力している。
* 項目の意味は以下のとおり。（左から）
  1. ID
  2. SSR mode S コード
  3. 緯度（単位：度(degree)）
  4. 経度（単位：度(degree)）
  5. 進行方向（単位：度(degree)、0 度が北で時計回りに)
  6. 飛行高度（単位：フィート(feet)）
  7. スピード（単位：ノット(knot)）
  8. squawk（トランスポンダーに設定される識別信号4桁）
  9. 受信レーダ
  10. 機体種別
  11. 便名（ICAO コード）
  12. 時刻（Unix 時間）
  13. 出発空港（IATA コード）
  14. 到着空港（IATA コード）
  15. 便名（IATA コード）
  16. ?
  17. ?
  18. コールサイン（ICAO コード）
  19. ?
* [Flightradar24.com](https://www.flightradar24.com/ "Flightradar24.com") API でのデータの取得方法については、「[JSON - Flightradar24 から飛行中の航空機情報を取得！ - mk-mode BLOG]({{site.baseurl}}/2016/02/08/fr24-getting-flight-info/ "JSON - Flightradar24 から飛行中の航空機情報を取得！ - mk-mode BLOG")」を参照のこと。

---

よろしければ、参考にしてください。

以上。

