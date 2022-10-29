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

export type GherkinNode =
  | GherkinDocument
  | Comment
  | Feature
  | Tag
  | FeatureChild
  | Scenario
  | Rule
  | Background
  | Examples
  | Step
  | TableRow
  | TableCell
  | DocString
  | DataTable
  | RuleChild;

export abstract class TypedGherkinNode<N extends GherkinNode> {
  constructor(originalNode: N) {}
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
export class TypedFeature extends TypedGherkinNode<Feature> implements Feature {
  location: Location;
  tags: readonly TypedTag[];
  language: string;
  keyword: string;
  name: string;
  description: string;
  children: readonly TypedFeatureChild[];

  constructor(originalNode: Feature) {
    super(originalNode);

    this.location = originalNode.location;
    this.tags = originalNode.tags.map((t) => new TypedTag(t));
    this.language = originalNode.language;
    this.keyword = originalNode.keyword;
    this.name = originalNode.name;
    this.description = originalNode.description;
    this.children = originalNode.children.map((c) => new TypedFeatureChild(c));
  }
}

export class TypedTag extends TypedGherkinNode<Tag> implements Tag {
  location: Location;
  name: string;
  id: string;
  constructor(originalNode: Tag) {
    super(originalNode);

    this.location = originalNode.location;
    this.name = originalNode.name;
    this.id = originalNode.id;
  }
}

export class TypedComment extends TypedGherkinNode<Comment> implements Comment {
  location: Location;
  text: string;
  constructor(originalNode: Comment) {
    super(originalNode);

    this.location = originalNode.location;
    this.text = originalNode.text;
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

export class TypedRule extends TypedGherkinNode<Rule> implements Rule {
  location: Location;
  tags: readonly TypedTag[];
  keyword: string;
  name: string;
  description: string;
  children: readonly TypedRuleChild[];
  id: string;

  constructor(originalNode: Rule) {
    super(originalNode);

    this.location = originalNode.location;
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
  extends TypedGherkinNode<Background>
  implements Background
{
  location: Location;
  keyword: string;
  name: string;
  description: string;
  steps: readonly TypedStep[];
  id: string;

  constructor(originalNode: Background) {
    super(originalNode);

    this.location = originalNode.location;
    this.keyword = originalNode.keyword;
    this.name = originalNode.name;
    this.description = originalNode.description;
    this.steps = originalNode.steps.map((s) => new TypedStep(s));
    this.id = originalNode.id;
  }
}

export class TypedStep extends TypedGherkinNode<Step> implements Step {
  location: Location;
  keyword: string;
  keywordType?: StepKeywordType;
  text: string;
  docString?: TypedDocString;
  dataTable?: TypedDataTable;
  id: string;

  constructor(originalNode: Step) {
    super(originalNode);

    this.location = originalNode.location;
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
  extends TypedGherkinNode<Scenario>
  implements Scenario
{
  location: Location;
  tags: TypedTag[];
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
  extends TypedGherkinNode<Examples>
  implements Examples
{
  location: Location;
  tags: TypedTag[];
  keyword: string;
  name: string;
  description: string;
  tableHeader?: TypedTableRow;
  tableBody: readonly TypedTableRow[];
  id: string;

  constructor(originalNode: Examples) {
    super(originalNode);

    this.location = originalNode.location;
    this.tags = originalNode.tags.map((t) => new TypedTag(t));
    this.keyword = originalNode.keyword;
    this.name = originalNode.name;
    this.description = originalNode.description;
    this.tableHeader = originalNode.tableHeader
      ? new TypedTableRow(originalNode.tableHeader)
      : undefined;
    this.tableBody = originalNode.tableBody.map((r) => new TypedTableRow(r));
    this.id = originalNode.id;
  }
}

export class TypedTableRow
  extends TypedGherkinNode<TableRow>
  implements TableRow
{
  location: Location;
  cells: readonly TypedTableCell[];
  id: string;

  constructor(originalNode: TableRow) {
    super(originalNode);

    this.location = originalNode.location;
    this.cells = originalNode.cells.map((c) => new TypedTableCell(c));
    this.id = originalNode.id;
  }
}

export class TypedTableCell
  extends TypedGherkinNode<TableCell>
  implements TableCell
{
  location: Location;
  value: string;

  constructor(originalNode: TableCell) {
    super(originalNode);

    this.location = originalNode.location;
    this.value = originalNode.value;
  }
}

export class TypedDocString
  extends TypedGherkinNode<DocString>
  implements DocString
{
  location: Location;
  mediaType?: string;
  content: string;
  delimiter: string;

  constructor(originalNode: DocString) {
    super(originalNode);

    this.location = originalNode.location;
    this.mediaType = originalNode.mediaType;
    this.content = originalNode.content;
    this.delimiter = originalNode.delimiter;
  }
}

export class TypedDataTable
  extends TypedGherkinNode<DataTable>
  implements DataTable
{
  location: Location;
  rows: readonly TypedTableRow[];

  constructor(originalNode: DataTable) {
    super(originalNode);

    this.location = originalNode.location;
    this.rows = originalNode.rows.map((r) => new TypedTableRow(r));
  }
}
