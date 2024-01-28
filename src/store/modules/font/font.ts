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
export const useFontStore = defineStore('font', () => {
    const fontList = ref<any>([])

    // 跳过加载的字体
    const skipLoadFonts = ref<any>(defaultFonts.map(value => value.name))


    /**
     * 初始化部分字体
     */
    async function initFonts() {
        let list = []
        localStorage.getItem('FONTS_VERSION') !== '1' && localStorage.removeItem('FONTS')
        const localFonts: any = localStorage.getItem('FONTS') ? JSON.parse(localStorage.getItem('FONTS') || '') : []
        if (localFonts.length > 0) {
            list.push(...localFonts)
        }

        if (list.length === 0) {
            const res = await getFonts({pageNum: 1, pageSize: 1000})
            list = res.data.records
            localStorage.setItem('FONTS', JSON.stringify(list))
            localStorage.setItem('FONTS_VERSION', '1')
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
