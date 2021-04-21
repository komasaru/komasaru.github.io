---
layout   : single
title    : "CentOS 6.5 - ファイル改ざん検知システム（Tripwire）導入！"
published: true
date     : 2013-12-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

前回は CentOS 6.5 サーバに NTP サーバをインストールしました。  
今回はファイル改ざん検知システム Tripwire の導入を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- Tripwire 2.4.2.2 をインストールする。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. アーカイブダウンロード

最新の Tripwire アーカイブファイルをダウンロード＆展開する。

``` text
# wget http://jaist.dl.sourceforge.net/sourceforge/tripwire/tripwire-2.4.2.2-src.tar.bz2

# tar jxvf tripwire-2.4.2.2-src.tar.bz2
```

### 2. Tripwireインストール

展開先ディレクトリへ移動して、インストールを実行する。

``` text
# cd tripwire-2.4.2.2-src

# ./configure --prefix=/usr/local/tripwire --sysconfdir=/etc/tripwire && make && make install

Press ENTER to view the License Agreement.  # <= 空ENTER

# ===< SPACEキー押下でライセンス表示を流す >===

Please type "accept" to indicate your acceptance of this
license agreement. [do not accept] accept   # <= "accept" 応答

Continue with installation? [y/n] y         # <= "y" 応答

Enter the site keyfile passphrase:          # <= 任意のサイトパスフレーズ応答
Verify the site keyfile passphrase:         # <= 確認入力

Enter the local keyfile passphrase:         # <= 任意のローカルパスフレーズ応答
Verify the local keyfile passphrase:        # <= 確認入力

Creating signed configuration file...
Please enter your site passphrase:          # <= サイトパスフレーズ応答

Creating signed policy file...
Please enter your site passphrase:          # <= サイトパスフレーズ応答

The installation succeeded.
```

### 3. 後始末

インストール後、展開先ディレクトリ・アーカイブファイルは不要なので削除しておく。

``` text
# cd
# rm -rf tripwire-2.4.2.2-src
# rm -f tripwire-2.4.2.2-src.tar.bz2
```

### 4. PATH 設定

".bashrc" に以下の記述を追加して、環境変数 PATH の設定を行う。

File: `.bashrc`

{% highlight bash linenos %}
PATH=$PATH:/usr/local/tripwire/sbin
{% endhighlight %}

以下で設定変更を即時に反映させる。

``` text
# source .bashrc
```

### 5. Tripwire 設定ファイル編集

Tripwire の設定ファイル "twcfg.txt" を以下のように編集する。

File: `/etc/tripwire/twcfg.txt`

{% highlight bash linenos %}
#LOOSEDIRECTORYCHECKING =false
LOOSEDIRECTORYCHECKING =true  # <= ファイル変更時に所属ディレクトリの変更を通知しない

#REPORTLEVEL   =3
REPORTLEVEL   =4              # <= リポートレベルの変更
{% endhighlight %}

### 6. Tripwire 設定ファイル暗号化

先ほど作成した設定ファイル "twcfg.txt" を暗号化する。

``` text
# twadmin -m F -c /etc/tripwire/tw.cfg -S /etc/tripwire/site.key /etc/tripwire/twcfg.txt
Please enter your site passphrase:            # <= サイトパスフレーズ応答
Wrote configuration file: /etc/tripwire/tw.cfg
```

暗号化したら、元のテキストファイル "twcfg.txt" は削除する。

``` text
# rm -f /etc/tripwire/twcfg.txt
```

ちなみに、暗号化した設定ファイルからテキストファイルを復元するには以下のようにする。

``` text
# twadmin -m f -c /etc/tripwire/tw.cfg > /etc/tripwire/twcfg.txt
```

### 7. ポリシーファイル作成

デフォルトのポリシーファイルでは不都合があるらしいので、以下のように新規に作成する。

File: `/etc/tripwire/twpolmake.pl`

{% highlight bash linenos %}
#!/usr/bin/perl
# Tripwire Policy File customize tool
# ----------------------------------------------------------------
# Copyright (C) 2003 Hiroaki Izumi
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
# ----------------------------------------------------------------
# Usage:
#    perl twpolmake.pl {Pol file}
# ----------------------------------------------------------------
#
$POLFILE=$ARGV[0];

open(POL,"$POLFILE") or die "open error: $POLFILE" ;
my($myhost,$thost) ;
my($sharp,$tpath,$cond) ;
my($INRULE) = 0 ;

