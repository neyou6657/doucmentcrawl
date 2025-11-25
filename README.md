# 文档爬取油猴脚本

这是一个功能强大的Tampermonkey（油猴）脚本，用于自动爬取网页开发者文档，支持左侧链接扫描、自动分类和基于XPath的内容提取。

## 功能特性

### 🎯 可视化元素选择器 **[NEW]**
- **像开发者工具一样选择元素**：鼠标悬停时实时高亮
- **智能选择器生成**：自动生成最优的 CSS 选择器
- **即时反馈**：显示将匹配的链接数量
- **简单易用**：无需了解 CSS 选择器语法
- **快捷操作**：支持 ESC 键取消

### 🔍 智能链接扫描
- 自动识别左侧导航栏的所有链接
- 支持多种常见的导航栏选择器
- 支持用户手动选择链接区域
- 自动去重和标准化URL
- 智能分类链接（基于URL路径）

### 📊 自动分类
- 根据URL路径自动分类文档
- 支持多级分类结构
- 显示每个分类的链接数量
- 可视化分类树状图

### 🎯 内容提取
- **基于XPath**：支持自定义XPath表达式提取内容
- **智能识别**：自动查找主内容区域
- **多元素提取**：
  - 页面标题和所有子标题（h1-h6）
  - 代码块（包括语言识别）
  - 表格数据
  - 纯文本和HTML内容
  - 自定义XPath查询结果

### 💾 多格式导出
- **JSON格式**：完整的结构化数据
- **Markdown格式**：可读性强的文档格式
- **CSV格式**：适合数据分析

### ⚙️ 高级特性
- 可配置的请求延迟（避免服务器压力）
- 并发控制（提高抓取效率）
- 实时进度显示
- 错误处理和重试机制

## 安装方法

### 1. 安装Tampermonkey

首先需要在浏览器中安装Tampermonkey扩展：

