import {
  getCapabilitiesForMethodCalls,
  knownCapabilities
} from "./capabilities.ts";
import {
  expandURITemplate,
  getErrorFromInvocation,
  getResultsForMethodCalls
} from "./helpers.ts";
import {
  type DraftsProxy,
  type InvocationDraft,
  type WithRefValues,
  type WithoutRefValues,
  buildRequestsFromDrafts
} from "./request-drafts.ts";
import type {
  GetArgs,
  GetResponseData,
  LocalInvocation,
  Meta,
  Methods,
  ProxyAPI,
  RequestOptions
} from "./types/contracts.ts";
import type { Entity } from "./types/jmap-mail.ts";
import type {
  BlobDownloadParams,
  BlobUploadParams,
  BlobUploadResponse,
  EventSourceArguments,
  Invocation,
  ProblemDetails,
  Request as JMAPRequest,
  Response as JMAPResponse,
  Session
} from "./types/jmap.ts";

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

export class JamClient<Config extends ClientConfig = ClientConfig> {
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
      ...Object.entries(knownCapabilities)
    ]);

    this.session = JamClient.loadSession(config.sessionUrl, this.authHeader);
  }

  /**
   * Retrieve fresh session data
   */
  static loadSession(sessionUrl: string, authHeader: string): Promise<Session> {
    return fetch(sessionUrl, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json"
      },
      cache: "no-cache"
    }).then((res) => res.json());
  }

  /**
   * Send a JMAP request containing a single method call
   */
  // oxlint-disable-next-line max-lines-per-function
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
      createdIds: createdIdsInput
    } = options ?? {};

    // Assemble method call
    const invocation: Invocation<Args> = [method, args, "r1"];

    // Build request
    const body: JMAPRequest<[Invocation<Args>]> = {
      using: [
        ...getCapabilitiesForMethodCalls({
          methodNames: [method],
          availableCapabilities: this.capabilities
        }),
        ...using
      ],
      methodCalls: [invocation],
      createdIds: createdIdsInput
    };

    // Ensure session is loaded (if not already)
    const { apiUrl } = await this.session;

    // Send request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      ...fetchInit
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
      createdIds
    } = (await response.json()) as JMAPResponse<[Invocation<Data>]>;

    const error = getErrorFromInvocation(methodResponse);
    if (error) {
      throw error;
    }

    return [
      methodResponse[1],
      {
        sessionState,
        createdIds,
        response
      }
    ];
  }

  // oxlint-disable-next-line max-lines-per-function
  async requestMany<
    DraftsFn extends (b: DraftsProxy) => { [id: string]: InvocationDraft },
    Returning extends ReturnType<DraftsFn>
  >(
    draftsFn: DraftsFn,
    options: RequestOptions = {}
  ): Promise<
    [
      {
        [MethodId in keyof Returning]: Returning[MethodId] extends InvocationDraft<
          infer Inv extends [Methods, WithRefValues<Record<string, any>>]
        >
          ? GetResponseData<Inv[0], WithoutRefValues<Inv[1]>>
          : never;
      },
      Meta
    ]
  > {
    // Extract options
    const { using = [], fetchInit, createdIds: createdIdsInput } = options;

    const { methodCalls, methodNames } = buildRequestsFromDrafts(draftsFn);

    // Build request
    const body: JMAPRequest = {
      using: [
        ...getCapabilitiesForMethodCalls({
          methodNames,
          availableCapabilities: this.capabilities
        }),
        ...using
      ],
      methodCalls,
      createdIds: createdIdsInput
    };

    // Ensure session is loaded (if not already)
    const { apiUrl } = await this.session;

    // Send request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      ...fetchInit
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

    const meta: Meta = {
      sessionState,
      createdIds,
      response
    };

    const errors = methodResponses
      .map((r) => getErrorFromInvocation(r))
      .filter((e): e is NonNullable<typeof e> => e !== null);

    if (errors.length > 0) {
      throw errors;
    }

    return [
      // @ts-expect-error TODO: Fix these types
      getResultsForMethodCalls(methodResponses, { returnErrors: false }),
      meta
    ];
  }

  /**
   * Get the ID of the primary mail account for the current session
   */
  async getPrimaryAccount(): Promise<string> {
    return (await this.session).primaryAccounts?.["urn:ietf:params:jmap:mail"];
  }

  /**
   * Upload a blob
   */
  async uploadBlob(
    accountId: BlobUploadParams["accountId"],
    body: BodyInit,
    fetchInit: RequestInit = {}
  ): Promise<BlobUploadResponse> {
    const { uploadUrl } = await this.session;

    const params: BlobUploadParams = {
      accountId
    };

    const url = expandURITemplate(uploadUrl, params);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
          Accept: "application/json"
        },
        body,
        ...fetchInit
      });

      if (!response.ok) {
        if (response.headers.get("Content-Type")?.includes("json")) {
          throw (await response.json()) as ProblemDetails;
        }
        throw await response.text();
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
  ): Promise<Response> {
    const { downloadUrl } = await this.session;

    const params: BlobDownloadParams = {
      accountId: options.accountId,
      blobId: options.blobId,
      type: options.mimeType,
      name: options.fileName
    };

    const url = expandURITemplate(downloadUrl, params);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: this.authHeader
        },
        ...fetchInit
      });

      if (!response.ok) {
        if (response.headers.get("Content-Type")?.includes("json")) {
          throw (await response.json()) as ProblemDetails;
        }
        throw await response.text();
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
  }): Promise<EventSource> {
    const params: EventSourceArguments = {
      types: options.types === "*" ? "*" : options.types.join(","),
      closeafter: options.closeafter ?? "no",
      ping: `${options.ping}`
    };

    const { eventSourceUrl } = await this.session;

    const url = expandURITemplate(eventSourceUrl, params);

    return new EventSource(url);
  }

  /**
   * A fluent API using {entity}.{operation} syntax
   *
   * @example
   * ```ts
   * const [emails] = await jam.api.Email.get({
   *   accountId,
   *   ids,
   *   properties,
   * });
   *
   * const [mailboxes] = await jam.api.Mailbox.query({
   *   accountId,
   *   filter: { name: "Inbox" },
   * });
   * ```
   */
  get api(): ProxyAPI {
    return new Proxy<ProxyAPI>({} as ProxyAPI, {
      get: (_, entity: string) =>
        new Proxy(
          {},
          {
            get: (__, operation: string) => {
              return (args: any, options?: RequestOptions) => {
                const method = `${entity}/${operation}` as Methods;

                return this.request([method, args], options);
              };
            }
          }
        )
    });
  }

  static isProblemDetails(value: unknown): value is ProblemDetails {
    return typeof value === "object" && value !== null && "type" in value;
  }
}
