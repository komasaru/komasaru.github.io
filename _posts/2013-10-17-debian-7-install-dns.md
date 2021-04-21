---
layout   : single
title    : "Debian 7 Wheezy - DNS サーバ構築！"
published: true
date     : 2013-10-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- DNS
---

Debian GNU/Linux 7.1.0 に DNS サーバを構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- 構築先は Debian GNU/Linux 7.1.0 を想定。
- サーバのローカル IP アドレスは `192.168.11.102`、グローバル IP アドレスは `xxx.yyy.zzz.aaa` を想定。
- ドメイン名は `mk-mode.com`、ネームサーバホスト名は `ns` を想定。
- セカンダリ DNS は用意しない。

### 1. BIND のインストール

DNS サーバである BIND を、以下のようにしてインストールする。（"dnsutils" は `dig` コマンド用）

``` text 
# aptitude -y install bind9 dnsutils
```

### 2. BIND 設定ファイル編集

BIND 設定ファイルを以下のように編集する。

File: `/etc/bind/named.conf`

{% highlight bash linenos %} 
include "/etc/bind/named.conf.options";
include "/etc/bind/named.conf.local";
# include "/etc/bind/named.conf.default-zones";  # <= コメント化（内部向けゾーンファイルで定義するので）
include "/etc/bind/named.conf.internal-zones";   # < = 追加
include "/etc/bind/named.conf.external-zones";   # < = 追加
{% endhighlight %}

### 3. 内部向けゾーンファイル作成

BIND 設定ファイルでも指定している内部向けのゾーンファイルを以下のように作成する。

File: `/etc/bind/named.conf.internal-zones`

{% highlight bash linenos %} 
view "internal" {
        # 内部向け設定の対象範囲定義
        match-clients {
                localhost;
                192.168.11.0/24;
        };

        # 内部向け正引きゾーン定義
        zone "mk-mode.com" {
                type master;
                file "/etc/bind/mk-mode.com.lan";
                allow-update { none; };
        };

        # 内部向け逆引きゾーン定義
        zone "11.168.192.in-addr.arpa" {
                type master;
                file "/etc/bind/11.168.192.db";
                allow-update { none; };
        };
        include "/etc/bind/named.conf.default-zones";

        empty-zones-enable no;
};
{% endhighlight %}

最後の `empty-zones-enable no;` は、ログに以下のようなメッセージが出力されないための対処。

``` text 
Warning: view internal: 'empty-zones-enable/disable-empty-zone' not set: disabling RFC 1918 empty zones
```

### 4. 外部向けゾーンファイル作成

BIND 設定ファイルでも指定している外部向けのゾーンファイルを以下のように作成する。

File: `/etc/bind/named.conf.external-zones`

{% highlight bash linenos %} 
view "external" {
        match-clients { any; };  # 全て対象（内部向け範囲以外のホスト）
        allow-query { any; };    # 問い合わせは全て許可
        recursion no;            # 再帰検索禁止

        # 外部向け正引きゾーン定義
        zone "mk-mode.com" {
                type master;
                file "/etc/bind/mk-mode.com.wan";
                allow-update { none; };
        };

        # 外部向け正引き情報を定義 *注
        zone "aaa.zzz.yyy.xxx.in-addr.arpa" {
                type master;
                file "/etc/bind/aaa.zzz.yyy.xxx.db";
                allow-update { none; };
        };
};
{% endhighlight %}

### 5. オプション設定ファイル編集

その他の設定用ファイルを以下のように編集する。

File: `/etc/bind/named.conf.options`

{% highlight bash linenos %} 
options {
        directory "/var/cache/bind";

        # 問合わせを許可する範囲
        # (サーバー、ローカルネットワーク内のホストからの問合せのみ許可)
        allow-query { localhost; localnets; };      # <= 追加

        # ゾーン情報の転送を許可する範囲
        # (サーバー、ローカルネットワーク内のホストへのみ転送を許可)
        allow-transfer { localhost; localnets; };   # <= 追加

        # 再帰検索を許可する範囲
        # (サーバー、ローカルネットワーク内のホストのみ再検索を許可)
        allow-recursion { localhost; localnets; };  # <= 追加

        dnssec-validation auto;
        auth-nxdomain no;     # conform to RFC1035

        # IPv6 は使用しないので無効化
        #listen-on-v6 { any; };
        listen-on-v6 { none; };
};
{% endhighlight %}

### 6. 内部向け正引きゾーン定義ファイル作成

File: `/etc/bind/mk-mode.com.lan`

{% highlight bash linenos %} 
$TTL 86400
@   IN  SOA     ns.mk-mode.com. root.mk-mode.com. (
        2013101401  ;Serial
        3600        ;Refresh
        1800        ;Retry
        604800      ;Expire
        86400       ;Minimum TTL
)

        IN  NS      ns.mk-mode.com.
        IN  A       192.168.11.102
        IN  MX 10   ns.mk-mode.com.
