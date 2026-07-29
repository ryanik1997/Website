#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CAMBRIDGE_WRITING_LEVEL_CONFIGS,
  CAMBRIDGE_WRITING_LEVELS,
  getTestId,
} from './cambridge-writing-level-config.mjs'
import { normalizeText, semanticScenarioKey } from './cambridge-writing-similarity.mjs'
import { sha256 } from './cambridge-writing-ai-contracts.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const JSON_OUTPUT = path.join(ROOT, 'tmp/cambridge-writing-generation-plan.json')
const MD_OUTPUT = path.join(ROOT, 'tmp/cambridge-writing-generation-plan.md')

export const TOPIC_FAMILIES = [
  'education and learning', 'work and careers', 'community and public services', 'environment and sustainability', 'technology and communication',
  'arts, culture and media', 'travel and intercultural experience', 'health and wellbeing', 'consumer life and lifestyle', 'science, society and future change',
]

const AUDIENCE_DEFAULTS = ['English teacher', 'specialist magazine readers', 'programme coordinator', 'English-speaking contact']
const PURPOSE_DEFAULTS = ['evaluate and justify priorities', 'assess effectiveness and recommend', 'analyse implications and propose action', 'explain a position and request arrangements']
const REGISTER_DEFAULTS = ['neutral', 'semi-formal', 'formal', 'engaging neutral']

function taskDesign(setting, audience, purpose, contentPoints, register, lexicalAnchors = []) {
  return { setting, audience, purpose, contentPoints, register, lexicalAnchors }
}

