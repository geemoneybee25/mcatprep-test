
import { Domain, Skill, SkillStatus, TestResult } from './types';

export const calculateStatus = (p: number): SkillStatus => {
  if (p < 0.40) return SkillStatus.NOT_READY;
  if (p < 0.85) return SkillStatus.LEARNING;
  return SkillStatus.MASTERED;
};

const CP_SKILL_CATEGORIES: Record<string, string> = {
  "Thermodynamics": "General Chemistry",
  "Kinetics": "General Chemistry",
  "Equilibrium": "General Chemistry",
  "Acids and Bases": "General Chemistry",
  "Electrochemistry": "General Chemistry",
  "Kinematics": "Physics",
  "Forces and Motion": "Physics",
  "Energy and Work": "Physics",
  "Waves and Sound": "Physics",
  "Electricity and Magnetism": "Physics",
  "Light and Optics": "Physics",
  "Atomic and Nuclear": "Physics"
};

const CARS_SKILL_CATEGORIES: Record<string, string> = {
  "Main Idea": "Foundations of Comprehension",
  "Supporting Details": "Foundations of Comprehension",
  "Inferences": "Foundations of Comprehension",
  "Purpose and Function": "Reasoning Within the Text",
  "Strengthen/Weaken Arguments": "Reasoning Within the Text",
  "Author's Tone and Attitude": "Reasoning Within the Text",
  "Apply New Information": "Reasoning Beyond the Text",
  "Passage Comparisons": "Reasoning Beyond the Text"
};

const BB_SKILL_CATEGORIES: Record<string, string> = {
  "Amino Acids and Proteins": "Biochemistry",
  "Enzymes": "Biochemistry",
  "Metabolism": "Biochemistry",
  "DNA and RNA": "Molecular Biology",
  "Gene Expression": "Molecular Biology",
  "Cell Structure": "Cell Biology",
  "Cell Division": "Cell Biology",
  "Nervous System": "Physiology",
  "Cardiovascular System": "Physiology",
  "Respiratory System": "Physiology",
  "Immune System": "Physiology",
  "Genetics": "Genetics and Evolution",
  "Evolution": "Genetics and Evolution"
};

const PS_SKILL_CATEGORIES: Record<string, string> = {
  "Sensation and Perception": "Biological Psychology",
  "Learning and Memory": "Cognitive Psychology",
  "Cognition and Decision Making": "Cognitive Psychology",
  "Motivation and Emotion": "Behavioral Psychology",
  "Social Processes": "Social Psychology",
  "Identity and Self-Concept": "Social Psychology",
  "Social Inequality": "Sociology",
  "Social Structure": "Sociology",
  "Culture": "Sociology"
};

const CP_SKILL_NAMES = Object.keys(CP_SKILL_CATEGORIES);
const CARS_SKILL_NAMES = Object.keys(CARS_SKILL_CATEGORIES);
const BB_SKILL_NAMES = Object.keys(BB_SKILL_CATEGORIES);
const PS_SKILL_NAMES = Object.keys(PS_SKILL_CATEGORIES);

const PREREQUISITE_MAP: Record<string, string[]> = {
  "Equilibrium": ["Kinetics"],
  "Electrochemistry": ["Thermodynamics"],
  "Waves and Sound": ["Kinematics"],
  "Electricity and Magnetism": ["Forces and Motion"],
  "Light and Optics": ["Waves and Sound"],
  "Metabolism": ["Amino Acids and Proteins", "Enzymes"],
  "Gene Expression": ["DNA and RNA"],
  "Cell Division": ["Cell Structure"],
  "Cardiovascular System": ["Nervous System"],
  "Respiratory System": ["Cardiovascular System"],
  "Evolution": ["Genetics"],
  "Strengthen/Weaken Arguments": ["Main Idea", "Supporting Details"],
  "Passage Comparisons": ["Inferences"],
  "Learning and Memory": ["Sensation and Perception"],
  "Social Inequality": ["Social Structure"]
};

export const generateMockPastTests = (): TestResult[] => {
  const cpBaseline = 126;
  const carsBaseline = 125;
  const bbBaseline = 127;
  const psBaseline = 126;
  const totalBaseline = cpBaseline + carsBaseline + bbBaseline + psBaseline;

  return [
    {
      id: 'test-1',
      date: '2024-05-15T10:00:00Z',
      totalScore: totalBaseline + 8,
      cpScore: cpBaseline + 3,
      carsScore: carsBaseline + 2,
      bbScore: bbBaseline + 2,
      psScore: psBaseline + 1,
      performanceBreakdown: [
        { topic: 'Thermodynamics', score: 70, averageScore: 80 },
        { topic: 'Metabolism', score: 65, averageScore: 75 },
        { topic: 'Main Idea', score: 60, averageScore: 72 },
      ]
    },
    {
      id: 'test-2',
      date: '2024-04-22T14:30:00Z',
      totalScore: totalBaseline,
      cpScore: cpBaseline,
      carsScore: carsBaseline,
      bbScore: bbBaseline,
      psScore: psBaseline,
      performanceBreakdown: [
        { topic: 'Kinetics', score: 55, averageScore: 80 },
      ]
    }
  ];
};

export const generateMockSkills = (): Skill[] => {
  const createSkillsForDomain = (names: string[], categories: Record<string, string>, domain: Domain) => {
    return names.map((name, index) => {
      let pMastery: number;
      
      if (index < names.length * 0.3) pMastery = 0.25 + Math.random() * 0.25;
      else if (index < names.length * 0.7) pMastery = 0.55 + Math.random() * 0.25;
      else pMastery = 0.88 + Math.random() * 0.11;

      return {
        id: `${domain.toLowerCase().replace(/[^a-z]/g, '')}-skill-${index + 1}`,
        name,
        domain,
        category: categories[name],
        pMastery: Number(pMastery.toFixed(2)),
        status: calculateStatus(pMastery),
        lastPracticed: Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString() : null,
        attempts: Math.floor(Math.random() * 100)
      };
    });
  };

  const cpSkills = createSkillsForDomain(CP_SKILL_NAMES, CP_SKILL_CATEGORIES, Domain.CP);
  const carsSkills = createSkillsForDomain(CARS_SKILL_NAMES, CARS_SKILL_CATEGORIES, Domain.CARS);
  const bbSkills = createSkillsForDomain(BB_SKILL_NAMES, BB_SKILL_CATEGORIES, Domain.BB);
  const psSkills = createSkillsForDomain(PS_SKILL_NAMES, PS_SKILL_CATEGORIES, Domain.PS);

  const allSkills = [...cpSkills, ...carsSkills, ...bbSkills, ...psSkills];

  return allSkills.map(skill => {
    const prereqNames = PREREQUISITE_MAP[skill.name];
    if (prereqNames) {
      const prereqIds = prereqNames.map(pName => {
        const found = allSkills.find(s => s.name === pName);
        return found ? found.id : '';
      }).filter(id => id !== '');
      
      const allPrereqsMastered = prereqIds.every(id => {
        const prereq = allSkills.find(s => s.id === id);
        return prereq && prereq.pMastery >= 0.85;
      });

      if (!allPrereqsMastered) {
        return {
          ...skill,
          prerequisites: prereqIds,
          status: SkillStatus.NOT_READY,
          pMastery: Math.min(skill.pMastery, 0.35)
        };
      }

      return { ...skill, prerequisites: prereqIds };
    }
    return skill;
  });
};

export const INITIAL_SKILLS: Skill[] = generateMockSkills();
export const MOCK_PAST_TESTS: TestResult[] = generateMockPastTests();
