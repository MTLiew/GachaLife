import os
import httpx
from jose import jwt, JWTError
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHMS = ["RS256"]

security = HTTPBearer()

def get_jwks():
    url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    response = httpx.get(url)
    return response.json()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        jwks = get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Invalid token key")

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/",
        )
        return payload

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def get_optional_user(credentials: HTTPAuthorizationCredentials = Security(HTTPBearer(auto_error=False))):
    """Returns the token payload if authenticated, None if not."""
    if credentials is None:
        return None
    try:
        return verify_token(credentials)
    except HTTPException:
        return None