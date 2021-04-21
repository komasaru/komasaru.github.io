---
layout   : single
title    : "FreeBSD 10.0 - DNS サーバ BIND9 インストール！"
published: true
date     : 2014-10-21 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- DNS
---

「FreeBSD 10.0 - DNS サーバ BIND9 インストール」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* インストールする BIND は 9.9 系。
* 固定 IP 環境を想定。（グローバル IP は "aaa.bbb.ccc.ddd" を想定）
* ルータ経由の接続を想定。（ルータの LAN 側 IP は "192.168.11.1" を想定）
* ローカルネットワークは "192.168.11.0/24"
* サーバマシンのローカル IP アドレスは "192.168.11.102"
* 主に[BIND9 インストール｜FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/freebsd8_bind9.html "BIND9 インストール｜FreeBSDサーバー構築マニュアル")を参照。

### 1. BIND9インストール

``` text
# cd /usr/ports/dns/bind99
# make BATCH=yes install clean
# cd
```

※BIND 9.8 系までと異なり、設定ファイル類は "/etc/namedb" ディレクトリ配下ではなく "/usr/local/etc/namedb" ディレクトリ配下に配置される。

### 2. rndc 設定

BIND をリモートから制御するための仕組み rndc (remote name server daemon control) の設定。

``` text
# rndc-confgen -a
wrote key file "/usr/local/etc/namedb/rndc.key"
# cat /usr/local/etc/namedb/rndc.key > /usr/local/etc/namedb/rndc.conf
# cat /usr/local/etc/namedb/rndc.key > /usr/local/etc/namedb/named.conf
# rm -f /usr/local/etc/namedb/rndc.key
```

設定ファイルを編集。

File: `/usr/local/etc/namedb/rndc.conf`

{% highlight bash linenos %}
key "rndc-key" {
        algorithm hmac-md5;
        secret "xxxxxxxxxxxxxxxxxxxxxxxx";
};

# 最終行に以下の記述を追加
options {
    default-key "rndc-key";
    default-server 127.0.0.1;
    default-port 953;
};

Server 127.0.0.1 {
    key "rndc-key";
};
{% endhighlight %}

そして、権限設定。

``` text
# chmod 400 /usr/local/etc/namedb/rndc.conf
# chmod 600 /usr/local/etc/namedb/named.conf
# chown bind:wheel /usr/local/etc/namedb/named.conf
```

### 3. BIND9 設定ファイル編集

File: `/usr/local/etc/namedb/named.conf`

{% highlight bash linenos %}
key "rndc-key" {
        algorithm hmac-md5;
        secret "xxxxxxxxxxxxxxxxxxxxxxxx";
};

# 最終行に以下の記述を追加
controls {
        inet 127.0.0.1 port 953 allow { 127.0.0.1; } keys { "rndc-key"; };
};

options {
    version           "unknown";
    directory         "/usr/local/etc/namedb";
    pid-file          "/var/run/named/pid";
    dump-file         "/var/dump/named_dump.db";
    statistics-file   "/var/stats/named.stats";
    listen-on-v6      { none; };
    listen-on         { localhost; localnets; };
    allow-query       { localhost; localnets; };
    allow-recursion   { localhost; localnets; };
    allow-transfer    { localhost; localnets; };
    forwarders        { 192.168.11.1; };
};

view "internal"{
    match-clients { localnets; };
    recursion yes;

    zone "." IN {
        type  hint;
        file  "named.ca";
    };

    zone "0.0.127.in-addr.arpa" {
        type  master;
        file  "0.0.127.in-addr.arpa";
    };

    zone "11.168.192.in-addr.arpa" {
        type  master;
        file  "11.168.192.in-addr.arpa";
    };

    zone "mk-mode.com" {
        type  master;
        file  "mk-mode.com.local";
    };
};

# 以下は固定 IP 環境の場合
view "external"{
    match-clients { any; };
#recursion     no;

    zone "mk-mode.com" {
        type  master;
        file  "mk-mode.zone";
        allow-transfer { aaa.bbb.ccc.ddd; };
    };
};
{% endhighlight %}

### 4. localhost 逆引き設定

以下の内容のファイルを作成。

File: `/usr/local/etc/namedb/0.0.127.in-addr.arpa`

{% highlight bash linenos %}
$TTL 86400
@   IN    SOA   ns1.mk-mode.com.    root.mk-mode.com. (
    2014101100    ;Serial
    28800         ;Refresh
    7200          ;Retry
    604800        ;Expire
    86400         ;Minimum
)

    IN    NS    ns1.mk-mode.com.
