declare module 'pdfjs-dist/build/pdf.mjs' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export function getDocument(params: {
    data: Uint8Array;
    useSystemFonts?: boolean;
    isEvalSupported?: boolean;
    useWorkerFetch?: boolean;
    disableAutoFetch?: boolean;
  }): {
    promise: Promise<PDFDocumentProxy>;
  };

  interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  interface PDFPageProxy {
    getViewport(params: { scale: number }): { width: number; height: number };
    getTextContent(): Promise<TextContent>;
  }

  interface TextContent {
    items: TextContentItem[];
  }

  interface TextContentItem {
    str: string;
    transform: number[];
    width?: number;
  }
}
