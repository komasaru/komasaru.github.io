---
layout   : single
title    : "Ruby, Python - EOP（地球姿勢パラメータ）CSV 生成！"
published: true
date     : 2018-08-29 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Ruby
- Python
---

IERS（International Earth Rotation and Reference systems Service; 国際地球回転観測事業） の EOP（Earth Orientation Parameter; 地球姿勢（回転）パラメータ）から確定／速報／推定値を抽出し、 CSV データを生成するスクリプトを Ruby と Python で作成しました。（今後作成予定の別のツールの事前準備として）

<!--more-->

### 0. 前提条件

* Ruby 2.5.1-p57, Python 3.6.5 での動作を想定。
* ここでは EOP（Earth Orientation Parameter; 地球姿勢（回転）パラメータ）が何かについての説明はしない。

### 1. 事前準備

今回使用するデータを用意しておく。

* [こちら](ftp://ftp.iers.org/products/eop/rapid/) から "/standard/finals2000A.all", "/daily/finals2000A.daily" をダウンロードし、 "file" ディレクトリ配下に配置する。

### 2. Ruby スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* スクリプト内の `flag_pm`, `flag_dut`, `flag_nut` は極運動(Polar Motion)、DUT1(= UT1 - UTC)、章動(Nutation)の区分で、 `F` が「確定値」、`I` が「IERS 速報値」、`P` が「推定値」を意味する。

File: `get_eop_csv.rb`

{% highlight python linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= IERS の Buttelin A テキストデータから EOP(Polar Motion etc.) CSV ファイルを生成
#  * 予め [こちら](ftp://ftp.iers.org/products/eop/rapid/) からダウンロードして
#    おいたものを使用する。
#    (IAU 2000A 章動理論によるデータ finals2000A.all", "finals2000A.daily")
#  * 1日のデータに速報値(区分"I")と確定値がある場合は、確定値を優先。
#  * 2ファイルで重複する日付のデータは "finals2000A.daily" を優先。
#  * 取得する項目：
#      date, flag_pm, pm_x, pm_x_e, pm_y, pm_y_e,
#      flag_dut, dut1, dut1_e, lod, lod_e,
#      flag_nut, nut_x, nut_x_e, nut_y, nut_y_e
#
# date          name            version
# 2018.06.25    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2018 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : なし
#---------------------------------------------------------------------------------
#++
require "open-uri"

class GetEopCsv
  USAGE    = "[USAGE] ./get_eop_csv.rb"
  FILE_A   = "./file/finals2000A.all"
  FILE_D   = "./file/finals2000A.daily"
  FILE_CSV = "data/eop.csv"
  re_str  = '^(.{6}) (.{8}) ([IP ]) (.{9})(.{9}) (.{9})(.{9})  '
  re_str += '([IP ])(.{10})(.{10}) (.{7})(.{7})  '
  re_str += '([IP ]) (.{9})(.{9}) (.{9})(.{9})'
  re_str += '(.{10})(.{10})(.{11})(.{10})(.{10})\s*$'
  RE_0     = Regexp.new(re_str)
  RE_1     = Regexp.new('.{2}')
  RE_2     = Regexp.new('^\s+$')

  def initialize
    @data = Hash.new
  end

  def exec
    get_data("A")  # 過去全データ取得
    get_data("D")  # 日次データ取得
    write_csv  # CSV 保存
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}"}
    exit 1
  end

  private

  # ------------------------------------
  # データ取得
  #
  # @param: div ("A": ALLデータ, "D": DAILYデータ)
  # ------------------------------------
  def get_data(div)
    file = div == "A" ? FILE_A : FILE_D
    File.open(file, "r:utf-8") do |f|
      while line = f.gets
        line.chomp!
        m = line.scan(RE_0)[0]
        flag_pm, flag_dut, flag_nut = m[2], m[7], m[12]
        flag_pm.sub!(RE_2, "")
        flag_dut.sub!(RE_2, "")
        flag_nut.sub!(RE_2, "")
        break if div == "A" &&
                 flag_pm == "P" &&
                 flag_dut == "P" &&
                 flag_nut == "P"
        year, month, day = m[0].scan(RE_1).map(&:to_i)
        year = year > 72 ? year + 1900 : year + 2000
        date = "%04d-%02d-%02d" % [year, month, day]
        mjd = m[1].to_f
        # Polar Motion
        pm_x, pm_x_e, pm_y, pm_y_e = m[3, 4].map do |a|
          RE_2 =~ a ? nil : a.to_f
        end
        pm_x_f, pm_y_f = m[17, 2].map do |a|
          RE_2 =~ a ? nil : a.to_f
        end
        flag_pm = "F" if pm_x_f && pm_y_f
        pm_x, pm_x_e = pm_x_f, 0.0 if pm_x_f
        pm_y, pm_y_e = pm_y_f, 0.0 if pm_y_f
        # UT1 - UTC, LOD
        dut1, dut1_e, lod, lod_e = m[8, 4].map do |a|
          RE_2 =~ a ? nil : a.to_f
        end
        dut1_f = RE_2 =~ m[19] ? nil : m[19].to_f
        flag_dut, dut1, dut1_e = "F", dut1_f, 0.0 if dut1_f
        # Nutation
        nut_x, nut_x_e, nut_y, nut_y_e = m[13, 4].map do |a|
          RE_2 =~ a ? nil : a.to_f
        end
        nut_x_f, nut_y_f = m[20, 2].map do |a|
          RE_2 =~ a ? nil : a.to_f
        end
        flag_nut = "F" if nut_x_f && nut_y_f
        nut_x, nut_x_e = nut_x_f, 0.0 if nut_x_f
        nut_y, nut_y_e = nut_y_f, 0.0 if nut_y_f
        @data[mjd] = [
          date, flag_pm, pm_x, pm_x_e, pm_y, pm_y_e,
          flag_dut, dut1, dut1_e, lod, lod_e,
          flag_nut, nut_x, nut_x_e, nut_y, nut_y_e
        ]
      end
    end
  rescue => e
    raise
  end

  # ------------------------------------
  # CSV 保存
  # ------------------------------------
  def write_csv
    open(FILE_CSV, "w:utf-8") do |f|
      @data.each do |k, v|
        f.puts "#{v[0]},#{k}," + v[1..-1].map(&:to_s).join(",")
      end
    end
  rescue => e
    raise
  end
end

GetEopCsv.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to generate csv data from IERS's EOP.](https://gist.github.com/komasaru/44357dc853325cab04de7694b4b3b6e6 "Gist - Ruby script to generate csv data from IERS's EOP.")

### 3. Python スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* スクリプト内の `flag_pm`, `flag_dut`, `flag_nut` は極運動(Polar Motion)、DUT1(= UT1 - UTC)、章動(Nutation)の値の区分で、 `F` が「確定値」、`I` が「IERS 速報値」、`P` が「推定値」を意味する。

File: `get_eop_csv.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
IERS の Buttelin A テキストデータから EOP(Polar Motion etc.) CSV ファイルを生成
* 予め [こちら](ftp://ftp.iers.org/products/eop/rapid/) からダウンロードして
  おいたものを使用する。
  (IAU 2000A 章動理論によるデータ finals2000A.all", "finals2000A.daily")
* 1日のデータに速報値(区分"I")と確定値がある場合は、確定値を優先。
* 2ファイルで重複する日付のデータは "finals2000A.daily" を優先。
* 取得する項目：
      date, mjd, flag_pm, pm_x, pm_x_e, pm_y, pm_y_e,
      flag_dut, dut1, dut1_e, lod, lod_e,
      flag_nut, nut_x, nut_x_e, nut_y, nut_y_e

  date          name            version
  2018.06.25    mk-mode.com     1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
"""
import re
import requests
import sys
import traceback


class GetPolarMotionCsv:
    USAGE = "[USAGE] ./get_eop_csv.py"
    FILE_A = "./file/finals2000A.all"
    FILE_D = "./file/finals2000A.daily"
    FILE_CSV = "data/eop.csv"
    RE_0 = re.compile(
        r'^(.{6}) (.{8}) ([IP ]) (.{9})(.{9}) (.{9})(.{9})  '
        '([IP ])(.{10})(.{10}) (.{7})(.{7})  '
        '([IP ]) (.{9})(.{9}) (.{9})(.{9})'
        '(.{10})(.{10})(.{11})(.{10})(.{10})\s*$'
    )
    RE_1 = re.compile(r'^\s+$')

    def __init__(self):
        self.data = {}

    def exec(self):
        try:
            self.__get_data("A")  # 過去全データ取得
            self.__get_data("D")  # 日次データ取得
            self.__write_csv()    # CSV 保存
        except Exception as e:
            raise

    def __get_data(self, div):
        """ データ取得

        :param string div: "A": ALLデータ, "D": DAILYデータ
        """
        try:
            f_read = self.FILE_A if div == "A" else self.FILE_D
            with open(f_read) as f:
                for l in f.readlines():
                    m = re.findall(self.RE_0, l)[0]
                    flag_pm, flag_dut, flag_nut = m[2], m[7], m[12]
                    flag_pm  = re.sub(self.RE_1, "", flag_pm)
                    flag_dut = re.sub(self.RE_1, "", flag_dut)
                    flag_nut = re.sub(self.RE_1, "", flag_nut)
                    if div == "A" and \
                       flag_pm  == "P" and \
                       flag_dut == "P" and \
                       flag_nut == "P":
                        break
                    year  = int(m[0][0:2])
                    month = int(m[0][2:4])
                    day   = int(m[0][4:6])
                    year = year + 1900 if year > 72 else year + 2000
                    date = "{:04d}-{:02d}-{:02d}".format(year, month, day)
                    mjd = float(m[1])
                    # Polar Motion
                    pm_x, pm_x_e, pm_y, pm_y_e = map(
                        lambda x: None if re.match(self.RE_1, x) else float(x),
                        m[3:7]
                    )
                    pm_x_f, pm_y_f = map(
                        lambda x: None if re.match(self.RE_1, x)
                        else float(x), m[17:19]
                    )
                    if pm_x_f is not(None) and pm_y_f is not(None):
                        flag_pm = "F"
                    if pm_x_f is not(None):
                        pm_x, pm_x_e = pm_x_f, 0.0
                    if pm_y_f is not(None):
                        pm_y, pm_y_e = pm_y_f, 0.0
                    # UT1 - UTC, LOD
                    dut1, dut1_e, lod, lod_e = map(
                        lambda x: None if re.match(self.RE_1, x) else float(x),
                        m[8:12]
                    )
                    dut1_f = None if re.match(self.RE_1, m[19]) \
                             else float(m[19])
                    if dut1_f is not(None):
                        flag_dut, dut1, dut1_e = "F", dut1_f, 0.0
                    # Nutation
                    nut_x, nut_x_e, nut_y, nut_y_e = map(
                        lambda x: None if re.match(self.RE_1, x) else float(x),
                        m[13:17]
                    )
                    nut_x_f, nut_y_f = map(
                        lambda x: None if re.match(self.RE_1, x) else float(x),
                        m[20:22]
                    )
                    if nut_x_f is not(None) and nut_y_f is not(None):
                        flag_nut = "F"
                    if nut_x_f is not(None):
                        nut_x, nut_x_e = nut_x_f, 0.0
                    if nut_y_f is not(None):
                        nut_y, nut_y_e = nut_y_f, 0.0
                    self.data[mjd] = [
                        date, flag_pm, pm_x, pm_x_e, pm_y, pm_y_e,
                        flag_dut, dut1, dut1_e, lod, lod_e,
                        flag_nut, nut_x, nut_x_e, nut_y, nut_y_e
                    ]
        except Exception as e:
            raise

    def __write_csv(self):
        """ CSV 保存 """
        try:
            with open(self.FILE_CSV, "w") as f:
                for k, v in self.data.items():
                    l = "{},{},".format(v[0], k)
                    l += ",".join(map(
                        lambda x: "" if x is None else str(x), v[1:])
                    ) + "\n"
                    f.write(l)
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = GetPolarMotionCsv()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to generate csv data from IERS's EOP.](https://gist.github.com/komasaru/3ba077adb7cb24717edef81cd2cc0307 "Gist - Python script to generate csv data from IERS's EOP.")

### 4. スクリプトの実行

まず、実行権限を付与。（以下は Ruby の例。 Python 版は拡張子を `py` に）

``` text
$ chmod +x get_eop_csv.rb
```

また、作成された CSV データを保存するディレクトリ "data" を作成。

``` text
$ mkdir data
```

そして、実行。（以下は Ruby の例。 Python 版は拡張子を `py` に）

``` text
$ ./get_eop_csv.rb
```

### 5. 結果確認

"data" ディレクトリ内に "eop.csv" が作成されるので、内容を確認してみる。（Ruby 版も Python 版も同じ）

File: `data/eop.csv`

{% highlight text linenos %}
1973-01-02,41684.0,F,0.143,0.0,0.137,0.0,F,0.8075,0.0,0.0,0.1916,F,-18.637,0.0,-3.667,0.0
1973-01-03,41685.0,F,0.141,0.0,0.134,0.0,F,0.8044,0.0,3.5563,0.1916,F,-18.636,0.0,-3.571,0.0
1973-01-04,41686.0,F,0.139,0.0,0.131,0.0,F,0.8012,0.0,2.6599,0.1916,F,-18.669,0.0,-3.621,0.0
1973-01-05,41687.0,F,0.137,0.0,0.128,0.0,F,0.7981,0.0,3.0344,0.1916,F,-18.751,0.0,-3.769,0.0
1973-01-06,41688.0,F,0.136,0.0,0.126,0.0,F,0.7949,0.0,3.1276,0.1916,F,-18.868,0.0,-3.868,0.0
      :
===< 中略 >===
      :
2018-05-02,58240.0,I,0.069574,2.1e-05,0.438713,2.4e-05,I,0.1006235,4.0e-06,0.9641,0.0053,I,-0.114,0.083,-0.081,0.129
2018-05-03,58241.0,I,0.07046,2.0e-05,0.439352,2.3e-05,I,0.099735,4.6e-06,0.8149,0.0031,I,-0.103,0.083,-0.103,0.129
2018-05-04,58242.0,I,0.071459,2.0e-05,0.439812,2.2e-05,I,0.0989776,4.7e-06,0.7138,0.0034,I,-0.089,0.083,-0.122,0.129
2018-05-05,58243.0,I,0.072329,2.0e-05,0.44036,2.3e-05,I,0.0982831,4.9e-06,0.6855,0.0034,I,-0.073,0.083,-0.139,0.129
2018-05-06,58244.0,I,0.073263,1.6e-05,0.441099,2.2e-05,I,0.097605,4.9e-06,0.6619,0.0035,I,-0.058,0.083,-0.152,0.129
      :
===< 中略 >===
      :
2018-09-17,58378.0,P,0.192851,0.007663,0.340882,0.010159,P,0.0618138,0.0082248,,,,,,,
2018-09-18,58379.0,P,0.192317,0.007713,0.339635,0.010243,P,0.0615934,0.0083005,,,,,,,
2018-09-19,58380.0,P,0.191759,0.007763,0.338396,0.010327,P,0.0614009,0.0083759,,,,,,,
2018-09-20,58381.0,P,0.191177,0.007813,0.337164,0.01041,P,0.0611866,0.0084511,,,,,,,
2018-09-21,58382.0,P,0.190572,0.007862,0.335942,0.010494,P,0.0609036,0.0085261,,,,,,,
{% endhighlight %}

---

当方、人工衛星の正確な軌道計算に利用しています。

以上。

