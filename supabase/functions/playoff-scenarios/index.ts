import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get all standings
    const { data: standings, error: standingsError } = await supabase
      .from('standings_view')
      .select('*');

    if (standingsError) throw standingsError;

    // 2. Get all matches to determine total matches per team
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('home_team_number, away_team_number');

    if (matchesError) throw matchesError;

    // Calculate total scheduled matches for each team
    const totalMatchesByTeam = {};
    matches.forEach(match => {
      if (match.home_team_number) {
        totalMatchesByTeam[match.home_team_number] = (totalMatchesByTeam[match.home_team_number] || 0) + 1;
      }
      if (match.away_team_number) {
        totalMatchesByTeam[match.away_team_number] = (totalMatchesByTeam[match.away_team_number] || 0) + 1;
      }
    });

    // 3. Group standings by night
    const teamsByNight = standings.reduce((acc, team) => {
      const night = team.play_night || 'Unknown';
      if (!acc[night]) acc[night] = [];
      acc[night].push(team);
      return acc;
    }, {});

    const playoffScenarios = {};

    // 4. Calculate scenarios per night
    Object.keys(teamsByNight).forEach(night => {
      const teams = teamsByNight[night];

      // Max wins possible for any team in this night
      const maxWinsAmongAll = Math.max(...teams.map(t => {
        const total = totalMatchesByTeam[t.team_number] || t.matches_played;
        return t.wins + (total - t.matches_played);
      }));

      // Find the first place team (most wins)
      // If there are ties for first, we consider the highest wins
      const highestCurrentWins = Math.max(...teams.map(t => t.wins));

      teams.forEach(t => {
        const totalMatches = totalMatchesByTeam[t.team_number] || t.matches_played;
        const matchesRemaining = totalMatches - t.matches_played;
        const maxPossibleWins = t.wins + matchesRemaining;

        // Magic Number to clinch 1st place
        // Magic Number = (Total Matches for 1st place team) + 1 - (1st place wins) - (2nd place losses)? No.
        // Magic Number = (Matches to win to guarantee finishing ahead of 2nd place)
        // Simplest Magic Number to clinch 1st:
        // Find the maximum max_possible_wins of all OTHER teams.
        const otherTeams = teams.filter(other => other.team_number !== t.team_number);
        const maxWinsOtherTeams = otherTeams.length > 0
            ? Math.max(...otherTeams.map(o => o.wins + (totalMatchesByTeam[o.team_number] || o.matches_played) - o.matches_played))
            : 0;
            
        // To clinch, t.wins + additional_wins > maxWinsOtherTeams
        // So additional_wins_needed = maxWinsOtherTeams - t.wins + 1 (assuming tie is not a clinch)
        // Actually, let's keep it simple. If we need a tie-breaker, it's complex. Let's say + 1 to outright win.
        let magicNumber = maxWinsOtherTeams - t.wins + 1;

        let status = 'On the Hunt';

        // Cannot possibly reach the highest current wins?
        // Wait, if maxPossibleWins < highestCurrentWins, they are Eliminated from 1st place.
        if (maxPossibleWins < highestCurrentWins) {
          status = 'Eliminated';
        } else if (magicNumber <= 0 && matchesRemaining === 0) {
           // Clinched (magic number is <= 0 and season is over, or magic number <= 0 means nobody can catch them)
           status = 'Clinched';
        } else if (magicNumber <= 0) {
           status = 'Clinched';
        } else if (maxPossibleWins >= maxWinsOtherTeams) {
           status = 'Control Destiny'; // If they win out, they are guaranteed at least a tie for 1st
        }

        playoffScenarios[t.team_number] = {
          magicNumber: Math.max(0, magicNumber), // don't show negative
          status,
          matchesRemaining,
          maxPossibleWins
        };
      });
    });

    return new Response(
      JSON.stringify(playoffScenarios),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
