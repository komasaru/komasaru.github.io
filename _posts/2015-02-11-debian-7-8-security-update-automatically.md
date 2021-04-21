---
layout   : single
title    : "Debian 7 Wheezy - セキュリティ・アップデートの自動化！"
published: true
date     : 2015-02-11 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

cron-apt でもパッケージアップデートの自動化は可能であるが、今回は unattended-upgrades でセキュリティ・アップデートの自動化を行う。

ちなみに、インストール済みの各種パッケージを自動アップデートするのは（依存パッケージの整合性等の問題があるため）危険であり、当方はセキュリティ・アップデート以外は自動でアップデートしない（ダウンロードまでの）方針にしています。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux Wheezy 7.8.0 サーバでの作業を想定。
* root での作業を想定。

### 1. unattended-upgrades のインストール

unattended-upgrades はデフォルトでインストールされているはずだが、インストールされていなければインストールする。  
また、パッケージ変更履歴ツール apt-listchanges もインストールする。

``` text
# apt-get install unattended-upgrades apt-listchanges
```

### 2. "50unattended-upgrades" の編集

メール送信先を編集（コメント解除）する。（当然、ユーザ名のみならず外部のメールアドレスも設定可）

File: `/etc/apt/apt.conf.d/50unattended-upgrades`

{% highlight bash linenos %}
Unattended-Upgrade::Mail "root";
{% endhighlight %}

### 3. "20auto-upgrades" の作成

自動アップグレードのための設定ファイルを、以下のような内容で作成する。
"/etc/cron.daily/apt" に記述があるとおりデフォルトでは無効になっているので、有効にするための記述。

File: `/etc/apt/apt.conf.d/20auto-upgrades`

{% highlight bash linenos %}
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
{% endhighlight %}

もしくは、以下のコマンドを実行して自動アップデートに関する質問に「はい」と回答すると "20auto-upgrades" が作成される。（rc スクリプトの記述の仕方によっては警告が出るかも知れないが問題ないはず）

``` text
# dpkg-reconfigure -plow unattended-upgrades
```

### 4. "02periodic" の作成

cron ジョブのための設定ファイルを作成する。  
"/etc/cron.daily/apt" に記述があるとおりデフォルトで設定されている項目もあるが、以下のように「[作成例](https://wiki.debian.org/UnattendedUpgrades "UnattendedUpgrades - Debian Wiki")」をそのまま流用している。  
（各設定項目の説明はコメントに記述されているとおりなので、あらためて説明しない）

File: `/etc/apt/apt.conf.d/02periodic`

{% highlight bash linenos %}
// Control parameters for cron jobs by /etc/cron.daily/apt //

// Enable the update/upgrade script (0=disable)
APT::Periodic::Enable "1";

// Do "apt-get update" automatically every n-days (0=disable)
APT::Periodic::Update-Package-Lists "1";

// Do "apt-get upgrade --download-only" every n-days (0=disable)
APT::Periodic::Download-Upgradeable-Packages "1";

// Run the "unattended-upgrade" security upgrade script
// every n-days (0=disabled)
// Requires the package "unattended-upgrades" and will write
// a log in /var/log/unattended-upgrades
APT::Periodic::Unattended-Upgrade "1";

// Do "apt-get autoclean" every n-days (0=disable)
APT::Periodic::AutocleanInterval "21";

// Send report mail to root
//     0:  no report             (or null string)
//     1:  progress report       (actually any string)
//     2:  + command outputs     (remove -qq, remove 2>/dev/null, add -d)
//     3:  + trace on
APT::Periodic::Verbose "2";
{% endhighlight %}

### 5. "listchanges.conf" の編集

パッケージ変更履歴ツール apt-listchanges のための設定を行う。

File: `/etc/apt/listchanges.conf`

{% highlight bash linenos %}
[apt]
frontend=pager
email_address=root
confirm=1            # <= 変更
save_seen=/var/lib/apt/listchanges.db
which=both
{% endhighlight %}

### 6. 動作確認

"/etc/cron.daily/apt" により毎日実行されるので、後日ログを確認してみる。  

* メールは設定したユーザ（or メールアドレス）宛に送信される。
* dpkg 関連のログは "/var/log/dpkg.log"
* unattended-upgrades 関連のログは "/var/log/unattended-upgrades/" ディレクトリ配下。

### 7. 参考サイト

* [UnattendedUpgrades - Debian Wiki](https://wiki.debian.org/UnattendedUpgrades "UnattendedUpgrades - Debian Wiki")

---

セキュリティに関しては自動でアップデートできるようになりました。

当然、その他の各種インストール済みパッケージは、これまでどおり目視で確認しながらアップデートします。

以上。

