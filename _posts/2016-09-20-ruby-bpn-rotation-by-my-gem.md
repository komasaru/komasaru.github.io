---
layout   : single
title    : "Ruby - バイアス・歳差・章動の適用（by 自作 gem ライブラリ）！"
published: true
date     : 2016-09-20 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
- RubyGems
---

赤道直交座標にバイアス・歳差・章動の回転を適用する RubyGems ライブラリを作成しました。

IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy) の提供するソースコード等を参考にして作成しています。

今回作成したライブラリの詳細については説明しません。使用例を紹介します。（ライブラリの詳細について知りたければ、ライブラリのソースコードをご確認ください）

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 自作した RubyGems ライブラリは "[eph_bpn](https://rubygems.org/gems/eph_bpn "eph_bpn - RubyGems.org")"
* 「バイアス(frame bias)」とは、「GCRS(Geocentric Celestial Reference System; 地球重心天文座標系)」と「J2000.0 の平均座標系」との間のズレ。
* 「J2000.0 の平均座標系」に「歳差」を適用すると「瞬時の平均座標系」になる。
* 「瞬時の平均座標系」に「章動」を適用すると「瞬時の真座標系」になる。
* 「歳差(precession)」や「章動(nutation)」の詳細については、「[歳差・章動と地球の向き - 国立天文台暦計算室](http://eco.mtk.nao.ac.jp/koyomi/topics/html/topics2009_1.html "歳差・章動と地球の向き - 国立天文台暦計算室")」を参照ください。  
* 作成した RubyGems ライブラリ eph_bpn について
  - インスタンス化時に引数として TDB（太陽系力学時）を与える。
  - インスタンスメソッド `apply_bias`, `apply_prec`, `apply_nut` に座標の配列を引数に指定して実行すると、バイアス・歳差・章動を適用した座標の配列を返す。
  - その他、インスタンスは TDB（太陽系力学時）, JD（ユリウス日）, JC（ユリウス世紀数）, EPS（平均黄道傾斜角（単位：rad）） の値も保有している。

### 1. Ruby スクリプトの作成例

File: `bpn_rotation.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= バイアス・歳差・章動適用
#
# date          name            version
# 2016.08.27    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#++
require 'eph_bpn'

class BpnRotation
  # ある日のある天体の GCRS 座標（単位: AU）
  COORD = [-1.0020195, 0.0660430, 0.0286337]

  def initialize
    @e = EphBpn.new("20160919")
  end

  def exec
    pos_b  = @e.apply_bias(COORD)       # Apply Bias
    pos_p  = @e.apply_prec(pos_b)       # Apply Precession
    pos_n  = @e.apply_nut(pos_p)        # Apply Nutation
    pos_bp = @e.apply_bias_prec(COORD)  # Apply Bias & Precession
    puts "TDB: #{@e.tdb}"
    puts " JD: #{@e.jd}"
    puts " JC: #{@e.jc}"
    puts "EPS: #{@e.eps}"
    puts "  元の GCRS 座標: #{COORD}"
    puts "  バイアス適用後: #{pos_b}"
    puts "      歳差適用後: #{pos_p}"
    puts "      章動適用後: #{pos_n}"
    puts "* 元の GCRS 座標にバイアス＆歳差同時適用後:"
    puts "                  #{pos_bp})"
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    msg << e.backtrace.each { |tr| "\t#{tr}"}.join("\n")
    $stderr.puts msg
    exit 1
  end
end

BpnRotation.new.exec if __FILE__ == $0
{% endhighlight %}

ちなみ、インスタンスメソッド `r_bias`, `r_prec`, `r_nut`, `r_bias_prec` で、各回転行列の配列を返す。

* [Gist - Ruby script to apply Bias-Precession-Nutation to a rectanglar coordinate.](https://gist.github.com/komasaru/86b9f3be5e8d567d52db523745c26027 "Gist - Ruby script to apply Bias-Precession-Nutation to a rectanglar coordinate.")

### 2. Ruby スクリプトの実行

``` text
$ ./bpn_rotation.rb
TDB: 2016-09-19 00:00:00 +0000
 JD: 2457650.5
 JC: 0.16715947980835044
EPS: 0.40905464354020177
  元の GCRS 座標: [-1.0020195, 0.066043, 0.0286337]
  バイアス適用後: [-1.0020194726238683, 0.06604337821036649, 0.028633785675093823]
      歳差適用後: [-1.0023045220465194, 0.06229735340794132, 0.027006107612986063]
      章動適用後: [-1.0023045218746547, 0.062297356280244305, 0.027006107365782624]
* 元の GCRS 座標にバイアス＆歳差同時適用後:
                  [-1.0023045501034873, 0.06229690510943075, 0.027006100432550285])
```

---

天体の各種計算をするのよく使用するのでライブラリ化した次第です。

ただ、間違いもあるかもしれません。間違いを発見した場合などには、都度修正していくつもりです。

以上。

