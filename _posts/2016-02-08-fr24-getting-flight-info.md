---
layout   : single
title    : "JSON - Flightradar24 から飛行中の航空機情報を取得！"
published: true
date     : 2016-02-08 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- JSON
---

航空機の運行状況をリアルタイムで確認できる Web サイト [Flightradar24.com](http://www.flightradar24.com "Flightradar24.com - Live flight tracker!") から、現在飛行中の航空機の情報を領域を指定して取得する方法についての備忘録です。

空港情報一覧や航空会社一覧の取得については前々回や前回の記事をご参照ください。

* [Ruby - Flightradar24 から空港情報一覧取得！]({{site.baseurl}}/2016/02/06/ruby-getting-airport-list-from-fr24/ "Ruby - Flightradar24 から空港情報一覧取得！")
* [Ruby - Flightradar24 から航空会社情報一覧取得！]({{site.baseurl}}/2016/02/07/ruby-getting-airline-list-from-fr24/ "Ruby - Flightradar24 から航空会社情報一覧取得！")

<!--more-->

### 0. 前提条件

* 取得するデータは JSON 形式なので、JSON の基本的な知識があること。
* 全ての航空機を取得できる訳ではない。  
  （受信した ADS-B 等の信号を Flightradar24 へ提供する有志（いわゆる Feeder）が存在しない地域や、航空機から発信される信号が弱い場合などは情報が提供されないこともある。元々信号を発信していない航空機も当然ながら存在する）
* 以下で紹介するのは、自分で Web ブラウザを使用して取得する方法。  
  （当方は、実際には Ruby スクリプトを作成して使用している）

### 1. ロードバランササーバ名の取得

ブラウザで URL `http://www.flightradar24.com/balance.json` にアクセスして JSON データを取得する。

次のような JSON データが取得できる。  
ロードバランサが複数存在すれば、複数取得できる。`1000` は優先度のようなもので、複数存在する場合は全部加算して `1000` になるようになっているはず。

``` text
{"data.flightradar24.com":1000}
```

### 2. 飛行情報の取得

ブラウザで次の URL `http://[load_balancer]/zones/fcgi/feed.js?bounds=[bounds]&adsb=1&mlat=1&faa=1&flarm=1&estimated=1&air=1&gnd=1&vehicles=1&gliders=1&array=1` にアクセスして JSON データを取得する。

* `load_balancer` は、前項で取得したロードバランサのサーバ名。  
* `bounds` は、取得したい領域（緯度（北）・緯度（南）・経度（西）・緯度（東））を設定するためのもの。設定しなければ全てのデータが対象。  
  （例： `35.57,35.38,132.96,133.20`）  
>  【2018-12-11 追記】  
>   **※但し、この API では1度に最大1,500件しか取得できないので、1,500件以上にならないよう `bounds` を指定して取得するのが賢明。**  
>  【追記ここまで】  
* `adsb=1`, `mlat=1`, `faa=1`, `flarm=1`, `estimated=1` は、 ADS-B, MLAT, FAA, FLARM, Estimated 信号を受信するための設定。
* `air=1`, `gnd=1`, `vehicles=1`, `gliders=1` は、航空機（上空?）、航空機（地上?）、地上走行車、グライダーの信号を受信するための設定(?)。
* `array=1` は、 `aircraft` 項目内に配列で取得するためのオプション。

### 3. 取得情報の確認

以下は、 `http://data.flightradar24.com/zones/fcgi/feed.js?bounds=35.6,34.2,131.55,133.55&adsb=1&mlat=1&faa=1&flarm=1&estimated=1&air=1&gnd=1&vehicles=1&gliders=1&array=1` で取得したデータ。（見やすいように整形している）

``` text
{
  "full_count":7841,
  "version":5,
  "copyright":"The contents of this file and all derived data are the property of Flightradar24 AB for use exclusively by its products and applications. Using, modifying or redistributing the data without the prior written permission of Flightradar24 AB is not allowed and may result in prosecutions.",
  "aircraft":[
    ["8b13efc","862D94",34.2681,132.5959,252,40000,320,"2010","F-RJOH1","B763","JA657J",1454302287,"HND","NGS","JL609",0,0,"JAL609",0],
    ["8b13fd4","86D2EE",34.5986,132.8036,255,40000,356,"1776","F-RJOH1","B788","JA818A",1454302287,"HND","FUK","NH253",0,0,"ANA253",0],
    ["8b1438d","850E15",34.5947,131.7789,236,35425,308,"0464","T-MLAT5","B735","JA305K",1454302289,"SDJ","FUK","NH1276",0,-1920,"",0]
  ]
}
```

飛行中の航空機の情報は `aircraft` 項目内で、`[` と `]` で囲まれた部分が１機分の情報。

各項目の意味は以下のとおり。（左から順に）

``` text
  "8b13efc"   #  0: ID
  "862D94"    #  1: SSR mode S コード
  34.2681     #  2: 緯度（単位：度(degree)）
  132.5959    #  3: 経度（単位：度(degree)）
  252         #  4: 進行方向（単位：度(degree)、0 度が北で時計回りに)
  40000       #  5: 飛行高度（単位：フィート(feet)）
  600         #  6: スピード（単位：ノット(knot)）
  "2010"      #  7: squawk（トランスポンダーに設定される識別信号4桁）
  "F-RJOH1"   #  8: 受信レーダ
  "B763"      #  9: 機体種別
  "JA657J"    # 10: 便名（ICAO コード）
  1454302287  # 11: 時刻（Unix 時間）
  "HND"       # 12: 出発空港（IATA コード）
  "NGS"       # 13: 到着空港（IATA コード）
  "JL609"     # 14: 便名（IATA コード）
  0           # 15: ?
  0           # 16: ?
  "JAL609"    # 17: コールサイン（ICAO コード）
  0           # 18: ?
```

### 4. 参考サイト

* ~~~[Cykey's blog — Analyzing Flightradar24's internal API structure](http://blog.cykey.ca/post/88174516880/analyzing-flightradar24s-internal-api-structure "Cykey's blog — Analyzing Flightradar24's internal API structure")~~~

Web 検索するとリアルタイム飛行情報を取得する方法についてある程度はヒットしますが、その９割くらいは情報が古い。（上記のサイトも、参考にはなるが内容が古い）

---

当方はこの仕組みを Ruby で実装（自宅を含む領域を指定）して使用しています。（実際には定期実行して取得＆記録。場合によっては、指定領域内に航空機が侵入した場合にツイートすることも考えている）

ADS-B 信号を受信することはそう難しいことでもないので、自分も Feeder になってみても良いかと感じている。（気が向いたら）

以上。

