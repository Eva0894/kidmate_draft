from fastapi import APIRouter, HTTPException
from services.db import supabase
from models.schemas import UsageLimit, StartUsage, UsageUpdate
from postgrest.exceptions import APIError
from datetime import date
from pydantic import BaseModel

router = APIRouter()

# ✅ 临时调试接口（不连接数据库，只打印）
class UsageLimitRequest(BaseModel):
    user_id: str
    duration_seconds: int

@router.post("/usage-limits/test")
def test_usage_limit(payload: UsageLimitRequest):
    print(f"🧪 [DEBUG] Received usage limit: user_id={payload.user_id}, duration={payload.duration_seconds}")
    return {"message": "✅ Received usage limit successfully"}


# ✅ 设置总使用时长（正式逻辑）
@router.post("/usage-limits")
def set_usage_limits(limit: UsageLimit):
    today = str(date.today())

    # 1. 设置总时长
    response = supabase.table('usage_limits').upsert({
        "user_id": limit.user_id,
        "duration_seconds": limit.duration_seconds
    }).execute()

    # 2. 清除今天的使用记录（重置 used_seconds）
    supabase.table('usage_records')\
        .delete()\
        .eq("user_id", limit.user_id)\
        .eq("usage_date", today)\
        .execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to set usage limit")

    return {"status": "success", "data": response.data}


# ✅ 启动使用记录（每天一次）
@router.post("/start-usage")
def start_usage(session: StartUsage):
    today = str(date.today())
    try:
        record_response = supabase.table('usage_records').select("*")\
            .eq("user_id", session.user_id)\
            .eq("usage_date", today).maybe_single().execute()

        if record_response and record_response.data:
            return {"status": "session already exists"}

        insert_response = supabase.table('usage_records').insert({
            "user_id": session.user_id,
            "used_seconds": 0,
            "usage_date": today,
        }).execute()

        return {"status": "session created", "data": insert_response.data}

    except Exception as e:
        print(f"❌ Error in start-usage: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


# ✅ 累加使用时长
@router.post("/update-usage")
def update_usage(update: UsageUpdate):
    today = str(date.today())
    record_response = supabase.table('usage_records').select("*")\
        .eq("user_id", update.user_id)\
        .eq("usage_date", today).maybe_single().execute()

    record = record_response.data
    if not record:
        raise HTTPException(status_code=404, detail="Usage session not found. Please start session first.")

    new_used = record.get("used_seconds", 0) + update.additional_seconds
    supabase.table('usage_records').update({"used_seconds": new_used})\
        .eq("user_id", update.user_id)\
        .eq("usage_date", today).execute()

    return {"status": "updated", "new_used_seconds": new_used}


# ✅ 查询总使用状态
@router.get("/users/{user_id}/usage-status")
def get_usage_status(user_id: str):
    today = str(date.today())

    try:
        limit_response = supabase.table('usage_limits').select("*")\
            .eq("user_id", user_id).maybe_single().execute()
        limit = limit_response.data

        if not limit:
            raise HTTPException(status_code=404, detail="No usage limit found for this user.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error (limits): {e}")

    try:
        used_response = supabase.table('usage_records').select("*")\
            .eq("user_id", user_id)\
            .eq("usage_date", today).maybe_single().execute()

        used = used_response.data if used_response else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error (records): {e}")

    used_seconds = used["used_seconds"] if used else 0
    remaining = limit["duration_seconds"] - used_seconds
    allowed = remaining > 0

    return {
        "allowed": allowed,
        "remaining_seconds": max(remaining, 0),
        "used_seconds": used_seconds
    }


# ✅ 查询 PIN 码
@router.get("/users/{user_id}/pin-code")
def get_pin_code(user_id: str):
    try:
        response = supabase.table('users').select("pin_code")\
            .eq("user_id", user_id).maybe_single().execute()
        if not response or not response.data:
            raise HTTPException(status_code=404, detail="No user found or pin not set.")
        return {"pin_code": response.data["pin_code"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
