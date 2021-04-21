---
layout   : single
title    : "CentOS - Tripwire での警告メッセージ！"
published: true
date     : 2013-09-30 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

CentOS (RedHat 系 Linux) サーバで、ファイル改ざん検知システム Tripwire を運用していると、ある警告が出ることがあります。（未確認ですが、他の Linux 系ディストリビューションや BSD 系 Unix 等も同様かも知れません）

その警告とは、サイズが 2GB を超えるファイルが存在する場合に出るようです。

以下、現象と対策についての記録です。

<!--more-->

### 0. 前提条件

- CentOS 6.4 (32bit) での作業・動作確認を想定。
- 当然、ファイル改ざん検知システム Tripwire がインストール済みである。
- 動作確認した Tripwire のバージョンは 2.4.2.2.2
- 「[ファイル改竄検知システム導入(Tripwire) - CentOSで自宅サーバー構築](http://centossrv.com/tripwire.shtml "ファイル改竄検知システム導入(Tripwire) - CentOSで自宅サーバー構築")」を参考に Tripwire を構築している。

### 1. 現象

Tripwire チェック時、チェックするディレクトリ内に 2GB を超えるサイズのファイルが存在する場合に、以下のような警告が出る。（実際には、root 宛にメールが届くようにしている）  
以下の例では、対象ファイルのサイズは約 2.2GB である。

``` text 

### Warning: File system error.

### Filename: /home/backup/20130907backup.tar.bz2

### Value too large for defined data type

### Continuing...

```

### 2. 対策

ファイル改ざんされる心配の無さそうなディレクトリであれば、Tripwire のチェック対象から外せばよい。  
実際、以下のようにする。

#### 2-1. ポリシーファイル（テキスト）復元

``` bash 
# twadmin -m p -c /etc/tripwire/tw.cfg -p /etc/tripwire/tw.pol -S /etc/tripwire/site.key > /etc/tripwire/twpol.txt
```

#### 2-2. ポリシーファイル(テキスト版)編集

``` bash 
# vi /etc/tripwire/twpol.txt
  ################################################
 #                                              ##
################################################ #
#                                              # #
#  Monitor Filesystems                         # #
#                                              ##
################################################
(
  rulename = "Monitor Filesystems",
)
{
  /                             -> $(ReadOnly) ;
  /home                         -> $(ReadOnly) ;  # Modify as needed
  /usr                          -> $(ReadOnly) ;
  /var                          -> $(ReadOnly) ;
  !/home/backup;  # <= 追加（/home/backup ディレクトリをチェック対象外にする）
}
```

#### 2-3. ポリシーファイル(暗号署名版)作成

``` bash 
# twadmin -m P -c /etc/tripwire/tw.cfg -p /etc/tripwire/tw.pol -S /etc/tripwire/site.key /etc/tripwire/twpol.txt
Please enter your site passphrase:  # <= サイトのパスフワードで応答
Wrote policy file: /etc/tripwire/tw.pol
```

#### 2-4. ポリシーファイル(テキスト版)削除

``` bash 
# rm -f /etc/tripwire/twpol.txt
```

#### 2-5. データベース初期化

``` bash 
# tripwire -m i -s -c /etc/tripwire/tw.cfg
Please enter your local passphrase:  # <= ローカルのパスワードで応答
```

作業自体はこれで終わりです。  
後は、定時チェック時にうまく機能するのを確認するだけです。

### 参考サイト

- [TV録画予約システム構築(vrs) - Fedoraで自宅サーバー構築](http://fedorasrv.com/vrs.shtml "TV録画予約システム構築(vrs) - Fedoraで自宅サーバー構築")

---

どうしても Tripwire でチェックしたいけどファイルサイズが 2GB を超える場合に、どのように対策したらよいのかは未確認です。ですが、大抵の場合そのような大きなファイルはアーカイブファイルや動画ファイル等であるでしょうから、今回のような対策でも充分でしょう。

以上。

