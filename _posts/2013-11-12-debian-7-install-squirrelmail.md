---
layout   : single
title    : "Debian 7 Wheezy - Web メールシステム SquirrelMail インストール！"
published: true
date     : 2013-11-12 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 7 Wheezy サーバに Web メールシステム SquirrelMail をインストール・設定する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- Web サーバは Apache2 を想定。
- SMTP サーバ Postfix 構築済み。
- IMAP サーバ Dovecot 構築済み。
- SMTP, IMAP サーバ名はともに `mail.mk-mode.com` を想定。
- ドメイン名は `mk-mode.com` を想定。
- ネットワークは `192.168.11.0/24` を想定

### 1. SquirrelMail インストール

SquirrelMail とプラグインを以下のようにしてインストールする。

``` text 
# aptitude -y install squirrelmail squirrelmail-compatibility squirrelmail-secure-login squirrelmail-decode
```

### 2. SquirrelMail 設定

設定用スクリプトを実行して各種設定を行う。

``` text 
# /etc/squirrelmail/conf.pl
```

以下、入力部分のみ箇条書き。

- `Main Menu` で `1`(Organization Preferences) を選択。
- `Organization Preferences` で `5`(Signout Page) を選択。
- ログアウト時に表示するページとして `/webmail` と入力。
- `r` で `Main Menu` へ戻る。
- `Main Menu` で `2`(Server Settings) を選択。
- `Server Settings - General` で `1`(Domain) を選択。
- ドメイン名として `mk-mode.com` と入力。
- `Server Settings - General` で `A`(Update IMAP Settings) を選択。
- `Server Settings - IMAP Settings` で `4`(IMAP Server) を選択。
- IMAP サーバ名として `mail.mk-mode.com` と入力。
- `Server Settings - IMAP Settings` で `8`(Server software) を選択。
- IMAP サーバソフト名として `dovecot` と入力。
- `Server Settings - IMAP Settings` で `B`(Update SMTP Settings) を選択。
- `Server Settings - SMTP Settings` で `4`(SMTP Server) を選択。
- SMTP サーバ名として `mail.mk-mode.com` と入力。
- `Server Settings - SMTP Settings` で `7`(SMTP Authentication) を選択。
- `Try to detect auth mechanisms? [y/N]` で `y` と入力。
- `none, login, plain, cram-md5, or digest-md5 [none]` で `login` と入力。
- `SMTP connections? [y/N]` で `n` と入力。
- `r` で `Main Menu` へ戻る。
- `Main Menu` で `10`(Languages) を選択。
- `Language preferences` で `1`(Default Language) を選択。
- 言語として `ja_JP` と入力。
- `Language preferences` で `2`(Default Charset) を選択。
- 文字コードとして `iso-2022-jp` と入力。
- `r` で `Main Menu` へ戻る。
- `Main Menu` で `4`(General Options) を選択。
- `General Options` で `7`(Hide SM attributions) を選択。
- `Hide SM attributions (y/n) [n]` で `y` と入力。
- `r` で `Main Menu` へ戻る。
- `Main Menu` で `8`(Plugins) を選択。
- `Plugins` で `7`(delete_move_next) を選択。（番号は環境により異なる！）
- `Plugins` で `15`(newmail) を選択。（番号は環境により異なる！）
- `Plugins` で `8`(compatibility) を選択。（番号は環境により異なる！）
- `q` で終了。
- `y` で書き込み。

### 3. 設定ファイル編集

上記の設定の他に設定ファイル "SquirrelMail.conf" を以下のように作成する。

File: `/etc/apache2/conf.d/SquirrelMail.conf`

{% highlight bash linenos %} 
Alias /webmail /usr/share/squirrelmail
<Location /webmail>
    Order Deny,Allow
    Deny from all
    Allow from 127.0.0.1 192.168.11.0/24  # <= アクセスを許可するIPアドレス
</Location>
{% endhighlight %}

### 4. Apache2 再起動

設定を有効化するために Apache2 を再起動する。

``` text
# /etc/init.d/apache2 restart
Restarting web server: apache2 ... waiting .
```

### 5. 動作確認

ブラウザで `https://＜Webサーバのホスト名 or IP アドレス＞/webmail` にアクセスしてみる。  
SSL 認証を通して以下のように表示されれば成功である。ユーザ名・パスワードを入力してログインしてみる。

![DEBIAN_WEBMAIL_1]({{site.baseurl}}/images/2013/11/12/DEBIAN_WEBMAIL_1.png "DEBIAN_WEBMAIL_1")
![DEBIAN_WEBMAIL_2]({{site.baseurl}}/images/2013/11/12/DEBIAN_WEBMAIL_2.png "DEBIAN_WEBMAIL_2")

---

以上。

