# table-crispr



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute        | Description | Type     | Default     |
| ---------------- | ---------------- | ----------- | -------- | ----------- |
| `all_data`       | `all_data`       |             | `string` | `undefined` |
| `complete_data`  | `complete_data`  |             | `string` | `undefined` |
| `fasta_metadata` | `fasta_metadata` |             | `string` | `undefined` |
| `gene`           | `gene`           |             | `string` | `undefined` |
| `org_names`      | `org_names`      |             | `string` | `undefined` |
| `size`           | `size`           |             | `string` | `undefined` |


## Dependencies

### Depends on

- [table-crispr](../table-crispr)
- [genomic-card2](../genomic-card2)

### Graph
```mermaid
graph TD;
  result-page --> table-crispr
  result-page --> genomic-card2
  genomic-card2 --> mmsb-select
  genomic-card2 --> circular-barplot
  style result-page fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
