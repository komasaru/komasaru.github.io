---
layout   : single
title    : "Ruby - JPL 天文暦バイナリデータの読み込み！"
published: true
date     : 2016-04-26 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している月・惑星の暦の最新版 DE430 のバイナリ形式のデータを Ruby で読み込んでみました。

<!--more-->

### 0. 前提条件

* Ruby 2.3.0-p0 での作業を想定。
* 使用するバイナリ形式データは、テキスト形式データ "ascp1950.430", "ascp2050.430" を「[JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data "JPL 天文暦データのバイナリ化！ - mk-mode BLOG")」の方法でバイナリ化したもの。（ファイル名は "JPLEPH" に変更）
* あらかじめ用意されているバイナリデータを使用する場合は `KSIZE` 値が組み込まれていないので、別途テキスト形式のヘッダファイルを読み込む必要がある。
* バイナリ形式データの仕様については「[JPL 天文暦バイナリデータの仕様！]({{site.baseurl}}/2016/04/22/about-jpl-binary-data "JPL 天文暦バイナリデータの仕様！ - mk-mode BLOG")」を参照。

### 1. Ruby スクリプトの作成

（バイナリデータの読み込みには IO.binread メソッドを使用）

File: `jpl_read_de430.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= JPLEPH(JPL の DE430 バイナリデータ)読み込み
#  : データの読み込みテストのため、対象日時・天体番号は定数で設定している
#       1: 水星 (Mercury)
#       2: 金星 (Venus)
#       3: 地球 - 月の重心 (Earth-Moon barycenter)
#       4: 火星 (Mars)
#       5: 木星 (Jupiter)
#       6: 土星 (Saturn)
#       7: 天王星 (Uranus)
#       8: 海王星 (Neptune)
#       9: 冥王星 (Pluto)
#      10: 月（地心） (Moon (geocentric))
#      11: 太陽 (Sun)
#      12: 地球の章動（1980年IAUモデル） (Earth Nutations in longitude and obliquity (IAU 1980 model))
#      13: 月の秤動 (Lunar mantle libration)
#
# date          name            version
# 2016.03.11    mk-mode.com     1.00 新規作成
# 2018.06.06    mk-mode.com     1.01 CNAM（定数名）400超に対応
#
# Copyright(C) 2016-2018 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#++
class JplReadDe430
  FILE_BIN = "JPLEPH"
  KSIZE    = 2036
  RECL     = 4
  JD       = 2457459.5  # <= 対象日時（2457459.5 = 2016-03-12 00:00:00）
  ASTR     = 1          # <= 天体番号

  def initialize
    @pos = 0      # レコード位置
  end

  def exec
    begin
      # ヘッダ（1レコード目）取得
      get_ttl     # TTL（タイトル）
      get_cnam    # CNAM（定数名）
      get_ss      # SS（ユリウス日（開始、終了）、分割日数）
      get_ncon    # NCON（定数の数）
      get_au      # AU（天文単位）
      get_emrat   # EMRAT（地球と月の質量比）
      get_ipt     # IPT（オフセット、係数の数、サブ区間数）（水星〜月の章動）
      get_numde   # NUMDE（DEバージョン番号）取得
      get_ipt_13  # IPT（オフセット、係数の数、サブ区間数）（月の秤動）
      get_cnam_2  # CNAM（定数名）(>400)
      p @ttl
      p @cnams
      p @sss
      p @ncon
      p @au
      p @emrat
      p @numde
      p @ipts

      # ヘッダ（2レコード目）取得
      get_cval    # CVAL（定数値）
      p @cvals

      # レコードインデックス取得
      @idx = ((JD - @sss[0]) / @sss[2]).truncate
      p @idx

      # 係数取得（対象のインデックス分を取得）
      get_coeff   # COEFF（係数）
      p @jds
      p @coeffs
    rescue => e
      $stderr.puts "[#{e.class}] #{e.message}"
      e.backtrace.each { |tr| $stderr.puts "\t#{tr}"}
      exit 1
    end
  end

  private

  # TTL 取得
  # - 84 byte * 3
  # - ASCII文字列(スペースを詰める/後続するnull文字やスペースを削除)
  def get_ttl
    recl = 84

    begin
      @ttl = (0..2).map do |i|
        File.binread(FILE_BIN, recl, @pos + recl * i).unpack("A*")[0]
      end.join("\n")
      @pos += recl * 3
    rescue => e
      raise
    end
  end

  # CNAM 取得
  # - 6 byte * 400
  # - ASCII文字列(スペースを詰める/後続するnull文字やスペースを削除)
  def get_cnam
    recl = 6

    begin
      @cnams = (0..399).map do |i|
        File.binread(FILE_BIN, recl, @pos + recl * i).unpack("A*")[0]
      end
      @pos += recl * 400
    rescue => e
      raise
    end
  end

  # SS 取得
  # - 8 byte * 3
  # - 倍精度浮動小数点数(機種依存)
  def get_ss
    recl = 8

    begin
      @sss = (0..2).map do |i|
        File.binread(FILE_BIN, recl, @pos + recl * i).unpack("d*")[0]
      end
      @pos += recl * 3
    rescue => e
      raise
    end
  end

  # NCON
  # - 4 byte * 1
  # - unsigned int (符号なし整数, エンディアンと int のサイズに依存)
  def get_ncon
    recl = 4

    begin
      @ncon = File.binread(FILE_BIN, recl, @pos).unpack("I*")[0]
      @pos += recl
    rescue => e
      raise
    end
  end

  # AU 取得
  # - 8 byte * 1
  # - 倍精度浮動小数点数(機種依存)
  def get_au
    recl = 8

    begin
      @au = File.binread(FILE_BIN, recl, @pos).unpack("d*")[0]
      @pos += recl
    rescue => e
      raise
    end
  end

  # EMRAT 取得
  # - 8 byte * 1
  # - 倍精度浮動小数点数(機種依存)
  def get_emrat
    recl = 8

    begin
      @emrat = File.binread(FILE_BIN, recl, @pos).unpack("d*")[0]
      @pos += recl
    rescue => e
      raise
    end
  end

  # NUMDE
  # - 4 byte * 1
  # - unsigned int (符号なし整数, エンディアンと int のサイズに依存)
  def get_numde
    recl = 4

    begin
      @numde = File.binread(FILE_BIN, recl, @pos).unpack("I*")[0]
      @pos += recl
    rescue => e
      raise
    end
  end

  # IPT
  # - 4 byte * 12 * 3
  # - unsigned int (符号なし整数, エンディアンと int のサイズに依存)
  def get_ipt
    recl = 4

    begin
      @ipts = (0..11).map do |i|
        ary = (0..2).map { |j| File.binread(FILE_BIN, recl, @pos + recl * j).unpack("I*")[0] }
        @pos += recl * 3
        ary
      end
    rescue => e
      raise
    end
  end

  # IPT_13（月の秤動）
  # - 4 byte * 1 * 3
  # - unsigned int (符号なし整数, エンディアンと int のサイズに依存)
  def get_ipt_13
    recl = 4

    begin
      @ipts << (0..2).map do |i|
        File.binread(FILE_BIN, recl, @pos + recl * i).unpack("I*")[0]
      end
      @pos += recl * 3
    rescue => e
      raise
    end
  end

  # CNAM 取得
  # - 6 byte * 400
  # - ASCII文字列(スペースを詰める/後続するnull文字やスペースを削除)
  def get_cnam_2
    recl = 6

    begin
      @cnams += (0..(@ncon - 400 - 1)).map do |i|
        File.binread(FILE_BIN, recl, @pos + recl * i).unpack("A*")[0]
      end
      @pos += recl * (@ncon - 400)
    rescue => e
      raise
    end
  end

  # CVAL 取得
  # - 8 byte * @ncon
  # - 倍精度浮動小数点数(機種依存)
  def get_cval
    @pos = KSIZE * RECL
    recl = 8

    begin
      @cvals = (0..@ncon - 1).map do |i|
        File.binread(FILE_BIN, recl, @pos + recl * i).unpack("d*")[0]
      end
    rescue => e
      raise
    end
  end

  # CEFF 取得
  # - 8 byte * ?
  # - 倍精度浮動小数点数(機種依存)
  # - 地球・章動のみ要素数が 2 で、その他の要素数は 3
  # - @jds に当インデックスの開始・終了ユリウス日を格納
  # - @coeffs にその他の係数を格納
  def get_coeff
    @pos = KSIZE * RECL * (2 + @idx)
    recl = 8
    offset, cnt_coeff, cnt_sub = @ipts[ASTR - 1]
    n = ASTR == 12 ? 2 : 3

    begin
      ary = (0..(KSIZE / 2) - 1).map do |i|
        File.binread(FILE_BIN, recl, @pos + recl * i).unpack("d*")[0]
      end  # 該当インデックス分を全て取得
      @jds = ary[0, 2]
      ary = ary[offset - 1, cnt_coeff * n * cnt_sub]  # 該当惑星分のみ抽出
      @coeffs = ary.each_slice(cnt_coeff * n).map do |row|
        row.each_slice(cnt_coeff).to_a
      end
    rescue => e
      raise
    end
  end
end

JplReadDe430.new.exec
{% endhighlight %}

* [Gist - Ruby script to read a jpl binary data DE430.](https://gist.github.com/komasaru/3589363da28d766fcd3f "Gist - Ruby script to read a jpl binary data DE430.")

### 2. Ruby スクリプトの実行

バイナリ形式データ "JPLEPH" を Ruby スクリプトと同じディレクトリに配置して以下を実行する。

``` text
$ ./jpl_read_de430.rb
"JPL Planetary Ephemeris DE430/LE430\n
 Start Epoch: JED=  2287184.5 1549-DEC-21 00:00:00\n
 Final Epoch: JED=  2688976.5 2650-JAN-25 00:00:00"
["DENUM", "LENUM", "TDATEF", "TDATEB",

===< 中略 >===

[19870922.88638703, 3401048.340544464, -820016.1365685505,
 -21884.71452138689, 4458.980962630561, 113.7942416160033,
 -28.94032658038136, -0.7360655861367853, 0.2262947806520317,
 0.0053757421530248, -0.001954966141811797, -4.175805388132797e-05,
 1.792660121594814e-05, 3.35376232236008e-07]]]]
```

取得した値が出力される。（上記は視認性向上のため改行している）

必要であれば、出力を調整してご確認ください。

---

バイナリデータから目的の惑星・日付の係数が取得できるようになったので、チェビシェフの多項式を利用して座標(ICRS)を計算できることになります。

その後、赤道座標・黄道座標を計算できれば、こよみを正確に計算するために必要な太陽・月の黄経・黄緯等も算出できるはずです。（挑戦してみるつもりです）

以上。

