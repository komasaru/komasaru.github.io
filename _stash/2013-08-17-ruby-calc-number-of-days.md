---
layout   : single
title    : "Ruby - フリーゲルの公式で日数計算！"
published: true
date     : 2013-08-17 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- カレンダー
---

２年ぐらい前に、「フリーゲルの公式」を使って異なる２つの日付の「修正ユリウス日」を算出し２つの日付の日数差を求める方法について紹介しました。

- [* 日数計算の方法！](http://www.mk-mode.com/octopress/2011/09/22/22002000/ "* 日数計算の方法！")

今日は、その公式を使用して異なる２つの日付の日数差（第２日付の第１日付からの経過日数）を求める Ruby スクリプトを紹介します。（実際、単純に公式を当てはめて計算しているだけです）

<!--more-->

#### 0. 前提条件

- Ruby 2.0.0-p247 で作業・動作確認済。
- ユリウス日については「[* 日数計算の方法！](http://www.mk-mode.com/octopress/2011/09/22/22002000/ "* 日数計算の方法！")」でも説明している。
  * ユリウス日 ... 紀元前4713年01月01日正午からの経過日数
  * 修正ユリウス日 ... 西暦1858年11月17日午前0時からの経過日数（= ユリウス日 - 2400000.5 日した日数）
- 計算対象の日付は西暦の日付に限定する。
- 時・分・秒は考慮しない。

#### 1. Ruby スクリプト

以下のように Ruby スクリプトを作成した。

File: `calc_num_of_days.rb`

{% highlight ruby linenos %}
require 'date'

# 使用方法
USAGE = <<"EOS"
USAGE : ruby calc_num_of_days.rb DATE_FROM DATE_TO
        - The formart of DATE_FROM and DATE_TO is "YYYYMMDD".
EOS

# [CLASS] 引数
class Arg
  def initialize
    @date_f = ""
    @date_t = ""
  end

  def check
    begin
      # 引数の数が２個以外はエラー
      if ARGV.length == 2
        # 日付桁数チェック
        return false unless ARGV[0].to_s =~ /^\d{8}$/
        return false unless ARGV[1].to_s =~ /^\d{8}$/

        # 日付妥当性チェック ( FROM )
        y_f = ARGV[0].to_s[0,4].to_i
        m_f = ARGV[0].to_s[4,2].to_i
        d_f = ARGV[0].to_s[6,2].to_i
        if Date.valid_date?(y_f, m_f, d_f)
          @date_f = ARGV[0].to_s
        else
          return false
        end

        # 日付妥当性チェック ( TO )
        y_t = ARGV[1].to_s[0,4].to_i
        m_t = ARGV[1].to_s[4,2].to_i
        d_t = ARGV[1].to_s[6,2].to_i
        if Date.valid_date?(y_t, m_t, d_t)
          @date_t = ARGV[1].to_s
        else
          return false
        end
      else
        return false
      end

      return true
    rescue => e
      STDERR.puts "[EXCEPTION][#{self.class.name}.check] #{e}"
      exit! 1
    end
  end

  def get_date(n)
    return n == 1 ? @date_f : @date_t
  end
end

# [CLASS] 計算
class Calc
  def initialize(date_f, date_t)
    @date_f = date_f
    @date_t = date_t
  end

  def calc
    begin
      # 日付 ( FROM )
      y = @date_f[0,4].to_i
      m = @date_f[4,2].to_i
      d = @date_f[6,2].to_i
      jd_f  = calc_jd(0, y, m, d)
      jd2_f = calc_jd(1, y, m, d)
      puts "[ #{y}年#{sprintf("%02d", m)}月#{sprintf("%02d", d)}日 ]"
      puts "\t    ユリウス日 : #{sprintf("%9.1f", jd_f)} 日"
      puts "\t修正ユリウス日 : #{sprintf("%9.1f", jd2_f)} 日"

      # 日付 ( TO )
      y = @date_t[0,4].to_i
      m = @date_t[4,2].to_i
      d = @date_t[6,2].to_i
      jd_t  = calc_jd(0, y, m, d)
      jd2_t = calc_jd(1, y, m, d)
      puts "[ #{y}年#{sprintf("%02d", m)}月#{sprintf("%02d", d)}日 ]"
      puts "\t    ユリウス日 : #{sprintf("%9.1f", jd_t)} 日"
      puts "\t修正ユリウス日 : #{sprintf("%9.1f", jd2_t)} 日"

      # 日数
      puts "[[ 経過日数 ]]\n\t#{jd_t - jd_f} 日"
    rescue => e
      STDERR.puts "[EXCEPTION][#{self.class.name}.calc] #{e}"
      exit 1
    end
  end

private

  # ユリウス日計算
  #   kbn : 0 ( ユリウス日 )
  #         1 ( 修正ユリウス日 )
  def calc_jd(kbn, y, m, d)
    jd  = (365.25 * y).truncate
    jd += (y / 400).truncate
    jd -= (y / 100).truncate
    jd += (30.59 * (m - 2)).truncate
    jd += d
    if kbn == 0
      jd += 1721088.5
    else
      jd -= 678912
    end
  end
end

#### MAIN ####

if __FILE__ == $0
  # 引数チェック( エラーなら終了 )
  obj_arg = Arg.new
  unless obj_arg.check
    puts USAGE
    exit!
  end

  # 日付取得
  date_f = obj_arg.get_date(1)
  date_t = obj_arg.get_date(2)

  # 日数計算
  obj_calc = Calc.new(date_f, date_t)
  obj_calc.calc
end
{% endhighlight %}

- [Gist - Ruby script to calc the number of days.](https://gist.github.com/komasaru/6153584 "Gist - Ruby script to calc the number of days.")

#### 2. Ruby スクリプト実行

作成した Ruby スクリプトを実行してみる。

``` bash 
$ ruby calc_num_of_days.rb 20000101 20130817
[ 2000年01月01日 ]
            ユリウス日 : 2451544.5 日
        修正ユリウス日 :   51544.0 日
[ 2013年08月17日 ]
            ユリウス日 : 2456521.5 日
        修正ユリウス日 :   56521.0 日
[[ 経過日数 ]]
        4977.0 日
```

第２日付が第１日付から何日経過しているかの計算なので、2013/01/01 と 2013/01/02 の場合の計算結果は以下のように「１日」となる。  
2013/01/02 が 今年の何日目にあたるかを計算したければ、計算結果に 1 を加算するか、第１日付を 2012/12/31 にする。

``` bash 
$ ruby calc_num_of_days.rb 20130101 20130102
[ 2013年01月01日 ]
            ユリウス日 : 2456292.5 日
        修正ユリウス日 :   56292.0 日
[ 2013年01月02日 ]
            ユリウス日 : 2456293.5 日
        修正ユリウス日 :   56293.0 日
[[ 経過日数 ]]
        1.0 日
```

#### 参考サイト

当方の過去記事、過去に作成したカレンダー類スクリプト内のユリウス日計算ロジックを参照のこと。

- [* 日数計算の方法！](http://www.mk-mode.com/octopress/2011/09/22/22002000/ "* 日数計算の方法！")
- [GitHub - komasaru/Calendar](https://github.com/komasaru/Calendar "GitHub - komasaru/Calendar")

---

日数計算メソッド等を使用すれば日数の計算は簡単にできますが、今回は基本に戻って忠実に計算（実際にメソッド内部で行なっている日数計算アルゴリズムで計算）してみました。

ちなみに、表計算ソフト等での日数計算も、内部ではこのアルゴリズム（ユリウス日を使った考え方）を使用して計算しているはずです。

以上。

