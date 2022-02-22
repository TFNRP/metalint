import { LazyLoadingRuleMap } from "./utils/lazy-loading-rule-map"

export default new LazyLoadingRuleMap(Object.entries({
  indent: () => require('./indent').default,
}));