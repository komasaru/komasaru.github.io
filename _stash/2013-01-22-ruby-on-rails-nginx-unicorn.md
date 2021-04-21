---
layout   : single
title    : "Ruby on Rails - Nginx & Unicorn で動かす！"
published: true
date     : 2013-01-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Ruby
- Rails
- Nginx
- Unicorn
---

現在 Rails サイト・アプリは、サーバ環境・ローカル環境ともに Apache2 + Passenger で動かしていますが、Nginx + Unicorn で動かすにはどうすべきか試行してみたので、記録しておきます。  
（ちなみに、当初この記事を執筆していた時（数週間前）は試行段階でしたが、現在は実際に運用しています）

[Unicorn](http://unicorn.bogomips.org/index.html "Unicorn: Rack HTTP server for fast clients and Unix") とは、CPU やメモリをあまり消費せず高速で軽快に動く次世代 Rails サーバです。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- Nginx 1.2.6 がソースビルドによりインストール済み。  
  （パッケージを利用してインストールした Nginx とはディレクトリ構成等が若干異なる）
- Rails アプリは既に作成済み。（場所：`/var/www/rails/rails_app`）
- Rails アプリをサブディレクトリ運用（http://foo.bar/rails_app/ のように）する場合を想定。
- Proxy は TCP ポートではなく、Unix ソケットを使用。
- Ruby 1.9.3-p362, Rails 3.2.10 で動作確認。

### 1. Nginx の設定

Nginx の設定（当方環境の場合 `/usr/local/nginx/conf/nginx.conf`）を以下のように編集する。  
（関係のある部分のみ抜粋）

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
http {

    :

    # Rails アプリ別に設定した
    upstream unicorn.rails_app {
        # Unicorn のソケット指定
        # （fail_timeout=0 は、失敗時常にリトライする設定）
        server unix:/var/www/rails/rails_app/tmp/sockets/unicorn.sock fail_timeout=0;
     }

    server {

        :

        location /rails_app {
            alias /var/www/rails/rails_app/public;
            index  index.html index.htm index;

            try_files $uri/index.html $uri.html $uri @unicorn_rails_app;
        }

        # Proxy 設定
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

`try_files` と名前付きロケーション(@マーク付きのロケーション名)で内部リダイレクトしている。  
（Nginx の `if` は曲者らしいので、ファイル存在チェックは `try_files` で行なっている）

### 2. Gemfile 編集

該当の Rails アプリの Gemfile に以下の記述を追加する。

File: `/var/www/rails/rails_app/Gemfile`

{% highlight ruby linenos %}
gem 'unicorn'
{% endhighlight %}

### 3. Bundle Install

該当の Rails アプリのディレクトリへ移動し、Bundle Install する。

``` bash 
$ cd /var/www/rails/rails_app
$ bundle install
```

他の Ruby アプリでも Unicorn を使用するなら、Gemfile に記述して Rails アプリそれぞれで `bundle install` せずに直接 `sudo gem install unicorn` してもよい。

### 4. Unicorn 設定

該当の Rails アプリの `config` ディレクトリ配下に設定ファイル `unicorn.rb` を作成する。

File: `/var/www/rails/rails_app/config/unicorn.rb`

{% highlight bash linenos %}
# ワーカーの数
worker_processes 2

# RAILS_ROOT を指定
working_directory "/var/www/rails/rails_app/"

# ソケット
listen "/var/www/rails/rails_app/tmp/sockets/unicorn.sock"

# PID
pid    "tmp/pids/unicorn.pid"

# ログ
stderr_path "log/unicorn.log"
stdout_path "log/unicorn.log"

# ダウンタイムなくす
preload_app true

before_fork do |server, worker|
  defined?(ActiveRecord::Base) and ActiveRecord::Base.connection.disconnect!

  old_pid = "#{ server.config[:pid] }.oldbin"
  unless old_pid == server.pid
    begin
      Process.kill :QUIT, File.read(old_pid).to_i
    rescue Errno::ENOENT, Errno::ESRCH
    end
  end
end

after_fork do |server, worker|
  defined?(ActiveRecord::Base) and ActiveRecord::Base.establish_connection
end
{% endhighlight %}

- [Configuration of unicorn on rails application. - gist](https://gist.github.com/4471840 "Configuration of unicorn on rails application.")

### 5. config.ru 編集

Rails アプリをサブディレクトリ運用する場合は、Routing の設定が必要である。  
RAILS_ROOT にある `config.ru` を以下のように編集する。

File: `/var/www/rails/rails_app/config.ru`

{% highlight ruby linenos %}
# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment',  __FILE__)
if ENV['RAILS_RELATIVE_URL_ROOT']
  map ENV['RAILS_RELATIVE_URL_ROOT'] do
    run RailsApp::Application
  end
else
  run RailsApp::Application
end
{% endhighlight %}

### 6. Unicorn 起動

以下のコマンドで Unicorn を起動する。  
今回はサブディレクトリ運用なので `--path` を指定するのがポイント。  
ログファイルにエラーが出力されなければ OK.

``` bash 
$ bundle exec unicorn_rails -c config/unicorn.rb -E production -D --path /rails_app
```

- `-c` : 設定ファイル
- `-E` : RAILS\_ENV(デフォルトはdevelopment)
- `-D` : デーモンとして動作
- `-p` : ポートを指定する場合
- `--path` : ディレクトリ指定

上記コマンド先頭の `bundle exec` は省略してもよい。

> 【2013.01.30 追記】  
> また場合によっては、`-E` オプションの位置により挙動が異なることがあるので、その際は `-E` オプションの位置を変えてみる。

### 7. Unicorn 停止

デーモンとして起動した Unicorn は停止コマンドが無いので、以下のように PID を指定して `kill` する。

``` bash 
kill -QUIT `cat tmp/pids/unicorn.pid`
```

オプション無しか `-TERM` オプションでもよいが、それでは停止しないこともあるようなので、`-QUIT` オプションとした。  
もしくは、以下のように PID を特定してから、`kill` してもよい。

``` bash 
# unicornのmasterプロセスのIDを特定する
$ sudo pgrep -f 'unicorn_rails master'
1234

$ kill -TERM 1234   # 正常な終了動作を行わせて安全に終了
or
$ kill -QUIT 1234   # 端末からの終了命令
or
$ kill -INT 1234    # ユーザからの強制終了命令
```

`kill` コマンドでオプション無しは `kill -TERM` or `kill -15` と同義。  
`-QUIT` は `-3` に、`-INT` は `-2` に置き換えても OK.

### 8. Unicorn 再起動

デーモンとして起動した Unicorn は再起動コマンドが無いので、上記の停止・起動を実行するか以下のようにする。

``` bash 
kill -HUP `cat /tmp/unicorn.pid`
```

### 参考サイト

- [Unicorn: Rack HTTP server for fast clients and Unix](http://unicorn.bogomips.org/index.html "Unicorn: Rack HTTP server for fast clients and Unix")

その他多数。

---

Apache + Passenger で Rails アプリを動かしていた時に比べ設定等が煩雑に思えますが、速度に関して言えばやはり高速になった気がします。（ベンチマークは別途記事にします）

以上。

