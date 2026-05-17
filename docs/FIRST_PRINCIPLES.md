# First Principles of simpleflakes

simpleflakes is easiest to understand if you ignore the API surface for a moment and start from the problem.

We want an identifier that is:

- small enough to fit in 64 bits
- sortable by creation time
- cheap to generate in hot paths
- usable across many processes or machines without coordination
- reversible enough to recover when it was created
- safe in JavaScript, where `number` cannot exactly represent every 64-bit integer

Those constraints drive almost every design choice in this library.

## The Core Problem

An ID generator for distributed systems usually has to balance four competing goals:

1. Time order
2. Uniqueness
3. Compact size
4. Operational simplicity

You can optimize any one of these in isolation, but the interesting work starts when you need all four at once.

UUIDs solve uniqueness well, but they are 128 bits and less friendly for integer indexes. Central counters solve ordering and uniqueness, but they require coordination and become a bottleneck. Classic Snowflake-style schemes solve this with timestamp bits plus worker and sequence bits, but they require machine identity and local counter state.

simpleflakes chooses a different tradeoff:

- keep time ordering
- stay inside 64 bits
- remove worker IDs and sequence state
- replace coordination with randomness

That is the first-principles idea behind the library.

## The Inverted Problem

Charlie Munger often described inversion as a better way to think: instead of asking only how to succeed, ask how to fail, then systematically avoid those failure modes.

Applied here, the inverted question is:

"What would an ID scheme look like if we wanted it to be expensive, fragile, hard to sort, and painful to operate in distributed systems?"

The answer would look something like this:

- use identifiers that are larger than necessary
- depend on a central allocator or shared mutable state
- require every node to coordinate before generating IDs
- use a representation that loses integer precision in JavaScript
- make creation time impossible or expensive to recover
- make sort order unrelated to generation time
- hide important constraints behind implicit runtime behavior

From that inversion, the design goals for simpleflakes become clearer:

- 64 bits instead of 128 when the use case permits it
- local generation instead of central coordination
- `bigint` instead of unsafe `number`
- recoverable packed fields instead of opaque randomness only
- timestamp-dominant ordering instead of arbitrary numeric order
- explicit bit-budget tradeoffs instead of pretending constraints do not exist

The library is easier to understand once viewed as the deliberate opposite of a failure-prone distributed ID design.

## The Minimal Model

At its core, a simpleflake is just this:

```text
flake = ((timestamp - epoch) << 23) | randomBits
```

That single expression captures the full model.

- `timestamp - epoch` gives a smaller time value than raw Unix time
- `<< 23` moves that time value into the upper bits
- `randomBits` occupies the lower 23 bits
- `|` merges both parts because their bit ranges do not overlap

The implementation in [src/simpleflakes.ts](/home/leo/Work/simpleflakes/src/simpleflakes.ts) does exactly that.

## Why BigInt Is Mandatory

JavaScript `number` uses IEEE 754 double precision, which cannot exactly represent all 64-bit integers. Once an ID exceeds `Number.MAX_SAFE_INTEGER`, exact integer round-tripping is no longer guaranteed.

simpleflakes therefore uses `bigint` as the canonical representation. That choice is not cosmetic. It is required if a 64-bit integer ID must remain exact.

From first principles:

- the identifier is fundamentally a 64-bit integer
- JavaScript `number` cannot safely hold every 64-bit integer
- therefore the correct runtime type is `bigint`

## Why Use a Custom Epoch

Raw Unix timestamps are large. If you stored milliseconds since 1970 directly, you would waste high bits on history you may not care about.

simpleflakes uses `2000-01-01T00:00:00.000Z` as its default epoch:

```text
946684800000
```

Subtracting a custom epoch gives more useful range inside the same bit budget.

This means the timestamp field stores:

```text
elapsedMilliseconds = timestamp - epoch
```

instead of absolute Unix time.

That is why parsing has to add the epoch back:

```text
timestamp = (flake >> 23) + epoch
```

## Why Put Time in the Upper Bits

If later timestamps should usually compare as larger integers, time must dominate the numeric ordering. The cleanest way to do that is to place the timestamp in the high bits and the per-millisecond differentiator in the low bits.

That gives two useful properties:

- if `ts2 > ts1`, then `flake2 > flake1` when both use the same epoch and valid low bits
- IDs naturally sort by time at integer comparison level

This is why the timestamp gets shifted left by 23 bits before the final merge.

## Why 41 Bits for Time and 23 Bits for Randomness

The entire ID must fit in 64 bits, so the library has a fixed budget:

```text
64 total bits = 41 timestamp bits + 23 random bits
```

That split is the heart of the design.

### 41 timestamp bits

`2^41` milliseconds is about 69.7 years.

That means a custom epoch at the start of year 2000 yields roughly this operating window:

- start: 2000
- limit: around 2069

The exact implementation stores only the elapsed millisecond count in those 41 bits.

### 23 random bits

`2^23 = 8,388,608` possible values.

That gives each millisecond a space of more than 8.3 million distinct low-bit combinations.

Every extra random bit doubles that space. In the small-burst case, that means each additional bit roughly cuts collision risk in half.

From first principles, this solves the question: "How do we avoid shared machine IDs or counters?"

The answer is: by making same-millisecond uniqueness probabilistic instead of coordinated.

### What `2^23` means for collision risk

Those 23 bits are what materially reduce collision probability. They create `8,388,608` random slots for every single millisecond bucket.

If `n` IDs are generated in the same millisecond, the probability of at least one collision is approximately:

```text
p(collision) ≈ 1 - exp(-(n * (n - 1)) / (2 * 2^23))
```

