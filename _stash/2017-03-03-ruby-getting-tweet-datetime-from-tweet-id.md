---
layout   : single
title    : "Ruby - ツイートIDからタイムスタンプ等の取得！"
published: true
date     : 2017-03-03 00:20:00 +0900
comments : true
categories:
- プログラミング
- SNS
tags:
- Ruby
- Twitter
---

Twitter のツイートIDは [snowflake](https://github.com/twitter/snowflake/ "twitter/snowflake: Snowflake is a network service for generating unique ID numbers at high scale with some simple guarantees.") というツールを使って算出されています。

このツールのアルゴリズムを理解すれば、ツイートIDからツイートした日時が取得できます。

以下、そのアルゴリズムについての簡単な説明と、ツイート日時を算出する Ruby スクリプトの紹介です。

<!--more-->

### 0. 前提条件

* Ruby 2.3.3-p222 での作業を想定。
* ツイートIDだけでなく、アカウントID（ユーザが変更可能な英数字の screen_name ではなく、ユーザが変更不可能な数字のみの羅列）も同様に取得できる模様。（但し、最近の18桁(64bit)のIDのみ）

### 1. ツイートIDについて

[snowflake](https://github.com/twitter/snowflake/ "twitter/snowflake: Snowflake is a network service for generating unique ID numbers at high scale with some simple guarantees.") によると、ツイートIDは 63bit（long値 - 1bit)で表現されていて、以下のような構造になっている。

<table class="common">
  <tr>
    <th class="center">　Tweet ID　</th>
    <th class="center">　Machine ID　</th>
    <th class="center">　Sequence　</th>
  </tr>
  <tr>
    <td class="center">41 bit</td>
    <td class="center">10 bit</td>
    <td class="center">12 bit</td>
  </tr>
</table>

さらに、 timestamp の値は **1288834974657**（ミリ秒）減算した値となっている。

### 2. Ruby スクリプトの作成

以下のように Ruby スクリプトを作成してみた。

各項目の値を取得するためにマスク処理を行っているが、タイムスタンプのみであれば、右シフトを行うだけでよい。（スクリプト内のコメント参照）

File: `analyze_tweetid.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#=ツイートID解析
# : コマンドライン引数にツイートIDを渡して実行するとツイート日時等を算出する。
#
# date          name            version
# 2017.01.07    Masaru Koizumi  1.00 新規作成
#
# Copyright(C) 2017 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : ツイートID（半角数字）
#---------------------------------------------------------------------------------
#++
class AnalyzeTweetid
  TW_EPOCH = 1288834974657  # 単位：ミリ秒
  MASK_T = "111111111111111111111111111111111111111110000000000000000000000"
  MASK_M = "000000000000000000000000000000000000000001111111111000000000000"
  MASK_S = "000000000000000000000000000000000000000000000000000111111111111"

  def initialize(tweet_id)
    @tweet_id = tweet_id.to_i
  end

  def exec
    begin
      # 各値のバイナリ文字列
      timestamp_b  = (@tweet_id & MASK_T.to_i(2)).to_s(2)
      machine_id_b = (@tweet_id & MASK_M.to_i(2)).to_s(2)
      sequence_b   = (@tweet_id & MASK_S.to_i(2)).to_s(2)
      # 各値の抽出＆数値化
      timestamp  = ("%063d" % timestamp_b.to_i )[ 0,41].to_i(2)
      machine_id = ("%063d" % machine_id_b.to_i)[41,10].to_i(2)
      sequence   = ("%063d" % sequence_b.to_i  )[51,12].to_i(2)
      # timestamp の算出
      timestamp  = Time.at((timestamp + TW_EPOCH) / 1000.0)
      # 結果出力
      puts " TWEET-ID: #{@tweet_id}"
      puts "TIMESTAMP: #{timestamp.strftime("%Y-%m-%d %H:%M:%S.%L %Z")}"
      puts "          (MACHINE-ID: #{machine_id}, SEQUENCE: #{sequence})"

      # timestamp のみなら、マスク処理をしなくとも、以下で充分
      # timestamp = Time.at(((@tweet_id >> 22) + TW_EPOCH) / 1000.0)
      # puts " TWEET-ID: #{@tweet_id}"
      # puts "TIMESTAMP: #{timestamp.strftime("%Y-%m-%d %H:%M:%S.%L %Z")}"
    rescue => e
      $stderr.puts "[ERROR][#{self.class.name}.#{__method__}] #{e}"
      e.backtrace.each { |tr| $stderr.puts "\t#{tr}"}
      exit 1
    end
  end
end

if __FILE__ == $0
  exit 0 unless tweet_id = ARGV.shift
  AnalyzeTweetid.new(tweet_id).exec
end
{% endhighlight %}

* [Gist - Ruby script to get a timestamp from a tweet-id.](https://gist.github.com/komasaru/c1326aa96c1d3ff918532e585ad09be2 "Gist - Ruby script to get a timestamp from a tweet-id.")

### 3. Ruby スクリプトの実行

ツイートIDをコマンドライン引数に指定して実行する。

``` text
$ ./analyze_tweetid.rb 817350207100719104
 TWEET-ID: 817350207100719104
TIMESTAMP: 2017-01-06 21:40:49.661 JST
          (MACHINE-ID: 329, SEQUENCE: 0)
```

1000分の1秒単位で正確にツイート日時が取得できている。

### 参考サイト

* [twitter/snowflake: Snowflake is a network service for generating unique ID numbers at high scale with some simple guarantees.](https://github.com/twitter/snowflake/ "twitter/snowflake: Snowflake is a network service for generating unique ID numbers at high scale with some simple guarantees.")

※実際には、紹介されている Scala のコードを参考にしている。

---

単純にツイート日時を取得したいだけなら、 Twitter API を利用しなくてもよいので大変お手軽です。

以上。

