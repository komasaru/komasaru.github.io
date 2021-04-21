---
layout   : single
title    : "CentOS 7.0 - インストール！"
published: true
date     : 2014-08-04 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

「CentOS 7.0 - インストール」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を仮想マシン（Virtual Box）に NetInstall でインストールする。（必ずしも NetInstall でなくてもよい）
- サーバ用途なのでデスクトップ環境は導入しない。
- ISO イメージは「[ミラーサイト](http://www.centos.org/download/mirrors/ "Mirror List")」一覧のうち近い場所を選んでダウンロードする。
- ISO イメージのディスクへの書き込みについてはここでは説明しない。  
  （ファイルとしてではなくイメージとして書き込むことに注意するくらい。また、仮想マシンへのインストールなら、ディスクに書き込む必要はなくインストール時に ISO イメージを指定すればよい）
- マシン搭載メモリは 1GB を想定。
- ローカル IP アドレスは 192.168.11.102 を想定。
- ホスト名は vbox.mk-mode.com を想定。
- IPv6 は使用しない。

### 1. CentOS 7.0 インストール開始

"CentOS-7.0-1406-x86_64-NetInstall.iso" を使用してインストールを開始する。

![CENTOS_7-0_1406_INSTALL_01]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_01.png "CENTOS_7-0_1406_INSTALL_01")

### 2. 言語選択

言語を「日本語」に設定する。キーボードは自動で "jp" に変わる。

![CENTOS_7-0_1406_INSTALL_02]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_02.png "CENTOS_7-0_1406_INSTALL_02")

### 3. インストール概要画面

インストールの概要画面が表示される。  
現時点で問題のある箇所に「！」アイコンが表示される。アイコンの表示されている項目を設定していく。  
NetInstall でなくディスクを使用している場合は「インストールソース」に「！」アイコンは表示されない。

![CENTOS_7-0_1406_INSTALL_03]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_03.png "CENTOS_7-0_1406_INSTALL_03")

### 4. ネットワークとホスト名

「ネットワークとホスト名」の画面で「設定」をクリックする。

![CENTOS_7-0_1406_INSTALL_04]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_04.png "CENTOS_7-0_1406_INSTALL_04")

「IPv4 のセッティング」タブで以下のように設定する。

![CENTOS_7-0_1406_INSTALL_05]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_05.png "CENTOS_7-0_1406_INSTALL_05")

IPv6 を使用しないので「IPv6 のセッティング」の「方式」を「無視する」に設定する。

![CENTOS_7-0_1406_INSTALL_06]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_06.png "CENTOS_7-0_1406_INSTALL_06")

「ホスト名」を設定する。

![CENTOS_7-0_1406_INSTALL_07]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_07.png "CENTOS_7-0_1406_INSTALL_07")

また、画面右上のスイッチが OFF なら ON にする。

### 5. インストールソース

NetInstall の場合は「インストールソース」で接続先の URL を設定する。  
理研のサーバなら "http://ftp.riken.jp/Linux/centos/7.0.1406/os/x86_64/" のようにする。  
（インストールイメージを使用する場合はディスクが設定されているはずなのでこの作業は不要）  
また、この時点で追加したいリポジトリが分かっていれば追加しておいてもよい。

![CENTOS_7-0_1406_INSTALL_08]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_08.png "CENTOS_7-0_1406_INSTALL_08")

### 6. ソフトウェアの選択

必要なものはその都度インストールするので、ここでは「最小限のインストール」を選択する。

![CENTOS_7-0_1406_INSTALL_09]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_09.png "CENTOS_7-0_1406_INSTALL_09")

### 7. インストール先

「ローカルの標準ディスク」でインストール先のディスクにチェックを入れる（入っていることを確認する）。  
今回は仮想マシン上なので「パーティション構成」は「自動構成のパーティション構成」を選択する。

![CENTOS_7-0_1406_INSTALL_10]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_10.png "CENTOS_7-0_1406_INSTALL_10")

ただし、実運用では詳細に設定する。例えば以下のように。

```

boot        ext4      200MB     固定容量        基本パーティション
/           ext4     2048MB     固定容量        基本パーティション
swap        swap     2048MB     固定容量        基本パーティション
/usr        ext4    10240MB     固定容量        －
/usr/local  ext4    10240MB     固定容量        －
/tmp        ext4     2048MB     固定容量        －
/var        ext4    40960MB     固定容量        －
/home       ext4     [残り]     最大許容容量    －
```

### 8. インストールの開始

「！」アイコンの表示がなくなったらインストール可能なので「インストールの開始」をクリックしてインストールを開始する。

![CENTOS_7-0_1406_INSTALL_11]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_11.png "CENTOS_7-0_1406_INSTALL_11")

### 9. ユーザの設定

インストール中に「 root パスワード」の設定と「ユーザ作成」を行う。

![CENTOS_7-0_1406_INSTALL_12]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_12.png "CENTOS_7-0_1406_INSTALL_12")

![CENTOS_7-0_1406_INSTALL_13]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_13.png "CENTOS_7-0_1406_INSTALL_13")

![CENTOS_7-0_1406_INSTALL_14]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_14.png "CENTOS_7-0_1406_INSTALL_14")

### 10. インストールの完了

インストールが完了したら「再起動」をクリックしてマシンを再起動する。

![CENTOS_7-0_1406_INSTALL_15]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_15.png "CENTOS_7-0_1406_INSTALL_15")

### 11. インストール確認

マシンが再起動したら一般ユーザでのログイン、root でのログインをしてみる。  
そして、試しにシステム情報、ディスク使用状況を表示してみる。  
確認後、シャットダウンする。

![CENTOS_7-0_1406_INSTALL_16]({{site.baseurl}}/images/2014/08/04/CENTOS_7-0_1406_INSTALL_16.png "CENTOS_7-0_1406_INSTALL_16")

---

以上。

