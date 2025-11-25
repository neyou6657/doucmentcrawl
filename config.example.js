// 配置示例文件
// 将此文件重命名为 config.js 并根据需要修改

const customConfig = {
    // ===== 网站特定配置 =====
    
    // MDN Web Docs 配置
    mdn: {
        leftNavSelectors: [
            '.sidebar-inner a',
            'nav.sidebar a'
        ],
        contentSelectors: [
            'article.main-page-content',
            'main#content'
        ],
        contentXPaths: [
            '//article[@class="main-page-content"]',
            '//main[@id="content"]'
        ]
    },
    
    // React 文档配置
    react: {
        leftNavSelectors: [
            'nav a',
            '.sidebar a',
            '[role="navigation"] a'
        ],
        contentSelectors: [
            'main',
            'article',
            '.markdown'
        ],
        contentXPaths: [
            '//main',
            '//article',
            '//*[contains(@class, "markdown")]'
        ]
    },
    
    // Vue.js 文档配置
    vue: {
        leftNavSelectors: [
            '.sidebar-links a',
            '.sidebar a'
        ],
        contentSelectors: [
            '.content',
            'main.content'
        ],
        contentXPaths: [
            '//*[@class="content"]',
            '//main[contains(@class, "content")]'
        ]
    },
    
    // GitBook 配置
    gitbook: {
        leftNavSelectors: [
            '.book-summary a',
            'nav.book-summary a'
        ],
        contentSelectors: [
            '.page-inner',
            '.book-body'
        ],
        contentXPaths: [
            '//*[contains(@class, "page-inner")]',
            '//*[contains(@class, "book-body")]'
        ]
    },
    
    // Docusaurus 配置
    docusaurus: {
        leftNavSelectors: [
            '.menu__list a',
            'nav.menu a'
        ],
        contentSelectors: [
            'article',
            'main.docMainContainer'
        ],
        contentXPaths: [
            '//article',
            '//main[contains(@class, "docMainContainer")]'
        ]
    },
    
    // ===== 抓取策略配置 =====
    
    strategies: {
        // 快速模式：高并发，低延迟（适合小型文档）
        fast: {
            delayBetweenRequests: 300,
            maxConcurrent: 5,
            timeout: 10000
        },
        
        // 平衡模式：中等并发和延迟（推荐）
        balanced: {
            delayBetweenRequests: 1000,
            maxConcurrent: 3,
            timeout: 15000
        },
        
        // 安全模式：低并发，高延迟（避免被限流）
        safe: {
            delayBetweenRequests: 2000,
            maxConcurrent: 1,
            timeout: 20000
        },
        
        // 礼貌模式：最低并发，最高延迟（对服务器最友好）
        polite: {
            delayBetweenRequests: 5000,
            maxConcurrent: 1,
            timeout: 30000
        }
    },
    
    // ===== 内容提取规则 =====
    
    extractionRules: {
        // 需要提取的元素类型
        elements: {
            headings: true,           // 提取标题
            codeBlocks: true,         // 提取代码块
            tables: true,             // 提取表格
            images: true,             // 提取图片信息
            links: true,              // 提取链接
            lists: true,              // 提取列表
            blockquotes: true         // 提取引用
        },
        
        // 代码块语言检测模式
        codeLanguagePatterns: [
            /language-(\w+)/,
            /lang-(\w+)/,
            /highlight-(\w+)/,
            /\bprism-(\w+)/
        ],
        
        // 忽略的元素
        ignoreSelectors: [
            '.advertisement',
            '.ad-container',
            '.social-share',
            'footer',
            '.cookie-banner',
            '.newsletter-signup'
        ],
        
        // 自定义数据提取器
        customExtractors: [
            {
                name: 'apiMethods',
                xpath: '//div[contains(@class, "api-method")]',
                extract: (element) => ({
                    method: element.querySelector('.method-name')?.textContent,
                    description: element.querySelector('.description')?.textContent,
                    params: Array.from(element.querySelectorAll('.param')).map(p => ({
                        name: p.querySelector('.param-name')?.textContent,
                        type: p.querySelector('.param-type')?.textContent,
                        description: p.querySelector('.param-desc')?.textContent
                    }))
                })
            },
            {
                name: 'examples',
                xpath: '//div[contains(@class, "example")]',
                extract: (element) => ({
                    title: element.querySelector('h3, h4')?.textContent,
                    code: element.querySelector('pre code')?.textContent,
                    description: element.querySelector('p')?.textContent
                })
            }
        ]
    },
    
    // ===== 过滤规则 =====
    
    filters: {
        // URL过滤规则
        urlFilters: {
            // 包含这些路径的URL才会被抓取
            include: [
                '/docs/',
                '/api/',
                '/guide/',
                '/tutorial/'
            ],
            
            // 排除这些路径的URL
            exclude: [
                '/blog/',
                '/about/',
                '/contact/',
                '/privacy/',
                '/terms/'
            ],
            
            // URL正则匹配
            patterns: {
                include: [
                    /\/docs\/[^/]+\/.+/,  // 至少两级文档路径
                ],
                exclude: [
                    /\.(pdf|zip|jpg|png)$/i,  // 排除文件下载
                    /#.*$/,  // 排除锚点链接
                ]
            }
        },
        
        // 内容过滤规则
        contentFilters: {
            // 最小内容长度（字符数）
            minLength: 100,
            
            // 最大内容长度（字符数，0表示无限制）
            maxLength: 0,
            
            // 必须包含的关键词
            mustInclude: [],
            
            // 不能包含的关键词
            mustExclude: ['404', 'Page Not Found', 'Access Denied']
        }
    },
    
    // ===== 分类规则 =====
    
    categoryRules: {
        // 自动分类模式
        mode: 'path', // 'path' | 'manual' | 'ai'
        
        // 基于路径的分类规则
        pathRules: {
            '/api/': 'API Reference',
            '/guide/': 'Guide',
            '/tutorial/': 'Tutorial',
            '/examples/': 'Examples',
            '/reference/': 'Reference',
            '/advanced/': 'Advanced',
            '/getting-started/': 'Getting Started'
        },
        
        // 手动分类规则（基于URL模式）
        manualRules: [
            {
                pattern: /\/react\/hooks\//,
                category: 'React Hooks'
            },
            {
                pattern: /\/vue\/composition-api\//,
                category: 'Composition API'
            },
            {
                pattern: /\/components\//,
                category: 'Components'
            }
        ],
        
        // 默认分类
        defaultCategory: 'Uncategorized'
    },
    
    // ===== 导出配置 =====
    
    exportOptions: {
        // JSON导出选项
        json: {
            pretty: true,           // 格式化输出
            indent: 2,              // 缩进空格数
            includeMetadata: true   // 包含元数据
        },
        
        // Markdown导出选项
        markdown: {
            includeTableOfContents: true,   // 包含目录
            includeFrontMatter: true,       // 包含Front Matter
            codeBlockLanguage: true,        // 显示代码块语言
            imageAsLink: true,              // 图片作为链接
            maxHeadingLevel: 6              // 最大标题级别
        },
        
        // CSV导出选项
        csv: {
            delimiter: ',',         // 分隔符
            quote: '"',            // 引号字符
            encoding: 'utf-8',     // 编码
            bom: true              // 包含BOM
        },
        
        // HTML导出选项
        html: {
            includeStyles: true,    // 包含样式
            standalone: true,       // 独立文件
            template: 'default'     // 模板
        }
    },
    
    // ===== 高级选项 =====
    
    advanced: {
        // 使用代理
        useProxy: false,
        proxyUrl: '',
        
        // 自定义请求头
        customHeaders: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        
        // Cookie设置
        useCookies: true,
        
        // 重试设置
        retry: {
            enabled: true,
            maxAttempts: 3,
            backoff: 'exponential' // 'fixed' | 'exponential'
        },
        
        // 缓存设置
        cache: {
            enabled: true,
            ttl: 3600000,  // 1小时（毫秒）
            storage: 'localStorage' // 'localStorage' | 'indexedDB'
        },
        
        // 日志设置
        logging: {
            level: 'info',  // 'debug' | 'info' | 'warn' | 'error'
            console: true,
            file: false
        },
        
        // 进度回调
        onProgress: null,  // function(current, total, failed) {}
        
        // 完成回调
        onComplete: null,  // function(results) {}
        
        // 错误回调
        onError: null      // function(error, context) {}
    }
};

// 使用方法：
// 1. 在脚本中导入此配置
// 2. 根据需要选择或组合配置
// 3. 示例：
//    const config = customConfig.react;
//    Object.assign(config, customConfig.strategies.balanced);

export default customConfig;