const CHECKPOINT_DESIGNS = {
  b1: [
    {
      topicFamily: 'travel and intercultural experience', specificSetting: 'friends arranging a weekend visit in a nearby town', stakeholders: ['two teenage friends', 'a host family', 'local transport staff'], centralTension: 'doing several activities versus keeping the visit relaxed',
      tasks: [
        taskDesign('organising a weekend visit with a friend', 'English-speaking friend', 'confirm plans, choose an activity and ask a practical question', ['arrival time', 'preferred activity and reason', 'food preference', 'question about what to bring'], 'informal', ['weekend visit', 'arrival time', 'local activity']),
        taskDesign('a youth website collecting recommendations for useful local places', 'teenage website readers', 'describe a useful place and explain why teenagers should visit', ['what the place is', 'what teenagers can do there', 'why it is useful'], 'engaging neutral', ['useful place', 'teenagers', 'local area']),
        taskDesign('a journey disrupted after a bus leaves without the traveller', 'English teacher', 'continue a story from a fixed opening with a clear consequence', ['missed bus', 'unexpected next step', 'ending linked to the journey'], 'narrative', ['missed bus', 'journey', 'unexpected help']),
      ], forbiddenConcepts: ['peer learning project', 'pollution essay', 'touring holiday'],
    },
    {
      topicFamily: 'community and public services', specificSetting: 'students helping at a school open-day event', stakeholders: ['student helpers', 'visiting families', 'teachers'], centralTension: 'following assigned duties versus responding to unexpected needs',
      tasks: [
        taskDesign('helping at a school event and replying to a classmate', 'classmate', 'choose a volunteer role, explain availability and ask about equipment', ['chosen role', 'reason for choice', 'available time', 'question about equipment'], 'informal', ['school event', 'volunteer role', 'open day']),
        taskDesign('a school blog inviting articles about learning a practical skill', 'school blog readers', 'describe a practical skill and explain how it was learned', ['the skill', 'how it was learned', 'when it is useful'], 'engaging neutral', ['practical skill', 'learning by doing', 'useful habit']),
        taskDesign('a parcel with no expected delivery name appearing at home', 'English teacher', 'continue a story from a surprising discovery', ['unexpected parcel', 'decision about opening or returning it', 'revealed explanation'], 'narrative', ['unexpected parcel', 'delivery label', 'surprise']),
      ], forbiddenConcepts: ['workplace observation day', 'book review', 'career mentoring'],
    },
    {
      topicFamily: 'consumer life and lifestyle', specificSetting: 'friends planning a small birthday activity with limited time', stakeholders: ['birthday host', 'two friends', 'activity venue staff'], centralTension: 'a special experience versus an easy affordable plan',
      tasks: [
        taskDesign('planning a birthday activity with a friend', 'English-speaking friend', 'choose an activity, explain the choice and settle arrangements', ['activity choice', 'reason', 'meeting time', 'question about guests'], 'informal', ['birthday activity', 'meeting time', 'guest list']),
        taskDesign('a local magazine featuring favourite annual events', 'local magazine readers', 'describe a favourite local event and explain its appeal', ['event description', 'best feature', 'who would enjoy it'], 'engaging neutral', ['local event', 'annual celebration', 'favourite feature']),
        taskDesign('an unexpected phone call interrupting a family dinner', 'English teacher', 'continue a story in which the call changes the evening', ['phone call during dinner', 'urgent or surprising message', 'resolved ending'], 'narrative', ['phone call', 'family dinner', 'surprising message']),
      ], forbiddenConcepts: ['community centre programme', 'surprising book character', 'college magazine film review'],
    },
    {
      topicFamily: 'environment and sustainability', specificSetting: 'a teenager deciding whether to join a neighbourhood environmental club', stakeholders: ['teenage applicant', 'club leader', 'local residents'], centralTension: 'personal convenience versus regular community responsibility',
      tasks: [
        taskDesign('joining an environmental club and replying to its youth leader', 'club youth leader', 'confirm interest, choose a project and ask about the first meeting', ['preferred project', 'reason', 'availability', 'question about first meeting'], 'semi-formal friendly', ['environmental club', 'local project', 'first meeting']),
        taskDesign('a family website sharing realistic ways to reduce household waste', 'families and teenagers', 'recommend manageable low-waste habits', ['one food-waste habit', 'one packaging habit', 'how family members can cooperate'], 'engaging neutral', ['household waste', 'reuse container', 'family habit']),
        taskDesign('a walk in a park leading to an unusual discovery', 'English teacher', 'continue a story from an observation in the park', ['unusual park object or event', 'investigation', 'credible explanation'], 'narrative', ['park path', 'unusual discovery', 'investigation']),
      ], forbiddenConcepts: ['low-waste school event', 'rivers and seas', 'community garden plan'],
    },
    {
      topicFamily: 'technology and communication', specificSetting: 'two teenagers arranging a weekly online language exchange', stakeholders: ['language partners', 'parents', 'online club moderator'], centralTension: 'regular practice versus screen fatigue and scheduling',
      tasks: [
        taskDesign('arranging an online language exchange with a new partner', 'teenage language partner', 'agree a schedule, select activities and set a communication rule', ['weekly time', 'preferred activity', 'reason', 'question about platform'], 'informal', ['language exchange', 'weekly call', 'practice activity']),
        taskDesign('a student website publishing advice about communicating well online', 'teenage internet users', 'give practical advice for clear and respectful online communication', ['clear messages', 'respectful disagreement', 'checking misunderstandings'], 'engaging neutral', ['clear message', 'online tone', 'misunderstanding']),
        taskDesign('a message accidentally sent to the wrong person', 'English teacher', 'continue a story about correcting a digital mistake', ['wrong recipient', 'immediate reaction', 'consequence and resolution'], 'narrative', ['wrong message', 'recipient', 'digital mistake']),
      ], forbiddenConcepts: ['digital communication workshop', 'touring holiday', 'peer learning project'],
    },
  ],
  b2: [
    {
      topicFamily: 'education and learning', specificSetting: 'secondary schools deciding whether life skills belong in the timetable', stakeholders: ['students', 'teachers', 'families'], centralTension: 'academic subject time versus preparation for independent life',
      tasks: [
        taskDesign('a class debate on schools teaching practical life skills', 'English teacher', 'evaluate benefits and decide which provision matters most', ['managing money', 'basic cooking or home care', 'own idea'], 'neutral', ['life skills', 'school timetable', 'independent living']),
        taskDesign('a town library introducing weekend study clinics', 'college magazine readers', 'review a place that supports effective study', ['facilities', 'quality of support', 'recommendation for specific learners'], 'semi-formal', ['study clinic', 'library schedule', 'quiet workspace']),
        taskDesign('a youth culture website exploring learning beyond lessons', 'young website readers', 'recommend ways to learn outside class', ['community activity', 'self-directed practice', 'benefit for future study or work'], 'engaging neutral', ['learning outside class', 'community course', 'independent practice']),
        taskDesign('an exchange student choosing a short practical course', 'exchange student', 'compare course options and advise how to prepare', ['recommended course', 'reason', 'likely challenge', 'preparation advice'], 'informal', ['exchange course', 'practical class', 'course choice']),
      ], forbiddenConcepts: ['peer learning project', 'most useful thing learned', 'book review'],
    },
    {
      topicFamily: 'work and careers', specificSetting: 'students considering short workplace visits before choosing courses', stakeholders: ['students', 'employers', 'careers staff'], centralTension: 'brief exposure versus meaningful understanding of working life',
      tasks: [
        taskDesign('a class debate about short workplace visits', 'English teacher', 'assess benefits and identify the most valuable outcome', ['career awareness', 'professional communication', 'own idea'], 'neutral', ['workplace visit', 'career awareness', 'professional conduct']),
        taskDesign('a documentary about working life shown at a youth film club', 'college magazine readers', 'review how effectively a documentary presents working life', ['content and perspective', 'memorable feature', 'recommendation'], 'semi-formal', ['working life documentary', 'career story', 'film club']),
        taskDesign('a careers website asking which skills employers may value', 'young job seekers', 'explain useful employability skills and how to develop them', ['collaboration', 'reliability or initiative', 'realistic development method'], 'engaging neutral', ['employability skills', 'initiative', 'work habits']),
        taskDesign('a friend deciding whether to take weekend work', 'English-speaking friend', 'weigh advantages, warn about one risk and suggest a decision process', ['possible benefit', 'possible drawback', 'study balance', 'practical advice'], 'informal', ['weekend work', 'study balance', 'job decision']),
      ], forbiddenConcepts: ['workplace observation day programme', 'touring holiday', 'peer teaching'],
    },
    {
      topicFamily: 'community and public services', specificSetting: 'a town reviewing how its community centres serve younger residents', stakeholders: ['young residents', 'centre staff', 'local council'], centralTension: 'traditional services versus spaces designed with young people',
      tasks: [
        taskDesign('a class discussion about improving community centres', 'English teacher', 'compare improvements and justify the priority', ['opening hours', 'activities or equipment', 'own idea'], 'neutral', ['community centre', 'opening hours', 'youth facilities']),
        taskDesign('a local public facility recently used by the writer', 'local website readers', 'review accessibility, usefulness and service quality', ['purpose of facility', 'user experience', 'recommendation'], 'semi-formal', ['public facility', 'service quality', 'access']),
        taskDesign('a town website seeking ideas for involving young people locally', 'young residents', 'propose attractive ways to participate in local decisions or projects', ['one participation route', 'motivation', 'visible outcome'], 'engaging neutral', ['youth participation', 'local project', 'public decision']),
        taskDesign('a volunteer coordinator asking about a forthcoming community project', 'volunteer coordinator', 'confirm interest, explain suitable contribution and request details', ['relevant skill', 'available time', 'preferred role', 'question about training'], 'semi-formal', ['volunteer coordinator', 'community project', 'training details']),
      ], forbiddenConcepts: ['community centre programme long-term value', 'school open day', 'touring holiday'],
    },
    {
      topicFamily: 'environment and sustainability', specificSetting: 'organisers reducing waste at a multi-school public event', stakeholders: ['event visitors', 'student organisers', 'food vendors'], centralTension: 'visitor convenience versus measurable waste reduction',
      tasks: [
        taskDesign('a class debate on reducing waste at public events', 'English teacher', 'evaluate measures and identify the most effective', ['reusable food containers', 'clear sorting stations', 'own idea'], 'neutral', ['public event', 'reuse system', 'sorting station']),
        taskDesign('an environmentally responsible event attended recently', 'college magazine readers', 'review how credible and convenient its environmental measures were', ['specific environmental action', 'visitor experience', 'recommendation'], 'semi-formal', ['responsible event', 'waste policy', 'visitor experience']),
        taskDesign('a lifestyle site collecting practical low-waste habits', 'young adult readers', 'share realistic habits and explain how to maintain them', ['shopping choice', 'food or packaging habit', 'method for consistency'], 'engaging neutral', ['low-waste habit', 'refill', 'routine']),
        taskDesign('helping organise a school event with a waste-reduction target', 'student event organiser', 'offer help, recommend two measures and ask about responsibilities', ['chosen responsibility', 'two waste measures', 'reason', 'question about suppliers'], 'informal', ['school event planning', 'waste target', 'supplier']),
      ], forbiddenConcepts: ['low-waste school event long-term value', 'environmental club', 'pollution essay'],
    },
    {
      topicFamily: 'technology and communication', specificSetting: 'students reviewing how digital communication affects real relationships', stakeholders: ['friends', 'classmates', 'online group members'], centralTension: 'constant access versus depth, tone and trust',
      tasks: [
        taskDesign('a class debate on whether digital communication improves relationships', 'English teacher', 'evaluate relationship benefits and limitations and reach a judgement', ['keeping contact', 'quality of conversation', 'own idea'], 'neutral', ['digital relationship', 'constant contact', 'conversation quality']),
        taskDesign('a communication app or service used for collaboration', 'technology website readers', 'review usability, communication quality and appropriate users', ['main functions', 'strength or weakness', 'recommendation'], 'semi-formal', ['communication app', 'group coordination', 'usability']),
        taskDesign('a youth website addressing misunderstandings online', 'teenage internet users', 'explain why misunderstandings happen and recommend prevention', ['tone without body language', 'checking meaning', 'repairing a mistake'], 'engaging neutral', ['online misunderstanding', 'tone', 'clarification']),
        taskDesign('a friend struggling with an online group project', 'English-speaking friend', 'diagnose the communication problem and advise a workable team process', ['likely cause', 'meeting or message rule', 'division of work', 'follow-up step'], 'informal', ['online group project', 'team rule', 'follow-up']),
      ], forbiddenConcepts: ['digital communication workshop', 'message to wrong person', 'touring holiday'],
    },
  ],
  c1: [
    {
      topicFamily: 'education and learning', specificSetting: 'a college governing body reviewing access to academic support', stakeholders: ['students with varied schedules', 'academic advisers', 'college governors'], centralTension: 'universal provision versus targeted support for those at risk',
      tasks: [
        taskDesign('institutional review of academic support priorities', 'college governing body', 'evaluate two support models and determine the more effective institutional priority', ['drop-in academic clinics', 'trained peer mentors', 'early diagnostic guidance'], 'formal neutral', ['academic support', 'institutional access', 'diagnostic guidance']),
        taskDesign('proposal for a cross-department study support hub', 'college principal', 'recommend implementation, participation incentives and evaluation measures', ['staffing model', 'student access', 'success indicators'], 'formal', ['support hub', 'implementation', 'success indicator']),
        taskDesign('email to a visiting education coordinator about support provision', 'visiting education coordinator', 'explain the institutional model, acknowledge a limitation and arrange an observation', ['model overview', 'limitation', 'visit arrangement'], 'formal friendly', ['education coordinator', 'support provision', 'observation visit']),
        taskDesign('review of an academic support initiative after its first term', 'professional education newsletter readers', 'assess impact, inclusion and transferability', ['observed impact', 'unintended weakness', 'recommendation for another institution'], 'formal evaluative', ['academic initiative', 'first-term review', 'transferability']),
      ], forbiddenConcepts: ['life skills timetable', 'peer learning project', 'weekend study clinic review'],
    },
    {
      topicFamily: 'work and careers', specificSetting: 'a regional college consortium redesigning career transition provision', stakeholders: ['final-year students', 'local employers', 'careers advisers'], centralTension: 'broad career exploration versus intensive preparation for specific sectors',
      tasks: [
        taskDesign('institutional debate on transition-to-work provision', 'college consortium board', 'evaluate two approaches and decide which produces more durable readiness', ['rotational employer placements', 'professional communication coaching', 'reflective career planning'], 'formal neutral', ['career transition', 'employer placement', 'reflective planning']),
        taskDesign('proposal for a consortium employer partnership scheme', 'regional college directors', 'set out governance, student selection and employer commitments', ['partnership structure', 'selection fairness', 'employer responsibility'], 'formal', ['employer partnership', 'governance', 'selection fairness']),
        taskDesign('email responding to an employer concerned about student preparedness', 'human resources director', 'address concerns, explain safeguards and negotiate a pilot', ['concern acknowledged', 'preparation safeguard', 'pilot terms'], 'formal', ['employer concern', 'student preparedness', 'pilot terms']),
        taskDesign('review of a careers transition programme for a policy journal', 'education policy readers', 'evaluate evidence of readiness and recommend adaptation', ['programme design', 'evidence of impact', 'adaptation for different institutions'], 'formal evaluative', ['transition programme', 'readiness evidence', 'policy adaptation']),
      ], forbiddenConcepts: ['short workplace visits', 'weekend work advice', 'working-life documentary'],
    },
    {
      topicFamily: 'community and public services', specificSetting: 'a municipal authority deciding how public spaces should support civic participation', stakeholders: ['local residents', 'community organisations', 'municipal planners'], centralTension: 'efficient service delivery versus slower participatory decision-making',
      tasks: [
        taskDesign('institutional evaluation of civic participation mechanisms', 'municipal scrutiny committee', 'compare two mechanisms and decide which builds more legitimate decisions', ['citizen assemblies', 'digital consultation', 'community liaison staff'], 'formal neutral', ['civic participation', 'public legitimacy', 'consultation mechanism']),
        taskDesign('proposal for a youth civic forum linked to council decisions', 'municipal authority', 'recommend remit, representation and accountability', ['representative membership', 'decision link', 'public reporting'], 'formal', ['youth civic forum', 'representation', 'accountability']),
        taskDesign('email to a community organisation about a contested consultation', 'community organisation director', 'clarify process, respond to criticism and propose corrective action', ['process explanation', 'criticism response', 'corrective meeting'], 'formal', ['contested consultation', 'community criticism', 'corrective action']),
        taskDesign('review of a public participation project for a governance magazine', 'public administration readers', 'evaluate inclusiveness, influence and sustainability', ['who participated', 'effect on decisions', 'long-term viability'], 'formal evaluative', ['participation project', 'decision influence', 'viability']),
      ], forbiddenConcepts: ['improving community centres', 'local public facility review', 'volunteer coordinator email'],
    },
    {
      topicFamily: 'environment and sustainability', specificSetting: 'an arts institution adopting an audited resource policy for major events', stakeholders: ['venue management', 'contractors', 'audiences'], centralTension: 'ambitious environmental standards versus cost and operational resilience',
      tasks: [
        taskDesign('institutional evaluation of event sustainability priorities', 'arts centre trustees', 'assess two policy levers and choose the more credible priority', ['contractor standards', 'audience behaviour systems', 'transparent resource auditing'], 'formal neutral', ['resource policy', 'contractor standard', 'environmental audit']),
        taskDesign('proposal for an audited sustainable-events framework', 'arts centre executive board', 'recommend procurement rules, staff responsibilities and reporting', ['procurement criteria', 'operational ownership', 'public reporting'], 'formal', ['sustainable events framework', 'procurement', 'reporting']),
        taskDesign('email negotiating new requirements with a long-term supplier', 'venue supplier', 'explain the policy, recognise practical constraints and agree transition steps', ['policy rationale', 'supplier constraint', 'transition timetable'], 'formal', ['supplier negotiation', 'resource requirement', 'transition timetable']),
        taskDesign('review of an institution environmental policy for a cultural-sector journal', 'cultural managers', 'evaluate credibility, visitor impact and replicability', ['policy credibility', 'visitor experience', 'replicability'], 'formal evaluative', ['institutional environmental policy', 'visitor impact', 'replicability']),
      ], forbiddenConcepts: ['reducing waste at public events', 'low-waste habits', 'school event suppliers'],
    },
    {
      topicFamily: 'technology and communication', specificSetting: 'a university revising communication rules for hybrid teaching and administration', stakeholders: ['students', 'academic staff', 'professional services'], centralTension: 'rapid access to information versus attention, privacy and accountability',
      tasks: [
        taskDesign('institutional evaluation of hybrid communication practice', 'university senate', 'compare communication principles and identify the most important reform', ['response-time expectations', 'channel clarity', 'protected offline periods'], 'formal neutral', ['hybrid communication', 'channel governance', 'offline period']),
        taskDesign('proposal for a university communication charter', 'university executive committee', 'recommend standards, training and enforcement', ['channel standards', 'staff and student training', 'complaint route'], 'formal', ['communication charter', 'training', 'complaint route']),
        taskDesign('email responding to an external auditor about communication failures', 'external quality auditor', 'explain causes, provide corrective measures and arrange evidence review', ['root cause', 'corrective measure', 'evidence review'], 'formal', ['quality auditor', 'communication failure', 'corrective evidence']),
        taskDesign('review of a hybrid communication policy for a higher-education publication', 'higher-education leaders', 'evaluate clarity, cultural impact and implementation risk', ['policy clarity', 'organisational culture', 'implementation risk'], 'formal evaluative', ['hybrid policy', 'organisational culture', 'implementation risk']),
      ], forbiddenConcepts: ['communication app review', 'online group project advice', 'digital communication workshop'],
    },
  ],
  c2: [
    {
      topicFamily: 'education and learning', specificSetting: 'public debate about whether institutional guidance weakens intellectual independence', stakeholders: ['learners', 'educational institutions', 'society'], centralTension: 'structured guidance as equality of access versus autonomy as the condition of mature learning',
      tasks: [
        taskDesign('two source texts disputing the relationship between guidance and learner autonomy', 'educated general reader', 'synthesise competing claims, evaluate assumptions and develop an independent position', ['guidance and equality', 'autonomy and intellectual risk', 'own conceptual distinction'], 'discursive academic', ['institutional guidance', 'learner autonomy', 'intellectual independence']),
        taskDesign('review of a book examining dependence on educational expertise', 'serious review readers', 'evaluate argument, method and contemporary relevance', ['central argument', 'quality of evidence or examples', 'broader relevance'], 'critical formal', ['educational expertise', 'dependence', 'critical review']),
        taskDesign('report on decision-making autonomy within a learning organisation', 'foundation trustees', 'analyse structural barriers and recommend proportionate reform', ['current decision structure', 'barrier to autonomy', 'reform with safeguard'], 'formal analytical', ['learning organisation', 'decision autonomy', 'safeguard']),
        taskDesign('article exploring whether productive uncertainty should be designed into education', 'ideas magazine readers', 'interrogate the concept and reach a nuanced conclusion', ['value of uncertainty', 'risk of abandonment', 'conditions for productive challenge'], 'discursive', ['productive uncertainty', 'educational challenge', 'institutional responsibility']),
      ], forbiddenConcepts: ['life skills in schools', 'study clinic', 'peer learning project'],
    },
    {
      topicFamily: 'work and careers', specificSetting: 'social debate about experience as both opportunity and mechanism of exclusion', stakeholders: ['new entrants', 'employers', 'professional institutions'], centralTension: 'experience as evidence of readiness versus experience requirements as inherited privilege',
      tasks: [
        taskDesign('two source texts presenting opposing accounts of experience and merit', 'educated general reader', 'synthesise claims, expose value assumptions and formulate a defensible criterion of fairness', ['experience as signal', 'access to opportunity', 'fair criterion for readiness'], 'discursive academic', ['experience requirement', 'merit', 'opportunity structure']),
        taskDesign('review of a documentary essay about invisible pathways into professional life', 'cultural review readers', 'evaluate intellectual coherence, representation and lasting insight', ['narrative approach', 'representation of access', 'lasting insight'], 'critical formal', ['professional pathways', 'invisible advantage', 'documentary essay']),
        taskDesign('report on inherited access patterns in a professional association', 'association governing council', 'diagnose mechanisms, assess consequences and propose accountable change', ['access mechanism', 'institutional consequence', 'accountable reform'], 'formal analytical', ['professional association', 'inherited access', 'accountable reform']),
        taskDesign('article asking whether competence can be separated from credentialled experience', 'public affairs magazine readers', 'analyse competing definitions and argue a nuanced position', ['competence definition', 'credential limits', 'alternative evidence'], 'discursive', ['competence', 'credentialled experience', 'alternative evidence']),
      ], forbiddenConcepts: ['short workplace visit', 'employability skills list', 'weekend job'],
    },
    {
      topicFamily: 'community and public services', specificSetting: 'debate over legitimacy when public institutions invite participation but retain control', stakeholders: ['citizens', 'administrators', 'elected representatives'], centralTension: 'consultation as democratic inclusion versus consultation as managed consent',
      tasks: [
        taskDesign('two source texts contesting the democratic value of consultation', 'educated general reader', 'synthesise arguments, assess institutional incentives and establish conditions for legitimacy', ['inclusion claim', 'control over outcomes', 'conditions for legitimate participation'], 'discursive academic', ['consultation', 'managed consent', 'democratic legitimacy']),
        taskDesign('review of an exhibition about the architecture of public decision-making', 'arts and society journal readers', 'evaluate conceptual design, accessibility and political insight', ['curatorial concept', 'audience accessibility', 'political insight'], 'critical formal', ['decision architecture', 'public exhibition', 'political insight']),
        taskDesign('report on trust erosion after a symbolic consultation process', 'independent civic commission', 'analyse causes, consequences and institutional remedies', ['source of distrust', 'effect on participation', 'remedy with accountability'], 'formal analytical', ['trust erosion', 'symbolic consultation', 'institutional remedy']),
        taskDesign('article exploring whether participation without power is worse than no participation', 'ideas magazine readers', 'test the proposition and distinguish symbolic from consequential voice', ['symbolic voice', 'consequential influence', 'ethical cost of false inclusion'], 'discursive', ['participation without power', 'symbolic voice', 'false inclusion']),
      ], forbiddenConcepts: ['community centre improvements', 'youth involvement ideas', 'local volunteer project'],
    },
    {
      topicFamily: 'environment and sustainability', specificSetting: 'ethical debate about visible green behaviour and hidden systems of consumption', stakeholders: ['consumers', 'institutions', 'supply networks'], centralTension: 'individual virtue as cultural signal versus systemic reform as less visible but more consequential',
      tasks: [
        taskDesign('two source texts disputing the moral and practical value of visible green behaviour', 'educated general reader', 'synthesise positions, evaluate causal claims and develop a layered account of responsibility', ['cultural signalling', 'systemic leverage', 'distribution of responsibility'], 'discursive academic', ['visible green behaviour', 'systemic leverage', 'responsibility']),
        taskDesign('review of a public campaign that turns environmental responsibility into spectacle', 'media and culture readers', 'evaluate persuasive design, ethical tension and behavioural consequence', ['campaign strategy', 'ethical tension', 'likely consequence'], 'critical formal', ['environmental spectacle', 'public campaign', 'behavioural consequence']),
        taskDesign('report on hidden resource costs in a major institution', 'institutional audit committee', 'identify blind spots, evaluate governance and recommend disclosure', ['hidden resource flow', 'governance weakness', 'disclosure mechanism'], 'formal analytical', ['resource cost', 'governance blind spot', 'disclosure']),
        taskDesign('article considering whether environmental consistency is an impossible moral demand', 'philosophy and society magazine readers', 'analyse the demand without dismissing responsibility', ['limits of personal consistency', 'collective structures', 'credible standard of responsibility'], 'discursive', ['environmental consistency', 'moral demand', 'collective structure']),
      ], forbiddenConcepts: ['low-waste public event', 'reusable containers', 'school event organisation'],
    },
    {
      topicFamily: 'technology and communication', specificSetting: 'debate about frictionless communication and the social value of delay', stakeholders: ['individuals', 'organisations', 'digital platforms'], centralTension: 'immediacy as responsiveness versus delay as space for judgement and responsibility',
      tasks: [
        taskDesign('two source texts interpreting delay in communication as failure or safeguard', 'educated general reader', 'synthesise arguments, evaluate their models of responsibility and develop an original distinction', ['immediacy and access', 'delay and judgement', 'responsible responsiveness'], 'discursive academic', ['communication delay', 'judgement', 'responsiveness']),
        taskDesign('review of an interactive work about silence in networked life', 'arts and technology readers', 'evaluate form, conceptual depth and audience effect', ['interactive form', 'conceptual treatment of silence', 'audience effect'], 'critical formal', ['networked silence', 'interactive work', 'audience effect']),
        taskDesign('report on an organisation damaged by an expectation of instant response', 'board risk committee', 'analyse behavioural incentives, operational consequences and policy correction', ['response expectation', 'decision-quality consequence', 'policy correction'], 'formal analytical', ['instant response', 'decision quality', 'risk policy']),
        taskDesign('article asking whether slower communication could produce more trustworthy institutions', 'public ideas magazine readers', 'examine mechanisms, objections and practical limits', ['mechanism linking delay and trust', 'cost of slower response', 'practical boundary'], 'discursive', ['slower communication', 'institutional trust', 'practical boundary']),
      ], forbiddenConcepts: ['digital relationships', 'communication app', 'online misunderstanding'],
    },
  ],
}

