# Copyright: Ankitects Pty Ltd and contributors
# License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

from typing import cast
from unittest.mock import MagicMock

import pytest

from aqt.main import AnkiQt


@pytest.mark.parametrize("name", ["addons21", "Addons21", "ADDONS21"])
def test_profile_name_rejects_addon_folder(name: str) -> None:
    window = cast(AnkiQt, MagicMock(spec=AnkiQt))

    assert AnkiQt.profileNameOk(window, name) is False


@pytest.mark.parametrize("name", ["Personal", "Study 2026", "addons21 notes"])
def test_profile_name_accepts_normal_names(name: str) -> None:
    window = cast(AnkiQt, MagicMock(spec=AnkiQt))

    assert AnkiQt.profileNameOk(window, name) is True


def test_periodic_backup_requests_backup_normally() -> None:
    window = MagicMock(spec=AnkiQt)
    window.restoring_backup = False

    AnkiQt.on_periodic_backup_timer(window)

    window._create_backup_with_progress.assert_called_once_with(user_initiated=False)


def test_recovery_skips_automatic_backups_but_allows_manual_backup() -> None:
    window = MagicMock(spec=AnkiQt)
    window.restoring_backup = True

    AnkiQt.on_periodic_backup_timer(window)

    window._create_backup_with_progress.assert_not_called()

    AnkiQt.on_create_backup_now(window)

    window._create_backup_with_progress.assert_called_once_with(user_initiated=True)
