---
layout   : single
title    : "Debian 8 (Jessie) - DNS サーバ構築！"
published: true
date     : 2015-06-04 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- DNS
---

Debian GNU/Linux 8 (Jessie) に DNS サーバを構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* サーバのローカル IP アドレスは `192.168.11.102`、グローバル IP アドレスは `xxx.yyy.zzz.aaa` を想定。
* ドメイン名は `mk-mode.com`、ネームサーバホスト名は `ns` を想定。
* セカンダリ DNS は用意しない。

### 1. BIND のインストール

（"dnsutils" は `dig` コマンド用）

``` text
# apt-get -y install bind9 dnsutils
```

### 2. BIND 設定ファイルの編集

File: `/etc/bind/named.conf`

{% highlight bash linenos %}
include "/etc/bind/named.conf.options";
include "/etc/bind/named.conf.local";
# include "/etc/bind/named.conf.default-zones";  # <= コメント化（内部向け・外部向けゾーンファイルで定義するので）
include "/etc/bind/named.conf.internal-zones";   # < = 追加
include "/etc/bind/named.conf.external-zones";   # < = 追加
{% endhighlight %}

### 3. 内部向けゾーンファイルの作成

BIND 設定ファイルで指定している内部向けゾーンファイルを以下のように作成する。

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

### 4. 外部向けゾーンファイルの作成

BIND 設定ファイルで指定している外部向けゾーンファイルを以下のように作成する。

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

### 5. オプション設定ファイルの編集

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

# EDNS0 の無効化（デフォルトは有効化(yes)）
# "error (unexpected RCODE REFUSED) ..." 出力の抑止
server 0.0.0.0 {
        edns no;
};

# "DNS format error ... invalid response" 出力の抑止
logging {
        category resolver { null; };
};
{% endhighlight %}

### 6. 内部向け正引きゾーン定義ファイルの作成

File: `/etc/bind/mk-mode.com.lan`

