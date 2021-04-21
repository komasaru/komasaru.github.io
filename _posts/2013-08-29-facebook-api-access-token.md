---
layout   : single
title    : "Facebook API - アクセストークン！"
published: true
date     : 2013-08-29 00:20:00 +0900
comments : true
categories:
- SNS
tags:
- Facebook
---

Facebook の各種情報をより多く取得する際等に、ユーザIDやシークレットコード以外に「アクセストークン」というものを使用します。  
アクセストークンを使用しなくても取得できる情報はありますが、その量は少ないです。

以下、アクセストークンについての概要と取得方法についての簡単な記録です。

<!--more-->

#### 0. 前提条件

- 当然 Facebook アカウントを取得済みである。
- 今回はアクセストークンのうち、"User Access Token", "App Access Token" の取得方法のみ紹介する。
- App Access Token 取得用に Facebook アプリを作成済みである。
* **Facebook API は非常に頻繁に仕様変更があるため、当記事の内容が通用しなくなる可能性は非常に大きい。**

#### 1. Facebook アクセストークンの種類

当記事執筆時点では、以下の４種類のアクセストークンがある。

1. User Access Token  
   ... Facebook ユーザ用のアクセストークン。有効期限は１時間か２時間、もしくは60日間。
2. App Access Token  
   ... Facebook アプリ用のアクセストークン。有効期限は無期限。
3. Page Access Token  
   ... Facebook ページ用のアクセストークン。
4. Client Token  
   ... Facebook アプリに特定させるためにモバイルアプリ等に組み込むためのトークン（？）

#### 2. User Access Token 取得方法

Facebook にログインしている状態で「[Graph API Explorer](https://developers.facebook.com/tools/explorer/ "Graph API Explorer")」のページにアクセスし、表示されたページ内の「アクセストークンを取得」ボタンをクリックし、 "Select Permissions" で有効にしたい権限を指定すれば、「アクセストークン」欄に表示される。  
さらにこのページでは、アクセストークンを使用して API でどのような値が返ってくるのか確認することもできる。

![FB_API_EXPLORER]({{site.baseurl}}/images/2013/08/29/FB_API_EXPLORER.png "FB_API_EXPLORER")

このページで確認してもよいが、実際には `https://graph.facebook.com/{id}?access_token={access-token}` のような URL に HTTP リクエストして返却される JSON 形式データを確認する形となる。

#### 3. App Access Token 取得方法

あらかじめ作成しておいた Facebook アプリの ID とシークレットキーを使用して、ブラウザから以下のように HTTP リクエストする。

``` text 
https://graph.facebook.com/oauth/access_token?
        client_id={app-id}&
        client_secret={app-secret}&
        grant_type=client_credentials
```

すると、以下のような形式でブラウザに表示される。

``` text 
access_token={app-id}|{access-token}
```

#### 4. Facebook アプリの60日間有効の User Access Token 取得方法

Facebook アプリにはアプリに紐付いている App Access Token の他にユーザに紐付いている User Access Token がある。  
この User Access Token も、上記「2」同様にデフォルトでは１時間か２時間が有効期限であるが、以下のようにすれば、60日間有効な User Access Token が取得可能である。

``` text 
https://graph.facebook.com/oauth/access_token?
        grant_type=fb_exchange_token&
        client_id={app-id}&
        client_secret={app-secret}&
        fb_exchange_token={short-lived-token}
```

#### 5. アクセストークン確認方法

「[トークンツールにアクセス- Facebook Developers](https://developers.facebook.com/tools/access_token/ "トークンツールにアクセス- Facebook Developers")」のページで User Access Token, App Access Token の確認ができる。  
User Access Token は都度有効期限が切れるので、このページで確認する。

#### 参考サイト

- [Access Tokens - Facebook開発者](https://developers.facebook.com/docs/facebook-login/access-tokens/ "Access Tokens - Facebook開発者")

---

これで、User Access Token で一般的なことができたり、App Access Token で各種プログラムで情報が取得できたりできます。

また、Facebook API は仕様変更が頻繁にあり、今回の方法もいずれ通用しなくなる可能性は非常に大きいです。しかし、基本的なことは理解できたかと思っています。

以上。

