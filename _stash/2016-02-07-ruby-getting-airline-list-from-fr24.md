---
layout   : single
title    : "Ruby - Flightradar24 から航空会社情報一覧取得！"
published: true
date     : 2016-02-07 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

航空機の運行状況をリアルタイムで確認できる Web サイト [Flightradar24.com](http://www.flightradar24.com "Flightradar24.com - Live flight tracker!") に登録されている航空会社情報の一覧を Ruby で取得してみました。（と言っても、 JSON データを取得しているだけですが）

空港情報一覧の取得については前回の記事をご参照ください。

* [Ruby - Flightradar24 から空港情報一覧取得！]({{site.baseurl}}/2016/02/06/ruby-getting-airport-list-from-fr24/ "Ruby - Flightradar24 から空港情報一覧取得！")

<!--more-->

### 0. 前提条件

* Ruby 2.2.4-p230 での作業を想定。
* 世界中の全航空会社を網羅している訳ではないかもしれない。（空港情報一覧と同様に）

### 1. Ruby スクリプトの作成

難しいことはしていないので、説明は省略する。  
ただ、悪質な Bot でないことを主張するため、連絡先を User Agent に設定している。（伏字は適宜置き換えること）

File: `fr24_airlines.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= Flightradar24 航空会社情報取得
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

class Fr24Airlines
  URL        = "http://www.flightradar24.com/_json/airlines.php"  # 接続先 URL
  TIMEOUT    = 10                                                 # OpenURI 接続時のタイムアウト
  USER_AGENT = "xxxxxxx Bot (by Ruby/#{RUBY_VERSION}, Administrator: xxxxxxxx@yyyyyyy.zzz)"
                                                                  # OpenURI 接続時の User-Agent, Mail Address
  FILE_PATH  = "./data/airlines"                                  # 保存ファイル

  def exec
    get_json       # JSON 取得
    #save_file      # ファイル保存
    save_file_csv  # ファイル保存（CSV 形式）
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
    @json = JSON.parse(str)["rows"].sort_by { |j| j["Name"] }
  rescue => e
    raise
  end

  # ファイル保存
  # * 最大文字数（name: 33）
  def save_file
    File.open("#{FILE_PATH}.txt", "w") do |f|
      str =  "NAME" + " " * 31 + "IATA  ICAO"
      f.puts str
      @json.each do |j|
        f.printf("%-33s  %2s    %3s\n", j["Name"], j["Code"], j["ICAO"])
      end
    end
  rescue => e
    raise
  end

  # ファイル保存（CSV 形式）
  # * 最大文字数（name: 33）
  # * Code が "" のこともあることに注意
  # * カンマが含まれる可能性のある Name のみ "" でくくっている
  def save_file_csv
    File.open("#{FILE_PATH}.csv", "w") do |f|
      f.puts "NAME,IATA,ICAO"
      @json.each do |j|
        f.puts "\"#{j["Name"]}\",#{j["Code"]},#{j["ICAO"]}"
      end
    end
  rescue => e
    raise
  end
end

Fr24Airlines.new.exec
{% endhighlight %}

* [Gist - Ruby script to get a airline list from Flightradar24.](https://gist.github.com/komasaru/940d11d07a3fd452ba10 "Gist - Ruby script to get a airline list from Flightradar24.")

### 2. Ruby スクリプトの実行

Ruby スクリプトと同じディレクトリ内に "data" ディレクトリを作成後、以下を実行。

``` text
$ ./fr24_airlines.rb
```

### 3. データの確認

"data" ディレクトリ内に "airlines.txt" が作成されるので確認してみる。

File: `data/airlines.txt`

{% highlight text linenos %}
NAME                               IATA  ICAO
1Time                              T6    RNX
9 Air                              AQ    JYH
ABSA Cargo                         M3    TUS
ABX Air                            GB    ABX
ACT Airlines                       9T    RUN
AIS Airlines                       IS    PNX
ALPI Eagles                        E8    ELG
ASL Airlines France                5O    FPO
ASL Airlines Ireland               AG    ABR
ASL Airlines Switzerland           FT    FAT
         :
====< 以下省略 >====
         :
{% endhighlight %}

CSV 形式で出力した場合は "airlines.csv" を確認してみる。

File: `data/airlines.csv`

{% highlight text linenos %}
NAME,IATA,ICAO
"1Time",T6,RNX
"9 Air",AQ,JYH
"ABSA Cargo",M3,TUS
"ABX Air",GB,ABX
"ACT Airlines",9T,RUN
"AIS Airlines",IS,PNX
"ALPI Eagles",E8,ELG
"ASL Airlines France",5O,FPO
"ASL Airlines Ireland",AG,ABR
"ASL Airlines Switzerland",FT,FAT
         :
====< 以下省略 >====
         :
{% endhighlight %}

### 4. 関係のある過去の記事

* [Ruby - NOAA（アメリカ海洋大気庁）気象観測所一覧！]({{site.baseurl}}/2014/03/27/ruby-noaa-weather-stations/ "Ruby - NOAA（アメリカ海洋大気庁）気象観測所一覧！")
* [Bash - NOAA 気象観測所検索！]({{site.baseurl}}/2014/03/28/bash-getting-a-weather-station-noaa/ "Bash - NOAA 気象観測所検索！")
* [Bash - METAR 気象情報取得！]({{site.baseurl}}/2014/03/30/bash-getting-a-metar/ "Bash - METAR 気象情報取得！")
* [Ruby - Flightradar24 から空港情報一覧取得！]({{site.baseurl}}/2016/01/28/ruby-getting-airport-list-from-fr24/ "Ruby - Flightradar24 から空港情報一覧取得！")

### 5. その他

"[Flightradar24.com](http://www.flightradar24.com "Flightradar24.com - Live flight tracker!")" が提供するリアルタイムの航空機の飛行情報も、調査に調査を重ねて取得できるようになりました。（後日紹介）

ちなみに、Web で期間を指定せずに検索するとリアルタイム飛行情報を取得する方法についてある程度はヒットしますが、その９割くらいは情報が古いです。

---

以上。

