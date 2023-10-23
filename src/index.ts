import type { Exact } from "type-fest";
import {
  getCapabilitiesForMethodCalls,
  knownCapabilities,
} from "./capabilities";
import {
  expandURITemplate,
  getErrorFromInvocation,
  getResultsForMethodCalls,
} from "./helpers";
import type {
  GetArgs,
  GetResponseData,
  Methods,
  Requests,
} from "./types/client";
import type {
  BlobDownloadParams,
  BlobUploadParams,
  BlobUploadResponse,
  EventSourceArguments,
  Invocation,
  Request as JMAPRequest,
  Response as JMAPResponse,
  ProblemDetails,
  Session,
} from "./types/jmap";
import type { Entity } from "./types/jmap-mail/entities";

export type ClientConfig = {
  /**
   * The bearer token used to authenticate all requests
   */
  bearerToken: string;

  /**
   * The URL of the JMAP session resources
   */
  sessionUrl: string;

  /**
   * A map of custom entities and their required capability identifiers
   *
   * @example
   * ```
   * const client = createClient({
   *   customCapabilities: {
   *     "Sandwich": "urn:bigco:params:jmap:sandwich",
   *     "TextMessage": "foo:bar:jmap:sms",
   *     "Spaceship": "myspaceship-jmap-urn",
   *   },
   * });
   * ```
   */
  customCapabilities?: Record<string, string>;
  /**
   * The error handling strategy to use when one or more method calls
   * receive an error response.
   */
  errorHandling?: "throw" | "return";
};

type RequestOptions = {
  fetchInit?: RequestInit;
  using?: JMAPRequest["using"];
  createdIds?: JMAPRequest["createdIds"];
};

