# Django: Building Websites with Python

Django is a **web framework** for Python. A framework is a ready-made skeleton for an app, like the frame of a house: the walls and plumbing are already there, and you fill in the rooms. Django gives you the skeleton of a website, so you can spend your time on what makes *your* site special.

People call Django **"batteries included."** That means most things a website needs are already in the box: user logins, forms, a way to talk to the database, and even a free admin panel to manage your data. Instagram is famously built on it.

This course takes you from your first Django page to building, testing, and deploying real websites and APIs the way professionals do. There are 47 chapters in five levels. They go in order, and each one builds on the ones before it.

**Before you start:** finish at least Levels 1 to 3 of the [Python course](../Python/README.md), plus chapter 23 (pip and Virtual Environments). Django uses a lot of classes, so chapters 27 (Classes and Objects), 28 (Inheritance), and 32 (Decorators) matter most. A little HTML helps too. If tags like `<h1>` and `<a href="...">` are new to you, chapter 04 starts with a quick HTML refresher.

## Start here: how Django makes a page

Every time you visit a page on a Django site, four parts work together. Picture a restaurant:

| Part | What it does | In the restaurant |
| --- | --- | --- |
| **URL** | Matches the web address to the right view | The menu: each dish name leads to one recipe |
| **View** | A Python function that decides what to send back | The chef: takes the order and prepares the dish |
| **Model** | Describes your data, and fetches it from the database | The pantry: where the ingredients are stored |
| **Template** | An HTML page with gaps that get filled in | The plate: how the dish is served to you |

Here's the journey when you visit `/recipes/`:

```
You visit /recipes/
      ↓
  urls.py      finds the right view
      ↓
  views.py     asks the model for recipes
      ↓
  models.py    gets them from the database
      ↓
  template     fills them into an HTML page
      ↓
  The page appears in your browser
```

Don't worry if this feels fuzzy right now. Chapters 03 to 06 explain each part properly.

## How to use this folder

1. **Read** the chapter's `notes.md`.
2. **Type every example yourself** in your practice project (set up in chapter 01). Don't copy and paste.
3. **Do the exercises** in `exercises.md`. Try on your own before you open a hint.
4. **Ask Claude to check your work** when you're done or stuck.
5. **Tick the chapter off** below (change `[ ]` to `[x]`).

**What you need:** Python 3.12 or newer, VS Code with the Python extension, and a web browser. Chapter 01 creates a virtual environment and installs Django. You don't need to install a database at first: Django uses SQLite, which comes built into Python. You'll switch to PostgreSQL in chapter 23.

**Django first, then packages:** Django does a lot on its own. For a few jobs, like building APIs, most teams add extra packages. You'll always learn what Django gives you first, then the package. That way you know what problem each package solves.

**Versions:** this course is written for Django 6.0 or newer. A new version of Django comes out about every 8 months. Every few releases, one is marked **LTS** (long-term support), which means it gets security fixes for about 3 years. Django 5.2 is the current LTS, and almost everything in this course works on it too. When a chapter uses something new in Django 6, it will say so.

**Projects:** five chapters are projects where you build something real. Some come with a `starter/` folder, so you can focus on the Django parts.

---

## Level 1: Your First Django Site

*Goal: understand how a web address becomes a page, and build a small site that shows data from a database.*

- [ ] [01 Getting Started](01-getting-started/notes.md): what Django is, how it compares to FastAPI, and your first running site
- [ ] [02 Projects and Apps](02-projects-and-apps/notes.md): `startproject` vs. `startapp`, and what every generated file is for
- [ ] [03 URLs and Views](03-urls-and-views/notes.md): sending each web address to the Python function that answers it
- [ ] [04 Templates](04-templates/notes.md): building HTML pages with `{{ }}` and `{% %}`, plus a quick HTML refresher
- [ ] [05 Template Inheritance and Static Files](05-template-inheritance-and-static-files/notes.md): one shared layout for every page, plus your CSS and images
- [ ] [06 Models](06-models/notes.md): describing your data as Python classes
- [ ] [07 Migrations](07-migrations/notes.md): how Django turns your models into database tables, and changes them safely later
- [ ] [08 The Django Admin](08-the-django-admin/notes.md): a free control panel for adding, editing, and deleting your data
- [ ] [09 QuerySets and the ORM](09-querysets-and-the-orm/notes.md): getting and filtering data in Python instead of SQL
- [ ] [10 Detail Pages and Links](10-detail-pages-and-links/notes.md): a page for each item, "404 Not Found" pages, and linking pages with `{% url %}`
- [ ] [11 Project: Recipe Book](11-project-recipe-book/notes.md): a site that lists recipes, with a page for each one, managed from the admin

## Level 2: Forms, Users and Connected Data

*Goal: let visitors send you data, sign in, and own their own things.*

