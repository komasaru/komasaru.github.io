---
layout   : single
title    : "CentOS 6.5 - ファイルサーバ（Samba）構築！"
published: true
date     : 2013-12-24 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Samba
---

前回は CentOS 6.5 サーバにファイルサーバ NFS の構築を行いました。  
今回はファイルサーバ Samba の構築を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 既存の一般ユーザを Samba ユーザとする。
- ローカルネットワークは 192.168.11.0/24 を想定。
- 共有ディレクトリは "/home/samba" を想定。
- プリンタ共有はしない。
- ごみ箱機能は使用しない。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. Samba インストール

ファイルサーバ Samba を以下のようにしてインストールする。

``` text
# yum -y install samba
```

### 2. Samba サーバアクセス用ユーザ設定

既存の一般ユーザを Samba ユーザにするには、以下のようにする。

``` text
# pdbedit -a hoge
new password:         # <= パスワード設定
retype new password:  # <= パスワード確認入力
Unix username:        hoge
NT username:
Account Flags:        [U          ]
User SID:             S-1-5-21-3822323604-2566139171-1214733173-1000
Primary Group SID:    S-1-5-21-3822323604-2566139171-1214733173-513
Full Name:
Home Directory:       \\vbox\hoge
HomeDir Drive:
Logon Script:
Profile Path:         \\vbox\hoge\profile
Domain:               VBOX
Account desc:
Workstations:
Munged dial:
Logon time:           0
Logoff time:          木, 07  2月 2036 00:06:39 JST
Kickoff time:         木, 07  2月 2036 00:06:39 JST
Password last set:    火, 10 12月 2013 21:59:20 JST
Password can change:  火, 10 12月 2013 21:59:20 JST
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
/home/hoge/samba create
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
   display charset = UTF-8  # <= 追加（Linux側日本語文字コード）
   smb ports = 139          # <= 追加（ポート指定）

   workgroup = FUGA         # <= 変更（Windowsのワークグループ名に合わせる）

;   hosts allow = 127. 192.168.12. 192.168.11.13.  # <= コメント化
   hosts allow = 127. 192.168.11.                  # <= 追加（ローカルネットワークのみアクセス可）

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

### 7. Samba 起動

Samba（smb, nmb） を以下のようにして起動する。

``` text
# /etc/rc.d/init.d/smb start
SMBサービスを起動中:                                       [  OK  ]

# /etc/rc.d/init.d/nmb start
NMB サービスを起動中:                                      [  OK  ]
```

### 8. Samba 自動起動設定

マシン起動時に Samba（smb, nmb）が自動で起動するように設定する。

``` text
# chkconfig smb on
# chkconfig nmb on
# chkconfig --list smb  # <= 2,3,4,5 が "on" であることを確認
smb             0:off   1:off   2:on    3:on    4:on    5:on    6:off
# chkconfig --list nmb  # <= 2,3,4,5 が "on" であることを確認
nmb             0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 9. 動作確認

Windows マシンからアクセス、その他各種処理が可能か確認してみる。

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、送信メールサーバ Postfix の構築について紹介する予定です。

以上。

