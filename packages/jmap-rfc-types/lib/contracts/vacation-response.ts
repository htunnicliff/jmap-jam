import type { VacationResponse, VacationResponseCreate } from "../jmap-mail.ts";
import type { GetArguments, GetResponse, SetArguments, SetResponse } from "../jmap.ts";

export declare namespace VacationResponseContracts {
  export namespace Get {
    export type Input = GetArguments<VacationResponse>;
    export type Output<A> = GetResponse<VacationResponse, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Set {
    export type Input = SetArguments<VacationResponseCreate>;
    export type Output<A> = SetResponse<VacationResponse, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }
}
