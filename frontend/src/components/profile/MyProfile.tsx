import React, { useState } from "react";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../hooks/useAuth";
import {
  Edit3, MapPin, School, Phone, Mail, User, PlusCircle, ShieldCheck,
  Code2, BookOpen, GraduationCap, Github, Linkedin, Globe, Trophy,
  Target, Flame, Award, Clock, ChevronRight, CheckCircle2, Lock,
  BarChart3, Zap, Calendar, Star, TrendingUp, ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Badge, ActivityItem, SkillProgress } from "../../context/ProfileContext";
import { ActivityCalendar } from 'react-activity-calendar';
import AccountSettings from "./AccountSettings";

// ─── Stat Card Component ─────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent, sub }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
  sub?: string;
}) {
  return (
    <div className={`group relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.03] hover:shadow-lg cursor-default`}
      style={{
        background: `color-mix(in srgb, ${accent} 6%, transparent)`,
        borderColor: `color-mix(in srgb, ${accent} 15%, transparent)`,
      }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.04] -translate-y-1/3 translate-x-1/3 group-hover:opacity-[0.08] transition-opacity"
        style={{ background: accent }}
      />
      <div className="mb-3 opacity-80" style={{ color: accent }}>{icon}</div>
      <p className="text-2xl md:text-3xl font-black text-white leading-none">
        {value}
        {sub && <span className="text-sm font-medium opacity-40 ml-1">{sub}</span>}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] mt-1.5 opacity-60" style={{ color: accent }}>{label}</p>
    </div>
  );
}

// ─── Difficulty Ring Component ────────────────────────────────────────────────
function DifficultyRing({ solved, total, color, label }: {
  solved: number; total: number; color: string; label: string;
}) {
  const pct = total > 0 ? (solved / total) * 100 : 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-white/[0.06]" />
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-white">{solved}</span>
          <span className="text-[9px] text-white/40 font-medium">/{total}</span>
        </div>
      </div>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Progress Bar Component ───────────────────────────────────────────────────
function SkillBar({ skill }: { skill: SkillProgress }) {
  const colors: Record<string, string> = {
    'C': '#A8B9CC', 'C++': '#00599C', 'Java': '#ED8B00', 'Python': '#3776AB',
    'Javascript': '#F7DF1E', 'Typescript': '#3178C6', 'Go': '#00ADD8',
    'Rust': '#CE412B', 'Ruby': '#CC342D', 'Php': '#777BB4',
  };
  const color = colors[skill.name] || '#6366f1';

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{skill.name}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>
          {skill.solved}/{skill.total} <span className="text-white/30">({skill.percentage}%)</span>
        </span>
      </div>
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${skill.percentage}%`, background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 60%, white))` }}
        />
      </div>
    </div>
  );
}

// ─── Badge Card Component ─────────────────────────────────────────────────────
function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className={`relative p-4 rounded-2xl border text-center transition-all duration-300 ${badge.isUnlocked
      ? 'bg-white/[0.04] border-white/[0.08] hover:border-indigo-500/30 hover:scale-[1.05]'
      : 'bg-white/[0.01] border-white/[0.04] opacity-50'
      }`}>
      {!badge.isUnlocked && (
        <div className="absolute top-2 right-2">
          <Lock size={12} className="text-white/20" />
        </div>
      )}
      <div className="text-2xl mb-2">{badge.icon}</div>
      <p className="text-xs font-bold text-white/80 leading-tight">{badge.title}</p>
      <p className="text-[10px] text-white/30 mt-0.5">{badge.description}</p>
      {!badge.isUnlocked && badge.progress !== undefined && badge.target !== undefined && (
        <div className="mt-2">
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500/50 rounded-full transition-all"
              style={{ width: `${Math.min((badge.progress / badge.target) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-white/20 mt-1">{badge.progress}/{badge.target}</p>
        </div>
      )}
    </div>
  );
}

// ─── Activity Item Component ──────────────────────────────────────────────────
function ActivityRow({ item }: { item: ActivityItem }) {
  const iconMap: Record<string, React.ReactNode> = {
    problem_solved: <CheckCircle2 size={16} className="text-emerald-400" />,
    submission: <Code2 size={16} className="text-amber-400" />,
    course_enrolled: <BookOpen size={16} className="text-cyan-400" />,
    profile_update: <User size={16} className="text-indigo-400" />,
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0 group">
      <div className="mt-0.5 p-2 rounded-xl bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors">
        {iconMap[item.type] || <Zap size={16} className="text-white/40" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors truncate">{item.description}</p>
        <p className="text-[10px] text-white/25 mt-0.5">{timeAgo(item.timestamp)}</p>
      </div>
      {item.meta?.difficulty && (
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.meta.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
          item.meta.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
            'bg-red-500/10 text-red-400'
          }`}>
          {item.meta.difficulty as string}
        </span>
      )}
    </div>
  );
}

