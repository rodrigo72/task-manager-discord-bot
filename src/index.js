const path = require('path');
const dotenv = require("dotenv");

require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
});

const {Client, IntentsBitField, EmbedBuilder} = require('discord.js');

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent,]
});

const mongoose = require("mongoose");
const connectDB = require("./config/dbConnection");

const add = require("./commands/add.js");
const deleting = require("./commands/delete.js");
const get = require("./commands/get.js");
const update = require("./commands/update.js");
const register = require("./commands/register.js");
const help = require("./commands/help.js");

client.on('ready', () => {
    console.log(`Logged in as ${
        client.user.tag
    }!`);
});

const prefix = ".";
const allowedServers = ["942483297005600879", "1150859672824316035"];

connectDB();
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB.");

    try {
        client.on("messageCreate", async (message) => {

            if (allowedServers.includes(message.guild.id) && message.content.startsWith(prefix) && !message.author.bot) {

                const args = message.content.slice(prefix.length).trim().match(/(?:[^\s"]+|"[^"]*")+/g);
                const command = args.shift().toLowerCase();

                for (let i = 0; i < args.length; i++) {
                    args[i] = args[i].replace(/"/g, "");
                }

                switch (command) {
                    case "add":
                        {
                            add.execute(message, args);
                            break;
                        }
                    case "delete":
                        {
                            deleting.execute(message, args);
                            break;
                        }
                    case "get":
                        {
                            get.execute(message, args, EmbedBuilder);
                            break;
                        }
                    case "update":
                        {
                            update.execute(message, args);
                            break;
                        }
                    case "register":
                        {
                            register.execute(message, args);
                            break;
                        }
                    case "help": 
                        {
                            help.execute(message, EmbedBuilder);
                            break;   
                        }
                }

            }
        });
    } catch (err) {
        console.log(err);
    }

    client.login(process.env.DISCORD_TOKEN);
});