function checkpointRow(level, testNumber) {
  const design = CHECKPOINT_DESIGNS[level][testNumber - 2]
  const config = CAMBRIDGE_WRITING_LEVEL_CONFIGS[level]
  const audienceByTask = {}
  const purposeByTask = {}
  const registerByTask = {}
  const requiredContentPointsByTask = {}
  const specificSettingByTask = {}
  const scenarioSeeds = {}
  const lexicalAnchors = new Set()
  for (const [index, task] of config.tasks.entries()) {
    const key = `task${task.taskNumber}`
    const taskSpec = design.tasks[index]
    audienceByTask[key] = taskSpec.audience
    purposeByTask[key] = taskSpec.purpose
    registerByTask[key] = taskSpec.register
    requiredContentPointsByTask[key] = taskSpec.contentPoints
    specificSettingByTask[key] = taskSpec.setting
    scenarioSeeds[key] = `${taskSpec.setting} | ${taskSpec.audience} | ${taskSpec.purpose}`
    taskSpec.lexicalAnchors.forEach(value => lexicalAnchors.add(value))
  }
  return {
    level,
    testNumber,
    testId: getTestId(level, testNumber),
    topicFamily: design.topicFamily,
    subtopics: design.tasks.map(task => task.setting),
    audiences: Object.values(audienceByTask),
    communicativePurposes: Object.values(purposeByTask),
    registers: Object.values(registerByTask),
    scenarioSeeds,
    designFingerprint: {
      level,
      testId: getTestId(level, testNumber),
      topicFamily: design.topicFamily,
      specificSetting: design.specificSetting,
      specificSettingByTask,
      stakeholders: design.stakeholders,
      centralTension: design.centralTension,
      audienceByTask,
      purposeByTask,
      registerByTask,
      requiredContentPointsByTask,
      lexicalAnchors: [...lexicalAnchors],
      forbiddenConcepts: design.forbiddenConcepts,
    },
    forbiddenOverlapWith: [],
    status: 'planned',
  }
}

