import { useAuth } from '../../hooks/useAuth';
import { Search, Building2, UserCircle, Activity } from 'lucide-react';

export default function PatientDashboard() {
  const { profile } = useAuth();

  const cards = [
    { title: 'Find Hospitals', icon: Building2, desc: 'Search and compare verified healthcare facilities', color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Find Doctors', icon: UserCircle, desc: 'Browse specialists and book consultations', color: 'text-secondary-accent', bg: 'bg-secondary-accent/10' },
    { title: 'Compare Options', icon: Activity, desc: 'Compare treatments, costs, and facility ratings', color: 'text-sage', bg: 'bg-sage/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Welcome back, {profile?.first_name || profile?.display_name}!</h1>
          <p className="text-muted-foreground">What kind of healthcare information are you looking for today?</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-border shadow-sm hover:shadow-card-hover hover:border-border transition-all group cursor-pointer">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.bg} ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">{card.title}</h3>
            <p className="text-sm text-muted-foreground">{card.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="p-8 bg-surface-elevated rounded-2xl border border-border">
        <h2 className="text-xl font-bold mb-4">Saved Providers</h2>
        <div className="text-center py-12 bg-white/50 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground">You haven't saved any hospitals or doctors yet.</p>
        </div>
      </div>
    </div>
  );
}
