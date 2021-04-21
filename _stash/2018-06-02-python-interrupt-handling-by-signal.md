---
layout   : single
title    : "Python - 割り込み処理！"
published: true
date     : 2018-06-02 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Python
---

Python で、実行中のプロセスを割り込み処理により中断する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. Python サンプルスクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `test_signal.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Test interrupt handling by signal
"""
import datetime
import os
import signal
import sys
import time
import traceback


class TestSignal:
    def __init__(self):
        signal.signal(signal.SIGHUP,  self.__handler)
        signal.signal(signal.SIGINT,  self.__handler)
        signal.signal(signal.SIGQUIT, self.__handler)
        signal.signal(signal.SIGTERM, self.__handler)

    def exec(self):
        try:
            while(True):
                print(datetime.datetime.now())
                time.sleep(5)
        except Exception as e:
            raise

    def __handler(self, signum, frame):
        try:
            signames = {1: "HUP", 2: "INT", 3: "QUIT", 15: "TERM"}
            print("Detected {}:SIG{}!".format(signum, signames[signum]))
        except Exception as e:
            raise
        finally:
            sys.exit(0)


if __name__ == '__main__':
    try:
        print("PID =", os.getpid())
        obj = TestSignal()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to test interrupt handling by signal.](https://gist.github.com/komasaru/4b29360da87ba72f3340beebbf3d3815 "Gist - Python script to test interrupt handling by signal.")

### 2. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x test_signal.py
```

そして、実行。

``` text
$ ./test_signal.py
PID = 27801
2018-02-23 11:51:48.509964
2018-02-23 11:51:53.514797
2018-02-23 11:51:58.519896
          :
```

### 3. 動作確認

`CTRL` + ` C` 押下してみる。  
もしくは、 別ターミナルから `kill -HUP <pid>`, `kill -INT <pid>`, `kill -QUIT <pid>`, `kill -TERM <pid>`, `kill <pid>` 等を実行してみる。

``` text
PID = 27801
2018-02-23 11:51:48.509964
2018-02-23 11:51:53.514797
2018-02-23 11:51:58.519896
          :
^CDetected 2:SIGINT!
```

上記は `CTRL` + `C` を押下した例だが、 `2:SIGINT` を検知している。

また、 `ps aux | grep test_signal` などで、プロセスが停止していることも確認する。

### 4. その他

* 参考までに、全てのシグナル一覧は `kill -l` 等で確認できる。

---

無限に動作するデーモンを停止する方法として利用できるでしょう。

以上

