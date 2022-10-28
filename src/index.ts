import {
  Parser as GherkinParser,
  AstBuilder,
  GherkinClassicTokenMatcher,
} from '@cucumber/gherkin';
import {
  IdGenerator,
  GherkinDocument,
  Location,
  Comment,
  Feature,
  Tag,
  FeatureChild,
} from '@cucumber/messages';
import {
  AstPath,
  Parser,
  Plugin,
  Printer,
  SupportLanguage,
  util,
  doc,
} from 'prettier';

const { literalline, hardline, join, group, trim, indent, line } = doc.builders;

type GherkinNode = GherkinDocument | Comment | Feature | Tag;

abstract class TypedGherkinNode<N extends GherkinNode> {
  constructor(originalNode: N) {}
}

class TypedGherkinDocument
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

class TypedFeature extends TypedGherkinNode<Feature> implements Feature {
  location: Location;
  tags: readonly TypedTag[];
  language: string;
  keyword: string;
  name: string;
  description: string;
  children: readonly FeatureChild[];

  constructor(originalNode: Feature) {
    super(originalNode);

    this.location = originalNode.location;
    this.tags = originalNode.tags.map((t) => new TypedTag(t));
    this.language = originalNode.language;
    this.keyword = originalNode.keyword;
    this.name = originalNode.name;
    this.description = originalNode.description;
    this.children = originalNode.children;
  }
}

class TypedTag extends TypedGherkinNode<Tag> implements Tag {
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

class TypedComment extends TypedGherkinNode<Comment> implements Comment {
  location: Location;
  text: string;
  constructor(originalNode: Comment) {
    super(originalNode);

    this.location = originalNode.location;
    this.text = originalNode.text;
  }
}

const languages: SupportLanguage[] = [
  {
    extensions: ['.feature'],
    name: 'Gherkin',
    parsers: ['gherkin-parse'],
  },
];

const gherkinParser: Parser<GherkinNode> = {
  parse: (text: string): GherkinDocument => {
    const uuidFn = IdGenerator.uuid();
    const builder = new AstBuilder(uuidFn);
    const matcher = new GherkinClassicTokenMatcher(); // or GherkinInMarkdownTokenMatcher()

    const parser = new GherkinParser(builder, matcher);

    const document = parser.parse(text);

    return new TypedGherkinDocument({
      ...document,
      comments: [], // igonre comments for now
    });
  },

  locStart: (node: TypedGherkinNode<GherkinNode>) => {
    return 0; // TMP ignore comments

    if (!(node instanceof TypedComment)) {
      throw new Error('locStart: not a comment');
    }

    console.log('locStart', node, '\n');
    // return node.location.column ?? 0
  },
  locEnd: (node: TypedGherkinNode<GherkinNode>) => {
    return 0; // TMP ignore comments

    if (!(node instanceof TypedComment)) {
      throw new Error('locEnd: not a comment');
    }

    console.log('locEnd', node, '\n');
    // return (node.location.column ?? 0) + node.text.length
  },
  astFormat: 'gherkin-ast',
};

const gherkinAstPrinter: Printer<GherkinNode> = {
  print: (path, options, print) => {
    const node = path.getValue();

    console.log({ node, isDocument: node instanceof TypedGherkinDocument });

    // if (Array.isArray(node)) {
    //   return concat(path.map(print));
    // }

    if (node instanceof TypedGherkinDocument) {
      if (node.feature) {
        // @ts-expect-error
        return [path.call(print, 'feature'), hardline];
      } else {
        throw new Error('unhandled case where there is no feature');
      }
    } else if (node instanceof TypedFeature) {
      return [
        join(hardline, [
          // @ts-expect-error TODO don't know why this is not working
          join([hardline], path.map(print, 'tags')),
          `Feature: ${node.name}`,
        ]),
        indent([hardline, node.description.trim()]),
      ];

      // const tags = node.feature.tags.map(tag =>  tag.name));

      //   return [
      //     ...node?.tags.map(tag => tag.name),
      //     `Feature: ${node.feature.name}`,
      //     hardline,
      //     node.feature.description,
      //   ]
      // }
    } else if (node instanceof TypedTag) {
      return node.name;
    } else {
      console.error('Unhandled node type', node);
      return '';
    }
  },
};

const plugin: Plugin<GherkinNode> = {
  languages,
  parsers: {
    'gherkin-parse': gherkinParser,
  },
  printers: {
    'gherkin-ast': gherkinAstPrinter,
  },
  defaultOptions: {
    printWidth: 120,
    tabWidth: 4,
  },
  options: {},
};

module.exports = plugin;
