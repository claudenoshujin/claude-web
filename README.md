# Claude Web 2.0（扩展形态）

## 安装

**先把酒馆助手里的 Claude 2.0 脚本停用**，两个形态同时开会互相顶掉。

### 方式一：按地址装（推荐，能吃到一键更新）

酒馆「扩展」面板 → Install extension → 填：

```
https://github.com/claudenoshujin/claude-web
```

装完的文件夹名等于仓库名，所以这个仓库必须叫 `claude-web`。
以后有更新，在扩展面板点一下 Update 就行（manifest 里 `auto_update` 已开）。

### 方式二：手动放文件

把这个目录整个放进
`SillyTavern/public/scripts/extensions/third-party/claude-web/`，刷新页面。

> 按地址装要求 `manifest.json` 在**仓库根目录**——酒馆是 clone 整个仓库
> 然后在根目录找 manifest（1.18 的 `src/endpoints/extensions.js`）。
> 所以这个仓库的根就是扩展本体，不要再套一层文件夹。

## 切换日夜 / 布局

酒馆「扩展」面板里找 **Claude Web**：

- **主题**：日间 / 夜间 —— 改完当场生效，不用刷新
- **布局**：自动 / 桌面 / 手机 —— 需要刷新，面板会给一个「刷新生效」按钮

「自动」按 700px 断点判断。布局之所以要刷新，是因为一堆布局逻辑在启动时
读一次 `CLAUDE_FEATURES.mobile` 就分叉了，中途改会留下半新半旧的状态。

## 这个仓库是构建产物，不要手改

源码在开发仓库 `Claude-Clawd-酒馆助手` 的 `src/` 下。改完这样重新出包：

```powershell
cd "E:\Crab Pot\酒馆\Claude-Clawd-酒馆助手"
$env:CLAUDE_EXTENSION_FLAT="1"
$env:CLAUDE_EXTENSION_OUTPUT_DIR="E:\Crab Pot\酒馆\claude-web"
node tools/build-extension.js
node tools/verify-extension.js

cd "E:\Crab Pot\酒馆\claude-web"
git add -A
git commit -m "rebuild"
git push
```

`CLAUDE_EXTENSION_FLAT=1` 表示直接写进仓库根目录（而不是套一层 `claude-web/`），
并且**不会删除 `.git`** —— 构建器只覆盖自己产出的那几个文件。

## 出包前必跑

开发仓库那边：

```bash
node tools/pack.js            # 脚本形态的四个包，迁移期间不能断
node tools/verify-dist.js     # dist 与 src 一致
node tools/verify-extension.js # 扩展的 CSS 与脚本形态逐字节一致
CLAUDE_SMOKE_TEST_TIMEOUT_MS=60000 node tools/smoke-pack.js
```
