/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';


export namespace Components {
  interface LinearCard {
    'all_sgrna': string;
    'gene': string;
    'nb_step': string;
    'onClose'?: () => void;
    'width_bar': string;
    'width_div': string;
  }
  interface ResultPage {
    'all_data': string;
    'complete_data': string;
    'gene': string;
    'org_names': string;
    'size': string;
  }
}

declare global {


  interface HTMLLinearCardElement extends Components.LinearCard, HTMLStencilElement {}
  var HTMLLinearCardElement: {
    prototype: HTMLLinearCardElement;
    new (): HTMLLinearCardElement;
  };

  interface HTMLResultPageElement extends Components.ResultPage, HTMLStencilElement {}
  var HTMLResultPageElement: {
    prototype: HTMLResultPageElement;
    new (): HTMLResultPageElement;
  };
  interface HTMLElementTagNameMap {
    'linear-card': HTMLLinearCardElement;
    'result-page': HTMLResultPageElement;
  }
}

declare namespace LocalJSX {
  interface LinearCard {
    'all_sgrna'?: string;
    'gene'?: string;
    'nb_step'?: string;
    'onClose'?: () => void;
    'width_bar'?: string;
    'width_div'?: string;
  }
  interface ResultPage {
    'all_data'?: string;
    'complete_data'?: string;
    'gene'?: string;
    'org_names'?: string;
    'size'?: string;
  }

  interface IntrinsicElements {
    'linear-card': LinearCard;
    'result-page': ResultPage;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements {
      'linear-card': LocalJSX.LinearCard & JSXBase.HTMLAttributes<HTMLLinearCardElement>;
      'result-page': LocalJSX.ResultPage & JSXBase.HTMLAttributes<HTMLResultPageElement>;
    }
  }
}


