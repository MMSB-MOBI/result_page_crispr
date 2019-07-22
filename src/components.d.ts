/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';


export namespace Components {
  interface ResultPage {
    'all_data': string;
    'complete_data': string;
    'gene': string;
    'org_names': string;
    'size': string;
  }
}

declare global {


  interface HTMLResultPageElement extends Components.ResultPage, HTMLStencilElement {}
  var HTMLResultPageElement: {
    prototype: HTMLResultPageElement;
    new (): HTMLResultPageElement;
  };
  interface HTMLElementTagNameMap {
    'result-page': HTMLResultPageElement;
  }
}

declare namespace LocalJSX {
  interface ResultPage extends JSXBase.HTMLAttributes<HTMLResultPageElement> {
    'all_data'?: string;
    'complete_data'?: string;
    'gene'?: string;
    'org_names'?: string;
    'size'?: string;
  }

  interface IntrinsicElements {
    'result-page': ResultPage;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements extends LocalJSX.IntrinsicElements {}
  }
}


