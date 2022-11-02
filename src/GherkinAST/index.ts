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

function reEscapeTableCell(str: string) {
  return str.replace(/\\/g, '\\\\').replace('|', '\\|');
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

export abstract class TypedGherkinNodeWithLocation<
  N extends GherkinNodeWithLocation
> extends TypedGherkinNode<N> {
  location: Location;

  constructor(originalNode: N) {
    super(originalNode);
    this.location = originalNode.location;
  }
}

export class TypedGherkinDocument
  extends TypedGherkinNode<GherkinDocument>
  implements GherkinDocument
{
  uri?: string;

  feature?: TypedFeature;

  comments: readonly TypedComment[];

  constructor(originalNode: GherkinDocument) {
    super(originalNode);

    this.uri = originalNode.uri;
    this.feature = originalNode.feature
      ? new TypedFeature(originalNode.feature)
      : undefined;
    this.comments = originalNode.comments.map((c) => new TypedComment(c));
  }
}
export class TypedFeature
  extends TypedGherkinNodeWithLocation<Feature>
  implements Feature
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
  implements FeatureChild
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
}

export class TypedRule
  extends TypedGherkinNodeWithLocation<Rule>
  implements Rule
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
  implements RuleChild
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
}

export class TypedBackground
  extends TypedGherkinNodeWithLocation<Background>
  implements Background
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
}

export class TypedStep
  extends TypedGherkinNodeWithLocation<Step>
  implements Step
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
}

export class TypedScenario
  extends TypedGherkinNodeWithLocation<Scenario>
  implements Scenario
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
}

export class TypedExamples
  extends TypedGherkinNodeWithLocation<Examples>
  implements Examples
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
}

export class TypedTableRow
  extends TypedGherkinNodeWithLocation<TableRow>
  implements TableRow
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
}

export class TypedDataTable
  extends TypedGherkinNodeWithLocation<DataTable>
  implements DataTable
{
  rows: readonly TypedTableRow[];

  constructor(originalNode: DataTable) {
    super(originalNode);

    const columnSizes = generateColumnSizes(originalNode.rows);

    this.rows = originalNode.rows.map((r) => new TypedTableRow(r, columnSizes));
  }
}
