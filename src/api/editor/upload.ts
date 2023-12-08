import axios from "axios/index";

/**
 * 上传文件
 * @param req
 */
export function uploadFile(req:any) {
    return axios.post(`/api/oss/upload`, req);
}
