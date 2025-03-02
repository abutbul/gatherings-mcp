# Gatherings

A command-line tool for managing friend gatherings and expense sharing.

## Overview

Gatherings helps you track expenses and payments for social events with friends. It manages the entire lifecycle of a gathering:

1. **Creation**: Define the gathering date, type, and number of members
2. **Update**: Add expenses for named members
3. **Reimbursement**: Calculate how much each member owes or is owed
4. **Payment**: Track payments and reimbursements
5. **Closure**: Close the gathering when all balances are settled

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd gatherings
   ```

2. Create a virtual environment and install dependencies:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Run the application:
   ```
   python gatherings.py
   ```

## Usage

### Creating a Gathering

Create a new gathering with a unique ID in the format `yyyy-mm-dd-type`:

```
python gatherings.py create 2025-03-01-friendsbeer --members 5
```

### Adding Expenses

Record expenses for members:

```
python gatherings.py add-expense 2025-03-01-friendsbeer "Roy" 50
python gatherings.py add-expense 2025-03-01-friendsbeer "David" 100
python gatherings.py add-expense 2025-03-01-friendsbeer "Felix" 50
```

### Calculating Reimbursements

Calculate how much each member owes or is owed:

```
python gatherings.py calculate 2025-03-01-friendsbeer
```

### Recording Payments

Record payments made by members:

```
python gatherings.py record-payment 2025-03-01-friendsbeer "member0001" 40
```

### Renaming Members

Rename unnamed members:

```
python gatherings.py rename-member 2025-03-01-friendsbeer "member0001" "Alice"
```

### Managing Members

Add or remove members from a gathering:

```
python gatherings.py add-member 2025-03-01-friendsbeer "Alice"
python gatherings.py remove-member 2025-03-01-friendsbeer "Alice"
```

### Viewing Gathering Details

Show details of a specific gathering:

```
python gatherings.py show 2025-03-01-friendsbeer
```

### Listing All Gatherings

List all gatherings:

```
python gatherings.py list
```

### Deleting a Gathering

Delete a specific gathering:

```
python gatherings.py delete 2025-03-01-friendsbeer
```

### Closing a Gathering

Close a gathering when all balances are settled:

```
python gatherings.py close 2025-03-01-friendsbeer
```

## Example Scenario

Let's walk through the example from the requirements:

1. Create a gathering with 5 members:
   ```
   python gatherings.py create 2025-03-01-friendsbeer --members 5
   ```

2. Add expenses for named members:
   ```
   python gatherings.py add-expense 2025-03-01-friendsbeer "Roy" 50
   python gatherings.py add-expense 2025-03-01-friendsbeer "David" 100
   python gatherings.py add-expense 2025-03-01-friendsbeer "Felix" 50
   ```

3. Calculate reimbursements:
   ```
   python gatherings.py calculate 2025-03-01-friendsbeer
   ```

   This will show:
   - Total expenses: $200
   - Expense per member: $40
   - Roy gets reimbursed $10
   - David gets reimbursed $60
   - Felix gets reimbursed $10
   - Unnamed members each owe $40

4. Record payments from unnamed members:
   ```
   python gatherings.py record-payment 2025-03-01-friendsbeer "member0001" 40
   python gatherings.py record-payment 2025-03-01-friendsbeer "member0002" 40
   ```

5. Record reimbursements to named members:
   ```
   python gatherings.py record-payment 2025-03-01-friendsbeer "Roy" -10
   python gatherings.py record-payment 2025-03-01-friendsbeer "David" -60
   python gatherings.py record-payment 2025-03-01-friendsbeer "Felix" -10
   ```

6. Close the gathering:
   ```
   python gatherings.py close 2025-03-01-friendsbeer
   ```

## Data Storage

The application uses SQLite to store data in a local database file (`gatherings.db`). This file is created automatically when you first run the application.

## License

[MIT License](LICENSE)
