CREATE MATERIALIZED VIEW "userCounts" AS
SELECT
        "user".id "userId",
        COUNT(distinct "subscriptions"."id") "subscriptionsCount",
        COUNT(distinct "followers"."id") "followersCount",
        COUNT(distinct "twitterRecord".id) "tweetsCount"
FROM "user"
            left join "subscription" as "subscriptions"  on "user".id = "subscriptions"."subscriberId"
            left join "subscription" as "followers" on "user".id = "followers"."subscribedUserId"
            left join "twitterRecord"  on "user".id = "twitterRecord"."authorId"
where "twitterRecord"."deletedAt" IS NULL
group by  "user".id ;

--▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
create function prRefreshUserCounts() returns trigger
    language plpgsql
as
$$
BEGIN
    REFRESH MATERIALIZED VIEW  "userCounts";
    RETURN NULL;
END;
$$;

alter function prRefreshUserCounts() owner to postgres;

create trigger tgRefreshCountsUsersSubs
    after insert or update or delete
    on "subscription"
execute procedure prRefreshUserCounts();

create trigger tgRefreshCountsUsersTweets
    after insert or update or delete
    on "twitterRecord"
execute procedure prRefreshUserCounts();

create trigger tgRefreshCountsUsersUsers
    after insert or update or delete
    on "user"
execute procedure prRefreshUserCounts();