export function createClient<Config extends ClientConfig>({
  bearerToken,
  sessionUrl,
  customCapabilities,
  errorHandling = "throw",
}: Config) {
  /**
   * Headers to send with every request
   */
  const authHeader = `Bearer ${bearerToken}`;

  /**
   * All available capabilities (known and custom)
   */
  const capabilities = new Map<string, string>([
    ...Object.entries(customCapabilities ?? {}),
    ...Object.entries(knownCapabilities),
  ]);

  /**
   * An immediately fetched session promise
   */
  const session: Promise<Session> = fetch(sessionUrl, {
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
    },
    cache: "no-cache",
  }).then((res) => res.json());

  type LocalInvocation<
    Method extends Methods,
    Args extends Exact<Requests[Method], Args>
  > = [Method, Args];

  type Meta = {
    sessionState: JMAPResponse["sessionState"];
    createdIds: JMAPResponse["createdIds"];
    response: Response;
  };

  type GetResult<Data> = typeof errorHandling extends "throw"
    ? Data
    :
        | {
            data: Data;
            error: null;
          }
        | {
            data: null;
            error: ProblemDetails;
          };

  /**
   * Send a JMAP request containing a single method call
   */
  async function request<
    Method extends Methods,
    Args extends GetArgs<Method, Args>,
    Data extends GetResponseData<Method, Args>
  >(
    [method, args]: LocalInvocation<Method, Args>,
    options?: RequestOptions
  ): Promise<[GetResult<Data>, Meta]> {
    const {
      using = [],
      fetchInit,
      createdIds: createdIdsInput,
    } = options ?? {};

    // Assemble method call
    const invocation: Invocation<Args> = [method, args, "r1"];

    // Build request
    const body: JMAPRequest<[Invocation<Args>]> = {
      using: [
        ...getCapabilitiesForMethodCalls({
          methodNames: [method],
          availableCapabilities: capabilities,
        }),
        ...using,
      ],
      methodCalls: [invocation],
      createdIds: createdIdsInput,
    };

    // Ensure session is loaded (if not already)
    const { apiUrl } = await session;

    // Send request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      ...fetchInit,
    });

    // Handle 4xx-5xx errors
    if (!response.ok) {
      let error: string | ProblemDetails;
      if (response.headers.get("Content-Type")?.includes("json")) {
        error = (await response.json()) as ProblemDetails;
      } else {
        error = await response.text();
      }
      throw error;
    }

    // Handle success
    const {
      methodResponses: [methodResponse],
      sessionState,
      createdIds,
    } = (await response.json()) as JMAPResponse<
      [Invocation<Data | ProblemDetails>]
    >;

    const meta: Meta = {
      sessionState,
      createdIds,
      response,
    };

    const error = getErrorFromInvocation(methodResponse);

    switch (errorHandling) {
      case "throw": {
        if (error) {
          throw error;
        } else {
          // @ts-ignore
          return [methodResponse[1], meta];
        }
      }
      case "return": {
        if (error) {
          return [{ error, data: null }, meta];
        } else {
          return [{ data: methodResponse[1] as Data, error: null }, meta];
        }
      }
    }
  }

  async function requestMany<Requests extends { [id: string]: [Methods, any] }>(
    requests: Requests,
    options: RequestOptions = {}
  ) {
    // Extract options
    const { using = [], fetchInit, createdIds: createdIdsInput } = options;

    // Assemble method calls
    const methodNames = new Set<string>();
    const methodCalls = Object.entries(requests).map(([id, [name, args]]) => {
      methodNames.add(name);
      return [name, args, id] as Invocation<typeof args>;
    });

    // Build request
    const body: JMAPRequest<typeof methodCalls> = {
      using: [
        ...getCapabilitiesForMethodCalls({
          methodNames,
          availableCapabilities: capabilities,
        }),
        ...using,
      ],
      methodCalls,
      createdIds: createdIdsInput,
    };

    // Ensure session is loaded (if not already)
    const { apiUrl } = await session;

    // Send request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      ...fetchInit,
    });

    // Handle 4xx-5xx errors
    if (!response.ok) {
      let error: string | ProblemDetails;

      if (response.headers.get("Content-Type")?.includes("json")) {
        error = (await response.json()) as ProblemDetails;
      } else {
        error = await response.text();
      }

      throw error;
    }

    // Handle success
    const { methodResponses, sessionState, createdIds } =
      (await response.json()) as JMAPResponse;

    const meta = {
      sessionState,
      createdIds,
      response,
    };

    switch (errorHandling) {
      case "throw": {
        const errors = methodResponses
          .map(getErrorFromInvocation)
          .filter((e): e is NonNullable<typeof e> => e !== null);

        if (errors.length > 0) {
          throw errors;
        } else {
          return [
            getResultsForMethodCalls(methodResponses, {
              returnErrors: false,
            }),
            meta,
          ];
        }
      }
      case "return": {
        return [
          getResultsForMethodCalls(methodResponses, {
            returnErrors: true,
          }),
          meta,
        ];
      }
    }
  }

  /**
   * Get the ID of the primary mail account for the current session
   */
  async function getPrimaryAccount() {
    return (await session).primaryAccounts?.["urn:ietf:params:jmap:mail"];
  }

  /**
   * Upload a blob
   */
  async function uploadBlob(
    accountId: BlobUploadParams["accountId"],
    body: BodyInit,
    fetchInit: RequestInit = {}
  ) {
    const { uploadUrl } = await session;

    const params: BlobUploadParams = {
      accountId,
    };

    const url = expandURITemplate(uploadUrl, params);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
        body,
        ...fetchInit,
      });

      if (!response.ok) {
        if (response.headers.get("Content-Type")?.includes("json")) {
          throw (await response.json()) as ProblemDetails;
        } else {
          throw await response.text();
        }
      }

      return (await response.json()) as BlobUploadResponse;
    } catch (cause) {
      throw new Error("Failed to upload blob", { cause });
    }
  }

  /**
   * Download a blob
   */
  async function downloadBlob(
    options: {
      accountId: BlobDownloadParams["accountId"];
      blobId: BlobDownloadParams["blobId"];
      mimeType: BlobDownloadParams["type"];
      fileName: BlobDownloadParams["name"];
    },
    fetchInit: RequestInit = {}
  ) {
    const { downloadUrl } = await session;

    const params: BlobDownloadParams = {
      accountId: options.accountId,
      blobId: options.blobId,
      type: options.mimeType,
      name: options.fileName,
    };

    const url = expandURITemplate(downloadUrl, params);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
        ...fetchInit,
      });

      if (!response.ok) {
        if (response.headers.get("Content-Type")?.includes("json")) {
          throw (await response.json()) as ProblemDetails;
        } else {
          throw await response.text();
        }
      }

      return response;
    } catch (cause) {
      throw new Error("Failed to download blob", { cause });
    }
  }

  /**
   * Initiate an event source to subscribe to server-sent events
   */
  async function connectEventSource(options: {
    types: "*" | Array<Entity | keyof typeof customCapabilities>;
    ping: number;
    closeafter?: EventSourceArguments["closeafter"];
  }) {
    const params: EventSourceArguments = {
      types: options.types === "*" ? "*" : options.types.join(","),
      closeafter: options.closeafter ?? "no",
      ping: `${options.ping}`,
    };

    const { eventSourceUrl } = await session;

    const url = expandURITemplate(eventSourceUrl, params);

    return new EventSource(url);
  }

  // Public client interface
  const client = {
    session,
    getPrimaryAccount,
    request,
    requestMany,
    uploadBlob,
    downloadBlob,
    connectEventSource,
  } as const;

  return client;
}
