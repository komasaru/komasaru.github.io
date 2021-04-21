---
layout   : single
title    : "CentOS 7.0 - ファイアウォール設定！"
published: true
date     : 2014-08-09 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- ファイアウォール
---

「CentOS 7.0 - ファイアウォール設定」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- 主に「[FirewallD/jp - FedoraProject](https://fedoraproject.org/wiki/FirewallD/jp "FirewallD/jp - FedoraProject")」を参照。

### 1. FirewallD 概要

- iptables の設定をフィルタリング機能で管理する。
- iptables の存在を意識する必要がない。
- NIC ポートごとに仮想的なファイアウォールを設置して、それぞれについて受信を許可するポートを指定する形式である。
- 予め用意されているゾーンの中から１つを選択して NIC ポートに適用する。  
  予め用意はされているが設定変更は可能である。
- 予め用意されているゾーンは以下の９つ
  * **drop**（設定変更してはならない）  
    外部からのあらゆるパケットを破棄し、返信もしない。外部への接続は可能。
  * **block**（設定変更してはならない）  
    外部からのあらゆる接続を拒否し、ICMP Prohibited メッセージを返す。内部から開始した接続は可能。
  * **public**  
    デフォルトのゾーン。指定した外部から接続のみアクセス可能。  
    デフォルト：dhcpv6-client, ssh
  * **external**  
    外部用。指定した外部から接続のみアクセス可能。IP マスカレードが有効。  
    デフォルト：ssh
  * **dmz**  
    非武装セグメント用。指定した外部から接続のみアクセス可能。  
    デフォルト：ssh
  * **work**  
    作業用。指定した外部から接続のみアクセス可能。  
    デフォルト：dhcpv6-client, ipp-client, ssh
  * **home**  
    ホーム用。指定した外部から接続のみアクセス可能。  
    デフォルト：dhcpv6-client, ipp-client, mdns, samba-client, ssh
  * **internal**  
    内部用。指定した外部から接続のみアクセス可能。  
    デフォルト：dhcpv6-client, ipp-client, mdns, samba-client, ssh
  * **trusted**（設定変更してはならない）  
    全ての接続が許可される。
- バックエンドで iptables を使用しているとは言っても、サービスとして FirewallD との併用は不可。

### 1. iptables 停止・無効化

FirewallD と iptables は（サービスとしては）併用できないので、起動している場合は停止する。そして、起動できないように無効化する。  
（自動起動しない `disable` より起動自体できないようにする `mask` を使用）

``` text
# systemctl stop iptables
# systemctl stop ip6tables
# systemctl stop ebtables

# systemctl mask iptables
ln -s '/dev/null' '/etc/systemd/system/iptables.service'
# systemctl mask ip6tables
ln -s '/dev/null' '/etc/systemd/system/ip6tables.service'
# systemctl mask ebtables
ln -s '/dev/null' '/etc/systemd/system/ebtables.service'

# systemctl list-unit-files -t service | grep iptables
iptables.service                            masked   # <= masked であることを確認
# systemctl list-unit-files -t service | grep ip6tables
ip6tables.service                           masked   # <= masked であることを確認
# systemctl list-unit-files -t service | grep ebtables
ebtables.service                            masked   # <= masked であることを確認
```

### 2. FirewallD 起動

FirewallD が起動していない場合は起動し、マシン起動時に自動起動する設定も行う。

``` text
# systemctl start firewalld

# systemctl enable firewalld
ln -s '/usr/lib/systemd/system/firewalld.service' '/etc/systemd/system/dbus-org.fedoraproject.FirewallD1.service'
ln -s '/usr/lib/systemd/system/firewalld.service' '/etc/systemd/system/basic.target.wants/firewalld.service'

# systemctl list-unit-files -t service | grep firewalld
firewalld.service                           enabled  # <= enabled であることを確認
```

### 3. FirewallD 稼働状況確認

`Loaded: loaded`, `Active: active (running)` であることを確認する。

``` text
# systemctl status firewalld
firewalld.service - firewalld - dynamic firewall daemon
   Loaded: loaded (/usr/lib/systemd/system/firewalld.service; enabled)
   Active: active (running) since 火 2014-07-29 21:36:33 JST; 19min ago
 Main PID: 558 (firewalld)
   CGroup: /system.slice/firewalld.service
           └─558 /usr/bin/python -Es /usr/sbin/firewalld --nofork -...

 7月 29 21:36:19 vbox.mk-mode.com systemd[1]: Starting firewalld -...
 7月 29 21:36:33 vbox.mk-mode.com systemd[1]: Started firewalld - ...
Hint: Some lines were ellipsized, use -l to show in full.
```

以下のコマンドでも確認可能。この場合は `running` であることを確認する。

``` text
# firewall-cmd --state
running
```

### 4. ゾーン設定確認

ゾーンごとの設定を一覧で確認する。

``` text
# firewall-cmd --list-all-zones
block
  interfaces:
  sources:
  services:
  ports:
  masquerade: no
  forward-ports:
  icmp-blocks:
  rich rules:

dmz
  interfaces:
  sources:
  services: ssh
  ports:
  masquerade: no
  forward-ports:
  icmp-blocks:
  rich rules:

drop
  interfaces:
  sources:
  services:
  ports:
  masquerade: no
  forward-ports:
  icmp-blocks:
  rich rules:

external
  interfaces:
  sources:
  services: ssh
  ports:
  masquerade: yes
  forward-ports:
  icmp-blocks:
  rich rules:

home
  interfaces:
  sources:
  services: dhcpv6-client ipp-client mdns samba-client ssh
  ports:
  masquerade: no
  forward-ports:
  icmp-blocks:
  rich rules:

internal
  interfaces:
  sources:
  services: dhcpv6-client ipp-client mdns samba-client ssh
  ports:
  masquerade: no
  forward-ports:
  icmp-blocks:
  rich rules:

public (default)
  interfaces:
  sources:
  services: dhcpv6-client ssh
  ports:
  masquerade: no
  forward-ports:
  icmp-blocks:
  rich rules:

trusted (active)
  interfaces: enp0s3
  sources:
  services:
  ports:
  masquerade: no
  forward-ports:
  icmp-blocks:
  rich rules:

work
  interfaces:
  sources:
  services: dhcpv6-client ipp-client ssh
  ports:
  masquerade: no
  forward-ports:
  icmp-blocks:
  rich rules:

```

### 5. 定義済みサービス名確認

定義済みのサービス名を確認する。

``` text
# firewall-cmd --get-services
amanda-client bacula bacula-client dhcp dhcpv6 dhcpv6-client dns ftp
high-availability http https imaps ipp ipp-client ipsec kerberos kpasswd
ldap ldaps libvirt libvirt-tls mdns mountd ms-wbt mysql nfs ntp openvpn
pmcd pmproxy pmwebapi pmwebapis pop3s postgresql proxy-dhcp radius
rpc-bind samba samba-client smtp ssh telnet tftp tftp-client
transmission-client vnc-server wbem-https
```

定義を追加・編集したい場合は "/usr/lib/firewalld/services/" 内の XML ファイルを編集する。（詳細は割愛）

### 6. 定義済み ICMP 確認

定義済みの ICMP（インターネット制御通知プロトコル）を確認する。

``` text
# firewall-cmd --get-icmptypes
destination-unreachable echo-reply echo-request parameter-problem
redirect router-advertisement router-solicitation source-quench time-exceeded
```

定義を追加・編集したい場合は "/usr/lib/firewalld/icmptypes/" 内の XML ファイルを編集する。（詳細は割愛）

### 7. デフォルトゾーンの確認・変更

明示的に指定しない場合は、デフォルトゾーンが自動適用される。  
デフォルトゾーンを確認するには以下のようにする。

``` text
# firewall-cmd --get-default-zone
public
```

デフォルトゾーンを変更するには以下のようにする。

``` text
# firewall-cmd --set-default-zone=trusted
success
```

ちなみに、アクティブなゾーンの確認は以下のようにする。

``` text
# firewall-cmd --get-active-zone
public
  interfaces: enp3s0
```

### 8. ゾーンの明示的な指定

デフォルトゾーン以外を明示的に指定するには以下のようなコマンドを使用する。  
（以下は一時的な設定。恒久的に設定するには `--permanent` オプションを使用する。）

``` text
# ** eth1 に適用されているゾーンを除去する場合
# firewall-cmd --remove-interface=eth1
success

# ** eth1 に trusted ゾーンを適用する場合
# firewall-cmd --zone=trusted --add-interface=eth1
success

# ** eth1 に public ゾーンを変更する場合
# firewall-cmd --zone=public --change-interface=eth1
success

# ** eth1 に trusted ゾーンが適用されているか確認する場合
# firewall-cmd --zone=trusted --query-interface=eth1
yes

# ** eth1 に適用されているゾーンを確認する場合
# firewall-cmd --get-zone-of-interface=eth1
eth1

# ** trusted ゾーンが適用されている NIC を確認する場合
# firewall-cmd --zone=trusted --list-interfaces
eth1
```

さらに、サブネットを指定して適用することも可能である。

``` text
# ** 192.168.11.0/24 に適用されているゾーンを除去する場合
# firewall-cmd --remove-source=192.168.11.0/24
success

# ** 192.168.11.0/24 に trusted ゾーンを適用する場合
# firewall-cmd --zone=trusted --add-source=192.168.11.0/24
success

# ** 192.168.11.0/24 に public ゾーンを変更する場合
# firewall-cmd --zone=public --change-source=192.168.11.0/24
success

# ** 192.168.11.0/24 に trusted ゾーンが適用されているか確認する場合
# firewall-cmd --zone=trusted --query-source=192.168.11.0/24
yes

# ** 192.168.11.0/24 に適用されているゾーンを確認する場合
# firewall-cmd --get-zone-of-source=192.168.11.0/24
eth1

# ** trusted ゾーンが適用されているサブネットを確認する場合
# firewall-cmd --zone=trusted --list-sources
eth1
```

### 9. サービスの許可

以下は一時的な設定。恒久的に設定するには `--permanent` オプションを使用する。  
また、ゾーンを明示的に指定しなければデフォルトゾーンとなる。

``` text
# ** public ゾーンで許可されているサービスの一覧を確認する場合
# firewall-cmd --zone=public --list-services

# ** public ゾーンに ftp サービスの許可を追加する場合
# firewall-cmd --zone=public --add-service=ftp

# ** public ゾーンで ftp サービスが許可されているか確認する場合
# firewall-cmd --zone=public --query-service=ftp

# ** public ゾーンから ftp サービスの許可を削除する場合
# firewall-cmd --zone=public --remove-service=ftp

```

### 10. ポートの許可

以下は一時的な設定。恒久的に設定するには `--permanent` オプションを使用する。  
また、ゾーンを明示的に指定しなければデフォルトゾーンとなる。

``` text
# ** public ゾーンで許可されているサービスの一覧を確認する場合
# firewall-cmd --zone=public --list-ports

# ** public ゾーンにポート TCP:4000 の許可を追加する場合
# firewall-cmd --zone=public --add-port=4000/tcp
success

# ** public ゾーンにポート TCP:4000 〜 4005 の許可を追加する場合
# firewall-cmd --zone=public --add-port=4000-4005/tcp
success

# ** public ゾーンでポート TCP:4000  が許可されているか確認する場合
# firewall-cmd --zone=public --query-port=4000/tcp
yes

# ** public ゾーンからポート TCP:4000 の許可を削除する場合
# firewall-cmd --zone=public --remove-port=4000/tcp
success
```

### 11. ICMP の禁止

以下は一時的な設定。恒久的に設定するには `--permanent` オプションを使用する。  
また、ゾーンを明示的に指定しなければデフォルトゾーンとなる。

``` text
# ** public ゾーンで禁止されている ICMP の一覧を確認する場合
# firewall-cmd --zone=public --list-icmp-blocks

# ** public ゾーンに echo-request の禁止を追加する場合
# firewall-cmd --zone=public --add-icmp-block=echo-request

# ** public ゾーンで echo-request が禁止されているか確認する場合
# firewall-cmd --zone=public --query-icmp-block=echo-request

# ** public ゾーンから echo-request の禁止を削除する場合
# firewall-cmd --zone=public --remove-icmp-block=echo-request

```

### 12. IP マスカレードの設定

以下は一時的な設定。恒久的に設定するには `--permanent` オプションを使用する。  
また、ゾーンを明示的に指定しなければデフォルトゾーンとなる。

``` text
# ** public ゾーンでの IP マスカレードの設定を確認する場合
# firewall-cmd --zone=public --list-icmp-blocks

# ** public ゾーンで IP マスカレードを有効にする場合
# firewall-cmd --zone=public --add-masquerade

# ** public ゾーンで IP マスカレードを無効にする場合
# firewall-cmd --zone=public --remove-masquerade

```

### 13. ポートフォワードの設定

以下は一時的な設定。恒久的に設定するには `--permanent` オプションを使用する。  
また、ゾーンを明示的に指定しなければデフォルトゾーンとなる。

``` text
# ** public ゾーンでのポートフォワードの設定を確認する場合
# firewall-cmd --zone=public --list-forward-ports

# ** public ゾーンで TCP:99 宛のパケットを TCP:8888 宛に変更する設定を追加する場合
# firewall-cmd --zone=public --add-forward-port=port=22:proto=tcp:toport=8888

# ** public ゾーンに TCP:99 宛のパケットを TCP:8888 宛に変更する設定が適用されているか確認する場合
# firewall-cmd --zone=public --query-forward-port=port=22:proto=tcp:toport=8888

# ** public ゾーンで TCP:99 宛のパケットを TCP:8888 宛に変更する設定を削除する場合
# firewall-cmd --zone=public --remove-forward-port=port=22:proto=tcp:toport=8888

```

`toport=8888` の部分は `toaddr=AAA.BBB.CCC.DDD` のように IP アドレスで指定することも可能。

### 14. その他

起動時の設定を再読み込みする場合は以下のようにする。

``` text
# ** コネクショントラッキングのステート情報は初期化しない場合
# firewall-cmd --reload

# ** コネクショントラッキングのステート情報も初期化する場合
# firewall-cmd --complete-reload
```

FirewallD の設定を一定時間だけ適用させる場合は以下のようなオプションを使用する。

``` text
--timeout=<seconds>
```

全てのネットワーク通信を遮断するパニックモードの有効・無効化は以下のようにする。

``` text
# ** パニックモード有効化
# firewall-cmd --panic-on

# ** パニックモード無効化
# firewall-cmd --panic-off

```

---

以上。

