require("dotenv").config()

const express = require("express")

const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
SlashCommandBuilder,
REST,
Routes,
Events
} = require("discord.js")

// WEB SERVER (para Render)
const app = express()

app.get("/", (req, res) => {
res.send("Bot online")
})

app.listen(3000, () => {
console.log("Web service activo")
})


// VARIABLES
const TOKEN = process.env.DISCORD_TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

// CONFIG
const REVIEW_CHANNEL = "1479930919233130655"
const ACCEPTED_CHANNEL = "1479930918293733423"
const REVIEW_ROLE = "1479930917584769114"

// CLIENT
const client = new Client({
intents: [GatewayIntentBits.Guilds]
})


// REGISTRAR COMANDO
const commands = [
new SlashCommandBuilder()
.setName("idea")
.setDescription("Envía una idea")
.addStringOption(option =>
option
.setName("texto")
.setDescription("Escribe tu idea")
.setRequired(true)
)
].map(cmd => cmd.toJSON())

const rest = new REST({ version: "10" }).setToken(TOKEN)

async function registerCommands() {

try {

console.log("Registrando comandos...")

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
{ body: commands }
)

console.log("Comandos registrados")

} catch (error) {
console.error(error)
}

}

registerCommands()


// BOT LISTO
client.once("ready", () => {
console.log(`Bot listo como ${client.user.tag}`)
})


// INTERACCIONES
client.on(Events.InteractionCreate, async interaction => {

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "idea") {

const idea = interaction.options.getString("texto")

const embed = new EmbedBuilder()
.setTitle("💡 Nueva idea")
.setDescription(idea)
.setFooter({ text: `Idea de ${interaction.user.tag}` })
.setColor("Yellow")

const botones = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("aprobar")
.setLabel("Aprobar")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("rechazar")
.setLabel("Rechazar")
.setStyle(ButtonStyle.Danger)
)

const canal = client.channels.cache.get(REVIEW_CHANNEL)

await canal.send({
embeds: [embed],
components: [botones]
})

await interaction.reply({
content: "✅ Tu idea fue enviada a revisión",
ephemeral: true
})

}

}


if (interaction.isButton()) {

if (!interaction.member.roles.cache.has(REVIEW_ROLE)) {

return interaction.reply({
content: "❌ No tienes permiso para revisar ideas",
ephemeral: true
})

}

const embed = interaction.message.embeds[0]


if (interaction.customId === "aprobar") {

const canalAceptadas = client.channels.cache.get(ACCEPTED_CHANNEL)

await canalAceptadas.send({
embeds: [
EmbedBuilder.from(embed)
.setTitle("✅ Idea aceptada")
.setColor("Green")
]
})

await interaction.update({
embeds: [
EmbedBuilder.from(embed)
.setTitle("✅ Idea aceptada")
.setColor("Green")
],
components: []
})

}


if (interaction.customId === "rechazar") {

await interaction.update({
embeds: [
EmbedBuilder.from(embed)
.setTitle("❌ Idea rechazada")
.setColor("Red")
],
components: []
})

}

}

})

client.login(TOKEN)
