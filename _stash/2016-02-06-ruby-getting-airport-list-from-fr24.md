---
layout   : single
title    : "Ruby - Flightradar24 から空港情報一覧取得！"
published: true
date     : 2016-02-06 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

航空機の運行状況をリアルタイムで確認できる Web サイト [Flightradar24.com](http://www.flightradar24.com "Flightradar24.com - Live flight tracker!") に登録されている空港情報の一覧を Ruby で取得してみました。（と言っても、 JSON データを取得しているだけですが）

<!--more-->

### 0. 前提条件

* Ruby 2.2.4-p230 での作業を想定。
* 世界中の全空港を網羅している訳ではない。（例えば、島根県の隠岐空港や萩・石見空港のような規模の小さい(?)空港の情報は登録されていない）

### 1. Ruby スクリプトの作成

難しいことはしていないので、説明は省略する。  
ただ、悪質な Bot でないことを主張するために連絡先を User Agent に設定している。（伏字は適宜置き換えること）

File: `fr24_airports.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= Flightradar24 空港情報取得
#
# date          name            version
# 2015.12.20    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2015 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#++
require 'json'
require 'open-uri'
require 'timeout'

class Fr24Airports
  URL        = "http://www.flightradar24.com/_json/airports.php"  # 接続先 URL
  TIMEOUT    = 10                                                 # OpenURI 接続時のタイムアウト
  USER_AGENT = "xxxxxxx Bot (by Ruby/#{RUBY_VERSION}, Administrator: xxxxxxxx@yyyyyyy.zzz)"
                                                                  # OpenURI 接続時の User-Agent, Mail Address
  FILE_PATH  = "./data/airports"                                  # 保存ファイル

  def exec
    get_json        # JSON 取得
    save_file       # ファイル保存 (見やすく整形したものがよければこちら)
    #save_file_csv  # ファイル保存（CSV 形式がよければこちら）
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}" }
    exit 1
  end

private

  # JSON 取得
  def get_json
    str = nil
    timeout(TIMEOUT) do
      str = open(URL, {"User-Agent" => USER_AGENT}) { |f| f.read }
    end
    @json = JSON.parse(str)["rows"].sort_by { |j| [j["country"], j["iata"]] }
  rescue => e
    raise
  end

  # ファイル保存
  # * 最大文字数（country: 32, name: 63）
  # * name の末尾に改行コードが含まれていることがあるので chomp している
  def save_file
    File.open("#{FILE_PATH}.txt", "w") do |f|
      str =  "COUNTRY" + " " * 27 + "IATA  ICAO  NAME" + " " * 68
      str << "LAT          LON    ALT"
      f.puts str
      @json.each do |j|
        str =  sprintf("%-32s  %3s   %4s", j["country"], j["iata"], j["icao"])
        str << sprintf("  %-63s", j["name"].chomp)
        str << sprintf("  %10.6f", j["lat"].to_f)
        str << sprintf("  %11.6f", j["lon"].to_f)
        str << sprintf("  %5d", j["alt"].to_i)
        f.puts str
      end
    end
  rescue => e
    raise
  end

  # ファイル保存（CSV 形式）
  # * 最大文字数（country: 32, name: 63）
  # * name の末尾に改行コードが含まれていることがあるので chomp している
  # * カンマが含まれる可能性のある country, name のみ "" でくくっている
  def save_file_csv
    File.open("#{FILE_PATH}.csv", "w") do |f|
      f.puts "COUNTRY,IATA,ICAO,NAME,LAT,LON,ALT"
      @json.each do |j|
        str =  "\"#{j["country"]}\",#{j["iata"]},#{j["icao"]},\"#{j["name"].chomp}\","
        str << "#{j["lat"]},#{j["lon"]},#{j["alt"]}"
        f.puts str
      end
    end
  rescue => e
    raise
  end
end

Fr24Airports.new.exec
{% endhighlight %}

* [Gist - Ruby script to get a airport list from Flightradar24.](https://gist.github.com/komasaru/75bd0abfbe95814c50bb "Gist - Ruby script to get a airport list from Flightradar24.")

### 2. Ruby スクリプトの実行

Ruby スクリプトと同じディレクトリ内に "data" ディレクトリを作成後、以下を実行。

``` text
$ ./fr24_airports.rb
```

### 3. データの確認

"data" ディレクトリ内に "airports.txt" が作成されるので確認してみる。

File: `data/airports.txt`

{% highlight text linenos %}
COUNTRY                           IATA  ICAO  NAME                                                                    LAT          LON    ALT
Afghanistan                       KBL   OAKB  Kabul International Airport                                       34.565842    69.212410   5871
Afghanistan                       MZR   OAMS  Mazar-I-Sharif International Airport                              36.706909    67.209671   1284
Albania                           TIA   LATI  Tirana International Airport                                      41.414742    19.720560    126
Algeria                           AAE   DABB  Annaba Rabah Bitat Airport                                        36.822220     7.809167     16
Algeria                           ALG   DAAG  Algiers Houari Boumediene Airport                                 36.691010     3.215408     82
Algeria                           BJA   DAAE  Bejaia Soummam Airport                                            36.711990     5.069922     20
Algeria                           CFK   DAOI  Chlef International Airport                                       36.212223     1.331667    469
Algeria                           CZL   DABC  Constantine Mohamed Boudiaf International Airport                 36.276020     6.620386   2316
Algeria                           GJL   DAAV  Jijel Ferhat Abbas Airport                                        36.795132     5.873608     36
Algeria                           ORN   DAOO  Oran Es Senia Airport                                             35.623852    -0.621180    299
         :
====< 以下省略 >====
         :
{% endhighlight %}

CSV 形式で出力した場合は "airports.csv" を確認してみる。

File: `data/airports.csv`

{% highlight text linenos %}
COUNTRY,IATA,ICAO,NAME,LAT,LON,ALT
"Afghanistan",KBL,OAKB,"Kabul International Airport",34.565842,69.212410,5871
"Afghanistan",MZR,OAMS,"Mazar-I-Sharif International Airport",36.706909,67.209671,1284
"Albania",TIA,LATI,"Tirana International Airport",41.414742,19.720560,126
"Algeria",AAE,DABB,"Annaba Rabah Bitat Airport",36.822220,7.809167,16
"Algeria",ALG,DAAG,"Algiers Houari Boumediene Airport",36.691010,3.215408,82
"Algeria",BJA,DAAE,"Bejaia Soummam Airport",36.711990,5.069922,20
"Algeria",CFK,DAOI,"Chlef International Airport",36.212223,1.331667,469
"Algeria",CZL,DABC,"Constantine Mohamed Boudiaf International Airport",36.276020,6.620386,2316
"Algeria",GJL,DAAV,"Jijel Ferhat Abbas Airport",36.795132,5.873608,36
"Algeria",ORN,DAOO,"Oran Es Senia Airport",35.623852,-0.621180,299
         :
====< 以下省略 >====
         :
{% endhighlight %}

### 4. 関係のある過去の記事

* [Ruby - NOAA（アメリカ海洋大気庁）気象観測所一覧！]({{site.baseurl}}/2014/03/27/ruby-noaa-weather-stations/ "Ruby - NOAA（アメリカ海洋大気庁）気象観測所一覧！")
* [Bash - NOAA 気象観測所検索！]({{site.baseurl}}/2014/03/28/bash-getting-a-weather-station-noaa/ "Bash - NOAA 気象観測所検索！")
* [Bash - METAR 気象情報取得！]({{site.baseurl}}/2014/03/30/bash-getting-a-metar/ "Bash - METAR 気象情報取得！")

### 5. その他

"[Flightradar24.com](http://www.flightradar24.com "Flightradar24.com - Live flight tracker!")" が提供するリアルタイムの航空機の飛行情報も、調査に調査を重ねて取得できるようになりました。（後日紹介）

ちなみに、Web 検索するとリアルタイム飛行情報を取得する方法についてある程度はヒットしますが、その９割くらいは情報が古いです。

---

全ての空港が網羅されていればうれしいのですが。。。

以上。

