---
layout   : single
title    : "Python - デーモンの作成！"
published: true
date     : 2018-05-30 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Python
---

Python でデーモンスクリプトを作成する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* PyPI ライブラリ python-damon を使用。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. PyPI ライブラリ python-damon のインストール

``` text
$ pip3.6 install python-daemon
```

### 2. Python サンプルスクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `test_daemon.py`

{% highlight python linenos %}
#!/usr/local/bin/python3.6

import datetime
import sys
import traceback
from daemon import DaemonContext
from os     import path
from time   import sleep
from lockfile.pidlockfile import PIDLockFile


class TestDaemon:
    def __init__(self):
        self.basename = path.splitext(path.basename(__file__))[0]
        self.work_dir = path.dirname(path.abspath(__file__))

    def exec(self):
        try:
            dc = DaemonContext(
                working_directory = self.work_dir,
                pidfile = PIDLockFile("/tmp/{}.pid".format(self.basename)),
                stderr = open("{}.err".format(self.basename), "a+")
            )
            with dc:
                self.__do_process()
        except Exception as e:
            raise

    def __do_process(self):
        try:
            while True:
                with open("{}.txt".format(self.basename), "a") as f:
                    f.write(datetime.datetime.now().isoformat() + "\n")
                sleep(10)
        except Exception as e:
            raise

if __name__ == '__main__':
    try:
        obj = TestDaemon()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to do a process as a daemon.](https://gist.github.com/komasaru/c4c0ea54e886fb0b72fa47196f71d439 "Gist - Python script to do a process as a daemon.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x test_daemon.py
```

そして、実行。

``` text
$ ./test_daemon.py
```

### 4. 動作確認

プロセスが動作していることを確認する。

``` text
$ ps aux | grep test_daemon
masaru   26370  1.0  0.2  43204  8624 ?        S    22:58   0:00 /usr/local/bin/python3.6 ./test_daemon.py
```

また、スクリプトと同じディレクトリ内に "test_daemon.txt" が作成され、10秒毎に日時が記述されていることを確認する。

File: `test_daemon.txt`

{% highlight text linenos %}
2018-02-22T22:58:17.636278
2018-02-22T22:58:27.673595
2018-02-22T22:58:37.683451
2018-02-22T22:58:47.693678
2018-02-22T22:58:57.703512
2018-02-22T22:59:07.713767
2018-02-22T22:59:17.718129
2018-02-22T22:59:27.727768
2018-02-22T22:59:37.733244
2018-02-22T22:59:47.734274
2018-02-22T22:59:57.744500
{% endhighlight %}

### 5. デーモンの停止

以下のコマンドでデーモンを停止する。

``` text
$ kill `cat /tmp/test_daemon.pid`
```

動作確認時に知り得た pid を直接指定してもよい。

``` text
$ kill 26370
```

終了時に "test_dasemon.err" に中断された旨のメッセージが記録される。

File: `test_daemon.err`

{% highlight text linenos %}
Terminating on signal 15
{% endhighlight %}

---

python-daemon のおかげで用意にデーモン化が図れます。（python-daemon を使用しなくても実装はできますが）

以上

