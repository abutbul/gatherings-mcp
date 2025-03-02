# gatherings-server MCP Server

A Model Context Protocol server for managing gatherings and expense sharing.

This is a TypeScript-based MCP server that helps track expenses and payments for social events, making it easy to calculate reimbursements and settle balances between friends.

## Features

### Tools
- `create_gathering` - Create a new gathering
  - Takes `gathering_id` and `members` as required parameters
- `add_expense` - Add an expense for a member
  - Takes `gathering_id`, `member_name`, and `amount` as required parameters
- `calculate_reimbursements` - Calculate reimbursements for a gathering
  - Takes `gathering_id` as a required parameter
- `record_payment` - Record a payment made by a member
  - Takes `gathering_id`, `member_name`, and `amount` as required parameters
- `rename_member` - Rename an unnamed member
  - Takes `gathering_id`, `old_name`, and `new_name` as required parameters
- `show_gathering` - Show details of a gathering
  - Takes `gathering_id` as a required parameter
- `list_gatherings` - List all gatherings
- `close_gathering` - Close a gathering
  - Takes `gathering_id` as a required parameter
- `delete_gathering` - Delete a gathering
  - Takes `gathering_id` as a required parameter, optional `force` parameter
- `add_member` - Add a new member to a gathering
  - Takes `gathering_id` and `member_name` as required parameters
- `remove_member` - Remove a member from a gathering
  - Takes `gathering_id` and `member_name` as required parameters

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

### Configuration

To use with Claude Desktop, add the server config:

```json
{
  "mcpServers": {
    "gatherings": {
      "command": "node",
      "args": ["/path/to/gatherings-server/build/index.js"],
      "env": {
        "GATHERINGS_DB_PATH": "gatherings.db",
        "GATHERINGS_SCRIPT": "/path/to/gatherings-server/gatherings.py"
      },
      "disabled": false,
      "autoApprove": [],
      "alwaysAllow": [
        "create_gathering",
        "add_expense",
        "calculate_reimbursements",
        "record_payment",
        "rename_member", 
        "show_gathering",
        "list_gatherings",
        "close_gathering",
        "delete_gathering",
        "add_member",
        "remove_member"
      ],
      "timeout": 300
    }
  }
}
```

#### Configuration Options

- `command` and `args`: Specifies how to run the server
- `env`: Environment variables
  - `GATHERINGS_DB_PATH`: Path to the database file
  - `GATHERINGS_SCRIPT`: Path to the Python script for handling gathering operations
- `alwaysAllow`: List of tools that will be automatically allowed without prompting
- `timeout`: Maximum execution time in seconds

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
