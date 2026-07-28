import { z } from 'zod'

export const CambridgeWritingLevelSchema = z.enum(['a2', 'b1', 'b2', 'c1', 'c2'])
export type CambridgeWritingLevel = z.infer<typeof CambridgeWritingLevelSchema>

export const CambridgeWritingExamNameSchema = z.enum(['KET', 'PET', 'FCE', 'CAE', 'CPE'])
export type CambridgeWritingExamName = z.infer<typeof CambridgeWritingExamNameSchema>

export const CambridgeWritingGenreSchema = z.enum([
  'email',
  'letter',
  'essay',
  'article',
  'review',
  'report',
  'proposal',
  'story',
  'other',
])
export type CambridgeWritingGenre = z.infer<typeof CambridgeWritingGenreSchema>

export const CambridgeWritingAssetSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  src: z.string(),
  alt: z.string().optional(),
  originalPath: z.string().optional(),
})
export type CambridgeWritingAsset = z.infer<typeof CambridgeWritingAssetSchema>

export const CambridgeWritingChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  title: z.string().optional(),
  genre: CambridgeWritingGenreSchema.optional(),
  promptText: z.string().optional(),
  promptHtml: z.string().optional(),
  imageAssets: z.array(CambridgeWritingAssetSchema).optional(),
})
export type CambridgeWritingChoice = z.infer<typeof CambridgeWritingChoiceSchema>

export const CambridgeWritingSampleAnswerSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  text: z.string(),
  score: z.string().optional(),
  feedback: z.string().optional(),
})
export type CambridgeWritingSampleAnswer = z.infer<typeof CambridgeWritingSampleAnswerSchema>

export const CambridgeWritingPromptBlockSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('paragraph'),
    text: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('panel'),
    variant: z.enum(['notes', 'announcement', 'opinions', 'generic']),
    heading: z.string().optional(),
    paragraphs: z.array(z.string()).optional(),
    listItems: z.array(z.string()).optional(),
    footer: z.string().optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('email'),
    from: z.string().optional(),
    subject: z.string().optional(),
    greeting: z.string().optional(),
    paragraphs: z.array(z.string()),
    closing: z.string().optional(),
    sender: z.string().optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('source-text'),
    label: z.string(),
    title: z.string().optional(),
    text: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('final-instruction'),
    text: z.string(),
  }),
])
export type CambridgeWritingPromptBlock = z.infer<typeof CambridgeWritingPromptBlockSchema>

export const CambridgeWritingPresentationSchema = z.object({
  template: z.enum([
    'plain',
    'essay-notes',
    'essay-notes-opinions',
    'announcement',
    'email',
    'source-texts',
  ]),
  optionalQuestionGroupId: z.string().optional(),
  selectionRequired: z.number().int().positive().optional(),
  headerInstruction: z.string().optional(),
})
export type CambridgeWritingPresentation = z.infer<typeof CambridgeWritingPresentationSchema>

export const CambridgeWritingContentStatusSchema = z.enum(['draft', 'published', 'archived'])
export type CambridgeWritingContentStatus = z.infer<typeof CambridgeWritingContentStatusSchema>

export const CambridgeWritingTaskSchema = z.object({
  id: z.string(),
  partNumber: z.number().int().positive(),
  taskNumber: z.number().int().positive(),
  title: z.string(),
  genre: CambridgeWritingGenreSchema,
  instruction: z.string(),
  promptText: z.string().optional(),
  promptHtml: z.string().optional(),
  promptBlocks: z.array(CambridgeWritingPromptBlockSchema).optional(),
  presentation: CambridgeWritingPresentationSchema.optional(),
  choices: z.array(CambridgeWritingChoiceSchema).optional(),
  wordLimit: z.object({
    min: z.number().int().positive().optional(),
    max: z.number().int().positive().optional(),
    displayText: z.string().optional(),
  }).optional(),
  imageAssets: z.array(CambridgeWritingAssetSchema).optional(),
  sampleAnswers: z.array(CambridgeWritingSampleAnswerSchema).optional(),
  metadata: z.object({
    compulsory: z.boolean().optional(),
    sourceQuestionNumber: z.string().optional(),
    sourcePage: z.number().int().positive().optional(),
    ketSourcePartId: z.string().optional(),
    ketQuestionPrompt: z.string().optional(),
    ketImageUrls: z.array(z.string()).optional(),
  }).optional(),
})
export type CambridgeWritingTask = z.infer<typeof CambridgeWritingTaskSchema>

export const CambridgeWritingTestSchema = z.object({
  id: z.string(),
  level: CambridgeWritingLevelSchema,
  testNumber: z.number().int().positive(),
  title: z.string(),
  sourceUrl: z.string().optional(),
  sourceFile: z.string().optional(),
  status: CambridgeWritingContentStatusSchema.default('draft'),
  version: z.number().int().nonnegative().default(1),
  createdAt: z.number().int().optional(),
  updatedAt: z.number().int().optional(),
  createdBy: z.string().optional(),
  tasks: z.array(CambridgeWritingTaskSchema).min(1),
})
export type CambridgeWritingTest = z.infer<typeof CambridgeWritingTestSchema>

export const CambridgeWritingCollectionSchema = z.object({
  level: CambridgeWritingLevelSchema,
  examName: CambridgeWritingExamNameSchema,
  title: z.string(),
  testCount: z.number().int().nonnegative(),
  tests: z.array(CambridgeWritingTestSchema),
})
export type CambridgeWritingCollection = z.infer<typeof CambridgeWritingCollectionSchema>

export const CambridgeWritingManifestItemSchema = z.object({
  examName: CambridgeWritingExamNameSchema,
  displayName: z.string(),
  testCount: z.number().int().nonnegative(),
  taskCount: z.number().int().nonnegative(),
  genres: z.array(CambridgeWritingGenreSchema),
})
export type CambridgeWritingManifestItem = z.infer<typeof CambridgeWritingManifestItemSchema>

export const CambridgeWritingManifestSchema = z.object({
  a2: CambridgeWritingManifestItemSchema,
  b1: CambridgeWritingManifestItemSchema,
  b2: CambridgeWritingManifestItemSchema,
  c1: CambridgeWritingManifestItemSchema,
  c2: CambridgeWritingManifestItemSchema,
})
export type CambridgeWritingManifest = z.infer<typeof CambridgeWritingManifestSchema>
