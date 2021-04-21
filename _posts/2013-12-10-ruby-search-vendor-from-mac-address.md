---
layout   : single
title    : "Ruby - MAC アドレスからベンダ名判別！"
published: true
date     : 2013-12-10 00:20:00 +0900
comments : true
categories:
- プログラミング
- PC_Tips
tags:
- Ruby
---

MAC アドレスは、言わずと知れたネットワーク機器が持っている固有の識別子のことです。

MAC アドレスからベンダ名を判別できるのも「言わずもがな」でしょう。

以下、それについての備忘録です。

<!--more-->

### 1. MAC アドレスとは？

ご存じない方のために。

- MAC アドレスは世界中に存在するネットワークカード（Ethernet カード）が持っている固有の識別子である。
- MAC アドレスは OSI 参照モデルの「データリンク層（第２層）」に相当する。
- MAC アドレスは、全部で 48 ビットのアドレスであり、 "08-00-27-C8-81-99" のように 8 ビット（オクテットと呼ぶ）ずつハイフンで区切って表現することが多い。
- MAC アドレスの前半の 24 ビット（第１・２・３オクテット）は OUI（organizationally unique identifier, ベンダ識別子）と呼ばれ、機器メーカーを表わす情報になっている。
- MAC アドレスの第４オクテットは機種を表す ID となっている。
- MAC アドレスの第５・６オクテットはシリアル ID となっている。
- 各 OUI（ベンダ識別子）では 24 ビット = 16,777,216 個の MAC アドレスしか使用できないことになるが、不足する場合は別の OUI を申請するようだ。
- ベンダによっては、MAC アドレスを人為的に設定できる機器もある。

### 2. ベンダ名判別

MAC アドレスの前半 24 ビットを調べれば、どのベンダの機器なのかは分かる。

その一覧は "[IEEE-SA - The IEEE Standards Association - Home](http://standards.ieee.org/index.html "IEEE-SA - The IEEE Standards Association - Home")" によって管理されている。  
"[IEEE-SA - Registration Authority OUI Public Listing](http://standards.ieee.org/develop/regauth/oui/public.html "IEEE-SA - Registration Authority OUI Public Listing")" ページ内でも検索が可能であるが、このページ内の "Download a copy" というリンクに一覧のテキストファイル（ファイル名： "oui.txt"）も置かれている。（ちなみに、この "oui.txt" は日々更新されているようだ。）

### 3. Ruby スクリプト作成

Ruby で "oui.txt" を読み込んで検索する簡単なスクリプトを作成してみた。（参考までに）  
最新の "oui.txt" でなくてもよいのなら、あらかじめ "oui.txt" をダウンロードしておいてそのテキストファイルを読み込むようにしてもよい。

File: `search_mac.rb`

{% highlight ruby linenos %}
require 'open-uri'

class SearchMac
  URL_OUI = "http://standards.ieee.org/develop/regauth/oui/oui.txt"

  def initialize
    @arg = ARGV[0]
  end

  def exec_main
    begin
      open(URL_OUI) do |f|
        f.each do |line|
          if /\s*(.*?)\s*\(hex\)\t*(.*?)\n/ =~ line
            puts "#{$1}: #{$2}" if @arg == $1
          end
        end
      end
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.exec_main] #{e}"
      exit 1
    end
  end
end

SearchMac.new.exec_main
{% endhighlight %}

- [Ruby scripts to search a vendor name from a MAC address.](https://gist.github.com/komasaru/7852894 "Ruby scripts to search a vendor name from a MAC address.")

### 4. Ruby スクリプト実行

作成した Ruby スクリプトを実行してみる。（引数に MAC アドレスの前半部分をハイフン付きで指定）

``` text
$ ruby search_mac.rb 08-00-27
08-00-27: CADMUS COMPUTER SYSTEMS
```

### 参考サイト

- [IEEE-SA - The IEEE Standards Association - Home](http://standards.ieee.org/index.html "IEEE-SA - The IEEE Standards Association - Home")

---

以上。

