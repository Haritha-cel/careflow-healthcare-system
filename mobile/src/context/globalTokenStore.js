// Breaks the circular dependency:
// axiosInstance → AuthContext → axiosInstance (cycle)
// Now: axiosInstance → globalTokenStore ✅
//      AuthContext → globalTokenStore ✅

let globalSetTokenFunc = null;
let globalSetDTokenFunc = null;

export const getGlobalSetToken = () => globalSetTokenFunc;
export const setGlobalSetToken = (fn) => { globalSetTokenFunc = fn; };

export const getGlobalSetDToken = () => globalSetDTokenFunc;
export const setGlobalSetDToken = (fn) => { globalSetDTokenFunc = fn; };