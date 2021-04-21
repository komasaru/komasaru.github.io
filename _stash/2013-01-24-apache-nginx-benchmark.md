---
layout   : single
title    : "Nginx + Unicorn でベンチマークテスト！"
published: true
date     : 2013-01-24 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Ruby
- Rails
- Nginx
- Unicorn
---

先日、Nginx + Unicorn で Rails アプリを動かす設定を行いました。

- [Ruby on Rails - Nginx ＆ Unicorn で動かす！]({{site.baseurl}}/2013/01/22/ruby-on-rails-nginx-unicorn "Ruby on Rails - Nginx ＆ Unicorn で動かす！")

Nginx + Unicorn の Rails サイト・アプリが Apache + Passenger と比較してどのくらい性能がアップしたのかを ab(Apache Benchmark) で調べてみました。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- Ruby 1.9.3-p362, Rails 3.2.10 でローカル環境に作成した Rails アプリで確認。
- Apache 2.2.22
- Nginx 1.2.6
- Passenger 3.0.18
- Unicorn 4.5.0
- 同時接続数:10、発行リクエスト数:1000 でテスト。

### 1. Apache + Passenger

以下は、Apache + Passenger での平均的な ab 結果。

``` bash 
$ ab -c 10 -n 1000 http://127.0.0.1/rails
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 100 requests
Completed 200 requests
Completed 300 requests
Completed 400 requests
Completed 500 requests
Completed 600 requests
Completed 700 requests
Completed 800 requests
Completed 900 requests
Completed 1000 requests
Finished 1000 requests

Server Software:        Apache
Server Hostname:        127.0.0.1
Server Port:            80

Document Path:          /rails
Document Length:        31816 bytes

Concurrency Level:      10
Time taken for tests:   21.937 seconds
Complete requests:      1000
Failed requests:        0
Write errors:           0
Total transferred:      32527000 bytes
HTML transferred:       31816000 bytes
Requests per second:    45.58 [#/sec] (mean)
Time per request:       219.371 [ms] (mean)
Time per request:       21.937 [ms] (mean, across all concurrent requests)
Transfer rate:          1447.99 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       0
Processing:    59  219  80.0    202     527
Waiting:       59  219  80.0    202     527
Total:         59  219  80.0    202     527

Percentage of the requests served within a certain time (ms)
  50%    202
  66%    236
  75%    258
  80%    281
  90%    339
  95%    369
  98%    418
  99%    446
 100%    527 (longest request)

```

### 2. Nginx + Unicorn

以下は、Nginx + Unicorn での平均的な ab 結果。

``` bash 
$ ab -c 10 -n 1000 http://127.0.0.1/rails
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 100 requests
Completed 200 requests
Completed 300 requests
Completed 400 requests
Completed 500 requests
Completed 600 requests
Completed 700 requests
Completed 800 requests
Completed 900 requests
Completed 1000 requests
Finished 1000 requests

Server Software:        nginx
Server Hostname:        127.0.0.1
Server Port:            80

Document Path:          /rails
Document Length:        31198 bytes

Concurrency Level:      10
Time taken for tests:   15.740 seconds
Complete requests:      1000
Failed requests:        0
Write errors:           0
Total transferred:      31833000 bytes
HTML transferred:       31198000 bytes
Requests per second:    63.53 [#/sec] (mean)
Time per request:       157.402 [ms] (mean)
Time per request:       15.740 [ms] (mean, across all concurrent requests)
Transfer rate:          1975.00 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       0
Processing:    24  157  23.1    160     229
Waiting:       24  156  23.2    160     228
Total:         24  157  23.1    160     229

Percentage of the requests served within a certain time (ms)
  50%    160
  66%    165
  75%    171
  80%    179
  90%    184
  95%    188
  98%    198
  99%    204
 100%    229 (longest request)
```

### 3. 所感

ローカル環境で行なっているので、ネットワーク接続部分については結果に反映されていないが、当初の予想（期待）通り、１秒あたりの処理リクエスト数が大幅（1.4倍程度）に増えた。  
実際、Rails サイトを表示させてみても速くなっているのが体感できる。

### 4. 参考サイト

- [＠IT：Apacheパフォーマンス・チューニングのポイント（2/2）](http://www.atmarkit.co.jp/flinux/rensai/apache15/apache15b.html "＠IT：Apacheパフォーマンス・チューニングのポイント（2/2）")

---

この結果により、Nginx + Unicorn での本格運用も考えてもよいかなと思った今日この頃。  
（当記事草稿時点では未運用でしたが、現在は運用している）

以上。

