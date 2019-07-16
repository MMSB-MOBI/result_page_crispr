# table-crispr



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute       | Description | Type     | Default     |
| --------------- | --------------- | ----------- | -------- | ----------- |
| `all_data`      | `all_data`      |             | `string` | `undefined` |
| `complete_data` | `complete_data` |             | `string` | `undefined` |
| `gene`          | `gene`          |             | `string` | `undefined` |
| `org_names`     | `org_names`     |             | `string` | `undefined` |


## Dependencies

### Depends on

- table-crispr
- genomic-card
- linear-card
- linear-card

### Graph
```mermaid
graph TD;
  result-page --> table-crispr
  result-page --> genomic-card
  result-page --> linear-card
  result-page --> linear-card
  table-crispr --> radial-crispr
  style result-page fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
