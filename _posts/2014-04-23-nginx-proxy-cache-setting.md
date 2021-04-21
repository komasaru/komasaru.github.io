---
layout   : single
title    : "Nginx - リバースプロキシキャッシュ設定（基本的）！"
published: true
date     : 2014-04-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Nginx
- Proxy
---

Nginx のリバースプロキシでファイルをキャッシュする方法についての備忘録です。

<!--more-->

### 0. 前提条件

- CentOS 6.5 での作業を想定。
- Nginx 1.4.7 での作業を想定。
- バックエンドは Unicorn(Ruby on Rails) を想定。
- バックエンドとの通信にはソケットを使用することを想定。
- ベンチマークテストに `ab` コマンドを使用するので、未インストールならインストールしておく。

### 1. Nginx 設定

Nginx の設定ファイルに以下のように記述を追加する。  
以下は当方の一例で、該当箇所のみ抜粋。（`try_files` を使ったり等、色々と書き方は考えられる）

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
http {
    # Reverse Proxy
    proxy_cache_path /var/cache/nginx/cache levels=1:2 keys_zone=my-key:8m max_size=50m inactive=120m;
    proxy_temp_path /var/cache/nginx/tmp;

    # ヘッダ情報$
    proxy_redirect   off;
    proxy_set_header Host               $host;
    proxy_set_header X-Real-IP          $remote_addr;
    proxy_set_header X-Forwarded-Host   $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;

    # Unicorn との接続に Unix Domain Socket を使用する場合
    # ( unicorn.rb の設定と合わせること )
    upstream unicorn-sock {
        server unix:/path/to/rails_app/tmp/sockets/unicorn.sock fail_timeout=0;
    }
    # Unicorn との接続に TCP を使用する場合（同ホスト、Port: 9000 とした例）
    # ( unicorn.rb の設定と合わせること )
    #upstream unicorn-tcp {
    #    server 127.0.0.1:9000;
    #}

    server {
        location / {
            proxy_pass http://unicorn-sock;    # <= Unix Domain Socket を使用する場合
            #proxy_pass http://unicorn-tcp;    # <= TCP を使用する場合
            proxy_ignore_headers Cache-Control;
            proxy_cache my-key;
            proxy_cache_valid 200 302 60m;
            proxy_cache_valid 404 10m;
        }
    }
}
{% endhighlight %}

以下の項目は `http` ディレクティブ内に記述する。

- **`proxy_cache_path`**  
  キャッシュの保存先を指定。
  * **`levels`**  
    キャッシュを保存するサブディレクトリ階層の深さを指定。  
    `1:2` は "/var/cache/nginx/cache/0/0f/xxxxxxxxx" のようにキャッシュが保存されるという意味。
  * **`key_zone`**  
    キーゾーンを指定。  
    `proxy_cache` で指定する名前を付ける。  
    `8m` はこのキーゾーンのキーとデータの格納するメモリに 8MB 必要とするという意味。
  * **`max_size`**  
    キーゾーン内に保存できるキャッシュの最大値を指定。
    `50m` は 50MB にするという意味。
  * **`inactive`**  
    アクセスのないキャッシュを削除する機関を指定。  
    `120m` は 120 分間アクセスのないキャッシュを削除するという意味。
- **`proxy_temp_path`**  
  一時ファイルの保存先を指定。
- **`proxy_redirect`**  
  バックエンドがリダイレクトを行った際に、Location ヘッダの URL をどうするか指定。  
  `off` はサーバの指示通りにリダイレクトするという意味。
- **`proxy_set_header`**  
  バックエンドに送るヘッダ情報を設定。  
  フロントエンドのヘッダ情報等をセットしないと意味がないということ。

以下の項目は `server` ディレクティブ内の `location` 内に記述する。

- **`proxy_pass`**  
  http ディレクティブ内 `upstream` で設定したバックエンドのアドレスを指定。  
  バックエンドとのやり取りをポートで行うよう設定していればポートで、ソケットで行うよう設定していればソケットで。
