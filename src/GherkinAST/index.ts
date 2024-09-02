import {
  GherkinDocument,
  Location,
  Comment,
  Feature,
  Tag,
  FeatureChild,
  Rule,
  Background,
  Scenario,
  Examples,
  Step,
  TableRow,
  TableCell,
  StepKeywordType,
  DocString,
  DataTable,
  RuleChild,
} from '@cucumber/messages';
import { ParserOptions } from 'prettier';

export type GherkinNodeWithLocation =
  | Comment
  | Feature
  | Tag
  | Scenario
  | Rule
  | Background
  | Examples
  | Step
  | TableRow
  | TableCell
  | DocString
  | DataTable;

export type GherkinNode =
  | GherkinNodeWithLocation
  | GherkinDocument
  | FeatureChild
  | RuleChild;

export function isWithLocation(node: unknown): node is GherkinNodeWithLocation {
  return typeof node === 'object' && node !== null && 'location' in node;
}

function reEscapeTableCell(str: string): string {
  const out = str
    // espace all pipes that have been unescaped
    .replaceAll('|', '\\|')
    // espace all backslashes that have been unescaped
    .replace(/\\/g, '\\\\');

  if (OPTIONS.escapeBackslashes) {
    return out;
  }

  // replace all escaped backslashes, except those that are followed by a newline or a pipe
  return out.replace(/(\\\\)(?![n\n\\])/g, '\\');
}

/**
 * Set the max size of each column in the table
 */
function generateColumnSizes(tableRows: readonly TableRow[]): number[] {
  return tableRows.reduce((acc: number[], row) => {
    row.cells.forEach((cell, index) => {
      if (!acc[index]) {
        acc[index] = 0;
      }
      acc[index] = Math.max(acc[index], reEscapeTableCell(cell.value).length);
    });
    return acc;
  }, []);
}

export abstract class TypedGherkinNode<N extends GherkinNode> {
  constructor(originalNode: N) {}
}

export interface HasChildren<N extends TypedGherkinNode<N>> {
  get children(): ReadonlyArray<TypedGherkinNode<N>>;
}

export function isHasChildren<N extends TypedGherkinNode<N>>(
  node: unknown
): node is HasChildren<N> {
  return typeof node === 'object' && node !== null && 'children' in node;
}

export interface HasChild<N extends TypedGherkinNode<N>> {
  get child(): undefined | TypedGherkinNode<N>;
}

export function isHasChild<N extends TypedGherkinNode<N>>(
  node: unknown
): node is HasChild<N> {
  return typeof node === 'object' && node !== null && 'child' in node;
}

export abstract class TypedGherkinNodeWithLocation<
  N extends GherkinNodeWithLocation,
> extends TypedGherkinNode<N> {
  location: Location;

  constructor(originalNode: N) {
    super(originalNode);
    this.location = originalNode.location;
  }

  get lastLine(): number {
    return this.location.line;
  }
}

type Options = {
  escapeBackslashes: boolean;
};

/**
 * An options object that will be set for a document
 * It is stored as a singleton that will be reset on each document to avoid passing it around for now.
 * A better option may to have access to the options on every classes.
 */
let OPTIONS: Options;

export class TypedGherkinDocument
  extends TypedGherkinNode<GherkinDocument>
  implements GherkinDocument, HasChild<TypedFeature>
{
  uri?: string;

  feature?: TypedFeature;

  comments: readonly TypedComment[];

  constructor(originalNode: GherkinDocument, options: Options) {
    super(originalNode);

    OPTIONS = options;

    this.uri = originalNode.uri;
    this.feature = originalNode.feature
      ? new TypedFeature(originalNode.feature)
      : undefined;
    this.comments = originalNode.comments.map((c) => new TypedComment(c));
  }

  get child(): undefined | TypedFeature {
    return this.feature;
  }
}
export class TypedFeature
  extends TypedGherkinNodeWithLocation<Feature>
  implements Feature, HasChildren<TypedFeatureChild>
{
  tags: readonly TypedTag[];
  language: string;
  keyword: string;
  name: string;
  description: string;
  children: readonly TypedFeatureChild[];

  constructor(originalNode: Feature) {
    super(originalNode);

    this.tags = originalNode.tags.map((t) => new TypedTag(t));
    this.language = originalNode.language;
    this.keyword = originalNode.keyword;
    this.name = originalNode.name;
    this.description = originalNode.description;
    this.children = originalNode.children.map((c) => new TypedFeatureChild(c));
  }
}

