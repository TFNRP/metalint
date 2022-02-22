export class LazyLoadingRuleMap extends Map<string, () => any> {
  constructor(loaders: Array<[string, () => any]>) {
    super(loaders);

    Object.defineProperty(LazyLoadingRuleMap.prototype, "set", {
      configurable: true,
      value: void 0
    });
  }

  override get(ruleId: string): any {
    const load = super.get(ruleId);

    return load && load();
  }

  override *values(): IterableIterator<any> {
    for (const load of super.values()) {
      yield load();
    }
  }

  override *entries(): IterableIterator<[string, any]> {
    for (const [ruleId, load] of super.entries()) {
      yield [ruleId, load()];
    }
  }

  // @ts-expect-error
  override forEach(callbackFn: (rule: any, ruleId: string, map: LazyLoadingRuleMap) => any, thisArg: any): void {
    for (const [ruleId, load] of super.entries()) {
      callbackFn.call(thisArg, load(), ruleId, this);
    }
  }

  [Symbol.iterator] = LazyLoadingRuleMap.prototype.entries;
  // @ts-expect-error
  override clear = void 0;
  // @ts-expect-error
  override delete = void 0;
}