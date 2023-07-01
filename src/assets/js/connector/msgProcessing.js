"use strict";

import Checker from "../checker/checker.js";
import API from "./api.js";

const processing = (msg, api) => {
    let api_name = API.API.api[api];
    let api_para = API.API_PARA[api_name];
    // 检查
    let api_checker = API.API_CHECKER[api_name];
    let success = true;
    api_checker.forEach((element, index) => {
        if(!success) return;
        success = new Checker(msg[index].toString(), element).check();
    });
    if(!success) return false;
    api_para.forEach((element, index) => {
        element[1] = msg[index].toString();
    });
    return api_para;
};
export default {
    processing
};