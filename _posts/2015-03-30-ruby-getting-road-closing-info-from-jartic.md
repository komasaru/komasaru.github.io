---
layout   : single
title    : "Ruby - 日本道路交通情報センターから規制一覧を取得！"
published: true
date     : 2015-03-30 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- JSON
---
こんにちは。

Ruby で JARTIC（日本道路交通情報センター）の Web サイトから規制情報の一覧を取得する方法についての記録です。

<!--more-->

### 0. 前提条件

* Ruby 2.2.1-p85 での作業を想定。

### 1. 規制一覧データについて

* `http://www.jartic.or.jp/_json/M_**_301.json` へアクセスすることで JSON データを取得することができる。  
  `**` は２桁の都道府県コードか４桁の高速道路コード（`1***` が一般、`2***` が都市高速）。  
  （「JARTIC：日本道路交通情報センター」のサイトでマウスオーバーで表示される URL を見れば分かる）
* 取得できるデータは JSON 形式となっている。（後述のように、"uptime" に更新日時、 "item" に一覧データが格納されている）
* 路線名称・規制区間が同じでも「上り（or 西行、内回 etc）」と「下り（or 東行、外回 etc）」で別々の `item` になっている。
* 規制区間が「○○付近」の場合は、４項目目が "" となり５項目目に格納される。

File: `JSON`

{% highlight text linenos %} データの例（架空の情報）
{
  "updtime":"99月99日99時99分",
  "adjustimg":"false",
  "max-lines":20,
  "ic-max-lines":50,
  "telop":"  ●全国共通ダイヤル 050-XXXX-XXXX ◎全国・関東甲信越情報 050-XXXX-XXXX ※携帯短縮ダイヤル#XXXX 各都道府県の電話番号につきましては、問い合わせページをご覧ください。 ※電話番号をお確かめのうえ、おかけください。 ",
  "item":[
    ["国道９号","40090002","上り","松江市玉湯町布志名","松江市西嫁島３丁目","催事","通行止","502","1","","0","国道９号"],
    ["国道９号","40090005","下り","松江市西嫁島３丁目","松江市玉湯町布志名","催事","通行止","502","1","","0","国道９号"],
    ["大田桜江線","53204602","上り","","江津市桜江町谷住郷付近","土砂崩れ","通行止","109","1","４６号線","0","大田桜江線"],
    ["大田桜江線","53204605","下り","","江津市桜江町谷住郷付近","土砂崩れ","通行止","109","1","４６号線","0","大田桜江線"],
            :
    ===< 途中省略 >===
            :
  ],
  "name":"島根県",
  "banner-top":[
    {
      "img":"banner/carv0001.gif",
      "url":"https://kaitori.carview.co.jp/route.aspx?src=af_jartic999999_9999_assess999&dest=/service/assess/lp/999/"
    },
    {
      "img":"banner/jyar0001.gif",
      "url":"http://ck.jp.ap.valuecommerce.com/servlet/referral?sid=2240431&pid=999999999"
    },
    {
      "img":"banner/telephone_number.gif",
      "url":"http://www.jartic.or.jp/cgi/jumppage.cgi?rkp999999+1+http://www.jartic.or.jp/jartic_web/person/telephone.html"
    }
  ],
  "adjuststr":"false",
  "banner-side":[]
}
{% endhighlight %}

### 2. Ruby スクリプトの作成

参考までに、以下のような Ruby スクリプトを作成した。（道路コードを適宜変更すること）  
一応 Bot になるので、万が一取得元サイトに迷惑がかかった際の当方の連絡先も User-Agent で伝えるようにしている。

