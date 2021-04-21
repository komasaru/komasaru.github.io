---
layout   : single
title    : "CentOS 6.5 - 初期設定！"
published: true
date     : 2013-12-13 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

前回 CentOS 6.5 をインストールしたので、今回は各種初期設定を行います。

主に参考にしている[サイト](http://centossrv.com/ "CentOSで自宅サーバー構築")以外にも、自分で必要だと思って追加設定していることも多数記録しています。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。\_
- マシン搭載メモリは 1GB を想定。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」も参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. 一般ユーザ作成

インストール直後は一般ユーザが存在しないので、root でログインして一般ユーザを作成する。

``` text
vbox login: root
Password:

[root@vbox ~]# useradd hoge
[root@vbox ~]# passwd hoge
Changing password for user hoge.
New password:
Retype new password:
passwd: all authentication tokens updated successfully.
[root@vbox ~]# 
```

### 2. 再ログイン

一般ユーザを作成したので、今後は最初に一般ユーザでログインし、その後の作業は root になって行うようにする。  
（サーバ専用で使用するマシンを想定しているので。クライント用途なら、普段は一般ユーザで作業を行い、 root 権限が必要な場合のみ root になるか、 sudo コマンドを使用して作業を行う。）

``` text
[root@vbox ~]# exit

vbox login: hoge
Password:

[hoge@vbox ~]$ su -
Password:
[root@vbox ~]# 
```

**※今後、プロンプトは root ユーザは `#` 、一般ユーザは `$` のみで表現する。**  
**※また、ファイル編集時の `vi` コマンド入力も省略する。**

### 3. root になれるユーザの設定

先ほど作成した一般ユーザを管理者グループに所属させ、root になれるユーザを管理者のみに限定するように設定する。

``` text
# usermod -G wheel hoge
```

File: `/etc/pam.d/su`

{% highlight bash linenos %}
auth       required     pam_wheel.so use_uid  # <= コメント解除
{% endhighlight %}

### 4. kdump 無効化

kdump（クラッシュダンプ）は今のところ不要なので自動起動を停止する。

``` text
# chkconfig kdump off
# chkconfig --list kdump  # <= 全て "off" であることを確認
kdump           0:off   1:off   2:off   3:off   4:off   5:off   6:off
```

### 5. IPv6 無効化

IPv6 は今のところ不要なので無効化する。（別の説明をしているサイトもあるが、今は以下のようにすればよい）

"/etc/sysconfig/network-scripts/ifcfg-eth0" に以下の行が無ければ追加する。

File: `/etc/sysconfig/network-scripts/ifcfg-eth0`

{% highlight bash linenos %}
IPV6INIT=no
{% endhighlight %}

"/etc/modprobe.d/disable-ipv6.conf" を新規作成

File: `/etc/modprobe.d/disable-ipv6.conf`

{% highlight bash linenos %}
install ipv6 /bin/true
{% endhighlight %}

そして、以下を実行する。

``` text
# chkconfig ip6tables off     # <= 自動起動無効化
# chkconfig --list ip6tables  # <= 全部 off になっていることを確認
# shutdown -r now             # <= マシン再起動
# ifconfig                    # <= inet6 の行が表示されないことを確認
# lsmod | grep ipv6           # <= ipv6 の行が表示されないことを確認
```

さらに、 `newaliases` コマンド利用時やメール送信時に、デフォルトでインストールされている Postfix の関係で以下のような警告が出力される場合がある。

``` text
# newaliases
newaliases: warning: inet_protocols: IPv6 support is disabled: Address family not supported by protocol
newaliases: warning: inet_protocols: configuring for IPv4 support only
postalias: warning: inet_protocols: IPv6 support is disabled: Address family not supported by protocol
postalias: warning: inet_protocols: configuring for IPv4 support only
```

Postfix がデフォルトで IPv4, IPv6 両方使う設定になっているためで、IPv6 を使用しない設定にした場合に警告が出る。
以下のように IPv4 のみ使用する設定に変更する。

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
#inet_protocols = all  # <= コメント化、もしくは削除
inet_protocols = ipv4  # <= 追加
{% endhighlight %}

### 6. リポジトリ設定

デフォルトでは海外のサイトに接続される設定となっているので、国内のミラーサイトに接続するよう設定を変更する。  
（当方は「理研」にした。JAIST や NAIST や KDDI や IIJ 等でもよい。「[ミラーサイト一覧](http://www.centos.org/modules/tinycontent/index.php?id=32 "ミラーサイト一覧")」）

"/etc/yum.repos.d/CentOS-Base.repo" を以下のように編集する。

File: `/etc/yum.repos.d/CentOS-Base.repo`

{% highlight bash linenos %}
[base]
#baseurl=http://mirror.centos.org/centos/$releasever/os/$basearch/          # <= コメント化
baseurl=http://ftp.riken.jp/Linux/centos/$releasever/os/$basearch/          # <= 追加

[updates]
#baseurl=http://mirror.centos.org/centos/$releasever/updates/$basearch/
baseurl=http://ftp.riken.jp/Linux/centos/$releasever/updates/$basearch/     # <= 追加

[extras]
#baseurl=http://mirror.centos.org/centos/$releasever/extras/$basearch/
baseurl=http://ftp.riken.jp/Linux/centos/$releasever/extras/$basearch/      # <= 追加

[centosplus]
#baseurl=http://mirror.centos.org/centos/$releasever/centosplus/$basearch/
baseurl=http://ftp.riken.jp/Linux/centos/$releasever/centosplus/$basearch/  # <= 追加

[contrib]
#baseurl=http://mirror.centos.org/centos/$releasever/contrib/$basearch/
baseurl=http://ftp.riken.jp/Linux/centos/$releasever/contrib/$basearch/     # <= 追加
{% endhighlight %}

### 7. RPMforge リポジトリ追加

今後使用することがあるであろう RPMforge リポジトリを導入する。

``` text
# rpm -Uvh http://pkgs.repoforge.org/rpmforge-release/rpmforge-release-0.5.3-1.el6.rf.x86_64.rpm
```

リポジトリの競合を防ぐため、下記のように普段は無効化しておく。

File: `/etc/yum.repos.d/rpmforge.repo`

{% highlight bash linenos %}
enabled=0
{% endhighlight %}

RPMforge リポジトリ使用時は、以下のようにする。

``` text
# yum --enablerepo=rpmforge install xxxx
```

### 8. EPEL リポジトリ追加

同様に、今後使用することがあるであろう EPEL リポジトリを導入する。

``` text
# rpm -Uvh http://ftp.riken.jp/Linux/fedora/epel/6/x86_64/epel-release-6-8.noarch.rpm
```

リポジトリの競合を防ぐため、下記のように普段は無効化しておく。

File: `/etc/yum.repos.d/epel.repo`

{% highlight bash linenos %}
enabled=0
{% endhighlight %}

EPEL リポジトリ使用時は、以下のようにする。

``` text
# yum --enablerepo=epel install xxxx
```

### 9. インストール済みパッケージのアップデート

初期インストール済みのパッケージを一括でアップデートする。

``` text
# yum -y update
```

### 10. 必要パッケージのインストール

最低限必要なパッケージをインストールしておく。（ベースパッケージ群、開発ツールパッケージ群）

``` text
# yum -y groupinstall "Base" "Development tools"
```

### 11. パッケージ自動アップデート設定

インストール済みパッケージを自動でアップデートするために `yum-cron` をインストール・起動する。

``` text
# yum -y install yum-cron

# /etc/rc.d/init.d/yum-cron start
Enabling nightly yum update:                                   [  OK  ]
```

### 12. root 宛メール転送設定

root 宛のメールを普段使用するメールアドレス（もしくは、一般ユーザ名）に転送するように設定する。

File: `/etc/aliases`

{% highlight bash linenos %}
#root:              marc
root:               foo@xxxxx.com  # 追加
{% endhighlight %}

設定変更を反映させる。

``` text
# newaliases
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

SELinux 同様、今後各種サーバをインストールする際にファイアウォール設定がネックになってハマることもあるので、現時点では無効にしておくのが無難。

``` text
# /etc/rc.d/init.d/iptables stop  # <= サービス停止

# chkconfig iptables off     # <= 自動起動停止
# chkconfig --list iptables  # <= 2,3,4,5 が "on" であることを確認
iptables        0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 15. nkf コマンドのインストール

日本語処理に必要な `nkf` コマンドをインストールしておく。（随所で日本語を使用しないのであれば不要）

``` text
# yum -y install nkf
```

### 16. Vim エディタインストール

Vi エディタ派生の上位互換エディタ Vim をインストールする。（最近は、デフォルトでインストールされている）

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
        /usr/bin/vim
```

このままではログオフした後、再ログインすると設定が消えてしまうので、以下のように "/etc/bashrc" へ登録する。

File: `/etc/bashrc`

{% highlight bash linenos %}
alias vi='vim'  # <= 最終行へ追加
{% endhighlight %}

好みにより（または、文字を見やすくするため）、カラースキームの初期設定を行う。 (カラースキーム一覧は `ls /usr/share/vim/vim72/colors/` )

File: `~/.vimrc`

{% highlight bash linenos %}
colorscheme elflord
{% endhighlight %}

### 17. プログレスバー非表示設定

OS 起動時に画面下部に表示されるプログレスバーを表示にし、起動プロセスを表示するようにする。  
実際には "/boot/grub/grub.conf" 内の該当バージョンの kernel（大抵は一番上にあるカーネル）行の rhgb、quiet を削除する。

File: `/boot/grub/grub.conf`

{% highlight bash linenos %}
default=0
timeout=5
splashimage=(hd0,0)/grub/splash.xpm.gz
hiddenmenu
title CentOS (2.6.32-431.el6.x86_64)
        root (hd0,0)
        #kernel /vmlinuz-2.6.32-431.el6.x86_64 ro root=/dev/mapper/vg_vbox-lv_root rd_NO_LUKS  KEYBOARDTYPE=pc KEYTABLE=jp106 rd_NO_MD crashkernel=auto rd_LVM_LV=vg_vbox/lv_swap rd_LVM_LV=vg_vbox/lv_root LANG=ja_JP.UTF-8 rd_NO_DM rhgb quiet
        kernel /vmlinuz-2.6.32-431.el6.x86_64 ro root=/dev/mapper/vg_vbox-lv_root rd_NO_LUKS  KEYBOARDTYPE=pc KEYTABLE=jp106 rd_NO_MD crashkernel=auto rd_LVM_LV=vg_vbox/lv_swap rd_LVM_LV=vg_vbox/lv_root LANG=ja_JP.UTF-8 rd_NO_DM  # <= 変更
        initrd /initramfs-2.6.32-431.el6.x86_64.img
{% endhighlight %}

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、OpenSSH による SSH サーバ構築について紹介する予定です。

以上。

