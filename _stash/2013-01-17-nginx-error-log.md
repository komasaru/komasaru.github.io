---
layout   : single
title    : "Nginx - エラーログについて！"
published: true
date     : 2013-01-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- LinuxMint
- Nginx
---

軽量 Web サーバ  Nginx の設定の中のエラーログについてです。  
（Debian, Ubuntu 等 GNU 系ディストリビューションは同様だと思う）

<!--more-->

### 0. 前提条件

- Linux Mint 13 Maya (64bit) での作業を想定。
- Nginx 1.2.6 がソースビルドによりインストール済み。
- パッケージを利用してインストールした Nginx とはディレクトリ構成等が若干異なるが、エラーログについては同じ。

### 1. エラーログの設定

エラーログの設定は、設定ファイルに以下のように記述する。  
（デフォルトのエラーログやソースビルド時にオプション指定したエラーログとは別に設定する場合）

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
error_log file | stderr [ debug | info | notice | warn | error | crit | alert | emerg ];
{% endhighlight %}

第１パラメータは出力ファイル名を指定するか、標準エラー出力を指定する。  
第２パラメータでエラーの種類を指定する。指定しなかった場合は `error` を指定したものとされる。エラーの種類については事項参照。

### 2. エラーの種類

エラーの種類は以下の通り。順にエラー度が高くなる。

<table class="common">
  <tr>
    <th class="center">エラー値</th>
    <th class="center">説明</th>
  </tr>
  <tr>
    <td>debug</td><td>デバッグ情報</td>
  </tr>
  <tr>
    <td>info</td><td>情報</td>
  </tr>
  <tr>
    <td>notice</td><td>通知</td>
  </tr>
  <tr>
    <td>warn</td><td>警告</td>
  </tr>
  <tr>
    <td>error</td><td>一般的なエラー</td>
  </tr>
  <tr>
    <td>crit</td><td>致命的なエラー</td>
  </tr>
  <tr>
    <td>alert</td><td>緊急に対処すべきエラー</td>
  </tr>
  <tr>
    <td>emerg</td><td>サーバが落ちるようなエラー</td>
  </tr>
</table>

### 3. デバッグについて

設定ファイルで `error_log` の第２パラメータに `debug` を指定してデバッグ情報を出力するには、`configure` 時のオプションに `--with-debug` を指定する必要がある。  
但し、その必要があるのはソースをビルドしてインストールする場合のみであり、パッケージでインストールする場合はデフォルトでデバッグ情報も出力できるようになっているので、設定ファイルで `error_log` の第２パラメータに `debug` を指定するだけで大丈夫である。

### 4. 参考サイト

- [Core functionality - nginx](http://nginx.org/en/docs/ngx_core_module.html#error_log "Core functionality - nginx")

---

実運用時、デバッグ時と使い分けるとよいでしょう。

以上。

