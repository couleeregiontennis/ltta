import { useState, useEffect } from 'react';
import { supabase } from '../scripts/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from '../context/ToastContext';

export const OnboardingWizard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    ranking: 3,
    dayAvailability: { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
    notes: '',
    intent: 'none', // 'team', 'sub', 'none'
    selectedTeamId: ''
  });

  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase.from('team').select('id, name, number, play_night').order('name');
      if (!error && data) {
        setTeams(data);
      }
    };
    fetchTeams();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDayChange = (day, checked) => {
    setFormData(prev => ({
      ...prev,
      dayAvailability: {
        ...prev.dayAvailability,
        [day]: checked
      }
    }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleFinish = async () => {
    try {
      setSaving(true);
      
      // 1. Create Player Profile
      const profileData = {
        user_id: user.id,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: user.email,
        phone: formData.phone.trim(),
        emergency_contact: formData.emergencyContact.trim(),
        emergency_phone: formData.emergencyPhone.trim(),
        ranking: Number(formData.ranking),
        is_active: true,
        day_availability: formData.dayAvailability,
        notes: formData.notes.trim()
      };

      const { data: insertedPlayer, error: profileError } = await supabase
        .from('player')
        .insert(profileData)
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Handle Intent
      if (formData.intent === 'team' && formData.selectedTeamId) {
        const { error: teamError } = await supabase
          .from('player_to_team')
          .insert({
            player: insertedPlayer.id,
            team: formData.selectedTeamId,
            status: 'pending'
          });
        if (teamError) throw teamError;
      } else if (formData.intent === 'sub') {
        // Just add a note to sub board or rely on is_active / day_availability
        // Let's create a sub board post if sub board exists, or just leave it since they have day_availability set.
        // For now, day_availability makes them eligible.
      }

      addToast('Profile completed successfully!', 'success');
      window.location.href = '/'; // Hard reload to update AuthProvider state
    } catch (error) {
      console.error('Error in onboarding:', error);
      addToast(error.message || 'Failed to save profile', 'error');
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="wizard-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2>Welcome to LTTA!</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <span style={{ fontWeight: step === 1 ? 'bold' : 'normal', color: step === 1 ? 'var(--color-primary)' : 'var(--text-muted)' }}>1. Personal</span>
          <span style={{ fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? 'var(--color-primary)' : 'var(--text-muted)' }}>2. Tennis</span>
          <span style={{ fontWeight: step === 3 ? 'bold' : 'normal', color: step === 3 ? 'var(--color-primary)' : 'var(--text-muted)' }}>3. Team</span>
        </div>
      </div>

      {step === 1 && (
        <div className="wizard-step">
          <h3>Personal Details</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Let's start with your basic contact information.</p>
          
          <div className="form-group">
            <label htmlFor="first-name">First Name *</label>
            <input id="first-name" type="text" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="last-name">Last Name *</label>
            <input id="last-name" type="text" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input id="phone" type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="emergency-contact">Emergency Contact Name</label>
            <input id="emergency-contact" type="text" value={formData.emergencyContact} onChange={e => handleInputChange('emergencyContact', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="emergency-phone">Emergency Contact Phone</label>
            <input id="emergency-phone" type="tel" value={formData.emergencyPhone} onChange={e => handleInputChange('emergencyPhone', e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={handleNext} disabled={!formData.firstName || !formData.lastName || !formData.phone}>Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard-step">
          <h3>Tennis Profile</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Tell us about your game and availability.</p>
          
          <div className="form-group">
            <label>Self Rating (1.0 - 5.0) *</label>
            <select value={formData.ranking} onChange={e => handleInputChange('ranking', e.target.value)} required>
              <option value="1">1.0</option>
              <option value="1.5">1.5</option>
              <option value="2">2.0</option>
              <option value="2.5">2.5</option>
              <option value="3">3.0</option>
              <option value="3.5">3.5</option>
              <option value="4">4.0</option>
              <option value="4.5">4.5</option>
              <option value="5">5.0</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Availability</label>
            <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>Check the days you are typically available to play or sub.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
              {Object.keys(formData.dayAvailability).map(day => (
                <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.dayAvailability[day]} 
                    onChange={e => handleDayChange(day, e.target.checked)} 
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Notes</label>
            <textarea 
              value={formData.notes} 
              onChange={e => handleInputChange('notes', e.target.value)}
              placeholder="Any playing preferences or additional info..."
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={handleBack}>Back</button>
            <button className="btn btn-primary" onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="wizard-step">
          <h3>League Intent</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>What are you looking to do this season?</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label className={`card card--interactive ${formData.intent === 'team' ? 'active' : ''}`} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              cursor: 'pointer', 
              padding: '1.25rem', 
              border: formData.intent === 'team' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
              backgroundColor: formData.intent === 'team' ? 'rgba(var(--color-primary-rgb), 0.05)' : 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--transition-fast)'
            }}>
              <input type="radio" name="intent" value="team" checked={formData.intent === 'team'} onChange={() => handleInputChange('intent', 'team')} />
              <div>
                <strong style={{ fontSize: 'var(--font-size-base)' }}>Join a specific team</strong>
                <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0 0' }}>I know which team I am playing for and want to request a roster spot.</p>
              </div>
            </label>

            {formData.intent === 'team' && (
              <div className="form-group" style={{ marginLeft: '2.5rem', animation: 'fadeIn var(--transition-normal)' }}>
                <label htmlFor="select-team">Select Team</label>
                <select id="select-team" value={formData.selectedTeamId} onChange={e => handleInputChange('selectedTeamId', e.target.value)}>
                  <option value="">-- Choose a team --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.play_night})</option>
                  ))}
                </select>
              </div>
            )}

            <label className={`card card--interactive ${formData.intent === 'sub' ? 'active' : ''}`} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              cursor: 'pointer', 
              padding: '1.25rem', 
              border: formData.intent === 'sub' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
              backgroundColor: formData.intent === 'sub' ? 'rgba(var(--color-primary-rgb), 0.05)' : 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--transition-fast)'
            }}>
              <input type="radio" name="intent" value="sub" checked={formData.intent === 'sub'} onChange={() => handleInputChange('intent', 'sub')} />
              <div>
                <strong style={{ fontSize: 'var(--font-size-base)' }}>I want to be a Substitute</strong>
                <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0 0' }}>I don't have a primary team but want to be contacted when teams need players.</p>
              </div>
            </label>

            <label className={`card card--interactive ${formData.intent === 'none' ? 'active' : ''}`} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              cursor: 'pointer', 
              padding: '1.25rem', 
              border: formData.intent === 'none' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
              backgroundColor: formData.intent === 'none' ? 'rgba(var(--color-primary-rgb), 0.05)' : 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--transition-fast)'
            }}>
              <input type="radio" name="intent" value="none" checked={formData.intent === 'none'} onChange={() => handleInputChange('intent', 'none')} />
              <div>
                <strong style={{ fontSize: 'var(--font-size-base)' }}>Just exploring for now</strong>
                <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0 0' }}>I will look around and figure it out later.</p>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={handleBack} disabled={saving}>Back</button>
            <button className="btn btn-primary" onClick={handleFinish} disabled={saving || (formData.intent === 'team' && !formData.selectedTeamId)}>
              {saving ? <LoadingSpinner size="sm" /> : 'Complete Setup'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
