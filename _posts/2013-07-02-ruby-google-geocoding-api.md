---
layout   : single
title    : "Ruby - Google Geocoding API で住所から緯度・経度、緯度・経度から住所を取得！"
published: true
date     : 2013-07-02 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Google
---

"Google Geocoding API" を使用して、住所から緯度・経度を取得したり、緯度・経度から住所を取得する方法についてです。  
よくある "Google Maps JavaScript API v3" についてではありません。

ちなみに、住所から緯度・経度を取得することを「ジオコーディング("Geocoding")」 と呼び、緯度・経度から住所を取得することを 「逆ジオコーディング("Inverse Geocoding")」と呼ぶようです。

この「ジオコーディングによる緯度・経度取得処理」と「逆ジオコーディングによる住所取得処理」を、１本の Ruby で実装してみました。  
（Google Geocoding API の仕組みを理解すれば、Ruby である必要がないことも分かるかと思います）

<!--more-->

#### 0. 前提条件

- Ruby 2.0.0-p195 での作業を想定。
- コマンドライン引数で住所または緯度・経度を指定し、引数が住所なら緯度・経度を取得、引数が緯度と経度なら住所を取得するようにする。
- コマンドライン引数の緯度・経度は「度」で指定する。  
  「度・分・秒」は、「度」＋「分」÷60＋「秒」÷60÷60で「度」に変換して指定する。
- データは JSON 形式か XML 形式で取得できるが、今回は JSON 形式で取得する。
- 取得できるデータは複数あるが、先頭データ（最優先データ）のみを表示する。
- 既定のブラウザを起動して Google マップで該当の場所を表示する。（**後述「3. 注意」参照**）

#### 1. Ruby スクリプト作成

以下のように Ruby スクリプトを作成してみた。

File: `google_geocode.rb`

{% highlight ruby linenos %}
#*********************************************
# 住所から緯度・経度を取得する、又は、
# 緯度・経度から住所を取得する。
# ( by Google Geocode API )
#*********************************************
#
require 'json'
require 'net/http'

BASE_URL = "http://maps.googleapis.com/maps/api/geocode/json"
OPEN_URL = "http://maps.google.co.jp/maps"
USAGE = <<"EOS"
[USAGE] - 住所から緯度・経度を取得する場合
            第１引数：住所
        - 緯度・経度から住所を取得する場合
            第１引数：緯度 ( -90 〜  90)
            第２引数：経度 (-180 〜 180)
EOS

class GoogleGeocode
  def initialize
    @addr = ""
    @lat  = 0
    @lng  = 0
  end

  # コマンドライン引数チェック
  def check_args
    begin
      ret = true

      # 引数の個数別にチェック
      case ARGV.size
      when 0
        ret = false
      when 1
        # 住所（半角数字と半角ピリオドだけなら、明らかに住所ではないのでエラー）
        if ARGV[0].to_s =~ /^([-+]?[\d\.]+)$/
          ret = false
        else
          @addr = ARGV[0].to_s
        end
      when 2
        # 緯度（半角数字と半角ピリオド以外、-90〜90以外はエラー）
        if ARGV[0].to_s =~ /^([-+]?[\d\.]+)$/
          @lat = $1.to_f
          ret = false if @lat > 90.0 || @lat < -90.0
        else
          ret = false
        end
        # 経度（半角数字と半角ピリオド以外、-180〜180以外はエラー）
        if ARGV[1].to_s =~ /^([-+]?[\d\.]+)$/
          @lng = $1.to_f
          ret = false if @lng > 180.0 || @lng < -180.0
        else
          ret = false
        end
      end

      return ret
    rescue => e
      msg = "[EXCEPTION][" + self.class.name + ".check_args] " + e.to_s
      STDERR.puts msg
      exit 1
    end
  end

  # 主処理
  def proc_main
    begin
      if @addr == ""
        # 緯度・経度から住所を取得
        url = "#{BASE_URL}?latlng=#{@lat},#{@lng}&sensor=false&language=ja"
        res = Net::HTTP.get_response(URI.parse(url))
        status = JSON.parse(res.body)
        if status['status'] == "OK"
          @addr = status['results'][0]['formatted_address']
          puts "緯度・経度 : #{@lat}, #{@lng}"
          puts "住      所 : #{@addr}"
        else
          puts "STATUS : #{status['status']}"
        end
      else
        # 住所から緯度・経度を取得
        url = "#{BASE_URL}?address=#{URI.encode(@addr)}&sensor=false&language=ja"
        res = Net::HTTP.get_response(URI.parse(url))
        status = JSON.parse(res.body)
        if status['status'] == "OK"
          @addr = status['results'][0]['formatted_address']
          @lat  = status['results'][0]['geometry']['location']['lat']
          @lng  = status['results'][0]['geometry']['location']['lng']
          puts "住      所 : #{@addr}"
          puts "緯度・経度 : #{@lat}, #{@lng}"
        else
          puts "STATUS : #{status['status']}"
        end
      end
    rescue => e
      msg = "[EXCEPTION][" + self.class.name + ".proc_main] " + e.to_s
      STDERR.puts msg
      exit 1
    end
  end

  # ブラウザ表示
  #   Linux   : xdg-open
  #   MacOS   : open
  #   Windows : start /B
  #   Cygwin  : cmd /C start /B
  def open_web
    begin
      # 緯度・経度をブラウザ表示
      system `xdg-open '#{OPEN_URL}?q=#{@addr}&ll=#{@lat},#{@lng}&z=16'`
    rescue => e
      msg = "[EXCEPTION][" + self.class.name + ".open_web] " + e.to_s
      STDERR.puts msg
      exit 1
    end
  end
