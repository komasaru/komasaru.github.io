---
layout   : single
title    : "CentOS 7.0 - Usermin で Vacation 設定！"
published: true
date     : 2014-09-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

「CentOS 7.0 - Usermin で Vacation 設定」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- メールサーバ構築済みであること。
- Web サーバは Apache ではなく Nginx を想定。
- Vacation 導入済み。
- Usermin 導入済み。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. Usermin::Vacation アーカイブダウンロード

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
# systemctl restart usermin
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

![CENTOS_7-0_USERMIN_VACATION]({{site.baseurl}}/images/2014/09/17/CENTOS_7-0_USERMIN_VACATION.png "CENTOS_7-0_USERMIN_VACATION")

---

以上。

