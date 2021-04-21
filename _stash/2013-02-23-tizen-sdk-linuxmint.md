---
layout   : single
title    : "Tizen SDK - Linux Mint にインストール！"
published: true
date     : 2013-02-23 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- LinuxMint
- エミュレータ
---

Linux 系のモバイル用オープンソース OS である [Tizen](https://developer.tizen.org/ "Tizen Developers - An open source, standards-based software platform for multiple device categories.") の SDK（開発ツール） を Linux Mint マシンにインストールし、エミュレータを動かしてみた際の記録です。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia(64bit) での作業を想定。

### 1. ファイルダウンロード

[Tizen SDK - Tizen Developers](https://developer.tizen.org/downloads/sdk "Tizen SDK - Tizen Developers") から該当のファイルを適当な場所にダウンロードする。  
今回の環境(Linux Mint 64bit)では、Ubuntu 64bit 版 `tizen-sdk-2.0-ubuntu64.bin` を使用できる。  
ちなみに、Tizen SDK をインストールするには、以下の最低スペックが必要のようだ。  

- CPU: Dual-Core 2 GHz 以上
- RAM: 2 GB 以上
- HDD 空き容量: 3 GB 以上
- Oracle Java v7 以上(OpenJDK は不可)

### 2. インストール

ダウンロードしたファイルに実行権限を付与し、インストールを開始する。

``` bash 
$ sudo chmod +x tizen-sdk-2.0-ubuntu64.bin
$ ./tizen-sdk-2.0-ubuntu64.bin
 If you want to install TIZEN-SDK, you must install "expect"  package(s).
```

環境によっては不足しているものあり、上記のようにエラーメッセージが表示されるので、インストールしておく。

問題がなければ、「Install Manager」が開始される。

![TIZEN_01]({{site.baseurl}}/images/2013/02/23/TIZEN_01.png "TIZEN_01")

インストールするので、デフォルトのまま「Next」ボタンをクリックする。

![TIZEN_02]({{site.baseurl}}/images/2013/02/23/TIZEN_02.png "TIZEN_02")

ラインセス同意のチェックを入れて、「Next」ボタンをクリックする。

![TIZEN_03]({{site.baseurl}}/images/2013/02/23/TIZEN_03.png "TIZEN_03")

インストールタイプを選択（取り敢えず推奨 `Typical`）して、「Next」ボタンをクリックする。

![TIZEN_04]({{site.baseurl}}/images/2013/02/23/TIZEN_04.png "TIZEN_04")

インストール先を入力／選択して、「Next」ボタンをクリックする。  
（インストール先は `/home/＜ユーザ名＞` 配下でなければならいようだ）

![TIZEN_05]({{site.baseurl}}/images/2013/02/23/TIZEN_05.png "TIZEN_05")

インストールが開始される。  
当方の環境の場合は30分弱だったが、今時のマシンならもっと短時間でしょう。

![TIZEN_06]({{site.baseurl}}/images/2013/02/23/TIZEN_06.png "TIZEN_06")

インストールが完了する。  
「Close」ボタンをクリックして、インストール作業を終了する。  
（リリースノートを読まないのならチェックを外しておく）

### 3. エミュレータ起動

![TIZEN_07]({{site.baseurl}}/images/2013/02/23/TIZEN_07.png "TIZEN_07")

「Menu」-「」と辿り「Emulator Manager」をクリックする。

![TIZEN_08]({{site.baseurl}}/images/2013/02/23/TIZEN_08.png "TIZEN_08")

ターゲット選択画面が表示される。  
「tizen2.0」-「x86-standard」の「<< Create new... >>」をクリックし、「Name」に取り敢えず `test` と入力して、「confirm」ボタンをクリックする。

![TIZEN_09]({{site.baseurl}}/images/2013/02/23/TIZEN_09.png "TIZEN_09")

「test」が選択されていることを確認し、「Launch」ボタンをクリックする。

![TIZEN_10]({{site.baseurl}}/images/2013/02/23/TIZEN_10.png "TIZEN_10")

30秒くらいで言語選択画面が表示される。  
ここでは選択の余地がないので、「English」を選択して「Next」ボタンをクリックする。（後で設定可能）

![TIZEN_11]({{site.baseurl}}/images/2013/02/23/TIZEN_11.png "TIZEN_11")

日時設定画面が表示される。  
適切に設定し、「Next」ボタンをクリックする。

![TIZEN_12]({{site.baseurl}}/images/2013/02/23/TIZEN_12.png "TIZEN_12")

設定完了なので、「Finish」ボタンをクリックする。

![TIZEN_13]({{site.baseurl}}/images/2013/02/23/TIZEN_13.png "TIZEN_13")

ホーム画面が表示される。  

設定等色々触ってみる。（当方、なぜかシェル画面は起動できなかった）  
以下は日本語設定した後、Google で Web 検索してみた際の画面。

![TIZEN_14]({{site.baseurl}}/images/2013/02/23/TIZEN_14.png "TIZEN_14")

### 4. 参考サイト

- [Tizen Developers - An open source, standards-based software platform for multiple device categories.](https://developer.tizen.org/ "Tizen Developers - An open source, standards-based software platform for multiple device categories.")

---

Tizen エミュレータがどんなものかを確認してみたかっただけです。

また、実際の開発は Tizen IDE（eclipseベース）で行うようです。  
今回は Linux Mint にインストールしているので Tizen IDE 起動用のスクリプトは機能しません。  
起動スクリプトを編集するか、直接 `ide/eclipse` を実行すれば起動するはずです。

以上。

