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

enum NodeType {
  GherkinDocument = 'GherkinDocument',
  Comment = 'Comment',
  Feature = 'Feature',
  Tag = 'Tag',
}

function arrayEquals(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const uniqueValues = new Set([...a, ...b]);
  for (const v of uniqueValues) {
    const aCount = a.filter((e) => e === v).length;
    const bCount = b.filter((e) => e === v).length;

    if (aCount !== bCount) return false;
  }

  return true;
}

function isGherkinDocument(node: GherkinNode): node is GherkinDocument {
  return typeof node === 'object' && node.hasOwnProperty('feature');
}

function isFeature(node: GherkinNode, nodeType: NodeType): node is Feature {
  return nodeType === NodeType.Feature;
}

function isTag(node: GherkinNode, nodeType: NodeType): node is Tag {
  return nodeType === NodeType.Tag;
}

function isComment(node: GherkinNode): node is Comment {
  return (
    typeof node === 'object' &&
    arrayEquals(Object.keys(node), ['location', 'text'])
  );
}

// function addTypesToDocument(document: GherkinDocument) {

// }

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

    // const documentWithTypes = addTypesToDocument(document);

    // return document;

    return {
      ...document,
      // ...documentWithTypes,
      comments: [], // igonre comments for now
    };
  },
  locStart: (node: GherkinNode) => {
    return 0; // TMP ignore comments

    if (!isComment(node)) {
      throw new Error('locStart: not a comment');
    }

    console.log('locStart', node, '\n');
    // return node.location.column ?? 0
  },
  locEnd: (node: GherkinNode) => {
    return 0; // TMP ignore comments

    if (!isComment(node)) {
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

    // @ts-expect-error we inject the node type
    const nodeType = options?.nodeType;

    console.log({ node, nodeType });

    // if (Array.isArray(node)) {
    //   return concat(path.map(print));
    // }

    if (isGherkinDocument(node)) {
      if (node.feature) {
        // @ts-expect-error we inject the node type
        options.nodeType = NodeType.Feature;

        // @ts-expect-error
        return path.call(print, 'feature');
      } else {
        throw new Error('unhandled case where there is no feature');
      }
    } else if (isFeature(node, nodeType)) {
      // @ts-expect-error we inject the node type
      options.nodeType = NodeType.Tag;

      // @ts-expect-error
      const tags = join([hardline], path.map(print, 'tags'));

      return [
        join(hardline, [tags, `Feature: ${node.name}`]),
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
    } else if (isTag(node, nodeType)) {
      return node.name;
    } else {
      console.error('Unhandled node type', node, nodeType);
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
