---
layout   : single
title    : "CentOS 7.0 - rootkit 検知ツール chkrootkit 導入！"
published: true
date     : 2014-08-07 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

「CentOS 7.0 - rootkit 検知ツール chkrootkit 導入」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. chkrootkit インストール

rootkit 検知ツール chkrootkit を以下のようにしてインストールする。  
（当記事執筆時点では RPMforge, EPEL リポジトリには存在しないためソースをビルドしてインストールする）

``` text
# wget ftp://ftp.pangeia.com.br/pub/seg/pac/chkrootkit.tar.gz  # <= アーカイブダウンロード
# tar zxvf chkrootkit.tar.gz                                   # <= アーカイブ展開
# mkdir -p ~/bin                                               # <= bin ディレクトリ作成
# mv chkrootkit-0.50/chkrootkit ~/bin                          # <= ディレクトリ移動
# rm -rf chkrootkit-0.50/                                      # <= 後始末
# rm -f chkrootkit.tar.gz                                      # <= 後始末
```

### 2. chkrootkit 実行

``` text
# chkrootkit | grep INFECTED
Searching for Suckit rootkit... Warning: /sbin/init INFECTED
```

上記のように検知されてもこれはご検知なのでここでは無視してよい。（次項で対応）  
また、仮にこの作業よりも前に DNS サーバ BIND をインストール済みの場合、以下のようなメッセージが出力されるかもしれないが、これも誤検知らしいの無視してよい。

``` text
"Checking `bindshell'... INFECTED (PORTS: 465)
```

### 3. chkrootkit 実行スクリプト作成

毎日自動実行されるディレクトリの中に作成する。

File: `/etc/cron.daily/chkrootkit`

{% highlight bash linenos %}
#!/bin/bash

PATH=/usr/bin:/bin:/root/bin

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

# upstartパッケージ更新時のSuckit誤検知対応
if [ ! -z "$(grep Suckit $TMPLOG)" ] && \
   [ -z $(rpm -V `rpm -qf /sbin/init`) ]; then
        sed -i '/Suckit/d' $TMPLOG
fi

# rootkit検知時のみroot宛メール送信
[ ! -z "$(grep INFECTED $TMPLOG)" ] && \
grep INFECTED $TMPLOG | mail -s "chkrootkit report in `hostname`" root

rm -f $TMPLOG
{% endhighlight %}

### 4. chkrootkit 実行権限付与

``` text
# chmod 700 /etc/cron.daily/chkrootkit
```

### 5. chrootkit 安全化設定

chrootkit が使用するコマンド群が既に改ざんされていた場合は chrootkit が効かないので、コマンド群を別の場所に退避させておき、必要な場合にそのコマンドを使用するよう設定する。

``` text
# mkdir chkrootkitcmd                      # <= コマンド群退避先ディレクトリ作成
# cp `which --skip-alias awk cut echo egrep find head id ls netstat ps strings sed ssh uname` chkrootkitcmd/
                                           # <= コマンド群を退避先ディレクトリへコピー
# chkrootkit -p /root/chkrootkitcmd|grep INFECTED
                                           # <= 退避したコマンド群を使用して chkrootkit 実行
# zip -r chkrootkitcmd.zip chkrootkitcmd/  # <= コマンド群退避先ディレクトリ圧縮
# rm -rf chkrootkitcmd                     # <= コマンド群退避先ディレクトリ削除
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

---

以上。

