import type { BlobCopyArguments, BlobCopyResponse } from "../jmap.ts";

export declare namespace BlobContracts {
  /**
   * [rfc8620 § 6.3](https://datatracker.ietf.org/doc/html/rfc8620#section-6.3)
   */
  export namespace Copy {
    export type Input = BlobCopyArguments;
    export type Output = BlobCopyResponse;
    export type Method = (args: Input) => Output;
  }
}