For small `n`, that is very close to:

```text
n * (n - 1) / (2 * 2^23)
```

The important qualifier is "in the same millisecond." A million IDs spread across many milliseconds is a very different situation from a burst of IDs landing inside one timestamp bucket.

Here is the intuition in concrete scenarios:

| IDs generated in the same millisecond | Approximate collision chance | Comparison |
|---------------------------------------|------------------------------|------------|
| 2 | `0.0000119%` or `1 in 8,388,608` | Exactly the same as flipping `23` heads in a row |
| 10 | `0.000536%` or about `1 in 186,000` | Between flipping `17` heads in a row (`1 in 131,072`) and `18` heads in a row (`1 in 262,144`) |
| 100 | `0.0589%` or about `1 in 1,700` | Roughly the same order as rolling four sixes in a row (`1 in 1,296`) |
| 1,000 | `5.78%` or about `1 in 17` | No longer remote; at this burst size collisions become operationally noticeable |

So `2^23` does not eliminate collisions, but it pushes them far enough out that ordinary workloads can usually ignore them while still avoiding the coordination costs of counters, node IDs, or central allocation.

## What Randomness Is Doing

Classic Snowflake designs use lower bits for machine identity and local sequence counters. simpleflakes uses those lower bits for randomness instead.

This changes the contract:

- no machine registration is needed
- no counter state is needed
- no per-process synchronization is needed
- uniqueness within the same millisecond becomes probabilistic rather than deterministic

That tradeoff is intentional.

For many systems, removing coordination is worth more than guaranteeing collision-free generation inside one millisecond on one machine. For systems that need deterministic same-millisecond uniqueness, a node-and-sequence design may be a better fit.

By default, simpleflakes fills those 23 bits with cryptographically secure random values via Web Crypto. The runtime behavior is validated in [tests/integration.test.js](/home/leo/Work/simpleflakes/tests/integration.test.js).

## The Resulting Invariants

Once the layout is fixed, several invariants fall out directly.

### 1. Round-trip parsing is straightforward

Generation and parsing are inverses:

```text
generate: flake = ((ts - epoch) << 23) | randomBits
parse ts:  ((flake >> 23) + epoch)
parse rnd: (flake & ((1 << 23) - 1))
```

That is why `parseSimpleflake(simpleflake(ts, randomBits, epoch))` can recover the original components when the inputs stay within the expected bit ranges. This behavior is covered by [tests/parseSimpleflake.test.js](/home/leo/Work/simpleflakes/tests/parseSimpleflake.test.js).

### 2. Integer ordering tracks timestamp ordering

Because timestamp bits are more significant than random bits, a later timestamp produces a larger integer when all other assumptions are held constant. This is tested in [tests/simpleflake.test.js](/home/leo/Work/simpleflakes/tests/simpleflake.test.js).

### 3. IDs are fixed-width and compact

The binary form is always 64 bits when padded. This is exactly what `binary()` exposes.

### 4. Same-millisecond uniqueness is statistical

Two generators can produce the same ID only if they use the same timestamp, epoch, and random bits. With 23 random bits, the collision space per millisecond is 8,388,608 possibilities.

This is strong enough for many workloads, but it is not a proof of uniqueness. It is a probability distribution.

## What the Library Guarantees

Given valid inputs and a consistent epoch, simpleflakes guarantees:

- a 64-bit bigint representation
- recoverable timestamp and random components
- integer sorting that follows timestamp ordering across different milliseconds
- no dependence on shared machine IDs or sequence counters
- default use of cryptographically secure randomness when available

## What the Library Does Not Guarantee

Just as important, simpleflakes does not guarantee:

- deterministic collision-free generation inside the same millisecond
- generation order within the same millisecond
- protection from out-of-range caller-provided values
- infinite timestamp range

Those are not oversights. They are direct consequences of the chosen constraints.

The implementation keeps the hot path minimal. If you pass explicit `randomBits`, it does not clamp them into 23 bits for you. In other words, the bit budget is part of the caller contract, not just an internal detail.

## Why This Design Is Fast

From a first-principles performance perspective, the algorithm is cheap because generation is mostly:

- one timestamp read
- one random value read or one caller-provided value
- one subtraction
- one left shift
- one bitwise OR

There is no lock, no counter increment loop, no machine-ID lookup, and no network coordination.

That is why the hot path in [src/simpleflakes.ts](/home/leo/Work/simpleflakes/src/simpleflakes.ts) stays extremely small.

## Mapping the API Back to the Model

The public API is just a thin layer over the bit model.

- `simpleflake()` builds the integer from time plus randomness.
- `parseSimpleflake()` reverses the layout into timestamp plus random bits.
- `extractBits()` is the low-level primitive for pulling fields from the integer.
- `binary()` is a visualization helper for seeing the layout directly.
- `SimpleflakeStruct` is the parsed representation.

Nothing here is arbitrary. Each function exists because the format is a packed 64-bit value.

## Operational Implications

If you are using simpleflakes in production, the first-principles view leads to a few practical rules:

1. Store IDs as `bigint` or as strings at system boundaries.
2. Keep the epoch consistent across all producers and consumers.
3. Treat caller-supplied `randomBits` as a low-level input that must remain within `0..8388607`.
4. Do not assume same-millisecond generation order.
5. If you need deterministic uniqueness under extreme same-millisecond concurrency, use a higher-level coordination strategy or a different ID scheme.

## The One-Sentence Summary

simpleflakes is a 64-bit bigint ID scheme that puts elapsed time in the high 41 bits and randomness in the low 23 bits so distributed systems can generate sortable, compact IDs without coordination.
