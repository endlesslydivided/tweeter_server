
CREATE OR REPLACE FUNCTION GET_USER_TWEETS_IDS(
    authorId uuid,
    "offset" integer = 1,
    "limit" integer = 10
    )
returns setof uuid
LANGUAGE SQL as
$$
  WITH RECURSIVE USER_TWEETS AS
    (
      SELECT * FROM
        (
           SELECT "twitterRecord".* FROM "twitterRecord" WHERE "authorId" = authorId and
                "isComment" = false  ORDER BY "createdAt" ASC OFFSET "offset" LIMIT "limit"
        ) tweets
      UNION
      SELECT "twitterRecord".* FROM "twitterRecord"
          JOIN USER_TWEETS ON "twitterRecord"."parentRecordId" = USER_TWEETS.id
    )
SELECT USER_TWEETS.id FROM USER_TWEETS;
$$;

---------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION GET_USER_LIKED_TWEETS_IDS(
    userId uuid,
    "offset" integer = 1,
    "limit" integer = 10
    )
returns setof uuid
LANGUAGE SQL as
$$
    WITH RECURSIVE USER_LIKED_TWEETS AS (
       SELECT * FROM
        (
           SELECT "twitterRecord".* FROM "twitterRecord" JOIN "likedTweet" lT
               ON "twitterRecord"."id" = lT."tweetId"
           WHERE lT."userId" = userId and
                 "isComment" = false
           ORDER BY "createdAt" ASC OFFSET "offset" LIMIT "limit"
        ) tweets

       UNION

       SELECT "twitterRecord".* FROM "twitterRecord" JOIN USER_LIKED_TWEETS
        ON "twitterRecord"."parentRecordId" = USER_LIKED_TWEETS.id
    )
    SELECT USER_LIKED_TWEETS.id FROM USER_LIKED_TWEETS;
$$;

---------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION GET_USER_SAVED_TWEETS_IDS(
    userId uuid,
    "offset" integer = 1,
    "limit" integer = 10
    )
returns setof uuid
LANGUAGE SQL as
$$
    WITH RECURSIVE USER_SAVED_TWEETS AS (
       SELECT * FROM
        (
           SELECT "twitterRecord".*
           FROM "twitterRecord" JOIN "savedTweet" sT on "twitterRecord"."id" = sT."tweetId"
           WHERE sT."userId" = userId and
                 "isComment" = false ORDER BY "createdAt" ASC OFFSET "offset" LIMIT "limit"
        ) tweets

       UNION

       SELECT "twitterRecord".*
       FROM "twitterRecord"
          JOIN USER_SAVED_TWEETS
              ON "twitterRecord"."parentRecordId" = USER_SAVED_TWEETS.id
    )

    SELECT USER_SAVED_TWEETS.id FROM USER_SAVED_TWEETS;
$$;

---------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION GET_USER_FEED_TWEETS_IDS(
    userId uuid,
    "offset" integer = 1,
    "limit" integer = 10
    )
returns setof uuid
LANGUAGE SQL as
$$
    WITH RECURSIVE USER_FEED_TWEETS AS (
       SELECT * FROM
        (
           SELECT "twitterRecord".*
           FROM "twitterRecord"
           WHERE ("authorId" = userId or
                 "authorId" in (SELECT "subscribedUserId" from subscription where "subscriberId" = userId)) and
                 "isComment" = false ORDER BY "createdAt" ASC OFFSET "offset" LIMIT "limit"
        ) tweets

       UNION

       SELECT "twitterRecord".*
       FROM "twitterRecord"
          JOIN USER_FEED_TWEETS
              ON "twitterRecord"."parentRecordId" = USER_FEED_TWEETS.id
    )

    SELECT USER_FEED_TWEETS.id FROM USER_FEED_TWEETS;
$$;

CREATE OR REPLACE FUNCTION GET_USER_FEED_TWEETS_COUNT(userId uuid)
returns setof bigint
LANGUAGE SQL as
$$
   SELECT COUNT("twitterRecord".*)
   FROM "twitterRecord"
   WHERE ("authorId" = userId or
         "authorId" in (SELECT "subscribedUserId" from subscription where "subscriberId" = userId)) and
         "isComment" = false
$$;

-----------------------------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION GET_COMMENT_REPLIES_IDS(parentRecordId uuid)
returns setof uuid
LANGUAGE SQL as
$$
  WITH RECURSIVE USER_TWEETS AS
    (
      SELECT * FROM
        (
           SELECT "twitterRecord".* FROM "twitterRecord" WHERE "parentRecordId" = parentRecordId and
                "isComment" = true  ORDER BY "createdAt"
        ) tweets
      UNION
      SELECT "twitterRecord".* FROM "twitterRecord"
          JOIN USER_TWEETS ON "twitterRecord"."parentRecordId" = USER_TWEETS.id where "twitterRecord"."isComment" = true
    )
SELECT USER_TWEETS.id FROM USER_TWEETS;
$$;

select get_user_feed_tweets_ids('72b4d98f-0ed2-4495-84ee-d4832f58ddb6',0,10);
select get_user_liked_tweets_ids('72b4d98f-0ed2-4495-84ee-d4832f58ddb6',0,10);
select get_user_saved_tweets_ids('72b4d98f-0ed2-4495-84ee-d4832f58ddb6',0,10);
select get_user_tweets_ids('72b4d98f-0ed2-4495-84ee-d4832f58ddb6',0,10);
select get_user_feed_tweets_count('2fb37af7-a8e7-4de5-a8a0-800b0afe0c42');
select get_comment_replies_ids('2ab27045-464d-4c09-9c9f-b6a3a7109d82');