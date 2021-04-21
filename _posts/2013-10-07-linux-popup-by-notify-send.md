---
layout   : single
title    : "Linux Mint - notify-send でポップアップ通知！"
published: true
date     : 2013-10-07 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- LinuxMint
---

Linux デスクトップ上でポップアップ通知する機能をコマンドラインから使用する方法についてです。

Mac なら Growl でしょうか。

以下、備忘録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- 「ポップアップ通知の設定」で、テーマを「Nodoka」、位置を「右上隅」と設定していることを想定。  
  （環境により選択できるテーマは異なるかもしれない）
- その他、環境により異なる部分があるかもしれない。

#### 1. notify-send のインストール

Linux Mint の場合は "libnotify0.4-cil" をインストールすれば `notify-send` コマンド使用できるようになる。  
未インストールなら、以下のようにしてインストールする。Synaptic パッケージマネージャでインストールしてもよい。

``` bash 
$ sudo apt-get install libnotify0.4-cil

$ notify-send -v
notify-send 0.7.5
```

#### 2. 使用方法

`notify-send --help` で使用方法・オプションは確認できる。  
書式は以下の通り。（SUMMARY, BODY 内に半角スペースが入る場合はクォーテーションでくくる）

``` bash 
$ notify-send [OPTION...] <SUMMARY> [BODY]
```

その他、よく使用するであろうオプションについて記録しておく。

- `-u, --urgency=LEVEL` ... 緊急レベルを `low`, `normal`(デフォルト), `critical` で指定。  
  （黒い色調のテーマでは、違いがわかりにくいかもしれない）
- `-t, --expire-time=TIME` ... 表示されたポップアップが消えるまでの時間をミリ秒単位で指定。（10秒なら10000）
- `-i, --icon=ICON[,ICON...]` ... ポップアップ内に表示するアイコン画像を指定。アイコン画像は "/usr/share/pixmaps/" ディレクトリ配下の XPM, PNG, JPEG, SVG 形式の画像で、拡張子を除外して指定。

ちなみに、SUMMARY, BODY には「[Pango Text Attribute Markup Language](https://developer.gnome.org/pango/stable/PangoMarkupFormat.html "Text Attribute Markup")」というマークアップ言語が使用できるので、フォントを変更したりできる。（ただし、当方の環境では「標準」、「Slider」のテーマでは機能しなかった）

#### 3. 使用例

以下のように実行してみる。  
ポップアップ通知位置が「右上隅」に設定されている場合、前に表示されたポップアップが消える前に次のポップアップを表示させると、新しい方が上に表示される。ポップアップ通知位置が「左下隅」、「右下隅」に設定されている場合は、新しい方が下に表示される。  

``` bash 
$ notify-send -u low -i nobody -t 10000 '<span color="blue">Popup TEST 1</span>' ポップアッ プ通知のテスト１です。
$ notify-send -i mate-about-logo -t 10000 '<big>Popup TEST 2</big>' '<span color="blue">ポップ アップ通知のテスト２です。</span>'
$ notify-send -u critical -i language-selector -t 10000 '<big><span color="red">Popup TEST 3</span></big>' '<span background="blue" foreground="yellow">ポップアップ通知のテスト２です。</span>'
```

![LINUX_NOTIFY_SEND]({{site.baseurl}}/images/2013/10/07/LINUX_NOTIFY_SEND.png "使用例")

#### 参考サイト

- [Ubuntu Manpage: notify-send - a program to send desktop notifications](http://manpages.ubuntu.com/manpages/gutsy/man1/notify-send.1.html "Ubuntu Manpage: notify-send - a program to send desktop notifications")

---

シェルスクリプトや cron で利用すれば、便利なものができるのではないでしょうか。

ちなみに当方は、時報を鳴らすシェルスクリプトに notify-send でポップアップする機能も追加して、 cron で毎正時に起動させいています。（cron で起動する場合は、環境変数 `DISPLAY=:0` の設定が必要）

以上。

