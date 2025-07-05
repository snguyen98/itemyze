# Itemyze

Itemyze is a web app that scans receipts with OCR, itemizes them, and syncs shared expenses to Splitwise.

## 📚 Table of Contents

- [🛠 Features](#-features)
- [📁 Project Structure](#-project-structure)
- [⚙️ Setup](#️-setup)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [Environment Variables](#environment-variables)
  - [Running Itemyze](#running-itemyze)
  - [Creating New Users](#creating-new-users)
- [🚀 Usage](#-usage)
- [🙏 Acknowledgements](#-acknowledgements)

## 🛠 Features

- **Frontend:** React (TypeScript)
- **Backend:** Django (Python)
- **OCR:** Tesseract OCR (via `pytesseract`)
- **Deployment:** Docker (Linux / WSL), Nginx for production hosting
- **API Integration:** Splitwise API

## 📁 Project Structure
```
project_root/
├── docker/
│ ├── backend/
│ │ ├── Dockerfile.dev
│ │ └── Dockerfile.prod
│ ├── frontend/
│ │ ├── Dockerfile.dev
│ │ └── Dockerfile.prod
├── src/
│ ├── backend/
│ │ ├── itemyze/
│ │ │ ├── api/
│ │ │ ├── token_auth/
│ │ │ ├── itemyze/
│ │ │ │ ├── settings/
│ │ │ │ │ ├── base.py
│ │ │ │ │ ├── dev.py
│ │ │ │ │ └── prod.py
│ │ │ └── manage.py
│ ├── frontend/
│ │ ├── public/
│ │ ├── src/
│ │ ├── package.json
│ │ ├── tsconfig.json
│ │ └── webpack.config.js
├── Makefile
├── pyproject.toml
├── .env.dev
├── .env.prod
├── .prettierrc
├── .gitignore
├── .dockerignore
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── README.md
```
## ⚙️ Setup

### Prerequisites

- [Git](https://git-scm.com/downloads) — to clone the repository
- [Linux](https://www.kernel.org/) or [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Environment Variables

The app relies on environment variables for configuration. Here’s an overview of important groups and special notes:

- **Django Settings:**
  - `SECRET_KEY`: A critical secret for cryptographic signing in Django. It should be unique and kept private in production.  
    You can use the following guide to create one manually: [How to generate a Django SECRET_KEY](https://humberto.io/blog/tldr-generate-django-secret-key/).
  - `ALLOWED_HOSTS`: List of host/domain names your Django site can serve. For local testing with Docker Compose, this often includes service names like `backend` and `frontend`. In production, replace these with your actual domain names or IP addresses.
  - `DJANGO_SETTINGS_MODULE`: Specifies which Django settings file to use (`dev` or `prod`).

- **Nginx Server Name (`SERVER_NAME` in `.env.prod`):**  
  This should match the domain name or IP address your Nginx server is serving. For local setups, this can be `localhost`. For production, set this to your actual domain so Nginx can route requests properly.

- **Splitwise API Config:**  
  - `SW_API_KEY`, `SW_API_SECRET`, `SW_TOKEN_URL`: Credentials and endpoints required for syncing expenses with Splitwise.  
  - See [Splitwise API documentation](https://dev.splitwise.com/) for instructions on obtaining and configuring these.

- **Node Settings:** Configure the frontend environment, including hot reload in development.

- **Logging and Database:** Paths for log files and the SQLite database.

- **Tesseract Config:** Path and options for OCR scanning using Tesseract.

Refer to the `.env.dev.template` and `.env.prod.template` files for example values and full configuration.

### Database Setup

Before running the app, you need to apply database migrations and create a superuser account.

- For development:
  ```
  make migrate
  make createsuperuser
  ```
- For production:
  ```
  make migrate-prod
  make createsuperuser-prod
  ```
For more details on available Make commands, use:
```
make help
```
### Running Itemyze

Development mode:
Run make dev to start frontend and backend with hot reload and development settings.

Production mode:
Run make prod to build and deploy the app with production settings, using Docker and Nginx.

### Creating New Users

Once your superuser is created, you can log in to the Django admin site to create the end users. This is required for authentication with the main site:

- In development, visit:  
  `http://localhost:8000/admin`

- In production, visit:  
  `https://${SERVER_NAME}/admin`  
  *(where `SERVER_NAME` is the domain or IP configured for Nginx in your `.env.prod` file)*

For more details on using the Django admin interface, see the official tutorial:  
[https://docs.djangoproject.com/en/stable/ref/contrib/admin/#django.contrib.admin.AdminSite](https://docs.djangoproject.com/en/5.2/intro/tutorial02/)

## 🚀 Usage

### Home Page

The home page displays a list of all expenses.  
You can click on an existing expense to view or edit it, or use the **+** button to create a new expense.

  ![image](https://github.com/user-attachments/assets/4b91cfc6-2aae-4a91-aa51-c62fa8df9738)

### Creating an Expense

On the create expense page, you can:

- Enter a name for the expense.
- Select a Splitwise group to associate with this expense.
- Choose a user from the selected Splitwise group as the "Paid By" person (this links directly to Splitwise).
- Select a currency, which determines the currency symbol to look for in receipt scans.  
  *(Currently, only currencies with the symbol before the number are supported — this is a work in progress.)*

After creating, you’ll be redirected to the **View Expense** page.

  ![image](https://github.com/user-attachments/assets/11867c6c-603e-41c6-b1ed-9cb93b459fcd)

### Viewing and Editing an Expense

The **View Expense** page shows all details you entered for the expense.

- Click the **Edit** button in the top-right corner to modify expense details.
- The edit page looks identical to the create expense page and prepopulates each field with the current information.

  ![image](https://github.com/user-attachments/assets/715aa0a3-04ce-4a88-aba4-9653fed921eb)

### Itemising and Allocating Costs

Click the **Itemise** button on the **View Expense** page to start the itemisation and allocation workflow. It consists of four steps:

1. **Upload Receipt**  
   Upload a photo of your receipt. Only image uploads are allowed here.
   
    ![image](https://github.com/user-attachments/assets/69cb3719-007b-4a32-9d0d-44e1b9e5b412)

2. **View and Edit Items**  
   View the items detected by OCR.  
   You can add new items, edit existing ones, or remove items as needed.
   
    ![image](https://github.com/user-attachments/assets/a60bd286-2ef6-4efe-a913-cbc706187d24)

3. **Allocate Items**  
   Assign items to users using the following tools and options:  
   - Expand each item to view checkboxes for assigning it to specific users.  
   - A **remaining cost to allocate** is displayed at the bottom to track your progress.  
   - Click the **ℹ️ icon** next to it to view the current total allocations for each user.  
   - You can also use the **speed dial** in the bottom-right corner for additional allocation methods:  
     - **Allocate All:** Checks all user checkboxes for all items.  
     - **Allocate Multiple:** Allows bulk selection of specific users and specific items.  
     - **Reset:** Clears all allocation checkboxes.

    ![image](https://github.com/user-attachments/assets/8f0deaec-903a-4314-a778-4c74851d1aa7)

4. **Send to Splitwise**  
   Review the allocations and sync the expense to Splitwise.

## 🙏 Acknowledgements

- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) – Open-source OCR engine developed by Google, used via `pytesseract` for receipt scanning.
