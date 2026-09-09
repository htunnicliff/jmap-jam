export declare namespace CoreContracts {
  export namespace Get {
    export type Input = Record<string, any>;
    export type Output<A> = A;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }
}
