export async function api<T>(url:string,init?:RequestInit):Promise<T>{const response=await fetch(url,init);const data=await response.json() as T&{error?:string};if(!response.ok)throw new Error(data.error||`Request failed (${response.status})`);return data;}
export function jsonPost(body:unknown):RequestInit{return {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)};}
export function localToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
