declare module 'mammoth/mammoth.browser' {
 export function extractRawText(options:{arrayBuffer:ArrayBuffer}):Promise<{value:string;messages:{message:string}[]}>;
}
declare module 'pdfjs-dist/build/pdf.worker.min.mjs?url' {const url:string;export default url;}
