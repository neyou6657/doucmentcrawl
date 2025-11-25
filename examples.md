# 使用示例

这个文档提供了一些常见场景下使用文档爬取脚本的具体示例。

## 目录

- [基础示例](#基础示例)
- [特定网站示例](#特定网站示例)
- [高级用法](#高级用法)
- [控制台脚本](#控制台脚本)
- [自定义XPath](#自定义xpath)

---

## 基础示例

### 示例1：快速抓取当前页面

最简单的使用方式，只抓取当前正在浏览的页面：

```javascript
// 1. 打开控制面板
// 2. 点击"抓取当前页"按钮
// 3. 点击"导出 JSON"按钮

// 或者在控制台运行：
const content = extractPageContent();
console.log(content);
```

**适用场景**：
- 快速获取单个页面的内容
- 测试脚本配置
- 提取特定页面的代码示例

---

### 示例2：抓取整个文档站点

扫描并抓取整个文档网站的所有页面：

```javascript
// 1. 打开目标文档网站的首页或目录页
// 2. 打开控制面板
// 3. 点击"1. 扫描链接"
// 4. 检查分类和链接数量
// 5. 点击"2. 开始抓取"
// 6. 等待完成后导出

// 查看结果统计
console.log(`总链接: ${scrapedData.links.length}`);
console.log(`分类: ${Object.keys(scrapedData.categories).length}`);
console.log(`已抓取: ${scrapedData.contents.length}`);
```

**适用场景**：
- 备份整个文档站点
- 离线阅读
- 构建本地搜索索引

---

### 示例3：只抓取特定分类

如果只想抓取某个特定分类的文档：

```javascript
// 先扫描所有链接
extractAndCategorizeLinks();

// 查看所有分类
console.log(Object.keys(scrapedData.categories));

// 只抓取 'api' 分类
const apiLinks = scrapedData.categories['api'];
await scrapeAllPages(apiLinks);

// 导出
exportToJSON();
```

**适用场景**：
- 只需要API文档
- 针对性学习某个主题
- 减少抓取时间和数据量

---

## 特定网站示例

### 示例4：抓取 MDN Web Docs

MDN 是一个常见的开发者文档网站，这里是如何配置：

```javascript
// 修改脚本配置
config.leftNavSelectors = [
    '.sidebar-inner a',
    'nav.sidebar a',
    '.document-toc a'
];

config.contentSelectors = [
    'article.main-page-content',
    'main#content'
];

// 然后正常使用
// 1. 访问 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript
// 2. 扫描链接
// 3. 开始抓取
```

**提取的内容**：
- JavaScript API 文档
- 语法说明
- 代码示例
- 浏览器兼容性表格

---

### 示例5：抓取 React 文档

React 官方文档的配置：

```javascript
config.leftNavSelectors = [
    'nav a',
    '[role="navigation"] a'
];

config.contentSelectors = [
    'article',
    'main'
];

// 访问 https://react.dev
// 特别适合抓取 Hooks 文档和 API Reference
```

**可以提取**：
- Hook 用法
- 组件API
- 示例代码
- 最佳实践

---

### 示例6：抓取 Vue.js 文档

Vue.js 文档的配置：

```javascript
config.leftNavSelectors = [
    '.sidebar-links a',
    '.sidebar a'
];

config.contentSelectors = [
    '.content',
    'main.content'
];

// 访问 https://cn.vuejs.org/guide/
```

**可以提取**：
- Composition API
- Options API
- 组件通信
- 状态管理

---

### 示例7：抓取 GitBook 类型的文档

很多开源项目使用 GitBook 部署文档：

```javascript
config.leftNavSelectors = [
    '.book-summary a',
    'nav.book-summary a'
];

config.contentSelectors = [
    '.page-inner',
    '.book-body .page-wrapper'
];

// 适用于大多数 GitBook 站点
```

---

## 高级用法

### 示例8：并行抓取多个分类

同时抓取多个分类，但分别保存：

```javascript
// 扫描所有链接
extractAndCategorizeLinks();

// 获取想要的分类
const categories = ['api', 'guide', 'tutorial'];

// 分别抓取每个分类
for (const cat of categories) {
    if (scrapedData.categories[cat]) {
        console.log(`开始抓取分类: ${cat}`);
        
        // 创建临时存储
        const tempContents = [];
        scrapedData.contents = tempContents;
        
        // 抓取
        await scrapeAllPages(scrapedData.categories[cat]);
        
        // 导出为独立文件
        const blob = new Blob([JSON.stringify(tempContents, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cat}-${Date.now()}.json`;
        a.click();
        
        // 延迟避免过载
        await new Promise(r => setTimeout(r, 2000));
    }
}
```

**适用场景**：
- 需要分类存储文档
- 便于后续处理和分析
- 按主题组织学习资料

---

### 示例9：提取特定内容元素

只提取代码块和API签名：

```javascript
// 自定义提取函数
function extractCodeOnly(doc = document) {
    const result = {
        url: window.location.href,
        title: doc.title,
        codes: []
    };
    
    // 提取所有代码块
    const codeBlocks = doc.querySelectorAll('pre code, pre');
    codeBlocks.forEach((block, idx) => {
        const code = block.textContent.trim();
        const language = block.className.match(/language-(\w+)/)?.[1] || 'text';
        
        result.codes.push({
            id: idx,
            language: language,
            code: code,
            lines: code.split('\n').length
        });
    });
    
    // 提取API签名
    const apiSignatures = doc.querySelectorAll('.api-signature, .method-signature');
    result.signatures = Array.from(apiSignatures).map(sig => sig.textContent.trim());
    
    return result;
}

// 使用
const codeData = extractCodeOnly();
console.log(`找到 ${codeData.codes.length} 个代码块`);
console.log(`找到 ${codeData.signatures.length} 个API签名`);
```

**适用场景**：
- 构建代码示例库
- 学习API用法
- 代码片段收集

---

### 示例10：增量更新文档

只抓取新增或更新的页面：

```javascript
// 加载之前的抓取结果
const previousData = JSON.parse(localStorage.getItem('doc_scraper_cache') || '{}');

// 扫描当前链接
extractAndCategorizeLinks();

// 过滤出新链接
const newLinks = scrapedData.links.filter(link => {
    return !previousData[link.url] || 
           (Date.now() - previousData[link.url].timestamp > 86400000); // 超过1天
});

console.log(`发现 ${newLinks.length} 个新的或过期的链接`);

// 只抓取新链接
await scrapeAllPages(newLinks);

// 更新缓存
scrapedData.contents.forEach(content => {
    previousData[content.url] = {
        timestamp: Date.now(),
        title: content.content.title
    };
});
localStorage.setItem('doc_scraper_cache', JSON.stringify(previousData));

// 导出
exportToJSON();
```

**适用场景**：
- 定期更新文档
- 节省时间和带宽
- 跟踪文档变化

---

## 控制台脚本

### 示例11：完全自动化脚本

在控制台中运行，完全自动化：

```javascript
(async function autoScrape() {
    console.log('开始自动抓取...');
    
    // 1. 扫描链接
    const links = extractAndCategorizeLinks();
    console.log(`找到 ${links.length} 个链接`);
    
    // 2. 延迟1秒
    await new Promise(r => setTimeout(r, 1000));
    
    // 3. 开始抓取
    console.log('开始批量抓取...');
    await scrapeAllPages(links);
    
    // 4. 导出所有格式
    console.log('导出 JSON...');
    exportToJSON();
    
    await new Promise(r => setTimeout(r, 500));
    
    console.log('导出 Markdown...');
    exportToMarkdown();
    
    await new Promise(r => setTimeout(r, 500));
    
    console.log('导出 CSV...');
    exportToCSV();
    
    console.log('✅ 全部完成！');
})();
```

---

### 示例12：统计分析脚本

分析抓取的内容：

```javascript
function analyzeScrapedData() {
    const stats = {
        totalPages: scrapedData.contents.length,
        totalCodeBlocks: 0,
        totalTables: 0,
        totalHeadings: 0,
        averageContentLength: 0,
        languageDistribution: {},
        categoryStats: {}
    };
    
    scrapedData.contents.forEach(page => {
        const content = page.content;
        
        // 统计代码块
        stats.totalCodeBlocks += content.codeBlocks.length;
        
        // 语言分布
        content.codeBlocks.forEach(cb => {
            stats.languageDistribution[cb.language] = 
                (stats.languageDistribution[cb.language] || 0) + 1;
        });
        
        // 表格和标题
        stats.totalTables += content.tables.length;
        stats.totalHeadings += content.headings.length;
        
        // 内容长度
        stats.averageContentLength += content.text.length;
        
        // 分类统计
        if (!stats.categoryStats[page.category]) {
            stats.categoryStats[page.category] = {
                count: 0,
                totalLength: 0,
                codeBlocks: 0
            };
        }
        stats.categoryStats[page.category].count++;
        stats.categoryStats[page.category].totalLength += content.text.length;
        stats.categoryStats[page.category].codeBlocks += content.codeBlocks.length;
    });
    
    stats.averageContentLength = Math.round(
        stats.averageContentLength / stats.totalPages
    );
    
    // 输出统计信息
    console.log('=== 抓取统计 ===');
    console.log(`总页面数: ${stats.totalPages}`);
    console.log(`总代码块: ${stats.totalCodeBlocks}`);
    console.log(`总表格: ${stats.totalTables}`);
    console.log(`总标题: ${stats.totalHeadings}`);
    console.log(`平均内容长度: ${stats.averageContentLength} 字符`);
    console.log('\n语言分布:');
    console.table(stats.languageDistribution);
    console.log('\n分类统计:');
    console.table(stats.categoryStats);
    
    return stats;
}

// 使用
const stats = analyzeScrapedData();
```

---

## 自定义XPath

### 示例13：提取API参数表格

使用XPath提取特定结构的内容：

```javascript
// 添加自定义XPath
config.contentXPaths.push(
    '//table[contains(@class, "params")]',
    '//div[@class="api-method"]',
    '//section[@class="api-reference"]'
);

// 自定义提取函数
function extractAPIParameters() {
    const apis = [];
    
    // 使用XPath查找所有API方法
    const apiElements = getAllElementsByXPath('//div[@class="api-method"]');
    
    apiElements.forEach(apiEl => {
        const api = {
            name: apiEl.querySelector('.method-name')?.textContent.trim(),
            description: apiEl.querySelector('.description')?.textContent.trim(),
            parameters: []
        };
        
        // 提取参数表格
        const paramTable = apiEl.querySelector('table.params');
        if (paramTable) {
            const rows = paramTable.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    api.parameters.push({
                        name: cells[0].textContent.trim(),
                        type: cells[1].textContent.trim(),
                        description: cells[2].textContent.trim()
                    });
                }
            });
        }
        
        apis.push(api);
    });
    
    return apis;
}

