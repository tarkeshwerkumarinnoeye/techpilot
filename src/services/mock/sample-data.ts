import type { AnswerOrigin, Difficulty, NewsCategory } from "@/types/content";

/*
 * Sample content for the demo mode. Each array index is a day offset from today
 * (0 = today, 1 = yesterday, ...). Nothing here was fetched from a live source:
 * news and repositories are illustrative and intentionally have no links.
 */

export interface SampleQuestion {
  topic: string;
  difficulty: Difficulty | null;
  question: string;
  answer: string;
  answerOrigin: AnswerOrigin;
}

export interface SampleNews {
  title: string;
  category: NewsCategory;
  summary: string;
}

export interface SampleTopic {
  title: string;
  explanation: string;
  practicalExample: string;
  referenceUrls: string[];
}

export interface SampleRepo {
  fullName: string;
  description: string;
  language: string | null;
  stars: number;
}

export const SAMPLE_DAYS = 7;

export const SAMPLE_PUBLISHER = "TechPilot sample";

export const sampleQuestions: SampleQuestion[] = [
  {
    topic: "Apache Kafka",
    difficulty: "hard",
    question: "How does Kafka achieve exactly-once processing, and where does that guarantee stop?",
    answer:
      "Kafka combines two features. An idempotent producer attaches a producer ID and sequence number to each batch, so the broker can drop duplicates caused by retries. Transactions then let a producer write to several partitions, including the consumer offsets topic, atomically: either all writes become visible or none do.\n\nConsumers must read with isolation.level=read_committed so they skip records from aborted transactions. Together this gives exactly-once semantics for read-process-write loops that stay inside Kafka, which is what Kafka Streams uses with processing.guarantee=exactly_once_v2.\n\nThe guarantee ends at Kafka's boundary. If the consumer writes to an external database or calls an API, you need idempotent writes there too, for example upserts keyed on a business ID or storing offsets in the same database transaction as the data.",
    answerOrigin: "ai_generated",
  },
  {
    topic: "Apache Spark",
    difficulty: "medium",
    question: "What is data skew in Spark, and how would you handle it in a large join?",
    answer:
      "Skew means a few keys hold a disproportionate share of rows, so the tasks that process those keys run far longer than the rest and the stage waits for them. In the Spark UI it shows up as a few tasks with much higher duration and shuffle read size than the median.\n\nOptions, roughly in order of effort: enable Adaptive Query Execution with skew join handling (spark.sql.adaptive.skewJoin.enabled), which splits oversized partitions automatically; broadcast the smaller side if it fits in memory, which removes the shuffle entirely; filter or pre-aggregate the hot keys before the join; or salt the skewed key by appending a random suffix on the large side and exploding the matching keys on the small side.\n\nIn an interview, mention how you would confirm skew first rather than jumping straight to salting.",
    answerOrigin: "ai_generated",
  },
  {
    topic: "SQL",
    difficulty: "easy",
    question: "Explain the difference between ROW_NUMBER, RANK and DENSE_RANK. When would you use each?",
    answer:
      "All three number rows within a window ordered by some column, but they treat ties differently.\n\nROW_NUMBER gives every row a unique number, breaking ties arbitrarily unless the ORDER BY is fully deterministic. Use it for deduplication, for example keeping the latest record per customer with WHERE rn = 1.\n\nRANK gives tied rows the same number and then skips ahead, so scores 100, 100, 90 become 1, 1, 3. Use it when the gap matters, such as competition standings.\n\nDENSE_RANK also gives ties the same number but never skips, so the same scores become 1, 1, 2. Use it for questions like \"find the second-highest salary\", where you want distinct value positions.",
    answerOrigin: "ai_generated",
  },
  {
    topic: "Data modeling",
    difficulty: "medium",
    question: "How would you implement a Slowly Changing Dimension Type 2 table?",
    answer:
      "A Type 2 dimension keeps history by adding a new row whenever a tracked attribute changes, instead of overwriting it. Each row has a surrogate key, the natural business key, the tracked attributes, valid_from and valid_to timestamps, and usually an is_current flag.\n\nThe load runs in two steps: compare incoming records with current rows on the business key, usually via a hash of the tracked columns. For changed keys, close the existing row by setting valid_to and is_current = false, then insert a new current row. New keys are simply inserted. With table formats like Delta or Iceberg, a single MERGE statement can do both steps.\n\nFact tables store the surrogate key that was current when the event happened, so reports reflect the attribute values at that time.",
    answerOrigin: "ai_generated",
  },
  {
    topic: "Pipeline design",
    difficulty: "medium",
    question: "What makes a data pipeline idempotent, and why does it matter for backfills?",
    answer:
      "A pipeline is idempotent when running it several times for the same input produces the same output as running it once. Retries, reruns and backfills then become safe instead of creating duplicates.\n\nCommon techniques: process data in explicit time partitions and overwrite the whole partition on each run; use MERGE or upserts keyed on a stable business key instead of blind appends; derive run parameters from the logical execution date rather than the current clock; and avoid side effects such as sending emails inside the transformation step.\n\nFor backfills this means you can rerun last month's partitions after fixing a bug without manual cleanup, because each run replaces exactly the data it owns.",
    answerOrigin: "ai_generated",
  },
  {
    topic: "Storage formats",
    difficulty: "easy",
    question: "Why are columnar formats like Parquet faster for analytics than row formats like CSV?",
    answer:
      "Analytical queries usually read a few columns across many rows. A columnar format stores each column's values together, so the engine reads only the columns the query needs instead of scanning every field of every row.\n\nStoring similar values together also compresses far better, using encodings like dictionary and run-length encoding. Parquet additionally keeps min and max statistics per row group, which lets engines skip whole blocks that cannot match a filter, known as predicate pushdown.\n\nCSV has no schema, no types, no statistics and no compression by default, so every query parses all of the text. Row formats still make sense for write-heavy workloads that read whole records at a time.",
    answerOrigin: "ai_generated",
  },
  {
    topic: "Stream processing",
    difficulty: "hard",
    question: "What are watermarks in stream processing, and how do they handle late data?",
    answer:
      "A watermark is the engine's estimate of how far event time has progressed. A watermark of 10:05 means the system believes no more events with timestamps before 10:05 will arrive, so windows ending before then can be finalized and emitted.\n\nWatermarks are usually generated as the maximum event time seen minus an allowed delay. A larger delay tolerates more out-of-order data but increases latency and state size.\n\nEvents that arrive after the watermark has passed their window are late. Depending on the engine you can drop them, send them to a side output for separate handling, or keep windows open for an extra allowed-lateness period and emit corrected results. In Spark Structured Streaming, withWatermark also bounds how much state the query keeps.",
    answerOrigin: "ai_generated",
  },
];

