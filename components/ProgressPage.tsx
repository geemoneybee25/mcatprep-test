
import React, { useState, useMemo } from 'react';
import { Skill, SkillStatus, MasterySummary, EngagementStats, TestResult, Domain } from '../types';
import SkillTrajectory from './SkillTrajectory';

export type ProgressTab = 'Overview' | 'Skills';

interface ProgressPageProps {
  skills: Skill[];
  stats: MasterySummary;
  engagement: EngagementStats;
  pastTests: TestResult[];
  onSelectSkill: (skillId: string) => void;
  initialTab?: ProgressTab;
}

const ScoreChart: React.FC<{ 
  data: number[]; 
  color?: string; 
  height?: number; 
  target?: number;
  id?: string;
  isOverall?: boolean;
}> = ({ 
  data, 
  color = "#60A5FA", 
  height = 128, 
  target,
  id = "chart",
  isOverall = false
}) => {
  const floor = isOverall ? 472 : 118;
  const ceiling = isOverall ? 528 : 132;
  
  const { min, max } = useMemo(() => {
    if (data.length === 0) return { min: floor, max: ceiling };
    
    const allValues = target !== undefined ? [...data, target] : data;
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    
    let range = dataMax - dataMin;
    if (range < 4) range = isOverall ? 10 : 2;

    const padding = range * 0.25;
    const dynamicMin = Math.max(floor, dataMin - padding);
    const dynamicMax = Math.min(ceiling, dataMax + padding);
    
    return { min: dynamicMin, max: dynamicMax };
  }, [data, target, floor, ceiling, isOverall]);

  const points = useMemo(() => {
    if (data.length === 0) return [];
    if (data.length === 1) return [{ x: 50, y: 100 - ((data[0] - min) / (max - min)) * 100, value: data[0] }];
    return data.map((val, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: 100 - ((val - min) / (max - min)) * 100,
      value: val
    }));
  }, [data, min, max]);

  const linePath = useMemo(() => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i+1];
      const cp1x = curr.x + (next.x - curr.x) * 0.4;
      const cp2x = next.x - (next.x - curr.x) * 0.4;
      d += ` C ${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`;
    }
    return d;
  }, [points]);

  const areaPath = useMemo(() => {
    if (!linePath) return "";
    return `${linePath} L 100,100 L 0,100 Z`;
  }, [linePath]);

  const targetY = target !== undefined ? 100 - ((target - min) / (max - min)) * 100 : null;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {targetY !== null && targetY >= 0 && targetY <= 100 && (
          <line x1="0" y1={targetY} x2="100" y2={targetY} stroke="rgba(255,255,255,0.15)" strokeDasharray="1,1" strokeWidth="0.3" />
        )}
        <path d={areaPath} fill={`url(#grad-${id})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300" />
      </svg>
      <div className="absolute inset-0 pointer-events-none">
        {points.map((p, i) => (
          <div key={i} className="group pointer-events-auto absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}>
            <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm transition-transform duration-200 group-hover:scale-[1.4]" style={{ backgroundColor: color }} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10">
              {p.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgressPage: React.FC<ProgressPageProps> = ({ skills, stats, engagement, pastTests, onSelectSkill, initialTab }) => {
  const [activeTab, setActiveTab] = useState<ProgressTab>(initialTab || 'Overview');
  const [activeSkillCategory, setActiveSkillCategory] = useState<SkillStatus>(SkillStatus.MASTERED);
  const [activeDomain, setActiveDomain] = useState<Domain>(Domain.CP);

  const filteredSkills = useMemo(() => 
    skills.filter(s => s.domain === activeDomain), 
    [skills, activeDomain]
  );

  const domainLearningSkills = useMemo(() => filteredSkills.filter(s => s.status === SkillStatus.LEARNING), [filteredSkills]);
  const domainMasteredSkills = useMemo(() => filteredSkills.filter(s => s.status === SkillStatus.MASTERED), [filteredSkills]);
  const domainLockedSkills = useMemo(() => filteredSkills.filter(s => s.status === SkillStatus.NOT_READY), [filteredSkills]);

  const baselineTest = useMemo(() => 
    [...pastTests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0],
    [pastTests]
  );

  const initialSectionScore = useMemo(() => {
    if (!baselineTest) return 125;
    if (activeDomain === Domain.CP) return baselineTest.cpScore;
    if (activeDomain === Domain.BB) return baselineTest.bbScore;
    if (activeDomain === Domain.PS) return baselineTest.psScore;
    return baselineTest.carsScore;
  }, [baselineTest, activeDomain]);

  const projectedSectionScore = useMemo(() => {
    if (filteredSkills.length === 0) return initialSectionScore;
    const avgMastery = filteredSkills.reduce((acc, s) => acc + s.pMastery, 0) / filteredSkills.length;
    const calculated = 118 + Math.round(avgMastery * 14);
    return Math.max(calculated, initialSectionScore);
  }, [filteredSkills, initialSectionScore]);

  const getPredictedForDomain = (dom: Domain) => {
    const s = skills.filter(sk => sk.domain === dom);
    if (s.length === 0) return 125;
    const avg = s.reduce((acc, sk) => acc + sk.pMastery, 0) / s.length;
    let baseline = 125;
    if (baselineTest) {
      if (dom === Domain.CP) baseline = baselineTest.cpScore;
      else if (dom === Domain.BB) baseline = baselineTest.bbScore;
      else if (dom === Domain.PS) baseline = baselineTest.psScore;
      else baseline = baselineTest.carsScore;
    }
    return Math.max(118 + Math.round(avg * 14), baseline);
  };

  const cpPredicted = getPredictedForDomain(Domain.CP);
  const bbPredicted = getPredictedForDomain(Domain.BB);
  const psPredicted = getPredictedForDomain(Domain.PS);
  const carsPredicted = getPredictedForDomain(Domain.CARS);
  const overallPredictedScore = cpPredicted + bbPredicted + psPredicted + carsPredicted;
  
  const targetScoreOverall = Math.max(overallPredictedScore + 8, 515);

  const scoreTrendOverall = useMemo(() => {
    const historical = [...pastTests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => t.totalScore);
    return [...historical, overallPredictedScore];
  }, [pastTests, overallPredictedScore]);

  const domainStats: MasterySummary = useMemo(() => ({
    total: filteredSkills.length,
    mastered: domainMasteredSkills.length,
    learning: domainLearningSkills.length,
    locked: domainLockedSkills.length,
  }), [filteredSkills, domainMasteredSkills, domainLearningSkills, domainLockedSkills]);

  const daysUntilTest = useMemo(() => {
    const testDate = new Date('2026-06-07');
    const today = new Date();
    const diffTime = Math.max(0, testDate.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl self-start mb-2">
        {(['Overview', 'Skills'] as ProgressTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-100 flex flex-col justify-center overflow-hidden relative min-h-[200px]">
               <div>
                  <h3 className="text-slate-600 text-xs font-black uppercase tracking-widest mb-2">Predicted MCAT</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-slate-900">{overallPredictedScore}</span>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
                     Target: {targetScoreOverall}
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-100 flex flex-col justify-center overflow-hidden relative min-h-[200px]">
               <div>
                  <h3 className="text-slate-600 text-xs font-black uppercase tracking-widest mb-2">Days To Test</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-slate-900">{daysUntilTest}</span>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">
                     Test Date: June 7, 2026
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-100 flex flex-col justify-between min-h-[200px]">
              <div>
                <h3 className="text-slate-600 text-xs font-black uppercase tracking-widest mb-4">Practice Stats</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">🔥</div>
                  <div>
                    <span className="text-3xl font-black text-slate-900 block leading-none">{engagement.streak}</span>
                    <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Streak</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Today</span>
                    <span className="text-sm font-black text-slate-900">{engagement.minutesToday}m</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900" style={{ width: `${Math.min(100, (engagement.minutesToday / engagement.dailyGoalMinutes) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-100 flex flex-col justify-between min-h-[200px]">
              <div>
                <h3 className="text-slate-600 text-xs font-black uppercase tracking-widest mb-4">Improvement</h3>
                <div className="text-5xl font-black text-slate-900 mb-2">
                  +{overallPredictedScore - (scoreTrendOverall[0] || overallPredictedScore)}
                </div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Points gained since baseline</p>
                <div className="mt-4 flex gap-1 h-8 items-end">
                   {scoreTrendOverall.map((s, i) => (
                     <div key={i} className="flex-1 bg-slate-900/10 rounded-t-sm" style={{ height: `${((s - 472) / 56) * 100}%` }} />
                   ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-[#0f172a] rounded-[2.5rem] p-10 text-white flex flex-col shadow-2xl">
                <h3 className="text-white/60 text-xs font-black uppercase tracking-widest mb-8">Comprehensive History</h3>
                <ScoreChart id="main-trend" data={scoreTrendOverall} color="#60A5FA" height={160} target={targetScoreOverall} isOverall={true} />
                <div className="mt-8 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Baseline</span>
                  <span>Predicted Current</span>
                </div>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center font-bold text-xs">C/P</div>
                     <h4 className="font-bold text-slate-800 text-sm">Chem/Phys</h4>
                   </div>
                   <div className="flex items-end justify-between gap-4">
                      <span className="text-2xl font-black text-slate-900">{cpPredicted}</span>
                      <div className="flex-1 max-w-[100px]">
                        <ScoreChart id="cp-trend" data={[...pastTests.map(t => t.cpScore), cpPredicted]} color="#F59E0B" height={30} isOverall={false} />
                      </div>
                   </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center font-bold text-xs">CARS</div>
                     <h4 className="font-bold text-slate-800 text-sm">CARS</h4>
                   </div>
                   <div className="flex items-end justify-between gap-4">
                      <span className="text-2xl font-black text-slate-900">{carsPredicted}</span>
                      <div className="flex-1 max-w-[100px]">
                        <ScoreChart id="cars-trend" data={[...pastTests.map(t => t.carsScore), carsPredicted]} color="#3B82F6" height={30} isOverall={false} />
                      </div>
                   </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-xs">B/B</div>
                     <h4 className="font-bold text-slate-800 text-sm">Bio/Biochem</h4>
                   </div>
                   <div className="flex items-end justify-between gap-4">
                      <span className="text-2xl font-black text-slate-900">{bbPredicted}</span>
                      <div className="flex-1 max-w-[100px]">
                        <ScoreChart id="bb-trend" data={[...pastTests.map(t => t.bbScore), bbPredicted]} color="#10B981" height={30} isOverall={false} />
                      </div>
                   </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs">P/S</div>
                     <h4 className="font-bold text-slate-800 text-sm">Psych/Soc</h4>
                   </div>
                   <div className="flex items-end justify-between gap-4">
                      <span className="text-2xl font-black text-slate-900">{psPredicted}</span>
                      <div className="flex-1 max-w-[100px]">
                        <ScoreChart id="ps-trend" data={[...pastTests.map(t => t.psScore), psPredicted]} color="#6366F1" height={30} isOverall={false} />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Tests</h3>
            <div className="space-y-4">
              {[...pastTests].reverse().map((test) => (
                <div key={test.id} className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                       <div className="flex flex-col items-center">
                         <span className="text-[8px] font-black uppercase opacity-60 leading-none mb-1">{new Date(test.date).toLocaleString('default', { month: 'short' })}</span>
                         <span className="text-xl font-bold leading-none">{new Date(test.date).getDate()}</span>
                       </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900">Practice Test {test.id.split('-')[1]}</h4>
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-1">Status: Score Verified • {new Date(test.date).getFullYear()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-center">
                       <span className="block text-[10px] font-black text-slate-600 uppercase mb-1">Total Score</span>
                       <span className="text-3xl font-black text-slate-900">{test.totalScore}</span>
                    </div>
                    <div className="w-px h-10 bg-slate-100 hidden md:block" />
                    <button className="bg-white border-2 border-slate-900 text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                       Review Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Skills' && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-full">
            <SkillTrajectory 
              stats={domainStats} 
              activeZone={activeSkillCategory} 
              onZoneClick={setActiveSkillCategory} 
              startingScore={initialSectionScore}
              projectedScore={projectedSectionScore}
              activeDomain={activeDomain}
              onDomainChange={setActiveDomain}
            />
          </div>

          <div className="min-h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeSkillCategory === SkillStatus.LEARNING && domainLearningSkills.map(skill => (
                <div 
                  key={skill.id} 
                  onClick={() => onSelectSkill(skill.id)}
                  className="p-5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer hover:border-amber-400 hover:shadow-lg hover:shadow-amber-50 transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <p className="font-bold text-slate-800 text-sm truncate group-hover:text-amber-700 transition-colors">{skill.name}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase text-amber-700 ml-2">
                    {Math.round(skill.pMastery * 100)}%
                  </span>
                </div>
              ))}

              {activeSkillCategory === SkillStatus.MASTERED && domainMasteredSkills.map(skill => (
                <div 
                  key={skill.id} 
                  onClick={() => onSelectSkill(skill.id)}
                  className="p-5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer hover:border-green-400 hover:shadow-lg hover:shadow-green-50 transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-600 shrink-0" />
                    <p className="font-bold text-slate-800 text-sm truncate group-hover:text-green-700 transition-colors">{skill.name}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase text-green-700 ml-2">100%</span>
                </div>
              ))}

              {activeSkillCategory === SkillStatus.NOT_READY && domainLockedSkills.map(skill => (
                <div 
                  key={skill.id} 
                  onClick={() => onSelectSkill(skill.id)}
                  className="p-5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-500 hover:shadow-lg hover:shadow-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                    <p className="font-bold text-slate-700 text-sm truncate group-hover:text-slate-900 transition-colors">{skill.name}</p>
                  </div>
                </div>
              ))}

              {((activeSkillCategory === SkillStatus.LEARNING && domainLearningSkills.length === 0) ||
                (activeSkillCategory === SkillStatus.MASTERED && domainMasteredSkills.length === 0) ||
                (activeSkillCategory === SkillStatus.NOT_READY && domainLockedSkills.length === 0)) && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                  <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No skills in this category for the selected section</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
