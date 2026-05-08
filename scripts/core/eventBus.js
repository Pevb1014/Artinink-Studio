const listeners=new Map();
export const eventBus={on:(e,fn)=>{if(!listeners.has(e))listeners.set(e,new Set());listeners.get(e).add(fn);},emit:(e,p)=>listeners.get(e)?.forEach(fn=>fn(p))};
