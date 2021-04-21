---
layout   : single
title    : "Debian 8 (Jessie) - Git インストール（ソースビルド）！"
published: true
date     : 2015-06-28 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Git
---

Debian GNU/Linux 8 (Jessie) に Git サーバをソースをビルドしてインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* apt パッケージでインストールしていた git はアンインストール済みであることを想定。
* Git 2.4.0 （当記事執筆時点で最新）をインストールすることを想定。
* アーカイブ保存先は "/usr/local/src" を想定。
* クライアントからアクセスがあった時だけサーバを起動するために xinetd を使用する。

### 1. 依存パッケージのインストール

``` text
# apt-get -y install libcurl4-gnutls-dev libexpat1-dev \
gettext libz-dev libssl-dev
```

### 2. アーカイブファイルの取得

``` text
# cd /usr/local/src
# wget https://www.kernel.org/pub/software/scm/git/git-2.4.0.tar.gz
# tar zxvf git-2.4.0.tar.gz
```

### 3. ビルド＆インストール

``` text
# cd git-2.4.0
# make prefix=/usr/local all
# make prefix=/usr/local install
```

### 4. インストールの確認

``` text
# git --version
git version 2.4.0
```

### 5. xinetd 設定ファイルの作成

最近はデフォルトでは存在しないので作成する。

File: `/etc/xinetd.d/git`

{% highlight bash linenos %}
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

### 6. Xinetd の再起動

``` text
# systemctl restart xinetd
```

### 7. リポジトリの作成

作成先は /etc/xinetd.d/git の —base-path に指定されている /var/lib/git/ とした。（以下は "test.git" という Git リポジトリを作成する例）

``` text
# cd /var/lib/
# mkdir git
# mkdir git/public_git
# mkdir git/public_git/test.git
# cd git/public_git/test.git
# git --bare init --shared
Initialized empty shared Git repository in /var/lib/git/public_git/test.git/
```

### 8. Git 用グループの作成

git グループを作成し、クライアント側のユーザを git グループに追加する。  
（グループにユーザを追加する場合は、元々属しているグループも必ず明示すること。そうしないと、元々属していたグループから外れてしまう）

``` text
# groupadd git
# usermod -G adm,git hoge
```

### 9. 権限の変更

リポジトリの所有者・所有グループを変更する。

``` text
# chown -R root:git .
```

### 10. リポジトリのディレクトリを確認

現状のリポジトリ内を確認してみる。

``` text
otal 32
drwxrwsr-x 2 root git 4096 May  7 10:51 branches
-rw-rw-r-- 1 root git  126 May  7 10:51 config
-rw-rw-r-- 1 root git   73 May  7 10:51 description
-rw-rw-r-- 1 root git   23 May  7 10:51 HEAD
drwxrwsr-x 2 root git 4096 May  7 10:51 hooks
drwxrwsr-x 2 root git 4096 May  7 10:51 info
drwxrwsr-x 4 root git 4096 May  7 10:51 objects
drwxrwsr-x 4 root git 4096 May  7 10:51 refst
```

### 11. 動作確認

ここではクライアント側からの操作について説明はしないが、各種作業を行い問題がないことを確認しておく。  
(`git status`, `git add`, `git clone`, `git push`, `git pull` etc.)

### 12. 参考サイト

* [Git - Downloads](http://git-scm.com/downloads "Git - Downloads")
* [Git - Git のインストール](http://git-scm.com/book/ja/v1/%E4%BD%BF%E3%81%84%E5%A7%8B%E3%82%81%E3%82%8B-Git%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB "Git - Git のインストール")

---

以上。

