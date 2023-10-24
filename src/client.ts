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
  LocalInvocation,
  Meta,
  Methods,
  RequestOptions,
} from "./types/contracts";
import type * as JMAP from "./types/jmap";
import type * as JMAPMail from "./types/jmap-mail";

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
  session: Promise<JMAP.Session>;

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
    const invocation: JMAP.Invocation<Args> = [method, args, "r1"];

    // Build request
    const body: JMAP.Request<[JMAP.Invocation<Args>]> = {
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
      let error: string | JMAP.ProblemDetails;
      if (response.headers.get("Content-Type")?.includes("json")) {
        error = (await response.json()) as JMAP.ProblemDetails;
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
    } = (await response.json()) as JMAP.Response<[JMAP.Invocation<Data>]>;

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
      return [name, args, id] as JMAP.Invocation<typeof args>;
    });

    // Build request
    const body: JMAP.Request<typeof methodCalls> = {
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
      let error: string | JMAP.ProblemDetails;

      if (response.headers.get("Content-Type")?.includes("json")) {
        error = (await response.json()) as JMAP.ProblemDetails;
      } else {
        error = await response.text();
      }

      throw error;
    }

    // Handle success
    const { methodResponses, sessionState, createdIds } =
      (await response.json()) as JMAP.Response;

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
    accountId: JMAP.BlobUploadParams["accountId"],
    body: BodyInit,
    fetchInit: RequestInit = {}
  ) {
    const { uploadUrl } = await this.session;

    const params: JMAP.BlobUploadParams = {
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
          throw (await response.json()) as JMAP.ProblemDetails;
        } else {
          throw await response.text();
        }
      }

      return (await response.json()) as JMAP.BlobUploadResponse;
    } catch (cause) {
      throw new Error("Failed to upload blob", { cause });
    }
  }

  /**
   * Download a blob
   */
  async downloadBlob(
    options: {
      accountId: JMAP.BlobDownloadParams["accountId"];
      blobId: JMAP.BlobDownloadParams["blobId"];
      mimeType: JMAP.BlobDownloadParams["type"];
      fileName: JMAP.BlobDownloadParams["name"];
    },
    fetchInit: RequestInit = {}
  ) {
    const { downloadUrl } = await this.session;

    const params: JMAP.BlobDownloadParams = {
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
          throw (await response.json()) as JMAP.ProblemDetails;
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
    types: "*" | Array<JMAPMail.Entity>;
    ping: number;
    closeafter?: JMAP.EventSourceArguments["closeafter"];
  }) {
    const params: JMAP.EventSourceArguments = {
      types: options.types === "*" ? "*" : options.types.join(","),
      closeafter: options.closeafter ?? "no",
      ping: `${options.ping}`,
    };

    const { eventSourceUrl } = await this.session;

    const url = expandURITemplate(eventSourceUrl, params);

    return new EventSource(url);
  }
}