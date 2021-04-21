---
layout   : single
title    : "Linux - smartctl で HDD 診断！"
published: true
date     : 2015-03-03 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---
こんにちは。

Linux でハードディスクの状態をある程度診断できる `smartctl` コマンドについての備忘録です。

<!--more-->

### 0. 前提条件

* Debian GNU Linux 7.8.0, CentOS 6.6, Linux Mint 17.1 での作業を想定。
* `smartctl` コマンドが利用可能である。  
  （RedHat 系ではデフォルトでインストールされているが、 Debian 系ではデフォルトでインストールされていないので、 `apt-get install smartmontools` 等でインストールしておく）
* 以下では root ユーザになって作業を行なっている。

### 1. smartctl コマンド実行（エラーありのケース）

`-a` or `--all` オプションで SMART 情報全てを表示してみる。（この項の最後に簡単な説明あり）

``` text
# smartctl -a /dev/sda
smartctl 5.41 2011-06-09 r3365 [x86_64-linux-3.2.0-4-amd64] (local build)
Copyright (C) 2002-11 by Bruce Allen, http://smartmontools.sourceforge.net

=== START OF INFORMATION SECTION ===
Model Family:     Maxtor DiamondMax 10 (SATA/300)
Device Model:     Maxtor 6V250F0
Serial Number:    V501XATG
LU WWN Device Id: 0 150500 7b27f269a
Firmware Version: VA111630
User Capacity:    251,000,193,024 bytes [251 GB]
Sector Size:      512 bytes logical/physical
Device is:        In smartctl database [for details use: -P show]
ATA Version is:   7
ATA Standard is:  ATA/ATAPI-7 T13 1532D revision 0
Local Time is:    Sun Feb 15 13:31:35 2015 JST
SMART support is: Available - device has SMART capability.
SMART support is: Enabled

=== START OF READ SMART DATA SECTION ===
SMART overall-health self-assessment test result: PASSED

General SMART Values:
Offline data collection status:  (0x82) Offline data collection activity
                                        was completed without error.
                                        Auto Offline Data Collection: Enabled.
Self-test execution status:      (  21) The self-test routine was aborted by
                                        the host.
Total time to complete Offline
data collection:                ( 2102) seconds.
Offline data collection
capabilities:                    (0x5b) SMART execute Offline immediate.
                                        Auto Offline data collection on/off support.
                                        Suspend Offline collection upon new
                                        command.
                                        Offline surface scan supported.
                                        Self-test supported.
                                        No Conveyance Self-test supported.
                                        Selective Self-test supported.
SMART capabilities:            (0x0003) Saves SMART data before entering
                                        power-saving mode.
                                        Supports SMART auto save timer.
Error logging capability:        (0x01) Error logging supported.
                                        General Purpose Logging supported.
Short self-test routine
recommended polling time:        (   2) minutes.
Extended self-test routine
recommended polling time:        ( 114) minutes.
SCT capabilities:              (0x0021) SCT Status supported.
                                        SCT Data Table supported.

SMART Attributes Data Structure revision number: 32
Vendor Specific SMART Attributes with Thresholds:
ID# ATTRIBUTE_NAME          FLAG     VALUE WORST THRESH TYPE      UPDATED  WHEN_FAILED RAW_VALUE
  3 Spin_Up_Time            0x0027   186   185   063    Pre-fail  Always       -       20281
  4 Start_Stop_Count        0x0032   253   253   000    Old_age   Always       -       1477
  5 Reallocated_Sector_Ct   0x0033   253   253   063    Pre-fail  Always       -       0
  7 Seek_Error_Rate         0x000a   253   252   000    Old_age   Always       -       0
  8 Seek_Time_Performance   0x0027   247   241   187    Pre-fail  Always       -       65480
  9 Power_On_Hours          0x0032   185   185   000    Old_age   Always       -       23563
 10 Spin_Retry_Count        0x002b   253   252   157    Pre-fail  Always       -       0
 11 Calibration_Retry_Count 0x002b   253   252   223    Pre-fail  Always       -       0
 12 Power_Cycle_Count       0x0032   250   250   000    Old_age   Always       -       1212
189 High_Fly_Writes         0x003a   100   100   000    Old_age   Always       -       0
190 Airflow_Temperature_Cel 0x0022   066   039   000    Old_age   Always       -       34 (Min/Max 32/34)
192 Power-Off_Retract_Count 0x0032   253   253   000    Old_age   Always       -       0
193 Load_Cycle_Count        0x0032   253   253   000    Old_age   Always       -       0
194 Temperature_Celsius     0x0032   039   253   000    Old_age   Always       -       34
195 Hardware_ECC_Recovered  0x000a   253   240   000    Old_age   Always       -       764
196 Reallocated_Event_Count 0x0008   253   253   000    Old_age   Offline      -       0
197 Current_Pending_Sector  0x0008   253   253   000    Old_age   Offline      -       0
198 Offline_Uncorrectable   0x0008   253   253   000    Old_age   Offline      -       0
199 UDMA_CRC_Error_Count    0x0008   001   001   000    Old_age   Offline      -       10909
200 Multi_Zone_Error_Rate   0x000a   253   252   000    Old_age   Always       -       0
201 Soft_Read_Error_Rate    0x000a   253   252   000    Old_age   Always       -       0
202 Data_Address_Mark_Errs  0x000a   253   250   000    Old_age   Always       -       0
203 Run_Out_Cancel          0x000b   253   252   180    Pre-fail  Always       -       0
204 Soft_ECC_Correction     0x000a   253   252   000    Old_age   Always       -       0
205 Thermal_Asperity_Rate   0x000a   253   252   000    Old_age   Always       -       0
207 Spin_High_Current       0x002a   253   252   000    Old_age   Always       -       0
208 Spin_Buzz               0x002a   253   252   000    Old_age   Always       -       0
210 Unknown_Attribute       0x0032   253   252   000    Old_age   Always       -       0
211 Unknown_Attribute       0x0032   253   252   000    Old_age   Always       -       0
212 Unknown_Attribute       0x0032   253   001   000    Old_age   Always       -       0

SMART Error Log Version: 1
ATA Error Count: 7 (device log contains only the most recent five errors)
        CR = Command Register [HEX]
        FR = Features Register [HEX]
        SC = Sector Count Register [HEX]
        SN = Sector Number Register [HEX]
        CL = Cylinder Low Register [HEX]
        CH = Cylinder High Register [HEX]
        DH = Device/Head Register [HEX]
        DC = Device Command Register [HEX]
        ER = Error register [HEX]
        ST = Status register [HEX]
Powered_Up_Time is measured from power on, and printed as
DDd+hh:mm:SS.sss where DD=days, hh=hours, mm=minutes,
SS=sec, and sss=millisec. It "wraps" after 49.710 days.

Error 7 occurred at disk power-on lifetime: 18365 hours (765 days + 5 hours)
  When the command that caused the error occurred, the device was in an unknown state.

  After command completion occurred, registers were:
  ER ST SC SN CL CH DH
  -- -- -- -- -- -- --
  84 51 01 02 68 16 e8  Error: ABRT

  Commands leading to the command that caused the error were:
  CR FR SC SN CL CH DH DC   Powered_Up_Time  Command/Feature_Name
  -- -- -- -- -- -- -- --  ----------------  --------------------
  00 00 01 02 68 16 e8 00      01:53:24.279  NOP [Abort queued commands]
  ca 00 01 02 68 16 e8 00      01:53:24.269  WRITE DMA
  c8 00 20 18 67 4d e9 00      01:53:24.261  READ DMA
  c8 00 20 38 3c 4f e9 00      01:53:24.259  READ DMA
  c8 00 20 18 66 4d e9 00      01:53:24.253  READ DMA

Error 6 occurred at disk power-on lifetime: 18325 hours (763 days + 13 hours)
  When the command that caused the error occurred, the device was in an unknown state.

  After command completion occurred, registers were:
  ER ST SC SN CL CH DH
  -- -- -- -- -- -- --
  84 51 10 78 72 8c e8  Error: ICRC, ABRT at LBA = 0x088c7278 = 143422072

  Commands leading to the command that caused the error were:
  CR FR SC SN CL CH DH DC   Powered_Up_Time  Command/Feature_Name
  -- -- -- -- -- -- -- --  ----------------  --------------------
  ca 00 10 78 72 8c e8 00      00:47:50.442  WRITE DMA
  25 00 20 60 9b d5 e0 00      00:47:50.431  READ DMA EXT
  c8 00 08 80 72 8c e8 00      00:47:50.409  READ DMA
  25 00 20 e0 58 d5 e0 00      00:47:50.400  READ DMA EXT
  25 00 20 20 d2 d5 e0 00      00:47:50.395  READ DMA EXT

SMART Self-test log structure revision number 1
Num  Test_Description    Status                  Remaining  LifeTime(hours)  LBA_of_first_error
# 1  Extended offline    Aborted by host               50%     22989         -

SMART Selective self-test log data structure revision number 1
 SPAN  MIN_LBA  MAX_LBA  CURRENT_TEST_STATUS
    1        0        0  Not_testing
    2        0        0  Not_testing
    3        0        0  Not_testing
    4        0        0  Not_testing
    5        0        0  Not_testing
Selective self-test flags (0x0):
  After scanning selected spans, do NOT read-scan remainder of disk.
If Selective self-test is pending on power-up, resume after 0 minute delay.

```

