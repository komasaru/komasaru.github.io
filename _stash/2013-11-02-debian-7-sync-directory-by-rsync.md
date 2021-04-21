---
layout   : single
title    : "Debian 7 Wheezy - Rsync でディレクトリ同期（xined 使用）！"
published: true
date     : 2013-11-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- rsync
---

Debian GNU/Linux 7.1.0 サーバに Rsync を導入して、クライアント側のディレクトリと同期させる方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- ローカルマシン（Linux Mint 14）からサーバマシン（Debian GNU/Linux 7.1.0 Wheezy）へ同期することを想定。
- サーバ側のバックアップ用ディレクトリは "/home/bak" とする。
- 同期元（クライアントマシン）の IP アドレスは 192.168.11.11 を想定。
- 同期先（サーバマシン）の IP アドレスは 192.168.11.2 を想定。
- 記事後半で xined を使用する方法を記述。
- 以下の記事内では、サーバ側の設定とクライアント側の設定を記述しているので混同しないこと。

### 1. 【サーバ側】Rsync インストール

同期先のサーバマシン（Debian）へ Rsync をインストールする。

``` text 
# aptitude -y install rsync
```

### 2. 【サーバ側】同期先ディレクトリ作成

同期先のサーバマシン（Debian）にディレクトリを作成する。

``` text 
# mkdir /home/bak
```

### 3. 【サーバ側】Rsync デフォルト設定ファイル編集

同期先のサーバマシン（Debian）で、 Rsync のデフォルト設定ファイル "/etc/default/rsync" を以下のようにする。

File: `/etc/default/rsync`

{% highlight bash linenos %} 
RSYNC_ENABLE=true  # <= Rsync 有効化
{% endhighlight %}

### 4. 【サーバ側】Rsync 設定ファイル作成

同期先のサーバマシン（Debian）で、 Rsync の設定ファイル "/etc/rsyncd.conf" を以下のように作成する。

File: `/etc/rsyncd.conf`

{% highlight bash linenos %} 
[backup]                     # <= rsync 実行時に使用する名前
path        = /home/bak      # <= 同期先ディレクトリ
hosts allow = 192.168.11.11  # <= 同期を許可するホスト(同期元ホストを指定)
hosts deny  = *
list        = true
uid         = root
gid         = root
read only   = false
{% endhighlight %}

### 5. 【サーバ側】ポート開放

当然、ファイアウォールの設定を行なっている場合はポート（TCP:873）の開放を行う必要がある。

iptables なら、 "/etc/iptables/rules.v4" に以下を追加する。

File: `/etc/iptables/rules.v4`

{% highlight bash linenos %} 
# TCP873番ポート(Rsync)へのアクセスを許可
-A INPUT -p tcp --dport 873 -j ACCEPT
{% endhighlight %}

そして、iptables を再起動する。

``` text 
# /etc/init.d/iptables-persistent restart
```

### 6. 【サーバ側】Rsync 起動

Rsync を起動する。

``` text 
# /etc/init.d/rsync start
Starting rsync daemon: rsync.
```

### 7. 【クライアント側】Rsync インストール

同期元のサーバマシン（Linux Mint）に rsync をインストールする。

``` text 
# aptitude -y install rsync
```

### 8. 【クライアント側】同期除外ファイル指定

同期元の対象ディレクトリ内から同期を除外するファイル/ディレクトリのリスト（ファイル名は任意）を作成する。 除外するファイル/ディレクトリがなければこの作業は不要。（ファイル名は "/etc/rsync_exclude.lst" を想定）

File: `/etc/rsync_exclude.lst`

{% highlight bash linenos %} 
hoge.txt
fuga.txt
{% endhighlight %}

### 9. 【クライアント側】同期の実行

以上の設定完了後、同期元のクライアントマシン（Linux Mint）で以下のようにして同期を行う。

``` text 
# rsync -avz --delete --exclude-from=/etc/rsync_exclude.lst /home/bak 192.168.11.2::backup
```

`-a` はアーカイブモード、`-v` は転送の詳細情報を表示、`-z` は圧縮転送するオプション。 `--delete` は同期元から削除されたら同期先も削除するオプション。除外するファイル/ディレクトリが無いのなら、`--exclude-from=/etc/rsync_exclude.lst` のオプションは不要。

### 10. 【サーバ側】xinetd インストール

常に rsync を起動してサーバからの同期要求を待機するのではなく、同期の要求があった場合のみ rsync を起動させる方法を採る。そのために、同期先のサーバマシン（Debian）に xinetd をインストールする。

``` text 
# aptitude -y install xinetd
```

### 11. 【サーバ側】xinetd 設定ファイル作成

同期先のサーバマシン（Debian）で xinetd の設定ファイル "/etc/xinetd.d/rsync" を作成する。

File: `/etc/xinetd.d/rsync`

{% highlight bash linenos %} 
service rsync
{
        disable         = no
        flags           = IPv6
        socket_type     = stream
        wait            = no
        user            = root
        server          = /usr/bin/rsync
        server_args     = --daemon
        log_on_failure  += USERID
}
{% endhighlight %}

### 12. 【サーバ側】xinetd 自動起動設定

同期先のサーバマシン（Debian）の xinetd をマシン起動時に自動起動するように設定する。（`sysv-rc-conf` 導入済みの場合）

``` text 
# sysv-rc-conf xinetd on
# sysv-rc-conf --list | grep xinetd
xinetd       0:off      1:off   2:on    3:on    4:on    5:on    6:off
```

もしくは、以下のようにする。

``` text 
# insserv -d xinetd
```

逆に、自動起動しないようにするには以下のようにする。（`sysv-rc-conf` 導入済みの場合）

``` text 
# sysv-rc-conf xinetd off
# sysv-rc-conf --list | grep xinetd
xinetd       0:off      1:off   2:off   3:off   4:off   5:off   6:off
```

あるいは、

``` text 
# insserv -r xinetd
```

### 13. 【クライアント側】同期実行（xinetd 使用）

以上の設定完了後、同期元のクライアントマシン（Linux Mint）で以下のようにして同期を行う。  
但し、今回は `xinetd` を使用するので、`rsync` は停止しておく。  
クライアント側からの同期実行時にサーバ側の `rsync` が自動で起動し同期が実行されるはずである。

``` text 
# rsync -avz --delete --exclude-from=/etc/rsync_exclude.lst /home/bak 192.168.11.2::backup
```

---

以上。

