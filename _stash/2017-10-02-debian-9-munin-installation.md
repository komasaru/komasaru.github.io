---
layout   : single
title    : "Debian 9 (Stretch) - サーバ監視ツール munin 導入！"
published: true
date     : 2017-10-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- munin
---

Debian GNU/Linux 9 (Stretch) にサーバ監視ツール munin をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* Web サーバは Nginx を想定。
* munin 用ディレクトリは "/var/www/munin" とする。
* root ユーザでの作業を想定。

### 1. munin のインストール

``` text
# apt -y install munin
```

### 2. 設定ファイルの編集

File: `/etc/munin/munin.conf`

{% highlight bash linenos %}
dbdir   /var/lib/munin    # <= コメント解除
htmldir /var/www/munin    # <= コメント解除＆変更
logdir /var/log/munin     # <= コメント解除
rundir  /var/run/munin    # <= コメント解除
#[localhost.localdomain]  # <= コメント化（変更したければ）
[hoge.mk-mode.com]        # <= 追加      （変更したければ）
{% endhighlight %}

### 3. ディレクトリの作成

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
         :
===< 途中省略 >===
         :
vserver_cpu_               | no   |
vserver_loadavg            | no   |
vserver_resources          | no   |
yum                        | no   |
zimbra_                    | no   |
```

### 5. Web サーバの設定

Web サーバに Nginx を使用する場合は、設定ファイルに以下のような記述を追加する。（`server` ディレクティブ内に）

File: `/etc/nginx/conf.d/default.conf`

{% highlight bash linenos %}
server {

    location /munin {
        alias /var/www/munin;
        index index.html index.htm index;
        allow 127.0.0.1;
        allow 192.168.11.0/24;
        deny  all;
    }

}
{% endhighlight %}

ちなみに、Web サーバに Apache を使用する場合は以下のような設定になるだろう。（当方、未確認）

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

### 6. Web サーバの再起動

設定を有効化するために Web サーバを再起動する。（以下は Nginx の例）

``` text
# systemctl restart nginx
```

### 7. munin-node の起動

``` text
# systemctl restart munin-node
```

### 8. 自動実行の設定

デフォルトで自動起動するようになっているが、なっていなければ設定する。

``` text
# systemctl enable munin-node
Synchronizing state of munin-node.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable munin-node
insserv: warning: current start runlevel(s) (empty) of script `munin-node' overrides LSB defaults (2 3 4 5).
insserv: warning: current stop runlevel(s) (0 1 2 3 4 5 6) of script `munin-node' overrides LSB defaults (0 1 6).

# systemctl is-enabled munin-node
enabled
```

### 9. 動作確認

５分ほど経過してから、ブラウザで `http://＜Webサーバのホスト名 or IP アドレス＞/munin` にアクセスし、表示されることを確認する。

---

以上。

