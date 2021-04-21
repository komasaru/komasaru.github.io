---
layout   : single
title    : "Ruby - Excel ファイル読み書き！"
published: true
date     : 2014-03-15 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Excel
---

プライベートで表計算ソフト Excel を使用することはなくなりました。（業務ではやむを得ず使用しますが）

しかし、重要なデータの提供が xsl ファイルのみのことがあるので、 処理（CSV データ生成や DB Insert スクリプト等の生成）を容易にするために Ruby で読みこむようにしている。  
VB や VBA が扱いにくいということはないのですが、 Ruby を使うようになってからは Ruby で処理を行う方が断然容易で扱いやすいのです。（個人的には）

以下は、基本的な使用例です。

<!--more-->

### 0. 前提条件

- Linux Mint 13(64bit) での作業を想定。
- Ruby 2.1.0-p0
- "Spreadsheet" という RubyGem パッケージを使用する。
  * Excel のワークブックは読み書きできる。
  * OpenOffice や LibreOffice のワークブックは読み書きできない。

### 1. Spreadsheet パッケージインストール

"Spreadsheet" という RubyGem パッケージがインストールされていなければインストールする。

``` text
$ gem install spreadsheet
```

### 2. Ruby スクリプト作成例（読み込み用）

File: `read_excel.rb`

{% highlight ruby linenos %}
require 'spreadsheet'

XLS = "./test.xls"

class ReadExcel
  # 読み込み
  def read
    begin
      # Excelファイルを読み込み
      wb = Spreadsheet.open(XLS, 'r')

      # シート名を指定してシートを取得
      # （インデックスで指定することも可能）
      ws = wb.worksheet("Test")
      #ws = @wb.worksheet(0)

      # 行の値を配列で取得
      row = ws.row(3)  # <= 4行目

      # 全ての行を配列で取得
      row = ws.rows

      # 行・列を指定して取得
      cell = ws[14, 4]  # <= 15行, 5列目
    rescue => e
      puts "[#{e.class}] #{e.message}"
      exit 1
    end
  end
end

ReadExcel.new.read
{% endhighlight %}

- [Gist - Ruby script to read a Excel workbook by 'spreadsheet'.](https://gist.github.com/komasaru/9444127 "Gist - Ruby script to read a Excel workbook by 'spreadsheet'.")

### 3. Ruby スクリプト作成例（書き込み用）

File: `write_excel.rb`

{% highlight ruby linenos %}
require 'spreadsheet'

XLS = "./test_2.xls"

class WriteExcel
  # 書き込み
  def write
    begin
      # ワークブック生成
      wb = Spreadsheet::Workbook.new

      # ワークシート生成
      ws = wb.create_worksheet(:name => 'TEST')

      # 行, 列を指定して書き込み
      ws[2, 3] = "Hello!"  # <= 3行,4列目

      # 配列でまとめて行を書き込む
      ws.row(4).replace ["5行-1列", "5行-2列", "5行-3列"]  # <= 5行目

      # 名前を付けてワークブック保存
      wb.write(XLS)
    rescue => e
      puts "[#{e.class}] #{e.message}"
      exit 1
    end
  end
end

WriteExcel.new.write
{% endhighlight %}

- [Gist - Ruby script to write a Excel workbook by 'spreadsheet'.](https://gist.github.com/komasaru/9444141 "Gist - Ruby script to write a Excel workbook by 'spreadsheet'.")

### 4. 参考サイト

- [spreadsheet ｜ RubyGems.org ｜ your community gem host](http://rubygems.org/gems/spreadsheet "spreadsheet ｜ RubyGems.org ｜ your community gem host")
- 使用例等のより詳細な情報は、パッケージのインストールされたディレクトリ内の（"README.md" ではなく）"GUIDE.md" を読むとよい。

---

以上。

