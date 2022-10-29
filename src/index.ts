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
} from './GherkinAST';

const { literalline, hardline, join, group, trim, indent, line } = doc.builders;
const { hasNewline, isPreviousLineEmpty } = util;

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

const gherkinAstPrinter: Printer<TypedGherkinNode<GherkinNode>> = {
  print: (path, options, print) => {
    const node = path.getValue();

    // console.log({ node, isDocument: node instanceof TypedGherkinDocument });

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
        indent([
          hardline,
          node.description ? node.description.trim() : '',
          node.description ? hardline : '',

          // @ts-expect-error TODO need to investigate "print" method
          join([hardline, hardline], path.map(print, 'children')),
        ]),
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
    } else if (node instanceof TypedFeatureChild) {
      if (node.scenario) {
        // @ts-expect-error TODO need to investigate "print" method
        return path.call(print, 'scenario');
      } else {
        throw new Error('unhandled case for now');
      }
    } else if (node instanceof TypedScenario) {
      // console.log(node);
      return [
        join(hardline, [
          // @ts-expect-error TODO don't know why this is not working
          join([hardline], path.map(print, 'tags')),
          `${node.keyword}: ${node.name}`,
        ]),
        indent([
          hardline,
          node.description ? node.description.trim() : '',
          node.description ? hardline : '',
          node.description ? hardline : '',

          // @ts-expect-error TODO don't know why this is not working
          join(hardline, path.map(print, 'steps')),
          // @ts-expect-error TODO don't know why this is not working
          join(hardline, path.map(print, 'examples')),
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
          ? hardline
          : '',
        `${node.keyword.trim()} ${node.text.trim()}`,
        node.docString ? indent([hardline, path.call(print, 'docString')]) : '',
      ];
    } else if (node instanceof TypedDocString) {
      console.log({ node });
      return join(hardline, [node.delimiter, node.content, node.delimiter]);
    } else {
      console.error('Unhandled node type', node);
      return '';
    }
  },

  embed(path: AstPath, print, textToDoc, options: object): Doc | null {
    const node = path.getValue();
    if (node instanceof TypedDocString) {
      const { content } = node;

      try {
        JSON.parse(content);

        return [
          node.delimiter,
          hardline,
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