以下、簡単な説明。

* 存在する HDD デバイスを確認するだけなら `--scan` オプション。
* ディスクの情報のみ出力するなら `-i` or `--info` オプション。
* ベンダー固有の属性のみを出力するなら `-A` or `--attributes` オプション。
* 対応可能な自己診断を確認するなら `-c` or `--capabilities` オプション。
* 自己診断(short)するなら `-t short` オプション。（`short` 以外に `long` 等もあり）
* エラーログのみを出力するなら `-l error` or `--log=error` オプション。
* その他のオプション、使用方法の詳細は `-h` or `--help` オプションを使用するか、 `man smartctl` で確認可。
* `SMART support is: Available ...` と SMART 対応にも関わらず次の行で `Enabled` になっていなければ、 SMART 機能が有効になっていない。  
  `smartctl -s on /dev/sda` で有効にする。
* `Short self-test routine recommended polling time`, `Extended self-test routine recommended polling time` の数字はセルフテストに要する時間。
* ベンダー固有属性（`Vendor Specific SMART Attributes with Thresholds`）で閾値未満の項目がある場合、 `WHEN_FAILED` 列に `-` 以外（`FAILING_NOW` 等）が出力される。
* SMART エラーがあれば `SMART Error Log Version: 1` 以下に（最大で直近５つ分）出力される。（上記の例では７つあるはずだが直近２つしか出力されていない。なぜか）  
  上記の例での `ABRT` は "Command ABoRTed" で、 `ICRC` "Interface Cyclic Redundancy Code (CRC) error" のことである。（※今後の懸案事項）

