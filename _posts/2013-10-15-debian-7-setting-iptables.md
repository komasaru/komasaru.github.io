---
layout   : single
title    : "Debian 7 Wheezy - ファイアウォール設定！"
published: true
date     : 2013-10-15 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- ファイアウォール
---

Debian GNU/Linux 7.1.0 サーバでファイアウォール iptables を設定する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- IPv4 のみついて対応する。（IPv6 は無効化している）  
  （「[Debian 7 Wheezy - サーバ初期設定！]({{site.baseurl}}/2013/10/10/debian-7-setting "Debian 7 Wheezy - サーバ初期設定！")」参照）
- ファイアウォールのルールは、取り急ぎ最低限の設定のみ。（必要になった際に追加する）
- iptables をデーモンとして自動起動するツール iptables-persistent を使用する。  
  （iptables-persistent を使用しない場合は、別途起動スクリプトを用意する必要がある）

### 1. iptables インストール

iptables と、iptables をデーモンとして自動起動させるツール iptables-persistent を以下のようにしてインストールする。

``` text 
# aptitude -y install iptables iptables-persistent
```

iptables-persistent のインストールで、「現在の IPv4 ルールを保存しますか？」と問われたら＜はい＞を選択する。  
同様に「現在の IPv6 ルールを保存しますか？」と問われるが、今回は使用しないので＜いいえ＞を選択する。

### 2. 既存設定確認

最初に既存の設定を確認してみる。

``` text 
# iptables -L
Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
```

### 3. ルールファイル編集

ルールファイルを以下のように編集する。  
SSH のポートは SSH の設定（"/etc/ssh/sshd_config"）に合わせること。

File: `/etc/iptables/rules.v4`

{% highlight bash linenos %} 
*filter

# Allows all loopback (lo0) traffic and drop all traffic to 127/8 that doesn't use lo0
-A INPUT -i lo -j ACCEPT
-A INPUT ! -i lo -d 127.0.0.0/8 -j REJECT

# Accepts all established inbound connections
-A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allows all outbound traffic
# You could modify this to only allow certain traffic
-A OUTPUT -j ACCEPT

# Allows HTTP and HTTPS connections from anywhere (the normal ports for websites)
-A INPUT -p tcp --dport 80 -j ACCEPT
-A INPUT -p tcp --dport 443 -j ACCEPT

# Allows SSH connections 
# THE -dport NUMBER IS THE SAME ONE YOU SET UP IN THE SSHD_CONFIG FILE
-A INPUT -p tcp -m state --state NEW --dport 9999 -j ACCEPT

# Now you should read up on iptables rules and consider whether ssh access 
# for everyone is really desired. Most likely you will only allow access from certain IPs.

# Allow ping
-A INPUT -p icmp -m icmp --icmp-type 8 -j ACCEPT

# log iptables denied calls (access via 'dmesg' command)
-A INPUT -m limit --limit 5/min -j LOG --log-prefix "iptables denied: " --log-level 7

# Reject all other inbound - default deny unless explicitly allowed policy:
-A INPUT -j REJECT
-A FORWARD -j REJECT

COMMIT
{% endhighlight %}

### 4. iptables-persistent 再起動

設定を反映させるために、iptables-persistent を再起動する。  
IPv6 は無効にしているのでスキップされる。

``` text 
# /etc/init.d/iptables-persistent restart
Loading iptables rules... IPv4... skipping IPv6 (no rules to load)...done.
```

### 5. 設定確認

設定した内容が反映されているか確認してみる。

``` text 
# iptables -L
Chain INPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     all  --  anywhere             anywhere
REJECT     all  --  anywhere             loopback/8           reject-with icmp-port-unreachable
ACCEPT     all  --  anywhere             anywhere             state RELATED,ESTABLISHED
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:http
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:https
ACCEPT     tcp  --  anywhere             anywhere             state NEW tcp dpt:9999
ACCEPT     icmp --  anywhere             anywhere             icmp echo-request
LOG        all  --  anywhere             anywhere             limit: avg 5/min burst 5 LOG level debug prefix "iptables denied: "
REJECT     all  --  anywhere             anywhere             reject-with icmp-port-unreachable

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination
REJECT     all  --  anywhere             anywhere             reject-with icmp-port-unreachable

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     all  --  anywhere             anywhere
```

### 参考サイト

- [iptables - Debian Wiki](https://wiki.debian.org/iptables "iptables - Debian Wiki")

---

以上。