// ─── Mini Chart (CSS-based bar chart for submissions by month) ────────────────
function MiniBarChart({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] text-white/30 font-bold tabular-nums">{d.count > 0 ? d.count : ''}</span>
          <div className="w-full rounded-t-lg transition-all duration-700 ease-out hover:opacity-100 opacity-80"
            style={{
              height: `${Math.max((d.count / max) * 100, 4)}%`,
              background: `linear-gradient(180deg, #818cf8, #6366f1)`,
              minHeight: '4px',
            }}
          />
          <span className="text-[9px] text-white/30 font-medium">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, accent = '#818cf8' }: { icon: React.ReactNode; title: string; accent?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-xl" style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>
        {icon}
      </div>
      <h3 className="text-lg font-black text-white tracking-tight">{title}</h3>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Profile Component ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function MyProfile({ setView, overrideData }: { setView?: (v: string) => void, overrideData?: any }) {
  const { profileData: ctxProfileData } = useProfile();
  const { user: ctxUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'coding' | 'achievements' | 'settings'>('overview');

  const profileData = overrideData || ctxProfileData;
  const user = overrideData ? { name: profileData.name || profileData.username, email: profileData.email } : ctxUser;
  const isReadOnly = !!overrideData;

  const codingStats = profileData?.codingStats;
  const learningStats = profileData?.learningStats;
  const badges = profileData?.badges || [];
  const recentActivity = profileData?.recentActivity || [];
  const skills = profileData?.skillProgress || [];
  const enrolledCourses = profileData?.enrolledCourses || [];
  const profileCompletion = profileData?.profileCompletion ?? 0;
  const completionTips = profileData?.completionTips || [];

  const fullName = [profileData?.firstName, profileData?.midName, profileData?.lastName]
    .filter(Boolean).join(' ') || user?.name || 'User';

  const joinedDate = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* ═══════════════════════════════════════════════════════════════════════
           SECTION 1: HERO HEADER
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-10">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/[0.04] rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/[0.03] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 uppercase bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-500/20 overflow-hidden">
              {profileData?.avatar ? (
                <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name[0] : "U"
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#0a0a0c] p-1.5 rounded-xl border border-white/10">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {fullName}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-white/40">
              {user?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-indigo-400" /> {user.email}
                </span>
              )}
              {(profileData?.location || profileData?.address) && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-indigo-400" /> {profileData.location || profileData.address}
                </span>
              )}
              {profileData?.college && (
                <span className="flex items-center gap-1.5">
                  <School size={13} className="text-indigo-400" /> {profileData.college}
                </span>
              )}
              {joinedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-indigo-400" /> Joined {joinedDate}
                </span>
              )}
            </div>

            {profileData?.bio && (
              <p className="text-sm text-white/50 max-w-lg leading-relaxed">{profileData.bio}</p>
            )}

            {/* Role + Degree Badge */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
              {profileData?.degree && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                  <GraduationCap size={12} /> {profileData.degree} Student
                </span>
              )}
              {profileData?.skills && profileData.skills.length > 0 && (
                profileData.skills.slice(0, 4).map(s => (
                  <span key={s} className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))
              )}
              {profileData?.skills && profileData.skills.length > 4 && (
                <span className="text-[10px] font-bold text-white/20">
                  +{profileData.skills.length - 4} more
                </span>
              )}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              {profileData?.github && (
                <a href={profileData.github} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.06] hover:border-white/[0.15] transition-all">
                  <Github size={12} /> GitHub
                </a>
              )}
              {profileData?.linkedin && (
                <a href={profileData.linkedin} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.06] hover:border-blue-500/30 transition-all">
                  <Linkedin size={12} /> LinkedIn
                </a>
              )}
              {profileData?.website && (
                <a href={profileData.website} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.06] hover:border-emerald-500/30 transition-all">
                  <Globe size={12} /> Portfolio
                </a>
              )}
              {profileData?.twitter && (
                <a href={profileData.twitter} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.06] hover:border-sky-500/30 transition-all">
                  <ExternalLink size={12} /> Twitter/X
                </a>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {!isReadOnly && (
            <button
              onClick={() => setView && setView("form")}
              className="shrink-0 group relative px-6 py-3 bg-white/[0.06] hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border border-white/[0.08] hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              {profileData ? <><Edit3 size={16} /> Edit Profile</> : <><PlusCircle size={16} /> Complete Profile</>}
            </button>
          )}
        </div>

        {/* ─── Profile Completion Bar ──────────────────────────────────────── */}
        {profileCompletion < 100 && (
          <div className="relative z-10 mt-6 pt-6 border-t border-white/[0.04]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Profile Completion</span>
              <span className="text-xs font-black text-indigo-400 tabular-nums">{profileCompletion}%</span>
            </div>
            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-1000 ease-out"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            {completionTips.length > 0 && (
              <p className="text-[11px] text-white/25 mt-2 flex items-center gap-1.5">
                <Star size={11} className="text-amber-400/50" />
                {completionTips[0]}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
           NO PROFILE STATE
         ═══════════════════════════════════════════════════════════════════════ */}
      {!profileData ? (
        <div className="p-16 text-center bg-white/[0.01] border-2 border-dashed border-white/[0.05] rounded-3xl group hover:border-indigo-500/20 transition-all">
          <div className="inline-flex p-5 bg-white/[0.04] rounded-2xl mb-5 text-gray-500 group-hover:text-indigo-400 transition-colors">
            <User size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{isReadOnly ? "Profile Incomplete" : "Profile Incomplete"}</h3>
          <p className="text-white/30 max-w-sm mx-auto mb-6 text-sm">
            {isReadOnly ? "This student has not completed their profile yet." : "Complete your profile to unlock achievements, track your learning journey, and build your developer identity."}
          </p>
          {!isReadOnly && (
            <button onClick={() => setView && setView("form")} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold uppercase text-xs tracking-widest transition-all">
              Complete Profile Now
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════════════
               TAB NAVIGATION
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex gap-1 p-1 bg-white/[0.02] rounded-2xl border border-white/[0.05] overflow-x-auto">
            {[
              { id: 'overview' as const, label: 'Overview', icon: <BarChart3 size={15} /> },
              { id: 'coding' as const, label: 'Coding Stats', icon: <Code2 size={15} /> },
              { id: 'achievements' as const, label: 'Achievements', icon: <Trophy size={15} /> },
              ...(!isReadOnly ? [{ id: 'settings' as const, label: 'Account Settings', icon: <ShieldCheck size={15} /> }] : []),
            ].map(tab => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                  : 'text-white/30 hover:text-white/50 border border-transparent'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
               OVERVIEW TAB
             ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* ─── Learning Stats Grid ──────────────────────────────────── */}
              <div>
                <SectionHeader icon={<TrendingUp size={18} />} title="Learning Dashboard" accent="#06b6d4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard icon={<BookOpen size={20} />} label="Courses Enrolled" value={learningStats?.coursesEnrolled ?? 0} accent="#06b6d4" />
                  <StatCard icon={<GraduationCap size={20} />} label="Courses Completed" value={learningStats?.coursesCompleted ?? 0} accent="#a855f7" />
                  <StatCard icon={<Code2 size={20} />} label="Problems Solved"
                    value={codingStats?.totalProblemsSolved ?? 0}
                    sub={`/ ${codingStats?.totalProblemsAvailable ?? 0}`}
                    accent="#10b981"
                  />
                  <StatCard icon={<Target size={20} />} label="Paths Mastered" value={learningStats?.practicePathsCompleted ?? 0}
                    sub={`/ ${learningStats?.totalPracticePathsAvailable ?? 0}`} accent="#f59e0b"
                  />
                  <StatCard icon={<Zap size={20} />} label="Total Submissions" value={codingStats?.totalSubmissions ?? 0} accent="#ec4899" />
                  <StatCard icon={<Award size={20} />} label="Acceptance Rate" value={`${codingStats?.acceptanceRate ?? 0}%`} accent="#8b5cf6" />
                  <StatCard icon={<BookOpen size={20} />} label="Notes Available" value={learningStats?.notesCount ?? 0} accent="#14b8a6" />
                  <StatCard icon={<Trophy size={20} />} label="Badges Earned" value={badges.filter(b => b.isUnlocked).length}
                    sub={`/ ${badges.length}`} accent="#f97316"
                  />
                </div>
              </div>

              {/* ─── Two Column: Activity + Skills ────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                  <SectionHeader icon={<Clock size={18} />} title="Recent Activity" accent="#f59e0b" />
                  {recentActivity.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      {recentActivity.map(item => (
                        <ActivityRow key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/20 text-center py-8">No activity yet. Start solving problems!</p>
                  )}
                </div>

                {/* Skill Progress */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                  <SectionHeader icon={<BarChart3 size={18} />} title="Skill Progress" accent="#10b981" />
                  {skills.length > 0 ? (
                    <div className="space-y-4">
                      {skills.slice(0, 8).map(skill => (
                        <SkillBar key={skill.name} skill={skill} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/20 text-center py-8">Solve problems to see your skill progress!</p>
                  )}
                </div>
              </div>

              {/* ─── Enrolled Courses ─────────────────────────────────────── */}
              {enrolledCourses.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                  <SectionHeader icon={<BookOpen size={18} />} title="Enrolled Courses" accent="#6366f1" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {enrolledCourses.map((enr) => (
                      <div key={enr._id}
                        className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:border-indigo-500/20 transition-all group cursor-pointer"
                        onClick={() => navigate(`/courses/${enr.courseId?._id}/learn`)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-white/80 group-hover:text-white truncate transition-colors">
                            {enr.courseId?.title || "Course"}
                          </p>
                          <p className="text-[10px] text-white/25 mt-0.5">
                            {enr.courseId?.instructor}
                            {enr.isCompleted && <span className="ml-2 text-emerald-400">✓ Completed</span>}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-white/10 group-hover:text-indigo-400 transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Personal Info ────────────────────────────────────────── */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                <SectionHeader icon={<User size={18} />} title="Personal Information" accent="#8b5cf6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: <User size={16} />, label: 'Full Name', value: fullName },
                    { icon: <Mail size={16} />, label: 'Email', value: user?.email },
                    { icon: <Phone size={16} />, label: 'Phone', value: profileData?.mobile },
                    { icon: <School size={16} />, label: 'College', value: profileData?.college },
                    { icon: <ShieldCheck size={16} />, label: 'Degree', value: profileData?.degree },
                    { icon: <MapPin size={16} />, label: 'Location', value: profileData?.location || profileData?.address },
                    ...(profileData?.graduationYear ? [{ icon: <Calendar size={16} />, label: 'Graduation', value: profileData?.graduationYear }] : []),
                  ].filter(item => item.value).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">{item.icon}</div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-semibold text-white/70 truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
               CODING STATS TAB
             ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'coding' && (
            <div className="space-y-6">
              {/* Difficulty Rings */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                <SectionHeader icon={<Target size={18} />} title="Problem Solving Breakdown" accent="#10b981" />
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Big total ring */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-36 h-36">
                      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/[0.04]" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#totalGrad)" strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 42}
                          strokeDashoffset={2 * Math.PI * 42 - ((codingStats?.totalProblemsSolved ?? 0) / Math.max(codingStats?.totalProblemsAvailable ?? 1, 1)) * 2 * Math.PI * 42}
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="totalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{codingStats?.totalProblemsSolved ?? 0}</span>
                        <span className="text-[10px] text-white/30 font-medium">/ {codingStats?.totalProblemsAvailable ?? 0}</span>
                        <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">Solved</span>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty breakdown */}
                  <div className="flex-1 flex justify-center gap-8">
                    <DifficultyRing solved={codingStats?.easySolved ?? 0} total={codingStats?.easyTotal ?? 0} color="#10b981" label="Easy" />
                    <DifficultyRing solved={codingStats?.mediumSolved ?? 0} total={codingStats?.mediumTotal ?? 0} color="#f59e0b" label="Medium" />
                    <DifficultyRing solved={codingStats?.hardSolved ?? 0} total={codingStats?.hardTotal ?? 0} color="#ef4444" label="Hard" />
                  </div>
                </div>
              </div>

              {/* Activity Calendar (GitHub style) */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <SectionHeader icon={<Calendar size={18} />} title="Submission Graph" accent="#22c55e" />
                  <div className="flex items-center gap-6 bg-white/[0.02] border border-white/[0.06] px-5 py-2.5 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Current Streak</span>
                      <span className="text-xl font-black text-emerald-400 leading-none mt-1">{codingStats?.currentStreak ?? 0} <span className="text-xs text-white/20">days</span></span>
                    </div>
                    <div className="w-px h-8 bg-white/[0.06]" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Max Streak</span>
                      <span className="text-xl font-black text-amber-400 leading-none mt-1">{codingStats?.maxStreak ?? 0} <span className="text-xs text-white/20">days</span></span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto no-scrollbar pb-2">
                  <div className="min-w-[800px] flex justify-center w-full text-white/50 font-medium">
                    <ActivityCalendar
                      data={codingStats?.activityCalendar && codingStats.activityCalendar.length > 0 ? codingStats.activityCalendar : [{ date: new Date().toISOString().split('T')[0], count: 0, level: 0 }]}
                      theme={{
                        light: ['#18181b', '#064e3b', '#047857', '#059669', '#10b981'],
                        dark: ['#18181b', '#064e3b', '#047857', '#059669', '#10b981']
                      }}
                      colorScheme="dark"
                      blockSize={13}
                      blockRadius={4}
                      blockMargin={5}
                      fontSize={12}
                      labels={{
                        totalCount: `{{count}} submissions in the last year`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Two Column: Stats + Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Metrics */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                  <SectionHeader icon={<Zap size={18} />} title="Key Metrics" accent="#ec4899" />
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard icon={<Flame size={18} />} label="Acceptance Rate" value={`${codingStats?.acceptanceRate ?? 0}%`} accent="#10b981" />
                    <StatCard icon={<Code2 size={18} />} label="Total Submissions" value={codingStats?.totalSubmissions ?? 0} accent="#6366f1" />
                    <StatCard icon={<Star size={18} />} label="Favorite Language" value={codingStats?.favoriteLanguage ?? 'N/A'} accent="#f59e0b" />
                    <StatCard icon={<Calendar size={18} />} label="Most Active Day" value={codingStats?.mostActiveDay ?? 'N/A'} accent="#ec4899" />
                  </div>
                </div>

                {/* Submissions Chart */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                  <SectionHeader icon={<TrendingUp size={18} />} title="Submissions (Last 6 Months)" accent="#6366f1" />
                  {codingStats?.submissionsByMonth && codingStats.submissionsByMonth.length > 0 ? (
                    <MiniBarChart data={codingStats.submissionsByMonth} />
                  ) : (
                    <p className="text-sm text-white/20 text-center py-8">No submission data yet</p>
                  )}
                </div>
              </div>

              {/* Skill Progress */}
              {skills.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                  <SectionHeader icon={<BarChart3 size={18} />} title="Language Mastery" accent="#10b981" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {skills.map(skill => (
                      <SkillBar key={skill.name} skill={skill} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
               ACHIEVEMENTS TAB
             ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {/* Badges Grid */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                <SectionHeader icon={<Trophy size={18} />} title={`Achievements (${badges.filter(b => b.isUnlocked).length}/${badges.length})`} accent="#f59e0b" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {/* Show unlocked first, then locked */}
                  {[...badges].sort((a, b) => (a.isUnlocked === b.isUnlocked ? 0 : a.isUnlocked ? -1 : 1)).map(badge => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              </div>

              {/* Recent Activity (full list) */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                <SectionHeader icon={<Clock size={18} />} title="Activity History" accent="#06b6d4" />
                {recentActivity.length > 0 ? (
                  <div>
                    {recentActivity.map(item => (
                      <ActivityRow key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/20 text-center py-8">No activity yet. Start your learning journey!</p>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
               SETTINGS TAB
             ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <AccountSettings />
          )}
        </>
      )}
    </div>
  );
}