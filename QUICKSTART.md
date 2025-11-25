# 快速开始指南

这个指南将帮助你在5分钟内开始使用文档爬取工具。

## 📋 前置条件

- 安装了 Chrome、Firefox、Edge 或 Safari 浏览器
- 安装了 Tampermonkey 扩展

## 🚀 快速安装

### 步骤1：安装 Tampermonkey

根据你的浏览器选择：

| 浏览器 | 下载链接 |
|--------|----------|
| Chrome/Edge | [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/) |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/) |
| Safari | [App Store](https://apps.apple.com/app/tampermonkey/id1482490089) |
| Opera | [Opera Add-ons](https://addons.opera.com/extensions/details/tampermonkey-beta/) |

### 步骤2：安装脚本

1. 点击浏览器工具栏中的 Tampermonkey 图标
2. 选择 "**管理面板**"
3. 点击 "**+**" 号（创建新脚本）
4. 删除默认内容
5. 复制 `doc-scraper.user.js` 的全部内容并粘贴
6. 按 **Ctrl+S** (Windows/Linux) 或 **Cmd+S** (Mac) 保存

**或者**：直接在浏览器中打开 `doc-scraper.user.js` 文件，Tampermonkey 会自动识别并提示安装。

### 步骤3：验证安装

1. 访问任何网页（如：https://developer.mozilla.org）
2. 在页面右上角应该看到一个控制面板
3. 如果没有看到，点击 Tampermonkey 图标，选择 "打开文档爬取工具"

✅ 安装完成！

---

## 🎯 第一次使用

让我们通过一个简单的例子来学习如何使用这个工具。

### 示例：抓取 MDN JavaScript 文档

#### 1. 打开目标网站

访问：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript

#### 2. 打开控制面板

你会在页面右上角看到 "**文档爬取工具**" 面板。

如果没有看到，点击 Tampermonkey 图标 → 选择 "打开文档爬取工具"

#### 3. 扫描链接

点击面板中的 "**1. 扫描链接**" 按钮

等待几秒钟，你会看到：
```
找到 150 个链接
分类: 8 个

分类列表:
Web: 45 个链接
JavaScript: 67 个链接
Reference: 38 个链接
...
```

#### 4. 配置参数（可选）

- **延迟时间**：建议保持 1000 毫秒（1秒）
- **最大并发**：建议保持 3 个

这些默认设置对大多数网站都很友好。

#### 5. 开始抓取

点击 "**2. 开始抓取**" 按钮

你会看到进度条开始移动：
```
进度: 15 / 150 (失败: 0)
```

**注意**：这可能需要几分钟时间，具体取决于页面数量和网络速度。

#### 6. 导出数据

抓取完成后，三个导出按钮会变为可用状态：

- **导出 JSON**：适合程序处理
- **导出 Markdown**：适合阅读和分享
- **导出 CSV**：适合数据分析

点击你需要的格式，文件会自动下载。

🎉 完成！你已经成功抓取了你的第一个文档！

---

## 📊 查看抓取结果

### JSON 格式

打开下载的 JSON 文件，你会看到类似这样的结构：

```json
{
  "links": [
    {
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide",
      "text": "JavaScript 指南",
      "category": "docs",
      "path": "/zh-CN/docs/Web/JavaScript/Guide"
    }
  ],
  "categories": {
    "docs": [...]
  },
  "contents": [
    {
      "url": "...",
      "content": {
        "title": "JavaScript 指南",
        "text": "...",
        "headings": [...],
        "codeBlocks": [...],
        "tables": [...]
      }
    }
  ]
}
```

### Markdown 格式

打开 Markdown 文件，你会看到格式良好的文档：

```markdown
# 文档抓取结果

**基础URL:** https://developer.mozilla.org
**抓取时间:** 2024-01-01T00:00:00.000Z
**总链接数:** 150

## 分类目录

### JavaScript
- [介绍](https://...)
- [语法](https://...)
...

## 页面内容

### JavaScript 指南
...
```

### CSV 格式

在 Excel 或 Google Sheets 中打开，可以进行数据分析：

| URL | 分类 | 链接文本 | 标题 | 内容长度 | 代码块数 |
|-----|------|----------|------|----------|----------|
| ... | docs | JavaScript 指南 | ... | 5230 | 15 |

---

## 🎓 常见场景

### 场景1：只抓取当前页

如果你只想快速抓取当前页面：

1. 打开控制面板
2. 点击 "**抓取当前页**"
3. 点击 "**导出 JSON**"

**用时**：< 1秒

### 场景2：只抓取 API 文档

1. 扫描链接
2. 打开浏览器控制台（F12）
3. 运行以下代码：

```javascript
// 过滤出API分类
const apiLinks = scrapedData.categories['api'] || [];
console.log(`找到 ${apiLinks.length} 个API页面`);

// 只抓取API
await scrapeAllPages(apiLinks);

// 导出
exportToJSON();
```

### 场景3：定时更新文档

适合经常更新的文档：

1. 第一次完整抓取并保存
2. 下次访问时，运行增量更新脚本（参见 examples.md）
3. 只抓取新增或更新的页面

---

## ⚙️ 常用配置

### 对于大型文档站点

```javascript
// 在控制面板中设置：
延迟(毫秒): 2000
最大并发: 2
```

这样可以减少服务器压力，避免被限流。

### 对于小型文档站点

```javascript
// 在控制面板中设置：
延迟(毫秒): 500
最大并发: 5
```

这样可以更快完成抓取。

### 针对特定网站

如果默认配置不工作，打开 `config.example.js` 查看预设配置：

- MDN Web Docs
- React 文档
- Vue.js 文档
- GitBook
- Docusaurus

---

## 🐛 常见问题

### 问题1：没有找到任何链接

**可能原因**：
- 网站使用了特殊的导航结构
- 链接是动态加载的

**解决方法**：
1. 打开浏览器开发者工具（F12）
2. 找到左侧导航的CSS选择器
3. 修改脚本的 `leftNavSelectors` 配置

### 问题2：内容提取不完整

**可能原因**：
- 内容区域使用了特殊的HTML结构

**解决方法**：
1. 找到主内容区域的CSS选择器
2. 修改脚本的 `contentSelectors` 配置

### 问题3：抓取速度很慢

**可能原因**：
- 延迟设置太高
- 并发设置太低

**解决方法**：
1. 减少延迟时间（但不要低于 300ms）
2. 增加并发数（但不要超过 5）

### 问题4：部分页面抓取失败

**可能原因**：
- 网络波动
- 服务器限流
- 页面需要登录

**解决方法**：
1. 检查网络连接
2. 增加延迟时间
3. 如果需要登录，先登录再抓取

---

## 📚 下一步

现在你已经掌握了基础用法，可以：

1. 阅读 [README.md](README.md) 了解完整功能
2. 查看 [examples.md](examples.md) 学习高级用法
3. 参考 [config.example.js](config.example.js) 自定义配置
4. 查看 [CHANGELOG.md](CHANGELOG.md) 了解版本历史

---

## 💡 实用技巧

### 技巧1：批量导出

抓取完成后，一次性导出所有格式：

```javascript
// 在控制台运行：
exportToJSON();
setTimeout(() => exportToMarkdown(), 500);
setTimeout(() => exportToCSV(), 1000);
```

### 技巧2：保存配置

如果你经常访问同一个文档站点：

1. 打开脚本编辑器
2. 找到 `config` 对象
3. 添加针对该网站的配置
4. 保存脚本

### 技巧3：使用键盘快捷键

虽然脚本本身不提供快捷键，但你可以：

1. 使用浏览器的书签功能
2. 创建包含以下代码的书签：

```javascript
javascript:(function(){
  const panel = document.getElementById('doc-scraper-panel');
  if(panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
})();
```

点击书签可以快速显示/隐藏面板。

---

## 🤝 获取帮助

如果遇到问题：

1. 查看 [README.md](README.md) 的故障排除部分
2. 查看 [examples.md](examples.md) 寻找类似的使用场景
3. 在 GitHub Issues 中搜索是否有人遇到过相同问题
4. 提交新的 Issue 描述你的问题

---

## ⚠️ 重要提示

1. **遵守法律法规**：确保你有权抓取目标网站的内容
2. **尊重 robots.txt**：检查网站的爬虫规则
3. **合理使用**：不要给服务器造成过大压力
4. **数据隐私**：不要抓取或分享敏感信息
5. **版权意识**：注意内容的版权和使用限制

---

## 🎉 开始探索

现在你已经准备好了！选择一个你喜欢的文档网站，开始探索吧！

推荐的练习网站：
- [MDN Web Docs](https://developer.mozilla.org)
- [React 文档](https://react.dev)
- [Vue.js 文档](https://cn.vuejs.org)
- [Node.js 文档](https://nodejs.org/docs)

祝你使用愉快！🚀
