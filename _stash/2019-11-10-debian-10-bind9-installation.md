---
layout   : single
title    : "Debian 10 (buster) - DNS サーバ BIND9 構築！"
published: true
date     : 2019-11-10 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- DNS
---

Debian GNU/Linux 10 (buster) に DNS サーバを構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* サーバのローカル IP アドレスは `192.168.11.101`、グローバル IP アドレスは `xxx.yyy.zzz.aaa` を想定。
* ドメイン名は `mk-mode.com`、マシンのホスト名は `vbox`、ネームサーバホスト名は `ns` を想定。
* セカンダリ DNS は用意しない。
* root ユーザでの作業を想定。

### 1. BIND のインストール

（"dnsutils" は `dig` コマンド用）

``` text
# apt -y install bind9 dnsutils
```

### 2. BIND 設定ファイルの編集

File: `/etc/bind/named.conf`

{% highlight bash %}
include "/etc/bind/named.conf.options";
include "/etc/bind/named.conf.local";
#include "/etc/bind/named.conf.default-zones";  # <= コメント化（内部向け・外部向けゾーンファイルで定義するので）
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
    #recursion no;            # 再帰検索禁止

    # 外部向け正引きゾーン定義
    zone "mk-mode.com" {
        type master;
        file "/etc/bind/mk-mode.com.wan";
        allow-update { none; };
    };

    # 外部向け正引き情報を定義 *注
    zone "zzz.yyy.xxx.in-addr.arpa" {
        type master;
        file "/etc/bind/zzz.yyy.xxx.db";
        allow-update { none; };
    };
};
{% endhighlight %}

### 5. オプション設定ファイルの編集

その他の設定用ファイルを以下のように編集する。

File: `/etc/bind/named.conf.options`

{% highlight bash %}
options {
        directory "/var/cache/bind";

        // 問合わせを許可する範囲
        // (サーバー、ローカルネットワーク内のホストからの問合せのみ許可)
        allow-query { localhost; localnets; };      # <= 追加

        // ゾーン情報の転送を許可する範囲
        // (サーバー、ローカルネットワーク内のホストへのみ転送を許可)
        allow-transfer { localhost; localnets; };   # <= 追加

        // 再帰検索を許可する範囲
        // (サーバー、ローカルネットワーク内のホストのみ再検索を許可)
        allow-recursion { localhost; localnets; };  # <= 追加

        dnssec-validation auto;

        auth-nxdomain no;     # conform to RFC1035

        // IPv6 は使用しないので無効化
        //listen-on-v6 { any; };
        listen-on-v6 { none; };
};

# EDNS0 の無効化
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
        2019092501  ;Serial
        3600        ;Refresh
        1800        ;Retry
        604800      ;Expire
        86400       ;Minimum TTL
)

        IN  NS      ns.mk-mode.com.
        IN  A       192.168.11.101
        IN  MX 10   ns.mk-mode.com.
ns      IN  A       192.168.11.101
vbox    IN  A       192.168.11.101
aaaa    IN  A       192.168.11.2
bbbb    IN  A       192.168.11.3
cccc    IN  A       192.168.11.13
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
        2019092501  ;Serial
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
        2019092501  ;Serial
        3600        ;Refresh
        1800        ;Retry
        604800      ;Expire
        86400       ;Minimum TTL
)

        IN  NS      ns.mk-mode.com.
        IN  PTR     mk-mode.com.
        IN  A       255.255.255.0
101     IN  PTR     ns.mk-mode.com.
101     IN  PTR     vbox.mk-mode.com.
2       IN  PTR     aaaa.mk-mode.com.
3       IN  PTR     bbbb.mk-mode.com.
13      IN  PTR     cccc.mk-mode.com.
{% endhighlight %}

### 9. 外部向け逆引きゾーン定義ファイルの作成

File: `/etc/bind/zzz.yyy.xxx.db`

