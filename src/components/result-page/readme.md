# table-crispr



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute        | Description | Type     | Default     |
| ---------------- | ---------------- | ----------- | -------- | ----------- |
| `all_data`       | `all_data`       |             | `string` | `undefined` |
| `complete_data`  | `complete_data`  |             | `string` | `undefined` |
| `excluded_names` | `excluded_names` |             | `string` | `undefined` |
| `fasta_metadata` | `fasta_metadata` |             | `string` | `undefined` |
| `gene`           | `gene`           |             | `string` | `undefined` |
| `job_tag`        | `job_tag`        |             | `string` | `undefined` |
| `org_names`      | `org_names`      |             | `string` | `undefined` |
| `total_hits`     | `total_hits`     |             | `number` | `undefined` |


## Dependencies

### Depends on

- [circular-barplot](../circular-barplot)
- [circular-barplot-legend](../circular-barplot-legend)
- [coord-box](../coord-box)
- [table-crispr](../table-crispr)
- [dropdown-menu](../dropdown-menu)

### Graph
```mermaid
graph TD;
  result-page --> circular-barplot
  result-page --> circular-barplot-legend
  result-page --> coord-box
  result-page --> table-crispr
  result-page --> dropdown-menu
  dropdown-menu --> mmsb-select
  style result-page fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
