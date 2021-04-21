---
layout   : single
title    : "Octopress - WordPress から投稿データを移行！"
published: true
date     : 2012-12-20 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- WordPress
- jekyll
- Markdown
---

当方のブログを WordPress から Octopress に移行して間もないですが、WordPress に投稿してきた記事・画像を Octopress に移行した際の記録を残しておきます。

<!--more-->

### 0. 前提条件

- WordPress は 3.4.1 を使用。(特にバージョンの違いは問題にならないと思われる)
- Octopress は 2.0.0 を使用。(特にバージョンの違いは問題にならないと思われる)
- 書式変換には Ruby 1.9.3-p327 を使用。
- 画像データも移行する。
- コメントは移行しない。(Disqus への移行が煩雑？)

### 1. WordPress から投稿データエクスポート

WordPress 管理画面の「ツール」-「エクスポート」で、全ての「投稿」データのみを XML エクスポートする。  
ファイル名は `wordpress.xml` とした。

### 2. 画像データコピー

WordPress の `wp-content/uploads/` ディレクトリ配下にあるデータを丸ごと Octopress の `source/images/` 配下へコピーする。

### 3. 書式変換スクリプト作成

jekyll スタイル、Markdown 記法に変換する Ruby スクリプトを作成する

HTML はそのまま残しておいても大丈夫だが、可能な限り Markdown 記法に則るようにした。  
また、元々当方の WordPress のブログでは、パーマリンクを `http://www.mk-mode.com/wordpress/YYYY/MM/DDhhmmss` としていたので、作成するファイルは `YYYY-MM-DD-DDhhmmss` とした。  
（Octopress 的には、記事タイトルを指定するのがよいのでしょうが、Web サーバで旧 URL へのアクセスをリライトさせるので）

以下のスクリプト内の「個別変換」は、当方の環境(プラグインの関係)で個別に対応が必要な部分です。主変換の前に行なっておいたほうがよい変換のみ主変換前に、その他は主変換後に行なっています。（予め記事の内容をチェックし、必要と思われる箇所を正規表現等を使用して一括変換しています）  
個別変換部分は非掲載ですが、実際には Syntax Highlighter 部分の jekyll 変換やエスケープ文字の変換、等々の処理を行なっています。  
当然、完全には対応しきれません。非対応部分については次項参照。

File: `wp_xml2md.rb`

{% highlight ruby linenos %}
# -*- coding: utf-8 -*-
#=  WordPress XML -> Markdown 変換
# ：WordPress からエクスポートした投稿データの XMLファイルを
#   読み込み Markdown に変換し、記事別にファイル出力する。
#
# date          name            version
# 2012.12.02    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2012 mk-mode.com All Rights Reserved. 
#---------------------------------------------------------------------------------
#++
require 'date'
require 'fileutils'
require 'hpricot'
require 'nkf'
require 'yaml'

