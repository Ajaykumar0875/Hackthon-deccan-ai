"""Seed script — pushes candidates and users to MongoDB."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from data.candidates import CANDIDATES
from data.users import USERS
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "talentscout"


async def seed():
    print("\n[*] Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGODB_URI)
    await client.admin.command("ping")
    print("[OK] Connected to MongoDB Atlas\n")

    db = client[DB_NAME]

    # ── Seed candidates ───────────────────────────────────────────────────────
    col = db["candidates"]
    deleted = await col.delete_many({})
    print(f"[CLEAR] Removed {deleted.deleted_count} existing candidate(s)")
    result = await col.insert_many(CANDIDATES)
    print(f"[INSERT] {len(result.inserted_ids)} candidates inserted into '{DB_NAME}.candidates'")

    print("\n[PREVIEW] Candidates:")
    for c in CANDIDATES:
        print(f"   {c['id']} -- {c['name']:25s} | {c['experience_years']} yr | Rs.{c['expected_salary_inr']:,}")

    # ── Seed users ────────────────────────────────────────────────────────────
    ucol = db["users"]
    udeleted = await ucol.delete_many({})
    print(f"\n[CLEAR] Removed {udeleted.deleted_count} existing user(s)")
    uresult = await ucol.insert_many(USERS)
    print(f"[INSERT] {len(uresult.inserted_ids)} user(s) inserted into '{DB_NAME}.users'")

    print("\n[PREVIEW] Users:")
    for u in USERS:
        print(f"   {u['name']:20s} | {u['email']:35s} | role: {u['role']}")

    client.close()
    print("\n[DONE] Database seeded successfully!\n")


if __name__ == "__main__":
    asyncio.run(seed())
