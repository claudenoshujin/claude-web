# Claude Web 2.0

Claude Web 的稳定 2.0 版本，已经整理成可直接安装的 SillyTavern 第三方扩展。

这个仓库只发布 2.0。正在开发的 3.0 不会从这里推送。

## 安装

安装前，先停用酒馆助手里旧的 Claude 2.0 全局脚本。两个版本同时启用会互相覆盖。

1. 打开 SillyTavern 的「扩展」面板。
2. 选择 **Install extension**。
3. 粘贴下面的仓库地址：

```text
https://github.com/claudenoshujin/claude-web
```

4. 安装完成后刷新页面。

## 功能

- 日间 / 夜间主题
- 自动 / 桌面 / 手机布局
- 配色预设和自定义颜色
- 经典版式 / 档案版式
- 扩展面板内检查更新和重新安装

主题可以立即切换。布局在刷新页面后生效。

## 更新

在 SillyTavern 的 Claude Web 扩展设置里选择：

- **检查更新**：正常更新时使用
- **重新安装**：检查更新报 HTTP 500 时使用

部分环境能安装扩展，但没有可供更新接口调用的系统 Git。这时重新安装即可。主题和配色保存在浏览器的 localStorage 中，重新安装不会清除这些设置。

## 手动安装

把仓库内容完整放进：

```text
SillyTavern/public/scripts/extensions/third-party/claude-web/
```

`manifest.json` 必须位于扩展目录根部。

## 版本

当前版本：`2.0.0`
