---
layout   : single
title    : "Debian 7.8 - ファイアウォール ufw 導入！"
published: true
date     : 2015-01-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- ファイアウォール
---

以前 Debian GNU/Linux 7.1.0 サーバでファイアウォール iptables を設定する方法について紹介しました。

* [Debian 7 Wheezy - ファイアウォール設定！]({{site.baseurl}}/2013/10/15/debian-7-setting-iptables/ "Debian 7 Wheezy - ファイアウォール設定！")

今回は iptables のフロントエンドツール ufw(= "Uncomplicated Firewall") でファイアウォールを設定する方法についてです。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.8.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- IPv4 のみに対応する。（IPv6 は無効化している）  
  （「[Debian 7 Wheezy - サーバ初期設定！]({{site.baseurl}}/2013/10/10/debian-7-setting "Debian 7 Wheezy - サーバ初期設定！")」参照）
- インストール後の各種設定は、運用する環境やインストールしたサービスに合わせて適宜行う。

### 1. ufw インストール

``` text
# apt-get -y install ufw
```

### 2. 各種コマンド

各種コマンドの使用法について簡単に説明する。  
（以下のサービス名、ポート番号は一例）

``` text
# ufw status            # <= 状況確認
# ufw enable            # <= ファイアウォールの有効化
# ufw disable           # <= ファイアウォールの無効化
# ufw default deny      # <= 全アクセスの拒否
# ufw default allow     # <= 全アクセスの許可
# ufw deny smtp         # <= SMTP サービスのアクセスを拒否
# ufw allow ftp         # <= FTP サービスのアクセスを許可
# ufw deny 25/tcp       # <= TCP ポート 25 でのアクセスを拒否
# ufw allow 80/udp      # <= UDP ポート 80 でのアクセスを許可
# ufw allow 53          # <= TCP ポート 53, UDP ポート 53 でのアクセスを拒否
# ufw allow in http     # <= HTTP サービスのアクセスを IN のみ許可
# ufw reject out smtp   # <= SMTP サービスのアクセスを OUT のみ却下
# ufw allow proto tcp from any to any port 8080:8090
                        # <= TCP ポート 8080 〜 8090 での全アクセスを許可
# ufw allow proto tcp from 192.168.11.0/24 to any port 9999
                        # <= TCP ローカルネットワーク 192.168.11.0/24 からの
                        #    TCP ポート 9999 でのアクセスを許可
# ufw delete 3          # <= 3 番目のルールを削除
```

その他のオプションや詳細な説明は `man ufw` で確認可。

### 3. その他

一般的には、デフォルトで全てのアクセスを拒否し、許可したいポートのみ開放するという形式となる。

サーバインストール直後（SSH サーバ導入済み）なら、以下のようにローカルネットからのみ SSH 接続を許可するようにし、後に各種サービスを運用するたびに開放するポートを設定すればよいだろう。

``` text
# ufw default deny
# ufw allow proto tcp from 192.168.11.0/24 to any port 9999
# ufw enable
```

ファイアウォールを有効にする際に SSH 接続できるように設定しておかないとリモートで操作できなくなるのでご注意を。

---

以上。

