const delay = require('delay');
const express = require('express');
const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();
const app = express();

// --- WHMCS MODULE --- //

app.use(express.json());

app.listen(config.port, config.host, () => {
    console.log(`API listening on ${config.host}:${config.port}!`);
});

client.on('ready', async () => {
    await delay(1000);

    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ activity: { name: 'Made by: Josh S.' } });

    app.use('/', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        const authorization = req.headers['authorization'];

        if (authorization !== undefined && authorization === config.authorizationkey) {
            const info = req.body;
            
            switch (info.action) {
                case 'add':
                    try {
                        const guild = await client.guilds.fetch(info.guildid);
                        if (!guild) throw new Error('Guild ' + info.guildid + ' not found');

                        const member = await guild.members.fetch(info.discordid);
                        if (!member) throw new Error('Member ' + info.discordid + ' not found');

                        const clientrole = await guild.roles.fetch(info.clientroleid);
                        if (!clientrole) throw new Error('Role ' + info.clientroleid + ' not found');

                        if (!member.roles.cache.find((role) => role.id === info.clientroleid)) {
                            await member.roles.add(clientrole);
                        }

                        res.json({ result: 'success', message: 'User added with success' });
                    } catch (e) {
                        console.error('Error while adding the user: ' + e.message, info);
                        res.status(500).json({ result: 'error', message: 'Error while adding the user: ' + e.message });
                    }

                    break;

                case 'remove':
                    try {
                        const guild = await client.guilds.cache.get(info.guildid);
                        if (!guild) throw new Error('Guild ' + info.guildid + ' not found');

                        const member = await guild.members.fetch(info.discordid);
                        if (!member) throw new Error('Member ' + info.discordid + ' not found');

                        const clientrole = await guild.roles.fetch(info.clientroleid);
                        if (!clientrole) throw new Error('Role ' + info.clientroleid + ' not found');
                        
                        if (member.roles.cache.find((role) => role.id === info.clientroleid)) {
                            await member.roles.remove(clientrole);
                        }

                        res.json({ result: 'success', message: 'User removed with success' });
                    } catch (e) {
                        console.error('Error while removing the user: ' + e.message, info);
                        res.status(500).json({ result: 'error', message: 'Error while removing the user: ' + e.message });
                    }

                    break;

                default:
                    res.status(404).json({ result: 'error', message: 'Unknown action' });

                    break;
            }
        } else {
            res.status(403).json({ result: 'error', message: 'Wrong Authorization' });
        }
    });

    app.use(async (req, res, next) => {
        res.redirect('https://divisionsolar.xyz/');
    });
});

// --- WHMCS MODULE --- //

client.login(config.token);
