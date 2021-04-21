---
layout   : single
title    : "CentOS 7.0 - ファイルサーバ Samba 構築！"
published: true
date     : 2014-08-16 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Samba
---

「CentOS 7.0 - ファイルサーバ Samba 構築」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- 既存の一般ユーザを Samba ユーザとする。
- ローカルネットワークは 192.168.11.0/24 を想定。
- ネットワークカード名は enp0s3 を想定。
- 共有ディレクトリは "/home/samba" を想定。
- プリンタ共有はしない。
- ごみ箱機能は使用しない。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. Samba インストール

``` text
# yum -y install samba
```

### 2. Samba サーバアクセス用ユーザ設定

既存の一般ユーザを Samba ユーザにするには以下のようにする。

``` text
# pdbedit -a masaru
new password:         # <= パスワード設定
retype new password:  # <= パスワード確認入力
Unix username:        masaru
NT username:
Account Flags:        [U          ]
User SID:             S-1-5-21-3920164796-3663230164-2490627854-1000
Primary Group SID:    S-1-5-21-3920164796-3663230164-2490627854-513
Full Name:            Hoge
Home Directory:       \\vbox\masaru
HomeDir Drive:
Logon Script:
Profile Path:         \\vbox\masaru\profile
Domain:               VBOX
Account desc:
Workstations:
Munged dial:
Logon time:           0
Logoff time:          木, 07  2月 2036 00:06:39 JST
Kickoff time:         木, 07  2月 2036 00:06:39 JST
Password last set:    月, 28  7月 2014 10:09:07 JST
Password can change:  月, 28  7月 2014 10:09:07 JST
Password must change: never
Last bad password   : 0
Bad password count  : 0
Logon hours         : FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
```

### 3. Samba 用ホームディレクトリ作成

新規ユーザ作成時に Samba 用ディレクトリを作成するようにするには、以下のようにする。

``` text
# mkdir /etc/skel/samba
```

既存のユーザ用に Samba用ディレクトリを作成するスクリプトを以下のように作成する。

File: `mkhomedir.sh`

{% highlight bash linenos %}
#!/bin/bash

for user in `ls /home`
do
    id $user > /dev/null 2>&1
    [ $? -eq 0 ] && \
    [ ! -d /home/$user/samba ] && \
    mkdir /home/$user/samba && \
    chown $user:$user /home/$user/samba && \
    echo "/home/$user/samba create"
done
{% endhighlight %}

そして、このスクリプトを実行する。

``` text
# sh mkhomedir.sh
/home/masaru/samba create
```

実行後は不要なので削除しておく。

``` text
# rm -f mkhomedir.sh
```

### 4. 共有ディレクトリ作成

誰もがフル権限でアクセスできる共有ディレクトリを作成する。（不要ならしなくてよい）

``` text
# mkdir /home/samba
```

### 5. 共有ディレクトリ所有者設定

作成した共有ディレクトリに誰もがアクセスできるよう所有者・グループの設定を行う。

``` text
# chown nobody:nobody /home/samba
```

### 6. Samba 設定ファイル編集

Samba の設定ファイルを以下のように編集する。

File: `/etc/samba/smb.conf`

{% highlight bash linenos %}
[global]
   unix charset = UTF-8     # <= 追加（Linux側日本語文字コード）
   dos charset = CP932      # <= 追加（Windows側日本語文字コード）
   smb ports = 139          # <= 追加（ポート指定）

   workgroup = FUGA         # <= 変更（Windowsのワークグループ名に合わせる）

   bind interfaces only = yes                      # <= 追加（IPv6 無効時対応）
;   interfaces = lo eth0 192.168.12.2/24 192.168.13.2/24
   interfaces = lo enp0s3 192.168.11.3/24          # <= 追加（IPv6 無効時対応）
;   hosts allow = 127. 192.168.12. 192.168.11.13.  # <= コメント化
   hosts allow = 127. 192.168.11.                  # <= 追加（ローカルネットワークのみアクセス可）

   max protocol = SMB2    # <= コメント解除（SMB2 プロトコル有効）

