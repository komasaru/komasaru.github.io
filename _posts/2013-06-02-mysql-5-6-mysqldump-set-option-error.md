---
layout   : single
title    : "MySQL - 5.6 系で mysqldump すると SET OPTION エラー！"
published: true
date     : 2013-06-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
- LinuxMint
---

MySQL 5.6 系サーバに対して `mysqldump` コマンドを使用すると、場合によっては（以下の前提条件の場合）エラーになります。

以下、現象、原因、対策についての記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- MySQL 5.6.11 サーバ・クライアントをソースをビルドしてインストールしている。
- MySQL 5.5.31 クライアントも別途インストールしている。（別のパッケージとの依存性の関係で必要なため）
- ローカルマシンでのテスト用なので、サーバもクライアントも同一マシンにインストールしている。

#### 1. 現象

`mysqldump` コマンドでダンプ出力しようとすると以下のようなエラーとなる。

``` text 
mysqldump: Couldn't execute 'SET OPTION SQL_QUOTE_SHOW_CREATE=1': 
You have an error in your SQL syntax; check the manual that corresponds 
to your MySQL server version for the right syntax to use near 
'OPTION SQL_QUOTE_SHOW_CREATE=1' at line 1 (1064)
```

（改行しているが、実際は１行で出力される）

#### 2. 原因

まず、MySQL 5.5 までの `mysqldump` は、内部的に `SET OPTION SQL_QUOTE_SHOW_CREATE=1` を実行している。  
しかし、MySQL 5.6 では古い `SET OPTION ...` 構文が完全に廃止されている。  
今回実行しようとした `mysqldump` コマンドは 5.5.31 のコマンドであったため、`SET OPTION ...` コマンドの廃止された 5.6.11 サーバに対してはエラーとなっていた。  
ちなみに、5.0 で `SET ...` 構文に置き換える対応がされていたようだが、`mysqldump` だけは 5.5 まで残っていたようだ。

#### 3. 対策

今回の当方の環境の場合、5.5.31 クライアント以外に 5.6.11 クライアントもインストールされていることになるので、5.6.11 クライアントのコマンドをフルパスで指定する。  
単純に `mysqldump` コマンドを打てば、パッケージでインストールしたパスの通っている 5.5.31 のコマンドが実行されるが、それを回避するために 5.6.11 のコマンドをフルパスで指定するということ。

---

通常、サーバとクライアントのバージョンが揃っていないことは多々あると思います。  
また、通常同一マシンにサーバとクライアントをインストールする場合は、バージョンは揃うはずです。  
今回の当方の場合、幸いにも 5.5 系、5.6 系両方クライアントが使える環境でしたので、簡単に対応できた次第です。

以上。

