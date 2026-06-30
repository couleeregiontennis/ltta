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
    let season_id = null;
    try {
      const body = await req.json();
      season_id = body.season_id;
    } catch (e) {
      // Body might be empty or invalid JSON
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get all standings using the proper view
    const { data: standings, error: standingsError } = await supabase
      .from('standings_view')
      .select('*');

    if (standingsError) throw standingsError;

    // 2. Get all matches to determine total matches per team
    // In LTTA, matches are in team_match table
    const matchQuery = supabase
      .from('team_match')
      .select('home_team_id, away_team_id, status');

    // If season_id was provided, we could filter, but let's assume standings_2026_view covers the current season's teams.
    const { data: matches, error: matchesError } = await matchQuery;

    if (matchesError) throw matchesError;

    // We'll map team_id to team_number for easier matching, or just use team_number
    const teamIdToNumber = {};
    standings.forEach(team => {
        teamIdToNumber[team.team_id] = team.team_number;
    });

    // Calculate total scheduled matches for each team (including completed ones)
    const totalMatchesByTeam = {};
    matches.forEach(match => {
      const homeNumber = teamIdToNumber[match.home_team_id];
      const awayNumber = teamIdToNumber[match.away_team_id];

      if (homeNumber) {
        totalMatchesByTeam[homeNumber] = (totalMatchesByTeam[homeNumber] || 0) + 1;
      }
      if (awayNumber) {
        totalMatchesByTeam[awayNumber] = (totalMatchesByTeam[awayNumber] || 0) + 1;
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

      // Find the first place team (most wins)
      const highestCurrentWins = Math.max(...teams.map(t => t.wins || 0));

      teams.forEach(t => {
        const wins = t.wins || 0;
        const totalMatches = totalMatchesByTeam[t.team_number] || t.matches_played || 0;
        const matchesRemaining = totalMatches - (t.matches_played || 0);
        const maxPossibleWins = wins + matchesRemaining;

        // Simplest Magic Number to clinch 1st:
        const otherTeams = teams.filter(other => other.team_number !== t.team_number);
        const maxWinsOtherTeams = otherTeams.length > 0
            ? Math.max(...otherTeams.map(o => (o.wins || 0) + (totalMatchesByTeam[o.team_number] || o.matches_played || 0) - (o.matches_played || 0)))
            : 0;

        let magicNumber = maxWinsOtherTeams - wins + 1;

        let status = 'On the Hunt';
        let explanation = '';

        if (maxPossibleWins < highestCurrentWins || maxPossibleWins < maxWinsOtherTeams && matchesRemaining === 0) {
          status = 'Eliminated';
          explanation = `Cannot reach 1st place.`;
        } else if (magicNumber <= 0 && matchesRemaining === 0) {
           status = 'Clinched';
           explanation = `Clinched 1st place.`;
        } else if (magicNumber <= 0) {
           status = 'Clinched';
           explanation = `Clinched 1st place.`;
        } else if (maxPossibleWins >= maxWinsOtherTeams) {
           status = 'Control Destiny';
           explanation = `${magicNumber} wins out of ${matchesRemaining} remaining matches guarantees 1st place.`;
        } else {
           explanation = `Any combination of ${Math.max(0, magicNumber)} wins and 1st place team losses guarantees 1st place.`;
        }

        playoffScenarios[t.team_number] = {
          magicNumber: Math.max(0, magicNumber),
          status,
          matchesRemaining,
          maxPossibleWins,
          explanation
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
