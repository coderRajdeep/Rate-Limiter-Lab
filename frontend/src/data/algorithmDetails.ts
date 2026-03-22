export interface AlgorithmDetailData {
  id: string;
  name: string;
  shortSummary: string;
  howItWorks: string[];
  visualExplanation: string;
  pros: string[];
  cons: string[];
  useCases: string[];
  whenToUse: string;
  whenNotToUse: string;
}

export const algorithmDetailsData: Record<string, AlgorithmDetailData> = {
  'token-bucket': {
    id: 'token-bucket',
    name: 'Token Bucket',
    shortSummary: 'Tokens are added to a bucket at a fixed rate. Each request consumes a token. If the bucket is empty, the request is dropped.',
    howItWorks: [
      'A bucket is created with a pre-defined maximum capacity of tokens.',
      'Tokens are continuously added to the bucket at a fixed, constant rate.',
      'When a request arrives, the system checks if there is at least one token in the bucket.',
      'If a token is available, it is consumed and the request proceeds in the system.',
      'If the bucket is empty, the request is rejected or queued depending on the exact strategy.'
    ],
    visualExplanation: 'Imagine a physical bucket where someone drops a coin every second. Each time you want to make a request, you must take a coin out. If the bucket is full, new coins spill over and are lost. If you try to take a coin but the bucket is empty, you must wait.',
    pros: [
      'Very memory efficient: only requires storing the token count and the timestamp of the last refill.',
      'Allows bursts of traffic natively up to the bucket capacity.',
      'Simple to understand, implement, and reason about.'
    ],
    cons: [
      'Configuring two parameters (bucket size and refill rate) can sometimes be unintuitive for operators.',
      'If not carefully tuned, large bursts can still overwhelm downstream backend services temporarily.'
    ],
    useCases: [
      'API rate limiting where occasional bursts are expected but long-term sustained rate must be capped.',
      'Implementing network bandwidth throttling (Amazon EC2 network interfaces use this).'
    ],
    whenToUse: 'When you need a simple algorithm that supports bursty traffic while guaranteeing an average overall rate.',
    whenNotToUse: 'When strict smoothness of traffic is required and bursts cannot be tolerated at all.'
  },
  'leaky-bucket': {
    id: 'leaky-bucket',
    name: 'Leaky Bucket',
    shortSummary: 'Requests are added to a queue (the bucket). They are processed (leak out) at a constant rate. If the queue is full, new requests are dropped.',
    howItWorks: [
      'A queue acts as a bucket holding incoming requests.',
      'When a request arrives, it is appended to the queue if there is room.',
      'If the queue is full when the request arrives, it is discarded immediately.',
      'A background process (or logic triggered periodically) pulls requests from the queue at a strictly constant rate.',
      'The output rate of requests sent downstream is perfectly smooth and constant.'
    ],
    visualExplanation: 'Imagine a bucket with a small hole at the bottom. You can pour water into the top of the bucket at any speed, but it only drips out the bottom at a steady, unchanging rate. If you pour too fast, the bucket overflows and the extra water spills on the floor.',
    pros: [
      'Produces a very smooth, predictable, and strictly controlled output rate downstream.',
      'Memory efficient: depends on the size of the queue defined.',
      'Prevents backend services from ever being subjected to a burst.'
    ],
    cons: [
      'A burst of old requests can fill the queue, blocking newer, potentially more important requests from entering.',
      'Does not natively support bursts of execution; all traffic is strictly smoothed.'
    ],
    useCases: [
      'Asynchronous task processing (e.g. sending emails or processing background jobs).',
      'Shopify uses Leaky Bucket for their API endpoints.'
    ],
    whenToUse: 'When you must guarantee that downstream services only see a perfectly stable, constant load, regardless of incoming spike characteristics.',
    whenNotToUse: 'When legitimate traffic bursts need to be processed quickly without being artificially slowed by a queue.'
  },
  'fixed-window': {
    id: 'fixed-window',
    name: 'Fixed Window Counter',
    shortSummary: 'Time is divided into fixed intervals (windows). A counter tracks requests in the current window. If the limit is reached, further requests are blocked until the next window starts.',
    howItWorks: [
      'Time is divided into strictly defined, fixed-size windows (e.g., 10:00:00 to 10:01:00).',
      'Each window has an independent counter, starting at 0.',
      'Each incoming request increments the counter for the current time window.',
      'If the counter exceeds the allowed limit for the window, subsequent requests are dropped.',
      'When the clock ticks over into the a new time window, a fresh counter is started at 0.'
    ],
    visualExplanation: 'Imagine a bouncer standing at a club door counting people. Every minute on the clock, he starts counting from zero. He lets the first 100 people in. Anyone else who arrives before the minute ends is turned away. At the exact start of the next minute, he resets his count and starts letting people in again.',
    pros: [
      'Extremely memory efficient: only requires storing a single counter and timestamp per user.',
      'Simple and fast to execute, especially using atomic counters in systems like Redis.'
    ],
    cons: [
      'The "Boundary Problem": A burst of traffic can occur right at the edges of a window. A user could send a full quota at 10:00:59, and another full quota at 10:01:01, effectively doubling the allowed rate across a narrow time span.',
      'Spike intensity is not smoothed.'
    ],
    useCases: [
      'Simple tier-based quota application where strict, second-by-second enforcement is not critical.',
      'Monthly API call limitations.'
    ],
    whenToUse: 'When memory efficiency and simplicity are paramount, and the boundary problem burst risk is acceptable.',
    whenNotToUse: 'When strict rate enforcement over any given continuous slice of time is required to protect backend stability.'
  },
  'sliding-window-log': {
    id: 'sliding-window-log',
    name: 'Sliding Window Log',
    shortSummary: 'Keeps a timestamp log of every request. When evaluating a new request, old logs are cleared, and if the log size is below the limit, the request is accepted.',
    howItWorks: [
      'The system maintains a time-ordered log (list) of timestamps for every accepted request from a user.',
      'When a new request arrives, the system calculates the start of the current sliding window: `currentTime - windowSize`.',
      'The log is parsed, and any timestamps older than the start of the sliding window are discarded.',
      'After cleanup, the system checks the size of the remaining log.',
      'If the log size is less than the limit, the new timestamp is added and the request is accepted. Otherwise, it is dropped.'
    ],
    visualExplanation: 'Imagine keeping a ledger of exactly when every person entered a room. Before deciding if a new person can enter, you cross out the names of anyone who entered more than an hour ago. You then count the names still on the list. If it’s less than the limit, you write down the new person’s arrival time and let them in.',
    pros: [
      'Solves the boundary problem of Fixed Window: the rate is accurately enforced across *any* rolling time window.',
      'Highly precise rate limiting.'
    ],
    cons: [
      'Very memory intensive: must store a timestamp for every single request made within the window duration.',
      'Higher computational cost: requires cleaning up old logs and counting entries on every single request.'
    ],
    useCases: [
      'Highly sensitive endpoints where absolute precision is necessary and request volumes are relatively low.',
      'Strict security API enforcement.'
    ],
    whenToUse: 'When high precision is absolutely required and strict enforcement trumps memory cost.',
    whenNotToUse: 'When anticipating very high traffic volume, where storing millions of timestamps would cause memory starvation.'
  },
  'sliding-window-counter': {
    id: 'sliding-window-counter',
    name: 'Sliding Window Counter',
    shortSummary: 'A hybrid approach that uses fixed windows but smoothly estimates the sliding count based on a weighted average of the previous and current window.',
    howItWorks: [
      'Like Fixed Window, it maintains atomic counters for discrete time intervals.',
      'When a request arrives, the system looks at the counter for the *current* window, and the counter for the *previous* window.',
      'It calculates a weighted estimation of requests in the theoretical sliding window. The formula is often: `(Previous Window Count * weight of previous window overlap) + Current Window Count`.',
      'If this estimated total exceeds the limit, the request is dropped. Otherwise, the current window counter is incremented.',
      'Weight is determined by how much of the previous window falls within the rolling timeframe.'
    ],
    visualExplanation: 'Imagine we only keep hourly counts, but we want a rolling hour estimate. If it is 1:15, the past rolling hour is 12:15 to 1:15. We know exactly how many arrived this hour (1:00-1:15). Since 12:15 to 1:00 represents 75% of the previous hour, we assume 75% of the total requests from the 12:00-1:00 bucket happened in that span, and add them together.',
    pros: [
      'Excellent balance: Smoothes out the boundary burst problem of Fixed Window.',
      'Extremely memory efficient: only requires storing two counters per user, unlike Sliding Window Log.',
      'Cloudflare utilizes this approach for their massive-scale distributed rate limiting.'
    ],
    cons: [
      'It is an approximation: assumes traffic is evenly distributed throughout the previous window, which may not be strictly true, occasionally permitting marginally more or less traffic than a perfect sliding log.'
    ],
    useCases: [
      'High-performance, large-scale distributed systems where both memory efficiency and burst protection are critical.',
      'DDoS prevention and global API gateways.'
    ],
    whenToUse: 'In almost all modern, high-scale generic rate limiting deployments as the optimal default.',
    whenNotToUse: 'When you need 100.00% precision on a per-millisecond basis and can afford the memory for a full log.'
  }
};
