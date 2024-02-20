

/**
 * 批量添加自定义字体样式
 * @param fontList
 */
export function addCustomFonts(fontList: any = []) {
    let styleTag = document.createElement('style');
    let fontRules = fontList.map((font: any) => `@font-face {
        font-family: "${font.name}";
        src: local("${font.name}"), url("${font.download}")
    }`).join('\n');
    styleTag.textContent = fontRules;
    document.head.appendChild(styleTag);
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
        styleTag.setAttribute('data-fonts', 'true');
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
