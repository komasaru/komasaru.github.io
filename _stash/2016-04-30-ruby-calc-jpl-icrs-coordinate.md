---
layout   : single
title    : "Ruby - JPL 天文暦データから ICRS 座標を計算！"
published: true
date     : 2016-04-30 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

前回、NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している月・惑星の暦の最新版 DE430 のバイナリ形式のデータを Ruby で読み込みました。

* [Ruby - JPL 天文暦バイナリデータの読み込み！]({{site.baseurl}}/2016/04/26/ruby-read-jpl-bin-data "Ruby - JPL 天文暦バイナリデータの読み込み！ - mk-mode BLOG")

今回は、読み込んだデータから ICRS 座標を計算してみました。（読み込んだデータとは、 ICRS 座標の計算に必要なチェビシェフ多項式の係数データ）

<!--more-->

### 0. 前提条件、注意事項

* Ruby 2.3.0-p0 での作業を想定。
* 使用するバイナリ形式データは、テキスト形式データを「[JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data "JPL 天文暦データのバイナリ化！ - mk-mode BLOG")」の方法でバイナリ化したもの。（今回は DE430 用の "ascp1550.430" 〜 "ascp2550.430" 全てをバイナリ化。ファイル名は "JPLEPH" に変更）
* あらかじめ用意されているバイナリデータを使用する場合は `KSIZE` 値が組み込まれていないので、別途テキスト形式のヘッダファイルを読み込む必要がある。
* テキスト形式データの仕様については「[月・惑星の暦 JPL DE430 について！]({{site.baseurl}}/2016/04/14/about-jpl-de430 "月・惑星の暦 JPL DE430 について！ - mk-mode BLOG")」を参照。
* バイナリ形式データの仕様については「[JPL 天文暦バイナリデータの仕様！]({{site.baseurl}}/2016/04/22/about-jpl-binary-data "JPL 天文暦バイナリデータの仕様！ - mk-mode BLOG")」を参照。

### 1. Ruby スクリプトの作成

（バイナリデータ読み込みには `IO.binread` メソッドを使用）

File: `jpl_calc_de430`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= JPLEPH(JPL の DE430 バイナリデータ)読み込み、座標（位置・速度）を計算する
#
# date          name            version
# 2016.03.12    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 【引数】
#   [第１] 対象天体番号（必須）
#           1: 水星            (Mercury)
#           2: 金星            (Venus)
#           3: 地球            (Earth)
#           4: 火星            (Mars)
#           5: 木星            (Jupiter)
#           6: 土星            (Saturn)
#           7: 天王星          (Uranus)
#           8: 海王星          (Neptune)
#           9: 冥王星          (Pluto)
#          10: 月              (Moon)
#          11: 太陽            (Sun)
#          12: 太陽系重心      (Solar system Barycenter)
#          13: 地球 - 月の重心 (Earth-Moon Barycenter)
#          14: 地球の章動      (Earth Nutations)
#          15: 月の秤動        (Lunar mantle Librations)
#   [第２] 基準天体番号（必須。 0, 1 - 13）
#          （ 0 は、対象天体番号が 14, 15 のときのみ）
#   [第３] ユリウス日（省略可。省略時は現在日時のユリウス日）
#---------------------------------------------------------------------------------
# 【注意事項】
#   * 求める座標は「赤道直角座標(ICRS)」
#   * 天体番号は、係数データの番号（並び順）と若干異なるので注意する。
#     （特に、天体番号 3, 10, と 12 以降）
#     係数データの並び順：
#       水星(1)、金星(2)、地球 - 月の重心(3)、火星(4)、木星(5)、土星(6)、
#       天王星(7)、海王星(8)、冥王星(9)、月（地心）(10)、太陽(11)、
#       地球の章動(12)、月の秤動(13)
#   * 時刻系は「太陽系力学時(TDB)」である。（≒地球時(TT)）
#   * 天体番号が 1 〜 13 の場合は、 x, y, z の位置・速度（6要素）、
#     天体番号が 14 の場合は、黄経における章動 Δψ, 黄道傾斜における章動 Δε の
#     角位置・角速度（4要素）、
#     天体番号が 15 の場合は、 φ, θ, ψ の角位置・角速度（6要素）。
#   * 対象天体番号 = 基準天体番号 は、無意味なので処理しない。
#   * 天体番号が 12 の場合は、 x, y, z の位置・速度の値は全て 0.0 とする。
#   * その他、JPL 提供の FORTRAN プログラム "testeph.f" を参考にした。
#---------------------------------------------------------------------------------
#++
class JplCalcDe430
  USAGE = <<-"EOS"
