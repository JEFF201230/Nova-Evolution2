# PROGRAM-014 - BENCHMARK REPORT

## Benchmark Basis

Measurements use deterministic scheduler ticks. This avoids wall-clock noise and makes the benchmark reproducible in tests.

## Stress Benchmark

| Metric | Value |
| --- | ---: |
| Maximum supported concurrent PDS | 16 |
| Throughput | 16 PDS/tick |
| Average latency | 1 tick |
| Scheduling efficiency | 1.000 |
| Governance overhead | 48 ticks |
| Trace records | 176 |

## Portfolio Benchmark

| Metric | Value |
| --- | ---: |
| Programs | 10 |
| Mission Orders | 30 |
| Campaigns | 100 |
| Max concurrent PDS | 5 |
| Throughput | 5 PDS/tick |
| Scheduling efficiency | 1.000 |
| Trace records | 150 |

## Decision

Benchmark established.
