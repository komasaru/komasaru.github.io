---
layout   : single
title    : "CentOS 6.5 - サーバ構築まとめ！"
published: true
date     : 2014-01-28 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

これまで、１か月以上にわたって CentOS 6.5 によるサーバ構築について（実際に当方が行なっている作業を中心に）紹介してきました。

ちなみに、毎日膨大な労力を費やして記事にしていた訳ではありません。  
普段から録りためていた資料を参考にサーバ構築作業を行い、変更点があればその記録を修正し、それをコピーアンドペーストして記事にしていただけです。

以下に今回のシリーズで行なった作業の一覧と追記事項を掲載します。

<!--more-->

### 1. 作業一覧（記事にした順）

- [CentOS 6.5 - インストール！]({{site.baseurl}}/2013/12/12/centos-6-5-install/ "CentOS 6.5 - インストール！")
- [CentOS 6.5 - 初期設定！]({{site.baseurl}}/2013/12/13/centos-6-5-first-setting/ "CentOS 6.5 - 初期設定！")
- [CentOS 6.5 - SSHサーバ（OpenSSH）構築！]({{site.baseurl}}/2013/12/14/centos-6-5-openssh-installation/ "CentOS 6.5 - SSHサーバ（OpenSSH）構築！")
- [CentOS 6.5 - SSH サーバ 鍵認証接続！]({{site.baseurl}}/2013/12/15/centos-6-5-ssh-connection-by-key-certificate/ "CentOS 6.5 - SSH サーバ 鍵認証接続！")
- [CentOS 6.5 - NTP サーバ構築！]({{site.baseurl}}/2013/12/16/centos-6-5-ntp-installation/ "CentOS 6.5 - NTP サーバ構築！")
- [CentOS 6.5 - ファイル改ざん検知システム（Tripwire）導入！]({{site.baseurl}}/2013/12/17/centos-6-5-tripwire-installation/ "CentOS 6.5 - ファイル改ざん検知システム（Tripwire）導入！")
- [CentOS 6.5 - rootkit 検知ツール（chkrootkit）導入！]({{site.baseurl}}/2013/12/18/centos-6-5-chkrootkit-installation/ "CentOS 6.5 - rootkit 検知ツール（chkrootkit）導入！")
- [CentOS 6.5 - アンチウィルスソフト（Clam AntiVirus）導入！]({{site.baseurl}}/2013/12/19/centos-6-5-clamantivirus-installation/ "CentOS 6.5 - アンチウィルスソフト（Clam AntiVirus）導入！")
- [CentOS 6.5 - ファイアウォール（iptables）構築！]({{site.baseurl}}/2013/12/20/centos-6-5-iptables-installation/ "CentOS 6.5 - ファイアウォール（iptables）構築！")
- [CentOS 6.5 - DNS サーバ（BIND）構築！]({{site.baseurl}}/2013/12/21/centos-6-5-bind-installation/ "CentOS 6.5 - DNS サーバ（BIND）構築！")
- [CentOS 6.5 - FTP サーバ（vsftpd）構築！]({{site.baseurl}}/2013/12/22/centos-6-5-vsftpd-installation/ "CentOS 6.5 - FTP サーバ（vsftpd）構築！")
- [CentOS 6.5 - ファイルサーバ（NFS）構築！]({{site.baseurl}}/2013/12/23/centos-6-5-nfs-installation/ "CentOS 6.5 - ファイルサーバ（NFS）構築！")
- [CentOS 6.5 - ファイルサーバ（Samba）構築！]({{site.baseurl}}/2013/12/24/centos-6-5-samba-installation/ "CentOS 6.5 - ファイルサーバ（Samba）構築！")
- [CentOS 6.5 - 送信メールサーバ（Postfix）構築！]({{site.baseurl}}/2013/12/25/centos-6-5-postfix-installation/ "CentOS 6.5 - 送信メールサーバ（Postfix）構築！")
- [CentOS 6.5 - Postfix の OP25B 対策！]({{site.baseurl}}/2013/12/26/centos-6-5-postfix-op25b-setting/ "CentOS 6.5 - Postfix の OP25B 対策！")
- [CentOS 6.5 - 受信メールサーバ（Dovecot）構築！]({{site.baseurl}}/2013/12/27/centos-6-5-dovecot-installation/ "CentOS 6.5 - 受信メールサーバ（Dovecot）構築！")
- [CentOS 6.5 - メールサーバ間通信内容暗号化（OpenSSL）！]({{site.baseurl}}/2013/12/28/centos-6-5-mail-openssl/ "CentOS 6.5 - メールサーバ間通信内容暗号化（OpenSSL）！")
- [CentOS 6.5 - メールサーバ（Postfix）でウィルスチェック！]({{site.baseurl}}/2013/12/29/centos-6-5-mail-virus-check/ "CentOS 6.5 - メールサーバ（Postfix）でウィルスチェック！")
- [CentOS 6.5 - メールサーバ（Postfix）でスパムチェック！]({{site.baseurl}}/2013/12/30/centos-6-5-mail-spam-check/ "CentOS 6.5 - メールサーバ（Postfix）でスパムチェック！")
- [CentOS 6.5 - スパムメール誤認識対策（Postfix + SpamAssassin）！]({{site.baseurl}}/2013/12/31/centos-6-5-taking-measures-spam-disrecognition/ "CentOS 6.5 - スパムメール誤認識対策（Postfix + SpamAssassin）！")
- [CentOS 6.5 - メール自動返信機能（Vacation）導入！]({{site.baseurl}}/2014/01/02/centos-6-5-vacation-installation/ "CentOS 6.5 - メール自動返信機能（Vacation）導入！")
- [CentOS 6.5 - Postfix ログ解析ツール（pflogsumm）導入！]({{site.baseurl}}/2014/01/03/centos-6-5-pflogsumm-installation/ "CentOS 6.5 - Postfix ログ解析ツール（pflogsumm）導入！")
- [CentOS 6.5 - 複数ドメイン宛メールの集約（Fetchmail）！]({{site.baseurl}}/2014/01/04/centos-6-5-fetchmail-installation/ "CentOS 6.5 - 複数ドメイン宛メールの集約（Fetchmail）！")
- [CentOS 6.5 - Web サーバ Nginx 構築（ソースインストール）！]({{site.baseurl}}/2014/01/05/centos-6-5-nginx-installation-by-src/ "CentOS 6.5 - Web サーバ Nginx 構築（ソースインストール）！")
- [CentOS 6.5 - DB サーバ MariaDB 構築（ソースインストール）！]({{site.baseurl}}/2014/01/06/centos-6-5-mariadb-installation-by-src/ "CentOS 6.5 - DB サーバ MariaDB 構築（ソースインストール）！")
- [CentOS 6.5 - Ruby 2.0 インストール（ソースビルド）！]({{site.baseurl}}/2014/01/07/centos-6-5-ruby-installation-by-src/ "CentOS 6.5 - Ruby 2.0 インストール（ソースビルド）！")
- [CentOS 6.5 - 自動バックアップ運用！]({{site.baseurl}}/2014/01/08/centos-6-5-automatic-backup-setting/ "CentOS 6.5 - 自動バックアップ運用！")
- [CentOS 6.5 - rsync でファイル・ディレクトリ同期（同期先として）！]({{site.baseurl}}/2014/01/09/centos-6-5-rsync-setting-as-destination/ "CentOS 6.5 - rsync でファイル・ディレクトリ同期（同期先として）！")
- [CentOS 6.5 - rsync でファイル・ディレクトリ同期（同期元として）！]({{site.baseurl}}/2014/01/10/centos-6-5-rsync-setting-as-source/ "CentOS 6.5 - rsync でファイル・ディレクトリ同期（同期元として）！")
- [CentOS 6.5 - Git サーバ構築！]({{site.baseurl}}/2014/01/11/centos-6-5-git-installation/ "CentOS 6.5 - Git サーバ構築！")
- [CentOS 6.5 - ログ解析ツール（LogWatch）導入！]({{site.baseurl}}/2014/01/12/centos-6-5-logwatch-installation/ "CentOS 6.5 - ログ解析ツール（LogWatch）導入！")
- [CentOS 6.5 - サーバ監視ツール（munin）導入！]({{site.baseurl}}/2014/01/13/centos-6-5-munin-installation/ "CentOS 6.5 - サーバ監視ツール（munin）導入！")
- [CentOS 6.5 - サーバ監視ツール（munin）でハードディスク温度監視！]({{site.baseurl}}/2014/01/14/centos-6-5-munin-setting-of-hddtemp/ "CentOS 6.5 - サーバ監視ツール（munin）でハードディスク温度監視！")
- [CentOS 6.5 - サーバ監視ツール（munin）でCPU温度・電圧・ファン回転数測定！]({{site.baseurl}}/2014/01/15/centos-6-5-munin-setting-of-cpu-fan/ "CentOS 6.5 - サーバ監視ツール（munin）でCPU温度・電圧・ファン回転数測定！")
- [CentOS 6.5 - サーバ監視ツール（munin）で MariaDB(MySQL) を監視！]({{site.baseurl}}/2014/01/16/centos-6-5-munin-setting-of-mariadb-mysql/ "CentOS 6.5 - サーバ監視ツール（munin）で MariaDB(MySQL) を監視！")
- [CentOS 6.5 - サーバ監視ツール（munin）で Nginx を監視！]({{site.baseurl}}/2014/01/17/centos-6-5-munin-setting-of-nginx/ "CentOS 6.5 - サーバ監視ツール（munin）で Nginx を監視！")
- [CentOS 6.5 - Web サーバ Nginx で SSL 接続！]({{site.baseurl}}/2014/01/18/centos-6-5-nginx-setting-of-ssl/ "CentOS 6.5 - Web サーバ Nginx で SSL 接続！")
- [CentOS 6.5 - PHP インストール（ソースビルド）！]({{site.baseurl}}/2014/01/19/centos-6-5-php-installation-by-src/ "CentOS 6.5 - PHP インストール（ソースビルド）！")
- [CentOS 6.5 - PHP と Nginx の連携！]({{site.baseurl}}/2014/01/20/centos-6-5-php-coordination-with-nginx/ "CentOS 6.5 - PHP と Nginx の連携！")
- [CentOS 6.5 - ユーザ管理ツール（Usermin）導入！]({{site.baseurl}}/2014/01/21/centos-6-5-usermin-installation/ "CentOS 6.5 - ユーザ管理ツール（Usermin）導入！")
- [CentOS 6.5 - Usermin で Vacation 設定！]({{site.baseurl}}/2014/01/22/centos-6-5-usermin-vacation-setting/ "CentOS 6.5 - Usermin で Vacation 設定！")
- [CentOS 6.5 - Webmail システム SquirrelMail 導入！]({{site.baseurl}}/2014/01/23/centos-6-5-squirrel-mail-installation/ "CentOS 6.5 - Webmail システム SquirrelMail 導入！")
- [CentOS 6.5 - ログ監視ツール SWATCH 導入！]({{site.baseurl}}/2014/01/24/centos-6-5-swatch-installation/ "CentOS 6.5 - ログ監視ツール SWATCH 導入！")

### 2. 追記事項

上記の作業以外で主に行なっていること。

- 各種自作スクリプト・プログラムの配置（Ruby, シェルスクリプト, cron スクリプト）。
- Rails アプリ・サイト作成。（Nginx と Unicorn の連携）
- 各種 Git リポジトリ作成。
- Web カメラ静止画像を１日単位で動画にする。
- 各種作業用のユーザ作成。（Twitter Bot 用等）

---

今回で一旦 CentOS 6.5 サーバ構築のシリーズは終了します。  
何か記事にするようなことがあれば、別途記事にします。

以上。

