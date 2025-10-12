import { buildCommand, buildRouteMap } from "@stricli/core";

export const fooCommand = buildCommand({
    loader: async () => {
        const { foo } = await import("./impl");
        return foo;
    },
    parameters: {
        positional: {
            kind: "tuple",
            parameters: [],
        },
    },
    docs: {
        brief: "Nested foo command",
    },
});

export const barCommand = buildCommand({
    loader: async () => {
        const { bar } = await import("./impl");
        return bar;
    },
    parameters: {
        positional: {
            kind: "tuple",
            parameters: [],
        },
    },
    docs: {
        brief: "Nested bar command",
    },
});

export const nestedRoutes = buildRouteMap({
    routes: {
        foo: fooCommand,
        bar: barCommand,
    },
    docs: {
        brief: "Nested commands",
    },
});
