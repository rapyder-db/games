select
  row_number() over (
    order by s.score desc, s.updated_at asc, p.name asc
  ) as rank,
  p.name,
  p.company_name,
  p.email,
  concat((s.score / 10)::int, '/10') as score,
  case
    when s.score >= 70 then 'reward_unlocked'
    else 'not_unlocked'
  end as reward_status,
  s.quiz_version,
  s.updated_at as score_saved_at
from public.scores s
join public.players p on p.id = s.player_id
where s.quiz_version = 'v2'
order by s.score desc, s.updated_at asc, p.name asc
limit 100;
