---
layout   : single
title    : "歳差・章動の変換行列について！"
published: true
date     : 2016-06-14 00:20:00 +0900
comments : true
categories:
- 暦・カレンダー
tags:
- カレンダー
---

天体の位置やこよみを正確に計算する際に必要になってくる「歳差」と「章動」の変換行列についての調査記録です。

<!--more-->

### 0. 前提条件

* ここでは「歳差」や「章動」が何かということは説明しないので、必要であれば各自お調べください。

### 1. 歳差の変換行列（Fukushima の方法）

歳差の変換行列$$P$$は以下のように書ける。

$$
\begin{eqnarray*}
P(\varepsilon_{A}, \bar{\psi}, \bar{\phi}, \bar{\gamma})&=&R_1(-\varepsilon_{A})R_3(-\bar{\psi})R_1(\bar{\phi})R_3(\bar{\gamma}) \\
&=&\left(
\begin{array}{ccc}
P_{11} & P_{12} & P_{13} \\
P_{21} & P_{22} & P_{23} \\
P_{31} & P_{32} & P_{33} \\
\end{array}
\right)
\end{eqnarray*}
$$

但し、$$R_1,R_3$$は$$x$$軸、$$z$$軸を軸とした回転で、以下のように表される。

$$
\begin{eqnarray*}
R_1 = \left(
\begin{array}{ccc}
1 & 0 & 0 \\
0 & \cos\theta & \sin\theta \\
0 & -\sin\theta & \cos\theta
\end{array}
\right),\ \ \ 
R_3 = \left(
\begin{array}{ccc}
\cos\theta & \sin\theta & 0\\
-\sin\theta & \cos\theta & 0\\
0 & 0 & 1
\end{array}
\right)
\end{eqnarray*}
$$

よって、

$$
\begin{eqnarray*}
P_{11} &=& \cos\bar{\psi}\cos\bar{\gamma} + \sin\bar{\psi}\cos\bar{\phi}\sin\bar{\gamma} \\
P_{12} &=& \cos\bar{\psi}\sin\bar{\gamma} - \sin\bar{\psi}\cos\bar{\phi}\cos\bar{\gamma} \\
P_{13} &=& -\sin\bar{\psi}\sin\bar{\phi} \\
P_{21} &=& \cos\varepsilon_A\sin\bar{\psi}\sin\bar{\gamma} - (\cos\varepsilon_A\cos\bar{\psi}\cos\bar{\phi} + \sin\varepsilon_A\sin\bar{\phi})\sin\bar{\gamma} \\
P_{22} &=& \cos\varepsilon_A\sin\bar{\psi}\sin\bar{\gamma} + (\cos\varepsilon_A\cos\bar{\psi}\cos\bar{\phi} + \sin\varepsilon_A\sin\bar{\phi})\cos\bar{\gamma} \\
P_{23} &=& \cos\varepsilon_A\cos\bar{\psi}\sin\bar{\phi} - \sin\varepsilon_A\cos\bar{\phi} \\
P_{31} &=& \sin\varepsilon_A\sin\bar{\psi}\cos\bar{\gamma} - (\sin\varepsilon_A\cos\bar{\psi}\cos\bar{\phi} - \cos\varepsilon_A\sin\bar{\phi})\sin\bar{\gamma} \\
P_{32} &=& \sin\varepsilon_A\sin\bar{\psi}\sin\bar{\gamma} + (\sin\varepsilon_A\cos\bar{\psi}\cos\bar{\phi} - \cos\varepsilon_A\sin\bar{\phi})\cos\bar{\gamma} \\
P_{33} &=& \sin\varepsilon_A\cos\bar{\psi}\sin\bar{\phi} + \cos\varepsilon_A\cos\bar{\phi}
\end{eqnarray*}
$$

また、ユリウス世紀数を$$\displaystyle T=\frac{JD- 2451545}{36525}$$とすると、GCRSから変換する場合の$$\bar{\gamma}, \bar{\phi}, \bar{\psi}$$は以下のとおり。（単位：$$″$$）

$$
\begin{eqnarray*}
\bar{\gamma} = &-&0.052928 + 10.556378T + 0.4932044T^2 \\
&-&0.00031238T^3 - 0.000002788T^4 + 0.0000000260T^5 \\
\bar{\phi} = &&84381.412819 - 46.811016T +0.0511268T^2 \\
&+&0.00053289T^3 - 0.000000440T^4 - 0.0000000176T^5 \\
\bar{\psi} = &-&0.041775 + 5038.481484T + 1.5584175T^2 \\
&-&0.00018522T^3 -0.000026452T^4 - 0.0000000148T^5
\end{eqnarray*}
$$

J2000.0から変換する場合の$$\bar{\gamma}, \bar{\phi}, \bar{\psi}$$は以下のとおり。（単位：$$″$$）

$$
\begin{eqnarray*}
\bar{\gamma} = &&10.556403T + 0.4932044T^2 - 0.00031238T^3 \\
&-&0.000002788T^4 + 0.0000000260T^5 \\
\bar{\phi} = &&84381.406000 - 46.811015T + 0.0511269T^2 \\
&+&0.00053289T^3 - 0.000000440T^4 - 0.0000000176T^5 \\
\bar{\psi} = &&5038.481507T + 1.5584176T^2 - 0.00018522T^3 \\
&-& 0.000026452T^4 -0.0000000148T^5
\end{eqnarray*}
$$

