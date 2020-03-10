import { Component, Prop, h, Element} from '@stencil/core';
import { lollipopPlot, densityPlot } from './d3_plots';

@Component({
  tag: 'occurences-graph',
  styleUrl: 'occurences-graph.css',
  shadow: true
})

export class OccurencesGraph {
// *************************** PROPERTY & CONSTRUCTOR ***************************
    @Element() private element: HTMLElement;
    @Prop() occurences_data: { name: string, coords_count: number }[];

    componentDidRender() {
        const el = this.element.shadowRoot.querySelector('#svg_occurences_graph') as HTMLElement;
        el.innerHTML = "";
        if (this.occurences_data.length <= 5) {
            lollipopPlot(el, this.occurences_data);
        } else {
            densityPlot(el, this.occurences_data)
        }
        
    }

    /*  */
    render() {
        //console.log("PARENT RENDER")
        // console.log(this.all_data);
        // @ts-ignore
        return (<div id="svg_occurences_graph" />)
    }
}


