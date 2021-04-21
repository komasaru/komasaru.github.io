---
layout   : single
title    : "CentOS 7.0 - 初期設定！"
published: true
date     : 2014-08-05 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

「CentOS 7.0 - 初期設定」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- 一般ユーザはインストール作業時に設定済み。
- 作業はローカル端末から SSH 接続で行う。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- 設定ファイル編集等はテキストエディタ Vi を使用する。（`vi` コマンド入力のことまで説明はしない）
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. 一般ユーザ作成

インストール時に一般ユーザを作成していない場合は、root でログインして一般ユーザを作成する。

``` text
vbox login: root
Password:

[root@vbox ~]# useradd masaru
[root@vbox ~]# passwd masaru
Changing password for user masaru.
New password:
Retype new password:
passwd: all authentication tokens updated successfully.
[root@vbox ~]# 
```

### 2. ログイン

今後は最初に一般ユーザでログインし、その後の作業は root になって行うようにする。  
（サーバ専用で使用するマシンを想定しているので。クライント用途なら、普段は一般ユーザで作業を行い、 root 権限が必要な場合のみ root になるか、 sudo コマンドを使用して作業を行う。）

``` text
[root@vbox ~]# exit

vbox login: masaru
Password:

[masaru@vbox ~]$ su -
Password:
[root@vbox ~]# 
```

**※今後、プロンプトは root ユーザは `#` 、一般ユーザは `$` のみで表現する。**  
**※また、ファイル編集時の `vi` コマンドについても記述は省略する。**

### 3. root になれるユーザの設定

一般ユーザを管理者グループに所属させ、root になれるユーザを管理者のみに限定するように設定する。

``` text
# usermod -G wheel masaru
```

File: `/etc/pam.d/su`

{% highlight bash linenos %}
auth       required     pam_wheel.so use_uid  # <= コメント解除
{% endhighlight %}

### 4. 起動中サービスの一覧

現在起動中のサービス一覧を表示してみる。

``` text
# systemctl -t service
UNIT                      LOAD   ACTIVE SUB     DESCRIPTION
auditd.service            loaded active running Security Auditing Serv
avahi-daemon.service      loaded active running Avahi mDNS/DNS-SD Stac
crond.service             loaded active running Command Scheduler
dbus.service              loaded active running D-Bus System Message B
firewalld.service         loaded active running firewalld - dynamic fi
getty@tty1.service        loaded active running Getty on tty1
iprdump.service           loaded active running LSB: Start the ipr dum
iprinit.service           loaded active running LSB: Start the ipr ini
iprupdate.service         loaded active running LSB: Start the iprupda
kdump.service             loaded failed failed  Crash recovery kernel
kmod-static-nodes.service loaded active exited  Create list of require
lvm2-lvmetad.service      loaded active running LVM2 metadata daemon

      :

systemd-...ssions.service loaded active exited  Permit User Sessions
systemd-...-setup.service loaded active exited  Setup Virtual Console
tuned.service             loaded active running Dynamic System Tuning

LOAD   = Reflects whether the unit definition was properly loaded.
ACTIVE = The high-level unit activation state, i.e. generalization of
SUB    = The low-level unit activation state, values depend on unit ty

38 loaded units listed. Pass --all to see loaded but inactive units, t
To show all installed unit files use 'systemctl list-unit-files'.
```

### 5. サービス起動設定の一覧

サービスの起動設定の一覧を表示してみる。

``` text
# systemctl list-unit-files -t service
UNIT FILE                                   STATE
auditd.service                              enabled
autovt@.service                             disabled
avahi-daemon.service                        enabled
blk-availability.service                    disabled
brandbot.service                            static
console-getty.service                       disabled
console-shell.service                       disabled
cpupower.service                            disabled
crond.service                               enabled

      :

systemd-user-sessions.service               static
systemd-vconsole-setup.service              static
teamd@.service                              static
tuned.service                               enabled
wpa_supplicant.service                      disabled

124 unit files listed.
```

### 6. kdump 無効化

kdump（クラッシュダンプ）は不要なので（メモリ不足で正常に動作しないので）自動起動を停止する。

``` text
# systemctl disable kdump
rm '/etc/systemd/system/multi-user.target.wants/kdump.service'

# systemctl list-unit-files -t service | grep kdump
kdump.service                               disabled  # <= disabled になっていることを確認
```

### 7. Network Manager 停止

動的ネットワーク制御及び設定システム Network Manager は使用しない（network サービスのみを使用する）ので、停止する。

