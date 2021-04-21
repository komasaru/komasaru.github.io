---
layout   : single
title    : "CentOS 7.0 - サーバ監視ツール Munin 導入！"
published: true
date     : 2014-09-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- munin
---

「CentOS 7.0 - サーバ監視ツール Munin 導入」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- EPEL リポジトリ導入済み。（[CentOS 7.0 - リポジトリ追加]( "CentOS 7.0 - リポジトリ追加")）
- 閲覧に使用する Web(HTTP) サーバは Nginx を想定。
- ローカルネットワークは "192.168.11.0/24" を想定。

### 1. munin マスタ・ノードのインストール

ベースリポジトリには存在しないので、EPEL リポジトリからインストールされる。

``` text
# yum -y install munin
```

### 2. 設定ファイル編集

File: `/etc/munin/munin.conf`

{% highlight bash linenos %}
dbdir   /var/lib/munin            # <= コメント解除
htmldir /var/www/munin            # <= コメント解除＆変更
logdir  /var/log/munin             # <= コメント解除
rundir  /var/run/munin            # <= コメント解除
{% endhighlight %}

### 3. フォルダ移動

``` text
# mv /var/www/html/munin /var/www/
```

### 4. フォルダ権限設定

``` text
# chown -R munin:munin /var/www/munin/
```

### 5. Nginx 設定ファイル編集

Nginx 設定ファイルの "server" ディレクティブ内に以下のような記述を追加する。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
    location /munin {
        alias /var/www/munin;
        index index.html index.htm index;
        allow 127.0.0.1;
        allow 192.168.11.0/24;
        deny  all;
    }
{% endhighlight %}

ちなみに、HTTP サーバが Apache の場合は、以下のように httpd 用設定ファイルを作成する。

File: `/etc/httpd/conf.d/munin.conf`

{% highlight bash linenos %}
ScriptAlias /munin/cgi/ /var/www/munin/cgi/
Alias /munin/ /var/www/munin/
{% endhighlight %}

### 6. Web サーバ再起動

以下は Nginx の場合。

``` text
# systemctl restart nginx
```

### 7. munin-node 起動

``` text
# systemctl start munin-node
```

### 8. munin-node 自動実行設定

``` text
# systemctl enable munin-node
ln -s '/usr/lib/systemd/system/munin-node.service' '/etc/systemd/system/multi-user.target.wants/munin-node.service'
# systemctl list-unit-files -t service | grep munin-node
munin-node.service                          enabled  # <= enabled であることを確認
```

### 9. 動作確認

ブラウザから `http://＜サーバ名orIPアドレス＞/munin` にアクセスして正常に表示されることを確認する。  
また 5 分間隔で更新されることも確認する。

![CENTOS_7-0_MUNIN_1]({{site.baseurl}}/images/2014/09/08/CENTOS_7-0_MUNIN_1.png "CENTOS_7-0_MUNIN_1")

以下は、実運用中（CentOS 6.5）サーバでの表示例。（グラフが描画されていて分かりやすいので）

![CENTOS_7-0_MUNIN_2]({{site.baseurl}}/images/2014/09/08/CENTOS_7-0_MUNIN_2.png "CENTOS_7-0_MUNIN_2")

---

以上。

