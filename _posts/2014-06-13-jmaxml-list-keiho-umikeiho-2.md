---
layout   : single
title    : "気象庁防災情報 XML - 気象警報・注意報発表中の区市町村一覧、地方海上警報発表中の海域一覧！"
published: true
date     : 2014-06-13 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Feed
- XML
- MySQL
---

以前、「気象庁防災情報 XML」で発表されたデータのうち、「気象警報・注意報」や「地方海上警報」の最新のデータを一覧で確認できるようなページを紹介しました。

- [mk-mode SITE : 一覧 - 気象警報・注意報（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_list/lst_keiho "mk-mode SITE : 一覧 - 気象警報・注意報（気象庁防災情報XML）")
- [mk-mode SITE : 一覧 - 地方海上警報（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_list/lst_umi_keiho_area "mk-mode SITE : 一覧 - 地方海上警報（気象庁防災情報XML）")

これらのページは区市町村単位または細分海域単位で発表中の警報・注意報、海上警報を確認するためのものでしたが、今回は逆に警報・注意報単位または海上警報単位で発表中の区市町村または細分海域を確認するためのページを作成・公開しました。

（興味がなければ、無視して下さい。あくまで個人の記録ですので。）

<!--more-->

### 1. 「一覧 - 気象警報・注意報（種類別）」ページ

以下のようなページを作成・公開した。

![JMAXML_KEIHO_2]({{site.baseurl}}/images/2014/06/13/JMAXML_KEIHO_2.png "JMAXML_KEIHO_2")

マウスオーバで詳細な情報や解説をポップアップするようにしている。（UA, ブラウザによっては表示されないかも）

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 一覧 - 気象警報・注意報（種類別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_list/lst_keiho_2 "mk-mode SITE : 一覧 - 気象警報・注意報（種類別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 2. 「一覧 - 地方海上警報（種類別）」ページ

以下のようなページを作成・公開した。

![JMAXML_UMI_KEIHO_AREA_2]({{site.baseurl}}/images/2014/06/13/JMAXML_UMI_KEIHO_AREA_2.png "JMAXML_UMI_KEIHO_AREA_2")

マウスオーバで詳細な情報や解説をポップアップするようにしている。（UA, ブラウザによっては表示されないかも）

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 一覧 - 地方海上警報（種類別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_list/lst_umi_keiho_area_2 "mk-mode SITE : 一覧 - 地方海上警報（種類別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 3. 作成手順

今回のようなページを作成する手順を簡単に説明する。（1〜4は一般的な手順で、5〜7 は当方独自）

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

気象庁防災情報 XML の一覧についてはほぼ落ち着いたので、次は集計（ランキング）ページを作成・公開したいと考えいている次第です。  
（興味がなければ、無視して下さい）

以上。

