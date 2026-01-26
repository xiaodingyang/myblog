# 修复 Command Line Tools 过旧问题

## 问题描述
安装 MongoDB 时出现错误：
```
Error: Your Command Line Tools are too outdated.
Update them from Software Update in System Settings.
```

## 解决方法

### 方法一：通过系统设置更新（最简单）

1. 点击苹果菜单 → **系统设置**（System Settings）
2. 进入 **通用**（General）→ **软件更新**（Software Update）
3. 检查是否有可用的 Command Line Tools 更新
4. 如果有，点击 **立即更新** 或 **现在更新**

### 方法二：重新安装 Command Line Tools

如果系统设置中没有更新，可以重新安装：

#### 步骤 1：删除旧的 Command Line Tools
```bash
sudo rm -rf /Library/Developer/CommandLineTools
```

#### 步骤 2：重新安装
```bash
sudo xcode-select --install
```

这会弹出一个对话框，点击 **安装** 即可。

### 方法三：手动下载安装

如果上述方法都不行，可以手动下载：

1. 访问：https://developer.apple.com/download/all/
2. 搜索并下载 **Command Line Tools for Xcode 26.0**（或最新版本）
3. 下载完成后双击 `.dmg` 文件安装

## 验证安装

安装完成后，验证 Command Line Tools 是否更新成功：

```bash
# 检查版本
xcode-select --version

# 检查路径
xcode-select -p

# 验证工具
gcc --version
```

## 继续安装 MongoDB

Command Line Tools 更新完成后，继续安装 MongoDB：

```bash
brew tap mongodb/brew
brew install mongodb-community
```

## 注意事项

- 重新安装 Command Line Tools 可能需要几分钟时间
- 如果提示需要管理员密码，请输入你的 Mac 密码
- 安装过程中不要关闭终端窗口
