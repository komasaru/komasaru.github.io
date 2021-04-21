---
layout   : single
title    : "Debian 8 (Jessie) - rootkit 検出ツール chkrootkit インストール！"
published: true
date     : 2015-05-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 8 (Jessie) に rootkit 検出ツール chkrootkit をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* 接続元のマシンは Linux Mint 17.1(64bit) を想定。
* chkrootkit が検知できるのは既知の rootkit のみであり、新規の rootkit は検知できない、ということを認識しておく。
* chkrootkit では誤検知もあるので、検知結果は参考程度に留める。
* コマンド自体が改竄されてからでは遅いので、OS インストール直後に行うのがよい。

### 1. chkrootkit のインストール

``` text
# apt-get -y install chkrootkit
```

### 2. chkrootkit の実行

以下のようにして chkrootkit を実行してみる。  
問題のある（"INFECTED" の）場合のみ出力する。

``` text
# chkrootkit | grep INFECTED
Checking `bindshell'...                                     INFECTED (PORTS:  465)
```

通常は何も出力されないはずだが、Postfix で SSL 設定をした後だと、上記のように誤った検出をするようだ。これは気にしなくてよい。

### 3. 自動実行用スクリプトの作成

定時実行用にシェルスクリプトを以下のように作成する。  
以下では、Postfix で SSL 設定している場合の誤検知は除外するようにしている。

File: `chkrootkit`

{% highlight bash linenos %}
#!/bin/bash

PATH=/usr/bin:/bin:/usr/sbin

TMPLOG=`mktemp`

# chkrootkit 実行
chkrootkit > $TMPLOG

# ログ出力
cat $TMPLOG | logger -t chkrootkit

# SMTPS の bindshell 誤検知対応
if [ ! -z "$(grep 465 $TMPLOG)" ] && \
   [ -z $(lsof -i:465|grep bindshell) ]; then
        sed -i '/465/d' $TMPLOG
fi

# rootkit 検知時のみ root 宛メール送信
[ ! -z "$(grep INFECTED $TMPLOG)" ] && \
grep INFECTED $TMPLOG | mail -s "chkrootkit report in `hostname`" root

rm -f $TMPLOG
{% endhighlight %}

シェルスクリプト内でファイルを開いているプロセス情報を表示するコマンド `lsof` を使用するので、未インストールなら `apt-get install lsof` でインストールしておく。

また、スクリプト内のメール送信コマンド `mail` が使用できない場合は、`mailutils` or `heirloom-mailx` or `bsd-mailx` 等をインストールする。複数ある場合は、`update-alternatives --config mailx` でデフォルト設定をする。（ちなみに当方は、 `mailutils` ではドメインを指定しないとメール送信ができなかったり、依存するパッケージが多いので、 `bsd-mailx` をインストールして使用している）

### 4. 自動実行用スクリプトに実行権限を付与

``` text
# chmod 700 chkrootkit
```

### 5. 自動実行の設定

毎日自動実行されるよう cron に登録する。

``` text
# mv chkrootkit /etc/cron.daily/
```

これで、rootkit が仕掛けられていた場合に root 宛にメールが届くようになる。

---

以上。