class WpXml2Md
  XML_FILE = "wordpress.xml"

  # [CLASS] 処理
  class Proc
    # INITIALIZER
    def initialize
      @xml_file = XML_FILE
    end

    # XML ファイル存在チェック
    def exist_xml
      begin
        if File.exist?(@xml_file)
          return true
        else
          puts "[ERROR] File \"#{@xml_file}\" is not found!"
          return false
        end
      rescue => e
        # エラーメッセージ
        str_msg = "[ERROR][" + self.class.name + ".exist_xml] " + e.to_s
        STDERR.puts str_msg
        exit 1
      end
    end

    # 変換 XML -> Markdown
    def convert
      begin
        # XML 取得
        xml = Hpricot::XML(File.read(@xml_file))

        # 全記事 LOOP
        post_cnt = 0
        (xml/:channel/:item).each do |item|
          # 記事タイトル
          # ( WordPress から変換したことが判別できるよう先頭に "*" を付加した )
          post_title = "* " + item.at('title').inner_text

          # Markdown ファイル名
          md_date = DateTime.parse(item.at('wp:post_date').inner_text)
          md_file = "%04d-%02d-%02d-%02d%02d%02d%02d.markdown" %
                    [md_date.year, md_date.month, md_date.day,
                     md_date.day, md_date.hour, md_date.minute, md_date.second]

          # 投稿日時
          post_date = md_date.strftime('%Y-%m-%d %H:%M')

          # 投稿タイプ
          post_type = item.at('wp:post_type').inner_text

          # 投稿ステータス
          status = item.at('wp:status').inner_text
          post_published = (status == "publish" ? true : false)

          # カテゴリ・タグ
          post_cat = []
          post_tag = []
          (item/:category).each do |cat|
            domain = cat["domain"];
            if domain == "category"
              post_cat << cat.inner_text
            elsif domain == "post_tag"
              post_tag << cat.inner_text
            end
          end

          # キーワード(HTML meta タグ用)
          # ( 取り敢えず、カテゴリとタグ全てを指定した )
          post_key = post_cat + post_tag

          # 記事本文 ( 最初の取得時に CL + LF -> LF )
          post_content = NKF.nkf("-Lu -w", item.at('content:encoded').inner_text)

          # 個別変換 ( 主変換前 )
          # <<<< 実際には、ここで主変換前にしておいたほうがよい個別変換を行う >>>>

          # 主変換
          post_content = convert_main(post_content)

          # 個別変換 ( 主変換後 )
          # <<<< 実際には、ここで必要な個別変換を行う >>>>

          # 注釈 ( WordPress から移行したデータである旨を記載 )
          post_note  = "※この記事は WordPress に投稿した記事を変換したものです。"
          post_note << "一部不自然な表示があるかも知れません。ご了承ください。"
          post_note << "また、記事タイトル先頭の * は WordPress から移行した記事である印です。"

          header = {
            'layout'     => post_type,
            'title'      => post_title,
            'published'  => post_published,
            'date'       => post_date,
            'comments'   => true,
            'categories' => post_cat,
            'tags'       => post_tag,
            'keywords'   => post_key
          }.to_yaml

          # ファイル出力
          # ( 当スクリプトと同じディレクトリに layout 値に合わせたディレてトリを作成し、
          #   その配下に各 Markdown ファイルを作成する。)
          FileUtils.mkdir_p "_#{post_type}s"
          #puts "#{post_cnt} : #{md_file}"
          File.open("_#{post_type}s/#{md_file}", "w") do |f|
            f.puts header
            f.puts "---"
            f.puts post_content
            f.puts ""
            f.puts "---"
            f.puts post_note
          end

          post_cnt += 1
        end

        puts "#{post_cnt} posts converted!"
      rescue => e
        # エラーメッセージ
        str_msg = "[ERROR][" + self.class.name + ".convert] " + e.to_s
        STDERR.puts str_msg
        exit 1
      end
    end

    # 主要な変換
    # ( HTML はそのままでも問題ないが、可能な限り Markdown 記法に則るように )
    def convert_main(post_content)
      begin
        # 変換規則
        matches = [
          [/[\t ]*<h1>(.*?)<\/h1>/, '# \1'],
          [/[\t ]*<h2>(.*?)<\/h2>/, '## \1'],
          [/[\t ]*<h3>(.*?)<\/h3>/, '### \1'],
          [/[\t ]*<h4>(.*?)<\/h4>/, '#### \1'],
          [/[\t ]*<\/?ol>/, ''],
          [/[\t ]*<\/?ul>/, ''],
          [/[\t ]*<li>/,   '- '],
          [/[\t ]*<\/li>/,    ''],
          [/<hr( \/)?>/,   '---'],
          [/<\/?code>/, '`'],
          [/<strong>(.*?)<\/strong>/, '**\1**'],
          [/http:\/\/www.mk-mode.com\/wordpress\/wp-content\/uploads\//, '/images/'],
          [/<a href=\"(.*?)\"(.*?)>(?!<(.*?)>)(.*?)<\/a>/, '[\4](\1 "\4")']
        ]
        matches.each {|m| post_content.gsub!(m[0], m[1])}

        return post_content
      rescue => e
        # エラーメッセージ
        str_msg = "[ERROR][" + self.class.name + ".convert_main] " + e.to_s
        STDERR.puts str_msg
        exit 1
      end
    end
  end

  ##############
  #### MAIN ####
  ##############

  # 処理クラスインスタンス化
  obj_proc = Proc.new

  # XML ファイル存在チェック
  exit unless obj_proc.exist_xml

  # 開始メッセージ出力
  puts "#### WordPress XML -> Markdown [ START ]"

  # 変換 XML -> Markdown
  obj_proc.convert

  # 終了メッセージ出力
  puts "#### WordPress XML -> Markdown [ E N D ]"
end
{% endhighlight %}

GitHub にもアップしている。( [komasaru/WpXml2Md](https://github.com/komasaru/WpXml2Md "komasaru/WpXml2Md") )

以下も参考にした。

- [https://github.com/mojombo/jekyll/blob/master/lib/jekyll/migrators/wordpressdotcom.rb](https://github.com/mojombo/jekyll/blob/master/lib/jekyll/migrators/wordpressdotcom.rb)
- [https://gist.github.com/374148#file_wp_xml_import.rb](https://gist.github.com/374148#file_wp_xml_import.rb)

### 4. 変換スクリプトについての注意

- `li` タグで入れ子になっている部分は非対応。(入れ子部分の `li` かどうかの判別が困難。`li` タグは変換しない方がよかったかも？)
- `table` タグを Markdown 記法に非対応。(元の HTML をそのまま使用する形)  
  【2013.01.01 追記】（Markdown 記法への変換も可能だが `align` 属性が W3C Validation(HTML5) で Invalid になってしまうので）
- 画像については、WordPress 側でサムネイルが実画像にリンクする形式にしていたので非対応。(元の HTML をそのまま使用する形)
- WordPress の記事に対して投稿されたコメントについては、Disqus に取り込むのが面倒なので非対応。(元々、そんなにコメントも無かったし)
- 記事内に埋め込んでいた、Amazon や楽天の広告は、当然そのまま。(元の HTML をそのまま使用する形)

### 5. 変換実行

用意した XML ファイル `wordpress.xml` を Ruby スクリプトと同じディレクトリに置いて実行する。  
`_posts` ディレクトリが作成され、そのディレクトリ内に記事分のファイルが作成されるので、それらを正規の場所(デフォルトなら `octopress/_posts`)に移動し、`rake generate` 後 `rake preview` で確認してみる 。  
問題なければ、 `rake deploy` で公開する。

``` text
$ ruby wp_xml2jekyll.rb

#### WordPress XML -> Markdown [ START ]

766 posts converted!

#### WordPress XML -> Markdown [ E N D ]

```

---

出来上がった Markdown ファイルを確認した結果、(実際にはかなり細かく変換したので)かなり見やすくなりました。

あとは、公開後に不自然さに気付いたらその都度修正しようと考えています。

以上。

