import type {
  Email,
  EmailSubmission,
  EmailSubmissionCreate,
  EmailSubmissionFilterCondition
} from "../jmap-mail.ts";
import type {
  ChangesArguments,
  ChangesResponse,
  GetArguments,
  GetResponse,
  ID,
  QueryArguments,
  QueryChangesArguments,
  QueryChangesResponse,
  QueryResponse,
  SetArguments,
  SetResponse
} from "../jmap.ts";

export declare namespace EmailSubmissionContracts {
  export namespace Get {
    export type Input = GetArguments<EmailSubmission>;
    export type Output<A> = GetResponse<EmailSubmission, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Set {
    export type Input = SetArguments<EmailSubmissionCreate> & {
      onSuccessUpdateEmail?: Record<ID, Partial<Email>> | null;
      onSuccessDestroyEmail?: ID[] | null;
    };
    export type Output<A> = SetResponse<EmailSubmission, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Query {
    export type Input = QueryArguments<EmailSubmission, EmailSubmissionFilterCondition>;
    export type Output = QueryResponse;
    export type Method = (args: Input) => Output;
  }

  export namespace QueryChanges {
    export type Input = QueryChangesArguments<EmailSubmission, EmailSubmissionFilterCondition>;
    export type Output = QueryChangesResponse;
    export type Method = (args: Input) => Output;
  }

  export namespace Changes {
    export type Input = ChangesArguments;
    export type Output = ChangesResponse;
    export type Method = (args: Input) => Output;
  }
}
