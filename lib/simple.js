/*
	Librerias
*/

const { proto, downloadContentFromMessage, getContentType } = require('@adiwajshing/baileys')
const fs = require('fs')

/*
	Js
*/

const downloadMediaMessage = async(m, filename = 'undefined') => {
	if (m.type === 'viewOnceMessage') {
		m.type = m.msg.type
	}
	if (m.type === 'imageMessage') {
		var nameJpg = filename + '.jpg'
		const stream = await downloadContentFromMessage(m.msg, 'image')
		let buffer = Buffer.from([])
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(nameJpg, buffer)
		return fs.readFileSync(nameJpg)
	} else if (m.type === 'videoMessage') {
		var nameMp4 = filename + '.mp4'
		const stream = await downloadContentFromMessage(m.msg, 'video')
		let buffer = Buffer.from([])
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(nameMp4, buffer)
		return fs.readFileSync(nameMp4)
	} else if (m.type === 'audioMessage') {
		var nameMp3 = filename + '.mp3'
		const stream = await downloadContentFromMessage(m.msg, 'audio')
		let buffer = Buffer.from([])
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(nameMp3, buffer)
		return fs.readFileSync(nameMp3)
	} else if (m.type === 'stickerMessage') {
		var nameWebp = filename + '.webp'
		const stream = await downloadContentFromMessage(m.msg, 'sticker')
		let buffer = Buffer.from([])
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(nameWebp, buffer)
		return fs.readFileSync(nameWebp)
	} else if (m.type === 'documentMessage') {
		var ext = m.msg.fileName.split('.')[1].toLowerCase().replace('jpeg', 'jpg').replace('png', 'jpg').replace('m4a', 'mp3')
		var nameDoc = filename + '.' + ext
		const stream = await downloadContentFromMessage(m.msg, 'document')
		let buffer = Buffer.from([])
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(nameDoc, buffer)
		return fs.readFileSync(nameDoc)
	}
}

