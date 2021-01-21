;


import { HttpRegion, HttpFile, HttpSymbolKind, HttpRegionParser, HttpRegionParserGenerator, HttpRegionParserResult } from '../models';
import { variableActionProcessor } from '../actionProcessor';

export class VariableHttpRegionParser implements HttpRegionParser{

  async parse(lineReader: HttpRegionParserGenerator, httpRegion: HttpRegion, httpFile: HttpFile): Promise<HttpRegionParserResult>{
    const next = lineReader.next();
    if (!next.done) {
      const textLine = next.value.textLine;

      const match = /^\s*\@(?<key>[^\s]*)\s*(=\s*)?"?(?<value>.*)"?\s*$/.exec(textLine);

      if (match && match.groups && match.groups.key && match.groups.value) {
        httpRegion.actions.push({
          data: {
            [match.groups.key]: match.groups.value.trim(),
          },
          type: 'variable',
          processor: variableActionProcessor
        });
        return {
          endLine:next.value.line,
          symbols: [{
            name: match.groups.key,
            description: match.groups.value,
            kind: HttpSymbolKind.variable,
            startLine: next.value.line,
            startOffset: 0,
            endLine: next.value.line,
            endOffset: next.value.textLine.length,
            children: [{
              name: match.groups.key,
              description: 'key',
              kind: HttpSymbolKind.variableName,
              startLine: next.value.line,
              startOffset: next.value.textLine.indexOf(match.groups.key),
              endLine: next.value.line,
              endOffset: next.value.textLine.indexOf(match.groups.key) + match.groups.key.length,
            }, {
              name: match.groups.value,
              description: 'value',
              kind: HttpSymbolKind.varialbeValue,
              startLine: next.value.line,
              startOffset: next.value.textLine.indexOf(match.groups.value),
              endLine: next.value.line,
              endOffset: next.value.textLine.indexOf(match.groups.value) + match.groups.value.length,
            }]
          }],
        };
      }
    }
    return false;
  }
}


