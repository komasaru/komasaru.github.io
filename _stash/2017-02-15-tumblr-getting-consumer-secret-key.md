---
layout   : single
title: 'Tumblr API - Consumer Key, Secret Key の取得！'
published: true
date     : 2017-02-15 00:20:00 +0900
comments : true
categories:
- SNS
tags:
- Tumblr
---

[Tumblr API](https://www.tumblr.com/docs/en/api/v2 "API - Tumblr") を使用するのに必要な Consumer Key, Secret Key を取得する方法についての記録です。

<!--more-->

### 0. 前提条件

* [Tumblr](https://www.tumblr.com/ "Tumblr") のアカウントが作成済みであること。  
  さらに、以下の作業を行う前にログイン済みであること。

### 1. アプリ登録ページヘのアクセス

Consumer Key, Secret Key の取得はアプリケーションの登録を通して行うので、 [Applications](https://www.tumblr.com/oauth/apps "Tumblr - Applications") のページへアクセスし、「アプリを登録する」をクリックする。

![TUMBLR_1]({{site.baseurl}}/images/2017/02/15/TUMBLR_1.png "TUMBLR_1")

### 2. 情報の入力

必須の「アプリケーション名」、「アプリケーションウェブサイト（＊印が付いてないが必須の項目）」、「アプリケーションの説明」、「管理用の連絡先メール」、「デフォルトのコールバックURL」やその他の項目を入力、必要であれば "Icon" 画像も設定する。（「デフォルトのコールバックURL」は、取り急ぎ、自分の Web サイト等にしておけばよい）  
よければ、 "I'm not a robot" にチェックを入れて「登録」をクリックする。

![TUMBLR_2]({{site.baseurl}}/images/2017/02/15/TUMBLR_2.png "TUMBLR_2")

### 3. Consumer Key の確認

登録が完了するとページが変わる。  
"OAuth Consumer Key:" に続いて表示されるランダムな文字列が Consumer Key である。

![TUMBLR_3]({{site.baseurl}}/images/2017/02/15/TUMBLR_3.png "TUMBLR_3")

### 4. Secret Key の確認

Secret Key は "Show secret key" のリンクをクリックすると表示される。

![TUMBLR_4]({{site.baseurl}}/images/2017/02/15/TUMBLR_4.png "TUMBLR_4")

### 5. その他

作成したアプリケーション、 Consumer Key, Secret Key は、後から「設定 - アプリ」で確認できる。

---

Tumblr API を使用するには Consumer Key, Secret Key 以外に Access Token, Access Token Secret も必要です。

その方法についても記録するつもりです。

以上。

