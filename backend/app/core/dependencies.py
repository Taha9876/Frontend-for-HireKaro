from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.models.company import Company

bearer_scheme = HTTPBearer()

def get_current_company(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> Company:
    token = credentials.credentials
    payload = verify_token(token, "access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    company = db.query(Company).filter(
        Company.id == int(payload["sub"])
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if not company.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    return company