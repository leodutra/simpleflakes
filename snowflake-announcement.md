# Announcing Snowflake

Tuesday, 1 June 2010

A while back we [announced on our API developers list](http://groups.google.com/group/twitter-development-talk/browse_thread/thread/5152a34a8ae6ccb6/1edb5cd6002f6499) that we would change the way we generate unique ID numbers for tweets.

While we’re not quite ready to make this change, we’ve been hard at work on [Snowflake](http://github.com/twitter/snowflake) which is the internal service to generate these ids. To give everyone a chance to familiarize themselves with the techniques we’re employing and how it’ll affect anyone building on top of the Twitter platform we are open sourcing the Snowflake code base today.

Before I go further, let me provide some context.

## The Problem

We currently use MySQL to store most of our online data. In the beginning, the data was in one small database instance which in turn became one large database instance and eventually many large database clusters. For various reasons, the details of which merit a whole blog post, we’re working to replace many of these systems with [the Cassandra distributed database](http://cassandra.apache.org/) or horizontally sharded MySQL (using [gizzard](http://github.com/twitter/gizzard)).

Unlike MySQL, Cassandra has no built-in way of generating unique ids – nor should it, since at the scale where Cassandra becomes interesting, it would be difficult to provide a one-size-fits-all solution for ids. Same goes for sharded MySQL.

Our requirements for this system were pretty simple, yet demanding:

We needed something that could generate tens of thousands of ids per second in a highly available manner. This naturally led us to choose an uncoordinated approach.

These ids need to be *roughly sortable*, meaning that if tweets A and B are posted around the same time, they should have ids in close proximity to one another since this is how we and most Twitter clients sort tweets.\[1\]

Additionally, these numbers have to fit into 64 bits. We’ve been through the painful process of growing the number of bits used to store tweet ids [before](http://www.twitpocalypse.com/). It’s unsurprisingly hard to do when you have over [100,000 different codebases involved](http://social.venturebeat.com/2010/04/14/twitter-applications/).

## Options

We considered a number of approaches: MySQL-based ticket servers ([like flickr uses](http://code.flickr.com/blog/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/)), but those didn’t give us the ordering guarantees we needed without building some sort of re-syncing routine. We also considered various UUIDs, but all the schemes we could find required 128 bits. After that we looked at Zookeeper sequential nodes, but were unable to get the performance characteristics we needed and we feared that the coordinated approach would lower our availability for no real payoff.

## Solution

To generate the roughly-sorted 64 bit ids in an uncoordinated manner, we settled on a composition of: timestamp, worker number and sequence number.

Sequence numbers are per-thread and worker numbers are chosen at startup via zookeeper (though that’s overridable via a config file).

We encourage you to peruse and play with the code: you’ll find it on [github](https://github.com/twitter/snowflake). Please remember, however, that it is currently alpha-quality software that we aren’t yet running in production and is very likely to change.

## Feedback

If you find bugs, please report them on github. If you are having trouble understanding something, come ask in the [#twinfra](https://twitter.com/hashtag/twinfra) IRC channel on freenode. If you find anything that you think may be a security problem, please email [\[email protected\]](https://blog.x.com/cdn-cgi/l/email-protection) (and cc myself: [\[email protected\]](https://blog.x.com/cdn-cgi/l/email-protection)).

\[1\] In mathematical terms, although the tweets will no longer be sorted, they will be [k-sorted](http://ci.nii.ac.jp/naid/110002673489/). We’re aiming to keep our k below 1 second, meaning that tweets posted within a second of one another will be within a second of one another in the id space too.

**Did someone say … cookies?**

X and its partners use cookies to provide you with a better, safer and faster service and to support our business. Some cookies are necessary to use our services, improve our services, and make sure they work properly. [Show more about your choices](https://help.twitter.com/rules-and-policies/twitter-cookies).
