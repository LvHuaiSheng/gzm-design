const FONT_CSS_TAG = "data-fonts"
const FONT_CSS_TAG_BASE64 = "base64-fonts"
async function fetchFontAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch font from ${url}`);
    }
    console.log('response.headers=',response.headers)
    // 获取文件类型
    const contentType = response.headers.get('Content-Type');
    debugger
    let mimeType: string;

    // 根据 Content-Type 设置 MIME 类型
    if (contentType?.includes('font/woff2')) {
        mimeType = 'font/woff2';
    } else if (contentType?.includes('font/woff')) {
        mimeType = 'font/woff';
    } else if (contentType?.includes('font/ttf') || contentType?.includes('font/sfnt')) {
        mimeType = 'font/ttf';
    } else if (contentType?.includes('application/octet-stream')) {
        // 如果 Content-Type 是通用的二进制流，尝试从文件扩展名推断类型
        const extension = url.split('.').pop()?.toLowerCase();
        if (extension === 'woff2') {
            mimeType = 'font/woff2';
        } else if (extension === 'woff') {
            mimeType = 'font/woff';
        } else if (extension === 'ttf') {
            mimeType = 'font/ttf';
        } else {
            throw new Error(`Unsupported font file type: ${extension}`);
        }
    } else {
        throw new Error(`Unsupported Content-Type: ${contentType}`);
    }

    // 将文件转换为 Base64
    const arrayBuffer = await response.arrayBuffer();
    const base64String = arrayBufferToBase64(arrayBuffer);

    // 返回 data: URL
    return `data:${mimeType};charset=utf-8;base64,${base64String}`;
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

/**
 * 批量添加自定义字体样式
 * @param fontList
 */
export function addCustomFonts(fontList: any = []) {
    let styleTag = document.createElement('style');
    styleTag.setAttribute(FONT_CSS_TAG, 'true');
    let fontRules = fontList.map((font: any) => `@font-face {
        font-family: "${font.name}";
        src: local("${font.name}"), url("${font.download}")
    }`).join('\n');
    styleTag.textContent = fontRules;
    document.head.appendChild(styleTag);
    // TODO 加载到系统字体库中

}

/**
 * 获取自定义字体样式
 */
export function getCustomFontsStyle() {
    const styleTag = document.querySelector('style[data-fonts]');
    return styleTag.textContent
}

/**
 * 添加单个自定义字体样式（暂未测试）
 * @param font
 */
export function addCustomFont(font:any) {
    let styleTag = document.querySelector('style[data-fonts]');
    // 如果不存在样式标签，则创建一个新的style标签
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.setAttribute(FONT_CSS_TAG, 'true');
        document.head.appendChild(styleTag);
    }
    let existingFonts = [];

    existingFonts = Array.from(styleTag.sheet.cssRules).map(rule => {
        const match = rule.cssText.match(/font-family: "([^"]+)"/);
        return match ? match[1] : null;
    }).filter(font => font !== null);

    // 判断要添加的字体是否已经存在于样式表中
    if (!existingFonts.includes(font.name)) {
        // 创建新的 @font-face 规则
        const newFontRule = `@font-face {
          font-family: "${font.name}";
          src: url("${font.download}");
        }`;

        // 插入新的 @font-face 规则到样式表中
        styleTag.sheet.insertRule(newFontRule, styleTag.sheet.cssRules.length);
    }
}


/**
 * 批量加载字体（要在生成完字体css后再调用次方法执行）
 * @param fontNameList 字体名称
 */
export async function batchLoadFont(fontNameList: any = []) {
    const fontLoaders: any = []
    fontNameList.forEach((fontFamily:string) => {
        const loader = new FontFaceObserver(fontFamily)
        fontLoaders.push(loader.load())
    });
    try {
        await Promise.all(fontLoaders)
    } catch (e) {
        // console.log(e)
    }
}



function getFontUrlFromCSS(selectors:string,fontFamilyName: string): string | null {
    // 获取所有 <style> 标签
    const styleTags = document.querySelectorAll(selectors);
    debugger
    for (const styleTag of styleTags) {
        // 获取 CSS 内容
        const cssText = styleTag.textContent || '';

        // 使用正则表达式匹配 @font-face 规则
        const fontFaceRules = cssText.match(/@font-face\s*\{[^}]+\}/g);

        if (fontFaceRules) {
            for (const rule of fontFaceRules) {
                // 提取 font-family
                const fontFamilyMatch = rule.match(/font-family:\s*(["'])(.*?)\1/);
                if (fontFamilyMatch && fontFamilyMatch[2] === fontFamilyName) {
                    // 提取 src
                    const srcMatch = rule.match(/src:\s*url\((["'])(.*?)\1\)/);
                    if (srcMatch) {
                        return srcMatch[2]; // 返回字体文件 URL
                    }else {
                        const srcMatch2 = rule.match(/src:\s*(?:local\([^)]+\)\s*,\s*)?url\((["'])(.*?)\1\)/);
                        return srcMatch2[2]
                    }
                }
            }
        }
    }

    return null; // 未找到匹配的字体
}
/**
 * 添加单个自定义字体样式
 * @param font
 */
export async function addCustomFontBase64(font: any) {
    const fontUrl = getFontUrlFromCSS(`style[${FONT_CSS_TAG}]`,font)
    console.log('fontUrl=',fontUrl)
    let styleTag = document.querySelector(`style[${FONT_CSS_TAG_BASE64}]`);
    // 如果不存在样式标签，则创建一个新的style标签
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.setAttribute(FONT_CSS_TAG_BASE64, 'true');
        document.head.appendChild(styleTag);
    }

    // 确保样式标签已经被添加到文档中
    if (!styleTag.sheet) {
        await new Promise(resolve => setTimeout(resolve, 10)); // 等待样式标签被加载
    }

    let existingFonts = Array.from(styleTag.sheet?.cssRules || []).map(rule => {
        const match = rule.cssText.match(/font-family: "([^"]+)"/);
        return match ? match[1] : null;
    }).filter(font => font !== null);
    // 判断要添加的字体是否已经存在于样式表中
    if (!existingFonts.includes(font)) {
        const base64Url = await fetchFontAsBase64(fontUrl);
        // 创建新的 @font-face 规则
        const newFontRule = `@font-face {
          font-family: "${font}";
          src: local("${font}"), url("${base64Url}");
        }`;

        // 插入新的 @font-face 规则到样式表中
        styleTag.sheet?.insertRule(newFontRule, styleTag.sheet.cssRules.length);
        styleTag.textContent += newFontRule
    }
}

/**
 * 获取自定义字体样式
 */
export function getBase64CustomFontsStyle() {
    const styleTag = document.querySelector(`style[${FONT_CSS_TAG_BASE64}]`);
    return styleTag?.textContent
}