// 使用
const apiData = extractAPIParameters();
console.log(`提取了 ${apiData.length} 个API方法`);
console.log(JSON.stringify(apiData, null, 2));
```

---

### 示例14：提取文档元数据

提取页面的各种元数据：

```javascript
function extractMetadata(doc = document) {
    const metadata = {};
    
    // 基本信息
    metadata.title = doc.title;
    metadata.url = doc.URL;
    metadata.lastModified = doc.lastModified;
    
    // Meta标签
    metadata.meta = {};
    doc.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
            metadata.meta[name] = content;
        }
    });
    
    // 使用XPath提取作者
    const authorEl = getElementByXPath('//meta[@name="author"]/@content');
    if (authorEl) {
        metadata.author = authorEl.nodeValue;
    }
    
    // 提取发布日期
    const dateEls = getAllElementsByXPath(
        '//time[@datetime] | //meta[@property="article:published_time"]/@content'
    );
    if (dateEls.length > 0) {
        metadata.publishedDate = dateEls[0].nodeValue || dateEls[0].getAttribute('datetime');
    }
    
    // 提取标签
    metadata.tags = [];
    const tagEls = getAllElementsByXPath('//a[@rel="tag"] | //meta[@name="keywords"]/@content');
    tagEls.forEach(el => {
        if (el.nodeValue) {
            metadata.tags.push(...el.nodeValue.split(',').map(t => t.trim()));
        } else {
            metadata.tags.push(el.textContent.trim());
        }
    });
    
    return metadata;
}

