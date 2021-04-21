---
layout   : single
title    : "気象庁防災情報 XML - 火山噴火観測報一覧、火山状況解説情報一覧！"
published: true
date     : 2014-06-02 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Feed
- XML
- MySQL
---

当方、「気象庁防災情報 XML」のデータを受信後、データベース MySQL に保存し、さらにホームページ上で公開しています。

- [mk-mode SITE : XML Feed 受信履歴（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml "mk-mode SITE : XML Feed 受信履歴（気象庁防災情報XML）")
- [mk-mode SITE : DB - 火山噴火観測報（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_db/kazan_kansoku "mk-mode SITE : DB - 火山噴火観測報（気象庁防災情報XML）")
- [mk-mode SITE : DB - 火山状況解説情報（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_db/kazan_kaisetsu "mk-mode SITE : DB - 火山状況解説情報（気象庁防災情報XML）")

今までは受信したデータをある程度整形して公開していただけでしたので、若干現状を把握しにくい部分もありました。

前回までの一覧同様、最新の「火山噴火観測報」、「火山状況解説情報」を一覧で確認できるようなページを作成したので紹介します。

<!--more-->

### 1. 「一覧 - 火山噴火観測報」ページ

以下のようなページを作成・公開した。

![JMAXML_KAZAN_KANSOKU]({{site.baseurl}}/images/2014/06/02/JMAXML_KAZAN_KANSOKU.png "JMAXML_KAZAN_KANSOKU")

マウスオーバで火山情報や簡易な説明を表示するようにしている。（UA によっては表示されないかも）

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 一覧 - 火山噴火観測報（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_list/lst_kazan_kansoku "mk-mode SITE : 一覧 - 火山噴火観測報（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 2. 「一覧 - 火山状況解説情報」ページ

以下のようなページを作成・公開した。

![JMAXML_KAZAN_KAISETSU]({{site.baseurl}}/images/2014/06/02/JMAXML_KAZAN_KAISETSU.png "JMAXML_KAZAN_KAISETSU")

マウスオーバで火山情報や簡易な説明を表示するようにしている。（UA によっては表示されないかも）

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 一覧 - 火山状況解説情報（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_list/lst_kazan_kaisetsu "mk-mode SITE : 一覧 - 火山状況解説情報（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 3. 作成手順

今回のようなページを作成する手順を簡単に説明する。（1〜4は一般的な手順で、5, 6 は当方独自）

1. HTTP サーバを利用できる環境を準備する。
2. 「気象庁防災情報 XML」を受信する準備を行う。（PubSubHubbub の Subscriber を準備する）
3. 気象庁に「気象庁防災情報 XML」受信登録の申請をする。
4. 登録完了後、実際に HTTP サーバで XML フィードの受信を行う。
5. 受信した XML フィードを解析しデータをデータベース MySQL に保存する。
6. データ登録時にトリガーで一覧用テーブルを作成する。
7. 一覧参照用ページを作成する。

### 4. 気象庁防災情報 XML について

- [気象庁防災情報XMLフォーマット](http://xml.kishou.go.jp/ "気象庁防災情報XMLフォーマット")
- [Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG]({{site.baseurl}}/2013/11/20/rails-implement-pubsubhubbub-subscriber "Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG")
- [気象庁防災情報 XML - 受信手順（概要）！ - mk-mode BLOG]({{site.baseurl}}/2013/11/29/jma-disaster-info-xml "気象庁防災情報 XML - 受信手順（概要）！ - mk-mode BLOG")
- [気象庁防災情報 XML 取得（その後）！ - mk-mode BLOG]({{site.baseurl}}/2014/01/30/jma-xml-2 "気象庁防災情報 XML 取得（その後）！ - mk-mode BLOG")

---

まだ残っている気象観測関連のページについても今回の処理を流用して対応していこうと考えている次第です。（若干データ構造が異なるので、考慮する必要があるかも知れないが）

以上。

