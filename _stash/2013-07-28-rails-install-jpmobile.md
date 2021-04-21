---
layout   : single
title    : "Rails - jpmobile で携帯・スマホ対応！"
published: true
date     : 2013-07-28 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Rails
---

現在、当方の Ruby on Rails 製[ホームページ](http://www.mk-mode.com/rails/ "mk-mode SITE")は PC 用となっています。  
携帯電話やスマートフォン等の携帯端末では、画面表示が崩れてしまいます。

そこで、当方の[ホームページ](http://www.mk-mode.com/rails/ "mk-mode SITE")を携帯・スマホにも対応すべく、 "jpmoblie" という RubyGem をインストールしてみました。  
"jpmobile" とは、アクセスが携帯からなのか、スマホからなのかを判別して、レイアウトビューを振り分ける機能もある RubyGem パッケージです。  
（他にも、携帯端末用の様々な機能があります）

以下、導入記録です。

<!--more-->

#### 0. 前提条件

- 使用する Rails は 4.0.0 を想定。
- 作業する OS は Linux Mint 14 を、ユーザは一般ユーザを想定。
- jbmobile は gem でインストーする。（プラグインとしての導入はしない）

#### 1. Gemfile 編集

`RAILS_ROOT` にある Gemfile に以下のように記述を追加する。

File: `Gemfile`

{% highlight ruby linenos %}
# Rails 4.0.x
gem 'jpmobile', '~> 4.0.0'
{% endhighlight %}

Rails のバージョンにより異なるので注意。  
ちなみに、こちら（[Version : Jpmobile vs Rails · jpmobile/jpmobile Wiki](https://github.com/jpmobile/jpmobile/wiki/Version-:-Jpmobile-vs-Rails "Version : Jpmobile vs Rails · jpmobile/jpmobile Wiki")）によると次のような対応のようだ。

<table class="common">
  <tr>
    <th class="center">jpmobile</th><th class="center">Rails</th>
  </tr>
  <tr>
    <td class="center">4.0.X</td><td class="center">4.0.X</td>
  </tr>
  <tr>
    <td class="center">3.0.X</td><td class="center">3.2.X</td>
  </tr>
  <tr>
    <td class="center">2.0.X</td><td class="center">3.1.X</td>
  </tr>
  <tr>
    <td class="center">1.0.X</td><td class="center">3.0.X</td>
  </tr>
  <tr>
    <td class="center">0.0.8</td><td class="center">2.3.X</td>
  </tr>
</table>

#### 2. jbmobile インストール

Gemfile に追記したので、いつものようにインストールを実行する。

``` bash 
$ sudo bundle install
$ bundle list | grep jpmobile
  * jpmobile (4.0.0)
```

#### 3. application_cotroller.rb 編集

ビューの自動切り替えを行うために、 "apllication_controller.rb" を以下のように編集（１行追記）する。

File: `RAILS_ROOT/app/controllers/application_controller.rb`

{% highlight ruby linenos %}
class ApplicationController < ActionController::Base
  include Jpmobile::ViewSelector
end
{% endhighlight %}

これにより、携帯電話からのアクセスなら

1. index_mobile_docomo.html.erb (docomo の場合)  
   index_mobile_au.html.erb (au の場合)  
   index_mobile_softbank.html.erb (Softbank の場合)
2. index_mobile.html.erb
3. index.html.erb

スマートフォンからのアクセスなら、

1. index_smart_phone_iphone.html.erb (iPhone の場合)  
   index_smart_phone_android.html.erb (Android の場合)  
   index_smart_phone_windows_phone.html.erb (Windows Phone の場合)
2. index_smart_phone.html.erb
3. index.html.erb

の順でビューテンプレートを検索し、存在するビューテンプレートが利用されるようになる。（アクションが index の場合）

ちなみに、レイアウトビュー "application.html.erb" も対応する端末のビューを作成しておけば、同様に利用できるようになる。  
実際に携帯・スマホ用のサイトを作成する際には、CSS や JavaScript をデバイスごとに切り替えることになる。なので、必然的にそれぞれに対応するレイアウトビューを作成することになるでしょう。  
iPhone の場合は以下のように。

1. application_smart_phone_iphone.html.erb
2. application_smart_phone.html.erb
3. application.html.erb

#### 4. ビューテンプレート作成

実際に、対応したい端末用のビューテンプレートや、携帯電話用・スマートフォン用のビューテンプレートを作成する。  
iPhone 用 index アクションなら "index_smart_phone_iphone.html.erb"、携帯電話用 hoge アクションなら "hoge_mobile.html.erb" というように。

#### 5. CSS, JavaScript 作成

説明するまでもないが、対応したい端末用の CSS, JavaScript や、携帯電話用・スマートフォン用の CSS, JavaScript も作成する。  
ただ、読み込み方法をどうするかだけ意識しておけばよいでしょう。  
全端末用のファイルを１つのレイアウトビューで一括で読み込むのか、対応するレイアウトビューを作成して読み込むファイルを指定するか。

#### 6. コントローラ内での処理の振り分け

コントローラ内で処理を振り分けたい場合は、以下のようにする。（一例）

File: `hoge_controller.rb`

{% highlight ruby linenos %}
if request.mobile?
  # 携帯電話用処理
elsif request.smart_phone
  # スマートフォン用処理
else
  # その他
end
{% endhighlight %}

また、キャリアも指定したいのなら以下のようにする。（一例）

File: `hoge_controller.rb`

{% highlight ruby linenos %}
if request.mobile.is_a?(Jpmobile::Mobile::Docomo)
  # docomo 携帯電話用処理
else
  # その他
end
{% endhighlight %}

#### 7. ビューテンプレート内での処理の振り分け

ビューテンプレート内で処理を振り分けたい場合は、以下のようにする。（一例）

File: `index.html.erb`

{% highlight html linenos %}
<% if request.mobile? %>
  <!-- 携帯電話用処理 -->
<% elsif request.smart_phone %>
  <!-- スマートフォン用処理 -->
<% else %>
  <!-- その他 -->
<% end %>
{% endhighlight %}

また、キャリアも指定したいのなら以下のようにする。（一例）

File: `index.html.erb`

{% highlight html linenos %}
<% if request.mobile.is_a?(Jpmobile::Mobile::Docomo) %>
  <!-- docomo 携帯電話用処理 -->
<% else %>
  <!-- その他 -->
<% end %>
{% endhighlight %}

#### 8. 完成画面

既存のビューテンプレートを流用、jQuery Mobile のデフォルトのテーマの１つを使用してデザインしたので、単純な（あまり派手ではない）ものになっているが、一応完成したページを紹介する。（以下は、「カレンダー」ページ）

![RAILS_JPMOBILE]({{site.baseurl}}/images/2013/07/28/RAILS_JPMOBILE.png "RAILS_JPMOBILE")

PCからアクセスした場合は、PC用のページが開くのでご注意を！

#### 9. その他

これらの他に、携帯端末の位置情報を取得したり、IP アドレスを検証したり等々、様々なことができるようだ。  
"README.rdoc" に詳しく記述されているので参照するとよい。

#### 参考サイト

- [jpmobile/jpmobile](https://github.com/jpmobile/jpmobile "jpmobile/jpmobile")
- [jpmobile - RubyGems.org - your community gem host](http://rubygems.org/gems/jpmobile "jpmobile - RubyGems.org - your community gem host")
- [Version : Jpmobile vs Rails · jpmobile/jpmobile Wiki](https://github.com/jpmobile/jpmobile/wiki/Version-:-Jpmobile-vs-Rails "Version : Jpmobile vs Rails · jpmobile/jpmobile Wiki")

---

今回は、携帯端末用に処理やテンプレートを振り分ける作業についてでした。  
あとは、実際に携帯端末用にデザインしていくのみです。  
ちなみに、当方は jQuery Mobile を使って作成していくつもりです。

以上。

