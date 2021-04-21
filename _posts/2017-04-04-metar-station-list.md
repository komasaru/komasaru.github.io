---
layout   : single
title    : "Ruby, Rails - METAR 気象観測所一覧ページについて！"
published: true
date     : 2017-04-04 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Ruby
- Rails
---

以前、 METAR の気象観測所一覧を取得する方法について記事にしました。

* [Ruby - NOAA（アメリカ海洋大気庁）気象観測所一覧！]({{site.baseurl}}/2014/03/27/ruby-noaa-weather-stations/ "Ruby - NOAA（アメリカ海洋大気庁）気象観測所一覧！")
* [Bash - NOAA 気象観測所検索！]({{site.baseurl}}/2014/03/28/bash-getting-a-weather-station-noaa/ "Bash - NOAA 気象観測所検索！")

今回、当方 Web サイト に METAR の気象観測所一覧を確認できるページを設けました。

単なるページのご案内です。

<!--more-->

### 1. 公開ページ

公開しているページは以下。

* [mk-mode SITE : METAR - 気象観測所一覧](http://www.mk-mode.com/rails/metar/stations "mk-mode SITE : METAR - 気象観測所一覧")  

### 2. 注意事項

* 当情報は「[AWC - ADDS METARs](http://www.aviationweather.gov/metar?gis=off "ADDS - METARs")」の "stations.txt" によるもの。
* 表示順は ICAO コード昇順。
* CD はアメリカ、カナダの州のみ。
* IATA コード未登録のものが多数。
* 表示に使用するデータは定期的にチェックし、最新のものに更新している。

---

よろしければ、参考にしてください。

以上。

