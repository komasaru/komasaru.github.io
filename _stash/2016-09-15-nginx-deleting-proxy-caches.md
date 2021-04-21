---
layout   : single
title    : "Nginx - キャッシュの手動削除！"
published: true
date     : 2016-09-15 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Nginx
- Linux
- CentOS
---

HTTP & リバースプロキシサーバ Nginx の溜まったキャッシュを手動で削除する方法についての備忘録です。

<!--more-->

### 0. 前提条件

* CentOS 6.8(32bit)
* Nginx 1.10.1

### 1. キャッシュ保存ディレクトリのパス確認

まず、 Nginx の設定ファイルでキャッシュをどのディレクトリに保存するよう設定しているかを確認してみる。

File: `/etc/nginx/nginx.conf`

{% highlight bash linenos %}
    proxy_cache_path /var/cache/nginx/cache levels=1:2 keys_zone=my-key:8m max_size=50m inactive=120m;$
{% endhighlight %}

<table class="common">
  <tr>
    <th>項目</th><th>説明</th>
  </tr>
  <tr>
    <td>キャッシュ保存先</td><td>"/var/cache/nginx/cache"</td>
  </tr>
  <tr>
    <td>キャッシュの階層</td><td>2層(`1:2` は、1層目が１文字、2層目が２文字の /a/aa/ のような階層)</td>
  </tr>
  <tr>
    <td>キーゾーン名</td><td>"my-key"</td>
  </tr>
  <tr>
    <td>キーゾーンのメモリサイズ</td><td>8MB</td>
  </tr>
  <tr>
    <td>キャッシュのファイルサイズ上限</td><td>50MB</td>
  </tr>
  <tr>
    <td>キャッシュ有効期間</td><td>120分</td>
  </tr>
</table>

### 2. キャッシュの確認

以下は、当ブログ `http://www.mk-mode.com/octopress` のキャッシュの存在を確認する例。

``` text
# grep -lr "http://www.mk-mode.com/octopress/*" /var/cache/nginx/cache/
/var/cache/nginx/cache/f/ee/ea8c92983954d4e0e833580f04e61eef
/var/cache/nginx/cache/c/9a/703db7ec8a20d23a018c99052a78b9ac
```

### 3. キャッシュの削除

以下は、当ブログ `http://www.mk-mode.com/octopress` のキャッシュを削除する例。（キャッシュの保存されているディレクトリを間違えないよう注意）

``` text
# grep -lr "http://www.mk-mode.com/octopress/*" /var/cache/nginx/cache/ | xargs rm -f
```

また、当然ながら全てのキャッシュを削除するには以下のようにすればよい。

``` text
# rm -rf /var/cache/nginx/cache
```

---

以上。

