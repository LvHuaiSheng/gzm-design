import axios from 'axios';
import {PageParams} from "@/types/page";

/**
 * 获取字体
 * @param params
 */
export function getFonts(params:PageParams) {
  return axios.get('/api/font/list',{data:params});
}
