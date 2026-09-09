import type { Thread } from "../jmap-mail.ts";
import type { ChangesArguments, ChangesResponse, GetArguments, GetResponse } from "../jmap.ts";

export declare namespace ThreadContracts {
  export namespace Get {
    export type Input = GetArguments<Thread>;
    export type Output<A> = GetResponse<Thread, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Changes {
    export type Input = ChangesArguments;
    export type Output = ChangesResponse;
    export type Method = (args: Input) => Output;
  }
}