ns      IN  A       192.168.11.102
hoge    IN  A       192.168.11.11
fuga    IN  A       192.168.11.12
www     IN  CNAME   ns.mk-mode.com.
ftp     IN  CNAME   ns.mk-mode.com.
mail    IN  CNAME   ns.mk-mode.com.
{% endhighlight %}

"hoge", "fuga" はローカルネットワーク内の別のマシン。  
"www", "ftp", "mail" は別名定義。

### 7. 外部向け正引きゾーン定義ファイル作成

File: `/etc/bind/mk-mode.com.wan`

{% highlight bash linenos %} 
$TTL 86400
@   IN  SOA     ns.mk-mode.com. root.mk-mode.com. (
        2013101401  ;Serial
        3600        ;Refresh
        1800        ;Retry
        604800      ;Expire
        86400       ;Minimum TTL
)

        IN  NS      ns.mk-mode.com.
        IN  A       xxx.yyy.zzz.aaa
        IN  MX 10   ns.mk-mode.com.
ns      IN  A       xxx.yyy.zzz.aaa
{% endhighlight %}

### 8. 内部向け逆引きゾーン定義ファイル作成

File: `/etc/bind/11.168.192.db`

{% highlight bash linenos %} 
$TTL 86400
@   IN  SOA     ns.mk-mode.com. root.mk-mode.com. (
        2013101401  ;Serial
        3600        ;Refresh
        1800        ;Retry
        604800      ;Expire
        86400       ;Minimum TTL
)

        IN  NS      ns.mk-mode.com.
        IN  PTR     mk-mode.com.
        IN  A       255.255.255.0
102     IN  PTR     ns.mk-mode.com.
11      IN  PTR     hoge.mk-mode.com.
12      IN  PTR     fuga.mk-mode.com.
{% endhighlight %}

"11", "12" はローカルネットワーク内の別のマシン。

### 9. 外部向け逆引きゾーン定義ファイル作成

File: `/etc/bind/aaa.zzz.yyy.xxx.db`

{% highlight bash linenos %} 
$TTL 86400
@   IN  SOA     ns.mk-mode.com. root.mk-mode.com. (
        2013101401  ;Serial
        3600        ;Refresh
        1800        ;Retry
        604800      ;Expire
        86400       ;Minimum TTL
)

        IN  NS      ns.mk-mode.com.
        IN  PTR     mk-mode.com.
        IN  A       255.255.255.254
aaa     IN  PTR     ns.mk-mode.com.
{% endhighlight %}

（`255.255.255.254` はグローバル IP が１個のみの場合の設定値）

### 10. 問合せ先 DNS サーバ追加

DNS サーバー自身も問合せ先に追加する。  
最初から記載のあるルータの IP アドレス（インストール・初期設定時のもの）をセカンダリ、今回構築のサーバ自身をプライマリに設定するので、ルータより先に記述する。

File: `/etc/resolv.conf`

{% highlight bash linenos %} 
nameserver 192.168.11.102  # <= 追加
nameserver 192.168.11.1    # <= 最初からあるルータの IP アドレス
{% endhighlight %}

### 11. IPv6 無効設定

システムとして IPv6 を無効にしている場合は、以下のように BIND 起動用デフォルトスクリプト（"/etc/default/bind9"）を編集する。  
（"/var/log/syslog" に `... named[9999]: error (network unreachable) resolving ...` のようなエラーが出力されないようにするため）

File: `/etc/default/bind9`

{% highlight bash linenos %} 
OPTIONS="-u bind -4"
{% endhighlight %}

【注意】"/etc/init.d/bind9" ではなく "/etc/default/bind9" である。

### 12. BIND 再起動

設定を有効化するために BIND を再起動する。

``` text 
# /etc/init.d/bind9 restart
Stopping domain name service...: bind9waiting for pid 2794 to die
.
Starting domain name service...: bind9.
```

### 13. 動作確認

DNS サーバが正常に機能する（正引きで IP アドレス、逆引きでホスト名が返ってくる）か、確認してみる。

【内部向け正引きテスト】

``` text 
# dig ns.mk-mode.com.

; <<>> DiG 9.8.4-rpz2+rl005.12-P1 <<>> ns.mk-mode.com.
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 57956
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 0

;; QUESTION SECTION:
;ns.mk-mode.com.                        IN      A

;; ANSWER SECTION:
ns.mk-mode.com.         86400   IN      A       192.168.11.102

;; AUTHORITY SECTION:
mk-mode.com.            86400   IN      NS      ns.mk-mode.com.

;; Query time: 4 msec
;; SERVER: 192.168.11.102#53(192.168.11.102)
;; WHEN: Mon Sep 30 15:38:26 2013
;; MSG SIZE  rcvd: 62
```

