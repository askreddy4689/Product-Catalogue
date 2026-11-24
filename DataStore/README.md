# DataStore

Content that the application reads but that is not code, so it can be changed without touching the
backend. It is organised like a document database such as MongoDB: each folder is a collection, and
each JSON file in it is one document.

Today it holds one document: the **enquiry email template**.

```
DataStore/
  emailTemplates/              the email templates "collection"
    enquiryToSales.json        the email the sales inbox gets for each enquiry
```

## The enquiry email template

`enquiryToSales.json` is a JSON object. Its `subject` and `body` are plain-text strings (line breaks
are written as `\n`):

```json
{
  "_id": "enquiry-to-sales",
  "description": "Sent to the sales inbox when a customer sends an enquiry. Reply-To is the customer.",
  "subject": "New enquiry: {{product.title}}",
  "body": "A customer has sent an enquiry about a product.\n\nPRODUCT\nName:  {{product.title}}\n..."
}
```

When the email is sent, the backend replaces each `{{placeholder}}` with the real value:

| Placeholder            | Example                                               |
| ---------------------- | ----------------------------------------------------- |
| `{{product.title}}`    | Mens Cotton Jacket                                    |
| `{{product.price}}`    | GBP 55.99                                             |
| `{{product.link}}`     | http://localhost:5173/products/3 (the product's page) |
| `{{product.id}}`       | 3                                                     |
| `{{customer.name}}`    | Jane Smith                                            |
| `{{customer.email}}`   | jane@example.com                                      |
| `{{customer.phone}}`   | 07700 900123, or "Not given"                          |
| `{{customer.message}}` | The customer's message, or "No message given."        |

### Changing the template

1. Edit `subject` or `body`. Keep it valid JSON: text inside double quotes, `\n` for a new line.
2. Spell placeholders exactly as listed above. If the template uses a placeholder the backend doesn't
   know, the backend refuses to start and says which one. The backend tests check the real template
   too: run `npm test` in the `Backend` folder.
3. That's all: the backend reads the template each time it sends an email.

The backend finds this folder by itself. To keep the template somewhere else, set
`EMAIL_TEMPLATES_DIR` in `Backend/.env`.
