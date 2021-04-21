---
layout   : single
title    : "CentOS - munin で Nginx 監視！"
published: true
date     : 2013-06-13 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- CentOS
- munin
---

過去、サーバ監視ツール munin については何回か記録してきました。  
（過去記事にはタグがうまく付いていないので、適時検索してくだい。）

今回は、munin で Web サーバ Nginx も監視できるように設定を追加してみました。

<!--more-->

#### 0. 前提条件

以下の条件を想定しています。環境により適宜読み替えてください。

- CentOS 6.4 での作業を想定。
- Web サーバは Nginx 1.4.1 を使用している。  
  ソースをコンパイルしてインストールする場合は、`--with-http_stub_status_module` オプションを指定してコンパイルすること。
- munin がインストール済みである。

#### 1. Nginx 設定ファイル編集

設定ファイルの `server` ディレクティブに `nginx_status` に関する記述を追加する。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight text linenos %}
server {
    listen 80;
    server_name localhost;
    # 以下を追加
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
{% endhighlight %}

#### 2. Nginx 再起動

Nginx を再起動する。

``` text 
# service nginx restart
```

#### 3. munin-node 設定

munin-node 設定ファイルに以下の記述を追加する。

File: `/etc/munin/plugin-conf.d/munin-node`

{% highlight text linenos %}
[nginx*]
env.url http://localhost/nginx_status
{% endhighlight %}

#### 4. プラグインリンク設定

Munin の Nginx 用プラグインのリンクを作成する。

``` text 
# ln -s /usr/share/munin/plugins/nginx_request /etc/munin/plugins/nginx_request
# ln -s /usr/share/munin/plugins/nginx_status /etc/munin/plugins/nginx_status
```

#### 4-2. プラグインリンク設定（その２）

上記のプラグインは Munin にデフォルトで用意されているものだが、ダウンロードすれば他のプラグインも使用可能。  
その場合は、以下のようにする。（当方は取り急ぎデフォルトのプラグインのみで運用）

``` text 
# cd /usr/local/share
# mkdir munin
# cd munin
# git clone https://github.com/munin-monitoring/contrib.git
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx_connection_request /etc/munin/plugins/nginx_connection_request
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx-combined /etc/munin/plugins/nginx-combined
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx_memory /etc/munin/plugins/nginx_memory
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx_vhost_traffic /etc/munin/plugins/nginx_vhost_traffic
```

使用したいプラグインのリンクを貼る)

#### 5. Munin-node 再起動

設定を有効化するために Munin-node を再起動する。

``` text 
# service munin-node restart
```

#### 6. 動作確認

cron で５分間隔で更新されるので、しばらくたってからブラウザで "http://＜サーバアドレス＞/munin" にアクセスし確認してみる。  
成功していれば、"Categories" に "nginx" が出来ていて、 "nginx" リンククリックでグラフが表示されるはずであす。

![CENTOS_MUNIN_NGINX]({{site.baseurl}}/images/2013/06/13/CENTOS_MUNIN_NGINX.png "CENTOS_MUNIN_NGINX")

---

CentOS か Munin のバージョンが古いとうまく動かないかも知れません。（そういう記事を目にした）

当方は、取り急ぎデフォルトで用意されているプラグインを使用していますが、様子を見て追加等するかも知れません。

以上。

