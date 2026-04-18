import { useSeason } from '../hooks/useSeason';
import '../styles/AnnouncementBar.css';

export const AnnouncementBar = () => {
  const { currentSeason, loading } = useSeason();

  if (loading) return null;

  const seasonYear = currentSeason?.number || new Date().getFullYear();
  
  // Format start date if available
  let startInfo = "June 3rd and 4th";
  if (currentSeason?.start_date) {
    const startDate = new Date(currentSeason.start_date);
    const day = startDate.getDate();
    const month = startDate.toLocaleDateString('en-US', { month: 'long' });
    // This is a simplification, in reality we might have two start dates for Tue/Wed
    startInfo = `${month} ${day}${getOrdinal(day)}`;
  }

  return (
    <div className="announcement-bar" id="announcement-bar">
      <span>
        🎾 <strong>Welcome to LTTA Summer {seasonYear}!</strong> First matches start soon. <br />
        Players new to the league, please arrive 15 minutes early for a quick orientation!
      </span>
    </div>
  );
};

function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}