export class TypedTag extends TypedGherkinNodeWithLocation<Tag> implements Tag {
  name: string;
  id: string;
  constructor(originalNode: Tag) {
    super(originalNode);

    this.name = originalNode.name;
    this.id = originalNode.id;
  }
}

export class TypedComment
  extends TypedGherkinNodeWithLocation<Comment>
  implements Comment
{
  text: string;

  constructor(originalNode: Comment) {
    super(originalNode);

    this.text = originalNode.text;
  }

  get value() {
    return this.text.trim();
  }
}

export class TypedFeatureChild
  extends TypedGherkinNode<FeatureChild>
  implements
    FeatureChild,
    HasChild<TypedRule | TypedScenario | TypedBackground>
{
  rule?: TypedRule;
  background?: TypedBackground;
  scenario?: TypedScenario;

  constructor(originalNode: FeatureChild) {
    super(originalNode);
    this.rule = originalNode.rule
      ? new TypedRule(originalNode.rule)
      : undefined;
    this.background = originalNode.background
      ? new TypedBackground(originalNode.background)
      : undefined;
    this.scenario = originalNode.scenario
      ? new TypedScenario(originalNode.scenario)
      : undefined;
  }

  get child(): undefined | TypedRule | TypedScenario | TypedBackground {
    return this.rule || this.background || this.scenario;
  }
}

export class TypedRule
  extends TypedGherkinNodeWithLocation<Rule>
  implements Rule, HasChildren<TypedRuleChild>
{
  tags: readonly TypedTag[];
  keyword: string;
  name: string;
  description: string;
  children: readonly TypedRuleChild[];
  id: string;

  constructor(originalNode: Rule) {
    super(originalNode);

    this.tags = originalNode.tags.map((t) => new TypedTag(t));
    this.keyword = originalNode.keyword;
    this.name = originalNode.name;
    this.description = originalNode.description;
    this.children = originalNode.children.map((c) => new TypedRuleChild(c));
    this.id = originalNode.id;
  }
}

export class TypedRuleChild
  extends TypedGherkinNode<RuleChild>
  implements RuleChild, HasChild<TypedScenario>
{
  background?: TypedBackground;
  scenario?: TypedScenario;

  constructor(originalNode: RuleChild) {
    super(originalNode);
    this.background = originalNode.background
      ? new TypedBackground(originalNode.background)
      : undefined;
    this.scenario = originalNode.scenario
      ? new TypedScenario(originalNode.scenario)
      : undefined;
  }

  get child(): undefined | TypedScenario {
    return this.scenario;
  }
}

export class TypedBackground
  extends TypedGherkinNodeWithLocation<Background>
  implements Background, HasChildren<TypedStep>
{
  keyword: string;
  name: string;
  description: string;
  steps: readonly TypedStep[];
  id: string;

  constructor(originalNode: Background) {
    super(originalNode);

    this.keyword = originalNode.keyword;
    this.name = originalNode.name;
    this.description = originalNode.description;
    this.steps = originalNode.steps.map((s) => new TypedStep(s));
    this.id = originalNode.id;
  }

  get children(): ReadonlyArray<TypedStep> {
    return this.steps;
  }
}

export class TypedStep
  extends TypedGherkinNodeWithLocation<Step>
  implements Step, HasChildren<TypedDataTable | TypedDocString>
{
  keyword: string;
  keywordType?: StepKeywordType;
  text: string;
  docString?: TypedDocString;
  dataTable?: TypedDataTable;
  id: string;

  constructor(originalNode: Step) {
    super(originalNode);

    this.keyword = originalNode.keyword;
    this.keywordType = originalNode.keywordType;
    this.text = originalNode.text;
    this.docString = originalNode.docString
      ? new TypedDocString(originalNode.docString)
      : undefined;
    this.dataTable = originalNode.dataTable
      ? new TypedDataTable(originalNode.dataTable)
      : undefined;
    this.id = originalNode.id;
  }

  get children(): ReadonlyArray<TypedDataTable | TypedDocString> {
    return [this.docString, this.dataTable].filter(
      (c): c is TypedDataTable | TypedDocString => typeof c !== 'undefined'
    );
  }

  get lastLine(): number {
    const dataTableLength = this.dataTable?.nbRows ?? 0;
    const docStringLength = this.docString?.nbRows ?? 0;

    return this.location.line + dataTableLength + docStringLength;
  }
}

