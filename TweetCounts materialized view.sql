CREATE MATERIALIZED VIEW "tweetCounts" AS
SELECT
        "twitterRecord".id "tweetId",
        COUNT(distinct "likedTweet"."userId") "likesCount",
        COUNT(distinct "savedTweet"."userId") "savesCount",
        COUNT(distinct "retweets".id) "retweetsCount",
        COUNT(distinct "comments".id) "commentsCount"
FROM "twitterRecord"    left join "likedTweet" on "twitterRecord".id = "likedTweet"."tweetId"
                        left join "savedTweet" on "twitterRecord".id = "savedTweet"."tweetId"
                        left join "twitterRecord" as "retweets" on
                            "twitterRecord".id = "retweets"."parentRecordId"
                            and "retweets"."isComment" = false and "retweets"."deletedAt" IS NULL
                        left join "twitterRecord" as "comments" on
                            "twitterRecord".id = "comments"."parentRecordId"
                            and "comments"."isComment" = true and "comments"."deletedAt" IS NULL
where "twitterRecord"."deletedAt" IS NULL
group by "twitterRecord".id;

--▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
create function prrefreshcounts() returns trigger
    language plpgsql
as
$$
BEGIN
    REFRESH MATERIALIZED VIEW  "tweetCounts";
    RETURN NULL;
END;
$$;

alter function prrefreshcounts() owner to postgres;

create trigger tgrefreshcountslikes
    after insert or update or delete
    on "likedTweet"
execute procedure prrefreshcounts();

create trigger tgrefreshcountssaves
    after insert or update or delete
    on "savedTweet"
execute procedure prrefreshcounts();

create trigger tgrefreshcounts
    after insert or update or delete
    on "twitterRecord"
execute procedure prrefreshcounts();


