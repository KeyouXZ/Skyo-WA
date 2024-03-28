const headers = (client, cmd) => {
    let text = `*Document of ${cmd}*\n\n`
    
    const command = client.commands.get(cmd)
    
    const description = command.description
    if (description) {
        text+=`*Description:* ${description}\n\n`
    }
    
    const aliases = command.aliases
    if (aliases) {
        if (Array.isArray(aliases) && aliases.length > 0) {
            text += "*Alias:* "
            text += aliases.join(', ')
            text += "\n\n"
        } else {
            text += "*Alias:* " + aliases + "\n\n"
        }
    }
    
    const usage = command.usage
    if (usage) {
        if (Array.isArray(usage) && usage.length > 0) {
            text+="*Usage:*\n"
            usage.filter(i => {
                text += client.prefix[0] + command.name + " "  + i+"\n"
            })
            text+="\n"
        } else {
            text+=`*Usage:* ${client.prefix[0] + command.name + " " + usage}\n\n`
        }
    }
    
    const cooldown = command.cooldown
    if (cooldown) {
        text+="*Cooldown:* " + cooldown + " Second"
    }
    
    return text
}

module.exports = headers