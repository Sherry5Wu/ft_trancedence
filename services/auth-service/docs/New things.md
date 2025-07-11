# Table
-[CORS](#cors)

# CORS
## What is CORS?
CORS (Cross-Origin Resource Sharing) is a security mechanism implemented by web browsers to control how web pages from one origin (domain, protocol, or port) can request resources from a different origin. It relies on HTTP headers to allow or block cross-origin requests.<br>

## Why is CORS Needed?
Browsers enforce the Same-Origin Policy (SOP), which restricts web pages from making requests to a different origin unless explicitly allowed. CORS provides a way for servers to relax this restriction securely. <br>

## Real-World Example
Suppose your frontend is hosted at:
```arduino
https://my-frontend.com
```
And it tries to make a request to:
```arduino
https://api.other-backend.com/data
```
Using JavaScript:
```js
fetch('https://api.other-backend.com/data');
```
The browser sees that the origin is different, so it checks if the server at `api.other-backend.com` allows this request.

If not, the browser blocks the request — this is a CORS error.

## How to fix CORS errors?
The backend must explicitly allow cross-origin requests by including specific headers in the response.<br>
Common example:
```http
Access-Control-Allow-Origin: https://my-frontend.com
```
## Other Important Headers
| Header                             | Purpose                                |
| ---------------------------------- | -------------------------------------- |
| `Access-Control-Allow-Origin`      | Specifies which origin(s) are allowed  |
| `Access-Control-Allow-Methods`     | Allowed HTTP methods (GET, POST, etc.) |
| `Access-Control-Allow-Headers`     | Allowed custom headers in requests     |
| `Access-Control-Allow-Credentials` | Allows cookies/auth to be sent         |

