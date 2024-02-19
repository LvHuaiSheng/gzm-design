import Mock from 'mockjs';
import setupMock, { successResponseWrap } from '@/utils/setup-mock';
import templateData from '@/assets/data/templateData.json'
import graphData from '@/assets/data/graphData.json'
import imageData from '@/assets/data/imageData.json'
import textData from '@/assets/data/textData.json'
import bgImgData from '@/assets/data/bgImgData.json'
import elementData from '@/assets/data/elementData.json'
import {MockParams} from "@/types/mock";

/**
 * TODO 优化图库，抓取unsplash图片
 */
setupMock({
    setup() {

        Mock.mock(new RegExp('/api/template/templateList'), (params:MockParams) => {
            const { pageNum, pageSize } = JSON.parse(params.body);
            var newDataList = templateData.list.slice((pageNum - 1) * pageSize, pageNum * pageSize)
            return successResponseWrap({records:newDataList,total:templateData.list.length});
        });

        Mock.mock(new RegExp('/api/text/materialList'), (params:MockParams) => {
            const { pageNum, pageSize } = JSON.parse(params.body);
            var newDataList = textData.list.slice((pageNum - 1) * pageSize, pageNum * pageSize)
            return successResponseWrap({records:newDataList,total:textData.list.length});
        });

        Mock.mock(new RegExp('/api/image/materialList'), (params:MockParams) => {
            const { pageNum, pageSize } = JSON.parse(params.body);
            var newDataList = imageData.list.slice((pageNum - 1) * pageSize, pageNum * pageSize)
            return successResponseWrap({records:newDataList,total:imageData.list.length});
        });


        Mock.mock(new RegExp('/api/graph/category'), (params:MockParams) => {
            return successResponseWrap({records:graphData.cate,total:graphData.cate.length});
        });
        Mock.mock(new RegExp('/api/graph/list'), (params:MockParams) => {
            const { pageNum, pageSize, query } = JSON.parse(params.body);
            const list = graphData.list.filter(v=>{
                return v.category == query.categoryId
            })
            var newDataList = list.slice((pageNum - 1) * pageSize, pageNum * pageSize)
            return successResponseWrap({records:newDataList,total:list.length});
        });

        Mock.mock(new RegExp('/api/background/imageList'), (params:MockParams) => {
            const { pageNum, pageSize } = JSON.parse(params.body);
            var newDataList = bgImgData.list.slice((pageNum - 1) * pageSize, pageNum * pageSize)
            return successResponseWrap({records:newDataList,total:bgImgData.list.length});
        });

        Mock.mock(new RegExp('/api/element/category'), (params:MockParams) => {
            return successResponseWrap({records:elementData.cate,total:elementData.cate.length});
        });
        Mock.mock(new RegExp('/api/element/list'), (params:MockParams) => {
            const { pageNum, pageSize, query } = JSON.parse(params.body);
            const list = elementData.list.filter(v=>{
                return v.category == query.categoryId
            })
            var newDataList = list.slice((pageNum - 1) * pageSize, pageNum * pageSize)
            return successResponseWrap({records:newDataList,total:list.length});
        });
    },
});
