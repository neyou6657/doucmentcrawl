// ==UserScript==
// @name         开发者文档爬取工具
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  自动爬取网页开发者文档，扫描左侧链接并根据XPath保存内容
// @author       You
// @match        *://*/*
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @connect      *
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// ==/UserScript==

(function() {
    'use strict';

    // 配置对象
    const config = {
        // 左侧导航选择器（可以根据网站调整）
        leftNavSelectors: [
            'nav a',
            '.sidebar a',
            '.menu a',
            '.nav-links a',
            '.toc a',
            '[role="navigation"] a',
            '.navigation a',
            '#sidebar a'
        ],
        // 内容区域选择器
        contentSelectors: [
            'main',
            '.content',
            '.main-content',
            'article',
            '.documentation',
            '[role="main"]',
            '#content'
        ],
        // 要提取的内容XPath
        contentXPaths: [
            '//main',
            '//article',
            '//*[@class="content"]',
            '//*[@class="main-content"]',
            '//*[@role="main"]'
        ],
        // 延迟时间（毫秒）
        delayBetweenRequests: 1000,
        // 最大并发数
        maxConcurrent: 3
    };

    // 数据存储
    const scrapedData = {
        links: [],
        categories: {},
        contents: [],
        baseUrl: window.location.origin,
        startTime: new Date().toISOString()
    };

    // 工具函数：XPath查询
    function getElementByXPath(xpath, context = document) {
        const result = document.evaluate(
            xpath,
            context,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        );
        return result.singleNodeValue;
    }

    function getAllElementsByXPath(xpath, context = document) {
        const result = document.evaluate(
            xpath,
            context,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        const nodes = [];
        for (let i = 0; i < result.snapshotLength; i++) {
            nodes.push(result.snapshotItem(i));
        }
        return nodes;
    }

    // 工具函数：查找左侧导航栏
    function findLeftNavigation() {
        for (const selector of config.leftNavSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 5) { // 假设导航至少有5个链接
                console.log(`找到导航栏使用选择器: ${selector}`);
                return elements;
            }
        }
        return document.querySelectorAll('a'); // 后备方案
    }

    // 工具函数：查找内容区域
    function findContentArea() {
        for (const selector of config.contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`找到内容区域使用选择器: ${selector}`);
                return element;
            }
        }
        
        // 尝试使用XPath
        for (const xpath of config.contentXPaths) {
            const element = getElementByXPath(xpath);
            if (element) {
                console.log(`找到内容区域使用XPath: ${xpath}`);
                return element;
            }
        }
        
        return document.body; // 后备方案
    }

    // 提取和分类链接
    function extractAndCategorizeLinks() {
        const navLinks = findLeftNavigation();
        const linkMap = new Map();
        
        navLinks.forEach(link => {
            const href = link.href;
            const text = link.textContent.trim();
            
            if (!href || href.startsWith('javascript:') || href.startsWith('#')) {
                return;
            }
            
            // 标准化URL
            const url = new URL(href, window.location.href);
            const normalizedUrl = url.href;
            
            if (linkMap.has(normalizedUrl)) {
                return;
            }
            
            // 根据URL路径自动分类
            const pathParts = url.pathname.split('/').filter(p => p);
            const category = pathParts.length > 0 ? pathParts[0] : 'root';
            
            const linkInfo = {
                url: normalizedUrl,
                text: text,
                category: category,
                path: url.pathname,
                depth: pathParts.length,
                parent: link.closest('li, .menu-item, .nav-item'),
                element: link
            };
            
            linkMap.set(normalizedUrl, linkInfo);
            scrapedData.links.push(linkInfo);
            
            // 按类别分组
            if (!scrapedData.categories[category]) {
                scrapedData.categories[category] = [];
            }
            scrapedData.categories[category].push(linkInfo);
        });
        
        console.log(`找到 ${scrapedData.links.length} 个唯一链接`);
        console.log(`分类数量: ${Object.keys(scrapedData.categories).length}`);
        
        return scrapedData.links;
    }

    // 提取页面内容
    function extractPageContent(doc = document) {
        const content = {};
        
        // 获取主内容区域
        const mainContent = findContentArea();
        
        // 提取HTML内容
        content.html = mainContent ? mainContent.innerHTML : '';
        
        // 提取纯文本
        content.text = mainContent ? mainContent.textContent.trim() : '';
        
        // 提取标题
        content.title = doc.title;
        
        // 提取所有标题
        content.headings = [];
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(h => {
            content.headings.push({
                level: parseInt(h.tagName.substring(1)),
                text: h.textContent.trim(),
                id: h.id || ''
            });
        });
        
        // 提取代码块
        content.codeBlocks = [];
        const codeBlocks = doc.querySelectorAll('pre code, pre, code');
        codeBlocks.forEach((block, index) => {
            const codeText = block.textContent.trim();
            if (codeText.length > 10) { // 过滤太短的代码
                content.codeBlocks.push({
                    index: index,
                    language: block.className.match(/language-(\w+)/)?.[1] || 'unknown',
                    code: codeText
                });
            }
        });
        
        // 提取表格
        content.tables = [];
        const tables = doc.querySelectorAll('table');
        tables.forEach((table, index) => {
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
            const rows = Array.from(table.querySelectorAll('tr')).map(tr => {
                return Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
            });
            content.tables.push({
                index: index,
                headers: headers,
                rows: rows
            });
        });
        
        // 使用自定义XPath提取
        content.xpathResults = {};
        config.contentXPaths.forEach((xpath, index) => {
            const elements = getAllElementsByXPath(xpath, doc);
            if (elements.length > 0) {
                content.xpathResults[`xpath_${index}`] = {
                    xpath: xpath,
                    count: elements.length,
                    content: elements.map(el => ({
                        tagName: el.tagName,
                        text: el.textContent.trim().substring(0, 500),
                        html: el.innerHTML.substring(0, 500)
                    }))
                };
            }
        });
        
        return content;
    }

    // 异步抓取单个页面
    function scrapePage(linkInfo) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: linkInfo.url,
                onload: function(response) {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, 'text/html');
                        
                        const content = extractPageContent(doc);
                        
                        const pageData = {
                            url: linkInfo.url,
                            category: linkInfo.category,
                            linkText: linkInfo.text,
                            path: linkInfo.path,
                            scrapedAt: new Date().toISOString(),
                            content: content
                        };
                        
                        scrapedData.contents.push(pageData);
                        
                        console.log(`成功抓取: ${linkInfo.text} (${linkInfo.url})`);
                        resolve(pageData);
                    } catch (error) {
                        console.error(`解析页面失败: ${linkInfo.url}`, error);
                        reject(error);
                    }
                },
                onerror: function(error) {
                    console.error(`请求失败: ${linkInfo.url}`, error);
                    reject(error);
                }
            });
        });
    }

    // 批量抓取页面（带并发控制）
    async function scrapeAllPages(links) {
        const total = links.length;
        let completed = 0;
        let failed = 0;
        
        updateProgress(completed, total, failed);
        
        // 并发控制
        const queue = [...links];
        const running = [];
        
        while (queue.length > 0 || running.length > 0) {
            // 启动新任务直到达到最大并发数
            while (running.length < config.maxConcurrent && queue.length > 0) {
                const link = queue.shift();
                const promise = scrapePage(link)
                    .then(result => {
                        completed++;
                        updateProgress(completed, total, failed);
                        return result;
                    })
                    .catch(error => {
                        failed++;
                        updateProgress(completed, total, failed);
                        return null;
                    })
                    .finally(() => {
                        const index = running.indexOf(promise);
                        if (index > -1) {
                            running.splice(index, 1);
                        }
                    });
                
                running.push(promise);
                
                // 延迟
                if (queue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
                }
            }
            
            // 等待至少一个任务完成
            if (running.length > 0) {
                await Promise.race(running);
            }
        }
        
        console.log(`抓取完成！成功: ${completed}, 失败: ${failed}`);
        return scrapedData;
    }

    // 更新进度显示
    function updateProgress(completed, total, failed) {
        const progressEl = document.getElementById('doc-scraper-progress');
        if (progressEl) {
            const percentage = Math.round((completed / total) * 100);
            progressEl.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div style="background: #4CAF50; height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
                    </div>
                </div>
                <div>进度: ${completed} / ${total} (失败: ${failed})</div>
            `;
        }
    }

    // 导出数据为JSON
    function exportToJSON() {
        const dataStr = JSON.stringify(scrapedData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doc-scraper-${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 导出为Markdown
    function exportToMarkdown() {
        let markdown = `# 文档抓取结果\n\n`;
        markdown += `**基础URL:** ${scrapedData.baseUrl}\n`;
        markdown += `**抓取时间:** ${scrapedData.startTime}\n`;
        markdown += `**总链接数:** ${scrapedData.links.length}\n`;
        markdown += `**分类数:** ${Object.keys(scrapedData.categories).length}\n\n`;
        
        // 添加分类目录
        markdown += `## 分类目录\n\n`;
        for (const [category, links] of Object.entries(scrapedData.categories)) {
            markdown += `### ${category}\n\n`;
            links.forEach(link => {
                markdown += `- [${link.text}](${link.url})\n`;
            });
            markdown += `\n`;
        }
        
        // 添加内容
        markdown += `## 页面内容\n\n`;
        scrapedData.contents.forEach(page => {
            markdown += `### ${page.content.title}\n\n`;
            markdown += `**URL:** ${page.url}\n`;
            markdown += `**分类:** ${page.category}\n\n`;
            
            if (page.content.headings.length > 0) {
                markdown += `#### 标题结构\n\n`;
                page.content.headings.forEach(h => {
                    const indent = '  '.repeat(h.level - 1);
                    markdown += `${indent}- ${h.text}\n`;
                });
                markdown += `\n`;
            }
            
            if (page.content.codeBlocks.length > 0) {
                markdown += `#### 代码示例\n\n`;
                page.content.codeBlocks.forEach(cb => {
                    markdown += `\`\`\`${cb.language}\n${cb.code}\n\`\`\`\n\n`;
                });
            }
            
            markdown += `---\n\n`;
        });
        
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doc-scraper-${new Date().getTime()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 导出为CSV
    function exportToCSV() {
        let csv = 'URL,分类,链接文本,标题,内容长度,代码块数,标题数\n';
        
        scrapedData.contents.forEach(page => {
            const row = [
                page.url,
                page.category,
                page.linkText.replace(/"/g, '""'),
                page.content.title.replace(/"/g, '""'),
                page.content.text.length,
                page.content.codeBlocks.length,
                page.content.headings.length
            ];
            csv += row.map(field => `"${field}"`).join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doc-scraper-${new Date().getTime()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 创建控制面板UI
    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'doc-scraper-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            max-height: 80vh;
            background: white;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 20px;
            z-index: 999999;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
            overflow-y: auto;
        `;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #333;">文档爬取工具</h3>
                <button id="close-panel" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">关闭</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 10px 0; color: #555;">配置</h4>
                <label style="display: block; margin: 5px 0;">
                    延迟(毫秒):
                    <input type="number" id="delay-input" value="${config.delayBetweenRequests}" style="width: 100px; margin-left: 10px; padding: 5px;">
                </label>
                <label style="display: block; margin: 5px 0;">
                    最大并发:
                    <input type="number" id="concurrent-input" value="${config.maxConcurrent}" style="width: 100px; margin-left: 10px; padding: 5px;">
                </label>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 10px 0; color: #555;">操作</h4>
                <button id="scan-links" style="width: 100%; margin: 5px 0; padding: 10px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    1. 扫描链接
                </button>
                <button id="scrape-all" style="width: 100%; margin: 5px 0; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;" disabled>
                    2. 开始抓取
                </button>
                <button id="scrape-current" style="width: 100%; margin: 5px 0; padding: 10px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    抓取当前页
                </button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 10px 0; color: #555;">导出</h4>
                <button id="export-json" style="width: 100%; margin: 5px 0; padding: 8px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer;" disabled>
                    导出 JSON
                </button>
                <button id="export-markdown" style="width: 100%; margin: 5px 0; padding: 8px; background: #009688; color: white; border: none; border-radius: 4px; cursor: pointer;" disabled>
                    导出 Markdown
                </button>
                <button id="export-csv" style="width: 100%; margin: 5px 0; padding: 8px; background: #795548; color: white; border: none; border-radius: 4px; cursor: pointer;" disabled>
                    导出 CSV
                </button>
            </div>
            
            <div id="doc-scraper-info" style="padding: 10px; background: #f5f5f5; border-radius: 4px; font-size: 12px; color: #666;">
                等待操作...
            </div>
            
            <div id="doc-scraper-progress" style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 4px; font-size: 12px; display: none;">
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // 绑定事件
        document.getElementById('close-panel').addEventListener('click', () => {
            panel.style.display = 'none';
        });
        
        document.getElementById('scan-links').addEventListener('click', () => {
            const links = extractAndCategorizeLinks();
            document.getElementById('doc-scraper-info').innerHTML = `
                找到 ${links.length} 个链接<br>
                分类: ${Object.keys(scrapedData.categories).length} 个<br>
                <br>
                <strong>分类列表:</strong><br>
                ${Object.entries(scrapedData.categories).map(([cat, links]) => 
                    `${cat}: ${links.length} 个链接`
                ).join('<br>')}
            `;
            document.getElementById('scrape-all').disabled = false;
        });
        
        document.getElementById('scrape-all').addEventListener('click', async () => {
            // 更新配置
            config.delayBetweenRequests = parseInt(document.getElementById('delay-input').value);
            config.maxConcurrent = parseInt(document.getElementById('concurrent-input').value);
            
            document.getElementById('doc-scraper-progress').style.display = 'block';
            document.getElementById('scrape-all').disabled = true;
            
            await scrapeAllPages(scrapedData.links);
            
            document.getElementById('export-json').disabled = false;
            document.getElementById('export-markdown').disabled = false;
            document.getElementById('export-csv').disabled = false;
            document.getElementById('scrape-all').disabled = false;
            
            document.getElementById('doc-scraper-info').innerHTML = `
                ✅ 抓取完成！<br>
                成功: ${scrapedData.contents.length} 页<br>
                失败: ${scrapedData.links.length - scrapedData.contents.length} 页
            `;
        });
        
        document.getElementById('scrape-current').addEventListener('click', () => {
            const content = extractPageContent();
            scrapedData.contents.push({
                url: window.location.href,
                category: 'current',
                linkText: document.title,
                path: window.location.pathname,
                scrapedAt: new Date().toISOString(),
                content: content
            });
            
            document.getElementById('export-json').disabled = false;
            document.getElementById('export-markdown').disabled = false;
            document.getElementById('export-csv').disabled = false;
            
            document.getElementById('doc-scraper-info').innerHTML = `
                ✅ 当前页抓取完成！<br>
                标题: ${content.headings.length} 个<br>
                代码块: ${content.codeBlocks.length} 个<br>
                表格: ${content.tables.length} 个
            `;
        });
        
        document.getElementById('export-json').addEventListener('click', exportToJSON);
        document.getElementById('export-markdown').addEventListener('click', exportToMarkdown);
        document.getElementById('export-csv').addEventListener('click', exportToCSV);
    }

    // 初始化
    function init() {
        // 等待页面加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createControlPanel);
        } else {
            createControlPanel();
        }
        
        // 注册菜单命令
        GM_registerMenuCommand('打开文档爬取工具', () => {
            const panel = document.getElementById('doc-scraper-panel');
            if (panel) {
                panel.style.display = 'block';
            } else {
                createControlPanel();
            }
        });
        
        console.log('文档爬取工具已加载！点击右上角面板开始使用。');
    }

    init();
})();
