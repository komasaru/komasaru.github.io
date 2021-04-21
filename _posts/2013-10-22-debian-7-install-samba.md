---
layout   : single
title    : "Debian 7 Wheezy - Samba サーバ構築！"
published: true
date     : 2013-10-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Samba
---

Debian GNU/Linux 7.1.0 サーバにファイルサーバ Samba を構築する方法についての記録です。

Samba サーバは、Windows クライアントでも（もちろん Unix/Linux クライアントでも）使用できるファイルサーバです。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- 接続可能なマシンのネットワークは `192.168.11.0/24` を想定。
- ドメイン名は `mk-mode.com`、サーバホスト名は `vbox` を想定。
- 全ユーザ共有ディレクトリは "/home/share" とする。
- Web ブラウザで管理できるツール SWAT は導入しない。（一度設定してしまえば、使うことはないので）

### 1. Samba サーバインストール

Samba サーバを以下のようにしてインストールする。

``` text 
# aptitude -y install samba
```

### 2. 共有ディレクトリ作成

全ユーザが共有でフルアクセス可能なディレクトリを作成する。

``` text 
# mkdir /home/share
# chown nobody:nogroup /home/share
# chmod 777 /home/share
```

### 3. 設定ファイル編集

Samba 設定ファイルを以下のように編集する。

File: `/etc/samba/smb.conf`

{% highlight bash linenos %} 
[global]
   unix charset = UTF-8            # <= 追加
   dos charset  = CP932            # <= 追加

   workgroup = WORKGROUP           # <= Windows のワークグループ名に合わせる

   # ネットワークカードを複数搭載し、使用を許可するカードを指定する場合のみ
   #interfaces = 127.0.0.0/8 eth0  # <= 接続許可するインターフェースを指定
   #bind interfaces only = yes     # <= interfaces 項目に指定したホストだけに接続を限定する

   hosts allow = 192.168.11. 127.  # <= アクセスを許可する IP アドレス

   security = share                # <= 共有モード（認証を求めない）

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

### 5. Samba 再起動

設定を反映させるため、Samba サーバを再起動する。

``` text 
# /etc/init.d/samba restart 
Stopping Samba daemons: nmbd smbd.
Starting Samba daemons: nmbd smbd.
```

### 6. ファイアウォール設定

ファイアウォールを設定している場合、Samba サーバが使用するポート（udp:137,138, tcp:139,445）を開放する必要がある。    
iptables の場合、以下のような記述を "/etc/iptables/rules.v4" に追加する。

File: `/etc/iptables/rules.v4`

{% highlight bash linenos %} 
# Allows Samba connections
-A INPUT -p udp --dport 137 -j ACCEPT
-A INPUT -p udp --dport 138 -j ACCEPT
-A INPUT -p tcp --dport 139 -j ACCEPT
-A INPUT -p tcp --dport 445 -j ACCEPT
{% endhighlight %}

### 7. iptables-persistent 再起動

iptables の設定を反映させるために、iptables-persistent を再起動する。  
（IPv6 を無効にしている場合、IPv6 はスキップされる）

``` text 
# /etc/init.d/iptables-persistent restart
Loading iptables rules... IPv4... skipping IPv6 (no rules to load)...done.
```

### 8. 動作確認

クライアントマシンから Samba サーバの "/home/share" ディレクトリにアクセスし、ファイル操作が可能か確認する。

### 9. アクセス権限付き設定

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
security = user  # <= ユーザ認証モード

# 最終行に追加
[Hoge]
   path = /home/hoge
   writable = yes
   create mode = 0770
   directory mode = 0770
   share modes = yes
   guest ok = no        # <= ゲストユーザ不許可
   valid users = @hoge  # <= hoge グループのみ許可
{% endhighlight %}

``` text 
# smbpasswd -a fuga       # <= Samba アクセスユーザ追加登録
New SMB password:         # <= パスワード設定
Retype new SMB password:  # <= パスワード再入力
# usermod -G hoge fuga    # <= hoge グループに fuga ユーザ追加
```

``` text 
# /etc/init.d/samba restart  # <= Samba 再起動
Stopping Samba daemons: nmbd smbd.
Starting Samba daemons: nmbd smbd.
```

---

以上。