### 2. smartctl コマンド実行（エラーなしのケース）

上記は SMART エラーの存在する HDD であったが、エラーの存在しない HDD の場合は、以下のように出力される。

``` text
# smartctl -a /dev/sda
smartctl 5.43 2012-06-30 r3573 [i686-linux-2.6.32-504.3.3.el6.i686] (local build)
Copyright (C) 2002-12 by Bruce Allen, http://smartmontools.sourceforge.net

=== START OF INFORMATION SECTION ===
Model Family:     Hitachi Travelstar 7K320
Device Model:     Hitachi HTS723232L9A360
Serial Number:    100108FC1420NEJKPD8G
LU WWN Device Id: 5 000cca 582e439a2
Firmware Version: FC4OC30F
User Capacity:    320,072,933,376 bytes [320 GB]
Sector Size:      512 bytes logical/physical
Device is:        In smartctl database [for details use: -P show]
ATA Version is:   8
ATA Standard is:  ATA-8-ACS revision 3f
Local Time is:    Sun Feb 15 13:58:28 2015 JST
SMART support is: Available - device has SMART capability.
SMART support is: Enabled

=== START OF READ SMART DATA SECTION ===
SMART overall-health self-assessment test result: PASSED

General SMART Values:
Offline data collection status:  (0x00) Offline data collection activity
                                        was never started.
                                        Auto Offline Data Collection: Disabled.
Self-test execution status:      (   0) The previous self-test routine completed
                                        without error or no self-test has ever
                                        been run.
Total time to complete Offline
data collection:                (  645) seconds.
Offline data collection
capabilities:                    (0x5b) SMART execute Offline immediate.
                                        Auto Offline data collection on/off support.
                                        Suspend Offline collection upon new
                                        command.
                                        Offline surface scan supported.
                                        Self-test supported.
                                        No Conveyance Self-test supported.
                                        Selective Self-test supported.
SMART capabilities:            (0x0003) Saves SMART data before entering
                                        power-saving mode.
                                        Supports SMART auto save timer.
Error logging capability:        (0x01) Error logging supported.
                                        General Purpose Logging supported.
Short self-test routine
recommended polling time:        (   2) minutes.
Extended self-test routine
recommended polling time:        (  96) minutes.
SCT capabilities:              (0x003d) SCT Status supported.
                                        SCT Error Recovery Control supported.
                                        SCT Feature Control supported.
                                        SCT Data Table supported.

SMART Attributes Data Structure revision number: 16
Vendor Specific SMART Attributes with Thresholds:
ID# ATTRIBUTE_NAME          FLAG     VALUE WORST THRESH TYPE      UPDATED  WHEN_FAILED RAW_VALUE
  1 Raw_Read_Error_Rate     0x000b   100   100   062    Pre-fail  Always       -       0
  2 Throughput_Performance  0x0005   100   100   040    Pre-fail  Offline      -       0
  3 Spin_Up_Time            0x0007   253   253   033    Pre-fail  Always       -       0
  4 Start_Stop_Count        0x0012   100   100   000    Old_age   Always       -       74
  5 Reallocated_Sector_Ct   0x0033   100   100   005    Pre-fail  Always       -       0
  7 Seek_Error_Rate         0x000b   100   100   067    Pre-fail  Always       -       0
  8 Seek_Time_Performance   0x0005   100   100   040    Pre-fail  Offline      -       0
  9 Power_On_Hours          0x0012   001   001   000    Old_age   Always       -       43878
 10 Spin_Retry_Count        0x0013   100   100   060    Pre-fail  Always       -       0
 12 Power_Cycle_Count       0x0032   100   100   000    Old_age   Always       -       62
191 G-Sense_Error_Rate      0x000a   100   100   000    Old_age   Always       -       0
192 Power-Off_Retract_Count 0x0032   100   100   000    Old_age   Always       -       6
193 Load_Cycle_Count        0x0012   024   024   000    Old_age   Always       -       764531
194 Temperature_Celsius     0x0002   220   220   000    Old_age   Always       -       25 (Min/Max 16/47)
196 Reallocated_Event_Count 0x0032   100   100   000    Old_age   Always       -       0
197 Current_Pending_Sector  0x0022   100   100   000    Old_age   Always       -       0
198 Offline_Uncorrectable   0x0008   100   100   000    Old_age   Offline      -       0
199 UDMA_CRC_Error_Count    0x000a   200   200   000    Old_age   Always       -       1294
223 Load_Retry_Count        0x000a   100   100   000    Old_age   Always       -       0

SMART Error Log Version: 1
No Errors Logged

SMART Self-test log structure revision number 1
No self-tests have been logged.  [To run self-tests, use: smartctl -t]

SMART Selective self-test log data structure revision number 1
 SPAN  MIN_LBA  MAX_LBA  CURRENT_TEST_STATUS
    1        0        0  Not_testing
    2        0        0  Not_testing
    3        0        0  Not_testing
    4        0        0  Not_testing
    5        0        0  Not_testing
Selective self-test flags (0x0):
  After scanning selected spans, do NOT read-scan remainder of disk.
If Selective self-test is pending on power-up, resume after 0 minute delay.

```