``` text
# systemctl stop NetworkManager

# systemctl disable NetworkManager
rm '/etc/systemd/system/multi-user.target.wants/NetworkManager.service'
rm '/etc/systemd/system/dbus-org.freedesktop.NetworkManager.service'
rm '/etc/systemd/system/dbus-org.freedesktop.nm-dispatcher.service'

# systemctl restart network

# chkconfig network on
# chkconfig --list network  # <= 2,3,4,5 が on であることを確認
network         0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

Network Manager を無効化した場合は "/etc/sysconfig/network-scripts/ifcfg-xxxx"（xxxx は環境により異なる）ファイル内の `IPADDR0`, `PREFIX0`, `GATEWAY0` の `0` を除去したほうが良いかも知れない。（ゲートウェイが設定されてないことになり、`wget` コマンドでネットワーク不具合が発生するかもしれないため）（Netwoark Manager 無効化が影響しているのか否か真相は精査していないが）

### 8. IPv6 無効化

CentOS インストール時にネットワーク設定で「無効」にしても、IPv6 は認識しているようなので、使用しなければ混乱予防のために無効化する。

まず、 "/etc/default/grub" ファイル内の `GRUB_CMDLINE_LINUX` 項目の文字列内に `ipv6.disable=1` を追加する。（以下は当方の例であり、文字列の他の部分は環境により異なる）

File: `/etc/default/grub`

{% highlight bash linenos %}
GRUB_CMDLINE_LINUX="ipv6.disable=1 vconsole.keymap=jp106 crashkernel=auto  vconsole.font=latarcyrheb-sun16 rhgb quiet"
{% endhighlight %}

そして、変更を反映＆リブート。

``` text
# grub2-mkconfig -o /boot/grub2/grub.cfg
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-3.10.0-123.el7.x86_64
Found initrd image: /boot/initramfs-3.10.0-123.el7.x86_64.img
Found linux image: /boot/vmlinuz-3.10.0-123.6.3.el7.x86_64
Found initrd image: /boot/initramfs-3.10.0-123.6.3.el7.x86_64.img
Found linux image: /boot/vmlinuz-3.10.0-123.4.4.el7.x86_64
Found initrd image: /boot/initramfs-3.10.0-123.4.4.el7.x86_64.img
Found linux image: /boot/vmlinuz-0-rescue-5e8679e1e7014d0ca9e116c28540fdfa
Found initrd image: /boot/initramfs-0-rescue-5e8679e1e7014d0ca9e116c28540fdfa.img
done

# systemctl reboot
```

### 9. インストール済みパッケージのアップデート

初期インストール済みのパッケージを一括でアップデートする。

``` text
# yum -y update
```

### 10. パッケージ自動アップデート設定

インストール済みパッケージを自動でアップデートするために "yum-cron" をインストール・起動する。

``` text
# yum -y install yum-cron
# systemctl start yum-cron
# systemctl enable yum-cron
# systemctl list-unit-files -t service | grep yum-cron
yum-cron.service                            enabled  # <= enabled になっていることを確認
```

そして、自動でダウンロード・アップデートされるように設定する。

File: `/etc/yum/yum-cron.conf`

{% highlight bash linenos %}
# Whether updates should be applied when they are available.  Note
# that download_updates must also be yes for the update to be applied.
apply_updates = yes  # <= 変更
{% endhighlight %}

### 11. 必要パッケージのインストール

最低限必要なパッケージをインストールしておく。（ベースパッケージ群、開発ツールパッケージ群）

``` text
# yum -y groupinstall Base "Development tools"
```

### 12. root 宛メール転送設定

メール転送に必要な `mail` コマンドをインストールする。

``` text
# yum -y install mailx
```

root 宛のメールを普段使用するメールアドレス（もしくは、一般ユーザ名）に転送するように設定する。

File: `/etc/aliases`

{% highlight bash linenos %}
#root:              marc
root:               masaru  # <= 最終行に追加
{% endhighlight %}

設定変更を反映させる。

``` text
# newaliases
```

root 宛にメールを送信し、転送されることを確認する。  
OS インストール直後からメールサーバは起動しているはずなので、転送先を一般ユーザにしている場合はデフォルトのメールボックス（"/var/spool/mail/masaru"）に受信する。

``` text
# echo test|mail root
```

### 13. SELinux の無効化

今後各種サーバをインストールする際に SELinux がネックになってハマることもあるので、現時点では無効にしておくのが無難。

``` text
# getenforce             # <= 現状確認
Enforcing                # <= 有効になっている
# setenforce Permissive  # <= 無効化（"0" でもよい）
# getenforce             # <= 状態確認
Permissive               # <= 無効になった
```

マシン起動時に自動で SELinux を無効にするには、 "/etc/sysconfig/selinux" を以下のように編集する。

File: `/etc/sysconfig/selinux`

{% highlight bash linenos %}
#SELINUX=enforcing  # <= コメント化もしくは削除
SELINUX=disabled    # <= 変更
{% endhighlight %}

### 14. ファイアウォールの無効化

SELinux 同様、今後各種サーバをインストールする際にファイアウォール設定がネックになってハマることもあるので、現時点（サーバを外部に公開する前の時点）では FirewallD を無効にしておくのが無難。

``` text
# systemctl stop firewalld     # <= サービス停止
# systemctl disable firewalld  # <= 自動起動停止
rm '/etc/systemd/system/dbus-org.fedoraproject.FirewallD1.service'
rm '/etc/systemd/system/basic.target.wants/firewalld.service'
# systemctl list-unit-files -t service | grep firewalld
firewalld.service                           disabled   # <= disabled になっていることを確認
```

無効にはせず、デフォルトで "public"（ssh, dhcpv6-client のみ受信許可）となっている FirewallD ゾーン設定を "trusted"（あらゆるパケットを受信許可） に変更しても良いだろう。（この場合も iptables, ip6tables, ebtables は停止はする）（以下は NIC 名が "enp0s3" の例）

``` text
# firewall-cmd --get-default-zone  # <= デフォルトゾーンの確認
public
# firewall-cmd --get-active-zone   # <= アクティブゾーンの確認
public
  interfaces: enp0s3

