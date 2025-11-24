import type { Except } from "type-fest";
import type { Obj } from "./primitives.ts";

export interface FilterOperator<Filter extends Obj> {
  operator: FilterOperatorType | `${FilterOperatorType}`;
  conditions: ReadonlyArray<FilterOperator<Filter> | FilterCondition<Filter>>;
}

export enum FilterOperatorType {
  /**
   * All of the conditions must match for the filter to match.
   */
  And = "AND",
  /**
   * At least one of the conditions must match for the filter to match.
   */
  Or = "OR",
  /**
   * None of the conditions must match for the filter to match.
   */
  Not = "NOT"
}

export type FilterCondition<Filter extends Obj> = Except<
  Partial<Filter>,
  "operator"
>;

/**
 * Lists the names of properties to compare between two T records,
 * and how to compare them, to determine which comes first in a
 * sort.
 */
export interface Comparator<T extends Obj> {
  /**
   * The name of the property on the `T` objects to compare.
   */
  property: keyof T;
  /**
   * If true, sort in ascending order.  If false, reverse the
   * comparator's results to sort in descending order.
   */
  isAscending?: boolean;
  /**
   * The identifier, as registered in the collation registry defined
   * in [RFC4790], for the algorithm to use when comparing the order
   * of strings.  The algorithms the server supports are advertised
   * in the capabilities object returned with the Session object
   * (see Section 2).
   *
   * If omitted, the default algorithm is server dependent,
   */
  collation?: string;
}