{% highlight bash linenos %}
$TTL 86400
@   IN  SOA     ns.mk-mode.com. root.mk-mode.com. (
        2019092501  ;Serial
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
nameserver 192.168.11.101  # <= 追加
nameserver 192.168.11.1    # <= 最初からあるルータの IP アドレス
domain     mk-mode.com     # <= 追加
{% endhighlight %}

### 11. IPv6 の無効化設定

システムとして IPv6 を無効にしている場合は、以下のように "/etc/default/bind9" を編集する。
（"/var/log/syslog" に `... named[9999]: error (network unreachable) resolving ...` のようなエラーが出力されないようにするため）

File: `/etc/default/bind9`

{% highlight bash %}
OPTIONS="-u bind -4"
{% endhighlight %}

### 12. BIND の再起動

設定を有効化するために BIND を再起動する。

``` text
# systemctl restart bind9
```

### 13. 動作確認

DNS サーバが正常に機能する（正引きで IP アドレス、逆引きでホスト名が返ってくる）か、確認してみる。

【内部向け正引きテスト】

``` text
# dig ns.mk-mode.com.

; <<>> DiG 9.11.5-P4-5.1-Debian <<>> ns.mk-mode.com.
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 26985
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: b8ed6df3b3add8bb18b15c085d8ac2cece96bff6079b7813 (good)
;; QUESTION SECTION:
;ns.mk-mode.com.                        IN      A

;; ANSWER SECTION:
ns.mk-mode.com.         86400   IN      A       192.168.11.101

;; AUTHORITY SECTION:
mk-mode.com.            86400   IN      NS      ns.mk-mode.com.

;; Query time: 1 msec
;; SERVER: 192.168.11.101#53(192.168.11.101)
;; WHEN: 水  9月 25 10:28:46 JST 2019
;; MSG SIZE  rcvd: 101

```

【内部向け逆引きテスト】

``` text
# dig -x 192.168.11.101

; <<>> DiG 9.11.5-P4-5.1-Debian <<>> -x 192.168.11.101
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 27772
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 990f5ee825e3e443667a27e85d8ac2e1c34ce89d07cd9173 (good)
;; QUESTION SECTION:
;101.11.168.192.in-addr.arpa.   IN      PTR

;; ANSWER SECTION:
101.11.168.192.in-addr.arpa. 86400 IN   PTR     ns.mk-mode.com.
101.11.168.192.in-addr.arpa. 86400 IN   PTR     vbox.mk-mode.com.

;; AUTHORITY SECTION:
11.168.192.in-addr.arpa. 86400  IN      NS      ns.mk-mode.com.

;; ADDITIONAL SECTION:
ns.mk-mode.com.         86400   IN      A       192.168.11.101

;; Query time: 0 msec
;; SERVER: 192.168.11.101#53(192.168.11.101)
;; WHEN: 水  9月 25 10:29:05 JST 2019
;; MSG SIZE  rcvd: 161

```

【外部向け正引きテスト】

``` text
# dig www.isc.org

; <<>> DiG 9.11.5-P4-5.1-Debian <<>> www.isc.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 54012
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 4, ADDITIONAL: 5

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1280
; COOKIE: 46b0707604bbb10bbf4c13705d8ac2f9612b9d5522a58e07 (good)
;; QUESTION SECTION:
;www.isc.org.                   IN      A

;; ANSWER SECTION:
www.isc.org.            60      IN      CNAME   dualstack.osff2.map.fastly.net.
dualstack.osff2.map.fastly.net. 30 IN   A       151.101.110.217

;; AUTHORITY SECTION:
fastly.net.             336     IN      NS      ns1.fastly.net.
fastly.net.             336     IN      NS      ns4.fastly.net.
fastly.net.             336     IN      NS      ns3.fastly.net.
fastly.net.             336     IN      NS      ns2.fastly.net.

;; ADDITIONAL SECTION:
ns1.fastly.net.         1686    IN      A       23.235.32.32
ns2.fastly.net.         2131    IN      A       104.156.80.32
ns3.fastly.net.         840     IN      A       23.235.36.32
ns4.fastly.net.         381     IN      A       104.156.84.32

;; Query time: 158 msec
;; SERVER: 192.168.11.1#53(192.168.11.1)
;; WHEN: 水  9月 25 10:29:29 JST 2019
;; MSG SIZE  rcvd: 264

```

【外部向け逆引きテスト】

``` text
# dig -x 151.101.110.217

; <<>> DiG 9.11.5-P4-5.1-Debian <<>> -x 151.101.110.217
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 44805
;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1280
; COOKIE: 1cc6b19a75dcf4d81f0997e35d8ac3220424e7db56851f98 (good)
;; QUESTION SECTION:
;217.110.101.151.in-addr.arpa.  IN      PTR

;; AUTHORITY SECTION:
151.in-addr.arpa.       18      IN      SOA     pri.authdns.ripe.net. dns.ripe.net. 1569365700 3600 600 864000 3600

;; Query time: 42 msec
;; SERVER: 192.168.11.1#53(192.168.11.1)
;; WHEN: 水  9月 25 10:30:10 JST 2019
;; MSG SIZE  rcvd: 145

```

### 14. ファイアウォール (ufw) の設定

実際に運用する場合は、外部からのTCP/UDP53番ポート(DNS)へのアクセスを許可する必要がある。

``` text
# ufw allow 53
Rule added

# ufw status
Status: active

To                         Action      From
--                         ------      ----
9999/tcp                   ALLOW       192.168.11.0/24
53                         ALLOW       Anywhere
```

---

以上。