1   IN    PTR   localhost.
{% endhighlight %}

### 5. 内部正引き設定

以下の内容のファイルを作成。

File: `/usr/local/etc/namedb/mk-mode.com.local`

{% highlight bash linenos %}
$TTL    86400
@   IN    SOA   ns1.mk-mode.com.    root.mk-mode.com. (
    2014101100    ;Serial
    28800         ;Refresh
    7200          ;Retry
    604800        ;Expire
    86400         ;Minimum
)
      IN    NS    ns1.mk-mode.com.
      IN    MX    10  mail.mk-mode.com.
@     IN    A     192.168.11.102
ns1   IN    A     192.168.11.102
www   IN    A     192.168.11.102
ftp   IN    A     192.168.11.102
mail  IN    A     192.168.11.102
{% endhighlight %}

### 6. 内部逆引き設定

以下の内容のファイルを作成。

File: `/usr/local/etc/namedb/11.168.192.in-addr.arpa`

{% highlight bash linenos %}
$TTL    86400
@   IN    SOA   ns1.mk-mode.com.    root.mk-mode.com. (
    2014101100    ;Serial
    28800         ;Refresh
    7200          ;Retry
    604800        ;Expire
    86400         ;Minimum
)
    IN    NS    mk-mode.com.
102 IN    PTR   mk-mode.com.
{% endhighlight %}

### 7. 外部正引き設定（固定 IP 環境の場合）

以下の内容のファイルを作成。

File: `/usr/local/etc/namedb/mk-mode.com.zone`

{% highlight bash linenos %}
$TTL    86400
@   IN    SOA   ns1.mk-mode.com.    root.mk-mode.com.  (
    2010052100    ;Serial
    28800         ;Refresh
    7200          ;Retry
    604800        ;Expire
    86400         ;Minimum
)
      IN    NS    ns1.mk-mode.com.
      IN    MX    10  mail.mk-mode.com.
@     IN    A     aaa.bbb.ccc.ddd
ns1   IN    A     aaa.bbb.ccc.ddd
www   IN    A     aaa.bbb.ccc.ddd
ftp   IN    A     aaa.bbb.ccc.ddd
mail  IN    A     aaa.bbb.ccc.ddd
mk-mode.com. IN TXT "v=spf1 a mx ~all"
{% endhighlight %}

### 8. ルートゾーン最新化

``` text
# dig . ns @198.41.0.4 > /usr/local/etc/namedb/named.ca
```

### 9. 名前解決ファイル編集

File: `/etc/resolv.conf`

{% highlight bash linenos %}
nameserver 127.0.0.1  # <= 自分自身に変更
{% endhighlight %}

### 10. BIND9 自動起動設定

File: `/etc/rc.conf`

{% highlight bash linenos %}
named_enable="YES"   # <= 追加
{% endhighlight %}

### 11. BIND9 起動

``` text
# /usr/local/etc/rc.d/named start

```

### 12. BIND9 動作確認

ローカルマシンの DNS 設定を今設定したばかりのサーバの IP に変更後、動作を確認。  
（既にファイアウォール設定を行っている場合は、ポート開放について確認してから）

``` text
# dig @127.0.0.1 mk-mode.com soa    # <= SOA レコード確認

; <<>> DiG 9.9.6 <<>> @127.0.0.1 mk-mode.com soa
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 13984
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;mk-mode.com.                   IN      SOA

;; ANSWER SECTION:
mk-mode.com.            86400   IN      SOA     ns1.mk-mode.com. root.mk-mode.com. 2014101100 28800 7200 604800 86400

;; AUTHORITY SECTION:
mk-mode.com.            86400   IN      NS      ns1.mk-mode.com.

;; ADDITIONAL SECTION:
ns1.mk-mode.com.        86400   IN      A       192.168.11.102

;; Query time: 4 msec
;; SERVER: 127.0.0.1#53(127.0.0.1)
;; WHEN: Sat Oct 11 10:13:12 JST 2014
;; MSG SIZE  rcvd: 115

```

``` text
# dig @127.0.0.1 mk-mode.com ns     # <= NS レコード確認

; <<>> DiG 9.9.6 <<>> @127.0.0.1 mk-mode.com ns
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 61279
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;mk-mode.com.                   IN      NS

;; ANSWER SECTION:
mk-mode.com.            86400   IN      NS      ns1.mk-mode.com.

;; ADDITIONAL SECTION:
ns1.mk-mode.com.        86400   IN      A       192.168.11.102

;; Query time: 0 msec
;; SERVER: 127.0.0.1#53(127.0.0.1)
;; WHEN: Sat Oct 11 10:13:39 JST 2014
;; MSG SIZE  rcvd: 74

```