### 3. セルフテスト（ショート）

``` text
# smartctl -t short /dev/sda
smartctl 5.41 2011-06-09 r3365 [x86_64-linux-3.2.0-4-amd64] (local build)
Copyright (C) 2002-11 by Bruce Allen, http://smartmontools.sourceforge.net

=== START OF OFFLINE IMMEDIATE AND SELF-TEST SECTION ===
Sending command: "Execute SMART Short self-test routine immediately in off-line mode".
Drive command "Execute SMART Short self-test routine immediately in off-line mode" successful.
Testing has begun.
Please wait 2 minutes for test to complete.
Test will complete after Sun Feb 15 16:44:42 2015

Use smartctl -X to abort test.
```

`smartctl -a` で `Short self-test routine recommended polling time` に `2`(minutes) と記載されていたとおり、２分ほどかかる。  
（テストを中止したい場合は `smartctl -X /dev/sda` とする）

２分以上したら、以下のようにログを確認してみる。

``` text
# smartctl -l selftest /dev/sda
smartctl 5.41 2011-06-09 r3365 [x86_64-linux-3.2.0-4-amd64] (local build)
Copyright (C) 2002-11 by Bruce Allen, http://smartmontools.sourceforge.net

=== START OF READ SMART DATA SECTION ===
SMART Self-test log structure revision number 1
Num  Test_Description    Status                  Remaining  LifeTime(hours)  LBA_of_first_error
# 1  Short offline       Completed without error       00%     23567         -

```

ちなみに、セルフテスト（ロング）を行うなら `-t long` オプションを使用すればよい。

### 4. 健康状態チェック

各種テスト結果から収集した全体の健康状態を見るには以下のように実行する。

``` text
# smartctl -H /dev/sda
smartctl 5.41 2011-06-09 r3365 [x86_64-linux-3.2.0-4-amd64] (local build)
Copyright (C) 2002-11 by Bruce Allen, http://smartmontools.sourceforge.net

=== START OF READ SMART DATA SECTION ===
SMART overall-health self-assessment test result: PASSED
```

今回の例のように多少のエラーであれば、 `PASSED` となるようだ。

### 5. 参考サイト

* [smartmontools](http://www.smartmontools.org/ "smartmontools")

---

詳しいことはもっと勉強しないといけませんが、ある程度の診断は可能です。

以上。

