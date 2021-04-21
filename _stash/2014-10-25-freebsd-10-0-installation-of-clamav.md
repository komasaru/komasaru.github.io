---
layout   : single
title    : "FreeBSD 10.0 - アンチウイルス Clam Antivirus インストール！"
published: true
date     : 2014-10-25 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- ウイルス対策
---

「FreeBSD 10.0 - アンチウイルス Clam Antivirus インストール」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* ログローテションをするので logrotate がインストール済みであること。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. Clam Antivirus インストール

``` text
# cd /usr/ports/security/clamav
# make BATCH=yes install clean
# rehash
# cd
```

### 2. 設定ファイル編集

まず、 "clamd.conf" に書き込み権限付与して編集。

``` text
# chmod 640 /usr/local/etc/clamd.conf
```

File: `/usr/local/etc/clamd.conf`

{% highlight bash linenos %}
LogTime yes     # <= コメント解除（ログに時間も出力）

#User clamav    # <= コメント化（root 権限で動作させる）
{% endhighlight %}

次に、 "freshclam.conf" に書き込み権限を付与して編集。

``` text
# chmod 640 /usr/local/etc/freshclam.conf
```

File: `/usr/local/etc/freshclam.conf`

{% highlight bash linenos %}
#DatabaseOwner clamav
DatabaseOwner root                   # <= 変更（root 権限で動作させる）

#DatabaseMirror database.clamav.net
DatabaseMirror db.jp.clamav.net      # <= 変更（ミラーサイト変更）
{% endhighlight %}

### 3. Freshclam, Clam Antivirus 起動

まず、 "rc.conf" を編集。

File: `/etc/rc.conf`

{% highlight bash linenos %}
clamav_clamd_enable="YES"      # <= 追加
clamav_freshclam_enable="YES"  # <= 追加
{% endhighlight %}

そして、 clamd と freshclam を起動。

``` text
# /usr/local/etc/rc.d/clamav-clamd start
Starting clamav_clamd.

# /usr/local/etc/rc.d/clamav-freshclam start
Starting clamav_freshclam.
```

### 4. ウイルスデータベース更新

``` text
# freshclam
ClamAV update process started at Sun Oct  5 23:35:10 2014
main.cvd is up to date (version: 55, sigs: 2424225, f-level: 60, builder: neo)
Downloading daily.cvd [100%]
daily.cvd updated (version: 19476, sigs: 1180594, f-level: 63, builder: neo)
bytecode.cvd is up to date (version: 242, sigs: 46, f-level: 63, builder: dgoddard)
Database updated (3604865 signatures) from db.jp.clamav.net (IP: 218.44.253.75)
Clamd successfully notified about the update.
```

### 5. スキャンテスト

``` text
# clamscan --infected --remove --recursive

----------- SCAN SUMMARY -----------
Known viruses: 3599305
Engine version: 0.98.4
Scanned directories: 1
Scanned files: 8
Infected files: 0
Data scanned: 0.01 MB
Data read: 0.00 MB (ratio 2.00:1)
Time: 11.753 sec (0 m 11 s)
```

`Infected files: 0` ならウイルスは検出されなかったということ。

### 6. 定期実行設定

以下の内容のファイルを作成。

File: `/etc/periodic/daily/600.clamscan`

{% highlight bash linenos %}
#!/bin/sh

/usr/local/bin/clamscan -i -r --remove /home >> /var/log/clamav/clamscan.log 2>&1
{% endhighlight %}

そして、実行権限を付与。

``` text
# chmod 755 /etc/periodic/daily/600.clamscan
```

### 7. ログローテーション設定

以下の内容のファイルを作成。

File: `/usr/local/etc/logrotate.d/clamav`

{% highlight bash linenos %}
/var/log/clamav/clamscan.log{
    monthly
    rotate 4
    missingok
}
{% endhighlight %}

---

以上。