File: `jartic.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= 道路交通情報取得
#  : 日本道路交通情報センターサイトから規制一覧を取得する。
#
# Copyright(C) 2015 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#++
require 'json'
require 'open-uri'
require 'timeout'

class Jartic
  CD  = "32"                                    # 道路コード
  URL = "http://www.jartic.or.jp/_json/"        # 接続先のベース URL
  TO  = 10                                      # OpenURI 接続時のタイムアウト
  UA  = "mk-mode Bot (by Ruby/#{RUBY_VERSION}, Administrator: postmaster@mk-mode.com)"
                                                # OpenURI 接続時の User-Agent, Mail Address

  def initialize
    @url = "#{URL}M_#{CD}_301.json"
  end

  # 主処理
  def exec
    begin
      get_json    # JSON 取得
      merge_same  # 同一区間統合
      display     # 結果出力
    rescue => e
      $stderr.puts "[#{e.class}] #{e.message}"
      e.backtrace.each{|trace| $stderr.puts "\t#{trace}"}
      exit 1
    end
  end

private

  # JSON 取得
  def get_json
    json = nil
    timeout(TO) do
      json = open(@url, "r:utf-8", {"User-Agent" => UA}) do |f|
        f.read
      end
    end
    j = JSON.parse(json)
    # 以下の `uniq` は稀に同一内容の "item" が重複することがあるため
    @upd_time, @items, @name = j["updtime"], j["item"].uniq, j["name"]
  rescue => e
    raise
  end

  # 同一区間統合
  def merge_same
    @items_m = Array.new  # 統合後 item 用配列
    merged   = false      # 統合フラグ

    begin
      # 統合前 item ループ処理
      @items.each do |item|
        # 統合後 item をループ処理しているのは、統合前 item の並び順に特徴があるため。
        # （統合前 item を事前にソートするのもデータの特性上容易ではない）
        # また、無用な処理を省くため最終要素からループ
        (@items_m.size - 1).downto(0) do |i|
          # 路線名称(0)・号線(9)、規制区間(3,4)、原因(5)、規制内容(6)の同じ item があれば統合。
          if @items_m[i][0] == item[0] && @items_m[i][9] == item[9]
             @items_m[i][3,2].sort == item[3,2].sort &&
             @items_m[i][5] == item[5] && @items_m[i][6] == item[6]
            @items_m[i][2] << "・#{item[2]}"
            merged = true
            break
          end
        end
        merged ? merged = false : @items_m << item
      end
    rescue => e
      raise
    end
  end

  # 結果出力
  def display
    # タイトル
    puts "#### 道路規制一覧（#{@name}） [ #{@upd_time} 現在 ] ####"

    begin
      # ヘッダ
      if @items_m == []
        str =  "［規制情報はありません］"
      else
        str =  "[路線名称]" + "-" * 30 + " [方向]" + "-" * 4
        str << " [規制区間]" + "-" * 54 + " [原因]" + "-" * 6
        str << " [規制内容]" + "-" * 2
      end
      puts str

      # 明細
      @items_m.each do |item|
        str =  padding_sp("#{item[0]}　#{item[9]}", 20)
        str << " #{padding_sp(item[2],  5)}"
        if item[3] == ""
          str << " #{padding_sp(item[4], 15)}"
          str << " " * 34
        else
          str << " #{padding_sp(item[3], 15)}"
          str << (item[2] =~ /・/ ? "<->" : "-->")
          str << " #{padding_sp(item[4], 15)}"
        end
        str << " #{padding_sp(item[5], 6)}"
        str << " #{padding_sp(item[6], 6)}"
        puts str
      end
    rescue => e
      raise
    end
  end

  # スペースパディング（全角）
  def padding_sp(str, len_max)
    len = str.split(//).size
    return len_max < len ? str[0,len_max] : str[0,len] + "  " * (len_max - len)
  rescue => e
    raise
  end
end

Jartic.new.exec
{% endhighlight %}

* [Gist - Ruby script to get road closing informations from JARTIC.](https://gist.github.com/komasaru/dd33249738a3556f01cf "Gist - Ruby script to get road closing informations from JARTIC.")

### 3. Ruby スクリプトの実行

``` text
$ ./jartic.rb

#### 道路規制一覧（島根県） [ 03月16日00時35分 現在 ] ####

[路線名称]------------------------------ [方向]---- [規制区間]------------------------------------------------------ [原因]------ [規制内容]--
              :
              :
===< ここに一覧が表示される（次項「注意事項」の理由によりここでは表示しない） >===
              :
              :
```

### 4. 注意事項

「JARTIC：日本道路交通情報センター」サイトの情報の二次利用については「ご利用上の注意（サイトご利用規定）」をご確認ください。

要約すると以下のとおり。

* 著作権法上認められた引用の範囲を超える行為の禁止。
* リンクを張る際は届出が必要。（当方は届出を出していないので、当ブログ記事内でもリンクを張っていない）

著作憲法上「ネット上で引用する場合は引用元サイト名と引用元のリンクが必要」という認識なので、著作権法上認められた引用の範囲内であってもリンクを張る届出が必要になるのではないかということ。

よって、当方は引用ツイートによる情報提供は（すぐにでも可能な状況ではあるが）行なっていない。（同様のことを行なっている方もいらっしゃいますし）

---

リアルタイムで二次利用するには少し問題がありそうですが、プライベートで情報を管理する分には問題ないでしょう。

以上。

