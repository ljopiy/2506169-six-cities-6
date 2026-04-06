#!/usr/bin/env node
import 'reflect-metadata';
import { CLIApplication, GenerateCommand, HelpCommand, ImportCommand, VersionCommand, createCliApplicationContainer} from './cli/index.js';
import { Container } from 'inversify';
import { Component } from './shared/types/index.js';
import { createUserContainer } from './shared/modules/user/index.js';
import { createOfferContainer } from './shared/modules/offer/index.js';

async function bootstrap(): Promise<void> {
  const mainContainer = new Container();
  createCliApplicationContainer(mainContainer);
  createUserContainer(mainContainer);
  createOfferContainer(mainContainer);

  const cliApplication = mainContainer.get<CLIApplication>(Component.CliApplication);

  cliApplication.registerCommands([
    mainContainer.get<HelpCommand>(Component.HelpCommand),
    mainContainer.get<VersionCommand>(Component.VersionCommand),
    mainContainer.get<ImportCommand>(Component.ImportCommand),
    mainContainer.get<GenerateCommand>(Component.GenerateCommand),
  ]);

  await cliApplication.processCommand(process.argv);
}

bootstrap();
