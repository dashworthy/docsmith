# parqet

A tiny command-line tool for converting CSV files to Parquet without a running database.
It streams rows so a multi-gigabyte export never has to fit in memory, infers column types
from a sample, and lets you override any of them when the guess is wrong.

## Why parqet

Analysts on our team kept loading raw CSVs straight into notebooks, which was slow and
re-parsed types on every read. Converting once to Parquet made repeat queries roughly
ten times faster and cut disk use by more than half, but the existing tools all wanted a
Spark cluster or a Python environment nobody wanted to maintain. `parqet` is a single
static binary with none of that.

## Installation

```bash
# macOS / Linux
brew install dashworthy/tap/parqet

# or grab a release binary
curl -L https://github.com/dashworthy/parqet/releases/latest/download/parqet-$(uname -s) -o parqet
chmod +x parqet
```

## Usage

Convert a single file, letting parqet infer types from the first 1,000 rows:

```bash
parqet convert sales.csv sales.parquet
```

Override a column's type and set the compression codec:

```bash
parqet convert sales.csv sales.parquet \
  --type "order_date=date" \
  --type "amount=decimal(12,2)" \
  --compression zstd
```

## Options

| Flag            | Default   | Description                                             |
| --------------- | --------- | ------------------------------------------------------- |
| `--sample`      | `1000`    | Rows read to infer column types                         |
| `--type`        | —         | Force a column type, e.g. `amount=decimal(12,2)`        |
| `--compression` | `snappy`  | Codec: `snappy`, `zstd`, `gzip`, or `none`              |
| `--delimiter`   | `,`       | Field delimiter in the source CSV                       |
| `--no-header`   | `false`   | Treat the first row as data, name columns `c0, c1, …`   |

## Type inference

parqet reads `--sample` rows and picks the narrowest type that fits every value: `int64`
before `double`, `double` before `string`, and a dedicated `date` type for anything matching
`YYYY-MM-DD`. Empty fields are treated as null and never widen a column on their own. If a
later row violates the inferred type, the conversion stops with the offending row number so
you can fix the data or pin the type with `--type`.

## Limitations

parqet does not yet support nested or repeated fields, and it writes a single Parquet file
rather than a partitioned dataset. Both are on the roadmap. For anything requiring a schema
registry or streaming ingestion, reach for a full data platform instead.
