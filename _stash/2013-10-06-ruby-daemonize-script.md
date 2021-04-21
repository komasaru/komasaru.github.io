---
layout   : single
title    : "Ruby - スクリプトをデーモン化！"
published: true
date     : 2013-10-06 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

Ruby スクリプトをデーモン化する方法についてです。

デーモン（Daemon）とは、マルチタスク OS におけるバックグラウンドで動作するプロセスのことです。  
Windows のようなシングルタスク OS では、同様な処理を擬似的に実現するサービスに当たるでしょうか。

以下、Ruby スクリプト作成例を掲示して簡単に説明し、起動スクリプトも紹介します。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Ruby 2.0.0-p247 での作業を想定。
- デーモン処理を行う Ruby スクリプトを起動・停止・再起動するスクリプトも作成する。

#### 1. Ruby スクリプト作成

以下のような Ruby スクリプトを作成してみた。（説明は次項で）

File: `test_daemon.rb`

{% highlight rb linenos %}
#*********************************************
# デーモン化テスト
#*********************************************
#
class TestDaemon
  def initialize
    # 割り込みフラグ
    @flag_int = false
    # ファイル名
    @pid_file = "./test_daemon.pid"  # PID ファイル
    out_file  = "./test_daemon.txt"  # 出力ファイル
    # 出力ファイル OPEN
    @out_file = File.open(out_file, "w")
  end

  # 起動
  def run
    begin
      # 開始メッセージ
      @out_file.puts "[START]"

      # デーモン化
      daemonize

      # トラップ（割り込み）設定
      set_trap

      # 処理実行
      execute

      # 終了メッセージ
      @out_file.puts "[E N D]"
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.run] #{e}"
      exit 1
    end
  end

private

  # デーモン化
  def daemonize
    begin
      # デーモン化
      # ( RUBY_VERSION < 1.9 )
      # exit!(0) if Process.fork
      # Process.setsid
      # exit!(0) if Process.fork
      # ( RUBY_VERSION >= 1.9 )
      Process.daemon(true, true)

      # PID ファイル生成
      open(@pid_file, 'w') {|f| f << Process.pid} if @pid_file
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.daemonize] #{e}"
      exit 1
    end
  end

  # トラップ（割り込み）設定
  def set_trap
    begin
      Signal.trap(:INT)  {@flag_int = true}  # SIGINT  捕獲
      Signal.trap(:TERM) {@flag_int = true}  # SIGTERM 捕獲
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.set_trap] #{e}"
      exit 1
    end
  end

  # 処理実行
  def execute
    begin
      count = 0
      loop do
        break if @flag_int
        sleep 1
        @out_file.puts count += 1
        @out_file.flush
      end
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.execute] #{e}"
      @out_file.close
      exit 1
    end
  end
end

obj_proc = TestDaemon.new
obj_proc.run
{% endhighlight %}

- [Gist - Ruby script testing to daemonize a ruby script.](https://gist.github.com/komasaru/6620545 "Gist - Ruby script testing to daemonize a ruby script.")

#### 2. Ruby スクリプト説明

1. 処理概要
    * `1` から順に１秒間隔でカウントアップし、テキストファイルにカウントを永遠に出力し続けるスクリプトである。
    * システム割り込みを検出した場合に終了処理を行う。
2. デーモン化処理について
    * Ruby 1.9 以上では、`Process.fork` を使用する方法以外に、`Process.daemon(true, true)` を使用する方法が利用できる。  
        - `daemon` の第１引数を `true` にすると、カレントディレクトリを移動しない。（デフォルトは、"/" ディレクトリへ移動する。）
        - `daemon` の第２引数を `true` にすると、標準入力・標準出力・標準エラーを "/dev/null" へリダイレクトしない。（デフォルトは `false` なので、"/dev/null" へリダイレクトする。）
    * プロセス ID（PID）を "test_daemon.pid" に出力（退避）する。
3. トラップ（割り込み）設定について
    * "SIGINT", "SIGTERM" のシステム割り込みを検出した場合に、割り込みフラグを立てる。
    * 割り込みフラグを検知したら、ループ中の処理から抜ける。

#### 3. Ruby スクリプト実行

作成した Ruby スクリプトを実行してみる。

``` bash 
$ ruby test_daemon.rb
```

コンソールには特に何も出力されないはずである。  
この Ruby スクリプトと同じディレクトリに、"test_daemon.pid" という PID ファイルと、"test_daemon.txt" という出力ファイルが作成される。

また、プロセスを確認してみると以下のようになる。 `?` の表示が、ターミナルから離れてデーモンとしてバックグラウンドで動作しているということを意味している。

``` bash 
$ ps aux | grep test_daemon.rb | grep -v grep
masaru   19940  0.0  0.1  35492  4668 ?        Sl   16:48   0:00 ruby test_daemon.rb
```

#### 4. Ruby スクリプト停止

デーモンとして動作している Ruby スクリプトを停止するには以下のようにする。（もしくは、システムモニタ等で終了させる。）

``` bash 
$ kill `cat ./test_daemon.pid`
```

`kill` コマンドのオプションはデフォルトで `-TERM` なので、これにより Ruby スクリプト内のトラップ処理部分で `SIGTERM` を検知して終了処理が動く。  
ただし、PID ファイルは残ったままなので、残っていて問題になるようなら削除する。

#### 5. シェルスクリプト作成

起動したデーモン（Ruby スクリプト）を停止するのに毎回 PID ファイルを指定して `kill` コマンドを実行するのは面倒である。  
そこで、容易に起動・終了・再起動できるように、以下のようなシェルスクリプトを作成する。

File: `test_daemon`

{% highlight bash linenos %}
#!/bin/sh

NAME="[ TEST DAEMON ]"
PID="./test_daemon.pid"
CMD="ruby test_daemon.rb"

start()
{
  if [ -e $PID ]; then
    echo "$NAME already started"
    exit 1
  fi
  echo "$NAME START!"
  $CMD
}

stop()
{
  if [ ! -e $PID ]; then
    echo "$NAME not started"
    exit 1
  fi
  echo "$NAME STOP!"
  kill -INT `cat ${PID}`
  rm $PID
}

restart()
{
  stop
  sleep 2
  start
}

case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    restart
    ;;
  *)
    echo "Syntax Error: release [start|stop|restart]"
    ;;
esac
{% endhighlight %}

- [Gist - Shell script to start a daemon.](https://gist.github.com/komasaru/6620560 "Gist - Shell script to start a daemon.")

#### 6. 起動スクリプト実行

作成した起動スクリプトで、デーモンを起動・停止・再起動してみる。  
（PID ファイルの有無で起動中か停止中かを判定するので、PID ファイルが残っていて起動できない場合は一旦 PID ファイルを削除する）

``` bash 
$ ./test_daemo start
$ ./test_daemo restart
$ ./test_daemo stop
```

#### 参考サイト

Ruby の Process については以下を参照。

- [module Process](http://doc.ruby-lang.org/ja/2.0.0/class/Process.html "module Process")

ログ出力に Logger を使用してもよいが、Ruby 2.0 では、うまく機能しない部分があるので注意！

- [library logger](http://doc.ruby-lang.org/ja/2.0.0/library/logger.html "library logger")
- [[ruby-trunk - Bug #7917][Open] Can't write to a Logger in a signal handler - Ruby Forum](https://www.ruby-forum.com/topic/4411227 "[ruby-trunk - Bug #7917][Open] Can't write to a Logger in a signal handler - Ruby Forum")

---

これで、Ruby スクリプトのデーモン化についての基本的なことは理解できました。  
色々と応用できそうです。

以上。