function genericRow(level, testNumber) {
  const config = CAMBRIDGE_WRITING_LEVEL_CONFIGS[level]
  const family = TOPIC_FAMILIES[(testNumber - 2) % TOPIC_FAMILIES.length]
  const cycle = Math.floor((testNumber - 2) / TOPIC_FAMILIES.length) + 1
  const levelContext = { b1: 'local everyday', b2: 'youth and community', c1: 'institutional policy', c2: 'abstract public debate' }[level]
  const specificSetting = `${levelContext} ${family} context cycle ${cycle} test ${testNumber}`
  const specificSettingByTask = {}
  const audienceByTask = {}
  const purposeByTask = {}
  const registerByTask = {}
  const requiredContentPointsByTask = {}
  const scenarioSeeds = {}
  for (const [index, task] of config.tasks.entries()) {
    const key = `task${task.taskNumber}`
    specificSettingByTask[key] = `${specificSetting} task ${task.taskNumber} ${task.genre}`
    audienceByTask[key] = `${AUDIENCE_DEFAULTS[index]} for ${level.toUpperCase()} cycle ${cycle}`
    purposeByTask[key] = `${PURPOSE_DEFAULTS[index]} in test ${testNumber}`
    registerByTask[key] = REGISTER_DEFAULTS[index]
    requiredContentPointsByTask[key] = [`${family} dimension ${cycle}-${index + 1}a`, `${family} dimension ${cycle}-${index + 1}b`, `independent judgement ${testNumber}-${index + 1}`]
    scenarioSeeds[key] = `${specificSettingByTask[key]} | ${audienceByTask[key]} | ${purposeByTask[key]}`
  }
  return {
    level, testNumber, testId: getTestId(level, testNumber), topicFamily: family,
    subtopics: Object.values(specificSettingByTask), audiences: Object.values(audienceByTask), communicativePurposes: Object.values(purposeByTask), registers: Object.values(registerByTask), scenarioSeeds,
    designFingerprint: { level, testId: getTestId(level, testNumber), topicFamily: family, specificSetting, specificSettingByTask, stakeholders: [`${level} stakeholder group ${cycle}`, `${family} decision makers`], centralTension: `${family} competing priorities for ${level} cycle ${cycle}`, audienceByTask, purposeByTask, registerByTask, requiredContentPointsByTask, lexicalAnchors: [`${level} ${family}`, `cycle ${cycle}`, `test ${testNumber}`], forbiddenConcepts: [] },
    forbiddenOverlapWith: [], status: 'planned',
  }
}