【使用方法】 ./jpl_calc_de430.rb 対象天体番号 基準天体番号 [ユリウス日]
【天体番号】（対象天体番号: 1 - 15, 基準天体番号: 0 - 13）
   1: 水星,  2: 金星,  3: 地球,  4: 火星,  5: 木星,
   6: 土星,  7: 天王星,  8: 海王星,  9: 冥王星, 10: 月,
  11: 太陽,  12: 太陽系重心,  13: 地球 - 月の重心,
  14: 地球の章動,  15: 月の秤動,
   0: 対象天体番号 14, 15 の場合に指定
  ※対象天体番号≠基準天体番号
EOS
  FILE_BIN = "JPLEPH"
  KSIZE = 2036
  RECL  = 4
  ASTRS = [
    "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus",
    "Neptune", "Pluto", "Moon", "Sun", "Solar system Barycenter",
    "Earth-Moon barycenter", "Earth Nutations", "Lunar mantle Librations"
  ]
  KIND = 2      # 計算区分（0: 計算しない、1: 位置のみ計算、2: 位置・速度を計算）
                # （但し、現時点では 1 の場合の処理は実装していない）
  BARY = true   # 基準フラグ（true: 太陽系重心が基準 false: 太陽が基準）
  KM   = false  # 単位フラグ（true: km, km/sec, false: AU, AU/day）

  def initialize
    get_args                       # コマンドライン引数取得
    @pos      = 0                  # レコード位置
    @list     = Array.new(12, 0)   # 計算対象フラグ一覧配列
    @ipts     = Array.new          # 定数一覧配列
    @coeffs   = Array.new          # 係数一覧配列
    @idx_subs = Array.new(12)      # サブ区間のインデックス
    @tcs      = Array.new(12)      # サブ区間内の時間（チェビシェフ多項式用に正規化）
    @pvs      = Array.new(11).map { |a| Array.new(6, 0.0) }  # 位置・角度データ配列
    @pvs_2    = Array.new(13)      # 位置・角度データ配列（対象天体と基準天体の差算出用）
    @rrds     = Array.new(6, 0.0)  # 算出データ（対象天体と基準天体の差）配列
  end

  def exec
    begin
      # === ヘッダ情報取得
      get_ttl     # TTL（タイトル）
      get_cnam    # CNAM（定数名）
      get_ss      # SS（ユリウス日（開始、終了）、分割日数）
      check_jd    # 引数のユリウス日をチェック
      get_ncon    # NCON（定数の数）
      get_au      # AU（天文単位）
      get_emrat   # EMRAT（地球と月の質量比）
      get_ipt     # IPT（オフセット、係数の数、サブ区間数）（水星〜地球の章動）
      get_numde   # NUMDE（DEバージョン番号）取得
      get_ipt_13  # IPT（オフセット、係数の数、サブ区間数）（月の秤動）
      get_cval    # CVAL（定数値）
      get_jdepoc  # JDEPOC（元期）

      # === 各種計算
      get_list    # 計算対象フラグ一覧（係数データの並びに対応）取得
      get_coeff   # 係数取得（対象、基準天体のインデックス分を取得）
      #p @ttl
      #p @cnams
      #p @sss
      #p @ncon
      #p @au
      #p @emrat
      #p @ver_de
      #p @ipts
      #p @cvals
      #p @jdepoc
      #p @list
      #p @coeffs
      #exit

      # 補間（11:太陽）
      @pv_sun = interpolate(11)
      # 補間（1:水星〜10:月）
      0.upto(9) do |i|
        next if @list[i] == 0
        @pvs[i] = interpolate(i + 1)
        next if i > 8
        next if BARY
        @pvs[i] = @pvs[i].map.with_index do |pv, j|
          pv - @pv_sun[j]
        end
      end
      # 補間（14:地球の章動）
      if @list[10] > 0 && @ipts[11][1] > 0
        @p_nut = interpolate(14)
      end
      # 補間（15:月の秤動）
      if @list[11] > 0 && @ipts[12][1] > 0
        @pvs[10] = interpolate(15)
      end

      # 対象天体と基準天体の差
      case
      when @astrs[0] == 14
        @rrds = @p_nut + [0.0, 0.0] if @ipts[11][1] > 0
      when @astrs[0] == 15
        @rrds = @pvs[10] if @ipts[12][1] > 0
      else
        0.upto(9) { |i| @pvs_2[i] = @pvs[i] }
        @pvs_2[10] = @pv_sun           if @astrs.include?(11)
        @pvs_2[11] = Array.new(6, 0.0) if @astrs.include?(12)
        @pvs_2[12] = @pvs[2]           if @astrs.include?(13)
        if @astrs[0] * @astrs[1] == 30 || @astrs[0] + @astrs[1] == 13
          @pvs_2[2] = Array.new(6, 0.0)
        else
          @pvs_2[2] = @pvs[2].map.with_index do |pv, i|
            pv - @pvs[9][i] / (1.0 + @emrat)
          end unless @list[2] == 0
          @pvs_2[9] = @pvs_2[2].map.with_index do |pv, i|
            pv + @pvs[9][i]
          end unless @list[9] == 0
        end
        0.upto(5) do |i|
          @rrds[i] = @pvs_2[@astrs[0] - 1][i] - @pvs_2[@astrs[1] - 1][i]
        end
      end

      # === 結果出力
      display
    rescue => e
      $stderr.puts "[#{e.class}] #{e.message}"
      e.backtrace.each { |tr| $stderr.puts "\t#{tr}"}
      exit 1
    end
  end

  private

  #=========================================================================
  # コマンドライン引数取得
  #
  #   * 第１引数の値をインスタンス変数 @astrs[0] に設定する
  #   * 第２引数の値をインスタンス変数 @astrs[1] に設定する
  #   * 第３引数の値をインスタンス変数 @jd に設定する
  #     （但し、第３引数が存在しない場合は現在日時を設定する）
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
  def get_args
    # 対象、基準天体番号
    unless ARGV[0] && ARGV[1]
      puts USAGE
      exit 0
    end
    target = ARGV[0].to_i
    center = ARGV[1].to_i
    if (target < 1 || target > 15) ||
       (center < 0 || center > 13) ||
        target == center ||
       (target == 14 && center != 0) ||
       (target == 15 && center != 0) ||
       (target != 14 && target != 15 && center == 0)
      puts USAGE
      exit 0
    end
    @astrs = [target, center]

    # ユリウス日
    @jd = ARGV[2]
    @jd = @jd ? @jd.to_f : gc_to_jd({
      year:  Time.now.strftime("%Y").to_i,
      month: Time.now.strftime("%m").to_i,
      day:   Time.now.strftime("%d").to_i,
      hour:  Time.now.strftime("%H").to_i,
      min:   Time.now.strftime("%M").to_i,
      sec:   Time.now.strftime("%S").to_i
    })
  rescue => e
    raise
  end

  #=========================================================================
  # 年月日(グレゴリオ暦)からユリウス日(JD)を計算する
  #
  #   * フリーゲルの公式を使用する
  #     JD = int(365.25 * year)
  #        + int(year / 400)
  #        - int(year / 100)
  #        + int(30.59 (month - 2))
  #        + day
  #        + 1721088
  #   * 上記の int(x) は厳密には、 x を超えない最大の整数
  #   * 「ユリウス日」でなく「準ユリウス日」を求めるなら、
  #     `+ 1721088` を `- 678912` とする。
  #
  #   @params: hash = {
  #              year(int), month(int), day(int), hour(int), min(int), sec(int)
  #            }
  #   @return: jd (ユリウス日)
  #=========================================================================
  def gc_to_jd(hash)
    year  = hash[:year]
    month = hash[:month]
    day   = hash[:day]
    hour  = hash[:hour]
    min   = hash[:min]
    sec   = hash[:sec]

    begin
      # 1月,2月は前年の13月,14月とする
      if month < 3
        year  -= 1
        month += 12
      end

      # 日付(整数)部分計算
      jd  = (365.25 * year).floor
      jd += (year / 400.0).floor
      jd -= (year / 100.0).floor
      jd += (30.59 * (month - 2)).floor
      jd += day
      jd += 1721088

      # 時間(小数)部分計算
      t  = sec / 3600.0
      t += min / 60.0
      t += hour
      t /= 24.0

      return jd + t
    rescue => e
      raise
    end
  end

  #=========================================================================
  # 引数のユリウス日をチェック
  #
  #   * @jd の値をヘッダ情報のユリウス日（開始、終了）と比較・チェックする
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
  def check_jd
    if @jd < @sss[0] || @jd >= @sss[1]
      puts "Please input JD s.t. #{@sss[0]} <= JD < #{@sss[1]}."
      exit 0
    end
  rescue => e
    raise
  end

  #=========================================================================
  # TTL 取得
  #
  #   * タイトルをインスタンス変数 @ttl に設定する
  #   * 84 byte * 3
  #   * ASCII文字列(スペースを詰める/後続するnull文字やスペースを削除)
  #   * 取得したバイト数だけレコード位置 @pos を進める
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
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

  #=========================================================================
  # CNAM 取得
  #
  #   * 定数名をインスタンス変数（配列） @cnams に設定する
  #   * 6 byte * 400
  #   * ASCII文字列(スペースを詰める/後続するnull文字やスペースを削除)
  #   * 取得したバイト数だけレコード位置 @pos を進める
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
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

  #=========================================================================
  # SS 取得
  #
  #   * ユリウス日（開始、終了）、分割日数をインスタンス変数（配列） @sss に
  #     設定する
  #   * 8 byte * 3
  #   * 倍精度浮動小数点数(機種依存)
  #   * 取得したバイト数だけレコード位置 @pos を進める
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
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

  #=========================================================================
  # NCON 取得
  #
  #   * 定数の数をインスタンス変数 @ncon に設定する
  #   * 4 byte * 1
  #   * unsigned int (符号なし整数, エンディアンと int のサイズに依存)
  #   * 取得したバイト数だけレコード位置 @pos を進める
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
  def get_ncon
    recl = 4

    begin
      @ncon = File.binread(FILE_BIN, recl, @pos).unpack("I*")[0]
      @pos += recl
    rescue => e
      raise
    end
  end

  #=========================================================================
  # AU 取得
  #
  #   * AU（天文単位）の値をインスタンス変数 @au に設定する
  #   * 8 byte * 1
  #   * 倍精度浮動小数点数(機種依存)
  #   * 取得したバイト数だけレコード位置 @pos を進める
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
  def get_au
    recl = 8

    begin
      @au = File.binread(FILE_BIN, recl, @pos).unpack("d*")[0]
      @pos += recl
    rescue => e
      raise
    end
  end

  #=========================================================================
  # EMRAT 取得
  #
  #   * EMRAT（地球と月の質量比）の値をインスタンス変数 @emrat に設定する
  #   * 8 byte * 1
  #   * 倍精度浮動小数点数(機種依存)
  #   * 取得したバイト数だけレコード位置 @pos を進める
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
  def get_emrat
    recl = 8

    begin
      @emrat = File.binread(FILE_BIN, recl, @pos).unpack("d*")[0]
      @pos += recl
    rescue => e
      raise
    end
  end

  #=========================================================================
  # NUMDE 取得
  #
  #   * DEバージョン番号(NUMDE)をインスタンス変数 @ver_de に設定する
  #   * 4 byte * 1
  #   * unsigned int (符号なし整数, エンディアンと int のサイズに依存)
  #   * 取得したバイト数だけレコード位置 @pos を進める
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
  def get_numde
    recl = 4

    begin
      @ver_de = File.binread(FILE_BIN, recl, @pos).unpack("I*")[0]
      @pos += recl
    rescue => e
      raise
    end
  end

  #=========================================================================
  # IPT 取得
  #
  #   * IPT（オフセット、係数の数、サブ区間数）（水星〜地球の章動）の値をイ
  #     ンスタンス変数（配列） @ipts に設定する
  #   * 4 byte * 12 * 3
  #   * unsigned int (符号なし整数, エンディアンと int のサイズに依存)
  #   * 取得したバイト数だけレコード位置 @pos を進める
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
  def get_ipt
    recl = 4

    begin
      @ipts = (0..11).map do |i|
        ary = (0..2).map do |j|
          File.binread(FILE_BIN, recl, @pos + recl * j).unpack("I*")[0]
        end
        @pos += recl * 3
        ary
      end
    rescue => e
      raise
    end
  end

  #=========================================================================
  # IPT_13（月の秤動）
  #
  #   * IPT（オフセット、係数の数、サブ区間数）（月の秤動）の値をインスタン
  #     ス変数（配列） @ipts に設定する
  #   * 4 byte * 1 * 3
  #   * unsigned int (符号なし整数, エンディアンと int のサイズに依存)
  #   * 取得したバイト数だけレコード位置 @pos を進める
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
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

  #=========================================================================
  # CVAL 取得
  #
  #   * レコード位置 @pos を2レコード目の先頭へ進める
  #   * 定数の値をインスタンス変数（配列） @cvals に設定する
  #   * 8 byte * @ncon
  #   * 倍精度浮動小数点数(機種依存)
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
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

  #=========================================================================
  # JDEPOC 取得
  #
  #   * @cvals（定数値配列）の中から「元期」をインスタンス変数 @jdepoc に設
  #     定する
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
  def get_jdepoc
    @jdepoc = @cvals[4]
  rescue => e
    raise
  end

  #=========================================================================
  # 計算対象フラグ一覧取得
  #
  #   * チェビシェフ多項式による計算が必要な天体の一覧をインスタンス変数（配
  #     列） @list に設定する
  #   * 配列の並び順（係数データの並び順から「太陽」を除外した13個）
  #     @list = [
  #       水星, 金星, 地球 - 月の重心, 火星, 木星, 土星, 天王星, 海王星,
  #       冥王星, 月（地心）, 地球の章動, 月の秤動
  #     ]
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
  def get_list
    if @astrs[0] == 14
      @list[10] = KIND if @ipts[11][1] > 0
      return
    end
    if @astrs[0] == 15
      @list[11] = KIND if @ipts[12][1] > 0
      return
    end
    @astrs.each do |k|
      @list[k - 1] = KIND if k <= 10
      @list[2]     = KIND if k == 10
      @list[9]     = KIND if k ==  3
      @list[2]     = KIND if k == 13
    end
  rescue => e
    raise
  end

  #=========================================================================
  # COEFF 取得
  #
  #   * レコード位置 @pos を3レコード目の先頭へ進める
  #   * 対象区間のユリウス日（開始、終了）をインスタンス変数（配列） @jds に
  #     設定する
  #   * 係数の値をインスタンス変数（配列） @coeffs に設定する
  #     （x, y, z やサブ区間毎に分割して格納）
  #   * 8 byte * ?
  #   * 倍精度浮動小数点数(機種依存)
  #   * @coeffs に対象のインデックスの全ての係数を格納
  #   * 最初の2要素は当該データの開始・終了ユリウス日
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
  def get_coeff
    idx = ((@jd - @sss[0]) / @sss[2]).floor  # レコードインデックス
    @pos = KSIZE * RECL * (2 + idx)
    recl = 8

    begin
      items = (0..(KSIZE / 2) - 1).map do |i|
        File.binread(FILE_BIN, recl, @pos + recl * i).unpack("d*")[0]
      end
      @jds = [items.shift, items.shift]
      @ipts.each_with_index do |ipt, i|
        n = i == 11 ? 2 : 3  # 要素数
        ary_1 = Array.new
        ipt[2].times do |j|
          ary_0 = Array.new
          n.times do |k|
            ary_0 << items.shift(ipt[1])
          end
          ary_1 << ary_0
        end
        @coeffs << ary_1
      end
    rescue => e
      raise
    end
  end

  #=========================================================================
  # 補間
  #
  #   * 使用するチェビシェフ多項式の係数は、
  #   * 天体番号が 1 〜 13 の場合は、 x, y, z の位置・速度（6要素）、
  #     天体番号が 14 の場合は、 Δψ, Δε の角位置・角速度（4要素）、
  #     天体番号が 15 の場合は、 φ, θ, ψ の角位置・角速度（6要素）。
  #   * 天体番号が 12 の場合は、 x, y, z の位置・速度の値は全て 0.0 とする。
  #
  #   @params: astr（天体番号）
  #   @return: pvs = [
  #     x 位置, y 位置, z 位置,
  #     x 速度, y 速度, z 速度
  #   ]
  #     - 14（地球の章動）の場合は、
  #         pvs = [
  #           Δψ の角位置, Δε の角位置,
  #           Δψ の角速度, Δε の角速度
  #         ]
  #     - 15（月の秤動）の場合は、
  #         pvs = [
  #           φ の角位置, θ の角位置, ψ の角位置,
  #           φ の角速度, θ の角速度, ψ の角速度
  #         ]
  #=========================================================================
  def interpolate(astr)
    pvs = Array.new

    begin
      tc, idx_sub = norm_time(astr)
      n_item = astr == 14 ? 2 : 3  # 要素数
      i_ipt  = astr > 13 ? astr - 3 : astr - 1
      i_coef = astr > 13 ? astr - 3 : astr - 1

      # 位置
      ary_p = [1, tc]
      2.upto(@ipts[i_ipt][1] - 1) do |i|
        ary_p << 2 * tc * ary_p[-1] - ary_p[-2]
      end  # 各項
      0.upto(n_item - 1) do |i|
        val = 0
        0.upto(@ipts[i_ipt][1] - 1) do |j|
          val += @coeffs[i_coef][idx_sub][i][j] * ary_p[j]
        end
        val /= @au if !KM && astr < 14
        pvs << val
      end  # 値

      # 速度
      ary_v = [0, 1, 2 * 2 * tc]
      3.upto(@ipts[i_ipt][1] - 1) do |i|
        ary_v << 2 * tc * ary_v[-1] + 2 * ary_p[i - 1] - ary_v[-2]
      end  # 各項
      0.upto(n_item - 1) do |i|
        val = 0
        0.upto(@ipts[i_ipt][1] - 1) do |j|
          val += @coeffs[i_coef][idx_sub][i][j] * ary_v[j] * 2 * @ipts[i_ipt][2] / @sss[2].to_f
        end
        val /= KM ? 86400.0 : @au if astr < 14
        pvs << val
      end  # 値

      return pvs
    rescue => e
      raise
    end
  end

  #=========================================================================
  # チェビシェフ多項式用に時刻を正規化、サブ区間のインデックス算出
  #
  #   @params: astr（天体番号）
  #   @return: [チェビシェフ時間, サブ区間のインデックス]
  #=========================================================================
  def norm_time(astr)
    idx = astr > 13 ? astr - 2 : astr
    jd_start = @jds[0]
    tc = (@jd - jd_start) / @sss[2].to_f
    temp = tc * @ipts[idx - 1][2]
    idx = (temp - tc.floor).floor         # サブ区間のインデックス
    tc = (temp % 1.0 + tc.floor) * 2 - 1  # チェビシェフ時間
    return [tc, idx]
  rescue => e
    raise
  end

  #=========================================================================
  # 結果出力
  #
  #   @params: <none>
  #   @return: <none>
  #=========================================================================
  def display
    strs =  "  Target: %2d" % @astrs[0]
    strs << " (#{ASTRS[@astrs[0] - 1]})\n"
    strs << "  Center: %2d" % @astrs[1]
    strs << " (#{ASTRS[@astrs[1] - 1]})" unless @astrs[1] == 0
    strs << "\n"
    strs << "      JD: %16.8f day\n" % @jd
    strs << "     1AU: %11.1f km\n" % @au
    puts strs

    strs = ""
    case @astrs[0]
    when 14
      strs << "  Position(Δψ) = %32.20f rad\n"     % @rrds[0]
      strs << "  Position(Δε) = %32.20f rad\n"     % @rrds[1]
      strs << "  Velocity(Δψ) = %32.20f rad/day\n" % @rrds[2]
      strs << "  Velocity(Δε) = %32.20f rad/day\n" % @rrds[3]
    when 15
      strs << "  Position(φ) = %32.20f rad\n"     % @rrds[0]
      strs << "  Position(θ) = %32.20f rad\n"     % @rrds[1]
      strs << "  Position(ψ) = %32.20f rad\n"     % @rrds[2]
      strs << "  Velocity(φ) = %32.20f rad/day\n" % @rrds[3]
      strs << "  Velocity(θ) = %32.20f rad/day\n" % @rrds[4]
      strs << "  Velocity(ψ) = %32.20f rad/day\n" % @rrds[5]
    else
      unit_0, unit_1 = KM ? ["km", "sec"] : ["AU", "day"]
      strs << "  Position(x) = %32.20f #{unit_0}\n"           % @rrds[0]
      strs << "  Position(y) = %32.20f #{unit_0}\n"           % @rrds[1]
      strs << "  Position(z) = %32.20f #{unit_0}\n"           % @rrds[2]
      strs << "  Velocity(x) = %32.20f #{unit_0}/#{unit_1}\n" % @rrds[3]
      strs << "  Velocity(y) = %32.20f #{unit_0}/#{unit_1}\n" % @rrds[4]
      strs << "  Velocity(z) = %32.20f #{unit_0}/#{unit_1}\n" % @rrds[5]
    end
    puts strs
  rescue => e
    raise
  end
