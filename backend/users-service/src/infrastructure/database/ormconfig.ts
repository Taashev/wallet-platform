import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { validateConfig } from '../config';

import { getDataSourceOptions } from './data-source';

dotenv.config({ path: ['.env'] });

const config = validateConfig(process.env);
const databaseConfig = config.database;

// Обьект подключения к БД для CLI
export default new DataSource(getDataSourceOptions(databaseConfig));
