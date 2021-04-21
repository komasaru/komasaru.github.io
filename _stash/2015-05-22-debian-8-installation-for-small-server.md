---
layout   : single
title    : "Debian 8 (Jessie) - インストール（サーバ用途・最小構成）！"
published: true
date     : 2015-05-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 8 (Jessie) をサーバ用途・最小構成でインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Oracle VM VirtualBox で仮想マシンにインストールする。
* 仮想マシンのメモリ容量は 1GB, ディスク容量は 50GB を想定する。  
  ネットワークはホストOSからゲストOSへアクセスしたいので「ブリッジ」とする。
* DHCP を使用しない。（ネットワークは手動で設定する）
* パーティションは手動設定する。
* プロキシは使用しない。
* ソフトウェアのインストールは行わない。（必要になったときにインストールするので）

### 1. インストールイメージのダウンロード

以下のサイト、もしくは[国内ミラーサイト](https://www.debian.org/CD/http-ftp/ "HTTP/FTP を使って Debian CD/DVD イメージをダウンロードする")から ISO イメージをダウンロードする。  
今回当方は AMD64 版 NetInstall CD イメージ "debian-8.0.0-amd64-netinst.iso" をダウンロードした。（DVD 版でもよいが、必要なものは必要なときにインストールできればよいので NetInstall 版とした）

* [http://cdimage.debian.org/debian-cd/](http://cdimage.debian.org/debian-cd/ "http://cdimage.debian.org/debian-cd/")

当然、ダウンロード後は CD(DVD) に焼き付ける。（ブート可能オプション必須）  
仮想マシンにインストールするならディスクに焼き付けなくてもよい。

### 2. インストール

以下のような手順でインストールする。  
（スクリーンショットは、画像が多くなるため非掲載。以下の文章だけで理解できるはず）

1. "Boot Menu" で、"Install" を選択する。（綺麗な画面がよければ "Graphical install" を選択する）
2. "Select a language" で、インストール中に使用する言語を選択する。（サーバ環境に日本語は不要なので "English" にした）
3. "Select your location" で、 "other - Asia - Japan" を選択する。
4. "Configure locales" で、 "en-US.UTF-8" を選択する。
5. "Configure the keyboard" で、 "Japanese" を選択する。
6. "Configure the network" で、"Hostname" にマシンに設定するホスト名を入力し、 ＜Continue＞ で次へ進む。
7. 続けて、 "Domain name" にドメイン名を入力し、 ＜Continue＞ で次へ進む。
8. "Set up users and passwords" で、"Root password" に root のパスワードを入力し、 ＜Continue＞ で次へ進む。
9. 続けて、確認のため "Re-enter password to verify" に root のパスワードを再入力し、 ＜Continue＞ で次へ進む。
10. 次に、 "Full name for the new user" にユーザのフルネームを入力し、 ＜Continue＞ で次へ進む。
11. 次に、 "User name for your account" にユーザ名を入力し、 ＜Continue＞ で次へ進む。
12. 次に、 "Choose a password for the new user" にユーザのパスワードを入力し、 ＜Continue＞ で次へ進む。
13. 続けて、確認のため "Re-enter password to verify" にユーザのパスワードを再入力し、 ＜Continue＞ で次へ進む。
14. "Partition disks" で、 "Manual" を選択する。
15. 続けて、パーティションを設定するディスクを選択する。
16. 空の新しいパーティションを作成するか確認されるので、 ＜Yes＞ を選択する。
17. 続けて、パーティション分割方法を選択する。（当方は以下のように設定）
    * Primary   1 GB  /boot
    * Logical   2 GB  swap
    * Logical   2 GB  /
    * Logical  10 GB  /usr
    * Logical  25 GB  /var
    * Logical   2 GB  /tmp
    * Logical   残り  /home
18. "Write the changes to disk?" パーティションの変更をディスクに書き込むか確認されるので、 ＜Yes＞ を選択する。  
    インストールが始まる。
19. "Configure the package manager" で、接続したいアーカイブミラーサイトのある国を選択する。（通常は "Japan" でよい）
20. 続けて、 "Debian archive mirror" で、接続したいアーカイブミラーサイトを選択する。（通常は "ftp.jp.debian.org" でよい）
21. 次に、 "HTTP Proxy information (blank for none)" で、プロキシの設定を行うが、使用しない場合は空のまま ＜Continue＞ で次へ進む。
22. "Configuring popularity-contest" で、パッケージの利用調査に参加するか問われるので、 ＜Yes＞ を選択する。（参加は任意なので ＜No＞ でもよい）
23. "Software selection" では、 "SSH Server" と "Standard system utilities" にのみチェックを入れて ＜Continue＞ で次へ進む。（その他は必要なときにインストールするので）
24. "Install the GRUB boot loader on a hard disk" で、MBR（マスタブートレコード）に GRUB をインストールするか問われるので、 ＜Yes＞ を選択する。（デュアルブートや、別途ブートローダを使用する場合は ＜No＞ を選択する。ブートローダについて理解していないとインストール完了後起動しなくなるので注意）
25. 続けて、 "Device for boot loader installation" で、ブートローダをインストールするディスクを選択する。
26. "Finish the installation" で、ディスクを取り出し（仮想マシンなら切断（アンマウント）し）、 ＜Continue＞ で再起動する。
27. 再起動後、ログインコンソール画面が表示されればインストールは成功。
28. さらに、登録したユーザや root でログインできるかも確認する。

---

以上。

