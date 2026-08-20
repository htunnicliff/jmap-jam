import type { Mailbox, MailboxCreate, MailboxFilterCondition } from "../jmap-mail.ts";
import type {
  ChangesArguments,
  ChangesResponse,
  GetArguments,
  GetResponse,
  QueryArguments,
  QueryChangesArguments,
  QueryChangesResponse,
  QueryResponse,
  SetArguments,
  SetResponse
} from "../jmap.ts";

export declare namespace MailboxContracts {
  export namespace Get {
    type Input = GetArguments<Mailbox>;
    type Output<A> = GetResponse<Mailbox, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Set {
    type Input = SetArguments<MailboxCreate> & { onDestroyRemoveEmails?: boolean };
    type Output<A> = SetResponse<Mailbox, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Changes {
    type Input = ChangesArguments;
    type Result = ChangesResponse & { updatedProperties: Array<keyof Mailbox> | null };
    export type Method = (args: Input) => Result;
  }

  export namespace Query {
    type Input = QueryArguments<Mailbox, MailboxFilterCondition> & {
      sortAsTree?: boolean;
      filterAsTree?: boolean;
    };
    type Result = QueryResponse;
    export type Method = (args: Input) => Result;
  }

  export namespace QueryChanges {
    type Input = QueryChangesArguments<Mailbox, MailboxFilterCondition>;
    type Result = QueryChangesResponse;
    export type Method = (args: Input) => Result;
  }
}
