---
layout   : single
title    : "Linux - cron で時報を鳴らす！"
published: true
date     : 2013-05-09 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
---

Linux で cron を使用して時報（音）を鳴らす方法についてのメモです。

難しい内容でもありませんが、後学のために。。。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 Nadia (64bit) で動作確認。（Unix 系 OS なら同じはず）
- 音を鳴らすソフトは mpg321 を使用し、使用する音源は mp3 形式。

#### 1. mpg321 インストール

`apt-get` で mpg321 パッケージをインストールする。  
（Synaptic パッケージマネージャでインストールしてもよい）

``` text 
$ sudo apt-get install mpg321
$ mpg321 --version
mpg321 version 0.3.2. Copyright (C) 2001, 2002 Joe Drew,
now maintained by Nanakos Chrysostomos and others.

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.
```

各種オプションは `--help` オプションで確認可能。

#### 2. 音源準備

時報に使用する適当な音源を準備する。  
今回当方は別途要した mp3 音源を `chime.mp3` というファイル名にしてユーザディレクトリ配下に配置した。  
（ヘルプにも記載してあるが、音源は MPEG 1.0/2.0/2.5 Audio Player for Layer 1, 2, and 3 でないといけない。）

#### 3. 音源再生

以下のようにして音源を鳴らしてみる。

``` text 
$ mpg321 --gain 25 /home/hoge/chime.mp3
```

オプション `--gain 25` は音量。

#### 4. シェルスクリプト作成

cron 起動で使用するシェルスクリプトを以下のように作成する。  
（作成先はユーザディレクトリ配下としている）

File: `/home/hoge/jihou.sh`

{% highlight bash linenos %}
#!/bin/sh

mpg321 --gain 25 /home/hoge/chime.mp3
{% endhighlight %}

#### 5. cron 登録

以下のようにして cron 登録する。  
（毎正時に `jihou.sh` を起動する）

File: `/etc/cron.d/jihou`

{% highlight bash linenos %}
0 * * * * root /home/hoge/jihou.sh
{% endhighlight %}

これで毎正時にチャイムが鳴ります。

---

タイマーアプリを使っても良いかも知れませんが、常に起動させておかなければならずメモリがもったいないので、Linux 標準で使用可能な `cron` で起動するようにしています。

また、当然 mpg321 は時報音等だけでなく音楽も流すことも可能なので、軽快でデスクトップの邪魔にならない BGM ツールとしても使用できます。

以上。

