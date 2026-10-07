import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { cssCaseProperties } from './content/css-case-contract';

export class OutcomeDto {
  @ApiProperty({ type: String, example: 'O1' }) id!: string;
  @ApiProperty({ type: String }) description!: string;
}

export class ConceptDto {
  @ApiProperty({ type: String, example: 'js-values' }) id!: string;
  @ApiProperty({ type: String }) title!: string;
}

export class QuestSummaryDto {
  @ApiProperty({ type: String, example: 'Q01' }) id!: string;
  @ApiProperty({ type: String, example: 'first-message' }) slug!: string;
  @ApiProperty({ type: String }) title!: string;
  @ApiProperty({ type: Number }) position!: number;
  @ApiProperty({ type: String, enum: ['instructional', 'capstone'] }) kind!:
    'instructional' | 'capstone';
  @ApiProperty({ type: Boolean }) guestEligible!: boolean;
  @ApiProperty({ type: String, example: '1.0.0' }) contentVersion!: string;
  @ApiProperty({ type: String, example: '1.0.0' }) assessmentVersion!: string;
  @ApiProperty({
    type: String,
    enum: ['introductory', 'developing', 'integrative'],
  })
  difficulty!: 'introductory' | 'developing' | 'integrative';
  @ApiProperty({ type: Number }) xpAward!: number;
}

export class ChapterSummaryDto {
  @ApiProperty({ type: String, example: 'CH01' }) id!: string;
  @ApiProperty({ type: String, example: 'variables' }) slug!: string;
  @ApiProperty({ type: String }) title!: string;
  @ApiProperty({ type: Number }) position!: number;
  @ApiProperty({ type: String }) objectiveSummary!: string;
  @ApiProperty({ type: Number }) questCount!: number;
}

export class JourneySummaryDto {
  @ApiProperty({ type: String, example: 'JAVASCRIPT-FOUNDATIONS' }) id!: string;
  @ApiProperty({ type: String, example: 'javascript-foundations' })
  slug!: string;
  @ApiProperty({ type: String }) title!: string;
  @ApiProperty({ type: Number }) position!: number;
  @ApiProperty({ type: Number }) chapterCount!: number;
  @ApiProperty({ type: Number }) questCount!: number;
}

export class CourseSummaryDto {
  @ApiProperty({ type: String, example: 'COURSE-JS-FOUNDATIONS' }) id!: string;
  @ApiProperty({ type: String, example: 'javascript-foundations' })
  slug!: string;
  @ApiProperty({ type: String }) journeyId!: string;
  @ApiProperty({ type: String }) journeySlug!: string;
  @ApiProperty({ type: String }) title!: string;
  @ApiProperty({ type: String }) summary!: string;
  @ApiProperty({ type: Number }) position!: number;
  @ApiProperty({ type: [String] }) topics!: string[];
  @ApiProperty({ type: Number }) chapterCount!: number;
  @ApiProperty({ type: Number }) questCount!: number;
}

export class CourseDetailDto extends CourseSummaryDto {
  @ApiProperty({ type: [OutcomeDto] }) outcomes!: OutcomeDto[];
  @ApiProperty({ type: [ChapterSummaryDto] }) chapters!: ChapterSummaryDto[];
}

export class JourneyDetailDto extends JourneySummaryDto {
  @ApiProperty({ type: [String] }) entryRequirements!: string[];
  @ApiProperty({ type: [OutcomeDto] }) outcomes!: OutcomeDto[];
  @ApiProperty({ type: [ChapterSummaryDto] }) chapters!: ChapterSummaryDto[];
  @ApiProperty({ type: [CourseSummaryDto] }) courses!: CourseSummaryDto[];
}

export class ChapterDetailDto extends ChapterSummaryDto {
  @ApiProperty({ type: JourneySummaryDto }) journey!: JourneySummaryDto;
  @ApiProperty({ type: [QuestSummaryDto] }) quests!: QuestSummaryDto[];
}

export class QuestHierarchyDto {
  @ApiProperty({ type: JourneySummaryDto }) journey!: JourneySummaryDto;
  @ApiProperty({ type: ChapterSummaryDto }) chapter!: ChapterSummaryDto;
}

export class QuestPrerequisiteDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) slug!: string;
  @ApiProperty({ type: String }) title!: string;
}

