---
layout   : single
title    : "Ruby - NOAA（アメリカ海洋大気庁）気象観測所一覧！"
published: true
date     : 2014-03-27 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

[NOAA - National Oceanic and Atmospheric Administration](http://www.noaa.gov/ "NOAA - National Oceanic and Atmospheric Administration")（アメリカ海洋大気庁）の所有する世界中の気象観測所一覧についてです。

<!--more-->

### 0. NOAA 気象観測所一覧等について（概要）

- NOAA が気象観測・予報等を行うのに使用している気象観測所の一覧("A list of weather stations")のことである。
- アメリカは日本とは比べ物にならないくらい航空交通が盛んなため、気象観測所のほとんどが空港・飛行場に設置されている。  
  ゆえに、一覧内にある日本の観測所も空港・飛行場ばかり。
- METAR（定時航空実況気象通報式）対応の観測所は、気象データも公開されている。  
  （日本の場合は、航空業務で使用するもので、気象庁のデータとは異なる。）
- METAR による気象情報は、Linux OS 等の時計（天気）アプレットで表示する気象情報に使用されている。（METAR による気象情報は、一般公開されている）

### 1. 気象観測所一覧の取得

NOAA の気象観測所一覧は以下のサイトで公開されている。  
ページ内の "[ADDS Station Table(stations.txt)](http://www.aviationweather.gov/docs/metar/stations.txt "stations.txt")" リンクがそれである。

- [ADDS - METARs](http://www.aviationweather.gov/adds/metars/ "ADDS - METARs")

### 2. 気象観測所一覧の項目説明

気象観測所一覧の各項目は以下のようになっている。

<table class="common">
  <tr>
    <th>項目名</th>
    <th>説明</th>
  </tr>
  <tr>
    <td>CD</td>
    <td>州短縮コード</td>
  </tr>
  <tr>
    <td>STATION</td>
    <td>測候所名（16文字以内）</td>
  </tr>
  <tr>
    <td>ICAO</td>
    <td>国際民間航空機関コード（4文字）</td>
  </tr>
  <tr>
    <td>IATA</td>
    <td>国際航空運送協会（3文字）</td>
  </tr>
  <tr>
    <td>SYNOP</td>
    <td>地上実況気象通報式番号（5桁）</td>
  </tr>
  <tr>
    <td>LAT</td>
    <td>緯度（度 分）</td>
  </tr>
  <tr>
    <td>LON</td>
    <td>経度（度 分）</td>
  </tr>
  <tr>
    <td>ELEV</td>
    <td>標高（m）</td>
  </tr>
  <tr>
    <td>M</td>
    <td>METAR 発表測候所<br />
      - X: 該当<br />
      - Z: 廃止</td>
  </tr>
  <tr>
    <td>N</td>
    <td>NEXRAD (WSR-88D) レーダーサイト<br />
      - X: 該当</td>
  </tr>
  <tr>
    <td>V</td>
    <td>航空種別
      - V: AIRMET（天気現象に関する注意報）/SIGMET（空域悪天情報）<br />
      - A: ARTCC（航空路交通管制センター）<br />
      - T: TAF（運航用飛行場予報気象通報式）<br />
      - U: T + V</td>
  </tr>
  <tr>
    <td>U</td>
    <td>高層大気観測種別<br />
      - X: レーウィンゾンデ<br />
      - W: ウィンドプロファイラ</td>
  </tr>
  <tr>
    <td>A</td>
    <td>自動化種別
      - A: ASOS（自動地上気象観測システム）<br />
      - W: AWOS（自動気象観測システム）<br />
      - M: Meso（メソ気象学）<br />
      - H: Human（人間）<br />
      - G: Augmented（拡張）</td>
  </tr>
  <tr>
    <td>C</td>
    <td>センター・オフィス種別<br />
      - F: WFO（気象予報事務所）<br />
      - R: RFC（河川予報センター）<br />
      - C: NCEP（国立環境予測センター）</td>
  </tr>
  <tr>
    <td>9（最後から２番目の列）</td>
    <td>優先度（区画、作図）？</td>
  </tr>
  <tr>
    <td>XX（最後の列）</td>
    <td>国コード（ISO 3166 準拠）</td>
  </tr>
</table>

### 3. 日本の ICAO 空港コードについて

ICAO（国際民間航空機関）制定の日本の空港コードは、以下のようになっている。

- `RJ` で始まる４文字の英数字。（"J" は "Japan" の "J"）  
  沖縄県内の施設と鹿児島県の与論空港以外の日本国内の施設。
- `RO` で始まる４文字の英数字。（"O" は "Okinawa" の "O"）  
  沖縄県内の施設と鹿児島県の与論空港。

### 4. 国別の観測所数一覧

参考までに、観測所一覧を読み込んで国別に集計してみた。（日本（"JP"）には "*" を付加している）

``` text
  US:3377  CA: 833  BR: 167  DE: 166  GB: 163  FR: 158  AU: 158  IT: 155 *JP: 136  RU: 129
  ZA: 120  ID: 120  AF: 104  AR: 101  KR:  86  IN:  82  MX:  81  TR:  79  CN:  78  IR:  78
  NO:  78  ES:  68  TH:  62  SE:  60  PH:  59  GR:  54  VE:  51  CO:  51  CL:  48  CD:  46
  DZ:  43  IQ:  41  GL:  40  SA:  40  PE:  40  FI:  38  NA:  38  PL:  38  PK:  37  BE:  35
  NL:  34  KE:  33  DK:  32  SD:  31  BO:  31  ZM:  30  MY:  30  PT:  30  EC:  29  MA:  29
  CM:  28  TW:  28  ET:  28  KM:  27  CU:  26  YE:  24  TZ:  24  MM:  24  NZ:  22  NG:  22
  WS:  22  CH:  21  KZ:  21  MZ:  21  EG:  20  CZ:  20  AT:  20  ML:  20  RO:  20  OM:  19
  GH:  19  UA:  19  FJ:  19  PA:  18  HN:  18  TN:  17  CS:  17  VN:  16  BS:  16  SO:  16
  IS:  16  ZW:  16  TD:  15  CI:  15  AO:  15  GT:  15  BW:  15  NE:  14  SZ:  14  UG:  14
  UY:  14  HU:  14  CF:  14  GA:  14  LA:  14  TM:  14  SN:  13  CG:  13  MW:  13  GY:  13
  AE:  13  HR:  12  DO:  12  BA:  12  BD:  12  MR:  12  BF:  11  UZ:  11  IE:  11  SK:  11
  GN:  10  LY:  10  FM:  10  PG:  10  NC:   9  NP:   8  BG:   8  IL:   8  NI:   8  BY:   8
  CR:   8  PY:   8  JO:   8  AZ:   7  SR:   7  CY:   7  VU:   7  VI:   7  TG:   7  SI:   7
  KH:   6  LK:   6  BJ:   6  SV:   6  SY:   6  GE:   6  EE:   6  MD:   5  CV:   5  RW:   5
  LV:   5  VC:   5  AQ:   5  AG:   4  HK:   4  LT:   4  TT:   4  SL:   4  DN:   4  AM:   4
  SG:   4  KV:   4  DJ:   4  TP:   4  HT:   4  KW:   4  SB:   3  SC:   3  KY:   3  KG:   3
  MU:   3  GW:   3  MV:   3  DM:   3  KN:   2  JM:   2  AL:   2  QA:   2  ST:   2  EH:   2
  FK:   2  LC:   2  AN:   2  GD:   2  LR:   2  TJ:   2  LS:   2  BH:   2  MK:   2  GP:   2
  GQ:   2  BB:   2  MT:   2  MS:   1  MQ:   1  MO:   1  AW:   1  GM:   1  LU:   1  BI:   1
  GI:   1  BM:   1  BT:   1  LB:   1  CC:   1  AH:   1  BZ:   1  SH:   1
Count of countries: 198
```

[日本国（外務省）](http://www.mofa.go.jp/mofaj/area/world.html "世界と日本のデータを見る（世界の国の数，国連加盟国数，日本の大使館数など） ｜ 外務省")が国として承認しているのは「195カ国」だが、[ISO 3166](http://www.iso.org/iso/country_codes "ISO 3166 - Country codes - ISO")による分類で集計すると「198カ国」になるようだ。  
それにしても、アメリカ・カナダの気象観測所（≒空港等）の数は多いですね。

### 5. 使用した Ruby スクリプト

参考までに、上記の一覧を取得するために作成した Ruby スクリプトは以下のとおり。

File: `noaa_stations.rb`

{% highlight ruby linenos %}
# ***************************************
# NOAA - 気象観測所一覧取得処理
# ***************************************
require 'open-uri'

class NoaaStations
  FILE = "http://www.aviationweather.gov/static/adds/metars/stations.txt"

  def initialize
    @hash = Hash.new(0)
    @cnt_c = 0
  end

  # メイン処理
  def exec_main
    # ファイル読込＆集計
    compile

    # 結果出力
    display
  rescue => e
    puts "[#{e.class}] #{e.message}"
    e.backtrace.each{|trace| puts "\t#{trace}"}
    exit 1
  end

  private

  # ファイル読込＆集計
  def compile
    open(FILE) do |f|
      while l = f.gets
        l.chomp!
        next if l =~ /^\!/
        next if l.split(//).size < 80
        country_code = l[(-2)..(-1)]
        @hash[country_code] += 1
      end
    end
  rescue => e
    raise
  end

  # 結果出力
  def display
    @hash.sort_by{|k, v| k}.sort_by{|k, v| -v}.each do |k, v|
      print k == "JP" ? " *" : "  "
      printf("#{k}:%4d", v.to_i)
      puts if (@cnt_c += 1) % 10 == 0
    end
    puts "\nCount of countries: #{@cnt_c}"
  rescue => e
    raise
  end
end

NoaaStations.new.exec_main
{% endhighlight %}

- [Gist - Ruby script to calculate a summary of the list of NOAA's weather stations.](https://gist.github.com/komasaru/9597192 "Gist - Ruby script to calculate a summary of the list of NOAA's weather stations.")

---

何かの役に立つような気のする内容でした。（個人的に目論んでいることはある。実現可能か否かは不明だけど。）

以上。

