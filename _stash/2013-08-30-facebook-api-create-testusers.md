---
layout   : single
title    : "Facebook API - テストユーザ作成！"
published: true
date     : 2013-08-30 00:20:00 +0900
comments : true
categories:
- SNS
tags:
- Facebook
---

Facebook API を利用して Facebook アプリを作成したり Facebook から情報を取得する際に、既存の自分のアカウントで何度もテストを行なっていると、アクセス制限に引っかかりアカウントが一時凍結される可能性があります。  
（ちなみに、「アクセス制限は、１組のアクセストークン＆IPアドレス当たり600秒（10分）に600回」という情報がありますが、真実は不明です。また、API 呼び出しが１日に１億回を超えるような場合は別の規定が適用されるようです。さらに、テストユーザーのアクセス制限についても不明です。）

<!--more-->

かと言って、実在しない人物のアカウントを作成することは認められていないため、開発用であっても Twitter のように何個もアカウント作成することもできません。

そこで、Facebook にはテストユーザーという Facebook アプリに紐付いたテスト専用のアカウントを作成することが可能になっています。

以下、テストユーザー作成方法についての記録です。

#### 0. 前提条件

* 当然 Facebook アカウント取得済み。
* 当然 Facebook アプリ作成済み。
* テストユーザーには以下のような機能があることを認識しておく。
  - 紐付いている Facebook アプリにアクセスできる。
  - テストユーザー同士で友人になることができる。
  - テストユーザーは複数作成できる（１つの Facebook アプリにつき 2,000 まで）
* テストユーザーには以下のような制限事項があることを認識しておく。
  - 一般ユーザーと友人になることができない。
  - Facebook ページを作ることができない。
  - 後で一般アカウントに切り換えることができない。
* Facebook 仕様についての記述は、当記事執筆時点の情報。
* **Facebook API は非常に頻繁に仕様変更があるため、当記事の内容が通用しなくなる可能性は非常に大きい。**

#### 1. 画面でのテストユーザー作成

「[facebook developers](https://developers.facebook.com/apps/ "facebook developers")」の画面でテストユーザーを作成する方法について至極簡単に説明する。

【１】アプリ管理画面でテストユーザーを作成したいアプリのページを表示する。

![FB_API_TESTUSERS_1]({{site.baseurl}}/images/2013/08/30/FB_API_TESTUSERS_1.png "FB_API_TESTUSERS_1")

【２】「役割」欄の「役割を編集」から「役割」画面へ進み、「テストユーザー」欄の「作成」でテストユーザを作成する。（「このアプリを承認」オプションはアクセストークンを生成するためには必要なので、チェックを入れる。）

![FB_API_TESTUSERS_2]({{site.baseurl}}/images/2013/08/30/FB_API_TESTUSERS_2.png "FB_API_TESTUSERS_2")

【３】テストユーザー作成に成功すると、"Successfully added 1 test user!" と表示される。

![FB_API_TESTUSERS_3]({{site.baseurl}}/images/2013/08/30/FB_API_TESTUSERS_3.png "FB_API_TESTUSERS_3")

【４】テストユーザー欄にユーザーが追加れた。「変更」でID・ユーザー名・Email の確認ができ、ユーザー名・パスワードの変更も可能である。"Show Token" で User Access Token が表示される。

![FB_API_TESTUSERS_4]({{site.baseurl}}/images/2013/08/30/FB_API_TESTUSERS_4.png "FB_API_TESTUSERS_4")

#### 2. HTTP リクエストによるテストユーザー作成

前述の画面でのテストユーザーの作成方法とは別に、HTTP リクエストによるテストユーザーの作成も可能である。

以下のような URL で HTTP リクエストを送信すると、テストユーザーが作成されてレスポンスが返ってくる。（以下の URL は実際は１行）

``` text 
https://graph.facebook.com/APP_ID/accounts/test-users?
        installed=true&
        permissions=read_stream&
        method=post&
        access_token=APP_ACCESS_TOKEN
```

`APP_ID` は Facebook アプリの ID、`APP_ACCESS_TOKEN` は Facebook アプリの App Token(User Token ではない。「[トークンツールにアクセス- Facebook Developers](https://developers.facebook.com/tools/access_token/ "トークンツールにアクセス- Facebook Developers")」で確認可能)。  
`&name=FULL_NAME` でユーザ名、`&locale=en_US` でロケールも設定可能。

上記のような URL をブラウザに入力すると、以下のような結果が表示される。  
ブラウザでなくても、Linux の `curl` コマンド等でもOK.

``` text 
{
   "id": "9999999999999999",
   "access_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
   "login_url": "https://www.facebook.com/platform/test_account_login.php?user_id=99999999999999&n=XXXXXXXXXXXXXX",
   "email": "xxxxxxxxxxxxxxxx\u0040tfbnw.net",
   "password": "xxxxxxxxxxx"
}
```

#### 参考サイト

- [Test Users - Facebook開発者](https://developers.facebook.com/docs/test_users/ "Test Users - Facebook開発者")

---

これで、Facebook アプリ開発の際にアクセス制限を気にすることなく思う存分テストができるかと思います。

以上。

