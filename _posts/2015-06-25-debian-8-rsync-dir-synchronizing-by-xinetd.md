---
layout   : single
title    : "Debian 8 (Jessie) - Rsync でディレクトリ同期（xinetd 使用）！"
published: true
date     : 2015-06-25 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- rsync
---

Debian GNU/Linux 8 (Jessie) の Rsync サーバでクライアントとディレクトリ同期（xinetd 使用）する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* ローカルマシン（Linux Mint 17.1）からサーバマシン（Debian Jessie）へ同期することを想定。
* サーバ側のバックアップ用ディレクトリは "/home/bak" とする。
* 同期元（クライアントマシン）の IP アドレスは 192.168.11.11 を想定。
* 同期先（サーバマシン）の IP アドレスは 192.168.11.102 を想定。
* ファイアウォールに ufw を使用していることを想定。
* 記事後半で xinetd を使用する方法を記述。
* サーバ(Debian)側では IPv6 は使用しない。（IPv4 を使用）
* 以下の記事内では、サーバ側の設定とクライアント側の設定を記述しているので混同しないこと。

### 1. 【サーバ側】Rsync のインストール

同期先のサーバマシン(Debian)へ Rsync をインストールする。

``` text
# apt-get -y install rsync
```

### 2. 【サーバ側】同期先ディレクトリの作成

同期先のサーバマシン(Debian)にディレクトリを作成する。

``` text
# mkdir /home/bak
```

### 3. 【サーバ側】Rsync デフォルト設定ファイルの編集

同期先のサーバマシン(Debian)で、 Rsync のデフォルト設定ファイル "/etc/default/rsync" を以下のようにする。

File: `/etc/default/rsync`

{% highlight bash linenos %}
RSYNC_ENABLE=true  # <= Rsync 有効化
{% endhighlight %}

### 4. 【サーバ側】Rsync 設定ファイルの作成

同期先のサーバマシン(Debian)で、 Rsync の設定ファイル "/etc/rsyncd.conf" を以下のように作成する。

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

### 5. 【サーバ側】ファイアウォール(ufw)の設定

当然、ファイアウォールの設定を行なっている場合は TCP ポート 873 の開放を行う必要がある。

``` text
# ufw allow 873/tcp
Rule added
Rule added (v6)

# ufw status
    :
873/tcp                    ALLOW       Anywhere
    :
873/tcp                    ALLOW       Anywhere (v6)
```

### 6. 【サーバ側】Rsync の起動

``` text
# systemctl start rsync
```

### 7. 【クライアント側】Rsync のインストール

同期元のサーバマシン(Linux Mint)に rsync をインストールする。

``` text
# apt-get -y install rsync
```

### 8. 【クライアント側】同期除外ファイルの指定

同期元の対象ディレクトリ内から同期を除外するファイル/ディレクトリのリスト（ファイル名は任意）を作成する。 除外するファイル/ディレクトリがなければこの作業は不要。（ファイル名は "/etc/rsync_exclude.lst" を想定）

File: `/etc/rsync_exclude.lst`

{% highlight bash linenos %}
hoge.txt
fuga.txt
{% endhighlight %}

### 9. 【クライアント側】同期の実行

以上の設定完了後、同期元のクライアントマシン（Linux Mint）で以下のようにして同期を行う。

``` text
# rsync -avz --delete --exclude-from=/etc/rsync_exclude.lst /home/bak 192.168.11.102::backup
```

`-a` はアーカイブモード、`-v` は転送の詳細情報を表示、`-z` は圧縮転送するオプション。 `--delete` は同期元から削除されたら同期先も削除するオプション。除外するファイル/ディレクトリが無いのなら、`--exclude-from=/etc/rsync_exclude.lst` のオプションは不要。

### 10. 【サーバ側】xinetd のインストール

常に rsync を起動してサーバからの同期要求を待機するのではなく、同期の要求があった場合のみ rsync を起動させる方法を採る。そのために、同期先のサーバマシン(Debian)に xinetd をインストールする。

``` text
# apt-get -y install xinetd
```

### 11. 【サーバ側】xinetd 設定ファイルの作成

同期先のサーバマシン(Debian)で xinetd の設定ファイル "/etc/xinetd.d/rsync" を作成する。

File: `/etc/xinetd.d/rsync`

{% highlight bash linenos %}
service rsync
{
        disable         = no
        flags           = IPv4
        socket_type     = stream
        wait            = no
        user            = root
        server          = /usr/bin/rsync
        server_args     = --daemon
        log_on_failure  += USERID
}
{% endhighlight %}

### 12. 【サーバ側】Xinetd の再起動

rsync を停止し、xinetd を再起動する。（rsync を停止しないと、xinetd がポート番号の衝突で起動に失敗する）

``` text
# systemctl stop rsync
# systemctl restart xinetd
```

### 13. 【サーバ側】xinetd 自動起動の設定

同期先のサーバマシン(Debian)の xinetd をマシン起動時に自動起動するように設定する。

``` text
# systemctl enable xinetd
```

逆に、自動起動しないようにするには以下のようにする。

``` text
# systemctl disable xinetd
```

### 14. 【クライアント側】同期の実行（xinetd 使用）

以上の設定完了後、同期元のクライアントマシン(Linux Mint)で以下のようにして同期を行う。  
但し、今回は `xinetd` を使用するので、`rsync` は停止しておく。  
クライアント側からの同期実行時にサーバ側の `rsync` が自動で起動し同期が実行されるはずである。

``` text
# rsync -avz --delete --exclude-from=/etc/rsync_exclude.lst /home/bak 192.168.11.102::backup
```

---

以上。

