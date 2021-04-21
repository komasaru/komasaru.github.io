---
layout   : single
title    : "CentOS 6.5 - SSHサーバ（OpenSSH）構築！"
published: true
date     : 2013-12-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- SSH
---

前回は CentOS 6.5 サーバインストール後の初期設定を行いました。  
今回は SSH サーバである OpenSSH のインストール・設定を行います。

デフォルトでインストールされている OpenSSH サーバには chroot 機能がないため、OpenSSH 6.4-p1 アーカイブを取得して RPM インストールします。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
  （Telnet サーバ未インストール。SSH サーバ既インストール）
- サーバマシン搭載メモリは 1GB を想定。
- クライントマシンは Linux Mint 14(64bit) を想定。
- OpenSSH 6.4-p1 を RPM でインストールし直す。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. Telnet サーバのインストール

サーバ側で直接作業するのなら不要であるが、クライアント側から端末コンソールからリモートで作業したいので、Telnet サーバをインストールし、マシン起動時に自動起動するように設定する。  
そして、Telnet サーバを起動する。

``` text
# yum -y install telnet-server
# chkconfig telnet on
# /etc/rc.d/init.d/xinetd start
Starging xinetd:                                           [  OK  ]
```

以降、クライアント側から `ssh ＜サーバマシンの IP アドレス＞` で Telnet 接続して作業する。

### 2. SSH サーバー停止＆アンインストール

OpenSSH を新規にインストールするので、既インストールで起動中の SSH サーバーを停止し、アンインストールする。

``` text
# /etc/rc.d/init.d/sshd stop
Stopping sshd:                                              [  OK  ]

# yum -y remove openssh
```

### 3. 必要パッケージのインストール

openssh の RPM 作成に必要なパッケージをインストールしておく。

``` text
# yum -y install pam-devel openssl-devel krb5-devel tcp_wrappers-devel
```

### 4. アーカイブダウンロード＆展開

アーカイブファイルをダウンロードし、展開する。

``` text
# wget wget http://ftp.jaist.ac.jp/pub/OpenBSD/OpenSSH/portable/openssh-6.4p1.tar.gz

# tar zxvf openssh-6.4p1.tar.gz
```

### 5. spec ファイル編集

spec ファイルを以下のように編集する。

File: `openssh-6.4p1/contrib/redhat/openssh.spec`

{% highlight bash linenos %}
# Do we want to disable building of x11-askpass? (1=yes 0=no)
#%define no_x11_askpass 0
%define no_x11_askpass 1    # <= 変更（x11_askpass の無効化）

# Do we want to disable building of gnome-askpass? (1=yes 0=no)
#%define no_gnome_askpass 0
%define no_gnome_askpass 1  # <= 変更（gnome_askpass の無効化）

%configure \
        configure --without-zlib-version-check \  # <= 追加（zlib のバージョンチェック無効化）
        --sysconfdir=%{_sysconfdir}/ssh \
{% endhighlight %}

### 6. 不要ディレクトリの削除

不要なディレクトリ（"redhat" 以外）を削除する。

``` text
# rm -rf openssh-6.4p1/contrib/aix/
# rm -rf openssh-6.4p1/contrib/hpux/
# rm -rf openssh-6.4p1/contrib/caldera/
# rm -rf openssh-6.4p1/contrib/suse/
# rm -rf openssh-6.4p1/contrib/cygwin/
# rm -rf openssh-6.4p1/contrib/solaris/
```

### 7. ディレクトリ再圧縮

展開していたディレクトリを再び圧縮する。  
そして、元の展開していたディレクトリは不要なので削除する。

``` text
# tar czvf openssh-6.4p1.tar.gz openssh-6.4p1/

# rm -rf openssh-6.4p1
```

### 8. RPM パッケージ作成

アーカイブファイルから RPM パッケージを作成する。

``` text
# rpmbuild -tb --clean openssh-6.4p1.tar.gz
```

### 9. RPM パッケージインストール

作成した RPM パッケージを使って OpenSSH をインストールする。

``` text
# rpm -Uvh rpmbuild/RPMS/x86_64/openssh-6.4p1-1.x86_64.rpm
# rpm -Uvh rpmbuild/RPMS/x86_64/openssh-server-6.4p1-1.x86_64.rpm
# rpm -Uvh rpmbuild/RPMS/x86_64/openssh-clients-6.4p1-1.x86_64.rpm
```

### 10. 後始末

インストールに成功後は RPM パッケージやアーカイブファイルは不要なので削除しておく。

``` text
# rm -f rpmbuild/RPMS/x86_64/openssh-*
# rm -f openssh-6.4p1.tar.gz
```

### 11. SSH サーバ起動スクリプト編集

SSH サーバの起動スクリプトを以下のように編集する。  
（以前のバージョンの場合のみ。新しいバージョンではデフォルトでこうなっている）

File: `/etc/rc.d/init.d/sshd`

{% highlight bash linenos %}
start()
{
        # Create keys if necessary
        do_rsa1_keygen
        do_rsa_keygen
        do_dsa_keygen

        echo -n $"Starting $prog:"
        #initlog -c "$SSHD $OPTIONS" && success || failure  # <= コメントアウト
        $SSHD $OPTIONS && success || failure                # <= 追加
        RETVAL=$?
        [ "$RETVAL" = 0 ] && touch /var/lock/subsys/sshd
        echo
}
{% endhighlight %}

### 12. SSH サーバ起動

SSH サーバを起動する。  
そして、マシン起動時に自動で起動するようにも設定する。

``` text
# /etc/rc.d/init.d/sshd start
ssh-keygen: generating new host keys: ECDSA
Starting sshd:                                             [  OK  ]

# chkconfig sshd on
# chkconfig --list sshd  # <= 2,3,4,5 が "on" になっていることを確認
sshd            0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 13. SSH 接続

SSH サーバが起動したので、Telnet 接続からログアウト（`exit`）し、クライアントマシン側から SSH で接続し直す。

``` text
$ ssh hoge@＜サーバマシンの IP アドレス or ホスト名＞ -o PreferredAuthentications=password
```

まだ、SSH 鍵認証の設定をしていないので、`-o Preferredauthentications=password` オプションを付加している。

### 14. Telnet サーバのアンインストール

今後は SSH サーバで接続し、Telnet サーバは不要となるので、自動起動を無効化にし、起動中の Telnet サーバを停止しアンインストールする。

``` text
# chkconfig telnet off

# /etc/rc.d/init.d/xinetd restart
xinetd を停止中:                                           [  OK  ]
xinetd を起動中:                                           [  OK  ]

# yum -y remove telnet-server
```

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、SSH サーバに鍵認証接続する方法について紹介する予定です。

以上。