export const sampleTopics: SampleTopic[] = [
  {
    title: "Kafka delivery semantics",
    explanation:
      "Kafka can deliver messages at most once, at least once, or exactly once. The guarantee depends on how producers retry, when consumers commit offsets, and whether transactions are used.\n\nAt-least-once is the common default: consumers commit offsets after processing, so a crash causes reprocessing rather than loss. Exactly-once requires an idempotent producer, transactions, and consumers reading with read_committed isolation.",
    practicalExample:
      "# Producer settings for exactly-once writes\nenable.idempotence=true\nacks=all\ntransactional.id=orders-enricher-1\n\n# Consumer settings\nisolation.level=read_committed\nenable.auto.commit=false",
    referenceUrls: ["https://kafka.apache.org/documentation/#semantics"],
  },
  {
    title: "Spark Adaptive Query Execution",
    explanation:
      "Adaptive Query Execution (AQE) lets Spark re-optimize a query while it runs, using statistics collected at shuffle boundaries instead of relying only on estimates made before execution.\n\nIt can merge many small shuffle partitions, switch a sort-merge join to a broadcast join when one side turns out to be small, and split skewed partitions in joins.",
    practicalExample:
      "spark.conf.set(\"spark.sql.adaptive.enabled\", \"true\")\nspark.conf.set(\"spark.sql.adaptive.coalescePartitions.enabled\", \"true\")\nspark.conf.set(\"spark.sql.adaptive.skewJoin.enabled\", \"true\")\n\n# Check the final plan: look for AQEShuffleRead and BroadcastHashJoin\ndf.explain(mode=\"formatted\")",
    referenceUrls: ["https://spark.apache.org/docs/latest/sql-performance-tuning.html"],
  },
  {
    title: "Window functions in SQL",
    explanation:
      "Window functions compute values across a set of rows related to the current row without collapsing them into one result, unlike GROUP BY.\n\nThey power running totals, rankings, moving averages and \"latest record per key\" queries, which come up constantly in data engineering work and interviews.",
    practicalExample:
      "-- Latest order per customer\nSELECT *\nFROM (\n  SELECT o.*,\n         ROW_NUMBER() OVER (\n           PARTITION BY customer_id\n           ORDER BY ordered_at DESC\n         ) AS rn\n  FROM orders o\n) t\nWHERE rn = 1;",
    referenceUrls: ["https://www.postgresql.org/docs/current/tutorial-window.html"],
  },
  {
    title: "Change Data Capture (CDC)",
    explanation:
      "CDC captures inserts, updates and deletes from a source database as a stream of change events, usually by reading the database's transaction log instead of querying tables repeatedly.\n\nIt keeps downstream systems such as a warehouse or search index in sync with low latency and without putting heavy query load on the source.",
    practicalExample:
      "Postgres (logical replication) -> Debezium connector -> Kafka topic per table\n-> stream job applies each change event with MERGE into the lakehouse table,\n   using the primary key and the event's log position to order updates.",
    referenceUrls: ["https://debezium.io/documentation/"],
  },
  {
    title: "Apache Iceberg snapshots and time travel",
    explanation:
      "Iceberg tracks a table as a series of snapshots. Each commit creates a new snapshot that points to the exact set of data files, so readers always see a consistent version even while writers are adding data.\n\nBecause old snapshots are kept until expired, you can query the table as of an earlier point in time or roll back a bad write.",
    practicalExample:
      "-- Spark SQL\nSELECT * FROM db.orders TIMESTAMP AS OF '2026-01-01 00:00:00';\nSELECT * FROM db.orders VERSION AS OF 4810293848120;\n\n-- Inspect history\nSELECT * FROM db.orders.snapshots;",
    referenceUrls: ["https://iceberg.apache.org/docs/latest/"],
  },
  {
    title: "Partitioning vs bucketing",
    explanation:
      "Partitioning splits a table into directories by column values such as date, so queries that filter on that column skip whole directories. It works best for low-cardinality columns used in filters.\n\nBucketing hashes a column into a fixed number of files. It helps joins and aggregations on high-cardinality keys because matching keys land in the same bucket, which can avoid a shuffle.",
    practicalExample:
      "(df.write\n   .partitionBy(\"event_date\")\n   .bucketBy(32, \"user_id\")\n   .sortBy(\"user_id\")\n   .saveAsTable(\"analytics.events\"))",
    referenceUrls: ["https://spark.apache.org/docs/latest/sql-data-sources-load-save-functions.html"],
  },
  {
    title: "Event time and watermarks in Flink",
    explanation:
      "Flink can process records by the time they happened (event time) rather than when they arrive. Watermarks tell Flink how far event time has progressed so it knows when a window is complete.\n\nThe watermark strategy is a trade-off between waiting for late events and producing results quickly.",
    practicalExample:
      "WatermarkStrategy\n  .<Click>forBoundedOutOfOrderness(Duration.ofSeconds(30))\n  .withTimestampAssigner((click, ts) -> click.getEventTime());",
    referenceUrls: ["https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/"],
  },
];