const sms = (conn, m) => {
	if (m.key) {
		m.id = m.key.id
		m.isBaileys = (m.id.startsWith('3EB0') && m.id.length === 12) || (m.id.startsWith('BAE5') && m.id.length === 16)
		m.chat = m.key.remoteJid
		m.fromMe = m.key.fromMe
		m.isGroup = m.chat.endsWith('@g.us')
		m.sender = m.fromMe ? conn.user.id.split(':')[0]+'@s.whatsapp.net' : m.isGroup ? m.key.participant : m.key.remoteJid
	}
	if (m.message) {
		m.type = getContentType(m.message)
		m.msg = (m.type === 'viewOnceMessage') ? m.message[m.type].message[getContentType(m.message[m.type].message)] : m.message[m.type]
		if (m.msg) {
			if (m.type === 'viewOnceMessage') {
				m.msg.type = getContentType(m.message[m.type].message)
			}
			var quotedMention = m.msg.contextInfo != null ? m.msg.contextInfo.participant : ''
			var tagMention = m.msg.contextInfo != null ? m.msg.contextInfo.mentionedJid : []
			var mention = typeof(tagMention) == 'string' ? [tagMention] : tagMention
			mention != undefined ? mention.push(quotedMention) : []
			m.mentionUser = mention != undefined ? mention.filter(x => x) : []
			m.body = (m.type === 'conversation') ? m.msg : (m.type === 'extendedTextMessage') ? m.msg.text : (m.type == 'imageMessage') && m.msg.caption ? m.msg.caption : (m.type == 'videoMessage') && m.msg.caption ? m.msg.caption : (m.type == 'templateButtonReplyMessage') && m.msg.selectedId ? m.msg.selectedId : (m.type == 'buttonsResponseMessage') && m.msg.selectedButtonId ? m.msg.selectedButtonId : (m.type == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId ? m.msg.singleSelectReply.selectedRowId : ''
			m.quoted = m.msg.contextInfo != undefined ? m.msg.contextInfo.quotedMessage : null
			if (m.quoted) {
				m.quoted.type = getContentType(m.quoted)
				m.quoted.id = m.msg.contextInfo.stanzaId
				m.quoted.sender = m.msg.contextInfo.participant
				m.quoted.fromMe = m.quoted.sender.split('@')[0].includes(conn.user.id.split(':')[0])
				m.quoted.msg = (m.quoted.type === 'viewOnceMessage') ? m.quoted[m.quoted.type].message[getContentType(m.quoted[m.quoted.type].message)] : m.quoted[m.quoted.type]
				if (m.quoted.type === 'viewOnceMessage') {
					m.quoted.msg.type = getContentType(m.quoted[m.quoted.type].message)
				}
				m.quoted.mentionUser = m.quoted.msg.contextInfo != null ? m.quoted.msg.contextInfo.mentionedJid : []
				m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
					key: {
						remoteJid: m.chat,
						fromMe: m.quoted.fromMe,
						id: m.quoted.id,
						participant: m.quoted.sender
					},
					message: m.quoted
				})
				m.quoted.download = (filename) => downloadMediaMessage(m.quoted, filename)
				m.quoted.delete = () => conn.sendMessage(m.chat, { delete: m.quoted.fakeObj.key })
				m.quoted.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.quoted.fakeObj.key } })
			}
		}
		m.download = (filename) => downloadMediaMessage(m, filename)
	}
	
	m.reply = (teks = '', option = {id: m.chat, mentions: [m.sender], quoted: m }) => conn.sendMessage(option.id ? option.id : m.chat, { text: teks, contextInfo: { mentionedJid: option.mentions ? option.mentions : [m.sender] } }, { quoted: option.quoted ? option.quoted : m })
	m.replyS = (stik, option = { id: m.chat, mentions: [m.sender], quoted: m }) => conn.sendMessage(option.id ? option.id : m.chat, { sticker: stik, contextInfo: { mentionedJid: option.mentions ? option.mentions : [m.sender] } }, { quoted: option.quoted ? option.quoted : m })
	m.replyImg = (img, teks, option = { id: m.chat, mentions: [m.sender], quoted: m }) => conn.sendMessage(option.id ? option.id : m.chat, { image: img, mimetype: 'image/jpeg', caption: teks, contextInfo: { mentionedJid: option.mentions ? option.mentions : [m.sender] } }, { quoted: option.quoted ? option.quoted : m })
	m.replyVid = (vid, teks, option = { id: m.chat, mentions: [m.sender], gif: false, quoted: m }) => conn.sendMessage(option.id ? option.id : m.chat, { video: vid, mimetype: 'video/mp4', caption: teks, gifPlayback: option.gif ? option.gif : false, contextInfo: { mentionedJid: option.mentions ? option.mentions : [m.sender] } }, { quoted: option.quoted ? option.quoted : m })
	m.replyAud = (aud, option = { id: m.chat, mentions: [m.sender], ptt: false, quoted: m }) => conn.sendMessage(option.id ? option.id : m.chat, { audio: aud, ptt: option.ptt ? option.ptt : false, mimetype: 'audio/mpeg', contextInfo: { mentionedJid: option.mentions ? option.mentions : [m.sender] } }, { quoted: option.quoted ? option.quoted : m })
	m.replyDoc = (doc, option = { id: m.chat, mentions: [m.sender], filename: 'undefined.pfd', mimetype: 'application/pdf', quoted: m }) => conn.sendMessage(option.id ? option.id : m.chat, { document: doc, mimetype: option.mimetype ? option.mimetype : 'application/pdf', fileName: option.filename ? option.filename : 'undefined.pdf', contextInfo: { mentionedJid: option.mentions ? option.mentions : [m.sender] } }, { quoted: option.quoted ? option.quoted : m })
	m.replyContact = (name, info, number, option = { id: m.chat, quoted: m }) => {
		let vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + name + '\n' + 'ORG:' + info + ';\n' + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n' + 'END:VCARD'
		conn.sendMessage(option.id ? option.id : m.chat, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: option.quoted ? option.quoted : m })
	}
	m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })
	
	return m
}

module.exports = { sms }
