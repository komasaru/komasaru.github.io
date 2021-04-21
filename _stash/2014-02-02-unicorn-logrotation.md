---
layout   : single
title    : "Ruby on Rails - Unicorn のログローテーション！"
published: true
date     : 2014-02-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Ruby
- Rails
- Unicorn
---

以前、Ruby on Rails のログ（"production.log"）のローテーションについて記録を残しました。

- [* CentOS - Rails ログローテーション！]({{site.baseurl}}/2012/01/25/25002016/ "* CentOS - Rails ログローテーション！")

Rails のログだけでなく、Rails サーバ Unicorn のログも放おっておくと肥大化します。そこで、ログローテーションの設定を行なってみました。

<!--more-->

### 0. 前提条件

- Ruby 2.0.0-p247, Rails 4.0.0 を想定（動作確認）。
- "/var/www/rails/" ディレクトリ配下に "rails_app" という Rails アプリを作成。

### １．logrotate 全体設定の確認

全体的な logrotate の設定を確認してみる。

File: `/etc/logrotate.conf`

{% highlight bash linenos %}
# see "man logrotate" for details
# rotate log files weekly
weekly

# keep 4 weeks worth of backlogs
rotate 4

# create new (empty) log files after rotating old ones
create

# use date as a suffix of the rotated file
dateext

# uncomment this if you want your log files compressed
#compress

# RPM packages drop log rotation information into this directory
include /etc/logrotate.d

# no packages own wtmp and btmp -- we'll rotate them here
/var/log/wtmp {
    monthly
    create 0664 root utmp
        minsize 1M
    rotate 1
}

/var/log/btmp {
    missingok
    monthly
    create 0600 root utmp
    rotate 1
}

# system-specific logs may be also be configured here.
{% endhighlight %}

デフォルトでは、以下のような設定になっているはず。

<table class="common">
  <tr>
    <th class="center">設定値</th>
    <th class="center">説明</th>
  </tr>
  <tr>
    <td>weekly</td>
    <td>ログローテーションを週毎に行う。</td>
  </tr>
  <tr>
    <td>rotate 4</td>
    <td>ログローテーションの世代数は４つ。</td>
  </tr>
  <tr>
    <td>create</td>
    <td>ログローテーション後、代わりに空の新規ログファイルを作る。</td>
  </tr>
  <tr>
    <td>dateext</td>
    <td>ローテーションファイルを日付形式にする。</td>
  </tr>
  <tr>
    <td>#compress</td>
    <td>ローテーションファイルを圧縮する。<br />（コメントアウトで非圧縮）</td>
  </tr>
</table>

### 2. 設定ファイル作成

Unicorn には、USR1シグナルを送るとログファイルを開き直してくれる機能が備わっている。よって、`lastaction` を追加している。  
また、Rails アプリが複数あるようなら以下のようなブロックを並べればよい。

File: `/etc/logrotate.d/unicorn`

{% highlight bash linenos %}
/var/www/rails/rails_app/log/unicorn.log {
  weekly
  rotate 4
  missingok
  notifempty
  copytruncate
  create 0666 fuga fuga

  # unicorn masterプロセスに、USR1シグナルを送る
  lastaction
    pid=/var/www/rails/rails_app/tmp/pids/unicorn.pid
    test -s $pid && kill -USR1 "$(cat $pid)"
  endscript
}
{% endhighlight %}

<table class="common">
  <tr>
    <th class="center">設定値</th>
    <th class="center">説明</th>
  </tr>
  <tr>
    <td>weekly</td>
    <td>ログローテーションを週毎に行う。</td>
  </tr>
  <tr>
    <td>rotate 4</td>
    <td>ログローテーションの世代数を４個に設定。</td>
  </tr>
  <tr>
    <td>missingok</td>
    <td>指定のログファイルが実在しなかったとしてもエラーを出さずに処理続行。</td>
  </tr>
  <tr>
    <td>notifempty</td>
    <td>ログファイルが空ならローテーションしない。</td>
  </tr>
  <tr>
    <td>copytruncate</td>
    <td>copy の動作を行った後、元のログファイルの内容を消去する。</td>
  </tr>
  <tr>
    <td>create 0666 fuga fuga</td>
    <td>ローテーションを行った後、代わりに空の新規ログファイルを作る。<br />(postrotate も同じ)</td>
  </tr>
</table>

