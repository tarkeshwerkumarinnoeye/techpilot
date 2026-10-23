export interface Feed {
  url: string;
  publisher: string;
}

/** RSS/Atom feeds read for the news section. Gemini assigns the final category. */
export const FEEDS: readonly Feed[] = [
  { url: "https://openai.com/news/rss.xml", publisher: "OpenAI" },
  { url: "https://huggingface.co/blog/feed.xml", publisher: "Hugging Face" },
  { url: "https://blog.google/technology/ai/rss/", publisher: "Google AI" },
  { url: "https://www.databricks.com/feed", publisher: "Databricks" },
  { url: "https://www.dataengineeringweekly.com/feed", publisher: "Data Engineering Weekly" },
  { url: "https://seattledataguy.substack.com/feed", publisher: "Seattle Data Guy" },
  { url: "https://netflixtechblog.com/feed", publisher: "Netflix Tech Blog" },
  { url: "https://aws.amazon.com/blogs/aws/feed/", publisher: "AWS News Blog" },
  { url: "https://cloudblog.withgoogle.com/rss/", publisher: "Google Cloud" },
  { url: "https://techcrunch.com/feed/", publisher: "TechCrunch" },
  { url: "https://www.theverge.com/rss/index.xml", publisher: "The Verge" },
  { url: "https://feeds.arstechnica.com/arstechnica/technology-lab", publisher: "Ars Technica" },
  { url: "https://www.infoq.com/feed/", publisher: "InfoQ" },
  { url: "https://blog.pragmaticengineer.com/rss/", publisher: "The Pragmatic Engineer" },
];

export const INTERVIEW_REPOSITORY = "OBenner/data-engineering-interview-questions";
const INTERVIEW_BRANCH = "master";

/** Topic files from the interview repository, rotated daily. */
export const INTERVIEW_FILES: readonly string[] = [
  "spark.md",
  "sql.md",
  "kafka.md",
  "airflow.md",
  "data-modeling.md",
  "python.md",
  "data-quality.md",
  "flink.md",
  "cdc.md",
  "dbt.md",
  "iceberg.md",
  "system-design.md",
  "bigquery.md",
  "redshift.md",
  "hive.md",
  "aws.md",
  "data-governance.md",
  "observability.md",
  "cost-optimization.md",
  "hudi.md",
  "avro.md",
  "cassandra.md",
  "hadoop.md",
];

export function interviewRawUrl(file: string): string {
  return `https://raw.githubusercontent.com/${INTERVIEW_REPOSITORY}/${INTERVIEW_BRANCH}/content/${file}`;
}

export function interviewSourceUrl(file: string): string {
  return `https://github.com/${INTERVIEW_REPOSITORY}/blob/${INTERVIEW_BRANCH}/content/${file}`;
}

export interface DeTopicSeed {
  title: string;
  referenceUrls: string[];
}

/** Data Engineering topics, rotated daily. Reference links are curated, never generated. */
export const DE_TOPICS: readonly DeTopicSeed[] = [
  { title: "Kafka delivery semantics", referenceUrls: ["https://kafka.apache.org/documentation/#semantics"] },
  { title: "Spark Adaptive Query Execution", referenceUrls: ["https://spark.apache.org/docs/latest/sql-performance-tuning.html"] },
  { title: "Window functions in SQL", referenceUrls: ["https://www.postgresql.org/docs/current/tutorial-window.html"] },
  { title: "Change Data Capture (CDC)", referenceUrls: ["https://debezium.io/documentation/"] },
  { title: "Apache Iceberg snapshots and time travel", referenceUrls: ["https://iceberg.apache.org/docs/latest/"] },
  { title: "Partitioning vs bucketing", referenceUrls: ["https://spark.apache.org/docs/latest/sql-data-sources-load-save-functions.html"] },
  { title: "Event time and watermarks in Flink", referenceUrls: ["https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/"] },
  {
    title: "Slowly Changing Dimensions (Type 2)",
    referenceUrls: ["https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-2/"],
  },
  {
    title: "Star schema and dimensional modeling",
    referenceUrls: ["https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/"],
  },
  { title: "Idempotent pipelines and safe backfills", referenceUrls: ["https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html"] },
  { title: "dbt incremental models", referenceUrls: ["https://docs.getdbt.com/docs/build/incremental-models"] },
  { title: "Data tests in dbt", referenceUrls: ["https://docs.getdbt.com/docs/build/data-tests"] },
  { title: "Parquet file layout: row groups, pages and statistics", referenceUrls: ["https://parquet.apache.org/docs/file-format/"] },
  { title: "Delta Lake transaction log", referenceUrls: ["https://docs.delta.io/latest/delta-intro.html"] },
  { title: "Join strategies in Spark: broadcast, sort-merge and shuffle hash", referenceUrls: ["https://spark.apache.org/docs/latest/sql-performance-tuning.html"] },
  { title: "Kafka partitions and consumer groups", referenceUrls: ["https://kafka.apache.org/documentation/#intro_concepts_and_terms"] },
  { title: "Kafka log compaction", referenceUrls: ["https://kafka.apache.org/documentation/#compaction"] },
  {
    title: "Schema evolution with Avro",
    referenceUrls: ["https://avro.apache.org/docs/", "https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html"],
  },
  {
    title: "Checkpoints and exactly-once state in Flink",
    referenceUrls: ["https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/stateful-stream-processing/"],
  },
  { title: "Reading query plans with EXPLAIN", referenceUrls: ["https://www.postgresql.org/docs/current/using-explain.html"] },
  { title: "Upserts with MERGE", referenceUrls: ["https://www.postgresql.org/docs/current/sql-merge.html"] },
  {
    title: "BigQuery partitioning and clustering",
    referenceUrls: ["https://cloud.google.com/bigquery/docs/partitioned-tables", "https://cloud.google.com/bigquery/docs/clustered-tables"],
  },
  { title: "Snowflake micro-partitions and clustering", referenceUrls: ["https://docs.snowflake.com/en/user-guide/tables-clustering-micropartitions"] },
  { title: "Data lineage with OpenLineage", referenceUrls: ["https://openlineage.io/docs/"] },
  { title: "DuckDB for local analytics", referenceUrls: ["https://duckdb.org/docs/"] },
  { title: "Apache Arrow columnar memory format", referenceUrls: ["https://arrow.apache.org/docs/format/Columnar.html"] },
  { title: "Database indexes: B-tree, hash and BRIN", referenceUrls: ["https://www.postgresql.org/docs/current/indexes-types.html"] },
  { title: "Spark Structured Streaming: triggers and checkpoints", referenceUrls: ["https://spark.apache.org/docs/latest/streaming/index.html"] },
];
