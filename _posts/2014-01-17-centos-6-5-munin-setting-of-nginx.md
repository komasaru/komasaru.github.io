---
layout   : single
title    : "CentOS 6.5 - サーバ監視ツール（munin）で Nginx を監視！"
published: true
date     : 2014-01-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- munin
- Nginx
---

前回は CentOS 6.5 サーバ上のサーバ監視ツール munin で MariaDB(MySQL) の監視設定を行いました。  
今回はサーバ監視ツール munin で Web(HTTP) サーバ Nginx の監視設定を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 閲覧に使用する Web(HTTP) サーバも Nginx を想定。
- Nginx 用プラグインはデフォルトで用意されているものを使用する。
- ローカルネットワークは "192.168.11.0/24" を想定。

### 1. Nginx 設定ファイル編集

Nginx 設定ファイルの "server" ディレクティブ内に以下を追加する。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
    server {
        listen 80;
        server_name localhost;
    
        # 以下を追加
        location /nginx_status {
            stub_status on;
            access_log off;
            allow 127.0.0.1;
            allow 192.168.11.0/24;
            deny all;
        }
    }
{% endhighlight %}

### 2. Nginx 再起動

``` text
# /etc/rc.d/init.d/nginx restart
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful
nginx を停止中:                                            [  OK  ]
nginx を起動中:                                            [  OK  ]
```

### 3. Munin-node 設定

File: `/etc/munin/plugin-conf.d/munin-node`

{% highlight bash linenos %}
[nginx*]                               # <= 追加
env.url http://localhost/nginx_status  # <= 追加
{% endhighlight %}

### 4. シンボリックリンク設定

``` text
# ln -s /usr/share/munin/plugins/nginx_request /etc/munin/plugins/nginx_request
# ln -s /usr/share/munin/plugins/nginx_status /etc/munin/plugins/nginx_status
```

ちなみに、デフォルトで用意されているプラグイン以外を使用するなら以下のようにすればよい。

``` text
# cd /usr/local/share
# mkdir munin
# cd munin
# git clone https://github.com/munin-monitoring/contrib.git
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx_connection_request /etc/munin/plugins/nginx_connection_request
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx-combined /etc/munin/plugins/nginx-combined
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx_memory /etc/munin/plugins/nginx_memory
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx_vhost_traffic /etc/munin/plugins/nginx_vhost_traffic
etc...
```

### 5. munin-node 再起動

``` text
# /etc/rc.d/init.d/munin-node restart
Stopping Munin Node agents:                                [  OK  ]
Starting Munin Node:                                       [  OK  ]
```

### 6. 動作確認

５分ほど待ってブラウザから `http://＜サーバ名orIPアドレス＞/munin` にアクセスして、"sensor" に "MySQL" 関連が追加されていることを確認する。  
当然ながら、マシンが仮想マシンなら値は取得できないので、ご注意を！

以下は、実運用中サーバでの例。

![CENTOS_6-5_MUNIN_NGINX]({{site.baseurl}}/images/2014/01/17/CENTOS_6-5_MUNIN_NGINX.png "CENTOS_6-5_MUNIN_NGINX")

---

次回は、Web(HTTP) サーバ Nginx で SSL 接続するための設定について紹介する予定です。

以上。

