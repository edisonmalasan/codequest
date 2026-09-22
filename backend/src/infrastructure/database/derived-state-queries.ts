import { sql, SQL } from 'drizzle-orm';
import {
  chapters,
  questAttempts,
  questCompletions,
  questPrerequisites,
  quests,
  questStarts,
  streakActivityDays,
  xpEvents,
} from './schema';

export function totalXpQuery(userId: string): SQL {
  return sql`
    select coalesce(sum(${xpEvents.amount}), 0)::integer as total_xp
    from ${xpEvents}
    where ${xpEvents.userId} = ${userId}::uuid
  `;
}

export function questLearningStatusQuery(userId: string, questId: string): SQL {
  return sql`
    select case
      when exists (
        select 1 from ${questCompletions}
        where ${questCompletions.userId} = ${userId}::uuid
          and ${questCompletions.questId} = ${questId}
      ) then 'completed'
      when exists (
        select 1 from ${questStarts}
        where ${questStarts.userId} = ${userId}::uuid
          and ${questStarts.questId} = ${questId}
      ) or exists (
        select 1 from ${questAttempts}
        where ${questAttempts.userId} = ${userId}::uuid
          and ${questAttempts.questId} = ${questId}
      ) then 'in_progress'
      else 'not_started'
    end as learning_status
  `;
}

export function questAvailabilityInputsQuery(
  userId: string,
  questId: string,
): SQL {
  return sql`
    select
      ${questPrerequisites.prerequisiteQuestId} as prerequisite_quest_id,
      (${questCompletions.questId} is not null) as completed
    from ${questPrerequisites}
    left join ${questCompletions}
      on ${questCompletions.userId} = ${userId}::uuid
      and ${questCompletions.questId} = ${questPrerequisites.prerequisiteQuestId}
    where ${questPrerequisites.questId} = ${questId}
    order by ${questPrerequisites.prerequisiteQuestId}
  `;
}

export function orderedStreakActivityDaysQuery(userId: string): SQL {
  return sql`
    select
      ${streakActivityDays.activityDate} as activity_date,
      ${streakActivityDays.timezone} as timezone
    from ${streakActivityDays}
    where ${streakActivityDays.userId} = ${userId}::uuid
    order by ${streakActivityDays.activityDate}
  `;
}

export function orderedJourneyQuestsQuery(journeyId: string): SQL {
  return sql`
    select ${quests.id}
    from ${quests}
    inner join ${chapters}
      on ${chapters.id} = ${quests.chapterId}
    where ${chapters.journeyId} = ${journeyId}
    order by ${chapters.position}, ${quests.position}
  `;
}
