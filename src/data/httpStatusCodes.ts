export type HttpStatusClass = '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

export interface HttpStatusCodeItem {
  code: number;
  name: string;
  category: HttpStatusClass;
  categoryName: string;
  summary: string;
  rfc: string;
  iconType: 'info' | 'success' | 'redirect' | 'solo_parent' | 'parents';
  badgeColor: string;
}

export const ALL_HTTP_STATUS_CODES: HttpStatusCodeItem[] = [
  // ==========================================
  // 1xx Informational (Request received, continuing process)
  // ==========================================
  {
    code: 100,
    name: 'Continue',
    category: '1xx',
    categoryName: '1xx Informational',
    summary: 'Server received initial request headers; client should proceed to send the request body.',
    rfc: 'RFC 9110 §15.2.1',
    iconType: 'info',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    code: 101,
    name: 'Switching Protocols',
    category: '1xx',
    categoryName: '1xx Informational',
    summary: 'The requester has asked the server to switch protocols (e.g. from HTTP to WebSocket).',
    rfc: 'RFC 9110 §15.2.2',
    iconType: 'info',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    code: 102,
    name: 'Processing',
    category: '1xx',
    categoryName: '1xx Informational',
    summary: 'WebDAV: Server has received and is processing the request, but no response is available yet.',
    rfc: 'RFC 2518 §10.1',
    iconType: 'info',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    code: 103,
    name: 'Early Hints',
    category: '1xx',
    categoryName: '1xx Informational',
    summary: 'Returns response headers before final HTTP message to allow preloading of critical resources.',
    rfc: 'RFC 8297',
    iconType: 'info',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
  },

  // ==========================================
  // 2xx Success (Action received, understood, accepted)
  // ==========================================
  {
    code: 200,
    name: 'OK',
    category: '2xx',
    categoryName: '2xx Success',
    summary: 'Standard response for successful HTTP requests with payload content.',
    rfc: 'RFC 9110 §15.3.1',
    iconType: 'success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 201,
    name: 'Created',
    category: '2xx',
    categoryName: '2xx Success',
    summary: 'Request succeeded and a new resource has been created on the server (e.g. after POST request).',
    rfc: 'RFC 9110 §15.3.2',
    iconType: 'success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 202,
    name: 'Accepted',
    category: '2xx',
    categoryName: '2xx Success',
    summary: 'Request accepted for background processing, but asynchronous processing is not yet complete.',
    rfc: 'RFC 9110 §15.3.3',
    iconType: 'success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 203,
    name: 'Non-Authoritative Information',
    category: '2xx',
    categoryName: '2xx Success',
    summary: 'Server is a transforming proxy returning a modified 200 OK payload from origin.',
    rfc: 'RFC 9110 §15.3.4',
    iconType: 'success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 204,
    name: 'No Content',
    category: '2xx',
    categoryName: '2xx Success',
    summary: 'Server successfully fulfilled the request and there is no additional content to send in payload.',
    rfc: 'RFC 9110 §15.3.5',
    iconType: 'success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 205,
    name: 'Reset Content',
    category: '2xx',
    categoryName: '2xx Success',
    summary: 'Server fulfilled request and indicates the user agent should reset the active document view.',
    rfc: 'RFC 9110 §15.3.6',
    iconType: 'success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 206,
    name: 'Partial Content',
    category: '2xx',
    categoryName: '2xx Success',
    summary: 'Server is delivering only part of the resource due to a Range header sent by the client.',
    rfc: 'RFC 9110 §15.3.7',
    iconType: 'success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 207,
    name: 'Multi-Status',
    category: '2xx',
    categoryName: '2xx Success',
    summary: 'WebDAV: Message body is an XML document containing separate status codes for sub-operations.',
    rfc: 'RFC 4918 §11.1',
    iconType: 'success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 208,
    name: 'Already Reported',
    category: '2xx',
    categoryName: '2xx Success',
    summary: 'WebDAV: Members of a DAV binding have already been enumerated in a previous part.',
    rfc: 'RFC 5842 §7.1',
    iconType: 'success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 226,
    name: 'IM Used',
    category: '2xx',
    categoryName: '2xx Success',
    summary: 'Server fulfilled GET request; response is a representation of one or more instance-manipulations.',
    rfc: 'RFC 3229 §10.4.1',
    iconType: 'success',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },

  // ==========================================
  // 3xx Redirection (Further action must be taken)
  // ==========================================
  {
    code: 300,
    name: 'Multiple Choices',
    category: '3xx',
    categoryName: '3xx Redirection',
    summary: 'Indicates multiple options for the resource from which the client may choose.',
    rfc: 'RFC 9110 §15.4.1',
    iconType: 'redirect',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 301,
    name: 'Moved Permanently',
    category: '3xx',
    categoryName: '3xx Redirection',
    summary: 'Target resource has been assigned a new permanent URI and future references should use it.',
    rfc: 'RFC 9110 §15.4.2',
    iconType: 'redirect',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 302,
    name: 'Found (Temporary Redirect)',
    category: '3xx',
    categoryName: '3xx Redirection',
    summary: 'Target resource resides temporarily under a different URI specified in Location header.',
    rfc: 'RFC 9110 §15.4.3',
    iconType: 'redirect',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 303,
    name: 'See Other',
    category: '3xx',
    categoryName: '3xx Redirection',
    summary: 'Server directs client to get the requested resource at another URI with a GET request.',
    rfc: 'RFC 9110 §15.4.4',
    iconType: 'redirect',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 304,
    name: 'Not Modified',
    category: '3xx',
    categoryName: '3xx Redirection',
    summary: 'Indicates client conditional GET found cached copy is valid; no payload body transmitted.',
    rfc: 'RFC 9110 §15.4.5',
    iconType: 'redirect',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 305,
    name: 'Use Proxy',
    category: '3xx',
    categoryName: '3xx Redirection',
    summary: 'Defined in older specs: requested resource must be accessed through designated proxy.',
    rfc: 'RFC 9110 §15.4.6',
    iconType: 'redirect',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 307,
    name: 'Temporary Redirect',
    category: '3xx',
    categoryName: '3xx Redirection',
    summary: 'Target resource resides temporarily at another URI; request method must not be changed.',
    rfc: 'RFC 9110 §15.4.8',
    iconType: 'redirect',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 308,
    name: 'Permanent Redirect',
    category: '3xx',
    categoryName: '3xx Redirection',
    summary: 'Target resource assigned a new permanent URI; request method must not be changed.',
    rfc: 'RFC 9110 §15.4.9',
    iconType: 'redirect',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },

  // ==========================================
  // 4xx Client Error (Solo Parent Icon)
  // ==========================================
  {
    code: 400,
    name: 'Bad Request',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Server cannot process request due to malformed syntax, invalid framing, or deceptive routing.',
    rfc: 'RFC 9110 §15.5.1',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 401,
    name: 'Unauthorized',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Request lacks valid authentication credentials for the requested target resource.',
    rfc: 'RFC 9110 §15.5.2',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 402,
    name: 'Payment Required',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Reserved for digital payment systems; used for subscription, billing, or paywall restrictions.',
    rfc: 'RFC 9110 §15.5.3',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 403,
    name: 'Forbidden',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Server understood request but refuses authorization; credentials lack necessary permissions.',
    rfc: 'RFC 9110 §15.5.4',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 404,
    name: 'Not Found',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Origin server did not find a current representation for the requested target resource.',
    rfc: 'RFC 9110 §15.5.5',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'HTTP request method is known by server but not supported by the target resource URI.',
    rfc: 'RFC 9110 §15.5.6',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 406,
    name: 'Not Acceptable',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Target resource cannot generate representation matching the client Accept header preferences.',
    rfc: 'RFC 9110 §15.5.7',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 407,
    name: 'Proxy Authentication Required',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Client must first authenticate itself with the intermediate proxy before proceeding.',
    rfc: 'RFC 9110 §15.5.8',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 408,
    name: 'Request Timeout',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Server did not receive a complete request within the designated timeout window.',
    rfc: 'RFC 9110 §15.5.9',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 409,
    name: 'Conflict',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Request could not be completed due to a conflict with current state of the resource.',
    rfc: 'RFC 9110 §15.5.10',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 410,
    name: 'Gone',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Access to target resource is no longer available at origin server; permanently removed.',
    rfc: 'RFC 9110 §15.5.11',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 411,
    name: 'Length Required',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Server refuses to accept the request without a defined Content-Length header field.',
    rfc: 'RFC 9110 §15.5.12',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 412,
    name: 'Precondition Failed',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'One or more conditions given in request header fields evaluated to false on the server.',
    rfc: 'RFC 9110 §15.5.13',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 413,
    name: 'Payload Too Large',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Server refuses to process request because the request payload exceeds configured limits.',
    rfc: 'RFC 9110 §15.5.14',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 414,
    name: 'URI Too Long',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Server refuses to service request because request-target URI is longer than allowed.',
    rfc: 'RFC 9110 §15.5.15',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 415,
    name: 'Unsupported Media Type',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Origin server refuses to service request because payload format is in an unsupported format.',
    rfc: 'RFC 9110 §15.5.16',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 416,
    name: 'Range Not Satisfiable',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'None of the ranges in the request Range header overlap the extent of the selected resource.',
    rfc: 'RFC 9110 §15.5.17',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 417,
    name: 'Expectation Failed',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Expectation given in the Expect request header field could not be met by inbound server.',
    rfc: 'RFC 9110 §15.5.18',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 418,
    name: "I'm a teapot",
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Hyper Text Coffee Pot Control Protocol April Fools RFC standard joke.',
    rfc: 'RFC 2324 / RFC 9110',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 421,
    name: 'Misdirected Request',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Request was directed at a server that is not able to produce a response for this authority connection.',
    rfc: 'RFC 9110 §15.5.20',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 422,
    name: 'Unprocessable Content',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Server understands content type and syntax, but cannot process contained semantic instructions.',
    rfc: 'RFC 9110 §15.5.21',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 423,
    name: 'Locked',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'WebDAV: The source or destination resource of the method is currently locked.',
    rfc: 'RFC 4918 §11.3',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 424,
    name: 'Failed Dependency',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'WebDAV: The method failed because the action depended on another action that failed.',
    rfc: 'RFC 4918 §11.4',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 425,
    name: 'Too Early',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Server is unwilling to risk processing a request that might be replayed (0-RTT TLS).',
    rfc: 'RFC 8470',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 426,
    name: 'Upgrade Required',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Server refuses to perform request using current protocol until client upgrades (e.g. TLS or HTTP/2).',
    rfc: 'RFC 9110 §15.5.22',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 428,
    name: 'Precondition Required',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Origin server requires request to be conditional to prevent lost-update conflicts.',
    rfc: 'RFC 6585 §3',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 429,
    name: 'Too Many Requests',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'User has sent too many requests in a given amount of time (rate limiting triggered).',
    rfc: 'RFC 6585 §4',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 431,
    name: 'Request Header Fields Too Large',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Server is unwilling to process request because either an individual header or all headers are too large.',
    rfc: 'RFC 6585 §5',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    code: 451,
    name: 'Unavailable For Legal Reasons',
    category: '4xx',
    categoryName: '4xx Client Error',
    summary: 'Access to resource is denied as consequence of a legal demand, court order, or censorship.',
    rfc: 'RFC 7725',
    iconType: 'solo_parent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },

  // ==========================================
  // 5xx Server Error (Parents Icon)
  // ==========================================
  {
    code: 500,
    name: 'Internal Server Error',
    category: '5xx',
    categoryName: '5xx Server Error',
    summary: 'Server encountered an unexpected condition that prevented it from fulfilling the request.',
    rfc: 'RFC 9110 §15.6.1',
    iconType: 'parents',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    code: 501,
    name: 'Not Implemented',
    category: '5xx',
    categoryName: '5xx Server Error',
    summary: 'Server does not support the functionality required to fulfill the request.',
    rfc: 'RFC 9110 §15.6.2',
    iconType: 'parents',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    code: 502,
    name: 'Bad Gateway',
    category: '5xx',
    categoryName: '5xx Server Error',
    summary: 'Server while acting as gateway or proxy received an invalid response from inbound server.',
    rfc: 'RFC 9110 §15.6.3',
    iconType: 'parents',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    code: 503,
    name: 'Service Unavailable',
    category: '5xx',
    categoryName: '5xx Server Error',
    summary: 'Server currently unable to handle request due to temporary overloading or maintenance downtime.',
    rfc: 'RFC 9110 §15.6.4',
    iconType: 'parents',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    category: '5xx',
    categoryName: '5xx Server Error',
    summary: 'Server while acting as gateway did not receive timely response from upstream origin server.',
    rfc: 'RFC 9110 §15.6.5',
    iconType: 'parents',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    code: 505,
    name: 'HTTP Version Not Supported',
    category: '5xx',
    categoryName: '5xx Server Error',
    summary: 'Server does not support or refuses to support the major HTTP version used in request.',
    rfc: 'RFC 9110 §15.6.6',
    iconType: 'parents',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    code: 506,
    name: 'Variant Also Negotiates',
    category: '5xx',
    categoryName: '5xx Server Error',
    summary: 'Server internal configuration error: chosen variant resource engages in transparent negotiation.',
    rfc: 'RFC 2295 §8.1',
    iconType: 'parents',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    code: 507,
    name: 'Insufficient Storage',
    category: '5xx',
    categoryName: '5xx Server Error',
    summary: 'WebDAV: Server unable to store representation needed to complete the method request.',
    rfc: 'RFC 4918 §11.5',
    iconType: 'parents',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    code: 508,
    name: 'Loop Detected',
    category: '5xx',
    categoryName: '5xx Server Error',
    summary: 'WebDAV: Server terminated operation because it encountered an infinite loop.',
    rfc: 'RFC 5842 §7.2',
    iconType: 'parents',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    code: 510,
    name: 'Not Extended',
    category: '5xx',
    categoryName: '5xx Server Error',
    summary: 'Further extensions to request are required for the server to fulfill it.',
    rfc: 'RFC 2774 §7',
    iconType: 'parents',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    code: 511,
    name: 'Network Authentication Required',
    category: '5xx',
    categoryName: '5xx Server Error',
    summary: 'Client needs to authenticate to gain network access (e.g. Wi-Fi captive portal).',
    rfc: 'RFC 6585 §6',
    iconType: 'parents',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  }
];
