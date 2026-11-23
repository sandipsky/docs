# Issue 1: Member charged a late fee on the due date

**Type:** bug
**Reported by:** Priya, front desk

## What happened

Maya borrowed *Dune* on 2 March. It was due on 16 March. She brought it back on 16 March at about 3:30 in the afternoon, and the system charged her **$0.50**.

She was not happy, and she is right. Our rule has always been that a book returned at any time on its due date is on time.

## What I expected

A fee of **$0.00**.

## Details from the system

```
borrowedOn:  2026-03-02
dueOn:       2026-03-16
returnedAt:  2026-03-16T15:30:00Z
fee charged: 0.5
```

## Other notes

I have seen this a few times now, always with afternoon returns. I think morning returns on the due date are fine, but I haven't checked properly.
