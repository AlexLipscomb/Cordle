import {Interaction, Intents, Collection} from 'discord.js';
import fs from 'fs';
import {token} from './config.json';

const {Client} = require('discord.js');

const client = new Client({intents: [Intents.FLAGS.GUILDS]});

client.once('ready', () => {
    console.log('Cordle ready');
});

client.commands = new Collection();

const commandFiles = fs.readdirSync(`${__dirname}/commands`)
    .filter((file: string) => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`${__dirname}/commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({content: 'Error executing command'});
    }
});

client.login(token);