while (<POL>) {
    chomp;
    if (($thost) = /^HOSTNAME\s*=\s*(.*)\s*;/) {
        $myhost = `hostname` ; chomp($myhost) ;
        if ($thost ne $myhost) {
            $_="HOSTNAME=\"$myhost\";" ;
        }
    }
    elsif ( /^{/ ) {
        $INRULE=1 ;
    }
    elsif ( /^}/ ) {
        $INRULE=0 ;
    }
    elsif ($INRULE == 1 and ($sharp,$tpath,$cond) = /^(\s*\#?\s*)(\/\S+)\b(\s+->\s+.+)$/) {
        $ret = ($sharp =~ s/\#//g) ;
        if ($tpath eq '/sbin/e2fsadm' ) {
            $cond =~ s/;\s+(tune2fs.*)$/; \#$1/ ;
        }
        if (! -s $tpath) {
            $_ = "$sharp#$tpath$cond" if ($ret == 0) ;
        }
        else {
            $_ = "$sharp$tpath$cond" ;
        }
    }
    print "$_\n" ;
}
close(POL) ;
{% endhighlight %}

### 8. ポリシーファイル最適化

そして、ポリシーファイルを最適化する。

``` text
# perl /etc/tripwire/twpolmake.pl /etc/tripwire/twpol.txt > /etc/tripwire/twpol.txt.new
```

### 9. ポリシーファイル暗号化

最適化したポリシーファイルを設定ファイル同様に暗号化する。

``` text
# twadmin -m P -c /etc/tripwire/tw.cfg -p /etc/tripwire/tw.pol -S /etc/tripwire/site.key /etc/tripwire/twpol.txt.new
Please enter your site passphrase:          # <= サイトパスフレーズ応答
Wrote policy file: /etc/tripwire/tw.pol
```

暗号が終了したら、もとのテキストファイルのポリシーファイルは削除する。

``` text
# rm -f /etc/tripwire/twpol.txt*
```

ちなみに、暗号化したポリシーファイルからテキストファイルを復元するには以下のようにする。

``` text
# twadmin -m p -c /etc/tripwire/tw.cfg -p /etc/tripwire/tw.pol -S /etc/tripwire/site.key > /etc/tripwire/twpol.txt
```

### 10. データベース作成

以下のようにして Tripwire データベースを作成する。

``` text
# tripwire -m i -s -c /etc/tripwire/tw.cfg
Please enter your local passphrase:  # <= ローカルパスフレーズ応答
```

### 11. Tripwire 確認

まず、テスト用ファイルを作成する。

File: `test.txt`

{% highlight text linenos %}
test
{% endhighlight %}

そして、Tripwire チェックを実行する。

``` text
# tripwire -m c -s -c /etc/tripwire/tw.cfg

# ===< 途中省略 >===

Total objects scanned:  55185
Total violations found:  5  # <= test.txt を含め５つがチェックに引っかかった

# ===< 途中省略 >===

Added:
"/root/test.txt"            # <= test.txt がチェックに引っかかった。

# ===< 途中省略 >===

```

テストが終了したら、テストファイルは不要なので削除しておく。

``` text
# rm -f test.txt
```

ちなみに、過去のチェック結果を参照するには、以下のようにするらしい。

``` text
# twprint -m r -c /etc/tripwire/tw.cfg -r /usr/local/tripwire/lib/tripwire/report/centos.centossrv.com-yyyymmdd-HHMMSS.twr
```

### 12. Tripwire 定期自動実行スクリプト作成

Tripwire を定期的に自動で実行するためのスクリプトを以下のように作成する。

File: `tripwire.sh`

{% highlight bash linenos %}
#!/bin/bash

PATH=/usr/sbin:/usr/bin:/bin:/usr/local/tripwire/sbin

# パスフレーズ設定
LOCALPASS=xxxxxxxx # ローカルパスフレーズ
SITEPASS=xxxxxxxx  # サイトパスフレーズ

cd /etc/tripwire

# Tripwireチェック実行
tripwire -m c -s -c tw.cfg|mail -s "Tripwire(R) Integrity Check Report in `hostname`" root

# ポリシーファイル最新化
twadmin -m p -c tw.cfg -p tw.pol -S site.key > twpol.txt
perl twpolmake.pl twpol.txt > twpol.txt.new
twadmin -m P -c tw.cfg -p tw.pol -S site.key -Q $SITEPASS twpol.txt.new > /dev/null
rm -f twpol.txt* *.bak

# データベース最新化
rm -f /usr/local/tripwire/lib/tripwire/*.twd*
tripwire -m i -s -c tw.cfg -P $LOCALPASS
{% endhighlight %}

### 13. Tripwire 定期自動実行スクリプト権限設定

作成した Tripwire 定期自動実行スクリプトに、実行権限を付与する。

``` text
# chmod 700 tripwire.sh
```

### 14. cron 設定

作成した Tripwire 定期自動実行スクリプトを定期的に実行させるために cron 登録する。

File: `/etc/cron.d/tripwire`

{% highlight bash linenos %}
0 3 * * * root /root/tripwire.sh
{% endhighlight %}

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、rootkit 検知ツール chkrootkit の導入について紹介する予定です。

以上。

