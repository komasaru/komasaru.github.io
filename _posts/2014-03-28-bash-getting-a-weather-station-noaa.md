---
layout   : single
title    : "Bash - NOAA 気象観測所検索！"
published: true
date     : 2014-03-28 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- シェル
- bash
---

前回は、[NOAA - National Oceanic and Atmospheric Administration](http://www.noaa.gov/ "NOAA - National Oceanic and Atmospheric Administration")（アメリカ海洋大気庁）の所有する世界中の気象観測所一覧、それらを国別に集計する Ruby スクリプトを紹介しました。

- [Ruby - NOAA（アメリカ海洋大気庁）気象観測所一覧！]({{site.baseurl}}/2014/03/27/ruby-noaa-weather-stations "Ruby - NOAA（アメリカ海洋大気庁）気象観測所一覧！")

今回は、指定した ICAO コードに一致する空港（気象観測所）の情報を検索するシェル(Bash)スクリプトを紹介します。（単純に取得したテキストファイル内を検索しているだけですが）

<!--more-->

### 0. 前提条件

- GNU bash, バージョン 4.2.25(1)-release での作業を想定。

### 1. Bash スクリプト作成

以下のように Bash スクリプトを作成した。（英字は大文字限定）

File: `noaa_weather_station.sh`

{% highlight bash linenos %}
#!/bin/bash

# 引数(ICAO コード)不正なら終了
if [[ ! "$1" =~ [0-9A-Z]{4} ]]; then
    echo "Wrong argument! - $1"
    exit
fi

# 定数定義
URL="http://www.aviationweather.gov/static/adds/metars/stations.txt"
FILE="stations.txt"
HEADER="CD  STATION         ICAO  IATA  SYNOP   LAT     LONG   ELEV   M  N  V  U  A  C"
FLAG=0

# satations.txt 取得
wget -q -N ${URL}

# IFS は文字列リストのフィールド区切り文字で、デフォルトは半角スペース。
# 行をそのまま取り込むために IFS を改行に変更
OLDIFS="$IFS"
IFS="\n"

# 1行ずつ読み込み、引数と一致する ICAO コードの行を表示
while read LINE
do
    if [ "${LINE:20:4}" = $1 ]; then
        echo $HEADER
        echo $LINE
        FLAG=1
        break
    fi
done < "$FILE"

# 一致する ICAO コードが存在しなければ、メッセージ出力
if [ $FLAG = 0 ]; then
    echo "Not found! - $1"
fi

# IFS を元に戻す
IFS="$OLDIFS"
{% endhighlight %}

- [Gist - Bash script to search NOAA weather stations by a ICAO code.](https://gist.github.com/komasaru/9614307 "Gist - Bash script to search NOAA weather stations by a ICAO code.")

### 2. Bash スクリプト実行

作成した Bash スクリプトを４文字の半角英数字からなる ICAO コードを引数として実行する。  
以下は、 "RJOC"（出雲空港）を検索した例。

``` text
$ ./noaa_weather_station.sh RJOC
CD  STATION         ICAO  IATA  SYNOP   LAT     LONG   ELEV   M  N  V  U  A  C
   IZUMO AIRPORT    RJOC        47790  35 25N  132 52E    5   X     T          7 JP
```

### 3. 参考サイト

- [ADDS - METARs](http://www.aviationweather.gov/adds/metars/ "ADDS - METARs")

---

ICAO コードが分かれば METAR 気象情報も取得できるので、機会があれば挑戦してみようかとも考えています。

以上。

