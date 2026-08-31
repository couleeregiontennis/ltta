import { renderHook, waitFor } from '@testing-library/react';
import { useTeamStatsData } from '../../src/hooks/useTeamStatsData';
import { supabase } from '../../src/scripts/supabaseClient';
import { useSeason } from '../../src/hooks/useSeason';

jest.mock('../../src/scripts/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    },
  };
});

jest.mock('../../src/hooks/useSeason', () => {
  return {
    useSeason: jest.fn(),
  };
});

describe('useTeamStatsData', () => {
  const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    useSeason.mockReturnValue({ currentSeason: { id: 'season-1' }, loading: false });
  });

  afterAll(() => {
    consoleErrorMock.mockRestore();
  });

  const mockSupabaseQuery = (mockData, mockError = null) => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: mockData, error: mockError }),
      single: jest.fn().mockResolvedValue({ data: mockData, error: mockError }),
      then: function (resolve) {
        resolve({ data: mockData, error: mockError });
      }
    };
    return chain;
  };

  it('handles unauthenticated user', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const { result } = renderHook(() => useTeamStatsData());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('Not authenticated. Please log in to view team statistics.');
  });

  it('handles user with no player profile', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    supabase.from.mockImplementation((table) => {
      if (table === 'player') return mockSupabaseQuery(null);
      return mockSupabaseQuery({});
    });
    const { result } = renderHook(() => useTeamStatsData());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('Player profile not found for this user.');
  });

  it('handles user who is not a captain', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    supabase.from.mockImplementation((table) => {
      if (table === 'player') return mockSupabaseQuery({ id: 'player-1', is_captain: false });
      return mockSupabaseQuery({});
    });
    const { result } = renderHook(() => useTeamStatsData());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('Access denied: Captain privileges required to view team statistics.');
  });

  it('handles user not assigned to a team', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    supabase.from.mockImplementation((table) => {
      if (table === 'player') return mockSupabaseQuery({ id: 'player-1', is_captain: true });
      if (table === 'player_to_team') return mockSupabaseQuery(null);
      return mockSupabaseQuery({});
    });
    const { result } = renderHook(() => useTeamStatsData());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('You are not currently assigned to a team.');
  });

  it('waits for season to finish loading', () => {
    useSeason.mockReturnValue({ currentSeason: null, loading: true });
    const { result } = renderHook(() => useTeamStatsData());
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('');
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it('loads team stats data successfully', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    let playerToTeamCalls = 0;

    supabase.from.mockImplementation((table) => {
      if (table === 'player') {
        return mockSupabaseQuery({ id: 'player-1', is_captain: true });
      }
      if (table === 'player_to_team') {
        playerToTeamCalls++;
        if (playerToTeamCalls === 1) {
          return mockSupabaseQuery({ team: 'team-1' });
        } else {
          return mockSupabaseQuery([
            { player: { id: 'p1', first_name: 'John', last_name: 'Doe' } }
          ]);
        }
      }
      if (table === 'team') {
        return mockSupabaseQuery({ id: 'team-1', name: 'Cool Team' });
      }
      if (table === 'team_match') {
        return mockSupabaseQuery([
          {
            id: 'match-1',
            home_team_id: 'team-1',
            away_team_id: 'team-2',
            home_team: { id: 'team-1', name: 'Cool Team', number: 1 },
            away_team: { id: 'team-2', name: 'Other Team', number: 2 },
            date: '2023-01-01',
            status: 'completed'
          }
        ]);
      }
      if (table === 'match_scores') {
        return mockSupabaseQuery([
          { match_id: 'match-1', home_won: true, home_lines_won: 3, away_lines_won: 1, home_total_games: 40, away_total_games: 20 }
        ]);
      }
      if (table === 'line_results') {
        return mockSupabaseQuery([
          {
            match_id: 'match-1', match_type: 'singles',
            home_player_1_id: 'p1', away_player_1_id: 'p2',
            home_set_1: 6, away_set_1: 4,
            home_set_2: 6, away_set_2: 4,
            home_won: true
          }
        ]);
      }
      return mockSupabaseQuery([]);
    });

    const { result } = renderHook(() => useTeamStatsData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('');
    expect(result.current.user).toEqual({ id: 'user-1' });
    expect(result.current.team).toEqual({ id: 'team-1', name: 'Cool Team' });
    expect(result.current.roster).toHaveLength(1);

    // Corrected assertions according to the feedback
    expect(result.current.teamRecord.wins).toBe(1);
    expect(result.current.teamRecord.losses).toBe(0);
    expect(result.current.winPercentage).toBe('100.0');

    expect(result.current.teamLineStats.linesWon).toBe(3);
    expect(result.current.teamLineStats.gamesWon).toBe(40);

    expect(result.current.playerStats).toHaveLength(1);
    expect(result.current.playerStats[0].wins).toBe(1);
  });
});