export class QuestHintsDto {
  @ApiProperty({ type: String }) question!: string;
  @ApiProperty({ type: String }) concept!: string;
  @ApiProperty({ type: String }) nextStep!: string;
}

export class QuestInteractiveEventDto {
  @ApiProperty({ type: String, enum: ['click', 'input', 'change'] })
  type!: 'click' | 'input' | 'change';
  @ApiProperty({ type: String }) targetId!: string;
  @ApiPropertyOptional({ type: String }) value?: string;
}

export class QuestSemanticAttributeDto {
  @ApiProperty({
    type: String,
    enum: ['alt', 'aria-label', 'for', 'href', 'name', 'type'],
  })
  name!: 'alt' | 'aria-label' | 'for' | 'href' | 'name' | 'type';
  @ApiProperty({ type: String }) value!: string;
}

export class QuestCssMediaDto {
  @ApiProperty({ type: String, enum: ['min-width', 'max-width'] })
  type!: 'min-width' | 'max-width';
  @ApiProperty({ type: Number, minimum: 320, maximum: 1440 })
  widthPx!: number;
}

export class QuestCaseDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String, enum: ['normal', 'boundary'] }) category!:
    'normal' | 'boundary';
  @ApiProperty({
    type: String,
    enum: [
      'console',
      'function',
      'html-element',
      'html-semantic',
      'css-declaration',
      'interactive-text',
    ],
  })
  kind!:
    | 'console'
    | 'function'
    | 'html-element'
    | 'html-semantic'
    | 'css-declaration'
    | 'interactive-text';
  @ApiProperty({ type: String }) feedback!: string;
  @ApiPropertyOptional({ type: String }) expectedOutput?: string;
  @ApiPropertyOptional({ type: String }) functionName?: string;
  @ApiPropertyOptional({ type: Array, items: {} }) args?: unknown[];
  @ApiPropertyOptional({ type: Object }) expected?: unknown;
  @ApiPropertyOptional({ type: String }) selector?: string;
  @ApiPropertyOptional({ type: String }) expectedText?: string;
  @ApiPropertyOptional({ type: String }) tag?: string;
  @ApiPropertyOptional({ type: [QuestSemanticAttributeDto] })
  expectedAttributes?: QuestSemanticAttributeDto[];
  @ApiPropertyOptional({
    type: String,
    enum: [...cssCaseProperties],
  })
  property?: string;
  @ApiPropertyOptional({ type: String }) expectedValue?: string;
  @ApiPropertyOptional({ type: QuestCssMediaDto }) media?: QuestCssMediaDto;
  @ApiPropertyOptional({ type: [QuestInteractiveEventDto] })
  events?: QuestInteractiveEventDto[];
}

export class QuestExerciseFileDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) name!: string;
  @ApiProperty({ type: String, enum: ['html', 'css', 'javascript'] })
  language!: 'html' | 'css' | 'javascript';
  @ApiProperty({ type: String }) starterSource!: string;
}

export class QuestExerciseDto {
  @ApiProperty({ type: Number, enum: [1] }) schemaVersion!: 1;
  @ApiProperty({
    type: String,
    enum: ['javascript', 'static-web', 'interactive-web'],
  })
  mode!: 'javascript' | 'static-web' | 'interactive-web';
  @ApiProperty({ type: [QuestExerciseFileDto] }) files!: QuestExerciseFileDto[];
}

export class QuestDetailDto extends QuestSummaryDto {
  @ApiProperty({ type: QuestHierarchyDto }) hierarchy!: QuestHierarchyDto;
  @ApiProperty({ type: String }) objective!: string;
  @ApiProperty({ type: String, example: 'O1' }) outcomeId!: string;
  @ApiProperty({ type: [ConceptDto] }) concepts!: ConceptDto[];
  @ApiProperty({ type: [QuestPrerequisiteDto] })
  prerequisites!: QuestPrerequisiteDto[];
  @ApiProperty({ type: QuestHintsDto }) hints!: QuestHintsDto;
  @ApiProperty({ type: String }) lesson!: string;
  @ApiProperty({ type: String }) starterCode!: string;
  @ApiProperty({ type: [QuestCaseDto] }) cases!: QuestCaseDto[];
  @ApiPropertyOptional({ type: QuestExerciseDto }) exercise?: QuestExerciseDto;
  @ApiPropertyOptional({ type: String }) explanationPrompt?: string;
  @ApiPropertyOptional({ type: String }) transferPrompt?: string;
}
