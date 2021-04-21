---
layout   : single
title    : "Ruby - TLE（2行軌道要素形式）の取得(NASA)！"
published: true
date     : 2018-08-11 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- 人工衛星
---

Ruby で NASA の Web ページから TLE（Two-line elements; 2行軌道要素形式）データを取得してみました。

<!--more-->

### 0. 前提条件

* Ruby 2.5.1-p57 での動作を想定。
* TLE を取得する Web ページは「[こちら](https://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html "Human Space Flight (HSF) - Realtime Data")」。
* TLE の説明は「[こちら](https://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/SSOP_Help/tle_def.html "Human Space Flight (HSF) - Realtime Data")」。

### 1. Ruby スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `tle_iss_nasa.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#=直近 TLE データ取得 (from NASA)
# : 過去の直近の TLE データ1件を取得する
#   （過去データが存在しなければ、未来の直近データ）
#
# date          name            version
# 2018.06.11    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2018 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : [YYYYMMDD[HHMMSS]]
#        （JST を指定。無指定なら現在時刻とみなす）
#---------------------------------------------------------------------------------
#++
require 'time'
require 'open-uri'
require 'timeout'

class TleIssNasa
  URL     = "https://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html"
  UA      = "XXXXXXX Bot (by Ruby/#{RUBY_VERSION}, Administrator: MAIL_ADDRESS)"
  TIMEOUT = 60

  def initialize
    if arg = ARGV.shift
      begin
        @jst = Time.strptime(arg.ljust(14, "0"), "%Y%m%d%H%M%S")
      rescue => e
        $stderr.puts "Invalid date!"
        $stderr.puts "[USAGE] ./tle_iss_nasa.rb [YYYYMMDD[HHMMSS]]"
        exit 1
      end
    else
      @jst = Time.now
    end
  end

  def exec
    tle = ""
    utc_tle = nil

    begin
      puts @jst.strftime("%Y-%m-%d %H:%M:%S.%6N %Z")
      puts @jst.utc.strftime("%Y-%m-%d %H:%M:%S.%6N %Z")
      puts "---"
      get_tle.reverse.each do |new|
        tle = new
        item_utc = tle.split(/\s+/)[3]
        y = 2000 + item_utc[0, 2].to_i
        d = item_utc[2..-1].to_f
        jst = Time.new(y, 1, 1) + d * 24 * 60 * 60 + 9 * 60 * 60
        utc_tle = jst.utc
        break if jst.utc <= @jst.utc
      end
      puts tle
      puts utc_tle.strftime("(%Y-%m-%d %H:%M:%S.%6N %Z)")
    rescue => e
      $stderr.puts "[#{e.class}] #{e.message}"
      e.backtrace.each { |tr| $stderr.puts "\t#{tr}" }
      exit 1
    end
  end

  private

  # 最新 TLE 一覧取得
  def get_tle
    html, charset, status, reason = get_html
    if status != "200" || reason != "OK"
      $stderr.puts "STATUS: #{status} (#{reason})"
      $stderr.puts "[ERROR] Could not retreive html."
      exit 1
    end
    return html.scan(/ISS\n +(1.+?)\n +(2.+?)\n/m).map { |a, b| "#{a}\n#{b}"}
  rescue => e
    raise
  end

  # HTML 取得
  def get_html
    status, reason = nil, nil
    charset = nil
    html    = nil

    begin
      Timeout.timeout(TIMEOUT) do
        html = open(URL, "r:utf-8", {"User-Agent" => UA}) do |f|
          charset = f.charset
          status, reason  = f.status
          f.read
        end
      end
      return [html, charset, status, reason]
    rescue => e
      raise
    end
  end
end

TleIssNasa.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to get TLE from NASA.](https://gist.github.com/komasaru/098062763d6b5dcf1eda4ac64d5184cc "Gist - Ruby script to get TLE from NASA.")

### 2. Ruby スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x tle_iss_nasa.rb
```

そして、コマンドライン引数に JST（日本標準時）を `YYYYMMDD[HHMMSS]` の書式で指定して実行する。（引数無指定なら、現在時刻を JST とみなす）

``` text
$ ./tle_iss_nasa.rb 20180616
2018-06-16 00:00:00.000000 JST
2018-06-15 15:00:00.000000 UTC
---
1 25544U 98067A   18166.52817284  .00016717  00000-0  10270-3 0  9006
2 25544  51.6411  26.9891 0002986 198.2153 161.8893 15.54156291 38252
(2018-06-16 12:40:34.133375 UTC)
```

---

これで、 ISS 軌道計算に必要な最新の TLE を取得することができます。

以上。

