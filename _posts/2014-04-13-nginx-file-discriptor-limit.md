---
layout   : single
title    : "Nginx - ファイルディスクリプタ設定(Too many open files 対策)！"
published: true
date     : 2014-04-13 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Nginx
- Linux
---

Linux では、１プロセスが同時オープン可能なファイルディスクリプタの上限に達すると "Too many open files" などというエラーを発生します。  
OS 上でのファイルディスクリプタ設定についての記事は結構存在するので、対策はそれほど難しくありません。  
しかし、Web サーバ Nginx が絡むと若干ワナにかかる可能性があります。

以下、その事象、対策についての記録です。  
不勉強なので、それほど突っ込んだ内容ではありません。当方が行なった対策についての記録です。

<!--more-->

### 0. 前提条件

- CentOS 6.5 上での作業を想定。
- Web サーバは Nginx 1.4.7 を想定。
- Web アプリ・サイトは Ruby on Rails で構築されていることを想定。（当方の場合）

### 1. 発生事象・原因

突如、自前で運用中の Web サーバにアクセスると、ブラウザ上に以下のようなメッセージが表示されるようになった。

``` text
500 Internal Server Error
If you are the administrator of this website, then please read this web application's \
log file and/or the web server's log file to find out what went wrong.
```

そして、 Ruby on Rails のログには以下のようなメッセージが出力されていた。（一部伏せ字）

File: `production.log`

{% highlight text linenos %}
F, [2014-04-04T17:16:57.934648 #15986] FATAL -- :
Errno::EMFILE (Too many open files - /usr/bin/xxxxxx):
  app/controllers/json_blog_controller.rb:9999:in `xxxxxxxxxx'
  app/controllers/json_blog_controller.rb:99:in `xxxxx'
{% endhighlight %}

- `EMFILE` ... 「プロセスが使用中のファイル・ディスクリプタが多すぎる」という意味。

このエラーからも分かるように「**プロセスが使用中のファイル・ディスクリプタが多すぎる**」ことが原因のようだ。

### 2. 対策（Nginx 上）

#### 2-1. 現状確認

以下のようにして、現状の上限設定を確認する。

``` text
# ps ax | grep nginx | grep worker
 9846 ?        S      0:00 nginx: worker process

# cat /proc/9846/limits | grep 'open files'
Limit                     Soft Limit           Hard Limit           Units
Max cpu time              unlimited            unlimited            seconds
Max file size             unlimited            unlimited            bytes
Max data size             unlimited            unlimited            bytes
Max stack size            10485760             unlimited            bytes
Max core file size        0                    unlimited            bytes
Max resident set          unlimited            unlimited            bytes
Max processes             7868                 7868                 processes
Max open files            1024                 4096                 files
Max locked memory         65536                65536                bytes
Max address space         unlimited            unlimited            bytes
Max file locks            unlimited            unlimited            locks
Max pending signals       7868                 7868                 signals
Max msgqueue size         819200               819200               bytes
Max nice priority         0                    0
Max realtime priority     0                    0
Max realtime timeout      unlimited            unlimited            us
```

`Max open files` の「ソフト上限値」がデフォルトの `1024` となっている。

#### 2-2. Nginx 設定

Nginx の設定ファイルを以下のように編集する。（必要部分のみ抜粋）

- プロセス毎のファイルディスクリプタ上限数を指定する設定項目 `worker_rlimit_nofile` という項目を追加する。
- `worker_rlimit_nofile` の設定値は `worker_connections` の値の３〜４倍程度がよいらしい。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}

worker_rlimit_nofile  4096;  # <= worker_connections の 3 - 4 倍程度

events {
      worker_connections  1024;
}
{% endhighlight %}

設定変更後、Nginx を再起動する。（`nginx -t` で構文チェックしてからでもよい）

``` text
# /etc/init.d/nginx restart
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful
nginx を停止中:                                            [  OK  ]
nginx を起動中:                                            [  OK  ]
```

#### 2-3. 再確認

以下のようにして、設定後の状況を確認する。

