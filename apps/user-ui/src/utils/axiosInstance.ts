import axios from "axios";


const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true
});

let isRefreshing:boolean = false;
let refreshSubscribers: (() => void)[] = [];

// Handle logout and prevent infinite loops
const handleLogout = () =>{
  if(window.location.pathname !== '/login'){
    window.location.href = "/login";
  }
};

const subscribeTokenRefresh = (callback: ()=> void) => {
  refreshSubscribers.push(callback);
};


const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback)=> callback());
  refreshSubscribers = [];
}

// handle api requests
axiosInstance.interceptors.request.use((config) => config,(error)=> Promise.reject(error));

// handle expired tokens and refresh logic
axiosInstance.interceptors.response.use((response)=> response,
  async(error)=>{
    const orignialRequest = error.config;

    //prevent infinite retry loop
    if(error.response?.status === 401 && !orignialRequest._retry){
      if(isRefreshing){
        return new Promise((resolve)=>{
          subscribeTokenRefresh(()=> resolve(axiosInstance(orignialRequest)));
        })
      }
      orignialRequest._retry = true;
      isRefreshing = true;
      try{
        await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/refresh-token-user`,
          {},
          {withCredentials: true}
        );
        isRefreshing = false;

        onRefreshSuccess();

        return axiosInstance(orignialRequest);
      }catch(error){
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
