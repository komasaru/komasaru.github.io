---
layout   : single
title    : "Debian 10 (buster) - セキュリティ・アップデートの自動化！"
published: true
date     : 2019-10-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 10 (buster) のセキュリティ・アップデートを自動化する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) サーバでの作業を想定。
* cron-apt でもパッケージアップデートの自動化は可能であるが、今回はセキュリティ・アップデートのみなので unattended-upgrades を使用する。  
  （ちなみに、インストール済みの各種パッケージを自動アップデートするのは（依存パッケージの整合性等の問題があるため）危険であり、当方はセキュリティ・アップデート以外は自動でアップデートしない方針）
* root ユーザでの作業を想定。

### 1. unattended-upgrades のインストール

unattended-upgrades はデフォルトでインストールされているはずだが、インストールされていなければインストールする。  
また、パッケージ変更履歴ツール apt-listchanges もインストールする。

``` text
# apt -y install unattended-upgrades apt-listchanges
```

### 2. "50unattended-upgrades" の編集

メール送信先を編集（コメント解除＆変更）する。（当然、ユーザ名のみならず外部のメールアドレスも設定可）

File: `/etc/apt/apt.conf.d/50unattended-upgrades`

``` text
Unattended-Upgrade::Mail "root";
```

### 3. "20auto-upgrades" の作成

以下のコマンドを実行して自動アップデートに関する質問に「はい」と回答すると、自動アップグレードのための設定ファイル `20auto-upgrades` が作成される。

``` text
# dpkg-reconfigure -plow unattended-upgrades
```

もしくは、以下のような内容で `20auto-upgrades` 作成してもよい。  
（`/etc/cron.daily/apt` に記述があるとおりデフォルトでは無効になっているので、有効にするための記述）

File: `/etc/apt/apt.conf.d/20auto-upgrades`

``` text
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

### 4. "02periodic" の作成

cron ジョブのための設定ファイルを作成する。  
`/etc/cron.daily/apt` に記述があるとおりデフォルトで設定されている項目もあるが、以下のように「[作成例](https://wiki.debian.org/UnattendedUpgrades "UnattendedUpgrades - Debian Wiki")」をそのまま流用している。  
（各設定項目の説明はコメントに記述されているとおりなので、あらためて説明しない）

File: `/etc/apt/apt.conf.d/02periodic`

``` text
// Control parameters for cron jobs by /etc/cron.daily/apt //

// Enable the update/upgrade script (0=disable)
APT::Periodic::Enable "1";

// Do "apt update" automatically every n-days (0=disable)
APT::Periodic::Update-Package-Lists "1";

// Do "apt upgrade --download-only" every n-days (0=disable)
APT::Periodic::Download-Upgradeable-Packages "1";

// Run the "unattended-upgrade" security upgrade script
// every n-days (0=disabled)
// Requires the package "unattended-upgrades" and will write
// a log in /var/log/unattended-upgrades
APT::Periodic::Unattended-Upgrade "1";

// Do "apt autoclean" every n-days (0=disable)
APT::Periodic::AutocleanInterval "21";

// Send report mail to root
//     0:  no report             (or null string)
//     1:  progress report       (actually any string)
//     2:  + command outputs     (remove -qq, remove 2>/dev/null, add -d)
//     3:  + trace on
APT::Periodic::Verbose "2";
```

### 5. "listchanges.conf" の編集

パッケージ変更履歴ツール apt-listchanges のための設定を行う。

File: `/etc/apt/listchanges.conf`

``` text
[apt]
frontend=pager
which=both          # <= news から変更
email_address=root
email_format=text
confirm=false
headers=false
reverse=false
save_seen=/var/lib/apt/listchanges.db
```

### 6. 動作確認

`/etc/cron.daily/apt-campat` により毎日実行されるので、後日メールやログを確認してみる。  

* メールは設定したユーザ（or メールアドレス）宛に送信される。
* dpkg 関連のログは "/var/log/dpkg.log"
* unattended-upgrades 関連のログは `/var/log/unattended-upgrades/` ディレクトリ配下。

### 7. 参考サイト

* [UnattendedUpgrades - Debian Wiki](https://wiki.debian.org/UnattendedUpgrades "UnattendedUpgrades - Debian Wiki")

---

以上。

