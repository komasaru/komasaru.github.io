---
layout   : single
title    : "Nginx - ログローテーション設定！"
published: true
date     : 2013-02-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- CentOS
- Nginx
---

以前、軽量 Web サーバ [Nginx](http://nginx.org/ja/ "Nginx") を CentOS にインストールしました。

- [Nginx - CentOS にインストール（ソースビルド）！]({{site.baseurl}}/2013/01/25/nginx-centos-install-by-src/ "Nginx - CentOS にインストール（ソースビルド）！")

しかし、ログローテーションの設定をしていなかったため、知らないうちにログが肥大化していました。（幸い、サーバにはまだ影響が出ていませんでしたが）

以下、[Nginx](http://nginx.org/ja/ "Nginx") のログをログローテーションする設定についてです。

<!--more-->

### 0. 前提条件

- OS は CentOS 6.3(32bit) を想定。（ディストリビューションが異なってもそれほど違いはないかと思う）
- `cron` による処理ではなく `logrotate` による処理を行う。
- CentOS に `logrotate` がインストール済みで、 `/etc/cron.daily` で毎日作動するような設定になっている。

### 1. 事前情報

まず、 CentOS の`logrotate` について、以下のことを理解しておく。

- 設定ファイル `/etc/logrotate.conf` が `/etc/logrotate.d` ディレクトリ内の各種設定ファイルをインクルードする設定になっている。
- 全てに共通する設定は `/etc/logrotate.conf` に記述しておけばよい。

以下は当方の `/etc/logrotate.conf`。（設定項目の説明は後述）

File: `/etc/logrotate.conf`

{% highlight bash linenos %}
# see "man logrotate" for details
# rotate log files weekly
weekly

# keep 4 weeks worth of backlogs
rotate 4

# create new (empty) log files after rotating old ones
create

# use date as a suffix of the rotated file
dateext

# uncomment this if you want your log files compressed
#compress

# RPM packages drop log rotation information into this directory
include /etc/logrotate.d

# no packages own wtmp and btmp -- we'll rotate them here
/var/log/wtmp {
    monthly
    create 0664 root utmp
	minsize 1M
    rotate 1
}

/var/log/btmp {
    missingok
    monthly
    create 0600 root utmp
    rotate 1
}

# system-specific logs may be also be configured here.
{% endhighlight %}

### 2. Nginx 用の設定ファイル作成

Nginx のログローテション設定ファイル `/etc/logrotate.d/nginx` を作成する。（設定項目の説明は後述）  
以下は当方の例で、 `/etc/logrotate.conf` に設定済みの項目は省略している。（わかりやすくするために再設定してもよい）

File: `/etc/logrotate.d/nginx`

{% highlight text linenos %} 
/var/log/nginx/*.log {
    missingok
    notifempty
    sharedscrits
    postrotate
        [ ! -f /var/run/nginx.pid ] || kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
{% endhighlight %}

### 3. 設定内容について

`/etc/logrotate.conf` や `/etc/logrotate.d/nginx` 内で設定して項目等について説明する。

- `weekly` ... ログローテーションを週毎に行う。
- `rotate 4` ... ログを４世代残す。
- `create` ... ログローテーション（リネーム）後、ログファイルを作成する。
- `dateext` ... ローテーションされたログファイルのサフィックスを日付形式にする。
- `compress` ... ローテーションされたログファイルを圧縮する。（コメントアウトで圧縮しない）
- `mmissingok` ... ログファイルが見つからなくてもエラーにしない。
- `notifempty` ... ログファイルが空ならローテーションしない。
- `sharedscripts` ... 以降に記述された処理をワイルドカードの指定に関わらず、１度だけ実行するという宣言文。
- `postrotate` - `endscript`  ... ログローテーション実施後に実行される部分。  
  【今回の最重要ポイント】  
  プロセスID `nginx.pid` が存在しなければ、プロセスに `USR1` シグナルを送ってログファイルを開き直す設定としている。  
  `HUP` シグナルを送るとプロセスが再起動してしまう（意図的に再起動させたい場合だけ `HUP` シグナルを送る）

### 4. 確認

後は、日が経過するのを待ち、ログがローテーションされているか確認する。  
強制的にログローテーションを試行してみたいのなら、以下のようなコマンドを実行する。  
（但し、ローテーションのタイミングによってはうまく機能しないので、失敗したと勘違いしないこと）

``` bash 
# logrotate -df /etc/logrotate.d/nginx
```

- オプション `d` は、デバッグモード（詳細を出力）
- オプション `f` は、ログローテーションの強制実行

### 5. 参考サイト

- [CommandLineJa](http://wiki.nginx.org/NginxCommandLineJa "CommandLineJa")
- [＠IT：logrotateの設定ファイルで指定できる主なコマンド](http://www.atmarkit.co.jp/flinux/rensai/linuxtips/747logrotatecmd.html "＠IT：logrotateの設定ファイルで指定できる主なコマンド")

---

これで、他の各種サーバのログ同様に Nginx のログもローテーションするようになりました。

以上。

