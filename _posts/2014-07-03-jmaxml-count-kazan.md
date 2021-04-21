---
layout   : single
title    : "気象庁防災情報 XML - 火山噴火警報・予報、火山噴火観測報集計！"
published: true
date     : 2014-07-03 00:20:00 +0900
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

今回は、「火山噴火警報・予報」、「火山噴火観測報」の発表回数を集計したページを作成・公開しました。  
（ちなみに、噴火警報・予報の情報には、「火山」を対象にしたもの、「市町村等」を対象にしたもの、「市町村の防災対応等」を示したもの、「海上予報区」を対象にしたものがあります）

（興味がなければ、無視して下さい。あくまで個人の記録ですので。）

<!--more-->

### 1. 「集計 - 火山噴火警報・予報（火山）（警報・予報別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_FUNKA_KEIHO_V_W]({{site.baseurl}}/images/2014/07/03/JMAXML_CNT_FUNKA_KEIHO_V_W.png "JMAXML_CNT_FUNKA_KEIHO_V_W")

「火山」での絞り込みが可能である。  
また、「警報・予報」のリンクをクリックすることで「火山別」のページヘ遷移するようにもしている。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 火山噴火警報・予報（火山）（警報・予報別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_funka_keiho_v_w "mk-mode SITE : 集計 - 火山噴火警報・予報（火山）（警報・予報別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 2. 「集計 - 火山噴火警報・予報（火山）（火山別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_FUNKA_KEIHO_V_V]({{site.baseurl}}/images/2014/07/03/JMAXML_CNT_FUNKA_KEIHO_V_V.png "JMAXML_CNT_FUNKA_KEIHO_V_V")

「警報・予報」での絞り込み、明細の並び順の指定が可能である。  
また、「火山」のリンクをクリックすることで「警報・予報別」のページヘ遷移するようにもしている。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 火山噴火警報・予報（火山）（火山別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_funka_keiho_v_v "mk-mode SITE : 集計 - 火山噴火警報・予報（火山）（火山別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 3. 「集計 - 火山噴火警報・予報（市町村等）（警報・予報別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_FUNKA_KEIHO_C_W]({{site.baseurl}}/images/2014/07/03/JMAXML_CNT_FUNKA_KEIHO_C_W.png "JMAXML_CNT_FUNKA_KEIHO_C_W")

「市町村」での絞り込みが可能である。  
また、「警報・予報」のリンクをクリックすることで「市町村別」のページヘ遷移するようにもしている。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 火山噴火警報・予報（市町村）（警報・予報別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_funka_keiho_c_w "mk-mode SITE : 集計 - 火山噴火警報・予報（市町村）（警報・予報別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 4. 「集計 - 火山噴火警報・予報（市町村等）（市町村別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_FUNKA_KEIHO_C_C]({{site.baseurl}}/images/2014/07/03/JMAXML_CNT_FUNKA_KEIHO_C_C.png "JMAXML_CNT_FUNKA_KEIHO_C_C")

「警報・予報」での絞り込み、明細の並び順の指定が可能である。  
また、「市町村」のリンクをクリックすることで「警報・予報別」のページヘ遷移するようにもしている。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 火山噴火警報・予報（市町村）（市町村別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_funka_keiho_c_c "mk-mode SITE : 集計 - 火山噴火警報・予報（市町村）（市町村別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 5. 「集計 - 火山噴火警報・予報（防災対応等）（警報・予報別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_FUNKA_KEIHO_P_W]({{site.baseurl}}/images/2014/07/03/JMAXML_CNT_FUNKA_KEIHO_P_W.png "JMAXML_CNT_FUNKA_KEIHO_P_W")

「市町村」での絞り込みが可能である。  
また、「警報・予報」のリンクをクリックすることで「市町村別」のページヘ遷移するようにもしている。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 火山噴火警報・予報（防災対応）（警報・予報別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_funka_keiho_p_w "mk-mode SITE : 集計 - 火山噴火警報・予報（防災対応）（警報・予報別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 6. 「集計 - 火山噴火警報・予報（防災対応等）（市町村別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_FUNKA_KEIHO_P_C]({{site.baseurl}}/images/2014/07/03/JMAXML_CNT_FUNKA_KEIHO_P_C.png "JMAXML_CNT_FUNKA_KEIHO_P_C")

「警報・予報」での絞り込み、明細の並び順の指定が可能である。  
また、「市町村」のリンクをクリックすることで「警報・予報別」のページヘ遷移するようにもしている。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 火山噴火警報・予報（防災対応）（市町村別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_funka_keiho_p_c "mk-mode SITE : 集計 - 火山噴火警報・予報（防災対応）（市町村別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 7. 「集計 - 火山噴火警報・予報（海上予報区）（警報・予報別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_FUNKA_KEIHO_M_W]({{site.baseurl}}/images/2014/07/03/JMAXML_CNT_FUNKA_KEIHO_M_W.png "JMAXML_CNT_FUNKA_KEIHO_M_W")

