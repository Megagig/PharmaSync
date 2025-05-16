// Type declarations for modules without @types packages

// If there are still issues with pdfkit
declare module 'pdfkit' {
  import { Readable } from 'stream';
  
  class PDFDocument extends Readable {
    constructor(options?: any);
    
    // Text methods
    text(text: string, x?: number, y?: number, options?: any): this;
    fontSize(size: number): this;
    font(src: string, family?: string): this;
    
    // Graphics methods
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    rect(x: number, y: number, w: number, h: number, options?: any): this;
    circle(x: number, y: number, radius: number, options?: any): this;
    
    // Page methods
    addPage(options?: any): this;
    switchToPage(pageNumber: number): this;
    page: number;
    
    // Content methods
    moveDown(lines?: number): this;
    moveUp(lines?: number): this;
    
    // Finalization
    end(): void;
    
    on(event: string, callback: Function): this;
  }
  
  export default PDFDocument;
}

// If there are still issues with json2csv
declare module 'json2csv' {
  export interface ParserOptions {
    fields?: string[] | { label: string; value: string }[];
    ndjson?: boolean;
    delimiter?: string;
    eol?: string;
    header?: boolean;
    quote?: string;
    transforms?: any[];
    excelStrings?: boolean;
    withBOM?: boolean;
  }
  
  export class Parser {
    constructor(options?: ParserOptions);
    parse(data: any): string;
  }
}
