---
layout   : single
title    : "Bash - METAR 気象情報取得！"
published: true
date     : 2014-03-30 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- シェル
- bash
---

前回は、[NOAA - National Oceanic and Atmospheric Administration](http://www.noaa.gov/ "NOAA - National Oceanic and Atmospheric Administration")（アメリカ海洋大気庁）の所有する世界中の気象観測所一覧から目的の観測所を検索するシェル（Bash）スクリプトを紹介しました。

- [Bash - NOAA 気象観測所検索！]({{site.baseurl}}/2014/03/28/bash-getting-a-weather-station-noaa "Bash - NOAA 気象観測所検索！")

今回は、METAR（定時航空実況気象通報式）についての備忘録です。  
また、指定した ICAO コードの観測所（空港）の METAR 情報を取得するシェル（Bash）スクリプトも紹介します。

<!--more-->

### 0. 前提条件

- GNU bash, バージョン 4.2.25(1)-release での作業を想定。

### 1. METAR とは？

- METAR とは「定時航空実況気象通報式」と呼ばれ、ICAO（国際民間航空機関）が基本形式をWMO（世界気象機関）が国際符号を策定した、航空気象情報を定期的に通報するために定められた共通フォーマットのことである。
- Linux OS(GUI) の時計アプレット・お天気アプレットの天気情報として利用されている。
- データは、以下のサイトで公開されている。
  * [ADDS - METARs](http://www.aviationweather.gov/adds/metars/ "ADDS - METARs")

### 2. METAR 書式

METAR の基本的な書式は以下のようになっている。（以下は一例で、説明用の架空の情報）  
書式等は国によって異なる部分もあるので注意。また、状況により出現したりしなかったりする項目もある。

``` text
2014/03/18 23:00
RJOC 182300Z 15003KT 130V250 8000 SHRA BR FEW020 BKN030 06/04 Q1019 NOSIG
```

各項目の意味は以下のとおり（日本の場合）

- **ICAO コード**
  * 例の `RJOC` は「出雲空港」
- **日時**
  * 例の `182300Z` は「18日23時00分(UTC)」
- **風（風向＋風速）**
  * 例の `15003KT` は「風向：150度（北から時計回り）、風速：3ノット」
  * 平均風速を10kt以上上回る最大瞬間風速が観測された場合は、 `15003G20KT` のように平均風速値の後に `G` をを挟んで最大瞬間風速が記述される。
  * 風速が100kt以上となる場合は `P99` で表される。
- **風向変動**
  * 例の `130V250` は「風向の変動が130度から250度の間」
- **視程**
  * 例の `8000` は「卓越視程：8000m(8km)」
  * 5,000m未満は100m単位、5,000m(5km)以上10,000m(10km)未満は1km単位。
  * 10,000m(10km)以上は `9999` で表される。
  * 記号の意味は以下のとおり。
    - `SKC` : 晴天(Sky Clear, =雲が無い)
    - `NSC` : 運行上有意な雲無し(Nil Significant Cloud, =雲が無い)
    - `CAVOK` : 気象条件が必要条件を満足する(Cloud And Visibility OK, =快晴)
      * 卓越視程が10km以上。
      * 5,000ft未満に雲がなく、かつ重要な対流雲がない。
      * 天気略語表に該当する天気がない。
    - `SKC` : 雲がなく、鉛直視程も良好だがCAVOKでないとき。
- **現在天気**
  * 例の `SHRA BR` は「しゅう雨性の雨で、もやがある」
  * 記号の意味は以下のとおり。
    - 強度・周辺現象
      * `-` : 弱い
      * （表示なし） : 並
      * `+` : 強い
      * `VC` : 飛行場の境界から8㎞以内の現象
    - 特性
      * `TS` : 雷電(Thunder Storm)
      * `SH` : しゅう雨性(Shower)
      * `FZ` : 着氷性(Freezing)
      * `BC` : 散在(Patches, (仏)Bancs)
      * `DR` : 低い(Dow Drifting)
      * `BL` : 高い(Blowing)
      * `MI` : 地(Shallow, (仏)Mince, =浅い)
      * `PR` : 部分的(Partial)
    - 降水現象
      * `RA` : 雨(Rain)
      * `DZ` : 霧雨(Drizzle)
      * `SN` : 雪(Snow)
      * `SG` : 霧雪(Snow Grains)
      * `GR` : ひょう(Hail, (仏)Grêle)
      * `GS` : 氷あられ／雪あられ(Small Hail/Snow Pellets, Ground Snow)
      * `PL` : 凍雨(Ice Pellets)
      * `IC` : 氷晶(Ice Crystals)
    - 視程障害現象
      * `BR` : もや(Mist)（視程1km以上5km以下）
      * `FU` : 煙(Smoke, (仏)Fumée)（視程5km以下）
      * `HZ` : 煙霧(Haze)（視程5km以下）
      * `SA` : 砂(Sand)（視程5km以下）
      * `DU` : 塵(Dust)（視程5km以下）
      * `FG` : 霧(Fog)（視程1km未満）
      * `VA` : 火山灰(Volcanic Ash)
    - その他の現象
      * `SQ` : スコール(Squall)
      * `DS` : 砂じん嵐(Duststorm)
      * `FC` : ろうと雲・たつ巻(Funnel Cloud, Tornado or Water-spout)※`+FC`で竜巻
      * `SS` : 砂じん嵐(Sandstorm)
      * `PO` : じん旋風(Dust/Sand Whirls, (仏)Poussière)
- **雲量**
  * 例の `FEW025 BKN030` は「2,500ftに全天の1/8～2/8を覆う雲、3,000ftに全店の5/8〜7/8を覆う雲がある」
  * 記号の意味は以下のとおり。
    - `SKC` : 雲がない
    - `FEW` : 全天の1/8～2/8を覆う雲
    - `SCT` : 全天の3/8～4/8を覆う雲
    - `BKN` : 全天の5/8～7/8を覆う雲
    - `OVC` : 全天を覆う雲
    - `VV999` : 鉛直視程999×100ft（濃霧等の場合に使用）
- **雲形**
  * 記号の意味は以下のとおり。
    - `AC` : 高積雲(Altocumulus)
    - `AS` : 高層雲(Altostratus)
    - `CB` : 積乱雲（入道雲、かなとこ雲）(Cumulonimbus)
    - `CC` : 巻積雲, まだら雲(Cirrocumulus)
    - `SL` : レンズ雲（強風を示唆）(Standing Lenticular Cloud)
    - `CI` : 巻雲（すじ雲）(Cirrus)
    - `CS` : 巻層雲(Cirrostratus)
    - `CU` : 積雲(Cumulus)
    - `NS` : 乱層雲(Nimbostratus)
    - `SC` : 層積雲(Stratocumulus)
    - `ST` : 層雲(Stratus)
    - `TCU` : 雄大積雲（入道雲）(Towering Cumulus)
- **気温・露点温度**
  * 例の `06/04` は「気温が摂氏6度、露点温度が摂氏4度」
- **気圧**
  * 例の `Q1019` は「気圧が1019hPa（QNH方式）」
- **その他**
  * 記号の意味は以下のとおり。
    - `WS` : ウィンドシアー（風向が方位上下方向共に急変）
    - `NOSIG` : 天候に変化は無い。
    - `BECMG` : 天候が継続的に変化する。「のち」。
    - `TEMPO` : 天候が一時的に変化する。「ときどき」。
    - `RMKS` : 特記事項・国内記事(Remark)
  * 厳密には多数の記号が使用されているが、ここでは説明しない。Web サイト等を参照のこと。

### 3. データ公開先

METAR データは以下の URL で公開されている。

- ~~~[http://weather.noaa.gov/pub/data/observations/metar/](http://weather.noaa.gov/pub/data/observations/metar/)~~~  
  [http://tgftp.nws.noaa.gov/data/observations/metar/](http://tgftp.nws.noaa.gov/data/observations/metar/)
- [ftp://tgftp.nws.noaa.gov/data/observations/metar/](ftp://tgftp.nws.noaa.gov/data/observations/metar/)

そして、リンク先は以下の4つのディレクトリで構成されている。

- "cycles" ディレクトリ
  * 0時から23時まで1時間単位で全データがファイル化されている。
- "stations" ディレクトリ
  * 観測所（空港）（ICAO コード）別に最新のデータがファイル化されている。
- "decoded" ディレクトリ
  * 観測所（空港）（ICAO コード）別に最新のデータがファイル化されているが、箇条書きされていて可読性が高い。
- "trend" ディレクトリ
  * 観測所（空港）（ICAO コード）別に天気予報データがファイル化されている。（仕様・フォーマットの詳細は不明）

### 4. データ取得（コマンドライン）

ブラウザから取得する以外に、`wget` コマンドや `curl` コマンドで簡単に取得できる。（以下は "decode" データの取得例）

``` text
$ wget -q -O - http://tgftp.nws.noaa.gov/data/observations/metar/decoded/RJOC.TXT
Izumo Airport, Japan (RJOC) 35-25N 132-54E 5M
Mar 19, 2014 - 12:00 AM EDT / 2014.03.19 0400 UTC
Wind: from the ENE (070 degrees) at 14 MPH (12 KT):0
Visibility: greater than 7 mile(s):0
Sky conditions: mostly cloudy
Temperature: 53 F (12 C)
Dew Point: 37 F (3 C)
Relative Humidity: 54%
Pressure (altimeter): 30.03 in. Hg (1017 hPa)
ob: RJOC 190400Z 07012KT 9999 FEW030 BKN/// 12/03 Q1017
cycle: 4
```

以下でも同様。

``` text
$ curl http://tgftp.nws.noaa.gov/data/observations/metar/decoded/RJOC.TXT
```

### 5. Bash スクリプト作成

取得する都度長い URL を入力するのは面倒なので、簡単な Bash スクリプトを作成する。（英字は大文字限定）

File: `metar.sh`

{% highlight bash linenos %}
#!/bin/bash

# 引数(ICAO コード)不正なら終了
if [[ ! "$1" =~ [0-9A-Z]{4} ]]; then
    echo "Wrong argument!"
    exit
fi

# URL("decode" データ)（以下のどちらか）
URL="http://tgftp.nws.noaa.gov/data/observations/metar/decoded/"
#URL="ftp://tgftp.nws.noaa.gov/data/observations/metar/decoded/"

# METAR 取得（以下のどちらか）
wget -q -O - "${URL}${1}.TXT"
#curl "${URL}${1}.TXT"
{% endhighlight %}

- [Gist - Bash script to get a METAR information.](https://gist.github.com/komasaru/9635884 "Gist - Bash script to get a METAR information.")

### 6. Bash スクリプト実行

引数に英4文字の ICAO コードを指定して Bash スクリプトを実行する。

``` text
$ ./metar.sh RJOC
Izumo Airport, Japan (RJOC) 35-25N 132-54E 5M
Mar 19, 2014 - 12:00 AM EDT / 2014.03.19 0400 UTC
Wind: from the ENE (070 degrees) at 14 MPH (12 KT):0
Visibility: greater than 7 mile(s):0
Sky conditions: mostly cloudy
Temperature: 53 F (12 C)
Dew Point: 37 F (3 C)
Relative Humidity: 54%
Pressure (altimeter): 30.03 in. Hg (1017 hPa)
ob: RJOC 190400Z 07012KT 9999 FEW030 BKN/// 12/03 Q1017
cycle: 4
```

### 7. その他

METAR 同様に、TAF（運航用飛行場予報気象通報式）という天気予報データも公開されている。  
参考までに URL は以下のとおり。

- ~~~[http://weather.noaa.gov/pub/data/forecasts/taf/](http://weather.noaa.gov/pub/data/forecasts/taf/)~~~  
  [http://tgftp.nws.noaa.gov/data/forecasts/taf/](http://tgftp.nws.noaa.gov/data/forecasts/taf/)
- [ftp://tgftp.nws.noaa.gov/data/forecasts/taf/](ftp://tgftp.nws.noaa.gov/data/forecasts/taf/)

そして、リンク先は以下の2つのディレクトリで構成されている。

- "cycles" ディレクトリ
  * 0時から18時まで6時間単位で全データがファイル化されている。
- "stations" ディレクトリ
  * 観測所（空港）（ICAO コード）別に最新のデータがファイル化されている。

METER 同様、容易に Bash スクリプトを作成できるであろう。

### 8. 参考サイト

- [ADDS - METARs](http://www.aviationweather.gov/adds/metars/ "ADDS - METARs")
- [中部航空地方気象台－飛行場実況気象通報式（ＭＥＴＡＲ、ＳＰＥＣＩ）の解説－](http://www.jma-net.go.jp/chubu-airport/metar_1.htm "中部航空地方気象台－飛行場実況気象通報式（ＭＥＴＡＲ、ＳＰＥＣＩ）の解説－")

---

気象庁等の発表する気象データとは異なる航空業務用の気象データが存在するということを知った次第です。

簡単なテキストデータなので、システム利用も容易でしょう。

以上。

