# genomic-card



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type       | Default     |
| ----------------- | ------------------ | ----------- | ---------- | ----------- |
| `all_data`        | `all_data`         |             | `string`   | `undefined` |
| `diagonal_svg`    | `diagonal_svg`     |             | `number`   | `undefined` |
| `gene`            | `gene`             |             | `string`   | `undefined` |
| `org_names`       | `org_names`        |             | `string`   | `undefined` |
| `selectedSection` | `selected-section` |             | `number`   | `-1`        |
| `sgrnaSelected`   | `sgrna-selected`   |             | `string`   | `undefined` |
| `size`            | `size`             |             | `string`   | `undefined` |
| `sizeSelected`    | `size-selected`    |             | `number`   | `undefined` |
| `subSgrna`        | --                 |             | `string[]` | `undefined` |


## Events

| Event           | Description | Type               |
| --------------- | ----------- | ------------------ |
| `changeOrgCard` |             | `CustomEvent<any>` |
| `changeRefCard` |             | `CustomEvent<any>` |
| `sgDataSection` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [result-page](../result-page)

### Depends on

- mmsb-select

### Graph
```mermaid
graph TD;
  genomic-card --> mmsb-select
  result-page --> genomic-card
  style genomic-card fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*