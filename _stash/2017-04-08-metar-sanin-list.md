---
layout   : single
title    : "Ruby, Rails - METAR 気象情報（山陰）ページについて！"
published: true
date     : 2017-04-08 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Ruby
- Rails
---

前回、当方 Web サイトに設置した METAR 気象観測所一覧ページの紹介をしました。

* [Ruby, Rails - METAR 気象観測所一覧ページについて！]({{site.baseurl}}/2017/04/04/metar-station-list "Ruby, Rails - METAR 気象観測所一覧ページについて！")

今回は、 METAR 気象情報（山陰の4空港限定）ページのご紹介です。

<!--more-->

### 1. 公開ページ

* [mk-mode SITE : METAR - 気象情報（山陰）](http://www.mk-mode.com/rails/metar/local "mk-mode SITE : METAR - 気象情報（山陰）")  

### 2. 注意事項

* 表示する情報は山陰（鳥取、米子、出雲、石見）に限定している。
* 表示は直近100件で、日時降順・空港名昇順でソートしている。
* 情報の出典は [ADDS - METARs](http://www.aviationweather.gov/metar?gis=off "ADDS - METARs") である。
* RJOR は「鳥取空港」、RJOH は「米子空港（美保飛行場）」、RJOC は「出雲空港」、RJOW は「石見空港」である。
* 隠岐空港は [ADDS - METARs](http://www.aviationweather.gov/metar?gis=off "ADDS - METARs") で情報が公開されていないので、非対応。  
  （別のWebサイトから取得することも可能だが、 [ADDS - METARs](http://www.aviationweather.gov/metar?gis=off "ADDS - METARs") からの取得に統一したいため）

---

よろしければ、参考にしてください。

以上。

