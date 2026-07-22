import { createNode, type MindNode } from './types'

export type IeltsMindmapTemplate = {
  id: string
  label: string
  /** Tiếng Việt ngắn */
  labelVi: string
  topic: string
  /** Cây 1 root + nhánh chính */
  build: () => MindNode
}

function branch(text: string, kids: string[]): MindNode {
  const n = createNode(text)
  n.children = kids.map(k => createNode(k))
  return n
}

function topicTree(root: string, branches: Array<{ title: string; kids: string[] }>): MindNode {
  const r = createNode(root)
  r.children = branches.map(b => branch(b.title, b.kids))
  return r
}

export const IELTS_MINDMAP_TEMPLATES: IeltsMindmapTemplate[] = [
  {
    id: 'environment',
    label: 'Environment',
    labelVi: 'Môi trường',
    topic: 'Environment',
    build: () => topicTree('Environment', [
      { title: 'Problems', kids: ['pollution', 'deforestation', 'climate change', 'waste'] },
      { title: 'Causes', kids: ['industry', 'vehicles', 'overconsumption', 'plastic'] },
      { title: 'Solutions', kids: ['renewable energy', 'recycling', 'public transport', 'laws'] },
      { title: 'Collocations', kids: ['carbon footprint', 'global warming', 'natural resources', 'eco-friendly'] },
    ]),
  },
  {
    id: 'education',
    label: 'Education',
    labelVi: 'Giáo dục',
    topic: 'Education',
    build: () => topicTree('Education', [
      { title: 'Types', kids: ['online learning', 'public school', 'vocational', 'university'] },
      { title: 'Benefits', kids: ['career', 'critical thinking', 'social skills', 'equality'] },
      { title: 'Challenges', kids: ['cost', 'access', 'pressure', 'outdated curriculum'] },
      { title: 'Collocations', kids: ['higher education', 'lifelong learning', 'academic performance', 'tuition fees'] },
    ]),
  },
  {
    id: 'technology',
    label: 'Technology',
    labelVi: 'Công nghệ',
    topic: 'Technology',
    build: () => topicTree('Technology', [
      { title: 'Areas', kids: ['AI', 'internet', 'smartphones', 'automation'] },
      { title: 'Pros', kids: ['efficiency', 'connection', 'innovation', 'healthcare'] },
      { title: 'Cons', kids: ['privacy', 'job loss', 'addiction', 'misinformation'] },
      { title: 'Collocations', kids: ['cutting-edge', 'digital literacy', 'data breach', 'tech-savvy'] },
    ]),
  },
  {
    id: 'health',
    label: 'Health',
    labelVi: 'Sức khỏe',
    topic: 'Health',
    build: () => topicTree('Health', [
      { title: 'Lifestyle', kids: ['exercise', 'diet', 'sleep', 'stress'] },
      { title: 'Problems', kids: ['obesity', 'mental health', 'pollution-related', 'aging'] },
      { title: 'Solutions', kids: ['public healthcare', 'awareness', 'prevention', 'sports'] },
      { title: 'Collocations', kids: ['balanced diet', 'life expectancy', 'healthcare system', 'well-being'] },
    ]),
  },
  {
    id: 'work',
    label: 'Work & Career',
    labelVi: 'Công việc',
    topic: 'Work',
    build: () => topicTree('Work & Career', [
      { title: 'Trends', kids: ['remote work', 'gig economy', 'AI jobs', 'lifelong skills'] },
      { title: 'Skills', kids: ['communication', 'teamwork', 'problem-solving', 'adaptability'] },
      { title: 'Issues', kids: ['unemployment', 'burnout', 'wage gap', 'work-life balance'] },
      { title: 'Collocations', kids: ['job satisfaction', 'career path', 'working hours', 'professional development'] },
    ]),
  },
  {
    id: 'crime',
    label: 'Crime',
    labelVi: 'Tội phạm',
    topic: 'Crime',
    build: () => topicTree('Crime', [
      { title: 'Types', kids: ['cybercrime', 'theft', 'violent crime', 'fraud'] },
      { title: 'Causes', kids: ['poverty', 'education gap', 'peer pressure', 'drugs'] },
      { title: 'Solutions', kids: ['policing', 'rehabilitation', 'education', 'community'] },
      { title: 'Collocations', kids: ['commit a crime', 'law enforcement', 'crime rate', 'prison sentence'] },
    ]),
  },
  {
    id: 'travel',
    label: 'Travel & Tourism',
    labelVi: 'Du lịch',
    topic: 'Travel',
    build: () => topicTree('Travel & Tourism', [
      { title: 'Types', kids: ['ecotourism', 'cultural tourism', 'business travel', 'staycation'] },
      { title: 'Benefits', kids: ['economy', 'cultural exchange', 'jobs', 'infrastructure'] },
      { title: 'Problems', kids: ['overtourism', 'pollution', 'cultural loss', 'seasonality'] },
      { title: 'Collocations', kids: ['tourist attraction', 'travel experience', 'local community', 'carbon offset'] },
    ]),
  },
  {
    id: 'media',
    label: 'Media & Social media',
    labelVi: 'Truyền thông',
    topic: 'Media',
    build: () => topicTree('Media', [
      { title: 'Forms', kids: ['news', 'social media', 'streaming', 'podcasts'] },
      { title: 'Pros', kids: ['awareness', 'connection', 'free speech', 'learning'] },
      { title: 'Cons', kids: ['fake news', 'addiction', 'cyberbullying', 'privacy'] },
      { title: 'Collocations', kids: ['viral content', 'media literacy', 'public opinion', 'filter bubble'] },
    ]),
  },
]
