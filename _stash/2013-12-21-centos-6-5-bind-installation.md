---
layout   : single
title    : "CentOS 6.5 - DNS サーバ（BIND）構築！"
published: true
date     : 2013-12-21 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- DNS
---

前回は CentOS 6.5 サーバにファイアウォール iptables の構築を行いました。  
今回は DNS サーバ BIND の構築を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- セカンダリネームサーバは構築しない。
- 使用しているルータは DNSSEC 非対応。
- PPPoE 環境ではない。
- IPv6 は使用しない。
- グローバル IP アドレスは固定。（aaa.bbb.ccc.ddd と仮定）
- ドメイン名は "mk-mode.com"
- ローカルネットワークは "192.168.11.0/24"
- サーバマシンのローカル IP アドレスは "192.168.11.102"
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. BIND インストール

DNS サーバである BIND と chroot 化ツールを以下のようにしてインストールする。

``` text
# yum -y install bind bind-chroot
```

### 2. chroot 化スクリプト作成

BIND を chroot 化するためのスクリプトを以下のように作成する。

File: `bind-chroot-admin`

{% highlight bash linenos %}
#!/bin/sh

# bind-chroot install check
rpm -q bind-chroot > /dev/null 2>&1
[ $? -ne 0 ] && echo bind-chroot not install && exit 1

# bind-chroot enabled
sed -i '/^ROOTDIR=/d' /etc/sysconfig/named
echo ROOTDIR=/var/named/chroot >> /etc/sysconfig/named

# file copy
filelist=`mktemp`
rpm -ql bind|grep ^/etc >> ${filelist}
rpm -ql bind|grep ^/var >> ${filelist}
for file in `cat ${filelist}`
do
  # directory make
  if [ -d ${file} ]; then
      DIRNAME=/var/named/chroot${file}
      [ ! -d ${DIRNAME} ] && mkdir -p ${DIRNAME}
  fi
  # file copy
  if [ -f ${file} ]; then
      DIRNAME=/var/named/chroot`dirname ${file}`
      [ ! -d ${DIRNAME} ] && mkdir -p ${DIRNAME}
      /bin/cp -a ${file} ${DIRNAME}
  fi
done
rm -f ${filelist}

chown named:named /var/named/chroot/var/named/data
chmod 770 /var/named/chroot/var/named/data
chown named:named /var/named/chroot/var/named/dynamic

exit
{% endhighlight %}

### 3. chroot 化スクリプト実行

作成した chroot 化スクリプトを実行する。

``` text
# sh bind-chroot-admin
```

### 4. BIND 設定ファイル編集

File: `/var/named/chroot/etc/named.conf`

{% highlight bash linenos %}
options {
        #listen-on port 53 { 127.0.0.1; };          # <= コメントアウト
        #listen-on-v6 port 53 { ::1; };             # <= コメントアウト
        version         "unknown";                  # <= 追加（bind バージョン情報非表示）
        directory       "/var/named";
        dump-file       "/var/named/data/cache_dump.db";
        statistics-file "/var/named/data/named_stats.txt";
        memstatistics-file "/var/named/data/named_mem_stats.txt";
        allow-query     { localhost; localnets; };  # <= 変更(ローカルホスト、ローカルネットからの問合せのみ許可)
        recursion yes;
        empty-zones-enable no;   # <= 追加（起動時の空ゾーンエラーログの出力無効化）
        
        dnssec-enable no;        # <= 変更（DNSSEC 非対応なので）
        dnssec-validation no;    # <= 変更（        〃         ）
        #dnssec-lookaside auto;  # <= コメントアウト（        〃         ）

        /* Path to ISC DLV key */
        bindkeys-file "/etc/named.iscdlv.key";
        forwarders{            # <= 追加
                192.168.11.1;  # <= 追加（ルータの IP アドレス）
        };                     # <= 追加

        managed-keys-directory "/var/named/dynamic";
};

logging {
        channel default_debug {
                file "data/named.run";
                severity dynamic;
        };
        category lame-servers { null; };  # <= 追加（エラーログの出力制御）
};

view "internal" {                           # <= 追加
        match-clients { localnets; };       # <= 追加
        match-destinations { localnets; };  # <= 追加

        zone "." IN {
                type hint;
                file "named.ca";
        };
        
        include "/etc/named.rfc1912.zones";
        include "/etc/named.root.key";
        include "/etc/named.mk-mode.com.zone";  # <= 追加
};                                                # <= 追加

