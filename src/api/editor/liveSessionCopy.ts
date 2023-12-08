import axios from 'axios';
import qs from 'query-string';

const BASE_URL = '/live/sessionCopy';


export function listLiveSessionCopy(params) {
  return axios.get(`${BASE_URL}/page`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function getLiveSessionCopy(id) {
  return axios.get(`${BASE_URL}/info/${id}`);
}

export function addLiveSessionCopy(req) {
  return axios.post(`${BASE_URL}/add`, req);
}

export function updateLiveSessionCopy(req) {
  return axios.post(`${BASE_URL}/update`, req);
}

export function deleteLiveSessionCopy(ids) {
  return axios.delete(`${BASE_URL}/remove/${ids}`);
}
