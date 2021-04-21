---
layout   : single
title    : "FreeBSD 10.0 - インストール！"
published: true
date     : 2014-10-16 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
---

「FreeBSD 10.0 - インストール」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* FreeBSD 10.0(x86_64 版) をインストールする。（サーバ用途）
* IPv4 を使用する。（IPv6 は使用しない）
* 固定 IP を使用する。（DHCP は使用しない）
* インストールマシンの IP アドレス/サブネットマスクは 192.168.11.102/255.255.255.0 を想定。
* ネットワーク内のルータの IP アドレスは 192.168.11.1 を想定。

### 1. マシン起動

ディスクをセットするか、仮想マシンなら ISO イメージを指定して起動する。

![01_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/01_FreeBSD_10-0_64_Server.png "01_FreeBSD_10-0_64_Server")

### 2. インストール作業開始

"Install" を選択。

![02_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/02_FreeBSD_10-0_64_Server.png "02_FreeBSD_10-0_64_Server")

### 3. キーボード設定

"Japanese 106" を選択。（環境により適宜設定）  
そして、入力テストを行う。

![03_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/03_FreeBSD_10-0_64_Server.png "03_FreeBSD_10-0_64_Server")
![04_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/04_FreeBSD_10-0_64_Server.png "04_FreeBSD_10-0_64_Server")
![05_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/05_FreeBSD_10-0_64_Server.png "05_FreeBSD_10-0_64_Server")
![06_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/06_FreeBSD_10-0_64_Server.png "06_FreeBSD_10-0_64_Server")

### 4. ホスト名設定

当マシンのホスト名を設定。

![07_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/07_FreeBSD_10-0_64_Server.png "07_FreeBSD_10-0_64_Server")

### 5. インストールコンポーネントの設定

"lib32", "ports" のみにチェックを入れる。（32bit 版インストールの場合は "lib32" は無い）

![08_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/08_FreeBSD_10-0_64_Server.png "08_FreeBSD_10-0_64_Server")

### 6. パーティション設定

今回は手動でパーティションを設定する。  
"Manual" を選択。

![09_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/09_FreeBSD_10-0_64_Server.png "09_FreeBSD_10-0_64_Server")

パーティションを作成するディスクが選択されていることを確認して "Create" を実行。

![10_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/10_FreeBSD_10-0_64_Server.png "10_FreeBSD_10-0_64_Server")

freebsd-boot を以下のように設定。

![11_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/11_FreeBSD_10-0_64_Server.png "11_FreeBSD_10-0_64_Server")

その他、同様に設定を行う。  
以下は当方の（テスト環境用の）作成例。（ラベル名は boot, root, swap, usr, var, tmp, home としている）

![12_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/12_FreeBSD_10-0_64_Server.png "12_FreeBSD_10-0_64_Server")

そして、設定の確定。

![13_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/13_FreeBSD_10-0_64_Server.png "13_FreeBSD_10-0_64_Server")

### 7. インストールの開始

インストールが開始される。

![14_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/14_FreeBSD_10-0_64_Server.png "14_FreeBSD_10-0_64_Server")

### 8. root パスワード設定

root ユーザのパスワードを設定する。

![15_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/15_FreeBSD_10-0_64_Server.png "15_FreeBSD_10-0_64_Server")

### 9. ネットワークインターフェース選択

ネットワークインターフェースを選択する。

![16_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/16_FreeBSD_10-0_64_Server.png "16_FreeBSD_10-0_64_Server")

### 10. IPv4 設定

今回は IPv4 を使用するので "Yes" を選択。

![17_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/17_FreeBSD_10-0_64_Server.png "17_FreeBSD_10-0_64_Server")

### 11. DHCP 設定

今回は DHCP は使用しない（固定 IP を使用する）ので "No" を選択。

![18_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/18_FreeBSD_10-0_64_Server.png "18_FreeBSD_10-0_64_Server")

### 12. ネットワーク設定

IP アドレス、サブネットマスク、デフォルトゲートウェイ（ルータの IP アドレス）を設定する。

![19_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/19_FreeBSD_10-0_64_Server.png "19_FreeBSD_10-0_64_Server")

### 13. IPv6 設定

今回は IPv6 は使用しないので、 "No" を選択。

![20_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/20_FreeBSD_10-0_64_Server.png "20_FreeBSD_10-0_64_Server")

### 14. DNS 設定

Search アドレスにドメイン名を、DNS アドレスにルータ（もしくはネットワーク内の DNS サーバ）の IP アドレスを入力。

![21_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/21_FreeBSD_10-0_64_Server.png "21_FreeBSD_10-0_64_Server")

### 15. CMOS クロック設定

マシンの CMOS クロックを UTC ではなくローカルの時刻に設定するので "No" を選択。

![22_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/22_FreeBSD_10-0_64_Server.png "22_FreeBSD_10-0_64_Server")

### 16. タイムゾーン設定

"Asia" - "Japan" と選択。

![23_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/23_FreeBSD_10-0_64_Server.png "23_FreeBSD_10-0_64_Server")
![24_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/24_FreeBSD_10-0_64_Server.png "24_FreeBSD_10-0_64_Server")

そして、JST（日本標準時）を使用するので "Yes" を選択。

![25_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/25_FreeBSD_10-0_64_Server.png "25_FreeBSD_10-0_64_Server")

### 17. サービス選択

追加で有効にしたいサービスを選択。ここでは "sshd" のみを選択。

![26_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/26_FreeBSD_10-0_64_Server.png "26_FreeBSD_10-0_64_Server")

### 18. 一般ユーザ追加

一般ユーザを追加する。（インストール作業後に別途追加することも可能）

![27_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/27_FreeBSD_10-0_64_Server.png "27_FreeBSD_10-0_64_Server")

取り急ぎ、ユーザ名・フルネーム、ログイングループ "wheel" の追加とパスワードの設定のみ。

![28_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/28_FreeBSD_10-0_64_Server.png "28_FreeBSD_10-0_64_Server")

### 19. 最終設定

これで、設定を終了するので "Exit" を選択。

![29_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/29_FreeBSD_10-0_64_Server.png "29_FreeBSD_10-0_64_Server")

再起動前に、追加の設定をするか確認されるが、もう追加の設定は行わないので "No" を選択。

![30_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/30_FreeBSD_10-0_64_Server.png "30_FreeBSD_10-0_64_Server")

### 20. マシン再起動

"Reboot" を選択してマシンを再起動する。  

![31_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/31_FreeBSD_10-0_64_Server.png "31_FreeBSD_10-0_64_Server")

シャットダウンプロセス終了後、再起動が始まるまでにディスクを取り出すこと。  
ディスク取り出しが間に合わず、再度ディスクを読み込んでしまった場合は、ディスクを取り出してマシンをリセットすればよい。

![32_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/32_FreeBSD_10-0_64_Server.png "32_FreeBSD_10-0_64_Server")

### 21. ログイン

一般ユーザでログイン。

![33_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/33_FreeBSD_10-0_64_Server.png "33_FreeBSD_10-0_64_Server")

root ユーザになる。

![34_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/34_FreeBSD_10-0_64_Server.png "34_FreeBSD_10-0_64_Server")

`uname`, `df` コマンド等を使用してみる。

![35_FreeBSD_10-0_64_Server]({{site.baseurl}}/images/2014/10/16/35_FreeBSD_10-0_64_Server.png "35_FreeBSD_10-0_64_Server")

---

以上。

