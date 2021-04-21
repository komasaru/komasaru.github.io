---
layout   : single
title    : "気象庁防災情報 XML - 地方海上警報集計！"
published: true
date     : 2014-06-25 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Feed
- XML
- MySQL
---

これまで「気象庁防災情報 XML」で発表された情報を（一覧や検索で）確認するためのページを当方サイト上で公開してきました。（以下のページ等）

- [mk-mode SITE : 気象庁防災情報XML](http://www.mk-mode.com/rails/jmaxml "mk-mode SITE : 気象庁防災情報XML")

今回は、「地方海上警報」の発表回数を集計したページを作成・公開しました。

（興味がなければ、無視して下さい。あくまで個人の記録ですので。）

<!--more-->

### 1. 「集計 - 地方海上警報（警報別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_UMI_KEIHO_CHIHO_W]({{site.baseurl}}/images/2014/06/25/JMAXML_CNT_UMI_KEIHO_CHIHO_W.png "JMAXML_CNT_UMI_KEIHO_CHIHO_W")

「地方海上予報区」での絞り込み、明細の並び順の指定が可能である。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 地方海上警報（警報別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_umi_keiho_chiho_w "mk-mode SITE : 集計 - 地方海上警報（警報別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 2. 「集計 - 地方海上警報（海域別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_UMI_KEIHO_CHIHO_A]({{site.baseurl}}/images/2014/06/25/JMAXML_CNT_UMI_KEIHO_CHIHO_A.png "JMAXML_CNT_UMI_KEIHO_CHIHO_A")

「地方海上予報区」、「細分海域」、「海上警報」での絞り込み、明細の並び順の指定が可能である。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 地方海上警報（海域別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_umi_keiho_chiho_a "mk-mode SITE : 集計 - 地方海上警報（海域別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 3. 作成手順

今回のようなページを作成する手順を簡単に説明する。（1〜4は一般的な手順で、5〜7 は当方独自）

1. HTTP サーバを利用できる環境を準備する。
2. 「気象庁防災情報 XML」を受信する準備を行う。（PubSubHubbub の Subscriber を準備する）
3. 気象庁に「気象庁防災情報 XML」受信登録の申請をする。
4. 登録完了後、実際に HTTP サーバで XML フィードの受信を行う。
5. 受信した XML フィードを解析しデータをデータベース MySQL に保存する。  
   （発信元分散サーバの都合で同一電文が複数受信されることがあるので、 UUID で判断して重複しないようにしている。  
     当方サーバの不都合で受信できなかった場合は、「[AITC（先端IT活用推進コンソーシアム） - 気象庁防災情報 XML 検索 API](http://api.aitc.jp/jmardb/help "AITC（先端IT活用推進コンソーシアム） - 気象庁防災情報 XML 検索 API")」で取得して補っている。）
6. データ登録時にトリガーで一覧用テーブルを作成する。
7. 集計参照用ページを作成する。

### 4. 気象庁防災情報 XML について

- [気象庁防災情報XMLフォーマット](http://xml.kishou.go.jp/ "気象庁防災情報XMLフォーマット")
- [Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG]({{site.baseurl}}/2013/11/20/rails-implement-pubsubhubbub-subscriber "Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG")
- [気象庁防災情報 XML - 受信手順（概要）！ - mk-mode BLOG]({{site.baseurl}}/2013/11/29/jma-disaster-info-xml "気象庁防災情報 XML - 受信手順（概要）！ - mk-mode BLOG")
- [気象庁防災情報 XML 取得（その後）！ - mk-mode BLOG]({{site.baseurl}}/2014/01/30/jma-xml-2 "気象庁防災情報 XML 取得（その後）！ - mk-mode BLOG")

---

他の情報についても集計（ランキング）ページを作成・公開したいと考えいている次第です。  
（興味がなければ、無視して下さい）

以上。

