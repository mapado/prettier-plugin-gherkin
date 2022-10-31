import {
  Parser as GherkinParser,
  AstBuilder,
  GherkinClassicTokenMatcher,
} from '@cucumber/gherkin';
import {
  IdGenerator,
  GherkinDocument,
  StepKeywordType,
} from '@cucumber/messages';
import {
  AstPath,
  Parser,
  Plugin,
  Printer,
  SupportLanguage,
  util,
  doc,
  Doc,
} from 'prettier';
import {
  TypedGherkinDocument,
  TypedComment,
  TypedFeature,
  TypedTag,
  TypedFeatureChild,
  TypedScenario,
  GherkinNode,
  TypedGherkinNode,
  TypedStep,
  TypedDocString,
  TypedBackground,
  TypedExamples,
  TypedTableRow,
  TypedTableCell,
  TypedDataTable,
  TypedRule,
  TypedRuleChild,
} from './GherkinAST';

const { literalline, hardline, join, group, trim, indent, line } = doc.builders;
const { hasNewline, isPreviousLineEmpty, makeString } = util;

const languages: SupportLanguage[] = [
  {
    extensions: ['.feature'],
    name: 'Gherkin',
    parsers: ['gherkin-parse'],
  },
];

function printHardline() {
  // console.log(new Error().stack?.split('\n')[2]);

  return hardline;
}

function printTwoHardlines() {
  // console.log(new Error().stack?.split('\n')[2]);

  return [hardline, hardline];
}

const LINEBREAK_MATCHER = /\r\n|[\r\n\u2028\u2029]/;

/**
 * escaple line breaks in a string
 */
function escapeMultilineString(str: string): string {
  return str.replace(new RegExp(LINEBREAK_MATCHER, 'g'), '\\n');
}

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

function printTags(
  path: AstPath<TypedGherkinNode<GherkinNode & { tags: readonly TypedTag[] }>>,
  node: GherkinNode & { tags: readonly TypedTag[] }
) {
  // console.log(node);

  return [
    // @ts-expect-error TODO path should be recognized as an AstPath<GherkinNode & { tags: readonly TypedTag[] }>>
    join(printHardline(), path.map(gherkinAstPrinter.print, 'tags')),
    node.tags.length > 0 ? printHardline() : '',
  ];
}

function printDescription(
  path: AstPath<TypedGherkinNode<GherkinNode & { description: string }>>,
  node: GherkinNode & { description: string },
  hardlineIfDescription: boolean
) {
  // console.log(node);

  if (!node.description) {
    return hardlineIfDescription ? printHardline() : '';
  }

  return [
    join(
      printHardline(),
      node.description.split('\n').map((s) => s.trim())
    ),
    printHardline(),
    printHardline(),
  ];
}

