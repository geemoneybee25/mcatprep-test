
import React, { useState, useEffect } from 'react';
import { SkillStatus, Domain } from '../types';

interface DiagnosticSimulationFlowProps {
  onComplete: () => void;
}

const DiagnosticSimulationFlow: React.FC<DiagnosticSimulationFlowProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'simulating' | 'results' | 'generating'>('simulating');
  const [wizardStep, setWizardStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Initializing Engine...');
  const [activeZone, setActiveZone] = useState<SkillStatus>(SkillStatus.LEARNING);
  // Using specific MCAT domains for the diagnostic breakdown
  // Fix: Replaced Domain.CHEM with Domain.CP to match enum definition in types.ts
  const [activeDomain, setActiveDomain] = useState<Domain>(Domain.CP);

  const initialTasks = [
    'Analyzing CARS Passage 1...',
    'Processing Chem/Physics Module 1...',
    'Evaluating Psych/Soc Items...',
    'Calculating Bayesian Mastery Trajectories...',
    'Calibrating Bio/Biochem Constraints...',
    'Synthesizing Standard English Conventions...',
    'Finalizing Adaptive Profile...'
  ];

  const generationTasks = [
    'Optimizing skill sequence...',
    'Prioritizing high-yield topics...',
    'Building personalized drills...',
    'Mapping reinforcement milestones...',
    'Calibrating your study schedule...'
  ];

  const zoneDescriptions = {
    [SkillStatus.MASTERED]: "You are already proficient in these skills, so these will be periodically scheduled for review",
    [SkillStatus.LEARNING]: "Your study plan will focus on improving proficiency in these skills",
    [SkillStatus.NOT_READY]: "These are low-yield topics for your score goal and will be addressed once you master everything in your Learning zone."
  };

  const domainZoneContent: Record<string, any> = {
    // Fix: Replaced Domain.CHEM with Domain.CP
    [Domain.CP]: {
      label: 'Chem/Phys',
      stats: { mastered: 20, learning: 50, notReady: 30 },
      zones: {
        [SkillStatus.MASTERED]: {
          label: 'Mastered',
          color: 'bg-emerald-500',
          count: 5,
          skills: ['Atomic Structure', 'Stoichiometry', 'Units & Dimensions', 'Periodic Trends', 'Phase Changes']
        },
        [SkillStatus.LEARNING]: {
          label: 'Learning',
          color: 'bg-amber-400',
          count: 14,
          skills: ['Thermodynamics', 'Chemical Kinetics', 'Acids & Bases', 'Fluids & Pressure', 'Circuits', 'Optics', 'Electrochemistry', 'Nuclear Decay']
        },
        [SkillStatus.NOT_READY]: {
          label: 'Not Ready',
          color: 'bg-slate-400',
          count: 10,
          skills: ['Quantum Mechanics', 'Complex NMR', 'Advanced Fluid Dynamics', 'Relativity']
        }
      }
    },
    // Fix: Replaced Domain.BIOLOGY with Domain.BB
    [Domain.BB]: {
      label: 'Bio/Biochem',
      stats: { mastered: 15, learning: 60, notReady: 25 },
      zones: {
        [SkillStatus.MASTERED]: {
          label: 'Mastered',
          color: 'bg-emerald-500',
          count: 4,
          skills: ['Cell Structure', 'DNA vs RNA', 'Mendelian Genetics', 'Basic Mitosis']
        },
        [SkillStatus.LEARNING]: {
          label: 'Learning',
          color: 'bg-amber-400',
          count: 18,
          skills: ['Amino Acids', 'Enzyme Kinetics', 'Metabolic Pathways', 'Hormone Signaling', 'Immune System', 'Nervous System', 'Protein Folding']
        },
        [SkillStatus.NOT_READY]: {
          label: 'Not Ready',
          color: 'bg-slate-400',
          count: 8,
          skills: ['Botanical Physiology', 'Specific Viral Strains', 'Obscure Plant Taxonomy']
        }
      }
    },
    // Fix: Replaced Domain.PSYCH with Domain.PS
    [Domain.PS]: {
      label: 'Psych/Soc',
      stats: { mastered: 30, learning: 45, notReady: 25 },
      zones: {
        [SkillStatus.MASTERED]: {
          label: 'Mastered',
          color: 'bg-emerald-500',
          count: 6,
          skills: ['Classical Conditioning', 'Sensation', 'Visual Perception', 'Identity Formation', 'Social Norms', 'Demographics']
        },
        [SkillStatus.LEARNING]: {
          label: 'Learning',
          color: 'bg-amber-400',
          count: 12,
          skills: ['Cognitive Biases', 'Memory Consolidation', 'Social Stratification', 'Personality Theories', 'Attribution Theory', 'Health Disparities']
        },
        [SkillStatus.NOT_READY]: {
          label: 'Not Ready',
          color: 'bg-slate-400',
          count: 7,
          skills: ['Neuroanatomy Details', 'Obscure Theorists', 'Specific Clinical Trials']
        }
      }
    },
    [Domain.CARS]: {
      label: 'CARS',
      stats: { mastered: 25, learning: 55, notReady: 20 },
      zones: {
        [SkillStatus.MASTERED]: {
          label: 'Mastered',
          color: 'bg-emerald-500',
          count: 3,
          skills: ['Active Reading', 'Vocabulary in Context', 'Identifying Main Point']
        },
        [SkillStatus.LEARNING]: {
          label: 'Learning',
          color: 'bg-amber-400',
          count: 6,
          skills: ['Evaluating Arguments', 'Reasoning Beyond the Text', 'Author Tone & Attitude', 'Textual Evidence', 'Comparing Passages']
        },
        [SkillStatus.NOT_READY]: {
          label: 'Not Ready',
          color: 'bg-slate-400',
          count: 2,
          skills: ['Literary Criticism Theory', 'Advanced Linguistics Analysis']
        }
      }
    }
  };

  useEffect(() => {
    if (phase === 'simulating' || phase === 'generating') {
      const currentTasks = phase === 'simulating' ? initialTasks : generationTasks;
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (phase === 'simulating') {
                setPhase('results');
                setProgress(0);
              } else {
                onComplete();
              }
            }, 800);
            return 100;
          }
          const step = phase === 'simulating' ? Math.random() * 5 + 2 : Math.random() * 20;
          const next = Math.min(100, prev + step);
          
          const taskIdx = Math.floor((next / 100) * currentTasks.length);
          if (currentTasks[taskIdx]) setCurrentTask(currentTasks[taskIdx]);
          
          return next;
        });
      }, phase === 'simulating' ? 150 : 350);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleGeneratePlan = () => {
    setPhase('generating');
    setProgress(0);
    setCurrentTask('Architecting Study Plan...');
  };

  if (phase === 'simulating' || phase === 'generating') {
    return (
      <div className="fixed inset-0 z-[2000] bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-md text-center">
          <div className="mb-12 relative flex flex-col items-center">
             {phase === 'simulating' ? (
               <div className="relative w-48 h-48 mb-8">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="none" 
                      stroke="rgba(255,255,255,0.05)" 
                      strokeWidth="3" 
                    />
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3" 
                      strokeDasharray="282.7" 
                      strokeDashoffset={282.7 - (282.7 * progress) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                    <line 
                      x1="50" y1="50" x2="50" y2="30" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      style={{ 
                        transform: `rotate(${(progress * 3.6) + (progress * 0.5)}deg)`, 
                        transformOrigin: '50% 50%',
                        transition: 'transform 0.3s linear'
                      }} 
                    />
                    <line 
                      x1="50" y1="50" x2="50" y2="20" 
                      stroke="#10b981" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                      style={{ 
                        transform: `rotate(${progress * 24}deg)`, 
                        transformOrigin: '50% 50%',
                        transition: 'transform 0.3s linear'
                      }} 
                    />
                  </svg>
               </div>
             ) : (
               <div className="flex items-center justify-center text-7xl opacity-80 animate-pulse mb-8">
                 🎯
               </div>
             )}
          </div>
          
          <h2 className="text-4xl font-black mb-4 tracking-tight">
            {phase === 'simulating' ? 'Simulating Adaptive Test' : 'Generating Study Plan'}
          </h2>
          <p className="text-slate-400 font-bold text-base uppercase tracking-[0.2em] mb-12 min-h-[1.5em]">
            {currentTask}
          </p>

          {phase === 'generating' && (
            <div className="space-y-6">
              <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-300 ease-out shadow-[0_0_20px_rgba(52,211,153,0.6)]" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <div className="flex justify-between items-center text-base font-black uppercase tracking-widest text-slate-500">
                <span className="opacity-60">Plan Optimization</span>
                <span className="text-emerald-400 font-black">{Math.round(progress)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentDomainData = domainZoneContent[activeDomain];
  const activeData = currentDomainData.zones[activeZone];

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto overflow-x-hidden">
      <div className="min-h-full flex flex-col items-center justify-start py-12 md:py-24 px-6">
        <div className="bg-white rounded-[4rem] p-10 md:p-16 max-w-4xl w-full shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
          
          <div className="flex justify-center gap-3 mb-12">
             <div className={`h-2.5 w-20 rounded-full transition-colors duration-500 ${wizardStep >= 1 ? 'bg-slate-900' : 'bg-slate-100'}`} />
             <div className={`h-2.5 w-20 rounded-full transition-colors duration-500 ${wizardStep >= 2 ? 'bg-slate-900' : 'bg-slate-100'}`} />
          </div>

          {wizardStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-16">
                <span className="text-base font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block">Initial Baseline</span>
                <h2 className="text-5xl font-black text-slate-900 mb-12">Your Diagnostic Score</h2>
                <div className="flex justify-center items-baseline gap-3">
                  <span className="text-9xl font-black text-slate-900 tracking-tighter">504</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 border-y border-slate-100 py-10">
                 <div className="text-center space-y-2">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Chem/Phys</span>
                    <span className="text-5xl font-black text-slate-900">126</span>
                 </div>
                 <div className="text-center space-y-2">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">CARS</span>
                    <span className="text-5xl font-black text-slate-900">125</span>
                 </div>
                 <div className="text-center space-y-2">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio/Biochem</span>
                    <span className="text-5xl font-black text-slate-900">127</span>
                 </div>
                 <div className="text-center space-y-2">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Psych/Soc</span>
                    <span className="text-5xl font-black text-slate-900">126</span>
                 </div>
              </div>

              <button 
                onClick={() => setWizardStep(2)}
                className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black text-lg uppercase tracking-widest transition-all hover:bg-slate-800 shadow-xl shadow-slate-200"
              >
                See Detailed Skills Map
              </button>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-12">
                 <h2 className="text-4xl font-black text-slate-900 mb-4">Your Skills Map</h2>
              </div>

              <div className="space-y-8">
                 <div>
                    {/* Updated Domain Toggles to show all 4 MCAT sections side by side */}
                    <div className="flex justify-center mb-12">
                      <div className="inline-flex p-1.5 bg-slate-100 rounded-3xl border border-slate-200 gap-1 overflow-x-auto max-w-full">
                        {/* Fix: Replaced incorrect domain names with correct enum members from types.ts */}
                        {[Domain.CP, Domain.BB, Domain.PS, Domain.CARS].map((dom) => (
                          <button
                            key={dom}
                            onClick={() => setActiveDomain(dom)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                              activeDomain === dom 
                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {domainZoneContent[dom].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-end mb-5 px-2">
                       <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Domain Coverage</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {domainZoneContent[activeDomain].label}
                       </span>
                    </div>
                    
                    <div className="h-8 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/50 mb-12">
                       <div 
                          onClick={() => setActiveZone(SkillStatus.MASTERED)}
                          className={`h-full bg-emerald-500 transition-all duration-700 cursor-pointer hover:opacity-80 ${activeZone === SkillStatus.MASTERED ? 'ring-inset ring-2 ring-white/30' : ''}`} 
                          style={{ width: `${currentDomainData.stats.mastered}%` }} 
                          title="Mastered"
                       />
                       <div 
                          onClick={() => setActiveZone(SkillStatus.LEARNING)}
                          className={`h-full bg-amber-400 transition-all duration-700 cursor-pointer hover:opacity-80 ${activeZone === SkillStatus.LEARNING ? 'ring-inset ring-2 ring-white/30' : ''}`} 
                          style={{ width: `${currentDomainData.stats.learning}%` }} 
                          title="Learning"
                       />
                       <div 
                          onClick={() => setActiveZone(SkillStatus.NOT_READY)}
                          className={`h-full bg-slate-400 transition-all duration-700 cursor-pointer hover:opacity-80 ${activeZone === SkillStatus.NOT_READY ? 'ring-inset ring-2 ring-white/30' : ''}`} 
                          style={{ width: `${currentDomainData.stats.notReady}%` }} 
                          title="Not Ready"
                       />
                    </div>
                    
                    <div className="bg-slate-100 p-1.5 rounded-[2rem] flex w-full mb-10 gap-1">
                      {[SkillStatus.MASTERED, SkillStatus.LEARNING, SkillStatus.NOT_READY].map((zone) => (
                        <button 
                          key={zone}
                          onClick={() => setActiveZone(zone)}
                          className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 ${
                            activeZone === zone 
                              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${currentDomainData.zones[zone].color}`} />
                          {currentDomainData.zones[zone].label}
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100 min-h-[340px] mb-12 animate-in fade-in duration-300">
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${activeData.color}`} />
                          {activeData.label} {domainZoneContent[activeDomain].label} Skills ({activeData.count})
                       </h4>
                       <p className="text-slate-600 text-base font-medium leading-relaxed mb-8">
                          {zoneDescriptions[activeZone]}
                       </p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activeData.skills.map((s: string, i: number) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm transition-all hover:border-slate-300">
                              <span className="text-sm font-bold text-slate-700 truncate">{s}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-6">
                 <button 
                    onClick={handleGeneratePlan}
                    className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black text-lg uppercase tracking-widest transition-all hover:bg-slate-800 shadow-xl shadow-slate-200"
                 >
                    Generate My Study Plan
                 </button>
                 <button 
                   onClick={() => setWizardStep(1)}
                   className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-900 transition-colors pb-4 text-center"
                 >
                   Back to Score Summary
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticSimulationFlow;
