---
layout   : single
title    : "Google Maps JavaScript API V3 - APIキー取得！"
published: true
date     : 2013-07-10 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Google
---

ホームページ上で "Google Maps API V3" を使ったアプリを動かしてみたくなりました。

"Google Maps API V3" を利用するには API キーが必要です。  
（時期によっては、API キーが無くても利用できたりしていたようですが、当記事執筆時点では API キーは必要です）

以下、簡単ですが取得手順についての記録です。

<!--more-->

#### 0. 前提条件

- Google アカウントを所有していること。

#### 1. Googe APIs Console アクセス

Googe APIs Console[ [https://code.google.com/apis/console](https://code.google.com/apis/console "Googe APIs Console") ]にアクセスする。  
（Google アカウントでログインしていなければ、ログイン画面になるのでログインする）

#### 2. プロジェクト名変更

[Create project...] ボタンをクリックすると、Googe APIs Console 画面が表示される。  
プロジェクト名がデフォルトでは "API Project" となっているが、変更したければプロジェクト名をクリック後 "Rename" で変更できる。  
当方は、デフォルトのまま使用することにした。

#### 3. サービス設定

左側のメニューで [Service] をクリックし、右側に表示された一覧のうち、 "Google Maps API V3" サービスの "OFF" 表示の部分をクリックする。  
"Google Maps/Google Earth APIs Terms of Service" という同意画面が表示されるので、よく読んで同意すると、 "Google Maps API V3" サービスが "ON" になる。

#### 4. API キー取得

左側のメニューで [API Access] をクリックし、開いたページの [Key for browser apps] - [Simple API Access] の部分に記載されているのが API キーである。  
この API キーを "Google Maps JavaScript API V3" で使用するので、メモしておく。

#### 5. ドメイン指定

デフォルトでは、この API キーはどのサイトでも利用できてしまう。  
自分の API キーが何者かによって、不正に別のサイトで使用されて使用回数制限に引っかかったりするのを防ぐため、利用可能なドメインを設定する。  
API キーの右側にある "Edit allowed referrers..." をクリックし、開いたページで利用したいドメインを指定する。複数指定したい場合は、行を変えて入力する。（当方の場合、"www.mk-mode.com/*" と指定）  
[Update] をクリックすると、登録され元のページに戻るので、 [Key for browser apps] - [Reffers] に表示されている内容を確認する。

---

これで、Google Maps API V3 を使用出来るようになりました。

以上。

