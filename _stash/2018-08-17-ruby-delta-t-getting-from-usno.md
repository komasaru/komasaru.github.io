---
layout   : single
title    : "Ruby - 地球自転速度補正値 ΔT の取得（USNO から）！"
published: true
date     : 2018-08-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Ruby
---

以前、地球自転速度補正値 ΔT の計算を Ruby で実装しました。

* [Ruby - 地球自転速度補正値 ΔT の計算！]({{site.baseurl}}/2016/07/29/ruby-delta-t-calculation "Ruby - 地球自転速度補正値 ΔT の計算！")

今回は、計算して取得するのではなく、 USNO（The United States Naval Observatory; アメリカ海軍天文台）による確定値と推定値を取得する処理を Ruby で実装してみました。

<!--more-->

### 0. 前提条件

* Ruby 2.5.1-p57 での動作を想定。
* ΔT 一覧を取得するページは「[こちら](http://www.usno.navy.mil/USNO/earth-orientation/eo-products/long-term "Long-term Delta T - Naval Oceanography Portal")」。

### 1. Ruby スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* User Agent `UA` の PG(Bot) 名やメールアドレスは自分のもので置き換えること。

File: `get_delta_t_usno.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= USNO（アメリカ海軍天文台） から delta T(ΔT) を取得
#  : 確定データは
#    [Delta T determinations](http://maia.usno.navy.mil/ser7/deltat.data)
#    から、推定データは
#    [Delta T predictions](http://maia.usno.navy.mil/ser7/deltat.preds)
#    から取得する。
#
# date          name            version
# 2018.06.20    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2018 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : UTC (YYYYMMDD 形式)
#        * 無指定ならシステム日時を UTC とみなす
#---------------------------------------------------------------------------------
#++
require "open-uri"

class GetDeltaTUsno
  USAGE = "[USAGE] ./get_delta_t_usno.rb [YYYYMMDD]"
  URL_D = "http://maia.usno.navy.mil/ser7/deltat.data"
  URL_P = "http://maia.usno.navy.mil/ser7/deltat.preds"
  UA    = "<BOT_NAME> (by Ruby/#{RUBY_VERSION}, Administrator: <MAIL_ADDRESS>)"

  def initialize
    ymd = ARGV.shift
    ymd ||= Time.now.strftime("%Y%m%d")
    if ymd !~ /^\d{8}$/
      puts USAGE
      exit 0
    end
    @date = "#{ymd[0, 4]}-#{ymd[4, 2]}-#{ymd[6, 2]}"
    @delta_t = 0  # delta T 初期値
    @dp = ""      # 確定／推定値区分（推定値なら "*"）
  end

  def exec
    get_determination  # 確定データ取得
    get_prediction     # 推定データ取得
    get_delta_t        # delta_T 取得
    display            # 結果出力
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}"}
    exit 1
  end

  private

  # ------------------------------------
  # 確定データ取得
  # ------------------------------------
  def get_determination
    html = open(URL_D, "r:utf-8", {"User-Agent" => UA}) { |f| f.read }
    @data = html.split(/[\r\n]+/).map do |line|
      items = line.sub(/^\s+/, "").split(/\s+/)
      date = "%04d-%02d-%02d" % [*items[0, 3]]
      @date_max = date
      [date, items[-1].to_f, "D"]
    end
  rescue => e
    raise
  end

  # ------------------------------------
  # 推定データ取得
  # ------------------------------------
  def get_prediction
    html = open(URL_P, "r:utf-8", {"User-Agent" => UA}) { |f| f.read }
    html.split(/[\r\n]+/).each do |line|
      items = line.sub(/^\s+/, "").split(/\s+/)
      next if /[\d\.]+/ !~items[0]
      year, year_frac = items[0].split(/\./)
      year = year.to_i
      case year_frac
      when "00"; month = 1
      when "25"; month = 4
      when "50"; month = 7
      when "75"; month = 10
      end
      date = "%04d-%02d-01" % [year, month]
      next if date <= @date_max
      @data << [date, items[1].to_f, "P"]
    end
  rescue => e
    raise
  end

  # ------------------------------------
  # delta T 取得
  # ------------------------------------
  def get_delta_t
    @data.reverse.each_with_index do |d, i|
      if d[0] <= @date
        break if i == 0
        @delta_t = d[1]
        @dp = "*" if d[2] == "P"
        break
      end
    end
  rescue => e
    raise
  end

  # ------------------------------------
  # 結果出力
  # ------------------------------------
  def display
    puts "[#{@date}] delta_T = #{@delta_t} selc. #{@dp}"
  rescue => e
    raise
  end
end

GetDeltaTUsno.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to get delta_T from USNO.](https://gist.github.com/komasaru/1de8881f2592bd5f5ffdc97a4ea3eb06 "Gist - Ruby script to get delta_T from USNO.")

### 2. Ruby スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x get_delta_t_usno.rb
```

そして、コマンドライン引数に UTC（協定世界時）を `YYYYMMDD` の書式で指定して実行する。（引数無指定なら、システム日付を UTC とみなす）

``` text
$ ./get_delta_t_usno.rb 20180620
[2018-06-20] delta_T = 69.14 sec. *
```

* 推定値の場合は行末に `*` が付与される。

---

人工衛星の正確な軌道計算等に利用できるでしょう。

ちなみに、今回の方法を応用して、 IERS（国際地球回転観測事業; International Earth Rotation and Reference systems Service）提供の Polar Motion（地球の極運動）のデータも取得できます。

以上。

