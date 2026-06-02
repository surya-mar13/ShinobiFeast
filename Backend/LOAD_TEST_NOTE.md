# Backend Load Test Note

Date: 2026-03-17
Environment: Local machine (Windows), server at http://localhost:3000
Tool: autocannon (npx)

## Endpoint Tested

- GET /common-api/categories (lighter query)
- GET /common-api/restaurants?limit=10 (heavier query with populate + pagination)

## Commands Used

- npx autocannon -c 20 -d 15 --renderStatusCodes "http://localhost:3000/common-api/categories"
- npx autocannon -c 50 -d 20 --renderStatusCodes "http://localhost:3000/common-api/categories"
- npx autocannon -c 100 -d 20 --renderStatusCodes "http://localhost:3000/common-api/categories"
- npx autocannon -c 50 -d 20 --renderStatusCodes "http://localhost:3000/common-api/restaurants?limit=10"
- npx autocannon -c 100 -d 20 --renderStatusCodes "http://localhost:3000/common-api/restaurants?limit=10"

## Results

### 1) /common-api/categories

| Concurrency | Avg Req/Sec | Avg Latency | p99 Latency | Total Requests | HTTP Errors |
|---|---:|---:|---:|---:|---:|
| 20 | 3303.87 | 5.54 ms | 13 ms | 49,554 (15s) | 0 |
| 50 | 3444.10 | 14.03 ms | 26 ms | 68,874 (20s) | 0 |
| 100 | 3609.50 | 27.22 ms | 42 ms | 72,181 (20s) | 0 |

### 2) /common-api/restaurants?limit=10

| Concurrency | Avg Req/Sec | Avg Latency | p99 Latency | Total Requests | HTTP Errors |
|---|---:|---:|---:|---:|---:|
| 50 | 747.75 | 66.39 ms | 98 ms | 14,955 (20s) | 0 |
| 100 | 654.40 | 151.85 ms | 260 ms | 13,088 (20s) | 0 |

## Practical Capacity Note

- For lighter read endpoints, current local setup handles about 3.3k to 3.6k requests/sec with low error rate.
- For heavier DB endpoints, practical sustainable throughput is around 650 to 750 requests/sec.
- Throughput drops and latency rises sharply on heavier endpoints at 100 concurrent connections, so 50 concurrency is a safer operating point for this route.

## Recommendation

- Use 50 to 75 concurrent workers as your stress target for heavier routes.
- Add indexes for common filters and watch DB query timings.
- Run the same tests on deployment hardware to get production-grade limits (local numbers are optimistic).
