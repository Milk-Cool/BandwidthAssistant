import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({ "intents": [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });

client.on("ready", () => console.log(`Logged in as ${client.user.tag}!`));

const ids = process.env.IDS.split(",");

client.on("messageCreate", async msg => {
    try {
        if(!ids.includes(msg.guildId.toString())) return;
        const att = msg.attachments.size ? msg.attachments.at(0) : null;
        if(!att) return;

        const f1 = await fetch(att.url);
        const b1 = await f1.blob();
        const form = new FormData();
        form.append("file", b1, {
            "contentType": "image/png",
            "name": "file",
            "filename": "file"
        });
        const f2 = await fetch("https://pretendolookup.milkcool.ru/api/reverse/posts", {
            "method": "POST",
            "body": form
        });
        const j2 = await f2.json();
        const match = j2.filter(x => x.imagedist < .1)?.[0];
        if(!match) return;

        msg.reply(`Juxt source link: https://juxt.pretendo.network/posts/${match.id}`);
    } catch(e) { console.error(e); }
});

client.login(process.env.TOKEN);