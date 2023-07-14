import { ExecuteHook, OnRequestHook, OnStreaming, OnResponseHook, ResponseLoggingHook } from './hooks';
import { HttpFile } from './httpFile';
import { Request } from './httpRequest';
import { HttpResponse } from './httpResponse';
import { HttpSymbol } from './httpSymbol';
import { ProcessorContext } from './processorContext';
import { TestResult } from './testResult';
import { Variables } from './variables';

export interface ProcessedHttpRegion {
  request?: Request;
  response?: HttpResponse;
  symbol: HttpSymbol;
  metaData: Record<string, string | undefined | true>;
  testResults?: Array<TestResult>;
  isGlobal: boolean;
}

export type PartialProperty<T, TProperty extends string, TProperty2 extends string> = Omit<
  Omit<T, TProperty>,
  TProperty2
> &
  Partial<T>;

export interface HttpRegion {
  request?: Request;
  response?: HttpResponse;
  symbol: HttpSymbol;
  metaData: Record<string, string | undefined | true>;
  testResults?: Array<TestResult>;
  responseRefs?: Array<string>;
  variablesPerEnv: Record<string, Variables>;
  readonly hooks: {
    execute: ExecuteHook;
    onRequest: OnRequestHook;
    onStreaming: OnStreaming;
    onResponse: OnResponseHook;
    responseLogging: ResponseLoggingHook;
  };
  isGlobal(): boolean;
  clone(httpFile?: HttpFile): HttpRegion;
  execute(context: PartialProperty<ProcessorContext, 'httpRegion', 'hooks'>, isMainContext?: boolean): Promise<boolean>;
}
