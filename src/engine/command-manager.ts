/*
 * Copyright (c) 2022 MKLabs. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of MKLabs. The intellectual and technical concepts
 * contained herein are proprietary to MKLabs and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from MKLabs (niklaus.lee@gmail.com).
 */

import { TypedEvent } from "@/lib/typed-event";
import { ZodRawShape, z, ZodObject } from "zod";

/**
 * CommandHandler is a function type that takes command arguments and returns a Promise.
 * @param Args - The type of arguments that the command handler accepts.
 */
export type CommandHandler<Args> = (args: Args) => Promise<any>;

/**
 * CommandSchema represents the schema for command parameters.
 * It is a ZodObject that defines the shape of the command parameters.
 */
export type CommandSchema = ZodObject<ZodRawShape>;

/**
 * CommandEntry represents a registered command with its metadata.
 * - description: A string describing the command.
 * - paramsSchema: A Zod schema for validating the command parameters.
 * - handler: The function to execute when the command is called.
 */
export type CommandEntry = {
  description: string;
  paramsSchema: CommandSchema;
  handler: CommandHandler<any>;
};

/**
 * Manages global application commands that can be called from menu items,
 * key bindings, or subparts of the application.
 */
export class CommandManager {
  /**
   * Registered commands
   */
  commandEntries: Record<string, CommandEntry> = {};

  /**
   * Event for command registration
   */
  onCommandRegistered: TypedEvent<string>;

  /**
   * Event triggered before the command executed
   */
  onBeforeExecuteCommand: TypedEvent<string>;

  /**
   * Event triggered after the command executed
   */
  onCommandExecuted: TypedEvent<string>;

  /**
   * Constructor for CommandManager.
   * Initializes the command entries and event handlers.
   */
  constructor() {
    this.commandEntries = {};
    this.onCommandRegistered = new TypedEvent();
    this.onBeforeExecuteCommand = new TypedEvent();
    this.onCommandExecuted = new TypedEvent();
  }

  /**
   * Registers a global command.
   * @param id - unique identifier for command.
   * @param paramsSchema - Zod schema for the command parameters.
   * @param handler - function to execute when the command is called.
   *   Important: the args and return of the handler should be "serializable".
   */
  register<Args extends ZodRawShape, InferredArgs = z.infer<ZodObject<Args>>>(
    id: string,
    description: string,
    paramsSchema: Args,
    handler: CommandHandler<InferredArgs>
  ): void {
    if (this.commandEntries[id]) {
      console.log(
        "Attempting to register an already-registered command: " + id
      );
      return;
    }
    if (!id || !handler) {
      console.error(
        "Attempting to register a command with a missing id, or command function."
      );
      return;
    }

    // register the command handler
    this.commandEntries[id] = {
      description,
      paramsSchema: z.object(paramsSchema),
      handler,
    };

    // triggered when a command is registered
    this.onCommandRegistered.emit(id);
  }

  /**
   * Looks up and runs a global command. Additional arguments are passed to the command.
   * @param id The ID of the command to run.
   * @param args The arguments to pass to the command.
   * @return Result of the registered command function
   */
  async execute(id: string, args: any = {}): Promise<any> {
    const commandEntry = this.commandEntries[id];
    if (!commandEntry) {
      throw new Error(`Command not found: ${id}`);
    }
    // triggered before a command is executed
    this.onBeforeExecuteCommand.emit(id);

    // validate the args against the schema
    const paramsSchema = commandEntry.paramsSchema;
    if (paramsSchema) {
      const validationResult = paramsSchema.safeParse(args);
      if (!validationResult.success) {
        const readableErrors = validationResult.error.issues.map((issue) => {
          const path = issue.path.join(".") || "root";
          const message = issue.message;
          return `Field "${path}": ${message}`;
        });
        throw new Error(
          `Invalid arguments for command: "${id}" - ${readableErrors.join(
            ", "
          )}`
        );
      }
      args = validationResult.data;
    }

    // execute the command
    const result = await commandEntry.handler(args);

    // triggered after a command is executed
    this.onCommandExecuted.emit(id);

    return result;
  }

  print(commandId?: string): void {
    if (commandId) {
      const entry = this.commandEntries[commandId];
      if (!entry) {
        console.error(`Command not found: ${commandId}`);
        return;
      }
      console.log(
        `- id: ${commandId}\n- description: ${
          entry.description
        }\n- parameters schema: ${JSON.stringify(
          (entry.paramsSchema as any).toJSONSchema,
          null,
          2
        )}`
      );
    } else {
      console.log(
        `${Object.keys(this.commandEntries).length} commands registered:`
      );
      for (const [id, entry] of Object.entries(this.commandEntries)) {
        console.log(`- ${id} ― ${entry.description}`);
      }
    }
  }
}
