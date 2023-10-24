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
  ClientConfig,
  GetArgs,
  GetResponseData,
  GetResult,
  LocalInvocation,
  Meta,
  Methods,
  RequestOptions,
} from "./types/contracts";
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
import type { Entity } from "./types/jmap-mail";

export class JamClient<Config extends ClientConfig> {
  /**
   * Headers to send with every request
   */
  authHeader: string;

  /**
   * All available capabilities (known and custom)
   */
  capabilities: Map<string, string>;

  /**
   * An immediately fetched session promise
   */
  session: Promise<Session>;

  constructor(config: Config) {
    this.authHeader = `Bearer ${config.bearerToken}`;

    this.capabilities = new Map<string, string>([
      ...Object.entries(config.customCapabilities ?? {}),
      ...Object.entries(knownCapabilities),
    ]);

    this.session = JamClient.loadSession(config.sessionUrl, this.authHeader);
  }

  /**
   * Retrieve fresh session data
   */
  static async loadSession(sessionUrl: string, authHeader: string) {
    return fetch(sessionUrl, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      cache: "no-cache",
    }).then((res) => res.json());
  }

  /**
   * Send a JMAP request containing a single method call
   */
  async request<
    Method extends Methods,
    Args extends GetArgs<Method, Args>,
    Data extends GetResponseData<Method, Args>
  >(
    [method, args]: LocalInvocation<Method, Args>,
    options?: RequestOptions
  ): Promise<[Data, Meta]> {
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
          availableCapabilities: this.capabilities,
        }),
        ...using,
      ],
      methodCalls: [invocation],
      createdIds: createdIdsInput,
    };

    // Ensure session is loaded (if not already)
    const { apiUrl } = await this.session;

    // Send request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
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
    } = (await response.json()) as JMAPResponse<[Invocation<Data>]>;

    const meta: Meta = {
      sessionState,
      createdIds,
      response,
    };

    const error = getErrorFromInvocation(methodResponse);
    if (error) {
      throw error;
    }

    return [methodResponse[1], meta];
  }

  async requestMany<
    Requests extends { [id: string]: [Methods, any] },
    Options extends RequestOptions & {
      errorStrategy?: "throw" | "return";
    }
  >(requests: Requests, options?: Options) {
    // Extract options
    const {
      using = [],
      fetchInit,
      createdIds: createdIdsInput,
      errorStrategy = "throw",
    } = options ?? {};

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
          availableCapabilities: this.capabilities,
        }),
        ...using,
      ],
      methodCalls,
      createdIds: createdIdsInput,
    };

    // Ensure session is loaded (if not already)
    const { apiUrl } = await this.session;

    // Send request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
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

    switch (errorStrategy) {
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
      case "return":
      default: {
        if (errorStrategy !== "return") {
          console.error(
            `Unknown error strategy: ${errorStrategy}. Using "return" strategy instead.`
          );
        }

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
  async getPrimaryAccount() {
    return (await this.session).primaryAccounts?.["urn:ietf:params:jmap:mail"];
  }

  /**
   * Upload a blob
   */
  async uploadBlob(
    accountId: BlobUploadParams["accountId"],
    body: BodyInit,
    fetchInit: RequestInit = {}
  ) {
    const { uploadUrl } = await this.session;

    const params: BlobUploadParams = {
      accountId,
    };

    const url = expandURITemplate(uploadUrl, params);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
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
  async downloadBlob(
    options: {
      accountId: BlobDownloadParams["accountId"];
      blobId: BlobDownloadParams["blobId"];
      mimeType: BlobDownloadParams["type"];
      fileName: BlobDownloadParams["name"];
    },
    fetchInit: RequestInit = {}
  ) {
    const { downloadUrl } = await this.session;

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
          Authorization: this.authHeader,
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
  async connectEventSource(options: {
    types: "*" | Array<Entity>;
    ping: number;
    closeafter?: EventSourceArguments["closeafter"];
  }) {
    const params: EventSourceArguments = {
      types: options.types === "*" ? "*" : options.types.join(","),
      closeafter: options.closeafter ?? "no",
      ping: `${options.ping}`,
    };

    const { eventSourceUrl } = await this.session;

    const url = expandURITemplate(eventSourceUrl, params);

    return new EventSource(url);
  }
}