# firewall-cmd --zone=trusted --change-interface=enp0s3  # <= アクティブゾーンを trusted に変更
success
# firewall-cmd --zone=trusted --change-interface=enp0s3 --permanent # <= 恒久的に変更
success

# firewall-cmd --get-active-zone   # <= アクティブゾーンの確認
trusted
  interfaces: enp0s3
```

ちなみに、上記で `--permanent` オプション指定せず、ifcfg ファイルに以下のように追記しても恒久的な設定になる。

File: `/etc/sysconfig/network-scripts/ifcfg-enp0s3`

{% highlight bash linenos %}
ZONE=trusted  # <= 最終行に追加
{% endhighlight %}

そして、今後公開するサーバの設定を行う際に都度ファイアウォールの設定を行う。

**FirewallD の設定等については別途説明する。**

### 15. nkf コマンドのインストール

日本語処理に必要な `nkf` コマンドをインストールしておく。（随所で日本語を使用しないのであれば不要）  
以前は nkf パッケージがあり yum インストールできたが、nkf パッケージがなくなったのでソースをビルドしてインストールする。  
（最新バージョンの確認は「[こちら](http://sourceforge.jp/projects/nkf/releases/ "ダウンロードファイル一覧 - nkf Network Kanji Filter - SourceForge.JP")」）

``` text
# wget "http://sourceforge.jp/frs/redir.php?m=jaist&f=%2Fnkf%2F59912%2Fnkf-2.1.3.tar.gz" -O nkf-2.1.3.tar.gz
# tar zxvf nkf-2.1.3.tar.gz
# cd nkf-2.1.3
# make
# make install
# cd
# rm -rf nkf-2.1.3
# rm -f nkf-2.1.3.tar.gz
# nkf -v
Network Kanji Filter Version 2.1.3 (2013-11-22)
Copyright (C) 1987, FUJITSU LTD. (I.Ichikawa).
Copyright (C) 1996-2013, The nkf Project.
```

### 16. Vim エディタ設定

Vi 派生の高機能エディタ Vim をインストールする。（最近は、デフォルトでインストールされている）

``` text
# yum -y install vim-enhanced
```

`vi` コマンドを別名で `vim` に登録する。

``` text
# alias vi='vim'
```

`vi` コマンドの別名設定を確認する。

``` text
# which vi
alias vi='vim'
        /bin/vim
```

このままではログオフした後、再ログインすると設定が消えてしまうので、以下のように "/etc/bashrc" へ登録する。

File: `/etc/bashrc`

{% highlight bash linenos %}
alias vi='vim'  # <= 最終行へ追加
{% endhighlight %}

好みにより（または、文字を見やすくするため）、カラースキームの初期設定を行う。 (カラースキーム一覧は `ls /usr/share/vim/vim74/colors/` )  
システム共通で設定したければ "/etc/vimrc" に、ユーザ個別に設定したければ root から抜けて "~/.vimrc" に設定する。

File: `/etc/vimrc`

{% highlight bash linenos %}
colorscheme elflord
{% endhighlight %}

---

以上。

