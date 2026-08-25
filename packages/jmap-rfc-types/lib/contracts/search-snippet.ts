import type { EmailFilterCondition, SearchSnippet } from "../jmap-mail.ts";
import type { FilterCondition, FilterOperator, ID } from "../jmap.ts";

export declare namespace SearchSnippetContracts {
  export namespace Get {
    type Filter =
      | FilterOperator<EmailFilterCondition>
      | FilterCondition<EmailFilterCondition>
      | null;

    export type Input = {
      accountId: ID;
      filter?: Filter;
      emailIds: ID[];
    };
    export type Output = {
      accountId: ID;
      list: SearchSnippet[];
      notFound: ID[] | null;
    };
    export type Method = (args: Input) => Output;
  }
}
