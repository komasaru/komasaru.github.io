---
layout   : single
title    : "Debian 8 (Jessie) - Samba サーバ構築！"
published: true
date     : 2015-06-10 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Samba
---

Debian GNU/Linux 8 (Jessie) に Samba サーバを構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* 接続元のマシンは Linux Mint 17.1(64bit) を想定。
* 接続可能なマシンのネットワークは `192.168.11.0/24` を想定。
* ドメイン名は `mk-mode.com`、サーバホスト名は `vbox` を想定。
* 全ユーザ共有ディレクトリは "/home/share" とする。
* Web ブラウザで管理できるツール SWAT は導入しない。（一度設定してしまえば、使うことはないので）

### 1. Samba サーバのインストール

``` text
# apt-get -y install samba
```

### 2. 共有ディレクトリの作成

全ユーザが共有でフルアクセス可能なディレクトリを作成する。

``` text
# mkdir /home/share
# chown nobody:nogroup /home/share
# chmod 777 /home/share
```

### 3. 設定ファイルの編集

File: `/etc/samba/smb.conf`

{% highlight bash linenos %}
[global]
   unix charset = UTF-8            # <= 追加
   dos charset  = CP932            # <= 追加

   workgroup = WORKGROUP           # <= Windows のワークグループ名に合わせる

   interfaces = 127.0.0.0/8 192.168.11.0/24  # <= 接続許可するインターフェースを指定
   bind interfaces only = yes      # <= interfaces 項目に指定したホストだけに接続を限定する

   map to guest = bad user         # <= 未登録アカウントで接続された場合にゲストとして扱う

   load printers = no              # <= プリンタを使用していない場合
   disable spoolss = yes           # <= プリンタを使用していない場合

   printing = bsd                  # <= プリンタを使用していない場合

# 最終行に追加
[share]                            # <= 共有名
   path           = /home/share    # <= 共有ディレクトリ
   writable       = yes            # <= 書込可
   guest ok       = yes            # <= ゲストユーザー可
   guest only     = yes            # <= 全てゲストとして扱う
   create mode    = 0777           # <= ファイル作成はフル権限で
   directory mode = 0777           # <= ディレクトリ作成はフル権限で
   share modes    = yes            # <= 同一ファイルに同時アクセス時に警告
{% endhighlight %}

### 4. 小作業

プリンタを使用しない場合だけか否かは不明だが、Samba 起動時に "/var/log/samba/log.smbd" に以下のようなエラーが出力されることがある。

``` text
Unable to open printcap file /etc/printcap for read!
```

"/etc/printcap" を作成しておけば出力されなくなる。

``` text
# touch /etc/printcap
```

### 5. Samba サーバの再起動

設定を反映させるため、Samba サーバを再起動する。

``` text
# systemctl restart smbd
# systemctl restart nmbd
```

### 6. ファイアウォール設定

ファイアウォールを設定している場合、Samba サーバが使用するポート（udp:137,138, tcp:139,445）を開放する必要がある。

``` text
# ufw allow 137,138/udp
Rule added
Rule added (v6)

# ufw allow 139,445/tcp
Rule added
Rule added (v6)

# ufw status
     :
     :
137,138/udp                ALLOW       Anywhere
139,445/tcp                ALLOW       Anywhere
137,138/udp                ALLOW       Anywhere (v6)
139,445/tcp                ALLOW       Anywhere (v6)
```

### 7. 動作確認

クライアントマシンから Samba サーバの "/home/share" ディレクトリにアクセスし、ファイル操作が可能か確認する。

### 8. アクセス権限付き設定

通常、中規模以下のネットワークでは上記のようなフルアクセスで問題ないが、大規模ネットワークやよりセキュアに構築したければ、アクセス権限を設定する。  
以下、"hoge" グループに属するユーザのみが、"/home/hoge" ディレクトリにアクセスできるようにする設定例。

``` text
# groupadd hoge          # <= グループ追加
# mkdir /home/hoge       # <= 専用ディレクトリ作成
# chgrp hoge /home/hoge  # <= ディレクトリに所有グループ設定
# chmod 770 /home/hoge   # <= 専用ディレクトリに権限付与
```

File: `/etc/samba/smb.conf`

{% highlight bash linenos %}
security = user  # < = ユーザ認証モード

# 最終行に追加
[Hoge]
   path = /home/hoge
   writable = yes
   create mode = 0770
   directory mode = 0770
   share modes = yes
   guest ok = no        # < = ゲストユーザ不許可
   valid users = @hoge  # < = hoge グループのみ許可
{% endhighlight %}

``` text
# smbpasswd -a fuga       # < = Samba アクセスユーザ追加登録
New SMB password:         # < = パスワード設定
Retype new SMB password:  # < = パスワード再入力
# usermod -G hoge fuga    # < = hoge グループに fuga ユーザ追加
```

``` text
# /etc/init.d/samba restart  # < = Samba 再起動
Stopping Samba daemons: nmbd smbd.
Starting Samba daemons: nmbd smbd.
```

---

以上。

