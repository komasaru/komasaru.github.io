---
layout   : single
title: 'LMDE2 - cron で SSH 越しに rsync 同期できない！'
published: true
date     : 2017-07-06 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- LMDE2
- LinuxMint
- SSH
- rsync
---

LMDE2(Linux Mint Debian Edition 2) 上の cron で SSH 越しに rsync 同期できない場合についての記録です。

よくある「rsync 時に、 ssh に関する記述（オプション）を追加しろ」という話ではなく、そうした上で、同期できない場合の対処法についてです。（但し、 LMDE2 限定）

<!--more-->

### 0. 前提条件

* リモート側は Debian GNU/Linux 8.6(64bit) を想定。  
  （SSH サーバ構築済みで、ローカルからの SSH 接続（公開鍵認証）も正常に行えること）
* ローカル側は LMDE2 (Linux Mint Debian Edition 2; 64bit) を想定。
* リモート側のディレクトリをローカル側から引っ張る形で同期する。

### 1. 準備

まず、以下のような bash スクリプトを作成する。

Rsync で、リモートの foo ユーザ "bak" ディレクトリ配下のファイルをローカルの foo ユーザ "bak/server/" 配下へ同期（但し、パーミッション、所有者情報、グループ情報は含めない）するスクリプト。（`-e "ssh ..."` の部分は、公開鍵認証で秘密鍵、ポートを指定する部分）

File: `rsync_bak_from_server.sh`

{% highlight bash linenos %}
#!/bin/bash

rsync -auv --no-p --no-o --no-g --delete -e "ssh -i /home/foo/.ssh/id_rsa -p 9999" foo@server:~/bak/* /home/foo/bak/server/
{% endhighlight %}

このスクリプトの所有者・グループを設定し、実行権限を付与する。

``` text
$ sudo chown foo. rsync_bak_from_server.sh
$ sudo chmod +x rsync_bak_from_server.sh
```

当然ながら、このスクリプトを手動で実行して正常に動作することを確認しておく。

そして、このスクリプトが定時実行されるよう cron に登録する。  
（以下は、毎時55分にローカルユーザで実行する例で、後半の `> /home/...` はログを確認するためのテスト用。メール(MTA)を送信できる環境なら、メールを送信するようにしてもよいだろう）

File: `/etc/cron.d/my_cron`

{% highlight bash linenos %}
55 * * * * foo /home/foo/rsync_bak_from_server.sh > /home/foo/cron.log 2>&1
{% endhighlight %}

### 2. 現象

cron が実行された際に以下のようなエラーが発生する。

File: `~/cron.log`

{% highlight text linenos %}
Permission denied (publickey).
rsync: connection unexpectedly closed (0 bytes received so far) [Receiver]
rsync error: unexplained error (code 255) at io.c(226) [Receiver=3.1.1]
{% endhighlight %}

### 3. 原因

色々と調査してみた結果、環境変数 `SSH_AUTH_SOCK` の値が、 cron に引き継がれないため。（cron は、元々最小限の環境変数しか引き継がれない）

### 4. 対策

cron 設定ファイルで `SSH_AUTH_SOCK` を設定すればよい。

まず、環境変数 `SSH_AUTH_SOCK` の値を確認してみる。

``` text
$ echo $SSH_AUTH_SOCK
/run/user/1000/keyring/ssh
```

`1000` は foo ユーザの UID なので、環境により異なる。  
また、今回はローカル側が LMDE2 であったが、 Debian 等ならこの値がログインする度に変わる可能性があるので、自動で取得するような仕組みにする必要がある。（必要であれば、別途お調べください）

この値を cron 設定ファイルで直接設定する。

File: `/etc/cron.d/my_cron`

{% highlight bash linenos %}
SSH_AUTH_SOCK=/run/user/1000/keyring/ssh
55 * * * * foo /home/foo/rsync_bak_from_server.sh > /home/foo/cron.log 2>&1
{% endhighlight %}

---

これで、 Rsync + SSH + cron で自動バックアップが可能になりました。

以上。