view "external" {                                   # <= 追加（固定 IP 環境なので）
        match-clients { any; };                     # <= 追加（固定 IP 環境なので）
        match-destinations { any; };                # <= 追加（固定 IP 環境なので）
        recursion no;                               # <= 追加（固定 IP 環境なので）
        include "/etc/named.mk-mode.com.zone.wan";  # <= 追加（固定 IP 環境なので）
};                                                  # <= 追加（固定 IP 環境なので）
{% endhighlight %}

### 5. 内部向けゾーン定義ファイル作成

内部向けゾーン定義ファイルを以下のように作成する。

File: `/var/named/chroot/etc/named.mk-mode.com.zone`

{% highlight bash linenos %}
zone "mk-mode.com" {
        type master;
        file "mk-mode.com.db";
};
zone "11.168.192.in-addr.arpa" {
        type master;
        file "11.168.192.in-addr.arpa.db";
};
{% endhighlight %}

### 6. 外部向けゾーン定義ファイル作成

固定 IP 環境なので、外部向けゾーン定義ファイルを作成する。

File: `/var/named/chroot/etc/named.mk-mode.com.zone.wan`

{% highlight bash linenos %}
zone "mk-mode.com" {
        type master;
        file "mk-mode.com.db.wan";
        allow-query { any; };
};
zone "ccc.bbb.aaa.in-addr.arpa" {
        type master;
        file "ccc.bbb.aaa.in-addr.arpa.db";
        allow-query { any; };
};
{% endhighlight %}

### 7. IPv4 のみ有効化

IPv6 は使用しないので、余計なエラーログを出力しないよう IPv4 のみ有効にする。

File: `/etc/sysconfig/named`

{% highlight bash linenos %}
OPTIONS="-4"  # <= 最終行へ追加
{% endhighlight %}

### 8. ルートゾーン最新化

世界に13台しかないルートゾーン "named.ca" を最新化しておく。

``` text
# dig . ns @198.41.0.4 +bufsize=1024 > /var/named/chroot/var/named/named.ca
```

### 9. ルートゾーン最新化スクリプト作成

ルートゾーンを自動で最新化するためのスクリプトを以下のように作成する。

File: `named.root_update`

{% highlight bash linenos %}
#!/bin/bash

new=`mktemp`
errors=`mktemp`

dig . ns @198.41.0.4 +bufsize=1024 > $new 2> $errors

if [ $? -eq 0 ]; then
    sort_new=`mktemp`
    sort_old=`mktemp`
    diff_out=`mktemp`
    sort $new > $sort_new
    sort /var/named/chroot/var/named/named.ca > $sort_old
    diff --ignore-matching-lines=^\; $sort_new $sort_old > $diff_out
    if [ $? -ne 0 ]; then
        (
         echo '-------------------- old named.root --------------------'
         cat /var/named/chroot/var/named/named.ca
         echo
         echo '-------------------- new named.root --------------------'
         cat $new
         echo '---------------------- difference ----------------------'
         cat $diff_out
        ) | mail -s 'named.root updated' root
        cp -f $new /var/named/chroot/var/named/named.ca
        chown named. /var/named/chroot/var/named/named.ca
        chmod 644 /var/named/chroot/var/named/named.ca
        /etc/rc.d/init.d/named restart > /dev/null
    fi
    rm -f $sort_new $sort_old $diff_out
else
    cat $errors | mail -s 'named.root update check error' root
fi
rm -f $new $errors
{% endhighlight %}

### 10. ルートゾーン最新化スクリプト権限設定

作成したルートゾーン最新化スクリプトに実行権限を付与する。

``` text
# chmod 700 named.root_update
```

### 11. ルートゾーン最新化スクリプト自動実行設定

ルートゾーン最新化スクリプトが毎月自動で実行されるよう cron ディレクトリへ移動する。

``` text
# mv named.root_update /etc/cron.monthly/
```

### 12. 内部向け正引きゾーンデータベース作成

内部のドメイン名から IP アドレスを引くための正引きゾーンデータベースを以下のように作成する。（当方の例）

File: `/var/named/chroot/var/named/mk-mode.com.db`

{% highlight bash linenos %}
$TTL    86400
@       IN      SOA     mk-mode.com.  root.mk-mode.com.(
                                      2013120801; Serial
                                      28800      ; Refresh
                                      14400      ; Retry
                                      3600000    ; Expire
                                      86400 )    ; Minimum
         IN NS    mk-mode.com.
         IN MX 10 mk-mode.com.
