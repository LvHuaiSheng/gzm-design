import {getFonts} from "@/api/editor/font";
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

    return {
        fontList,
        skipLoadFonts,
        initFonts,
    }
})
