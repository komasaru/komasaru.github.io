---
layout   : single
title    : "CentOS 6.5 - Usermin で Vacation 設定！"
published: true
date     : 2014-01-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

前回は CentOS 6.5 サーバ上でユーザ管理ツール Usermin の導入を行いました。  
今回は Usermin でメール自動返信 Vacation を利用する設定を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- メールサーバ構築済みであること。
- Vacation 導入済み。
- Usermin 導入済み。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. Usermin::Vacation アーカイブダウンロード

Usermin::Vacation のアーカイブをダウンロードして展開する。

``` text
# wget http://jaist.dl.sourceforge.net/sourceforge/userminvacation/usermin_vacation-0.9.tar.gz
# tar zxvf usermin_vacation-0.9.tar.gz
```

### 2. Usermin::Vacation ディレクトリコピー

展開した Usermin::Vacation のディレクトリを所定のディレクトリへコピーする。

``` text
# cp -r vacation/ /usr/libexec/usermin/
```

### 3. Usermin::Vacation 設定ファイルコピー

Usermin::Vacation 設定ファイルを格納するディレクトリを作成し、Usermin::Vacation 設定ファイルをコピーする。

``` text
# mkdir /etc/usermin/vacation
# cp vacation/config /etc/usermin/vacation/
```

### 4. 後始末

``` text
# rm -rf vacation/
# rm -f usermin_vacation-0.9.tar.gz
```

### 5. Usermin::Vacation 設定ファイル編集

File: `/etc/usermin/vacation/config`

{% highlight bash linenos %}
vacation_path=/usr/bin/vacation  # <= 変更
{% endhighlight %}

### 6. Usermin 設定ファイル編集

File: `/etc/usermin/webmin.acl`

{% highlight bash linenos %}
user: changepass forward vacation  # <= 変更（"vacation" 追加）
{% endhighlight %}

### 7. Usermin 再起動

``` text
# /etc/rc.d/init.d/usermin restart
Stopping Usermin server in /usr/libexec/usermin
Starting Usermin server in /usr/libexec/usermin
Pre-loaded WebminCore
```

### 8. 日本語対応

以下は日本語対応する場合の作業。

#### 8-1. save_vacation.cgi 編集

``` text
# cd /usr/libexec/usermin/vacation/
```

File: `save_vacation.cgi`

{% highlight bash linenos %}
#open(VACATION, ">$vacation_file");
open(VACATION, "| /usr/bin/nkf -j >$vacation_file");  # <= 変更（自動返信メッセージをJISに変換して保存）
{% endhighlight %}

#### 8-2. index.cgi 編集

File: `index.cgi`

{% highlight bash linenos %}
        #open(VACATION, $vacation_file);
        open(VACATION, "/usr/bin/nkf -e $vacation_file |");  # <= 変更（自動返信メッセージをEUCに変換して取得）
{% endhighlight %}

#### 8-3. en.org 作成

``` text
# cd lang/
```

File: `en.org`

{% highlight bash linenos %}
index_title=メール自動返信
index_desc=自動返信するメッセージを設定してください.
subject_desc=件名:
subject_text=Re:$SUBJECT
from_desc=送信元:
body_desc=メッセージ:
body_text=私はただ今留守にしています。戻りましたらメールを送信します。
vacation_enable=設定する
vacation_disable=解除する
vacation_update=メッセージを更新する
{% endhighlight %}

#### 8-4. en.org の EUC 変換

``` text
# nkf -e en.org > en
# cd ..
```

#### 8-5. module.info.org 編集

まず、"module.info" をリネームしてオリジナルファイルを作成する。

``` text
# mv module.info module.info.org
```

そして、"module.info.org" を編集する。

File: `module.info.org`

{% highlight bash linenos %}
#desc=Vacation Auto-Reply
desc=メール自動返信  # <= 変更
{% endhighlight %}

#### 8-6. module.info.org の EUC 変換

``` text
# nkf -e module.info.org > module.info
# cd
```

### 9. 動作確認

ブラウザで `https:/＜サーバ名＞:20000/` にアクセスし、メニューに「メール転送」が追加されていること、正常に動作することなどを確認する。  

![CENTOS_6-5_USERMIN_3]({{site.baseurl}}/images/2014/01/22/CENTOS_6-5_USERMIN_3.png "CENTOS_6-5_USERMIN_3")

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、Web メールシステム SquirrelMail の導入について紹介する予定です。

以上。