【内部向け逆引きテスト】

``` text 
# dig -x 192.168.11.102

; <<>> DiG 9.8.4-rpz2+rl005.12-P1 <<>> -x 192.168.11.102
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 18225
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 1, ADDITIONAL: 1

;; QUESTION SECTION:
;102.11.168.192.in-addr.arpa.   IN      PTR

;; ANSWER SECTION:
102.11.168.192.in-addr.arpa. 86400 IN   PTR     vbox.mk-mode.com.
102.11.168.192.in-addr.arpa. 86400 IN   PTR     ns.mk-mode.com.

;; AUTHORITY SECTION:
11.168.192.in-addr.arpa. 86400  IN      NS      ns.mk-mode.com.

;; ADDITIONAL SECTION:
ns.mk-mode.com.         86400   IN      A       192.168.11.102

;; Query time: 2 msec
;; SERVER: 192.168.11.102#53(192.168.11.102)
;; WHEN: Mon Sep 30 15:38:49 2013
;; MSG SIZE  rcvd: 122
```

【外部向け正引きテスト】

``` text 
# dig www.isc.org

; <<>> DiG 9.8.4-rpz2+rl005.12-P1 <<>> www.isc.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 470
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 4, ADDITIONAL: 4

;; QUESTION SECTION:
;www.isc.org.                   IN      A

;; ANSWER SECTION:
www.isc.org.            60      IN      A       149.20.64.69

;; AUTHORITY SECTION:
isc.org.                3153    IN      NS      sfba.sns-pb.isc.org.
isc.org.                3153    IN      NS      ns.isc.afilias-nst.info.
isc.org.                3153    IN      NS      ams.sns-pb.isc.org.
isc.org.                3153    IN      NS      ord.sns-pb.isc.org.

;; ADDITIONAL SECTION:
ns.isc.afilias-nst.info. 53541  IN      A       199.254.63.254
ams.sns-pb.isc.org.     77978   IN      A       199.6.1.30
ord.sns-pb.isc.org.     85218   IN      A       199.6.0.30
sfba.sns-pb.isc.org.    75153   IN      A       149.20.64.3

;; Query time: 177 msec
;; SERVER: 192.168.11.1#53(192.168.11.1)
;; WHEN: Mon Sep 30 15:42:46 2013
;; MSG SIZE  rcvd: 208
```

【外部向け逆引きテスト】

``` text 
# dig -x 149.20.64.69

; <<>> DiG 9.8.4-rpz2+rl005.12-P1 <<>> -x 149.20.64.69
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 50854
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 3, ADDITIONAL: 6

;; QUESTION SECTION:
;69.64.20.149.in-addr.arpa.     IN      PTR

;; ANSWER SECTION:
69.64.20.149.in-addr.arpa. 3580 IN      PTR     banana.isc.org.

;; AUTHORITY SECTION:
64.20.149.in-addr.arpa. 3578    IN      NS      ord.sns-pb.isc.org.
64.20.149.in-addr.arpa. 3578    IN      NS      ams.sns-pb.isc.org.
64.20.149.in-addr.arpa. 3578    IN      NS      sfba.sns-pb.isc.org.

;; ADDITIONAL SECTION:
ams.sns-pb.isc.org.     86307   IN      A       199.6.1.30
ams.sns-pb.isc.org.     86307   IN      AAAA    2001:500:60::30
ord.sns-pb.isc.org.     86307   IN      A       199.6.0.30
ord.sns-pb.isc.org.     86307   IN      AAAA    2001:500:71::30
sfba.sns-pb.isc.org.    86307   IN      A       149.20.64.3
sfba.sns-pb.isc.org.    86307   IN      AAAA    2001:4f8:0:2::19

;; Query time: 3 msec
;; SERVER: 192.168.11.102#53(192.168.11.102)
;; WHEN: Mon Sep 30 15:44:18 2013
;; MSG SIZE  rcvd: 265
```

### 14. ファイアウォール（iptables）設定

実際に運用する場合は、ポートを開放する必要がある。

File: `/etc/iptables/rules.v4`

{% highlight bash linenos %} 
# 外部からのTCP/UDP53番ポート(DNS)へのアクセスを許可
-A INPUT -p tcp --dport 53 -j ACCEPT
-A INPUT -p udp --dport 53 -j ACCEPT
{% endhighlight %}

そして、設定を反映させるために iptables-persistent を再起動する。

``` text 
# /etc/init.d/iptables-persistent restart
Loading iptables rules... IPv4... skipping IPv6 (no rules to load)...done.
```

---

以上。