export const sampleNews: SampleNews[][] = [
  [
    {
      title: "How retrieval-augmented generation keeps LLM answers grounded",
      category: "ai",
      summary:
        "RAG retrieves relevant documents at query time and passes them to the model as context. Answers can then cite current, private data without retraining, though retrieval quality becomes the main thing to tune.",
    },
    {
      title: "Lakehouse table formats compared: Iceberg, Delta Lake and Hudi",
      category: "data_engineering",
      summary:
        "All three add ACID transactions, schema evolution and time travel on top of files in object storage. They differ in catalog integrations, update strategies and which engines support them best.",
    },
    {
      title: "Serverless or provisioned compute for batch ETL?",
      category: "cloud",
      summary:
        "Serverless removes cluster management and suits bursty workloads, while provisioned clusters are often cheaper for steady, long-running jobs. Measuring cost per pipeline run makes the choice concrete.",
    },
    {
      title: "Why DuckDB has become a popular tool for local analytics",
      category: "technology",
      summary:
        "DuckDB is an in-process analytical database that queries Parquet and CSV files directly. It is handy for prototyping transformations and testing pipelines without a warehouse.",
    },
    {
      title: "What senior data engineering interviews typically assess",
      category: "careers",
      summary:
        "Beyond SQL and coding, senior loops focus on system design, trade-off reasoning, data modeling and ownership of production incidents. Concrete stories with measurable impact carry the most weight.",
    },
  ],
  [
    {
      title: "Vector databases explained: indexes, recall and latency",
      category: "ai",
      summary:
        "Approximate nearest neighbour indexes such as HNSW and IVF trade a little recall for much faster search. Index parameters and filtering support matter more than raw benchmark numbers.",
    },
    {
      title: "Streaming vs micro-batch: picking the right processing model",
      category: "data_engineering",
      summary:
        "Record-at-a-time streaming offers the lowest latency, while micro-batching is simpler to operate and often fast enough. The right answer depends on the latency the business actually needs.",
    },
    {
      title: "Cost controls every cloud data platform should have",
      category: "cloud",
      summary:
        "Budgets with alerts, auto-suspend for idle compute, storage lifecycle rules and per-team tagging prevent most surprise bills. Reviewing the top ten most expensive queries each month helps too.",
    },
    {
      title: "Rust's growing role in data infrastructure tooling",
      category: "technology",
      summary:
        "Several newer query engines, dataframe libraries and CLI tools are written in Rust for memory safety and speed. Most expose Python bindings, so data engineers use them without writing Rust.",
    },
    {
      title: "Building a portfolio project that shows data engineering depth",
      category: "careers",
      summary:
        "A small end-to-end pipeline with ingestion, modeling, tests, orchestration and documentation shows more than a large but shallow project. Explaining the design decisions is the key part.",
    },
  ],
  [
    {
      title: "Evaluating LLM applications: offline benchmarks vs online feedback",
      category: "ai",
      summary:
        "Offline evaluation sets catch regressions before release, while online signals show how real users experience the system. Mature teams use both and track them per prompt version.",
    },
    {
      title: "Data contracts: agreeing on schemas between producers and consumers",
      category: "data_engineering",
      summary:
        "A data contract defines the schema, semantics and quality expectations of a dataset. Enforcing it in CI on the producer side catches breaking changes before they reach pipelines.",
    },
    {
      title: "Object storage as the foundation of modern data platforms",
      category: "cloud",
      summary:
        "Cheap, durable object storage separates storage from compute, letting several engines share the same data. Open table formats add the transactional guarantees object stores lack.",
    },
    {
      title: "How to talk about trade-offs in system design interviews",
      category: "careers",
      summary:
        "Interviewers look for explicit reasoning: what you optimize for, what you give up and how you would revisit the decision. Naming alternatives you rejected is as important as the final design.",
    },
  ],
  [
    {
      title: "Fine-tuning vs prompting: when each approach makes sense",
      category: "ai",
      summary:
        "Prompting and retrieval cover most use cases with less effort. Fine-tuning helps when you need a consistent style or format, or a smaller, cheaper model for a narrow task.",
    },
    {
      title: "Orchestration tools compared: Airflow, Dagster and Prefect",
      category: "data_engineering",
      summary:
        "Airflow has the largest ecosystem, Dagster centres on data assets and lineage, and Prefect emphasizes dynamic Python workflows. Team familiarity often matters more than feature lists.",
    },
    {
      title: "Apache Arrow as a common in-memory format across data tools",
      category: "technology",
      summary:
        "Arrow defines a columnar memory layout that many engines share, so data moves between tools without costly serialization. It underpins much of today's fast Python data tooling.",
    },
    {
      title: "Multi-region data replication: consistency and cost",
      category: "cloud",
      summary:
        "Replicating data across regions improves availability but adds transfer costs and consistency questions. Most analytics workloads accept asynchronous replication with a known lag.",
    },
  ],
  [
    {
      title: "AI agents in data workflows: where they help and where they don't",
      category: "ai",
      summary:
        "Agents can draft SQL, summarize incidents and triage data quality alerts. They still need guardrails, review steps and narrow permissions before touching production data.",
    },
    {
      title: "Data quality checks worth adding to every pipeline",
      category: "data_engineering",
      summary:
        "Row counts, null checks on key columns, uniqueness of primary keys, freshness and accepted value ranges catch most issues. Failing fast before publishing is cheaper than fixing dashboards later.",
    },
    {
      title: "Infrastructure as code for data platforms",
      category: "cloud",
      summary:
        "Defining warehouses, buckets, permissions and schedulers in code makes environments reproducible and reviewable. It also makes it easier to spin up short-lived test environments.",
    },
    {
      title: "Preparing a story bank for behavioral interviews",
      category: "careers",
      summary:
        "A handful of well-prepared stories about conflict, failure, ownership and impact can answer most behavioral questions. Structure each one with situation, action and measurable result.",
    },
  ],
  [
    {
      title: "Embeddings 101: turning text into vectors for search",
      category: "ai",
      summary:
        "Embedding models map text to vectors so that similar meanings end up close together. Chunking strategy and model choice have a large effect on search quality.",
    },
    {
      title: "Why idempotent writes simplify pipeline recovery",
      category: "data_engineering",
      summary:
        "When every run overwrites or merges exactly the data it owns, retries and backfills become safe. It turns incident recovery into a rerun instead of manual cleanup.",
    },
    {
      title: "Observability for data systems: metrics, logs and lineage",
      category: "technology",
      summary:
        "Pipeline metrics show health, logs explain failures and lineage shows what is affected downstream. Together they shorten the time from alert to root cause.",
    },
    {
      title: "Skills that separate mid-level from senior data engineers",
      category: "careers",
      summary:
        "Senior engineers scope ambiguous problems, design for operability and cost, and raise the quality bar for the team. Technical depth matters, but so does influence across teams.",
    },
  ],
  [
    {
      title: "Small language models and on-device inference",
      category: "ai",
      summary:
        "Smaller models can run on laptops and phones, reducing latency and keeping data local. They work well for focused tasks such as classification, extraction and short summaries.",
    },
    {
      title: "Schema evolution strategies for Parquet and Avro",
      category: "data_engineering",
      summary:
        "Adding optional columns is usually safe, while renaming or changing types needs care. Schema registries and table formats help enforce compatibility rules automatically.",
    },
    {
      title: "Kubernetes for data workloads: benefits and operational costs",
      category: "cloud",
      summary:
        "Kubernetes gives flexible scheduling and isolation for Spark, Flink and Airflow workers. The trade-off is significant operational overhead compared with managed services.",
    },
    {
      title: "Semantic layers and consistent business metrics",
      category: "technology",
      summary:
        "A semantic layer defines metrics such as revenue or active users once and serves them to every BI tool. It prevents different dashboards from reporting different numbers.",
    },
  ],
];

