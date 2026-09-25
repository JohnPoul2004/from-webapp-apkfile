export interface HttpErrorInfo {
  code: number;
  name: string;
  category: '4xx Client Error' | '5xx Server Error';
  iconType: 'solo_parent' | 'parents';
  summary: string;
  description: string;
  technicalDetails: string;
  possibleCauses: string[];
  suggestedSolutions: string[];
  badgeColor: string;
  accentColor: string;
}

export const HTTP_ERROR_CODES: HttpErrorInfo[] = [
  // ==========================================
  // 4xx Client Errors (Solo Parent Icon)
  // ==========================================
  {
    code: 400,
    name: 'Bad Request',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The server cannot or will not process the request due to something perceived to be a client error.',
    description: 'The request could not be understood by the server due to malformed syntax, invalid request message framing, or deceptive routing.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.1',
    possibleCauses: [
      'Invalid URL syntax or unescaped query parameters',
      'Corrupted browser cache or cookies',
      'Malformed JSON/form payload sent in the request body',
      'Exceeded file upload limit or missing required header fields'
    ],
    suggestedSolutions: [
      'Verify the URL and request parameters for typographical errors',
      'Clear browser cookies and cached site data',
      'Validate JSON payload formatting before submitting'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 401,
    name: 'Unauthorized',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The request has not been applied because it lacks valid authentication credentials.',
    description: 'Access requires user authentication. The client must authenticate itself to get the requested response from the workspace server.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.2',
    possibleCauses: [
      'User session has expired or token is missing',
      'Incorrect login credentials provided',
      'Missing or revoked Bearer authorization token header'
    ],
    suggestedSolutions: [
      'Sign in again with your account credentials',
      'Verify authorization headers in request configurations',
      'Refresh your auth tokens and retry the request'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 402,
    name: 'Payment Required',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'Reserved for future use; commonly used for digital payment or quota paywalls.',
    description: 'This status code indicates that the requested action cannot be completed until a payment or subscription plan upgrade is performed.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.3',
    possibleCauses: [
      'Subscription plan expired or workspace quota exceeded',
      'Credit card transaction declined or pending settlement',
      'Paywall restricted content access'
    ],
    suggestedSolutions: [
      'Navigate to the Upgrade Plan section to renew or expand your tier',
      'Update credit card payment details in Settings',
      'Verify billing status with your administrator'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 403,
    name: 'Forbidden',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The server understood the request but refuses to authorize it.',
    description: 'Unlike 401 Unauthorized, the client identity is known to the server, but the account does not possess sufficient privileges to access the resource.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.4',
    possibleCauses: [
      'Role-based access control (RBAC) restrictions',
      'Attempting to edit or delete media belonging to another channel',
      'IP whitelist or geographic access restriction'
    ],
    suggestedSolutions: [
      'Contact workspace owner for role authorization',
      'Check whether the document ID belongs to your account',
      'Ensure you are signed into the correct tenant profile'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 404,
    name: 'Not Found',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The server cannot find the requested resource document or page endpoint.',
    description: 'The origin server did not find a current representation for the target resource or is unwilling to disclose that one exists.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.5',
    possibleCauses: [
      'Resource was deleted, archived, or moved to a new route',
      'Typo in the URL pathname or route identifier',
      'Subtab collection document does not exist in Firestore'
    ],
    suggestedSolutions: [
      'Return to the Home dashboard and re-open the section',
      'Check if the item was moved to Deletion Scheduled',
      'Verify the URL spelling and path identifiers'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The request method is known by the server but is not supported by the target resource.',
    description: 'The resource exists, but does not support the HTTP verb used (e.g. POST to a read-only static endpoint).',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.6',
    possibleCauses: [
      'Sending POST/PUT/DELETE to an immutable static endpoint',
      'Incorrect HTTP method configured in API client'
    ],
    suggestedSolutions: [
      'Inspect the Allow header returned by the server',
      'Adjust the HTTP request method to GET/POST as required'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 406,
    name: 'Not Acceptable',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The target resource does not have a representation matching the Accept headers.',
    description: 'The server cannot produce a response matching the list of acceptable values defined in the request Accept-Charset, Accept-Language, or Accept-Encoding headers.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.7',
    possibleCauses: [
      'Mismatched Accept content-type (e.g. asking for XML from a JSON API)',
      'Unsupported charset or content encoding'
    ],
    suggestedSolutions: [
      'Set Accept: application/json in request headers',
      'Remove restrictive Accept-Language or charset restrictions'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 407,
    name: 'Proxy Authentication Required',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The client must first authenticate itself with the intermediate proxy.',
    description: 'Similar to 401 Unauthorized, but authentication needs to be done by a proxy between the client and the origin server.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.8',
    possibleCauses: [
      'Corporate proxy requires Proxy-Authorization credentials',
      'Expired proxy ticket or invalid VPN gateway token'
    ],
    suggestedSolutions: [
      'Check corporate network proxy configuration',
      'Provide valid credentials in Proxy-Authorization header'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 408,
    name: 'Request Timeout',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The server timed out waiting for the complete client request.',
    description: 'The server did not receive a complete request message within the time that it was prepared to wait. The client may repeat the request without modifications at any later time.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.9',
    possibleCauses: [
      'Slow or congested network connection during large file upload',
      'Client process stalled during stream transmission'
    ],
    suggestedSolutions: [
      'Check your internet connection speed and stability',
      'Compress large photos and media assets before uploading'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 409,
    name: 'Conflict',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The request could not be completed due to a conflict with the current state of the resource.',
    description: 'This code is used in situations where the user might be able to resolve the conflict and resubmit the request (such as edit concurrency collisions).',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.10',
    possibleCauses: [
      'Simultaneous edit collisions on the same content document',
      'Unique constraint violation (e.g. duplicate username or slug)'
    ],
    suggestedSolutions: [
      'Reload the latest version of the record and re-apply changes',
      'Choose a unique title, username, or identifier'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 410,
    name: 'Gone',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The target resource is no longer available at the origin server and this condition is likely permanent.',
    description: 'The server indicates that the resource existed in the past but has been intentionally and permanently removed.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.11',
    possibleCauses: [
      'Item has completed its scheduled 100-day deletion cycle',
      'Permanent purge initiated by workspace administrator'
    ],
    suggestedSolutions: [
      'Remove dead bookmarks and stale links to this resource',
      'Create a new replacement record from the Creator Studio'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 411,
    name: 'Length Required',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The server refuses to accept the request without a defined Content-Length header.',
    description: 'The client did not specify the length of its request body, which is required by the requested resource endpoint.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.12',
    possibleCauses: [
      'Missing Content-Length header on POST or PUT request',
      'Chunked transfer encoding without length declaration'
    ],
    suggestedSolutions: [
      'Include a valid Content-Length header with the byte count'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 412,
    name: 'Precondition Failed',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'One or more conditions given in the request header fields evaluated to false.',
    description: 'Used with conditional requests (If-Match, If-None-Match, If-Modified-Since) when the server resource did not meet the client requirements.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.13',
    possibleCauses: [
      'ETag mismatch on concurrent document modification',
      'Outdated cache validation token'
    ],
    suggestedSolutions: [
      'Fetch the latest ETag before updating',
      'Re-fetch the resource fresh from the server'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 413,
    name: 'Payload Too Large',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The request entity is larger than limits defined by server configuration.',
    description: 'The server is refusing to process a request because the request payload is larger than the server is willing or able to process.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.14',
    possibleCauses: [
      'High-resolution raw image uploaded without compression',
      'Batch payload exceeding document store ceiling'
    ],
    suggestedSolutions: [
      'Compress photos and files before uploading',
      'Upgrade your plan to unlock higher per-item payload capacity'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 414,
    name: 'URI Too Long',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The URI requested by the client is longer than the server is willing to interpret.',
    description: 'This rare condition is likely to occur when a client has improperly converted a POST request to a GET request with long query information.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.15',
    possibleCauses: [
      'Excessive query string parameters appended to GET request',
      'Redirect loop accumulating URL parameters'
    ],
    suggestedSolutions: [
      'Switch heavy parameter payloads to POST request body',
      'Shorten search or filter queries'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 415,
    name: 'Unsupported Media Type',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The media format of the requested data is not supported by the target server.',
    description: 'The server refuses to service the request because the payload is in a format not supported by this method on the target resource.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.16',
    possibleCauses: [
      'Uploading an unsupported file extension (e.g. .exe instead of .jpg/.png/.webp)',
      'Incorrect Content-Type header'
    ],
    suggestedSolutions: [
      'Convert media to JPEG, PNG, WEBP, or standard MP4',
      'Ensure Content-Type matches actual payload format'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 416,
    name: 'Range Not Satisfiable',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The range specified by the Range header field cannot be satisfied.',
    description: 'The server cannot serve the requested byte-range (e.g. if the range extends beyond the end of the video or audio file).',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.17',
    possibleCauses: [
      'Media player requesting byte offsets exceeding actual file length',
      'File was truncated during download'
    ],
    suggestedSolutions: [
      'Reset streaming seek position to the beginning',
      'Clear cached video segments'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 417,
    name: 'Expectation Failed',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The expectation given in the Expect request-header field could not be met.',
    description: 'The server cannot meet the requirements of the Expect request-header field indicated by the client.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.18',
    possibleCauses: [
      'Proxy or server does not support Expect: 100-continue handshake'
    ],
    suggestedSolutions: [
      'Disable Expect: 100-continue in HTTP client configuration'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 418,
    name: "I'm a Teapot",
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The server refuses the attempt to brew coffee with a teapot.',
    description: 'Defined in 1998 as an April Fools joke in RFC 2324 (Hyper Text Coffee Pot Control Protocol), widely supported as an Easter egg by modern HTTP stacks.',
    technicalDetails: 'HTCPCP/1.0 RFC 2324 Section 2.3.2 / RFC 7168',
    possibleCauses: [
      'Attempting to brew coffee using HTCPCP on tea-specific hardware',
      'Deliberate test endpoint response for fun or diagnostics'
    ],
    suggestedSolutions: [
      'Brew tea instead of coffee',
      'Enjoy the digital humor of the web standards community!'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 421,
    name: 'Misdirected Request',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The request was directed at a server that is not able to produce a response.',
    description: 'The server cannot produce a response for this connection (such as due to connection reuse across different TLS hostnames in HTTP/2).',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.20',
    possibleCauses: [
      'HTTP/2 connection coalescing across incompatible virtual hosts',
      'Mismatched TLS Server Name Indication (SNI)'
    ],
    suggestedSolutions: [
      'Open a dedicated TCP/TLS connection for the target hostname',
      'Verify DNS mapping and SSL certificates'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 422,
    name: 'Unprocessable Entity',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The server understands the content type and syntax, but was unable to process instructions.',
    description: 'The request was well-formed but was unable to be followed due to semantic errors (such as missing required nested fields or invalid validation schemas).',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.21',
    possibleCauses: [
      'Validation error: product price is negative or title is blank',
      'Invalid date format or coordinate boundary'
    ],
    suggestedSolutions: [
      'Review input form validation warnings in the modal',
      'Check that all required fields are filled out properly'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 423,
    name: 'Locked',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The resource that is being accessed is currently locked.',
    description: 'From WebDAV (RFC 4918), indicates the target resource or document is locked against concurrent writes.',
    technicalDetails: 'WebDAV RFC 4918 Section 11.3',
    possibleCauses: [
      'Profile picture update locked for 365-day security cooldown',
      'Full Name or Username change locked for 100-day cooldown',
      'Document currently checked out in exclusive edit mode'
    ],
    suggestedSolutions: [
      'Wait for the lock cooldown period to expire',
      'Use the Dev / Test Mode unlock bypass in Settings for testing'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 424,
    name: 'Failed Dependency',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The method could not be performed because the requested action depended on another action that failed.',
    description: 'Indicates that the command failed because it depended on another action and that action failed (WebDAV RFC 4918).',
    technicalDetails: 'WebDAV RFC 4918 Section 11.4',
    possibleCauses: [
      'Cascading transaction failed on parent page or event document',
      'Linked category tag or subcollection creation failed'
    ],
    suggestedSolutions: [
      'Retry the transaction from the start',
      'Ensure prerequisite parent resources are saved first'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 425,
    name: 'Too Early',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The server is unwilling to risk processing a request that might be replayed.',
    description: 'Used to prevent replay attacks during TLS 1.3 0-RTT early data processing.',
    technicalDetails: 'RFC 8470 Using Early Data in HTTP',
    possibleCauses: [
      'Request sent in 0-RTT early data before TLS handshake finalized'
    ],
    suggestedSolutions: [
      'Retry request after standard 1-RTT TLS connection is established'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 426,
    name: 'Upgrade Required',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The server refuses to perform using the current protocol, but may after client upgrades.',
    description: 'The server sends this status to inform the client that it should upgrade to a newer protocol (e.g. HTTP/2 or WebSockets via Upgrade header).',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.5.22',
    possibleCauses: [
      'Connecting with obsolete HTTP/1.0 protocol',
      'WebSocket handshake required for real-time multiplayer channel'
    ],
    suggestedSolutions: [
      'Ensure modern browser with WebSocket and HTTP/2 support is active',
      'Upgrade connection parameters'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 428,
    name: 'Precondition Required',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The origin server requires the request to be conditional.',
    description: 'Designed to prevent the "lost update" problem where a client GETs a state, modifies it, and PUTs it back while a third party has modified the state.',
    technicalDetails: 'RFC 6585 Additional HTTP Status Codes Section 3',
    possibleCauses: [
      'Missing If-Match or If-Unmodified-Since header on concurrent resource update'
    ],
    suggestedSolutions: [
      'Provide If-Match header containing latest resource ETag'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 429,
    name: 'Too Many Requests',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The user has sent too many requests in a given amount of time (rate limiting).',
    description: 'The client has exceeded rate limits. Accompanied by a Retry-After header indicating how long to wait before making a new request.',
    technicalDetails: 'RFC 6585 Additional HTTP Status Codes Section 4',
    possibleCauses: [
      'Rapidly creating items in excess of frequency thresholds',
      'Automated script or rapid click flood'
    ],
    suggestedSolutions: [
      'Wait a few moments before retrying your action',
      'Upgrade to a higher tier plan for relaxed rate limit ceilings'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 431,
    name: 'Request Header Fields Too Large',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The server refuses to process the request because its header fields are too large.',
    description: 'The request header fields (either an individual field or all of them collectively) exceed the maximum allowed buffer size.',
    technicalDetails: 'RFC 6585 Additional HTTP Status Codes Section 5',
    possibleCauses: [
      'Bloated cookie collection accumulating over time',
      'Oversized custom authentication token'
    ],
    suggestedSolutions: [
      'Clear site cookies and storage tokens for the domain',
      'Shorten custom header payloads'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },
  {
    code: 451,
    name: 'Unavailable For Legal Reasons',
    category: '4xx Client Error',
    iconType: 'solo_parent',
    summary: 'The server is denying access to the resource as a consequence of a legal demand.',
    description: 'Named after Ray Bradbury’s Fahrenheit 451, this status code indicates access is restricted by court order, copyright law, or government censorship.',
    technicalDetails: 'RFC 7725 An HTTP Status Code to Report Legal Obstacles',
    possibleCauses: [
      'DMCA copyright takedown notice enacted on media item',
      'Geographical territory content licensing restriction'
    ],
    suggestedSolutions: [
      'Review Community Standards and copyright compliance policies',
      'Contact workspace legal compliance officer'
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    accentColor: 'amber'
  },

  // ==========================================
  // 5xx Server Errors (Parents Icon)
  // ==========================================
  {
    code: 500,
    name: 'Internal Server Error',
    category: '5xx Server Error',
    iconType: 'parents',
    summary: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
    description: 'A generic catch-all server error message when an unhandled exception or critical runtime failure occurs on the backend service.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.6.1',
    possibleCauses: [
      'Unhandled exception or panic in application server code',
      'Database connection timeout or backend microservice crash',
      'Corrupted server environment configuration'
    ],
    suggestedSolutions: [
      'Refresh the browser window to re-initialize your session',
      'Check system status or retry in a few seconds',
      'Local offline fallback is keeping your changes secure in local storage'
    ],
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    accentColor: 'rose'
  },
  {
    code: 501,
    name: 'Not Implemented',
    category: '5xx Server Error',
    iconType: 'parents',
    summary: 'The server does not support the functionality required to fulfill the request.',
    description: 'This status code is appropriate when the server does not recognize the request method and is not capable of supporting it for any resource.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.6.2',
    possibleCauses: [
      'Feature endpoint is scheduled for a future roadmap release',
      'Unsupported HTTP verb submitted to the server router'
    ],
    suggestedSolutions: [
      'Verify API version compatibility in documentation',
      'Use standard supported REST methods (GET, POST, PUT, DELETE)'
    ],
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    accentColor: 'rose'
  },
  {
    code: 502,
    name: 'Bad Gateway',
    category: '5xx Server Error',
    iconType: 'parents',
    summary: 'The server received an invalid response from an upstream server.',
    description: 'While acting as a gateway or proxy, the edge proxy received an invalid or corrupt response from the inbound upstream service.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.6.3',
    possibleCauses: [
      'Upstream backend service is restarting or deploying',
      'Nginx / Cloudflare reverse proxy timeout',
      'Firewall blocking upstream port communications'
    ],
    suggestedSolutions: [
      'Wait a moment and reload the application',
      'Check your connection to the cloud datacenter'
    ],
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    accentColor: 'rose'
  },
  {
    code: 503,
    name: 'Service Unavailable',
    category: '5xx Server Error',
    iconType: 'parents',
    summary: 'The server is currently unable to handle the request due to temporary maintenance or overload.',
    description: 'The server is temporarily unable to handle the request due to maintenance downtime or resource saturation. It will usually recover shortly.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.6.4',
    possibleCauses: [
      'Scheduled cloud maintenance or database upgrades in progress',
      'High traffic spike exhausting available server workers'
    ],
    suggestedSolutions: [
      'The DMM offline storage layer preserves your work locally',
      'Retry your connection in a few minutes'
    ],
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    accentColor: 'rose'
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    category: '5xx Server Error',
    iconType: 'parents',
    summary: 'The server did not receive a timely response from an upstream server.',
    description: 'The server, while acting as a gateway or reverse proxy, did not receive a timely response from an upstream server it needed to access to complete the request.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.6.5',
    possibleCauses: [
      'Database query execution took longer than proxy timeout window',
      'External third-party API integration latency'
    ],
    suggestedSolutions: [
      'Break large batch operations into smaller chunks',
      'Verify upstream service health metrics'
    ],
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    accentColor: 'rose'
  },
  {
    code: 505,
    name: 'HTTP Version Not Supported',
    category: '5xx Server Error',
    iconType: 'parents',
    summary: 'The server does not support the HTTP protocol version used in the request.',
    description: 'The server refuses to support the major version of HTTP that was used in the request message.',
    technicalDetails: 'HyperText Transfer Protocol (HTTP/1.1) RFC 9110 Section 15.6.6',
    possibleCauses: [
      'Legacy client using deprecated or non-standard protocol version'
    ],
    suggestedSolutions: [
      'Upgrade your web browser or HTTP client library to support HTTP/1.1 or HTTP/2'
    ],
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    accentColor: 'rose'
  },
  {
    code: 506,
    name: 'Variant Also Negotiates',
    category: '5xx Server Error',
    iconType: 'parents',
    summary: 'Transparent content negotiation for the request results in a circular reference.',
    description: 'Indicates that the server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, resulting in an infinite loop.',
    technicalDetails: 'RFC 2295 Transparent Content Negotiation in HTTP Section 8.1',
    possibleCauses: [
      'Misconfigured server content negotiation loop',
      'Circular rewrite rules on the origin server'
    ],
    suggestedSolutions: [
      'Review server routing and content negotiation config'
    ],
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    accentColor: 'rose'
  },
  {
    code: 507,
    name: 'Insufficient Storage',
    category: '5xx Server Error',
    iconType: 'parents',
    summary: 'The server is unable to store the representation needed to complete the request.',
    description: 'From WebDAV (RFC 4918), this status code indicates that the server cannot allocate enough disk storage or database quota to finish the operation.',
    technicalDetails: 'WebDAV RFC 4918 Section 11.5',
    possibleCauses: [
      'Workspace or server volume disk space filled to 100%',
      'Tier storage quota exceeded'
    ],
    suggestedSolutions: [
      'Delete unused media items from Deletion Scheduled to free up bytes',
      'Upgrade your subscription plan for higher GB storage capacity'
    ],
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    accentColor: 'rose'
  },
  {
    code: 508,
    name: 'Loop Detected',
    category: '5xx Server Error',
    iconType: 'parents',
    summary: 'The server terminated an operation because it encountered an infinite loop while processing.',
    description: 'The server terminated an operation because it encountered an infinite recursion while processing a request with "Depth: infinity" (WebDAV RFC 5842).',
    technicalDetails: 'WebDAV RFC 5842 Section 7.2',
    possibleCauses: [
      'Circular folder or page hierarchy referencing itself',
      'Infinite redirection cycle in page location links'
    ],
    suggestedSolutions: [
      'Check nested page hierarchy to ensure no circular parent-child loops',
      'Break recursive redirect rules'
    ],
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    accentColor: 'rose'
  },
  {
    code: 510,
    name: 'Not Extended',
    category: '5xx Server Error',
    iconType: 'parents',
    summary: 'Further extensions to the request are required for the server to fulfill it.',
    description: 'The policy for accessing the resource has not been met in the request. The server sends back all the information necessary for the client to issue an extended request (RFC 2774).',
    technicalDetails: 'RFC 2774 An HTTP Extension Framework Section 7',
    possibleCauses: [
      'Mandatory HTTP protocol extension header is missing'
    ],
    suggestedSolutions: [
      'Include required extension declaration headers in request'
    ],
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    accentColor: 'rose'
  },
  {
    code: 511,
    name: 'Network Authentication Required',
    category: '5xx Server Error',
    iconType: 'parents',
    summary: 'The client needs to authenticate to gain network access (e.g. Wi-Fi captive portal).',
    description: 'Indicates that the client needs to authenticate to gain network access, such as agreeing to Terms of Service on a public Wi-Fi captive portal before accessing the web.',
    technicalDetails: 'RFC 6585 Additional HTTP Status Codes Section 6',
    possibleCauses: [
      'Public Wi-Fi or hotel hotspot captive portal intercepting traffic',
      'Network access control (NAC) authentication required'
    ],
    suggestedSolutions: [
      'Open a new browser tab to complete captive portal login',
      'Accept network terms of service and reconnect'
    ],
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    accentColor: 'rose'
  }
];
