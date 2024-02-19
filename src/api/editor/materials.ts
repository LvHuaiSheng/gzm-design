import axios from 'axios';
import type { DescData } from '@arco-design/web-vue/es/descriptions/interface';
import {PageParams} from "@/types/page";

/**
 * 模板数据
 * @param params
 */
export function queryTemplateList(params:PageParams) {
  return axios.get('/api/template/templateList',{data:params});
}

/**
 * 文字模板
 * @param params
 */
export function queryTextMaterialList(params:PageParams) {
  return axios.get('/api/text/materialList',{data:params});
}

/**
 * 图片素材
 * @param params
 */
export function queryImageMaterialList(params:PageParams) {
  return axios.get('/api/image/materialList',{data:params});
}

/**
 * 素材分类
 * @param params
 */
export function queryGraphCategory(params?:PageParams) {
  return axios.get('/api/graph/category',{data:params});
}
/**
 * 素材分类列表
 * @param params
 */
export function queryGraphList(params:PageParams) {
  return axios.get('/api/graph/list',{data:params});
}

/**
 * 背景图片
 * @param params
 */
export function queryBgImgMaterialList(params:PageParams) {
  return axios.get('/api/background/imageList',{data:params});
}


/**
 * 元素分类
 * @param params
 */
export function queryElementCategory(params?:PageParams) {
    return axios.get('/api/element/category',{data:params});
}
/**
 * 元素分类列表
 * @param params
 */
export function queryElementList(params:PageParams) {
    return axios.get('/api/element/list',{data:params});
}