``` text
# dig @127.0.0.1 ftp.mk-mode.com   # <= A レコード確認

; <<>> DiG 9.9.6 <<>> @127.0.0.1 ftp.mk-mode.com
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 14775
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;ftp.mk-mode.com.               IN      A

;; ANSWER SECTION:
ftp.mk-mode.com.        86400   IN      A       192.168.11.102

;; AUTHORITY SECTION:
mk-mode.com.            86400   IN      NS      ns1.mk-mode.com.

;; ADDITIONAL SECTION:
ns1.mk-mode.com.        86400   IN      A       192.168.11.102

;; Query time: 1 msec
;; SERVER: 127.0.0.1#53(127.0.0.1)
;; WHEN: Sat Oct 11 10:18:41 JST 2014
;; MSG SIZE  rcvd: 94

```

``` text
# dig @127.0.0.1 -x 192.168.11.102  # <= 逆引き確認

; <<>> DiG 9.9.6 <<>> @127.0.0.1 -x 192.168.11.102
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 42005
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;102.11.168.192.in-addr.arpa.   IN      PTR

;; ANSWER SECTION:
102.11.168.192.in-addr.arpa. 86400 IN   PTR     mk-mode.com.

;; AUTHORITY SECTION:
11.168.192.in-addr.arpa. 86400  IN      NS      mk-mode.com.

;; ADDITIONAL SECTION:
mk-mode.com.            86400   IN      A       192.168.11.102

;; Query time: 1 msec
;; SERVER: 127.0.0.1#53(127.0.0.1)
;; WHEN: Sat Oct 11 10:14:25 JST 2014
;; MSG SIZE  rcvd: 111

```

``` text
# dig @127.0.0.1 www.isc.com    # <= 外部ホスト確認

; <<>> DiG 9.9.6 <<>> @127.0.0.1 www.isc.org
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 10254
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 4, ADDITIONAL: 5

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;www.isc.org.                   IN      A

;; ANSWER SECTION:
www.isc.org.            50      IN      A       149.20.64.69

;; AUTHORITY SECTION:
isc.org.                1607    IN      NS      ams.sns-pb.isc.org.
isc.org.                1607    IN      NS      ord.sns-pb.isc.org.
isc.org.                1607    IN      NS      sfba.sns-pb.isc.org.
isc.org.                1607    IN      NS      ns.isc.afilias-nst.info.

;; ADDITIONAL SECTION:
ns.isc.afilias-nst.info. 73599  IN      A       199.254.63.254
ams.sns-pb.isc.org.     3459    IN      A       199.6.1.30
ord.sns-pb.isc.org.     3459    IN      A       199.6.0.30
sfba.sns-pb.isc.org.    3459    IN      A       149.20.64.3

;; Query time: 1 msec
;; SERVER: 127.0.0.1#53(127.0.0.1)
;; WHEN: Sat Oct 11 10:23:26 JST 2014
;; MSG SIZE  rcvd: 219

```

``` text
# dig -x 149.20.64.49  # <= 外部ホスト逆引き

; <<>> DiG 9.9.6 <<>> -x 149.20.64.49
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 53517
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 3, ADDITIONAL: 4

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;49.64.20.149.in-addr.arpa.     IN      PTR

;; ANSWER SECTION:
49.64.20.149.in-addr.arpa. 3600 IN      PTR     ops.isc.org.

;; AUTHORITY SECTION:
64.20.149.in-addr.arpa. 3600    IN      NS      sfba.sns-pb.isc.org.
64.20.149.in-addr.arpa. 3600    IN      NS      ams.sns-pb.isc.org.
64.20.149.in-addr.arpa. 3600    IN      NS      ord.sns-pb.isc.org.

;; ADDITIONAL SECTION:
ams.sns-pb.isc.org.     3368    IN      A       199.6.1.30
ord.sns-pb.isc.org.     3368    IN      A       199.6.0.30
sfba.sns-pb.isc.org.    3368    IN      A       149.20.64.3

;; Query time: 210 msec
;; SERVER: 127.0.0.1#53(127.0.0.1)
;; WHEN: Sat Oct 11 10:24:57 JST 2014
;; MSG SIZE  rcvd: 189

```

---

以上。

