---
layout   : single
title    : "プロキシ経由時のリモートアドレスについて！"
published: true
date     : 2013-01-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Rails
- Nginx
- Unicorn
- Proxy
---

少し前から当方の Ruby on Rails 製のホームページを Apache + Passenger から Nginx + Unicorn に変更して運用しています。

しかし当初、プロキシの関係で、アクセス解析処理の部分でリモートアドレスが正常に取得できなくなっていました。

以下、対応記録です。

<!--more-->

### 1. 現象

Nginx でバックエンド（プロキシサーバ）へ HTTP ヘッダ情報を送信しているにも関わらず、Rails 側で環境変数 `REMOTE_ADDR` を取得すると全て "127.0.0.1" になってしまう。  
Nginx のログでは正常にリモートIPアドレスが取得できるのを確認できる。  
Nginx の設定内容は以下の通り。

File: `nginx.conf`

{% highlight bash linenos %}
http {

    :

    upstream unicorn.rails_app {
        server unix:/var/www/rails/rails_app/tmp/sockets/unicorn.sock fail_timeout=0;
     }

    server {

        :

        location /rails_app {
            alias /var/www/rails/rails_app/public;
            index  index.html index.htm index;

            try_files $uri/index.html $uri.html $uri @unicorn_rails_app;
        }

        location @unicorn_rails_app {
            proxy_redirect off;
            proxy_set_header Host               $host;
            proxy_set_header X-Real-IP          $remote_addr;
            proxy_set_header X-Forwarded-Host   $host;
            proxy_set_header X-Forwarded-Server $host;
            proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
            proxy_pass http://unicorn.rails_app;
        }

        :

    }
}
{% endhighlight %}

### 2. 原因

バックエンド（プロキシサーバ）がソケットからリモートIPアドレスを取得しているから。  

### 3. 対策

Apache なら該当のモジュールを導入すれば良いですが、Nginx ではそれができない（知らないだけ？）ので、Rails 側でリモートIPアドレスを取得する際の処理を以下のように変更した。

【変更前】環境変数 `REMOTE_ADDR` からIPアドレスを取得する。  
　　↓  
【変換後】環境変数 `HTTP_X_FORWARDED_FOR` に設定されていればその値を取得し、設定されていなければ環境変数 `REMOTE_ADDR` から取得する。

REMOTE_ADDR : プロキシサーバ非経由時の接続元IPアドレス  
HTTP_X_FORWARDED_FOR : プロキシサーバ経由時の大元の接続元IPアドレス

参考までに、当方の Rails サイトの controller の場合この部分を以下のようにした。  
`HTTP_X_FORWARDED_FOR` の仕様上、"client, proxy1, proxy2, ..." とカンマで区切られることを考慮している（自前のサーバなので、プロキシが多段にならないことは知っているが・・・）

``` ruby 

    remoteaddr = 'unknown'

    if request.env['HTTP_X_FORWARDED_FOR']
      remoteaddr = request.env['HTTP_X_FORWARDED_FOR'].split(",")[0]
    else
      remoteaddr = request.env['REMOTE_ADDR'] if request.env['REMOTE_ADDR']
    end

```

さらに、環境変数 `HTTP_X_FORWARDED_FOR` の他に環境変数 `HTTP_CLIENT_IP` をチェックするという考え方もある。  
この `HTTP_CLIENT_IP` にもプロキシサーバ経由時の大元の接続元IPアドレスが格納されているらしい。（改ざんされる可能性のある環境変数のようですが・・・）

---

プロキシサーバについて知っていなければ、ハマってしまうかもしれない内容でした。

以上。

