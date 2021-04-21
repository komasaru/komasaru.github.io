---
layout   : single
title    : "気象庁防災情報 XML - 受信手順（概要）！"
published: true
date     : 2013-11-29 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Feed
- XML
---

気象庁発表の防災関連情報を XML 形式で即時に受信する方法についての概要です。

試験的な運用の段階ですが、サイトのデータをパースするのは非推奨とされているので、データを取得したければ公式に二次利用が許可されているこちらの方法を採用しないといけません。

大まかな流れですが、参考になればと思います。（ちなみに、Subscriber の構築が一番の鬼門になるかと思います）

<!--more-->

### 0. 前提条件

- Web サーバを自分で自由に操作できる環境が必要。（Apache, Nginx 等）
- Web サーバ上で動的処理のできる環境が整備済み。（PHP, Ruby on Rails 等）

### 1. 気象庁防災情報 XML について理解

「[気象庁防災情報XMLフォーマット](http://xml.kishou.go.jp/ "気象庁防災情報XMLフォーマット")」のページで全てが説明されているので、全てに目を通す。  
一度に全てを理解するのは骨が折れる作業になるので、取り敢えずは概要を理解し、その後各種コードの仕様や電文別のフォーマット等の説明は随時理解していくようにすると良いだろう。  
実際、受信した XML を処理しようとプログラミングを始めると自ずと理解できるようになる。

### 2. PubSubHubbub について理解

「気象庁防災情報 XML」の配信には、"PubSubHubbub" という XML を即時に配信するプロトコルが使用されている。  
各種 Web サイト等でも説明されているので、参考にして理解する。  
当ブログ過去記事でも説明している。参考まで。

- [Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG](http://www.mk-mode.com/octopress/2013/11/20/rails-implement-pubsubhubbub-subscriber/ "Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG")

### 3. Subscriber 構築

「気象庁防災情報 XML」を受信するためには "Subscriber"（購読者）が必要であるので、構築し、不具合が無いようにテストしておく。  
参考までに、「[Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG](http://www.mk-mode.com/octopress/2013/11/20/rails-implement-pubsubhubbub-subscriber/ "Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG")」でも Ruby on Rails での構築方法を紹介している。

### 4. Hub 登録申請

「気象庁防災情報 XML」からの配信は Google の "Alert Hub" 経由で行わる。（Subscriber 構築時のテストでは Google の "PubSubHubbub Hub" を使用していた）  
Alert Hub の登録は、気象庁が登録者数を把握するために気象庁側で行われるので、自分ではしない。  
「[気象庁防災情報XMLフォーマット](http://xml.kishou.go.jp/ "気象庁防災情報XMLフォーマット")」内に申請方法も記載されているので、よく読んでメールで登録申請する。  
そして、２週間以内に気象庁側で登録が完了し、返信メールが届く。

注意しないといけいないは、Alert Hub 登録時に Subscriber 宛に「購読意思確認」の GET リクエストが飛んでくるので、その時に正常にレスポンスを返せないと登録されないということ。（Subscriber 構築時に入念にテストしておくこと）

### 5. GET リクエスト処理

気象庁側で Alert Hub 登録時に GET リクエスト（購読意思確認）が飛んでくるので、Subscriber で正常にレスポンスを返す。（「[Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG](http://www.mk-mode.com/octopress/2013/11/20/rails-implement-pubsubhubbub-subscriber/ "Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG")」参照）

実際には、以下のような GET リクエストとなる。（`verify_token` は伏せている）（Web サーバ：Nginx の場合）  
処理が成功すれば、レスポンスコード `200` が返るはずである。

``` bash 
8.35.200.39 - - [07/Nov/2013:12:14:39 +0900] "GET /rails/jmx?hub.verify_token=XX
XXXXXXXX&hub.challenge=-SEezbWxrJn-aoBO-uR9ObjHXZTAqSJW7k3C2Jcg-WuVWAWe0EpkvRARl
PFrvKyUdnHHlUplZv3Z47F50IIbre5wSqUPkbVK0Vi4E0eiLzZrKDbhxfTA9N1UDyh7TcwU&hub.topi
c=http%3A%2F%2Fxml.kishou.go.jp%2Ffeed%2Fregular.xml&hub.mode=subscribe&hub.leas
e_seconds=432000 HTTP/1.1" 200 153 "-" "AppEngine-Google; (+http://code.google.c
om/appengine; appid: s~alert-hub)" "-" "0.90"
```

### 6. POST リクエスト処理

Alert Hub の登録が正常に終了すると、以降順次 POST リクエスト（XML フィードが発行されたという Atom フィード）が飛んでくる。  
この受信した Atom フィード内に記載されている XML の URL にアクセスすれば実際の XML が取得できる。  
後は取得した XML を好きに処理すればよい。

実際には、以下のような POST リクエストとなる。（Web サーバ：Nginx の場合）

``` bash 
8.35.200.38 - - [07/Nov/2013:12:20:15 +0900] "POST /rails/jmx HTTP/1.1" 200 32 "
-" "AppEngine-Google; (+http://code.google.com/appengine; appid: s~alert-hub)" "
-" "0.05"
```

参考までに、飛んでくる Atom フィードは以下のような内容。

``` xml 
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ja">
<title>JMAXML publishing feed</title>
<subtitle>this feed is published by JMA</subtitle>
<updated>2013-11-10T00:21:01+09:00</updated>
<id>urn:uuid:f57b5866-0c8c-3c92-9aff-10a715cdf48b</id>
<link href="http://www.jma.go.jp/" rel="related"/>
<link href="http://xml.kishou.go.jp/feed/extra.xml" rel="self"/>
<rights>Published by Japan Meteorological Agency</rights>

<entry>
<title>気象警報・注意報</title>
<id>urn:uuid:c3f6002a-029d-3283-8a60-563d54c64b7f</id>
<updated>2013-11-09T15:20:37Z</updated>
<author><name>仙台管区気象台</name></author>
<link href="http://xml.kishou.go.jp/data/c3f6002a-029d-3283-8a60-563d54c64b7f.xml" type="application/xml"/>
<content type="text">【宮城県気象警報・注意報】東部では、１０日朝から１０日昼前まで暴風に警戒してください。</content>
</entry>
<entry>
<title>気象特別警報・警報・注意報</title>
<id>urn:uuid:40f3f3f6-ccc9-36b9-898b-19d880e3f55b</id>
<updated>2013-11-09T15:20:34Z</updated>
<author><name>仙台管区気象台</name></author>
<link href="http://xml.kishou.go.jp/data/40f3f3f6-ccc9-36b9-898b-19d880e3f55b.xml" type="application/xml"/>
<content type="text">【宮城県気象警報・注意報】東部では、１０日朝から１０日昼前まで暴風に警戒してください。</content>
</entry>
</feed>
```

この `<entry>` タグ内の URL を読み行けば、発行された XML が取得できる。  
以下のようなもの。

``` xml 
<?xml version="1.0" encoding="UTF-8"?>
<Report xmlns="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx_add="http://xml.kishou.go.jp/jmaxml1/addition1/">
<Control>
<Title>気象警報・注意報</Title>
<DateTime>2013-11-09T15:20:37Z</DateTime>
<Status>通常</Status>
<EditorialOffice>仙台管区気象台</EditorialOffice>
<PublishingOffice>仙台管区気象台</PublishingOffice>
</Control>
<Head xmlns="http://xml.kishou.go.jp/jmaxml1/informationBasis1/">
<Title>宮城県気象警報・注意報</Title>
<ReportDateTime>2013-11-10T00:20:00+09:00</ReportDateTime>
<TargetDateTime>2013-11-10T00:20:00+09:00</TargetDateTime>
<EventID/>
<InfoType>発表</InfoType>
<Serial/>
<InfoKind>気象警報・注意報</InfoKind>
<InfoKindVersion>1.0_0</InfoKindVersion>
<Headline>
<Text>東部では、１０日朝から１０日昼前まで暴風に警戒してください。</Text>

<!-- 途中省略 -->

</Head>
<Body xmlns="http://xml.kishou.go.jp/jmaxml1/body/meteorology1/" xmlns:jmx_eb="http://xml.kishou.go.jp/jmaxml1/elementBasis1/">
<Warning type="気象警報・注意報（府県予報区等）">
<Item>
<Kind>
<Name>暴風警報</Name>
<Code>05</Code>
<Status>発表</Status>
</Kind>
<Kind>
<Name>波浪注意報</Name>
<Code>16</Code>
<Status>継続</Status>
</Kind>
<Area>
<Name>宮城県</Name>
<Code>040000</Code>
</Area>
<ChangeStatus>警報・注意報種別に変化有</ChangeStatus>
<FullStatus>一部</FullStatus>
<EditingMark>0</EditingMark>
</Item>
</Warning>

<!-- 途中省略 -->

</Body>
</Report>
```

### 7. 当方の利用例

今回は簡単に流れを説明したが、当方は実際には以下のような環境で運用化している。

- Web サーバ：Nginx
- Web フレームワーク：Ruby on Rails
- Rails サーバ：Unicorn

Rails のコントローラで GET リクエスト（購読意思確認）受信・処理、POST リクエスト（更新 フィード）受信し、実際の処理はコントローラから別途作成している Ruby スクリプトをキックする方法を採っている。  
ちなみに、そのキックされる Ruby スクリプトでは、取得した XML を解析し、データベース（MySQL）に保存し、場合によっては整形してツイートする、という処理を行なっている。（取得・保存した XML データは Rails 製サイトで閲覧できるようにもしている）

【当方閲覧用ページ】

- [mk-mode SITE : 気象庁防災情報XML](http://www.mk-mode.com/rails/jmaxml "mk-mode SITE : 気象庁防災情報XML")

【ツイートアカウント】（地震・津波・火山は全国規模で、その他気象防災関連は島根県・松江市を中心にツイート）

- [警戒・松江（非公式Bot） wn_matsue](https://twitter.com/wn_matsue "警戒・松江（非公式Bot） wn_matsue")

### 8. 気象庁発信データの利用について

気象庁のサイトをスクレイピングして情報を取得することは、「[気象庁 | 著作権・リンク・個人情報保護について](http://www.jma.go.jp/jma/kishou/info/coment.html "気象庁 | 著作権・リンク・個人情報保護について")」の「利用上の注意について」に、

> 当ホームページは、通常のブラウザで閲覧することを前提に各種情報を掲載しております。自動巡回ソフト等による、定期的、自動的な気象データの収集等は、サーバーに負荷がかかる等の理由から、原則としてご遠慮いただいております。ご理解お願いします。

と記載があるとおり、やるべきではありません。

一方、XML を取得し二次利用することは、「[気象庁防災情報XMLフォーマット | 技術資料](http://xml.kishou.go.jp/open_trial/index.html "気象庁防災情報XMLフォーマット | 技術資料")」内の「気象庁ホームページを通じて公開するＸＭＬ形式電文のご利用にあたっての留意事項」(PDFファイル)に、

> 利用目的が気象業務法の趣旨及び公序良俗に反しない限り、原則として制限はありません。

と記載があるとおり、原則として自由のようです。

### 参考サイト

- [気象庁防災情報XMLフォーマット](http://xml.kishou.go.jp/ "気象庁防災情報XMLフォーマット")

---

XML データの配信は試験的な運用ではあるようですが、うまく利用すればかなり有用なものが作れるようになるのではないでしょうか。

ただ、試験運用のためか、受信する電文種類（XML）によっては発行タイミングが気象庁サイトで公開されるより若干遅れるようです。  
また、負荷分散のためにサーバが分散している（？）しているからか、同じ UUID のフィード（内容も全く同じ）が飛んできたり、内容が同じでも UUID の異なるフィードが飛んできたりもします。

さらに、緊急地震速報も XML 化されているようですが、現在は公開はされていないようです。今後公開されるようになるかも知れません。  
その時には、タイムラグの問題も解消されるのではないでしょうか。

以上。

