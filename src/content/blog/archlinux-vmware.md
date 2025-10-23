---
title: "如何在 VMware 虚拟机上安装 Arch Linux"
description: "完整的 VMware 虚拟机安装 Arch Linux 指南，包含 UEFI 引导配置、cfdisk 磁盘分区、Btrfs 文件系统、GRUB 引导程序、系统本地化等详细步骤。同时补充了故障排查、SSH 配置和常见问题解答。"
pubDate: "Jul 01 2025"
image: "/image/archlinux-vmware.webp"
categories:
  - guide
tags:
  - Arch Linux
  - VMware
---

> 本文整理并补充了 [Thato](https://www.cnblogs.com/Thato/p/18311683)和 [Icekylin](https://arch.icekylin.online/guide/rookie/basic-install)的教程。

Arch Linux 以其简洁、灵活和"滚动更新"的特性深受 Linux 爱好者喜爱。本文将详细介绍如何在 VMware 虚拟机中从零开始安装 Arch Linux，适合想要学习 Linux 系统安装和配置的初学者。

## 为什么选择在虚拟机中安装？

在虚拟机中安装 Arch Linux 有以下优势：

- **安全可靠**：不会影响主系统
- **随时快照**：可以保存安装过程中的任意状态
- **练习环境**：熟悉 Linux 命令和系统配置的绝佳场所

## 准备工作

### 系统要求

- Windows 系统（主机）
- VMware Workstation（虚拟机软件）
- 至少 20GB 可用磁盘空间
- 1-2GB 内存分配给虚拟机

### 下载 Arch Linux 镜像

你可以通过以下方式获取最新的 Arch Linux ISO 镜像：

**官方网站**：

- https://archlinux.org/download/

**国内镜像站**：

- 阿里云：https://mirrors.aliyun.com/archlinux/iso/latest/
- 清华大学：https://mirrors.tuna.tsinghua.edu.cn/archlinux/iso/latest/

下载 `archlinux-YYYY.MM.DD-x86_64.iso` 文件（约 800MB）。

## 第一部分：创建和配置虚拟机

### 1. 创建新虚拟机

1. 打开 VMware，点击"创建新的虚拟机"
2. 选择"典型（推荐）"配置
3. 选择"稍后安装操作系统"
4. 客户机操作系统选择：
   - 类型：**Linux**
   - 版本：**其他 Linux 6.x 内核 64 位**
5. 虚拟机命名（例如：ArchLinux）并选择存储位置
6. 磁盘大小设置为 **20GB**，选择"将虚拟磁盘存储为单个文件"

### 2. 硬件配置

在"自定义硬件"中进行以下设置：

- **内存**：1-2GB（建议至少 1GB）
- **处理器**：1-2 个核心
- **网络适配器**：NAT 模式
- **CD/DVD**：使用 ISO 映像文件，选择下载的 Arch Linux ISO

### 3. 启用 UEFI 引导（关键步骤）

⚠️ **这一步非常重要！**

1. 找到虚拟机文件夹（通常在"我的文档\Virtual Machines"中）
2. 用记事本打开 `.vmx` 文件
3. 在文件末尾添加一行：

   ```
   firmware="efi"
   ```

4. 保存并关闭文件

## 第二部分：开始安装 Arch Linux

### 4. 启动虚拟机并进入安装环境

1. 启动虚拟机
2. 看到引导菜单时，选择第一项：**Arch Linux install medium**
3. 稍等片刻，进入命令行界面

### 5. 初始配置

**禁用 reflector 服务**

reflector 是 Arch Linux 的自动镜像源管理服务，它会自动更新和排序镜像源列表。在安装过程中需要禁用它，避免覆盖我们手动配置的国内镜像源：

```bash
systemctl stop reflector
```

**验证 UEFI 模式**

确认系统以 UEFI 模式启动：

```bash
ls /sys/firmware/efi/efivars
```

如果显示一堆文件，说明 UEFI 引导成功。

**测试网络连接**

```bash
curl www.baidu.com
```

如果能看到 HTML 内容，说明网络连接正常。

**同步系统时间**

```bash
timedatectl set-ntp true
```

### 6. 更换软件源为国内镜像

使用国内镜像源可以大幅提升下载速度：

```bash
vim /etc/pacman.d/mirrorlist
```

**vim 基本操作**：

- 按 `i` 键进入编辑模式
- 按 `Esc` 键退出编辑模式
- 输入 `:wq` 保存并退出
- 输入 `:q!` 不保存退出

在文件最顶部添加以下国内镜像源：

```
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch
Server = https://repo.huaweicloud.com/archlinux/$repo/os/$arch
Server = http://mirror.lzu.edu.cn/archlinux/$repo/os/$arch
```

### 7. 磁盘分区

**查看磁盘信息**

```bash
lsblk
```

你应该能看到一个 20GB 的磁盘，通常命名为 `sda`。

**开始分区**

```bash
cfdisk /dev/sda
```

1. 选择 `gpt` 分区表类型
2. 创建以下三个分区：

| 分区      | 大小     | 类型             | 用途     |
| --------- | -------- | ---------------- | -------- |
| /dev/sda1 | 1.2G     | Linux swap       | 交换分区 |
| /dev/sda2 | 800M     | EFI System       | 引导分区 |
| /dev/sda3 | 剩余空间 | Linux filesystem | 系统分区 |

**操作步骤**：

- 使用方向键选择 `[New]` 创建分区
- 输入分区大小（如 `1.2G`）
- 选择 `[Type]` 设置分区类型
- 创建完所有分区后，选择 `[Write]` 并输入 `yes` 确认
- 选择 `[Quit]` 退出

### 8. 格式化分区

```bash
# 格式化 EFI 引导分区为 FAT32
mkfs.fat -F32 /dev/sda2

# 格式化交换分区
mkswap /dev/sda1

# 格式化系统分区为 Btrfs（现代化的文件系统）
mkfs.btrfs -L arch /dev/sda3
```

### 9. 创建 Btrfs 子卷

Btrfs 子卷可以提供更灵活的文件系统管理和快照功能：

```bash
# 临时挂载系统分区
mount -t btrfs -o compress=zstd /dev/sda3 /mnt

# 创建子卷
btrfs subvolume create /mnt/@
btrfs subvolume create /mnt/@home

# 卸载
umount /mnt
```

### 10. 挂载分区

按正确的顺序挂载所有分区：

```bash
# 挂载根目录子卷
mount -t btrfs -o subvol=/@,compress=zstd /dev/sda3 /mnt

# 创建并挂载 home 目录
mkdir /mnt/home
mount -t btrfs -o subvol=/@home,compress=zstd /dev/sda3 /mnt/home

# 创建并挂载 boot 目录
mkdir -p /mnt/boot
mount /dev/sda2 /mnt/boot

# 启用交换分区
swapon /dev/sda1
```

**验证挂载是否成功**：

```bash
df -h    # 查看文件系统挂载
free -h  # 查看交换分区状态
```

### 11. 安装基本系统

这一步会下载并安装核心系统组件，需要一些时间：

```bash
# 安装基础系统
pacstrap /mnt base base-devel linux linux-firmware btrfs-progs

# 安装常用工具
pacstrap /mnt networkmanager vim sudo zsh zsh-completions
```

**安装内容说明**：

- `base`：基本系统
- `base-devel`：开发工具
- `linux`：Linux 内核
- `linux-firmware`：硬件固件
- `btrfs-progs`：Btrfs 文件系统工具
- `networkmanager`：网络管理器
- `vim`：文本编辑器
- `sudo`：权限提升工具
- `zsh`：更强大的 Shell

### 12. 生成文件系统表

```bash
genfstab -U /mnt > /mnt/etc/fstab
```

检查生成的配置：

```bash
cat /mnt/etc/fstab
```

## 第三部分：系统配置

### 13. 切换到新系统

```bash
arch-chroot /mnt
```

现在你已经进入新安装的 Arch Linux 环境。

### 14. 基本系统设置

**设置主机名**

```bash
vim /etc/hostname
```

写入你想要的主机名，例如：`archlinux`

**配置 hosts 文件**

```bash
vim /etc/hosts
```

添加以下内容（将 `archlinux` 替换为你的主机名）：

```
127.0.0.1   localhost
::1         localhost
127.0.0.1   archlinux.localdomain archlinux
```

**设置时区**

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc
```

### 15. 本地化设置

**编辑 locale 配置**

```bash
vim /etc/locale.gen
```

找到并取消注释（删除行首的 `#`）以下两行：

- `en_US.UTF-8 UTF-8`
- `zh_CN.UTF-8 UTF-8`

**生成 locale**

```bash
locale-gen
echo 'LANG=en_US.UTF-8' > /etc/locale.conf
```

💡 **提示**：这里设置为英文环境，避免终端中文乱码。安装桌面环境后可以改为中文。

### 16. 设置 root 密码

```bash
passwd root
```

输入两次密码（输入时不显示任何字符，这是正常的）。

### 17. 安装微码和引导程序

**安装 CPU 微码**

根据你的 CPU 类型选择：

```bash
# Intel CPU
pacman -S intel-ucode

# AMD CPU
pacman -S amd-ucode
```

**安装 GRUB 引导程序**

```bash
pacman -S grub efibootmgr os-prober
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=ARCH
```

**优化 GRUB 配置**

```bash
vim /etc/default/grub
```

找到并修改这一行：

```
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=5 nowatchdog"
```

生成最终的引导配置：

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

### 18. 完成安装

```bash
# 退出 chroot 环境
exit

# 卸载所有分区
umount -R /mnt

# 重启系统
reboot
```

⚠️ **重启前别忘了**：在 VMware 中断开 ISO 镜像连接（虚拟机 → 可移动设备 → CD/DVD → 断开连接）

## 第四部分：首次启动和基本配置

### 19. 登录系统

重启后：

1. 在 GRUB 菜单中选择 Arch Linux
2. 看到登录提示时，输入用户名：`root`
3. 输入之前设置的密码

### 20. 配置网络

**启动网络管理器**

```bash
systemctl enable --now NetworkManager
```

**测试网络连接**

```bash
curl www.baidu.com
ping -c 4 archlinux.org
```

### 21. 安装系统信息工具（可选）

```bash
pacman -S fastfetch
fastfetch
```

如果看到了漂亮的 Arch Linux Logo 和系统信息，恭喜你，安装成功！🎉

## 进阶配置（可选）

### 创建普通用户

不建议长期使用 root 账户，创建一个普通用户：

```bash
# 创建用户（替换 username 为你的用户名）
useradd -m -G wheel -s /bin/zsh username

# 设置密码
passwd username

# 配置 sudo 权限
visudo
```

在 visudo 编辑器中，找到并取消注释：

```
%wheel ALL=(ALL:ALL) ALL
```

### 启用 SSH 服务（远程连接）

如果你想从 Windows 主机 SSH 连接到虚拟机：

```bash
# 安装 OpenSSH
pacman -S openssh

# 启动并启用 SSH 服务
systemctl enable --now sshd

# 查看虚拟机 IP 地址
ip addr show
```

然后在 Windows 命令行中：

```bash
ssh username@虚拟机IP地址
```

如果遇到 SSH 密钥警告，清除旧记录：

```powershell
ssh-keygen -R 虚拟机IP地址
```

## 常见问题解决

### Q1: 启动时看不到 UEFI 选项？

**A**: 确保在 `.vmx` 文件中添加了 `firmware="efi"` 并重启虚拟机。

### Q2: 网络连接失败？

**A**: 检查 VMware 网络适配器是否设置为 NAT 模式，确认 NetworkManager 服务已启动。

### Q3: 分区操作出错？

**A**: 使用 `lsblk` 仔细确认磁盘设备名称，确保操作正确的磁盘。

### Q4: GRUB 安装失败？

**A**: 确认 `/boot` 目录正确挂载了 EFI 分区（sda2）。

### Q5: SSH 登录提示 "Permission denied"？

**A**:

- 确认密码输入正确
- 编辑 `/etc/ssh/sshd_config`，设置 `PermitRootLogin yes`
- 重启 SSH 服务：`systemctl restart sshd`

## 下一步建议

安装完成后，你可以：

1. **安装桌面环境**
   - KDE Plasma（功能丰富）
   - GNOME（简洁现代）
   - XFCE（轻量级）
2. **安装常用软件**

   ```bash
   pacman -S firefox git wget htop
   ```

3. **配置 AUR 助手**

   ```bash
   git clone https://aur.archlinux.org/yay.git
   cd yay
   makepkg -si
   ```

4. **学习 Arch Wiki**
   - Arch Wiki 是最好的 Linux 文档资源
   - https://wiki.archlinux.org/

## 总结

通过本教程，你已经完成了：

- ✅ 在 VMware 中创建并配置虚拟机
- ✅ 手动分区并安装 Arch Linux
- ✅ 配置 Btrfs 文件系统和子卷
- ✅ 安装并配置 GRUB 引导程序
- ✅ 完成基本的系统设置

Arch Linux 的安装过程虽然繁琐，但每一步都让你深入理解 Linux 系统的工作原理。这是一个持续学习的过程，不要害怕遇到问题，查阅 Arch Wiki 和社区文档是解决问题的最佳途径。

Happy Hacking! 🐧

---

_最后更新：2025年7月_