- **`proxy_ignore_headers`**  
  `Cache-Control` は、バックエンド側の `Cache-Control` ヘッダが`no-cache` とされているとキャッシュされないので、このヘッダは無視するという意味。
- **`proxy_cache`**  
  `keys_zone` で指定したキーゾーンを指定。
- **`proxy_cache_valid`**  
  キャッシュの対象と有効な時間を指定。
  `200 302 60m` は HTTP レスポンスが "200" と "302" の場合は 60 分、 `404` の場合は 10分という意味。

### 2. Nginx リロード

設定を有効にするために Nginx をリロード（または再起動）する。

``` text
# /etc/rc.d/init.d/nginx reload
```

### 3. 動作確認（ベンチマークテスト）

`ab` コマンドでベンチマークを採ってみる。（上記の設定を行う前に、あらかじめ同じ条件でベンチマークを採っておいて）

また、`proxy_cache_path` で設定したディレクトリにキャッシュファイルが作成されることも確認しておく。

File: `設定変更前`

{% highlight text linenos %}
# ab -c 20 -n 100 http://www.mk-mode.com/rails/
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking www.mk-mode.com (be patient).....done

Server Software:        nginx
Server Hostname:        www.mk-mode.com
Server Port:            80

Document Path:          /rails/
Document Length:        35519 bytes

Concurrency Level:      20
Time taken for tests:   23.738 seconds
Complete requests:      100
Failed requests:        0
Write errors:           0
Total transferred:      3630800 bytes
HTML transferred:       3551900 bytes
Requests per second:    4.21 [#/sec] (mean)
Time per request:       4747.621 [ms] (mean)
Time per request:       237.381 [ms] (mean, across all concurrent requests)
Transfer rate:          149.37 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    1   2.3      0       6
Processing:   236 4380 1190.4   4560    5587
Waiting:      231 4379 1190.6   4560    5586
Total:        237 4381 1189.1   4566    5587

Percentage of the requests served within a certain time (ms)
  50%   4566
  66%   5266
  75%   5345
  80%   5394
  90%   5461
  95%   5488
  98%   5566
  99%   5587
 100%   5587 (longest request)
{% endhighlight %}

File: `設定変更後`

{% highlight text linenos %}
# ab -c 20 -n 100 http://www.mk-mode.com/rails/
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking www.mk-mode.com (be patient).....done

Server Software:        nginx
Server Hostname:        www.mk-mode.com
Server Port:            80

Document Path:          /rails/
Document Length:        35519 bytes

Concurrency Level:      20
Time taken for tests:   19.991 seconds
Complete requests:      100
Failed requests:        0
Write errors:           0
Total transferred:      3630800 bytes
HTML transferred:       3551900 bytes
Requests per second:    5.00 [#/sec] (mean)
Time per request:       3998.161 [ms] (mean)
Time per request:       199.908 [ms] (mean, across all concurrent requests)
Transfer rate:          177.37 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    1   2.3      0       6
Processing:   238 3626 968.0   3908    4639
Waiting:      235 3626 968.2   3908    4639
Total:        239 3628 966.4   3908    4640

Percentage of the requests served within a certain time (ms)
  50%   3908
  66%   3969
  75%   4082
  80%   4181
  90%   4537
  95%   4546
  98%   4638
  99%   4640
 100%   4640 (longest request)
{% endhighlight %}

元々、Ruby on Rails という動的アプリである上に重い処理を行なっているページなので、動的部分で時間がかかっているようだが、それでも１〜２割程度はパフォーマンス向上しているような結果となった。

### 4. 参考サイト

- [HttpProxyModule - Nginx Community](http://wiki.nginx.org/HttpProxyModule "HttpProxyModule - Nginx Community")

---

静的ファイルをキャッシュする方法等もあるので、機会があれば試行してみたい次第です。

以上。

