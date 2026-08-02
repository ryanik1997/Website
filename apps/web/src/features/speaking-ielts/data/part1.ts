import type { Part1Content, TopicGroup, Difficulty } from '../types/speakingContent'

export const PART1_QUESTIONS: Part1Content[] = [
  // ── home ──────────────────────────────────────────────
  { id: 'ielts-p1-home-001', part: 1, topic: 'Home', question: 'What do you like most about your home?', topicGroup: 'home', difficulty: 'easy', tags: ['preferences', 'living'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-home-002', part: 1, topic: 'Home', question: 'How long have you lived in your current home?', topicGroup: 'home', difficulty: 'easy', tags: ['time', 'living'], bandFocus: ['describing places'] },
  { id: 'ielts-p1-home-003', part: 1, topic: 'Home', question: 'Is there anything you would change about your home?', topicGroup: 'home', difficulty: 'easy', tags: ['change', 'living'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-home-004', part: 1, topic: 'Home', question: 'Would you prefer to live in a house or a flat?', topicGroup: 'home', difficulty: 'medium', tags: ['preferences', 'housing'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-home-005', part: 1, topic: 'Home', question: 'How important is your home environment to your wellbeing?', topicGroup: 'home', difficulty: 'advanced', tags: ['environment', 'wellbeing'], bandFocus: ['expressing opinions', 'giving reasons'] },

  // ── hometown ──────────────────────────────────────────
  { id: 'ielts-p1-hometown-001', part: 1, topic: 'Hometown', question: 'Where is your hometown?', topicGroup: 'hometown', difficulty: 'easy', tags: ['location', 'geography'], bandFocus: ['describing places'] },
  { id: 'ielts-p1-hometown-002', part: 1, topic: 'Hometown', question: 'What do you like most about your hometown?', topicGroup: 'hometown', difficulty: 'easy', tags: ['preferences', 'places'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-hometown-003', part: 1, topic: 'Hometown', question: 'Would you recommend your hometown to visitors?', topicGroup: 'hometown', difficulty: 'easy', tags: ['recommendation', 'tourism'], bandFocus: ['giving reasons'] },
  { id: 'ielts-p1-hometown-004', part: 1, topic: 'Hometown', question: 'Has your hometown changed much since you were a child?', topicGroup: 'hometown', difficulty: 'medium', tags: ['change', 'places'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-hometown-005', part: 1, topic: 'Hometown', question: 'What do you think your hometown will be like in twenty years?', topicGroup: 'hometown', difficulty: 'advanced', tags: ['future', 'places'], bandFocus: ['speculating about the future'] },

  // ── accommodation ─────────────────────────────────────
  { id: 'ielts-p1-accommodation-001', part: 1, topic: 'Accommodation', question: 'Do you live in a house or a flat?', topicGroup: 'accommodation', difficulty: 'easy', tags: ['housing', 'living'], bandFocus: ['describing places'] },
  { id: 'ielts-p1-accommodation-002', part: 1, topic: 'Accommodation', question: 'What is your favourite room in your home?', topicGroup: 'accommodation', difficulty: 'easy', tags: ['preferences', 'living'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-accommodation-003', part: 1, topic: 'Accommodation', question: 'Is your accommodation near your workplace or school?', topicGroup: 'accommodation', difficulty: 'easy', tags: ['location', 'convenience'], bandFocus: ['describing places'] },
  { id: 'ielts-p1-accommodation-004', part: 1, topic: 'Accommodation', question: 'Would you like to move to a different type of accommodation in the future?', topicGroup: 'accommodation', difficulty: 'medium', tags: ['future', 'housing'], bandFocus: ['speculating about the future'] },
  { id: 'ielts-p1-accommodation-005', part: 1, topic: 'Accommodation', question: 'How easy is it to find good accommodation in your area?', topicGroup: 'accommodation', difficulty: 'medium', tags: ['housing', 'local-area'], bandFocus: ['giving reasons'] },

  // ── family ────────────────────────────────────────────
  { id: 'ielts-p1-family-001', part: 1, topic: 'Family', question: 'How many people are there in your family?', topicGroup: 'family', difficulty: 'easy', tags: ['family', 'people'], bandFocus: ['describing people'] },
  { id: 'ielts-p1-family-002', part: 1, topic: 'Family', question: 'How often do you spend time with your family?', topicGroup: 'family', difficulty: 'easy', tags: ['frequency', 'family'], bandFocus: ['talking about frequency'] },
  { id: 'ielts-p1-family-003', part: 1, topic: 'Family', question: 'What do you usually do with your family?', topicGroup: 'family', difficulty: 'easy', tags: ['activities', 'family'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-family-004', part: 1, topic: 'Family', question: 'Are you more similar to your mother or your father?', topicGroup: 'family', difficulty: 'medium', tags: ['family', 'personality'], bandFocus: ['describing people'] },
  { id: 'ielts-p1-family-005', part: 1, topic: 'Family', question: 'Who has had the biggest influence on you in your family?', topicGroup: 'family', difficulty: 'advanced', tags: ['family', 'influence'], bandFocus: ['describing people', 'giving reasons'] },

  // ── friends ───────────────────────────────────────────
  { id: 'ielts-p1-friends-001', part: 1, topic: 'Friends', question: 'How often do you see your friends?', topicGroup: 'friends', difficulty: 'easy', tags: ['frequency', 'social'], bandFocus: ['talking about frequency'] },
  { id: 'ielts-p1-friends-002', part: 1, topic: 'Friends', question: 'What do you usually do with your friends?', topicGroup: 'friends', difficulty: 'easy', tags: ['activities', 'social'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-friends-003', part: 1, topic: 'Friends', question: 'How did you meet your best friend?', topicGroup: 'friends', difficulty: 'easy', tags: ['past-events', 'social'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-friends-004', part: 1, topic: 'Friends', question: 'Do you find it easy to make new friends?', topicGroup: 'friends', difficulty: 'medium', tags: ['social', 'personality'], bandFocus: ['giving reasons'] },
  { id: 'ielts-p1-friends-005', part: 1, topic: 'Friends', question: 'Do you prefer spending time with friends or with family?', topicGroup: 'friends', difficulty: 'medium', tags: ['preferences', 'social'], bandFocus: ['expressing preferences'] },

  // ── work ──────────────────────────────────────────────
  { id: 'ielts-p1-work-001', part: 1, topic: 'Work', question: 'Do you work or are you a student?', topicGroup: 'work', difficulty: 'easy', tags: ['work', 'study'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-work-002', part: 1, topic: 'Work', question: 'Which part of your job do you find most rewarding?', topicGroup: 'work', difficulty: 'easy', tags: ['preferences', 'work'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-work-003', part: 1, topic: 'Work', question: 'What does a typical day at work look like for you?', topicGroup: 'work', difficulty: 'easy', tags: ['routine', 'work'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-work-004', part: 1, topic: 'Work', question: 'Would you like to change your job in the future?', topicGroup: 'work', difficulty: 'medium', tags: ['future', 'work'], bandFocus: ['speculating about the future'] },
  { id: 'ielts-p1-work-005', part: 1, topic: 'Work', question: 'What skills are most important for the kind of work you do?', topicGroup: 'work', difficulty: 'advanced', tags: ['skills', 'work'], bandFocus: ['expressing opinions', 'giving reasons'] },

  // ── study ─────────────────────────────────────────────
  { id: 'ielts-p1-study-001', part: 1, topic: 'Study', question: 'What subject are you studying?', topicGroup: 'study', difficulty: 'easy', tags: ['education', 'study'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-study-002', part: 1, topic: 'Study', question: 'Why did you choose to study this subject?', topicGroup: 'study', difficulty: 'easy', tags: ['reasons', 'education'], bandFocus: ['giving reasons'] },
  { id: 'ielts-p1-study-003', part: 1, topic: 'Study', question: 'What do you find most interesting about your studies?', topicGroup: 'study', difficulty: 'easy', tags: ['preferences', 'education'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-study-004', part: 1, topic: 'Study', question: 'Has your attitude towards studying changed since you were younger?', topicGroup: 'study', difficulty: 'medium', tags: ['change', 'education'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-study-005', part: 1, topic: 'Study', question: 'What would you say is the most challenging part of your studies?', topicGroup: 'study', difficulty: 'advanced', tags: ['education', 'challenges'], bandFocus: ['expressing opinions', 'giving reasons'] },

  // ── technology ────────────────────────────────────────
  { id: 'ielts-p1-technology-001', part: 1, topic: 'Technology', question: 'Do you use technology a lot in your daily life?', topicGroup: 'technology', difficulty: 'easy', tags: ['technology', 'habits'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-technology-002', part: 1, topic: 'Technology', question: 'What device do you use most often?', topicGroup: 'technology', difficulty: 'easy', tags: ['technology', 'devices'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-technology-003', part: 1, topic: 'Technology', question: 'Did you use computers much when you were a child?', topicGroup: 'technology', difficulty: 'easy', tags: ['past-events', 'technology'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-technology-004', part: 1, topic: 'Technology', question: 'Has technology changed the way you communicate?', topicGroup: 'technology', difficulty: 'medium', tags: ['technology', 'communication'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-technology-005', part: 1, topic: 'Technology', question: 'Do you think people rely too much on technology nowadays?', topicGroup: 'technology', difficulty: 'advanced', tags: ['technology', 'opinions'], bandFocus: ['expressing opinions'] },

  // ── education ─────────────────────────────────────────
  { id: 'ielts-p1-education-001', part: 1, topic: 'Education', question: 'What was your favourite subject at school?', topicGroup: 'education', difficulty: 'easy', tags: ['preferences', 'school'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-education-002', part: 1, topic: 'Education', question: 'Did you enjoy your time at school?', topicGroup: 'education', difficulty: 'easy', tags: ['past-events', 'school'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-education-003', part: 1, topic: 'Education', question: 'How did you usually get to school?', topicGroup: 'education', difficulty: 'easy', tags: ['habits', 'transport'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-education-004', part: 1, topic: 'Education', question: 'Has your opinion of education changed since you left school?', topicGroup: 'education', difficulty: 'medium', tags: ['change', 'education'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-education-005', part: 1, topic: 'Education', question: 'What would you like to study in the future?', topicGroup: 'education', difficulty: 'medium', tags: ['future', 'education'], bandFocus: ['speculating about the future'] },

  // ── environment ───────────────────────────────────────
  { id: 'ielts-p1-environment-001', part: 1, topic: 'Environment', question: 'Is looking after the environment important to you?', topicGroup: 'environment', difficulty: 'easy', tags: ['environment', 'opinions'], bandFocus: ['expressing opinions'] },
  { id: 'ielts-p1-environment-002', part: 1, topic: 'Environment', question: 'What do you do to protect the environment?', topicGroup: 'environment', difficulty: 'easy', tags: ['habits', 'environment'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-environment-003', part: 1, topic: 'Environment', question: 'Is there a lot of pollution where you live?', topicGroup: 'environment', difficulty: 'easy', tags: ['environment', 'local-area'], bandFocus: ['describing places'] },
  { id: 'ielts-p1-environment-004', part: 1, topic: 'Environment', question: 'Has the environment in your area changed in recent years?', topicGroup: 'environment', difficulty: 'medium', tags: ['change', 'environment'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-environment-005', part: 1, topic: 'Environment', question: 'Would you like to live somewhere with more green spaces?', topicGroup: 'environment', difficulty: 'medium', tags: ['preferences', 'environment'], bandFocus: ['expressing preferences'] },

  // ── transport ─────────────────────────────────────────
  { id: 'ielts-p1-transport-001', part: 1, topic: 'Transport', question: 'What form of transport do you usually use?', topicGroup: 'transport', difficulty: 'easy', tags: ['transport', 'habits'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-transport-002', part: 1, topic: 'Transport', question: 'Do you prefer public transport or private transport?', topicGroup: 'transport', difficulty: 'easy', tags: ['preferences', 'transport'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-transport-003', part: 1, topic: 'Transport', question: 'How long does it take you to travel to work or school?', topicGroup: 'transport', difficulty: 'easy', tags: ['time', 'transport'], bandFocus: ['describing time'] },
  { id: 'ielts-p1-transport-004', part: 1, topic: 'Transport', question: 'Has transport in your area improved in recent years?', topicGroup: 'transport', difficulty: 'medium', tags: ['change', 'transport'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-transport-005', part: 1, topic: 'Transport', question: 'Would you like to use a different form of transport in the future?', topicGroup: 'transport', difficulty: 'medium', tags: ['future', 'transport'], bandFocus: ['speculating about the future'] },

  // ── travel ────────────────────────────────────────────
  { id: 'ielts-p1-travel-001', part: 1, topic: 'Travel', question: 'Do you like travelling?', topicGroup: 'travel', difficulty: 'easy', tags: ['preferences', 'travel'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-travel-002', part: 1, topic: 'Travel', question: 'Where would you like to travel in the future?', topicGroup: 'travel', difficulty: 'easy', tags: ['future', 'travel'], bandFocus: ['speculating about the future'] },
  { id: 'ielts-p1-travel-003', part: 1, topic: 'Travel', question: 'Do you prefer travelling alone or with other people?', topicGroup: 'travel', difficulty: 'easy', tags: ['preferences', 'travel'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-travel-004', part: 1, topic: 'Travel', question: 'What was the most interesting place you have visited?', topicGroup: 'travel', difficulty: 'medium', tags: ['past-events', 'travel'], bandFocus: ['describing places'] },
  { id: 'ielts-p1-travel-005', part: 1, topic: 'Travel', question: 'Do you travel differently now compared to when you were younger?', topicGroup: 'travel', difficulty: 'medium', tags: ['change', 'travel'], bandFocus: ['comparing past and present'] },

  // ── food ──────────────────────────────────────────────
  { id: 'ielts-p1-food-001', part: 1, topic: 'Food', question: 'What is your favourite food?', topicGroup: 'food', difficulty: 'easy', tags: ['preferences', 'food'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-food-002', part: 1, topic: 'Food', question: 'Do you like cooking?', topicGroup: 'food', difficulty: 'easy', tags: ['habits', 'food'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-food-003', part: 1, topic: 'Food', question: 'How often do you eat out?', topicGroup: 'food', difficulty: 'easy', tags: ['frequency', 'food'], bandFocus: ['talking about frequency'] },
  { id: 'ielts-p1-food-004', part: 1, topic: 'Food', question: 'Has your taste in food changed over the years?', topicGroup: 'food', difficulty: 'medium', tags: ['change', 'food'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-food-005', part: 1, topic: 'Food', question: 'Would you like to try food from a different culture?', topicGroup: 'food', difficulty: 'medium', tags: ['preferences', 'food'], bandFocus: ['expressing preferences'] },

  // ── health ────────────────────────────────────────────
  { id: 'ielts-p1-health-001', part: 1, topic: 'Health', question: 'What do you do to keep healthy?', topicGroup: 'health', difficulty: 'easy', tags: ['habits', 'health'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-health-002', part: 1, topic: 'Health', question: 'Do you think you have a healthy diet?', topicGroup: 'health', difficulty: 'easy', tags: ['opinions', 'health'], bandFocus: ['expressing opinions'] },
  { id: 'ielts-p1-health-003', part: 1, topic: 'Health', question: 'How often do you exercise?', topicGroup: 'health', difficulty: 'easy', tags: ['frequency', 'health'], bandFocus: ['talking about frequency'] },
  { id: 'ielts-p1-health-004', part: 1, topic: 'Health', question: 'What do you do when you feel unwell?', topicGroup: 'health', difficulty: 'medium', tags: ['habits', 'health'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-health-005', part: 1, topic: 'Health', question: 'Do you think people are healthier now than they were in the past?', topicGroup: 'health', difficulty: 'advanced', tags: ['change', 'health'], bandFocus: ['comparing past and present'] },

  // ── sports ────────────────────────────────────────────
  { id: 'ielts-p1-sports-001', part: 1, topic: 'Sports', question: 'Do you like sports?', topicGroup: 'sports', difficulty: 'easy', tags: ['preferences', 'sports'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-sports-002', part: 1, topic: 'Sports', question: 'What sport do you usually play?', topicGroup: 'sports', difficulty: 'easy', tags: ['habits', 'sports'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-sports-003', part: 1, topic: 'Sports', question: 'Do you prefer watching or playing sports?', topicGroup: 'sports', difficulty: 'easy', tags: ['preferences', 'sports'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-sports-004', part: 1, topic: 'Sports', question: 'Did you play any sports when you were at school?', topicGroup: 'sports', difficulty: 'medium', tags: ['past-events', 'sports'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-sports-005', part: 1, topic: 'Sports', question: 'Would you like to try a new sport in the future?', topicGroup: 'sports', difficulty: 'medium', tags: ['future', 'sports'], bandFocus: ['speculating about the future'] },

  // ── leisure ───────────────────────────────────────────
  { id: 'ielts-p1-leisure-001', part: 1, topic: 'Leisure', question: 'What do you do in your free time?', topicGroup: 'leisure', difficulty: 'easy', tags: ['habits', 'leisure'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-leisure-002', part: 1, topic: 'Leisure', question: 'Do you prefer indoor or outdoor activities?', topicGroup: 'leisure', difficulty: 'easy', tags: ['preferences', 'leisure'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-leisure-003', part: 1, topic: 'Leisure', question: 'How do you usually relax at the weekend?', topicGroup: 'leisure', difficulty: 'easy', tags: ['habits', 'leisure'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-leisure-004', part: 1, topic: 'Leisure', question: 'Have your free time activities changed since you were a child?', topicGroup: 'leisure', difficulty: 'medium', tags: ['change', 'leisure'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-leisure-005', part: 1, topic: 'Leisure', question: 'Do you think people have enough free time nowadays?', topicGroup: 'leisure', difficulty: 'advanced', tags: ['opinions', 'leisure'], bandFocus: ['expressing opinions'] },

  // ── books ─────────────────────────────────────────────
  { id: 'ielts-p1-books-001', part: 1, topic: 'Books', question: 'Do you like reading books?', topicGroup: 'books', difficulty: 'easy', tags: ['preferences', 'reading'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-books-002', part: 1, topic: 'Books', question: 'What kind of books do you usually read?', topicGroup: 'books', difficulty: 'easy', tags: ['habits', 'reading'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-books-003', part: 1, topic: 'Books', question: 'Do you prefer reading books or watching films?', topicGroup: 'books', difficulty: 'easy', tags: ['preferences', 'reading'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-books-004', part: 1, topic: 'Books', question: 'Did you read more when you were younger than you do now?', topicGroup: 'books', difficulty: 'medium', tags: ['change', 'reading'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-books-005', part: 1, topic: 'Books', question: 'Do you think reading is becoming less popular these days?', topicGroup: 'books', difficulty: 'advanced', tags: ['opinions', 'reading'], bandFocus: ['expressing opinions'] },

  // ── music ─────────────────────────────────────────────
  { id: 'ielts-p1-music-001', part: 1, topic: 'Music', question: 'What kind of music do you like?', topicGroup: 'music', difficulty: 'easy', tags: ['preferences', 'music'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-music-002', part: 1, topic: 'Music', question: 'How often do you listen to music?', topicGroup: 'music', difficulty: 'easy', tags: ['frequency', 'music'], bandFocus: ['talking about frequency'] },
  { id: 'ielts-p1-music-003', part: 1, topic: 'Music', question: 'Do you play any musical instruments?', topicGroup: 'music', difficulty: 'easy', tags: ['habits', 'music'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-music-004', part: 1, topic: 'Music', question: 'Do you think the kind of music you listen to reflects your personality?', topicGroup: 'music', difficulty: 'medium', tags: ['personality', 'music'], bandFocus: ['expressing opinions'] },
  { id: 'ielts-p1-music-005', part: 1, topic: 'Music', question: 'Would you like to learn to play a musical instrument in the future?', topicGroup: 'music', difficulty: 'medium', tags: ['future', 'music'], bandFocus: ['speculating about the future'] },

  // ── films ─────────────────────────────────────────────
  { id: 'ielts-p1-films-001', part: 1, topic: 'Films', question: 'Do you like watching films?', topicGroup: 'films', difficulty: 'easy', tags: ['preferences', 'films'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-films-002', part: 1, topic: 'Films', question: 'What kind of films do you enjoy most?', topicGroup: 'films', difficulty: 'easy', tags: ['preferences', 'films'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-films-003', part: 1, topic: 'Films', question: 'How often do you go to the cinema?', topicGroup: 'films', difficulty: 'easy', tags: ['frequency', 'films'], bandFocus: ['talking about frequency'] },
  { id: 'ielts-p1-films-004', part: 1, topic: 'Films', question: 'Do you prefer watching films at home or at the cinema?', topicGroup: 'films', difficulty: 'medium', tags: ['preferences', 'films'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-films-005', part: 1, topic: 'Films', question: 'What makes a film memorable for you?', topicGroup: 'films', difficulty: 'advanced', tags: ['opinions', 'films'], bandFocus: ['expressing opinions', 'giving reasons'] },

  // ── art ───────────────────────────────────────────────
  { id: 'ielts-p1-art-001', part: 1, topic: 'Art', question: 'Do you like art?', topicGroup: 'art', difficulty: 'easy', tags: ['preferences', 'art'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-art-002', part: 1, topic: 'Art', question: 'Have you ever visited an art gallery?', topicGroup: 'art', difficulty: 'easy', tags: ['past-events', 'art'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-art-003', part: 1, topic: 'Art', question: 'Can you draw or paint?', topicGroup: 'art', difficulty: 'easy', tags: ['skills', 'art'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-art-004', part: 1, topic: 'Art', question: 'Do you think art is important for children?', topicGroup: 'art', difficulty: 'medium', tags: ['opinions', 'art'], bandFocus: ['expressing opinions'] },
  { id: 'ielts-p1-art-005', part: 1, topic: 'Art', question: 'Has your interest in art changed since you were younger?', topicGroup: 'art', difficulty: 'medium', tags: ['change', 'art'], bandFocus: ['comparing past and present'] },

  // ── culture ───────────────────────────────────────────
  { id: 'ielts-p1-culture-001', part: 1, topic: 'Culture', question: 'Is there a cultural tradition you enjoy taking part in?', topicGroup: 'culture', difficulty: 'easy', tags: ['habits', 'culture'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-culture-002', part: 1, topic: 'Culture', question: 'What is a popular festival in your country?', topicGroup: 'culture', difficulty: 'easy', tags: ['culture', 'festivals'], bandFocus: ['describing places'] },
  { id: 'ielts-p1-culture-003', part: 1, topic: 'Culture', question: 'Do you think culture is important to people?', topicGroup: 'culture', difficulty: 'easy', tags: ['opinions', 'culture'], bandFocus: ['expressing opinions'] },
  { id: 'ielts-p1-culture-004', part: 1, topic: 'Culture', question: 'How has culture in your country changed in recent years?', topicGroup: 'culture', difficulty: 'medium', tags: ['change', 'culture'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-culture-005', part: 1, topic: 'Culture', question: 'Would you like to learn more about another culture?', topicGroup: 'culture', difficulty: 'medium', tags: ['preferences', 'culture'], bandFocus: ['expressing preferences'] },

  // ── traditions ────────────────────────────────────────
  { id: 'ielts-p1-traditions-001', part: 1, topic: 'Traditions', question: 'Does your family have any special traditions?', topicGroup: 'traditions', difficulty: 'easy', tags: ['family', 'traditions'], bandFocus: ['describing people'] },
  { id: 'ielts-p1-traditions-002', part: 1, topic: 'Traditions', question: 'What traditions did you follow when you were a child?', topicGroup: 'traditions', difficulty: 'easy', tags: ['past-events', 'traditions'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-traditions-003', part: 1, topic: 'Traditions', question: 'Do you think traditions are still important today?', topicGroup: 'traditions', difficulty: 'easy', tags: ['opinions', 'traditions'], bandFocus: ['expressing opinions'] },
  { id: 'ielts-p1-traditions-004', part: 1, topic: 'Traditions', question: 'Have any traditions in your country changed over time?', topicGroup: 'traditions', difficulty: 'medium', tags: ['change', 'traditions'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-traditions-005', part: 1, topic: 'Traditions', question: 'Why do you think some traditions disappear over time?', topicGroup: 'traditions', difficulty: 'advanced', tags: ['traditions', 'change'], bandFocus: ['giving reasons'] },

  // ── history ───────────────────────────────────────────
  { id: 'ielts-p1-history-001', part: 1, topic: 'History', question: 'Are you interested in history?', topicGroup: 'history', difficulty: 'easy', tags: ['preferences', 'history'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-history-002', part: 1, topic: 'History', question: 'Did you enjoy history lessons at school?', topicGroup: 'history', difficulty: 'easy', tags: ['past-events', 'history'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-history-003', part: 1, topic: 'History', question: 'Have you ever visited a historical place?', topicGroup: 'history', difficulty: 'easy', tags: ['past-events', 'history'], bandFocus: ['describing places'] },
  { id: 'ielts-p1-history-004', part: 1, topic: 'History', question: 'What period of history interests you most?', topicGroup: 'history', difficulty: 'medium', tags: ['preferences', 'history'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-history-005', part: 1, topic: 'History', question: 'Do you think it is important to learn about history?', topicGroup: 'history', difficulty: 'medium', tags: ['opinions', 'history'], bandFocus: ['expressing opinions'] },

  // ── media ─────────────────────────────────────────────
  { id: 'ielts-p1-media-001', part: 1, topic: 'Media', question: 'How do you usually get your news?', topicGroup: 'media', difficulty: 'easy', tags: ['habits', 'news'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-media-002', part: 1, topic: 'Media', question: 'Do you prefer reading news online or in print?', topicGroup: 'media', difficulty: 'easy', tags: ['preferences', 'news'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-media-003', part: 1, topic: 'Media', question: 'How much time do you spend on social media each day?', topicGroup: 'media', difficulty: 'easy', tags: ['frequency', 'social-media'], bandFocus: ['talking about frequency'] },
  { id: 'ielts-p1-media-004', part: 1, topic: 'Media', question: 'Has the way you follow the news changed in recent years?', topicGroup: 'media', difficulty: 'medium', tags: ['change', 'media'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-media-005', part: 1, topic: 'Media', question: 'Do you think the media always reports the truth?', topicGroup: 'media', difficulty: 'advanced', tags: ['opinions', 'media'], bandFocus: ['expressing opinions'] },

  // ── advertising ───────────────────────────────────────
  { id: 'ielts-p1-advertising-001', part: 1, topic: 'Advertising', question: 'Do you pay attention to advertisements?', topicGroup: 'advertising', difficulty: 'easy', tags: ['habits', 'advertising'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-advertising-002', part: 1, topic: 'Advertising', question: 'Are there many advertisements where you live?', topicGroup: 'advertising', difficulty: 'easy', tags: ['local-area', 'advertising'], bandFocus: ['describing places'] },
  { id: 'ielts-p1-advertising-003', part: 1, topic: 'Advertising', question: 'Have you ever bought something because of an advert?', topicGroup: 'advertising', difficulty: 'easy', tags: ['past-events', 'advertising'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-advertising-004', part: 1, topic: 'Advertising', question: 'Do you think advertisements influence the way people shop?', topicGroup: 'advertising', difficulty: 'medium', tags: ['opinions', 'advertising'], bandFocus: ['expressing opinions'] },
  { id: 'ielts-p1-advertising-005', part: 1, topic: 'Advertising', question: 'Would you like to work in advertising?', topicGroup: 'advertising', difficulty: 'medium', tags: ['future', 'advertising'], bandFocus: ['speculating about the future'] },

  // ── shopping ──────────────────────────────────────────
  { id: 'ielts-p1-shopping-001', part: 1, topic: 'Shopping', question: 'Do you enjoy shopping?', topicGroup: 'shopping', difficulty: 'easy', tags: ['preferences', 'shopping'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-shopping-002', part: 1, topic: 'Shopping', question: 'How often do you go shopping?', topicGroup: 'shopping', difficulty: 'easy', tags: ['frequency', 'shopping'], bandFocus: ['talking about frequency'] },
  { id: 'ielts-p1-shopping-003', part: 1, topic: 'Shopping', question: 'Do you prefer shopping online or in shops?', topicGroup: 'shopping', difficulty: 'easy', tags: ['preferences', 'shopping'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-shopping-004', part: 1, topic: 'Shopping', question: 'Have your shopping habits changed in recent years?', topicGroup: 'shopping', difficulty: 'medium', tags: ['change', 'shopping'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-shopping-005', part: 1, topic: 'Shopping', question: 'Would you like to buy fewer things in the future?', topicGroup: 'shopping', difficulty: 'medium', tags: ['future', 'shopping'], bandFocus: ['speculating about the future'] },

  // ── money ─────────────────────────────────────────────
  { id: 'ielts-p1-money-001', part: 1, topic: 'Money', question: 'Do you think it is important to save money?', topicGroup: 'money', difficulty: 'easy', tags: ['opinions', 'money'], bandFocus: ['expressing opinions'] },
  { id: 'ielts-p1-money-002', part: 1, topic: 'Money', question: 'Do you prefer paying with cash or by card?', topicGroup: 'money', difficulty: 'easy', tags: ['preferences', 'money'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-money-003', part: 1, topic: 'Money', question: 'How do you usually keep track of your spending?', topicGroup: 'money', difficulty: 'easy', tags: ['habits', 'money'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-money-004', part: 1, topic: 'Money', question: 'Did you get pocket money when you were a child?', topicGroup: 'money', difficulty: 'medium', tags: ['past-events', 'money'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-money-005', part: 1, topic: 'Money', question: 'Has the way people use money changed since you were younger?', topicGroup: 'money', difficulty: 'advanced', tags: ['change', 'money'], bandFocus: ['comparing past and present'] },

  // ── public-services ───────────────────────────────────
  { id: 'ielts-p1-public-services-001', part: 1, topic: 'Public services', question: 'Are there good public services in your area?', topicGroup: 'public-services', difficulty: 'easy', tags: ['local-area', 'public-services'], bandFocus: ['describing places'] },
  { id: 'ielts-p1-public-services-002', part: 1, topic: 'Public services', question: 'Do you use public services such as libraries or parks?', topicGroup: 'public-services', difficulty: 'easy', tags: ['habits', 'public-services'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-public-services-003', part: 1, topic: 'Public services', question: 'How often do you use public libraries or community centres?', topicGroup: 'public-services', difficulty: 'easy', tags: ['frequency', 'public-services'], bandFocus: ['talking about frequency'] },
  { id: 'ielts-p1-public-services-004', part: 1, topic: 'Public services', question: 'Have public services in your area improved in recent years?', topicGroup: 'public-services', difficulty: 'medium', tags: ['change', 'public-services'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-public-services-005', part: 1, topic: 'Public services', question: 'Would you like more public services to be available where you live?', topicGroup: 'public-services', difficulty: 'medium', tags: ['preferences', 'public-services'], bandFocus: ['expressing preferences'] },

  // ── cities ────────────────────────────────────────────
  { id: 'ielts-p1-cities-001', part: 1, topic: 'Cities', question: 'Do you live in a city?', topicGroup: 'cities', difficulty: 'easy', tags: ['location', 'cities'], bandFocus: ['describing places'] },
  { id: 'ielts-p1-cities-002', part: 1, topic: 'Cities', question: 'What do you like most about your city?', topicGroup: 'cities', difficulty: 'easy', tags: ['preferences', 'cities'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-cities-003', part: 1, topic: 'Cities', question: 'Is your city a good place for young people?', topicGroup: 'cities', difficulty: 'easy', tags: ['opinions', 'cities'], bandFocus: ['expressing opinions'] },
  { id: 'ielts-p1-cities-004', part: 1, topic: 'Cities', question: 'Has the city you live in changed much in recent years?', topicGroup: 'cities', difficulty: 'medium', tags: ['change', 'cities'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-cities-005', part: 1, topic: 'Cities', question: 'What problems do you think cities will face in the future?', topicGroup: 'cities', difficulty: 'advanced', tags: ['future', 'cities'], bandFocus: ['speculating about the future'] },

  // ── countryside ───────────────────────────────────────
  { id: 'ielts-p1-countryside-001', part: 1, topic: 'Countryside', question: 'Do you like the countryside?', topicGroup: 'countryside', difficulty: 'easy', tags: ['preferences', 'countryside'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-countryside-002', part: 1, topic: 'Countryside', question: 'How often do you visit the countryside?', topicGroup: 'countryside', difficulty: 'easy', tags: ['frequency', 'countryside'], bandFocus: ['talking about frequency'] },
  { id: 'ielts-p1-countryside-003', part: 1, topic: 'Countryside', question: 'Did you spend time in the countryside when you were a child?', topicGroup: 'countryside', difficulty: 'easy', tags: ['past-events', 'countryside'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-countryside-004', part: 1, topic: 'Countryside', question: 'Would you prefer to live in the countryside or in a city?', topicGroup: 'countryside', difficulty: 'medium', tags: ['preferences', 'countryside'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-countryside-005', part: 1, topic: 'Countryside', question: 'Has the countryside near your home changed over the years?', topicGroup: 'countryside', difficulty: 'medium', tags: ['change', 'countryside'], bandFocus: ['comparing past and present'] },

  // ── communication ─────────────────────────────────────
  { id: 'ielts-p1-communication-001', part: 1, topic: 'Communication', question: 'How do you usually keep in touch with friends?', topicGroup: 'communication', difficulty: 'easy', tags: ['habits', 'communication'], bandFocus: ['talking about habits'] },
  { id: 'ielts-p1-communication-002', part: 1, topic: 'Communication', question: 'Do you prefer phone calls or text messages?', topicGroup: 'communication', difficulty: 'easy', tags: ['preferences', 'communication'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-communication-003', part: 1, topic: 'Communication', question: 'How often do you speak to people face to face?', topicGroup: 'communication', difficulty: 'easy', tags: ['frequency', 'communication'], bandFocus: ['talking about frequency'] },
  { id: 'ielts-p1-communication-004', part: 1, topic: 'Communication', question: 'Has the way you communicate changed since you were younger?', topicGroup: 'communication', difficulty: 'medium', tags: ['change', 'communication'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-communication-005', part: 1, topic: 'Communication', question: 'Do you think people communicate better now than in the past?', topicGroup: 'communication', difficulty: 'advanced', tags: ['opinions', 'communication'], bandFocus: ['comparing past and present'] },

  // ── science ───────────────────────────────────────────
  { id: 'ielts-p1-science-001', part: 1, topic: 'Science', question: 'Are you interested in science?', topicGroup: 'science', difficulty: 'easy', tags: ['preferences', 'science'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-science-002', part: 1, topic: 'Science', question: 'Were you good at science at school?', topicGroup: 'science', difficulty: 'easy', tags: ['past-events', 'science'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-science-003', part: 1, topic: 'Science', question: 'What area of science interests you most?', topicGroup: 'science', difficulty: 'easy', tags: ['preferences', 'science'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-science-004', part: 1, topic: 'Science', question: 'Has science changed the way we live?', topicGroup: 'science', difficulty: 'medium', tags: ['opinions', 'science'], bandFocus: ['expressing opinions'] },
  { id: 'ielts-p1-science-005', part: 1, topic: 'Science', question: 'Would you like to learn more about science in the future?', topicGroup: 'science', difficulty: 'medium', tags: ['future', 'science'], bandFocus: ['speculating about the future'] },

  // ── innovation ────────────────────────────────────────
  { id: 'ielts-p1-innovation-001', part: 1, topic: 'Innovation', question: 'Do you like trying out new gadgets?', topicGroup: 'innovation', difficulty: 'easy', tags: ['preferences', 'innovation'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-innovation-002', part: 1, topic: 'Innovation', question: 'What new invention has been most useful to you?', topicGroup: 'innovation', difficulty: 'easy', tags: ['past-events', 'innovation'], bandFocus: ['describing past events'] },
  { id: 'ielts-p1-innovation-003', part: 1, topic: 'Innovation', question: 'Do you think new technology makes life easier?', topicGroup: 'innovation', difficulty: 'easy', tags: ['opinions', 'innovation'], bandFocus: ['expressing opinions'] },
  { id: 'ielts-p1-innovation-004', part: 1, topic: 'Innovation', question: 'Has your attitude towards new technology changed over time?', topicGroup: 'innovation', difficulty: 'medium', tags: ['change', 'innovation'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-innovation-005', part: 1, topic: 'Innovation', question: 'What kind of innovation would you like to see in the future?', topicGroup: 'innovation', difficulty: 'advanced', tags: ['future', 'innovation'], bandFocus: ['speculating about the future'] },

  // ── social-change ─────────────────────────────────────
  { id: 'ielts-p1-social-change-001', part: 1, topic: 'Social change', question: 'Has your lifestyle changed in recent years?', topicGroup: 'social-change', difficulty: 'easy', tags: ['change', 'lifestyle'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-social-change-002', part: 1, topic: 'Social change', question: 'Do you think people\u2019s habits have changed since you were a child?', topicGroup: 'social-change', difficulty: 'easy', tags: ['change', 'society'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-social-change-003', part: 1, topic: 'Social change', question: 'Would you like to see any changes in your community?', topicGroup: 'social-change', difficulty: 'easy', tags: ['preferences', 'community'], bandFocus: ['expressing preferences'] },
  { id: 'ielts-p1-social-change-004', part: 1, topic: 'Social change', question: 'Has the role of technology in daily life changed since you were younger?', topicGroup: 'social-change', difficulty: 'medium', tags: ['change', 'technology'], bandFocus: ['comparing past and present'] },
  { id: 'ielts-p1-social-change-005', part: 1, topic: 'Social change', question: 'How might society change in the next twenty years?', topicGroup: 'social-change', difficulty: 'advanced', tags: ['future', 'society'], bandFocus: ['speculating about the future'] },
]