export function buildPlan() {
  const rows = []
  for (const level of CAMBRIDGE_WRITING_LEVELS) {
    const config = CAMBRIDGE_WRITING_LEVEL_CONFIGS[level]
    for (let offset = 0; offset < config.newTestCount; offset += 1) {
      const testNumber = offset + 2
      rows.push(testNumber <= 6 ? checkpointRow(level, testNumber) : genericRow(level, testNumber))
    }
  }
  return rows
}

export function validatePlan(rows) {
  const errors = []
  const ids = new Set()
  const designSignatures = new Map()
  const scenarioKeys = new Map()
  for (const level of CAMBRIDGE_WRITING_LEVELS) {
    const expected = CAMBRIDGE_WRITING_LEVEL_CONFIGS[level].newTestCount
    const levelRows = rows.filter(row => row.level === level)
    if (levelRows.length !== expected) errors.push(`${level}: expected ${expected} rows, got ${levelRows.length}`)
  }
  for (const row of rows) {
    if (ids.has(row.testId)) errors.push(`duplicate test id: ${row.testId}`)
    ids.add(row.testId)
    const fingerprint = row.designFingerprint
    if (!fingerprint?.specificSetting || !fingerprint?.centralTension || !fingerprint?.stakeholders?.length) errors.push(`${row.testId}: incomplete designFingerprint`)
    const signature = sha256({ topicFamily: row.topicFamily, specificSetting: fingerprint?.specificSetting, stakeholders: fingerprint?.stakeholders, centralTension: fingerprint?.centralTension, audienceByTask: fingerprint?.audienceByTask, purposeByTask: fingerprint?.purposeByTask, requiredContentPointsByTask: fingerprint?.requiredContentPointsByTask, lexicalAnchors: fingerprint?.lexicalAnchors })
    if (designSignatures.has(signature)) errors.push(`${row.testId}: duplicates complete design of ${designSignatures.get(signature)}`)
    designSignatures.set(signature, row.testId)
    const config = CAMBRIDGE_WRITING_LEVEL_CONFIGS[row.level]
    for (const task of config.tasks) {
      const key = `task${task.taskNumber}`
      const scenarioKey = semanticScenarioKey({ level: row.level, genre: task.genre, topicFamily: row.topicFamily, specificSetting: fingerprint?.specificSettingByTask?.[key], audience: fingerprint?.audienceByTask?.[key], communicativePurpose: fingerprint?.purposeByTask?.[key] })
      if (!normalizeText(fingerprint?.specificSettingByTask?.[key]) || !normalizeText(fingerprint?.audienceByTask?.[key]) || !normalizeText(fingerprint?.purposeByTask?.[key])) errors.push(`${row.testId} ${key}: incomplete task fingerprint`)
      if (scenarioKeys.has(scenarioKey)) errors.push(`${row.testId} ${key}: duplicate scenario key with ${scenarioKeys.get(scenarioKey)}`)
      scenarioKeys.set(scenarioKey, `${row.testId} ${key}`)
    }
  }
  if (errors.length) throw new Error(`Invalid Cambridge Writing generation plan:\n${errors.join('\n')}`)
}

function toMarkdown(rows) {
  const lines = ['# Cambridge Writing AI Generation Plan', '', `- Total planned tests: ${rows.length}`, `- Levels: ${CAMBRIDGE_WRITING_LEVELS.join(', ')}`, '', '| Test | Topic family | Specific setting | Central tension |', '|---|---|---|---|']
  for (const row of rows) lines.push(`| ${row.testId} | ${row.topicFamily} | ${row.designFingerprint.specificSetting} | ${row.designFingerprint.centralTension} |`)
  return `${lines.join('\n')}\n`
}

async function main() {
  const rows = buildPlan()
  validatePlan(rows)
  await fs.mkdir(path.dirname(JSON_OUTPUT), { recursive: true })
  await fs.writeFile(JSON_OUTPUT, `${JSON.stringify({ generatedAt: Date.now(), rows }, null, 2)}\n`)
  await fs.writeFile(MD_OUTPUT, toMarkdown(rows))
  console.log(`Planned ${rows.length} Cambridge Writing AI tests.`)
  console.log(path.relative(ROOT, JSON_OUTPUT))
  console.log(path.relative(ROOT, MD_OUTPUT))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
}