end

JplCalcDe430.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calc ICRS coordinates with JPL binary data DE430.](https://gist.github.com/komasaru/a80971ae71d38268bc75 "Gist - Ruby script to calc ICRS coordinates with JPL binary data DE430.")

（ソーススクリプトがより実用に耐えられるものに洗練されれば、Gist でなくリポジトリとしても登録するつもり）

### 2. Ruby スクリプトの実行

バイナリ形式データ "JPLEPH" を Ruby スクリプトと同じディレクトリに配置して以下のように実行する。（以下は、「2016年3月18日0時0分0秒」の「地球」を基準とした「太陽」の ICRS 座標を計算する例）

``` text
$ ./jpl_calc_de430.rb 11 3 2457465.5
  Target: 11 (Sun)
  Center:  3 (Earth)
      JD: 2457465.50000000 day
     1AU: 149597870.7 km
  Position(x) =         0.99443659220700997281 AU
  Position(y) =        -0.03816291768957833647 AU
  Position(z) =        -0.01655177670960058384 AU
  Velocity(x) =         0.00099333756561238804 AU/day
  Velocity(y) =         0.01582779844821733881 AU/day
  Velocity(z) =         0.00686186627679565356 AU/day
```

### 3. データの検証

"testpo.430" のデータと突き合わせながら Ruby スクリプトを実行して検証してみる。

実際には、"testpo.430" に記述されている任意の行に注目し、その行に記載の２つの天体の ICRS 座標を計算して差を求め、その値が `coordinates` の値と等しいかを確認する。（但し、"testpo.430" と天体番号が異なるものがあるため、適宜置き換えて考えること）

例えば、 "testpo.430" の `2016.12.01` の行は、以下のようになっている。（ヘッダと当該行のみ抜粋）

File: `tespo.430`

{% highlight text linenos %}
de#  -- date -- -- jed -- t# c# x# -- coordinate ---

430  2016.12.01 2457723.5  8  5  2       -8.02225801549924900000
{% endhighlight %}

ユリウス日 `2457723.5` の天体番号 5（木星）を基準とした天体番号 8（海王星）の ICRS 座標を計算すると次のようになる。

``` text
$ ./jpl_calc_de430.rb 8 5 2457723.5
  Target:  8 (Neptune)
  Center:  5 (Jupiter)
      JD: 2457723.50000000 day
     1AU: 149597870.7 km
  Position(x) =        33.70070119505614059108 AU
  Position(y) =        -8.02225801549925066070 AU
  Position(z) =        -4.10459769835983934172 AU
  Velocity(x) =        -0.00000061831278598047 AU/Day
  Velocity(y) =         0.00929863072586037051 AU/Day
  Velocity(z) =         0.00393151443263963212 AU/Day
```

"testpo.430" のインデックス番号（`x#` 列の値）が `2` であるので、`coordinate` 列の値と算出結果の 2 番目の値（Position(y) の値）を比較してみる。  
`-8.02225801549924900000` と `-8.02225801549925066070` であるので、かなりの精度で一致している。

他についても同様に確認してみる。（特殊なパターンもあるので要注意。JPL から提供されている "testeph.f" や上記のソーススクリプトを熟知していれば分かるはず）

"testpo.430" の仕様（ヘッダファイルやデータファイルと検証用ファイルでの天体番号の相違等）については「[月・惑星の暦 JPL DE430 について！]({{site.baseurl}}/2016/04/14/about-jpl-de430 "月・惑星の暦 JPL DE430 について！")」で説明しているので、そちらを参照のこと。

当方、 "testpo.430" の任意の行について検証してみた結果、かなりの精度差異がないことを確認済み。（小数点以下約13桁の精度。それ以下の誤差は（丸め）誤差の範囲内という認識）

また、地球を基準とした太陽の位置は DE430 データを使用している日本の国立天文台の計算結果とも一致しました。（「[太陽の赤道直角座標と黄経・黄緯](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/sun_rect.cgi "太陽の赤道直角座標と黄経・黄緯")」で計算）

---

バイナリデータから目的の惑星・日付の「ICRS 座標系（国際天文基準座標系、原点が太陽系重心の座標系）」の座標が計算できるようになったので、次は「赤道座標（地球の自転軸によって定まる座標）」への変換や「黄道座標（地球の公転軌道によって定まる座標）」の計算にも挑戦してみたいです。

以上。