;   load printers = yes   # <= コメント化（プリンタ共有無効化）
   load printers = no     # <= 追加（プリンタ共有無効化）
   disable spoolss = yes  # <= 追加（プリンタ共有無効化）

;   printing = cups
   printing = bsd         # <= 追加（CUPS エラー対策）

[homes]
   comment = Home Directories
   path = %H/samba        # <= 追加（/home/ユーザ名/sambaをホームディレクトリにする）
   browseable = no
   writable = yes

[public]                   # <= 追加（共有ディレクトリ用）
   comment = Public Stuff  # <= 追加（        〃        ）
   path = /home/samba      # <= 追加（        〃        ）
   public = yes            # <= 追加（        〃        ）
   writable = yes          # <= 追加（        〃        ）
   only guest = yes        # <= 追加（        〃        ）
{% endhighlight %}

### 6-2. Samba 設定・その２

smbd 起動時に以下のようなメッセージ（起動後 `systemctl status smbd` で出力されるメッセージ）が出力される場合、

``` text
 Ignoring unknown parameter "display charset"
```

これは、設定ファイル "smb.conf" に `display charset = UTF-8` という Samba 4 系から廃止された記述が存在するため。  
この記述はもう不要なので削除する。

また、smbd 起動時に以下のようなメッセージ（起動後 `systemctl status smbd` で出力されるメッセージ）が出力される場合、

``` text
 standard input is not a socket, assuming -D option
```

これは、smbd がデーモンとして起動するようオプション指定がされていないため。  
"/lib/systemd/system/smb.service" 内で

File: `/lib/systemd/system/smb.service`

{% highlight bash linenos %}
ExecStart=/usr/sbin/smbd $SMBDOPTIONS
{% endhighlight %}

と設定されているが、`$SMBDOPTIONS` の設定が "/etc/sysconfig/samba" 内で

File: `/etc/sysconfig/samba`

{% highlight bash linenos %}
SMBDOPTIONS=""
{% endhighlight %}

と設定されている。この部分を以下のようにする。

File: `/etc/sysconfig/samba`

{% highlight bash linenos %}
SMBDOPTIONS="-D"
{% endhighlight %}

これで、smbd 起動時に警告は出力されなくなる。

### 7. Samba 起動

Samba（smb, nmb） を以下のようにして起動する。

``` text
# systemctl start smb

# systemctl start nmb
```

### 8. Samba 自動起動設定

マシン起動時に Samba（smb, nmb）が自動で起動するように設定する。

``` text
# systemctl enable smb
ln -s '/usr/lib/systemd/system/smb.service' '/etc/systemd/system/multi-user.target.wants/smb.service'
# systemctl list-unit-files -t service | grep smb
smb.service                                 enabled  # <= enabled であることを確認

# systemctl enable nmb
ln -s '/usr/lib/systemd/system/nmb.service' '/etc/systemd/system/multi-user.target.wants/nmb.service'
# systemctl list-unit-files -t service | grep smb
nmb.service                                 enabled  # <= enabled であることを確認
```

### 9. ファイアウォール設定

``` text
# firewall-cmd --add-service=samba
success
# firewall-cmd --add-service=samba --permanent
success
# firewall-cmd --list-services
dhcpv6-client dns ftp nfs samba ssh
```

### 10. 動作確認

Windows マシンからアクセス、その他各種処理が可能か確認してみる。

### 11. 問題点

当記事執筆当初は以上の方法で問題なかったが、改めて確認してみると smbd がうまく起動しない現象に陥るようになっていた。

``` text
 8月 15 19:49:56 noah.mk-mode.com systemd[1]: smb.service: Supervising process 1819 which is not our child. We'll most likely not notice when it exits.
 8月 15 19:05:21 noah.mk-mode.com smbd[1812]: [2014/08/15 19:05:21.774070,  0] ../lib/util/become_daemon.c:136(daemon_ready)
```

原因は不明。  
普段は NFS サーバの方を使用するので、時間が取れた時に精査してみることにする。

---

以上。

