---
layout   : single
title    : "CentOS 6.5 - rootkit 検知ツール（chkrootkit）導入！"
published: true
date     : 2013-12-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

前回は CentOS 6.5 サーバにファイル改ざん検知システム Tripwire の導入を行いました。  
今回は rootkit 検知ツール chkrootkit の導入を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- [CentOS 6.5 - 初期設定！]( "CentOS 6.5 - 初期設定！") 内のとおり EPEL リポジトリの導入を行なっている。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. chkrootkit インストール

rootkit 検知ツール chkrootkit を以下のようにしてインストールする。  
（当記事執筆時点では RPMforge リポジトリには存在しなかったので、 EPEL リポジトリを使用）

``` text
# yum --enablerepo=epel -y install chkrootkit
```

### 2. chkrootkit 実行

chkrootkit を実行して確認してみる。

``` text
# chkrootkit | grep INFECTED
```

仮にこの作業よりも前に DNS サーバ BIND をインストール済みの場合、以下のようなメッセージが出力されるかもしれないが、誤検知らしいの無視してよい。

``` text
"Checking `bindshell'... INFECTED (PORTS: 465)
```

### 3. chkrootkit 実行スクリプト作成

chkrookit 実行用スクリプトを以下のように作成する。

File: `chkrootkit`

{% highlight bash linenos %}
#!/bin/bash

PATH=/usr/bin:/bin

TMPLOG=`mktemp`

# chkrootkit実行
chkrootkit > $TMPLOG

# ログ出力
cat $TMPLOG | logger -t chkrootkit

# SMTPSのbindshell誤検知対応
if [ ! -z "$(grep 465 $TMPLOG)" ] && \
   [ -z $(/usr/sbin/lsof -i:465|grep bindshell) ]; then
        sed -i '/465/d' $TMPLOG
fi

# rootkit検知時のみroot宛メール送信
[ ! -z "$(grep INFECTED $TMPLOG)" ] && \
grep INFECTED $TMPLOG | mail -s "chkrootkit report in `hostname`" root

rm -f $TMPLOG
{% endhighlight %}

### 4. chkrootki 実行権限付与

作成した実行スクリプトの実行権限を付与する。

``` text
# chmod 700 chkrootkit
```

### 5. 自動実行設定

毎日自動的に実行されるよう作成した実行するクリプトを cron ディレクトリへ移動する。

``` text
# mv chkrootkit /etc/cron.daily/
```

### 6. chrootkit 安全化設定

chrootkit が使用するコマンド群が既に改ざんされていた場合は chrootkit が効かないので、コマンド群を別の場所に退避させておき、必要な場合にそのコマンドを使用するよう設定する。

``` text
# mkdir chkrootkitcmd   # <= コマンド群退避先ディレクトリ作成
# cp `which --skip-alias awk cut echo egrep find head id ls netstat ps strings sed uname` chkrootkitcmd/
                        # <= コマンド群を退避先ディレクトリへコピー
# chkrootkit -p /root/chkrootkitcmd|grep INFECTED
                        # <= 退避したコマンド群を使用して chkrootkit 実行
# zip -r chkrootkitcmd.zip chkrootkitcmd/  # <= コマンド群退避先ディレクトリ圧縮
  adding: chkrootkitcmd/ (stored 0%)
  adding: chkrootkitcmd/ps (deflated 60%)
  adding: chkrootkitcmd/sed (deflated 55%)
  adding: chkrootkitcmd/strings (deflated 60%)
  adding: chkrootkitcmd/awk (deflated 52%)
  adding: chkrootkitcmd/cut (deflated 54%)
  adding: chkrootkitcmd/id (deflated 59%)
  adding: chkrootkitcmd/ls (deflated 57%)
  adding: chkrootkitcmd/netstat (deflated 58%)
  adding: chkrootkitcmd/uname (deflated 58%)
  adding: chkrootkitcmd/head (deflated 56%)
  adding: chkrootkitcmd/echo (deflated 59%)
  adding: chkrootkitcmd/egrep (deflated 50%)
  adding: chkrootkitcmd/find (deflated 52%)

# rm -rf chkrootkitcmd  # <= コマンド群退避先ディレクトリ削除
```

念の為圧縮したコマンド群を確実に退避させるためにメール送信するが、そのためのツール "sharutils(uuencode)" をインストールする。

``` text
# yum -y install sharutils
```

そして、圧縮したコマンド群を root 宛にメール送信する。
（不測の事態時にはこの圧縮ファイルから復元する）

``` text
# uuencode chkrootkitcmd.zip chkrootkitcmd.zip|mail root
```

メール送信したら圧縮したコマンド群は不要なので削除しておく。

``` text
# rm -f chkrootkitcmd.zip
```

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、アンチウィルスソフト Clam AntiVirus の導入について紹介する予定です。

以上。