const gherkinAstPrinter: Printer<TypedGherkinNode<GherkinNode>> = {
  print: (path, options, print) => {
    const node = path.getValue();

    // console.log({ node, isDocument: node instanceof TypedGherkinDocument });

    // if (Array.isArray(node)) {
    //   return concat(path.map(print));
    // }

    if (node instanceof TypedGherkinDocument) {
      if (node.feature) {
        // @ts-expect-error TODO  path should be recognized as an AstPath<TypedGherkinDocument>
        return [path.call(print, 'feature'), printHardline()];
      } else {
        throw new Error('unhandled case where there is no feature');
      }
    } else if (node instanceof TypedFeature) {
      return [
        printTags(path, node),
        `${node.keyword}: ${node.name}`,

        indent([
          printHardline(),
          printDescription(path, node, true),

          // @ts-expect-error TODO path should be recognized as an AstPath<TypedFeature>
          join(printTwoHardlines(), path.map(print, 'children')),
        ]),
      ];
    } else if (node instanceof TypedFeatureChild) {
      if (node.scenario) {
        // @ts-expect-error TODO  path should be recognized as an AstPath<TypedFeatureChild>
        return path.call(print, 'scenario');
      } else if (node.background) {
        // @ts-expect-error TODO  path should be recognized as an AstPath<TypedFeatureChild>
        return path.call(print, 'background');
      } else if (node.rule) {
        // @ts-expect-error TODO  path should be recognized as an AstPath<TypedFeatureChild>
        return path.call(print, 'rule');
      } else {
        console.log(node);
        throw new Error(
          'unhandled case where TypedFeatureChild has no scenario'
        );
      }
    } else if (node instanceof TypedRule) {
      // console.log({ node });

      return [
        printTags(path, node),
        `${node.keyword}: ${node.name}`,
        indent([
          printHardline(),
          printDescription(path, node, true),

          // @ts-expect-error TODO path should be recognized as an AstPath<TypedRule>
          join(printTwoHardlines(), path.map(print, 'children')),
        ]),
      ];
    } else if (node instanceof TypedRuleChild) {
      // console.log({ node });
      if (node.scenario) {
        // @ts-expect-error TODO  path should be recognized as an AstPath<TypedFeatureChild>
        return path.call(print, 'scenario');
      } else if (node.background) {
        // @ts-expect-error TODO  path should be recognized as an AstPath<TypedFeatureChild>
        return path.call(print, 'background');
      } else {
        console.log(node);
        throw new Error('unhandled case where TypedRuleChild has no scenario');
      }
    } else if (node instanceof TypedTag) {
      return node.name;
    } else if (node instanceof TypedBackground) {
      // console.log(node.steps);
      return [
        `${node.keyword}: ${node.name}`,
        indent([
          printHardline(),
          printDescription(path, node, false),
          // @ts-expect-error TODO  path should be recognized as an AstPath<TypedBackground>
          join(printHardline(), path.map(print, 'steps')),
        ]),
      ];
    } else if (node instanceof TypedScenario) {
      // console.log(node);
      return [
        printTags(path, node),
        `${node.keyword}: ${node.name}`,
        indent([
          printHardline(),
          printDescription(path, node, false),

          // @ts-expect-error TODO path should be recognized as an AstPath<TypedScenario>
          join(printHardline(), path.map(print, 'steps')),

          node.steps.length > 0 && node.examples.length > 0
            ? printTwoHardlines()
            : '',
          // @ts-expect-error TODO path should be recognized as an AstPath<TypedScenario>
          join(printTwoHardlines(), path.map(print, 'examples')),
        ]),
      ];
    } else if (node instanceof TypedStep) {
      // console.log(node);
      const isFirstStep = path.stack[path.stack.length - 2] === 0; // path.getParentNode(1).scenario.steps[0] === node;

      return [
        !isFirstStep &&
        node.keywordType &&
        [StepKeywordType.CONTEXT, StepKeywordType.ACTION].includes(
          node.keywordType
        )
          ? printHardline()
          : '',
        `${node.keyword}${node.text.trim()}`,
        node.docString
          ? // @ts-expect-error TODO path should be recognized as an AstPath<TypedStep>
            indent([printHardline(), path.call(print, 'docString')])
          : '',
        node.dataTable // @ts-expect-error TODO path should be recognized as an AstPath<TypedStep>
          ? indent([printHardline(), path.call(print, 'dataTable')])
          : '',
      ];
    } else if (node instanceof TypedDocString) {
      // console.log({ node });

      // if the content contains the delimiter, the parser will unescape it, so we need to escape it again
      const escapeDelimiter = (content: string) =>
        content.replace(
          new RegExp(node.delimiter[0], 'g'),
          `\\${node.delimiter[0]}`
        );

      return join(printHardline(), [
        node.delimiter,
        // split the string on newlines to preserve the indentation
        ...escapeDelimiter(node.content).split('\n'),
        node.delimiter,
      ]);
    } else if (node instanceof TypedExamples) {
      // console.log({ node, columnSizes: node.columnSizes });

      return [
        printTags(path, node),

        `${node.keyword}: ${node.name}`,
        indent([
          printHardline(),

          join(printHardline(), [
            // @ts-expect-error TODO path should be recognized as an AstPath<TypedExamples>
            path.call(print, 'tableHeader'),
            // @ts-expect-error TODO path should be recognized as an AstPath<TypedExamples>
            ...path.map(print, 'tableBody'),
          ]),
        ]),
      ];
    } else if (node instanceof TypedDataTable) {
      // console.log({ node, columnSizes: node.columnSizes });

      return join(printHardline(), [
        // @ts-expect-error TODO path should be recognized as an AstPath<TypedDataTable>
        ...path.map(print, 'rows'),
      ]);
    } else if (node instanceof TypedTableRow) {
      // console.log(node);
      return [
        '| ',
        // @ts-expect-error TODO path should be recognized as an AstPath<TypedTableRow>
        join(' | ', path.map(print, 'cells')),
        ' |',
      ];
    } else if (node instanceof TypedTableCell) {
      // console.log(node);
      return escapeMultilineString(node.value.padEnd(node.displaySize));
    } else {
      console.error('Unhandled node type', node);
      return '';
    }
  },

  embed(path: AstPath, print, textToDoc, options: object): Doc | null {
    const node = path.getValue();
    if (node instanceof TypedDocString) {
      const { content, mediaType } = node;

      if (mediaType === 'xml') {
        return [
          node.delimiter,
          printHardline(),
          textToDoc(content, { ...options, parser: 'html' }),
          node.delimiter,
        ];
      }

      try {
        JSON.parse(content);

        return [
          node.delimiter,
          printHardline(),
          textToDoc(content, { ...options, parser: 'json' }),
          node.delimiter,
        ];
      } catch (e) {
        // igonre non-JSON content
      }
    }

    return null;
  },
};

const plugin: Plugin<TypedGherkinNode<GherkinNode>> = {
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