``` text
# ps ax | grep nginx | grep worker
11130 ?        S      0:00 nginx: worker process

# cat /proc/11130/limits | grep 'open files'
Limit                     Soft Limit           Hard Limit           Units
Max cpu time              unlimited            unlimited            seconds
Max file size             unlimited            unlimited            bytes
Max data size             unlimited            unlimited            bytes
Max stack size            10485760             unlimited            bytes
Max core file size        0                    unlimited            bytes
Max resident set          unlimited            unlimited            bytes
Max processes             7868                 7868                 processes
Max open files            4096                 4096                 files
Max locked memory         65536                65536                bytes
Max address space         unlimited            unlimited            bytes
Max file locks            unlimited            unlimited            locks
Max pending signals       7868                 7868                 signals
Max msgqueue size         819200               819200               bytes
Max nice priority         0                    0
Max realtime priority     0                    0
Max realtime timeout      unlimited            unlimited            us
```

`Max open files` の「ソフト上限値」が設定したとおりになった。

### 3. 対策（OS 上）

Nginx の各プロセスの上限値の設定は上記のとおりだが、OS にもファイルディスクリプタの上限を設定する。

#### 3-1. 現状確認

以下のようにして現状を確認する。（"/proc/sys/fs" ディレクトリ配下にファイルシステム関連の設定ファイルがある）

``` text
# cat /proc/sys/fs/file-nr
3264    0       100324
```

左から、「オープンされているファイル数」、「空きファイル管理データの数」、「システム中のオープンファイル管理データの最大数（file-maxと同じ）」となっている。

「システム中のオープンファイル管理データの最大数」は以下でも確認できる。

``` text
# cat /proc/sys/fs/file-max
100324
```

#### 3-2. 設定変更

「システム中のオープンファイル管理データの最大数」を以下のようにして設定する。（現状の倍程度にしてみた）

``` text
# echo 200000 > /proc/sys/fs/file-max
# cat /proc/sys/fs/file-max
200000
```

#### 3-3. 恒常的な設定

前述の方法では、マシンを再起動した際に設定が元に戻ってしまうので、以下のようにする。

File: `/etc/sysctl.conf`

{% highlight bash linenos %}
fs.file-max=200000  # <= 追加
{% endhighlight %}

``` text
# sysctl -p
```

#### 3-4. システムユーザ毎の設定

上記の方法は OS 全体に対しての設定であったが、システムユーザ単位にも設定しておく。

File: `/etc/security/limits.conf`

{% highlight bash linenos %}
* soft nofile 4096
* hard nofile 4096
{% endhighlight %}

- `*` は全ユーザという意味。（ユーザ名を個別に指定することも可）
- `soft` の値を超えると警告が出る。
- `hard` の値を超えることはできない。
- `soft` の値は `hard` 以下にする必要がある。

``` text
# sysctl -p
```

### 4. 注意

- `ulimit` コマンドは一時的に設定を変更するもの。  
  各サービスの起動スクリプト内に記述するなどして使用する。
- "/etc/security/limits.conf" は PAM 認証後に有効になる設定。  
  PAM 認証を介さないものは、この設定に意味はない。
- `ulimit` コマンドや `limits.conf` で設定した値は、 Nginx の `worker_rlimit_nofile` で上書きされる。

### 5. 参考サイト

- [nginx で Too many open files エラーに対処する - Shin x blog](http://www.1x1.jp/blog/2013/02/nginx_too_many_open_files_error.html "nginx で Too many open files エラーに対処する - Shin x blog")
- [＠IT：/procによるLinuxチューニング ［後編］（2/4）](http://www.atmarkit.co.jp/flinux/special/proctune/proctune02b.html "＠IT：/procによるLinuxチューニング ［後編］（2/4）")

---

詳細に突っ込んだ調査はしていませんが、ファイルディスクリプタの上限値設定には色々とワナが潜んでいるようです。  
ワナが潜んでいるということを知っておくだけでも、有事の際の不具合特定の高速化に役立つでしょう。

以上。

