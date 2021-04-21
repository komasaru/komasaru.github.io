---
layout   : single
title    : "赤道座標と黄道座標、直交座標と極座標の変換！"
published: true
date     : 2016-05-08 00:20:00 +0900
comments : true
categories:
- 暦・カレンダー
tags:
- カレンダー
---

天体の位置を計算する際によく使用する変換式についての記録です。

<!--more-->

### 1. 赤道直交座標 -> 黄道直交座標

 $$\varepsilon:$$黄道傾斜角、とすると、

$$
\begin{eqnarray*}
\left(
\begin{array}{c}
x' \\
y' \\
z' \\
\end{array}
\right)
=\left(
\begin{array}{ccc}
1 &                0 &               0 \\
0 &  \cos\varepsilon & \sin\varepsilon \\
0 & -\sin\varepsilon & \cos\varepsilon \\
\end{array}
\right)
\left(
\begin{array}{c}
x \\
y \\
z \\
\end{array}
\right)
\end{eqnarray*}
$$

ちなみに、「黄道直交座標 -> 赤道直交座標」の場合は $$\varepsilon$$ の符号を反転する。

### 2. 赤道極座標 -> 黄道極座標

 $$\alpha:$$赤経、$$\delta:$$赤緯、$$\lambda:$$黄経、$$\beta:$$黄緯、$$\varepsilon:$$黄道傾斜角、とすると、

$$
\begin{eqnarray*}
\cos\beta\cos\lambda &=& \cos\delta\cos\alpha \\
\cos\beta\sin\lambda &=& \sin\delta\sin\varepsilon + \cos\delta\sin\alpha\cos\varepsilon \\
\sin\beta &=& \sin\delta\cos\varepsilon - \cos\delta\sin\alpha\sin\varepsilon
\end{eqnarray*}
$$

従って、

$$
\begin{eqnarray*}
\lambda &=& \tan^{-1}\left(\frac{\sin\delta\sin\varepsilon + \cos\delta\sin\alpha\cos\varepsilon}{\cos\delta\cos\alpha}\right) \\
\beta &=& \sin^{-1}(\sin\delta\cos\varepsilon - \cos\delta\sin\alpha\sin\varepsilon)
\end{eqnarray*}
$$

### 3. 黄道極座標 -> 赤道極座標

 $$\lambda:$$黄経、$$\beta:$$黄緯、$$\alpha:$$赤経、$$\delta:$$赤緯、$$\varepsilon:$$黄道傾斜角、とすると、

$$
\begin{eqnarray*}
\cos\delta\cos\alpha =& &\cos\beta\cos\lambda \\
\cos\delta\sin\alpha =& -&\sin\beta\sin\varepsilon + \cos\beta\sin\lambda\cos\varepsilon \\
\sin\delta =& &\sin\beta\cos\varepsilon + \cos\beta\sin\lambda\sin\varepsilon
\end{eqnarray*}
$$

従って、

$$
\begin{eqnarray*}
\alpha &=& \tan^{-1}\left(\frac{-\sin\beta\sin\varepsilon + \cos\beta\sin\lambda\cos\varepsilon}{\cos\beta\cos\lambda}\right) \\
\delta &=& \sin^{-1}(\sin\beta\cos\varepsilon + \cos\beta\sin\lambda\sin\varepsilon)
\end{eqnarray*}
$$

### 4. 直交座標 -> 極座標

 $$\lambda:$$経度、$$\phi:$$緯度、$$r:$$中心距離、とすると、

$$
\begin{eqnarray*}
\lambda &=& \tan^{-1}\frac{y}{x} \\
\phi &=& \tan^{-1}\frac{z}{r} \\
(但し、r&=&\sqrt{x^{2}+y^{2}})
\end{eqnarray*}
$$

### 5. 極座標 -> 直交座標

 $$\lambda:$$経度、$$\phi:$$緯度、$$r:$$中心距離、とすると、

$$
\begin{eqnarray*}
\left(
\begin{array}{c}
x \\
y \\
z \\
\end{array}
\right)
&=&\left(
\begin{array}{ccc}
\cos\lambda & \sin\lambda & 0 \\
-\sin\lambda & \cos\lambda & 0 \\
0 & 0 & 1
\end{array}
\right)
\left(
\begin{array}{ccc}
\cos\phi & 0 & -\sin\phi \\
0 & 1 & 0 \\
\sin\phi & 0 & \cos\phi
\end{array}
\right)
\left(
\begin{array}{c}
r \\
0 \\
0
\end{array}
\right) \\
&=&\left(
\begin{array}{c}
r\cos\lambda\cos\phi \\
r\sin\lambda\cos\phi \\
-r\sin\phi
\end{array}
\right)
\end{eqnarray*}
$$

---

以上。

