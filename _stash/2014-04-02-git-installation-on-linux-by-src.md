---
layout   : single
title    : "Git - Linux にソースビルドでインストール！"
published: true
date     : 2014-04-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- ScientificLinux
- Git
---

当記事執筆時点、Git は 1.9.1 が最新ですが、Scientific Linux 6.5, CentOS 6.5 の標準リポジトリでは 1.7.1, Linux Mint 13 では 1.7.9.5 と若干古いです。

そこで、ソースを取得後ビルドしてインストールしてみました。

<!--more-->

### 0. 前提条件

- Scientific Linux 6.5 での作業を想定。  
  （CentOS 等の Redhat 系ディストリビューションなら同様）
- Git サーバとして運用することを想定。
- 当記事執筆時点で、ソースは 1.9.0 までしか公開されていないので Git 1.9.0 をインストールすることにする。
- クライント側から要求があった場合のみ Git サーバを起動するようにするために xinetd を使用する。
- xinetd サーバ導入済みであることを想定。
- Git リポジトリユーザディレクトリは "/var/lib/git/public_git" を想定。
- ドキュメントはインストールしない。
- すべて root ユーザで作用することを想定。
- 既に Git がインストール済みなら、アンインストールしておく。（アンインストールしなくても問題はないが）

### 1. 事前準備

ビルドに必要にパッケージが未インストールならインストールしておく。

``` text
# yum -y install curl-devel expat-devel gettext-devel \
openssl-devel zlib-devel
```

### 2. アーカイブ取得

「[Downloads - git-core - Git - the stupid content tracker - Google Project Hosting](http://code.google.com/p/git-core/downloads/list "Downloads - git-core - Git - the stupid content tracker - Google Project Hosting")」から最新バージョンの tar.gz ファイルをダウンロード＆展開する。

``` text
# cd /usr/local/src
# wget http://git-core.googlecode.com/files/git-1.9.0.tar.gz
# tar zxvf git-1.9.0.tar.gz
```

### 3. ビルド

以下のように `./configure`, `make`, `make install` する。

``` text
# cd git-1.9.0
# make configure
# ./configure --prefix=/usr/local
# make all
# make install
```

### 4. インストール確認

バージョン情報を表示させて、インストールされたことを確認する。

``` text
# git --version
git version 1.9.0
```

**Git サーバとして運用しないのなら、以降の作業は不要。**

### 5. xinetd 設定ファイル作成

"libexec" ディレクトリの場所は `configure` 時の `prefix` 値なので注意。

File: `/etc/xinetd.d/git`

{% highlight text linenos %}
service git
{
        disable         = no
        socket_type     = stream
        wait            = no
        user            = nobody
        server          = /usr/local/libexec/git-core/git-daemon
        server_args     = --base-path=/var/lib/git --export-all --user-path=public_git --syslog --inetd --verbose
        log_on_failure  += USERID
}
{% endhighlight %}

### 6. xinetd 再起動

``` text
# /etc/rc.d/init.d/xinetd restart
xinetd を停止中:                                           [  OK  ]
xinetd を起動中:                                           [  OK  ]
```

### 7. Git リポジトリ作成

``` text
# mkdir /var/lib/git
# mkdir /var/lib/git/public_git
# mkdir /var/lib/git/public_git/test.git
# cd /var/lib/git/public_git/test.git
# git --bare init --shared
Initialized empty shared Git repository in /var/lib/git/public_git/test.git/
```

### 8. Git 用グループ作成

``` text
# groupadd git
# usermod -G wheel,git hoge
# chown -R root:git .
```

### 9. Git クライアント設定

前項までで Git サーバにリポジトリが準備できたので、クライアント側から各種 Git 操作が可能となっているはず。  
Git の基本的な使用方法になるので、ここでは説明しない。

### 参考サイト

今回の方法と若干異なるが、以下のサイトも参考になる。

- [Git - Gitのインストール](http://git-scm.com/book/ja/%E4%BD%BF%E3%81%84%E5%A7%8B%E3%82%81%E3%82%8B-Git%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB "Git - Gitのインストール")

---

Git のバージョン違いが原因で影響が出ることはないでしょうが、やはり新しいほうが気分も良いので。。。

以上。

