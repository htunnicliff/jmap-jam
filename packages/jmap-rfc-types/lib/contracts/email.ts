import type {
  Email,
  EmailBodyPart,
  EmailCreate,
  EmailFilterCondition,
  EmailImport,
  WithoutHeaders
} from "../jmap-mail.ts";
import type {
  ChangesArguments,
  ChangesResponse,
  CopyArguments,
  CopyResponse,
  ID,
  QueryArguments,
  QueryChangesArguments,
  QueryChangesResponse,
  QueryResponse,
  SetArguments,
  SetError,
  SetResponse
} from "../jmap.ts";

export declare namespace EmailContracts {
  export namespace Get {
    type GetEmailArguments = {
      accountId: ID;
      ids?: ReadonlyArray<ID> | null;
      properties?: ReadonlyArray<keyof Email> | null;
      bodyProperties?: Array<keyof EmailBodyPart>;
      fetchTextBodyValues?: boolean;
      fetchHTMLBodyValues?: boolean;
      fetchAllBodyValues?: boolean;
      maxBodyValueBytes?: number;
    };

    type FilterEmailProperties<P extends GetEmailArguments["properties"]> = ReadonlyArray<
      P extends ReadonlyArray<infer Prop extends string>
        ? { [Key in Prop]: Key extends keyof Email ? Email[Key] : never }
        : WithoutHeaders<Email>
    >;

    type GetEmailResponse<Args> = Args extends GetEmailArguments
      ? {
          accountId: ID;
          state: string;
          list: FilterEmailProperties<Args["properties"]>;
          notFound: ReadonlyArray<ID>;
        }
      : never;

    export type Input = GetEmailArguments;
    export type Output<A> = GetEmailResponse<A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Changes {
    export type Input = ChangesArguments;
    export type Output = ChangesResponse;
    export type Method = (args: Input) => Output;
  }

  export namespace Query {
    export type Input = QueryArguments<Email, EmailFilterCondition> & {
      collapseThreads?: boolean;
    };
    export type Output = QueryResponse;
    export type Method = (args: Input) => Output;
  }

  export namespace QueryChanges {
    export type Input = QueryChangesArguments<Email, EmailFilterCondition> & {
      collapseThreads?: boolean;
    };
    export type Output = QueryChangesResponse;
    export type Method = (args: Input) => Output;
  }

  export namespace Set {
    export type Input = SetArguments<EmailCreate>;
    export type Output<A> = SetResponse<Email, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Copy {
    export type Input = CopyArguments<Pick<Email, "id" | "mailboxIds" | "keywords" | "receivedAt">>;
    export type Output = CopyResponse<Email>;
    export type Method = (args: Input) => Output;
  }

  export namespace Import {
    export type Input = {
      accountId: ID;
      ifInState?: string | null;
      emails: Record<ID, EmailImport>;
    };
    export type Output = {
      accountId: ID;
      oldState: string | null;
      newState: string;
      created: Record<ID, Email> | null;
      notCreated: Record<ID, SetError> | null;
    };
    export type Method = (args: Input) => Output;
  }

  export namespace Parse {
    export type Input = {
      accountId: ID;
      blobIds: ID[];
      properties?: Array<keyof Email>;
      bodyProperties?: Array<keyof Email>;
      fetchTextBodyValues?: boolean;
      fetchHTMLBodyValues?: boolean;
      fetchAllBodyValues?: boolean;
      maxBodyValueBytes?: number;
    };
    export type Output = {
      accountId: ID;
      parsed: Record<ID, Email> | null;
      notParsable: ID[] | null;
      notFound: ID[] | null;
    };
    export type Method = (args: Input) => Output;
  }
}
