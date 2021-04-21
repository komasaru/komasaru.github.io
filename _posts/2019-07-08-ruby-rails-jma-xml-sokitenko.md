---
layout   : single
title    : "気象庁防災情報 XML - 早期天候情報！"
published: true
date     : 2019-07-08 00:20:00 +0900
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

6月27日から気象庁防災情報 XML でも運用が開始された「早期天候情報」（「異常天候早期警戒情報」の後継）の配信内容を一覧で確認するためのページを作成しました。（既に公開済みの他の情報と同様に）

（ちなみに、当方、気象庁防災情報 XML のデータは Ruby + Rails + MariaDB(MySQL) 等で自作したシステムで受信＆管理しております）

今回はそのページの紹介のみです。  
（気象庁防災情報 XML に興味がなければ、当記事は無視してください）

<!--more-->

### 1. 概要

* **早期天候情報** は、これまでの異常天候早期警戒情報を踏襲したもので、早期に警戒が必要な状況にあると判断された場合に発表される情報。

### 2. 公開ページ

以下が今回公開を開始したページ。

* [mk-mode SITE : 気象庁防災情報 XML - 一覧 - 早期天候情報](https://www.mk-mode.com/rails/jmaxml_list/lst_tenko_soki "mk-mode SITE : 気象庁防災情報 XML - 一覧 - 早期天候情報")

### 3. 注意

* メニューからだけでなく、「[気象庁防災情報 XML - Feed 受信履歴](https://www.mk-mode.com/rails/jmaxml "気象庁防災情報 XML - Feed 受信履歴")」のページからも一覧ページへ遷移できる。

### 4. その他

気象庁防災情報 XML の概要や受信方法等については、「[気象庁防災情報 XML](http://xml.kishou.go.jp/ "気象庁防災情報 XML")」のページか、[当ブログ過去記事](https://www.mk-mode.com/blog/categories "カテゴリ別一覧 - mk-mode BLOG")等をご覧ください。

---

以上。

