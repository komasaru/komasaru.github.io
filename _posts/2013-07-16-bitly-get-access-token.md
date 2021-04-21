---
layout   : single
title    : "bitly - OAuth 認証アクセストークン取得！"
published: true
date     : 2013-07-16 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- bitly
- OAuth
---

URL 短縮サービス "[bitly](https://bitly.com/ "bitly")" を利用している場合、用意されている API を使用して様々な処理が可能です。

bitly API V3 を使用するには、OAuth 認証が必要です。（一部のリクエストでは API キー認証も使用可）

今回は、OAuth 認証に必要なアクセストークンの取得方法について簡単に記録しておきます。
全く難しい作業ではありませんが、自分の目でメニュー等を探しても設定箇所が見つからなかったので。

<!--more-->

### 0. 前提条件

- URL 短縮サービス "[bitly](https://bitly.com/ "bitly")" のアカウントを取得している。

### 1. bitly サイトでのアクセストークン取得

#### 1-1. 登録ページにアクセス

[ [Manage Oauth Apps - bitly - your bitmarks](https://bitly.com/a/oauth_apps "Manage Oauth Apps - bitly - your bitmarks") ] にアクセスする。  
未ログインならログイン画面になるのでログインする。  
ちなみに、bitly にアカウントを取得していてもメールアドレスの照合が未完了の場合は、"Generic Access Token" の部分が非活性（薄い表示）になっていて操作できないようになっている。その場合は、"setting page" でメールアドレスの照合を行う。

#### 1-2. アクセストークン生成

パスワード入力後、[Generate Token] ボタンをクリックする。  

![BITLY_OAUTH_1]({{site.baseurl}}/images/2013/07/16/BITLY_OAUTH_1.png "BITLY_OAUTH_1")

#### 1-3. アクセストークン取得

登録に成功して表示されたページの "Generic Access Token" 欄に表示されているのが自分のアクセストークンであるので、控えておく。  
*作成されたアクセストークンはこの時に控えておかないと、後では確認できないような気がする（どこで確認できるのか分からなかった）*

![BITLY_OAUTH_2]({{site.baseurl}}/images/2013/07/16/BITLY_OAUTH_2.png "BITLY_OAUTH_2")

### 2. コマンドラインからアクセストークン取得

上記 1 の方法とは別に、コマンドラインから `curl` コマンドを使用してアクセストークンを取得することもできる。  
以下のように実行して、出力された文字列がアクセストークンである。（文字列の最後に `%` が付与されているかもしれないが、この `%` を除いた文字列がアクセストークンである）

``` bash 
$ curl -u "username:password" -X POST "https://api-ssl.bitly.com/oauth/access_token"
```

### 3. Web アプリケーション用アクセストークン取得

Web アプリケーション用のアクセストークンは、また別の方法（リダイレクト URL を設定したりする方法）があるようだ。  
当方は今のところ Web アプリケーションでの利用は考えていないので、この方法は未確認。

### 4. 注意

何回もアクセストークンを生成すると、過去に生成したアクセストークンは無効になる。  
生成したアクセストークンを確認できる場所が見当たらないのは、その都度生成しなければならないという意味なのかもしれない。

また、アクセストークンを生成すると、[Settings] - [CONNECTED ACCOUNTS] に "Other connected applications" として OAuth 認証による接続が確立されている旨が表示される。  
ここに "Disconnect" というリンクが有り、これをクリックすると当然 OAuth 認証による接続が切断される。  
再度、OAuth 認証による接続を行うには、アクセストークンも再度生成しなければならないようだ。

![BITLY_OAUTH_3]({{site.baseurl}}/images/2013/07/16/BITLY_OAUTH_3.png "BITLY_OAUTH_3")

### 参考サイト

- [Authentication - bitly API Documentation](http://dev.bitly.com/authentication.html "Authentication - bitly API Documentation")

---

これで、このアクセストークンを使って bitly API で OAuth 認証ができるようになります。

以上。