そして、$$\varepsilon_A$$はいずれも以下のとおり。（単位：$$″$$）

$$
\begin{eqnarray*}
\varepsilon_A = &&84381.406000 - 46.836769T - 0.0001831T^2 \\
&+& 0.00200340T^3 - 5.76 \times 10^{-7}T^4 - 4.34 \times 10^{-8}T^5
\end{eqnarray*}
$$

### 2. 章動の変換行列（MHB2000(IAU2000A)の修正版）

歳差と同様に、章動の変換行列$$N$$は以下のように書ける。

$$
\begin{eqnarray*}
N(\varepsilon_{A}, \Delta\varepsilon, \Delta\psi) &=&R_1(-\varepsilon_{A}-\Delta\varepsilon)R_3(-\Delta\psi)R_1(\varepsilon_A) \\
&=&\left(
\begin{array}{ccc}
N_{11} & N_{12} & N_{13} \\
N_{21} & N_{22} & N_{23} \\
N_{31} & N_{32} & N_{33} \\
\end{array}
\right)
\end{eqnarray*}
$$

 $$R_1,R_3$$は、

$$
\begin{eqnarray*}
R_1 = \left(
\begin{array}{ccc}
1 & 0 & 0 \\
0 & \cos\theta & \sin\theta \\
0 & -\sin\theta & \cos\theta
\end{array}
\right),\ \ \ 
R_3 = \left(
\begin{array}{ccc}
\cos\theta & \sin\theta & 0\\
-\sin\theta & \cos\theta & 0\\
0 & 0 & 1
\end{array}
\right)
\end{eqnarray*}
$$

であるので、

$$
\begin{eqnarray*}
N_{11} &=& \cos(\Delta\psi) \\
N_{12} &=& -\sin(\Delta\psi)\cos(\varepsilon_A) \\
N_{13} &=& -\sin(\Delta\psi)\sin(\varepsilon_A) \\
N_{21} &=&  \cos(\varepsilon_A + \Delta\varepsilon)\sin(\Delta\psi) \\
N_{22} &=&  \cos(\varepsilon_A + \Delta\varepsilon)\cos(\Delta\psi)\cos(\varepsilon_A) + \sin(\varepsilon_A + \Delta\varepsilon)\sin(\varepsilon_A) \\
N_{23} &=&  \cos(\varepsilon_A + \Delta\varepsilon)\cos(\Delta\psi)\sin(\varepsilon_A) - \sin(\varepsilon_A + \Delta\varepsilon)\cos(\varepsilon_A) \\
N_{31} &=&  \sin(\varepsilon_A + \Delta\varepsilon)\sin(\Delta\psi) \\
N_{32} &=&  \sin(\varepsilon_A + \Delta\varepsilon)\cos(\Delta\psi)\cos(\varepsilon_A) - \cos(\varepsilon_A + \Delta\varepsilon)\sin(\varepsilon_A) \\
N_{33} &=& -\sin(\varepsilon_A + \Delta\varepsilon)\cos(\Delta\psi)\sin(\varepsilon_A) + \cos(\varepsilon_A + \Delta\varepsilon)\cos(\varepsilon_A)
\end{eqnarray*}
$$

上記の$$\Delta\varepsilon, \Delta\psi$$はMHB2000章動理論によるものである（ここでは割愛）が、若干修正する。

$$
\begin{eqnarray*}
\Delta\psi &=& \Delta\psi_{MHB} + (0.4697 \times 10^{-6} + f) \Delta\psi_{MHB} \\
\Delta\varepsilon &=& \Delta\varepsilon_{MHB} + f\Delta\varepsilon_{MHB} \\
&&(但し、 f  = -2.7774 \times 10^{-6}T)
\end{eqnarray*}
$$

### 3. 歳差・章動の一括変換

歳差と章動を以下のよう一括で変換することもできる。

$$
\begin{eqnarray*}
NP(\varepsilon_{A}, \Delta\varepsilon, \bar{\psi}, \Delta\psi, \bar{\phi}, \bar{\gamma})&=&R_1(-\varepsilon_{A} - \Delta\varepsilon)R_3(-\bar{\psi} - \Delta\psi)R_1(\bar{\phi})R_3(\bar{\gamma}) 
\end{eqnarray*}
$$

### 4. その他

上記の内容を $$\LaTeX$$ で作成したものは以下。

* [歳差・章動変換行列](http://www.mk-mode.com/rails/docs/TRANSFORM_MATRIX_PRECESSION_NUTATION.pdf "歳差・章動変換行列")

また、「章動の変換行列」を MHB2000 理論によるものから若干修正しているのは、日本の国立天文台が採用している理論に合わせたため。

### 5. 参考サイト

* [歳差・章動と地球の向き](http://eco.mtk.nao.ac.jp/koyomi/topics/html/topics2009_1.html "歳差・章動と地球の向き")
* [暦象年表の改訂について（PDF 1.7MB）](http://www.nao.ac.jp/contents/about-naoj/reports/report-naoj/11-34-2.pdf "暦象年表の改訂について")

---

以上。

