from pydantic import BaseModel

# ✅ 设置总使用时长请求体
class UsageLimit(BaseModel):
    user_id: str
    duration_seconds: int

# ✅ 开始使用请求体（无模块名）
class StartUsage(BaseModel):
    user_id: str

# ✅ 更新使用记录请求体（无模块名）
class UsageUpdate(BaseModel):
    user_id: str
    additional_seconds: int