@        IN A     192.168.11.102
*        IN A     192.168.11.102
sd11g5   IN A     192.168.11.2
noah     IN A     192.168.11.3
kuro-box IN A     192.168.11.4
terrano  IN A     192.168.11.11
st62k    IN A     192.168.11.12
p183     IN A     192.168.11.13
vmware   IN A     192.168.11.101
vbox     IN A     192.168.11.102
{% endhighlight %}

### 13. 内部向け逆引きゾーンデータベース作成

内部の IP アドレスからドメイン名を引くための逆引きゾーンデータベースを以下のように作成する。（当方の例）

File: `/var/named/chroot/var/named/11.168.192.in-addr.arpa.db`

{% highlight bash linenos %}
$TTL    86400
@       IN      SOA     mk-mode.com.  root.mk-mode.com.(
                                      2013120801 ; Serial
                                      28800      ; Refresh
                                      14400      ; Retry
                                      3600000    ; Expire
                                      86400 )    ; Minimum
              IN      NS    mk-mode.com.
102           IN      PTR   mk-mode.com.
2             IN      PTR   sd11g5.mk-mode.com.
3             IN      PTR   noah.mk-mode.com.
4             IN      PTR   kuro-box.mk-mode.com.
11            IN      PTR   terrano.mk-mode.com.
12            IN      PTR   st62k.mk-mode.com.
13            IN      PTR   p183.mk-mode.com.
101           IN      PTR   vmware.mk-mode.com.
102           IN      PTR   vbox.mk-mode.com.
{% endhighlight %}

### 14. 外部向け正引きゾーンデータベース作成

外部のドメイン名から IP アドレスを引くための正引きゾーンデータベースを以下のように作成する。（当方の例）

File: `/var/named/chroot/var/named/mk-mode.com.db.wan`

{% highlight bash linenos %}
$TTL    86400
@       IN      SOA     ns1.mk-mode.com.  root.mk-mode.com.(
                                      2013120801 ; Serial
                                      7200       ; Refresh
                                      7200       ; Retry
                                      2419200    ; Expire
                                      86400 )    ; Minimum
        IN NS    ns1.mk-mode.com.
        IN MX 10 mk-mode.com.
ns1     IN A     aaa.bbb.ccc.ddd
@       IN A     aaa.bbb.ccc.ddd
www     IN A     aaa.bbb.ccc.ddd
ftp     IN A     aaa.bbb.ccc.ddd
mail    IN A     aaa.bbb.ccc.ddd
mk-mode.com. IN TXT "v=spf1 ip4:aaa.bbb.ccc.ddd ~all"
{% endhighlight %}

### 15. 外部向け逆引きゾーンデータベース作成

外部の IP アドレスからドメイン名を引くための逆引きゾーンデータベースを以下のように作成する。（当方の例）

File: `/var/named/chroot/var/named/ccc.bbb.aaa.in-addr.arpa.db`

{% highlight bash linenos %}
$TTL    86400
@       IN      SOA     mk-mode.com. root.mk-mode.com.(
                        2013120801      ; serial
                        3600            ; refresh (1 hour)
                        900             ; retry (15 minutes)
                        604800          ; expire (1 week)
                        86400           ; negative (1 day)
)
        IN      NS              mk-mode.com.
ddd     IN      PTR             mk-mode.com.
{% endhighlight %}

### 16. BIND 起動

BIND を以下のようにして起動する。

``` text
# /etc/rc.d/init.d/named start
Generating /etc/rndc.key:                                  [  OK  ]
namedを起動中:                                             [  OK  ]
```

起動に失敗する場合は、設定に誤りがある可能性が高いのでよく見直す。  
ゾーンデータベースファイルを編集した場合はシリアル番号（日付＋2桁数字）をカウントアップすること（重要）。

### 17. BIND 自動起動設定

マシン起動時に自動で BIND が起動するよう設定する。

``` text
# chkconfig named on
# chkconfig --list named  # <= 2,3,4,5 が "on" であることを確認
```

### 18. 問い合わせ先 DNS サーバ設定

初期設定時に DNS の IP アドレスをルータの IP アドレスに設定していたが、BIND（サーバマシン）の IP アドレスに変更する。

File: `/etc/sysconfig/network-scripts/ifcfg-eth0`

{% highlight bash linenos %}
DNS1=127.0.0.1  # <= ルータの IP アドレスから自身（ローカル）IP アドレスに変更
{% endhighlight %}

### 19. BIND 再起動

DNS サーバ設定変更を有効化するために、BIND を再起動する。

``` text
# /etc/rc.d/init.d/network restart
named を停止中: .                                          [  OK  ]
named を起動中:                                            [  OK  ]
```

### 20. 動作確認

