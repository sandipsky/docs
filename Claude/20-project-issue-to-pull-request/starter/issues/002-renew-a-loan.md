# Issue 2: Let members renew a loan

**Type:** feature request
**Requested by:** Tomás, head librarian

## The problem

Members often need a little longer with a book. Today the only way is to return it and borrow it again, which means a trip to the library.

## What we want

A way to renew a loan, so the member keeps the book for another 14 days.

## The rules

A renewal is done when all of these are true:

- Renewing moves the due date **14 days after the current due date** (not 14 days after today).
- A loan can be renewed **only once**. A second try is refused with a clear message.
- A loan that is **already overdue** cannot be renewed. The member has to return the book.
- Renewing **on the due date** is allowed.
- A loan that has **already been returned** cannot be renewed.
- The loan records how many times it has been renewed.
- The late fee still works correctly for a renewed loan. It is counted from the new due date.

## Out of scope

- Renewing by email or text message.
- Different rules for different kinds of books.
