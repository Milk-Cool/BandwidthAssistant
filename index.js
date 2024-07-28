import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import TrackList from "./TrackList.js";
import fs from "fs";
import { JSDOM } from "jsdom";

const WRS = "wrs.txt";
if(!fs.existsSync(WRS))
    fs.writeFileSync(WRS, "");
const wrs = fs.readFileSync(WRS, "utf-8").split("\n").filter(Boolean);
const syncWrs = () => fs.writeFileSync(WRS, wrs.join("\n"));

const client = new Client({ "intents": [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });

const { CHANNEL } = process.env;

const embedBrokenWR = (cup, track, pid, time) => new EmbedBuilder()
    .setColor("Red")
    .setTitle("sus record")
    .setDescription(`PID: ${pid}
Cup: ${cup}
Track: ${track}
Time: ${Math.floor(time / 60000).toString()}:${Math.floor((time / 1000) % 60).toString().padStart(2, "0")}.${Math.floor(time % 1000).toString().padStart(3, "0")}`)
    .setFooter({ "text": "Please review this in Mario Kart as the time is less than the current Deluxe world record." });

const checkWRs = async () => {
    let n = 1;
    for(const cup of TrackList)
        for(const track of cup.tracks) {
            const mk8dxf = await fetch(`https://www.mkleaderboards.com/api/charts/mk8dx_150_world/${n++}`);
            const mk8dxj = await mk8dxf.json();
            const toptime = mk8dxj.data[0].score;

            const mk8wuf = await fetch(`https://mario-kart-8.pretendo.network/api/rankings/${track.id}`);
            const mk8wuj = await mk8wuf.json();
            for(const i of mk8wuj.rankings) {
                const id = i.datetime + i.pid;
                if(wrs.includes(id)) continue;
                if(i.score < toptime) {
                    const channel = await client.channels.fetch(CHANNEL);
                    if (channel?.isTextBased()) {
                        await channel.send({ "embeds": [embedBrokenWR(cup.name, track.name, i.pid, i.score)] });
                    }
                }
                wrs.push(id);
                syncWrs();
            }
        }
};

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    checkWRs();
    setInterval(checkWRs, 60 * 60 * 1000);
});

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