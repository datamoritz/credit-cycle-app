import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Credit Cycle Backend")

API_SECRET = os.getenv("API_SECRET", "")
DATABASE_URL = os.getenv("DATABASE_URL", "")


def verify_auth(authorization: str | None):
    if authorization != f"Bearer {API_SECRET}":
        raise HTTPException(status_code=401, detail="Unauthorized")


def get_conn():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


class StatementCreate(BaseModel):
    cardId: str
    statementMonth: str
    closingDate: str
    dueDate: str
    statementBalance: float
    minimumPayment: Optional[float] = 0.0
    paidInFull: bool = False
    paidDate: Optional[str] = None


class StatementPatch(BaseModel):
    additionalPayment: float
    paidDate: str


def normalize_statement_create(payload: dict) -> StatementCreate:
    return StatementCreate(
        cardId=payload.get("cardId") or payload.get("card_id"),
        statementMonth=payload.get("statementMonth") or payload.get("statement_month"),
        closingDate=payload.get("closingDate") or payload.get("closing_date"),
        dueDate=payload.get("dueDate") or payload.get("due_date"),
        statementBalance=payload.get("statementBalance") or payload.get("statement_balance"),
        minimumPayment=payload.get("minimumPayment", payload.get("minimum_payment", 0.0)),
        paidInFull=payload.get("paidInFull", payload.get("paid_in_full", False)),
        paidDate=payload.get("paidDate", payload.get("paid_date")),
    )


def normalize_statement_patch(payload: dict) -> StatementPatch:
    return StatementPatch(
        additionalPayment=payload.get("additionalPayment") or payload.get("additional_payment"),
        paidDate=payload.get("paidDate") or payload.get("paid_date"),
    )


@app.get("/health")
def health():
    return {"ok": True, "service": "credit-cycle-backend"}


@app.get("/cards")
def get_cards(authorization: str | None = Header(None)):
    verify_auth(authorization)
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT
            id,
            name,
            issuer,
            last4,
            color,
            credit_limit,
            apr,
            auto_pay,
            rewards,
            active_since,
            statement_close_day,
            due_day,
            posting_buffer_days,
            next_close_date,
            next_due_date,
            recommended_pay_by_date
        FROM credit_cards
        ORDER BY
            CASE id
                WHEN 'amex' THEN 1
                WHEN 'discover' THEN 2
                WHEN 'united' THEN 3
                WHEN 'walgreens' THEN 4
                ELSE 99
            END
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"cards": rows}


@app.post("/statements", status_code=201)
def create_statement(
    payload: dict,
    authorization: str | None = Header(None),
):
    verify_auth(authorization)
    stmt = normalize_statement_create(payload)
    conn = get_conn()
    cur = conn.cursor()

    statement_id = f"{stmt.cardId}-{stmt.statementMonth}"
    remaining = 0.0 if stmt.paidInFull else stmt.statementBalance
    paid_amount = stmt.statementBalance if stmt.paidInFull else 0.0
    status = "paid_in_full" if stmt.paidInFull else "unpaid"

    cur.execute(
        """
        INSERT INTO statements
            (id, card_id, statement_month, closing_date, due_date,
             statement_balance, minimum_payment,
             paid_amount, paid_date, remaining_amount, status, is_projected)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, false)
        RETURNING id
        """,
        (
            statement_id,
            stmt.cardId,
            stmt.statementMonth,
            stmt.closingDate,
            stmt.dueDate,
            stmt.statementBalance,
            stmt.minimumPayment,
            paid_amount,
            stmt.paidDate,
            remaining,
            status,
        ),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return {"ok": True, "id": row["id"]}


@app.patch("/statements/{statement_id}")
def update_statement(
    statement_id: str,
    payload: dict,
    authorization: str | None = Header(None),
):
    verify_auth(authorization)
    patch = normalize_statement_patch(payload)

    if patch.additionalPayment <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero")

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT statement_balance, paid_amount
        FROM statements
        WHERE id = %s
        """,
        (statement_id,),
    )
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Not Found")

    statement_balance = float(row["statement_balance"] or 0.0)
    current_paid = float(row["paid_amount"] or 0.0)
    new_paid_amount = current_paid + patch.additionalPayment

    if new_paid_amount > statement_balance + 0.005:
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Payment exceeds statement balance")

    remaining_amount = max(statement_balance - new_paid_amount, 0.0)
    status = "paid_in_full" if remaining_amount <= 0.005 else "partially_paid"

    cur.execute(
        """
        UPDATE statements
        SET
            paid_amount = %s,
            paid_date = %s,
            remaining_amount = %s,
            status = %s
        WHERE id = %s
        RETURNING id, paid_amount, paid_date, remaining_amount, status
        """,
        (
            new_paid_amount,
            patch.paidDate,
            remaining_amount,
            status,
            statement_id,
        ),
    )
    updated = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return {"ok": True, "statement": updated}


@app.get("/statements")
def get_statements(authorization: str | None = Header(None)):
    verify_auth(authorization)
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT
            id,
            card_id,
            statement_month,
            closing_date,
            due_date,
            statement_balance,
            minimum_payment,
            paid_amount,
            paid_date,
            remaining_amount,
            status,
            is_projected
        FROM statements
        ORDER BY due_date
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"statements": rows}
