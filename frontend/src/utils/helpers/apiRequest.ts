import axiosInstance from "./axiosInstance";

/**
 * Common API request function for all HTTP methods (GET, POST, PUT, DELETE)
 *
 * @template TResponse - Expected response data type
 * @template TBody - Optional request body type
 *
 * @param {Object} config - Request configuration
 * @param {'get' | 'post' | 'put' | 'delete'} config.method - HTTP method
 * @param {string} config.url - API endpoint (relative to baseURL)
 * @param {TBody} [config.body] - Request payload for POST/PUT
 * @param {Record<string, any>} [config.params] - Query parameters
 * @param {Record<string, string>} [config.headers] - Custom headers
 *
 * @returns {Promise<TResponse>} - The response data
 */
const apiRequest = async <TResponse = unknown, TBody = unknown>({
  method,
  url,
  body,
  params,
  headers,
}: {
  method: "get" | "post" | "put" | "delete";
  url: string;
  body?: TBody;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}): Promise<TResponse> => {
  const response = await axiosInstance.request<TResponse>({
    method,
    url,
    data: body,
    params,
    headers,
  });

  return response.data;
};

export default apiRequest;
