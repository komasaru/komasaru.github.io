---
layout   : single
title    : "Unicorn - 起動スクリプト作成！"
published: true
date     : 2013-01-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Ruby
- Rails
- Nginx
- Unicorn
---

前回は、Nginx + Unicorn で Rails アプリを動かす設定を行いました。

- [Ruby on Rails - Nginx ＆ Unicorn で動かす！]({{site.baseurl}}/2013/01/22/ruby-on-rails-nginx-unicorn "Ruby on Rails - Nginx ＆ Unicorn で動かす！")

しかし、Unicorn の起動コマンドを入力するのが面倒すぎるくらいに感じるので、起動スクリプトを作成してみました。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- Ruby 1.9.3-p362, Rails 3.2.10 で動作確認。
- Unicorn 4.5.0 で動作確認。
- 起動スクリプトは Rails アプリ毎に作成することを想定。
- Rails アプリはサブディレクトリ運用をする。

### 1. 起動スクリプト作成

起動スクリプト `/etc/init.d/unicorn_rails_app` を以下の内容で作成する。  
（自分の環境に合わせて適宜編集する）

File: `/etc/init.d/unicorn_rails_app`

{% highlight bash linenos %}
#!/bin/sh

NAME="Unicorn"
ENV=production

ROOT_DIR="/var/www/rails/rails_app"

PID="${ROOT_DIR}/tmp/pids/unicorn.pid"
CONF="${ROOT_DIR}/config/unicorn.rb"
OPTIONS="--path /rails_app"
CMD="bundle exec unicorn_rails -c ${CONF} -E ${ENV} -D ${OPTIONS}"

start()
{
  if [ -e $PID ]; then
    echo "$NAME already started"
    exit 1
  fi
  echo "start $NAME"
  cd $ROOT_DIR
  $CMD
}

stop()
{
  if [ ! -e $PID ]; then
    echo "$NAME not started"
    exit 1
  fi
  echo "stop $NAME"
  kill -QUIT `cat ${PID}`
  rm -f $PID
}

force_stop()
{
  if [ ! -e $PID ]; then
    echo "$NAME not started"
    exit 1
  fi
  echo "stop $NAME"
  kill -INT `cat ${PID}`
  rm -f $PID
}

reload()
{
  if [ ! -e $PID ]; then
    echo "$NAME not started"
    start
    exit 0
  fi
  echo "reload $NAME"
  kill -HUP `cat ${PID}`
}

restart()
{
    stop
    start
}

case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  force-stop)
    force_stop
    ;;
  reload)
    reload
    ;;
  restart)
    restart
    ;;
  *)
    echo "Syntax Error: release [start|stop|force-stop|reload|restart]"
    ;;
esac
{% endhighlight %}

- [Script to start unicorn. - gist](https://gist.github.com/4471948 "Script to start unicorn.")

### 2. 起動スクリプト実行権限付与

作成した Unicorn 起動スクリプトに実行権限を付与する。

``` bash 
$ sudo chmod +x /etc/init.d/unicorn_rails_app
```

### 3. Unicorn 起動・停止等

通常のサービスと同様、以下のように Unicorn を操作する。

``` bash 
$ sudo service unicorn_rails_app start       # 起動
$ sudo service unicorn_rails_app stop        # 停止
$ sudo service unicorn_rails_app force-stop  # 強制停止
$ sudo service unicorn_rails_app reload      # リロード
$ sudo service unicorn_rails_app restart     # 再起動
```

### 4. 自動起動設定

マシン起動時に Unicorn も自動的に起動させるには以下のようにする。  
（Redhat 系なら `chkconfig` コマンド）

``` bash 
$ sudo update-rc.d unicorn_rails_app defaults
```

自動起動を解除する場合は以下のようにする。

``` bash 
$ sudo update-rc.d -f unicorn_rails_app remove
```

---

これで、Unicorn の起動・停止等の際に長くて複雑なコマンドを入力しなくてもよくなりました。

以上。

