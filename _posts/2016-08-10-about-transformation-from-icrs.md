---
layout   : single
title    : "ICRS からの座標変換について！"
published: true
date     : 2016-08-10 00:20:00 +0900
comments : true
categories:
- 暦・カレンダー
tags:
- カレンダー
---

ICRS(International Celestial Reference System; 国際天文基準座標系) の座標から GCRS(Geocentric Celestial Reference System; 地球重心天文座標系) や ITRS(International Terrestrial Reference System; 国際地球基準座標系) 等に変換する流れについての個人的備忘録です。

当方、天文計算については長けていないので、誤りもあるかもしれません。

<!--more-->

### 0. 前提条件

* IAU SOFA 提供の[ライブラリ群](http://www.iausofa.org/2016_0503_C/CompleteList.html "")を大いに参考にしている。
* ITRS 座標系より後ろの部分（local apparent 以降）については、今回はあまり注目していない。

### 1. 座標変換の流れ

（**太字**が座標系で、間の【】で括った項目が変換に適用するもの）

* **ICRS(International Celestial Reference System; 国際天文基準座標系)** $$\alpha, \delta, \dot{\alpha}, \dot{\delta}, \pi, \dot{r}$$  
  - 1998年から IAU（International Astronomical Union; 国際天文学連合） により採用された現行の標準天球座標系
+ 【space motion（天体固有運動）の適用】
* **BCRS(Barycentric Celestial Reference System; 太陽系重心天文座標系)** $$\alpha, \delta, r$$  
  - 太陽系諸天体の運動を考える場合に使用する座標系
+ 【parallax（視差）の適用】
* **astrometric** $$[\alpha, \delta]$$  
  - BCRS に parallax を適用した座標系（としか説明のしようがない）
+ 【light deflection（光の屈折）, aberration（光行差）の適用】
* **GCRS(Geocentric Celestial Reference System; 地球重心天文座標系)**  
  - 地球重心の周りの天体の運動を考える場合に使用する座標系
+ 【frame bias（バイアス; GCRS と J2000.0 の極のズレ）, precession(CIO based)（歳差）, nutation(CIO based)（章動）の適用】
* **CIRS(Celestial Intermediate Reference System; 瞬時の真座標系)** $$[\alpha, \delta]$$  
  - CIP（Celestial Intermediate Pole; 瞬時の極軸）とCIO（Celestial Intermediate Origin; 非回転原点）で定義された座標系
+ 【Earth rotation angle（地球回転角）の適用】
* **TIRS(Terrestrial Intermediate Reference System; 瞬時の地球座標系)** $$[\lambda, \phi]$$  
  - CIRS に ERA（地球回転角）を考慮した座標系（としか説明のしようがない）
+ 【polar motion（極運動）の適用】
* **ITRS(International Terrestrial Reference System; 国際地球基準座標系)** $$[\lambda, \phi]$$  
  - 地球重心を原点とし、地球の形状に対して回転しない座標系。日常用いる経度や緯度（世界測地系）の基準となっている。
+ 【longitude の適用】
* **local apparent** $$[h, \delta]$$
+ 【diurnal aberration (and parallax) の適用】
* **topocentric** $$[h, \delta]$$
+ 【latitude の適用】
* **topocentric** $$[az, alt]$$
+ 【refraction の適用】
* **observed** $$[az, alt]$$

GCRS 〜 TIRS の変換の部分（CIO ベース）は、以下のように（春分点ベースで）置き換えることも可能。

* **GCRS(Geocentric Celestial Reference System; 地球重心天文座標系)**
+ 【frame bias（バイアス; GCRS と J2000.0 の極のズレ） の適用】
* **J2000.0 の平均座標系** $$[\alpha, \delta]$$  
  - J2000.0 における平均赤道 (黄道) と平均春分点を基準とした座標系
+ 【precession(equinox based)（歳差）の適用】
* **瞬時の平均座標系** $$[\alpha, \delta]$$  
  - その時刻における平均赤道 (黄道) と平均春分点を基準とした座標系
+ 【nutation(equinox based)（章動）の適用】
* **瞬時の真座標系** $$[\alpha, \delta]$$  
  - その時刻における真赤道と真春分点を基準とした座標系
+ 【Greenwich apparent sidereal time（グリニッジ視恒星時）の適用】
* **TIRS(Terrestrial Intermediate Reference System; 瞬時の地球座標系)** $$[\lambda, \phi]$$

### 2. 認識、疑問点

* precession, nutation が「CIO ベース」と「春分点ベース」となっているが、実質は同じものという認識。  
  （参考にした GCRS から CIRS への変換処理のソースコードでは、precession, nutation の計算が「春分点ベース」となっているので）
* 春分点ベースの「瞬時の真座標系」は CIRS とは別物？
* 惑星の視赤経・視赤緯・視黄経・視黄緯を求める場合、それは ITRS 座標のこと？

### 3. 参考サイト

* [Standards of Fundamental Astronomy - SOFA Library Issue 2016-05-03 for ANSI C](http://www.iausofa.org/2016_0503_C/ "Standards of Fundamental Astronomy - SOFA Library Issue 2016-05-03 for ANSI C")
* [暦象年表の改訂について（PDF 1.7MB）](http://www.nao.ac.jp/contents/about-naoj/reports/report-naoj/11-34-2.pdf "暦象年表の改訂について")

---

当方、太陽や月、その他太陽系惑星の視位置を計算する際に利用するのでは？と記録しておいた次第です。

以上。

