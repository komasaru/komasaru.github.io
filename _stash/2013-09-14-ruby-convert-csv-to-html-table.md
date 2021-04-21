---
layout   : single
title    : "Ruby - CSV ファイルを HTML table タグに変換！"
published: true
date     : 2013-09-14 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- HTML
---

２年くらい前には、CSV データを HTML の table タグに変換する GUI アプリを Microsoft Visual Basic で作成したことを記事にしました。

- [* VisualBasic - CSVをTABLEタグに変換！]({{site.baseurl}}/2011/09/04/04002010/ "* VisualBasic - CSVをTABLEタグに変換！")

最近はプライベートで Windows 系 OS に触れることがないので、同様のツール（ただし、CUI ベース）を Ruby で作成しました。

単純に CSV ファイルを読み込んで、 HTML に変換しているだけですが、以下で作成した Ruby スクリプトを紹介します。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Ruby 2.0.0-p247 で作業・動作確認。
- CSV ファイルのヘッダ行と明細行の区別はしない。

#### 1. CSV ファイル作成

変換に使用する CSV ファイルを用意しておく。  
今回は以下のような CSV ファイル（ファイル名："test.csv"）を使用する。

File: `test.csv`

{% highlight text linenos %}
ヘッダ１,ヘッダ２,ヘッダ３,ヘッダ４
test1,a,1,あああああ
test2,bb,22,いいいい
test3,ccc,333,ううう
test4,dddd,4444,ええ
test5,eeeee,55555,お
test6,f,666666,かかかかか
test7,gg,7777777,きききき
test8,hhh,88888888,くくく
test9,iiii,999999999,けけ
test10,jjjjj,0000000000,こ
{% endhighlight %}

#### 2. Ruby スクリプト作成

例として、以下のように Ruby スクリプトを作成してみた。  
第１引数に CSV ファイル名を指定、第２引数に align(left: `l` or `L`, center: `c` or `C`, right: `r` or `R`)（省略可） を指定するようにしている。  
その他については、特に難しいことは行なっていないので、スクリプトを見れば理解できると思う。  
あと、csv ライブラリを使用しなくても、普通にテキストファイルとして読み込んで `split(",")` を使用すれば同様に実装可能。

File: `csv2table.rb`

{% highlight ruby linenos %}
#= CSV -> table 変換
# ：CSV ファイルを table タグに変換する
#   第１引数：変換対象の CSV ファイル名
#   第２引数：align を c,l,l,r,r,l のように指定（省略可、デフォルトは "l"）
#---------------------------------------------------------------------------------
#++
require 'csv'

# [CLASS] 引数
class Arg
  def initialize
    @aligns = Array.new
  end

  # 引数取得
  def get_args
    begin
      # CSV ファイル名取得
      @csv_file = ARGV[0]
      # CSV ファイル存在チェック
      unless File.exist?(@csv_file)
        puts "[ERROR] Can't found #{@csv_file}"
        exit
      end

      # align 情報取得
      return unless ARGV[1]
      ARGV[1].split(",").collect do |a|
        if ["l", "L"].include?(a[0])
          @aligns << "l"
        elsif ["c", "C"].include?(a[0])
          @aligns << "c"
        elsif ["r", "R"].include?(a[0])
          @aligns << "r"
        else
          @aligns << "l"
        end
      end
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.get_args] #{e}"
      exit 1
    end
  end

  # CSV ファイル名返却
  def get_csv_file
    return @csv_file
  end

  # align 情報返却
  def get_aligns
    return @aligns
  end
end

