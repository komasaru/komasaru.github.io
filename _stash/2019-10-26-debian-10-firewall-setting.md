---
layout   : single
title    : "Debian 10 (buster) - ファイアウォール設定！"
published: true
date     : 2019-10-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- ファイアウォール
---

Debian GNU/Linux 10 (buster) でファイアウォールを設定する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* 接続元のマシンは LMDE 3 (Linux Mint Debian Edition 3; 64bit) を想定。
* ufw (= "Uncomplicated Firewall") という iptables のフロントエンドツールを使用する。
* ファイアウォールのルールは、取り急ぎ最低限の設定のみ。（運用する環境やインストールしたサービスに合わせて適宜行う）
* root ユーザでの作業を想定。

### 1. ufw のインストール

依存する iptables 等もインストールされる。

``` text
# apt -y install ufw
```

### 2. 設定ファイルの編集

IPv6 を使用しない場合は以下のように編集しておく

File: `/etc/default/ufw`

``` text
IPV6=no
```

### 3. 各種コマンドについて

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

その他、詳細な説明は `man ufw` で確認可。

### 4. その他

一般的には、一旦全てのアクセスを拒否し、許可したいポートのみ解放するという形式となる。

サーバインストール直後（SSH サーバ導入済み）なら、以下のようにローカルネットからのみ SSH 接続を許可するようにし、後に各種サービスを運用するたびに解放するポートを設定すればよいだろう。

``` text
# ufw default deny
Default incoming policy changed to 'deny'
(be sure to update your rules accordingly)

# ufw allow proto tcp from 192.168.11.0/24 to any port 9999
Rules updated

# ufw enable
Command may disrupt existing ssh connections. Proceed with operation (y|n)? y
Firewall is active and enabled on system startup

# ufw status
Status: active

To                         Action      From
--                         ------      ----
9999/tcp                   ALLOW       192.168.11.0/24
```

ファイアウォールを有効にする際に SSH 接続できるように設定しておかないとリモートで操作できなるのでご注意を。

---

以上。

