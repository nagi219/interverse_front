import axios from "axios";

// export default axios.create({
//     baseURL: import.meta.env.VITE_API_URL
// });

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export function handleRedirect(router) {
  instance.interceptors.response.use(
    function (response) {
      // 正常返回 response
      return response;
    },
    function (error) {
      // 如果是 HTTP 403 錯誤，執行重定向操作
      if (error.response && error.response.status === 403) {
        if (router) {
          router.push("/403");
        }
      }
      if (error.response && error.response.status === 404) {
        if (router) {
          router.push("/404");
        }
      }
      // 返回錯誤以便其他地方可以處理
      return Promise.reject(error);
    }
  );
}

export default instance;
