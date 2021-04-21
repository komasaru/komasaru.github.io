---
layout   : single
title    : "気象庁防災情報 XML - 大雨危険度通知！"
published: true
date     : 2019-07-11 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Ruby
- Rails
- Feed
- MySQL
- XML
---

7月10日から気象庁防災情報 XML で運用が開始された「大雨危険度通知」の配信内容を一覧で確認するためのページを作成しました。（既に公開済みの他の情報と同様に）

（ちなみに、当方、気象庁防災情報 XML のデータは Ruby + Rails + MariaDB(MySQL) 等で自作したシステムで受信＆管理しております）

今回はそのページの紹介のみです。  
（気象庁防災情報 XML に興味がなければ、当記事は無視してください）

<!--more-->

### 1. 概要

* **大雨危険度通知** は、大雨／洪水警報のメッシュ単位の危険度の変化状況や、気象庁の発表する大雨警報等の発表状況を利用して、二次細分区域等の単位で10分毎に判定した結果の情報。

### 2. 公開ページ

以下が今回公開を開始したページ。

* [mk-mode SITE : 気象庁防災情報 XML - 一覧 - 大雨危険度通知](https://www.mk-mode.com/rails/jmaxml_list/lst_oame_kikendo "mk-mode SITE : 気象庁防災情報 XML - 一覧 - 大雨危険度通知")

### 3. 注意

* 全件だと容量が大きくなるため、「今後の情報等に留意」でない、または、「継続」でないもののみに限定している。
* メニューからだけでなく、「[気象庁防災情報 XML - Feed 受信履歴](https://www.mk-mode.com/rails/jmaxml "気象庁防災情報 XML - Feed 受信履歴")」のページからも一覧ページへ遷移できる。

### 4. その他

気象庁防災情報 XML の概要や受信方法等については、「[気象庁防災情報 XML](http://xml.kishou.go.jp/ "気象庁防災情報 XML")」のページか、[当ブログ過去記事](https://www.mk-mode.com/blog/categories "カテゴリ別一覧 - mk-mode BLOG")等をご覧ください。

---

以上。