export class TypedScenario
  extends TypedGherkinNodeWithLocation<Scenario>
  implements Scenario, HasChildren<TypedStep | TypedExamples | TypedTag>
{
  tags: readonly TypedTag[];
  keyword: string;
  name: string;
  description: string;
  steps: readonly TypedStep[];
  examples: readonly TypedExamples[];
  id: string;

  constructor(originalNode: Scenario) {
    super(originalNode);

    this.location = originalNode.location;
    this.tags = originalNode.tags.map((t) => new TypedTag(t));
    this.keyword = originalNode.keyword;
    this.name = originalNode.name;
    this.description = originalNode.description;
    this.steps = originalNode.steps.map((s) => new TypedStep(s));
    this.examples = originalNode.examples.map((e) => new TypedExamples(e));
    this.id = originalNode.id;
  }

  get children(): ReadonlyArray<TypedStep | TypedExamples | TypedTag> {
    return [...this.steps, ...this.examples, ...this.tags];
  }
}

export class TypedExamples
  extends TypedGherkinNodeWithLocation<Examples>
  implements Examples, HasChildren<TypedTableRow | TypedTag>
{
  tags: readonly TypedTag[];
  keyword: string;
  name: string;
  description: string;
  tableHeader?: TypedTableRow;
  tableBody: readonly TypedTableRow[];
  id: string;

  constructor(originalNode: Examples) {
    super(originalNode);

    const rows = [
      originalNode.tableHeader,
      ...(originalNode.tableBody ?? []),
    ].filter<TableRow>((row): row is TableRow => typeof row !== 'undefined');

    const columnSizes = generateColumnSizes(rows);

    this.tags = originalNode.tags.map((t) => new TypedTag(t));
    this.keyword = originalNode.keyword;
    this.name = originalNode.name;
    this.description = originalNode.description;
    this.tableHeader = originalNode.tableHeader
      ? new TypedTableRow(originalNode.tableHeader, columnSizes)
      : undefined;
    this.tableBody = originalNode.tableBody.map(
      (r) => new TypedTableRow(r, columnSizes)
    );
    this.id = originalNode.id;
  }

  get children(): ReadonlyArray<TypedTableRow | TypedTag> {
    return [
      ...(this.tableHeader ? [this.tableHeader] : []),
      ...this.tableBody,
      ...this.tags,
    ];
  }
}

export class TypedTableRow
  extends TypedGherkinNodeWithLocation<TableRow>
  implements TableRow, HasChildren<TypedTableCell>
{
  cells: readonly TypedTableCell[];
  id: string;
  columnSizes: number[] | undefined;

  constructor(originalNode: TableRow, columnSizes: number[]) {
    super(originalNode);

    this.cells = originalNode.cells.map(
      (c, index) => new TypedTableCell(c, columnSizes[index])
    );
    this.id = originalNode.id;

    this.columnSizes = columnSizes;
  }

  get children(): ReadonlyArray<TypedTableCell> {
    return this.cells;
  }
}

export class TypedTableCell
  extends TypedGherkinNodeWithLocation<TableCell>
  implements TableCell
{
  value: string;
  displaySize: number;

  constructor(originalNode: TableCell, displaySize: number) {
    super(originalNode);

    this.value = reEscapeTableCell(originalNode.value);

    this.displaySize = Math.max(displaySize ?? 0, this.value.length);
  }
}

export class TypedDocString
  extends TypedGherkinNodeWithLocation<DocString>
  implements DocString
{
  mediaType?: string;
  content: string;
  delimiter: string;

  constructor(originalNode: DocString) {
    super(originalNode);

    this.mediaType = originalNode.mediaType;
    this.content = originalNode.content;
    this.delimiter = originalNode.delimiter;
  }

  get nbRows(): number {
    return this.content.split('\n').length + 2;
  }
}

export class TypedDataTable
  extends TypedGherkinNodeWithLocation<DataTable>
  implements DataTable, HasChildren<TypedTableRow>
{
  rows: readonly TypedTableRow[];

  constructor(originalNode: DataTable) {
    super(originalNode);

    const columnSizes = generateColumnSizes(originalNode.rows);

    this.rows = originalNode.rows.map((r) => new TypedTableRow(r, columnSizes));
  }

  get nbRows(): number {
    return (
      this.rows.reduce((acc, row) => {
        // @ts-expect-error comments are added by prettier directly
        const commentLines: number = row.comments?.length ?? 0;

        return acc + commentLines + 1;
      }, 0) ?? 0
    );
  }

  get children(): ReadonlyArray<TypedTableRow> {
    return this.rows;
  }
}
