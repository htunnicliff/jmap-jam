import {
  getCapabilitiesForMethodCalls,
  knownCapabilities,
} from "./capabilities";
import { expandURITemplate } from "./helpers";
import type { Requests, RequestsTuple, Responses } from "./types/client";
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
};

export type RequestOptions = {
  fetchInit?: RequestInit;
  using?: JMAPRequest["using"];
  createdIds?: JMAPRequest["createdIds"];
};

export function createClient(config: ClientConfig) {
  // ----------------------------------
  // Local variables and functions
  // ----------------------------------

  /**
   * Headers to send with every request
   */
  const authHeader = `Bearer ${config.bearerToken}`;

  /**
   * All available capabilities (known and custom)
   */
  const capabilities = new Map<string, string>([
    ...Object.entries(config.customCapabilities ?? {}),
    ...Object.entries(knownCapabilities),
  ]);

  /**
   * An immediately fetched session promise
   */
  const session: Promise<Session> = fetch(config.sessionUrl, {
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
    },
    cache: "no-cache",
  }).then((res) => res.json());

  async function request<R extends Record<string, RequestsTuple<Requests>>>(
    requests: R,
    options: RequestOptions = {}
  ) {
    // Extract options
    const { using = [], fetchInit, createdIds: createdIdsInput } = options;

    // Assemble method calls
    const methods = new Set<string>();
    const methodCalls = Object.entries(requests).map(
      ([methodCallId, invocation]) => {
        const [method, args] = invocation;
        methods.add(method);
        return [method, args, methodCallId] as Invocation<typeof args>;
      }
    );

    // Build request
    const body = {
      using: [
        ...getCapabilitiesForMethodCalls({
          methodNames: methods,
          availableCapabilities: capabilities,
        }),
        ...using,
      ],
      methodCalls,
      createdIds: createdIdsInput,
    } satisfies JMAPRequest;

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

    // Build response
    const results = Object.fromEntries(
      methodResponses.map(([methodName, dataOrError, requestId]) => {
        let payload;
        if (methodName === "error") {
          payload = {
            requestId,
            error: dataOrError,
            data: null,
          };
        } else {
          payload = {
            requestId,
            data: dataOrError,
            error: null,
          };
        }

        return [requestId, payload] as const;
      })
    ) as {
      [K in keyof R]: {
        requestId: K;
      } & (
        | {
            error: null;
            data: Responses<R[K][1]>[R[K][0]];
          }
        | {
            error: ProblemDetails;
            data: null;
          }
      );
    };

    return [
      results,
      {
        sessionState,
        createdIds,
        response,
      },
    ] as const;
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
    types: "*" | Array<Entity | keyof typeof config.customCapabilities>;
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
    uploadBlob,
    downloadBlob,
    connectEventSource,
  } as const;

  return client;
}
