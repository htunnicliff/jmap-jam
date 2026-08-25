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
    export type Input = GetArguments<Mailbox>;
    export type Output<A> = GetResponse<Mailbox, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Set {
    export type Input = SetArguments<MailboxCreate> & { onDestroyRemoveEmails?: boolean };
    export type Output<A> = SetResponse<Mailbox, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Changes {
    export type Input = ChangesArguments;
    export type Output = ChangesResponse & { updatedProperties: Array<keyof Mailbox> | null };
    export type Method = (args: Input) => Output;
  }

  export namespace Query {
    export type Input = QueryArguments<Mailbox, MailboxFilterCondition> & {
      sortAsTree?: boolean;
      filterAsTree?: boolean;
    };
    export type Output = QueryResponse;
    export type Method = (args: Input) => Output;
  }

  export namespace QueryChanges {
    export type Input = QueryChangesArguments<Mailbox, MailboxFilterCondition>;
    export type Output = QueryChangesResponse;
    export type Method = (args: Input) => Output;
  }
}