ローカルの Linux マシンからの内部正引きテスト。  
"ANSWER SECTION" で IP アドレスが返却されていることを確認する。

``` text
# dig mk-mode.com

; <<>> DiG 9.8.1-P1 <<>> mk-mode.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 14521
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 0

;; QUESTION SECTION:
;mk-mode.com.                   IN      A

;; ANSWER SECTION:
mk-mode.com.            86400   IN      A       192.168.11.102

;; AUTHORITY SECTION:
mk-mode.com.            86400   IN      NS      mk-mode.com.

;; Query time: 1 msec
;; SERVER: 127.0.1.1#53(127.0.1.1)
;; WHEN: Sun Dec  8 15:26:19 2013
;; MSG SIZE  rcvd: 59
```

ローカルの Linux マシンからの内部逆引きテスト。  
"ANSWER SECTION" でホスト名が返却されていることを確認する。

``` text
# dig -x 192.168.11.102

; <<>> DiG 9.8.1-P1 <<>> -x 192.168.11.102
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 25821
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 1, ADDITIONAL: 1

;; QUESTION SECTION:
;102.11.168.192.in-addr.arpa.   IN      PTR

;; ANSWER SECTION:
102.11.168.192.in-addr.arpa. 86400 IN   PTR     vbox.mk-mode.com.
102.11.168.192.in-addr.arpa. 86400 IN   PTR     mk-mode.com.

;; AUTHORITY SECTION:
11.168.192.in-addr.arpa. 86400  IN      NS      mk-mode.com.

;; ADDITIONAL SECTION:
mk-mode.com.            86400   IN      A       192.168.11.102

;; Query time: 0 msec
;; SERVER: 127.0.1.1#53(127.0.1.1)
;; WHEN: Sun Dec  8 15:28:25 2013
;; MSG SIZE  rcvd: 119
```

ローカルの Linux マシンからの外部正引きテスト。  
"ANSWER SECTION" で IP アドレスが返却されていることを確認する。

``` text
# dig www.isc.org

; <<>> DiG 9.8.1-P1 <<>> www.isc.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 50478
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 4, ADDITIONAL: 3

;; QUESTION SECTION:
;www.isc.org.                   IN      A

;; ANSWER SECTION:
www.isc.org.            60      IN      A       149.20.64.69

;; AUTHORITY SECTION:
isc.org.                4849    IN      NS      ord.sns-pb.isc.org.
isc.org.                4849    IN      NS      sfba.sns-pb.isc.org.
isc.org.                4849    IN      NS      ams.sns-pb.isc.org.
isc.org.                4849    IN      NS      ns.isc.afilias-nst.info.

;; ADDITIONAL SECTION:
sfba.sns-pb.isc.org.    55229   IN      A       149.20.64.3
ord.sns-pb.isc.org.     55229   IN      A       199.6.0.30
ams.sns-pb.isc.org.     2912    IN      A       199.6.1.30

;; Query time: 2712 msec
;; SERVER: 127.0.1.1#53(127.0.1.1)
;; WHEN: Sun Dec  8 15:29:36 2013
;; MSG SIZE  rcvd: 192
```

ローカルの Linux マシンからの外部逆引きテスト。  
"ANSWER SECTION" でホスト名が返却されていることを確認する。

``` text
# dig -x 149.20.64.69

; <<>> DiG 9.8.1-P1 <<>> -x 149.20.64.69
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 54586
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 3, ADDITIONAL: 3

;; QUESTION SECTION:
;69.64.20.149.in-addr.arpa.     IN      PTR

;; ANSWER SECTION:
69.64.20.149.in-addr.arpa. 3600 IN      PTR     banana.isc.org.

;; AUTHORITY SECTION:
64.20.149.in-addr.arpa. 3600    IN      NS      ord.sns-pb.isc.org.
64.20.149.in-addr.arpa. 3600    IN      NS      sfba.sns-pb.isc.org.
64.20.149.in-addr.arpa. 3600    IN      NS      ams.sns-pb.isc.org.

;; ADDITIONAL SECTION:
ams.sns-pb.isc.org.     2859    IN      A       199.6.1.30
sfba.sns-pb.isc.org.    55176   IN      A       149.20.64.3
ord.sns-pb.isc.org.     55176   IN      A       199.6.0.30

;; Query time: 198 msec
;; SERVER: 127.0.1.1#53(127.0.1.1)
;; WHEN: Sun Dec  8 15:30:29 2013
;; MSG SIZE  rcvd: 181
```

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、 FTP サーバ vsftpd の構築について紹介する予定です。

以上。

