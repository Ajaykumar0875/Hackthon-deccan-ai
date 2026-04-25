"""Seed script — pushes candidates and users (with hashed passwords) to MongoDB."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from data.candidates import CANDIDATES
from data.users import USERS
from utils.password import hash_password
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

    # ── Seed candidates ──────────────────────────────────────────────────────
    col = db["candidates"]
    deleted = await col.delete_many({})
    print(f"[CLEAR] Removed {deleted.deleted_count} existing candidate(s)")
    result = await col.insert_many(CANDIDATES)
    print(f"[INSERT] {len(result.inserted_ids)} candidates inserted into '{DB_NAME}.candidates'")

    print("\n[PREVIEW] Candidates:")
    for c in CANDIDATES:
        print(f"   {c['id']} -- {c['name']:25s} | {c['experience_years']} yr | Rs.{c['expected_salary_inr']:,}")

    # ── Seed users (hash passwords) ──────────────────────────────────────────
    ucol = db["users"]
    udeleted = await ucol.delete_many({})
    print(f"\n[CLEAR] Removed {udeleted.deleted_count} existing user(s)")

    users_to_insert = []
    for u in USERS:
        doc = {
            "name":         u["name"],
            "email":        u["email"],
            "role":         u["role"],
            "password_hash": hash_password(u["plain_password"]),
            "created_at":   u["created_at"],
        }
        users_to_insert.append(doc)

    uresult = await ucol.insert_many(users_to_insert)
    print(f"[INSERT] {len(uresult.inserted_ids)} user(s) inserted into '{DB_NAME}.users'")

    print("\n[PREVIEW] Users:")
    for u in USERS:
        print(f"   {u['name']:20s} | {u['email']:38s} | role: {u['role']}")

    client.close()
    print("\n[DONE] Database seeded successfully!\n")
    print("  Admin password  : TOHRUHONDA@123")
    print("  Candidate password: Candidate@123\n")


if __name__ == "__main__":
    asyncio.run(seed())
