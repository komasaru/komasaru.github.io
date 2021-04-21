---
layout   : single
title    : "ブログ - 1,000 投稿を記念して集計！"
published: true
date     : 2013-12-08 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- MeCab
---

先日、2009年1月5日に当ブログを開設してから 1,000 ポスト目の記事を公開することができました。（ちなみに、この投稿は 1,024 ポスト目です）

毎月アクセス解析・集計して当ブログ投稿したり、[ホームページ](http://www.mk-mode.com/rails/ "mk-mode- SITE")でリアルタイムに閲覧できるようにしたりしていますが、今回は 1,000 ポストという節目なので少し別の視点で集計してみました。

個人的な記録ですので、興味がなければスルーしてください。

ちなみに、集計は Markdown で記載している全ての記事（テキスト）ファイルを Ruby で読み込んで集計しました。（形態素解析には "MeCab" を使用）

<!--more-->

### 1. カテゴリ別投稿数

当ブログのサイドバーでも確認できるが再掲してみた。（投稿数の降順）  
当ブログがどのような趣向なのかが分かる。  
（当投稿は集計に含んでいなので、サイドバーの「ブログ」カテゴリの件数と１件だけ合わない）

<table class="common">
<tr><th class="center">カテゴリ</th><th class="center">投稿数</th></tr>
<tr><td>サーバ構築</td><td class="right">332</td></tr>
<tr><td>プログラミング</td><td class="right">262</td></tr>
<tr><td>PC_Tips</td><td class="right">194</td></tr>
<tr><td>ブログ</td><td class="right">177</td></tr>
<tr><td>数学</td><td class="right">86</td></tr>
<tr><td>ホームページ</td><td class="right">67</td></tr>
<tr><td>日々の話題</td><td class="right">60</td></tr>
<tr><td>株式</td><td class="right">51</td></tr>
<tr><td>ロト６</td><td class="right">43</td></tr>
<tr><td>自作PC</td><td class="right">35</td></tr>
<tr><td>玄箱</td><td class="right">27</td></tr>
<tr><td>SNS</td><td class="right">18</td></tr>
<tr><td>ルービックキューブ</td><td class="right">5</td></tr>
</table>

### 2. タグ別投稿数

こちらも、当ブログのサイドバーでも確認できるが再掲してみた。（投稿数の降順）  
当ブログがどのような趣向なのかが分かる。  
（当投稿は集計に含んでいなので、サイドバーの "MeCab", "Ruby" タグの件数と１件だけ合わない）

<table class="common">
<tr><th class="center">タグ</th><th class="center">投稿数</th></tr>
<tr><td>Ruby</td><td class="right">265</td></tr>
<tr><td>Linux</td><td class="right">121</td></tr>
<tr><td>WordPress</td><td class="right">102</td></tr>
<tr><td>MySQL</td><td class="right">101</td></tr>
<tr><td>Windows</td><td class="right">97</td></tr>
<tr><td>CentOS</td><td class="right">79</td></tr>
<tr><td>Fedora</td><td class="right">61</td></tr>
<tr><td>Rails</td><td class="right">54</td></tr>
<tr><td>Debian</td><td class="right">43</td></tr>
<tr><td>C言語</td><td class="right">39</td></tr>
<tr><td>Octopress</td><td class="right">39</td></tr>
<tr><td>ScientificLinux</td><td class="right">37</td></tr>
<tr><td>LinuxMint</td><td class="right">34</td></tr>
<tr><td>Cygwin</td><td class="right">31</td></tr>
<tr><td>PHP</td><td class="right">26</td></tr>
<tr><td>Apache</td><td class="right">24</td></tr>
<tr><td>Mail</td><td class="right">23</td></tr>
<tr><td>Twitter</td><td class="right">22</td></tr>
<tr><td>nanoc</td><td class="right">17</td></tr>
<tr><td>Nginx</td><td class="right">17</td></tr>
<tr><td>HTML</td><td class="right">13</td></tr>
<tr><td>JavaScript</td><td class="right">12</td></tr>
<tr><td>W3C</td><td class="right">11</td></tr>
<tr><td>Google</td><td class="right">10</td></tr>
<tr><td>CSS</td><td class="right">9</td></tr>
<tr><td>レジストリ</td><td class="right">9</td></tr>
<tr><td>Webカメラ</td><td class="right">9</td></tr>
<tr><td>シェル</td><td class="right">8</td></tr>
<tr><td>FreeBSD</td><td class="right">7</td></tr>
<tr><td>Vim</td><td class="right">7</td></tr>
<tr><td>VMware</td><td class="right">7</td></tr>
<tr><td>Unix</td><td class="right">7</td></tr>
<tr><td>Facebook</td><td class="right">7</td></tr>
<tr><td>VisualBasic</td><td class="right">7</td></tr>
<tr><td>Java</td><td class="right">6</td></tr>
<tr><td>Markdown</td><td class="right">6</td></tr>
<tr><td>カレンダー</td><td class="right">6</td></tr>
<tr><td>アフィリエイト</td><td class="right">6</td></tr>
<tr><td>Samba</td><td class="right">6</td></tr>
<tr><td>SQLServer</td><td class="right">6</td></tr>
<tr><td>P183</td><td class="right">6</td></tr>
<tr><td>Antec</td><td class="right">6</td></tr>
<tr><td>Git</td><td class="right">6</td></tr>
<tr><td>R</td><td class="right">6</td></tr>
<tr><td>ウィルス対策</td><td class="right">6</td></tr>
<tr><td>画像</td><td class="right">6</td></tr>
<tr><td>FTP</td><td class="right">6</td></tr>
<tr><td>正規表現</td><td class="right">5</td></tr>
<tr><td>Postfix</td><td class="right">5</td></tr>
<tr><td>バッチ</td><td class="right">5</td></tr>
<tr><td>XML</td><td class="right">5</td></tr>
<tr><td>端末</td><td class="right">5</td></tr>
<tr><td>Atom</td><td class="right">5</td></tr>
<tr><td>SSH</td><td class="right">5</td></tr>
<tr><td>VirtualBox</td><td class="right">5</td></tr>
<tr><td>Feed</td><td class="right">5</td></tr>
<tr><td>DNS</td><td class="right">4</td></tr>
<tr><td>MariaDB</td><td class="right">4</td></tr>
<tr><td>VisualC＃</td><td class="right">4</td></tr>
<tr><td>TEX</td><td class="right">4</td></tr>
<tr><td>Unicorn</td><td class="right">4</td></tr>
<tr><td>Intel</td><td class="right">4</td></tr>
<tr><td>スパム対策</td><td class="right">4</td></tr>
<tr><td>jekyll</td><td class="right">3</td></tr>
<tr><td>プラグイン</td><td class="right">3</td></tr>
<tr><td>Excel</td><td class="right">3</td></tr>
<tr><td>munin</td><td class="right">3</td></tr>
<tr><td>D945GCLF</td><td class="right">3</td></tr>
<tr><td>NTP</td><td class="right">3</td></tr>
<tr><td>XHTML</td><td class="right">3</td></tr>
<tr><td>Knoppix</td><td class="right">3</td></tr>
<tr><td>tmux</td><td class="right">3</td></tr>
<tr><td>VisualC++</td><td class="right">3</td></tr>
<tr><td>ASUS</td><td class="right">3</td></tr>
<tr><td>GitHub</td><td class="right">2</td></tr>
<tr><td>タグクラウド</td><td class="right">2</td></tr>
<tr><td>Dovecot</td><td class="right">2</td></tr>
<tr><td>bitly</td><td class="right">2</td></tr>
<tr><td>Lokka</td><td class="right">2</td></tr>
<tr><td>Yahoo</td><td class="right">2</td></tr>
<tr><td>SMTP</td><td class="right">2</td></tr>
<tr><td>OAuth</td><td class="right">2</td></tr>
<tr><td>SEO</td><td class="right">2</td></tr>
<tr><td>NFS</td><td class="right">2</td></tr>
<tr><td>C#</td><td class="right">2</td></tr>
<tr><td>Dirac</td><td class="right">2</td></tr>
<tr><td>Noah</td><td class="right">2</td></tr>
<tr><td>Fortran</td><td class="right">2</td></tr>
<tr><td>Python</td><td class="right">2</td></tr>
<tr><td>PXE</td><td class="right">2</td></tr>
<tr><td>MeCab</td><td class="right">2</td></tr>
<tr><td>Namazu</td><td class="right">1</td></tr>
<tr><td>VBScript</td><td class="right">1</td></tr>
<tr><td>FreeNAS</td><td class="right">1</td></tr>
<tr><td>RedHatEnterpriseLinux</td><td class="right">1</td></tr>
<tr><td>VisualStudio</td><td class="right">1</td></tr>
<tr><td>Scala</td><td class="right">1</td></tr>
<tr><td>SQL</td><td class="right">1</td></tr>
<tr><td>エミュレータ</td><td class="right">1</td></tr>
<tr><td>ENERMAX</td><td class="right">1</td></tr>
<tr><td>atom</td><td class="right">1</td></tr>
<tr><td>Perl</td><td class="right">1</td></tr>
<tr><td>テスト</td><td class="right">1</td></tr>
<tr><td>RSpec</td><td class="right">1</td></tr>
<tr><td>Ubuntu</td><td class="right">1</td></tr>
<tr><td>モバイル</td><td class="right">1</td></tr>
<tr><td>形態素解析</td><td class="right">1</td></tr>
<tr><td>Sinatra</td><td class="right">1</td></tr>
<tr><td>TeX</td><td class="right">1</td></tr>
<tr><td>Proxy</td><td class="right">1</td></tr>
<tr><td>Core2Duo</td><td class="right">1</td></tr>
<tr><td>Office</td><td class="right">1</td></tr>
<tr><td>物理</td><td class="right">1</td></tr>
<tr><td>SCYTHE</td><td class="right">1</td></tr>
<tr><td>サーバ構築</td><td class="right">1</td></tr>
<tr><td>SSL</td><td class="right">1</td></tr>
<tr><td>WebDeveloper</td><td class="right">1</td></tr>
<tr><td>zsh</td><td class="right">1</td></tr>
<tr><td>tDiary</td><td class="right">1</td></tr>
<tr><td>Disqus</td><td class="right">1</td></tr>
<tr><td>OGP</td><td class="right">1</td></tr>
<tr><td>thin</td><td class="right">1</td></tr>
<tr><td>ファイアウォール</td><td class="right">1</td></tr>
</table>

### 3. 本文行数別投稿数（空白行は除く）

１投稿当たりの行数（空白行は除く）別に集計。  
170 行未満の投稿が多いようだ。

<table class="common">
<tr><th class="center">行数</th><th class="center">投稿数</th></tr>
<tr><td class="right">0〜9</td><td class="right">21</td></tr>
<tr><td class="right">10〜19</td><td class="right">123</td></tr>
<tr><td class="right">20〜29</td><td class="right">154</td></tr>
<tr><td class="right">30〜39</td><td class="right">104</td></tr>
<tr><td class="right">40〜49</td><td class="right">77</td></tr>
<tr><td class="right">50〜59</td><td class="right">75</td></tr>
<tr><td class="right">60〜69</td><td class="right">58</td></tr>
<tr><td class="right">70〜79</td><td class="right">44</td></tr>
<tr><td class="right">80〜89</td><td class="right">47</td></tr>
<tr><td class="right">90〜99</td><td class="right">42</td></tr>
<tr><td class="right">100〜109</td><td class="right">26</td></tr>
<tr><td class="right">110〜119</td><td class="right">38</td></tr>
<tr><td class="right">120〜129</td><td class="right">29</td></tr>
<tr><td class="right">130〜139</td><td class="right">16</td></tr>
<tr><td class="right">140〜149</td><td class="right">24</td></tr>
<tr><td class="right">150〜159</td><td class="right">14</td></tr>
<tr><td class="right">160〜169</td><td class="right">20</td></tr>
<tr><td class="right">170〜179</td><td class="right">5</td></tr>
<tr><td class="right">180〜189</td><td class="right">8</td></tr>
<tr><td class="right">190〜199</td><td class="right">7</td></tr>
<tr><td class="right">200〜209</td><td class="right">6</td></tr>
<tr><td class="right">210〜219</td><td class="right">6</td></tr>
<tr><td class="right">220〜229</td><td class="right">5</td></tr>
<tr><td class="right">230〜239</td><td class="right">5</td></tr>
<tr><td class="right">240〜249</td><td class="right">3</td></tr>
<tr><td class="right">250〜259</td><td class="right">6</td></tr>
<tr><td class="right">260〜269</td><td class="right">3</td></tr>
<tr><td class="right">270〜279</td><td class="right">4</td></tr>
<tr><td class="right">280〜289</td><td class="right">2</td></tr>
<tr><td class="right">290〜299</td><td class="right">2</td></tr>
<tr><td class="right">300〜309</td><td class="right">2</td></tr>
<tr><td class="right">310〜319</td><td class="right">4</td></tr>
<tr><td class="right">330〜339</td><td class="right">1</td></tr>
<tr><td class="right">350〜359</td><td class="right">2</td></tr>
<tr><td class="right">360〜369</td><td class="right">3</td></tr>
<tr><td class="right">370〜379</td><td class="right">1</td></tr>
<tr><td class="right">380〜389</td><td class="right">1</td></tr>
<tr><td class="right">390〜399</td><td class="right">1</td></tr>
<tr><td class="right">410〜419</td><td class="right">3</td></tr>
<tr><td class="right">420〜429</td><td class="right">2</td></tr>
<tr><td class="right">440〜449</td><td class="right">2</td></tr>
<tr><td class="right">460〜469</td><td class="right">1</td></tr>
<tr><td class="right">470〜479</td><td class="right">4</td></tr>
<tr><td class="right">480〜489</td><td class="right">1</td></tr>
<tr><td class="right">490〜499</td><td class="right">3</td></tr>
<tr><td class="right">500〜509</td><td class="right">2</td></tr>
<tr><td class="right">520〜529</td><td class="right">3</td></tr>
<tr><td class="right">530〜539</td><td class="right">3</td></tr>
<tr><td class="right">540〜549</td><td class="right">2</td></tr>
<tr><td class="right">550〜559</td><td class="right">2</td></tr>
<tr><td class="right">560〜569</td><td class="right">5</td></tr>
<tr><td class="right">570〜579</td><td class="right">1</td></tr>
<tr><td class="right">600〜609</td><td class="right">1</td></tr>
<tr><td class="right">1430〜1439</td><td class="right">1</td></tr>
</table>

### 4. 本文文字数別投稿数

１投稿当たりの文字数（改行は除く）別に集計。  
300 〜 400 文字以上 3,000 〜 3,100 文字以内が多いようだ。

<table class="common">
<tr><th class="center">文字数</th><th class="center">投稿数</th></tr>
<tr><td class="right">100〜199</td><td class="right">2</td></tr>
<tr><td class="right">200〜299</td><td class="right">4</td></tr>
<tr><td class="right">300〜399</td><td class="right">16</td></tr>
<tr><td class="right">400〜499</td><td class="right">36</td></tr>
<tr><td class="right">500〜599</td><td class="right">52</td></tr>
<tr><td class="right">600〜699</td><td class="right">44</td></tr>
<tr><td class="right">700〜799</td><td class="right">26</td></tr>
<tr><td class="right">800〜899</td><td class="right">29</td></tr>
<tr><td class="right">900〜999</td><td class="right">25</td></tr>
<tr><td class="right">1000〜1099</td><td class="right">18</td></tr>
<tr><td class="right">1100〜1199</td><td class="right">28</td></tr>
<tr><td class="right">1200〜1299</td><td class="right">19</td></tr>
<tr><td class="right">1300〜1399</td><td class="right">26</td></tr>
<tr><td class="right">1400〜1499</td><td class="right">26</td></tr>
<tr><td class="right">1500〜1599</td><td class="right">17</td></tr>
<tr><td class="right">1600〜1699</td><td class="right">23</td></tr>
<tr><td class="right">1700〜1799</td><td class="right">22</td></tr>
<tr><td class="right">1800〜1899</td><td class="right">21</td></tr>
<tr><td class="right">1900〜1999</td><td class="right">23</td></tr>
<tr><td class="right">2000〜2099</td><td class="right">21</td></tr>
<tr><td class="right">2100〜2199</td><td class="right">13</td></tr>
<tr><td class="right">2200〜2299</td><td class="right">21</td></tr>
<tr><td class="right">2300〜2399</td><td class="right">22</td></tr>
<tr><td class="right">2400〜2499</td><td class="right">12</td></tr>
<tr><td class="right">2500〜2599</td><td class="right">23</td></tr>
<tr><td class="right">2600〜2699</td><td class="right">18</td></tr>
<tr><td class="right">2700〜2799</td><td class="right">20</td></tr>
<tr><td class="right">2800〜2899</td><td class="right">21</td></tr>
<tr><td class="right">2900〜2999</td><td class="right">13</td></tr>
<tr><td class="right">3000〜3099</td><td class="right">24</td></tr>
<tr><td class="right">3100〜3199</td><td class="right">17</td></tr>
<tr><td class="right">3200〜3299</td><td class="right">12</td></tr>
<tr><td class="right">3300〜3399</td><td class="right">13</td></tr>
<tr><td class="right">3400〜3499</td><td class="right">15</td></tr>
<tr><td class="right">3500〜3599</td><td class="right">9</td></tr>
<tr><td class="right">3600〜3699</td><td class="right">10</td></tr>
<tr><td class="right">3700〜3799</td><td class="right">6</td></tr>
<tr><td class="right">3800〜3899</td><td class="right">15</td></tr>
<tr><td class="right">3900〜3999</td><td class="right">14</td></tr>
<tr><td class="right">4000〜4099</td><td class="right">12</td></tr>
<tr><td class="right">4100〜4199</td><td class="right">13</td></tr>
<tr><td class="right">4200〜4299</td><td class="right">3</td></tr>
<tr><td class="right">4300〜4399</td><td class="right">11</td></tr>
<tr><td class="right">4400〜4499</td><td class="right">4</td></tr>
<tr><td class="right">4500〜4599</td><td class="right">7</td></tr>
<tr><td class="right">4600〜4699</td><td class="right">11</td></tr>
<tr><td class="right">4700〜4799</td><td class="right">4</td></tr>
<tr><td class="right">4800〜4899</td><td class="right">10</td></tr>
<tr><td class="right">4900〜4999</td><td class="right">3</td></tr>
<tr><td class="right">5000〜5099</td><td class="right">7</td></tr>
<tr><td class="right">5100〜5199</td><td class="right">7</td></tr>
<tr><td class="right">5200〜5299</td><td class="right">11</td></tr>
<tr><td class="right">5300〜5399</td><td class="right">4</td></tr>
<tr><td class="right">5400〜5499</td><td class="right">4</td></tr>
<tr><td class="right">5500〜5599</td><td class="right">5</td></tr>
<tr><td class="right">5600〜5699</td><td class="right">2</td></tr>
<tr><td class="right">5700〜5799</td><td class="right">7</td></tr>
<tr><td class="right">5800〜5899</td><td class="right">2</td></tr>
<tr><td class="right">5900〜5999</td><td class="right">8</td></tr>
<tr><td class="right">6000〜6099</td><td class="right">1</td></tr>
<tr><td class="right">6100〜6199</td><td class="right">3</td></tr>
<tr><td class="right">6200〜6299</td><td class="right">6</td></tr>
<tr><td class="right">6300〜6399</td><td class="right">3</td></tr>
<tr><td class="right">6400〜6499</td><td class="right">3</td></tr>
<tr><td class="right">6500〜6599</td><td class="right">2</td></tr>
<tr><td class="right">6600〜6699</td><td class="right">4</td></tr>
<tr><td class="right">6900〜6999</td><td class="right">5</td></tr>
<tr><td class="right">7000〜7099</td><td class="right">2</td></tr>
<tr><td class="right">7100〜7199</td><td class="right">1</td></tr>
<tr><td class="right">7200〜7299</td><td class="right">1</td></tr>
<tr><td class="right">7300〜7399</td><td class="right">1</td></tr>
<tr><td class="right">7400〜7499</td><td class="right">1</td></tr>
<tr><td class="right">7500〜7599</td><td class="right">3</td></tr>
<tr><td class="right">7600〜7699</td><td class="right">2</td></tr>
<tr><td class="right">7700〜7799</td><td class="right">1</td></tr>
<tr><td class="right">7800〜7899</td><td class="right">1</td></tr>
<tr><td class="right">7900〜7999</td><td class="right">2</td></tr>
<tr><td class="right">8100〜8199</td><td class="right">3</td></tr>
<tr><td class="right">8200〜8299</td><td class="right">4</td></tr>
<tr><td class="right">8300〜8399</td><td class="right">2</td></tr>
<tr><td class="right">8400〜8499</td><td class="right">1</td></tr>
<tr><td class="right">8500〜8599</td><td class="right">1</td></tr>
<tr><td class="right">8700〜8799</td><td class="right">1</td></tr>
<tr><td class="right">8900〜8999</td><td class="right">1</td></tr>
<tr><td class="right">9000〜9099</td><td class="right">1</td></tr>
<tr><td class="right">9300〜9399</td><td class="right">2</td></tr>
<tr><td class="right">9400〜9499</td><td class="right">2</td></tr>
<tr><td class="right">9600〜9699</td><td class="right">1</td></tr>
<tr><td class="right">9700〜9799</td><td class="right">1</td></tr>
<tr><td class="right">10000〜10099</td><td class="right">3</td></tr>
<tr><td class="right">10100〜10199</td><td class="right">2</td></tr>
<tr><td class="right">10200〜10299</td><td class="right">3</td></tr>
<tr><td class="right">10300〜10399</td><td class="right">3</td></tr>
<tr><td class="right">10400〜10499</td><td class="right">2</td></tr>
<tr><td class="right">10500〜10599</td><td class="right">2</td></tr>
<tr><td class="right">10700〜10799</td><td class="right">4</td></tr>
<tr><td class="right">10800〜10899</td><td class="right">3</td></tr>
<tr><td class="right">10900〜10999</td><td class="right">4</td></tr>
<tr><td class="right">11000〜11099</td><td class="right">4</td></tr>
<tr><td class="right">11200〜11299</td><td class="right">2</td></tr>
<tr><td class="right">11400〜11499</td><td class="right">3</td></tr>
<tr><td class="right">11600〜11699</td><td class="right">1</td></tr>
<tr><td class="right">12000〜12099</td><td class="right">1</td></tr>
<tr><td class="right">12100〜12199</td><td class="right">1</td></tr>
<tr><td class="right">12200〜12299</td><td class="right">2</td></tr>
<tr><td class="right">12400〜12499</td><td class="right">1</td></tr>
<tr><td class="right">13000〜13099</td><td class="right">1</td></tr>
<tr><td class="right">13300〜13399</td><td class="right">1</td></tr>
<tr><td class="right">13400〜13499</td><td class="right">1</td></tr>
<tr><td class="right">13500〜13599</td><td class="right">1</td></tr>
<tr><td class="right">13900〜13999</td><td class="right">1</td></tr>
<tr><td class="right">14500〜14599</td><td class="right">1</td></tr>
<tr><td class="right">16300〜16399</td><td class="right">1</td></tr>
<tr><td class="right">17200〜17299</td><td class="right">1</td></tr>
<tr><td class="right">18100〜18199</td><td class="right">1</td></tr>
<tr><td class="right">18900〜18999</td><td class="right">1</td></tr>
<tr><td class="right">24800〜24899</td><td class="right">1</td></tr>
</table>

### 5. １投稿当たり単語数別集計

形態素解析による単語認識で、１投稿当たりの単語数を集計。  
当然ながら、行数・文字数に比例した結果となった。

<table class="common">
<tr><th class="center">単語数</th><th class="center">投稿数</th></tr>
<tr><td class="right">0〜99</td><td class="right">1</td></tr>
<tr><td class="right">100〜199</td><td class="right">28</td></tr>
<tr><td class="right">200〜299</td><td class="right">99</td></tr>
<tr><td class="right">300〜399</td><td class="right">67</td></tr>
<tr><td class="right">400〜499</td><td class="right">59</td></tr>
<tr><td class="right">500〜599</td><td class="right">76</td></tr>
<tr><td class="right">600〜699</td><td class="right">58</td></tr>
<tr><td class="right">700〜799</td><td class="right">56</td></tr>
<tr><td class="right">800〜899</td><td class="right">67</td></tr>
<tr><td class="right">900〜999</td><td class="right">51</td></tr>
<tr><td class="right">1000〜1099</td><td class="right">58</td></tr>
<tr><td class="right">1100〜1199</td><td class="right">45</td></tr>
<tr><td class="right">1200〜1299</td><td class="right">47</td></tr>
<tr><td class="right">1300〜1399</td><td class="right">42</td></tr>
<tr><td class="right">1400〜1499</td><td class="right">25</td></tr>
<tr><td class="right">1500〜1599</td><td class="right">32</td></tr>
<tr><td class="right">1600〜1699</td><td class="right">22</td></tr>
<tr><td class="right">1700〜1799</td><td class="right">23</td></tr>
<tr><td class="right">1800〜1899</td><td class="right">11</td></tr>
<tr><td class="right">1900〜1999</td><td class="right">11</td></tr>
<tr><td class="right">2000〜2099</td><td class="right">14</td></tr>
<tr><td class="right">2100〜2199</td><td class="right">11</td></tr>
<tr><td class="right">2200〜2299</td><td class="right">4</td></tr>
<tr><td class="right">2300〜2399</td><td class="right">13</td></tr>
<tr><td class="right">2400〜2499</td><td class="right">11</td></tr>
<tr><td class="right">2500〜2599</td><td class="right">5</td></tr>
<tr><td class="right">2600〜2699</td><td class="right">10</td></tr>
<tr><td class="right">2700〜2799</td><td class="right">4</td></tr>
<tr><td class="right">2800〜2899</td><td class="right">9</td></tr>
<tr><td class="right">2900〜2999</td><td class="right">5</td></tr>
<tr><td class="right">3000〜3099</td><td class="right">3</td></tr>
<tr><td class="right">3100〜3199</td><td class="right">2</td></tr>
<tr><td class="right">3200〜3299</td><td class="right">3</td></tr>
<tr><td class="right">3300〜3399</td><td class="right">4</td></tr>
<tr><td class="right">3500〜3599</td><td class="right">1</td></tr>
<tr><td class="right">3600〜3699</td><td class="right">2</td></tr>
<tr><td class="right">3700〜3799</td><td class="right">3</td></tr>
<tr><td class="right">3800〜3899</td><td class="right">5</td></tr>
<tr><td class="right">3900〜3999</td><td class="right">4</td></tr>
<tr><td class="right">4000〜4099</td><td class="right">8</td></tr>
<tr><td class="right">4100〜4199</td><td class="right">5</td></tr>
<tr><td class="right">4200〜4299</td><td class="right">7</td></tr>
<tr><td class="right">4300〜4399</td><td class="right">3</td></tr>
<tr><td class="right">4400〜4499</td><td class="right">2</td></tr>
<tr><td class="right">4600〜4699</td><td class="right">1</td></tr>
<tr><td class="right">4800〜4899</td><td class="right">1</td></tr>
<tr><td class="right">4900〜4999</td><td class="right">1</td></tr>
<tr><td class="right">5000〜5099</td><td class="right">1</td></tr>
<tr><td class="right">5700〜5799</td><td class="right">1</td></tr>
<tr><td class="right">5900〜5999</td><td class="right">1</td></tr>
<tr><td class="right">6300〜6399</td><td class="right">1</td></tr>
<tr><td class="right">7100〜7199</td><td class="right">1</td></tr>
<tr><td class="right">9700〜9799</td><td class="right">1</td></tr>
</table>

### 6. 品詞別出現回数

形態素解析による単語認識で、全投稿内の品詞別出現回数を集計。  
やはり、「名詞」がダントツで多いようだ。（使用する形態素解析エンジンにもよるだろうが。当方は "MeCab" を使用）

<table class="common">
<tr><th class="center">品詞</th><th class="center">出現回数</th></tr>
<tr><td>名詞</td><td class="right">920,217</td></tr>
<tr><td>助詞</td><td class="right">106,616</td></tr>
<tr><td>記号</td><td class="right">71,021</td></tr>
<tr><td>動詞</td><td class="right">50,886</td></tr>
<tr><td>助動詞</td><td class="right">35,665</td></tr>
<tr><td>副詞</td><td class="right">4,797</td></tr>
<tr><td>接頭詞</td><td class="right">3,712</td></tr>
<tr><td>接続詞</td><td class="right">3,568</td></tr>
<tr><td>連体詞</td><td class="right">2,737</td></tr>
<tr><td>形容詞</td><td class="right">2,673</td></tr>
<tr><td>感動詞</td><td class="right">1,114</td></tr>
<tr><td>フィラー</td><td class="right">73</td></tr>
</table>

### 7. 単語別出現回数

形態素解析による単語認識で、全投稿内の単語別（品詞別）出現回数を集計。  
使用する形態素解析エンジンにもよるだろうが、判別がシビアなため上位に出現する単語は「単語」とは程遠いものだ。  
また、単語別（品詞別）なので全部で 30,000 種類もあった。

<table class="common">
<tr><th class="center">単語</th><th>品詞</th><th class="center">出現回数</th></tr>
<tr><td>.</td><td>名詞</td><td class="right">35459</td></tr>
<tr><td>-</td><td>名詞</td><td class="right">31402</td></tr>
<tr><td>$gt;</td><td>名詞</td><td class="right">26001</td></tr>
<tr><td>。</td><td>記号</td><td class="right">22796</td></tr>
<tr><td>/</td><td>名詞</td><td class="right">22771</td></tr>
<tr><td>td</td><td>名詞</td><td class="right">22198</td></tr>
<tr><td>の</td><td>助詞</td><td class="right">18434</td></tr>
<tr><td>_</td><td>名詞</td><td class="right">17620</td></tr>
<tr><td>&lt;</td><td>名詞</td><td class="right">17171</td></tr>
<tr><td>、</td><td>記号</td><td class="right">16372</td></tr>
<tr><td class="center">：</td><td class="center">：</td><td class="center">：</td></tr>
</table>

### 参考

Ruby で形態素解析エンジン MeCab を使用する方法については、以下の過去記事を参照。

- [Linux Mint - Ruby で形態素解析 MeCab を使う！](http://www.mk-mode.com/octopress/2013/01/08/linux-mint-ruby-mecab/ "Linux Mint - Ruby で形態素解析 MeCab を使う！")

アクセス解析の観点での集計は、当方サイト「ブログ」メニューから確認できる。

- [mk-mode SITE](http://www.mk-mode.com/rails/ "mk-mode SITE")

---

「集計した結果がどう」というより、「集計する作業」自体が楽しかっただけのような気もします。  
普段から行なっているアクセス解析の方が有用性が高いです。

以上。

