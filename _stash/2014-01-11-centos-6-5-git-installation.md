---
layout   : single
title    : "CentOS 6.5 - Git サーバ構築！"
published: true
date     : 2014-01-11 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Git
---

前回は CentOS 6.5 サーバを同期元として rsync でファイル・ディレクトリの同期を行いました。  
今回は Git サーバの構築を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- クライント側から要求があった場合のみ Git サーバを起動するようにするために xinetd を使用する。
- サーバホスト名は “vbox.mk-mode.com”
- サーバマシンに OpenSSH サーバ構築済みで、鍵ペアによる SSH 接続が可能。
- サーバマシンに xinetd 導入済み。
- 一般ユーザは "wheel" に属する "hoge" を想定。

### 1. Git サーバ構築

#### 1-1. インストール

git, git-daemon, git-all を yum でインストールする。

``` text
# yum -y install git git-daemon git-all
# git --version
git version 1.7.1
```

#### 1-2. xinetd 設定ファイル編集

File: `/etc/xinetd.d/git`

{% highlight bash linenos %}
# default: off
# description: The git dæmon allows git repositories to be exported using \
#       the git:// protocol.

service git
{
        disable         = no      # <= 変更
        socket_type     = stream
        wait            = no
        user            = nobody
        server          = /usr/libexec/git-core/git-daemon
        server_args     = --base-path=/var/lib/git --export-all --user-path=public_git --syslog --inetd --verbose
        log_on_failure  += USERID
}
{% endhighlight %}

#### 1-3. Xinetd 再起動

設定を有効化するために xinetd を再起動する。

``` text
# /etc/rc.d/init.d/xinetd restart
xinetd を停止中:                                           [  OK  ]
xinetd を起動中:                                           [  OK  ]
```

#### 1-4. リポジトリ作成

作成先は /etc/xinetd.d/git の --base-path に指定されている /var/lib/git/ とした。

``` text
# cd /var/lib/git/
# mkdir public_git
# mkdir public_git/test.git
# cd public_git/test.git
# git --bare init --shared
Initialized empty shared Git repository in /var/lib/git/public_git/test.git/
```

`--bare` は `git` に対するオプションで、管理ファイル等を作成する。
`--shared` は `init` に対するオプションで、グループ書きこみ権限を追加する。

#### 1-5. git 用グループ作成

Git 用グループを作成し、作成したディレクトリ内の権限を設定する。

``` text
# groupadd git
# usermod -G wheel,git hoge
# chown -R root:git .
```

`usermod -G wheel,git hoge` としているのは、hoge ユーザが既に属している wheel グループから外れてしまわないようにするため。  
Git 専用のユーザを作成したのなら `usermod -G git hoge` とすればよい。

#### 1-6. ディレクトリ確認

この時点で該当ディレクトリは以下のようになっているはず。

``` text
# ls -l
合計 32
-rw-rw-r-- 1 root git   23 12月 25 00:58 2012 HEAD
drwxrwsr-x 2 root git 4096 12月 25 00:58 2012 branches
-rw-rw-r-- 1 root git  126 12月 25 00:58 2012 config
-rw-rw-r-- 1 root git   73 12月 25 00:58 2012 description
drwxrwsr-x 2 root git 4096 12月 25 00:58 2012 hooks
drwxrwsr-x 2 root git 4096 12月 25 00:58 2012 info
drwxrwsr-x 4 root git 4096 12月 25 00:58 2012 objects
drwxrwsr-x 4 root git 4096 12月 25 00:58 2012 refs
```

### 2. クライアントからテスト

#### 2-1. テスト用ファイル作成

ディレクトリを作成し、テスト用ファイルを配置する。  
今回はユーザホーム配下に作成した "src" ディレクトリ配下に "test" ディレクトリを作成し、"test.txt" というテキストファイルを配置した。

``` text
$ cd ~/src
$ mkdir test
$ cd test
$ echo "Git Test." > test.txt
```

#### 2-2. ローカルリポジトリの作成

ディレクトリ内にローカルリポジトリを作成する。

``` text
$ git init
Initialized empty Git repository in /home/masaru/src/test/.git/
```

#### 2-3. ローカルリポジトリでコミット

ファイルをローカルリポジトリに追加、コミットする。

``` text
$ git add test.txt
$ git commit -m "First Commit"
```

#### 2-4. リモートリポジトリの登録

今後登録名で作業できるようにするために、接続先 URL を登録する。

``` text
$ git remote add origin ssh://masaru@vbox.mk-mode.com/var/lib/git/public_git/test.git
```

ちなみに、登録名を省略すると origin になる。

#### 2-5. リモートリポジトリへ Push

リモートリポジトリに push する。

``` text
$ git push origin master
Counting objects: 3, done.
Writing objects: 100% (3/3), 229 bytes, done.
Total 3 (delta 0), reused 0 (delta 0)
To ssh://masaru@vbox.mk-mode.com/var/lib/git/public_git/test.git
 * [new branch]      master -> master
```

ssh 用の鍵ペアを登録していない場合、パスワードの入力が求められはず。 鍵ペアを登録するとパスワードの入力は不要になる。 また、２回目からは git push のみでよい。

#### 2-6. リモートリポジトリから Pull

リモートリポジトリからローカルへ pull してみる。

``` text
$ git pull origin master
From ssh://vbox.mk-mode.com/var/lib/git/public_git/test.git
 * branch            master     -> FETCH_HEAD
Already up-to-date.
```

#### 2-7. リモートリポジトリを Clone

普段は個人で使用するので、clone することは滅多に無いが、一応テストしてみる。  
ローカルにあるリポジトリを一旦削除(削除が心配ならリネーム)し、その後、リモートリポジトリを clone する。

``` text
$ cd ..
$ rm -rf test
$ git clone ssh://masaru@vbox.mk-mode.com/var/lib/git/public_git/test.git
Cloning into 'test'...
remote: Counting objects: 3, done.
Receiving objects: 100% (3/3), 228 bytes, done.
remote: Total 3 (delta 0), reused 0 (delta 0)
$ ls -la test
合計 16
drwxr-xr-x  3 masaru masaru 4096 12月 25 01:05 .
drwxr-xr-x 13 masaru masaru 4096 12月 25 01:05 ..
drwxr-xr-x  8 masaru masaru 4096 12月 25 01:05 .git
-rw-r--r--  1 masaru masaru   10 12月 25 01:05 test.txt
```

元通りに復活できたので clone テストは成功している。

#### 2-8. Clone したリポジトリに Pull

clone したリポジトリをリモートリポジトリに pull するには、最初から以下のようするだけでよい。

``` text
$ git pull
Already up-to-date.
```

#### 2-9. その他

ちなみに、リモート側に gitweb というのをインストールすると、ブラウザでリモートリポジトリを操作できるようになるようだ。

``` text
# yum -y install gitweb
```

でインストールして、ブラウザで `http://＜リモート側のホスト名＞/git/` にアクセスする。 当方は、今のところ使用するつもりはないで未確認。

---

次回は、ログ解析ツール LogWatch の導入について紹介する予定です。

以上。

