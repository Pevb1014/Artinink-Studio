import {APP_CONFIG} from '../config.js';
export function validateImage(file){if(!file) throw new Error('Sin archivo'); if(!APP_CONFIG.allowedMime.includes(file.type)) throw new Error('Formato no permitido'); if(file.size>APP_CONFIG.maxUploadMB*1024*1024) throw new Error('Archivo demasiado grande'); return true;}