// 使用
const metadata = extractMetadata();
console.log('页面元数据:', metadata);
```

---

### 示例15：构建文档关系图

分析文档之间的链接关系：

```javascript
function buildDocumentGraph() {
    const graph = {
        nodes: [],
        edges: []
    };
    
    scrapedData.contents.forEach(page => {
        // 添加节点
        graph.nodes.push({
            id: page.url,
            label: page.content.title,
            category: page.category,
            size: page.content.text.length
        });
        
        // 提取页面内的链接
        const parser = new DOMParser();
        const doc = parser.parseFromString(page.content.html, 'text/html');
        const links = doc.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = new URL(link.href, page.url).href;
            // 如果目标也在抓取的页面中，添加边
            if (scrapedData.contents.some(p => p.url === href)) {
                graph.edges.push({
                    source: page.url,
                    target: href,
                    label: link.textContent.trim().substring(0, 30)
                });
            }
        });
    });
    
    console.log(`文档图: ${graph.nodes.length} 个节点, ${graph.edges.length} 条边`);
    
    // 导出为图数据格式
    const blob = new Blob([JSON.stringify(graph, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-graph-${Date.now()}.json`;
    a.click();
    
    return graph;
}

// 使用
const graph = buildDocumentGraph();
// 可以使用 D3.js 或其他图可视化工具来展示这个图
```

---

## 最佳实践

### 性能优化

```javascript
// 1. 合理设置延迟
config.delayBetweenRequests = 1000; // 1秒，对服务器友好

// 2. 控制并发
config.maxConcurrent = 3; // 不要太高

// 3. 只抓取需要的内容
const essentialLinks = scrapedData.links.filter(link => 
    link.category === 'api' || link.category === 'guide'
);

// 4. 使用缓存
const cached = localStorage.getItem('doc_cache');
if (cached) {
    scrapedData = JSON.parse(cached);
}
```

### 错误处理

```javascript
// 在抓取时添加错误处理
async function safeScrapePage(linkInfo) {
    try {
        return await scrapePage(linkInfo);
    } catch (error) {
        console.error(`抓取失败: ${linkInfo.url}`, error);
        // 记录失败的页面
        failedPages.push({
            url: linkInfo.url,
            error: error.message
        });
        return null;
    }
}
```

### 数据验证

```javascript
// 验证抓取的数据
function validateData() {
    const issues = [];
    
    scrapedData.contents.forEach((page, idx) => {
        // 检查内容长度
        if (page.content.text.length < 100) {
            issues.push(`页面 ${idx}: 内容太短 (${page.content.text.length} 字符)`);
        }
        
        // 检查是否有标题
        if (page.content.headings.length === 0) {
            issues.push(`页面 ${idx}: 没有标题`);
        }
        
        // 检查URL
        if (!page.url.startsWith('http')) {
            issues.push(`页面 ${idx}: URL无效 (${page.url})`);
        }
    });
    
    if (issues.length > 0) {
        console.warn('发现以下问题:');
        issues.forEach(issue => console.warn('  -', issue));
    } else {
        console.log('✅ 数据验证通过');
    }
    
    return issues.length === 0;
}
```

---

## 结语

这些示例涵盖了从基础到高级的各种使用场景。根据你的具体需求，可以组合和修改这些示例来实现更复杂的功能。

记住：
1. 始终遵守网站的robots.txt和服务条款
2. 设置合理的延迟，不要给服务器造成压力
3. 测试小规模后再大规模抓取
4. 保存好你的配置以便复用
