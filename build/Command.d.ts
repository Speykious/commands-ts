export {};
/**
 * syntax: `T1, T2, [T3]`;
 *
 * Syntax Parser Generator:
 * manyJoin(getArgParser, comma).run(syntax) => [pT1, pT2, pT3] (argParsers)
 * join([pT1, pT2, pT3], spaces)
 */