/** Day offset 3 is intentionally empty to demonstrate the "no content" state. */
export const sampleRepos: SampleRepo[][] = [
  [
    { fullName: "sample-org/lakehouse-quickstart", description: "Local lakehouse playground with Iceberg tables, a REST catalog and example queries.", language: "Python", stars: 2140 },
    { fullName: "sample-org/agent-eval-kit", description: "Toolkit for writing evaluation suites for LLM agents and tracking results per prompt version.", language: "TypeScript", stars: 1835 },
    { fullName: "sample-org/stream-sql", description: "Write streaming pipelines in SQL with exactly-once sinks for Postgres and object storage.", language: "Rust", stars: 1290 },
    { fullName: "sample-org/dq-checks", description: "Declarative data quality checks that run in CI and inside orchestrators.", language: "Python", stars: 960 },
    { fullName: "sample-org/tiny-vector", description: "Embeddable vector index with HNSW and metadata filtering.", language: "Go", stars: 710 },
  ],
  [
    { fullName: "sample-org/cdc-bridge", description: "Lightweight change data capture from Postgres to Kafka and cloud storage.", language: "Go", stars: 1980 },
    { fullName: "sample-org/notebook-to-pipeline", description: "Turn exploratory notebooks into tested, scheduled pipelines.", language: "Python", stars: 1520 },
    { fullName: "sample-org/llm-gateway", description: "Self-hosted gateway for routing, caching and rate-limiting LLM API calls.", language: "TypeScript", stars: 1305 },
    { fullName: "sample-org/parquet-inspect", description: "CLI to inspect Parquet metadata, row groups and column statistics.", language: "Rust", stars: 870 },
    { fullName: "sample-org/dbt-style-guide", description: "Opinionated conventions and linters for analytics engineering projects.", language: null, stars: 640 },
  ],
  [
    { fullName: "sample-org/rag-starter", description: "Minimal retrieval-augmented generation app with evaluation scripts.", language: "Python", stars: 2410 },
    { fullName: "sample-org/flink-recipes", description: "Copy-paste examples for common Flink streaming patterns.", language: "Java", stars: 1120 },
    { fullName: "sample-org/cost-watch", description: "Daily cloud data platform cost reports with anomaly alerts.", language: "Python", stars: 905 },
    { fullName: "sample-org/schema-diff", description: "Detect breaking schema changes between dataset versions.", language: "TypeScript", stars: 590 },
  ],
  [],
  [
    { fullName: "sample-org/airflow-lite", description: "Minimal DAG runner for small teams that want scheduling without a full Airflow deployment.", language: "Python", stars: 1760 },
    { fullName: "sample-org/sql-interview-lab", description: "Practice SQL interview problems against a local DuckDB database.", language: "SQL", stars: 1430 },
    { fullName: "sample-org/kafka-ui-lite", description: "Browser UI for inspecting Kafka topics, consumer groups and lag.", language: "TypeScript", stars: 1010 },
    { fullName: "sample-org/arrow-bench", description: "Benchmarks comparing dataframe libraries on common transformations.", language: "Python", stars: 655 },
  ],
  [
    { fullName: "sample-org/lineage-graph", description: "Column-level lineage extraction from SQL files.", language: "Python", stars: 1650 },
    { fullName: "sample-org/edge-llm", description: "Run small language models on-device with a simple HTTP API.", language: "C++", stars: 1480 },
    { fullName: "sample-org/iceberg-maintenance", description: "Scheduled compaction and snapshot expiry for Iceberg tables.", language: "Java", stars: 820 },
    { fullName: "sample-org/de-roadmap", description: "Curated learning path for data engineering fundamentals.", language: null, stars: 760 },
  ],
  [
    { fullName: "sample-org/semantic-metrics", description: "Define business metrics once and query them from any BI tool.", language: "TypeScript", stars: 1390 },
    { fullName: "sample-org/spark-skew-doctor", description: "Detect skewed joins in Spark event logs and suggest fixes.", language: "Scala", stars: 970 },
    { fullName: "sample-org/k8s-data-stack", description: "Helm charts for running Spark, Airflow and Trino on Kubernetes.", language: null, stars: 880 },
    { fullName: "sample-org/embed-cli", description: "Generate and compare text embeddings from the command line.", language: "Python", stars: 530 },
  ],
];
