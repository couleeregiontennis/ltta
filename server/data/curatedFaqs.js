// Curated questions and authoritative answers for instant lookup
// These match directly via keyword/FTS before querying Ollama.

export const curatedFaqs = [
  // LTTA League Rules
  {
    topic: 'extreme_heat',
    keywords: 'heat rule hot weather extreme temperature warm 95 104 degrees feels like cancel',
    question: 'What is the extreme heat rule in LTTA?',
    answer: 'If the "Feels Like" temperature exceeds 95°F, any player may request to begin sets at 2-2 (still playing best 2 of 3 sets). If the "Feels Like" temperature exceeds 104°F, league play is canceled by 4:30 PM.'
  },
  {
    topic: 'playing_down',
    keywords: 'playing down level lower play down sub division below rating',
    question: 'Can a player play down a skill level?',
    answer: 'Playing down one level or more results in a penalty: 4 points are awarded to that side and 10 points to the opponents. The only exception is that #4 and #5 levels are interchangeable without penalty.'
  },
  {
    topic: 'playing_up',
    keywords: 'playing up higher level sub play up division above rating',
    question: 'Can a player play up a skill level?',
    answer: 'Yes. Players may compete one skill level up with no penalty (#4 and #5 are also interchangeable). Playing more than one level up carries no penalty, but may prompt a skill re-evaluation after a win.'
  },
  {
    topic: 'rain_weather',
    keywords: 'rain raining rainout weather cancel 5:30 7:00 independent storm wet',
    question: 'What happens if it rains?',
    answer: 'Sessions are independent—rain at 5:30 PM does not automatically cancel 7:00 PM matches. Matches canceled due to weather are excluded from winning percentage calculations. LTTA does not facilitate makeup matches.'
  },
  {
    topic: 'match_time_forfeits',
    keywords: 'forfeit late time start 5:45 7:15 15 minutes tardy no show',
    question: 'When do match forfeits take effect?',
    answer: 'Matches begin promptly at 5:30 PM and 7:00 PM at Green Island Park. Warm-ups are limited to 10 minutes. Forfeits take effect at 5:45 PM and 7:15 PM if players are not on their assigned court (aside from weather delays).'
  },
  {
    topic: 'scoring_format',
    keywords: 'scoring format no ad sets deuce deciding point rules tiebreak',
    question: 'What is the LTTA scoring format?',
    answer: 'Matches use No-Ad scoring (15, 30, 40, Game; at deuce, receiver chooses side for 1 deciding point). Matches are best 2 of 3 sets. Both set tiebreaks (at 6-6) and 3rd set split-set tiebreaks are 7-point tiebreaks (win by 2).'
  },
  {
    topic: 'balls_policy',
    keywords: 'balls tennis balls 5:30 7:00 new recycle leave who brings',
    question: 'What is the ball policy between early and late sessions?',
    answer: '5:30 PM matches leave their balls for the 7:00 PM matches. Winners of the 7:00 PM session may keep the balls or place them in the recycle box. LTTA provides replacements for broken or lost balls.'
  },
  {
    topic: 'court_vacate',
    keywords: '7:00 vacate unfinished stoppage 5:30 time limit off courts',
    question: 'What happens if a 5:30 PM match is not finished by 7:00 PM?',
    answer: '5:30 PM matches must vacate courts by 7:00 PM. Players may relocate by mutual agreement to finish using their own balls. Otherwise, use the score at stoppage: 10 points to the side with more total games, 8 points to the opponent, or 8 points each if total games are tied.'
  },
  {
    topic: 'substitutes',
    keywords: 'sub substitute sub list non sanctioned rating fee roster alternate',
    question: 'How do substitutes work in LTTA?',
    answer: 'Players secure substitutes using the league sub list or a comparable player from the opposite night. When adding a substitute not on the list, ensure their tennis history fits the position and notify the coordinator prior to the match. Playing an unsanctioned sub results in only 1 point awarded (opponents get 10).'
  },
  {
    topic: 'standings_tiebreaker',
    keywords: 'standings tie tiebreaker championship head to head winning percentage points',
    question: 'How are league standings and tiebreakers calculated?',
    answer: 'Standings are determined by Winning Percentage (Total Points Earned ÷ Total Points Available), excluding weather cancellations. A tie in percentage is broken by Head-to-Head record. The Tuesday champion plays the Wednesday champion for the overall title.'
  },
  {
    topic: 'fees',
    keywords: 'fee player fee cost league dues 25 dollars money pay',
    question: 'What is the player fee for the season?',
    answer: 'The player fee is $25 per roster slot (covers balls and courts). Captains collect fees and submit them to the coordinator by the second week of play. Shared roster spots (e.g., couples) owe a single $25 fee.'
  },

  // Official Tennis / USTA Friend at Court Rules
  {
    topic: 'serve_net_cord',
    keywords: 'net cord serve let service box lands in hit net tape',
    question: 'What happens if a serve hits the net cord and lands in the service box?',
    answer: 'It is a service let. The serve does not count, and the server serves that service again (first or second serve). A service let on a second serve does not cancel a previous fault.'
  },
  {
    topic: 'ball_on_line',
    keywords: 'ball line in out line good touches line edge',
    question: 'Is a ball that touches the line in or out?',
    answer: 'A ball touching any part of the line is good (in). A ball 99% out is still 100% good. A player may not call a ball out unless they clearly see space between where the ball bounced and the line.'
  },
  {
    topic: 'doubtful_call',
    keywords: 'benefit doubt unsure call see close line call replay',
    question: 'Who gets the benefit of the doubt on close calls?',
    answer: 'The opponent always gets the benefit of the doubt. If a player cannot call a ball out with certainty, the ball must be ruled good. You cannot replay a point or call a let because you did not see the ball.'
  },
  {
    topic: 'ball_rolling_on_court',
    keywords: 'ball roll rolling court let stray interference distraction foreign',
    question: 'What happens if a stray ball rolls onto the court during a point?',
    answer: 'Any player may call a let immediately upon noticing the ball. The call must be made promptly without continuing play. If a let is called, the entire point is replayed (including two serves for the server).'
  },
  {
    topic: 'touching_net',
    keywords: 'touch net racket body clothes during point contact post',
    question: 'What happens if a player or their racket touches the net during a point?',
    answer: 'If a player, their racket, or anything they wear or carry touches the net, posts, or opponent court while the ball is in play, that player immediately loses the point.'
  },
  {
    topic: 'reaching_over_net',
    keywords: 'reach over net hit ball before crosses plane invade',
    question: 'Can you reach over the net to hit a ball?',
    answer: 'You cannot hit a ball before it has crossed over to your side of the net (doing so loses the point). However, after hitting the ball on your side, your racket may follow through over the net. Exception: if backspin or wind blows the ball back over the net, you may reach over to hit it without touching the net.'
  },
  {
    topic: 'catching_ball_out',
    keywords: 'catch caught ball air out fly baseline before bounce hand',
    question: 'Can you catch a ball in the air if it is clearly flying out of bounds?',
    answer: 'No. If a player catches or is touched by a ball in play before it bounces, that player loses the point, regardless of whether they are standing inside or outside the court lines.'
  },
  {
    topic: 'hindrance_talking',
    keywords: 'talking hindrance partner yell scream distract noise shout',
    question: 'Is talking during a point considered a hindrance?',
    answer: 'Singles players may not talk during a point. Doubles partners may communicate only when the ball is traveling toward them, not when the ball is traveling toward the opponents. Any deliberate talking that distracts an opponent is a hindrance resulting in loss of point.'
  },
  {
    topic: 'foot_fault',
    keywords: 'foot fault baseline serve line step touch line',
    question: 'What is a foot fault and how is it called?',
    answer: 'A foot fault occurs when a server touches the baseline or court inside the line with their foot before striking the ball. In unofficiated play, foot faults should be avoided and may only be called by the receiver after polite warnings and flagrant continuous violation.'
  },
  {
    topic: 'score_dispute',
    keywords: 'score dispute disagree points games resolution count argument',
    question: 'How should players resolve a dispute over the score?',
    answer: 'Disputes are resolved by: 1) Counting all points/games agreed upon and replaying only the disputed point(s); 2) If court or server is disputed, spin a racket or toss a coin; 3) Resuming from a mutually agreed score.'
  },
  {
    topic: 'double_bounce_double_hit',
    keywords: 'two bounces double bounce carry double hit double strike',
    question: 'What is the rule on double bounces and double hits?',
    answer: 'A ball must be returned before it bounces twice (double bounce loses the point). An accidental continuous double hit during a single stroke is legal, but an intentional carry or two separate swings is a loss of point.'
  },
  {
    topic: 'warmup_serves',
    keywords: 'warm up serves practice first ball in warm-up 10 minutes',
    question: 'Are warm-up serves allowed during the match or "first ball in"?',
    answer: 'Warm-ups are strictly limited to 10 minutes total, and all warm-up serves must be taken before the match starts. "First ball in" serves are not permitted in LTTA.'
  },
  {
    topic: 'hat_falls_off',
    keywords: 'hat falls fell equipment drop clothing let hindrance',
    question: 'What happens if a player\'s hat or equipment falls off during a point?',
    answer: 'If a player\'s hat falls off during a point, an opponent may immediately call a let due to unintentional hindrance, stopping and replaying the point. A player cannot call a let for their own hat or gear falling off.'
  }
];
