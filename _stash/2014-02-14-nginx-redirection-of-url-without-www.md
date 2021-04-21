---
layout   : single
title    : "Nginx - www 有無を統一！！"
published: true
date     : 2014-02-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Nginx
---

軽量 Web サーバ Nginx で URL をリダイレクトさせる方法についての備忘録です。

Apache なら `RewriteCond` と `RewriteRule` を使うところを Nginx ではどう記述すればよいのかということです。

"www" 付きの URL にも "www" 無しの URL にもそのままアクセスできるようになっているということは、 SEO 的にも効果が薄れます。  
特に検索エンジンによるクロールで大きく影響がでます。"www" 付き URL と "www" 無し URL は別々の URL と判断されるので、"robots.txt", "sitemap.xml" を設定していても効果が弱いということです。（Apache でも Nginx 等でも同じ）

実際には色々と設定できますが、今回は "www" なしの URL を "www" 付きの URL に統一させる方法に限定してます。

<!--more-->

### 0. 前提条件

- Nginx のバージョンは 1.4.2 を想定
- `http://mk-mode.com` を `http://www.mk-mode.com` にリダイレクトすることを想定。

### 1. 設定ファイル編集

元々 `mk-mode.com` と `www.mk-mode.com` のどちらでもそれぞれにアクセスできるようにしていたものを、`mk-mode.com` にアクセスすると `www.mk-mode.com` にリダイレクトするように変更する。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
    # ===> 追加
    server {
        listen       80;
        server_name  mk-mode.com;
        #rewrite   ^  http://www.mk-mode.com$request_uri? permanent;  # <= これでもよい
        rewrite ^(.*)$ http://www.mk-mode.com$1 permanet;
    }
    # <=== 追加

    # 元の server ディレクティブ
    server {
        listen       80;
        #server_name  mk-mode.com www.mk-mode.com;  # <= コメント化
        server_name  www.mk-mode.com;               # <= 追加
           :
    }
{% endhighlight %}

ちなみに `rewrite` 行最後の

- `permanent` は「恒久的なリダイレクト（HTTP ステータス：301）」
- `last` は「一時的なリダイレクト（HTTP ステータス：302 を返してリダイレクト）」
- `redirect` は「一時的なリダイレクト（即リダイレクト、HTTP ステータス：302を返す）」

という意味である。

### 2. Nginx リロード

``` text
# service nginx reload
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful
nginx を再読み込み中:                                      [  OK  ]
```

### 3. 動作確認

ブラウザで `www` 無しの URL でアクセスし `www` 付きの URL にリダイレクトされることを確認する。

### 4. 参考サイト

- [rewrite ルールのコンバート - NGINX](http://nginx.org/ja/docs/http/converting_rewrite_rules.html "rewrite ルールのコンバート - NGINX")

---

別途、検索エンジンのウェブマスターツール（Google や Bing 等の大手）で、"www" の有無を統一するよう設定すれば、検索エンジンに適切にクロール・インデックス化されます。  
その結果、サイトのアクセス数や広告の表示回数が大幅にアップします。

以上。