「海上予報区」での絞り込みが可能である。  
また、「警報・予報」のリンクをクリックすることで「海上予報区別」のページヘ遷移するようにもしている。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 火山噴火警報・予報（海上予報区）（警報・予報別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_funka_keiho_m_w "mk-mode SITE : 集計 - 火山噴火警報・予報（海上予報区）（警報・予報別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 8. 「集計 - 火山噴火警報・予報（海上予報区）（海上予報区別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_FUNKA_KEIHO_M_A]({{site.baseurl}}/images/2014/07/03/JMAXML_CNT_FUNKA_KEIHO_M_A.png "JMAXML_CNT_FUNKA_KEIHO_M_A")

「警報・予報」での絞り込み、明細の並び順の指定が可能である。  
また、「海上予報区」のリンクをクリックすることで「警報・予報別」のページヘ遷移するようにもしている。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 火山噴火警報・予報（海上予報区）（海上予報区別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_funka_keiho_m_a "mk-mode SITE : 集計 - 火山噴火警報・予報（海上予報区）（海上予報区別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 9. 「集計 - 火山噴火観測報（警報・予報別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_FUNKA_KANSOKU_W]({{site.baseurl}}/images/2014/07/03/JMAXML_CNT_FUNKA_KANSOKU_W.png "JMAXML_CNT_FUNKA_KANSOKU_W")

「火山」での絞り込みが可能である。  
また、「警報・予報」のリンクをクリックすることで「火山別」のページヘ遷移するようにもしている。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 火山噴火観測報（警報・予報別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_funka_kansoku_w "mk-mode SITE : 集計 - 火山噴火観測報（警報・予報別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 10. 「集計 - 火山噴火観測報（火山別）」ページ

以下のようなページを作成・公開した。

![JMAXML_CNT_FUNKA_KANSOKU_V]({{site.baseurl}}/images/2014/07/03/JMAXML_CNT_FUNKA_KANSOKU_V.png "JMAXML_CNT_FUNKA_KANSOKU_V")

「警報・予報」での絞り込み、明細の並び順の指定が可能である。  
また、「火山」のリンクをクリックすることで「警報・予報別」のページヘ遷移するようにもしている。

実際のサイトは以下。よろしければ、ご参照ください。

- [mk-mode SITE : 集計 - 火山噴火観測報（火山別）（気象庁防災情報XML）](http://www.mk-mode.com/rails/jmaxml_count/cnt_funka_kansoku_v "mk-mode SITE : 集計 - 火山噴火観測報（火山別）（気象庁防災情報XML）")

（気象庁防災情報 XML の受信状況によっては正しく表示されないことがあるかも知れない）

### 11. 作成手順

今回のようなページを作成する手順を簡単に説明する。（1〜4は一般的な手順で、5〜7 は当方独自）

1. HTTP サーバを利用できる環境を準備する。
2. 「気象庁防災情報 XML」を受信する準備を行う。（PubSubHubbub の Subscriber を準備する）
3. 気象庁に「気象庁防災情報 XML」受信登録の申請をする。
4. 登録完了後、実際に HTTP サーバで XML フィードの受信を行う。
5. 受信した XML フィードを解析しデータをデータベース MySQL に保存する。
6. データ登録時にトリガーで一覧用テーブルを作成する。
7. 集計参照用ページを作成する。

### 12. 気象庁防災情報 XML について

- [気象庁防災情報XMLフォーマット](http://xml.kishou.go.jp/ "気象庁防災情報XMLフォーマット")
- [Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG]({{site.baseurl}}/2013/11/20/rails-implement-pubsubhubbub-subscriber "Ruby on Rails - PubSubHubbub Subscriber 実装！ - mk-mode BLOG")
- [気象庁防災情報 XML - 受信手順（概要）！ - mk-mode BLOG]({{site.baseurl}}/2013/11/29/jma-disaster-info-xml "気象庁防災情報 XML - 受信手順（概要）！ - mk-mode BLOG")
- [気象庁防災情報 XML 取得（その後）！ - mk-mode BLOG]({{site.baseurl}}/2014/01/30/jma-xml-2 "気象庁防災情報 XML 取得（その後）！ - mk-mode BLOG")

---

これまで行なってきた「気象防災情報 XML」関連ページの記事公開は（取り敢えず）今回で終了といたします。  
今後は思い付いたページを随時作成・公開することになるかと思います。

以上。

