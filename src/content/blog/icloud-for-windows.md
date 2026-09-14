---
title: "修复 iCloud for Windows 密码和 iCloud Drive 无法正常使用的问题"
description: "针对 iCloud for Windows 15.9.60.0 在 Windows 11 上出现 iCloud Passwords 和 iCloud Drive 无法正常使用的问题，详细介绍如何通过 PowerShell 检查并手动启动 iCloudCKKS、修复 Chrome Native Messaging 注册以及使用 iCloudDrive-AppX.exe enable 强制启用 iCloud Drive。"
pubDate: "Sep 14 2026"
image: "/image/icloud-for-windows.webp"
categories:
  - guide
tags:
  - Windows
  - iCloud
---

> 本文部分参考了 [bad-razor](https://www.reddit.com/r/iCloud/comments/1v6xaf5/fix_icloud_passwords_chrome_extension_stuck/)的解决方案。

如果你在 Windows 11 上使用 iCloud for Windows，却遇到了下面这些问题：

* iCloud Passwords 无法同步密码
* iCloud Passwords 应用打开后完全空白
* iCloud Drive 无法启用
* 卸载重装 iCloud for Windows 后仍出现问题

那么问题不一定是 iCloud 账号、网络或者安装包损坏。

在 iCloud for Windows 15.9.60.0 中，很多功能实际上由**独立的后台组件**负责。如果某个组件没有正常启动，iCloud 主程序本身仍然可能显示为正常状态，但对应功能已经无法工作。

本文记录一套针对这些问题的 PowerShell 排查和修复方法。

## 问题的根本原因

新版 iCloud for Windows 使用 Microsoft Store / AppX 架构，不再是传统意义上的“一个程序 + 一个 Windows 服务”。

安装完成后，iCloud 会包含多个相互独立的组件，例如：

```text
iCloudHome
iCloudServices
iCloudCKKS
iCloudPasswords
iCloudDrive
iCloudChrome
iCloudPasswordsExtensionHelper
```

其中比较关键的是：

```text
iCloudCKKS.exe
    ↓
iCloud Passwords / Keychain

iCloudPasswordsExtensionHelper.exe
    ↓
Chrome / Edge Native Messaging
    ↓
iCloud Passwords 扩展

iCloudDrive-AppX.exe enable
    ↓
iCloudDrive.exe
    ↓
iCloud Drive
```

因此：

> **Get-AppxPackage 显示 iCloud 的 Status = Ok，并不能证明 iCloud 的所有功能都正常。**

最典型的情况就是 iCloudCKKS 没有运行。

此时：

```text
iCloud for Windows：正常
AppX：正常
iCloud Passwords：空白
```

看起来非常矛盾，但实际上只是负责密码同步的后台组件没有启动。

## 准备工作

在开始之前，建议确认：

* Windows 11 已正常安装 iCloud for Windows
* iCloud for Windows 版本为 15.x
* 已经登录 Apple 账户
* iCloud 同步已在手机端 iCloud 设置中开启
* 如果使用 Chrome，请确认 iCloud Passwords 扩展已经安装

## 一、修复 iCloud Passwords 空白

### 步骤 1：确认 iCloud 安装正常

打开 PowerShell，执行：

```powershell
Get-AppxPackage -Name AppleInc.iCloud |
Select-Object Name, Version, Status, InstallLocation
```

正常情况下应该看到类似：

```text
Name            : AppleInc.iCloud
Version         : 15.9.60.0
Status          : Ok
InstallLocation : C:\Program Files\WindowsApps\AppleInc.iCloud_15.9.60.0_x64__nzyj5cx40ttqa
```

如果 `Status` 是 `Ok`，说明 iCloud 的 AppX 安装本身没有明显问题。

### 步骤 2：检查 iCloudCKKS 是否正在运行

执行：

```powershell
Get-Process iCloudCKKS -ErrorAction SilentlyContinue |
Select-Object ProcessName, Id, StartTime, Path
```

如果没有任何输出，说明负责 iCloud Keychain / Passwords 的 `iCloudCKKS.exe` 没有运行。

这就是 iCloud Passwords 空白时非常值得优先检查的项目。

### 步骤 3：手动启动 iCloudCKKS

找到 iCloud 安装目录：

```powershell
$pkg = Get-AppxPackage -Name AppleInc.iCloud |
    Where-Object { $_.Status -eq "Ok" } |
    Select-Object -First 1

$CKKS = Join-Path $pkg.InstallLocation "iCloud\iCloudCKKS.exe"

Test-Path $CKKS
```

如果返回：

```text
True
```

直接启动：

```powershell
Start-Process $CKKS
```

等待几秒，然后检查：

```powershell
Start-Sleep -Seconds 5

Get-Process iCloudCKKS -ErrorAction SilentlyContinue |
Select-Object ProcessName, Id, StartTime, Path
```

如果能够看到：

```text
ProcessName : iCloudCKKS
Id          : xxxx
StartTime   : ...
Path        : ...\iCloudCKKS.exe
```

说明组件已经成功启动。

此时重新打开 **iCloud Passwords**，密码数据通常就会恢复显示。

## 二、修复 Chrome iCloud Passwords 无法同步

如果 Windows 上的 iCloud Passwords 已经正常，但 Chrome 仍然无法启用扩展，问题很可能出在 **Native Messaging**。

Chrome 扩展并不是直接调用 iCloud，而是通过：

```text
Chrome Extension
        ↓
Native Messaging
        ↓
com.apple.passwordmanager
        ↓
iCloudPasswordsExtensionHelper.exe
        ↓
iCloud Passwords
```

其中任何一个环节出现问题，Chrome 就可能表现为：

```text
扩展无法启用
↓
不断要求 6 位验证码
↓
验证成功
↓
再次要求验证码
```

### 步骤 1：检查 Helper

执行：

```powershell
$helper = "$env:LOCALAPPDATA\Microsoft\WindowsApps\iCloudPasswordsExtensionHelper.exe"

Test-Path $helper
```

正常情况下应该返回：

```text
True
```

### 步骤 2：创建新的 Native Messaging Manifest

为了避免直接修改 `WindowsApps` 目录中的 iCloud 文件，可以在用户目录创建一个独立的 manifest。

执行：

```powershell
$fixDir = "$env:LOCALAPPDATA\iCloudChromeFix"
$manifest = Join-Path $fixDir "ChromePwdMgrHostApp_manifest.json"

New-Item -ItemType Directory -Path $fixDir -Force | Out-Null
```

然后创建 manifest：

```powershell
$manifestContent = @{
    name            = "com.apple.passwordmanager"
    description     = "Apple iCloud Chrome/Edge Password Manager Host App"
    path            = "$env:LOCALAPPDATA\Microsoft\WindowsApps\iCloudPasswordsExtensionHelper.exe"
    type            = "stdio"
    allowed_origins = @(
        "chrome-extension://pejdijmoenmkgeppbflobdenhhabjlaj/",
        "chrome-extension://mfbcdcnpokpoajjciilocoachedjkima/"
    )
} | ConvertTo-Json -Depth 3

$manifestContent | Set-Content -Path $manifest -Encoding UTF8
```

其中：

```text
pejdijmoenmkgeppbflobdenhhabjlaj
```

是 Chrome 的 iCloud Passwords 扩展 ID。

而：

```text
mfbcdcnpokpoajjciilocoachedjkima
```

是 Edge 对应的扩展 ID。

因此这个 manifest 同时兼容 Chrome 和 Edge。

### 步骤 3：修复 Chrome Native Messaging 注册表

执行：

```powershell
$regPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.apple.passwordmanager"

New-Item -Path $regPath -Force | Out-Null

Set-ItemProperty `
    -Path $regPath `
    -Name "(Default)" `
    -Value $manifest
```

检查：

```powershell
Get-ItemProperty $regPath
```

应该可以看到：

```text
(Default) : C:\Users\...\AppData\Local\iCloudChromeFix\ChromePwdMgrHostApp_manifest.json
```

### 步骤 4：彻底重启 Chrome

不要只关闭当前窗口。

执行：

```powershell
Get-Process chrome -ErrorAction SilentlyContinue |
    Stop-Process -Force
```

然后重新打开 Chrome。

进入扩展管理页面，重新启用 iCloud Passwords。

如果 Native Messaging 注册正常，扩展应该可以正常连接到：

```text
iCloudPasswordsExtensionHelper.exe
```

而不再陷入反复输入 6 位验证码的循环。

## 三、修复 iCloud Drive 无法启用

iCloud Drive 的问题稍微特殊。

安装目录中存在：

```text
iCloudDrive.exe
```

但直接运行它并不能强制开启 iCloud Drive。

例如：

```powershell
$Drive = "C:\Program Files\WindowsApps\AppleInc.iCloud_15.9.60.0_x64__nzyj5cx40ttqa\iCloud\iCloudDrive.exe"

Start-Process $Drive
```

如果进程启动后马上消失，不一定意味着程序崩溃。

iCloud Drive 在未启用状态下可能直接退出，并记录：

```text
iCloudDrive not enabled. Exiting.
```

这时候应该使用 AppX 提供的启动别名，并传入：

```text
enable
```

### 步骤 1：确认 iCloud Drive AppX Alias

执行：

```powershell
$Alias = "$env:LOCALAPPDATA\Microsoft\WindowsApps\iCloudDrive-AppX.exe"

Test-Path $Alias
```

如果返回：

```text
True
```

说明启用入口存在。

### 步骤 2：强制执行 Enable

直接执行：

```powershell
Start-Process $Alias -ArgumentList "enable"
```

也可以使用下面的版本查看返回状态：

```powershell
$Alias = "$env:LOCALAPPDATA\Microsoft\WindowsApps\iCloudDrive-AppX.exe"

$p = Start-Process $Alias -ArgumentList "enable" -PassThru

Start-Sleep -Seconds 5

$p.ExitCode
```

如果返回：

```text
0
```

说明启用命令已经成功执行。

### 步骤 3：确认 iCloudDrive 正在运行

执行：

```powershell
Get-Process iCloudDrive -ErrorAction SilentlyContinue |
Select-Object ProcessName, Id, StartTime, Path
```

如果看到：

```text
ProcessName : iCloudDrive
Id          : xxxx
StartTime   : ...
Path        : ...\iCloudDrive.exe
```

说明 iCloud Drive 已经启动。

此时可以重新打开 iCloud 设置确认 iCloud Drive 状态。

## 常见问题

### Q：为什么重启 Windows 后问题又出现？

A：如果手动启动 `iCloudCKKS.exe` 后功能恢复，而重启后再次失效，说明问题很可能位于**组件启动链**，而不是密码数据库本身。

可以尝试创建 iCloudCKKS 自动启动任务解决此问题。

### Q：iCloudDrive.exe 为什么启动一下就消失？

A：这不一定是崩溃。

如果日志显示：

```text
iCloudDrive not enabled. Exiting.
```

说明它认为 iCloud Drive 尚未启用。

此时应该通过：

```powershell
iCloudDrive-AppX.exe enable
```

执行启用流程，而不是单独运行 `iCloudDrive.exe`。

## 七、结论

iCloud for Windows 出现“功能无法同步”时，最容易犯的错误就是直接：

```text
卸载 iCloud
↓
重启
↓
重新安装
↓
重新登录
↓
发现问题还在
```

实际上，Store/AppX 版本的 iCloud 是由多个组件组成的。

因此更合理的排查方式是：

```text
iCloud 安装状态
        ↓
检查具体功能对应的进程
        ↓
检查 AppX Alias
        ↓
检查 Native Messaging
        ↓
手动启动缺失组件
        ↓
验证功能
```

对于本文遇到的三个核心问题：

```text
iCloud Passwords 空白
→ 启动 iCloudCKKS.exe

Chrome Passwords 无法同步
→ 修复 Native Messaging Manifest

iCloud Drive 无法启用
→ 执行 iCloudDrive-AppX.exe enable
```

也就是说，**“iCloud 已经安装好了”并不等于“iCloud 的所有功能组件都已经正常工作”。**

当 GUI 没有给出有用的错误信息时，PowerShell 和组件级检查反而是定位这类问题最快的方法。

---

*最后更新：2026年9月*
