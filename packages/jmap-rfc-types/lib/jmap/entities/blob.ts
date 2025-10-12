import type { ID } from "../primitives.ts";

declare module "../augmented.ts" {
  interface Entities {
    Blob: true;
  }
}

/**
 * [rfc8620 § 6.1](https://datatracker.ietf.org/doc/html/rfc8620#section-6.1)
 */
export interface BlobUploadParams {
  accountId: ID;
}

export interface BlobUploadResponse {
  /**
   * The id of the account used for the call.
   */
  accountId: ID;
  /**
   * The id representing the binary data uploaded.  The data for this
   * id is immutable.  The id *only* refers to the binary data, not any
   * metadata.
   */
  blobId: ID;
  /**
   * The media type of the file (as specified in [RFC6838],
   * Section 4.2) as set in the Content-Type header of the upload HTTP
   * request.
   */
  type: string;
  /**
   *  The size of the file in octets.
   */
  size: number;
}

/**
 * [rfc8620 § 6.2](https://datatracker.ietf.org/doc/html/rfc8620#section-6.2)
 */
export interface BlobDownloadParams {
  /**
   * The id of the account to which the record with the `blobId` belongs
   */
  accountId: ID;
  /**
   * The blobId representing the data of the file to download.
   */
  blobId: ID;
  /**
   * The type for the server to set in the "Content-Type"
   * header of the response; the `blobId` only represents the binary data
   * and does not have a content-type innately associated with it.
   */
  type: string;
  /**
   * The name for the file; the server MUST return this as the
   * filename if it sets a "Content-Disposition" header.
   */
  name: string;
}