- **Chrome/Edge**: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- **Safari**: [App Store](https://apps.apple.com/app/tampermonkey/id1482490089)
- **Opera**: [Opera Add-ons](https://addons.opera.com/extensions/details/tampermonkey-beta/)

### 2. 安装脚本

1. 点击Tampermonkey图标
2. 选择"管理面板"
3. 点击"+"号创建新脚本
4. 将 `doc-scraper.user.js` 的内容复制粘贴进去
5. 按 `Ctrl+S` (或 `Cmd+S`) 保存

或者直接打开 `doc-scraper.user.js` 文件，Tampermonkey会自动识别并提示安装。

## 使用指南

### 基本使用流程

#### 方式一：使用可视化元素选择器（推荐） 🆕

1. **打开目标文档网站**
   - 访问你想要爬取的开发者文档网站
   - 等待页面完全加载

2. **打开控制面板**
   - 页面右上角会自动出现"文档爬取工具"面板
   - 或点击Tampermonkey图标，选择"打开文档爬取工具"

3. **选择链接区域**
   - 点击 **🎯 选择链接区域** 按钮
   - 鼠标悬停在页面元素上会看到橙色高亮
   - 点击包含导航链接的区域（如侧边栏）
   - 看到确认提示，显示找到的链接数量

4. **选择内容区域**
   - 点击 **🎯 选择内容区域** 按钮
   - 点击包含文档内容的区域（如主内容区）
   - 看到确认提示

5. **扫描链接**
   - 点击"1. 扫描链接"按钮
   - 脚本会使用你选择的区域来查找链接
   - 显示找到的链接数量和分类信息

6. **配置参数**（可选）
   - **延迟时间**：两次请求之间的间隔（毫秒），默认1000ms
   - **最大并发**：同时进行的请求数量，默认3个

#### 方式二：使用自动识别

如果不手动选择区域，脚本会自动尝试识别常见的导航栏和内容区域。

1. **打开目标文档网站**
2. **打开控制面板**
3. **直接点击"1. 扫描链接"**
4. **配置参数**（可选）

7. **开始抓取**
   - 点击"2. 开始抓取"按钮
   - 观察进度条和状态信息
   - 等待抓取完成

8. **导出数据**
   - 选择导出格式：JSON、Markdown或CSV
   - 点击对应的导出按钮
   - 文件会自动下载到本地

### 快速模式：抓取当前页

如果只想抓取当前页面的内容：

1. 打开控制面板
2. 点击"抓取当前页"按钮
3. 立即导出结果

## 配置说明

### 元素选择器使用技巧

#### 视觉反馈说明

选择模式下你会看到：
- **橙色高亮边框** - 当前鼠标悬停的元素
- **黑色提示框** - 显示元素信息和生成的选择器
- **屏幕中央提示** - 说明当前正在选择什么（3秒后消失）
- **十字光标** - 表示处于选择模式

#### 最佳实践

✅ **推荐做法：**
- 选择包含多个链接的容器（如侧边栏、导航栏）
- 选择有明确语义的元素（nav、aside、main、article）
- 查看提示框显示的链接数量以验证选择

❌ **避免：**
- 选择单个链接或太小的元素
- 选择动态变化的元素（如广告、弹窗）
- 选择没有链接的区域

💡 **提示：**
- 如果选错了，按 ESC 键取消重新选择
- 选择器会自动添加 ` a` 来匹配链接
- 可以多次选择，新的会覆盖旧的

📖 **详细指南：** 查看 [ELEMENT_PICKER_GUIDE.md](./ELEMENT_PICKER_GUIDE.md) 了解更多

### 自定义选择器（高级）

如果需要手动配置，在脚本开头的 `config` 对象中可以自定义：

```javascript
const config = {
    // 左侧导航选择器
    leftNavSelectors: [
        'nav a',
        '.sidebar a',
        '.menu a',
        // 添加更多...
    ],
    
    // 内容区域选择器
    contentSelectors: [
        'main',
        '.content',
        'article',
        // 添加更多...
    ],
    
    // XPath表达式
    contentXPaths: [
        '//main',
        '//article',
        '//*[@class="content"]',
        // 添加更多...
    ],
    
    // 手动选择的选择器（通过元素选择器生成）
    customLinkSelector: null,      // 例如: '.sidebar a'
    customContentSelector: null    // 例如: '.main-content'
};
```

### 针对特定网站优化

如果脚本在某个网站上效果不佳，可以：

1. 打开浏览器开发者工具（F12）
2. 检查该网站的导航栏和内容区域的HTML结构
3. 找到对应的选择器或XPath
4. 修改脚本中的 `config` 对象

## 导出数据格式

### JSON格式

```json
{
  "links": [
    {
      "url": "https://example.com/doc/intro",
      "text": "介绍",
      "category": "doc",
      "path": "/doc/intro",
      "depth": 2
    }
  ],
  "categories": {
    "doc": [...]
  },
  "contents": [
    {
      "url": "...",
      "category": "...",
      "content": {
        "title": "...",
        "html": "...",
        "text": "...",
        "headings": [...],
        "codeBlocks": [...],
        "tables": [...],
        "xpathResults": {...}
      }
    }
  ]
}
```

### Markdown格式

生成一个结构化的Markdown文档，包含：
- 分类目录
- 每个页面的标题结构
- 代码示例
- 易于阅读和分享

### CSV格式

表格数据，包含以下列：
- URL
- 分类
- 链接文本
- 标题
- 内容长度
- 代码块数
- 标题数

## 适用场景

### 📚 适合爬取的网站类型

- **API文档**：如 MDN、Node.js 文档
- **框架文档**：如 React、Vue、Angular 文档
- **技术教程**：如各种开发者教程网站
- **知识库**：如 GitBook、Docusaurus 生成的文档

### ⚠️ 注意事项

1. **遵守网站条款**：确保爬取行为符合目标网站的使用条款
2. **合理设置延迟**：避免对服务器造成过大压力
3. **数据隐私**：不要爬取包含敏感信息的页面
4. **版权问题**：注意内容的版权和使用限制

## 高级用法

### XPath示例

在脚本中，你可以使用强大的XPath表达式：

```javascript
// 获取所有API接口
'//*[@class="api-method"]'

// 获取所有示例代码
'//pre[@class="example"]'

// 获取特定级别的标题
'//h2[contains(@class, "section-title")]'

// 获取表格数据
'//table[@class="params"]'
```

### 自动化批量爬取

```javascript
// 在控制台中运行
(async function() {
    // 扫描链接
    extractAndCategorizeLinks();
    
    // 等待1秒
    await new Promise(r => setTimeout(r, 1000));
    
    // 开始抓取
    await scrapeAllPages(scrapedData.links);
    
    // 导出JSON
    exportToJSON();
})();
```

### 过滤特定分类

修改脚本，只抓取特定分类的链接：

```javascript
// 在 scrape-all 按钮事件中
const filteredLinks = scrapedData.links.filter(
    link => link.category === 'api' || link.category === 'guide'
);
await scrapeAllPages(filteredLinks);
```

## 故障排除

### 问题1：找不到左侧导航

**解决方法**：
1. 打开开发者工具（F12）
2. 找到导航栏的选择器
3. 在脚本中添加到 `leftNavSelectors` 数组

### 问题2：内容提取不完整

**解决方法**：
1. 检查 `contentSelectors` 和 `contentXPaths`
2. 使用更精确的XPath表达式
3. 在开发者工具中测试：`$x('//your/xpath')`

### 问题3：抓取速度太慢

**解决方法**：
1. 减少延迟时间（但不要太低）
2. 增加最大并发数（建议不超过5）
3. 只抓取需要的分类

### 问题4：某些页面抓取失败

**解决方法**：
1. 检查浏览器控制台的错误信息
2. 可能是跨域问题，检查 `@connect` 权限
3. 某些页面可能需要登录

## 技术细节

### 依赖项

- **JSZip**：用于可能的批量打包功能
- **GM API**：
  - `GM_xmlhttpRequest`：跨域请求
  - `GM_download`：文件下载
  - `GM_setClipboard`：复制到剪贴板
  - `GM_registerMenuCommand`：注册菜单

### 核心算法

1. **链接发现**：遍历多个选择器，找到导航栏
2. **URL标准化**：使用 `URL` API 标准化所有链接
3. **自动分类**：基于URL路径的第一级进行分类
4. **并发控制**：使用队列和Promise.race实现并发限制
5. **内容提取**：DOMParser解析HTML，结合CSS选择器和XPath

### 性能优化

- 使用Map去重，避免重复抓取
- 并发请求提高效率
- 延迟请求避免服务器限流
- 增量更新UI，避免阻塞

## 更新日志

### v1.0.0 (2024)
- ✨ 初始版本发布
- 🔍 智能链接扫描和分类
- 🎯 基于XPath的内容提取
- 💾 支持JSON、Markdown、CSV导出
- ⚙️ 可配置的并发控制
- 📊 实时进度显示

## 贡献

欢迎提交问题和改进建议！

## 许可证

MIT License

## 免责声明

此工具仅供学习和研究使用。使用者需自行承担使用本工具的法律责任，确保遵守目标网站的服务条款和相关法律法规。作者不对任何滥用行为负责。
