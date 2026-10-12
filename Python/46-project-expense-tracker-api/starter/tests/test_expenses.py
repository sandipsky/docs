# Expense Tracker API: tests/test_expenses.py
# ============================================
# Automatic tests for the whole API. They can only pass once milestones 1 to 4
# work. Run them from the project folder (not from inside tests) with:
#     python -m pytest
#
# Milestone 8: Read the fixture below until it makes sense, then add your own
#              tests at the bottom of this file. The notes suggest which ones.

import sqlite3
from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import database
from app.main import app

# A valid expense, as the JSON a client would send.
LUNCH = {
    "description": "Lunch with Maya",
    "amount_cents": 1450,
    "category": "food",
    "spent_on": "2026-10-03",
}


@pytest.fixture
def client(tmp_path: Path) -> Iterator[TestClient]:
    """A TestClient for the app, with a new, empty database for each test."""
    # tmp_path is a fresh temporary folder that pytest makes for every test.
    # The override tells FastAPI: "whenever an endpoint asks for get_db,
    # call get_test_db instead". So the tests never touch expenses.db.
    test_db = tmp_path / "test.db"

    def get_test_db() -> Iterator[sqlite3.Connection]:
        con = database.connect(test_db)
        try:
            yield con
        finally:
            con.close()

    app.dependency_overrides[database.get_db] = get_test_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_expense(client: TestClient) -> None:
    response = client.post("/expenses", json=LUNCH)
    assert response.status_code == 201
    assert response.json() == {**LUNCH, "id": 1}


def test_new_database_is_empty(client: TestClient) -> None:
    response = client.get("/expenses")
    assert response.status_code == 200
    assert response.json() == []


def test_read_missing_expense_gives_404(client: TestClient) -> None:
    response = client.get("/expenses/99")
    assert response.status_code == 404
    assert response.json() == {"detail": "Expense 99 not found"}


# Milestone 8: your tests go here.