{% highlight bash linenos %}
$TTL 86400
@   IN  SOA     ns.mk-mode.com. root.mk-mode.com. (
        2015050201  ;Serial
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

`hoge`, `fuga` はローカルネットワーク内の別のマシン。  
`www`, `ftp`, `mail` は別名定義。

### 7. 外部向け正引きゾーン定義ファイルの作成

File: `/etc/bind/mk-mode.com.wan`

{% highlight bash linenos %}
$TTL 86400
@   IN  SOA     ns.mk-mode.com. root.mk-mode.com. (
        2015050201  ;Serial
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

### 8. 内部向け逆引きゾーン定義ファイルの作成

File: `/etc/bind/11.168.192.db`

{% highlight bash linenos %}
$TTL 86400
@   IN  SOA     ns.mk-mode.com. root.mk-mode.com. (
        2015050201  ;Serial
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

`11`, `12` はローカルネットワーク内の別のマシン。

### 9. 外部向け逆引きゾーン定義ファイルの作成

File: `/etc/bind/aaa.zzz.yyy.xxx.db`

{% highlight bash linenos %}
$TTL 86400
@   IN  SOA     ns.mk-mode.com. root.mk-mode.com. (
        2015050201  ;Serial
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

### 10. 問合せ先 DNS サーバの追加

DNS サーバー自身も問合せ先に追加する。  
最初から記載のあるルータの IP アドレス（インストール・初期設定時のもの）をセカンダリ、今回構築のサーバ自身をプライマリに設定するので、ルータより先に記述する。

File: `/etc/resolv.conf`

{% highlight bash linenos %}
nameserver 192.168.11.102  # <= 追加
nameserver 192.168.11.1    # <= 最初からあるルータの IP アドレス
{% endhighlight %}

### 11. IPv6 の無効化設定

システムとして IPv6 を無効にしている場合は、以下のように BIND 起動用デフォルトスクリプト（"/lib/systemd/system/bind9.service" を編集する。  
（"/var/log/syslog" に `... named[9999]: error (network unreachable) resolving ...` のようなエラーが出力されないようにするため）

File: `/lib/systemd/system/bind9.service`

{% highlight bash linenos %}
[Service]
#ExecStart=/usr/sbin/named -f -u bind    # <= コメントアウト
ExecStart=/usr/sbin/named -f -u bind -4  # <= 追加
ExecReload=/usr/sbin/rndc reload
ExecStop=/usr/sbin/rndc stop
{% endhighlight %}

ちなみに、 systemd でなく init だった頃は "/etc/default/bind9" を編集していた。

File: `/etc/default/bind9`

{% highlight bash linenos %}
OPTIONS="-u bind -4"
{% endhighlight %}

### 12. BIND の再起動

設定を有効化するために BIND を再起動する。

``` text
# systemctl daemon-reload
# systemctl restart bind9
```

### 13. 動作確認

DNS サーバが正常に機能する（正引きで IP アドレス、逆引きでホスト名が返ってくる）か、確認してみる。

File: `内部向け正引きテスト`

{% highlight text linenos %}
# dig ns.mk-mode.com.

; <<>> DiG 9.9.5-9-Debian <<>> ns.mk-mode.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 15567
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;ns.mk-mode.com.                        IN      A

;; ANSWER SECTION:
ns.mk-mode.com.         86400   IN      A       192.168.11.102

;; AUTHORITY SECTION:
mk-mode.com.            86400   IN      NS      ns.mk-mode.com.

;; Query time: 2 msec
;; SERVER: 192.168.11.102#53(192.168.11.102)
;; WHEN: Sat May 02 13:23:28 JST 2015
;; MSG SIZE  rcvd: 73

{% endhighlight %}

File: `内部向け逆引きテスト`

{% highlight text linenos %}
# dig -x 192.168.11.102

; <<>> DiG 9.9.5-9-Debian <<>> -x 192.168.11.102
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 26177
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;102.11.168.192.in-addr.arpa.   IN      PTR

;; ANSWER SECTION:
102.11.168.192.in-addr.arpa. 86400 IN   PTR     ns.mk-mode.com.

;; AUTHORITY SECTION:
11.168.192.in-addr.arpa. 86400  IN      NS      ns.mk-mode.com.

;; ADDITIONAL SECTION:
ns.mk-mode.com.         86400   IN      A       192.168.11.102

;; Query time: 0 msec
;; SERVER: 192.168.11.102#53(192.168.11.102)
;; WHEN: Sat May 02 13:24:09 JST 2015
;; MSG SIZE  rcvd: 114

{% endhighlight %}

File: `外部向け正引きテスト`

{% highlight text linenos %}
# dig www.isc.org

; <<>> DiG 9.9.5-9-Debian <<>> www.isc.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 23002
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 4, ADDITIONAL: 9

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;www.isc.org.                   IN      A

;; ANSWER SECTION:
www.isc.org.            60      IN      A       149.20.64.69

;; AUTHORITY SECTION:
isc.org.                4848    IN      NS      ord.sns-pb.isc.org.
isc.org.                4848    IN      NS      sfba.sns-pb.isc.org.
isc.org.                4848    IN      NS      ns.isc.afilias-nst.info.
isc.org.                4848    IN      NS      ams.sns-pb.isc.org.

;; ADDITIONAL SECTION:
ns.isc.afilias-nst.info. 62433  IN      A       199.254.63.254
ns.isc.afilias-nst.info. 62433  IN      AAAA    2001:500:2c::254
ams.sns-pb.isc.org.     62432   IN      A       199.6.1.30
ams.sns-pb.isc.org.     62432   IN      AAAA    2001:500:60::30
ord.sns-pb.isc.org.     1109    IN      A       199.6.0.30
ord.sns-pb.isc.org.     62432   IN      AAAA    2001:500:71::30
sfba.sns-pb.isc.org.    62432   IN      A       149.20.64.3
sfba.sns-pb.isc.org.    86132   IN      AAAA    2001:4f8:0:2::19

;; Query time: 552 msec
;; SERVER: 192.168.11.1#53(192.168.11.1)
;; WHEN: Sat May 02 13:24:32 JST 2015
;; MSG SIZE  rcvd: 331

{% endhighlight %}

File: `外部向け逆引きテスト`

{% highlight text linenos %}
# dig -x 149.20.64.69

; <<>> DiG 9.9.5-9-Debian <<>> -x 149.20.64.69
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 21218
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 3, ADDITIONAL: 7

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;69.64.20.149.in-addr.arpa.     IN      PTR

;; ANSWER SECTION:
69.64.20.149.in-addr.arpa. 3600 IN      PTR     www.isc.org.

;; AUTHORITY SECTION:
64.20.149.in-addr.arpa. 3600    IN      NS      ord.sns-pb.isc.org.
64.20.149.in-addr.arpa. 3600    IN      NS      ams.sns-pb.isc.org.
64.20.149.in-addr.arpa. 3600    IN      NS      sfba.sns-pb.isc.org.

;; ADDITIONAL SECTION:
ams.sns-pb.isc.org.     62386   IN      A       199.6.1.30
ams.sns-pb.isc.org.     62386   IN      AAAA    2001:500:60::30
ord.sns-pb.isc.org.     1063    IN      A       199.6.0.30
ord.sns-pb.isc.org.     62386   IN      AAAA    2001:500:71::30
sfba.sns-pb.isc.org.    62386   IN      A       149.20.64.3
sfba.sns-pb.isc.org.    86086   IN      AAAA    2001:4f8:0:2::19

;; Query time: 195 msec
;; SERVER: 192.168.11.1#53(192.168.11.1)
;; WHEN: Sat May 02 13:25:18 JST 2015
;; MSG SIZE  rcvd: 273

{% endhighlight %}

### 14. ファイアウォール (ufw) の設定

実際に運用する場合は、外部からのTCP/UDP53番ポート(DNS)へのアクセスを許可する必要がある。

``` text
# ufw allow 53
Rule added
Rule added (v6)

# ufw status
Status: active

To                         Action      From
--                         ------      ----
9999/tcp                   ALLOW       192.168.11.0/24
53                         ALLOW       Anywhere
53                         ALLOW       Anywhere (v6)
```

（今回は IPv6 を使用しないので v6 の行を削除してもよいが、あってもおそらく問題ない）

---

以上。