- [ ] [12 Forms](12-forms/notes.md): getting data from visitors safely, and why every form needs a CSRF token (a secret that proves the form came from your own site)
- [ ] [13 Model Forms](13-model-forms/notes.md): forms built straight from your models, for adding and editing data
- [ ] [14 Model Relationships](14-model-relationships/notes.md): linking data together, like authors and books, or students and classes
- [ ] [15 Advanced Queries](15-advanced-queries/notes.md): "this OR that" searches, counting, averages, and sorting with `Q`, `F`, and `annotate`
- [ ] [16 Class-Based Views](16-class-based-views/notes.md): `ListView`, `DetailView`, `CreateView`, and writing less repeated code
- [ ] [17 Messages and Pagination](17-messages-and-pagination/notes.md): "Saved!" notes for the user, and splitting long lists into pages
- [ ] [18 User Accounts](18-user-accounts/notes.md): sign up, log in, log out, and password reset with Django's built-in tools
- [ ] [19 Permissions](19-permissions/notes.md): pages only logged-in users can see, and only letting owners edit their own things
- [ ] [20 File Uploads](20-file-uploads/notes.md): profile pictures and documents, and where Django keeps them
- [ ] [21 Project: Library System](21-project-library-system/notes.md): your Python library system, rebuilt as a website with members, logins, and loans

## Level 3: Building Like a Pro

*Goal: set up projects the way real teams do, test them, and keep them fast.*

**Before chapter 23:** Levels 1 to 3 of the [PostgreSQL course](../PostgreSQL/README.md) will help.

- [ ] [22 Settings and Secrets](22-settings-and-secrets/notes.md): keeping passwords out of your code, and different settings for your laptop and your server
- [ ] [23 PostgreSQL with Django](23-postgresql-with-django/notes.md): moving from SQLite to a real database server
- [ ] [24 Custom User Model](24-custom-user-model/notes.md): why every new project should start with one, and how to set it up on day one
- [ ] [25 Sessions and Cookies](25-sessions-and-cookies/notes.md): how a site remembers you from page to page, like items in a shopping cart
- [ ] [26 Custom Template Tags and Filters](26-custom-template-tags-and-filters/notes.md): adding your own tools to templates
- [ ] [27 Testing Django](27-testing-django/notes.md): checking your models, views, and forms with Django's test tools and pytest
- [ ] [28 Query Performance](28-query-performance/notes.md): why a page can secretly run hundreds of database queries, and how to fix it
- [ ] [29 Signals](29-signals/notes.md): running code automatically when data is saved or deleted, and when not to
- [ ] [30 Management Commands](30-management-commands/notes.md): your own `python manage.py` commands, like loading sample data
- [ ] [31 Sending Email](31-sending-email/notes.md): welcome emails and password resets, sent for real
- [ ] [32 Project: Online Store](32-project-online-store/notes.md): products, a cart, checkout, and order emails, all tested

## Level 4: APIs and Modern Front Ends

*Goal: let other apps talk to your Django site, and make your pages feel fast and interactive.*

**Before chapter 37:** Levels 1 and 2 of the [React course](../React/README.md). If you did Python chapter 43 (FastAPI), you'll see how Django solves the same problems in its own way.

- [ ] [33 REST APIs with Django REST Framework](33-rest-apis-with-drf/notes.md): what an API is, turning models into JSON, and your first endpoint
- [ ] [34 ViewSets and Routers](34-viewsets-and-routers/notes.md): a full set of create, read, update, and delete endpoints with very little code
- [ ] [35 API Authentication and Permissions](35-api-authentication-and-permissions/notes.md): tokens, logins, and who's allowed to do what through your API
- [ ] [36 Filtering, Pagination and API Docs](36-filtering-pagination-and-api-docs/notes.md): search and sort for your API, plus docs that write themselves
- [ ] [37 Connecting a React Front End](37-connecting-a-react-front-end/notes.md): CORS (the browser rule about which sites may call your API), and your React app talking to Django
- [ ] [38 htmx and Template Partials](38-htmx-and-template-partials/notes.md): updating part of a page without reloading it, and with almost no JavaScript
- [ ] [39 Background Tasks](39-background-tasks/notes.md): doing slow jobs, like sending emails, without making users wait
- [ ] [40 Project: Task Board API](40-project-task-board-api/notes.md): a real Django back end for your React Task Board (React chapter 37)

## Level 5: Mastery

*Goal: understand how Django works under the hood, keep your site safe, and ship it.*

- [ ] [41 How a Request Travels Through Django](41-how-a-request-travels/notes.md): the full journey from your browser to Django and back, step by step
- [ ] [42 Middleware](42-middleware/notes.md): code that runs on every request, like a security guard checking everyone at the door
- [ ] [43 Caching](43-caching/notes.md): remembering slow answers so pages load faster
- [ ] [44 Async Django and WebSockets](44-async-django-and-websockets/notes.md): async views, and live features like chat with Django Channels
- [ ] [45 Security](45-security/notes.md): the common attacks on websites, how Django blocks them, and the deploy checklist
- [ ] [46 Deploying](46-deploying/notes.md): putting your site online with Gunicorn, WhiteNoise, Docker, and a cloud host
- [ ] [47 Final Project](47-final-project/notes.md): build something of your own, from start to finish

---

**After this:** Wagtail is a content management system (a tool for running blogs and news sites) built on Django, and it's a natural next step. Django Ninja is a newer way to build APIs that will feel familiar if you liked FastAPI. Each could get its own folder.
