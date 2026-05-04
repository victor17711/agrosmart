"""Telegram notification helper. Sends non-blocking messages to a Telegram chat."""
import os
import logging
import httpx

logger = logging.getLogger(__name__)


async def send_telegram_message(text: str) -> bool:
    """Send a message to the configured Telegram chat.

    Returns True on success, False on any failure (logs the error but never raises).
    Uses HTML parse mode for simple formatting.
    """
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")

    if not bot_token or not chat_id:
        logger.warning("Telegram credentials not configured; skipping notification.")
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(url, json=payload)
            if r.status_code == 200 and r.json().get("ok"):
                return True
            logger.error("Telegram API returned non-OK: %s %s", r.status_code, r.text[:300])
            return False
    except Exception as exc:
        logger.exception("Failed to send Telegram message: %s", exc)
        return False


def _escape_html(text: str) -> str:
    """Escape minimal HTML-unsafe chars for Telegram HTML parse mode."""
    if text is None:
        return ""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def _payment_method_label(code: str) -> str:
    """Translate internal payment code to a human-readable Romanian label."""
    return {
        "cash_on_delivery": "Cash la curier",
        "card_on_delivery": "Card la curier",
        "bank_transfer": "Transfer bancar",
    }.get((code or "").lower(), code or "—")


def format_order_message(order) -> str:
    """Format an Order object (or dict) as a nice HTML Telegram message in Romanian."""
    if hasattr(order, "dict"):
        o = order.dict()
    else:
        o = dict(order)

    short_id = (o.get("id") or "")[:8].upper()
    name = _escape_html(o.get("customerName", ""))
    phone = _escape_html(o.get("customerPhone", ""))
    email = _escape_html(o.get("customerEmail", ""))
    total = o.get("totalAmount", 0)
    payment = _escape_html(_payment_method_label(o.get("paymentMethod", "")))

    addr = o.get("shippingAddress") or {}
    addr_line = ", ".join(
        filter(
            None,
            [
                _escape_html(addr.get("address", "")),
                _escape_html(addr.get("city", "")),
                _escape_html(addr.get("postalCode", "")),
            ],
        )
    )
    notes = _escape_html(addr.get("notes", "")).strip()

    items = o.get("items", []) or []
    items_block = "\n".join(
        [
            f"  • {_escape_html(it.get('name',''))} × {it.get('quantity',1)} — "
            f"{it.get('price',0):.2f} MDL"
            for it in items
        ]
    ) or "  (fără produse)"

    msg = (
        f"🛒 <b>Comandă nouă</b> #{short_id}\n"
        f"━━━━━━━━━━━━━━━━━\n"
        f"👤 <b>Client:</b> {name}\n"
        f"📞 <b>Telefon:</b> {phone}\n"
        f"✉️ <b>Email:</b> {email}\n"
        f"📍 <b>Adresă:</b> {addr_line or '—'}\n"
    )
    if notes:
        msg += f"📝 <b>Notițe:</b> {notes}\n"
    msg += (
        f"━━━━━━━━━━━━━━━━━\n"
        f"📦 <b>Produse ({len(items)}):</b>\n{items_block}\n"
        f"━━━━━━━━━━━━━━━━━\n"
        f"💰 <b>Total:</b> {total:.2f} MDL\n"
        f"💳 <b>Plată:</b> {payment}"
    )
    return msg
