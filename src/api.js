// configure api
import axios from "axios";

const api=axios.create({
    baseURL:"https://dreamaz-backend.onrender.com/api",
    withCredentials:true
})

export default api;