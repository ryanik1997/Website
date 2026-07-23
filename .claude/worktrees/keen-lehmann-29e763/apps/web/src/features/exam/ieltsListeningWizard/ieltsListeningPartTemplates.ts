import { getIeltsListeningP1TemplatePart } from '../ieltsListeningImportTemplates'
import {
  buildIeltsListeningP2Template,
  type IeltsListeningP2TemplateKind,
} from '../ieltsListeningP2Templates'
import {
  buildIeltsListeningP3Template,
  type IeltsListeningP3TemplateKind,
} from '../ieltsListeningP3Templates'
import {
  buildIeltsListeningP4Template,
  type IeltsListeningP4TemplateKind,
} from '../ieltsListeningP4Templates'
import type { ListeningImportPartJson } from '../importListeningUtils'
import {
  assertTemplateMatchesPart,
  type IeltsListeningWizardTemplateKind,
  type IeltsWizardPartNumber,
} from './ieltsListeningWizardConfig'

export function getIeltsListeningWizardTemplatePart(
  partNumber: IeltsWizardPartNumber,
  kind: IeltsListeningWizardTemplateKind,
): ListeningImportPartJson {
  assertTemplateMatchesPart(partNumber, kind)

  if (partNumber === 1) {
    return getIeltsListeningP1TemplatePart(kind as Parameters<typeof getIeltsListeningP1TemplatePart>[0])
  }
  if (partNumber === 2) {
    return buildIeltsListeningP2Template(kind as IeltsListeningP2TemplateKind).parts[0]
  }
  if (partNumber === 3) {
    return buildIeltsListeningP3Template(kind as IeltsListeningP3TemplateKind).parts[0]
  }
  return buildIeltsListeningP4Template(kind as IeltsListeningP4TemplateKind).parts[0]
}