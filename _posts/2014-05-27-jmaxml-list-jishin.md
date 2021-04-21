---
layout   : single
title    : "気象庁防災情報 XML - 地震情報一覧！"
published: true
date     : 2014-05-27 00:20:00 +0900
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
- [mk-mode SITE : DB - 地震情報（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_db/jishin_shingenshindo "mk-mode SITE : DB - 地震情報（気象庁防災情報XML）")

今までは受信したデータをある程度整形して公開していただけでしたので、若干現状を把握しにくい部分もありました。

前回までの一覧同様、最新の「地震情報（震源・震度に関する情報）」を一覧で確認できるようなページを作成したので紹介します。

<!--more-->

### 1. 「一覧 - 地震情報」ページ

以下のようなページを作成・公開した。

![JMAXML_JISHIN]({{site.baseurl}}/images/2014/05/27/JMAXML_JISHIN.png "JMAXML_JISHIN")

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 一覧 - 地震情報（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_list/lst_jishin "mk-mode SITE : 一覧 - 地震情報（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 2. 作成手順

今回のようなページを作成する手順を簡単に説明する。（1〜4は一般的な手順で、5, 6 は当方独自）

1. HTTP サーバを利用できる環境を準備する。
2. 「気象庁防災情報 XML」を受信する準備を行う。（PubSubHubbub の Subscriber を準備する）
3. 気象庁に「気象庁防災情報 XML」受信登録の申請をする。
4. 登録完了後、実際に HTTP サーバで XML フィードの受信を行う。
5. 受信した XML フィードを解析しデータをデータベース MySQL に保存する。
6. データ登録時にトリガーで一覧用テーブルを作成する。
7. 一覧参照用ページを作成する。

### 3. 気象庁防災情報 XML について

- [気象庁防災情報XMLフォーマット](http://xml.kishou.go.jp/ "気象庁防災情報XMLフォーマット")
- [Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG]({{site.baseurl}}/2013/11/20/rails-implement-pubsubhubbub-subscriber "Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG")
- [気象庁防災情報 XML - 受信手順（概要）！ - mk-mode BLOG]({{site.baseurl}}/2013/11/29/jma-disaster-info-xml "気象庁防災情報 XML - 受信手順（概要）！ - mk-mode BLOG")
- [気象庁防災情報 XML 取得（その後）！ - mk-mode BLOG]({{site.baseurl}}/2014/01/30/jma-xml-2 "気象庁防災情報 XML 取得（その後）！ - mk-mode BLOG")

---

今回の「地震情報（震源・震度に関する情報）」の他に「震度速報」、「震源速報（震源に関する情報）」もあるが、「地震情報」に含まれるので除外しています。  
さらに、その他に「顕著な地震の震源要素更新のお知らせ」、「地震回数に関する情報」、「地震の活動状況等に関する情報」、「東海地震予知・注意・観測情報」も情報として存在しますが、それほど情報発表のある情報でもないので「一覧ページ」は作成していません。（「DB ページ」は作成していますが）

その他のページについても今回の処理を流用して順次対応していこうと考えている次第です。

以上。

