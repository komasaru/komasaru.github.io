---
layout   : single
title    : "Python - 外部コマンドの実行(by subprocess)！"
published: true
date     : 2018-06-05 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Python
---

Python で外部コマンドを実行する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* 公式にサブプロセスを起動する手段として推奨されている標準モジュールライブラリ subprocess を使用する。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. Python サンプルスクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 以下は、 `ls -l` というオプション付きのコマンドの実行例。
* 前半は、 `run` メソッドで単純に実行する例で、標準出力を行い、結果として実行コマンドのリストと終了コードを捕捉する。
* 後半は、 `run` メソッドをオプション付きで実行する例で、標準出力は行わず、結果として実行コマンドのリストと終了コードに加え、標準出力も補足する。

File: `test_subprocess.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Test of subprocess module
"""
import subprocess as sp
import sys
import traceback


class TestSubprocess:
    def exec(self):
        cmds = ["ls", "-l"]
        try:
            # Capturing：args, returncode
            res = sp.run(cmds)
            print(res.args)
            print(res.returncode)
            print("---")
            # Capturing：args, returncode, stdout(coding: utf-8)
            res = sp.run(cmds, stdout=sp.PIPE, encoding="utf-8")
            print(res.args)
            print(res.returncode)
            print(res.stdout)
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = TestSubprocess()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

ちなみに、 `run()` でオプション `encoding="utf-8"` を指定しない場合は、 `print(res.stdout.decode())` のようにする。

* [Gist - Python script to test an execution of external commands by subprocess.](https://gist.github.com/komasaru/10b4efc661e826108c83ed13c8003703 "Gist - Python script to test an execution of external commands by subprocess.")

### 2. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x test_subprocess.py
```

そして、実行。

``` text
$ ./test_subprocess.py
合計 4
-rwxr-xr-x 1 masaru masaru 799  2月 23 23:14 test_subprocess.py
['ls', '-l']
0
---
['ls', '-l']
0
合計 4
-rwxr-xr-x 1 masaru masaru 799  2月 23 23:14 test_subprocess.py

```

### 3. 参考サイト

* [17.5. subprocess — サブプロセス管理 — Python 3.6.4 ドキュメント](https://docs.python.jp/3/library/subprocess.html?highlight=subprocess "17.5. subprocess — サブプロセス管理 — Python 3.6.4 ドキュメント")

---

以上

