"""User accounts for KizunaHire — admin + all 25 candidate users."""
from datetime import datetime

_now = datetime.utcnow().isoformat()

USERS = [
    # ── Admin ──────────────────────────────────────────────────────────────────
    {
        "name": "Ajay",
        "email": "ajay.grandhisila@gmail.com",
        "role": "admin",
        "created_at": _now,
    },

    # ── Candidates (mirrors candidates.py) ─────────────────────────────────────
    {"name": "Naruto Uzumaki",     "email": "naruto.uzumaki@gmail.com",     "role": "candidate", "created_at": _now},
    {"name": "Mikasa Ackerman",    "email": "mikasa.ackerman@gmail.com",    "role": "candidate", "created_at": _now},
    {"name": "Levi Ackerman",      "email": "levi.ackerman@gmail.com",      "role": "candidate", "created_at": _now},
    {"name": "Erza Scarlet",       "email": "erza.scarlet@gmail.com",       "role": "candidate", "created_at": _now},
    {"name": "Killua Zoldyck",     "email": "killua.zoldyck@gmail.com",     "role": "candidate", "created_at": _now},
    {"name": "Hinata Hyuga",       "email": "hinata.hyuga@gmail.com",       "role": "candidate", "created_at": _now},
    {"name": "Sasuke Uchiha",      "email": "sasuke.uchiha@gmail.com",      "role": "candidate", "created_at": _now},
    {"name": "Rem Rezero",         "email": "rem.rezero@gmail.com",         "role": "candidate", "created_at": _now},
    {"name": "Gon Freecss",        "email": "gon.freecss@gmail.com",        "role": "candidate", "created_at": _now},
    {"name": "Nobara Kugisaki",    "email": "nobara.kugisaki@gmail.com",    "role": "candidate", "created_at": _now},
    {"name": "Tanjiro Kamado",     "email": "tanjiro.kamado@gmail.com",     "role": "candidate", "created_at": _now},
    {"name": "Zero Two",           "email": "zero.two@gmail.com",           "role": "candidate", "created_at": _now},
    {"name": "Itadori Yuji",       "email": "itadori.yuji@gmail.com",       "role": "candidate", "created_at": _now},
    {"name": "Yor Forger",         "email": "yor.forger@gmail.com",         "role": "candidate", "created_at": _now},
    {"name": "Shoyo Hinata",       "email": "shoyo.hinata@gmail.com",       "role": "candidate", "created_at": _now},
    {"name": "Megumin Explosion",  "email": "megumin.explosion@gmail.com",  "role": "candidate", "created_at": _now},
    {"name": "Edward Elric",       "email": "edward.elric@gmail.com",       "role": "candidate", "created_at": _now},
    {"name": "Aqua Goddess",       "email": "aqua.goddess@gmail.com",       "role": "candidate", "created_at": _now},
    {"name": "Kazuto Kirigaya",    "email": "kazuto.kirigaya@gmail.com",    "role": "candidate", "created_at": _now},
    {"name": "Asuna Yuuki",        "email": "asuna.yuuki@gmail.com",        "role": "candidate", "created_at": _now},
    {"name": "Rock Lee",           "email": "rock.lee@gmail.com",           "role": "candidate", "created_at": _now},
    {"name": "Violet Evergarden",  "email": "violet.evergarden@gmail.com",  "role": "candidate", "created_at": _now},
    {"name": "Shoto Todoroki",     "email": "shoto.todoroki@gmail.com",     "role": "candidate", "created_at": _now},
    {"name": "Nami Weatheria",     "email": "nami.weatheria@gmail.com",     "role": "candidate", "created_at": _now},
    {"name": "Sanji Vinsmoke",     "email": "sanji.vinsmoke@gmail.com",     "role": "candidate", "created_at": _now},
]


def get_all_users() -> list[dict]:
    return USERS


def get_user_by_email(email: str) -> dict | None:
    return next((u for u in USERS if u["email"].lower() == email.lower()), None)
