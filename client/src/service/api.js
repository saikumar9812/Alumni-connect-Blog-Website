import axios from 'axios';

import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from '../constants/config';
import { getAccessToken, getRefreshToken, setAccessToken, getType } from '../utils/common-utils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000, 
    headers: {
        "content-type": "application/json"
    }
});

axiosInstance.interceptors.request.use(
    function(config) {
        if (config.TYPE.params) {
            config.params = config.TYPE.params
        } else if (config.TYPE.query) {
            config.url = config.url + '/' + config.TYPE.query;
        }
        return config;
    },
    function(error) {
        return Promise.reject(error);
    }
);

let refreshRequest = null;

const refreshAccessToken = () => {
    if (!refreshRequest) {
        refreshRequest = axios.post(`${API_URL}/token`, { token: getRefreshToken() })
            .then(({ data }) => setAccessToken(data.accessToken))
            .finally(() => { refreshRequest = null; });
    }
    return refreshRequest;
}

axiosInstance.interceptors.response.use(
    function(response) {
        return processResponse(response);
    },
    async function(error) {
        const config = error.config;
        // 401 = expired/invalid access token: refresh once with the refresh token, then retry the original request
        if (error.response?.status === 401 && config && !config._retry && getRefreshToken()) {
            try {
                await refreshAccessToken();
            } catch (refreshError) {
                sessionStorage.clear();
                window.location.assign('/account');
                return Promise.reject(ProcessError(error));
            }
            return axiosInstance({ ...config, TYPE: {}, _retry: true, headers: { ...config.headers, authorization: getAccessToken() } });
        }
        return Promise.reject(ProcessError(error));
    }
)

///////////////////////////////
// If success -> returns { isSuccess: true, data: object }
// If fail -> returns { isFailure: true, status: string, msg: string, code: int }
//////////////////////////////
const processResponse = (response) => {
    if (response?.status === 200) {
        return { isSuccess: true, data: response.data }
    } else {
        return {
            isFailure: true,
            status: response?.status,
            msg: response?.msg,
            code: response?.code
        }
    }
}

///////////////////////////////
// If fail -> returns { isError: true, msg: object, serverMsg: string, code: int }
//////////////////////////////
const ProcessError = async (error) => {
    if (error.response) {
        console.log("ERROR IN RESPONSE: ", error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.responseFailure,
            serverMsg: error.response.data?.msg,
            code: error.response.status
        }
    } else if (error.request) { 
        console.log("ERROR IN RESPONSE: ", error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.requestFailure,
            code: ""
        }
    } else { 
        console.log("ERROR IN RESPONSE: ", error);
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.networkError,
            code: ""
        }
    }
}

const API = {};

for (const [key, value] of Object.entries(SERVICE_URLS)) {
    API[key] = (body, showUploadProgress, showDownloadProgress) =>
        axiosInstance({
            method: value.method,
            url: value.url,
            data: value.method === 'DELETE' ? '' : body,
            responseType: value.responseType,
            headers: {
                authorization: getAccessToken(),
            },
            TYPE: getType(value, body),
            onUploadProgress: function(progressEvent) {
                if (showUploadProgress) {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showUploadProgress(percentCompleted);
                }
            },
            onDownloadProgress: function(progressEvent) {
                if (showDownloadProgress) {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showDownloadProgress(percentCompleted);
                }
            }
        });
}

export { API };