# [CLASS] CSV -> table 変換
class Csv2Table
  def initialize(csv_file, aligns)
    @csv_file = csv_file
    @aligns   = aligns
    @html_file = File.basename(csv_file, File.extname(csv_file)) + ".html"
  end

  # CSV -> table 変換
  def convert
    begin
      # CSV ファイル読み込み
      csv = CSV.open(@csv_file, "r")

      # HTML ファイル書き込み
      html = File.open(@html_file, "w")
      html.puts "<table>"
      csv.each do |row|
        html.puts "  <tr>"
        row.each_with_index do |col, i|
          align = @aligns[i]
          html.print "    <td"
          case align
          when "l"
            html.print " align=\"left\">"
          when "c"
            html.print " align=\"center\">"
          when "r"
            html.print " align=\"right\">"
          else
            html.print ">"
          end
          html.puts "#{col}</td>"
        end
        html.puts "  </tr>"
      end
      html.puts "</table>"
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.convert] #{e}"
      exit 1
    end
  end
end

begin
  # 引数取得
  obj_args = Arg.new
  obj_args.get_args
  csv_file = obj_args.get_csv_file
  aligns   = obj_args.get_aligns

  # CSV -> table 変換
  obj_main = Csv2Table.new(csv_file, aligns)
  obj_main.convert
rescue => e
  STDERR.puts "[EXCEPTION] #{e}"
  exit 1
end
{% endhighlight %}

- [Gist - Ruby script to convert a csv file to html table tags.](https://gist.github.com/komasaru/6338290 "Gist - Ruby script to convert a csv file to html table tags.")

#### 4. Ruby スクリプト実行

以下のようにして、作成した Ruby スクリプトを実行してみる。

``` bash 
$ ruby csv2table.rb test.csv r,c,r,l
```

#### 5. 結果確認

CSV ファイルと同じディレクトリに、以下のような内容の HTML ファイル（CSV ファイル名が "test.csv" なら "test.html" というファイル名の HTML ファイル）が作成される。

File: `test.html`

{% highlight html linenos %}
<table>
  <tr>
    <td align="right">ヘッダ１</td>
    <td align="center">ヘッダ２</td>
    <td align="right">ヘッダ３</td>
    <td align="left">ヘッダ４</td>
  </tr>
  <tr>
    <td align="right">test1</td>
    <td align="center">a</td>
    <td align="right">1</td>
    <td align="left">あああああ</td>
  </tr>
  <tr>
    <td align="right">test2</td>
    <td align="center">bb</td>
    <td align="right">22</td>
    <td align="left">いいいい</td>
  </tr>
  <tr>
    <td align="right">test3</td>
    <td align="center">ccc</td>
    <td align="right">333</td>
    <td align="left">ううう</td>
  </tr>
  <tr>
    <td align="right">test4</td>
    <td align="center">dddd</td>
    <td align="right">4444</td>
    <td align="left">ええ</td>
  </tr>
  <tr>
    <td align="right">test5</td>
    <td align="center">eeeee</td>
    <td align="right">55555</td>
    <td align="left">お</td>
  </tr>
  <tr>
    <td align="right">test6</td>
    <td align="center">f</td>
    <td align="right">666666</td>
    <td align="left">かかかかか</td>
  </tr>
  <tr>
    <td align="right">test7</td>
    <td align="center">gg</td>
    <td align="right">7777777</td>
    <td align="left">きききき</td>
  </tr>
  <tr>
    <td align="right">test8</td>
    <td align="center">hhh</td>
    <td align="right">88888888</td>
    <td align="left">くくく</td>
  </tr>
  <tr>
    <td align="right">test9</td>
    <td align="center">iiii</td>
    <td align="right">999999999</td>
    <td align="left">けけ</td>
  </tr>
  <tr>
    <td align="right">test10</td>
    <td align="center">jjjjj</td>
    <td align="right">0000000000</td>
    <td align="left">こ</td>
  </tr>
</table>
{% endhighlight %}

当然、ブラウザで確認すると左寄せ・中央揃え・右寄せで表示される。

![CSV2TABLE]({{site.baseurl}}/images/2013/09/14/CSV2TABLE.png "CSV2TABLE")

---

どうしても table タグを自分で手入力しないといけない場合には、ちょっとした table タグでも意外と面倒に感じることがありますが、これで大分手間が省けます。

以上。

