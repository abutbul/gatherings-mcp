#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

class GatheringsServer {
  private server: Server;
  private pythonPath: string;

  constructor() {
    this.server = new Server(
      {
        name: 'gatherings-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Get Python script path from environment or use default
    this.pythonPath = process.env.GATHERINGS_SCRIPT || path.join(process.cwd(), 'gatherings.py');

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_gathering',
          description: 'Create a new gathering',
          inputSchema: {
            type: 'object',
            properties: {
              gathering_id: {
                type: 'string',
                description: 'Unique ID for the gathering (format: yyyy-mm-dd-type)',
              },
              members: {
                type: 'number',
                description: 'Number of members in the gathering',
              },
            },
            required: ['gathering_id', 'members'],
          },
        },
        {
          name: 'add_expense',
          description: 'Add an expense for a member',
          inputSchema: {
            type: 'object',
            properties: {
              gathering_id: {
                type: 'string',
                description: 'ID of the gathering',
              },
              member_name: {
                type: 'string',
                description: 'Name of the member who paid',
              },
              amount: {
                type: 'number',
                description: 'Amount paid by the member',
              },
            },
            required: ['gathering_id', 'member_name', 'amount'],
          },
        },
        {
          name: 'calculate_reimbursements',
          description: 'Calculate reimbursements for a gathering',
          inputSchema: {
            type: 'object',
            properties: {
              gathering_id: {
                type: 'string',
                description: 'ID of the gathering',
              },
            },
            required: ['gathering_id'],
          },
        },
        {
          name: 'record_payment',
          description: 'Record a payment made by a member',
          inputSchema: {
            type: 'object',
            properties: {
              gathering_id: {
                type: 'string',
                description: 'ID of the gathering',
              },
              member_name: {
                type: 'string',
                description: 'Name of the member making the payment',
              },
              amount: {
                type: 'number',
                description: 'Amount paid (negative for reimbursements)',
              },
            },
            required: ['gathering_id', 'member_name', 'amount'],
          },
        },
        {
          name: 'rename_member',
          description: 'Rename an unnamed member',
          inputSchema: {
            type: 'object',
            properties: {
              gathering_id: {
                type: 'string',
                description: 'ID of the gathering',
              },
              old_name: {
                type: 'string',
                description: 'Current name of the member',
              },
              new_name: {
                type: 'string',
                description: 'New name for the member',
              },
            },
            required: ['gathering_id', 'old_name', 'new_name'],
          },
        },
        {
          name: 'show_gathering',
          description: 'Show details of a gathering',
          inputSchema: {
            type: 'object',
            properties: {
              gathering_id: {
                type: 'string',
                description: 'ID of the gathering to display',
              },
            },
            required: ['gathering_id'],
          },
        },
        {
          name: 'list_gatherings',
          description: 'List all gatherings',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'close_gathering',
          description: 'Close a gathering',
          inputSchema: {
            type: 'object',
            properties: {
              gathering_id: {
                type: 'string',
                description: 'ID of the gathering to close',
              },
            },
            required: ['gathering_id'],
          },
        },
        {
          name: 'delete_gathering',
          description: 'Delete a gathering',
          inputSchema: {
            type: 'object',
            properties: {
              gathering_id: {
                type: 'string',
                description: 'ID of the gathering to delete',
              },
              force: {
                type: 'boolean',
                description: 'Force deletion even if gathering is closed',
                default: false,
              },
            },
            required: ['gathering_id'],
          },
        },
        {
          name: 'add_member',
          description: 'Add a new member to a gathering',
          inputSchema: {
            type: 'object',
            properties: {
              gathering_id: {
                type: 'string',
                description: 'ID of the gathering',
              },
              member_name: {
                type: 'string',
                description: 'Name of the member to add',
              },
            },
            required: ['gathering_id', 'member_name'],
          },
        },
        {
          name: 'remove_member',
          description: 'Remove a member from a gathering',
          inputSchema: {
            type: 'object',
            properties: {
              gathering_id: {
                type: 'string',
                description: 'ID of the gathering',
              },
              member_name: {
                type: 'string',
                description: 'Name of the member to remove',
              },
            },
            required: ['gathering_id', 'member_name'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Type guard functions
      const isCreateGatheringArgs = (args: any): args is { gathering_id: string; members: number } =>
        typeof args === 'object' && args !== null &&
        typeof args.gathering_id === 'string' &&
        typeof args.members === 'number';

      const isGatheringIdArg = (args: any): args is { gathering_id: string } =>
        typeof args === 'object' && args !== null &&
        typeof args.gathering_id === 'string';

      const isExpenseArgs = (args: any): args is { gathering_id: string; member_name: string; amount: number } =>
        typeof args === 'object' && args !== null &&
        typeof args.gathering_id === 'string' &&
        typeof args.member_name === 'string' &&
        typeof args.amount === 'number';

      const isRenameMemberArgs = (args: any): args is { gathering_id: string; old_name: string; new_name: string } =>
        typeof args === 'object' && args !== null &&
        typeof args.gathering_id === 'string' &&
        typeof args.old_name === 'string' &&
        typeof args.new_name === 'string';

      const isDeleteGatheringArgs = (args: any): args is { gathering_id: string; force?: boolean } =>
        typeof args === 'object' && args !== null &&
        typeof args.gathering_id === 'string' &&
        (args.force === undefined || typeof args.force === 'boolean');

      const isMemberArgs = (args: any): args is { gathering_id: string; member_name: string } =>
        typeof args === 'object' && args !== null &&
        typeof args.gathering_id === 'string' &&
        typeof args.member_name === 'string';

      try {
        let command = `python3 "${this.pythonPath}" --json`;

        switch (name) {
          case 'create_gathering':
            if (!isCreateGatheringArgs(args)) {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid create_gathering arguments');
            }
            command += ` create "${args.gathering_id}" --members ${args.members}`;
            break;

          case 'add_expense':
            if (!isExpenseArgs(args)) {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid add_expense arguments');
            }
            command += ` add-expense "${args.gathering_id}" "${args.member_name}" ${args.amount}`;
            break;

          case 'calculate_reimbursements':
            if (!isGatheringIdArg(args)) {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid calculate_reimbursements arguments');
            }
            command += ` calculate "${args.gathering_id}"`;
            break;

          case 'record_payment':
            if (!isExpenseArgs(args)) {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid record_payment arguments');
            }
            command += ` record-payment "${args.gathering_id}" "${args.member_name}" ${args.amount}`;
            break;

          case 'rename_member':
            if (!isRenameMemberArgs(args)) {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid rename_member arguments');
            }
            command += ` rename-member "${args.gathering_id}" "${args.old_name}" "${args.new_name}"`;
            break;

          case 'show_gathering':
            if (!isGatheringIdArg(args)) {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid show_gathering arguments');
            }
            command += ` show "${args.gathering_id}"`;
            break;

          case 'list_gatherings':
            command += ' list';
            break;

          case 'close_gathering':
            if (!isGatheringIdArg(args)) {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid close_gathering arguments');
            }
            command += ` close "${args.gathering_id}"`;
            break;

          case 'delete_gathering':
            if (!isDeleteGatheringArgs(args)) {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid delete_gathering arguments');
            }
            command += ` delete "${args.gathering_id}"${args.force ? ' --force' : ''}`;
            break;

          case 'add_member':
            if (!isMemberArgs(args)) {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid add_member arguments');
            }
            command += ` add-member "${args.gathering_id}" "${args.member_name}"`;
            break;

          case 'remove_member':
            if (!isMemberArgs(args)) {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid remove_member arguments');
            }
            command += ` remove-member "${args.gathering_id}" "${args.member_name}"`;
            break;
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }

        const { stdout, stderr } = await execAsync(command, {
          env: {
            ...process.env,
            GATHERINGS_DB_PATH: process.env.GATHERINGS_DB_PATH || 'gatherings.db',
          },
        });

        if (stderr) {
          console.error('[Command Error]', stderr);
        }

        try {
          const result = JSON.parse(stdout);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: !result.success,
          };
        } catch (e) {
          return {
            content: [
              {
                type: 'text',
                text: stdout,
              },
            ],
            isError: true,
          };
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : String(error)
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Gatherings MCP server running on stdio');
  }
}

const server = new GatheringsServer();
server.run().catch(console.error);
