import type {
  Email,
  EmailBodyPart,
  EmailCreate,
  EmailFilterCondition,
  EmailImport
} from "../jmap-mail.ts";
import type {
  ChangesArguments,
  ChangesResponse,
  CopyArguments,
  CopyResponse,
  GetArguments,
  GetResponse,
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
    export type Input = GetArguments<Email> & {
      bodyProperties?: Array<keyof EmailBodyPart>;
      fetchTextBodyValues?: boolean;
      fetchHTMLBodyValues?: boolean;
      fetchAllBodyValues?: boolean;
      maxBodyValueBytes?: number;
    };
    export type Output<A> = GetResponse<Email, A>;
    export interface Contract {
      input: Input;
      output: Output<this["input"]>;
    }
  }

  export namespace Changes {
    export type Input = ChangesArguments;
    export type Output = ChangesResponse;
    export interface Contract {
      input: Input;
      output: Output;
    }
  }

  export namespace Query {
    export type Input = QueryArguments<Email, EmailFilterCondition> & {
      collapseThreads?: boolean;
    };
    export type Output = QueryResponse;
    export interface Contract {
      input: Input;
      output: Output;
    }
  }

  export namespace QueryChanges {
    export type Input = QueryChangesArguments<Email, EmailFilterCondition> & {
      collapseThreads?: boolean;
    };
    export type Output = QueryChangesResponse;
    export interface Contract {
      input: Input;
      output: Output;
    }
  }

  export namespace Set {
    export type Input = SetArguments<EmailCreate>;
    export type Output<A> = SetResponse<Email, A>;
    export interface Contract {
      input: Input;
      output: Output<this["input"]>;
    }
  }

  export namespace Copy {
    export type Input = CopyArguments<Pick<Email, "id" | "mailboxIds" | "keywords" | "receivedAt">>;
    export type Output = CopyResponse<Email>;
    export interface Contract {
      input: Input;
      output: Output;
    }
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
    export interface Contract {
      input: Input;
      output: Output;
    }
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
    export interface Contract {
      input: Input;
      output: Output;
    }
  }
}