"/etc/logrotate.d" 内の設定ファイルが "/etc/logrotate.conf" より優先されるので、同じ設定なら敢えて記述する必要もないが、当方は敢えて記述している。

### 3. ログローテート設定確認

ログローテートの設定に問題がないかテストしてみる。

``` text
# logrotate -df /etc/logrotate.d/unicorn
reading config file /etc/logrotate.d/unicorn
reading config info for /var/www/rails/rails_app/log/unicorn.log

Handling 1 logs

rotating pattern: /var/www/rails/rails_app/log/unicorn.log  forced from command line (4 rotations)
empty log files are not rotated, old logs are removed
considering log /var/www/rails/rails_app/log/unicorn.log
  log needs rotating
rotating log /var/www/rails/rails_app/log/unicorn.log, log->rotateCount is 4
dateext suffix '-20140127'
glob pattern '-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
renaming /var/www/rails/rails_app/log/unicorn.log.4 to /var/www/rails/rails_app/log/unicorn.log.5 (rotatecount 4, logstart 1, i 4),
renaming /var/www/rails/rails_app/log/unicorn.log.3 to /var/www/rails/rails_app/log/unicorn.log.4 (rotatecount 4, logstart 1, i 3),
renaming /var/www/rails/rails_app/log/unicorn.log.2 to /var/www/rails/rails_app/log/unicorn.log.3 (rotatecount 4, logstart 1, i 2),
renaming /var/www/rails/rails_app/log/unicorn.log.1 to /var/www/rails/rails_app/log/unicorn.log.2 (rotatecount 4, logstart 1, i 1),
renaming /var/www/rails/rails_app/log/unicorn.log.0 to /var/www/rails/rails_app/log/unicorn.log.1 (rotatecount 4, logstart 1, i 0),
copying /var/www/rails/rails_app/log/unicorn.log to /var/www/rails/rails_app/log/unicorn.log.1
truncating /var/www/rails/rails_app/log/unicorn.log
removing old log /var/www/rails/rails_app/log/unicorn.log.5
error: error opening /var/www/rails/rails_app/log/unicorn.log.5: そのようなファイルやディレクトリはありません
running last action script
running script with arg /var/www/rails/rails_app/log/unicorn.log : "
    pid=/var/www/rails/rails_app/tmp/pids/unicorn.pid
    test -s $pid && kill -USR1 "$(cat $pid)"
"
```

※オプション `d` はデバッグモード（詳細を出力）、`f` はログローテーションの強制実行。  
※「そのようなファイルやディレクトリはありません」のエラーは、まだログファイルが存在しないために削除できないから。設定した世代分ログファイルが貯まれば解消される。

ちなみに、今回追加した Unicorn のみならず全てのログローテートの設定をテストするなら以下のようにする。

``` text
# logrotate -df /etc/logrotate.conf
```

### 4. ログローテートの強制実行について

`logrotate /etc/logrotate.d/unicorn` とオプションを何も指定せずに実行すると "/var/lib/logrotate.status" が作成される。  
作成された "/var/lib/logrotate.status" の該当の行の日付をローテーションサイクルより古い日付に変更して、`logrotate /etc/logrotate.d/unicorn` を実行してみるとログローテーションの確認ができる。

ただし、このコマンドでは今回作成した設定ファイルしか読み込まないので、ファイル名が希望通りにならないかもしれない。それは、全体設定（"/etc/logrotete.conf"）を読み込まず、個別の設定ファイル（今回の場合は "/etc/logrotate.d/unicorn"）のみを読み込んでいるためである。 `logrotate /etc/logrotate.d/unicorn` の代わりに `logrotate /etc/logrotate.conf` を実行して全てのログローテートを試してみてもよい。

``` text
# ll /var/www/rails/rails_app/log/unicorn.log*
-rw-rw-rw- 1 masaru masaru      616  1月 28 00:10 2014 /var/www/rails/mk-mode/log/unicorn.log
-rw-rw-rw- 1 masaru masaru      525  1月 27 23:52 2014 /var/www/rails/mk-mode/log/unicorn.log-20140127
-rw-rw-rw- 1 masaru masaru   170630  1月 27 23:47 2014 /var/www/rails/mk-mode/log/unicorn.log.1
```

### 5. 参考サイト（当ブログ過去記事）

- [* CentOS - Rails ログローテーション！]({{site.baseurl}}/2012/01/25/25002016/ "* CentOS - Rails ログローテーション！")

---

以上。