end

# クラスインスタンス化
obj_main = GoogleGeocode.new

# 引数チェック
unless obj_main.check_args
  puts USAGE
  exit
end

# 主処理
obj_main.proc_main

# ブラウザ表示
obj_main.open_web
{% endhighlight %}

[Gist - Ruby script to get a address or latitude, longitude with Google Geocoding API.](https://gist.github.com/komasaru/5820771 "Gist - Ruby script to get a address or latitude, longitude with Google Geocoding API.")

※URL 指定部分のクエリストリングについて。

- `address=XXXX` で住所を指定。
- `latlng=999.9999,999.9999` で緯度・経度を指定。
- `sensor=false` は一般のブラウザである場合の設定。
  GPS センサー搭載のデバイスなら `sensor=true` とする。
- `language=ja` は結果を日本語で返す設定。

その他詳細は、[参考サイト](https://developers.google.com/maps/documentation/geocoding/?hl=ja "Google Geocoding API - Google Maps API ウェブ サービス — Google Developers")で確認可能。

#### 2. 実行

以下のように実行する。

File: `引数が不正な場合`

{% highlight bash linenos %}
$ ruby google_geocode.rb 35abc abc123
[USAGE] - 住所から緯度・経度を取得する場合
            第１引数：住所
        - 緯度・経度から住所を取得する場合
            第１引数：緯度 ( -90 〜  90)
            第２引数：経度 (-180 〜 180)
{% endhighlight %}

File: `データが取得できなかった場合`

{% highlight bash linenos %}
$ ruby google_geocode.rb 123ab
STATUS : ZERO_RESULTS
{% endhighlight %}

File: `住所から緯度・経度を取得する場合`

{% highlight bash linenos %}
$ ruby google_geocode.rb 松江市殿町１
住      所 : 日本, 島根県松江市殿町１
緯度・経度 : 35.472248, 133.0508302
{% endhighlight %}

上記の住所は島根県庁の住所。

File: `緯度・経度から住所を取得する場合`

{% highlight bash linenos %}
$ ruby google_geocode.rb 35.472222 133.050556
緯度・経度 : 35.472222, 133.050556
住      所 : 日本, 島根県松江市殿町１
{% endhighlight %}

上記の緯度・経度は国土地理院登録の島根県庁の緯度・経度で、「度」＋「分」÷60＋「秒」÷60÷60で「度」に変換。

#### 3. 注意

紹介したスクリプトでは、住所、緯度・経度取得後に既定のブラウザで該当の地点の地図を表示するようにしている。  
理由は、"Google Geocoding API" の「使用制限」内に記述されている。

以下、「[ポリシー - Google Maps Geocoding API - Google Developers](https://developers.google.com/maps/documentation/geocoding/policies?hl=ja "ポリシー - Google Maps Geocoding API - Google Developers")」より引用。
> **マップを表示する  
> Google Maps Geocoding API は、Google マップに結果を表示するときにのみ併用されます。Google マップを表示せずに Google Maps Geocoding API のデータを使用することは禁止されています。**

紹介したスクリプト内でブラウザを開く部分で `xdg-open` コマンドを使用しているが、これは Linux の場合である。  
Linux 以外の場合、環境にあったコマンドを使用すること。（一部の環境については、スクリプト内のコメントでも紹介している）

#### 参考サイト

上記では、基本的な使い方しか使用していないが、オプション設定や返却値やステータス等の詳細は、以下のサイトを参照。

- [スタートガイド - Google Maps Geocoding API - Google Developers](https://developers.google.com/maps/documentation/geocoding/start?hl=ja "スタートガイド - Google Maps Geocoding API - Google Developers")

---

今回は、「住所から緯度・経度を取得する処理」と「緯度・経度から住所を取得処理」を１本にまとめたり、コマンドライン引数を指定したりしています。  
しかし、当然、用途が限定的なら記法を絞って簡素化しても良いでしょう。

当方、今回の "Google Geocoding API" とは別に、 "Google Maps JavaScript API v3" を使った Web アプリも作ってみたいと思っています。（近いうちに）

以上。

