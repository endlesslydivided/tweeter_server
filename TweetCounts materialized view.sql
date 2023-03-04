CREATE MATERIALIZED VIEW tweetCounts AS
SELECT
        "twitterRecord".id,
        COUNT(distinct "likedTweet"."tweetId") likesCount,
        COUNT(distinct "savedTweet"."tweetId") savesCount,
        COUNT(distinct "retweets".id) retweetsCount,
        COUNT(distinct "comments".id) commentsCount
FROM "twitterRecord"  left join "likedTweet" on "twitterRecord".id = "likedTweet"."tweetId"
                        left join "savedTweet" on "twitterRecord".id = "savedTweet"."tweetId"
                        left join "twitterRecord" as "retweets" on
                            "twitterRecord".id = "retweets"."parentRecordId"
                            and "retweets"."isComment" = false
                        left join "twitterRecord" as "comments" on
                            "twitterRecord".id = "comments"."parentRecordId"
                            and "comments"."isComment" = true
group by "twitterRecord".id
