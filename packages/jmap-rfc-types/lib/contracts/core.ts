export declare namespace CoreContracts {
  export namespace Get {
    export type Input = Record<string, any>;
    export type Output<A> = A;
    export interface Contract {
      input: Input;
      output: Output<this["input"]>;
    }
  }
}
