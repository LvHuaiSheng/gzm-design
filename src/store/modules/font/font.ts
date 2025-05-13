import {getFonts} from "@/api/editor/font";
import {Message,Notification} from "@arco-design/web-vue";
import FontFaceObserver from 'fontfaceobserver'

const defaultFonts = [
    {
        code: 'arial',
        name: 'Arial',
    },
    {
        code: 'Times New Roman',
        name: 'Times New Roman',
    },
    {
        code: 'Microsoft Yahei',
        name: '微软雅黑',
    },
]

interface Node {
    tag?: string;
    fill?: Array<{ type?: string; color?: string }>;
    fontFamily?: string;
    text?: string;
    children?: Node[];
}
interface TemplateFontFamily{
    styleFonts: Set<string>;
    richTextFonts: Set<string>;
}

const FONT_KEY = 'OPEN_FONTS'
const FONT_VERSION_KEY = 'OPEN_FONTS_VERSION'
export const useFontStore = defineStore('font', () => {
    const fontList = ref<any>([])

    // 跳过加载的字体
    const skipLoadFonts = ref<any>(defaultFonts.map(value => value.name))


    /**
     * 初始化部分字体
     */
    async function initFonts() {
        let list = []
        localStorage.getItem(FONT_VERSION_KEY) !== '1' && localStorage.removeItem(FONT_KEY)
        const localFonts: any = localStorage.getItem(FONT_KEY) ? JSON.parse(localStorage.getItem(FONT_KEY) || '') : []
        if (localFonts.length > 0) {
            list.push(...localFonts)
        }

        if (list.length === 0) {
            const res = await getFonts({pageNum: 1, pageSize: 1000})
            list = res.data.records
            localStorage.setItem(FONT_KEY, JSON.stringify(list))
            localStorage.setItem(FONT_VERSION_KEY, '1')
        }
        fontList.value = defaultFonts.concat(list)
        return list
    }

    /**
     * 提取模板中所用的字体
     * @param jsonData 模板json
     */
    async function extractTemplateFonts(jsonData: any, load = false): Promise<TemplateFontFamily> {
        const styleFonts = new Set<string>();
        const richTextFonts = new Set<string>();
        const stack: Node[] = [jsonData];

        const regex = /font-family:\s*['"]?([^'";,]+)/g;

        while (stack.length > 0) {
            const node = stack.pop()!;
            if ('Text' === node.tag) {
                if (node.fontFamily) {
                    styleFonts.add(node.fontFamily);
                }
            } else if ('HTMLText' === node.tag) {
                if (node.text && typeof node.text === 'string') {
                    let match;
                    while ((match = regex.exec(node.text)) !== null) {
                        if (match[1]) {
                            richTextFonts.add(match[1].trim());
                        }
                    }
                }
            }
            if (node.children) {
                for (const child of node.children) {
                    stack.push(child);
                }
            }
        }
        const fonts = {styleFonts: styleFonts, richTextFonts: richTextFonts}
        if (load) {
            await loadFonts(fonts)
        }
        return fonts;
    }

    async function loadFonts(fonts: TemplateFontFamily, maxConcurrent = 3) {
        const allFonts = [...fonts.styleFonts, ...fonts.richTextFonts];
        const total = allFonts.length;
        let loaded = 0;

        // 总进度通知（可更新）
        const progressNotificationKey = `font-progress-${Date.now()}`;
        Notification.info({
            id: progressNotificationKey,  // Arco 用 id 替代 key
            title: '字体加载进度',
            content: `已加载 0/${total}`,
            duration: 0,  // 不自动关闭
            closable: false,
        });

        // 并发加载函数
        async function loadFont(fontName: string) {
            const messageKey = `font-${fontName}-${Date.now()}`;
            Message.loading({
                id: messageKey,  // Arco 用 id
                content: `正在加载: ${fontName}`,
                duration: 0,
            });

            try {
                const font = new FontFaceObserver(fontName);
                await font.load(null, 10000);
                Message.success({
                    id: messageKey,
                    content: `加载成功: ${fontName}`,
                    duration: 2,
                });
            } catch (err) {
                Message.error({
                    id: messageKey,
                    content: `加载失败: ${fontName}`,
                    duration: 2,
                });
                console.error(err);
            } finally {
                loaded++;
                // 更新总进度通知
                Notification.info({
                    id: progressNotificationKey,
                    title: '字体加载进度',
                    content: `已加载 ${loaded}/${total}`,
                    duration: 0,
                });
            }
        }

        // 分批并发控制
        const batchPromises = [];
        for (let i = 0; i < allFonts.length; i += maxConcurrent) {
            const batch = allFonts.slice(i, i + maxConcurrent);
            batchPromises.push(Promise.all(batch.map(font => loadFont(font))));
        }

        await Promise.all(batchPromises);

        // 关闭总进度通知
        Notification.remove(progressNotificationKey);

        // 最终结果反馈
        if (loaded === total) {
            Message.success(`所有字体加载完成 (${loaded}/${total})`);
        } else {
            Message.warning(`字体加载完成，${total - loaded}个失败`);
        }
    }

    return {
        fontList,
        skipLoadFonts,
        initFonts,
        extractTemplateFonts,
        loadFonts,
    }
})
