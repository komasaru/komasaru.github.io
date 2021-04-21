---
layout   : single
title    : "Debian 7 Wheezy - サーバ監視ツール munin 導入！"
published: true
date     : 2013-11-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- munin
---

Debian GNU/Linux 7 Wheezy サーバ上にサーバ監視ツール munin をインストール・設定する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- Web サーバは Nginx を想定。
- munin 用ディレクトリは "/var/www/munin" とする。

### 1. munin インストール

munin を以下のようにしてインストールする。

``` text 
# aptitude -y install munin
```

### 2. 設定ファイル編集

設定ファイル "munin.conf" を以下のように編集する。

File: `/etc/munin/munin.conf`

{% highlight bash linenos %} 
dbdir   /var/lib/munin    # < = コメント解除
htmldir /var/www/munin    # < = コメント解除＆変更
logdir /var/log/munin     # < = コメント解除
rundir  /var/run/munin    # < = コメント解除
#[localhost.localdomain]  # < = コメント化（変更したければ）
[hoge.mk-mode.com]        # < = 追加      （変更したければ）
{% endhighlight %}

### 3. ディレクトリ作成

munin 用ディレクトリを所定の位置に作成する。

``` text 
# mkdir /var/www/munin
```

そして、所有者・所有グループを変更する。

``` text 
# chown -R munin:munin /var/www/munin/
```

### 4. 監視項目の確認

以下のようにして、監視項目を確認できる。

``` text 
# munin-node-configure
Plugin                     | Used | Extra information                  
------                     | ---- | -----------------                  
acpi                       | no   |                                    
amavis                     | no   |                                    
apache_accesses            | no   |                                    
apache_processes           | no   |                                    
apache_volume              | no   |                                    
         :
===< 途中省略 >===
         :
vmstat                     | yes  |                                    
vserver_cpu_               | no   |                                    
vserver_loadavg            | no   |                                    
vserver_resources          | no   |                                    
yum                        | no   |                                    
zimbra_                    | no   |                                    
```

### 5. Nginx 設定

Web サーバに Nginx を使用する場合は、設定ファイルに以下のような記述を追加する。（`server` ディレクティブ内に）

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %} 
http {
    server {

        location /munin {
            alias /var/www/munin;
            index index.html index.htm index;
            allow 127.0.0.1;
            allow 192.168.11.0/24;
            deny  all;
        }

    }
}
{% endhighlight %}

ちなみに、Web サーバに Apache を使用する場合は以下のような設定になる。

File: `/etc/httpd/conf.d/munin.conf`

{% highlight bash linenos %} 
ScriptAlias /munin/cgi/ /var/www/munin/cgi/
Alias /munin/ /var/www/munin/
<Directory /var/www/munin>
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        Order deny,allow
        Allow from all
</Directory>
{% endhighlight %}

### 6. Web サーバ再起動

設定を有効化するために Web サーバを再起動する。（以下は Nginx の例）

``` text 
# /etc/init.d/nginx restart
Restarting Nginx Daemon: nginx
Restarting Nginx Daemon: nginx.
```

### 7. munin-node 起動

munin-node を起動する。

``` text 
# /etc/init.d/munin-node start
Starting Munin-Node: started beforehand.
```

### 8. 自動実行設定

マシン起動時に自動で起動するよう設定する。（以下は `sysv-rc-conf` を使用した例）
（デフォルトで自動起動するようになっているかも知れない）

``` text 
# sysv-rc-conf munin-node on
# sysv-rc-conf --list | grep munin-node
munin-node   0:off      1:off   2:on    3:on    4:on    5:on    6:off  # < = 2,3,4,5 が on になっているのを確認
```

### 9. 動作確認

ブラウザで `http://＜Webサーバのホスト名 or IP アドレス＞/munin` にアクセスし、表示されることを確認する。

![DEBIAN_MUNIN]({{site.baseurl}}/images/2013/11/14/DEBIAN_MUNIN.png "DEBIAN_MUNIN")

---

以上。

