---
layout   : single
title    : "CentOS 6.5 - Web カメラ構築！"
published: true
date     : 2014-01-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Webカメラ
---

前回は CentOS 6.5 サーバ上でプログラミング言語 Python をソースをビルドしてインストールしました。  
今回は Web カメラの構築（USB カメラによる静止画自動保存）を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- Web カメラを構築するマシンはサーバ用途のマシンなので、GUI 環境もないしディスプレイも接続していない。（ディスプレイはインストール時に接続しただけ）
- カメラは市販の USB カメラを使用する。OS が USB カメラを認識していること。  
  （今回の当方の場合、 "/dev/video0" として認識している）
- 過去にこのサイトを参考にして作業した際に記録していたものを参照している。

### 1. X11 ドライバのインストール

X11 のウィンドウでモニタするアプリなので、X11 に依存する。X11 がインストールされていない環境下では webcam も make できないので、ドライバをインストールする。

``` text
# yum -y install xorg-x11-drivers
```

### 2. その他パッケージのインストール

webcam ビルド中に（ファイル不足で）エラーが出るので libjpeg-devel, kernel-devel, ncurse-devel をインストールする。（カーネル関連なので、マシンを再起動したほうがよいかも）

``` text
# yum -y install libjpeg-devel kernel-devel ncurses-devel
```

### 3. config.h ファイル作成

最近のバージョンではこの項の作業は不要。

カーネルのバージョンによっては linux/config.h ファイルが無いのでビルドに失敗するが、以下のコマンドで空ファイルを作ればなんとかなる。（一度コンパイルしてみて、ダメならこの作業をしてみるといいかも）

``` text
# touch /usr/src/kernels/(カーネルバージョン※)/include/linux/config.h
```

### 4. xawtv ダウンロード

キャプチャソフトである xawtv をダウンロード＆解凍する。

``` text
# cd /usr/local/src
# wget http://dl.bytesex.org/releases/xawtv/xawtv-3.95.tar.gz
# tar zxvf xawtv-3.95.tar.gz
# cd xawtv-3.95
```

### 5. fbtools.c 編集

"fbtools.c" でビルドエラーとなるので、以下のように修正。

File: `console/fbtools.c`

{% highlight c linenos %}
// ---- 24行辺り ----
// #include <asm/page.h>                     // <= コメント化
#define PAGE_SHIFT      12                   // <= 追加
#define PAGE_SIZE       (1UL << PAGE_SHIFT)  // <= 追加
#define PAGE_MASK       (~(PAGE_SIZE-1))     // <= 追加
{% endhighlight %}

### 6. matrox.c 編集

"matrox.c" でビルドエラーとなるので、以下のように修正。

File: `console/matrox.c`

{% highlight c linenos %}
// ---- 12行辺り ----
// #include <asm/page.h> /* PAGE_SIZE */     // <= コメント化
#define PAGE_SHIFT      12                   // <= 追加
#define PAGE_SIZE       (1UL << PAGE_SHIFT)  // <= 追加
{% endhighlight %}

### 7. パッチ適用

[こちら](http://www.mk-mode.com/rails/docs/xawtv-3.95-fixes.patch "xawtv-3.95-fixes.patch")からソースをダウンロードして、 "xawtv-3.95-patch.diff" の名前で（"xawtv-3.95" ディレクトリに）保存後、パッチを適用すｒ。  
**※当初の[~~提供元~~](http://cvs.fedoraproject.org/viewvc/devel/xawtv/xawtv-3.95-fixes.patch?revision=1.1 "提供元")が消滅したので、当方のサイトに置いている。当初の提供元とは連絡も取れないので、許可を得ず配置している。問題がありそうなら削除する。ご了承ください**

``` text
# wget http://www.mk-mode.com/rails/docs/xawtv-3.95-fixes.patch
# patch -p1 -N < xawtv-3.95-fixes.patch
patching file libng/plugins/drv0-v4l2.c
```

### 8. コンパイル＆インストール

``` text
# ./configure
# make
# make install
```

### 9. webcam 設定ファイルの作成

"/usr/local/etc/" に以下のような内容で設定ファイル "webcamrc" を作成する。  
ちなみに、当方の場合 Web カメラと Web サーバが同一ホストなの FTP 送信しない設定。

File: `/usr/local/etc/webcamrc`

{% highlight bash linenos %}
[grab]
device = /dev/video0
text = "webcam %Y-%m-%d %H:%M:%S"
#infofile = filename
fg_red = 255
fg_green = 255
fg_blue = 255
width = 320
height = 240
delay = 30
wait = 0
#input = composite1
#norm = pal
rotate = 0
top = 0
left = 0
bottom = -1
right = -1
quality = 100
trigger = 0
once = 0
archive = /XXXXXXXXXX/YYYYYYYYYY/%y%m%d%H%M%S.jpg

[ftp]
#host = XXX.XXX.XXX.XXX
#user = XXXXXX
#pass = XXXXXX
dir  = /XXXXXXXXXX/YYYYYYYYYY
file = webcam.jpg
tmp  = uploading.jpg
passive = 1
debug = 0
auto = 0
local = 1
ssh = 0
{% endhighlight %}

上記では主に以下のような設定を行なっている。

- 30秒間隔でキャプチャ
- 320px x 240px のサイズ
- "/XXXXXXXXXX/YYYYYYYYYY/" ディレクトリに "%y%m%d%H%M%S.jpg" という書式のファイル名で保存
- 画像内に "webcam %Y-%m-%d %H:%M:%S" の書式でテキストを描画

非力なサーバマシンなので、あまりサーバに負担をかけないような設定にしているが、いろんな利用方法が考えられると思う。

### 10. 画像保存先作成

前述で設定した、画像保存先のフォルダを作成しておく。

``` text
# mkdir /XXXXXXXXXX/YYYYYYYYYY
```

### 11. webcam 実行

``` text
# /usr/local/bin/webcam /usr/local/etc/webcamrc > /dev/null 2> /dev/null &
```

### 12. respawnd インストール

Web カメラが突然落ちた場合に、自動で再起動してくれるツールをインストールする。

``` text
# cd /usr/local/src
# wget http://wakita.no-ip.com/server/respawnd/download/respawnd.tar.gz
# tar zxvf respawnd.tar.gz
# cd respawnd-1.0.0
# make install
```

### 13. 自動起動の設定

"/etc/rc.d/rc.local" に以下のコマンドを追加。

File: `/etc/rc.d/rc.local`

{% highlight bash linenos %}
/usr/local/bin/respawnd /usr/local/bin/webcam /usr/local/etc/webcamrc > /dev/null 2> /dev/null &
{% endhighlight %}

### 14. マシン再起動

設定反映のため、マシンを再起動する。

``` text
# shutdown -r now
```

### 15. 動作確認

画像ファイルが正常に（設定通りに）作成されるか確認する。

### 16. その他

30秒間隔で画像ファイルが保存されていくので、当方は指定した期間を経過したら画像ファイルを削除するようにしたり、画像ファイルを１日分まとめて１つの動画ファイルにしている。

---

次回は、Procmail によるメール自動転送について紹介する予定です。

以上。

