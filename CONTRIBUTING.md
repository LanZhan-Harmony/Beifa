# 运行指南

本文档说明如何从《江山北望》原始游戏资源中提取视频，并将其放入本项目后运行调试环境。

## 1. 准备环境

1. 安装 Node.js
   - 下载地址：https://nodejs.org/zh-cn/download

2. 安装 `asar`
   - 打开终端，执行：

   ```Powershell
   npm install -g asar
   ```

3. 使用 Steam 购买并下载游戏
   - 商店地址：https://store.steampowered.com/app/3831120/_/?l=schinese

## 2. 提取资源

1. 进入游戏根目录
   - 示例路径：`C:\Program Files (x86)\Steam\steamapps\common\江山北望`

2. 解压资源包
   - 右键打开终端，执行：

   ```Powershell
   asar extract ./chapter0_neutral.pack ./chapter0
   ```

3. 复制视频文件
   - 进入解压后的 `chapter0/videos` 目录，将其中的视频复制到本项目的 `public/chapters/videos/chapter0` 目录下。
   - 如果 `public/chapters/videos/chapter0` 不存在，请先创建该目录。

4. 对 `chapter1` 到 `chapter7` 重复上述解压与复制流程。

## 3. 运行项目

1. 进入本项目根目录，安装依赖：

   ```Powershell
   npm install
   ```

2. 启动开发环境：

   ```Powershell
   npm run dev
   ```

3. 在浏览器中打开 http://localhost:5173 即可游玩。

## 4. AI 功能使用（可选）

1. 创建 DeepSeek API Key
   - 访问 https://platform.deepseek.com/api_keys 创建一个 API Key。

2. 在本项目 `/src/agents/` 目录下创建 `apikey.txt` 文件，并将 API Key 写入该文件。
