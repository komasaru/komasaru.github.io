---
layout   : single
title    : "vsftpd - Over SSL/TLS 設定すると FileZilla でエラー！"
published: true
date     : 2015-01-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- FTP
- Debian
---
こんにちは。

普段は自宅サーバ上でのファイルのアップロード・ダウンロードは FileZilla で SSH(SFTP) 接続で行なっているため、 FTP サーバを使用することはありませんが、一時的に FTP サーバ(+SSL)で使用したい事案が発生した場合にそなえて準備だけはしておきたいと考えています。

しかし、Linux で vsftpd サーバを構築後 Over SSL/TLS 設定を行うと、 FTP クライアント FileZilla の「**新しいバージョン**」から接続できないのです。

以下、それについての記録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 7.8.0 上に構築した vsftpd サーバを想定。
* vsftpd サーバの構築は当ブログ過去記事「[Debian 7 Wheezy - FTP サーバ構築！]({{site.baseurl}}/2013/10/19/debian-7-install-vsftp/ "Debian 7 Wheezy - FTP サーバ構築！")」のとおりに行なっていることを想定。
* クライアント側で使用する FileZilla のバージョンは 3.7.3 を想定。
* 転送モードは Active を想定（サーバ側で Passive 設定していない）

### 1. 現象

FileZilla で以下のような設定で接続しようとすると、

* ホスト： vsftpd サーバの IP アドレス or ホスト名
* ポート： 21
* プロトコル： 「FTP - ファイル転送プロトコル」
* 暗号化： 「明示的な FTP over TLS が必要」

次のようなエラーとなる。（FileZilla のメッセージログ）  
接続の確立は成功するが、 TLS の初期化に失敗している。

``` text
状態:　　　  再試行を待機中...
状態:　　　  192.168.11.102:21 に接続中...
状態:　　　  接続を確立しました, ウェルカム メッセージを待っています...
レスポンス:  220 (vsFTPd 2.3.5)
コマンド:　  AUTH TLS
レスポンス:  234 Proceed with negotiation.
状態:　　　  TLS を初期化しています...
エラー:　　  GnuTLS error -12: A TLS fatal alert has been received.
エラー:　　  サーバに接続できませんでした
```

### 2. 原因

以下のバグリポートによると、「"DES-CBC3-SHA" という暗号スイートが FileZilla のサポートしてないものであるため」のようだ。

さらに、このバグリポートには FileZilla 3.5.3 と 3.6.0.1 でこのエラーが発生すると記載されているが、今回の当方の 3.7.3 でも同じ現象に陥るということは、より新しいバージョンの FileZilla でもまだ対策が取られていないようだ。

* [#7873 ("GnuTLS error -12: A TLS fatal alert has been received." + "no shared cipher") – FileZilla](http://trac.filezilla-project.org/ticket/7873 "#7873 （'GnuTLS error -12: A TLS fatal alert has been received.' + 'no shared cipher'） – FileZilla")

### 3. 対策

バグリポートにも記載されているとおり、 vsftpd サーバの設定ファイルに以下の１行を追記して vsftpd サーバを再起動すればよい。

File: `/etc/vsftpd.conf`

{% highlight bash linenos %}
ssl_ciphers=HIGH
{% endhighlight %}

これで、 FiliZilla から FTP サーバへ接続できるはず。  
それでも接続できない場合は「転送モード」が正しくないかも知れないので、確認・変更してみるとよいだろう。

---

普段 SSH 接続(SFTP) ばかりでしたので、３年くらい前に掲載されていたバグリポートに今更気付いた次第です。

それにしても、FTP クライアントのためにサーバの設定を変更しないといけないのも考えものではないかと思ってしまう。

以上。

